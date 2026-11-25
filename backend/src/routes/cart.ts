import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AuthRequest } from '../types';
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} from '../services/cartService';

const router = Router();

router.use(authenticate);

const addItemSchema = z.object({
  productId: z.string().uuid('Valid product ID is required'),
  quantity: z.coerce.number().int().min(1).max(99).default(1),
});

const updateItemSchema = z.object({
  quantity: z.coerce.number().int().min(0).max(99),
});

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cart = await getCart(req.user!.id);
    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/items',
  validate({ body: addItemSchema }),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const cart = await addToCart(req.user!.id, req.body.productId, req.body.quantity);
      res.status(200).json({
        success: true,
        message: 'Item added to cart.',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  '/items/:itemId',
  validate({ body: updateItemSchema }),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const cart = await updateCartItemQuantity(
        req.user!.id,
        req.params.itemId,
        req.body.quantity,
      );
      res.status(200).json({
        success: true,
        message: 'Cart updated.',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.delete('/items/:itemId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cart = await removeCartItem(req.user!.id, req.params.itemId);
    res.status(200).json({
      success: true,
      message: 'Item removed from cart.',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cart = await clearCart(req.user!.id);
    res.status(200).json({
      success: true,
      message: 'Cart cleared.',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
