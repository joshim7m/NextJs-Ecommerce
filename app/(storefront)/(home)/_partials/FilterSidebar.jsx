'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useMemo } from 'react';

export default function FilterSidebar({ categories }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get('category') || null;
  const currentMaxPrice = Number(searchParams.get('maxPrice') || 100000);

  const [localRange, setLocalRange] = useState([0, currentMaxPrice]);
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
  };

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
                    {children.length > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleParent(parent.slug)}
                        className="shrink-0 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        <svg
                          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {isOpen && children.length > 0 && (
                    <div className="ml-5 border-l-2 border-slate-100 pl-2 dark:border-slate-700">
                      {children.map((child) => (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => handleCategoryChange(child.slug)}
                          className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
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
    <aside className="hidden shrink-0 lg:block lg:w-64">
      {filterPanel}
    </aside>
  );
}
