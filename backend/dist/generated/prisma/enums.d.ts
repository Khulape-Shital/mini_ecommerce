export declare const OrderStatus: {
    readonly PENDING: 'PENDING';
    readonly CONFIRMED: 'CONFIRMED';
    readonly SHIPPED: 'SHIPPED';
    readonly DELIVERED: 'DELIVERED';
    readonly CANCELLED: 'CANCELLED';
};
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
export declare const PaymentStatus: {
    readonly PENDING: 'PENDING';
    readonly COMPLETED: 'COMPLETED';
    readonly FAILED: 'FAILED';
};
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];
export declare const ShippingStatus: {
    readonly PREPARING: 'PREPARING';
    readonly SHIPPED: 'SHIPPED';
    readonly DELIVERED: 'DELIVERED';
};
export type ShippingStatus = (typeof ShippingStatus)[keyof typeof ShippingStatus];
//# sourceMappingURL=enums.d.ts.map