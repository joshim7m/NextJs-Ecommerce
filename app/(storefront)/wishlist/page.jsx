'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { loadWishlist, clearWishlist } from '../../../src/lib/wishlistStorage';
import ProductGrid from '../(home)/_partials/ProductGrid';

export default function WishlistPage() {
  const [productIds, setProductIds] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = loadWishlist();
    setProductIds(ids);

    if (ids.length === 0) {
      setLoading(false);
      return;
    }

    async function fetchProducts() {
      try {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids }),
        });
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch {} finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const handleClear = () => {
    clearWishlist();
    setProductIds([]);
    setProducts([]);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-slate-400" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-[#2f0f6b] dark:hover:text-[#a78bfa] transition-colors">Home</Link>
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-slate-600 dark:text-slate-300">Wishlist</span>
      </nav>

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Wishlist</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {loading ? 'Loading...' : `${products.length} product${products.length !== 1 ? 's' : ''} saved`}
          </p>
        </div>
        {products.length > 0 && (
          <button
            onClick={handleClear}
            className="text-sm font-medium text-red-500 hover:text-red-600 transition"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800">
              <div className="aspect-square bg-slate-200 dark:bg-slate-700 rounded-t-xl" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center">
          <svg className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Your wishlist is empty</h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Save products you love to your wishlist.</p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#2f0f6b] px-6 py-3 text-sm font-bold text-white hover:bg-[#2f0f6b]/90 transition dark:bg-[#a78bfa] dark:text-slate-900"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
