import { z } from 'zod';
import { OrderStatus } from '../db/prisma.js';
export const createOrderSchema = z.object({
    body: z.object({
        customerId: z.string().uuid('Invalid customer ID'),
        items: z.array(z.object({
            productId: z.string().uuid('Invalid product ID'),
            quantity: z.number().int().positive('Quantity must be a positive integer'),
        })).min(1, 'Order must contain at least one item'),
        shippingAddress: z.string().min(5, 'Shipping address must be at least 5 characters long'),
        couponCode: z.string().optional(),
    }),
});
export const updateOrderStatusSchema = z.object({
    body: z.object({
        status: z.nativeEnum(OrderStatus, {
            message: 'Invalid order status'
        }),
    }),
});
export const getOrdersSchema = z.object({
    query: z.object({
        page: z.string().regex(/^\d+$/).optional(),
        limit: z.string().regex(/^\d+$/).optional(),
        status: z.nativeEnum(OrderStatus).optional(),
        customerId: z.string().uuid().optional(),
    }),
});
//# sourceMappingURL=order.schema.js.map