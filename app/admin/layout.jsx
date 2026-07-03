export const metadata = {
  title: 'Admin | Cabinet Closet',
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white py-4 shadow-sm">
        <div className="container flex items-center justify-between">
          <a href="/admin/dashboard" className="text-lg font-semibold">Cabinet Closet Admin</a>
          <nav className="flex gap-4 text-sm text-slate-700">
            <a href="/admin/categories">Categories</a>
            <a href="/admin/products">Products</a>
            <a href="/admin/orders">Orders</a>
          </nav>
        </div>
      </header>
      <main className="container py-10">{children}</main>
    </div>
  );
}
