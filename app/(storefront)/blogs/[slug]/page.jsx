import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '../../../../src/lib/prisma';
import { injectAdsIntoContent } from '../../../../src/lib/blog-ads';
import AdCard from '../../../../src/components/storefront/AdCard';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://radiantpicks.com';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!post || post.status !== 'publish') return {};

  const description = post.metaDescription || post.content.replace(/<[^>]+>/g, '').slice(0, 160);
  const imageUrl = post.bannerImage || `${SITE_URL}/api/og?title=${encodeURIComponent(post.title)}&type=website`;

  return {
    title: `${post.title} | Radiant Picks Blog`,
    description,
    keywords: post.tags || undefined,
    alternates: { canonical: `/blogs/${post.slug}` },
    robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url: `${SITE_URL}/blogs/${post.slug}`,
      siteName: 'Radiant Picks',
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: post.category?.authorName ? [post.category.authorName] : undefined,
      section: post.category?.title,
      tags: post.tags ? post.tags.split(',').map((t) => t.trim()) : undefined,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [imageUrl],
      creator: '@radiantpicks',
    },
  };
}

async function getPost(slug) {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      category: true,
      advertisements: { include: { advertisement: true } },
    },
  });

  if (!post || post.status !== 'publish') return null;

  const [related, allPublished] = await Promise.all([
    prisma.blogPost.findMany({
      where: { status: 'publish', categoryId: post.categoryId, id: { not: post.id } },
      include: { category: true },
      take: 3,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.blogPost.findMany({
      where: { status: 'publish', id: { not: post.id }, categoryId: { not: post.categoryId } },
      take: 2,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const morePosts = related.length >= 3 ? related : [...related, ...allPublished].slice(0, 3);

  const ads = post.advertisements.map((pa) => pa.advertisement).filter(Boolean);
  const contentWithAds = injectAdsIntoContent(post.content, ads);

  const wordCount = post.content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil((wordCount / 200)));

  return {
    post: JSON.parse(JSON.stringify(post)),
    related: JSON.parse(JSON.stringify(morePosts)),
    ads: JSON.parse(JSON.stringify(ads)),
    contentWithAds,
    readingTime,
    wordCount,
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const data = await getPost(slug);

  if (!data) return notFound();

  const { post, related, ads, contentWithAds, readingTime, wordCount } = data;
  const date = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const modifiedDate = new Date(post.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDescription || post.content.replace(/<[^>]+>/g, '').slice(0, 160),
    image: post.bannerImage,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: post.category?.authorName ? {
      '@type': 'Person',
      name: post.category.authorName,
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Radiant Picks',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blogs/${post.slug}`,
    },
    wordCount,
    articleSection: post.category?.title,
    keywords: post.tags || undefined,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blogs` },
      ...(post.category ? [{ '@type': 'ListItem', position: 3, name: post.category.title, item: `${SITE_URL}/blogs/category/${post.category.slug}` }] : []),
      { '@type': 'ListItem', position: post.category ? 4 : 3, name: post.title, item: `${SITE_URL}/blogs/${post.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <article itemScope itemType="https://schema.org/BlogPosting">
        {/* Breadcrumb */}
        <div className="border-b border-slate-100 bg-white/80 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80">
          <nav className="mx-auto flex max-w-4xl items-center gap-2 px-4 py-3 text-xs text-slate-400 sm:px-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#2f0f6b] dark:hover:text-[#a78bfa] transition-colors">Home</Link>
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <Link href="/blogs" className="hover:text-[#2f0f6b] dark:hover:text-[#a78bfa] transition-colors">Blog</Link>
            {post.category && (
              <>
                <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                <Link href={`/blogs/category/${post.category.slug}`} className="hover:text-[#2f0f6b] dark:hover:text-[#a78bfa] transition-colors">{post.category.title}</Link>
              </>
            )}
            <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="truncate text-slate-500 dark:text-slate-400" itemProp="headline">{post.title}</span>
          </nav>
        </div>

        <div className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 sm:pb-16">
          {/* Banner */}
          {post.bannerImage && (
            <div className="mb-8 overflow-hidden rounded-xl shadow-sm dark:shadow-slate-800/50">
              <img src={post.bannerImage} alt={post.title} className="w-full h-[220px] sm:h-[400px] object-cover" itemProp="image" />
            </div>
          )}

          {/* Header */}
          <header className="mb-8 sm:mb-10">
            <div className="flex items-center gap-3 mb-4">
              {post.category && (
                <Link
                  href={`/blogs/category/${post.category.slug}`}
                  className="inline-block rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-3.5 py-1 text-xs font-semibold text-white shadow-sm hover:shadow-md transition"
                  itemProp="articleSection"
                >{post.category.title}</Link>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight sm:text-4xl sm:leading-tight" itemProp="headline">{post.title}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              {post.category?.authorName && (
                <span className="inline-flex items-center gap-2" itemProp="author" itemScope itemType="https://schema.org/Person">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 text-sm font-bold text-white shadow-sm">
                    {post.category.authorName.charAt(0).toUpperCase()}
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-300" itemProp="name">{post.category.authorName}</span>
                </span>
              )}
              <time dateTime={post.createdAt} className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400" itemProp="datePublished">
                <svg className="h-4 w-4 text-violet-500 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {date}
              </time>
              <meta itemProp="dateModified" content={post.updatedAt} />
              <span className="hidden md:inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <svg className="h-4 w-4 text-emerald-500 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" /><circle cx="12" cy="12" r="10" /></svg>
                {readingTime} min read
              </span>
            </div>
          </header>

          {/* Content with ads */}
          <div
            className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-a:text-[#2f0f6b] prose-img:rounded-lg prose-p:leading-relaxed sm:prose-lg dark:prose-invert dark:prose-headings:text-white dark:prose-a:text-[#a78bfa] dark:prose-strong:text-white"
            dangerouslySetInnerHTML={{ __html: contentWithAds }}
            itemProp="articleBody"
          />

          {/* Fallback ads */}
          {ads.length > 0 && !contentWithAds.includes('blog-ad') && (
            <div className="mt-10 space-y-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Sponsored</h2>
              {ads.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          )}

          {/* Tags */}
          {post.tags && (
            <div className="mt-6 flex flex-wrap gap-1.5" itemProp="keywords">
              {post.tags.split(',').map((tag) => {
                const colors = [
                  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
                  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
                  'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
                  'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
                  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
                  'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
                  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
                  'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
                  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
                  'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
                ];
                const idx = tag.trim().length % colors.length;
                return (
                  <span key={tag.trim()} className={`rounded-full px-2.5 py-1 text-xs font-medium ${colors[idx]}`}>
                    {tag.trim()}
                  </span>
                );
              })}
            </div>
          )}

          {/* Bottom navigation */}
          <div className="mt-10 flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-6">
            <Link href="/blogs" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[#2f0f6b] dark:hover:text-[#a78bfa] transition">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>
              Back to Blog
            </Link>
          </div>

          {/* Related Posts */}
          {related.length > 0 && (
            <section className="mt-10 border-t border-slate-100 dark:border-slate-700 pt-8">
              <h2 className="mb-5 text-lg font-bold text-slate-900 dark:text-white">Related Articles</h2>
              <div className="grid gap-5 sm:grid-cols-3">
                {related.map((r) => (
                  <Link key={r.id} href={`/blogs/${r.slug}`} className="group">
                    {r.bannerImage ? (
                      <div className="overflow-hidden rounded-lg">
                        <img src={r.bannerImage} alt={r.title} className="h-40 w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
                      </div>
                    ) : (
                      <div className="flex h-40 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-500">
                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                    <h3 className="mt-2.5 text-sm font-semibold text-slate-900 dark:text-white group-hover:text-[#2f0f6b] dark:group-hover:text-[#a78bfa] transition-colors line-clamp-2">{r.title}</h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </>
  );
}
