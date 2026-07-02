# Project Overview

- **Name:** Cabinet Closet (clone), (https://cabinet-closet.pathao.shop)
- **Purpose:** Build a single Next.js ecommerce application with a customer storefront and an admin panel for catalog, variant, and order management, matching the reference site style.
- **Primary stack:** Next.js (App Router), TailwindCSS, Prisma, PostgreSQL. Use JSX everywhere and ShadCN UI only in the admin panel.
- **MVP constraints:** Dummy product data initially; payment integration and full order management deferred to later phases.

This repository will house the storefront and admin panel in one Next.js project. The product emphasizes fast discovery, responsive product detail pages with variant selection and pricing, and a simple admin CRUD workflow.

## Goals
- Browse categories and products
- Product pages with image gallery, variant selection, and accurate pricing
- Add-to-cart with variant support and persisted cart session
- Guest or customer checkout flow with shipping details and Bangladesh-specific delivery charge options
- Admin UI for product, variant, category, and order management
- SEO-friendly pages and basic monitoring on deployment

## Deliverables
- Prisma schema and seed scripts
- Storefront pages (`app/(storefront)/`) for home, categories, products, cart, and checkout
- Admin panel (`app/(admin)/`) for categories, products/variants, and orders
- Deployment-ready configuration for production hosting

## Regional Focus
- This application is designed for Bangladeshi customers and sellers.
- Currency is always Bangladeshi Taka (BDT); do not support USD or other currencies.
- Checkout includes fields: name, mobile, address, shipping_area, and delivery charge selection.
- Delivery charge options: inside Dhaka = 50 taka, outside Dhaka = 120 taka.
