import { orderService } from '../services/order.service.js';
import { OrderStatus } from '../db/prisma.js';
export const orderController = {
    async createOrder(req, res, next) {
        try {
            // TEMPORARY: customerId is expected in req.body until JWT authentication is implemented.
            // Do NOT create fake authentication middleware.
            const order = await orderService.createOrder(req.body);
            res.status(201).json({
                success: true,
                data: order
            });
        }
        catch (error) {
            next(error);
        }
    },
    async getOrders(req, res, next) {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
            // TEMPORARY: customerId is accepted as a query filter until JWT authentication is implemented.
            const customerId = req.query.customerId;
            const status = req.query.status;
            const options = { page, limit };
            if (customerId)
                options.customerId = customerId;
            if (status)
                options.status = status;
            const result = await orderService.getOrders(options);
            res.status(200).json({
                success: true,
                ...result
            });
        }
        catch (error) {
            next(error);
        }
    },
    async getOrderById(req, res, next) {
        try {
            const order = await orderService.getOrderById(req.params.id);
            res.status(200).json({
                success: true,
                data: order
            });
        }
        catch (error) {
            next(error);
        }
    },
    async updateOrderStatus(req, res, next) {
        try {
            const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
            res.status(200).json({
                success: true,
                data: order
            });
        }
        catch (error) {
            next(error);
        }
    },
    async cancelOrder(req, res, next) {
        try {
            const order = await orderService.cancelOrder(req.params.id);
            res.status(200).json({
                success: true,
                data: order
            });
        }
        catch (error) {
            next(error);
        }
    }
};
//# sourceMappingURL=order.controller.js.map