# Radiant Picks — Next.js eCommerce

A full-stack e-commerce application built for the Bangladeshi market with Next.js App Router, Prisma + PostgreSQL, and Tailwind CSS. Includes a customer-facing storefront and an admin management panel in a single project.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Database:** PostgreSQL via Prisma 5.12
- **Styling:** Tailwind CSS 3.4
- **Auth:** JWT (`jose`) + `bcryptjs`
- **Rich Text:** Tiptap v3 (blog posts)
- **Currency:** Bangladeshi Taka (BDT) only

## Features

### Storefront
- Homepage with configurable hero slider, category sidebar, product grid with sorting
- Product pages with image gallery, size/color variant selection, related products
- Category browsing with parent-child hierarchy
- Search overlay (Cmd+K) with debounced API search
- localStorage-based cart with slide-out drawer
- Checkout with BD phone validation, delivery charge selection (Inside Dhaka: 50 / Outside Dhaka: 120 taka)
- Blog with category filtering, infinite scroll, and injected advertisements
- Dark mode toggle with system preference detection
- Wishlist, announcement bar, responsive mobile layout

### Admin Panel
- Dashboard with stats cards and recent orders
- Full CRUD for products (with variants, multi-image, category assignment)
- Category management with hierarchical structure
- Order management with status tracking and search
- Blog management: categories, posts (Tiptap editor), advertisements
- Settings: site info, hero sliders, social links
- JWT-authenticated login with httpOnly cookie

## Project Structure

```
app/
├── (storefront)/          # Customer-facing pages
│   ├── (home)/            # Homepage
│   ├── products/          # Product listing & detail
│   ├── categories/        # Category listing & detail
│   ├── cart/              # Cart page
│   ├── checkout/          # Checkout flow
│   ├── blog/              # Blog listing & posts
│   └── thankyou/          # Order confirmation
├── admin/                 # Admin panel
│   ├── dashboard/
│   ├── products/
│   ├── categories/
│   ├── orders/
│   ├── blog/
│   └── settings/
└── api/                   # API routes

src/
├── lib/                   # Prisma client, auth, cart/wishlist storage
├── actions/               # Server actions (products, categories, orders, blog)
└── components/            # Reusable UI (Header, Footer, CartDrawer, TipTapEditor, etc.)

prisma/
├── schema.prisma          # 13 models
└── seed.js                # Web scraper seed (scrapes eghuri.com)
```

## Database Models

| Model | Purpose |
|---|---|
| Category | Hierarchical product categories (parent/child) |
| Product | Products with title, slug, SKU, pricing, status |
| ProductImage | Multiple images per product |
| ProductVariant | Size/color variants with individual pricing |
| User | Admin users with hashed passwords |
| Order / OrderDetails / OrderItem | Order management with shipping info |
| SiteSetting | Singleton site configuration |
| HeroSlider / SocialLink | Homepage hero carousel and social links |
| BlogCategory / BlogPost | Blog system with rich text content |
| Advertisement / BlogPostAdvertisement | Blog ad injection |

## Local Setup

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment**

Create `.env` with your database connection:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

3. **Run database setup**

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

4. **Start development server**

```bash
npm run dev
```

The app will be available at `http://localhost:3000`. Admin panel at `http://localhost:3000/admin/login`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run seed` | Seed database (scrapes product data) |


npx prisma migrate reset --force
npx prisma migrate dev --name add_quantity
npx prisma db seed

npx prisma migrate reset --force --skip-seed

npx prisma migrate deploy

node prisma/seed-blog.js