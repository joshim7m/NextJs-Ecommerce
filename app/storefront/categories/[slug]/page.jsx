import prisma from '../../../../src/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function CategoryProductsPage({ params }) {
  const { slug } = params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        include: {
          images: true,
          variants: true,
        },
      },
    },
  });

  if (!category) return notFound();

  return (
    <section className="container py-16">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Category</p>
            <h1 className="text-4xl font-bold text-slate-900">{category.name}</h1>
            <p className="mt-2 text-slate-600">{category.description || 'Browse products in this category.'}</p>
          </div>
          <Link href="/storefront/categories" className="text-sm text-slate-700 hover:text-slate-900">
            Back to categories
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {category.products.map((product) => (
            <Link key={product.id} href={`/storefront/products/${product.slug}`} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-3xl bg-slate-100">
                {product.images?.[0]?.image_path ? (
                  <img
                    src={product.images[0].image_path}
                    alt={product.images[0].altText || product.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">No image</div>
                )}
              </div>
              <div className="mt-4">
                <h2 className="text-xl font-semibold text-slate-900">{product.title}</h2>
                <p className="mt-2 text-sm text-slate-500">৳ {product.sale_price ?? product.unite_price}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
