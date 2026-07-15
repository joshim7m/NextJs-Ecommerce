import './globals.css';
import prisma from '@/src/lib/prisma';

async function getSiteSettings() {
  try {
    const settings = await prisma.siteSetting.findUnique({ where: { id: 'singleton' } });
    return settings || {};
  } catch {
    return {};
  }
}

export async function generateMetadata() {
  const settings = await getSiteSettings();
  const siteName = settings.siteName || 'Radiant Picks';
  return {
    title: {
      default: `${siteName} — Online Lingerie & Women's Intimates Store in Bangladesh`,
      template: `%s | ${siteName}`,
    },
    description:
      'Shop premium lingerie, bras, panties, nightwear, and women\'s intimate apparel at Radiant Picks. ' +
      'Discreet packaging, cash on delivery, and free shipping options across Bangladesh.',
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
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            })();
          `
        }} />
      </head>
      <body suppressHydrationWarning >{children}</body>
    </html>
  );
}
