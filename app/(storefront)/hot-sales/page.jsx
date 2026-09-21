import prisma from '../../../src/lib/prisma';
import ProductGrid from '../(home)/_partials/ProductGrid';
import Link from 'next/link';

export const metadata = {
  title: 'Hot Sales — Featured Products | Radiant Picks',
  description:
    'Shop our hot-selling featured products at Radiant Picks — the most-loved lingerie, bras, panties & nightwear picked by our customers, with cash on delivery across Bangladesh.',
  alternates: { canonical: '/hot-sales' },
};

export default async function HotSalesPage() {
  const products = await prisma.product.findMany({
    where: { status: 'publish', isFeatured: true },
    orderBy: { createdAt: 'desc' },
    include: { images: true, variants: true },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 sm:py-10">
      <nav className="mb-4 flex items-center gap-2 text-xs text-slate-400 sm:text-sm dark:text-slate-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-[#2f0f6b] transition-colors dark:hover:text-[#a78bfa]">Home</Link>
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-slate-600 dark:text-slate-300">Hot Sales</span>
      </nav>

      <div className="mb-6 sm:mb-8">
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
          Hot Sales
          <svg className="h-5 w-5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6L12 2z" />
          </svg>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">All our featured best-sellers in one place.</p>
      </div>

      <ProductGrid products={JSON.parse(JSON.stringify(products))} columns={5} />
    </div>
  );
}
