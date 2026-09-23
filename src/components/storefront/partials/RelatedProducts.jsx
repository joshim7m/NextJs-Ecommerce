'use client';

import { useState } from 'react';
import Link from 'next/link';

function RelatedCard({ product }) {
  const [loaded, setLoaded] = useState(false);
  const price = Number(product.sale_price || product.unite_price);
  const originalPrice = product.sale_price ? Number(product.unite_price) : null;
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const img = product.images?.[0]?.image_path;
  const stockQty = product.quantity ?? 0;
  const inStock = stockQty > 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-violet-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
    >
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-violet-50 dark:bg-slate-700">
        {img ? (
          <img
            src={img}
            alt={product.title}
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-violet-200 dark:text-slate-500">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}

        {discount > 0 && (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
            -{discount}% OFF
          </span>
        )}

        {!inStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[2px] dark:bg-slate-900/60">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
              Out of Stock
            </span>
          </div>
        )}

        {/* Hover overlay CTA */}
        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-violet-950/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-slate-800/60">
          <span className="mb-3 flex translate-y-2 items-center gap-1.5 rounded-full bg-brand-gradient px-4 py-1.5 text-xs font-bold text-white opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 bg-brand-gradient-hover dark:bg-violet-500 dark:text-white">
            View Details
            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-800 transition-colors group-hover:text-[#2f0f6b] dark:text-slate-200 dark:group-hover:text-[#a78bfa]">
          {product.title}
        </h4>

        <div className="mt-auto flex items-baseline justify-between gap-1.5 pt-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[#2f0f6b] text-base font-bold dark:text-[#a78bfa]">
              ৳{price.toLocaleString()}
            </span>
            {originalPrice && (
              <span className="text-[11px] text-slate-400 line-through dark:text-slate-500">
                ৳{originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-red-400'}`}
            title={inStock ? 'In stock' : 'Out of stock'}
          />
        </div>
      </div>

      {/* Bottom accent line */}
      <span className="block h-1 origin-left scale-x-0 bg-brand-gradient transition-transform duration-300 group-hover:scale-x-100" />
    </Link>
  );
}

export default function RelatedProducts({ products }) {
  if (!products?.length) return null;

  return (
    <div className="mt-12">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient shadow-sm">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z" />
            </svg>
          </span>
          <span className="text-xl font-extrabold tracking-tight text-brand-gradient sm:text-2xl">Related Products</span>
        </h2>
        <Link href="/products" className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100 hover:text-[#2f0f6b] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
          View All
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      <div className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
        {products.map((r) => (
          <div key={r.id} className="h-full w-1/5 min-w-[150px] flex-shrink-0 snap-start sm:min-w-[170px]">
            <RelatedCard product={r} />
          </div>
        ))}
      </div>
    </div>
  );
}
