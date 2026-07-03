export const metadata = {
  title: 'Admin | Cabinet & Closet',
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="/admin/dashboard" className="text-lg font-semibold text-[#2f0f6b]">Cabinet &amp; Closet Admin</a>
          <nav className="flex gap-4 text-sm text-slate-700">
            <a href="/admin/categories" className="hover:text-[#2f0f6b] transition">Categories</a>
            <a href="/admin/products" className="hover:text-[#2f0f6b] transition">Products</a>
            <a href="/admin/orders" className="hover:text-[#2f0f6b] transition">Orders</a>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
