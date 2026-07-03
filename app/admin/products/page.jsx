'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { getProducts, getCategories, deleteProduct } from '../../../src/actions/products';
import ConfirmDialog from '../../../src/components/ConfirmDialog';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    Promise.all([getProducts(), getCategories()]).then(([p, c]) => {
      setProducts(p);
      setCategories(c);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let list = products;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q));
    }
    if (filterStatus !== 'all') list = list.filter((p) => p.status === filterStatus);
    if (filterCategory !== 'all') list = list.filter((p) => p.categories?.some((c) => c.slug === filterCategory));
    return list;
  }, [products, search, filterStatus, filterCategory]);

  const refetch = () => Promise.all([getProducts(), getCategories()]).then(([p, c]) => { setProducts(p); setCategories(c); });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await deleteProduct(deleteTarget); } catch {}
    setDeleteTarget(null);
    refetch();
  };

  if (loading) return <div className="p-8 text-slate-500">Loading...</div>;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="mt-0.5 text-sm text-slate-500">{products.length} {products.length === 1 ? 'product' : 'products'}</p>
        </div>
        <Link href="/admin/products/create" className="rounded-lg bg-[#2f0f6b] px-4 py-2 text-sm font-medium text-white hover:bg-[#2f0f6b]/90 transition">+ New Product</Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm placeholder-slate-400 focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]">
          <option value="all">All Status</option>
          <option value="publish">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]">
          <option value="all">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        {(filterStatus !== 'all' || filterCategory !== 'all' || search) && (
          <button onClick={() => { setFilterStatus('all'); setFilterCategory('all'); setSearch(''); }} className="text-sm text-slate-500 hover:text-slate-700 transition">Clear</button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 w-12"></th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Title</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Price</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Categories</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Stock</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-2">
                  {p.images?.[0]?.image_path ? (
                    <img src={p.images[0].image_path} alt="" className="h-10 w-10 rounded-lg object-cover border border-slate-200" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-300 border border-slate-200">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900 max-w-[200px] truncate">{p.title}</td>
                <td className="px-4 py-3">
                  <span className="font-medium text-slate-900">৳{Number(p.sale_price || p.unite_price).toLocaleString()}</span>
                  {p.sale_price ? <span className="ml-1.5 text-xs text-slate-400 line-through">৳{Number(p.unite_price).toLocaleString()}</span> : null}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${p.status === 'publish' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${p.status === 'publish' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {p.status === 'publish' ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 max-w-[150px] truncate">{p.categories?.map((c) => c.name).join(', ') || '—'}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-sm font-medium ${(p.inventoryQuantity ?? 0) > 0 ? 'text-slate-900' : 'text-red-400'}`}>{p.inventoryQuantity ?? '—'}</span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Link href={`/admin/products/edit?id=${p.id}`} className="text-sm font-medium text-slate-600 hover:text-[#2f0f6b] transition mr-3">Edit</Link>
                  <button onClick={() => setDeleteTarget(p.id)} className="text-sm font-medium text-red-400 hover:text-red-600 transition">Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">{search || filterStatus !== 'all' || filterCategory !== 'all' ? 'No products match your filters.' : 'No products yet.'}</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
}
