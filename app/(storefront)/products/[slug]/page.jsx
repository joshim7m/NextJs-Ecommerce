import prisma from '../../../../src/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductDetailClient from '../../../../src/components/storefront/ProductDetailClient';

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: true, variants: true, categories: true },
  });

  if (!product) return notFound();

  const category = product.categories?.[0] || null;

  const related = category
    ? await prisma.product.findMany({
        where: {
          status: 'publish',
          categories: { some: { id: category.id } },
          id: { not: product.id },
        },
        include: { images: true, variants: true },
        take: 4,
        orderBy: { createdAt: 'desc' },
      })
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 sm:py-10">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-slate-400 sm:text-sm">
        <Link href="/" className="hover:text-[#2f0f6b] transition-colors">Home</Link>
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {category ? (
          <>
            <Link href={`/categories/${category.slug}`} className="hover:text-[#2f0f6b] transition-colors">
              {category.name}
            </Link>
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </>
        ) : null}
        <span className="text-slate-600 truncate max-w-[200px] sm:max-w-xs">{product.title}</span>
      </nav>

      <ProductDetailClient
        product={JSON.parse(JSON.stringify(product))}
        related={JSON.parse(JSON.stringify(related))}
      />
    </div>
  );
}
