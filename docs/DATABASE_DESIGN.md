# Database Design

## 1. Core Entities and Relationships (Assignment Requirements)
Currently defined in the Prisma schema:
- **Customer:** `id`, `name`, `email`, `contact`. Represents the purchaser.
- **Product:** `id`, `name`, `description`, `price`, `quantity`. Represents sellable inventory.
- **Order:** `id`, `customerId`, `status`, `total`, timestamps. Represents a purchase transaction.
- **OrderItem:** `id`, `orderId`, `productId`, `quantity`, `unitPrice`. The many-to-many join table with snapshot pricing.

**Relationships:**
- A Customer has many Orders.
- An Order has many OrderItems.
- A Product has many OrderItems.

## 2. Planned Entities (Approved Project Features)
These are minimal practical models designed to support approved features without overengineering:

- **Authentication (Customer vs User resolution):** (Engineering Decision)
  - We will NOT create a separate `User` table.
  - The existing `Customer` model will be extended with a `passwordHash` (String) field to handle authentication.
- **Category:** (Engineering Decision: One-to-Many)
  - `id`, `name`. 
  - `Product` will have an optional `categoryId` to support categorization.
- **Review:**
  - `id`, `productId`, `customerId`, `rating` (Int 1-5), `comment`.
- **Discount/Coupon (Minimum Practical Model):** (Engineering Decision)
  - **Coupon:** `id`, `code` (Unique), `discountPercent` (Int), `isActive` (Boolean).
  - **Order:** Add `couponId` (Optional) and `discountAmount` (Decimal) to track applied discounts.
- **Payment (Minimum Practical Model):** (Engineering Decision)
  - **Payment:** `id`, `orderId` (Unique), `status` (PENDING, COMPLETED, FAILED), `amount` (Decimal).
- **Shipping (Minimum Practical Model):** (Engineering Decision)
  - **Shipping:** `id`, `orderId` (Unique), `address` (String), `status` (PREPARING, SHIPPED, DELIVERED).

## 3. Key Design Rules (Engineering Decisions)
- **Decimals for Money:** `total` and `price` must use Decimal (already implemented).
- **Snapshot Data:** `OrderItem.unitPrice` captures the price at the time of purchase.
- **Data Integrity:** Strict foreign keys and cascading rules (Restrict deletion of products if they belong to an order).
