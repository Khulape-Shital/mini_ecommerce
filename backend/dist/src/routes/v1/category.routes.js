import { Router } from 'express';
import * as categoryController from '../../controllers/category.controller.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { createCategorySchema, updateCategorySchema, getCategorySchema } from '../../schemas/category.schema.js';
const router = Router();
router.post('/', validateRequest(createCategorySchema), categoryController.createCategory);
router.get('/', categoryController.getCategories);
router.get('/:id', validateRequest(getCategorySchema), categoryController.getCategoryById);
router.patch('/:id', validateRequest(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', validateRequest(getCategorySchema), categoryController.deleteCategory);
export default router;
//# sourceMappingURL=category.routes.js.map