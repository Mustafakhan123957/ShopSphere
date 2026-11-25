import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/categoryService';

const router = Router();

const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required').max(100),
  description: z.string().max(500).optional(),
});

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await listCategories();
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/',
  authenticate,
  authorize(['ADMIN']),
  validate({ body: categorySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await createCategory(req.body);
      res.status(201).json({
        success: true,
        message: 'Category created successfully.',
        data: category,
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
  validate({ body: categorySchema.partial() }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await updateCategory(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Category updated successfully.',
        data: category,
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
      await deleteCategory(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Category deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
