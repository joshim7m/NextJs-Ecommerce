'use client';

import { useEffect, useState } from 'react';

const orderStatuses = ['pending', 'processing', 'completed', 'cancelled'];
const paymentStatuses = ['unpaid', 'paid', 'refund'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const fetchOrders = async () => {
    const res = await fetch('/api/admin/orders');
    setOrders(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusUpdate = async (id, field, value) => {
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });
    fetchOrders();
  };

  if (loading) return <div className="p-8 text-slate-500">Loading...</div>;

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="mt-1 text-slate-600">Track and manage customer orders from checkout.</p>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500">No orders yet.</div>
        ) : orders.map((order) => (
          <div key={order.id} className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-6">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <p className="font-semibold">{order.orderNo}</p>
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                    order.orderStatus === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                    order.orderStatus === 'processing' ? 'bg-blue-50 text-blue-700' :
                    order.orderStatus === 'cancelled' ? 'bg-red-50 text-red-700' :
                    'bg-amber-50 text-amber-700'
                  }`}>{order.orderStatus}</span>
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                    order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700' :
                    order.paymentStatus === 'refund' ? 'bg-red-50 text-red-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>{order.paymentStatus}</span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {new Date(order.createdAt).toLocaleDateString()} | Total: ৳{Number(order.total).toLocaleString()}
                </p>
              </div>
              <button onClick={() => setExpanded(expanded === order.id ? null : order.id)} className="text-sm text-slate-600 hover:text-slate-900">
                {expanded === order.id ? 'Collapse' : 'Details'}
              </button>
            </div>

            {expanded === order.id ? (
              <div className="border-t border-slate-100 p-6 space-y-6">
                {order.details ? (
                  <div className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div><span className="font-medium text-slate-600">Phone:</span> {order.details.phoneNumber || '—'}</div>
                    <div><span className="font-medium text-slate-600">Address:</span> {order.details.shippingAddress}</div>
                    <div><span className="font-medium text-slate-600">Area:</span> {order.details.shippingArea}</div>
                    <div><span className="font-medium text-slate-600">Delivery Charge:</span> ৳{Number(order.details.deliveryCharge).toLocaleString()}</div>
                  </div>
                ) : null}

                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">Items</p>
                  <div className="space-y-2">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                        <span>{item.productTitle} × {item.quantity}</span>
                        <span className="font-medium">৳{(Number(item.purchasePrice) * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Order Status</label>
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleStatusUpdate(order.id, 'orderStatus', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-3 text-sm"
                    >
                      {orderStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Payment Status</label>
                    <select
                      value={order.paymentStatus}
                      onChange={(e) => handleStatusUpdate(order.id, 'paymentStatus', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-3 text-sm"
                    >
                      {paymentStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
