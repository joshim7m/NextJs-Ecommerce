'use server';

import { revalidatePath } from 'next/cache';
import prisma from '../lib/prisma';

function serialize(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export async function getOrders() {
  const orders = await prisma.order.findMany({
    include: { details: true, items: true, user: true },
    orderBy: { createdAt: 'desc' },
  });
  return serialize(orders);
}

export async function getOrderByOrderNo(orderNo) {
  const order = await prisma.order.findUnique({
    where: { orderNo },
    include: { details: true, items: true, user: true },
  });
  return serialize(order);
}

export async function updateOrderStatus(id, data) {
  const order = await prisma.order.update({
    where: { id },
    data,
  });
  revalidatePath('/admin/orders');
  return serialize(order);
}

export async function updateOrderDetails(orderId, data) {
  const details = await prisma.orderDetails.update({
    where: { orderId },
    data,
    include: { order: { include: { items: true } } },
  });
  if (data.deliveryCharge !== undefined) {
    const subtotal = details.order.items.reduce(
      (s, i) => s + Number(i.purchasePrice) * i.quantity, 0
    );
    const newTotal = subtotal + Number(data.deliveryCharge);
    await prisma.order.update({
      where: { id: orderId },
      data: { total: newTotal },
    });
  }
  revalidatePath('/admin/orders');
  return serialize(details);
}
