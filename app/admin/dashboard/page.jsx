'use client';

import Link from 'next/link';

const stats = [
  { label: 'Total Products', value: '—', href: '/admin/products', icon: 'products', color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Categories', value: '—', href: '/admin/categories', icon: 'categories', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Orders', value: '—', href: '/admin/orders', icon: 'orders', color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Revenue', value: '—', href: '/admin/orders', icon: 'revenue', color: 'text-violet-600', bg: 'bg-violet-50' },
];

function StatIcon({ icon }) {
  const cls = 'h-5 w-5';
  switch (icon) {
    case 'products':
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
    case 'categories':
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>;
    case 'orders':
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
    case 'revenue':
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  }
}

const quickActions = [
  { label: 'Add Product', href: '/admin/products/create', desc: 'Create a new product listing' },
  { label: 'Manage Categories', href: '/admin/categories', desc: 'Organize your catalog' },
  { label: 'View Orders', href: '/admin/orders', desc: 'Track and fulfill orders' },
];

const recentOrders = [
  { id: '#1001', customer: 'Alice Johnson', status: 'Shipped', total: '$249.99', date: '2 hours ago' },
  { id: '#1002', customer: 'Bob Smith', status: 'Processing', total: '$89.00', date: '5 hours ago' },
  { id: '#1003', customer: 'Carol White', status: 'Pending', total: '$159.99', date: '1 day ago' },
  { id: '#1004', customer: 'David Brown', status: 'Shipped', total: '$399.00', date: '2 days ago' },
];

function StatusBadge({ status }) {
  const colors = {
    Shipped: 'bg-blue-50 text-blue-700',
    Processing: 'bg-amber-50 text-amber-700',
    Pending: 'bg-slate-50 text-slate-600',
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] || colors.Pending}`}>
      {status}
    </span>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{s.label}</p>
              <div className={`rounded-lg ${s.bg} p-2 ${s.color}`}>
                <StatIcon icon={s.icon} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent orders */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm font-medium text-[#2f0f6b] hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pr-4">Order</th>
                  <th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Total</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-3 pr-4 font-medium text-slate-900">{o.id}</td>
                    <td className="py-3 pr-4 text-slate-600">{o.customer}</td>
                    <td className="py-3 pr-4"><StatusBadge status={o.status} /></td>
                    <td className="py-3 pr-4 text-slate-900">{o.total}</td>
                    <td className="py-3 text-slate-400">{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className="block rounded-lg border border-slate-100 p-3 transition hover:border-[#2f0f6b]/20 hover:bg-[#2f0f6b]/5"
              >
                <p className="text-sm font-medium text-slate-900">{a.label}</p>
                <p className="mt-0.5 text-xs text-slate-400">{a.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
