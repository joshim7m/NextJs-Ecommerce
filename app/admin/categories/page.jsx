'use client';

import { useEffect, useState } from 'react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', image: '', description: '' });

  const fetchCategories = async () => {
    const res = await fetch('/api/admin/categories');
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const resetForm = () => setForm({ name: '', slug: '', image: '', description: '' });

  const openCreate = () => {
    setEditing('new');
    resetForm();
  };

  const openEdit = (cat) => {
    setEditing(cat.id);
    setForm({ name: cat.name, slug: cat.slug, image: cat.image || '', description: cat.description || '' });
  };

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form.name || !form.slug) return;
    if (editing === 'new') {
      await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    } else {
      await fetch(`/api/admin/categories/${editing}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setEditing(null);
    resetForm();
    fetchCategories();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    fetchCategories();
  };

  if (loading) return <div className="p-8 text-slate-500">Loading...</div>;

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="mt-1 text-slate-600">Manage category listings used by the storefront.</p>
        </div>
        <button onClick={openCreate} className="rounded-xl bg-slate-900 px-5 py-3 text-sm text-white hover:bg-slate-700">+ New Category</button>
      </div>

      {editing ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">{editing === 'new' ? 'Create Category' : 'Edit Category'}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-200 p-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Slug</label>
              <input name="slug" value={form.slug} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-200 p-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Image URL</label>
              <input name="image" value={form.image} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-200 p-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <input name="description" value={form.description} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-200 p-3" />
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
              <th className="px-6 py-4 font-medium text-slate-600">Name</th>
              <th className="px-6 py-4 font-medium text-slate-600">Slug</th>
              <th className="px-6 py-4 font-medium text-slate-600">Description</th>
              <th className="px-6 py-4 font-medium text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium">{cat.name}</td>
                <td className="px-6 py-4 text-slate-500">{cat.slug}</td>
                <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{cat.description || '—'}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openEdit(cat)} className="text-sm text-slate-600 hover:text-slate-900 mr-4">Edit</button>
                  <button onClick={() => handleDelete(cat.id)} className="text-sm text-red-500 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
            {categories.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No categories yet.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
