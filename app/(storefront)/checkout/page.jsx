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
    errors.name = 'নাম দেওয়া আবশ্যক।';
  } else if (name.length < 3) {
    errors.name = 'নাম কমপক্ষে ৩ অক্ষরের হতে হবে।';
  } else if (name.length > 20) {
    errors.name = 'নাম ২০ অক্ষরের কম হতে হবে।';
  } else if (!/^[A-Za-z\s]+$/.test(name)) {
    errors.name = 'শুধুমাত্র ইংরেজি অক্ষর ও স্পেস ব্যবহার করা যাবে।';
  }

  const mobile = form.mobile.trim();
  if (!mobile) {
    errors.mobile = 'মোবাইল নম্বর দেওয়া আবশ্যক।';
  } else if (!MOBILE_REGEX.test(mobile)) {
    errors.mobile = 'সঠিক মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।';
  }

  const address = form.address.trim();
  if (!address) {
    errors.address = 'ঠিকানা দেওয়া আবশ্যক।';
  } else if (address.length < 20) {
    errors.address = 'ঠিকানা কমপক্ষে ২০ অক্ষরের হতে হবে।';
  } else if (address.length > 100) {
    errors.address = 'ঠিকানা ১০০ অক্ষরের কম হতে হবে।';
  }

  return errors;
}

const AREA_LABELS = {
  'Inside Dhaka': 'ঢাকার ভিতরে',
  'Outside Dhaka': 'ঢাকার বাইরে',
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
      return data.error || 'চেকআউট ব্যর্থ হয়েছে';
    } catch {
      return `চেকআউট ব্যর্থ হয়েছে (${res.status})`;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const fieldErrors = validate(form);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    if (cart.length === 0) {
      setErrorMsg('আপনার কার্ট খালি আছে।');
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
    <section className="min-h-[calc(100vh-3rem)] sm:min-h-[calc(100vh-3.5rem)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="mx-auto max-w-lg lg:max-w-5xl lg:grid lg:grid-cols-[1fr_420px] lg:gap-8">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-700 dark:bg-slate-800">
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-slate-100">চেকআউট</h1>

          {errorMsg ? (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">{errorMsg}</div>
          ) : null}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">নাম *</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} className={`mt-1.5 w-full rounded-xl border p-3 text-sm dark:text-slate-200 dark:placeholder:text-slate-400 ${errors.name ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-900/20' : 'border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-700'}`} placeholder="আপনার নাম" />
              {errors.name ? <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{errors.name}</p> : null}
            </div>
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-slate-700 dark:text-slate-300">মোবাইল *</label>
              <input id="mobile" name="mobile" value={form.mobile} onChange={handleChange} className={`mt-1.5 w-full rounded-xl border p-3 text-sm dark:text-slate-200 dark:placeholder:text-slate-400 ${errors.mobile ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-900/20' : 'border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-700'}`} placeholder="01XXXXXXXXX" />
              {errors.mobile ? <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{errors.mobile}</p> : null}
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-300">ঠিকানা *</label>
              <textarea id="address" name="address" value={form.address} onChange={handleChange} rows="3" className={`mt-1.5 w-full rounded-xl border p-3 text-sm dark:text-slate-200 dark:placeholder:text-slate-400 ${errors.address ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-900/20' : 'border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-700'}`} placeholder="রাস্তার নাম, বাড়ি, ফ্লোর" />
              {errors.address ? <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{errors.address}</p> : null}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">ডেলিভারি এলাকা *</p>
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
                          ? 'border-[#2f0f6b] bg-[#2f0f6b]/10 text-[#2f0f6b] font-semibold dark:border-[#a78bfa] dark:bg-[#a78bfa]/10 dark:text-[#a78bfa]'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:border-slate-500'
                      }`}
                    >
                      <input type="radio" name="shippingArea" value={opt.value} checked={active} onChange={handleChange} className="sr-only" />
                      <span className="truncate">{AREA_LABELS[opt.value]}</span>
                      <span className="shrink-0 pl-2 font-semibold">৳{toBn(opt.charge)}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        <aside className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm lg:mt-0 dark:border-slate-700 dark:bg-slate-800">
          <div className="border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4 dark:border-slate-700">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">অর্ডার সামারি</h2>
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
                  <p className="text-sm font-semibold text-[#2f0f6b] whitespace-nowrap dark:text-[#a78bfa]">৳ {toBn((Number(item.price ?? 0) * item.quantity).toLocaleString())}</p>
                  </div>
                </div>
                
              </div>
            ))}
          </div>
          <div className="space-y-1.5 border-t border-slate-100 px-4 py-4 sm:px-6 dark:border-slate-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">সাবটোটাল</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">৳ {toBn(subtotal.toLocaleString())}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">ডেলিভারি চার্জ</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">৳ {toBn(deliveryCharge)}</span>
            </div>
            <hr className="border-slate-200 dark:border-slate-600" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">সর্বমোট</span>
              <span className="text-lg font-bold text-[#2f0f6b] dark:text-[#a78bfa]">৳ {toBn(total.toLocaleString())}</span>
            </div>
          </div>
          <div className="px-4 pb-4 sm:px-6 sm:pb-6">
            <button
              type="submit"
              disabled={submitting}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#2f0f6b] to-[#4c1d95] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#2f0f6b]/25 hover:shadow-[#2f0f6b]/40 hover:shadow-md active:scale-[0.98] transition disabled:opacity-50 dark:bg-gradient-to-r dark:from-[#a78bfa] dark:to-[#c4b5fd] dark:text-slate-900 dark:shadow-[#a78bfa]/25"
            >
              <span className="mt-0.5 pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-white/10 transition-all duration-700 group-hover:left-full" />
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8 8 8 0 018 8h-2a6 6 0 00-6-6 6 6 0 00-6 6H4z" />
                  </svg>
                  প্রসেসিং...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  অর্ডারটি কনফার্ম করুন
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              )}
            </button>
          </div>
        </aside>
      </form>
      </div>
    </section>
  );
}
