export default function ProductPage({ params }) {
  const { slug } = params;

  return (
    <section className="container py-16">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-80 rounded-3xl bg-slate-100" />
          <div className="mt-6 space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Product</p>
            <h1 className="text-3xl font-bold text-slate-900">{slug.replace('-', ' ')}</h1>
            <p className="text-slate-600">Detailed product page with variant selection and Bangladesh-specific pricing in Taka.</p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Price</p>
            <p className="mt-2 text-4xl font-semibold">৳ 1,250</p>
            <p className="text-sm text-slate-500">Variant pricing updates automatically with selected size and color.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Select variant</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Size</label>
                <select className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3">
                  <option>Small</option>
                  <option>Medium</option>
                  <option>Large</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Color</label>
                <select className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3">
                  <option>Oak</option>
                  <option>Black</option>
                  <option>White</option>
                </select>
              </div>
              <button className="w-full rounded-xl bg-slate-900 px-5 py-3 text-white hover:bg-slate-700">Add to cart</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
