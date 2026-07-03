import { NextResponse } from 'next/server';
import prisma from '../../../../../src/lib/prisma';

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const { title, slug, description, unite_price, sale_price, compareAtPrice, inventoryQuantity, status, categorySlugs } = body;

  try {
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
        categories: categorySlugs?.length ? { set: categorySlugs.map((slug) => ({ slug })) } : { set: [] },
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
