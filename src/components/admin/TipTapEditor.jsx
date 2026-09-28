'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { DOMParser as ProseMirrorDOMParser, Fragment, Slice } from '@tiptap/pm/model';
import { useEffect, useState } from 'react';

// Descriptions copied from other stores usually arrive with their images inlined as
// base64 data URIs (e.g. eghuri's description is one huge
// <img src="data:image/jpeg;base64,...">). TipTap's Image node refuses those on parse
// (allowBase64: false -> selector `img[src]:not([src^="data:"])`), so the picture was
// silently dropped on paste. Keeping the data URI would instead put a few hundred KB of
// base64 into a TEXT column and into every storefront render, so we decode each one and
// re-host it through /api/admin/upload, then paste the rewritten HTML.
//
// The same paste usually also carries images that point at the *other store's* CDN. Those
// are re-hosted through /api/admin/upload/remote (server-side, because a cross-origin
// fetch from the browser is blocked by CORS) so our storefront never hotlinks a third party.
const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // the upload route hard-rejects anything over 5MB

const EXT_BY_MIME = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
};

function dataUriToFile(dataUri, index) {
  const comma = dataUri.indexOf(',');
  if (comma === -1) throw new Error('Malformed image data');

  const meta = dataUri.slice('data:'.length, comma);
  const mime = meta.split(';')[0].toLowerCase();
  let bytes;

  if (/;base64$/i.test(meta)) {
    const binary = atob(dataUri.slice(comma + 1));
    bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  } else {
    bytes = new TextEncoder().encode(decodeURIComponent(dataUri.slice(comma + 1)));
  }

  if (bytes.byteLength > MAX_IMAGE_BYTES) {
    throw new Error(`image is ${(bytes.byteLength / 1024 / 1024).toFixed(1)}MB, over the 4MB limit`);
  }

  // The upload route derives the stored extension from file.name, so it has to be right.
  return new File([bytes], `pasted-image-${Date.now()}-${index}.${EXT_BY_MIME[mime] || 'png'}`, {
    type: mime || 'image/png',
  });
}

async function uploadImageFile(file, folder) {
  const body = new FormData();
  body.append('images', file);
  body.append('folder', folder);

  const response = await fetch('/api/admin/upload', { method: 'POST', body });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.urls?.length) {
    throw new Error(payload?.error || payload?.errors?.[0] || `upload failed (HTTP ${response.status})`);
  }
  return payload.urls[0];
}

const srcOf = (img) => img.getAttribute('src') || '';

const isDataImage = (img) => srcOf(img).toLowerCase().startsWith('data:image/');

/**
 * True for an http(s) image that lives on someone else's server. Anything relative, on our
 * own origin, or unparseable is left untouched: content copied from our own storefront must
 * not be re-downloaded, and a src we cannot reason about is not one to hand to the fetcher.
 */
