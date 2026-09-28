'use server';

import { revalidatePath } from 'next/cache';
import prisma from '../lib/prisma';
import { normalizeRichText } from '../lib/richText';

function serialize(obj) {
  return JSON.parse(JSON.stringify(obj));
}

const MAX_UPSELLS = 4;

// A light select: this include rides along with every product read, so pulling
// full variants and images for the upsell rows would be wasteful.
const upsellInclude = {
  upsells: {
    include: { upsell: { select: { id: true, title: true, slug: true } } },
    orderBy: { sortOrder: 'asc' },
  },
};

const productInclude = { images: true, variants: true, categories: true, ...upsellInclude };

/**
 * Replaces a product's curated upsells. The picker already prevents
 * self-references, duplicates and unknown ids, but sanitising here means a
 * malformed payload cannot turn into a failed product save via the
 * @@unique([productId, upsellId]) constraint.
 *
 * An absent `upsellIds` leaves the curation untouched; only an explicit array
 * replaces it, so a caller that simply does not know about upsells cannot wipe
 * a merchandiser's work.
 */
async function syncUpsells(productId, upsellIds) {
  if (!Array.isArray(upsellIds)) return;

  const deduped = [...new Set(upsellIds.filter((id) => typeof id === 'string' && id && id !== productId))];

  // Existence is checked before the cap, otherwise an id that does not resolve
  // silently eats one of the merchandiser's slots.
  const known = deduped.length
    ? await prisma.product.findMany({ where: { id: { in: deduped } }, select: { id: true } })
    : [];
  const knownIds = new Set(known.map((row) => row.id));
  const finalIds = deduped.filter((id) => knownIds.has(id)).slice(0, MAX_UPSELLS);

  await prisma.productUpsell.deleteMany({ where: { productId } });
  if (finalIds.length === 0) return;

  await prisma.productUpsell.createMany({
    data: finalIds.map((upsellId, index) => ({ productId, upsellId, sortOrder: index })),
  });
}

export async function getProducts() {
  const products = await prisma.product.findMany({
    include: productInclude,
    orderBy: { createdAt: 'desc' },
  });
  return serialize(products);
}

/**
 * For the upsell picker. Deliberately not getProducts(), which loads every
 * variant and image for the whole catalogue.
 */
export async function getPublishedProductsLite() {
  const products = await prisma.product.findMany({
    where: { status: 'publish' },
    select: {
      id: true,
      title: true,
      sku: true,
      images: { take: 1, select: { image_path: true } },
    },
    orderBy: { title: 'asc' },
  });
  return products.map((product) => ({
    id: product.id,
    title: product.title,
    sku: product.sku,
    image: product.images?.[0]?.image_path || null,
  }));
}

export async function getCategories() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });
  return serialize(categories);
}

export async function createProduct(data) {
  const { title, slug: rawSlug, description, specification, metaDescription, videoUrl, tags, unite_price, sale_price, sku, quantity, status, isFeatured, categoryIds, imagePaths, upsellIds } = data;
  const slug = rawSlug?.trim();
  if (!title || !slug) throw new Error('Title and slug are required.');

  const product = await prisma.product.create({
    data: {
      title, slug,
      description: normalizeRichText(description),
      specification: normalizeRichText(specification),
      metaDescription: metaDescription || null,
      videoUrl: videoUrl || null,
      tags: tags || null,
      unite_price: parseFloat(unite_price),
      sale_price: sale_price ? parseFloat(sale_price) : null,
      sku: sku || null,
      quantity: quantity ? parseInt(quantity) : null,
      status: status || 'draft',
      isFeatured: Boolean(isFeatured),
      categories: categoryIds?.length ? { connect: categoryIds.map((id) => ({ id })) } : undefined,
      images: imagePaths?.length ? { create: imagePaths.map((p) => ({ image_path: p, altText: title })) } : undefined,
    },
    include: { images: true, variants: true, categories: true },
  });

  await syncUpsells(product.id, upsellIds);

  revalidatePath('/admin/products');
  return serialize(product);
}

export async function updateProduct(id, data) {
  const { title, slug: rawSlug, description, specification, metaDescription, videoUrl, tags, unite_price, sale_price, sku, quantity, status, isFeatured, categoryIds, imagePaths, removeImageIds, variants, removedVariantIds, upsellIds } = data;
  const slug = rawSlug?.trim();

  if (removeImageIds?.length) {
    await prisma.productImage.deleteMany({ where: { id: { in: removeImageIds }, productId: id } });
  }

  if (removedVariantIds?.length) {
    await prisma.productVariant.deleteMany({ where: { id: { in: removedVariantIds }, productId: id } });
  }

  if (variants) {
    const toCreate = variants.filter((v) => !v.id);
    for (const v of toCreate) {
      await prisma.productVariant.create({
        data: {
          product: { connect: { id } },
          sku: v.sku || null,
          size: v.size || null,
          color: v.color || null,
          unite_price: v.unite_price ? parseFloat(v.unite_price) : null,
          sale_price: v.sale_price ? parseFloat(v.sale_price) : null,
          quantity: v.quantity ? parseInt(v.quantity) : 0,
          isDefault: v.isDefault || false,
          image: v.imageId ? { connect: { id: v.imageId } } : undefined,
        },
      });
    }

    const toUpdate = variants.filter((v) => v.id);
    for (const v of toUpdate) {
      await prisma.productVariant.update({
        where: { id: v.id },
        data: {
          sku: v.sku || null,
          size: v.size || null,
          color: v.color || null,
          unite_price: v.unite_price ? parseFloat(v.unite_price) : null,
          sale_price: v.sale_price ? parseFloat(v.sale_price) : null,
          quantity: v.quantity ? parseInt(v.quantity) : 0,
          isDefault: v.isDefault || false,
          image: v.imageId ? { connect: { id: v.imageId } } : { disconnect: true },
        },
      });
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      title, slug,
      description: normalizeRichText(description),
      specification: normalizeRichText(specification),
      metaDescription: metaDescription || null,
      videoUrl: videoUrl || null,
      tags: tags || null,
      unite_price: parseFloat(unite_price),
      sale_price: sale_price ? parseFloat(sale_price) : null,
      sku: sku || null,
      quantity: quantity ? parseInt(quantity) : null,
      status: status || 'draft',
      isFeatured: Boolean(isFeatured),
      categories: categoryIds?.length ? { set: categoryIds.map((id) => ({ id })) } : { set: [] },
      images: imagePaths?.length ? { create: imagePaths.map((p) => ({ image_path: p, altText: title })) } : undefined,
    },
    include: productInclude,
  });

  await syncUpsells(id, upsellIds);

  revalidatePath('/admin/products');
  return serialize(product);
}

export async function getProduct(id) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });
  return serialize(product);
}

export async function deleteProduct(id) {
  await prisma.productImage.deleteMany({ where: { productId: id } });
  await prisma.productVariant.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });
  revalidatePath('/admin/products');
}
