import { OrderStatus, PaymentStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export interface ShippingAddressInput {
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

function generateOrderNumber(): string {
  const datePart = new Date().getFullYear();
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${datePart}-${randomPart}`;
}

export async function createOrderFromCart(
  userId: string,
  shippingAddress: ShippingAddressInput,
  simulatePaymentSuccess = true,
) {
  if (!simulatePaymentSuccess) {
    throw new AppError('Simulated payment declined. Please try another payment method.', 402);
  }

  return prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError('Your cart is empty.', 400);
    }

    let totalAmount = 0;

    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new AppError(
          `Insufficient stock for "${item.product.name}". Available: ${item.product.stock}.`,
          400,
        );
      }
      totalAmount += Number(item.product.price) * item.quantity;
    }

    // Add flat shipping if subtotal < $100, free shipping >= $100
    const shippingFee = totalAmount >= 100 ? 0 : 9.99;
    const finalTotal = Number((totalAmount + shippingFee).toFixed(2));

    // Decrement stock atomically
    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
        },
      });
    }

    const order = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        totalAmount: finalTotal,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PAID,
        shippingAddress: shippingAddress as unknown as Record<string, string>,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, imageUrl: true },
            },
          },
        },
      },
    });

    // Clear user's cart
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return {
      ...order,
      totalAmount: Number(order.totalAmount),
      items: order.items.map((i) => ({ ...i, price: Number(i.price) })),
    };
  });
}

export async function listUserOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, slug: true, imageUrl: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return orders.map((order) => ({
    ...order,
    totalAmount: Number(order.totalAmount),
    items: order.items.map((i) => ({ ...i, price: Number(i.price) })),
  }));
}

export async function getUserOrderById(userId: string, orderId: string, isAdmin = false) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: { id: true, email: true, firstName: true, lastName: true },
      },
      items: {
        include: {
          product: {
            select: { id: true, name: true, slug: true, imageUrl: true },
          },
        },
      },
    },
  });

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  if (!isAdmin && order.userId !== userId) {
    throw new AppError('You do not have permission to view this order.', 403);
  }

  return {
    ...order,
    totalAmount: Number(order.totalAmount),
    items: order.items.map((i) => ({ ...i, price: Number(i.price) })),
  };
}
