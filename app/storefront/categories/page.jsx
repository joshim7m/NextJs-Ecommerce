export default function CategoryListingPage() {
  return (
    <section className="container py-16">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Categories</h1>
        <p className="text-slate-600">Browse product categories available in the store.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {['Kitchen', 'Living Room', 'Bedroom', 'Storage', 'Office', 'Decor'].map((category) => (
            <a key={category} href={`/storefront/categories/${category.toLowerCase().replace(' ', '-')}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300">
              <h2 className="text-xl font-semibold">{category}</h2>
              <p className="mt-2 text-sm text-slate-500">Shop the latest items in {category}.</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
