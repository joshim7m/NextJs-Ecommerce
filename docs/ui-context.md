# UI Context & Design System

This document defines the visual design language, component library, and user experience guidelines for the Radiant Picks ecommerce application.

## Design System Foundation

### Color Palette
- **Primary:** `brand.primary` — `#2f0f6b` (deep purple; headers, CTAs, prices, announcement bar)
- **Secondary:** `brand.secondary` — `#435165` (slate blue; supporting accents)
- **Neutral:** Tailwind gray scale
- **Semantic:** Tailwind green (success), amber (warning), red (error/danger)
- Defined in `tailwind.config.js`; CSS variables mirrored in `app/globals.css`

### Light Mode Palette — "Romantic Pastel" (storefront)
The storefront light mode is intentionally colorful and soft. Dark mode uses its own existing violet palette and is NOT affected by these values. All tokens are defined in `app/globals.css` (light `:root` block) and applied via light-mode-only Tailwind classes in components.

| Token | Value | Usage |
|---|---|---|
| Page background | `#f8fafc` → `#f5f3ff` / `#fdf2f8` gradient wash (`.bg-page-pastel`) | `body` in light mode |
| Brand gradient | violet `#7c3aed` → fuchsia `#d946ef` (`.bg-brand-gradient`) | Primary buttons, CTAs, badges |
| Footer (light) | solid navy `bg-slate-900` (`#0f172a`) | Footer background; dark mode keeps `#1a0a3e` |
| Primary accent | `#2f0f6b` brand purple (text/contrast) | Headings, prices, link color |
| Pastel surfaces | `bg-violet-50/70`, `bg-fuchsia-50`, `bg-rose-50` | Card tints, chips, section backgrounds |
| Sale/danger accent | rose (`rose-500/600`) | Sale badges, hot-sales accents |
| Success accent | green (existing) | Added-to-cart feedback, in-stock |

Rules:
- Gradient buttons are reserved for the single primary CTA per view (Add to Cart, checkout); secondary actions stay bordered/outlined
- Pastel tints are backgrounds/hover states only — body text stays slate for WCAG AA contrast
- Every pastel style is a light-mode class only; never modify existing `dark:` variants of the same element

### Typography
- **Font Family:** Inter (Google Fonts, loaded in root layout)
- **Headings:** text-4xl → text-lg scale
- **Body Text:** text-base (16px), text-sm for secondary info
- **Semantic Styling:** Bold for prices (with ৳ symbol), muted for secondary info

### Spacing
- Tailwind spacing scale with consistent padding/margin rhythm across components

## Dark Mode
- Strategy: Tailwind `darkMode: 'class'`
- **Storefront:** `ThemeInit` applies saved `localStorage.theme` or OS preference on load; toggle in Header flips `document.documentElement.classList` and persists
- **Admin:** `ThemeProvider` context (`admin-theme` key, respects OS preference); sun/moon toggle in AdminHeader; all admin components carry paired light/dark classes
- Ensure WCAG AA contrast in both modes

## Component Library

### Storefront Components (JSX + Tailwind)
**Implemented:**
- `Header` — logo, nav, live search autocomplete, dark toggle, wishlist/cart icons
- `Footer` — links, contact info, social links, Bangladesh focus
- `AnnouncementBar` — purple strip with tel: link (currently disabled in Header)
- `CartDrawer` — slide-out mini cart
- `ProductDetailClient` + partials: `ProductInfo` (variants, WhatsApp order button, share, wishlist), `ImageGallery`, `ProductTabs`, `RelatedProducts`
- Homepage partials: `Hero` slider, `FilterSidebar`, `ProductGrid`, `SortBar`, `MobileCategoryChips`
- Blog: `BlogCard`, `AdCard`, `LoadMorePosts`
- `GoogleTagManager`, `PageViewTracker`, `MobileFilter`, `ThemeInit`, `ConfirmDialog`

### Admin Components (JSX + Tailwind)
**Implemented:**
- `ThemeProvider` + `useTheme` — admin dark mode context
- `TipTapEditor` — rich text editor with toolbar (bold/italic/underline/strike/headings/lists/quote/code/link/image)
- `CategoryMultiSelect`, `AdvertisementMultiSelect`
- Shell: `AdminSidebar`, `AdminHeader`

## Visual Patterns

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Product grids: 1 column (mobile) → 2 (tablet) → 3–4 (desktop); mobile category chips and filter drawer replace sidebars on small screens

### Interactive States
- Hover: subtle color change, shadow, or scale
- Focus: clear focus ring
- Active/disabled: distinct background/border, reduced opacity

## Branding & Regional Considerations

### Bangladesh Focus
- English UI with Bengali product/blog content
- Prices displayed in BDT with ৳ symbol
- "Inside Dhaka" vs "Outside Dhaka" shipping shown prominently at checkout
- Contact via phone/WhatsApp emphasized (hotline bar, WhatsApp order buttons)

### Product Presentation
- Consistent aspect-ratio product images (aspect-square cards)
- Pricing hierarchy: original price (strikethrough if on sale), sale price, discount %
- Variant badges (size labels, color names)
- Stock status indicators where applicable

## User Experience Guidelines

### Storefront UX
- **Discovery:** category navigation (sidebar/chips), live search overlay, sort bar
- **Product Detail:** image gallery, variant selection, quantity, add-to-cart / buy-now / WhatsApp order CTAs
- **Cart:** slide-out drawer review, quantity updates, proceed to checkout
- **Checkout:** single-page form with BD phone validation and delivery charge selection
- **Order Confirmation:** order number on thank-you page

### Admin UX
- **Navigation:** sidebar with sections (Dashboard, Products, Categories, Orders, Blog, Settings)
- **Forms:** labeled fields, validation feedback, save/cancel actions
- **Lists:** search and filters, inline edit/delete actions
- **Feedback:** toasts for success/error, loading/skeleton states

## Accessibility

### WCAG 2.1 AA Targets
- Keyboard navigation and visible focus states
- Semantic HTML, ARIA labels where needed
- Color contrast ≥ 4.5:1 for text in light and dark modes
- Alt text for images, proper heading hierarchy

## Implementation Notes

### Tailwind Configuration
- `tailwind.config.js`: brand colors, Inter font, `darkMode: 'class'`, content paths (`./app`, `./components`, `./src`), `@tailwindcss/typography` plugin (blog prose)

### Performance
- Next.js Image optimization; lazy-loaded images
- Loading skeletons (`loading.js`) on data-heavy routes
- Debounced search API calls

## Future Enhancements
- Bengali localization of UI chrome
- Advanced product filters (price range refinement, ratings)
- Animated transitions and micro-interactions
- Product reviews and recommendations
