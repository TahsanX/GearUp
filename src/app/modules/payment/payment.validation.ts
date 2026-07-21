import { z } from 'zod';

const createPaymentValidationSchema = z.object({
  body: z.object({
    rentalOrderId: z.string({ required_error: 'Rental order id is required' }),
  }),
});

export const PaymentValidation = {
  createPaymentValidationSchema,
};
