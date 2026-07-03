'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getProduct, getCategories, updateProduct } from '../../../../src/actions/products';

const emptyForm = {
  title: '', slug: '', description: '', unite_price: '', sale_price: '', compareAtPrice: '',
  inventoryQuantity: '', status: 'draft', categorySlug: '',
};

let variantCounter = 0;

function emptyVariant() {
  return {
    _key: `new_${++variantCounter}`,
    id: null,
    sku: '', size: '', color: '', price: '', sale_price: '',
    inventoryQuantity: '', imageId: '', isDefault: false,
    _delete: false,
  };
}

function EditProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [removeImageIds, setRemoveImageIds] = useState([]);
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    Promise.all([getProduct(id), getCategories()]).then(([product, cats]) => {
      if (!product) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setForm({
        title: product.title,
        slug: product.slug,
        description: product.description || '',
        unite_price: product.unite_price.toString(),
        sale_price: product.sale_price?.toString() || '',
        compareAtPrice: product.compareAtPrice?.toString() || '',
        inventoryQuantity: product.inventoryQuantity?.toString() || '',
        status: product.status,
        categorySlug: product.categories?.[0]?.slug || '',
      });
      setExistingImages(product.images || []);
      setCategories(cats);
      const loaded = (product.variants || []).map((v) => ({
        _key: v.id,
        id: v.id,
        sku: v.sku || '',
        size: v.size || '',
        color: v.color || '',
        price: v.price?.toString() || '',
        sale_price: v.sale_price?.toString() || '',
        inventoryQuantity: v.inventoryQuantity?.toString() || '',
        imageId: v.imageId || '',
        isDefault: v.isDefault,
        _delete: false,
      }));
      setVariants(loaded);
      setHasVariants(loaded.length > 0);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    return () => newPreviews.forEach((p) => URL.revokeObjectURL(p));
  }, [newPreviews]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    setNewFiles((prev) => [...prev, ...selected]);
    setNewPreviews((prev) => [...prev, ...selected.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(newPreviews[index]);
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageId) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    setRemoveImageIds((prev) => [...prev, imageId]);
    setVariants((prev) => prev.map((v) => v.imageId === imageId ? { ...v, imageId: '' } : v));
  };

  const handleVariantChange = (key, field, value) => {
    setVariants((prev) => prev.map((v) => v._key === key ? { ...v, [field]: value } : v));
  };

  const addVariant = () => {
    const newV = emptyVariant();
    if (variants.length === 0) newV.isDefault = true;
    setVariants((prev) => [...prev, newV]);
  };

  const removeVariant = (key) => {
    setVariants((prev) => {
      const updated = prev.map((v) => v._key === key ? { ...v, _delete: true } : v);
      const remaining = updated.filter((v) => !v._delete);
      if (remaining.length && remaining.every((v) => !v.isDefault)) {
        remaining[0].isDefault = true;
      }
      return remaining;
    });
  };

  const toggleDefault = (key) => {
    setVariants((prev) => prev.map((v) => ({ ...v, isDefault: v._key === key })));
  };

  const handleSave = async () => {
    if (!form.title || !form.slug || !id) return;
    setSaving(true);
    try {
      let imagePaths = [];
      if (newFiles.length) {
        const uploadForm = new FormData();
        newFiles.forEach((f) => uploadForm.append('images', f));
        const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: uploadForm });
        const uploadData = await uploadRes.json();
        imagePaths = uploadData.urls;
      }
      if (!hasVariants) {
        await updateProduct(id, { ...form, imagePaths, removeImageIds, variants: [] });
      } else {
        await updateProduct(id, { ...form, imagePaths, removeImageIds, variants });
      }
      router.push('/admin/products');
    } catch {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Loading...</div>;

  if (notFound) {
    return (
      <section className="space-y-6">
        <div>
          <Link href="/admin/products" className="text-sm text-slate-500 hover:text-slate-700 transition">&larr; Back to Products</Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Product Not Found</h1>
          <p className="mt-2 text-slate-500">The product you are looking for does not exist.</p>
        </div>
      </section>
    );
  }

  const allImages = [
    ...existingImages.map((img) => ({ id: img.id, url: img.image_path })),
    ...newPreviews.map((url, i) => ({ id: `preview_${i}`, url })),
  ];

  return (
    <section className="space-y-6">
      <div>
        <Link href="/admin/products" className="text-sm text-slate-500 hover:text-slate-700 transition">&larr; Back to Products</Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Edit Product</h1>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Title</label>
            <input name="title" value={form.title} onChange={handleChange} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Slug</label>
            <input name="slug" value={form.slug} onChange={handleChange} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Price (৳)</label>
            <input name="unite_price" type="number" step="0.01" value={form.unite_price} onChange={handleChange} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Sale Price (৳)</label>
            <input name="sale_price" type="number" step="0.01" value={form.sale_price} onChange={handleChange} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Compare At (৳)</label>
            <input name="compareAtPrice" type="number" step="0.01" value={form.compareAtPrice} onChange={handleChange} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Stock</label>
            <input name="inventoryQuantity" type="number" value={form.inventoryQuantity} onChange={handleChange} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]">
              <option value="draft">Draft</option>
              <option value="publish">Published</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Images</label>
            <div className="mt-1 flex flex-wrap gap-3">
              {existingImages.map((img) => (
                <div key={img.id} className="relative group">
                  <img src={img.image_path} alt="" className="h-20 w-20 rounded-lg border border-slate-200 object-cover" />
                  <button type="button" onClick={() => removeExistingImage(img.id)} className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition hover:bg-red-600">✕</button>
                </div>
              ))}
              {newPreviews.map((src, i) => (
                <div key={`new-${i}`} className="relative group">
                  <img src={src} alt="" className="h-20 w-20 rounded-lg border-2 border-dashed border-[#2f0f6b] object-cover" />
                  <button type="button" onClick={() => removeNewImage(i)} className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition hover:bg-red-600">✕</button>
                </div>
              ))}
              <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-[#2f0f6b] hover:text-[#2f0f6b] transition">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
              </label>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Category</label>
            <select name="categorySlug" value={form.categorySlug} onChange={handleChange} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]">
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 border-t border-slate-200 pt-4 mt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={hasVariants} onChange={(e) => { setHasVariants(e.target.checked); if (!e.target.checked) setVariants([]); }} className="h-4 w-4 rounded border-slate-300 text-[#2f0f6b] focus:ring-[#2f0f6b]" />
              <span className="text-sm font-medium text-slate-900">This product has variants (size, color, etc.)</span>
            </label>

            {hasVariants && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Variants</span>
                  <button type="button" onClick={addVariant} className="text-sm font-medium text-[#2f0f6b] hover:text-[#2f0f6b]/80 transition">+ Add Variant</button>
                </div>
                {variants.length === 0 && (
                  <p className="text-sm text-slate-400 py-4 text-center">No variants yet. Click &quot;+ Add Variant&quot; to create one.</p>
                )}
                {variants.map((v) => (
                  <div key={v._key} className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                    <div className="grid gap-3 sm:grid-cols-8 items-end">
                      <div>
                        <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Size</label>
                        <input value={v.size} onChange={(e) => handleVariantChange(v._key, 'size', e.target.value)} placeholder="M" className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Color</label>
                        <input value={v.color} onChange={(e) => handleVariantChange(v._key, 'color', e.target.value)} placeholder="Black" className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Price</label>
                        <input type="number" step="0.01" value={v.price} onChange={(e) => handleVariantChange(v._key, 'price', e.target.value)} placeholder="0" className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Sale Price</label>
                        <input type="number" step="0.01" value={v.sale_price} onChange={(e) => handleVariantChange(v._key, 'sale_price', e.target.value)} placeholder="0" className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Stock</label>
                        <input type="number" value={v.inventoryQuantity} onChange={(e) => handleVariantChange(v._key, 'inventoryQuantity', e.target.value)} placeholder="0" className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Image</label>
                        <select value={v.imageId} onChange={(e) => handleVariantChange(v._key, 'imageId', e.target.value)} className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]">
                          <option value="">None</option>
                          {allImages.map((img) => (
                            <option key={img.id} value={img.id}>{img.url.split('/').pop()}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2 pb-1">
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-500">
                          <input type="radio" name="default_variant" checked={v.isDefault} onChange={() => toggleDefault(v._key)} className="h-3.5 w-3.5 border-slate-300 text-[#2f0f6b] focus:ring-[#2f0f6b]" />
                          Default
                        </label>
                        <button type="button" onClick={() => removeVariant(v._key)} className="text-xs font-medium text-red-400 hover:text-red-600 transition ml-1">Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <button onClick={handleSave} disabled={saving} className="rounded-lg bg-[#2f0f6b] px-4 py-2 text-sm font-medium text-white hover:bg-[#2f0f6b]/90 transition disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
          <Link href="/admin/products" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Cancel</Link>
        </div>
      </div>
    </section>
  );
}

export default function EditProductPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500">Loading...</div>}>
      <EditProductForm />
    </Suspense>
  );
}
