'use client';

import { useState } from 'react';
import { hasVisibleContent } from '@/src/lib/richText';

const TABS = ['Description', 'Specifications', 'Reviews'];

// Styling for the HTML an admin pastes into the description/specification editors. It arrives
// as real-world markup — headings, lists, tables, images — so it needs an explicit contract
// rather than whatever the browser defaults happen to be. `overflow-x-auto` (not `hidden`)
// because a wide size chart has to stay reachable on a phone instead of being clipped.
const RICH_TEXT_CLASSES = [
  'prose prose-sm max-w-none overflow-x-auto',
  'text-slate-600 dark:text-slate-300',
  '[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg',
  // Tables: full width, visible cell borders, readable header row.
  '[&_table]:w-full [&_table]:border-collapse',
  '[&_td]:border [&_td]:border-slate-200 [&_td]:px-2.5 [&_td]:py-2 [&_td]:align-top',
  '[&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-2.5 [&_th]:py-2 [&_th]:text-left',
  'dark:[&_td]:border-slate-700 dark:[&_th]:border-slate-700 dark:[&_th]:bg-slate-800/60',
  // A table nested in prose picks up the paragraph spacing; flatten it.
  '[&_table]:my-4 [&_table_p]:my-0',
  // Pasted lists arrive as <li><p>text</p></li>, which doubles the gap between items
  // because the inner paragraph adds its own margin. Flatten it the same way.
  '[&_li_p]:my-0',
  // A description photo sits in a paragraph of its own, so it inherits that paragraph's
  // text alignment — full width it still looks fine, but a narrower one needs centring.
  // Inline emoji (WordPress pastes them as <img> too) are unaffected: they are not the
  // paragraph's only child, so the selector does not match.
  '[&_p:has(>img:only-child)]:text-center',
].join(' ');

const Empty = ({ children }) => (
  <p className="text-slate-400 italic dark:text-slate-500">{children}</p>
);

export default function ProductTabs({ product, selectedVariant }) {
  const [active, setActive] = useState('Description');

  // An untouched TipTap editor serialises to `<p></p>`, so a truthiness check would render a
  // blank panel. Rows written before that was normalised still hold it, hence the check here
  // as well as on write.
  const hasDescription = hasVisibleContent(product.description);
  const hasSpecification = hasVisibleContent(product.specification);

  const tabs = {
    Description: (
      <div className={RICH_TEXT_CLASSES}>
        {hasDescription ? (
          <div dangerouslySetInnerHTML={{ __html: product.description }} />
        ) : (
          <Empty>No description available.</Empty>
        )}
      </div>
    ),
    Specifications: (
      <div className="space-y-3 text-sm">
        {hasSpecification ? (
          <div
            className={`${RICH_TEXT_CLASSES} [&_p]:mb-2`}
            dangerouslySetInnerHTML={{ __html: product.specification }}
          />
        ) : null}
        {hasSpecification || selectedVariant?.sku || product.variants?.length ? null : (
          <Empty>No specifications available.</Empty>
        )}
        {selectedVariant?.sku ? (
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400">SKU</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">{selectedVariant.sku}</span>
          </div>
        ) : null}
        {product.variants?.map((v, i) => (
          <div key={v.id} className="rounded-lg border border-violet-200/70 p-3 dark:border-slate-600">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Variant {i + 1}
            </p>
            <div className="mt-2 space-y-1">
              {v.size ? <p className="text-slate-600 dark:text-slate-300"><span className="font-medium">Size:</span> {v.size}</p> : null}
              {v.color ? <p className="text-slate-600 dark:text-slate-300"><span className="font-medium">Color:</span> {v.color}</p> : null}
              {v.sku ? <p className="text-slate-600 dark:text-slate-300"><span className="font-medium">SKU:</span> {v.sku}</p> : null}
              <p className="text-slate-600 dark:text-slate-300">
                <span className="font-medium">Stock:</span>{' '}
                {v.quantity > 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400">{v.quantity} available</span>
                ) : (
                  <span className="text-red-500 dark:text-red-400">Out of stock</span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    ),
    Reviews: (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg className="mb-4 h-10 w-10 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        <p className="text-sm text-slate-500 dark:text-slate-400">No reviews yet.</p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Be the first to review this product.</p>
      </div>
    ),
  };

  return (
    <div>
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActive(tab)}
            className={`relative px-4 py-3 text-sm font-medium transition-colors ${
              active === tab
                ? 'text-[#2f0f6b] dark:text-[#a78bfa]'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {tab}
            {active === tab && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#2f0f6b] dark:bg-[#a78bfa]" />
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
