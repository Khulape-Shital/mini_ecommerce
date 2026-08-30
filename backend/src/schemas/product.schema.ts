import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Product name is required').max(200),
    description: z.string().optional(),
    price: z.number().min(0, 'Price must be greater than or equal to 0'),
    quantity: z.number().int().min(0, 'Quantity cannot be negative').default(0),
    categoryId: z.string().uuid('Invalid category ID').optional().nullable(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Product name must not be empty').max(200).optional(),
    description: z.string().optional(),
    price: z.number().min(0, 'Price must be greater than or equal to 0').optional(),
    quantity: z.number().int().min(0, 'Quantity cannot be negative').optional(),
    categoryId: z.string().uuid('Invalid category ID').optional().nullable(),
  }).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update"
  }),
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
});

export const getProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
});

export const listProductsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).default('1').transform(Number),
    limit: z.string().regex(/^\d+$/).default('10').transform(Number),
    search: z.string().optional(),
    categoryId: z.string().uuid('Invalid category ID').optional(),
    sortBy: z.enum(['price', 'createdAt', 'name']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});
