export declare const couponService: {
    createCoupon(data: {
        code: string;
        discountPercent: number;
        isActive?: boolean;
    }): Promise<{
        id: string;
        code: string;
        discountPercent: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getCoupons(options: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<{
        data: {
            id: string;
            code: string;
            discountPercent: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getCouponById(id: string): Promise<{
        id: string;
        code: string;
        discountPercent: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateCoupon(id: string, data: {
        code?: string;
        discountPercent?: number;
        isActive?: boolean;
    }): Promise<{
        id: string;
        code: string;
        discountPercent: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteCoupon(id: string): Promise<{
        id: string;
        code: string;
        discountPercent: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
};
//# sourceMappingURL=coupon.service.d.ts.map