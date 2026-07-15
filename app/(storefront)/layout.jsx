import Header from '@/src/components/storefront/Header';
import Footer from '@/src/components/storefront/Footer';
import prisma from '@/src/lib/prisma';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://radiantpicks.com';

export async function generateMetadata() {
  let settings = {};
  try {
    settings = await prisma.siteSetting.findUnique({ where: { id: 'singleton' } }) || {};
  } catch {}

  const siteName = settings.siteName || 'Radiant Picks';
  const title = `${siteName} — Bangladesh's Trusted Online Lingerie & Women's Intimates Store`;
  const description =
    'Shop premium lingerie, bras, panties, nightwear, and women\'s intimate apparel at Radiant Picks. ' +
    'We offer discreet packaging, cash on delivery across Bangladesh, and sizes that fit every body. ' +
    'From everyday comfort to something a little special — delivered right to your doorstep in Dhaka, Chittagong, Sylhet, and everywhere in between.';
  const keywords = [
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
    'Secret clothing Bangladesh',
    'radiant picks',
  ];

  return {
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    description,
    keywords,
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: '/',
    },
    openGraph: {
      type: 'website',
      locale: 'en_BD',
      url: SITE_URL,
      siteName,
      title,
      description,
      images: [
        {
          url: `${SITE_URL}/api/og?title=${encodeURIComponent(siteName)}&subtitle=${encodeURIComponent(description.slice(0, 120))}`,
          width: 1200,
          height: 630,
          alt: `${siteName} — Online Lingerie & Women's Intimates Store in Bangladesh`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/api/og?title=${encodeURIComponent(siteName)}&subtitle=${encodeURIComponent(description.slice(0, 120))}`],
      creator: `@${siteName.replace(/\s+/g, '').toLowerCase()}`,
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
    verification: {},
  };
}

async function getSiteSettings() {
  try {
    const settings = await prisma.siteSetting.findUnique({ where: { id: 'singleton' } });
    return settings || {};
  } catch {
    return {};
  }
}

export default async function StorefrontLayout({ children }) {
  const [settings, socialLinks] = await Promise.all([
    getSiteSettings(),
    prisma.socialLink.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    }).catch(() => []),
  ]);

  const siteName = settings.siteName || 'Radiant Picks';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: SITE_URL,
    logo: settings.logo || `${SITE_URL}/api/og?title=${encodeURIComponent(siteName)}&type=website`,
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
    name: siteName,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/categories?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
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
  );
}
