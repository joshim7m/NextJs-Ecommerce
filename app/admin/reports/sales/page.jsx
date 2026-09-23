'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { getOrderReport } from '../../../../src/actions/orders';
import { buildXlsx, downloadBlob } from '../../../../src/lib/xlsx';

const PER_PAGE = 10;

const presets = ['Today', 'This Week', 'This Month', 'Last 1 Month', 'Custom'];

const SKIP_STATUSES = ['cancelled', 'return', 'incomplete'];

const orderStatusColors = {
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  processing: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  return: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  incomplete: 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400',
};

const MAX_RANGE_DAYS = 366;

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function computeRange(preset, customFrom, customTo) {
  const now = new Date();
  const today = startOfDay(now);
  switch (preset) {
    case 'Today':
      return { from: today, to: endOfDay(now) };
    case 'This Week': {
      const from = startOfDay(new Date(today));
      from.setDate(from.getDate() - from.getDay());
      return { from, to: endOfDay(now) };
    }
    case 'This Month': {
      const from = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from, to: endOfDay(now) };
    }
    case 'Last 1 Month': {
      const from = new Date(today);
      from.setDate(from.getDate() - 30);
      return { from, to: endOfDay(now) };
    }
    case 'Custom': {
      if (!customFrom || !customTo) return null;
      const from = startOfDay(new Date(customFrom + 'T00:00:00'));
      const to = endOfDay(new Date(customTo + 'T00:00:00'));
      if (isNaN(from.getTime()) || isNaN(to.getTime()) || from > to) return null;
      return { from, to };
    }
    default:
      return null;
  }
}

function rangeDays(from, to) {
  return (endOfDay(to) - startOfDay(from)) / 86400000;
}

