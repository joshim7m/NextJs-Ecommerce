'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest', icon: (cls) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { value: 'oldest', label: 'Oldest', icon: (cls) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { value: 'price_asc', label: 'Price ↑', icon: (cls) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg> },
  { value: 'price_desc', label: 'Price ↓', icon: (cls) => <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg> },
];

export default function SortBar({ productCount }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const currentSort = searchParams.get('sort') || 'latest';
  const current = SORT_OPTIONS.find((o) => o.value === currentSort) || SORT_OPTIONS[0];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSort = (value) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (value === 'latest') {
      sp.delete('sort');
    } else {
      sp.set('sort', value);
    }
    const qs = sp.toString();
    router.push(qs ? `?${qs}` : '/');
    setOpen(false);
  };

  return (
    <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6">
      <p className="text-sm text-slate-500">
        {productCount} {productCount === 1 ? 'product' : 'products'}
      </p>

      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-[#2f0f6b] hover:text-[#2f0f6b] sm:px-4"
        >
          {current.icon('h-4 w-4 shrink-0')}
          <span className="hidden sm:inline">{current.label}</span>
          <svg className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 top-full z-30 mt-1 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
            {SORT_OPTIONS.map((opt) => {
              const isActive = currentSort === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSort(opt.value)}
                  className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition ${
                    isActive
                      ? 'bg-[#2f0f6b]/5 font-medium text-[#2f0f6b]'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {opt.icon('h-4 w-4 shrink-0')}
                  {opt.label}
                  {isActive && (
                    <svg className="ml-auto h-4 w-4 text-[#2f0f6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}