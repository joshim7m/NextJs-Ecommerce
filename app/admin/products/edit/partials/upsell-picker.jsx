'use client';

import { useMemo, useState } from 'react';

const MAX_UPSELLS = 4;

/**
 * Searchable checkbox list of published products. Selection order becomes
 * sortOrder, so the first pick is the first card in the customer's bundle.
 *
 * Curated picks only affect recommendation quality — clearing them reverts the
 * storefront to automatic category/tag/price scoring, which always runs.
 */
export default function UpsellPicker({ products = [], selected = [], onChange, excludeId }) {
  const [search, setSearch] = useState('');

  const selectedIds = useMemo(() => new Set(selected.map((p) => p.id)), [selected]);
  const atCap = selected.length >= MAX_UPSELLS;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    // Nothing renders until the merchandiser actually searches — an
    // unfiltered dump of the catalogue is noise, not a picker.
    if (!term) return [];
    return products
      .filter((product) => product.id !== excludeId)
      .filter((product) => product.title.toLowerCase().includes(term) || (product.sku || '').toLowerCase().includes(term))
      .slice(0, 50);
  }, [products, search, excludeId]);

  const toggle = (product) => {
    if (selectedIds.has(product.id)) {
      onChange(selected.filter((entry) => entry.id !== product.id));
    } else if (!atCap) {
      onChange([...selected, product]);
    }
  };

  return (
    <div>
      <p className="text-sm font-medium text-slate-900 dark:text-white">Frequently Bought Together</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Pick up to {MAX_UPSELLS} products to recommend alongside this one. They show first, in the order you pick them.
        Leave empty to fall back to automatic recommendations.
      </p>

      {selected.length > 0 ? (
        <ol className="mt-3 space-y-1.5">
          {selected.map((product, index) => (
            <li
              key={product.id}
              className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 dark:border-slate-700 dark:bg-slate-700/40"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2f0f6b] text-[10px] font-bold text-white dark:bg-[#a78bfa] dark:text-slate-900">
                {index + 1}
              </span>
              {product.image ? (
                <img src={product.image} alt="" className="h-8 w-8 shrink-0 rounded object-cover" />
              ) : null}
              <span className="min-w-0 flex-1 truncate text-xs text-slate-700 dark:text-slate-200">{product.title}</span>
              <button
                type="button"
                onClick={() => toggle(product)}
                aria-label={`Remove ${product.title}`}
                className="shrink-0 text-slate-400 transition hover:text-red-600 dark:hover:text-red-400"
              >
                &times;
              </button>
            </li>
          ))}
        </ol>
      ) : null}

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products by title or SKU..."
        className="mt-3 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm outline-none transition focus:border-[#2f0f6b] focus:ring-1 focus:ring-[#2f0f6b] dark:border-slate-700 dark:bg-slate-800 dark:focus:border-[#a78bfa] dark:focus:ring-[#a78bfa]"
      />

      {atCap ? (
        <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
          Maximum of {MAX_UPSELLS} reached. Remove one to pick another.
        </p>
      ) : null}

      <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700">
        {!search.trim() ? (
          <p className="p-3 text-sm text-slate-500 dark:text-slate-400">Type to search products.</p>
        ) : filtered.length === 0 ? (
          <p className="p-3 text-sm text-slate-500 dark:text-slate-400">No products found.</p>
        ) : (
          filtered.map((product) => {
            const checked = selectedIds.has(product.id);
            const disabled = !checked && atCap;
            return (
              <label
                key={product.id}
                className={`flex items-center gap-2.5 border-b border-slate-100 px-2.5 py-2 last:border-0 dark:border-slate-700/60 ${
                  disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggle(product)}
                  className="h-4 w-4 shrink-0 rounded border-slate-300 text-[#2f0f6b] focus:ring-[#2f0f6b] dark:border-slate-600 dark:bg-slate-700"
                />
                {product.image ? (
                  <img src={product.image} alt="" className="h-8 w-8 shrink-0 rounded object-cover" />
                ) : null}
                <span className="min-w-0 flex-1 truncate text-sm text-slate-700 dark:text-slate-200">{product.title}</span>
                {product.sku ? (
                  <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">{product.sku}</span>
                ) : null}
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}
