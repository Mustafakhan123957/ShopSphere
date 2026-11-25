import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { slugify } from '../utils/slugify';

export interface ProductFilterParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  page?: number;
  limit?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'name_asc';
}

export async function listProducts(params: ProductFilterParams) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(50, Math.max(1, params.limit || 12));
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {};

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  if (params.category) {
    where.category = {
      OR: [{ slug: params.category }, { id: params.category }],
    };
  }

  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    where.price = {};
    if (params.minPrice !== undefined) {
      where.price.gte = params.minPrice;
    }
    if (params.maxPrice !== undefined) {
      where.price.lte = params.maxPrice;
    }
  }

  if (params.inStock) {
    where.stock = { gt: 0 };
  }

  if (params.featured !== undefined) {
    where.isFeatured = params.featured;
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
  switch (params.sort) {
    case 'price_asc':
      orderBy = { price: 'asc' };
      break;
    case 'price_desc':
      orderBy = { price: 'desc' };
      break;
    case 'name_asc':
      orderBy = { name: 'asc' };
      break;
    case 'newest':
    default:
      orderBy = { createdAt: 'desc' };
      break;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    products: products.map((p) => ({ ...p, price: Number(p.price) })),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

export async function getProductByIdOrSlug(identifier: string) {
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ id: identifier }, { slug: identifier }],
    },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  return { ...product, price: Number(product.price) };
}

export async function createProduct(input: {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  categoryId: string;
  isFeatured?: boolean;
}) {
  const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
  if (!category) {
    throw new AppError('Selected category does not exist.', 400);
  }

  const baseSlug = slugify(input.name);
  const existingSlug = await prisma.product.findUnique({ where: { slug: baseSlug } });
  const slug = existingSlug ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

  const product = await prisma.product.create({
    data: {
      name: input.name.trim(),
      slug,
      description: input.description.trim(),
      price: input.price,
      stock: input.stock,
      imageUrl: input.imageUrl.trim(),
      categoryId: input.categoryId,
      isFeatured: input.isFeatured ?? false,
    },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  return { ...product, price: Number(product.price) };
}

export async function updateProduct(
  id: string,
  input: Partial<{
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl: string;
    categoryId: string;
    isFeatured: boolean;
  }>,
) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Product not found.', 404);
  }

  if (input.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
    if (!category) {
      throw new AppError('Selected category does not exist.', 400);
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name.trim() }),
      ...(input.description !== undefined && { description: input.description.trim() }),
      ...(input.price !== undefined && { price: input.price }),
      ...(input.stock !== undefined && { stock: input.stock }),
      ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl.trim() }),
      ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
      ...(input.isFeatured !== undefined && { isFeatured: input.isFeatured }),
    },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  return { ...product, price: Number(product.price) };
}

export async function deleteProduct(id: string) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Product not found.', 404);
  }

  try {
    await prisma.product.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      throw new AppError(
        'Cannot delete product because it is referenced in existing orders. Set stock to 0 instead.',
        409,
      );
    }
    throw error;
  }
}
