import type { Request, Response, NextFunction } from 'express';
export declare const orderController: {
    createOrder(req: Request, res: Response, next: NextFunction): Promise<void>;
    getOrders(req: Request, res: Response, next: NextFunction): Promise<void>;
    getOrderById(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=order.controller.d.ts.map