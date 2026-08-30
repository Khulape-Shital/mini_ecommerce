import { prisma } from '../db/prisma.js';
import { AppError } from '../utils/AppError.js';
import { OrderStatus, PaymentStatus, ShippingStatus, Prisma } from '../db/prisma.js';

interface CreateOrderPayload {
  customerId: string;
  items: { productId: string; quantity: number }[];
  shippingAddress: string;
  couponCode?: string;
}

export const orderService = {
  async createOrder(payload: CreateOrderPayload) {
    const { customerId, items, shippingAddress, couponCode } = payload;

    // 1. Customer validation
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found');
    }

    const aggregatedItems: Record<string, number> = {};
    for (const item of items) {
      if (aggregatedItems[item.productId]) {
        throw new AppError(400, 'DUPLICATE_PRODUCT', `Duplicate product ID ${item.productId} in order items`);
      }
      aggregatedItems[item.productId] = item.quantity;
    }

    const uniqueProductIds = Object.keys(aggregatedItems);

    // 3. Verify products exist and have sufficient inventory
    const products = await prisma.product.findMany({
      where: { id: { in: uniqueProductIds } }
    });

    if (products.length !== uniqueProductIds.length) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', 'One or more products not found');
    }

    const productsMap = new Map(products.map(p => [p.id, p]));

    let subtotal = new Prisma.Decimal(0);
    const orderItemsData: any[] = [];

    for (const productId of uniqueProductIds) {
      const requestedQuantity = aggregatedItems[productId]!;
      const product = productsMap.get(productId)!;

      if (product.quantity < requestedQuantity) {
        throw new AppError(400, 'INSUFFICIENT_INVENTORY', `Insufficient inventory for product ${product.name}`);
      }

      const itemTotal = product.price.mul(requestedQuantity);
      subtotal = subtotal.add(itemTotal);

      orderItemsData.push({
        productId,
        quantity: requestedQuantity,
        unitPrice: product.price
      });
    }

    // 4. Coupon validation and discount calculation
    let discountAmount = new Prisma.Decimal(0);
    let couponId: string | null = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (!coupon || !coupon.isActive) {
        throw new AppError(400, 'INVALID_COUPON', 'Invalid or inactive coupon');
      }
      couponId = coupon.id;
      discountAmount = subtotal.mul(coupon.discountPercent).div(100);
    }

    const total = subtotal.sub(discountAmount);

    // 5. Prisma Transaction
    try {
      const order = await prisma.$transaction(async (tx) => {
        // a. Concurrency-safe inventory deduction
        for (const item of orderItemsData) {
          const update = await tx.product.updateMany({
            where: {
              id: item.productId,
              quantity: { gte: item.quantity }
            },
            data: {
              quantity: { decrement: item.quantity }
            }
          });

          if (update.count === 0) {
            throw new AppError(409, 'CONCURRENT_INVENTORY_DEPLETION', 'Inventory changed during checkout. Please try again.');
          }
        }

        // b. Create Order & related records
        const newOrder = await tx.order.create({
          data: {
            customerId,
            couponId,
            status: OrderStatus.PENDING,
            total,
            discountAmount,
            items: {
              create: orderItemsData
            },
            shipping: {
              create: {
                status: ShippingStatus.PREPARING,
                address: shippingAddress
              }
            }
          },
          include: {
            items: true,
            shipping: true
          }
        });

        return newOrder;
      });

      return order;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, 'TRANSACTION_FAILED', 'Failed to complete order transaction', error);
    }
  },

  async getOrders(options: { page?: number; limit?: number; customerId?: string; status?: OrderStatus }) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options.customerId) where.customerId = options.customerId;
    if (options.status) where.status = options.status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getOrderById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        shipping: true,
      },
    });

    if (!order) {
      throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found');
    }

    return order;
  },

  async updateOrderStatus(id: string, newStatus: OrderStatus) {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found');
    }

    // Status transition rules
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      CONFIRMED: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      SHIPPED: [OrderStatus.DELIVERED],
      DELIVERED: [],
      CANCELLED: []
    };

    if (!validTransitions[order.status].includes(newStatus)) {
      throw new AppError(400, 'INVALID_STATUS_TRANSITION', `Cannot transition order from ${order.status} to ${newStatus}`);
    }

    return await prisma.order.update({
      where: { id },
      data: { status: newStatus },
      include: { items: true, shipping: true }
    });
  },

  async cancelOrder(id: string) {
    // 1. Fetch order
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!order) {
      throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found');
    }

    // 2. Validate state
    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {
      throw new AppError(400, 'ORDER_UNCANCELLABLE', 'Only PENDING or CONFIRMED orders can be cancelled');
    }

    // 3. Transaction
    try {
      const cancelledOrder = await prisma.$transaction(async (tx) => {
        // Double check status in transaction to prevent race conditions during cancellation
        const currentOrder = await tx.order.findUnique({ where: { id } });
        if (currentOrder!.status === OrderStatus.CANCELLED) {
             throw new AppError(400, 'ALREADY_CANCELLED', 'Order is already cancelled');
        }

        // a. Update order status
        const updatedOrder = await tx.order.update({
          where: { id },
          data: { status: OrderStatus.CANCELLED },
          include: { items: true, shipping: true }
        });

        // b. Restore inventory
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { quantity: { increment: item.quantity } }
          });
        }

        return updatedOrder;
      });

      return cancelledOrder;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'CANCELLATION_FAILED', 'Failed to cancel order', error);
    }
  }
};
