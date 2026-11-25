import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { slugify } from '../utils/slugify';

export async function listCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    productCount: cat._count.products,
    createdAt: cat.createdAt,
    updatedAt: cat.updatedAt,
  }));
}

export async function createCategory(input: { name: string; description?: string }) {
  const slug = slugify(input.name);
  const existing = await prisma.category.findFirst({
    where: { OR: [{ name: input.name.trim() }, { slug }] },
  });

  if (existing) {
    throw new AppError('A category with this name already exists.', 409);
  }

  return prisma.category.create({
    data: {
      name: input.name.trim(),
      slug,
      description: input.description?.trim(),
    },
  });
}

export async function updateCategory(id: string, input: { name?: string; description?: string }) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Category not found.', 404);
  }

  return prisma.category.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name.trim(), slug: slugify(input.name) }),
      ...(input.description !== undefined && { description: input.description.trim() }),
    },
  });
}

export async function deleteCategory(id: string) {
  const existing = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });

  if (!existing) {
    throw new AppError('Category not found.', 404);
  }

  if (existing._count.products > 0) {
    throw new AppError('Cannot delete category that still contains products.', 409);
  }

  await prisma.category.delete({ where: { id } });
}
