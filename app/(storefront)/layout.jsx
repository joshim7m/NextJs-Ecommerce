import { Suspense } from 'react';
import Header from '@/src/components/storefront/Header';
import Footer from '@/src/components/storefront/Footer';
import GoogleTagManager from '@/src/components/storefront/GoogleTagManager';
import PageViewTracker from '@/src/components/storefront/PageViewTracker';
import prisma from '@/src/lib/prisma';
import {
  getSiteSettings,
  siteNameOf,
  brandOf,
  keywordsOf,
  ogImageUrl,
  getSiteUrl,
  getMetadataBase,
} from '@/src/lib/siteSettings';

export async function generateMetadata() {
  const settings = await getSiteSettings();
  const siteName = siteNameOf(settings);
  const brand = brandOf(settings);

  const title = siteName
    ? `${siteName} — Bangladesh's Trusted Online Lingerie & Women's Intimates Store`
    : "Bangladesh's Trusted Online Lingerie & Women's Intimates Store";
  const description =
    settings.metaDescription ||
    (siteName
      ? `Shop premium lingerie, bras, panties, nightwear, and women's intimate apparel at ${siteName}. `
      : 'Shop premium lingerie, bras, panties, nightwear, and women\'s intimate apparel online. ') +
    'We offer discreet packaging, cash on delivery across Bangladesh, and sizes that fit every body. ' +
    'From everyday comfort to something a little special — delivered right to your doorstep in Dhaka, Chittagong, Sylhet, and everywhere in between.';
  const keywords = keywordsOf(settings, [
    'lingerie Bangladesh',
    'bra shop online BD',
    'panty buy Bangladesh',
    'nightwear for women Bangladesh',
    'women innerwear online Dhaka',
    'sexy lingerie Bangladesh',
    'bra panty set BD',
    'night dress women',
    'intimate apparel Bangladesh',
    'women underwear online shopping',
  ]);

  const SITE_URL = await getSiteUrl();
  const ogImage = await ogImageUrl(settings, {
    title: siteName,
    subtitle: description.slice(0, 120),
  });

  return {
    title: {
      // `absolute` keeps parent templates from appending the brand to the default.
      absolute: title,
      // Global suffix brand: admin metaTitle first, then siteName.
      ...(brand ? { template: `%s | ${brand}` } : {}),
    },
    description,
    keywords,
    authors: siteName ? [{ name: siteName }] : undefined,
    creator: siteName || undefined,
    publisher: siteName || undefined,
    metadataBase: await getMetadataBase(),
    alternates: {
      canonical: '/',
    },
    openGraph: {
      type: 'website',
      locale: 'en_BD',
      url: SITE_URL,
      siteName: siteName || undefined,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      ...(siteName
        ? { creator: `@${siteName.replace(/\s+/g, '').toLowerCase()}` }
        : {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      // Google Search Console (set GOOGLE_SITE_VERIFICATION in the environment
      // to the sitename from the GSC "HTML meta tag" verification method).
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  };
}

export default async function StorefrontLayout({ children }) {
  const [settings, socialLinks] = await Promise.all([
    getSiteSettings(),
    prisma.socialLink.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    }).catch(() => []),
  ]);

  const siteName = siteNameOf(settings);
  const SITE_URL = await getSiteUrl();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName || undefined,
    url: SITE_URL,
    logo: settings.logo || (await ogImageUrl(settings, { title: siteName, type: 'website' })),
    description:
      'Bangladesh\'s trusted online store for premium lingerie, bras, panties, nightwear, and women\'s intimate apparel with discreet delivery nationwide.',
    areaServed: {
      '@type': 'Country',
      name: 'Bangladesh',
    },
    sameAs: socialLinks.map((l) => l.url).filter(Boolean),
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName || undefined,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/categories?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <link rel="alternate" type="application/rss+xml" title={`${siteName} Blog`} href={`${SITE_URL}/feed.xml`} />
      <GoogleTagManager gtmId={settings.gtmId} />
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-[#2f0f6b] focus:px-4 focus:py-2 focus:text-white focus:outline-none">Skip to content</a>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <Header
        siteName={settings.siteName}
        logo={settings.logo}
        mobile={settings.mobile}
        announcementText={settings.announcementText}
      />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer
        siteName={settings.siteName}
        mobile={settings.mobile}
        email={settings.email}
        address={settings.address}
        copyrightText={settings.copyrightText}
        socialLinks={socialLinks}
      />
      </div>
    </>
  );
}
