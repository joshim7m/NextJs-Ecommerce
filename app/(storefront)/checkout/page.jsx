'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadCart, clearCart } from '../../../src/lib/cartStorage';

const MOBILE_REGEX = /^(013|014|015|016|017|018|019)\d{8}$/;

function validate(form) {
  const errors = {};

  const name = form.name.trim();
  if (!name) {
    errors.name = 'Name is required.';
  } else if (name.length < 3) {
    errors.name = 'Name must be at least 3 characters.';
  } else if (name.length > 20) {
    errors.name = 'Name must be under 20 characters.';
  } else if (!/^[A-Za-z\s]+$/.test(name)) {
    errors.name = 'Only letters and spaces allowed.';
  }

  const mobile = form.mobile.trim();
  if (!mobile) {
    errors.mobile = 'Mobile number is required.';
  } else if (!MOBILE_REGEX.test(mobile)) {
    errors.mobile = 'Enter a valid BD mobile number (e.g. 017XXXXXXXX).';
  }

  const address = form.address.trim();
  if (!address) {
    errors.address = 'Address is required.';
  } else if (address.length < 20) {
    errors.address = 'Address must be at least 20 characters.';
  } else if (address.length > 100) {
    errors.address = 'Address must be under 100 characters.';
  }

  return errors;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(loadCart());
    setHydrated(true);
  }, []);

  const [form, setForm] = useState({ name: '', mobile: '', address: '', shippingArea: 'Inside Dhaka' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const deliveryCharge = form.shippingArea === 'Outside Dhaka' ? 120 : 50;
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price ?? 0) * item.quantity, 0);
  const total = subtotal + deliveryCharge;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
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

    const fieldErrors = validate(form);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

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
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:max-w-lg sm:p-10 dark:border-slate-700 dark:bg-slate-800">
          <div className="h-6 w-48 animate-pulse rounded bg-slate-200 mx-auto dark:bg-slate-600" />
          <div className="mt-4 h-4 w-64 animate-pulse rounded bg-slate-200 mx-auto dark:bg-slate-600" />
        </div>
      </section>
    );
  }

  if (cart.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:max-w-lg sm:p-10 dark:border-slate-700 dark:bg-slate-800">
          <h1 className="text-3xl font-bold dark:text-slate-100">Checkout</h1>
          <p className="mt-4 text-slate-500 dark:text-slate-400">Your cart is empty. Add items before checking out.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="mx-auto max-w-lg lg:max-w-5xl lg:grid lg:grid-cols-[1fr_420px] lg:gap-8">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-700 dark:bg-slate-800">
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-slate-100">Checkout</h1>

          {errorMsg ? (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">{errorMsg}</div>
          ) : null}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Name *</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} className={`mt-1.5 w-full rounded-xl border p-3 text-sm dark:text-slate-200 dark:placeholder:text-slate-400 ${errors.name ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-900/20' : 'border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-700'}`} placeholder="Your name" />
              {errors.name ? <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{errors.name}</p> : null}
            </div>
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Mobile *</label>
              <input id="mobile" name="mobile" value={form.mobile} onChange={handleChange} className={`mt-1.5 w-full rounded-xl border p-3 text-sm dark:text-slate-200 dark:placeholder:text-slate-400 ${errors.mobile ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-900/20' : 'border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-700'}`} placeholder="01XXXXXXXXX" />
              {errors.mobile ? <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{errors.mobile}</p> : null}
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Address *</label>
              <textarea id="address" name="address" value={form.address} onChange={handleChange} rows="3" className={`mt-1.5 w-full rounded-xl border p-3 text-sm dark:text-slate-200 dark:placeholder:text-slate-400 ${errors.address ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-900/20' : 'border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-700'}`} placeholder="Street address, building, floor" />
              {errors.address ? <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{errors.address}</p> : null}
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-700">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Delivery</p>
              <div className="mt-3 space-y-2">
                <label className="flex items-center gap-3">
                  <input type="radio" name="shippingArea" value="Inside Dhaka" checked={form.shippingArea === 'Inside Dhaka'} onChange={handleChange} className="h-4 w-4 text-[#2f0f6b] dark:text-[#a78bfa]" />
                  <span className="text-sm">Inside Dhaka — 50 taka</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="radio" name="shippingArea" value="Outside Dhaka" checked={form.shippingArea === 'Outside Dhaka'} onChange={handleChange} className="h-4 w-4 text-[#2f0f6b] dark:text-[#a78bfa]" />
                  <span className="text-sm">Outside Dhaka — 120 taka</span>
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#2f0f6b] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2f0f6b]/90 active:scale-[0.98] transition disabled:opacity-50 dark:bg-[#a78bfa] dark:text-slate-900"
          >
            {submitting ? 'Processing...' : 'Place Order'}
          </button>
        </div>

        <aside className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm lg:mt-0 dark:border-slate-700 dark:bg-slate-800">
          <div className="border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4 dark:border-slate-700">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Order Summary</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {cart.map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 sm:px-6 sm:py-4">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="h-14 w-14 flex-shrink-0 rounded-xl object-cover" />
                ) : (
                  <div className="h-14 w-14 flex-shrink-0 rounded-xl bg-slate-100 dark:bg-slate-700" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug break-words text-slate-900 dark:text-slate-100">{item.title}</p>
                  <div className='flex justify-between'>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {item.variantName ? <>{item.variantName} &times; {item.quantity}</> : <>&times; {item.quantity}</>}
                  </p>
                  <p className="text-sm font-semibold text-[#2f0f6b] whitespace-nowrap dark:text-[#a78bfa]">৳ {(Number(item.price ?? 0) * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
                
              </div>
            ))}
          </div>
          <div className="space-y-1.5 border-t border-slate-100 px-4 py-4 sm:px-6 dark:border-slate-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">৳ {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Delivery</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">৳ {deliveryCharge}</span>
            </div>
            <hr className="border-slate-200 dark:border-slate-600" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Total</span>
              <span className="text-lg font-bold text-[#2f0f6b] dark:text-[#a78bfa]">৳ {total.toLocaleString()}</span>
            </div>
          </div>
        </aside>
      </form>
    </section>
  );
}
