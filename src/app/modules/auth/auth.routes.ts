import { Router } from 'express';
import { Role } from '@prisma/client';
import { auth } from '../../middlewares/auth.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { AuthValidation } from './auth.validation.js';
import { AuthController } from './auth.controller.js';

const router = Router();

router.post(
  '/register',
  validateRequest(AuthValidation.registerValidationSchema),
  AuthController.register,
);

router.post('/login', validateRequest(AuthValidation.loginValidationSchema), AuthController.login);

router.get('/me', auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN), AuthController.getMe);

export const AuthRoutes = router;
