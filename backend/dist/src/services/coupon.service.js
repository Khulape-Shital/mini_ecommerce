import { prisma } from '../db/prisma.js';
import { AppError } from '../utils/AppError.js';
export const couponService = {
    async createCoupon(data) {
        const existing = await prisma.coupon.findUnique({ where: { code: data.code } });
        if (existing) {
            throw new AppError(409, 'COUPON_ALREADY_EXISTS', 'A coupon with this code already exists');
        }
        return await prisma.coupon.create({
            data: {
                code: data.code,
                discountPercent: data.discountPercent,
                isActive: data.isActive ?? true,
            },
        });
    },
    async getCoupons(options) {
        const page = options.page || 1;
        const limit = options.limit || 20;
        const skip = (page - 1) * limit;
        const where = options.search
            ? { code: { contains: options.search, mode: 'insensitive' } }
            : {};
        const [coupons, total] = await Promise.all([
            prisma.coupon.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.coupon.count({ where }),
        ]);
        return {
            data: coupons,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    },
    async getCouponById(id) {
        const coupon = await prisma.coupon.findUnique({ where: { id } });
        if (!coupon) {
            throw new AppError(404, 'COUPON_NOT_FOUND', 'Coupon not found');
        }
        return coupon;
    },
    async updateCoupon(id, data) {
        const coupon = await prisma.coupon.findUnique({ where: { id } });
        if (!coupon) {
            throw new AppError(404, 'COUPON_NOT_FOUND', 'Coupon not found');
        }
        if (data.code && data.code !== coupon.code) {
            const existing = await prisma.coupon.findUnique({ where: { code: data.code } });
            if (existing) {
                throw new AppError(409, 'COUPON_ALREADY_EXISTS', 'A coupon with this code already exists');
            }
        }
        return await prisma.coupon.update({
            where: { id },
            data,
        });
    },
    async deleteCoupon(id) {
        const coupon = await prisma.coupon.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { orders: true }
                }
            }
        });
        if (!coupon) {
            throw new AppError(404, 'COUPON_NOT_FOUND', 'Coupon not found');
        }
        if (coupon._count.orders > 0) {
            throw new AppError(400, 'COUPON_IN_USE', 'Cannot delete a coupon that has been used in orders');
        }
        return await prisma.coupon.delete({
            where: { id },
        });
    },
};
//# sourceMappingURL=coupon.service.js.map