import Header from '@/src/components/storefront/Header';
import Footer from '@/src/components/storefront/Footer';

export const metadata = {
  title: 'Storefront | Cabinet Closet',
};

export default function StorefrontLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
