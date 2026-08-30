import { Router } from 'express';
import * as productController from '../../controllers/product.controller.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { createProductSchema, updateProductSchema, getProductSchema, listProductsSchema } from '../../schemas/product.schema.js';
const router = Router();
router.post('/', validateRequest(createProductSchema), productController.createProduct);
router.get('/', validateRequest(listProductsSchema), productController.getProducts);
router.get('/:id', validateRequest(getProductSchema), productController.getProductById);
router.patch('/:id', validateRequest(updateProductSchema), productController.updateProduct);
router.delete('/:id', validateRequest(getProductSchema), productController.deleteProduct);
export default router;
//# sourceMappingURL=product.routes.js.map