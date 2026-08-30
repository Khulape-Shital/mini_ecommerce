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
These are not in the database yet but are designed to support the approved features:
- **Authentication:** Extend `Customer` (or create a `User` model) with `passwordHash` for login.
- **Category:** `id`, `name`. `Product` will have a relation to `Category`.
- **Review:** `id`, `productId`, `customerId`, `rating`, `comment`.
- **Discount/Coupon:** `id`, `code`, `discountPercent`, `validUntil`, `isActive`.
- **Payment:** `id`, `orderId`, `status` (PENDING, SUCCESS, FAILED), `method`.
- **Shipping:** `id`, `orderId`, `address`, `status`, `trackingCode`.

## 3. Key Design Rules
- **Decimals for Money:** `total` and `price` must use Decimal (already implemented).
- **Snapshot Data:** `OrderItem.unitPrice` captures the price at the time of purchase.
- **Data Integrity:** Strict foreign keys and cascading rules (Restrict deletion of products if they belong to an order).
