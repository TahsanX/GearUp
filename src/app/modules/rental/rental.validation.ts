import { z } from 'zod';

const createRentalValidationSchema = z.object({
  body: z.object({
    startDate: z.string({ required_error: 'Start date is required' }),
    endDate: z.string({ required_error: 'End date is required' }),
    items: z
      .array(
        z.object({
          gearItemId: z.string({ required_error: 'Gear item id is required' }),
          quantity: z.number().int().positive().default(1),
        }),
      )
      .nonempty('At least one item is required'),
  }),
});

export const RentalValidation = {
  createRentalValidationSchema,
};
