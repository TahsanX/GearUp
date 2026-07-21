import { z } from 'zod';

const updateUserStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'SUSPENDED'], { required_error: 'Status is required' }),
  }),
});

const createCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Category name is required' }).min(2),
  }),
});

export const AdminValidation = {
  updateUserStatusValidationSchema,
  createCategoryValidationSchema,
};
