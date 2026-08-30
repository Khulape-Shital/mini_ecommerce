export declare const createCategory: (name: string) => Promise<{
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const getCategories: () => Promise<{
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare const getCategoryById: (id: string) => Promise<{
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const updateCategory: (id: string, name: string) => Promise<{
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const deleteCategory: (id: string) => Promise<void>;
//# sourceMappingURL=category.service.d.ts.map