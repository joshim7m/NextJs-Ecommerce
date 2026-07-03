export default function StorefrontHome() {
  return (
    <section className="container py-16">
      <div className="max-w-3xl space-y-6">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Bangladeshi Home & Cabinet Store</p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Cabinet Closet</h1>
        <p className="text-lg text-slate-600">
          Browse curated home and cabinet products with variant support for size and color, checkout in Bangladeshi Taka, and delivery options for inside/outside Dhaka.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <a href="/storefront/categories" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300">
            <h2 className="text-xl font-semibold">Shop categories</h2>
            <p className="mt-2 text-sm text-slate-500">Explore category collections and products.</p>
          </a>
          <a href="/storefront/cart" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300">
            <h2 className="text-xl font-semibold">View cart</h2>
            <p className="mt-2 text-sm text-slate-500">Review your selections before checkout.</p>
          </a>
        </div>
      </div>
    </section>
  );
}
