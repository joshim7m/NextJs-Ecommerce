# Product Description & Specification — Rich-Text Admin Editor

> **Status in this repo: SHIPPED** (2026-09-27). The body of this document is the original
> implementation plan and is kept as the design rationale — read it for *why*, not for
> *what is currently true*. `docs/progress-tracker.md` is the living record of what shipped.
> §10 below records the three fidelity fixes made after the first version went out, and the
> one security caveat that came with them.
>
> The design is taken from a working reference implementation in a sibling project
> (`master-ecom-next` / "eghuri") that already ships this feature. The two codebases share a
> common ancestor, so this port is mostly a small diff — but **four things differ** and three of
> them are bugs waiting to happen if you skip them. Those are called out in §1.2.
>
> This document is **self-sufficient**: every code block needed is complete and verbatim.

---

## 1. What you are building

Two **independent HTML fields** per product — `description` and `specification` — each edited with
a full rich-text editor (TipTap), each wrapped in its own **collapsible section** that is collapsed
by default.

| Concern | Decision |
|---|---|
| Storage format | Raw **HTML string** in a nullable `TEXT` column. Not Markdown, not plain text. |
| Editor | TipTap v3 (`StarterKit` + `Underline` + `Link` + `Image`) — **already installed here** |
| Wrapper | `RichEditorSection` — collapsible, open/closed state in `localStorage` — **does not exist here** |
| Save model | No separate "save content" button. HTML lives in the existing product form state and is persisted by the existing `createProduct` / `updateProduct` calls. |
| Default state | **Collapsed**, so two long-form fields don't push prices/images/categories off-screen |
| Storefront | `ProductTabs` → "Description" and "Specifications" tabs, `dangerouslySetInnerHTML` inside a `prose` wrapper |

No new endpoint. No new API route. No new table. It is (a) one new column, (b) two form fields,
(c) one new component, (d) a one-line fix to an existing component, (e) a storefront render change.

### 1.1 Audit: what already exists vs. what you must add

| Piece | State here | Action |
|---|---|---|
| `@tiptap/react`, `starter-kit`, `extension-{underline,link,image}` | ✅ installed | none |
| `@tailwindcss/typography` | ✅ installed **and** registered in `tailwind.config.js` | none |
| `src/components/admin/TipTapEditor.jsx` | ✅ exists (used by blog create/edit) | **fix 1 line** — §5.2 |
| `src/components/admin/RichEditorSection.jsx` | ❌ missing | **create** — §4 |
| `Product.description` (`String?`) | ✅ exists | repurpose to HTML — §3.2 |
| `Product.specification` | ❌ missing | **add column + migration** — §3.1 |
| `description: ''` in form state (create + edit) | ✅ already present | add `specification: ''` |
| create page description field | plain `<textarea rows={2}>` | **replace** with editor pair — §6 |
| `product-info.jsx` description field | plain `<textarea rows={2}>` | **replace** with editor pair — §7 |
| `createProduct` / `updateProduct` | already destructure + write `description` | add `specification` — §8 |
| `ProductTabs.jsx` Description tab | renders `{product.description}` as **escaped plain text** | **must become `dangerouslySetInnerHTML`** — §9 |
| `ProductTabs.jsx` Specifications tab | SKU/variant cards only, no `specification` | **add** the HTML block — §9 |

### 1.2 The four things that differ from the reference implementation

These are the parts where a naive copy-paste leaves a bug. Read this section before you start.

1. **`TipTapEditor` here uses bare `StarterKit,`, not `StarterKit.configure({ link: false, underline: false })`.**
   TipTap v3 bundles `Link` and `Underline` *inside* `StarterKit`. Because this file *also* adds the
   standalone `Underline` and `Link` packages, the editor currently logs a
   *"Duplicate extension names found"* warning. It is pre-existing on the blog editor today. The
   reference implementation disables the bundled copies so the standalone ones can be configured.
   One-line fix, §5.2.

2. **`ProductTabs.jsx` currently renders description as escaped text.** Today `description` is
   plain text, so `{product.description}` is correct. The moment you store HTML, React escapes the
   tags and customers see literal `<p>…</p>`. **If you ship the admin editor without this change,
   the storefront breaks.** §9.

3. **`description` already contains plain text in the database.** Switching the field to HTML is a
   data-format change, not just a UI change. Plain text is *valid* HTML so nothing crashes, but
   existing rows render with no `<p>` wrapping and collapsed newlines. See the backfill note in §3.3
   — decide deliberately whether to wrap existing rows.

4. **`specification` does not exist anywhere** — not in the schema, not in the actions, not in the
   catalogue import/export, not in any API route. It is a genuinely new field, not a rename.

---

## 2. UX anatomy

```
/admin/products/create   (and /admin/products/edit?id=<id>)
│
├── Title  ······  Slug [Generate]
│
├── DESCRIPTION & SPECIFICATIONS                 <- full-width row (sm:col-span-2)
│   │
│   ├── ▸ DESCRIPTION  ·······························
│   │      collapsed header shows one of:
│   │        (a) [ Empty ]                        when the field is blank
│   │        (b) plain text preview, 90 chars + "…"   e.g. "Fabric: 100% cotton…"
│   │      click -> chevron rotates 90deg, editor mounts, section expands
│   │
│   └── ▸ SPECIFICATIONS  [ Empty ]                  same behaviour, own storage key
│
├── Meta Description
├── YouTube Video URL
├── Tags / Keywords
└── … prices, SKU, stock, status, featured, images, categories
```

Expanded state of a section:

```
│ ▾ DESCRIPTION                                    │  <- chevron rotated, open
├───────────────────────────────────────────────────┤
│ [B][I][U] | [H1][H2][H3] | [•][1.] | [❝][</>] | [🔗][🖼]   <- TipTap toolbar
│                                                   │
│   (writing area, min-h 300px, `prose` typography)  │
│                                                   │
├───────────────────────────────────────────────────┤
```

