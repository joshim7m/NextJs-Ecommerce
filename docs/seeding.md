# Seeding Strategy

## Goals
- Provide realistic dummy data for development and QA: categories, 30–50 products, images, and an admin user.

## Approach
- Create `prisma/seed.ts` that uses Prisma Client to upsert categories and products.
- Use local placeholder images or remote sample URLs for product images.

## Sample Seed Outline

1. Upsert categories with slugs
2. For each category, generate several products with prices, sale prices, images, and variants
3. Create an admin user with a hashed password
4. Create one or more customer accounts with user details and shipping addresses
5. Create sample orders with order details and order items

Run with:

```bash
npx prisma db seed
```
