import prisma from '../../../src/lib/prisma';
import Hero from './_partials/Hero';
import FilterSidebar from './_partials/FilterSidebar';
import MobileCategoryChips from './_partials/MobileCategoryChips';
import ProductGrid from './_partials/ProductGrid';
import SortBar from './_partials/SortBar';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://radiantpicks.com';

const SORT_MAP = {
  latest: { createdAt: 'desc' },
  oldest: { createdAt: 'asc' },
  price_asc: { unite_price: 'asc' },
  price_desc: { unite_price: 'desc' },
};

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const categorySlug = params.category || null;

  let category = null;
  if (categorySlug) {
    category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  }

  const title = category
    ? `${category.name} — Shop Online at Radiant Picks Bangladesh`
    : "Radiant Picks — Shop Lingerie, Bras, Panties & Nightwear Online in Bangladesh";

  const description = category
    ? `Browse our collection of ${category.name} at Radiant Picks. ` +
      `Shop online with cash on delivery across Bangladesh — Dhaka, Chittagong, Sylhet & nationwide. ` +
      `Premium quality, discreet packaging, and sizes that fit every body.`
    : "Discover Radiant Picks — Bangladesh's favourite online destination for lingerie, bras, panties, nightwear, and women's intimate apparel. " +
      "Cash on delivery, discreet packaging, and free shipping options available across Dhaka, Chittagong, Sylhet, and all of Bangladesh.";

  return {
    title,
    description,
    alternates: { canonical: category ? `/categories/${category.slug}` : '/' },
    openGraph: {
      title,
      description,
      url: category ? `${SITE_URL}/categories/${category.slug}` : SITE_URL,
      images: [{ url: `${SITE_URL}/api/og?title=${encodeURIComponent(category ? category.name : 'Radiant Picks')}&subtitle=${encodeURIComponent(description.slice(0, 120))}&type=${category ? 'category' : 'website'}`, width: 1200, height: 630, alt: title }],
    },
    twitter: { title, description, images: [`${SITE_URL}/api/og?title=${encodeURIComponent(category ? category.name : 'Radiant Picks')}&subtitle=${encodeURIComponent(description.slice(0, 120))}&type=${category ? 'category' : 'website'}`] },
  };
}

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const categorySlug = params.category || null;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : null;
  const sort = SORT_MAP[params.sort] || SORT_MAP.latest;

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
    orderBy: sort,
  });

  const parentCats = categories.filter((c) => !c.parentId);
  const category = categorySlug ? categories.find((c) => c.slug === categorySlug) : null;
  const serialized = JSON.parse(JSON.stringify(products));

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: categorySlug
      ? `${category?.name || 'Category'} Products — Radiant Picks`
      : 'Radiant Picks — Lingerie, Bras, Panties & Nightwear Online Bangladesh',
    numberOfItems: products.length,
    itemListElement: products.slice(0, 20).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/products/${p.slug}`,
      name: p.title,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 sm:py-6">
        <Hero slides={heroSlides} />

        <MobileCategoryChips parentCats={parentCats} />

        <div className="mt-4 flex flex-col gap-4 sm:mt-8 sm:gap-6 lg:flex-row">
          <FilterSidebar categories={categories} />
          <div className="flex-1">
            <SortBar productCount={products.length} />
            <ProductGrid products={serialized} />
          </div>
        </div>
      </div>
    </>
  );
}
