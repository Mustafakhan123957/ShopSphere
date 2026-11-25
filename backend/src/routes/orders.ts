import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AuthRequest } from '../types';
import {
  createOrderFromCart,
  listUserOrders,
  getUserOrderById,
} from '../services/orderService';

const router = Router();

router.use(authenticate);

const createOrderSchema = z.object({
  shippingAddress: z.object({
    fullName: z.string().min(2, 'Full name is required'),
    street: z.string().min(2, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(1, 'State/Province is required'),
    postalCode: z.string().min(2, 'Postal code is required'),
    country: z.string().min(2, 'Country is required'),
  }),
  simulatePaymentSuccess: z.boolean().optional().default(true),
});

router.post(
  '/',
  validate({ body: createOrderSchema }),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const order = await createOrderFromCart(
        req.user!.id,
        req.body.shippingAddress,
        req.body.simulatePaymentSuccess,
      );
      res.status(201).json({
        success: true,
        message: 'Order placed successfully.',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orders = await listUserOrders(req.user!.id);
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user!.role === 'ADMIN';
    const order = await getUserOrderById(req.user!.id, req.params.id, isAdmin);
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
