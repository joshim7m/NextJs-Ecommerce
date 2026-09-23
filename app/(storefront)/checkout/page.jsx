'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadCart, clearCart } from '../../../src/lib/cartStorage';
import { pushDataLayer } from '../../../src/lib/gtm';
import useDeviceFingerprint from '../../../src/hooks/useDeviceFingerprint';

const MOBILE_REGEX = /^(013|014|015|016|017|018|019)\d{8}$/;

function validate(form) {
  const errors = {};

  const name = form.name.trim();
  if (!name) {
    errors.name = 'Name is required.';
  } else if (name.length < 3) {
    errors.name = 'Name must be at least 3 characters long.';
  } else if (name.length > 20) {
    errors.name = 'Name must be 20 characters or less.';
  } else if (!/^[A-Za-z\s]+$/.test(name)) {
    errors.name = 'Only English letters and spaces are allowed.';
  }

  const mobile = form.mobile.trim();
  if (!mobile) {
    errors.mobile = 'Mobile number is required.';
  } else if (!MOBILE_REGEX.test(mobile)) {
    errors.mobile = 'Please enter a valid mobile number (e.g. 017XXXXXXXX).';
  }

  const address = form.address.trim();
  if (!address) {
    errors.address = 'Address is required.';
  } else if (address.length < 20) {
    errors.address = 'Address must be at least 20 characters long.';
  } else if (address.length > 100) {
    errors.address = 'Address must be 100 characters or less.';
  }

  return errors;
}

const AREA_LABELS = {
  'Inside Dhaka': 'Inside Dhaka',
  'Outside Dhaka': 'Outside Dhaka',
};

