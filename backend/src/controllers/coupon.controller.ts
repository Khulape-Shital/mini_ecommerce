import type { Request, Response, NextFunction } from 'express';
import { couponService } from '../services/coupon.service.js';

export const couponController = {
  async createCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const coupon = await couponService.createCoupon(req.body);
      res.status(201).json({
        success: true,
        data: coupon,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCoupons(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const search = req.query.search as string | undefined;
      const options: { page: number; limit: number; search?: string } = { page, limit };
      if (search) options.search = search;

      const result = await couponService.getCoupons(options);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCouponById(req: Request, res: Response, next: NextFunction) {
    try {
      const coupon = await couponService.getCouponById(req.params.id as string);
      res.status(200).json({
        success: true,
        data: coupon,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const coupon = await couponService.updateCoupon(req.params.id as string, req.body);
      res.status(200).json({
        success: true,
        data: coupon,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      await couponService.deleteCoupon(req.params.id as string);
      res.status(200).json({
        success: true,
        message: 'Coupon deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};
