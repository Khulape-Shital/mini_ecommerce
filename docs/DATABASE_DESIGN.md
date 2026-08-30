# Database Design

This document describes the approved database design and intent for the application.

## Important Engineering Decisions

1. **Customer Authentication:** Customer is the authentication entity; there is no separate User table. This simplifies the domain model for this mini-ecommerce app. (Engineering decision)
2. **Category Relationship:** Category → Product is a one-to-many relationship. (Engineering decision)
3. **Snapshot Pricing:** OrderItem stores the purchase-time `unitPrice`. (Engineering decision)
4. **Decimals for Money:** Money uses Decimal/Numeric (e.g., `Decimal(10,2)` or `Decimal(12,2)`), never floating point. (Engineering decision)
5. **Inventory Consistency:** Product inventory must remain consistent with orders. (Assignment requirement)
6. **Transactional Orders:** Order creation and cancellation require transactional consistency. (Assignment requirement)
7. **Coupons:** Coupon is currently a minimal percentage-based model. (Engineering decision)
8. **Payment and Shipping:** Payment and Shipping are minimal internal domain models; there are no external integrations (e.g., Stripe, FedEx). (Engineering decision / Assumption)
9. **Deletion Behavior:** Foreign-key deletion behavior must be explicitly documented. Strict rules like `Restrict` for core financial records and `Cascade` for peripheral data (e.g., reviews). (Engineering decision)
10. **Timestamps:** `createdAt` and `updatedAt` are used consistently across major entities to track record lifecycle, auditing, and troubleshooting. (Engineering decision)
11. **Indexes:** Important indexes are added to optimize frequent lookups (e.g., foreign keys, statuses, and searchable names). (Engineering decision)

## Entities

### Customer (Assignment requirement)
- **Purpose:** Represents the purchaser and user of the application.
- **Fields:**
  - `id` (String)
  - `name` (String)
  - `email` (String)
  - `passwordHash` (String)
  - `contact` (String, Optional)
  - `createdAt` (DateTime)
  - `updatedAt` (DateTime)
- **Primary Key:** `id`
- **Foreign Keys:** None
- **Relationships:**
  - Has many `Order`s
  - Has many `Review`s
- **Unique Constraints:** `email`
- **Indexes:** `[name]` (For searching customers by name)
- **Deletion Behavior:** Default/Implicit restricted deletion for related orders.

### Category (Approved feature)
- **Purpose:** Represents a product category to organize inventory.
- **Fields:**
  - `id` (String)
  - `name` (String)
  - `createdAt` (DateTime)
  - `updatedAt` (DateTime)
- **Primary Key:** `id`
- **Foreign Keys:** None
- **Relationships:**
  - Has many `Product`s
- **Unique Constraints:** `name`
- **Indexes:** None
- **Deletion Behavior:** Default restricted.

### Product (Assignment requirement)
- **Purpose:** Represents sellable inventory items.
- **Fields:**
  - `id` (String)
  - `categoryId` (String, Optional)
  - `name` (String)
  - `description` (String, Optional)
  - `price` (Decimal)
  - `quantity` (Int)
  - `createdAt` (DateTime)
  - `updatedAt` (DateTime)
- **Primary Key:** `id`
- **Foreign Keys:** `categoryId` -> `Category.id`
- **Relationships:**
  - Belongs to a `Category`
  - Has many `OrderItem`s
  - Has many `Review`s
- **Unique Constraints:** None
- **Indexes:** 
  - `[name]` (For product search)
  - `[categoryId]` (For filtering by category)
- **Deletion Behavior:** Restricted by default if referenced by `OrderItem`.

### Coupon (Approved feature)
- **Purpose:** Represents a discount code that can be applied to orders.
- **Fields:**
  - `id` (String)
  - `code` (String)
  - `discountPercent` (Int)
  - `isActive` (Boolean)
  - `createdAt` (DateTime)
  - `updatedAt` (DateTime)
- **Primary Key:** `id`
- **Foreign Keys:** None
- **Relationships:**
  - Has many `Order`s
- **Unique Constraints:** `code`
- **Indexes:** None
- **Deletion Behavior:** Default restricted.

