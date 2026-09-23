'use client';

import Link from 'next/link';
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
  const colored = useMemo(() => {
    if (!parentCats) return [];
    return parentCats.map((cat, i) => ({
      cat,
      color: colors[i % colors.length],
    }));
  }, [parentCats]);

  return (
    <div className="mt-4 mb-4 flex items-center gap-3 overflow-x-auto lg:hidden scrollbar-none">
      <Link
        href="/"
        className="shrink-0 rounded-full border border-violet-300 bg-violet-50 px-5 py-3 text-sm font-medium whitespace-nowrap text-violet-700 transition-all duration-300 ease-out hover:scale-105 hover:shadow-md active:scale-95 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        <span>All</span>
      </Link>
      {colored.map(({ cat, color }) => (
        <Link
          key={cat.id}
          href={`/categories/${cat.slug}`}
          className={`shrink-0 rounded-full px-5 py-3 text-sm font-medium whitespace-nowrap transition-all duration-300 ease-out hover:scale-105 active:scale-95 ${
            `${color.border} ${color.text} bg-white hover:${color.bg} hover:shadow-md dark:${color.darkBg} dark:${color.darkText} dark:${color.darkBorder} dark:border dark:bg-transparent`
          }`}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
