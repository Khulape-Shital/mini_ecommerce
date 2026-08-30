import { Router } from 'express';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { createCustomerSchema, updateCustomerSchema, listCustomersQuerySchema, } from '../../schemas/customer.schema.js';
import * as customerController from '../../controllers/customer.controller.js';
const router = Router();
router.post('/', validateRequest(createCustomerSchema), customerController.createCustomer);
router.get('/', validateRequest(listCustomersQuerySchema), customerController.getCustomers);
router.get('/:id', customerController.getCustomerById);
router.patch('/:id', validateRequest(updateCustomerSchema), customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);
export default router;
//# sourceMappingURL=customer.routes.js.map