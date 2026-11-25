import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  listProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/productService';

const router = Router();

const productBodySchema = z.object({
  name: z.string().min(2, 'Product name is required').max(255),
  description: z.string().min(5, 'Description is required'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  imageUrl: z.string().url('Valid image URL is required'),
  categoryId: z.string().uuid('Valid category ID is required'),
  isFeatured: z.boolean().optional(),
});

const productUpdateSchema = productBodySchema.partial();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      inStock,
      featured,
      page,
      limit,
      sort,
    } = req.query;

    const result = await listProducts({
      search: typeof search === 'string' && search.trim() ? search.trim() : undefined,
      category: typeof category === 'string' && category.trim() ? category.trim() : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      inStock: inStock === 'true',
      featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 12,
      sort:
        sort === 'price_asc' ||
        sort === 'price_desc' ||
        sort === 'newest' ||
        sort === 'name_asc'
          ? sort
          : 'newest',
    });

    res.status(200).json({
      success: true,
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:idOrSlug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await getProductByIdOrSlug(req.params.idOrSlug);
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/',
  authenticate,
  authorize(['ADMIN']),
  validate({ body: productBodySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await createProduct(req.body);
      res.status(201).json({
        success: true,
        message: 'Product created successfully.',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validate({ body: productUpdateSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await updateProduct(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Product updated successfully.',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await deleteProduct(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Product deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
