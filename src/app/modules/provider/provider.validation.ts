import { z } from 'zod';

const createGearValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(2),
    description: z.string({ required_error: 'Description is required' }).min(5),
    brand: z.string().optional(),
    pricePerDay: z.number({ required_error: 'Price per day is required' }).positive(),
    stock: z.number().int().nonnegative().optional(),
    images: z.array(z.string()).optional(),
    specifications: z.record(z.any()).optional(),
    categoryId: z.string({ required_error: 'Category is required' }),
  }),
});

const updateGearValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().min(5).optional(),
    brand: z.string().optional(),
    pricePerDay: z.number().positive().optional(),
    stock: z.number().int().nonnegative().optional(),
    images: z.array(z.string()).optional(),
    specifications: z.record(z.any()).optional(),
    categoryId: z.string().optional(),
    isAvailable: z.boolean().optional(),
  }),
});

const updateOrderStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(['CONFIRMED', 'PICKED_UP', 'RETURNED', 'CANCELLED'], {
      required_error: 'Status is required',
    }),
  }),
});

export const ProviderValidation = {
  createGearValidationSchema,
  updateGearValidationSchema,
  updateOrderStatusValidationSchema,
};
