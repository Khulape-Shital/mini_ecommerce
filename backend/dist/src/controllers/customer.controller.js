import * as customerService from '../services/customer.service.js';
import { listCustomersQuerySchema } from '../schemas/customer.schema.js';
export const createCustomer = async (req, res, next) => {
    try {
        const customer = await customerService.createCustomer(req.body);
        res.status(201).json({ success: true, data: customer });
    }
    catch (error) {
        next(error);
    }
};
export const getCustomers = async (req, res, next) => {
    try {
        // query is validated by zod and transformed
        const query = req.query;
        const result = await customerService.getCustomers(query);
        res.status(200).json({ success: true, data: result.items, meta: result.meta });
    }
    catch (error) {
        next(error);
    }
};
export const getCustomerById = async (req, res, next) => {
    try {
        const customer = await customerService.getCustomerById(req.params.id);
        res.status(200).json({ success: true, data: customer });
    }
    catch (error) {
        next(error);
    }
};
export const updateCustomer = async (req, res, next) => {
    try {
        const customer = await customerService.updateCustomer(req.params.id, req.body);
        res.status(200).json({ success: true, data: customer });
    }
    catch (error) {
        next(error);
    }
};
export const deleteCustomer = async (req, res, next) => {
    try {
        await customerService.deleteCustomer(req.params.id);
        res.status(200).json({ success: true, data: null });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=customer.controller.js.map