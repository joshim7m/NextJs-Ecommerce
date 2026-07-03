export default function CartPage() {
  return (
    <section className="container py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">Your Cart</h1>
        <p className="mt-2 text-slate-600">Review the selected items before checkout.</p>
        <div className="mt-8 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-start gap-4">
              <div className="h-24 w-24 rounded-3xl bg-slate-100" />
              <div className="flex-1">
                <p className="font-semibold">Sample Product</p>
                <p className="text-sm text-slate-500">Oak / Medium</p>
              </div>
              <p className="font-semibold">৳ 1,250</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lg font-semibold">Subtotal</p>
            <p className="text-lg font-semibold">৳ 1,250</p>
          </div>
          <a href="/storefront/checkout" className="inline-flex rounded-3xl bg-slate-900 px-6 py-4 text-white hover:bg-slate-700">Proceed to Checkout</a>
        </div>
      </div>
    </section>
  );
}
