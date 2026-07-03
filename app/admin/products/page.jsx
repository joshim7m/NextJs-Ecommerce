'use client';

import { useEffect, useState } from 'react';

const emptyForm = {
  title: '', slug: '', description: '', unite_price: '', sale_price: '', compareAtPrice: '',
  inventoryQuantity: '', status: 'draft', image: '', categorySlugs: [],
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  const fetchData = async () => {
    const [prodRes, catRes] = await Promise.all([
      fetch('/api/admin/products'),
      fetch('/api/admin/categories'),
    ]);
    setProducts(await prodRes.json());
    setCategories(await catRes.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => setForm({ ...emptyForm });

  const openCreate = () => { setEditing('new'); resetForm(); };

  const openEdit = (p) => {
    setEditing(p.id);
    setForm({
      title: p.title, slug: p.slug, description: p.description || '',
      unite_price: p.unite_price.toString(), sale_price: p.sale_price?.toString() || '',
      compareAtPrice: p.compareAtPrice?.toString() || '',
      inventoryQuantity: p.inventoryQuantity?.toString() || '',
      status: p.status, image: p.images?.[0]?.image_path || '',
      categorySlugs: p.categories?.map((c) => c.slug) || [],
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryToggle = (slug) => {
    setForm((prev) => ({
      ...prev,
      categorySlugs: prev.categorySlugs.includes(slug)
        ? prev.categorySlugs.filter((s) => s !== slug)
        : [...prev.categorySlugs, slug],
    }));
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) return;
    const url = editing === 'new' ? '/api/admin/products' : `/api/admin/products/${editing}`;
    const method = editing === 'new' ? 'POST' : 'PUT';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setEditing(null);
    resetForm();
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    fetchData();
  };

  if (loading) return <div className="p-8 text-slate-500">Loading...</div>;

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="mt-1 text-slate-600">Manage products and variant pricing for the store.</p>
        </div>
        <button onClick={openCreate} className="rounded-xl bg-slate-900 px-5 py-3 text-sm text-white hover:bg-slate-700">+ New Product</button>
      </div>

      {editing ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">{editing === 'new' ? 'Create Product' : 'Edit Product'}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Title</label>
              <input name="title" value={form.title} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-200 p-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Slug</label>
              <input name="slug" value={form.slug} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-200 p-3" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 p-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Price (৳)</label>
              <input name="unite_price" type="number" value={form.unite_price} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-200 p-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Sale Price (৳)</label>
              <input name="sale_price" type="number" value={form.sale_price} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-200 p-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Compare At Price (৳)</label>
              <input name="compareAtPrice" type="number" value={form.compareAtPrice} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-200 p-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Inventory Quantity</label>
              <input name="inventoryQuantity" type="number" value={form.inventoryQuantity} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-200 p-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-200 p-3">
                <option value="draft">Draft</option>
                <option value="publish">Published</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Image URL</label>
              <input name="image" value={form.image} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-200 p-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Categories</label>
              <div className="mt-2 space-y-2">
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.categorySlugs.includes(cat.slug)} onChange={() => handleCategoryToggle(cat.slug)} className="h-4 w-4 text-slate-900" />
                    {cat.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button onClick={handleSave} className="rounded-xl bg-slate-900 px-5 py-3 text-sm text-white hover:bg-slate-700">Save</button>
            <button onClick={() => { setEditing(null); resetForm(); }} className="rounded-xl border border-slate-200 px-5 py-3 text-sm hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-4 font-medium text-slate-600">Title</th>
              <th className="px-6 py-4 font-medium text-slate-600">Price</th>
              <th className="px-6 py-4 font-medium text-slate-600">Status</th>
              <th className="px-6 py-4 font-medium text-slate-600">Categories</th>
              <th className="px-6 py-4 font-medium text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium">{p.title}</td>
                <td className="px-6 py-4">৳{Number(p.sale_price || p.unite_price).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${p.status === 'publish' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{p.categories?.map((c) => c.name).join(', ') || '—'}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openEdit(p)} className="text-sm text-slate-600 hover:text-slate-900 mr-4">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="text-sm text-red-500 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
            {products.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No products yet.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
