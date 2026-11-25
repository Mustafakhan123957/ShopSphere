import { OrderStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export async function getAdminStats() {
  const [totalOrders, totalProducts, totalCustomers, paidOrdersAgg, recentOrders, statusGroups] =
    await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: 'CANCELLED' } },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

  const lowStockProducts = await prisma.product.count({
    where: { stock: { lte: 10 } },
  });

  return {
    totalRevenue: Number(paidOrdersAgg._sum.totalAmount || 0),
    totalOrders,
    totalProducts,
    totalCustomers,
    lowStockProducts,
    ordersByStatus: statusGroups.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = row._count.status;
      return acc;
    }, {}),
    recentOrders: recentOrders.map((o) => ({
      ...o,
      totalAmount: Number(o.totalAmount),
    })),
  };
}

export async function listAllCustomers(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
  ]);

  return {
    customers: customers.map((c) => ({
      id: c.id,
      email: c.email,
      firstName: c.firstName,
      lastName: c.lastName,
      role: c.role,
      createdAt: c.createdAt,
      orderCount: c._count.orders,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function listAllOrders(page = 1, limit = 20, status?: OrderStatus) {
  const skip = (page - 1) * limit;
  const where = status ? { status } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        items: {
          include: {
            product: { select: { id: true, name: true, imageUrl: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders: orders.map((o) => ({
      ...o,
      totalAmount: Number(o.totalAmount),
      items: o.items.map((i) => ({ ...i, price: Number(i.price) })),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const existing = await prisma.order.findUnique({ where: { id: orderId } });
  if (!existing) {
    throw new AppError('Order not found.', 404);
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: {
      user: {
        select: { id: true, email: true, firstName: true, lastName: true },
      },
      items: {
        include: {
          product: { select: { id: true, name: true, imageUrl: true } },
        },
      },
    },
  });

  return {
    ...updated,
    totalAmount: Number(updated.totalAmount),
    items: updated.items.map((i) => ({ ...i, price: Number(i.price) })),
  };
}
