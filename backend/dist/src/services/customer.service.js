import { prisma, Prisma } from '../db/prisma.js';
import { AppError } from '../utils/AppError.js';
// Reusable select to avoid exposing passwordHash
const customerSelect = {
    id: true,
    name: true,
    email: true,
    contact: true,
    createdAt: true,
    updatedAt: true,
};
export const createCustomer = async (data) => {
    const payload = {
        name: data.name,
        email: data.email,
    };
    if (data.contact !== undefined) {
        payload.contact = data.contact;
    }
    try {
        return await prisma.customer.create({
            data: payload,
            select: customerSelect,
        });
    }
    catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                throw new AppError(409, 'CUSTOMER_ALREADY_EXISTS', 'A customer with this email already exists');
            }
        }
        throw error;
    }
};
export const updateCustomer = async (id, data) => {
    const payload = {};
    if (data.name !== undefined)
        payload.name = data.name;
    if (data.email !== undefined)
        payload.email = data.email;
    if (data.contact !== undefined)
        payload.contact = data.contact;
    try {
        return await prisma.customer.update({
            where: { id },
            data: payload,
            select: customerSelect,
        });
    }
    catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found');
            }
            if (error.code === 'P2002') {
                throw new AppError(409, 'CUSTOMER_ALREADY_EXISTS', 'A customer with this email already exists');
            }
        }
        throw error;
    }
};
export const getCustomerById = async (id) => {
    const customer = await prisma.customer.findUnique({
        where: { id },
        select: customerSelect,
    });
    if (!customer) {
        throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found');
    }
    return customer;
};
export const deleteCustomer = async (id) => {
    const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
            _count: {
                select: { orders: true, reviews: true }
            }
        }
    });
    if (!customer) {
        throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found');
    }
    if (customer._count.orders > 0 || customer._count.reviews > 0) {
        throw new AppError(400, 'CUSTOMER_HAS_DEPENDENCIES', 'Cannot delete a customer with existing orders or reviews');
    }
    try {
        await prisma.customer.delete({
            where: { id },
        });
    }
    catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found');
            }
        }
        throw error;
    }
};
export const getCustomers = async (query) => {
    const pageNum = Number(query.page) || 1;
    const limitNum = Number(query.limit) || 10;
    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;
    const [customers, total] = await Promise.all([
        prisma.customer.findMany({
            skip,
            take,
            orderBy: { createdAt: 'desc' },
            select: customerSelect,
        }),
        prisma.customer.count(),
    ]);
    return {
        items: customers,
        meta: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        },
    };
};
//# sourceMappingURL=customer.service.js.map