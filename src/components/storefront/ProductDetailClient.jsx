'use client';

import { useMemo, useState } from 'react';
import { addToCart } from '../../lib/cartStorage';

export default function ProductDetailClient({ product }) {
  const [variantIndex, setVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState('');

  const selectedVariant = product.variants?.[variantIndex] || null;

  const activePrice = useMemo(() => {
    if (selectedVariant?.sale_price) return Number(selectedVariant.sale_price);
    if (selectedVariant?.price) return Number(selectedVariant.price);
    if (product.sale_price) return Number(product.sale_price);
    return Number(product.unite_price);
  }, [product, selectedVariant]);

  const activeSalePrice = useMemo(() => {
    if (selectedVariant?.sale_price) return Number(selectedVariant.sale_price);
    if (product.sale_price) return Number(product.sale_price);
    return null;
  }, [product, selectedVariant]);

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
      price: activeSalePrice ?? activePrice,
      salePrice: activeSalePrice,
      quantity,
    });

    setFeedback('Added to cart.');
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-96 overflow-hidden rounded-3xl bg-slate-100 sm:h-[28rem]">
          {product.images?.[0]?.image_path ? (
            <img src={product.images[0].image_path} alt={product.images[0].altText || product.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">No image available</div>
          )}
        </div>

        <div className="mt-8 space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Product</p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">{product.title}</h1>
          <p className="text-slate-600">{product.description}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Price</p>
          <div className="mt-3 flex items-end gap-4">
            <p className="text-4xl font-semibold">৳ {activeSalePrice ?? activePrice}</p>
            {activeSalePrice ? <p className="text-sm text-slate-500 line-through">৳ {activePrice}</p> : null}
          </div>
          {activeSalePrice ? (
            <p className="mt-2 text-sm text-emerald-600">Save ৳ {activePrice - activeSalePrice}</p>
          ) : null}
        </div>

        {product.variants?.length ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Choose variant</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Size</label>
                <div className="mt-3 flex flex-wrap gap-3">
                  {product.variants.map((variant, index) => (
                    <button
                      type="button"
                      key={variant.id}
                      onClick={() => setVariantIndex(index)}
                      className={`rounded-2xl border px-4 py-3 text-sm transition ${index === variantIndex ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}
                    >
                      {variant.size || variant.color || 'Variant'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Color</label>
                <p className="mt-2 text-slate-600">{selectedVariant?.color || 'Default'}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Quantity</p>
              <p className="mt-1 text-2xl font-semibold">{quantity}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="h-12 w-12 rounded-full border border-slate-200 bg-white text-xl text-slate-700 hover:border-slate-300"
              >
                −
              </button>
              <button
                type="button"
                onClick={() => setQuantity((value) => value + 1)}
                className="h-12 w-12 rounded-full border border-slate-200 bg-white text-xl text-slate-700 hover:border-slate-300"
              >
                +
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            className="mt-6 w-full rounded-3xl bg-slate-900 px-6 py-4 text-white hover:bg-slate-700"
          >
            Add to cart
          </button>
          {feedback ? <p className="mt-3 text-sm text-emerald-700">{feedback}</p> : null}
        </div>
      </div>
    </div>
  );
}
