import { Router } from 'express';
import { Role } from '@prisma/client';
import { auth } from '../../middlewares/auth.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { PaymentValidation } from './payment.validation.js';
import { PaymentController } from './payment.controller.js';

const router = Router();

router.post(
  '/create',
  auth(Role.CUSTOMER),
  validateRequest(PaymentValidation.createPaymentValidationSchema),
  PaymentController.createPayment,
);

router.get('/confirm', PaymentController.confirmPayment);
router.post('/confirm', PaymentController.confirmPayment);

router.get('/', auth(Role.CUSTOMER, Role.ADMIN), PaymentController.getUserPayments);
router.get('/:id', auth(Role.CUSTOMER, Role.ADMIN), PaymentController.getPaymentById);

export const PaymentRoutes = router;
