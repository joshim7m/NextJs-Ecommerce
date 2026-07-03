import prisma from '../../../src/lib/prisma';
import Link from 'next/link';

export default async function CategoryListingPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 sm:py-12">
      <div className="relative mb-10 aspect-[3/2] overflow-hidden rounded-2xl bg-slate-200 sm:aspect-[4/1]">
        <picture>
          <source media="(min-width: 640px)" srcSet="https://picsum.photos/seed/categories-banner/1400/350" />
          <img src="https://picsum.photos/seed/categories-banner/600/400" alt="" className="h-full w-full object-cover" />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10">
          <h1 className="text-2xl font-bold text-white drop-shadow-lg sm:text-4xl">Categories</h1>
          <p className="mt-1 text-sm text-white/80 sm:text-base">{categories.length} product categories</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {categories.map((category) => {
          const imgSrc = category.image || `https://picsum.photos/seed/${category.name.replace(/\s+/g, '').toLowerCase()}/400/400`;
          return (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#2f0f6b] focus:ring-offset-2"
            >
              <div className="mb-3 aspect-square w-full overflow-hidden rounded-xl bg-slate-100">
                <img
                  src={imgSrc}
                  alt={category.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="w-full text-center">
                <h2 className="text-sm font-semibold text-slate-900 group-hover:text-[#2f0f6b] transition-colors line-clamp-2">
                  {category.name}
                </h2>
                <span className="mt-1 inline-flex items-center justify-center h-5 rounded-full bg-[#2f0f6b]/10 px-2 text-[10px] font-semibold text-[#2f0f6b]">
                  {category._count.products}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-500">No categories available yet.</p>
        </div>
      )}
    </section>
  );
}
