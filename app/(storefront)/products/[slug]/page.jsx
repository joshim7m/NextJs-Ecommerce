import prisma from '../../../../src/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductDetailClient from '../../../../src/components/storefront/ProductDetailClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://radiantpicks.com';

async function getProduct(slug) {
  return prisma.product.findUnique({
    where: { slug },
    include: { images: true, variants: true, categories: true },
  });
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};

  const category = product.categories?.[0]?.name || '';
  const price = Number(product.sale_price || product.unite_price).toLocaleString();
  const title = product.title;
  const description =
    product.metaDescription ||
    ((product.description || `Buy ${product.title} online at Radiant Picks.`) +
    ` ৳${price} — Shop now with cash on delivery across Bangladesh. ${category ? `Category: ${category}.` : ''}`);

  const keywords = product.tags
    ? product.tags.split(',').map(k => k.trim()).filter(Boolean)
    : [product.title, category, 'lingerie Bangladesh', 'buy online BD', 'radiant picks'].filter(Boolean);

  const imageUrl = product.images?.[0]?.image_path || `${SITE_URL}/api/og?title=${encodeURIComponent(product.title)}&subtitle=${encodeURIComponent(`৳${price} — Shop now at Radiant Picks`)}&type=product&price=${encodeURIComponent(price)}`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `/products/${slug}`,
    },
    openGraph: {
      type: 'website',
      locale: 'en_BD',
      url: `${SITE_URL}/products/${slug}`,
      siteName: 'Radiant Picks',
      title: `${product.title} — Radiant Picks`,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} — Radiant Picks`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

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
        take: 10,
        orderBy: { createdAt: 'desc' },
      })
    : [];

  const price = Number(product.sale_price || product.unite_price);
  const imageUrl = product.images?.[0]?.image_path || `${SITE_URL}/og-image.png`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || `Buy ${product.title} at Radiant Picks`,
    image: imageUrl,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'Radiant Picks',
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${slug}`,
      priceCurrency: 'BDT',
      price,
      availability: product.variants?.length
        ? 'https://schema.org/InStock'
        : product.quantity > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Radiant Picks',
      },
    },
    category: category?.name || undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 sm:py-10">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-slate-400 sm:text-sm dark:text-slate-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#2f0f6b] transition-colors dark:hover:text-[#a78bfa]">Home</Link>
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {category ? (
            <>
              <Link href={`/categories/${category.slug}`} className="hover:text-[#2f0f6b] transition-colors dark:hover:text-[#a78bfa]">
                {category.name}
              </Link>
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          ) : null}
          <span className="text-slate-600 truncate max-w-[160px] sm:max-w-xs dark:text-slate-300">{product.title}</span>
        </nav>

        <ProductDetailClient
          product={JSON.parse(JSON.stringify(product))}
          related={JSON.parse(JSON.stringify(related))}
        />
      </div>
    </>
  );
}
