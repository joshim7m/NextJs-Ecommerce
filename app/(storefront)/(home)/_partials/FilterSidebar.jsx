'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useMemo } from 'react';

export default function FilterSidebar({ categories }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get('category') || null;
  const currentMaxPrice = Number(searchParams.get('maxPrice') || 100000);

  const [localRange, setLocalRange] = useState([0, currentMaxPrice]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedParents, setExpandedParents] = useState(new Set());

  const parentCats = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories],
  );

  const childMap = useMemo(() => {
    const map = {};
    for (const c of categories) {
      if (c.parentId) {
        if (!map[c.parentId]) map[c.parentId] = [];
        map[c.parentId].push(c);
      }
    }
    return map;
  }, [categories]);

  const activeCount = useMemo(() => {
    let count = 0;
    if (selectedCategory) count++;
    if (currentMaxPrice < 100000) count++;
    return count;
  }, [selectedCategory, currentMaxPrice]);

  const buildHref = (params) => {
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '' || value === '0') {
        sp.delete(key);
      } else {
        sp.set(key, value);
      }
    });
    const qs = sp.toString();
    return qs ? `?${qs}` : '/';
  };

  const handleCategoryChange = (slug) => {
    router.push(buildHref({ category: slug }));
    setMobileOpen(false);
  };

  const toggleParent = (slug) => {
    setExpandedParents((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const applyPrice = () => {
    router.push(buildHref({ maxPrice: String(localRange[1]) }));
    setMobileOpen(false);
  };

  const clearAll = () => router.push('/');

  const btnClass = (isActive) =>
    `block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
      isActive
        ? 'bg-[#2f0f6b] text-white dark:bg-[#a78bfa] dark:text-slate-900'
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
    }`;

  const filterPanel = (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="space-y-6">
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Categories
          </h4>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => handleCategoryChange(null)}
              className={btnClass(!selectedCategory)}
            >
              All
            </button>

            {parentCats.map((parent) => {
              const children = childMap[parent.id] || [];
              const isParentSelected = selectedCategory === parent.slug;
              const isOpen = expandedParents.has(parent.slug);

              return (
                <div key={parent.id}>
                  <div className="flex items-center gap-1">
                    {children.length > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleParent(parent.slug)}
                        className="shrink-0 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        <svg
                          className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                    {children.length === 0 && <span className="w-5" />}
                    <button
                      type="button"
                      onClick={() => handleCategoryChange(parent.slug)}
                      className={`flex-1 rounded-lg px-3 py-2 text-left text-sm transition ${
                        isParentSelected
                          ? 'bg-[#2f0f6b] text-white dark:bg-[#a78bfa] dark:text-slate-900'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      {parent.name}
                    </button>
                  </div>

                  {isOpen && children.length > 0 && (
                    <div className="ml-5 border-l-2 border-slate-100 pl-2 dark:border-slate-700">
                      {children.map((child) => (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => handleCategoryChange(child.slug)}
                          className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition ${
                            selectedCategory === child.slug
                              ? 'bg-[#2f0f6b] text-white dark:bg-[#a78bfa] dark:text-slate-900'
                              : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
                          }`}
                        >
                          {child.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Price Range
          </h4>
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="100000"
              step="100"
              value={localRange[1]}
              onChange={(e) => setLocalRange([0, Number(e.target.value)])}
              className="w-full accent-[#2f0f6b] dark:accent-[#a78bfa]"
            />
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
              <span>৳0</span>
              <span>৳{localRange[1].toLocaleString()}</span>
            </div>
            <button
              type="button"
              onClick={applyPrice}
              className="w-full rounded-lg bg-[#2f0f6b] px-4 py-2 text-sm text-white transition hover:bg-[#2f0f6b]/90 dark:bg-[#a78bfa] dark:text-slate-900 dark:hover:bg-[#a78bfa]/90"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <aside className="w-full shrink-0 lg:w-64">
      {/* Mobile filter toggle */}
      <div className="flex items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex flex-1 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        >
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2.586a1 1 0 0 1-.293.707l-6.414 6.414a1 1 0 0 0-.293.707V17l-4 4v-6.586a1 1 0 0 0-.293-.707L3.293 7.293A1 1 0 0 1 3 6.586V4z" />
            </svg>
            Filters {activeCount > 0 && `(${activeCount})`}
          </span>
          <svg className={`h-4 w-4 transition-transform ${mobileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400"
          >
            Clear
          </button>
        )}
      </div>

      {/* Mobile horizontal category chips — show parent categories only */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden scrollbar-none">
        <button
          type="button"
          onClick={() => handleCategoryChange(null)}
          className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium whitespace-nowrap transition ${
            !selectedCategory
              ? 'bg-[#2f0f6b] text-white dark:bg-[#a78bfa] dark:text-slate-900'
              : 'border border-slate-200 bg-white text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          All
        </button>
        {parentCats.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleCategoryChange(cat.slug)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium whitespace-nowrap transition ${
              selectedCategory === cat.slug
                ? 'bg-[#2f0f6b] text-white dark:bg-[#a78bfa] dark:text-slate-900'
                : 'border border-slate-200 bg-white text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Mobile collapsible panel */}
      {mobileOpen && <div className="mt-3 lg:hidden">{filterPanel}</div>}

      {/* Desktop sidebar — always visible */}
      <div className="hidden lg:block">{filterPanel}</div>
    </aside>
  );
}