const BN_DIGITS = { 0: '০', 1: '১', 2: '২', 3: '৩', 4: '৪', 5: '৫', 6: '৬', 7: '৭', 8: '৮', 9: '৯' };
const toBn = (value) => String(value).replace(/\d/g, (d) => BN_DIGITS[d]);

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const deviceHash = useDeviceFingerprint();

  useEffect(() => {
    setCart(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (deviceHash) {
      fetch(`/api/checkout/check-blocked?deviceHash=${deviceHash}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.blocked) {
            window.location.href = 'https://google.com';
          }
        })
        .catch(() => {});
    }
  }, [deviceHash]);

  useEffect(() => {
    if (hydrated && cart.length > 0) {
      const delivery = form.shippingArea === 'Outside Dhaka' ? 120 : 80;
      const sub = cart.reduce((sum, item) => sum + Number(item.price ?? 0) * item.quantity, 0);
      pushDataLayer('begin_checkout', {
        ecommerce: {
          items: cart.map((item) => ({
            item_id: item.sku,
            item_name: item.title,
            price: Number(item.price ?? 0),
            item_variant: item.variantName,
            quantity: item.quantity,
          })),
          value: sub + delivery,
          currency: 'BDT',
          shipping: delivery,
        },
      });
    }
  }, [hydrated]);

  const [form, setForm] = useState({ name: '', mobile: '', address: '', shippingArea: 'Inside Dhaka' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const deliveryCharge = form.shippingArea === 'Outside Dhaka' ? 120 : 80;
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
        body: JSON.stringify({ ...form, items: cart, deviceHash }),
      });

      if (!res.ok) {
        throw new Error(await tryReadError(res));
      }

      const data = await res.json();
      if (!data.orderNo) throw new Error('Invalid response from server');

      const delivery = form.shippingArea === 'Outside Dhaka' ? 120 : 80;
      const sub = cart.reduce((sum, item) => sum + Number(item.price ?? 0) * item.quantity, 0);
      sessionStorage.setItem('gtm_purchase', JSON.stringify({
        transaction_id: data.orderNo,
        value: Number(data.total),
        currency: 'BDT',
        shipping: delivery,
        items: cart.map((item) => ({
          item_id: item.sku,
          item_name: item.title,
          price: Number(item.price ?? 0),
          item_variant: item.variantName,
          quantity: item.quantity,
        })),
      }));

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
        <div className="mx-auto max-w-sm rounded-2xl border border-violet-200/70 bg-violet-50/60 p-6 text-center shadow-sm sm:max-w-lg sm:p-10 dark:border-slate-700 dark:bg-slate-800">
          <div className="h-6 w-48 animate-pulse rounded bg-slate-200 mx-auto dark:bg-slate-600" />
          <div className="mt-4 h-4 w-64 animate-pulse rounded bg-slate-200 mx-auto dark:bg-slate-600" />
        </div>
      </section>
    );
  }

  if (cart.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-sm rounded-2xl border border-violet-200/70 bg-violet-50/60 p-6 text-center shadow-sm sm:max-w-lg sm:p-10 dark:border-slate-700 dark:bg-slate-800">
          <h1 className="text-3xl font-bold dark:text-slate-100">Checkout</h1>
          <p className="mt-4 text-slate-500 dark:text-slate-400">Your cart is empty. Add items before checking out.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100vh-3rem)] sm:min-h-[calc(100vh-3.5rem)]">
      <div className="mx-auto max-w-7xl px-2 py-6 sm:px-6 lg:px-8">
        {/* Page heading — light mode gradient headline */}
        <div className="mb-4 hidden md:flex flex-wrap items-center justify-between gap-3 sm:mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-gradient sm:text-3xl">
            Checkout
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/30 dark:text-emerald-400">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Cash on Delivery
          </span>
        </div>
        <form onSubmit={handleSubmit} className="mx-auto max-w-lg lg:max-w-5xl lg:grid lg:grid-cols-[1fr_420px] lg:gap-8">
          <div className="space-y-4 rounded-2xl border border-violet-200/70 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-700 dark:bg-slate-800">
            <div className="-mx-4 -mt-4 mb-4 rounded-t-2xl bg-brand-gradient dark:bg-slate-700/50 px-4 py-3 shadow-sm sm:-mx-6 sm:-mt-6 sm:px-6 sm:py-4">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white sm:text-base">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h2m-9 0h.5M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Delivery Information
              </h2>
            </div>

          {errorMsg ? (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">{errorMsg}</div>
          ) : null}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Name *</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} className={`mt-1.5 w-full rounded-xl border p-3 text-sm dark:text-slate-200 dark:placeholder:text-slate-400 ${errors.name ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-900/20' : 'border-violet-300/70 bg-violet-50/70 dark:border-slate-600 dark:bg-slate-700'}`} placeholder="Your name" />
              {errors.name ? <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{errors.name}</p> : null}
            </div>
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Mobile *</label>
              <input id="mobile" name="mobile" value={form.mobile} onChange={handleChange} className={`mt-1.5 w-full rounded-xl border p-3 text-sm dark:text-slate-200 dark:placeholder:text-slate-400 ${errors.mobile ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-900/20' : 'border-violet-300/70 bg-violet-50/70 dark:border-slate-600 dark:bg-slate-700'}`} placeholder="01XXXXXXXXX" />
              {errors.mobile ? <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{errors.mobile}</p> : null}
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Address *</label>
              <textarea id="address" name="address" value={form.address} onChange={handleChange} rows="3" className={`mt-1.5 w-full rounded-xl border p-3 text-sm dark:text-slate-200 dark:placeholder:text-slate-400 ${errors.address ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-900/20' : 'border-violet-300/70 bg-violet-50/70 dark:border-slate-600 dark:bg-slate-700'}`} placeholder="Full Address" />
              {errors.address ? <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{errors.address}</p> : null}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Delivery Area *</p>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {[
                  { value: 'Inside Dhaka', charge: 80 },
                  { value: 'Outside Dhaka', charge: 120 },
                ].map((opt) => {
                  const active = form.shippingArea === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className={`relative flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition ${
                        active
                  ? 'border-violet-400 bg-violet-100/70 text-[#2f0f6b] font-semibold shadow-sm dark:border-[#a78bfa] dark:bg-[#a78bfa]/10 dark:text-[#a78bfa]'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-violet-400 hover:bg-violet-50/60 hover:text-violet-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:border-slate-500'
                      }`}
                    >
                      <input type="radio" name="shippingArea" value={opt.value} checked={active} onChange={handleChange} className="sr-only" />
                      <span className="flex items-center gap-1.5 truncate">
                        {active && (
                          <svg className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {AREA_LABELS[opt.value]}
                      </span>
                      <span className="shrink-0 pl-2 font-semibold">৳{opt.charge}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Trust badges — pastel chips */}
          <div className="hidden md:grid grid-cols-3 gap-2 pt-1">
            {[
              { color: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-green-400', label: 'ক্যাশঅন ডেলিভারি ', icon: 'M17 9V7a5 5 0 00-10 0v6a5 5 0 0010 0v-6zM9 13v1a3 3 0 006 0v-1' },
              { color: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', label: 'সিক্রেট প্যাকেজিং ', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
              { color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', label: 'সারাদেশে ডেলিভারি ', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            ].map((chip) => (
              <div key={chip.label} className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center ${chip.color}`}>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={chip.icon} />
                </svg>
                <span className="text-[10px] font-semibold leading-tight sm:text-xs">{chip.label}</span>
              </div>
            ))}
          </div>

        </div>

        <aside className="mt-6 rounded-2xl border border-violet-200/70 bg-white shadow-sm lg:mt-0 dark:border-slate-700 dark:bg-slate-800">
          <div className="rounded-t-2xl bg-brand-gradient dark:bg-slate-700/50 px-4 py-3 shadow-sm sm:px-6 sm:py-4">
            <h2 className="text-sm font-semibold text-white dark:text-slate-100">Order Summary</h2>
          </div>
          <div className="divide-y divide-violet-100/80 dark:divide-slate-700">
            {cart.map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-2 py-3 sm:px-6 sm:py-4">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="h-12 w-12 flex-shrink-0 rounded-xl object-cover" />
                ) : (
                  <div className="h-14 w-14 flex-shrink-0 rounded-xl bg-violet-100/70 dark:bg-slate-700" />
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
              <span className="text-slate-600 dark:text-slate-400">Delivery Charge</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">৳ {String(deliveryCharge)}</span>
            </div>
            <hr className="border-violet-200 dark:border-slate-600" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Total</span>
              <span className="text-lg font-bold text-brand-gradient dark:text-[#a78bfa]">৳ {total.toLocaleString()}</span>
            </div>
          </div>
          <div className="px-4 pb-4 sm:px-6 sm:pb-6">
            <button
              type="submit"
              disabled={submitting}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#9333ea] to-[#db2777] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:shadow-lg active:scale-[0.98] transition disabled:opacity-50 dark:bg-gradient-to-r dark:from-[#a78bfa] dark:to-[#c4b5fd] dark:text-slate-900 dark:shadow-[#a78bfa]/25"
            >
              <span className="mt-0.5 pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-white/10 transition-all duration-700 group-hover:left-full" />
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8 8 8 0 018 8h-2a6 6 0 00-6-6 6 6 0 00-6 6H4z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Confirm Order
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              )}
            </button>
          </div>

          <div>
            {/* Trust badges — pastel chips */}
          <div className="grid grid-cols-3 md:hidden gap-2 p-5">
            {[
              { color: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-green-400', label: 'ক্যাশঅন ডেলিভারি ', icon: 'M17 9V7a5 5 0 00-10 0v6a5 5 0 0010 0v-6zM9 13v1a3 3 0 006 0v-1' },
              { color: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', label: 'সিক্রেট প্যাকেজিং ', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
              { color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', label: 'সারাদেশে ডেলিভারি ', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            ].map((chip) => (
              <div key={chip.label} className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center ${chip.color}`}>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={chip.icon} />
                </svg>
                <span className="text-[10px] font-semibold leading-tight sm:text-xs">{chip.label}</span>
              </div>
            ))}
          </div>

          </div>
        </aside>
      </form>
      </div>
    </section>
  );
}
