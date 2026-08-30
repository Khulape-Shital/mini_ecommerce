import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { prisma } from '../db/prisma.js';
describe('Product API', () => {
    const uniqueSuffix = Date.now().toString();
    let categoryId;
    let createdProductId;
    beforeAll(async () => {
        // Create a category to use for valid category tests
        const category = await prisma.category.create({
            data: { name: `CatForProductTest-${uniqueSuffix}` }
        });
        categoryId = category.id;
    });
    afterAll(async () => {
        // Clean up
        if (createdProductId) {
            await prisma.product.deleteMany({ where: { id: createdProductId } });
        }
        if (categoryId) {
            await prisma.category.deleteMany({ where: { id: categoryId } });
        }
    });
    it('should create a valid product', async () => {
        const res = await request(app)
            .post('/api/v1/products')
            .send({
            name: `Laptop-${uniqueSuffix}`,
            price: 1500,
            quantity: 10,
            categoryId: categoryId,
        });
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe(`Laptop-${uniqueSuffix}`);
        createdProductId = res.body.data.id;
    });
    it('should reject invalid price', async () => {
        const res = await request(app)
            .post('/api/v1/products')
            .send({
            name: `InvalidPrice-${uniqueSuffix}`,
            price: -50,
            quantity: 10,
        });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        // Could be Zod VALIDATION_ERROR or service INVALID_PRICE depending on where it caught
        expect(res.body.error.code).toBeDefined();
    });
    it('should reject invalid quantity', async () => {
        const res = await request(app)
            .post('/api/v1/products')
            .send({
            name: `InvalidQuantity-${uniqueSuffix}`,
            price: 50,
            quantity: -10,
        });
        expect(res.status).toBe(400);
    });
    it('should reject invalid/nonexistent category', async () => {
        const fakeId = '00000000-0000-0000-0000-000000000000';
        const res = await request(app)
            .post('/api/v1/products')
            .send({
            name: `BadCat-${uniqueSuffix}`,
            price: 50,
            quantity: 10,
            categoryId: fakeId,
        });
        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe('INVALID_CATEGORY');
    });
    it('should return 404 for product not found', async () => {
        const fakeId = '00000000-0000-0000-0000-000000000000';
        const res = await request(app).get(`/api/v1/products/${fakeId}`);
        expect(res.status).toBe(404);
        expect(res.body.error.code).toBe('PRODUCT_NOT_FOUND');
    });
    it('should update a product successfully', async () => {
        const res = await request(app)
            .patch(`/api/v1/products/${createdProductId}`)
            .send({ price: 1200 });
        expect(res.status).toBe(200);
        expect(res.body.data.price).toBe('1200'); // Prisma decimal might return string
    });
    it('should list products with pagination and category filtering', async () => {
        const res = await request(app).get(`/api/v1/products?categoryId=${categoryId}&page=1&limit=5`);
        expect(res.status).toBe(200);
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.meta.page).toBe(1);
        expect(res.body.meta.limit).toBe(5);
    });
    it('should support product search', async () => {
        const res = await request(app).get(`/api/v1/products?search=Laptop-${uniqueSuffix}`);
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeGreaterThan(0);
    });
    it('should reject product deletion when referenced by OrderItem', async () => {
        // Create customer, order, and orderItem
        const customer = await prisma.customer.create({
            data: { name: 'Test User', email: `test-${uniqueSuffix}@test.com` }
        });
        const order = await prisma.order.create({
            data: { customerId: customer.id, total: 100 }
        });
        const orderItem = await prisma.orderItem.create({
            data: { orderId: order.id, productId: createdProductId, quantity: 1, unitPrice: 100 }
        });
        // Attempt deletion
        const res = await request(app).delete(`/api/v1/products/${createdProductId}`);
        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe('PRODUCT_HAS_ORDERS');
        // Cleanup
        await prisma.orderItem.delete({ where: { id: orderItem.id } });
        await prisma.order.delete({ where: { id: order.id } });
        await prisma.customer.delete({ where: { id: customer.id } });
    });
    it('should delete product successfully', async () => {
        // Since orderItem is deleted, product can be deleted
        const res = await request(app).delete(`/api/v1/products/${createdProductId}`);
        expect(res.status).toBe(200);
    });
});
//# sourceMappingURL=product.test.js.map