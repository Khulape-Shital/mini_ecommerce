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
export declare const createProduct: (data: CreateProductInput) => Promise<{
    id: string;
    categoryId: string | null;
    name: string;
    description: string | null;
    price: import("@prisma/client-runtime-utils").Decimal;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const updateProduct: (id: string, data: UpdateProductInput) => Promise<{
    id: string;
    categoryId: string | null;
    name: string;
    description: string | null;
    price: import("@prisma/client-runtime-utils").Decimal;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const getProductById: (id: string) => Promise<{
    category: {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    } | null;
} & {
    id: string;
    categoryId: string | null;
    name: string;
    description: string | null;
    price: import("@prisma/client-runtime-utils").Decimal;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const deleteProduct: (id: string) => Promise<void>;
export declare const getProducts: (query: ListProductsQuery) => Promise<{
    items: ({
        category: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        categoryId: string | null;
        name: string;
        description: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        quantity: number;
        createdAt: Date;
        updatedAt: Date;
    })[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}>;
export {};
//# sourceMappingURL=product.service.d.ts.map