function Toast({ toast, onClose }) {
  if (!toast) return null;
  const isSuccess = toast.type === 'success';
  const isWarn = toast.type === 'warn';
  return (
    <div className="fixed left-4 right-4 top-20 z-50 animate-fade-in sm:left-auto sm:right-6">
      <div
        className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md sm:px-5 sm:py-3.5 ${
          isSuccess
            ? 'border-emerald-200 bg-emerald-50/95 text-emerald-800'
            : isWarn
              ? 'border-amber-200 bg-amber-50/95 text-amber-800'
              : 'border-red-200 bg-red-50/95 text-red-800'
        }`}
      >
        {isSuccess ? (
          <svg className="h-5 w-5 shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className={`h-5 w-5 shrink-0 ${isWarn ? 'text-amber-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <p className="flex-1 text-sm font-medium">{toast.message}</p>
        <button
          type="button"
          onClick={onClose}
          className={`ml-2 shrink-0 rounded-lg p-1 transition ${
            isSuccess ? 'hover:bg-emerald-100' : isWarn ? 'hover:bg-amber-100' : 'hover:bg-red-100'
          }`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function SummaryCard({ icon, bg, text, label, value, sub }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bg} ${text}`}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{value}</p>
          {sub && <p className="text-xs text-slate-400 dark:text-slate-500">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: '2-digit' });
}

function formatTime(d) {
  return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
}

export default function AdminSalesReportPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState('Last 1 Month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [customError, setCustomError] = useState('');
  const [selected, setSelected] = useState({});
  const [page, setPage] = useState(0);
  const [toast, setToast] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [siteInfo, setSiteInfo] = useState({ siteName: '', mobile: '' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    fetch('/api/admin/settings/site')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setSiteInfo({ siteName: data.siteName || '', mobile: data.mobile || '' });
      })
      .catch(() => {});
  }, []);

  const range = useMemo(() => {
    const r = computeRange(preset, customFrom, customTo);
    return r && rangeDays(r.from, r.to) <= MAX_RANGE_DAYS ? r : null;
  }, [preset, customFrom, customTo]);

  useEffect(() => {
    if (preset === 'Custom') {
      if (!customFrom || !customTo) return;
      if (rangeDays(new Date(customFrom + 'T00:00:00'), new Date(customTo + 'T00:00:00')) > MAX_RANGE_DAYS) {
        setCustomError('Custom range is capped at 1 year.');
        return;
      }
      if (new Date(customFrom) > new Date(customTo)) {
        setCustomError('Start date must be on or before end date.');
        return;
      }
      setCustomError('');
    } else {
      setCustomError('');
    }
    if (!range) return;
    setLoading(true);
    setSelected({});
    setPage(0);
    getOrderReport(range.from.toISOString(), range.to.toISOString())
      .then((data) => setOrders(data || []))
      .catch(() => showToast('Failed to load orders.', 'error'))
      .finally(() => setLoading(false));
  }, [range?.from?.getTime(), range?.to?.getTime()]);

  const summary = useMemo(() => {
    const counted = orders.filter((o) => !SKIP_STATUSES.includes(o.orderStatus));
    return {
      orders: orders.length,
      revenue: counted.reduce((s, o) => s + Number(o.total || 0), 0),
      items: orders.reduce((s, o) => s + (o.items || []).reduce((si, i) => si + (i.quantity || 0), 0), 0),
    };
  }, [orders]);

  const totalPages = Math.max(1, Math.ceil(orders.length / PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const paginated = orders.slice(safePage * PER_PAGE, (safePage + 1) * PER_PAGE);

  const eligibleCount = orders.filter((o) => !SKIP_STATUSES.includes(o.orderStatus)).length;
  const selectedIds = Object.keys(selected).filter((id) => selected[id]);
  const selectedOrders = orders.filter((o) => selectedIds.includes(o.id));
  const selectedEligible = selectedOrders.filter((o) => !SKIP_STATUSES.includes(o.orderStatus));
  const allPageSelected = paginated.length > 0 && paginated.every((o) => selected[o.id]);

  const toggleAllPage = () => {
    const next = { ...selected };
    const shouldSelect = !allPageSelected;
    paginated.forEach((o) => { next[o.id] = shouldSelect; });
    setSelected(next);
  };

  const toggleOne = (id) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const buildRows = (list) => {
    const header = ['Invoice', 'Name', 'Address', 'Phone', 'Amount', 'Note', 'Lot', 'Contact Name', 'Contact Number'];
    const rows = list.map((o) => {
      const invoice = (o.items || [])
        .map((i) => [i.productTitle, i.variantName].filter(Boolean).join(' ').trim())
        .join(', ');
      return [
        invoice,
        o.details?.customerName || '',
        o.details?.shippingAddress || '',
        o.details?.phoneNumber || '',
        String(Number(o.total || 0)),
        'null',
        '',
        siteInfo.siteName,
        siteInfo.mobile,
      ];
    });
    return [header, ...rows];
  };

  const exportXlsx = async (list, label) => {
    const eligible = list.filter((o) => !SKIP_STATUSES.includes(o.orderStatus));
    if (eligible.length === 0) {
      showToast(`No eligible orders to export (${label}).`, 'warn');
      return;
    }
    const skipped = list.length - eligible.length;
    setExporting(true);
    try {
      const blob = await buildXlsx(buildRows(eligible), {
        sheetName: 'Courier Report',
        colWidths: [30, 20, 40, 15, 10, 8, 6, 20, 15],
      });
      const today = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `courier-report-${today}.xlsx`);
      showToast(
        `Exported ${eligible.length} ${eligible.length === 1 ? 'order' : 'orders'}${skipped > 0 ? ` — ${skipped} skipped (cancelled/return/incomplete)` : ''}.`
      );
    } catch {
      showToast('Export failed. Please try again.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const exportSelected = () => exportXlsx(selectedOrders, 'Export Selected');

  const exportAll = () => exportXlsx(orders, 'Export All');

  return (
    <section className="space-y-4 sm:space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Sales Report</h1>
        <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {loading ? 'Loading…' : `${orders.length} ${orders.length === 1 ? 'order' : 'orders'} in range`}
          {range && !loading && (
            <> · {formatDate(range.from)} – {formatDate(range.to)}</>
          )}
        </p>
      </div>

      {/* Filter bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => { setPreset(p); setCustomError(''); }}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                preset === p
                  ? 'bg-[#2f0f6b] text-white dark:bg-[#a78bfa] dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        {preset === 'Custom' && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Start date</label>
              <input
                type="date"
                value={customFrom}
                max={customTo || undefined}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">End date</label>
              <input
                type="date"
                value={customTo}
                min={customFrom || undefined}
                onChange={(e) => setCustomTo(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            {customError && <p className="text-xs font-medium text-red-600 dark:text-red-400">{customError}</p>}
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
        <SummaryCard
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          bg="bg-amber-100"
          text="text-amber-600 dark:text-amber-400"
          label="Orders"
          value={summary.orders}
          sub="all statuses in range"
        />
        <SummaryCard
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          bg="bg-emerald-100"
          text="text-emerald-600 dark:text-emerald-400"
          label="Revenue"
          value={`৳${summary.revenue.toLocaleString()}`}
          sub="excl. cancelled/return/incomplete"
        />
        <SummaryCard
          icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          bg="bg-purple-100"
          text="text-purple-600 dark:text-purple-400"
          label="Items Sold"
          value={summary.items}
          sub="total quantity"
        />
      </div>

      {/* Export bar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={exportSelected}
          disabled={exporting || selectedEligible.length === 0}
          className="rounded-lg bg-[#2f0f6b] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2f0f6b]/90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#a78bfa] dark:text-slate-900 dark:hover:bg-[#a78bfa]/90"
        >
          {exporting ? 'Exporting…' : `Export Selected (${selectedEligible.length})`}
        </button>
        <button
          type="button"
          onClick={exportAll}
          disabled={exporting || eligibleCount === 0}
          className="rounded-lg border border-[#2f0f6b] px-4 py-2 text-sm font-medium text-[#2f0f6b] transition hover:bg-[#2f0f6b]/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#a78bfa] dark:text-[#a78bfa] dark:hover:bg-[#a78bfa]/10"
        >
          Export All ({eligibleCount})
        </button>
        <p className="text-xs text-slate-400 dark:text-slate-500">Cancelled / return / incomplete orders are skipped on export.</p>
      </div>

      {/* Orders table (desktop) */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-900/50">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={toggleAllPage}
                  className="h-4 w-4 rounded border-slate-300 accent-[#2f0f6b] dark:border-slate-600 dark:accent-[#a78bfa]"
                />
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Order No</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Date</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Customer</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Phone</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Address</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Items</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Amount</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {paginated.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-700/30">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={!!selected[order.id]}
                    onChange={() => toggleOne(order.id)}
                    className="h-4 w-4 rounded border-slate-300 accent-[#2f0f6b] dark:border-slate-600 dark:accent-[#a78bfa]"
                  />
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.orderNo}`} className="font-medium text-[#2f0f6b] hover:underline dark:text-[#a78bfa]">
                    {order.orderNo}
                  </Link>
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap text-slate-500 dark:text-slate-400">
                  {formatDate(order.createdAt)} {formatTime(order.createdAt)}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{order.details?.customerName || '—'}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{order.details?.phoneNumber || '—'}</td>
                <td className="max-w-[220px] truncate px-4 py-3 text-xs text-slate-500 dark:text-slate-400" title={order.details?.shippingAddress || ''}>
                  {order.details?.shippingAddress || '—'}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                    {(order.items || []).length} item{(order.items || []).length === 1 ? '' : 's'}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">৳{Number(order.total).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${orderStatusColors[order.orderStatus] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                    {order.orderStatus}
                  </span>
                </td>
              </tr>
            ))}
            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center">
                  <svg className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-sm text-slate-400 dark:text-slate-500">No orders found for this date range.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Orders list (mobile) */}
      <div className="space-y-3 md:hidden">
        {paginated.map((order) => (
          <div key={order.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <input
                type="checkbox"
                checked={!!selected[order.id]}
                onChange={() => toggleOne(order.id)}
                className="h-4 w-4 shrink-0 rounded border-slate-300 accent-[#2f0f6b] dark:border-slate-600 dark:accent-[#a78bfa]"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link href={`/admin/orders/${order.orderNo}`} className="text-sm font-semibold text-[#2f0f6b] hover:underline dark:text-[#a78bfa]">
                    {order.orderNo}
                  </Link>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${orderStatusColors[order.orderStatus] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                    {order.orderStatus}
                  </span>
                </div>
                <p className="mt-0.5 text-xs font-medium text-slate-900 dark:text-white">{order.details?.customerName || '—'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{order.details?.phoneNumber || ''}</p>
                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                  {formatDate(order.createdAt)} {formatTime(order.createdAt)} · ৳{Number(order.total).toLocaleString()} · {(order.items || []).length} item{(order.items || []).length === 1 ? '' : 's'}
                </p>
              </div>
            </div>
          </div>
        ))}
        {!loading && orders.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
            No orders found for this date range.
          </div>
        )}
      </div>

      {/* Pagination */}
      {orders.length > PER_PAGE && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Page {safePage + 1} of {totalPages} · {orders.length} orders
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage(safePage - 1)}
              disabled={safePage === 0}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setPage(safePage + 1)}
              disabled={safePage >= totalPages - 1}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
