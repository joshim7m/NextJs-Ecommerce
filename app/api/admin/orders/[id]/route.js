import { NextResponse } from 'next/server';
import prisma from '../../../../../src/lib/prisma';

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const { orderStatus, paymentStatus } = body;

  try {
    const order = await prisma.order.update({
      where: { id },
      data: { orderStatus, paymentStatus },
      include: { details: true, items: true },
    });
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }
}
