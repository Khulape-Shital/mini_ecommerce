import type { Request, Response, NextFunction } from 'express';
import * as customerService from '../services/customer.service.js';

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // query is validated by zod and transformed
    const result = await customerService.getCustomers(req.query as any);
    res.status(200).json({ success: true, data: result.items, meta: result.meta });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id as string);
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await customerService.updateCustomer(req.params.id as string, req.body);
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await customerService.deleteCustomer(req.params.id as string);
    res.status(200).json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};
