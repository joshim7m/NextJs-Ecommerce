import { NextResponse } from 'next/server';
import prisma from '../../../../src/lib/prisma';

export async function POST(request) {
  const body = await request.json();
  const { name, mobile, address, shippingArea, items } = body;

  if (!name || !mobile || !address || !shippingArea || !items?.length) {
    return NextResponse.json({ error: 'Missing required checkout fields.' }, { status: 400 });
  }

  const deliveryCharge = shippingArea === 'Outside Dhaka' ? 120 : 50;
  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.salePrice ?? item.price ?? 0);
    const quantity = Number(item.quantity ?? 0);
    return sum + price * quantity;
  }, 0);
  const total = subtotal + deliveryCharge;
  const orderNo = `ORDER-${Date.now()}`;

  const order = await prisma.order.create({
    data: {
      orderNo,
      total,
      orderStatus: 'pending',
      paymentStatus: 'pending',
      details: {
        create: {
          customerName: name,
          shippingAddress: address,
          billingAddress: address,
          phoneNumber: mobile,
          shippingArea,
          deliveryCharge,
        },
      },
      items: {
        create: items.map((item) => ({
          productTitle: item.title,
          itemImagePath: item.image || '',
          purchasePrice: Number(item.salePrice ?? item.price ?? 0),
          quantity: Number(item.quantity ?? 0),
        })),
      },
    },
  });

  return NextResponse.json({ orderNo: order.orderNo, total: order.total.toString() });
}
