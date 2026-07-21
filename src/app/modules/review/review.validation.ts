import { z } from 'zod';

const createReviewValidationSchema = z.object({
  body: z.object({
    gearItemId: z.string({ required_error: 'Gear item id is required' }),
    rentalOrderId: z.string({ required_error: 'Rental order id is required' }),
    rating: z.number({ required_error: 'Rating is required' }).int().min(1).max(5),
    comment: z.string().optional(),
  }),
});

export const ReviewValidation = {
  createReviewValidationSchema,
};
