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
      className="group flex flex-col h-full rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden dark:border-slate-700 dark:bg-slate-800"
    >
      {/* Image */}
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800">
        {img ? (
          <img
            src={img}
            alt={product.title}
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300 dark:text-slate-600">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}

        {/* Discount badge */}
        {discount > 0 && (
          <span className="absolute top-2 left-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
            -{discount}%
          </span>
        )}

        {/* Quick view overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors duration-300">
          <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg dark:bg-slate-800/90 dark:text-slate-200">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Quick View
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <h4 className="text-xs font-semibold text-slate-800 line-clamp-2 leading-relaxed group-hover:text-[#2f0f6b] transition-colors dark:text-slate-200 dark:group-hover:text-[#a78bfa]">
          {product.title}
        </h4>

        <div className="mt-auto pt-2 flex items-baseline gap-1.5">
          <span className="text-sm font-bold text-[#2f0f6b] dark:text-[#a78bfa]">
            ৳{price.toLocaleString()}
          </span>
          {originalPrice && (
            <span className="text-[11px] text-slate-400 line-through dark:text-slate-500">
              ৳{originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {!inStock && (
          <span className="mt-1 inline-block rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-500 dark:bg-red-900/20 dark:text-red-400">
            Out of Stock
          </span>
        )}
      </div>
    </Link>
  );
}

export default function RelatedProducts({ products }) {
  if (!products?.length) return null;

  return (
    <div className="mt-12">
      <h2 className="mb-6 text-xl font-bold text-slate-900 sm:text-2xl dark:text-slate-100">Related Products</h2>
      <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2">
        {products.map((r) => (
          <div key={r.id} className="w-1/5 min-w-[160px] flex-shrink-0 snap-start h-full">
            <RelatedCard product={r} />
          </div>
        ))}
      </div>
    </div>
  );
}
