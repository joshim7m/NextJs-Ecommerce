# AI Workflow Rules

These rules govern the behavior and constraints for the AI agent working on this Next.js ecommerce project.

## Project Context
- **Project:** Cabinet Closet (clone) — a Next.js ecommerce application with storefront and admin panel
- **Stack:** Next.js (App Router), TailwindCSS, Prisma ORM, PostgreSQL
- **Regional Focus:** Bangladesh, BDT currency, Dhaka/non-Dhaka shipping options
- **MVP Scope:** Dummy product data, no payment integration yet

## AI Agent Rules

### 1. Code Quality & Standards
- Always use JSX for all components (except ShadCN UI which is admin-only)
- Follow the existing folder structure: `app/`, `src/components/`, `src/lib/`, `prisma/`
- Use server components for data fetching and SEO in storefront pages
- Use client components for interactive features (cart, checkout, variant selection)
- Use server actions for admin mutations

### 2. Component Development
- Storefront components: Plain React, CSS-in-JS via Tailwind utility classes
- Admin components: Can use ShadCN UI from the component library
- Create reusable atomic components in `src/components/storefront/` and `src/components/admin/`
- Always export default for page components

### 3. Database & Schema
- Follow the Prisma schema defined in `data-model.md`
- Always use Prisma migrations for schema changes: `prisma migrate dev --name [description]`
- Never manually edit the database schema
- Seed data only through `prisma/seed.js`

### 4. Regional Compliance
- Always use BDT (Bangladeshi Taka) as the sole currency
- Implement checkout fields: name, mobile, address, shipping_area, delivery charge
- Delivery charges: inside Dhaka = 50 BDT, outside Dhaka = 120 BDT
- Display prices in BDT format

### 5. Variant & Pricing Logic
- If a product has variants, show variant selector and variant-specific prices
- If no variants, show base product price (Unit_price or sale_price if available)
- Display discount amount: `price - sale_price`
- Display discount percent: `((price - sale_price) / price) * 100`

### 6. State Management
- Cart state: React Context, persisted to localStorage, synced with server
- Use client components for form interactions
- Keep state localized; avoid global Redux unless necessary

### 7. Images & Media
- Use Next.js Image component for optimization
- Support remote URLs for MVP
- Variant-specific images via ProductVariant.imageId

### 8. Admin Panel
- Require session-based authentication
- Check role (admin/editor) before allowing access
- Implement CRUD for categories, products/variants, and orders
- Use data tables with inline actions (edit, delete)

### 9. Testing & Deployment
- Use Jest + React Testing Library for unit/component tests
- Critical flows: browse, add-to-cart, admin CRUD
- Ensure lint and type-check pass before deployment

### 10. Documentation
- Update `docs/progress-tracker.md` after each session
- Maintain `docs/` with accurate, up-to-date information
- Add architecture decisions to relevant docs as features are built

## Constraints
- Do not modify regional requirements (BDT, delivery charges)
- Do not add third-party payment integration without explicit approval
- Do not use authenticated endpoints without session validation
- Do not create duplicate code; reuse components
- Do not install dependencies without justification