import './globals.css';
import ThemeInit from '@/src/components/ThemeInit';
import { getSiteSettings, brandOf, keywordsOf } from '@/src/lib/siteSettings';

export async function generateMetadata() {
  const settings = await getSiteSettings();
  const brand = brandOf(settings);
  // Brand is composed from settings only — never hardcoded — so a rename in
  // the admin panel updates every surface live.
  return {
    title: {
      default: brand
        ? `${brand} — Online Lingerie & Women's Intimates Store in Bangladesh`
        : "Online Lingerie & Women's Intimates Store in Bangladesh",
      ...(brand ? { template: `%s | ${brand}` } : {}),
    },
    description:
      settings.metaDescription ||
      settings.aboutCompany?.slice(0, 160) ||
      "Shop premium lingerie, bras, panties, nightwear, and women's intimate apparel online in Bangladesh. " +
      'Discreet packaging, cash on delivery, and free shipping options across the country.',
    keywords: keywordsOf(settings),
    icons: settings.favicon ? { icon: settings.favicon } : undefined,
  };
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap"
          rel="stylesheet"
        />
        {/* Material Symbols: the storefront bundle's heading / CTA icons are
            ligature spans; without the font they render as raw text words. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeInit />
        {children}
      </body>
    </html>
  );
}