Behaviour worth copying verbatim:

- **Collapsed by default.** `useState(false)` then a `useEffect` restores the stored preference.
  Server render and first client render both show *closed*, so there is no hydration mismatch.
- **Open state is remembered** per browser, per field, in
  `localStorage['productEditor:description']` and `localStorage['productEditor:specification']`
  (values `'open'` / `'closed'`). Once a merchandiser opens the Specification box it stays open.
- **Collapsed header doubles as a summary row**: a rotating chevron, the uppercase label, and
  either an `Empty` pill or a plain-text preview truncated to 90 characters.
- **Children are lazily mounted** — `{open && <div>…{children}</div>}`. The TipTap instance
  therefore never exists (and never renders) while the section is closed, and it is created fresh
  with the current form value the first time the section is opened.
- Collapsing **never loses content**: the HTML already lives in the parent form state; the editor
  instance is simply unmounted.

---

## 3. Data model

### 3.1 Add the `specification` column

`prisma/schema.prisma` — the current `Product` model:

```prisma
model Product {
  id              String  @id @default(uuid())
  title           String
  slug            String  @unique
  sku             String  @unique
  description     String?          // ← exists today, holds PLAIN TEXT. Becomes HTML.
  metaDescription String?
  // …
}
```

Add exactly one field after `description`:

```prisma
  specification   String?          // ← new. HTML from TipTap.
```

```bash
npx prisma migrate dev --name add_product_specification
```

That generates `prisma/migrations/<timestamp>_add_product_specification/migration.sql` containing:

```sql
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "specification" TEXT;
```

Both columns are plain nullable `TEXT` — in PostgreSQL that is already unlimited length, so no
`@db.Text` annotation is needed. On MySQL you would need `String? @db.LongText`.

### 3.2 `description` changes meaning, not type

The column type is unchanged. What changes is the **content format**: plain text → HTML.

| | Before | After |
|---|---|---|
| Written by | `<textarea rows={2}>` | `TipTapEditor` → `editor.getHTML()` |
| Stored as | raw plain text | raw HTML string |
| Rendered by | `{product.description}` (escaped) | `dangerouslySetInnerHTML` (§9) |

### 3.3 Backfill decision — make it deliberately

Existing rows hold plain text. Plain text is technically valid HTML, so nothing crashes on the
day you ship. But:

- A stored value of `Soft cotton\nMachine washable` renders as **one line** — HTML collapses the
  newlines, and there is no `<p>` wrapper so no paragraph spacing.
- It will *look* subtly wrong next to newly-authored rich text.

Three options, pick one and write down which you did:

| Option | What it does | Trade-off |
|---|---|---|
| **A. Do nothing** | Old rows render as one unstyled block | Zero migration risk; visibly inconsistent |
| **B. Wrap in `<p>`** (recommended) | One-off script turns `text` into `<p>text</p>`, splitting on blank lines | Fixes 99% of real data; must skip rows that already contain `<` (i.e. already HTML) |
| **C. Reset the field** | `UPDATE "Product" SET description = NULL` | Cleanest result, destroys existing copy — only if descriptions are throwaway |

Option B sketch (run once, from `prisma/`, against a backup):

```js
// Wrap legacy plain-text descriptions in <p>, skipping rows that already look like HTML.
const rows = await prisma.product.findMany({
  where: { description: { not: null } },
  select: { id: true, description: true },
});

let changed = 0;
for (const { id, description } of rows) {
  if (description.includes('<')) continue;            // already HTML — leave alone
  const html = description
    .split(/\n\s*\n/)                                 // paragraphs on blank lines
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p}</p>`)
    .join('');
  await prisma.product.update({ where: { id }, data: { description: html } });
  changed++;
}
console.log(`wrapped ${changed} description(s)`);
```

Note this does **not** HTML-escape the inner text, which is correct here because the source was
plain text typed by admins — but if you ever re-run it against untrusted input, escape first.

---

## 4. Component 1 — `RichEditorSection` (new file)

Create `src/components/admin/RichEditorSection.jsx` with this content, verbatim:

```jsx
'use client';

import { useEffect, useState } from 'react';

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

  const plainText = (content || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
  const empty = plainText.length === 0;

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
        ) : (
          <span className="min-w-0 flex-1 truncate text-xs text-slate-400 dark:text-slate-500" title={plainText}>
            {plainText.slice(0, 90)}…
          </span>
        )}
      </button>
      {open && <div className="border-t border-slate-200 p-2 dark:border-slate-700">{children}</div>}
    </div>
  );
}
```

API: `<RichEditorSection id label content>{children}</RichEditorSection>`

| Prop | Type | Purpose |
|---|---|---|
| `id` | string | Storage key suffix — `description` / `specification`. Not a DOM id. |
| `label` | string | Uppercase header text shown in the collapsed row |
| `content` | string (HTML) | Used **only** to render the collapsed preview / `Empty` pill |
| `children` | node | The editor; mounted only while `open` |

The component is **editor-agnostic** — it only needs a string in and a node as children. If you
later swap TipTap for another editor, this file does not change.

Two details that make it robust:

1. **All `localStorage` access is wrapped in `try/catch`.** Private-mode Safari and cookie-blocked
   browsers throw on `localStorage`, and this component must never crash the form because of a
   UI preference.
2. **The preview strips tags with a naive regex** rather than rendering HTML. It is a summary
   row, not content — `dangerouslySetInnerHTML` here would be both a styling problem and an
   unnecessary XSS surface.

`productEditor:description` / `productEditor:specification` are **not** in the frozen
localStorage list from `docs/ai-workflow-rules.md` (which freezes `cabinet-closet-cart`,
`cabinet-closet-wishlist`, `device-hash`, `theme`, `admin-theme`), so the naming is free to change.

---

## 5. Component 2 — `TipTapEditor` (exists; fix one line)

### 5.1 Current state

`src/components/admin/TipTapEditor.jsx` already exists and is already correct in every respect
except the extension configuration. It is 107 lines, used by both blog editors, and takes
`{ content, onChange }` — exactly the API this feature needs. **Do not rewrite it.**

### 5.2 The one-line fix

`@tiptap/starter-kit` v3.27.3 (the version installed here) bundles `Link` and `Underline` inside
`StarterKit`. The file adds the standalone `@tiptap/extension-underline` and
`@tiptap/extension-link` packages *as well*, so both extensions are registered twice and TipTap
logs a *"Duplicate extension names found"* warning to the console. This is already happening on
the blog editor today.

Line 29 of `src/components/admin/TipTapEditor.jsx`:

```jsx
      StarterKit,