### Order (Assignment requirement)
- **Purpose:** Represents a purchase transaction.
- **Fields:**
  - `id` (String)
  - `customerId` (String)
  - `couponId` (String, Optional)
  - `status` (Enum OrderStatus: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
  - `total` (Decimal)
  - `discountAmount` (Decimal, Optional)
  - `createdAt` (DateTime)
  - `updatedAt` (DateTime)
- **Primary Key:** `id`
- **Foreign Keys:**
  - `customerId` -> `Customer.id`
  - `couponId` -> `Coupon.id`
- **Relationships:**
  - Belongs to a `Customer`
  - Belongs to a `Coupon` (Optional)
  - Has many `OrderItem`s
  - Has one `Payment`
  - Has one `Shipping`
- **Unique Constraints:** None
- **Indexes:** 
  - `[customerId]` (For retrieving a customer's orders)
  - `[status]` (For filtering orders by status)
  - `[createdAt]` (For sorting and reporting by date)
  - `[couponId]` (For analyzing coupon usage)
- **Deletion Behavior:** Default restricted.

### OrderItem (Assignment requirement)
- **Purpose:** The many-to-many join table with snapshot pricing for products in an order.
- **Fields:**
  - `id` (String)
  - `orderId` (String)
  - `productId` (String)
  - `quantity` (Int)
  - `unitPrice` (Decimal)
- **Primary Key:** `id`
- **Foreign Keys:**
  - `orderId` -> `Order.id`
  - `productId` -> `Product.id`
- **Relationships:**
  - Belongs to an `Order`
  - Belongs to a `Product`
- **Unique Constraints:** `[orderId, productId]` (A product should only appear once per order)
- **Indexes:** `[productId]` (For querying which orders contain a product)
- **Deletion Behavior:** 
  - `onDelete: Restrict` for `order`
  - `onDelete: Restrict` for `product`

### Review (Approved feature)
- **Purpose:** Allows customers to leave ratings and comments on products.
- **Fields:**
  - `id` (String)
  - `productId` (String)
  - `customerId` (String)
  - `rating` (Int)
  - `comment` (String, Optional)
  - `createdAt` (DateTime)
  - `updatedAt` (DateTime)
- **Primary Key:** `id`
- **Foreign Keys:**
  - `productId` -> `Product.id`
  - `customerId` -> `Customer.id`
- **Relationships:**
  - Belongs to a `Product`
  - Belongs to a `Customer`
- **Unique Constraints:** `[productId, customerId]` (A customer can review a product only once)
- **Indexes:** 
  - `[productId]` (To load reviews for a product)
  - `[customerId]` (To load reviews written by a customer)
- **Deletion Behavior:** 
  - `onDelete: Cascade` for `product`
  - `onDelete: Cascade` for `customer`

### Payment (Approved feature)
- **Purpose:** Minimal internal domain model for tracking payment status.
- **Fields:**
  - `id` (String)
  - `orderId` (String)
  - `status` (Enum PaymentStatus: PENDING, COMPLETED, FAILED)
  - `amount` (Decimal)
  - `createdAt` (DateTime)
  - `updatedAt` (DateTime)
- **Primary Key:** `id`
- **Foreign Keys:** `orderId` -> `Order.id`
- **Relationships:**
  - Belongs to an `Order` (One-to-One)
- **Unique Constraints:** `orderId`
- **Indexes:** None (Inherently indexed via unique constraint)
- **Deletion Behavior:** `onDelete: Restrict` for `order`

### Shipping (Approved feature)
- **Purpose:** Minimal internal domain model for tracking shipping status and address.
- **Fields:**
  - `id` (String)
  - `orderId` (String)
  - `address` (String)
  - `status` (Enum ShippingStatus: PREPARING, SHIPPED, DELIVERED)
  - `createdAt` (DateTime)
  - `updatedAt` (DateTime)
- **Primary Key:** `id`
- **Foreign Keys:** `orderId` -> `Order.id`
- **Relationships:**
  - Belongs to an `Order` (One-to-One)
- **Unique Constraints:** `orderId`
- **Indexes:** None (Inherently indexed via unique constraint)
- **Deletion Behavior:** `onDelete: Restrict` for `order`
