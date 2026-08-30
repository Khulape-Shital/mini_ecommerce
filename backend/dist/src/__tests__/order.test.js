import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { prisma } from '../../src/db/prisma.js';
import { OrderStatus, Prisma } from '../../src/db/prisma.js';
describe('Order API', () => {
    let customer;
    let product1;
    let product2;
    let coupon;
    beforeEach(async () => {
        await prisma.shipping.deleteMany();
        await prisma.payment.deleteMany();
        await prisma.orderItem.deleteMany();
        await prisma.order.deleteMany();
        await prisma.product.deleteMany();
        await prisma.coupon.deleteMany();
        await prisma.customer.deleteMany();
        customer = await prisma.customer.create({
            data: { name: 'Test Customer', email: 'test@example.com' }
        });
        product1 = await prisma.product.create({
            data: { name: 'Product 1', price: new Prisma.Decimal('100.00'), quantity: 10 }
        });
        product2 = await prisma.product.create({
            data: { name: 'Product 2', price: new Prisma.Decimal('50.00'), quantity: 5 }
        });
        coupon = await prisma.coupon.create({
            data: { code: 'SAVE20', discountPercent: 20, isActive: true }
        });
    });
    describe('POST /api/v1/orders', () => {
        it('should create a successful single-product order', async () => {
            const res = await request(app)
                .post('/api/v1/orders')
                .send({
                customerId: customer.id,
                items: [{ productId: product1.id, quantity: 2 }],
                shippingAddress: '123 Main St'
            });
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.total).toBe('200'); // 100 * 2
            expect(res.body.data.discountAmount).toBe('0');
            const p1 = await prisma.product.findUnique({ where: { id: product1.id } });
            expect(p1?.quantity).toBe(8); // 10 - 2
        });
        it('should create a successful multi-product order and verify unitPrice snapshot', async () => {
            const res = await request(app)
                .post('/api/v1/orders')
                .send({
                customerId: customer.id,
                items: [
                    { productId: product1.id, quantity: 1 },
                    { productId: product2.id, quantity: 2 }
                ],
                shippingAddress: '123 Main St'
            });
            expect(res.status).toBe(201);
            expect(res.body.data.total).toBe('200'); // 100*1 + 50*2
            // Verify snapshot
            const items = res.body.data.items;
            expect(items).toHaveLength(2);
            const item1 = items.find((i) => i.productId === product1.id);
            expect(item1.unitPrice).toBe('100');
            // Change product price later, shouldn't affect past order
            await prisma.product.update({ where: { id: product1.id }, data: { price: 200 } });
            const order = await prisma.order.findUnique({ where: { id: res.body.data.id }, include: { items: true } });
            expect(order?.items.find(i => i.productId === product1.id)?.unitPrice.toString()).toBe('100');
        });
        it('should apply coupon correctly', async () => {
            const res = await request(app)
                .post('/api/v1/orders')
                .send({
                customerId: customer.id,
                items: [{ productId: product1.id, quantity: 2 }],
                couponCode: 'SAVE20',
                shippingAddress: '123 Main St'
            });
            expect(res.status).toBe(201);
            expect(res.body.data.total).toBe('160'); // 200 - 20%
            expect(res.body.data.discountAmount).toBe('40');
        });
        it('should fail if customer does not exist', async () => {
            const res = await request(app)
                .post('/api/v1/orders')
                .send({
                customerId: '00000000-0000-0000-0000-000000000000',
                items: [{ productId: product1.id, quantity: 1 }],
                shippingAddress: '123 Main St'
            });
            expect(res.status).toBe(404);
            expect(res.body.error.code).toBe('CUSTOMER_NOT_FOUND');
        });
        it('should fail if a product does not exist', async () => {
            const res = await request(app)
                .post('/api/v1/orders')
                .send({
                customerId: customer.id,
                items: [{ productId: '00000000-0000-0000-0000-000000000000', quantity: 1 }],
                shippingAddress: '123 Main St'
            });
            expect(res.status).toBe(404);
            expect(res.body.error.code).toBe('PRODUCT_NOT_FOUND');
        });
        it('should fail with empty items', async () => {
            const res = await request(app)
                .post('/api/v1/orders')
                .send({
                customerId: customer.id,
                items: [],
                shippingAddress: '123 Main St'
            });
            expect(res.status).toBe(400); // Zod validation
        });
        it('should fail with invalid quantity', async () => {
            const res = await request(app)
                .post('/api/v1/orders')
                .send({
                customerId: customer.id,
                items: [{ productId: product1.id, quantity: 0 }],
                shippingAddress: '123 Main St'
            });
            expect(res.status).toBe(400); // Zod validation
        });
        it('should reject duplicate product IDs', async () => {
            const res = await request(app)
                .post('/api/v1/orders')
                .send({
                customerId: customer.id,
                items: [
                    { productId: product1.id, quantity: 2 },
                    { productId: product1.id, quantity: 3 }
                ],
                shippingAddress: '123 Main St'
            });
            expect(res.status).toBe(400);
            expect(res.body.error.code).toBe('DUPLICATE_PRODUCT');
        });
        it('should fail if insufficient inventory and rollback transaction', async () => {
            const res = await request(app)
                .post('/api/v1/orders')
                .send({
                customerId: customer.id,
                items: [{ productId: product1.id, quantity: 11 }], // Only 10 available
                shippingAddress: '123 Main St'
            });
            expect(res.status).toBe(400);
            expect(res.body.error.code).toBe('INSUFFICIENT_INVENTORY');
            const p1 = await prisma.product.findUnique({ where: { id: product1.id } });
            expect(p1?.quantity).toBe(10); // Check rollback
        });
        it('should prevent overselling during concurrent requests', async () => {
            // product2 has quantity 5
            // Send 5 concurrent requests of quantity 2. Only 2 should succeed, 3 should fail.
            const payload = {
                customerId: customer.id,
                items: [{ productId: product2.id, quantity: 2 }],
                shippingAddress: '123 Main St'
            };
            const requests = Array.from({ length: 5 }).map(() => request(app).post('/api/v1/orders').send(payload));
            const responses = await Promise.all(requests);
            const successes = responses.filter(r => r.status === 201);
            const failures = responses.filter(r => r.status !== 201);
            expect(successes.length).toBe(2); // 2 + 2 = 4 <= 5
            expect(failures.length).toBe(3); // The rest failed due to insufficient inventory / concurrency error
            const p2 = await prisma.product.findUnique({ where: { id: product2.id } });
            expect(p2?.quantity).toBe(1); // 5 - 4
        });
    });
    describe('Cancellation', () => {
        let order;
        beforeEach(async () => {
            const res = await request(app).post('/api/v1/orders').send({
                customerId: customer.id,
                items: [{ productId: product1.id, quantity: 3 }],
                shippingAddress: '123 Main St'
            });
            order = res.body.data;
        });
        it('should cancel a PENDING order and restore inventory', async () => {
            const res = await request(app).post(`/api/v1/orders/${order.id}/cancel`);
            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe(OrderStatus.CANCELLED);
            const p1 = await prisma.product.findUnique({ where: { id: product1.id } });
            expect(p1?.quantity).toBe(10); // restored from 7 back to 10
        });
        it('should prevent double cancellation', async () => {
            await request(app).post(`/api/v1/orders/${order.id}/cancel`);
            const res = await request(app).post(`/api/v1/orders/${order.id}/cancel`);
            expect(res.status).toBe(400);
            expect(res.body.error.code).toBe('ORDER_UNCANCELLABLE'); // First check catches it since it's CANCELLED
        });
        it('should fail to cancel SHIPPED order', async () => {
            await prisma.order.update({ where: { id: order.id }, data: { status: OrderStatus.SHIPPED } });
            const res = await request(app).post(`/api/v1/orders/${order.id}/cancel`);
            expect(res.status).toBe(400);
            expect(res.body.error.code).toBe('ORDER_UNCANCELLABLE');
        });
    });
    describe('Status transitions', () => {
        let order;
        beforeEach(async () => {
            const res = await request(app).post('/api/v1/orders').send({
                customerId: customer.id,
                items: [{ productId: product1.id, quantity: 1 }],
                shippingAddress: '123 Main St'
            });
            order = res.body.data;
        });
        it('should allow valid transition PENDING -> CONFIRMED', async () => {
            const res = await request(app).patch(`/api/v1/orders/${order.id}/status`).send({ status: OrderStatus.CONFIRMED });
            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe(OrderStatus.CONFIRMED);
        });
        it('should reject invalid transition PENDING -> SHIPPED', async () => {
            const res = await request(app).patch(`/api/v1/orders/${order.id}/status`).send({ status: OrderStatus.SHIPPED });
            expect(res.status).toBe(400);
            expect(res.body.error.code).toBe('INVALID_STATUS_TRANSITION');
        });
    });
});
//# sourceMappingURL=order.test.js.map