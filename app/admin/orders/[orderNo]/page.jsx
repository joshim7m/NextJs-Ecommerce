'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getOrderByOrderNo, updateOrderStatus } from '../../../../src/actions/orders';

const orderStatuses = ['pending', 'processing', 'completed', 'cancelled'];
const paymentStatuses = ['unpaid', 'paid', 'refund'];

const orderStatusColors = {
  pending: 'bg-amber-50 text-amber-700',
  processing: 'bg-blue-50 text-blue-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-700',
};

const paymentStatusColors = {
  unpaid: 'bg-slate-100 text-slate-600',
  paid: 'bg-emerald-50 text-emerald-700',
  refund: 'bg-red-50 text-red-700',
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getOrderByOrderNo(params.orderNo).then((data) => {
      setOrder(data);
      setLoading(false);
    });
  }, [params.orderNo]);

  const handleStatusUpdate = async (field, value) => {
    if (!order) return;
    setSaving(true);
    try {
      await updateOrderStatus(order.id, { [field]: value });
      const updated = await getOrderByOrderNo(params.orderNo);
      setOrder(updated);
    } catch {}
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#2f0f6b]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-semibold text-slate-900">Order not found</p>
        <p className="mt-1 text-sm text-slate-500">No order matches &ldquo;{params.orderNo}&rdquo;</p>
        <Link href="/admin/orders" className="mt-4 inline-block text-sm font-medium text-[#2f0f6b] hover:underline">&larr; Back to orders</Link>
      </div>
    );
  }

  const subtotal = order.items.reduce((sum, item) => sum + Number(item.purchasePrice) * item.quantity, 0);
  const deliveryCharge = Number(order.details?.deliveryCharge || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/orders" className="text-sm text-slate-400 hover:text-slate-600 transition">&larr; Orders</Link>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{order.orderNo}</h1>
          <p className="text-sm text-slate-500">Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${orderStatusColors[order.orderStatus] || 'bg-slate-100 text-slate-600'}`}>
          {order.orderStatus}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Items */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Order Items</h2>
            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  {item.itemImagePath && (
                    <img src={item.itemImagePath} alt={item.productTitle} className="h-14 w-14 rounded-lg border border-slate-100 object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{item.productTitle}</p>
                    <p className="text-xs text-slate-400">Qty: {item.quantity} &times; ৳{Number(item.purchasePrice).toLocaleString()}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">৳{(Number(item.purchasePrice) * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Delivery</span>
                <span>{deliveryCharge > 0 ? `৳${deliveryCharge.toLocaleString()}` : 'Free'}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-1.5 text-base font-bold text-slate-900">
                <span>Total</span>
                <span>৳{Number(order.total).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Status management */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Status</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Order Status</label>
                <select
                  value={order.orderStatus}
                  onChange={(e) => handleStatusUpdate('orderStatus', e.target.value)}
                  disabled={saving}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b] disabled:opacity-50"
                >
                  {orderStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Payment Status</label>
                <select
                  value={order.paymentStatus}
                  onChange={(e) => handleStatusUpdate('paymentStatus', e.target.value)}
                  disabled={saving}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b] disabled:opacity-50"
                >
                  {paymentStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {saving && <p className="text-xs text-slate-400">Updating...</p>}
            </div>
          </div>

          {/* Customer details */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Customer</h2>
            {order.details ? (
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Phone</p>
                  <p className="text-slate-900">{order.details.phoneNumber || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Shipping Area</p>
                  <p className="text-slate-900">{order.details.shippingArea}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Address</p>
                  <p className="text-slate-900">{order.details.shippingAddress}</p>
                </div>
                {order.details.billingAddress && (
                  <div>
                    <p className="text-xs text-slate-400">Billing Address</p>
                    <p className="text-slate-900">{order.details.billingAddress}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No details available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
