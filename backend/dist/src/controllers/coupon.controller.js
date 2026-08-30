import { couponService } from '../services/coupon.service.js';
export const couponController = {
    async createCoupon(req, res, next) {
        try {
            const coupon = await couponService.createCoupon(req.body);
            res.status(201).json({
                success: true,
                data: coupon,
            });
        }
        catch (error) {
            next(error);
        }
    },
    async getCoupons(req, res, next) {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
            const search = req.query.search;
            const options = { page, limit };
            if (search)
                options.search = search;
            const result = await couponService.getCoupons(options);
            res.status(200).json({
                success: true,
                ...result,
            });
        }
        catch (error) {
            next(error);
        }
    },
    async getCouponById(req, res, next) {
        try {
            const coupon = await couponService.getCouponById(req.params.id);
            res.status(200).json({
                success: true,
                data: coupon,
            });
        }
        catch (error) {
            next(error);
        }
    },
    async updateCoupon(req, res, next) {
        try {
            const coupon = await couponService.updateCoupon(req.params.id, req.body);
            res.status(200).json({
                success: true,
                data: coupon,
            });
        }
        catch (error) {
            next(error);
        }
    },
    async deleteCoupon(req, res, next) {
        try {
            await couponService.deleteCoupon(req.params.id);
            res.status(200).json({
                success: true,
                message: 'Coupon deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=coupon.controller.js.map