```

becomes:

```jsx
      StarterKit.configure({ link: false, underline: false }),
```

Why this specific fix: disabling the bundled copies lets you supply the standalone packages with
their own options, which you need for `Link.configure({ openOnClick: false })` — without that,
clicking a link inside the editor navigates the admin away mid-edit.

Resulting extension block (lines 27–38) for reference:

```jsx
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: false, underline: false }),
      Underline,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });
```

### 5.3 Toolbar inventory

| Group | Buttons | Command |
|---|---|---|
| Inline | B, *I*, U | `toggleBold` / `toggleItalic` / `toggleUnderline` |
| Block | H1, H2, H3 | `toggleHeading({ level })` |
| List | bullets, numbers | `toggleBulletList` / `toggleOrderedList` |
| Quote | ❝ | `toggleBlockquote` |
| Code | `</>` | `toggleCodeBlock` |
| Insert | 🔗, 🖼 | `prompt()` → `setLink({ href })` / `setImage({ src })` |

`StarterKit` also ships `Strike`, `HardBreak`, `HorizontalRule`, `Code`, undo/redo history and
markdown input rules (`# `, `- `, `> `, ` ``` `, `~~text~~`). They work but have **no toolbar
button** — deliberate, it keeps the toolbar to one row.

### 5.4 Configuration decisions (each one matters)

- `Link.configure({ openOnClick: false })` — without this, clicking a link in the admin editor
  navigates the admin away mid-edit.
- `Image.configure({ inline: false })` — block images, so they stack and never break line height.
- `content: content || ''` is the **initial** document only. There is deliberately **no**
  `editor.commands.setContent()` effect, so a later change to the `content` prop does *not* clobber
  the user's in-progress typing. This is exactly why the collapsible-lazy-mount design is safe.
- `onUpdate` → `editor.getHTML()` fires on every keystroke and bubbles the **full HTML document**
  to the parent form state. No debounce; the payload is a few KB and the page is admin-only.
- The component renders `null` until the editor instance exists, which also means it is safe to
  server-render.
- The **only** brand colour in the file is `#2f0f6b`, hardcoded in one place — the `active` branch
  of `ToolbarButton` (`bg-[#2f0f6b]/10 text-[#2f0f6b]`), which tints the button of whatever format
  is active under the cursor. Everything else is stock Tailwind palette. Since
  `tailwind.config.js` already defines `brand.primary` as `#2f0f6b`, you can leave it, or swap
  those two classes for `text-brand-primary` if you prefer tokens.

### 5.5 Styling requirement (already satisfied here)

`prose prose-sm` comes from **`@tailwindcss/typography`**, which is installed and already
registered:

```js
// tailwind.config.js — line 24-26, already correct
  plugins: [
    require('@tailwindcss/typography'),
  ],
```

No change needed. `min-h-[300px]` on `EditorContent` gives the writing area a stable height; the
inner `[&_.ProseMirror]:min-h-[280px]` + `focus:outline-none` kill the double focus ring and the
content-editable baseline offset.

---

## 6. Wiring — create page

`app/admin/products/create/page.jsx`

### 6a. Add the field to the form shape

Line 12–14, current:

```jsx
const emptyForm = {
  title: '', slug: '', description: '', metaDescription: '', videoUrl: '', tags: '', unite_price: '', sale_price: '', sku: '',
  quantity: '', status: 'draft', isFeatured: false,
};
```

