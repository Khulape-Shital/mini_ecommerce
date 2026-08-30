interface CreateCustomerInput {
    name: string;
    email: string;
    contact?: string;
}
interface UpdateCustomerInput {
    name?: string;
    email?: string;
    contact?: string;
}
interface ListCustomersQuery {
    page: number;
    limit: number;
}
export declare const createCustomer: (data: CreateCustomerInput) => Promise<{
    contact: string | null;
    createdAt: Date;
    email: string;
    id: string;
    name: string;
    updatedAt: Date;
}>;
export declare const updateCustomer: (id: string, data: UpdateCustomerInput) => Promise<{
    contact: string | null;
    createdAt: Date;
    email: string;
    id: string;
    name: string;
    updatedAt: Date;
}>;
export declare const getCustomerById: (id: string) => Promise<{
    contact: string | null;
    createdAt: Date;
    email: string;
    id: string;
    name: string;
    updatedAt: Date;
}>;
export declare const deleteCustomer: (id: string) => Promise<void>;
export declare const getCustomers: (query: ListCustomersQuery) => Promise<{
    items: {
        contact: string | null;
        createdAt: Date;
        email: string;
        id: string;
        name: string;
        updatedAt: Date;
    }[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}>;
export {};
//# sourceMappingURL=customer.service.d.ts.map