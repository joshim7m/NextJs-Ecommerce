export default function AdminDashboardPage() {
  return (
    <section className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 text-slate-600">Manage categories, products, variants, and orders in one place.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: 'Categories', href: '/admin/categories' },
          { title: 'Products', href: '/admin/products' },
          { title: 'Orders', href: '/admin/orders' },
        ].map((item) => (
          <a key={item.title} href={item.href} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300">
            <h2 className="text-xl font-semibold">{item.title}</h2>
          </a>
        ))}
      </div>
    </section>
  );
}
