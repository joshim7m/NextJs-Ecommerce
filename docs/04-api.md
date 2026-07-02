# Data Access & Route Organization

This file describes data access patterns and route organization within a single Next.js project. The storefront and admin surfaces live under separate app route groups and can use shared server functions for database access.

## Server Patterns
- Use the Next.js App Router and server components for page-level data loading.
- Use server actions and shared utility functions for create/update/delete operations.
- Share Prisma access code through `src/lib/` or `app/lib/`.

## Route Organization
- Storefront pages under `app/storefront/` or `app/(storefront)/`
  - `app/storefront/page.jsx` — home
  - `app/storefront/categories/page.jsx` — category listing
  - `app/storefront/categories/[slug]/page.jsx` — category product listing
  - `app/storefront/products/[slug]/page.jsx` — product detail
  - `app/storefront/cart/page.jsx` — cart
  - `app/storefront/checkout/page.jsx` — checkout
  - `app/storefront/thankyou/page.jsx` — checkout

- Admin pages under `app/admin/` or `app/(admin)/`
  - `app/admin/dashboard/page.jsx`
  - `app/admin/categories/page.jsx` // categories/create.jsx, edit.jsx
  - `app/admin/products/page.jsx` // product/create.jsx, edit.jsx
  - `app/admin/orders/page.jsx` // order/create.jsx, edit.jsx

## Cart and Checkout
- Cart operations can be implemented with client components and server actions in storefront pages.
- Checkout is handled via server actions that create orders and order items in the database.
- Checkout form fields should include: name, mobile, address, shipping_area, and delivery charge radio options.
- Delivery charge options are Bangladesh-specific: inside Dhaka = 50 taka, outside Dhaka = 120 taka.
- The application uses Bangladeshi Taka (BDT) exclusively.

## Admin Data Operations
- Admin pages perform product, variant, category, and order management through server actions, in separated page, like products/create, product/edit, ...
- Protect admin pages with server-side session checks and role validation.

## Authentication
- Use NextAuth or a custom server session strategy for admin authentication.
- Protect admin pages and admin actions by verifying session and admin role.
- Customer account registration can be optional; support guest checkout with shipping details.
