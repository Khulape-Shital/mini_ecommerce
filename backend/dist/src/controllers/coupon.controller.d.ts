import type { Request, Response, NextFunction } from 'express';
export declare const couponController: {
    createCoupon(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCoupons(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCouponById(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateCoupon(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteCoupon(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=coupon.controller.d.ts.map