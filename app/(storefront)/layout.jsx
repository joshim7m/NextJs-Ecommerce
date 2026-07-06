import Header from '@/src/components/storefront/Header';
import Footer from '@/src/components/storefront/Footer';
import prisma from '@/src/lib/prisma';

export const metadata = {
  title: 'Storefront | Cabinet Closet',
};

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

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        siteName={settings.siteName}
        logo={settings.logo}
        mobile={settings.mobile}
        announcementText={settings.announcementText}
      />
      <main className="flex-1">{children}</main>
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
