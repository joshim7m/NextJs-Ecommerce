'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useMemo } from 'react';

export default function FilterSidebar({ categories }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentMaxPrice = Number(searchParams.get('maxPrice') || 100000);
  const [localRange, setLocalRange] = useState([0, currentMaxPrice]);

  const parentCats = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories],
  );

  const buildHref = () => {
    const maxPrice = String(localRange[1]);
    return maxPrice ? `?maxPrice=${maxPrice}` : '/';
  };

  const applyPrice = () => {
    router.push(buildHref());
  };

  const filterPanel = (
    <div className="rounded-xl border border-violet-200/70 bg-white p-5 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="space-y-6">
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Categories
          </h4>
          <div className="divide-y divide-indigo-100 dark:divide-transparent">
            <Link
              href="/"
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-violet-100/70 hover:text-[#2f0f6b] transition dark:text-slate-300 dark:hover:bg-slate-700"
            >
              All
            </Link>

            {parentCats.map((parent) => (
              <Link
                key={parent.id}
                href={`/categories/${parent.slug}`}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-violet-100/70 hover:text-[#2f0f6b] transition dark:text-slate-300 dark:hover:bg-slate-700"
              >
                {parent.name}
              </Link>
            ))}
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
              className="w-full rounded-lg bg-brand-gradient px-4 py-2 text-sm text-white shadow-sm transition bg-brand-gradient-hover dark:bg-[#a78bfa] dark:text-slate-900 dark:hover:bg-[#a78bfa]/90"
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
