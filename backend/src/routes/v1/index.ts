import { Router } from 'express';
import { prisma } from '../../db/prisma.js';
import { AppError } from '../../utils/AppError.js';

const router = Router();

import categoryRoutes from './category.routes.js';
import productRoutes from './product.routes.js';
import customerRoutes from './customer.routes.js';

router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/customers', customerRoutes);
router.get('/health', async (req, res, next) => {
  try {
    // Database health check
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      success: true,
      message: 'API is healthy',
      database: 'connected'
    });
  } catch (error) {
    next(new AppError(503, 'DATABASE_CONNECTION_ERROR', 'Failed to connect to the database', error));
  }
});

export default router;
