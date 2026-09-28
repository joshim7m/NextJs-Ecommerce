import { getSiteUrl } from '../src/lib/siteSettings';

export default async function robots() {
  const SITE_URL = await getSiteUrl();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
