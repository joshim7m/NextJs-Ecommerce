'use client';

import { useState, useRef, useEffect } from 'react';

export default function ImageGallery({ images, title, variantImageIndex }) {
  const [selected, setSelected] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (variantImageIndex >= 0) setSelected(variantImageIndex);
  }, [variantImageIndex]);

  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, [selected]);

  const items = images?.length ? images : [];
  const active = items[selected] || null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row-reverse sm:gap-4">
      <div className="relative flex-1 overflow-hidden rounded-xl bg-slate-100 sm:rounded-2xl dark:bg-slate-700">
        <div className="aspect-square w-full sm:aspect-auto sm:h-[36rem]">
          {!loaded && !error && (
            <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-600" />
          )}
          {active && !error ? (
            <img
              ref={imgRef}
              src={active.image_path}
              alt={active.altText || title}
              className={`h-full w-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400 dark:text-slate-500">
              <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {items.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-col sm:overflow-x-visible scrollbar-none">
          {items.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => { setSelected(i); setLoaded(false); setError(false); }}
              className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition sm:h-16 sm:w-16 ${
                i === selected ? 'border-[#2f0f6b] dark:border-[#a78bfa]' : 'border-slate-200 hover:border-slate-300 dark:border-slate-600 dark:hover:border-slate-500'
              }`}
            >
              <img
                src={img.image_path}
                alt={img.altText || ''}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
