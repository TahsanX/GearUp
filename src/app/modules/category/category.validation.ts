import { z } from 'zod';

const createCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Category name is required' }).min(2),
  }),
});

export const CategoryValidation = {
  createCategoryValidationSchema,
};
