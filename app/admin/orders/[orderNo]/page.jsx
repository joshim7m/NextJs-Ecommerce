'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getOrderByOrderNo, updateOrderStatus, updateOrderDetails } from '../../../../src/actions/orders';

const orderStatuses = ['pending', 'processing', 'completed', 'cancelled'];

const orderStatusColors = {
  pending: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-400' },
  processing: { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  completed: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  cancelled: { bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
};

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{sub}</p>}
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deliveryInput, setDeliveryInput] = useState('');

  useEffect(() => {
    getOrderByOrderNo(params.orderNo).then((data) => {
      setOrder(data);
      setDeliveryInput(data.details ? String(Number(data.details.deliveryCharge)) : '0');
      setLoading(false);
    });
  }, [params.orderNo]);

  const handleStatusUpdate = async (field, value) => {
    if (!order) return;
    setSaving(true);
    setSaved(false);
    try {
      await updateOrderStatus(order.id, { [field]: value });
      const updated = await getOrderByOrderNo(params.orderNo);
      setOrder(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  const handleDeliveryChargeUpdate = async () => {
    const val = parseFloat(deliveryInput);
    if (isNaN(val) || val < 0 || !order) return;
    setSaving(true);
    setSaved(false);
    try {
      await updateOrderDetails(order.id, { deliveryCharge: val });
      const updated = await getOrderByOrderNo(params.orderNo);
      setOrder(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#2f0f6b] dark:border-slate-700 dark:border-t-[#a78bfa]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-24 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <svg className="h-8 w-8 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-slate-900 dark:text-white">Order not found</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">No order matches &ldquo;{params.orderNo}&rdquo;</p>
        <Link href="/admin/orders" className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-[#2f0f6b] px-4 py-2 text-sm font-medium text-white hover:bg-[#2f0f6b]/90 transition dark:bg-[#a78bfa] dark:text-slate-900 dark:hover:bg-[#a78bfa]/90">&larr; Back to orders</Link>
      </div>
    );
  }

  const subtotal = order.items.reduce((sum, item) => sum + Number(item.purchasePrice) * item.quantity, 0);
  const deliveryCharge = Number(order.details?.deliveryCharge || 0);
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const osColor = orderStatusColors[order.orderStatus] || { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-400' };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            href="/admin/orders"
            className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700 transition shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-300"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{order.orderNo}</h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Placed{' '}
              <span className="font-medium text-slate-600 dark:text-slate-300">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
                })}
              </span>
              {' at '}
              {new Date(order.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold ${osColor.bg} ${osColor.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${osColor.dot}`} />
            {order.orderStatus}
          </span>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Items" value={itemCount} sub={`${order.items.length} line items`} />
        <StatCard label="Subtotal" value={`৳${subtotal.toLocaleString()}`} />
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Delivery Charge</p>
          {order.orderStatus === 'completed' || order.orderStatus === 'cancelled' ? (
            <div className="mt-2">
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-sm dark:bg-slate-900/50">
                <span className="text-slate-900 font-medium dark:text-white">৳{deliveryCharge > 0 ? deliveryCharge.toLocaleString() : '0'}</span>
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-200/60 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Locked
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-2 flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-slate-500">৳</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={deliveryInput}
                    onChange={(e) => setDeliveryInput(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 py-2 pl-7 pr-3 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b] dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-[#a78bfa] dark:focus:ring-[#a78bfa]"
                    placeholder="0.00"
                  />
                </div>
                <button
                  onClick={handleDeliveryChargeUpdate}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#2f0f6b] px-4 py-2 text-sm font-medium text-white hover:bg-[#2f0f6b]/90 transition disabled:opacity-50 dark:bg-[#a78bfa] dark:text-slate-900 dark:hover:bg-[#a78bfa]/90"
                >
                  {saving ? (
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">Updating delivery charge will recalculate the total.</p>
              {saved && (
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Updated
                </p>
              )}
            </>
          )}
        </div>
        <StatCard
          label="Total"
          value={`৳${Number(order.total).toLocaleString()}`}
          sub="Including delivery"
        />
      </div>

      {/* ── Main grid ── */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* ── Left: Order items ── */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-800">
          <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4 dark:border-slate-700 dark:bg-slate-900/50">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Order Items</h2>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {order.items.map((item) => {
              const lineTotal = Number(item.purchasePrice) * item.quantity;
              return (
                <li key={item.id} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-700/30">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-700">
                    {item.itemImagePath ? (
                      <img src={item.itemImagePath} alt={item.productTitle} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-300 dark:text-slate-500">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate dark:text-white">{item.productTitle}</p>
                    {item.variantName && (
                      <span className="mt-0.5 inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        <svg className="h-3 w-3 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {item.variantName}
                      </span>
                    )}
                    <div className="mt-1">
                      <span className="font-medium text-slate-900 dark:text-white">৳{Number(item.purchasePrice).toLocaleString()}</span>
                      <span className="text-slate-400 dark:text-slate-500"> × {item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">৳{lineTotal.toLocaleString()}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Totals */}
          <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 space-y-2 dark:bg-slate-900/30 dark:border-slate-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
              <span className="font-medium text-slate-900 dark:text-white">৳{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Delivery</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {deliveryCharge > 0 ? `৳${deliveryCharge.toLocaleString()}` : 'Free'}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-base dark:border-slate-700">
              <span className="font-semibold text-slate-900 dark:text-white">Total</span>
              <span className="text-lg font-bold text-[#2f0f6b] dark:text-[#a78bfa]">৳{Number(order.total).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-6">
          {/* Status management */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-800">
            <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 dark:border-slate-700 dark:bg-slate-900/50">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Status</h2>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 dark:text-slate-400">
                  Order Status
                </label>
                <div className="relative">
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleStatusUpdate('orderStatus', e.target.value)}
                    disabled={saving}
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-8 text-sm text-slate-900 focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b] disabled:opacity-50 transition dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-[#a78bfa] dark:focus:ring-[#a78bfa]"
                  >
                    {orderStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <svg className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {saving && (
                  <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                    <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving…
                  </span>
                )}
                {saved && (
                  <span className="flex items-center gap-1.5 text-emerald-600 font-medium dark:text-emerald-400">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Saved
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Customer details */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-800">
            <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 dark:border-slate-700 dark:bg-slate-900/50">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Customer</h2>
            </div>
            <div className="p-5">
              {order.details ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-900/50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2f0f6b]/10 text-[#2f0f6b] dark:bg-[#a78bfa]/10 dark:text-[#a78bfa]">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{order.details.phoneNumber || 'Unknown'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{order.details.customerName}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-0.5 dark:text-slate-400">Phone</p>
                      <p className="text-sm text-slate-900 font-medium dark:text-white">{order.details.phoneNumber || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-0.5 dark:text-slate-400">Shipping Area</p>
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                        {order.details.shippingArea}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-0.5 dark:text-slate-400">Shipping Address</p>
                      <p className="text-sm text-slate-900 bg-slate-50 rounded-lg p-3 border border-slate-100 dark:text-white dark:bg-slate-900/50 dark:border-slate-700">
                        {order.details.shippingAddress}
                      </p>
                    </div>

                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-6 text-center text-sm text-slate-400 dark:text-slate-500">
                  <svg className="mb-2 h-8 w-8 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  No details available
                </div>
              )}
            </div>
          </div>

          {/* Order timeline */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-800">
            <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 dark:border-slate-700 dark:bg-slate-900/50">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Timeline</h2>
            </div>
            <div className="p-5">
              <div className="space-y-5">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <div className="mt-1 w-px flex-1 bg-slate-200 dark:bg-slate-700" />
                  </div>
                  <div className="pb-5">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Order placed</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      order.orderStatus === 'processing' || order.orderStatus === 'completed'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                    }`}>
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </span>
                    {order.orderStatus !== 'completed' && order.orderStatus !== 'cancelled' && <div className="mt-1 w-px flex-1 bg-slate-200 dark:bg-slate-700" />}
                  </div>
                  <div className={order.orderStatus !== 'completed' && order.orderStatus !== 'cancelled' ? 'pb-5' : ''}>
                    <p className={`text-sm font-medium ${order.orderStatus === 'processing' || order.orderStatus === 'completed' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                      Processing
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {order.orderStatus === 'processing' || order.orderStatus === 'completed'
                        ? 'In progress'
                        : 'Pending'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    order.orderStatus === 'completed'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : order.orderStatus === 'cancelled'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                  }`}>
                    {order.orderStatus === 'cancelled' ? (
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <div>
                    <p className={`text-sm font-medium ${
                      order.orderStatus === 'completed' || order.orderStatus === 'cancelled'
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      {order.orderStatus === 'cancelled' ? 'Cancelled' : 'Completed'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {order.orderStatus === 'completed'
                        ? 'Delivered'
                        : order.orderStatus === 'cancelled'
                        ? 'Order cancelled'
                        : 'Awaiting'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
