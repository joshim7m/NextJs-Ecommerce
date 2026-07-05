'use client';

import { useState } from 'react';
import Link from 'next/link';

function RelatedCard({ product }) {
  const [loaded, setLoaded] = useState(false);
  const price = Number(product.sale_price || product.unite_price);
  const originalPrice = product.sale_price ? Number(product.unite_price) : null;
  const img = product.images?.[0]?.image_path;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md overflow-hidden dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-700">
        {img ? (
          <img
            src={img}
            alt={product.title}
            className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300 dark:text-slate-600">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-2 sm:p-3">
        <h4 className="text-xs font-medium text-slate-900 line-clamp-2 sm:text-sm dark:text-slate-100">{product.title}</h4>
        <div className="mt-1 flex items-center gap-1">
          <span className="text-sm font-semibold text-[#2f0f6b] dark:text-[#a78bfa]">৳{price.toLocaleString()}</span>
          {originalPrice && (
            <span className="text-xs text-slate-400 line-through dark:text-slate-500">৳{originalPrice.toLocaleString()}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function RelatedProducts({ products }) {
  if (!products?.length) return null;

  return (
    <div className="mt-12">
      <h2 className="mb-6 text-xl font-bold text-slate-900 sm:text-2xl dark:text-slate-100">Related Products</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((r) => (
          <RelatedCard key={r.id} product={r} />
        ))}
      </div>
    </div>
  );
}
