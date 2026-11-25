import { Router, Request, Response, NextFunction } from 'express';
import { OrderStatus } from '@prisma/client';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  getAdminStats,
  listAllCustomers,
  listAllOrders,
  updateOrderStatus,
} from '../services/adminService';

const router = Router();

router.use(authenticate, authorize(['ADMIN']));

const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});

router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await getAdminStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/customers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const result = await listAllCustomers(page, limit);
    res.status(200).json({
      success: true,
      data: result.customers,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const status = typeof req.query.status === 'string' && req.query.status
      ? (req.query.status as OrderStatus)
      : undefined;
    const result = await listAllOrders(page, limit, status);
    res.status(200).json({
      success: true,
      data: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
});

router.patch(
  '/orders/:id/status',
  validate({ body: updateOrderStatusSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await updateOrderStatus(req.params.id, req.body.status);
      res.status(200).json({
        success: true,
        message: 'Order status updated.',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
