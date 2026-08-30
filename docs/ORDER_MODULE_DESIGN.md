# Order Module Design

This document details the implementation design for the Order Module, ensuring data consistency, preventing overselling, and managing the order lifecycle.

## 1. Transaction Flow (Create Order)

1. **Request Reception:** The API receives a request to `POST /api/v1/orders`. Payload contains `items` (array of `productId` and `quantity`), an optional `couponCode`, and `shippingAddress`.
2. **Customer Validation:** Extract `customerId`. (Note: JWT authentication is not implemented yet. Temporarily, accept `customerId` in the request body for `POST /orders` and as a query parameter for `GET /orders`. This will be explicitly replaced by `req.user.id` when authentication is implemented).
3. **Payload Validation (Duplicate Products):** Reject any duplicate `productId`s sent in the request payload with a validation error to prevent conflicting database updates. Do NOT merge or aggregate duplicate items.
4. **Coupon Validation (Optional):** If a `couponCode` is provided, query the `Coupon` table. Abort if not found or if `isActive` is false.
5. **Product & Price Reading:** Query the `Product` table for all requested `productId`s. If any product is missing, abort the transaction. Read the current price from this query to use as the `unitPrice` snapshot.
6. **Pre-calculation Inventory Check:** Verify `requested_quantity <= product.quantity` for each item. If insufficient, return an `INSUFFICIENT_INVENTORY` error.
7. **Calculations:**
   - **Subtotal:** Sum of `(requested_quantity * product.price)` for all items.
   - **Discount Amount:** If a valid coupon exists, `discountAmount = subtotal * (coupon.discountPercent / 100)`. Otherwise, `0`.
   - **Final Total:** `subtotal - discountAmount`.
8. **Atomic Database Transaction (`$transaction`):**
   - **Deduct Inventory (Concurrency Safe):** Use `updateMany` with a `WHERE` condition checking that `quantity >= requested_quantity`. If `count === 0`, it means another transaction depleted the inventory concurrently. The transaction must abort and roll back.
   - **Create Order:** Create the `Order` record (`status: PENDING`, `total`, `discountAmount`, `customerId`, `couponId`).
   - **Create OrderItems:** Insert `OrderItem` records linking `orderId` and `productId`, storing the `quantity` and the snapshotted `unitPrice`.
   - **Create Payment:** Create a `Payment` record linked to the order (`status: PENDING`, `amount: total`).
   - **Create Shipping:** Create a `Shipping` record linked to the order (`address: shippingAddress`, `status: PREPARING`).
9. **Commit/Rollback:** Prisma automatically commits if all operations succeed. If the concurrent inventory check fails or any other error occurs, Prisma automatically rolls back all changes, ensuring consistency.

## 2. Validation Rules

- **Payload:** `items` must be a non-empty array. Each item must have a valid UUID `productId` and an integer `quantity > 0`. `shippingAddress` is required and must be a valid string.
- **Duplicate Products:** The backend must reject the request with a validation error if the client sends the same `productId` multiple times in one request. Do not aggregate quantities.
- **Inventory:** An order cannot be placed if it exceeds current stock levels.
- **Coupons:** Only active coupons can be applied.

## 3. Status Transition Rules

Order statuses follow a strict linear progression. Skipping or reverting statuses is invalid.
- `PENDING` -> `CONFIRMED`: Triggered when the linked `Payment` status is updated to `COMPLETED`.
- `CONFIRMED` -> `SHIPPED`: Triggered when the linked `Shipping` status is updated to `SHIPPED`.
- `SHIPPED` -> `DELIVERED`: Triggered when the linked `Shipping` status is updated to `DELIVERED`.

**Invalid Transitions:** 
- A `DELIVERED` or `SHIPPED` order cannot be cancelled.
- An order cannot transition directly from `PENDING` to `SHIPPED`.

## 4. Concurrency Strategy (Preventing Overselling)

To prevent the "read-modify-write" race condition (where two concurrent requests read the same initial quantity and both proceed to deduct, pushing inventory below zero):
1. **Conditional Update (`updateMany`):** Instead of a simple read and subsequent decrement, the decrement operation must be conditional.
   ```typescript
   const update = await prisma.product.updateMany({
     where: { id: productId, quantity: { gte: requestedQuantity } },
     data: { quantity: { decrement: requestedQuantity } }
   });
   if (update.count === 0) throw new Error("Concurrent inventory depletion");
   ```
2. **Transaction Wrap:** This conditional update happens inside the main Prisma `$transaction`. If it throws, the entire order creation (including other product updates) is rolled back.

## 5. Cancellation Strategy

1. **Endpoint:** `POST /api/v1/orders/:id/cancel`
2. **Validation:** Ensure the order belongs to the requesting customer. Ensure `order.status` is either `PENDING` or `CONFIRMED`.
3. **Transaction Flow:**
   - Update `Order.status` to `CANCELLED`.
   - **Inventory Restoration:** For each `OrderItem`, use an atomic increment on the `Product` table (`{ data: { quantity: { increment: item.quantity } } }`).
   - (Note: Financial refunds are outside the scope of this database transaction, but theoretically would be triggered here if Payment was `COMPLETED`).

## 6. API Request/Response Design

### Create Order (`POST /api/v1/orders`)
**Request:**
```json
{
  "customerId": "abc-123-uuid",
  "items": [
    { "productId": "550e8400-e29b-41d4-a716-446655440000", "quantity": 2 }
  ],
  "couponCode": "SUMMER20",
  "shippingAddress": "123 Commerce St, Tech City"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "order-uuid",
    "status": "PENDING",
    "total": 150.00,
    "discountAmount": 30.00,
    "createdAt": "2026-08-30T10:00:00.000Z",
    "payment": {
      "id": "payment-uuid",
      "status": "PENDING"
    },
    "shipping": {
      "id": "shipping-uuid",
      "status": "PREPARING"
    }
  }
}
```

### Get Order by ID (`GET /api/v1/orders/:id`)
**Response (200 OK):** Includes nested `items` (with snapshotted `unitPrice`), `payment`, and `shipping` objects.

### List Orders (`GET /api/v1/orders`)
**Query Params:** `?page=1&limit=10&status=PENDING&customerId=abc-123-uuid`
**Response:** Paginated list of orders for the specified customer (temporarily filtered by query parameter until authentication is added).

### Cancel Order (`POST /api/v1/orders/:id/cancel`)
**Response (200 OK):** Order object reflecting the new `CANCELLED` status.

## 7. Unresolved Questions

1. **Database Constraints:** While the Prisma conditional update prevents overselling on the application layer, should we also write a raw SQL migration to add a `CHECK (quantity >= 0)` constraint to the database for absolute data integrity?
2. **Partial Fulfillment:** Do we need to support partial cancellations or partial shipments in the future? (The current design assumes atomic, full-order lifecycle transitions).
