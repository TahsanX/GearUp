import { Router } from 'express';
import { Role } from '@prisma/client';
import { auth } from '../../middlewares/auth.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { ProviderValidation } from './provider.validation.js';
import { ProviderController } from './provider.controller.js';

const router = Router();

router.post(
  '/gear',
  auth(Role.PROVIDER),
  validateRequest(ProviderValidation.createGearValidationSchema),
  ProviderController.addGear,
);

router.put(
  '/gear/:id',
  auth(Role.PROVIDER),
  validateRequest(ProviderValidation.updateGearValidationSchema),
  ProviderController.updateGear,
);

router.delete('/gear/:id', auth(Role.PROVIDER), ProviderController.deleteGear);

router.get('/orders', auth(Role.PROVIDER), ProviderController.getProviderOrders);

router.patch(
  '/orders/:id',
  auth(Role.PROVIDER),
  validateRequest(ProviderValidation.updateOrderStatusValidationSchema),
  ProviderController.updateOrderStatus,
);

export const ProviderRoutes = router;
