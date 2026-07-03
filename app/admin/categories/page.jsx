'use client';

import { useEffect, useState, useMemo } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../../src/actions/categories';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', image: '', description: '' });

  useEffect(() => {
    getCategories().then((data) => { setCategories(data); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
  }, [categories, search]);

  const resetForm = () => setForm({ name: '', slug: '', image: '', description: '' });
  const openCreate = () => { setEditing('new'); resetForm(); };

  const openEdit = (cat) => {
    setEditing(cat.id);
    setForm({ name: cat.name, slug: cat.slug, image: cat.image || '', description: cat.description || '' });
  };

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form.name || !form.slug) return;
    try {
      if (editing === 'new') {
        await createCategory(form);
      } else {
        await updateCategory(editing, form);
      }
    } catch {}
    setEditing(null);
    resetForm();
    getCategories().then(setCategories);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try { await deleteCategory(id); } catch {}
    getCategories().then(setCategories);
  };

  if (loading) return <div className="p-8 text-slate-500">Loading...</div>;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="mt-0.5 text-sm text-slate-500">{categories.length} {categories.length === 1 ? 'category' : 'categories'}</p>
        </div>
        <button onClick={openCreate} className="rounded-lg bg-[#2f0f6b] px-4 py-2 text-sm font-medium text-white hover:bg-[#2f0f6b]/90 transition">+ New Category</button>
      </div>

      <div className="relative max-w-xs">
        <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" placeholder="Search categories…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm placeholder-slate-400 focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]" />
      </div>

      {editing ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">{editing === 'new' ? 'Create Category' : 'Edit Category'}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Slug</label>
              <input name="slug" value={form.slug} onChange={handleChange} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Image URL</label>
              <input name="image" value={form.image} onChange={handleChange} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Description</label>
              <input name="description" value={form.description} onChange={handleChange} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]" />
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button onClick={handleSave} className="rounded-lg bg-[#2f0f6b] px-4 py-2 text-sm font-medium text-white hover:bg-[#2f0f6b]/90 transition">Save</button>
            <button onClick={() => { setEditing(null); resetForm(); }} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Cancel</button>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Slug</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Description</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Products</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((cat) => (
              <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900">{cat.name}</td>
                <td className="px-4 py-3 text-slate-500">{cat.slug}</td>
                <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{cat.description || '—'}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-medium text-slate-600">{cat._count?.products ?? 0}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(cat)} className="text-sm font-medium text-slate-600 hover:text-[#2f0f6b] transition mr-3">Edit</button>
                  <button onClick={() => handleDelete(cat.id)} className="text-sm font-medium text-red-400 hover:text-red-600 transition">Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">{search ? 'No categories match your search.' : 'No categories yet.'}</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
