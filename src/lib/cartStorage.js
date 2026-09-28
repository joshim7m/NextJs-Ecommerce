const CART_KEY = 'cabinet-closet-cart';

export function loadCart() {
  if (typeof window === 'undefined') return [];

  try {
    return JSON.parse(window.localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
  return cart;
}

function notify() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cart-updated'));
  }
}

// One definition of "same cart line" so the merge in addToCart and the
// already-in-cart filter below can never drift apart.
//
// Historic writers disagree on what a product without variants stores:
// ProductInfo writes '', the homepage ProductGrid writes 'default'. Both mean
// "no variant", so both collapse to the same key here.
function lineKey(item) {
  const variantId = item?.variantId;
  const hasVariant = variantId && variantId !== 'default';
  return `${item?.productSlug ?? ''}::${hasVariant ? variantId : 'base'}`;
}

export function addToCart(item) {
  const cart = loadCart();
  const existingIndex = cart.findIndex(
    (entry) => entry.productSlug === item.productSlug && entry.variantId === item.variantId,
  );

  if (existingIndex >= 0) {
    cart[existingIndex].quantity += item.quantity;
  } else {
    cart.push(item);
  }

  saveCart(cart);
  notify();
  return cart;
}

export function updateCartItem(index, quantity) {
  const cart = loadCart();
  if (index < 0 || index >= cart.length) return cart;

  if (quantity <= 0) {
    cart.splice(index, 1);
  } else {
    cart[index].quantity = quantity;
  }

  saveCart(cart);
  notify();
  return cart;
}

export function removeCartItem(index) {
  const cart = loadCart();
  if (index < 0 || index >= cart.length) return cart;

  cart.splice(index, 1);
  saveCart(cart);
  notify();
  return cart;
}

export function clearCart() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(CART_KEY);
  }
  notify();
  return [];
}

/**
 * The cart line a product would occupy, preferring the default variant over
 * array order. Pure, so it is safe in a module that otherwise touches window.
 */
function preferredVariant(product) {
  const variants = product?.variants || [];
  return variants.find((variant) => variant.isDefault) || variants[0] || null;
}

function variantLabel(variant) {
  if (!variant) return 'Default';
  return [variant.size, variant.color].filter(Boolean).join(' / ') || 'Default';
}

function priceOf(source) {
  const value = Number(source?.sale_price || source?.unite_price);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/**
 * Builds the cart payload for a product. Produces the shape the rest of the
 * storefront already sends: { productId, productSlug, sku, title, image,
 * variantId, variantName, price, salePrice, quantity }.
 *
 * `price` and `salePrice` are both the *effective* price, because
 * `app/api/checkout/route.js` charges `salePrice ?? price` — putting the
 * undiscounted price in `salePrice` would overcharge the customer.
 *
 * `variantOverride` lets a caller that already knows which variant the customer
 * picked (the PDP variant switcher) add that exact variant rather than the
 * default. Omit it and the default variant is used, as before.
 */
export function productToCartItem(product, quantity = 1, variantOverride = null) {
  const variant = variantOverride || preferredVariant(product);
  const images = product?.images || [];
  const image =
    (variant?.imageId && images.find((img) => img.id === variant.imageId)?.image_path) ||
    images[0]?.image_path ||
    '';

  const price = priceOf(variant) || priceOf(product);

  return {
    productId: product.id,
    productSlug: product.slug,
    sku: variant?.sku || product.sku,
    title: product.title,
    image,
    variantId: variant?.id || '',
    variantName: variantLabel(variant),
    price,
    salePrice: price,
    quantity,
  };
}

/**
 * Drops any candidate already in the cart. Without this, re-adding a product
 * that is already there quietly bumps its quantity, because addToCart merges
 * on the same key. A different variant is a different line and is kept.
 */
export function withoutAlreadyInCart(items, cart = loadCart()) {
  const inCart = new Set(cart.map(lineKey));
  return items.filter((item) => !inCart.has(lineKey(item)));
}
