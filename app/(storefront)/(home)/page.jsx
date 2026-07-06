import prisma from '../../../src/lib/prisma';
import Hero from './_partials/Hero';
import FilterSidebar from './_partials/FilterSidebar';
import ProductGrid from './_partials/ProductGrid';

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const categorySlug = params.category || null;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : null;

  const [categories, heroSlides] = await Promise.all([
    prisma.category.findMany({
      include: { _count: { select: { products: true } }, children: { include: { _count: { select: { products: true } } } } },
      orderBy: { name: 'asc' },
    }),
    prisma.heroSlider.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    }),
  ]);

  const where = { status: 'publish' };
  if (categorySlug) {
    where.categories = { some: { slug: categorySlug } };
  }
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
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 sm:py-6">
      <Hero slides={heroSlides} />

      <div className="mt-4 flex flex-col gap-4 sm:mt-8 sm:gap-6 lg:flex-row">
        <FilterSidebar categories={categories} />
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between sm:mb-6">
            <p className="text-sm text-slate-500">
              {products.length} {products.length === 1 ? 'product' : 'products'}
            </p>
          </div>
          <ProductGrid products={serialized} />
        </div>
      </div>
    </div>
  );
}
