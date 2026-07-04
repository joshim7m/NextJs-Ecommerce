'use client';

import { useState } from 'react';

const TABS = ['Description', 'Specifications', 'Reviews'];

export default function ProductTabs({ product, selectedVariant }) {
  const [active, setActive] = useState('Description');

  const tabs = {
    Description: (
      <div className="prose prose-sm max-w-none text-slate-600">
        {product.description ? (
          <p>{product.description}</p>
        ) : (
          <p className="text-slate-400 italic">No description available.</p>
        )}
      </div>
    ),
    Specifications: (
      <div className="space-y-3 text-sm">
        {selectedVariant?.sku ? (
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">SKU</span>
            <span className="font-medium text-slate-900">{selectedVariant.sku}</span>
          </div>
        ) : null}
        {product.variants?.map((v, i) => (
          <div key={v.id} className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Variant {i + 1}
            </p>
            <div className="mt-2 space-y-1">
              {v.size ? <p className="text-slate-600"><span className="font-medium">Size:</span> {v.size}</p> : null}
              {v.color ? <p className="text-slate-600"><span className="font-medium">Color:</span> {v.color}</p> : null}
              {v.sku ? <p className="text-slate-600"><span className="font-medium">SKU:</span> {v.sku}</p> : null}
              <p className="text-slate-600">
                <span className="font-medium">Stock:</span>{' '}
                {v.inventoryQuantity > 0 ? (
                  <span className="text-emerald-600">{v.inventoryQuantity} available</span>
                ) : (
                  <span className="text-red-500">Out of stock</span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    ),
    Reviews: (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg className="mb-4 h-10 w-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        <p className="text-sm text-slate-500">No reviews yet.</p>
        <p className="mt-1 text-xs text-slate-400">Be the first to review this product.</p>
      </div>
    ),
  };

  return (
    <div>
      <div className="flex border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActive(tab)}
            className={`relative px-4 py-3 text-sm font-medium transition-colors ${
              active === tab
                ? 'text-[#2f0f6b]'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
            {active === tab && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#2f0f6b]" />
            )}
          </button>
        ))}
      </div>
      <div className="py-6">
        {tabs[active]}
      </div>
    </div>
  );
}
