# NextJs eCommerce website 

A single Next.js ecommerce application for Bangladeshi customers and sellers

## Project Summary

- Single Next.js App Router project with separate `/(storefront)` and `/(admin)` route groups
- Storefront: product browsing, category listing, product detail, cart, and checkout
- Admin panel: category, product, variant, and order management
- Data layer: Prisma + PostgreSQL
- Styling: TailwindCSS with ShadCN UI only in the admin panel
- Currency: Bangladeshi Taka (BDT) only

## What This App Supports

- Product variant selection for size/color
- Variant-specific pricing, sale price, and discount calculation
- Guest or customer checkout with shipping details
- Bangladesh delivery charges:
  - inside Dhaka: 50 taka
  - outside Dhaka: 120 taka
- Order tracking in the admin panel
- One project, not two separate applications

## App Structure

- `app/(storefront)/` — storefront pages and layout
- `app/(admin)/` — admin pages and layout
- `src/components/` — reusable UI components
- `src/lib/` — shared helpers and Prisma access
- `prisma/` — Prisma schema and seed scripts
- `docs/` — project documentation

## Current Requirements

- Checkout form fields: `name`, `mobile`, `address`, `shipping_area`
- Delivery charge selection with radio buttons
- No USD or other currencies; use only Taka
- Admin can create products, variants, categories, and orders

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from a template and set your database connection:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

3. Run Prisma setup:

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

4. Start the app:

```bash
npm run dev
```

## Development Notes

- Use `.jsx` for all Next.js files in the app router
- Admin UI components may use ShadCN UI
- Storefront UI should remain lightweight and mobile-friendly
- Cart state can be stored in local storage and synced with backend order creation

## Useful Commands

```bash
npm run dev
npm run build
npm run start
```

## Documentation

See the `docs/` folder for detailed design, architecture, data model, routing, seeding, and deployment guidance.

## Next Steps

1. Define Prisma schema and seed data
2. Build storefront skeleton and pages
3. Implement product variants and checkout flow
4. Build admin CRUD screens and order management
5. Run tests and prepare for deployment

