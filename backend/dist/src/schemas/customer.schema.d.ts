import { z } from 'zod';
export declare const createCustomerSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
        contact: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strip>;
export declare const updateCustomerSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        contact: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strip>;
export declare const listCustomersQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<number, string>>;
        limit: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<number, string>>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=customer.schema.d.ts.map