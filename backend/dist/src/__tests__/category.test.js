import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { prisma } from '../db/prisma.js';
describe('Category API', () => {
    let createdCategoryId;
    const uniqueSuffix = Date.now().toString();
    const validCategoryName = `Electronics-${uniqueSuffix}`;
    afterAll(async () => {
        // Clean up
        if (createdCategoryId) {
            try {
                await prisma.category.delete({ where: { id: createdCategoryId } });
            }
            catch (e) {
                // Ignore errors if already deleted
            }
        }
    });
    it('should create a valid category', async () => {
        const res = await request(app)
            .post('/api/v1/categories')
            .send({ name: validCategoryName });
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe(validCategoryName);
        createdCategoryId = res.body.data.id;
    });
    it('should reject a duplicate category', async () => {
        const res = await request(app)
            .post('/api/v1/categories')
            .send({ name: validCategoryName });
        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
        expect(res.body.error.code).toBe('CATEGORY_ALREADY_EXISTS');
    });
    it('should return 404 for category not found', async () => {
        const fakeId = '00000000-0000-0000-0000-000000000000';
        const res = await request(app).get(`/api/v1/categories/${fakeId}`);
        expect(res.status).toBe(404);
        expect(res.body.error.code).toBe('CATEGORY_NOT_FOUND');
    });
    it('should reject category deletion with assigned products', async () => {
        // Create a temporary product assigned to this category
        const product = await prisma.product.create({
            data: {
                name: `Temp Product ${uniqueSuffix}`,
                price: 100,
                quantity: 10,
                categoryId: createdCategoryId,
            }
        });
        // Attempt deletion
        const res = await request(app).delete(`/api/v1/categories/${createdCategoryId}`);
        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe('CATEGORY_HAS_PRODUCTS');
        // Cleanup product so category can be deleted later
        await prisma.product.delete({ where: { id: product.id } });
    });
    it('should delete category successfully', async () => {
        const tempCat = await prisma.category.create({
            data: { name: `To Delete ${uniqueSuffix}` }
        });
        const res = await request(app).delete(`/api/v1/categories/${tempCat.id}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
//# sourceMappingURL=category.test.js.map