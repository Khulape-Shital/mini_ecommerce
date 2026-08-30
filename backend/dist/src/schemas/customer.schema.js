import { z } from 'zod';
export const createCustomerSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters long'),
        email: z.string().email('Invalid email address'),
        contact: z.string().optional(),
    }).strict(),
});
export const updateCustomerSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
        email: z.string().email('Invalid email address').optional(),
        contact: z.string().optional(),
    }).strict(),
});
export const listCustomersQuerySchema = z.object({
    query: z.object({
        page: z.string().regex(/^\d+$/).default('1').transform(Number),
        limit: z.string().regex(/^\d+$/).default('10').transform(Number),
    }),
});
//# sourceMappingURL=customer.schema.js.map