'use client';
import React from 'react';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { addToCart, loadCart, productToCartItem, withoutAlreadyInCart } from '../../lib/cartStorage';
import { pushDataLayer } from '../../lib/gtm';

/* ── Helpers ──────────────────────────────────────────────────────────── */

const MAX_SEEDS = 20;

function effectivePrice(product) {
  return Number(product?.sale_price || product?.unite_price) || 0;
}

function firstImage(product) {
  return product?.images?.[0]?.image_path || '';
}

function distinctSeedIds(cart) {
  return [...new Set(cart.map((item) => item.productId).filter(Boolean))].slice(0, MAX_SEEDS);
}

function cartSubtotal(cart) {
  return cart.reduce((sum, item) => sum + Number(item.price ?? 0) * Number(item.quantity ?? 1), 0);
}

/* ── Icons (inline SVG — this project does not load an icon font) ───────── */

function Icon({ path, className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const ICONS = {
  basket: 'M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a5 5 0 00-10 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  image: 'M4 16l4.5-4.5 3 3L15 11l5 5M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z',
  sparkle: 'M5 3v4M3 5h4M6 17v4M4 19h4M13 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z',
  close: 'M6 6l12 12M18 6L6 18',
  plus: 'M12 5v14M5 12h14',
  check: 'M5 13l4 4L19 7',
  cart: 'M3 3h2l2.7 12.4a2 2 0 002 1.6h7.8a2 2 0 002-1.6L21 7H6',
  checkCircle: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
};

/* ── Loading skeleton ─────────────────────────────────────────────────── */

function SkeletonRow() {
  return (
    <div className="flex animate-pulse items-center gap-3" aria-hidden="true">
      <div className="h-14 w-14 shrink-0 rounded-xl bg-violet-100/70 dark:bg-slate-700" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3 w-3/4 rounded bg-violet-100/70 dark:bg-slate-700" />
        <div className="h-3 w-1/3 rounded bg-violet-100/70 dark:bg-slate-700" />
      </div>
    </div>
  );
}

/* ── Seed group: what the add-ons will be bought alongside ────────────── */

function SeedGroup({ count, subtotal }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-violet-200/70 bg-violet-50/60 px-3 py-2 dark:border-slate-700 dark:bg-slate-700/40">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-gradient shadow-sm">
        <Icon path={ICONS.basket} className="h-4 w-4 text-white" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          {count} {count === 1 ? 'item' : 'items'} in your cart
        </p>
        {subtotal > 0 ? (
          <p className="text-[11px] text-slate-500 dark:text-slate-400">৳{subtotal.toLocaleString()} subtotal</p>
        ) : null}
      </div>
    </div>
  );
}

/* ── Compact add-on row (cart, checkout, PDP) ─────────────────────────── */

function CompactAddOnRow({ product, onAdd, added }) {
  const price = effectivePrice(product);
  const originalPrice = product.sale_price ? Number(product.unite_price) : null;
  const img = firstImage(product);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-violet-200/70 bg-white p-2 transition hover:border-violet-300 dark:border-slate-700 dark:bg-slate-700/50">
      <Link
        href={`/products/${product.slug}`}
        className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-violet-50 dark:bg-slate-700"
        tabIndex={-1}
        aria-hidden="true"
      >
        {img ? (
          <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-violet-200 dark:text-slate-500">
            <Icon path={ICONS.image} className="h-5 w-5" />
          </span>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 text-xs font-medium leading-snug text-slate-800 transition-colors hover:text-[#2f0f6b] dark:text-slate-200 dark:hover:text-[#a78bfa]"
        >
          {product.title}
        </Link>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-xs font-bold text-[#2f0f6b] dark:text-[#a78bfa]">৳{price.toLocaleString()}</span>
          {originalPrice && originalPrice > price ? (
            <span className="text-[11px] text-slate-400 line-through dark:text-slate-500">৳{originalPrice.toLocaleString()}</span>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onAdd(product)}
        disabled={added}
        aria-label={`Add ${product.title} to cart`}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition active:scale-90 disabled:cursor-default ${
          added
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'border border-violet-200 bg-violet-50 text-violet-700 hover:bg-brand-gradient hover:border-transparent hover:text-white dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300'
        }`}
      >
        <Icon path={added ? ICONS.check : ICONS.plus} className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ── Comfortable add-on tile (product grid style) ─────────────────────── */

function AddOnTile({ product, onAdd, added }) {
  const price = effectivePrice(product);
  const originalPrice = product.sale_price ? Number(product.unite_price) : null;
  const img = firstImage(product);

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-violet-200/70 bg-white transition hover:border-violet-300 dark:border-slate-700 dark:bg-slate-800">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square bg-violet-50 dark:bg-slate-700">
        {img ? (
          <img src={img} alt={product.title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-violet-200 dark:text-slate-500">
            <Icon path={ICONS.image} className="h-8 w-8" />
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <Link href={`/products/${product.slug}`}>
          <h4 className="line-clamp-2 text-xs font-medium leading-snug text-slate-800 dark:text-slate-200">{product.title}</h4>
        </Link>
        <div className="mt-auto flex items-center justify-between gap-1.5 pt-1">
          <div className="flex min-w-0 items-baseline gap-1.5">
            <span className="text-sm font-bold text-[#2f0f6b] dark:text-[#a78bfa]">৳{price.toLocaleString()}</span>
            {originalPrice && originalPrice > price ? (
              <span className="truncate text-[11px] text-slate-400 line-through dark:text-slate-500">
                ৳{originalPrice.toLocaleString()}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onAdd(product)}
            disabled={added}
            aria-label={`Add ${product.title} to cart`}
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition active:scale-90 disabled:cursor-default ${
              added
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'border border-violet-200 bg-violet-50 text-violet-700 hover:bg-brand-gradient hover:border-transparent hover:text-white dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300'
            }`}
          >
            <Icon path={added ? ICONS.check : ICONS.plus} className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Presentational view, shared by all three surfaces ────────────────── */

const SURFACE = 'rounded-2xl border border-violet-200/70 bg-white px-2 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:px-4';

export function BundleView({
  title = 'Frequently Bought Together',
  addOns = [],
  seedCount = 0,
  seedSubtotal = 0,
  showSeedGroup = true,
  surface = true,
  density = 'compact',
  count = 3,
  ctaIncludesSeed = false,
  onAddAll,
  onAddOne,
  addedIds = [],
  loading = false,
  dismissible = false,
  onDismiss,
}) {
  const [dismissed, setDismissed] = useState(false);

  // Nothing to show, or the customer closed the box. No border, no spacer is
  // left behind in either case.
  if (!loading && addOns.length === 0) return null;
  if (dismissed) return null;

  const compact = density === 'compact';
  const rows = count > 0 ? count : addOns.length;

  const addOnTotal = addOns.reduce((sum, product) => sum + effectivePrice(product), 0);
  // Compact mode reports only the add-ons: the cart and checkout surfaces
  // already display the subtotal, so quoting the whole bundle would
  // double-count what the customer has. The PDP passes ctaIncludesSeed because
  // its button genuinely adds the product on screen too.
  const totalIncludesSeed = ctaIncludesSeed || !compact;
  const quotedTotal = totalIncludesSeed ? seedSubtotal + addOnTotal : addOnTotal;
  const allAdded = addOns.length > 0 && addOns.every((product) => addedIds.includes(product.id));

  const dismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <h2 className={`flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 ${compact ? 'text-xs' : 'text-sm'}`}>
          <Icon path={ICONS.sparkle} className={`shrink-0 text-[#2f0f6b] dark:text-[#a78bfa] ${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
          <span className="min-w-0 leading-snug">{title}</span>
        </h2>
        {dismissible ? (
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss recommendations"
            className="-mr-1 -mt-0.5 shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            <Icon path={ICONS.close} className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {showSeedGroup && seedCount > 0 ? (
        <div className="mt-2.5">
          <SeedGroup count={seedCount} subtotal={seedSubtotal} />
        </div>
      ) : null}

      {loading ? (
        <div className="mt-2.5 space-y-2">
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : compact ? (
        <div className="mt-2.5 space-y-2">
          {addOns.map((product) => (
            <CompactAddOnRow
              key={product.id}
              product={product}
              added={addedIds.includes(product.id)}
              onAdd={onAddOne}
            />
          ))}
        </div>
      ) : (
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {addOns.map((product) => (
            <AddOnTile key={product.id} product={product} added={addedIds.includes(product.id)} onAdd={onAddOne} />
          ))}
        </div>
      )}

      {loading ? null : (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => onAddAll?.(addOns)}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand-gradient bg-brand-gradient-hover px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:shadow-lg active:scale-[0.98] dark:bg-[#a78bfa] dark:text-slate-900"
          >
            <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-white/10 transition-all duration-700 group-hover:left-full" />
            <Icon path={allAdded ? ICONS.checkCircle : ICONS.cart} className="h-4 w-4 shrink-0" />
            {allAdded ? 'Added to cart' : totalIncludesSeed ? 'Add bundle to cart' : 'Add all to cart'}
            {allAdded ? null : (
              <span className="text-white/90 dark:text-slate-700">
                {totalIncludesSeed ? '· ৳' : '+৳'}
                {quotedTotal.toLocaleString()}
              </span>
            )}
          </button>
          <p className="mt-1.5 text-center text-[11px] text-slate-400 dark:text-slate-500">
            {allAdded
              ? `${addOns.length} ${addOns.length === 1 ? 'item' : 'items'} in your cart`
              : `Bundle adds ৳${addOnTotal.toLocaleString()}`}
          </p>
        </div>
      )}
    </>
  );

  if (!surface) return <div className={compact ? '' : 'mt-5'}>{body}</div>;

  return <div className={`${SURFACE} ${compact ? '' : 'mt-5'}`}>{body}</div>;
}

/* ── Cart / checkout container ────────────────────────────────────────── */

/**
 * Reads the cart from localStorage, fetches add-ons for it, and writes them
 * back through cartStorage. Merchandising must never block checkout, so every
 * fetch is best-effort and every failure renders nothing at all.
 *
 * This renders inside the checkout <form>, so every button stays type="button".
 */
export default function FrequentlyBoughtTogether({
  limit = 3,
  dismissible = false,
  hideWhenInCart = false,
}) {
  const [addOns, setAddOns] = useState([]);
  const [seedCount, setSeedCount] = useState(0);
  const [seedSubtotal, setSeedSubtotal] = useState(0);
  const [addedIds, setAddedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Incremented by this component's own addToCart calls. Those dispatch
  // `cart-updated` per item, and a refetch in response would swap the rail's
  // own add-ons out from under the customer.
  const selfWriteRef = useRef(0);
  // Once the customer has added from here, stop listening altogether.
  const settledRef = useRef(false);

  const request = useCallback(
    async (ids) => {
      if (ids.length === 0) {
        setAddOns([]);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/recommendations?ids=${ids.join(',')}&limit=${limit}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setAddOns(Array.isArray(data?.products) ? data.products : []);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('[frequently-bought-together] failed to load add-ons', error);
        }
        setAddOns([]);
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    const cart = loadCart();
    setSeedCount(distinctSeedIds(cart).length);
    setSeedSubtotal(cartSubtotal(cart));
    request(distinctSeedIds(cart));
  }, [request]);

  useEffect(() => {
    const handler = () => {
      if (selfWriteRef.current > 0) {
        selfWriteRef.current -= 1;
        return;
      }
      if (settledRef.current) return;

      const cart = loadCart();
      setSeedCount(distinctSeedIds(cart).length);
      setSeedSubtotal(cartSubtotal(cart));
      request(distinctSeedIds(cart));
    };

    window.addEventListener('cart-updated', handler);
    return () => window.removeEventListener('cart-updated', handler);
  }, [request]);

  const commit = useCallback(
    (products) => {
      if (!products?.length) return;

      const items = withoutAlreadyInCart(products.map((product) => productToCartItem(product)));
      if (items.length === 0) return;

      selfWriteRef.current = items.length;
      settledRef.current = true;
      items.forEach((item) => addToCart(item));

      setAddedIds((prev) => [...new Set([...prev, ...products.map((product) => product.id)])]);

      pushDataLayer('add_to_cart', {
        ecommerce: {
          items: products.map((product) => ({
            item_id: product.sku,
            item_name: product.title,
            price: effectivePrice(product),
            quantity: 1,
          })),
          currency: 'BDT',
        },
      });
    },
    []
  );

  // Dropping what the customer just added keeps the rail honest. This filters
  // on addedIds rather than re-reading the cart on purpose: a cart read would
  // change seedIds and trigger the refetch that settledRef exists to prevent.
  const visible = hideWhenInCart ? addOns.filter((product) => !addedIds.includes(product.id)) : addOns;

  if (loading) return <BundleView loading count={limit} />;
  if (visible.length === 0) return null;

  return (
    <BundleView
      density="compact"
      surface
      count={limit}
      dismissible={dismissible}
      addOns={visible}
      seedCount={seedCount}
      seedSubtotal={seedSubtotal}
      onAddAll={commit}
      onAddOne={commit}
      addedIds={addedIds}
    />
  );
}

/* ── Product detail page bundle ───────────────────────────────────────── */

/**
 * The PDP owns the selected variant, so "Add bundle to cart" adds the currently
 * selected variant — no wrong-variant risk. A single row's "+" adds only that
 * add-on; only the CTA carries the product on screen, which is the "buy these
 * together" contract.
 */
export function PdpBundle({ product, selectedVariant = null, limit = 2 }) {
  const [addOns, setAddOns] = useState([]);
  const [addedIds, setAddedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainInCart, setMainInCart] = useState(false);

  const mainLine = useCallback(() => {
    if (!product?.id) return null;
    const variants = selectedVariant ? [selectedVariant] : product.variants || [];
    return productToCartItem({ ...product, variants }, 1);
  }, [product, selectedVariant]);

  useEffect(() => {
    if (!product?.id) return;
    const controller = new AbortController();

    setLoading(true);
    fetch(`/api/recommendations?ids=${product.id}&limit=${limit}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setAddOns(Array.isArray(data?.products) ? data.products : []))
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('[pdp-bundle] failed to load add-ons', error);
        }
        setAddOns([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [product?.id, limit]);

  // Track the real cart here, deliberately not suppressed around our own writes:
  // when the product on screen is already in the cart, "Add all" will not
  // re-add it, so the box must quote only the add-on delta instead of
  // overstating what is charged.
  useEffect(() => {
    if (!product?.id) return;

    const sync = () => {
      const line = mainLine();
      if (!line) return;
      setMainInCart(loadCart().some((entry) => entry.productSlug === line.productSlug && entry.variantId === line.variantId));
    };

    sync();
    window.addEventListener('cart-updated', sync);
    return () => window.removeEventListener('cart-updated', sync);
  }, [product?.id, mainLine]);

  const commit = useCallback(
    (products, includeMain) => {
      if (!products?.length) return;

      const candidates = products.map((item) => productToCartItem(item));
      if (includeMain) {
        const line = mainLine();
        if (line) candidates.unshift(line);
      }

      const items = withoutAlreadyInCart(candidates);
      if (items.length === 0) return;

      items.forEach((item) => addToCart(item));

      setAddedIds((prev) => [...new Set([...prev, ...products.map((product) => product.id)])]);

      pushDataLayer('add_to_cart', {
        ecommerce: {
          items: items.map((item) => ({
            item_id: item.sku,
            item_name: item.title,
            price: Number(item.price ?? 0),
            item_variant: item.variantName,
            quantity: item.quantity,
          })),
          currency: 'BDT',
        },
      });
    },
    [mainLine]
  );

  if (loading) return <BundleView loading count={limit} density="compact" surface />;
  if (addOns.length === 0) return null;

  return (
    <BundleView
      density="compact"
      surface
      count={limit}
      showSeedGroup={false}
      addOns={addOns}
      seedSubtotal={mainLine()?.price ? Number(mainLine().price) : 0}
      ctaIncludesSeed={!mainInCart}
      onAddAll={(products) => commit(products, !mainInCart)}
      onAddOne={(product) => commit([product], false)}
      addedIds={addedIds}
    />
  );
}
