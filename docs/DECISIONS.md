# Architectural Decisions and Assumptions

## 1. Clarification of Requirements (Assignment vs Features)
- **Assignment Requirements:** Product CRUD, Customer management, Order management (multiple products, total calc, inventory updates, cancellation), Error Handling, Data Consistency.
- **Explicitly Approved Additional Features:** JWT Authentication, User Registration/Login, Pagination, Search, Filtering, Payments, Shipping, Categories, Reviews/Ratings, Coupons.
- **Engineering Decisions:** 
  - Using a single monolith Express app.
  - Using `Customer` as the unified Auth/User entity.
  - Designing minimal practical models for approved features to avoid scope creep.
- **Assumptions:** 
  - Dummy payment and shipping endpoints are sufficient since real integrations are forbidden unless approved.
  - The existing `Customer`, `Product`, `Order`, `OrderItem` schema is the immutable baseline for the design phase, to be extended later.

## 2. Resolved Ambiguities
- **Customer vs User:** Decided to extend `Customer` with `passwordHash` rather than creating a separate `User` table. This simplifies the schema and directly ties authentication to order history.
- **Product ↔ Category:** Decided on a One-to-Many relationship (Category has many Products). A Many-to-Many relationship is unnecessary complexity for a mini e-commerce system.
- **Coupon/Discount Model:** Minimal model implemented using a simple `discountPercent` on a `Coupon` table, applied at the order level.
- **Payment & Shipping Models:** Minimal one-to-one models linked to `Order`, meant to simulate state rather than integrate with external providers.
- **Order Status Transitions:** Strictly defined as a linear progression (`PENDING` -> `CONFIRMED` -> `SHIPPED` -> `DELIVERED`), with `CANCELLED` only reachable from `PENDING` or `CONFIRMED`.
- **Transaction Rules:** Fully defined order creation and cancellation as atomic Prisma transactions encompassing inventory updates, price snapshots, and coupon application.
