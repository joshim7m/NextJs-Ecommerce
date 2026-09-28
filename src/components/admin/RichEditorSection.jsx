'use client';

import { useEffect, useState } from 'react';
import { stripHtml, hasVisibleContent } from '@/src/lib/richText';

const storageKey = (id) => `productEditor:${id}`;

function readOpen(id) {
  try {
    return typeof window !== 'undefined' && localStorage.getItem(storageKey(id)) === 'open';
  } catch {
    return false;
  }
}

export default function RichEditorSection({ id, label, content, children }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(readOpen(id));
  }, [id]);

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(storageKey(id), next ? 'open' : 'closed');
      } catch {}
      return next;
    });
  };

  // Shared with the storefront and the write path, so "Empty" here cannot disagree with the
  // fallback shown there. Deliberately not `plainText.length === 0`: a description that is
  // only a photo has no text but is not empty.
  const plainText = stripHtml(content);
  const empty = !hasVisibleContent(content);

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-700/30"
      >
        <svg
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>

        <span className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
          {label}
        </span>

        {open ? null : empty ? (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400 dark:bg-slate-700 dark:text-slate-500">
            Empty
          </span>
        ) : plainText ? (
          <span className="min-w-0 flex-1 truncate text-xs text-slate-400 dark:text-slate-500" title={plainText}>
            {plainText.length > 90 ? `${plainText.slice(0, 90)}…` : plainText}
          </span>
        ) : (
          // Has content but no text to preview — a photo or a table. Saying "Empty" here
          // would be a lie, but there is nothing to show either.
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Media
          </span>
        )}
      </button>
      {open && <div className="border-t border-slate-200 p-2 dark:border-slate-700">{children}</div>}
    </div>
  );
}
