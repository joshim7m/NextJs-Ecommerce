# Project Progress Tracker

A living document tracking the status of all project tasks for the Radiant Picks ecommerce application.

**Last Updated:** 2026-09-27 (storefront rich-text display + empty-description fix)

## Session 2026-09-27 — Storefront display of descriptions with images
Follow-up to the fidelity work below, from "the description isn't showing properly on the product page". Investigating one product (`three-point-one-piece-women-s-sexy-lingerie-bikini`) turned up three separate problems, only one of which was the visible one.

- **Symptom:** the pasted photo never appeared. It was in `Product.specification`, not `description` — the two forms are wired to the right fields (checked both), so it was an accidental paste into the Specifications editor. The Description tab is the default view, so the photo was invisible, and it only appeared behind the Specifications tab, immediately above a verbatim duplicate of the description. Moved the image into the description and cleared the duplicate, guarded by an assertion that the specification really was the description plus that image (it was, once the description's stray `<p></p>` was normalised away) so the script would abort rather than delete real content
- **Root cause of a much bigger problem: `<p></p>`.** An untouched TipTap editor serialises to `<p></p>` — a non-empty *string* holding an empty *document*. `description` was written raw, and every write path used a truthiness test, so **95 of 101 products** had `<p></p>` in `description` and rendered as a blank panel on the storefront instead of "No description available.", while also defeating the admin "Empty" pill. Fixed at the source, not patched in the view
- **New `src/lib/richText.js`** — `hasVisibleContent` (text **or** a media/table tag, so an image-only description still counts), `normalizeRichText` (`null` for an empty document, plus trimming empty paragraphs from both ends), `trimEmptyBlocks`, and the `stripHtml` that used to be inlined in the product page (now imported). Empty = `null` in the database, so the storefront fallback, the SEO fallback and the admin pill can no longer disagree. Interior empty paragraphs are kept — sometimes they are deliberate spacing; only the ends are reliably junk
- **All four write paths normalised:** `createProduct`/`updateProduct` (server actions), `POST`/`PUT /api/admin/products` (REST — previously raw, and the reason a REST client could reintroduce the problem), and the catalogue import. `Category.description` deliberately left alone
- **Legacy data cleaned** to `null` by `prisma/cleanEmptyRichText.js` (idempotent, only clears values with neither text nor media). Backup: `prisma/backups/product-richtext-*.json` via `prisma/backupProductRichText.js`. 95 cleared, 6 with real content untouched. Both scripts `require`d the ESM helper via dynamic `import()` to keep the rule in one place
- **Storefront CSS:** `[&_li_p]:my-0` — pasted lists arrive as `<li><p>text</p></li>`, and the inner paragraph's margin doubled the gap between every item; and `[&_p:has(>img:only-child)]:text-center` so a description photo inherits the paragraph's alignment. `>img:only-child` rather than `>img` so inline emoji (WordPress pastes those as `<img>` too) are unaffected
- **Bug caught by a test I wrote against the helper:** the first implementation trimmed empty paragraphs with one global `String.replace`, which evaluates every match against the *original* string — so in `<p></p><p></p>text` only the first was removed and a stray paragraph survived. Replaced with an anchored loop. All 11 cases pass
- **Verified:** image present in the server-rendered DOM and served `200 image/jpeg 235876b`; "No description available." now renders for cleaned products; meta description falls back to generated text instead of empty. `npx next build` passes and Tailwind emits both new variants
- **Also folded in:** `stripHtml` moved to the shared helper, so the product page no longer carries its own copy

## Session 2026-09-27 — Rich-text fidelity: tables, inline images, re-hosted images
Resolves the two "lesser issues" left open in the pasted-image session below, after auditing a real supplier description (khanexpressbd.com `product-show/308`) against the editor's actual TipTap schema.

- **Table support.** `StarterKit` v3 ships no table nodes, so a pasted `<table>` had nowhere to go and collapsed into one run-on paragraph — `ঢাকা সিটির বাহির150 টাকাঢাকা সিটির ভিতর80 টাকা`. Delivery charges, size charts and spec tables are exactly this shape. Added `@tiptap/extension-table` + `-row`/`-cell`/`-header`, pinned to `3.27.3` to match the rest of the tree (the registry's `3.31.3` demands `@tiptap/pm@3.31.3` and fails to resolve). Toolbar gained Table / +Row / +Col / −Row / −Col / Hdr / Del, greyed out unless the cursor is in a table
- **Inline images.** `Image.configure({ inline: false })` made images block nodes, so a WordPress emoji `<img>` inside a heading was hoisted out and split `### ✨ Versatile Usage` into an empty `h3` + a block image + a stray paragraph. Now `inline: true`. Verified this is a strict improvement: a block-level `<img>` between paragraphs is still lifted into its own block by the parser, so product photos are unchanged
- **Remote image re-hosting.** Pasted CDN images are no longer stored as third-party URLs. New `src/lib/uploads/remoteImage.js` downloads them server-side (a browser fetch would be blocked by CORS) and new `app/api/admin/upload/remote` persists them. The editor sends one batched request and rewrites each `<img>`; images already on our own origin are left alone, and a failed download drops that one image rather than the paste
- **SSRF hardening** (this endpoint fetches attacker-supplied URLs, so it is guarded at every hop): scheme allow-list, credentials rejected, DNS-resolved addresses checked against private/loopback/CGNAT/link-local/multicast/reserved ranges for **all** A/AAAA answers, `::ffff:`/`::`-embedded IPv4 unwrapped and re-checked, `redirect: 'manual'` with ≤3 hops each re-validated, 15s timeout, 5MB streaming cap, content-type allow-list **plus** magic-byte sniffing (content-type is attacker-controlled and SVG can carry script). Route is gated by `requireAdmin` and returns 401 unauthenticated. 25/25 cases pass, including `169.254.169.254` and `[::ffff:127.0.0.1]`
- **Storefront:** `ProductTabs` extracts a shared `RICH_TEXT_CLASSES` (table borders/header shading/width, dark mode) and switches `overflow-x-hidden` → `overflow-x-auto`; a wide size chart was previously clipped with no way to reach it
- **Verified** by replaying the reference page's real HTML through the shipped extension list (jsdom + ProseMirror `DOMParser`): table → `table/tableRow/tableCell` tree, emoji stays inside its heading, block photo unchanged, headings/bold/bullets/strikethrough unchanged. Also end-to-end over HTTP: 401 unauthenticated, real PNG + WP emoji SVG re-hosted and served back as `image/png` / `image/svg+xml`, 404 and metadata-IP rejected per-item
- `npm run build` passes. New `src/lib/uploads/storeImage.js` holds the shared write; the older `/api/admin/upload` route was intentionally left untouched
- **Open, pre-existing, not addressed here:** most `/api/admin/*` routes have no auth of their own and `proxy.js`'s `matcher: ['/admin/:path*']` never matches `/api/...`, so `isAdminApiRoute` is dead code — `GET /api/admin/products` returns data with no cookie (verified live)

## Session 2026-09-27 — Pasted Image Fix (follow-up to rich text)
- **Bug:** pasting a description copied from another store silently dropped its images. TipTap's `Image` node has `allowBase64: false`, so its parse rule is `img[src]:not([src^="data:"])` and any `data:image/...;base64` src is discarded. Stores like eghuri.com inline the whole product picture as one base64 URI (~314KB of base64 → 235KB JPEG)
- **Fix:** `TipTapEditor` gained `editorProps.handlePaste`. Pasted data-URI images are decoded in the browser (4MB cap), POSTed to `/api/admin/upload`, and the clipboard HTML is rewritten to the returned `/uploads/<folder>/…` URL before insertion. A real image file on the clipboard (screenshot / "Copy image") takes the same route, since ProseMirror's fallback would inline it as base64. Remote `http(s)` images are left untouched. Progress/errors surface in a status strip under the toolbar
- New `uploadFolder` prop (default `products`; blog create/edit pass `blog`)
- **Verified** with jsdom + ProseMirror's real DOMParser, replaying the actual clipboard HTML: eghuri 0 images before → 1 re-hosted image after, served byte-identical from `app/uploads/[...path]`; no base64 left in the document
- **Not a bug:** khanexpressbd.com descriptions use plain remote `<img src>` and were never dropped (4 images before and after). Two lesser issues remain there and were left as-is pending a decision: `style="width:918px"` is not preserved, and the paste hotlinks a competitor CDN plus two `s.w.org` emoji SVGs — **both resolved in the session above**; only the inline `width` style is still dropped
- `npm run build` passes

## Session 2026-09-27 — Product Description & Specification (Rich Text)
- `Product.specification` added via migration `20260927041319_add_product_specification` (`TEXT`, nullable)
- New `src/components/admin/RichEditorSection.jsx` — collapsible rich-text section, collapsed by default, open state in `localStorage` `productEditor:<field>`, plain-text preview when collapsed, children lazily mounted
- `TipTapEditor` now uses `StarterKit.configure({ link: false, underline: false })` — removes the duplicate-extension console warning that also affected the blog editor
- Product create/edit forms: the description `<textarea>` is replaced by two collapsible editors (Description, Specifications)
- `description` content format changed from plain text to TipTap HTML
- Storefront `ProductTabs`: Description tab renders HTML via `dangerouslySetInnerHTML` inside a `prose` wrapper; Specifications tab gained the specification block above the SKU/variant cards
- SEO: added `stripHtml` (since moved to the shared `src/lib/richText.js`) in `app/(storefront)/products/[slug]/page.jsx` so `<meta name="description">` and the JSON-LD `Product.description` never contain tags
- Legacy REST routes (`/api/admin/products`) now accept `specification`; they wrote `description` raw at this point — **since normalised too**, see the session above
- Catalogue export/import carry a new `Specification` column
- **Backfill decision: Option B** — legacy plain-text descriptions wrapped in `<p>` (2 rows). Backup: `prisma/backups/product-description-pre-html-*.json`; scripts `prisma/backupProductDescriptions.js` + `prisma/backfillProductDescriptions.js` (idempotent). Rows that already contained HTML were left untouched
- `npm run build` passes

## Session 2026-09-23 — Colorful Light Mode ("Romantic Pastel")
- Doc first: added "Light Mode Palette — Romantic Pastel" tokens & rules to `ui-context.md`
- `globals.css`: pastel gradient page background, `.bg-brand-gradient` / `.bg-brand-gradient-hover` utilities (ignored in dark mode)
- header icon buttons violet-tinted + gradient accent strip; footer gradient light mode
- Hero pastel overlays + gradient CTA; product cards violet tints, gradient Add-to-Cart/Load-More
- FilterSidebar, MobileCategoryChips, SortBar, CartDrawer, AdCard, AnnouncementBar, MobileFilter tinted
- Product detail, blog cards, categories, contact pages tinted; cart/checkout/wishlist/thankyou gradient CTAs
- Dark mode untouched (dark: variants preserved); `next build` passes

## Project Phases

### Phase 1: MVP Foundation ✅ Complete
Core storefront and admin functionality with real seeded catalog data.

### Phase 2: Hardening & Growth (Current)
SEO, analytics, fraud prevention, WhatsApp ordering, DB tooling. Payment integration remains the major outstanding item.

### Phase 3: Payment Integration
Third-party payment gateway (bKash, Nagad, cards).

### Phase 4: Advanced Operations
Inventory sync, fulfillment workflows, customer accounts, reviews.

---

## Database & Schema

| Task | Status | Notes |
|------|--------|-------|
| Prisma schema (17 models) | ✅ Done | See `schema.prisma`; documented in `data-model.md`. `Product.isFeatured` added via migration `20260920133728_add_product_is_featured`; `Product.specification` via `20260927041319_add_product_specification` |
| Database migrations | ✅ Done | 18 migrations under `prisma/migrations/` |
| Seed pipeline (scraper-based) | ✅ Done | `seed.js` → `seedSettings` + `seedCatalog` + `seedBlog`; see `seeding.md` |
| Catalog scraper (`fetchCatalog.js`) | ✅ Done | Cheerio scraper for eghuri.com → `catalogData.json` |
| Bengali content processing | ✅ Done | `processCatalog.js` EN→BN tags/meta; Bengali blog posts in `seedBlog.js` |
| SiteSetting singleton | ✅ Done | Identity, contact, announcement, Telegram/GTM/WhatsApp config |
| BlockedDevice table | ✅ Done | Fraud blocklist keyed by FingerprintJS hash |

---

## Storefront Development

### Pages & Routes

| Page | Status | Notes |
|------|--------|-------|
| Home (`(home)/page.jsx`) | ✅ Done | Hero slider, filter sidebar, product grid, sort bar, mobile category chips |
| Products listing | ✅ Done | `/products` with sorting |
| Product detail | ✅ Done | Gallery, variants, tabs, related products, WhatsApp order, share, wishlist |
| Categories listing + detail | ✅ Done | Hierarchical browsing |
| Cart page | ✅ Done | localStorage cart, qty controls |
| Checkout | ✅ Done | BD phone validation, delivery charge, device-hash fraud checks |
| Thank You | ✅ Done | Order number display |
| Wishlist | ✅ Done | `/wishlist`, hydrated via `POST /api/wishlist` |
| Blog listing/categories/post | ✅ Done | Load-more pagination, ad injection, reading time, related posts |
| Static pages (about/contact/privacy/terms) | ✅ Done | |
| 404 page | ✅ Done | Custom `not-found.jsx` |
| Loading skeletons | ✅ Done | `loading.js` on home/products/categories routes |

### Components

| Component | Status | Notes |
|-----------|--------|-------|
| Header | ✅ Done | Live search autocomplete, dark toggle, wishlist/cart icons |
| Footer | ✅ Done | Social links, Bangladesh branding |
| CartDrawer | ✅ Done | Slide-out mini cart synced via `cart-updated` event |
| AnnouncementBar | ⚠️ Built, disabled | Wired but commented out in Header |
| ProductGallery / ImageGallery | ✅ Done | In product partials |
| VariantSelector | ✅ Done | Inside `ProductInfo` |
| FilterSidebar / MobileFilter | ✅ Done | Desktop sidebar + mobile drawer/chips |
| GoogleTagManager + PageViewTracker | ✅ Done | SPA `page_view` events, Suspense-wrapped |

### Features

| Feature | Status | Notes |
|---------|--------|-------|
| Cart state (localStorage) | ✅ Done | `src/lib/cartStorage.js` |
| Wishlist (localStorage) | ✅ Done | `src/lib/wishlistStorage.js` + hydration API |
| Variant pricing logic | ✅ Done | Variant override or base price, discount amount/% |
| Delivery charge selection | ✅ Done | Inside Dhaka ৳50 / Outside ৳120 |
| Dark mode (storefront) | ✅ Done | Class strategy, persisted, OS preference fallback |
| SEO (metadata, sitemap, robots, JSON-LD) | ✅ Done | Per-page metadata, dynamic sitemap, OG images via `/api/og` |
| GTM analytics | ✅ Done | Configurable via SiteSetting `gtmId` |
| WhatsApp ordering | ✅ Done | wa.me deep link with product/variant/price pre-fill |
| Device fingerprinting | ✅ Done | FingerprintJS visitorId cached and sent at checkout |
| Image optimization | ✅ Done | Next.js Image; uploads to `public/uploads/` |

---

## Admin Panel Development

| Task | Status | Notes |
|------|--------|-------|
| JWT authentication (login/logout/me) | ✅ Done | `jose` HS256, httpOnly cookie, 8h expiry |
| Route protection (`proxy.js`) | ✅ Done | Next 16 middleware equivalent guarding `/admin/:path*` |
| Dashboard (stats + recent orders) | ✅ Done | |
| Products CRUD with variants | ✅ Done | Variant generator, image diffing on update |
| Featured products flag | ✅ Done | `isFeatured` checkbox in product create/edit; badge on products list |
| Multi-image upload | ✅ Done | `/api/admin/upload`, type whitelist, 5MB max |
| Categories CRUD (hierarchical) | ✅ Done | Parent/child management |
| Orders list/detail/search | ✅ Done | Status updates, item qty editing, totals recompute |
| Device blocking/unblocking | ✅ Done | `BlockedDevice` + checkout rejection |
| Blog categories/posts/advertisements CRUD | ✅ Done | Tiptap editor, ad linking multiselect |
| Settings: site identity | ✅ Done | Name, logo, favicon, contact, announcement, about (EN/BN) |
| Settings: site-config integrations | ✅ Done | Telegram token/chat (+test), GTM ID, WhatsApp number |
| Settings: hero sliders CRUD | ✅ Done | |
| Settings: social links CRUD | ✅ Done | |
| Settings: DB backup/restore | ✅ Done | pg_dump download / .sql restore upload (**uncommitted**) |
| Admin dark mode | ✅ Done | ThemeProvider context + toggle |
| Role-based access (admin/editor separation) | ❌ Not Started | Single admin role enforced by proxy |

---

## API Routes

All endpoints implemented and documented in `docs/architecture.md`. Summary:

| Group | Status | Notes |
|-------|--------|-------|
| Public storefront APIs (search, categories, recent products, wishlist, checkout, check-blocked, og) | ✅ Done | Checkout includes fraud checks + Telegram alert |
| Admin auth APIs | ✅ Done | login/logout/me |
| Admin catalog APIs (products, categories) | ✅ Done | Full CRUD |
| Admin order APIs (list, detail, search, block/unblock) | ✅ Done | |
| Admin settings APIs (site, site-config+test, hero-sliders, social) | ✅ Done | |
| Admin upload API | ✅ Done | Multi-file → `public/uploads/` |
| Admin backup API | ✅ Done | **Uncommitted work** |

---

## Styling & Design

| Task | Status | Notes |
|------|--------|-------|
| Tailwind config (brand colors, Inter, typography plugin) | ✅ Done | `#2f0f6b` primary, `#435165` secondary |
| Responsive mobile-first design | ✅ Done | Grids, drawers, chips across breakpoints |
| Dark mode — storefront | ✅ Done | ThemeInit + Header toggle |
| Dark mode — admin | ✅ Done | ThemeProvider + AdminHeader toggle |
| ShadCN UI | ❌ Dropped | Decided against; plain React + Tailwind everywhere |

---

## Testing & Quality Assurance

| Task | Status | Notes |
|------|--------|-------|
| Test framework setup | ❌ Not Started | No Jest/Vitest/Playwright configured |
| Unit/component tests | ❌ Not Started | Priority: pricing logic, storage helpers, blog-ads injection |
| Integration tests (API routes) | ❌ Not Started | Priority: `/api/checkout` |
| E2E tests | ❌ Not Started | Browse→checkout, admin flows |
| Accessibility audit | ❌ Not Started | axe-core + manual keyboard pass |
| Build verification | ✅ Done | `npm run build` passing pre-deploy |

---

## Deployment & DevOps

| Task | Status | Notes |
|------|--------|-------|
| Vercel deployment config | ✅ Done | Minimal `next.config.mjs`, `postinstall: prisma generate` |
| Production database | ✅ Done | External PostgreSQL via `DATABASE_URL` |
| Environment variables | ✅ Done | `.env` with DATABASE_URL (integration tokens live in DB) |
| SEO infrastructure | ✅ Done | Sitemap, robots, OG images, JSON-LD |
| CI/CD (GitHub Actions) | ❌ Not Started | Lint/build/test pipeline |
| Monitoring & error tracking | ❌ Not Started | GTM analytics only; no error tracking yet |
| Security review | ⏳ Partial | JWT guard + fraud checks done; formal review pending |

---

## Documentation

| Task | Status | Notes |
|------|--------|-------|
| All 10 docs refreshed to match codebase | ✅ Done | Session 2026-08-21: overview, architecture, data-model, frontend-architecture, admin-panel, seeding, ai-workflow-rules, ui-context, testing, progress-tracker |

---

## Key Blockers & Decisions

### Resolved Decisions
- **Auth:** Custom JWT via `jose` + `proxy.js` (Next 16 middleware replacement) — not NextAuth
- **Image storage:** Local uploads to `public/uploads/` + remote URLs for seeded data
- **Dark mode:** Implemented in both storefront and admin
- **UI library:** ShadCN dropped; plain React + Tailwind throughout
- **Product data:** Real scraped catalog from eghuri.com (not dummy data)

### Current Blockers
- None blocking development.

### Pending Decisions
- Payment gateway choice (bKash/Nagag/card) and timeline
- Customer accounts (registration/login) — currently guest-only checkout
- Bengali localization of UI chrome
- Error tracking service (Sentry or similar)

---

## Next Steps

1. Commit the Backup DB feature (`app/admin/settings/backup-db/`, `app/api/admin/backup/`, sidebar/layout changes)
2. Re-enable or remove the AnnouncementBar in Header
3. Payment gateway integration (Phase 3)
4. Set up test framework + CI pipeline
5. Customer accounts & order history

---

## Legend

- ✅ **Done:** Task completed and verified
- ⏳ **In Progress / Partial:** Being worked on or incomplete
- ⚠️ **Built, disabled:** Implemented but turned off
- ❌ **Not Started:** Ready to begin

---

## Session Log

### Session 2026-08-21 (Documentation Refresh)
- Audited entire codebase against docs; found docs 7+ weeks stale (still "Cabinet Closet" planning phase)
- Rewrote all 10 docs to reflect actual implementation:
  - `overview.md`: Radiant Picks identity, current feature set, regional scope
  - `architecture.md`: real folder structure, full route map (~30 API routes), JWT auth flow via `proxy.js`
  - `data-model.md`: all 17 Prisma models verified against schema, migration summary
  - `frontend-architecture.md`: actual components/hooks, localStorage sync events, GTM, SEO implementation
  - `admin-panel.md`: complete admin surface incl. blog CMS, settings pages, device blocking, DB backup
  - `seeding.md`: scraper pipeline (fetchCatalog → processCatalog → seedCatalog) + settings/blog seeds
  - `ai-workflow-rules.md`: corrected conventions (no ShadCN, proxy.js auth, server actions/API split)
  - `ui-context.md`: real brand tokens (#2f0f6b/#435165), Inter font, dark mode strategy
  - `testing.md`: honest current state (no tests) + prioritized recommendations
  - `progress-tracker.md`: statuses updated to reality, decisions log, this entry
- Identified uncommitted Backup DB feature as next commit candidate

### Session 2026-07-03 (Initial)
- Reviewed and rewrote 3 documentation files: `ai-workflow-rules.md`, `ui-context.md`, `progress-tracker.md`

### Session 2026-07-03 (Development)
- Verified migrations and seed script; reorganized to `(storefront)` route group
- Created Header/Footer components; set up `@` path alias; built home page foundation

### Session 2026-07-03 (Bug Fixes & Feature Completion)
- Fixed duplicate admin routes and broken storefront links
- Built categories, product detail, cart, checkout, thankyou pages
- Created all admin API routes and admin CRUD pages

### Session 2026-07-03 (Storefront Redesign)
- Brand colors (#2f0f6b/#435165) + Inter font applied across storefront and admin
- Redesigned header (hotline bar, search), home, category, product, cart, checkout, footer

### Session 2026-07-03 (Catalog & Seed Update)
- Extracted real catalog (27 products, 5 categories) from reference site
- Added live search API + header search overlay; ran seed successfully

*(Sessions between 2026-07-03 and 2026-08-21 were tracked in git only; see `git log` for storefront v1.0.0, variants, dark mode, mobile-first redesign, SEO, GTM tracking, and WhatsApp ordering milestones.)*
