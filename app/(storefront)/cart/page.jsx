'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { loadCart, updateCartItem, removeCartItem } from '../../../src/lib/cartStorage';

export default function CartPage() {
  const [cart, setCart] = useState(() => loadCart());
  const [refresh, setRefresh] = useState(0);

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
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-slate-900">Your Cart</h1>
        <p className="mt-2 text-slate-600">Review the selected items before checkout.</p>

        {cart.length === 0 ? (
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-slate-500">Your cart is empty.</p>
            <Link href="/categories" className="mt-4 inline-block rounded-xl bg-[#2f0f6b] px-6 py-3 text-white hover:bg-[#2f0f6b]/90 transition">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {cart.map((item, index) => (
              <div key={`${item.productSlug}-${item.variantId}-${index}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-4">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="h-24 w-24 rounded-lg object-cover" />
                  ) : (
                    <div className="h-24 w-24 rounded-lg bg-slate-100" />
                  )}
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.productSlug}`} className="font-medium text-slate-900 hover:text-[#2f0f6b] transition">
                      {item.title}
                    </Link>
                    {item.variantName ? (
                      <p className="text-sm text-slate-500">{item.variantName}</p>
                    ) : null}
                    <div className="mt-3 flex items-center gap-3">
                      <button onClick={() => handleQuantity(index, -1)} className="h-8 w-8 rounded-full border border-slate-200 text-sm hover:border-slate-300" disabled={item.quantity <= 1}>−</button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => handleQuantity(index, 1)} className="h-8 w-8 rounded-full border border-slate-200 text-sm hover:border-slate-300">+</button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-[#2f0f6b]">৳ {Number(item.price ?? 0).toLocaleString()}</p>
                    <button onClick={() => handleRemove(index)} className="mt-2 text-xs text-red-500 hover:text-red-700">Remove</button>
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-slate-900">Subtotal</p>
                <p className="text-lg font-semibold text-[#2f0f6b]">৳ {subtotal.toLocaleString()}</p>
              </div>
            </div>

            <Link
              href="/checkout"
              className="inline-flex rounded-xl bg-[#2f0f6b] px-6 py-4 text-white hover:bg-[#2f0f6b]/90 transition"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
