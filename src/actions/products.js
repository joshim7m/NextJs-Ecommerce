'use server';

import { revalidatePath } from 'next/cache';
import prisma from '../lib/prisma';

function serialize(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export async function getProducts() {
  const products = await prisma.product.findMany({
    include: { images: true, variants: true, categories: true },
    orderBy: { createdAt: 'desc' },
  });
  return serialize(products);
}

export async function getCategories() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });
  return serialize(categories);
}

export async function createProduct(data) {
  const { title, slug: rawSlug, description, unite_price, sale_price, compareAtPrice, inventoryQuantity, status, categorySlug, imagePaths } = data;
  const slug = rawSlug?.trim();
  if (!title || !slug) throw new Error('Title and slug are required.');

  const product = await prisma.product.create({
    data: {
      title, slug, description,
      unite_price: parseFloat(unite_price),
      sale_price: sale_price ? parseFloat(sale_price) : null,
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
      inventoryQuantity: inventoryQuantity ? parseInt(inventoryQuantity) : null,
      status: status || 'draft',
      categories: categorySlug ? { connect: { slug: categorySlug } } : undefined,
      images: imagePaths?.length ? { create: imagePaths.map((p) => ({ image_path: p, altText: title })) } : undefined,
    },
    include: { images: true, variants: true, categories: true },
  });

  revalidatePath('/admin/products');
  return serialize(product);
}

export async function updateProduct(id, data) {
  const { title, slug: rawSlug, description, unite_price, sale_price, compareAtPrice, inventoryQuantity, status, categorySlug, imagePaths, removeImageIds, variants } = data;
  const slug = rawSlug?.trim();

  if (removeImageIds?.length) {
    await prisma.productImage.deleteMany({ where: { id: { in: removeImageIds }, productId: id } });
  }

  if (variants) {
    const toDelete = variants.filter((v) => v._delete && v.id && !v.id.toString().startsWith('new_'));
    if (toDelete.length) {
      await prisma.productVariant.deleteMany({ where: { id: { in: toDelete.map((v) => v.id) }, productId: id } });
    }

    const toCreate = variants.filter((v) => !v._delete && (!v.id || v.id.toString().startsWith('new_')));
    for (const v of toCreate) {
      await prisma.productVariant.create({
        data: {
          product: { connect: { id } },
          sku: v.sku || null,
          size: v.size || null,
          color: v.color || null,
          price: v.price ? parseFloat(v.price) : null,
          sale_price: v.sale_price ? parseFloat(v.sale_price) : null,
          inventoryQuantity: v.inventoryQuantity ? parseInt(v.inventoryQuantity) : 0,
          isDefault: v.isDefault || false,
          image: v.imageId ? { connect: { id: v.imageId } } : undefined,
        },
      });
    }

    const toUpdate = variants.filter((v) => !v._delete && v.id && !v.id.toString().startsWith('new_'));
    for (const v of toUpdate) {
      await prisma.productVariant.update({
        where: { id: v.id },
        data: {
          sku: v.sku || null,
          size: v.size || null,
          color: v.color || null,
          price: v.price ? parseFloat(v.price) : null,
          sale_price: v.sale_price ? parseFloat(v.sale_price) : null,
          inventoryQuantity: v.inventoryQuantity ? parseInt(v.inventoryQuantity) : 0,
          isDefault: v.isDefault || false,
          image: v.imageId ? { connect: { id: v.imageId } } : { disconnect: true },
        },
      });
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      title, slug, description,
      unite_price: parseFloat(unite_price),
      sale_price: sale_price ? parseFloat(sale_price) : null,
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
      inventoryQuantity: inventoryQuantity ? parseInt(inventoryQuantity) : null,
      status: status || 'draft',
      categories: categorySlug ? { set: [{ slug: categorySlug }] } : { set: [] },
      images: imagePaths?.length ? { create: imagePaths.map((p) => ({ image_path: p, altText: title })) } : undefined,
    },
    include: { images: true, variants: true, categories: true },
  });

  revalidatePath('/admin/products');
  return serialize(product);
}

export async function getProduct(id) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true, variants: true, categories: true },
  });
  return serialize(product);
}

export async function deleteProduct(id) {
  await prisma.productImage.deleteMany({ where: { productId: id } });
  await prisma.productVariant.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });
  revalidatePath('/admin/products');
}
