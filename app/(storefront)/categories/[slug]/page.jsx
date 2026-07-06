import prisma from '../../../../src/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import FilterSidebar from '../../(home)/_partials/FilterSidebar';
import ProductGrid from '../../(home)/_partials/ProductGrid';

export default async function CategoryProductsPage({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const maxPrice = sp.maxPrice ? Number(sp.maxPrice) : null;

  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) return notFound();

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } }, children: { include: { _count: { select: { products: true } } } } },
    orderBy: { name: 'asc' },
  });

  const where = { status: 'publish', categories: { some: { slug } } };
  if (maxPrice) {
    where.unite_price = { lte: maxPrice };
  }

  const products = await prisma.product.findMany({
    where,
    include: { images: true, variants: true },
    orderBy: { createdAt: 'desc' },
  });

  const serialized = JSON.parse(JSON.stringify(products));

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 sm:py-12">
      <div className="relative mb-6 aspect-[3/2] overflow-hidden rounded-2xl bg-slate-200 sm:mb-8 sm:aspect-[4/1]">
        <picture>
          <source media="(min-width: 640px)" srcSet={`https://picsum.photos/seed/${slug}-banner/1400/350`} />
          <img src={`https://picsum.photos/seed/${slug}-banner/600/400`} alt="" className="h-full w-full object-cover" />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10">
          <Link href="/categories" className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm hover:bg-white/30 transition sm:text-xs">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All Categories
          </Link>
          <h1 className="text-2xl font-bold text-white drop-shadow-lg sm:text-4xl">{category.name}</h1>
          {category.description && (
            <p className="mt-1 text-sm text-white/80 sm:text-base">{category.description}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <FilterSidebar categories={categories} />
        <div className="flex-1">
          <p className="mb-4 text-sm text-slate-400">{products.length} {products.length === 1 ? 'product' : 'products'}</p>
          <ProductGrid products={serialized} />
        </div>
      </div>
    </section>
  );
}
