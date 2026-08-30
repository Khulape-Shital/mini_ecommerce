import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { prisma } from '../../src/db/prisma.js';

describe('Coupon API', () => {
  beforeEach(async () => {
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.coupon.deleteMany();
  });

  const validCoupon = {
    code: 'DISCOUNT20',
    discountPercent: 20,
  };

  describe('POST /api/v1/coupons', () => {
    it('should create a valid coupon', async () => {
      const res = await request(app).post('/api/v1/coupons').send(validCoupon);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe(validCoupon.code);
      expect(res.body.data.discountPercent).toBe(validCoupon.discountPercent);
      expect(res.body.data.isActive).toBe(true); // Default
    });

    it('should reject invalid discount values', async () => {
      const res = await request(app).post('/api/v1/coupons').send({
        code: 'INVALID',
        discountPercent: 150, // > 100
      });

      expect(res.status).toBe(400); // Zod validation
    });

    it('should reject duplicate code', async () => {
      await request(app).post('/api/v1/coupons').send(validCoupon);
      const res = await request(app).post('/api/v1/coupons').send(validCoupon);

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('COUPON_ALREADY_EXISTS');
    });
  });

  describe('GET /api/v1/coupons', () => {
    it('should get coupon by id', async () => {
      const created = await request(app).post('/api/v1/coupons').send(validCoupon);
      const res = await request(app).get(`/api/v1/coupons/${created.body.data.id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.code).toBe(validCoupon.code);
    });

    it('should return 404 for coupon not found', async () => {
      const res = await request(app).get('/api/v1/coupons/00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(404);
    });

    it('should list coupons with pagination', async () => {
      await request(app).post('/api/v1/coupons').send({ code: 'CODE1', discountPercent: 10 });
      await request(app).post('/api/v1/coupons').send({ code: 'CODE2', discountPercent: 20 });

      const res = await request(app).get('/api/v1/coupons?page=1&limit=1');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBeGreaterThanOrEqual(2);
    });
  });

  describe('PATCH /api/v1/coupons/:id', () => {
    it('should update coupon / activate/deactivate', async () => {
      const created = await request(app).post('/api/v1/coupons').send(validCoupon);
      
      const res = await request(app)
        .patch(`/api/v1/coupons/${created.body.data.id}`)
        .send({ isActive: false, discountPercent: 30 });

      expect(res.status).toBe(200);
      expect(res.body.data.isActive).toBe(false);
      expect(res.body.data.discountPercent).toBe(30);
    });
  });

  describe('DELETE /api/v1/coupons/:id', () => {
    it('should delete coupon successfully', async () => {
      const created = await request(app).post('/api/v1/coupons').send(validCoupon);
      const res = await request(app).delete(`/api/v1/coupons/${created.body.data.id}`);

      expect(res.status).toBe(200);
    });
  });
});
