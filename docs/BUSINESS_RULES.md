# Business Rules

## 1. Order and Inventory Transaction Flow
**Creation:**
1. Client submits a list of `{ productId, quantity }`.
2. Server queries current products to verify existence and check if `requested_quantity <= available_quantity`.
3. If insufficient inventory, abort transaction and return `INSUFFICIENT_INVENTORY` error.
4. Server calculates the `total` amount by summing `requested_quantity * product.price`.
5. Server creates the `Order`, creates `OrderItem` records (capturing current `unitPrice`), and decrements `Product.quantity`.
6. This entire process must execute inside a single Prisma database transaction to ensure atomicity.

## 2. Order Cancellation Flow
1. Client requests cancellation for a specific `orderId`.
2. Server verifies the order is in a cancellable state (e.g., `PENDING` or `CONFIRMED`, but not `SHIPPED` or `DELIVERED`).
3. If valid, server changes status to `CANCELLED`.
4. Server iterates over `OrderItems` and increments the corresponding `Product.quantity` by the item's quantity.
5. This must also be wrapped in a database transaction.

## 3. Order Status Lifecycle
- **PENDING:** Initial state upon creation.
- **CONFIRMED:** Order is verified and payment is secured (if payment is implemented).
- **SHIPPED:** Order has been handed to shipping.
- **DELIVERED:** Order received by customer.
- **CANCELLED:** Order aborted, inventory restored.

## 4. Additional Approved Features
- **Discounts:** If a coupon is applied, server verifies its existence, active status, and expiration, then calculates the reduced total server-side.
- **Payments:** External payment status is managed strictly on the backend. Client cannot dictate payment success.
- **Reviews:** Customers can only review products they have successfully purchased (`DELIVERED` status).
