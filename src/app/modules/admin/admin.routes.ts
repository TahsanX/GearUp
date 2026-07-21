import { Router } from 'express';
import { Role } from '@prisma/client';
import { auth } from '../../middlewares/auth.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { AdminValidation } from './admin.validation.js';
import { AdminController } from './admin.controller.js';

const router = Router();

router.get('/users', auth(Role.ADMIN), AdminController.getAllUsers);

router.patch(
  '/users/:id',
  auth(Role.ADMIN),
  validateRequest(AdminValidation.updateUserStatusValidationSchema),
  AdminController.updateUserStatus,
);

router.get('/gear', auth(Role.ADMIN), AdminController.getAllGear);
router.get('/rentals', auth(Role.ADMIN), AdminController.getAllRentals);

router.post(
  '/categories',
  auth(Role.ADMIN),
  validateRequest(AdminValidation.createCategoryValidationSchema),
  AdminController.createCategory,
);

export const AdminRoutes = router;
