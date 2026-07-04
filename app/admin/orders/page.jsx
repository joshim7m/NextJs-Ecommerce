'use client';

import { useEffect, useState, useMemo, Fragment } from 'react';
import Link from 'next/link';
import { getOrders, updateOrderStatus } from '../../../src/actions/orders';

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterOrderStatus, setFilterOrderStatus] = useState('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getOrders().then((data) => { setOrders(data); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    let list = orders;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((o) => o.orderNo.toLowerCase().includes(q));
    }
    if (filterOrderStatus !== 'all') list = list.filter((o) => o.orderStatus === filterOrderStatus);
    if (filterPaymentStatus !== 'all') list = list.filter((o) => o.paymentStatus === filterPaymentStatus);
    return list;
  }, [orders, search, filterOrderStatus, filterPaymentStatus]);

  const handleStatusUpdate = async (id, field, value) => {
    try {
      await updateOrderStatus(id, { [field]: value });
      getOrders().then(setOrders);
    } catch {}
  };

  if (loading) return <div className="p-8 text-slate-500">Loading...</div>;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
        <p className="mt-0.5 text-sm text-slate-500">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search by order number…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm placeholder-slate-400 focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]" />
        </div>
        <select value={filterOrderStatus} onChange={(e) => setFilterOrderStatus(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]">
          <option value="all">All Status</option>
          {orderStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterPaymentStatus} onChange={(e) => setFilterPaymentStatus(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]">
          <option value="all">All Payment</option>
          {paymentStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {(filterOrderStatus !== 'all' || filterPaymentStatus !== 'all' || search) && (
          <button onClick={() => { setFilterOrderStatus('all'); setFilterPaymentStatus('all'); setSearch(''); }} className="text-sm text-slate-500 hover:text-slate-700 transition">Clear</button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Order</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Customer</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Items</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Total</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Payment</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((order) => (
              <Fragment key={order.id}>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.orderNo}`} className="font-medium text-[#2f0f6b] hover:underline">{order.orderNo}</Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{order.details?.phoneNumber || order.user?.name || '—'}</td>
                  <td className="px-4 py-3 text-center text-slate-600">{order.items?.length ?? 0}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">৳{Number(order.total).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${orderStatusColors[order.orderStatus] || 'bg-slate-100 text-slate-600'}`}>{order.orderStatus}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${paymentStatusColors[order.paymentStatus] || 'bg-slate-100 text-slate-600'}`}>{order.paymentStatus}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setExpanded(expanded === order.id ? null : order.id)} className="text-sm font-medium text-slate-600 hover:text-[#2f0f6b] transition">
                      {expanded === order.id ? 'Collapse' : 'Details'}
                    </button>
                  </td>
                </tr>
                {expanded === order.id && (
                  <tr className="bg-slate-50/50">
                    <td colSpan={8} className="px-4 py-4">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2 text-sm">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Customer Details</p>
                          {order.details ? (
                            <>
                              <p><span className="text-slate-500">Phone:</span> {order.details.phoneNumber || '—'}</p>
                              <p><span className="text-slate-500">Address:</span> {order.details.shippingAddress}</p>
                              <p><span className="text-slate-500">Area:</span> {order.details.shippingArea}</p>
                              <p><span className="text-slate-500">Delivery:</span> ৳{Number(order.details.deliveryCharge).toLocaleString()}</p>
                            </>
                          ) : <p className="text-slate-400 italic">No details</p>}
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Order Status</label>
                            <select value={order.orderStatus} onChange={(e) => handleStatusUpdate(order.id, 'orderStatus', e.target.value)} className="w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]">
                              {orderStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Payment Status</label>
                            <select value={order.paymentStatus} onChange={(e) => handleStatusUpdate(order.id, 'paymentStatus', e.target.value)} className="w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]">
                              {paymentStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                      {order.items?.length > 0 && (
                        <div className="mt-4">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Items</p>
                          <div className="space-y-1.5">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center justify-between rounded-lg bg-white border border-slate-100 px-3 py-2 text-sm">
                                <span className="text-slate-700">{item.productTitle} <span className="text-slate-400">× {item.quantity}</span></span>
                                <span className="font-medium text-slate-900">৳{(Number(item.purchasePrice) * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">{search || filterOrderStatus !== 'all' || filterPaymentStatus !== 'all' ? 'No orders match your filters.' : 'No orders yet.'}</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
