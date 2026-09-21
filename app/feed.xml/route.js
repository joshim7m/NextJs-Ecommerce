import prisma from '../../src/lib/prisma';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://radiantpicks.com';

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  let posts = [];
  let siteName = 'Radiant Picks';
  let siteDescription = '';

  try {
    const [rawPosts, settings] = await Promise.all([
      prisma.blogPost.findMany({
        where: { status: 'publish' },
        include: { category: true },
        take: 30,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.siteSetting.findUnique({ where: { id: 'singleton' } }),
    ]);
    posts = rawPosts;
    if (settings?.siteName) siteName = settings.siteName;
    if (settings?.aboutCompany) siteDescription = settings.aboutCompany.slice(0, 300);
  } catch {
    // DB unavailable: return a valid (empty) feed rather than a 500
  }

  const items = posts
    .map((post) => {
      const plain = post.content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/blogs/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blogs/${post.slug}</guid>
      <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
      ${post.category ? `<category>${escapeXml(post.category.title)}</category>` : ''}
      ${post.tags ? post.tags.split(',').map((t) => `<category>${escapeXml(t.trim())}</category>`).join('\n      ') : ''}
      <description>${escapeXml(post.metaDescription || plain.slice(0, 300))}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${siteName} Blog`)}</title>
    <link>${SITE_URL}/blogs</link>
    <description>${escapeXml(siteDescription || `Articles from ${siteName}`)}</description>
    <language>en-bd</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
    },
  });
}
