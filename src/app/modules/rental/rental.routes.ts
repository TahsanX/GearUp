import { Router } from 'express';
import { Role } from '@prisma/client';
import { auth } from '../../middlewares/auth.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { RentalValidation } from './rental.validation.js';
import { RentalController } from './rental.controller.js';

const router = Router();

router.post(
  '/',
  auth(Role.CUSTOMER),
  validateRequest(RentalValidation.createRentalValidationSchema),
  RentalController.createRental,
);

router.get('/', auth(Role.CUSTOMER, Role.ADMIN), RentalController.getUserRentals);
router.get('/:id', auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN), RentalController.getRentalById);

export const RentalRoutes = router;
