'use client';

import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addToCart } from '../../lib/cartStorage';
import { toggleWishlist, loadWishlist } from '../../lib/wishlistStorage';

/* ─── Product image with thumbnail gallery ─── */
function ImageGallery({ images, title }) {
  const [selected, setSelected] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, [selected]);

  const items = images?.length ? images : [];
  const active = items[selected] || null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
      {/* Thumbnails */}
      {items.length > 1 && (
        <div className="flex gap-2 sm:flex-col">
          {items.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => { setSelected(i); setLoaded(false); setError(false); }}
              className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition sm:h-16 sm:w-16 ${
                i === selected ? 'border-[#2f0f6b]' : 'border-slate-200 hover:border-slate-300'
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

      {/* Main image */}
      <div className="relative flex-1 overflow-hidden rounded-xl bg-slate-100">
        <div className="aspect-square w-full sm:h-[32rem]">
          {!loaded && !error && (
            <div className="absolute inset-0 animate-pulse bg-slate-200" />
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
            <div className="flex h-full items-center justify-center text-slate-400">
              <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Tab switcher ─── */
const TABS = ['Description', 'Specifications', 'Reviews'];

function ProductTabs({ product, selectedVariant }) {
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

/* ─── Social share buttons ─── */
function ShareButtons({ url, title }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [url]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Share</span>
      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </a>
      {/* X (Twitter) */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition"
      >
        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      {/* WhatsApp */}
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-green-100 hover:text-green-600 transition"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
      {/* Copy link */}
      <button
        type="button"
        onClick={handleCopy}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition"
      >
        {copied ? (
          <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        )}
      </button>
    </div>
  );
}

/* ─── Related product mini card ─── */
function RelatedCard({ product }) {
  const [loaded, setLoaded] = useState(false);
  const price = Number(product.sale_price || product.unite_price);
  const originalPrice = product.sale_price ? Number(product.unite_price) : null;
  const img = product.images?.[0]?.image_path;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md overflow-hidden"
    >
      <div className="aspect-square w-full overflow-hidden bg-slate-100">
        {img ? (
          <img
            src={img}
            alt={product.title}
            className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-2 sm:p-3">
        <h4 className="text-xs font-medium text-slate-900 line-clamp-2 sm:text-sm">{product.title}</h4>
        <div className="mt-1 flex items-center gap-1">
          <span className="text-sm font-semibold text-[#2f0f6b]">৳{price.toLocaleString()}</span>
          {originalPrice && (
            <span className="text-xs text-slate-400 line-through">৳{originalPrice.toLocaleString()}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ─── Main component ─── */
export default function ProductDetailClient({ product, related }) {
  const router = useRouter();
  const [variantIndex, setVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState('');
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    setWishlisted(loadWishlist().includes(product.id));
    const handler = () => setWishlisted(loadWishlist().includes(product.id));
    window.addEventListener('wishlist-updated', handler);
    return () => window.removeEventListener('wishlist-updated', handler);
  }, [product.id]);

  const selectedVariant = product.variants?.[variantIndex] || null;

  const activePrice = useMemo(() => {
    if (selectedVariant?.sale_price) return Number(selectedVariant.sale_price);
    if (selectedVariant?.price) return Number(selectedVariant.price);
    if (product.sale_price) return Number(product.sale_price);
    return Number(product.unite_price);
  }, [product, selectedVariant]);

  const activeOriginalPrice = useMemo(() => {
    if (selectedVariant?.price && selectedVariant.sale_price) return Number(selectedVariant.price);
    if (product.unite_price && product.sale_price) return Number(product.unite_price);
    return null;
  }, [product, selectedVariant]);

  const discountPercent = useMemo(() => {
    if (activeOriginalPrice && activePrice) {
      return Math.round(((activeOriginalPrice - activePrice) / activeOriginalPrice) * 100);
    }
    return 0;
  }, [activeOriginalPrice, activePrice]);

  const stockQty = selectedVariant?.inventoryQuantity ?? product.inventoryQuantity ?? 0;
  const inStock = stockQty > 0;

  const handleWishlist = () => {
    toggleWishlist(product.id);
  };

  const handleAddToCart = () => {
    const variantName = selectedVariant
      ? `${selectedVariant.size || ''}${selectedVariant.color ? ` / ${selectedVariant.color}` : ''}`.trim()
      : 'Default';

    addToCart({
      productId: product.id,
      productSlug: product.slug,
      title: product.title,
      image: product.images?.[0]?.image_path || '',
      variantId: selectedVariant?.id || '',
      variantName,
      price: activePrice,
      salePrice: activePrice,
      quantity,
    });

    setFeedback('Added to cart.');
    setTimeout(() => setFeedback(''), 2500);
  };

  const handleBuyNow = () => {
    const variantName = selectedVariant
      ? `${selectedVariant.size || ''}${selectedVariant.color ? ` / ${selectedVariant.color}` : ''}`.trim()
      : 'Default';

    addToCart({
      productId: product.id,
      productSlug: product.slug,
      title: product.title,
      image: product.images?.[0]?.image_path || '',
      variantId: selectedVariant?.id || '',
      variantName,
      price: activePrice,
      salePrice: activePrice,
      quantity,
    });

    router.push('/checkout');
  };

  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  return (
    <>
      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        {/* Image gallery */}
        <div className="order-1">
          <ImageGallery images={product.images} title={product.title} />
        </div>

        {/* Product info */}
        <div className="order-2 space-y-5">
          {/* Title + wishlist */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
                {product.title}
              </h1>
              <button
                type="button"
                onClick={handleWishlist}
                className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition"
              >
                {wishlisted ? (
                  <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Stock + SKU */}
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {inStock ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  In Stock ({stockQty} available)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Out of Stock
                </span>
              )}
              {selectedVariant?.sku && (
                <span className="text-xs text-slate-400">SKU: {selectedVariant.sku}</span>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Price</p>
            <div className="mt-2 flex items-end gap-3">
              <p className="text-3xl font-bold text-[#2f0f6b] sm:text-4xl">
                ৳{activePrice.toLocaleString()}
              </p>
              {activeOriginalPrice ? (
                <p className="text-sm text-slate-400 line-through sm:text-base">
                  ৳{activeOriginalPrice.toLocaleString()}
                </p>
              ) : null}
            </div>
            {discountPercent > 0 ? (
              <p className="mt-2 text-sm font-medium text-emerald-600">
                Save {discountPercent}% — ৳{(activeOriginalPrice - activePrice).toLocaleString()}
              </p>
            ) : null}
          </div>

          {/* Variant selector */}
          {product.variants?.length > 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">Choose variant</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Size</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.variants.map((variant, index) => (
                      <button
                        type="button"
                        key={variant.id}
                        onClick={() => { setVariantIndex(index); setFeedback(''); }}
                        className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition active:scale-95 ${
                          index === variantIndex
                            ? 'border-[#2f0f6b] bg-[#2f0f6b] text-white shadow-sm'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {variant.size || variant.color || `Variant ${index + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
                {selectedVariant?.color && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Color</label>
                    <p className="mt-1 text-sm text-slate-800">{selectedVariant.color}</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Quantity + Add to cart */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Quantity</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{quantity}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((v) => Math.max(1, v - 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-700 hover:border-slate-300 active:scale-90 transition"
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => setQuantity((v) => v + 1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-700 hover:border-slate-300 active:scale-90 transition"
                >
                  +
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!inStock}
              className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition active:scale-[0.98] ${
                inStock
                  ? 'bg-[#2f0f6b] text-white hover:bg-[#2f0f6b]/90'
                  : 'cursor-not-allowed bg-slate-200 text-slate-400'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
            {feedback ? (
              <p className="mt-3 animate-fade-in text-center text-sm font-medium text-emerald-700">{feedback}</p>
            ) : null}

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!inStock}
              className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 px-6 py-3.5 text-sm font-semibold transition active:scale-[0.98] ${
                inStock
                  ? 'border-[#2f0f6b] text-[#2f0f6b] hover:bg-[#2f0f6b] hover:text-white'
                  : 'cursor-not-allowed border-slate-200 text-slate-400'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Buy Now
            </button>
          </div>

          {/* Social share */}
          <ShareButtons url={shareUrl} title={product.title} />
        </div>
      </div>

      {/* Tabs — Description / Specs / Reviews */}
      <div className="order-3 mt-10 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <ProductTabs product={product} selectedVariant={selectedVariant} />
      </div>

      {/* Related products */}
      {related?.length > 0 && (
        <div className="order-4 mt-12">
          <h2 className="mb-6 text-xl font-bold text-slate-900 sm:text-2xl">Related Products</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((r) => (
              <RelatedCard key={r.id} product={r} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
