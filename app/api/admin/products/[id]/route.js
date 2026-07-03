import { NextResponse } from 'next/server';
import prisma from '../../../../../src/lib/prisma';

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const { title, slug: rawSlug, description, unite_price, sale_price, compareAtPrice, inventoryQuantity, status, categorySlug, imagePaths, removeImageIds, variants } = body;
  const slug = rawSlug?.trim();

  try {
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
        title,
        slug,
        description,
        unite_price: parseFloat(unite_price),
        sale_price: sale_price ? parseFloat(sale_price) : null,
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        inventoryQuantity: inventoryQuantity ? parseInt(inventoryQuantity) : null,
        status,
        categories: categorySlug ? { set: [{ slug: categorySlug }] } : { set: [] },
        images: imagePaths?.length ? { create: imagePaths.map((p) => ({ image_path: p, altText: title })) } : undefined,
      },
      include: { images: true, variants: true, categories: true },
    });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }
}
