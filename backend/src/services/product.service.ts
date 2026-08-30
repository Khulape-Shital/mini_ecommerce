
import { prisma, Prisma } from '../db/prisma.js';
import { AppError } from '../utils/AppError.js';

interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  categoryId?: string | null;
}

interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  categoryId?: string | null;
}

interface ListProductsQuery {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
  sortBy: 'price' | 'createdAt' | 'name';
  sortOrder: 'asc' | 'desc';
}

export const createProduct = async (data: CreateProductInput) => {
  if (data.price < 0) {
    throw new AppError(400, 'INVALID_PRICE', 'Price must be greater than or equal to 0');
  }
  if (data.quantity < 0 || !Number.isInteger(data.quantity)) {
    throw new AppError(400, 'INVALID_QUANTITY', 'Quantity must be a positive integer');
  }

  if (data.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) {
      throw new AppError(400, 'INVALID_CATEGORY', 'The specified category does not exist');
    }
  }

  const payload: Prisma.ProductUncheckedCreateInput = {
    name: data.name,
    description: data.description !== undefined ? data.description : null,
    price: data.price,
    quantity: data.quantity,
  };
  if (data.categoryId !== undefined) {
    payload.categoryId = data.categoryId;
  }

  return await prisma.product.create({
    data: payload,
  });
};

export const updateProduct = async (id: string, data: UpdateProductInput) => {
  if (data.price !== undefined && data.price < 0) {
    throw new AppError(400, 'INVALID_PRICE', 'Price must be greater than or equal to 0');
  }
  if (data.quantity !== undefined && (data.quantity < 0 || !Number.isInteger(data.quantity))) {
    throw new AppError(400, 'INVALID_QUANTITY', 'Quantity must be a positive integer');
  }

  if (data.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) {
      throw new AppError(400, 'INVALID_CATEGORY', 'The specified category does not exist');
    }
  }

  const payload: Prisma.ProductUncheckedUpdateInput = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.description !== undefined) payload.description = data.description;
  if (data.price !== undefined) payload.price = data.price;
  if (data.quantity !== undefined) payload.quantity = data.quantity;
  if (data.categoryId !== undefined) payload.categoryId = data.categoryId;

  try {
    return await prisma.product.update({
      where: { id },
      data: payload,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
      }
    }
    throw error;
  }
};

export const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) {
    throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
  }

  return product;
};

export const deleteProduct = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      _count: {
        select: { orderItems: true }
      }
    }
  });

  if (!product) {
    throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
  }

  if (product._count.orderItems > 0) {
    throw new AppError(400, 'PRODUCT_HAS_ORDERS', 'Cannot delete a product that has been ordered');
  }

  try {
    await prisma.product.delete({
      where: { id },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
      }
    }
    throw error;
  }
};

export const getProducts = async (query: ListProductsQuery) => {
  const { page, limit, search, categoryId, sortBy, sortOrder } = query;
  
  const pageNum = Number(query.page) || 1;
  const limitNum = Number(query.limit) || 10;
  const skip = (pageNum - 1) * limitNum;
  const take = limitNum;

  const where: Prisma.ProductWhereInput = {};
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (search) {
    where.name = {
      contains: search,
      mode: 'insensitive',
    };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: {
        [sortBy || 'createdAt']: sortOrder || 'desc',
      },
      include: { category: true },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: products,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};
