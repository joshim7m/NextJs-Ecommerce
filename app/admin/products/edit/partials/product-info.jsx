export default function ProductInfo({ form, onChange, categories, existingImages, newPreviews, onRemoveExisting, onRemoveNew, onAdd, onGenerateSlug, onGenerateSku }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Title</label>
          <input name="title" value={form.title} onChange={onChange} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Slug</label>
          <div className="mt-1 flex gap-2">
            <input name="slug" value={form.slug} onChange={onChange} className="flex-1 rounded-lg border border-slate-200 p-2.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]" />
            {onGenerateSlug && (
              <button type="button" onClick={onGenerateSlug} disabled={!form.title.trim()} className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition disabled:opacity-40">Generate</button>
            )}
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Description</label>
          <textarea name="description" value={form.description} onChange={onChange} rows={2} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Price (&#x9F3;)</label>
          <input name="unite_price" type="number" step="0.01" value={form.unite_price} onChange={onChange} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Sale Price (&#x9F3;)</label>
          <input name="sale_price" type="number" step="0.01" value={form.sale_price} onChange={onChange} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">SKU</label>
          <div className="mt-1 flex gap-2">
            <input name="sku" value={form.sku} onChange={onChange} className="flex-1 rounded-lg border border-slate-200 p-2.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]" />
            {onGenerateSku && (
              <button type="button" onClick={onGenerateSku} className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Generate</button>
            )}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Stock</label>
          <input name="quantity" type="number" value={form.quantity} onChange={onChange} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Status</label>
          <select name="status" value={form.status} onChange={onChange} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]">
            <option value="draft">Draft</option>
            <option value="publish">Published</option>
          </select>
        </div>
        <div className="">
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Category</label>
          <select name="categorySlug" value={form.categorySlug} onChange={onChange} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b]">
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="">
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Images</label>
          <div className="mt-1 flex flex-wrap gap-3">
            {existingImages.map((img) => (
              <div key={img.id} className="relative group">
                <img src={img.image_path} alt="" className="h-20 w-20 rounded-lg border border-slate-200 object-cover" />
                <button type="button" onClick={() => onRemoveExisting(img.id)} className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition hover:bg-red-600">&times;</button>
              </div>
            ))}
            {newPreviews.map((src, i) => (
              <div key={`new-${i}`} className="relative group">
                <img src={src} alt="" className="h-20 w-20 rounded-lg border-2 border-dashed border-[#2f0f6b] object-cover" />
                <button type="button" onClick={() => onRemoveNew(i)} className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition hover:bg-red-600">&times;</button>
              </div>
            ))}
            <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-[#2f0f6b] hover:text-[#2f0f6b] transition">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              <input type="file" multiple accept="image/*" onChange={onAdd} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
