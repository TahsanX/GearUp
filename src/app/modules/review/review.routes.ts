import { Router } from 'express';
import { Role } from '@prisma/client';
import { auth } from '../../middlewares/auth.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { ReviewValidation } from './review.validation.js';
import { ReviewController } from './review.controller.js';

const router = Router();

router.post(
  '/',
  auth(Role.CUSTOMER),
  validateRequest(ReviewValidation.createReviewValidationSchema),
  ReviewController.createReview,
);

export const ReviewRoutes = router;