becomes (note `isFeatured`, not `featured` — this project's field name):

```jsx
const emptyForm = {
  title: '', slug: '', description: '', specification: '', metaDescription: '', videoUrl: '', tags: '', unite_price: '', sale_price: '', sku: '',
  quantity: '', status: 'draft', isFeatured: false,
};
```

### 6b. Add the imports

Next to the existing `CategoryMultiSelect` import on line 7:

```jsx
import TipTapEditor from '../../../../src/components/admin/TipTapEditor';
import RichEditorSection from '../../../../src/components/admin/RichEditorSection';
```

### 6c. Replace the description textarea

Lines 109–112, current — a plain two-row textarea:

```jsx
          <div className="sm:col-span-2">
            <label className={labelCls}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2} className={inputCls} />
          </div>
```

becomes the two collapsible editors:

```jsx
          <div className="sm:col-span-2">
            <label className={labelCls}>Description &amp; Specifications</label>
            <div className="mt-1.5 space-y-3">
              <RichEditorSection id="description" label="Description" content={form.description}>
                <TipTapEditor
                  content={form.description}
                  onChange={(html) => setForm((prev) => ({ ...prev, description: html }))}
                />
              </RichEditorSection>

              <RichEditorSection id="specification" label="Specifications" content={form.specification}>
                <TipTapEditor
                  content={form.specification}
                  onChange={(html) => setForm((prev) => ({ ...prev, specification: html }))}
                />
              </RichEditorSection>
            </div>
          </div>
```

### 6d. Nothing else changes

`handleSave()` already spreads the whole `form` into `createProduct({...})`:

```jsx
      const product = await createProduct({
        ...form,                                  // ← description + specification ride along
        categoryIds: selectedCategories.map((c) => c.id),
        imagePaths,
      });
      router.push(`/admin/products/edit?id=${product.id}`);
```

`handleChange` is untouched — it is still used by every other field on the page. The editors bypass
it and call `setForm` directly with a functional update.

On success the admin is redirected to the edit page, so both editors are immediately visible in
their stored expanded/collapsed state.

---

## 7. Wiring — edit page

Two files: `app/admin/products/edit/page.jsx` and `app/admin/products/edit/partials/product-info.jsx`.

### 7a. Hydrate the form (edit page)

Line 14, `emptyForm` — add `specification: ''` exactly as in §6a.

In the `setForm({...})` hydration inside the `getProduct(id).then(...)` chain, add one line
directly after the existing `description` line (currently line 57):

```jsx
        description: product.description || '',
        specification: product.specification || '',      // ← add
        metaDescription: product.metaDescription || '',
```

`|| ''` is mandatory: a `null` column would otherwise be handed to TipTap as `content` and the
preview/emptiness check would need to guard it.

### 7b. Replace the description textarea in `product-info.jsx`

Lines 24–27, current:

```jsx
        <div className="sm:col-span-2">
          <label className={labelCls}>Description</label>
          <textarea name="description" value={form.description} onChange={onChange} rows={2} className={inputCls} />
        </div>
```

becomes:

```jsx
        <div className="sm:col-span-2">
          <label className={labelCls}>Description &amp; Specifications</label>
          <div className="mt-1.5 space-y-3">
            <RichEditorSection id="description" label="Description" content={form.description || ''}>
              <TipTapEditor
                content={form.description}
                onChange={(html) => onChange({ target: { name: 'description', value: html } })}
              />
            </RichEditorSection>

            <RichEditorSection id="specification" label="Specifications" content={form.specification || ''}>
              <TipTapEditor
                content={form.specification || ''}
                onChange={(html) => onChange({ target: { name: 'specification', value: html } })}
              />
            </RichEditorSection>
          </div>
        </div>
```

Note the **change-handler adapter**: `product-info.jsx` receives one generic `onChange` that
expects a DOM-ish event, so the editor calls `onChange({ target: { name, value } })` to reuse the
parent's handler:

```jsx
  const handleChange = (e) =>
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }));
```

Add the two imports at the top of `product-info.jsx` (it currently imports only
`CategoryMultiSelect` on line 1):

```jsx
import TipTapEditor from '../../../../../src/components/admin/TipTapEditor';
import RichEditorSection from '../../../../../src/components/admin/RichEditorSection';
```

`product-info.jsx` has **no** `'use client'` directive because its only importer is the client page
`edit/page.jsx`. If you ever render it from a server component, add `'use client'`.

### 7c. Save

`handleSave()` also spreads the whole form, so no extra wiring:

```jsx
      const saved = await updateProduct(id, {
        ...form,                    // ← description + specification included
        categoryIds: selectedCategories.map((c) => c.id),
        imagePaths,
        removeImageIds,
        variants: variantPayload,
        removedVariantIds,
      });
```

Because TipTap is uncontrolled, saving does **not** reset the editor. `setForm` is not re-run, so
the HTML you just saved stays on screen untouched.

---

## 8. Server actions — persistence

`src/actions/products.js` (a `'use server'` module). Both actions already destructure and write
`description`; add `specification` to both.

### 8a. `createProduct()`

Destructure (line 27):

```jsx
  const { title, slug: rawSlug, description, specification, metaDescription, videoUrl, tags, unite_price, sale_price, sku, quantity, status, isFeatured, categoryIds, imagePaths } = data;
```

Write (line 33, right after `title, slug, description,`):

```jsx
      title, slug, description,
      specification: specification || null,        // ← add
      metaDescription: metaDescription || null,
```

### 8b. `updateProduct()`

Identical change — destructure on line 54, write after line 104:

```jsx
      title, slug, description,
      specification: specification || null,        // ← add
```

### 8c. Rules to preserve

- **No sanitisation, no HTML parsing, no length check.** Whatever `getHTML()` produced is stored.
  The column is `TEXT` so there is no truncation risk.
- **`specification: specification || null`** — clearing the editor and saving writes `NULL`, not
  `''`. `description` is written raw, so clearing Description stores `''`. Both are falsy, so the
  storefront branches behave identically; the asymmetry is only visible in the DB and CSV export.
  Mirror it or not, just be consistent.
- `getProduct(id)` already uses `include: { images: true, variants: true, categories: true }`.
  Scalar columns like `specification` come back automatically — **no query change needed**.
- The actions return `serialize(product)`, so `Decimal` and `Date` values cross the server→client
  boundary cleanly. The editors are string-in/string-out and need no special handling.
- Only `revalidatePath('/admin/products')` is called. The storefront product page reads via Prisma
  per request, so the new HTML appears immediately after save.

---

## 9. Storefront rendering — the critical change

`src/components/storefront/partials/ProductTabs.jsx`. `TABS` is already
`['Description', 'Specifications', 'Reviews']`, so **no new tab is needed** — only the two bodies
change.

### 9a. Description tab — escaped text → HTML

Current (lines 11–19) — this is the line that must change:

```jsx
    Description: (
      <div className="prose prose-sm max-w-none text-slate-600 dark:text-slate-300 ">
        {product.description ? (
          <p className='overflow-x-hidden'>{product.description}</p>
        ) : (
          <p className="text-slate-400 italic dark:text-slate-500">No description available.</p>
        )}
      </div>
    ),
```

Replace with:

```jsx
    Description: (
      <div className="prose prose-sm max-w-none overflow-x-hidden text-slate-600 dark:text-slate-300 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg">
        {product.description ? (
          <div dangerouslySetInnerHTML={{ __html: product.description }} />
        ) : (
          <p className="text-slate-400 italic dark:text-slate-500">No description available.</p>
        )}
      </div>
    ),
```

Three things changed and all three matter:

1. `{product.description}` → `dangerouslySetInnerHTML`. Without this the storefront shows literal
   `<p>` tags to customers.
2. The wrapping element changes from `<p>` to `<div>`. A `<p>` cannot legally contain block-level
   children, and TipTap emits `<h1>`, `<ul>`, `<pre>`, `<blockquote>` — the browser would split
   them out of the `<p>` and break the layout.
3. `overflow-x-hidden` moves from the inner `<p>` to the outer `prose` wrapper, and `[&_img]:*`
   variants are added, so wide `<pre>`/`<table>` blocks and oversized images from the admin cannot
   create a page-level horizontal scrollbar on mobile.

### 9b. Specifications tab — add the HTML above the SKU cards

Current (lines 20–21) starts:

```jsx
    Specifications: (
      <div className="space-y-3 text-sm">
        {selectedVariant?.sku ? (
```

Insert the specification block immediately after the opening `<div>`:

```jsx
    Specifications: (
      <div className="space-y-3 text-sm">
        {product.specification ? (
          <div
            className="prose prose-sm max-w-none overflow-x-hidden text-slate-600 dark:text-slate-300 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_p]:mb-2"
            dangerouslySetInnerHTML={{ __html: product.specification }}
          />
        ) : null}
        {selectedVariant?.sku ? (
```

Note it renders `null` when empty rather than a placeholder — the Specifications tab already has
meaningful content (SKU + variant cards), so an empty state would be misleading. The free-text HTML
sits **above** the structured variant data, so merchandisers can keep a prose spec in the editor
and never re-key stock data.

### 9c. Rendering rules

- `prose prose-sm max-w-none` for typography. `max-w-none` is required — the plugin's default
  `65ch` measure would fight this project's full-width storefront grid.
- `dark:` variants for text colour; this project uses `darkMode: 'class'`, and the admin has a
  separate `admin-theme` key, so both class strategies are in play. Keep the pairs.
- The `Specifications` tab keeps its existing `space-y-3 text-sm` container; do not replace it.

---

## 10. Other consumers of the same HTML — know these before you build

| Consumer | File | Behaviour / action |
|---|---|---|
| `<meta name="description">` + OG/Twitter | `app/(storefront)/products/[slug]/page.jsx` (`generateMetadata`, line 31) | `product.metaDescription \|\| (product.description + " ৳price — Shop now…")`. **The raw HTML is concatenated into the meta description when `metaDescription` is empty** — after this change, tags leak into search snippets. See the fix below. |
| JSON-LD `Product` | same file, line 118 | `description: product.description \|\| \`Buy ${product.title} at Radiant Picks\`` — raw HTML goes into structured data too. |
| Catalogue CSV/XLSX **export** | `src/lib/catalog/runExport.js:56` | Writes `product.description` into the `Description` column. HTML goes into the cell as-is (quoted, multi-line). No change needed. |
| Catalogue **import** | `src/lib/catalog/runImport.js:214,301` | `description: clean(row.description)` — trims only, so a CSV round-trip keeps the HTML text. No change needed. |
| `specification` in catalogue | — | **Not present.** It is dropped on export and ignored on import. Either add a `Specification` column to `PRODUCT_COLUMNS` in `src/lib/catalog/constants.js` plus the importer mapping, or document the drop. Decide consciously. |
| Legacy REST admin API | `app/api/admin/products/route.js:14,25` and `app/api/admin/products/[id]/route.js:7,61` | **These exist and already write `description` raw.** They are not what the create/edit pages call, but anything that does call them will keep writing **plain text** into a column the storefront now renders as HTML — see gotcha #12. They will ignore `specification` entirely. |
| Admin list table | `app/admin/products/page.jsx` | Does not show either field. No change. |
| Blog editor | `app/admin/blog/posts/{create,edit/[slug]}/page.jsx` | Reuses `TipTapEditor` with `content`/`onChange` → `form.content`. **Your §5.2 fix also removes the duplicate-extension warning here.** |

### 10.1 Fix the meta-description / JSON-LD HTML leak

This is a pre-existing weakness that this feature makes materially worse: today `description` is
plain text so the leak is invisible, but once it is HTML, an empty `metaDescription` puts
`<p><strong>…</strong></p>` into a Google snippet and into schema.org structured data.

Do **not** rely on every admin remembering to fill in `metaDescription`. Strip tags at the point of
use. In `app/(storefront)/products/[slug]/page.jsx`, add a helper and use it in both places:

```jsx
// Strip HTML for meta/JSON-LD use. Add near the top of the file.
const stripHtml = (html) =>
  (html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
```

Then in `generateMetadata` (line 31–34):

```jsx
  const description =
    product.metaDescription ||
    ((stripHtml(product.description) || `Buy ${product.title} online at Radiant Picks.`) +
    ` ৳${price} — Shop now with cash on delivery across Bangladesh. ${category ? `Category: ${category}.` : ''}`);
```

And in the JSON-LD block (line 118):

```jsx
    description: stripHtml(product.description) || `Buy ${product.title} at Radiant Picks`,
```

This is a behaviour change worth making in the same commit, because it is the one place where the
new HTML format is user-visible in a way that is a genuine defect rather than a cosmetic quirk.

---

## 11. Implementation checklist

Ordered so each step leaves the app in a working state.

- [ ] **1. Fix `TipTapEditor`** — `StarterKit,` → `StarterKit.configure({ link: false, underline: false })` in `src/components/admin/TipTapEditor.jsx:29`. *No install needed.* (§5.2)
- [ ] **2. Create `src/components/admin/RichEditorSection.jsx`** — verbatim from §4. *No install needed.*
- [ ] **3. Add the column** — `specification String?` in `prisma/schema.prisma`, then
      `npx prisma migrate dev --name add_product_specification`. (§3.1)
- [ ] **4. Backfill decision** — pick A / B / C from §3.3 and record which. Run it once, from a backup.
- [ ] **5. Actions** — add `specification` to the destructure and the write in **both**
      `createProduct` and `updateProduct`. (§8)
- [ ] **6. Create page** — `specification: ''` in `emptyForm`, two imports, replace the description textarea. (§6)
- [ ] **7. Edit page** — `specification: ''` in `emptyForm`, hydrate with `product.specification || ''`, two imports in `product-info.jsx`, replace the description textarea. (§7)
- [ ] **8. Storefront** — Description tab to `dangerouslySetInnerHTML` in a `<div>`; add the specification block to the Specifications tab. **Do not skip the Description tab change.** (§9)
- [ ] **9. SEO** — add `stripHtml` and use it in `generateMetadata` and the JSON-LD block. (§10.1)
- [ ] **10. Catalogue** — decide whether `specification` is exported/imported, and either wire it
      into `PRODUCT_COLUMNS` + `runImport` or document the drop. (§10)
- [ ] **11. Docs** — see §12.
- [ ] **12. Manual pass** — §13.

Dependencies: no `npm install` is required at any step. `@tiptap/*` and
`@tailwindcss/typography` are already in `package.json` and the plugin is already registered.

---

## 12. Docs to update in the same change

`docs/ai-workflow-rules.md` §10 requires keeping `docs/` accurate. Cross-references to add:

| File | Change |
|---|---|
| `docs/frontend-architecture.md` (line 36–39, "Admin components") | Add `RichEditorSection` — collapsible rich-text section wrapper, collapsed by default, open state in `localStorage` under `productEditor:<field>`, plain-text preview when collapsed, children lazily mounted. Also update the `TipTapEditor` line to mention `StarterKit.configure({ link: false, underline: false })`. |
| `docs/ui-context.md` (line 60–65, "Admin Components") | Same addition to the component list. |
| `docs/data-model.md` | Add `Product.specification String?` to the Product model description. |
| `docs/progress-tracker.md` | Add a row: product description + specification rich text — ✅ Done, and note the `specification` catalogue drop if you kept it dropped. |
| `docs/ai-workflow-rules.md` | **No change.** The `productEditor:*` keys are not in the frozen list, and the frozen list itself is unaffected. |

---

## 13. Gotchas

| # | Observation | Why it exists / how to handle it |
|---|---|---|
| 1 | **The two fields are unrelated.** No shared content, no "copy description to spec" helper, separate `id`s. | Keep them independent; merchandisers use Description for prose and Specifications for a table/list. |
| 2 | **No HTML sanitisation anywhere**, and the storefront uses `dangerouslySetInnerHTML`. | Safe only because the sole writer is TipTap (constrained output) and the writers are admin-role users. If anything else can ever write these columns — the catalogue importer, a public API — sanitise **on write** (`sanitize-html` / `DOMPurify`), never on read. |
| 3 | **The editor ignores later `content` prop changes** (no `setContent` effect). | Deliberate: it prevents the parent re-render from resetting the caret. The flip side is that the editor will not reflect external changes — always unmount/remount (which the collapsible wrapper does on every open) instead of trying to sync. |
| 4 | **`onUpdate` fires on every keystroke with the whole HTML document, no debounce.** | Fine for admin-scale content. Add a debounce or dirty flag if you ever add autosave-draft or per-keystroke validation. |
| 5 | **Editor images are URL-only** (`prompt('Enter image URL:')`). There is no in-editor upload. | This project already has an upload endpoint used by the product image field. To reuse it, replace `addImage` with a file input that POSTs and then calls `setImage({ src: uploadData.urls[0] })`. |
| 6 | **Link/image insertion uses `prompt()`** — no URL validation, no modal, and the image toolbar button has no active state. | Swap for a small popover with validation in a polish pass; behaviour is otherwise identical. |
| 7 | **`TipTapEditor` has no `dark:` variants** — the toolbar and `prose` content keep light-mode colours inside the dark admin theme. | Add `dark:prose-invert` to `EditorContent` and `dark:` classes to `ToolbarButton` / `Divider` if the dark admin polish matters. `RichEditorSection` already has full `dark:` coverage. |
| 8 | **Editor output is not length-validated**, while `metaDescription` is capped at 160 chars by `maxLength` on its own plain textarea. | They are independent fields; the 160-char cap applies only to `metaDescription`. |
| 9 | **`specification` is invisible to the catalogue pipeline and any legacy REST routes.** | See §10. Either extend `PRODUCT_COLUMNS` + the importer, or document the drop. |
| 10 | **The `localStorage` key is `productEditor:description`, not scoped per product id.** | The `id` prop is the field name, so the create page, the edit page and every product share one open/closed preference. That is intentional. For per-product state use `productEditor:${productId}:${field}`. |
| 11 | **Collapsed sections hide the editors entirely.** A merchandiser who never clicks the section cannot tell it has content beyond the 90-char preview. | That is the intended trade-off — it keeps prices/images/categories above the fold. If it causes support complaints, consider defaulting to open for `specification` only. |
| 12 | **The legacy REST routes will keep writing plain text into `description`.** `app/api/admin/products/route.js` and `[id]/route.js` destructure and write `description` independently of the server actions. | After this change the column holds **two formats**: TipTap HTML from the admin pages, plain text from these routes. It will not crash — plain text is valid HTML — but newlines collapse and rows look inconsistent. Either add `specification` to both routes and accept plain text there, or delete the routes if nothing calls them. Check with `grep -rn "api/admin/products" app src` before deciding. |

---

## 14. Manual test checklist

Run in order; each step has a specific failure it catches.

**Editor basics**

1. `/admin/products/create` — the "Description & Specifications" row shows two collapsed rows with
   `Empty` pills; prices, images and categories are visible without scrolling.
2. Click "Description" → chevron rotates 90°, editor mounts, focus lands in the writing area.
3. Console shows **no** "Duplicate extension names found" warning. *(Catches §5.2 being skipped.)*
4. Type mixed formatting: bold, italic, underline, H1/H2/H3, bullet list, numbered list, quote,
   code block, plus a link and an image URL.
5. Collapse → header now shows the plain-text preview (first 90 chars + `…`), not `Empty`.
6. Reload the page → the section is still open (`localStorage` remembered), preview still correct.
7. Open both sections, type in both, collapse both, reopen — content intact in both. *(Catches a
   naive `setContent` sync effect clobbering state.)*

**Persistence**

8. Save → redirected to `/admin/products/edit?id=<newId>`; both values present. Open the other one
   to confirm.
9. Edit the product, change only the Specification, save → Description unchanged.
10. Clear the Specification entirely and save → `specification` is `NULL` in the DB.
11. Reopen the edit page for the same product → the editor shows the saved HTML, not a blank canvas,
    and undo history is clean.
12. Check the admin blog create/edit page still renders its editor and logs no duplicate-extension
    warning. *(Regression check on the shared component.)*

**Storefront — the highest-risk area**

13. Open `/products/<slug>` → the Description tab renders formatted HTML: headings, lists, images
    full-width, **no visible `<p>` or `<strong>` tags anywhere**. *(Catches §9.1.)*
14. The Specifications tab shows the specification block **above** the SKU/variant cards.
15. Both tabs look right in light **and** dark mode.
16. A product with a wide `<pre>` or `<table>` in its spec does not create a page-level horizontal
    scrollbar on mobile.
17. A product with an empty specification still shows its SKU/variant cards normally.
18. A product with an empty description shows the "No description available." placeholder.

**Legacy data + SEO**

19. Open a product created **before** this change. Confirm how its plain-text description renders
    (see §3.3) and that nothing crashes.
20. View source on a product page: `<meta name="description">` and the JSON-LD `description` contain
    **no HTML tags**. *(Catches §10.1.)*
21. Export the catalogue to CSV/XLSX and re-import it. Confirm a rich-text description survives the
    round trip and that `specification` behaves as you decided in §10.

---

## Appendix — where each piece lives after the change

| Concern | File |
|---|---|
| Columns | `prisma/schema.prisma` (`Product.description`, `Product.specification`) |
| Migration | `prisma/migrations/<ts>_add_product_specification/migration.sql` |
| Collapsible wrapper | `src/components/admin/RichEditorSection.jsx` (new) |
| Editor | `src/components/admin/TipTapEditor.jsx` (existing, §5.2 fix) |
| Persistence | `src/actions/products.js` (`createProduct`, `updateProduct`) |
| Create form | `app/admin/products/create/page.jsx` |
| Edit form | `app/admin/products/edit/page.jsx` + `partials/product-info.jsx` |
| Storefront tabs | `src/components/storefront/partials/ProductTabs.jsx` |
| SEO / JSON-LD | `app/(storefront)/products/[slug]/page.jsx` |
| Catalogue | `src/lib/catalog/runExport.js`, `runImport.js`, `constants.js` |

---

## 15. Post-ship fidelity fixes (2026-09-27)

The first version handled the *easy* half of real supplier HTML — headings, bold, lists,
strikethrough, links — and quietly mangled the rest. Found by running a real description
(khanexpressbd.com `product-show/308`) through the editor's own schema, not by reading it.

| Input | Before | After |
|---|---|---|
| `<table>` delivery charges | one run-on paragraph, cells concatenated | real `table`/`tableRow`/`tableCell` tree |
| `<h3><img src="…s.w.org emoji…">` | empty `h3` + block image + stray text | emoji stays inside the heading |
| `<img src="https://other-store/…">` | stored as a third-party URL | downloaded and re-hosted under `/uploads/` |
| block product photo | own block | own block (unchanged) |

**Tables.** `StarterKit` v3 has no table nodes, so a pasted table had nowhere to live. Added
`@tiptap/extension-table` + `-row`/`-cell`/`-header`. Pin them to the same version as the rest
of the tree — the registry's latest demands a newer `@tiptap/pm` than the project has and fails
to resolve. `Table` is a **named** export of `@tiptap/extension-table`; the other three have
defaults. Toolbar buttons disable themselves unless `editor.isActive('table')`.

**Inline images.** `Image.configure({ inline: false })` makes images block nodes, and
ProseMirror hoists a block node out of its parent textblock. `inline: true` is safe for
product photos: a block-level `<img>` between paragraphs is *still* parsed into its own
block. Inline is the strictly better setting, not a trade-off.

**Remote re-hosting.** The paste handler in §5 is extended to foreign `http(s)` images. It has
to be server-side — a browser `fetch` of a competitor CDN is blocked by CORS, and a canvas
readback taints on a cross-origin image. New `src/lib/uploads/remoteImage.js` (download +
validation) and `app/api/admin/upload/remote` (admin-gated persistence).

### 15.1 The endpoint is an SSRF sink, so it is guarded at every hop

Anything that downloads a user-supplied URL is a server-side request forgery primitive unless
you validate it. The checks, and what each one stops:

- scheme allow-list (`http`/`https`) — `file:`, `gopher:`, `ftp:` and friends
- reject URLs with embedded credentials
- resolve the hostname and reject **every** returned A/AAAA against private, loopback,
  CGNAT, link-local, multicast and reserved ranges — a name answering with one public and one
  internal address is the DNS-rebinding shape
- unwrap `::ffff:a.b.c.d` and `::a.b.c.d` and re-check the embedded IPv4, so the v6 spelling
  of `127.0.0.1` is not a bypass
- `redirect: 'manual'`, at most 3 hops, **each hop re-validated** — otherwise a public URL
  redirects to an internal one
- 15s timeout, 5MB cap enforced while streaming, not after buffering
- content-type allow-list **and** magic-byte sniffing, because the header is
  attacker-controlled and an allowed `image/svg+xml` can carry script

`192.0.0.0/24` is the one range that is easy to get wrong in the other direction: it is
`192.0.0.*`, not `192.0.*.*`. Over-blocking it rejects `192.0.77.48`, which is a real,
public, very common CDN address.

### 15.2 Two bugs this testing caught in the guards themselves

Both were found by running the guard against a table of real addresses, not by reading it:

1. `::ffff:127.0.0.1` was **allowed** — the v4-mapped test required the first *twelve* bytes to
   be zero, but `::ffff:x` has `0xff 0xff` in bytes 10–11. A live SSRF bypass.
2. `192.0.77.48` was **blocked** — `192.0.0.0/24` was tested as `a === 192 && b === 0`, which
   is `192.0.*.*` and far too wide.

A security control that has never been run against real addresses is a guess. Re-run the
address table whenever these ranges are touched.

### 15.3 Storefront

`ProductTabs` needs an explicit styling contract, because the HTML is real-world markup rather
than something this codebase chose. It also had `overflow-x-hidden`, which silently clipped any
table wider than the column with no way to scroll to it — now `overflow-x-auto`.

### 15.4 Pre-existing, still open

Most `/api/admin/*` routes carry no auth check of their own, and `proxy.js`'s
`matcher: ['/admin/:path*']` never matches `/api/...`, so its `isAdminApiRoute` branch is
unreachable. `GET /api/admin/products` returns product data with no cookie. The new
`/api/admin/upload/remote` calls `requireAdmin` explicitly and is **not** affected — but it is
worth knowing that the guard protecting it is the handler, not the middleware.

---

## 16. Storefront display, and the empty-document trap (2026-09-27)

Reported as "the description isn't showing properly with images on the product page". The
visible symptom was one misplaced image; investigating it surfaced a defect affecting 95 of 101
products.

### 16.1 An empty editor writes `<p></p>`, and `<p></p>` is a truthy string

`editor.getHTML()` on an untouched document returns `<p></p>`. So "the admin did not write a
description" and "the admin wrote a non-empty string" were the same thing in the database, and
every consumer that asked `if (product.description)` got the wrong answer:

- the storefront rendered a **blank panel** instead of "No description available."
- the meta description and JSON-LD got an empty string rather than their generated fallback
- the admin "Empty" pill disagreed with the storefront

`description` was also written **raw** on every path, so nothing ever converted it to `null`.

This is the class of bug that a truthiness check cannot see, and it is worth assuming any
rich-text field will hit it.

### 16.2 The rule, in one place: `src/lib/richText.js`

| Export | Purpose |
|---|---|
| `hasVisibleContent(html)` | text **or** a media/table tag — an image-only description still counts as content |
| `normalizeRichText(html)` | `null` for an empty document, otherwise the HTML with empty edge paragraphs trimmed |
| `trimEmptyBlocks(html)` | drop empty paragraphs from both ends, leaving interior ones |
| `stripHtml(html)` | plain text for meta/JSON-LD; moved here from the product page, which had its own copy |

Applied on **all four** product write paths — `createProduct`/`updateProduct`, `POST`/`PUT
/api/admin/products`, and the catalogue import. `Category.description` is a different field and
was left alone. The *read* side is also defensive (`ProductTabs` uses `hasVisibleContent`), so
rows written before the fix still render correctly.

`null` is the single representation of "no description", which is what lets the storefront
fallback, the SEO fallback and the admin pill stop disagreeing.

### 16.3 Empty paragraphs at the ends, but not in the middle

`<p></p>`, `<p><br></p>` and `<p>&nbsp;</p>` each render as a band of dead whitespace.
Leading and trailing ones are junk and get trimmed. **Interior** ones are kept, because they are
sometimes deliberate spacing between sections and silently deleting them would merge content the
author meant to keep apart.

The obvious implementation is wrong. One global `String.replace` evaluates every match against
the *original* string, so in `<p></p><p></p>text` only the first block is seen to be at the
start and a stray paragraph survives. It needs an anchored loop:

```js
let out = html.trim(), previous;
do {
  previous = out;
  out = out.replace(EMPTY_AT_START, '').replace(EMPTY_AT_END, '').trim();
} while (out !== previous);
```

This was caught by a table-driven test of the helper, not by reading it.

### 16.4 Legacy data

`prisma/cleanEmptyRichText.js` (idempotent, and conservative — only clears values with neither
text nor media) NULLs the rows written before the fix. Backup first with
`prisma/backupProductRichText.js`. Both scripts pull the shared rule in with a dynamic
`import()`: they are CommonJS like their siblings, while `src/lib/` is ESM, and duplicating the
emptiness test to avoid the mismatch would be worse than the mismatch.

### 16.5 Storefront CSS

Two rules, both targeting defects found in real data rather than restyling everything:

- `[&_li_p]:my-0` — pasted lists arrive as `<li><p>text</p></li>`, and the inner paragraph's own
  margin doubled the gap between every item.
- `[&_p:has(>img:only-child)]:text-center` — a description photo sits in a paragraph of its own
  and inherits that paragraph's alignment. `>img:only-child`, not `>img`, so inline emoji
  (WordPress pastes those as `<img>` too) are unaffected.

An earlier attempt also reset `[&_p]:my-0` globally to flatten the rhythm. It worked, but it
restyled every existing description to fix a problem `[&_li_p]:my-0` already solves, so it was
dropped. `prose`'s own paragraph spacing is better than a hand-rolled approximation of it.

### 16.6 Mislocated content is a data problem, not a rendering one

The reported image was in `specification` while `description` held the same text without it. Both
forms are wired to the correct fields, so this was an accidental paste into the wrong editor.
The image was moved into the description and the verbatim-duplicate specification cleared —
behind an assertion that the specification really was the description plus that one image, so
the fix would abort rather than delete real content. The assertion fired on its first run,
correctly, because the description carried a stray `<p></p>` the specification did not; it
passed once both sides were normalised.
