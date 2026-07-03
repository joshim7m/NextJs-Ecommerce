'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadCart, clearCart } from '../../../src/lib/cartStorage';

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useMemo(() => loadCart(), []);

  const [form, setForm] = useState({ name: '', mobile: '', address: '', shippingArea: 'Inside Dhaka' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const deliveryCharge = form.shippingArea === 'Outside Dhaka' ? 120 : 50;
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price ?? 0) * item.quantity, 0);
  const total = subtotal + deliveryCharge;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.mobile || !form.address) {
      setError('Please fill in all required fields.');
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items: cart }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Checkout failed');
      }

      const data = await res.json();
      clearCart();
      router.push(`/thankyou?orderNo=${data.orderNo}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="mt-4 text-slate-500">Your cart is empty. Add items before checking out.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>

          {error ? (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
          ) : null}

          <div className="grid gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Name *</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} required className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 p-4" placeholder="Your name" />
            </div>
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-slate-700">Mobile *</label>
              <input id="mobile" name="mobile" value={form.mobile} onChange={handleChange} required className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 p-4" placeholder="01XXXXXXXXX" />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-slate-700">Address *</label>
              <textarea id="address" name="address" value={form.address} onChange={handleChange} required className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 p-4" rows="4" placeholder="Street address, building, floor" />
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-medium text-slate-700">Delivery charge</p>
              <div className="mt-4 space-y-3">
                <label className="flex items-center gap-3">
                  <input type="radio" name="shippingArea" value="Inside Dhaka" checked={form.shippingArea === 'Inside Dhaka'} onChange={handleChange} className="h-4 w-4 text-[#2f0f6b]" />
                  <span>Inside Dhaka — 50 taka</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="radio" name="shippingArea" value="Outside Dhaka" checked={form.shippingArea === 'Outside Dhaka'} onChange={handleChange} className="h-4 w-4 text-[#2f0f6b]" />
                  <span>Outside Dhaka — 120 taka</span>
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#2f0f6b] px-6 py-4 text-white hover:bg-[#2f0f6b]/90 transition disabled:opacity-50"
          >
            {submitting ? 'Processing...' : 'Place Order'}
          </button>
        </div>

        <aside className="space-y-6 rounded-xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
          <div>
            <p className="text-sm text-slate-500">Order Summary</p>
            <p className="mt-3 text-3xl font-semibold text-[#2f0f6b]">৳ {total.toLocaleString()}</p>
          </div>

          <div className="space-y-4">
            {cart.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-3 rounded-lg bg-white p-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  {item.variantName ? (
                    <p className="text-xs text-slate-500">{item.variantName} × {item.quantity}</p>
                  ) : (
                    <p className="text-xs text-slate-500">× {item.quantity}</p>
                  )}
                </div>
                <p className="text-sm font-semibold text-[#2f0f6b] whitespace-nowrap">৳ {(Number(item.price ?? 0) * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3 rounded-lg bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">Subtotal</p>
              <p className="font-semibold">৳ {subtotal.toLocaleString()}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">Delivery</p>
              <p className="font-semibold">৳ {deliveryCharge}</p>
            </div>
            <hr className="border-slate-200" />
            <div className="flex items-center justify-between">
              <p className="font-semibold">Total</p>
              <p className="font-semibold text-[#2f0f6b]">৳ {total.toLocaleString()}</p>
            </div>
          </div>
        </aside>
      </form>
    </section>
  );
}
