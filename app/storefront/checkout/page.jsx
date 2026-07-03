export default function CheckoutPage() {
  return (
    <section className="container py-16">
      <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <div className="grid gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">Name</label>
              <input className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4" placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Mobile</label>
              <input className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4" placeholder="01XXXXXXXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Address</label>
              <textarea className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4" rows="4" placeholder="Street address, building, floor" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Shipping area</label>
              <input className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4" placeholder="Inside Dhaka or Outside Dhaka" />
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-medium text-slate-700">Delivery charge</p>
              <div className="mt-4 space-y-3">
                <label className="flex items-center gap-3">
                  <input type="radio" name="delivery" value="inside-dhaka" className="h-4 w-4 text-slate-900" />
                  <span>Inside Dhaka — 50 taka</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="radio" name="delivery" value="outside-dhaka" className="h-4 w-4 text-slate-900" />
                  <span>Outside Dhaka — 120 taka</span>
                </label>
              </div>
            </div>
          </div>
          <button className="w-full rounded-3xl bg-slate-900 px-6 py-4 text-white hover:bg-slate-700">Place Order</button>
        </div>

        <aside className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
          <div>
            <p className="text-sm text-slate-500">Order Summary</p>
            <p className="mt-3 text-3xl font-semibold">৳ 1,250</p>
          </div>
          <div className="space-y-3 rounded-3xl bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">Product total</p>
              <p className="font-semibold">৳ 1,250</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">Delivery</p>
              <p className="font-semibold">Select area</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
