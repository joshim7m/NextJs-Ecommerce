import prisma from '../../../src/lib/prisma';
import ProductGrid from '../(home)/_partials/ProductGrid';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'New Arrivals — Fresh Styles Just In | Radiant Picks',
  description:
    'Browse the latest arrivals at Radiant Picks — the newest lingerie, bras, panties & nightwear fresh from our collection, with cash on delivery across Bangladesh.',
  alternates: { canonical: '/new-arrivals' },
};

export default async function NewArrivalsPage() {
  const products = await prisma.product.findMany({
    where: { status: 'publish' },
    orderBy: { createdAt: 'desc' },
    take: 30,
    include: { images: true, variants: true },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 sm:py-10">
      <nav className="mb-4 flex items-center gap-2 text-xs text-slate-400 sm:text-sm dark:text-slate-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-[#2f0f6b] transition-colors dark:hover:text-[#a78bfa]">Home</Link>
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-slate-600 dark:text-slate-300">New Arrivals</span>
      </nav>

      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">New Arrivals</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">The latest {products.length} products added to our collection.</p>
      </div>

      <ProductGrid products={JSON.parse(JSON.stringify(products))} columns={5} />
    </div>
  );
}
