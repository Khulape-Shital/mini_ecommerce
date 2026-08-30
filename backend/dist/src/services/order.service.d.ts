import { OrderStatus, PaymentStatus, ShippingStatus } from '../db/prisma.js';
interface CreateOrderPayload {
    customerId: string;
    items: {
        productId: string;
        quantity: number;
    }[];
    shippingAddress: string;
    couponCode?: string;
}
export declare const orderService: {
    createOrder(payload: CreateOrderPayload): Promise<{
        items: {
            id: string;
            orderId: string;
            productId: string;
            quantity: number;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
        }[];
        payment: {
            id: string;
            orderId: string;
            status: PaymentStatus;
            amount: import("@prisma/client-runtime-utils").Decimal;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        shipping: {
            id: string;
            orderId: string;
            address: string;
            status: ShippingStatus;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        customerId: string;
        couponId: string | null;
        status: OrderStatus;
        total: import("@prisma/client-runtime-utils").Decimal;
        discountAmount: import("@prisma/client-runtime-utils").Decimal | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getOrders(options: {
        page?: number;
        limit?: number;
        customerId?: string;
        status?: OrderStatus;
    }): Promise<{
        data: {
            id: string;
            customerId: string;
            couponId: string | null;
            status: OrderStatus;
            total: import("@prisma/client-runtime-utils").Decimal;
            discountAmount: import("@prisma/client-runtime-utils").Decimal | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getOrderById(id: string): Promise<{
        items: {
            id: string;
            orderId: string;
            productId: string;
            quantity: number;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
        }[];
        payment: {
            id: string;
            orderId: string;
            status: PaymentStatus;
            amount: import("@prisma/client-runtime-utils").Decimal;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        shipping: {
            id: string;
            orderId: string;
            address: string;
            status: ShippingStatus;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        customerId: string;
        couponId: string | null;
        status: OrderStatus;
        total: import("@prisma/client-runtime-utils").Decimal;
        discountAmount: import("@prisma/client-runtime-utils").Decimal | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateOrderStatus(id: string, newStatus: OrderStatus): Promise<{
        items: {
            id: string;
            orderId: string;
            productId: string;
            quantity: number;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
        }[];
        payment: {
            id: string;
            orderId: string;
            status: PaymentStatus;
            amount: import("@prisma/client-runtime-utils").Decimal;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        shipping: {
            id: string;
            orderId: string;
            address: string;
            status: ShippingStatus;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        customerId: string;
        couponId: string | null;
        status: OrderStatus;
        total: import("@prisma/client-runtime-utils").Decimal;
        discountAmount: import("@prisma/client-runtime-utils").Decimal | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    cancelOrder(id: string): Promise<{
        items: {
            id: string;
            orderId: string;
            productId: string;
            quantity: number;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
        }[];
        payment: {
            id: string;
            orderId: string;
            status: PaymentStatus;
            amount: import("@prisma/client-runtime-utils").Decimal;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        shipping: {
            id: string;
            orderId: string;
            address: string;
            status: ShippingStatus;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        customerId: string;
        couponId: string | null;
        status: OrderStatus;
        total: import("@prisma/client-runtime-utils").Decimal;
        discountAmount: import("@prisma/client-runtime-utils").Decimal | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
};
export {};
//# sourceMappingURL=order.service.d.ts.map