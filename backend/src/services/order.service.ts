import { prisma } from '../db/prisma.js';
import { AppError } from '../utils/AppError.js';
import { OrderStatus, PaymentStatus, ShippingStatus, Prisma } from '../db/prisma.js';

interface CreateOrderPayload {
  name: string;
  email: string;
  contact?: string;
  items: { productId: string; quantity: number }[];
  shippingAddress: string;
  couponCode?: string;
}

export const orderService = {
  /**
   * Creates a new order after validating products, inventory, and optional coupons.
   * Deducts product inventory, creates the customer if needed, and sets up payment
   * and shipping records within a single database transaction.
   * 
   * @param payload - The order details including items, customer information, and shipping address.
   * @returns The newly created order including items, payment, and shipping details.
   */
  async createOrder(payload: CreateOrderPayload) {
    const { name, email, contact, items, shippingAddress, couponCode } = payload;

    // We'll create/find the customer inside the transaction to avoid orphaned records
    // or handle it safely. For simplicity and robustness, we can just upsert the customer here.
    // However, Prisma doesn't allow upserting a related record directly in a single `create` without `connectOrCreate`, 
    // but `connectOrCreate` needs a unique field. `email` is unique, so we can use `connectOrCreate` on the order's `customer` relation!
    
    // Actually, to make it completely safe and simple, let's just use `connectOrCreate` when creating the Order.

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
    const orderItemsData: { productId: string; quantity: number; unitPrice: Prisma.Decimal }[] = [];

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
    let couponId: string | undefined = undefined;

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

        const orderData: any = {
          customer: {
            connectOrCreate: {
              where: { email },
              create: {
                name,
                email,
                contact: contact || null
              }
            }
          },
          status: OrderStatus.PENDING,
          total,
          discountAmount,
          items: {
            create: orderItemsData
          },
          payment: {
            create: {
              status: PaymentStatus.PENDING,
              amount: total
            }
          },
          shipping: {
            create: {
              status: ShippingStatus.PREPARING,
              address: shippingAddress
            }
          }
        };

        if (couponId) {
          orderData.coupon = { connect: { id: couponId } };
        }

        // b. Create Order & related records
        const newOrder = await tx.order.create({
          data: orderData,
          include: {
            items: true,
            payment: true,
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

  /**
   * Retrieves a paginated list of orders, optionally filtered by customer ID and order status.
   * 
   * @param options - Pagination parameters (page, limit) and optional filters (customerId, status).
   * @returns An object containing the list of orders and pagination metadata.
   */
  async getOrders(options: { page?: number; limit?: number; customerId?: string; status?: OrderStatus }) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};
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

  /**
   * Fetches a single order by its ID, including its associated items, payment, and shipping records.
   * 
   * @param id - The unique identifier of the order.
   * @returns The order with its related records.
   * @throws {AppError} If the order is not found.
   */
  async getOrderById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payment: true,
        shipping: true,
      },
    });

    if (!order) {
      throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found');
    }

    return order;
  },

  /**
   * Updates the status of an existing order.
   * Enforces valid status transition rules (e.g., PENDING to CONFIRMED, CONFIRMED to SHIPPED).
   * 
   * @param id - The unique identifier of the order to update.
   * @param newStatus - The new status to apply to the order.
   * @returns The updated order with its related records.
   * @throws {AppError} If the order is not found or the status transition is invalid.
   */
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
      include: { items: true, payment: true, shipping: true }
    });
  },

  /**
   * Cancels a PENDING or CONFIRMED order and restores the inventory of its items.
   * Uses an atomic transaction to ensure the order hasn't changed status concurrently.
   * 
   * @param id - The unique identifier of the order to cancel.
   * @returns The cancelled order with its related records.
   * @throws {AppError} If the order is not found, cannot be cancelled, or changes status concurrently.
   */
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
        // Atomically update order status ONLY if it is still PENDING or CONFIRMED
        const updateResult = await tx.order.updateMany({
          where: {
            id,
            status: { in: [OrderStatus.PENDING, OrderStatus.CONFIRMED] }
          },
          data: { status: OrderStatus.CANCELLED }
        });

        if (updateResult.count === 0) {
          const currentOrder = await tx.order.findUnique({ where: { id } });
          if (currentOrder?.status === OrderStatus.CANCELLED) {
            throw new AppError(400, 'ALREADY_CANCELLED', 'Order is already cancelled');
          }
          throw new AppError(400, 'ORDER_UNCANCELLABLE', 'Order status changed before cancellation could complete');
        }

        const updatedOrder = await tx.order.findUnique({
          where: { id },
          include: { items: true, payment: true, shipping: true }
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
