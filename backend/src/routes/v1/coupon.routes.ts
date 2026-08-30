import { Router } from 'express';
import { couponController } from '../../controllers/coupon.controller.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { createCouponSchema, updateCouponSchema } from '../../schemas/coupon.schema.js';

const router = Router();

router.post('/', validateRequest(createCouponSchema), couponController.createCoupon);
router.get('/', couponController.getCoupons);
router.get('/:id', couponController.getCouponById);
router.patch('/:id', validateRequest(updateCouponSchema), couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);

export default router;
