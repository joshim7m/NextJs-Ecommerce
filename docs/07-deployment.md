# Deployment

## Environment Variables
- `DATABASE_URL` — Postgres connection string
- `NEXTAUTH_SECRET` — secret for auth
- `NEXT_PUBLIC_BASE_URL` — public site URL

## Recommended Hosting
- Frontend: Vercel (recommended) or Netlify
- Database: Managed Postgres (Supabase, Render, Neon)

## Deployment Steps (short)
1. Configure environment variables in hosting provider
2. Run `npx prisma migrate deploy` on production DB
3. Deploy the Next.js app via provider (Vercel auto-deploy from GitHub)
