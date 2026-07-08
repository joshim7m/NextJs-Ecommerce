'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

const colors = [
  { ring: 'ring-violet-400', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', darkBg: 'dark:bg-violet-900/30', darkText: 'dark:text-violet-300', darkBorder: 'dark:border-violet-700' },
  { ring: 'ring-pink-400', bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', darkBg: 'dark:bg-pink-900/30', darkText: 'dark:text-pink-300', darkBorder: 'dark:border-pink-700' },
  { ring: 'ring-amber-400', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', darkBg: 'dark:bg-amber-900/30', darkText: 'dark:text-amber-300', darkBorder: 'dark:border-amber-700' },
  { ring: 'ring-emerald-400', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', darkBg: 'dark:bg-emerald-900/30', darkText: 'dark:text-emerald-300', darkBorder: 'dark:border-emerald-700' },
  { ring: 'ring-sky-400', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', darkBg: 'dark:bg-sky-900/30', darkText: 'dark:text-sky-300', darkBorder: 'dark:border-sky-700' },
  { ring: 'ring-rose-400', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', darkBg: 'dark:bg-rose-900/30', darkText: 'dark:text-rose-300', darkBorder: 'dark:border-rose-700' },
  { ring: 'ring-teal-400', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', darkBg: 'dark:bg-teal-900/30', darkText: 'dark:text-teal-300', darkBorder: 'dark:border-teal-700' },
  { ring: 'ring-orange-400', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', darkBg: 'dark:bg-orange-900/30', darkText: 'dark:text-orange-300', darkBorder: 'dark:border-orange-700' },
];

export default function MobileCategoryChips({ parentCats }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category') || null;

  const buildHref = (slug) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (slug === null || slug === undefined) {
      sp.delete('category');
    } else {
      sp.set('category', slug);
    }
    const qs = sp.toString();
    return qs ? `?${qs}` : '/';
  };

  const colored = useMemo(() => {
    if (!parentCats) return [];
    return parentCats.map((cat, i) => ({
      cat,
      color: colors[i % colors.length],
    }));
  }, [parentCats]);

  return (
    <div className="mt-4 mb-4 flex items-center gap-3 overflow-x-auto lg:hidden scrollbar-none">
      <button
        type="button"
        onClick={() => router.push(buildHref(null))}
        className={`shrink-0 rounded-full px-5 py-3 text-sm font-medium whitespace-nowrap transition-all duration-300 ease-out hover:scale-105 active:scale-95 ${
          !selectedCategory
            ? 'bg-slate-800 text-white ring-2 ring-slate-400 shadow-lg dark:bg-white dark:text-slate-900 dark:ring-slate-400'
            : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 hover:shadow-md dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
        }`}
      >
        <span>All</span>
      </button>
      {colored.map(({ cat, color }) => {
        const active = selectedCategory === cat.slug;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => router.push(buildHref(cat.slug))}
            className={`shrink-0 rounded-full px-5 py-3 text-sm font-medium whitespace-nowrap transition-all duration-300 ease-out hover:scale-105 active:scale-95 ${
              active
                ? `${color.bg} ${color.text} ${color.ring} ring-2 shadow-lg`
                : `${color.border} ${color.text} bg-white hover:${color.bg} hover:shadow-md dark:${color.darkBg} dark:${color.darkText} dark:${color.darkBorder} dark:border dark:bg-transparent`
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
