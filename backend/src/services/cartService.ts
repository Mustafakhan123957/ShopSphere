import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
    });
  }

  return cart;
}

export async function getCart(userId: string) {
  const cart = await getOrCreateCart(userId);

  const fullCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: { select: { id: true, name: true, slug: true } },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  const items = (fullCart?.items || []).map((item) => ({
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    product: {
      ...item.product,
      price: Number(item.product.price),
    },
    subtotal: Number((Number(item.product.price) * item.quantity).toFixed(2)),
  }));

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = Number(items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));

  return {
    id: cart.id,
    userId: cart.userId,
    items,
    totalItems,
    totalPrice,
  };
}

export async function addToCart(userId: string, productId: string, quantity: number) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new AppError('Product not found.', 404);
  }
  if (product.stock < quantity) {
    throw new AppError(`Only ${product.stock} unit(s) available in stock.`, 400);
  }

  const cart = await getOrCreateCart(userId);

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });

  const nextQty = existingItem ? existingItem.quantity + quantity : quantity;
  if (nextQty > product.stock) {
    throw new AppError(`Cannot add more than ${product.stock} unit(s) of this product.`, 400);
  }

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: nextQty },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });
  }

  return getCart(userId);
}

export async function updateCartItemQuantity(userId: string, itemId: string, quantity: number) {
  const cart = await getOrCreateCart(userId);

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
    include: { product: true },
  });

  if (!item) {
    throw new AppError('Cart item not found.', 404);
  }

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
    return getCart(userId);
  }

  if (quantity > item.product.stock) {
    throw new AppError(`Only ${item.product.stock} unit(s) available in stock.`, 400);
  }

  await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity },
  });

  return getCart(userId);
}

export async function removeCartItem(userId: string, itemId: string) {
  const cart = await getOrCreateCart(userId);

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
  });

  if (!item) {
    throw new AppError('Cart item not found.', 404);
  }

  await prisma.cartItem.delete({ where: { id: item.id } });
  return getCart(userId);
}

export async function clearCart(userId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
  return getCart(userId);
}
