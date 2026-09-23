'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { loadCart, updateCartItem, removeCartItem } from '../../../src/lib/cartStorage';
import { pushDataLayer } from '../../../src/lib/gtm';

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setCart(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && cart.length > 0) {
      pushDataLayer('view_cart', {
        ecommerce: {
          items: cart.map((item) => ({
            item_id: item.sku,
            item_name: item.title,
            price: Number(item.price ?? 0),
            item_variant: item.variantName,
            quantity: item.quantity,
          })),
          value: cart.reduce((sum, item) => sum + Number(item.price ?? 0) * item.quantity, 0),
          currency: 'BDT',
        },
      });
    }
  }, [hydrated]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + Number(item.price ?? 0) * item.quantity, 0);
  }, [cart, refresh]);

  const handleQuantity = (index, delta) => {
    const item = cart[index];
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      removeCartItem(index);
    } else {
      updateCartItem(index, newQty);
    }
    setCart(loadCart());
    setRefresh((v) => v + 1);
  };

  const handleRemove = (index) => {
    removeCartItem(index);
    setCart(loadCart());
    setRefresh((v) => v + 1);
  };

  return (
    <section className="min-h-[calc(100vh-3rem)] sm:min-h-[calc(100vh-3.5rem)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-brand-gradient sm:text-3xl">Your Cart</h1>
            </div>
            {cart.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cart.length} {cart.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="mt-8 flex flex-col items-center rounded-xl border border-violet-200/70 bg-violet-50/60 p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient shadow-md">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </div>
              <p className="mt-4 text-slate-500 dark:text-slate-400">Your cart is empty.</p>
              <Link href="/categories" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-sm transition bg-brand-gradient-hover dark:bg-[#a78bfa] dark:text-slate-900">
                Browse Products
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {cart.map((item, index) => (
                <div key={`${item.productSlug}-${item.variantId}-${index}`} className="rounded-xl border border-violet-200/70 bg-white p-4 shadow-sm transition hover:border-violet-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
                  <div className="flex items-start gap-4">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="h-14 w-14 rounded-xl object-cover ring-1 ring-violet-200/70 dark:ring-slate-600" />
                    ) : (
                      <div className="h-24 w-24 rounded-xl bg-violet-100/70 dark:bg-slate-700" />
                    )}
                    <div className="min-w-0 flex-1">
                      <Link href={`/products/${item.productSlug}`} className="text-sm font-medium text-slate-900 hover:text-[#2f0f6b] transition dark:text-slate-100 dark:hover:text-[#a78bfa]">
                        {item.title}
                      </Link>
                      {item.variantName ? (
                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{item.variantName}</p>
                      ) : null}
                      <div className="mt-3 inline-flex items-center gap-3 rounded-full border border-violet-200 bg-violet-50/70 px-2 py-1 dark:border-slate-600 dark:bg-slate-700">
                        <button onClick={() => handleQuantity(index, -1)} aria-label="Decrease quantity" className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold text-violet-700 transition hover:bg-violet-100 disabled:opacity-30 dark:text-violet-300 dark:hover:bg-slate-600" disabled={item.quantity <= 1}>−</button>
                        <span className="w-6 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                        <button onClick={() => handleQuantity(index, 1)} aria-label="Increase quantity" className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold text-violet-700 transition hover:bg-violet-100 dark:text-violet-300 dark:hover:bg-slate-600">+</button>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-[#2f0f6b] dark:text-[#a78bfa]">৳ {Number(item.price ?? 0).toLocaleString()}</p>
                      <button onClick={() => handleRemove(index)} className="mt-2 inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="rounded-xl border border-violet-200/70 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Subtotal</p>
                    <p className="text-lg font-bold text-brand-gradient dark:text-[#a78bfa]">৳ {subtotal.toLocaleString()}</p>
                    <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">ডেলিভারি চার্জ যোগ করা হবে</p>
                  </div>

                  <Link
                    href="/checkout"
                    className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand-gradient px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition bg-brand-gradient-hover hover:shadow-violet-500/50 active:scale-[0.98] dark:bg-[#a78bfa] dark:text-slate-900"
                  >
                    <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-white/10 transition-all duration-700 group-hover:left-full" />
                    চেকআউটে যান 
                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
