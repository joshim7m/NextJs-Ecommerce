'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { addToCart } from '../../../../src/lib/cartStorage';
import { toggleWishlist, loadWishlist } from '../../../../src/lib/wishlistStorage';

function ProductCard({ product, index }) {
  const [loaded, setLoaded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  useEffect(() => {
    setWishlisted(loadWishlist().includes(product.id));
    const handler = () => setWishlisted(loadWishlist().includes(product.id));
    window.addEventListener('wishlist-updated', handler);
    return () => window.removeEventListener('wishlist-updated', handler);
  }, [product.id]);

  const price = Number(product.sale_price || product.unite_price);
  const originalPrice = product.sale_price ? Number(product.unite_price) : null;
  const firstImage = product.images?.[0]?.image_path;
  const variant = product.variants?.[0];
  const hasVariants = product.variants && product.variants.length > 0;

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      productSlug: product.slug,
      sku: product.sku,
      title: product.title,
      image: firstImage || '',
      variantId: variant ? variant.id : 'default',
      variantName: variant ? (variant.variant_name || 'Default') : 'Default',
      price: String(price),
      salePrice: product.sale_price ? String(product.sale_price) : null,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      className="group relative rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg overflow-hidden dark:border-slate-700 dark:bg-slate-800"
      style={{ animationDelay: `${(index % 12) * 60}ms` }}
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-700">
          {firstImage ? (
            <img
              ref={imgRef}
              src={firstImage}
              alt={product.images[0].altText || product.title}
              className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
                loaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={() => setLoaded(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400 dark:text-slate-500">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          )}
        </div>
      </Link>

      {/* Wishlist heart */}
      <button
        type="button"
        onClick={handleWishlist}
        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-sm shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:scale-110 dark:bg-slate-800/80 dark:hover:bg-slate-700 sm:opacity-0 sm:group-hover:opacity-100"
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {wishlisted ? (
          <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        ) : (
          <svg className="h-4 w-4 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )}
      </button>

      <div className="flex flex-col gap-1 p-2 sm:p-3">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-xs font-medium text-slate-900 line-clamp-2 sm:text-sm hover:text-[#2f0f6b] transition-colors dark:text-slate-100 dark:hover:text-[#a78bfa]">
            {product.title}
          </h3>
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-[#2f0f6b] dark:text-[#a78bfa] sm:text-lg">
            ৳{price.toLocaleString()}
          </span>
          {originalPrice ? (
            <span className="text-xs text-slate-400 line-through sm:text-sm dark:text-slate-500">
              ৳{originalPrice.toLocaleString()}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
           className={`mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-all active:scale-95 sm:text-sm ${
             added
               ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
               : 'border-[#2f0f6b] bg-white text-[#2f0f6b] hover:bg-[#2f0f6b] hover:text-white dark:border-[#a78bfa] dark:bg-slate-800 dark:text-[#a78bfa] dark:hover:bg-[#a78bfa] dark:hover:text-slate-900'
           }`}
        >
          {added ? (
            <>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Added
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function LoadMoreButton({ onClick, remaining }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="mt-6 flex justify-center sm:mt-8">
      <button
        type="button"
        onClick={onClick}
        className={`w-full rounded-xl border-2 border-[#2f0f6b] bg-white px-6 py-3 text-sm font-semibold text-[#2f0f6b] transition-all hover:bg-[#2f0f6b] hover:text-white active:scale-95 dark:border-[#a78bfa] dark:bg-slate-800 dark:text-[#a78bfa] dark:hover:bg-[#a78bfa] dark:hover:text-slate-900 sm:w-auto sm:px-10 sm:py-3.5 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Load More ({remaining} left)
      </button>
    </div>
  );
}

export default function ProductGrid({ products, pageSize = 12 }) {
  const [visible, setVisible] = useState(pageSize);

  const totalCount = products.length;
  const displayed = products.slice(0, visible);
  const hasMore = visible < totalCount;

  const handleLoadMore = useCallback(() => {
    setVisible((v) => Math.min(v + pageSize, totalCount));
  }, [pageSize, totalCount]);

  if (!totalCount) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-800">
        <svg className="mb-4 h-12 w-12 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p className="text-slate-500 dark:text-slate-400">No products match your filters.</p>
        <Link href="/" className="mt-3 text-sm font-medium text-[#2f0f6b] hover:underline dark:text-[#a78bfa]">
          Clear all filters
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {displayed.map((product, i) => (
          <div key={product.id} className="animate-fade-in">
            <ProductCard product={product} index={i} />
          </div>
        ))}
      </div>

      {hasMore && (
        <LoadMoreButton onClick={handleLoadMore} remaining={totalCount - visible} />
      )}

      {!hasMore && totalCount > pageSize && (
        <p className="mt-6 text-center text-xs text-slate-400 sm:mt-8 sm:text-sm dark:text-slate-500">
          Showing all {totalCount} products
        </p>
      )}
    </div>
  );
}
