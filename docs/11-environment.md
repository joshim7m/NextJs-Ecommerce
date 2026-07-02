# Local Environment & Setup

## Prerequisites
- Node.js (LTS)
- PostgreSQL (local or Docker)
- pnpm/npm/yarn

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Create `.env` from the example and set `DATABASE_URL`.

3. Run Prisma migrations and seed:

```bash
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
```

4. Start dev server:

```bash
npm run dev
```
