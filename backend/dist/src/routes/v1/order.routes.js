import { Router } from 'express';
import { orderController } from '../../controllers/order.controller.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { createOrderSchema, updateOrderStatusSchema, getOrdersSchema } from '../../schemas/order.schema.js';
const router = Router();
router.post('/', validateRequest(createOrderSchema), orderController.createOrder);
router.get('/', validateRequest(getOrdersSchema), orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/status', validateRequest(updateOrderStatusSchema), orderController.updateOrderStatus);
router.post('/:id/cancel', orderController.cancelOrder);
export default router;
//# sourceMappingURL=order.routes.js.map