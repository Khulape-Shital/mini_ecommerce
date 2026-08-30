import { z } from 'zod';
export declare const createCouponSchema: z.ZodObject<{
    body: z.ZodObject<{
        code: z.ZodString;
        discountPercent: z.ZodNumber;
        isActive: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateCouponSchema: z.ZodObject<{
    body: z.ZodObject<{
        code: z.ZodOptional<z.ZodString>;
        discountPercent: z.ZodOptional<z.ZodNumber>;
        isActive: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=coupon.schema.d.ts.map