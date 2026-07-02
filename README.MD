# Ecommerce Site Project Plan

This workspace contains a Next.js + Prisma + PostgreSQL + TailwindCSS starter for a two-part ecommerce application:

- Frontend storefront for customers
- Admin panel for catalog management

## first step

The project has been scaffolded successfully with:

- Next.js (App Router)
- TypeScript
- TailwindCSS
- Prisma
- PostgreSQL-ready schema setup

## need to  set up

- A fresh Next.js app in the workspace root
- Prisma initialized with a PostgreSQL datasource
- Basic app shell under src/app

## What still needs to be implemented

1. Prisma schema for ecommerce entities
   - Category
   - Product
   - ProductImage
   - Order (optional early stage)
   - User/Admin account (optional early stage)

2. Seed data for dummy products and categories
   - Use a sample catalog inspired by the reference store
   - Include product names, descriptions, prices, and images

3. Frontend pages
   - Home page
   - Product listing page
   - Product detail page
   - Cart or order flow (optional first version)

4. Admin panel
   - Dashboard page
   - Category CRUD
   - Product CRUD
   - Basic form UI for managing products

5. Database connection
   - Configure DATABASE_URL in the environment file
   - Run Prisma migrations
   - Generate Prisma client

## Environment Setup Instructions

Create or update the .env file with a PostgreSQL connection string:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

## Prisma Commands to Use Later

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

## Development Commands

```bash
npm run dev
```

## Suggested Next Implementation Order

1. Define the Prisma schema
2. Create the seed script
3. Build the storefront homepage and product listing
4. Add product detail pages
5. Build admin category and product management screens
6. Connect everything to Prisma queries

## Notes

The reference site at https://cabinet-closet.pathao.shop was used as inspiration for product style and catalog structure. The initial content should be dummy data only until the full admin workflow is implemented.

## Hand-off Summary

If you want to continue later, the next step should be:

- add the Prisma models
- create seed data
- build the first working storefront UI

If you want, the next session can continue directly from this point and implement the full ecommerce foundation.

