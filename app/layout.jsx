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
  return {
    title: settings.siteName ? `${settings.siteName} — Home` : "Cabinet & Closet — Home",
    description: 'Carefully selected products for your home and everyday style.',
    icons: settings.favicon ? { icon: settings.favicon } : undefined,
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
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
