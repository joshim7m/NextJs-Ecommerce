# Architecture

## High-Level Architecture

- **Frontend:** Single Next.js App Router project using server and client components. Route groups separate `/(storefront)` and `/(admin)` with dedicated layouts.
- **Database:** PostgreSQL accessed via Prisma ORM.
- **Image Storage:** Initially use remote URLs (seeded), later local upload.
- **Authentication:** NextAuth (recommended) or custom server session for admin access.

## Folder Structure (proposed)

- `app/` – Next.js App Router routes for storefront and admin
- `app/(storefront)/` – storefront layout and pages
- `app/(admin)/` – admin layout and pages
- `src/components/admin/` – Reusable UI components, use ShadCN only in admin panel
- `src/components/stroefront/` – Reusable UI components
- `src/lib/` – Utility functions, shared data access, Prisma client wrapper
- `prisma/` – Prisma schema and seed scripts
- `docs/` – Project documentation

## Route Structure

- `app/(storefront)/page.jsx` — storefront home
- `app/(storefront)/categories/page.jsx` — category listing
- `app/(storefront)/categories/[slug]/page.jsx` — category product listing
- `app/(storefront)/products/[slug]/page.jsx` — product detail
- `app/(storefront)/cart/page.jsx` — cart
- `app/(storefront)/checkout/page.jsx` — checkout with name, mobile, address, shipping_area, and delivery charge selection
- `app/(storefront)/thankyou/page.jsx` — order confirmation

- `app/(admin)/dashboard/page.jsx` — admin dashboard
- `app/(admin)/categories/page.jsx` — admin category management
- `app/(admin)/products/page.jsx` — admin product and variant management
- `app/(admin)/orders/page.jsx` — admin order management

## Rendering Strategy

- Storefront product and category pages use server components for data fetching and SEO.
- Cart, checkout, and variant selection use client components for interaction.
- Admin pages use server actions and client components for inline form behavior.
