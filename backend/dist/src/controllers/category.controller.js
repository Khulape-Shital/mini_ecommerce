import * as categoryService from '../services/category.service.js';
export const createCategory = async (req, res, next) => {
    try {
        const category = await categoryService.createCategory(req.body.name);
        res.status(201).json({ success: true, data: category });
    }
    catch (error) {
        next(error);
    }
};
export const getCategories = async (req, res, next) => {
    try {
        const categories = await categoryService.getCategories();
        res.status(200).json({ success: true, data: categories });
    }
    catch (error) {
        next(error);
    }
};
export const getCategoryById = async (req, res, next) => {
    try {
        const category = await categoryService.getCategoryById(req.params.id);
        res.status(200).json({ success: true, data: category });
    }
    catch (error) {
        next(error);
    }
};
export const updateCategory = async (req, res, next) => {
    try {
        const category = await categoryService.updateCategory(req.params.id, req.body.name);
        res.status(200).json({ success: true, data: category });
    }
    catch (error) {
        next(error);
    }
};
export const deleteCategory = async (req, res, next) => {
    try {
        await categoryService.deleteCategory(req.params.id);
        res.status(200).json({ success: true, message: 'Category deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=category.controller.js.map