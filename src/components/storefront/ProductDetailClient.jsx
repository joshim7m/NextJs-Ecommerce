'use client';

import { useMemo, useState } from 'react';
import ImageGallery from './partials/ImageGallery';
import ProductInfo from './partials/ProductInfo';
import ProductTabs from './partials/ProductTabs';
import RelatedProducts from './partials/RelatedProducts';

export default function ProductDetailClient({ product, related }) {
  const [variantIndex, setVariantIndex] = useState(0);

  const selectedVariant = product.variants?.[variantIndex] || null;

  const variantImageIndex = useMemo(() => {
    if (!selectedVariant?.imageId) return -1;
    return product.images?.findIndex((img) => img.id === selectedVariant.imageId) ?? -1;
  }, [product.images, selectedVariant]);

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <ImageGallery images={product.images} title={product.title} variantImageIndex={variantImageIndex} />
        <ProductInfo
          product={product}
          selectedVariant={selectedVariant}
          variantIndex={variantIndex}
          onVariantChange={setVariantIndex}
        />
      </div>

      <div className="mt-10 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 dark:border-slate-700 dark:bg-slate-800">
        <ProductTabs product={product} selectedVariant={selectedVariant} />
      </div>

      <RelatedProducts products={related} />
    </>
  );
}
