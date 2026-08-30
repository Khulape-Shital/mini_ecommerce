import { prisma, Prisma } from '../db/prisma.js';
import { AppError } from '../utils/AppError.js';
export const createCategory = async (name) => {
    try {
        return await prisma.category.create({
            data: { name },
        });
    }
    catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                throw new AppError(409, 'CATEGORY_ALREADY_EXISTS', 'A category with this name already exists');
            }
        }
        throw error;
    }
};
export const getCategories = async () => {
    return await prisma.category.findMany({
        orderBy: { createdAt: 'desc' },
    });
};
export const getCategoryById = async (id) => {
    const category = await prisma.category.findUnique({
        where: { id },
    });
    if (!category) {
        throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Category not found');
    }
    return category;
};
export const updateCategory = async (id, name) => {
    try {
        return await prisma.category.update({
            where: { id },
            data: { name },
        });
    }
    catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Category not found');
            }
            if (error.code === 'P2002') {
                throw new AppError(409, 'CATEGORY_ALREADY_EXISTS', 'A category with this name already exists');
            }
        }
        throw error;
    }
};
export const deleteCategory = async (id) => {
    // Check if category exists
    const category = await prisma.category.findUnique({
        where: { id },
        include: {
            _count: {
                select: { products: true }
            }
        }
    });
    if (!category) {
        throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Category not found');
    }
    // Check if products are assigned
    if (category._count.products > 0) {
        throw new AppError(400, 'CATEGORY_HAS_PRODUCTS', 'Cannot delete a category that has assigned products');
    }
    try {
        await prisma.category.delete({
            where: { id },
        });
    }
    catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Category not found');
            }
        }
        throw error;
    }
};
//# sourceMappingURL=category.service.js.map