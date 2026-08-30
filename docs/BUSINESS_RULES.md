# Business Rules

## 1. Order and Inventory Transaction Flow (Assignment Requirement)
**Creation:**
1. Client submits a list of `{ productId, quantity }` and an optional `couponCode`.
2. Server queries current products to verify existence and check if `requested_quantity <= available_quantity`.
3. If insufficient inventory, abort transaction and return `INSUFFICIENT_INVENTORY` error.
4. If `couponCode` is provided, server validates the coupon (exists and `isActive == true`).
5. Server calculates the subtotal amount by summing `requested_quantity * product.price`.
6. Server calculates `discountAmount` based on the coupon's `discountPercent`, and sets `total = subtotal - discountAmount`.
7. Server creates the `Order`, creates `OrderItem` records (capturing current `unitPrice`), and decrements `Product.quantity`.
8. This entire process must execute inside a single Prisma transaction (`$transaction`) to ensure atomicity.

## 2. Order Cancellation Flow (Assignment Requirement)
1. Client requests cancellation for a specific `orderId`.
2. Server verifies the order is in a cancellable state (Only `PENDING` or `CONFIRMED` can be cancelled).
3. If valid, server changes order status to `CANCELLED`.
4. Server iterates over `OrderItems` and increments the corresponding `Product.quantity` by the item's quantity.
5. This must be wrapped in a Prisma transaction.

## 3. Order Status Lifecycle (Assignment Requirement & Engineering Decision)
Allowed transitions strictly enforced by the backend:
- **PENDING -> CONFIRMED:** When order is reviewed or payment is successful.
- **CONFIRMED -> SHIPPED:** When the shipping model status changes to SHIPPED.
- **SHIPPED -> DELIVERED:** When the shipping model status changes to DELIVERED.
- **PENDING or CONFIRMED -> CANCELLED:** When an order is aborted, triggering inventory restoration.
*(Note: A SHIPPED or DELIVERED order cannot be CANCELLED.)*

## 4. Minimum Practical Features (Approved Features)
- **Coupons:** Simple percentage-based discount applied at checkout. Total is always calculated on the server.
- **Payments:** Dummy integration. Client calls the payment endpoint to simulate success, which transitions Order to `CONFIRMED` and Payment to `COMPLETED`.
- **Shipping:** Managed internally. Updating the shipping status automatically triggers the corresponding Order status update.
- **Reviews:** Customers can only review a product if they have an Order containing that product with a `DELIVERED` status.
