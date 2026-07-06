'use client';

import { useEffect, useState, useMemo } from 'react';

const PER_PAGE = 10;

function ImageUpload({ value, onUpload, onRemove }) {
  const [dragging, setDragging] = useState(false);

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setDragging(false); };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onUpload(file);
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) onUpload(e.target.files[0]);
    e.target.value = '';
  };

  return (
    <div className="flex flex-wrap gap-2">
      {value && (
        <div className="group relative">
          <img src={value} alt="" className="h-16 w-32 rounded-lg border border-slate-200 object-cover" />
          <button type="button" onClick={onRemove} className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white opacity-0 transition hover:bg-red-600 group-hover:opacity-100">✕</button>
        </div>
      )}
      <label
        onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDrop={handleDrop}
        className={`flex h-16 w-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed text-slate-300 transition ${
          dragging ? 'border-[#2f0f6b] bg-[#2f0f6b]/5 text-[#2f0f6b]' : 'border-slate-200 hover:border-[#2f0f6b] hover:text-[#2f0f6b]'
        }`}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
        </svg>
        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </label>
    </div>
  );
}

export default function HeroSlidersPage() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', subtitle: '', buttonText: '', buttonLink: '', image: '', isActive: true });
  const [page, setPage] = useState(0);

  const fetchSlides = async () => {
    try {
      const res = await fetch('/api/admin/settings/hero-sliders');
      setSlides(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlides(); }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return slides;
    const q = search.toLowerCase();
    return slides.filter((s) => (s.title || '').toLowerCase().includes(q) || (s.subtitle || '').toLowerCase().includes(q));
  }, [slides, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const paginated = filtered.slice(safePage * PER_PAGE, (safePage + 1) * PER_PAGE);

  const resetForm = () => setForm({ title: '', subtitle: '', buttonText: '', buttonLink: '', image: '', isActive: true });

  const openCreate = () => {
    setEditing('new');
    resetForm();
  };

  const openEdit = (slide) => {
    setEditing(slide.id);
    setForm({
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      buttonText: slide.buttonText || '',
      buttonLink: slide.buttonLink || '',
      image: slide.image || '',
      isActive: slide.isActive,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const uploadImage = async (file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append('images', file);
    fd.append('folder', 'sliders');
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.urls?.[0]) setForm((prev) => ({ ...prev, image: data.urls[0] }));
    } catch {}
  };

  const handleSave = async () => {
    try {
      if (editing === 'new') {
        await fetch('/api/admin/settings/hero-sliders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        await fetch(`/api/admin/settings/hero-sliders/${editing}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
    } catch {}
    setEditing(null);
    resetForm();
    fetchSlides();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this slide?')) return;
    try { await fetch(`/api/admin/settings/hero-sliders/${id}`, { method: 'DELETE' }); } catch {}
    fetchSlides();
  };

  const handleMove = async (id, direction) => {
    const idx = slides.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= slides.length) return;

    const updated = [...slides];
    const temp = updated[idx].order;
    updated[idx].order = updated[newIdx].order;
    updated[newIdx].order = temp;
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    setSlides(updated);

    await Promise.all([
      fetch(`/api/admin/settings/hero-sliders/${updated[idx].id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: updated[idx].order }),
      }),
      fetch(`/api/admin/settings/hero-sliders/${updated[newIdx].id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: updated[newIdx].order }),
      }),
    ]);
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="h-8 w-48 rounded-lg bg-slate-200 animate-pulse" />
        <div className="h-10 w-full rounded-lg bg-slate-100 animate-pulse" />
        <div className="h-64 rounded-xl border border-slate-200 bg-white animate-pulse" />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hero Sliders</h1>
          <p className="mt-0.5 text-sm text-slate-500">{slides.length} {slides.length === 1 ? 'slide' : 'slides'}</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-[#2f0f6b] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2f0f6b]/90">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Slide
        </button>
      </div>

      <div className="relative max-w-xs">
        <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" placeholder="Search slides…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm placeholder-slate-400 focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]" />
      </div>

      {editing && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">{editing === 'new' ? 'Create Slide' : 'Edit Slide'}</h2>
          <div className="space-y-4">
            <ImageUpload value={form.image} onUpload={uploadImage} onRemove={() => setForm((prev) => ({ ...prev, image: '' }))} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">Title</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="Slide title" className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]" />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">Subtitle</label>
                <input name="subtitle" value={form.subtitle} onChange={handleChange} placeholder="Slide subtitle" className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]" />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">Button Text</label>
                <input name="buttonText" value={form.buttonText} onChange={handleChange} placeholder="Shop Now" className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]" />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">Button Link</label>
                <input name="buttonLink" value={form.buttonLink} onChange={handleChange} placeholder="/products" className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="rounded border-slate-300 text-[#2f0f6b] focus:ring-[#2f0f6b]" />
              Active
            </label>
          </div>
          <div className="mt-5 flex gap-3">
            <button onClick={handleSave} className="rounded-lg bg-[#2f0f6b] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2f0f6b]/90">Save</button>
            <button onClick={() => { setEditing(null); resetForm(); }} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Image</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Title</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Subtitle</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Button</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Active</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Order</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginated.map((slide, i) => (
              <tr key={slide.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3">
                  {slide.image ? (
                    <img src={slide.image} alt="" className="h-10 w-20 rounded border border-slate-200 object-cover" />
                  ) : (
                    <span className="inline-flex h-10 w-20 items-center justify-center rounded border border-dashed border-slate-200 text-[10px] text-slate-300">No image</span>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900 max-w-[180px] truncate">{slide.title || <span className="text-slate-300">—</span>}</td>
                <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{slide.subtitle || <span className="text-slate-300">—</span>}</td>
                <td className="px-4 py-3 text-slate-500 max-w-[140px] truncate">
                  {slide.buttonText ? (
                    <span className="text-xs">{slide.buttonText}{slide.buttonLink ? ` → ${slide.buttonLink}` : ''}</span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${slide.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {slide.isActive ? '✓' : '✕'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="inline-flex items-center gap-0.5">
                    <button
                      onClick={() => handleMove(slide.id, -1)}
                      disabled={i === 0}
                      className="rounded p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <span className="mx-1 text-xs font-mono text-slate-400">{slide.order}</span>
                    <button
                      onClick={() => handleMove(slide.id, 1)}
                      disabled={i === slides.length - 1}
                      className="rounded p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(slide)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-[#2f0f6b]/10 hover:text-[#2f0f6b]">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(slide.id)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                  {search ? 'No slides match your search.' : 'No slides yet. Click "New Slide" to create one.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`h-8 w-8 rounded-lg text-sm font-medium transition ${
                i === safePage ? 'bg-[#2f0f6b] text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={safePage === totalPages - 1}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
