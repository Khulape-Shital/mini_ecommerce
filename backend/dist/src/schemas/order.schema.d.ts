import { z } from 'zod';
export declare const createOrderSchema: z.ZodObject<{
    body: z.ZodObject<{
        customerId: z.ZodString;
        items: z.ZodArray<z.ZodObject<{
            productId: z.ZodString;
            quantity: z.ZodNumber;
        }, z.core.$strip>>;
        shippingAddress: z.ZodString;
        couponCode: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateOrderStatusSchema: z.ZodObject<{
    body: z.ZodObject<{
        status: z.ZodEnum<{
            readonly PENDING: 'PENDING';
            readonly CONFIRMED: 'CONFIRMED';
            readonly SHIPPED: 'SHIPPED';
            readonly DELIVERED: 'DELIVERED';
            readonly CANCELLED: 'CANCELLED';
        }>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getOrdersSchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<{
            readonly PENDING: 'PENDING';
            readonly CONFIRMED: 'CONFIRMED';
            readonly SHIPPED: 'SHIPPED';
            readonly DELIVERED: 'DELIVERED';
            readonly CANCELLED: 'CANCELLED';
        }>>;
        customerId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=order.schema.d.ts.map