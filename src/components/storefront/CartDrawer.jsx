'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadCart, updateCartItem, removeCartItem } from '../../lib/cartStorage';

export default function CartDrawer({ open, onClose }) {
  const [cart, setCart] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setCart(loadCart());
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!mounted) return null;

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price ?? 0) * item.quantity, 0);

  const handleQty = (index, delta) => {
    const item = cart[index];
    const next = item.quantity + delta;
    if (next <= 0) {
      removeCartItem(index);
    } else {
      updateCartItem(index, next);
    }
    setCart(loadCart());
  };

  const handleRemove = (index) => {
    removeCartItem(index);
    setCart(loadCart());
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[110] bg-black/40 transition-opacity" onClick={onClose} />
      )}

      <div
        className={`fixed right-0 top-0 z-[120] flex h-full w-full flex-col bg-white shadow-2xl transition-transform duration-300 sm:w-[420px] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Cart</h2>
            <p className="text-xs text-slate-500">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-16 text-center">
              <svg className="mb-4 h-16 w-16 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              <p className="text-sm text-slate-500">Your cart is empty</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 text-sm font-medium text-[#2f0f6b] hover:underline"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {cart.map((item, i) => (
                <li key={`${item.productSlug}-${item.variantId || ''}`} className="flex gap-3">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-300">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between gap-1 min-w-0">
                    <div>
                      <p className="text-sm font-medium text-slate-900 line-clamp-1">{item.title}</p>
                      {item.variantName && item.variantName !== 'Default' && (
                        <p className="text-xs text-slate-400">{item.variantName}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleQty(i, -1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition"
                        >
                          −
                        </button>
                        <span className="min-w-[1.5rem] text-center text-sm font-medium text-slate-900">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleQty(i, 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#2f0f6b]">৳{(Number(item.price) * item.quantity).toLocaleString()}</span>
                        <button
                          type="button"
                          onClick={() => handleRemove(i)}
                          className="text-slate-300 hover:text-red-500 transition"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-slate-600">Subtotal</span>
              <span className="text-lg font-semibold text-slate-900">৳{subtotal.toLocaleString()}</span>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              className="mb-2 flex w-full items-center justify-center rounded-xl bg-[#2f0f6b] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2f0f6b]/90 transition"
            >
              Checkout
            </Link>
            <Link
              href="/cart"
              onClick={onClose}
              className="flex w-full items-center justify-center rounded-xl border-2 border-[#2f0f6b] px-6 py-3 text-sm font-semibold text-[#2f0f6b] hover:bg-[#2f0f6b]/5 transition"
            >
              View Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
