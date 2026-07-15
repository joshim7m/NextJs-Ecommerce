import Link from 'next/link';
import prisma from '../../../../src/lib/prisma';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://radiantpicks.com';

export const metadata = {
  title: 'Blog Categories | Radiant Picks — Browse All Topics',
  description: 'Browse all blog categories at Radiant Picks Bangladesh. Find articles about lingerie, fashion, styling tips, nightwear, and more.',
  alternates: { canonical: '/blogs/categories' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    title: 'Blog Categories | Radiant Picks',
    description: 'Browse all blog categories at Radiant Picks Bangladesh. Find articles about lingerie, fashion, styling tips, and more.',
    url: `${SITE_URL}/blogs/categories`,
    siteName: 'Radiant Picks',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog Categories | Radiant Picks',
    description: 'Browse all blog categories at Radiant Picks Bangladesh. Find articles about lingerie, fashion, styling tips, and more.',
  },
};

async function getCategories() {
  const categories = await prisma.blogCategory.findMany({
    where: { status: 'publish' },
    include: {
      _count: { select: { posts: true } },
      posts: {
        where: { status: 'publish' },
        take: 1,
        orderBy: { createdAt: 'desc' },
        select: { bannerImage: true, title: true },
      },
    },
    orderBy: { title: 'asc' },
  });

  return JSON.parse(JSON.stringify(categories));
}

export default async function BlogCategoriesPage() {
  const categories = await getCategories();

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blogs` },
      { '@type': 'ListItem', position: 3, name: 'Categories', item: `${SITE_URL}/blogs/categories` },
    ],
  };

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Blog Categories',
    description: 'Browse all blog categories at Radiant Picks Bangladesh.',
    url: `${SITE_URL}/blogs/categories`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: categories.length,
      itemListElement: categories.map((cat, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}/blogs/category/${cat.slug}`,
        name: cat.title,
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-slate-400" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#2f0f6b] dark:hover:text-[#a78bfa] transition-colors">Home</Link>
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <Link href="/blogs" className="hover:text-[#2f0f6b] dark:hover:text-[#a78bfa] transition-colors">Blog</Link>
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-slate-600 dark:text-slate-300">Categories</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Blog Categories</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Browse articles by topic</p>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-500">No categories yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/blogs/category/${cat.slug}`}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 dark:border-slate-700 dark:bg-slate-800"
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
                  {cat.posts?.[0]?.bannerImage ? (
                    <img
                      src={cat.posts[0].bannerImage}
                      alt={`${cat.title} articles`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <svg className="h-16 w-16 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                  )}
                  {/* Post count badge */}
                  <span className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm dark:bg-slate-800/90 dark:text-slate-200">
                    {cat._count?.posts ?? 0} post{cat._count?.posts !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-slate-900 group-hover:text-[#2f0f6b] transition-colors dark:text-white dark:group-hover:text-[#a78bfa]">
                    {cat.title}
                  </h2>
                  {cat.authorName && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      By <span className="font-medium text-slate-700 dark:text-slate-300">{cat.authorName}</span>
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-1.5 text-sm font-medium text-[#2f0f6b] dark:text-[#a78bfa]">
                    View articles
                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
