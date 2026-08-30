import { z } from 'zod';

export const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(3).max(50),
    discountPercent: z.number().int().min(1).max(100),
    isActive: z.boolean().optional(),
  }),
});

export const updateCouponSchema = z.object({
  body: z.object({
    code: z.string().min(3).max(50).optional(),
    discountPercent: z.number().int().min(1).max(100).optional(),
    isActive: z.boolean().optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  }),
});
