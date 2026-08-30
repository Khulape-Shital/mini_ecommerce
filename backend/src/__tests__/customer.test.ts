import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { prisma } from '../db/prisma.js';

describe('Customer API', () => {
  let testCustomer: any;

  beforeAll(async () => {
    await prisma.review.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.shipping.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.customer.deleteMany({});
  });

  afterAll(async () => {
    await prisma.order.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.$disconnect();
  });

  it('should create a valid customer', async () => {
    const res = await request(app).post('/api/v1/customers').send({
      name: 'John Doe',
      email: 'john@example.com',
      contact: '1234567890',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('John Doe');
    expect(res.body.data.email).toBe('john@example.com');
    expect(res.body.data.passwordHash).toBeUndefined(); // NEVER EXPOSE

    testCustomer = res.body.data;
  });

  it('should reject invalid name', async () => {
    const res = await request(app).post('/api/v1/customers').send({
      name: 'J', // less than 2
      email: 'john2@example.com',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should reject invalid email', async () => {
    const res = await request(app).post('/api/v1/customers').send({
      name: 'John Smith',
      email: 'invalid-email',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject duplicate email', async () => {
    const res = await request(app).post('/api/v1/customers').send({
      name: 'John Clone',
      email: 'john@example.com', // already exists
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CUSTOMER_ALREADY_EXISTS');
  });

  it('should get customer by id', async () => {
    const res = await request(app).get(`/api/v1/customers/${testCustomer.id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(testCustomer.id);
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  it('should return 404 for customer not found', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await request(app).get(`/api/v1/customers/${fakeId}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CUSTOMER_NOT_FOUND');
  });

  it('should update customer', async () => {
    const res = await request(app).patch(`/api/v1/customers/${testCustomer.id}`).send({
      name: 'John Updated',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('John Updated');
    expect(res.body.data.email).toBe('john@example.com');
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  it('should list customers with pagination', async () => {
    // create another
    await request(app).post('/api/v1/customers').send({
      name: 'Jane Doe',
      email: 'jane@example.com',
    });

    const res = await request(app).get('/api/v1/customers?page=1&limit=1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.limit).toBe(1);
    expect(res.body.meta.total).toBeGreaterThanOrEqual(2);
    expect(res.body.data[0].passwordHash).toBeUndefined();
  });

  it('should reject customer deletion if they have orders', async () => {
    // This is tricky because order creation requires coupons, products, etc.
    // For now we will manually inject an order into the DB for testCustomer
    await prisma.order.create({
      data: {
        id: '99999999-9999-9999-9999-999999999999',
        customerId: testCustomer.id,
        total: 100,
      }
    });

    const res = await request(app).delete(`/api/v1/customers/${testCustomer.id}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CUSTOMER_HAS_DEPENDENCIES');

    // Clean up so it can be deleted later
    await prisma.order.deleteMany({ where: { customerId: testCustomer.id } });
  });

  it('should delete customer successfully', async () => {
    const res = await request(app).delete(`/api/v1/customers/${testCustomer.id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const check = await request(app).get(`/api/v1/customers/${testCustomer.id}`);
    expect(check.status).toBe(404);
  });
});
