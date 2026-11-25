import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AuthRequest } from '../types';
import {
  updateUserProfile,
  listUserAddresses,
  createAddress,
  deleteAddress,
} from '../services/userService';

const router = Router();

router.use(authenticate);

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
});

const addressSchema = z.object({
  street: z.string().min(2).max(255),
  city: z.string().min(2).max(100),
  state: z.string().min(1).max(100),
  postalCode: z.string().min(2).max(20),
  country: z.string().min(2).max(100),
  isDefault: z.boolean().optional(),
});

router.patch(
  '/profile',
  validate({ body: updateProfileSchema }),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await updateUserProfile(req.user!.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.get('/addresses', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const addresses = await listUserAddresses(req.user!.id);
    res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/addresses',
  validate({ body: addressSchema }),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const address = await createAddress(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Address saved.',
        data: address,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.delete('/addresses/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await deleteAddress(req.user!.id, req.params.id);
    res.status(200).json({
      success: true,
      message: 'Address deleted.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
