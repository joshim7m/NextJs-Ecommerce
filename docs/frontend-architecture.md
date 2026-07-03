# Frontend Architecture

## Routing & Layout
- Use Next.js App Router. Route groups: `/(storefront)` and `/(admin)` with shared `layout.jsx` for global header/footer.

## Components
- Atomic, reusable components under `src/components/storefront`:
  - `Header`, `Footer`, `ProductCard`, `ProductGrid`, `ProductGallery`, `VariantSelector`, `FilterSidebar`, `Pagination`, `CartModal`, `CheckoutForm`.

## State Management
- Cart state: React Context persisted to localStorage and synced to server session.
- Product page state: selected variant, selected quantity, and dynamic pricing.
- Checkout state: customer name, mobile, address, shipping_area, delivery charge selection, and order summary.
- Small localized state for forms; prefer server actions for create/update operations in admin.

## Regional Requirements
- Use Bangladeshi Taka (BDT) as the only currency.
- Checkout includes delivery charge options: inside Dhaka = 50 taka, outside Dhaka = 120 taka.

## Styling
- TailwindCSS + centralized config for design tokens. Use utility classes and small shared UI primitives.

## Images
- Use Next.js `Image` for optimization. Seeded images will be remote URLs or stored in `public/` during early development.
- Support variant-specific images where a `ProductVariant` can link to its own image.
