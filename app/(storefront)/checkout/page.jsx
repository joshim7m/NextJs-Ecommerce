'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadCart, clearCart } from '../../../src/lib/cartStorage';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(loadCart());
    setHydrated(true);
  }, []);

  const [form, setForm] = useState({ name: '', mobile: '', address: '', shippingArea: 'Inside Dhaka' });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const deliveryCharge = form.shippingArea === 'Outside Dhaka' ? 120 : 50;
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price ?? 0) * item.quantity, 0);
  const total = subtotal + deliveryCharge;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  async function tryReadError(res) {
    try {
      const data = await res.json();
      return data.error || 'Checkout failed';
    } catch {
      return `Checkout failed (${res.status})`;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.name || !form.mobile || !form.address) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (cart.length === 0) {
      setErrorMsg('Your cart is empty.');
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
        throw new Error(await tryReadError(res));
      }

      const data = await res.json();
      if (!data.orderNo) throw new Error('Invalid response from server');
      clearCart();
      router.push(`/thankyou?orderNo=${data.orderNo}`);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!hydrated) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="h-6 w-48 animate-pulse rounded bg-slate-200 mx-auto dark:bg-slate-600" />
          <div className="mt-4 h-4 w-64 animate-pulse rounded bg-slate-200 mx-auto dark:bg-slate-600" />
        </div>
      </section>
    );
  }

  if (cart.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h1 className="text-3xl font-bold dark:text-slate-100">Checkout</h1>
          <p className="mt-4 text-slate-500 dark:text-slate-400">Your cart is empty. Add items before checking out.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Checkout</h1>

          {errorMsg ? (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">{errorMsg}</div>
          ) : null}

          <div className="grid gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Name *</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} required className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder:text-slate-400" placeholder="Your name" />
            </div>
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Mobile *</label>
              <input id="mobile" name="mobile" value={form.mobile} onChange={handleChange} required className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder:text-slate-400" placeholder="01XXXXXXXXX" />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Address *</label>
              <textarea id="address" name="address" value={form.address} onChange={handleChange} required className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder:text-slate-400" rows="4" placeholder="Street address, building, floor" />
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-600 dark:bg-slate-700">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Delivery charge</p>
              <div className="mt-4 space-y-3">
                <label className="flex items-center gap-3">
                  <input type="radio" name="shippingArea" value="Inside Dhaka" checked={form.shippingArea === 'Inside Dhaka'} onChange={handleChange} className="h-4 w-4 text-[#2f0f6b] dark:text-[#a78bfa]" />
                  <span>Inside Dhaka — 50 taka</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="radio" name="shippingArea" value="Outside Dhaka" checked={form.shippingArea === 'Outside Dhaka'} onChange={handleChange} className="h-4 w-4 text-[#2f0f6b] dark:text-[#a78bfa]" />
                  <span>Outside Dhaka — 120 taka</span>
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#2f0f6b] px-6 py-4 text-white hover:bg-[#2f0f6b]/90 transition disabled:opacity-50 dark:bg-[#a78bfa] dark:text-slate-900"
          >
            {submitting ? 'Processing...' : 'Place Order'}
          </button>
        </div>

        <aside className="space-y-6 rounded-xl border border-slate-200 bg-slate-50 p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Order Summary</p>
            <p className="mt-3 text-3xl font-semibold text-[#2f0f6b] dark:text-[#a78bfa]">৳ {total.toLocaleString()}</p>
          </div>

          <div className="space-y-4">
            {cart.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-3 rounded-lg bg-white p-4 dark:bg-slate-700">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate dark:text-slate-200">{item.title}</p>
                  {item.variantName ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.variantName} × {item.quantity}</p>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">× {item.quantity}</p>
                  )}
                </div>
                <p className="text-sm font-semibold text-[#2f0f6b] whitespace-nowrap dark:text-[#a78bfa]">৳ {(Number(item.price ?? 0) * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3 rounded-lg bg-white p-4 dark:bg-slate-700">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600 dark:text-slate-300">Subtotal</p>
              <p className="font-semibold dark:text-slate-100">৳ {subtotal.toLocaleString()}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600 dark:text-slate-300">Delivery</p>
              <p className="font-semibold dark:text-slate-100">৳ {deliveryCharge}</p>
            </div>
            <hr className="border-slate-200 dark:border-slate-600" />
            <div className="flex items-center justify-between">
              <p className="font-semibold dark:text-slate-100">Total</p>
              <p className="font-semibold text-[#2f0f6b] dark:text-[#a78bfa]">৳ {total.toLocaleString()}</p>
            </div>
          </div>
        </aside>
      </form>
    </section>
  );
}
