import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '../../../../../src/lib/prisma';
import LoadMorePosts from '../../../../../src/components/storefront/LoadMorePosts';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://radiantpicks.com';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = await prisma.blogCategory.findUnique({ where: { slug } });

  if (!category || category.status !== 'publish') return {};

  const title = `${category.title} Articles | Radiant Picks Blog`;
  const description = `Read our latest ${category.title} articles at Radiant Picks Bangladesh. Shop online with cash on delivery across Bangladesh.`;

  return {
    title,
    description,
    alternates: { canonical: `/blogs/category/${category.slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `${SITE_URL}/blogs/category/${category.slug}`,
      siteName: 'Radiant Picks',
      images: category.image ? [{ url: category.image, width: 1200, height: 630, alt: category.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

const INITIAL_POSTS = 5;

async function getCategoryData(slug) {
  const category = await prisma.blogCategory.findUnique({
    where: { slug },
    include: { _count: { select: { posts: true } } },
  });

  if (!category || category.status !== 'publish') return null;

  const where = { categoryId: category.id, status: 'publish' };

  const [posts, total, categories, recentPosts] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: INITIAL_POSTS,
    }),
    prisma.blogPost.count({ where }),
    prisma.blogCategory.findMany({
      where: { status: 'publish' },
      include: { _count: { select: { posts: true } } },
      orderBy: { title: 'asc' },
    }),
    prisma.blogPost.findMany({
      where: { status: 'publish' },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  return {
    category: JSON.parse(JSON.stringify(category)),
    posts: JSON.parse(JSON.stringify(posts)),
    total,
    categories: JSON.parse(JSON.stringify(categories)),
    recentPosts: JSON.parse(JSON.stringify(recentPosts)),
  };
}

export default async function BlogCategoryPage({ params }) {
  const { slug } = await params;
  const data = await getCategoryData(slug);

  if (!data) return notFound();

  const { category, posts, total, categories, recentPosts } = data;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blogs` },
      { '@type': 'ListItem', position: 3, name: category.title, item: `${SITE_URL}/blogs/category/${category.slug}` },
    ],
  };

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.title} Articles`,
    description: `Read our latest ${category.title} articles at Radiant Picks Bangladesh.`,
    url: `${SITE_URL}/blogs/category/${category.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: total,
      itemListElement: posts.slice(0, 10).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}/blogs/${p.slug}`,
        name: p.title,
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
          <span className="text-slate-600 dark:text-slate-300">{category.title}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          {category.image && (
            <div className="mb-4 overflow-hidden rounded-xl">
              <img src={category.image} alt={category.title} className="h-48 w-full object-cover sm:h-64" />
            </div>
          )}
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{category.title}</h1>
          {category.authorName && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              By <span className="font-medium text-slate-700 dark:text-slate-300">{category.authorName}</span>
            </p>
          )}
          <p className="mt-1 text-slate-500 dark:text-slate-400">{total} article{total !== 1 ? 's' : ''}</p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main content */}
          <div className="min-w-0 flex-1">
            {total === 0 ? (
              <div className="py-16 text-center">
                <p className="text-slate-500">No posts in this category yet. Check back soon!</p>
              </div>
            ) : (
              <LoadMorePosts
                initialPosts={posts}
                total={total}
                perPage={INITIAL_POSTS}
                categoryId={category.id}
              />
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full shrink-0 lg:w-80" aria-label="Blog sidebar">
            <div className="space-y-8 lg:sticky lg:top-24">
              {/* Categories */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Categories</h2>
                <ul className="space-y-1.5">
                  <li>
                    <Link
                      href="/blogs"
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-400">All</span>
                        <span>All Posts</span>
                      </span>
                    </Link>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        href={`/blogs/category/${cat.slug}`}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                          cat.slug === slug ? 'bg-[#2f0f6b]/10 font-medium text-[#2f0f6b] dark:bg-[#a78bfa]/10 dark:text-[#a78bfa]' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          {cat.image ? (
                            <img src={cat.image} alt={cat.title} className="h-7 w-7 rounded-md object-cover" loading="lazy" />
                          ) : (
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-400">{cat.title.charAt(0).toUpperCase()}</span>
                          )}
                          <span>{cat.title}</span>
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-400">{cat._count?.posts ?? 0}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recent Posts */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Recent Posts</h2>
                <div className="space-y-4">
                  {recentPosts.map((post) => (
                    <Link key={post.id} href={`/blogs/${post.slug}`} className="group flex gap-3">
                      {post.bannerImage ? (
                        <img src={post.bannerImage} alt={post.title} className="h-16 w-16 shrink-0 rounded-lg object-cover" loading="lazy" />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-300 dark:bg-slate-700 dark:text-slate-500">
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 line-clamp-2 group-hover:text-[#2f0f6b] transition-colors dark:text-white dark:group-hover:text-[#a78bfa]">{post.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