function isForeignRemoteImage(img) {
  const src = srcOf(img);
  if (!/^https?:\/\//i.test(src)) return false;
  try {
    return new URL(src, window.location.href).origin !== window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Ask the server to download and re-host a batch of third-party image URLs.
 * Resolves to a Map of source URL -> local path, so duplicate srcs in one paste collapse
 * into a single download.
 */
async function rehostRemoteImages(urls, folder) {
  const unique = Array.from(new Set(urls));
  const response = await fetch('/api/admin/upload/remote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls: unique, folder }),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !Array.isArray(payload?.results)) {
    throw new Error(payload?.error || `re-host failed (HTTP ${response.status})`);
  }

  const paths = new Map();
  const failures = [];
  for (const result of payload.results) {
    if (result.path) paths.set(result.url, result.path);
    else failures.push(`${result.url}: ${result.error}`);
  }
  return { paths, failures };
}

// Chrome wraps clipboard HTML in a full <html><body> document; strip the noise so the
// schema parser only sees real content.
function readClipboardHtml(html) {
  const holder = document.createElement('div');
  holder.innerHTML = html;
  holder.querySelectorAll('meta, title, script, style, link').forEach((node) => node.remove());
  return holder;
}

function insertSliceAtSelection(view, slice) {
  // The upload is async — the user may have navigated away before it finished.
  if (view.isDestroyed) return;
  view.dispatch(view.state.tr.replaceSelection(slice).scrollIntoView());
}

function parseHtmlSlice(view, holder) {
  const parsed = ProseMirrorDOMParser.fromSchema(view.state.schema).parseSlice(holder, {
    preserveWhitespace: false,
  });
  return Slice.maxOpen(parsed.content);
}

function ToolbarButton({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded p-1.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-30 ${
        active ? 'bg-[#2f0f6b]/10 text-[#2f0f6b]' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="h-5 w-px bg-slate-200" />;
}

/** A table command that greys itself out whenever the cursor is not inside a table. */
function TableButton({ editor, command, label, title, active }) {
  return (
    <ToolbarButton
      title={title}
      active={active}
      disabled={!editor.isActive('table')}
      onClick={() => editor.chain().focus()[command]().run()}
    >
      <span className="text-xs font-semibold">{label}</span>
    </ToolbarButton>
  );
}

export default function TipTapEditor({ content, onChange, uploadFolder = 'products' }) {
  const [imageStatus, setImageStatus] = useState(null);

  const editor = useEditor({
    extensions: [
      // StarterKit v3 bundles Link + Underline; disable those copies so the
      // standalone packages below own the config (and no duplicate-extension warning).
      StarterKit.configure({ link: false, underline: false }),
      Underline,
      Link.configure({ openOnClick: false }),
      // inline: true, not a block node. Pasted descriptions carry small images *inside*
      // headings and paragraphs (WordPress emoji, "new" badges); as a block node ProseMirror
      // hoists them out and splits the heading in two. A block-level <img> is still lifted
      // into its own paragraph by the parser, so product photos keep working unchanged.
      Image.configure({ inline: true }),
      // Delivery charges, size charts and ingredient lists arrive as real <table>s. Without
      // these nodes the parser has nowhere to put them and collapses the whole table into
      // one run-on paragraph.
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      handlePaste: (view, event) => {
        const clipboard = event.clipboardData;
        if (!clipboard) return false;

        // 1. Rich HTML carrying images we do not own: base64 data URIs (the common
        //    "copy a description out of another store" case) and http(s) URLs pointing at
        //    that store's CDN. Re-host both, then paste the rewritten HTML.
        const html = clipboard.getData('text/html');
        if (html && /<(?:img|image)\b|data:image\//i.test(html)) {
          const holder = readClipboardHtml(html);
          const inlined = Array.from(holder.querySelectorAll('img')).filter(isDataImage);
          const foreign = Array.from(holder.querySelectorAll('img')).filter(isForeignRemoteImage);

          if (inlined.length || foreign.length) {
            event.preventDefault();

            const total = inlined.length + foreign.length;
            const pending = [];
            if (inlined.length) pending.push(`${inlined.length} pasted`);
            if (foreign.length) pending.push(`${foreign.length} remote`);
            setImageStatus({ kind: 'working', text: `Re-hosting ${pending.join(' and ')} image${total > 1 ? 's' : ''}…` });

            (async () => {
              const failures = [];

              // Base64 payloads go up as files; the CDN URLs go through the server-side
              // fetcher in one batch. Both run together so a slow CDN does not serialise
              // behind the local uploads.
              const [inlinedResults, remoteResult] = await Promise.all([
                Promise.all(
                  inlined.map(async (img, index) => {
                    try {
                      return { img, path: await uploadImageFile(dataUriToFile(srcOf(img), index), uploadFolder) };
                    } catch (err) {
                      return { img, error: err.message };
                    }
                  })
                ),
                foreign.length
                  ? rehostRemoteImages(foreign.map(srcOf), uploadFolder).catch((err) => ({
                      paths: new Map(),
                      failures: [err.message],
                    }))
                  : Promise.resolve({ paths: new Map(), failures: [] }),
              ]);

              for (const { img, path, error } of inlinedResults) {
                if (path) img.setAttribute('src', path);
                else {
                  failures.push(error);
                  img.remove();
                }
              }

              for (const img of foreign) {
                const local = remoteResult.paths.get(srcOf(img));
                if (local) img.setAttribute('src', local);
                else img.remove();
              }

              // A CDN that 404s or refuses the fetch loses us that picture, not the paste.
              if (failures.length || remoteResult.failures.length) {
                setImageStatus({
                  kind: 'error',
                  text: `Some images could not be re-hosted and were dropped: ${(failures[0] || remoteResult.failures[0])}`,
                });
              } else {
                setImageStatus(null);
              }

              insertSliceAtSelection(view, parseHtmlSlice(view, holder));
            })();
            return true;
          }
        }

        // 2. A real image file on the clipboard (screenshot, "Copy image"). ProseMirror's
        //    fallback would inline it as a base64 data URL — upload it instead.
        const files = Array.from(clipboard.files || []).filter((file) => file.type.startsWith('image/'));
        if (files.length) {
          event.preventDefault();
          setImageStatus({
            kind: 'working',
            text: `Uploading ${files.length} pasted image${files.length > 1 ? 's' : ''}…`,
          });

          (async () => {
            const urls = await Promise.all(
              files.map((file) =>
                uploadImageFile(file, uploadFolder).catch((err) => ({ failed: err.message }))
              )
            );
            const ok = urls.filter((url) => typeof url === 'string');
            const failure = urls.find((url) => typeof url === 'object');

            setImageStatus(failure ? { kind: 'error', text: `Image could not be uploaded: ${failure.failed}` } : null);

            if (ok.length) {
              const { image, paragraph } = view.state.schema.nodes;
              const blocks = ok.map((src) => paragraph.create(null, image.create({ src })));
              insertSliceAtSelection(
                view,
                new Slice(Fragment.fromArray(blocks), 0, 0)
              );
            }
          })();
          return true;
        }

        return false;
      },
    },
  });

  useEffect(() => {
    return () => editor?.destroy();
  }, [editor]);

  const addLink = () => {
    const url = prompt('Enter URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  if (!editor) return null;

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50/80 px-2 py-1.5">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg>
        </ToolbarButton>
        <Divider />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })}>
          <span className="text-xs font-bold">H1</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
          <span className="text-xs font-bold">H2</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>
          <span className="text-xs font-bold">H3</span>
        </ToolbarButton>
        <Divider />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/></svg>
        </ToolbarButton>
        <Divider />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockQuote')}>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')}>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>
        </ToolbarButton>
        <Divider />
        <ToolbarButton onClick={addLink} active={editor.isActive('link')}>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={addImage}>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
        </ToolbarButton>
        <Divider />
        <ToolbarButton
          title="Insert a 3×3 table with a header row"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        >
          <span className="text-xs font-semibold">Table</span>
        </ToolbarButton>
        <TableButton editor={editor} command="addRowAfter" label="+ Row" title="Add row below" />
        <TableButton editor={editor} command="addColumnAfter" label="+ Col" title="Add column right" />
        <TableButton editor={editor} command="deleteRow" label="− Row" title="Delete this row" />
        <TableButton editor={editor} command="deleteColumn" label="− Col" title="Delete this column" />
        <TableButton
          editor={editor}
          command="toggleHeaderRow"
          label="Hdr"
          title="Toggle header row"
          active={editor.isActive('tableHeader')}
        />
        <TableButton editor={editor} command="deleteTable" label="Del" title="Delete the whole table" />
      </div>
      {imageStatus && (
        <p
          role="status"
          className={`border-b px-3 py-1.5 text-xs ${
            imageStatus.kind === 'error'
              ? 'border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400'
              : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'
          }`}
        >
          {imageStatus.text}
        </p>
      )}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-[300px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[280px] [&_table]:w-full [&_table]:table-fixed [&_td]:border [&_td]:border-slate-200 [&_td]:px-2 [&_td]:py-1 [&_td]:align-top [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_.selectedCell]:bg-[#2f0f6b]/10 [&_.column-resize-handle]:relative [&_.column-resize-handle]:mr-[-2px] [&_.column-resize-handle]:inline-block [&_.column-resize-handle]:h-full [&_.column-resize-handle]:w-1 [&_.column-resize-handle]:cursor-col-resize"
      />
    </div>
  );
}
