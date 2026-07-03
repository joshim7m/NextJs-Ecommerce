export const metadata = {
  title: 'Storefront | Cabinet Closet',
};

export default function StorefrontLayout({ children }) {
  return (
    <div>
      <header className="bg-white shadow-sm">
        <div className="container flex items-center justify-between py-4">
          <a href="/" className="text-xl font-semibold">Cabinet Closet</a>
          <nav className="flex gap-4">
            <a href="/storefront/categories" className="text-sm text-slate-700 hover:text-slate-900">Categories</a>
            <a href="/storefront/cart" className="text-sm text-slate-700 hover:text-slate-900">Cart</a>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
