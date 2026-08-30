# Architectural Decisions and Assumptions

## 1. Engineering Decisions
- **Monolithic API:** Kept as a single Express application. Microservices are overkill for a mini e-commerce system.
- **Transaction Safety:** Prisma interactive transactions will be used for order creation and cancellation to ensure inventory changes are atomic and consistent.
- **Fat Services, Thin Controllers:** Business rules (like calculating totals and verifying inventory) reside exclusively in the Service layer to allow easy testing without mocking HTTP request/response objects.

## 2. Distinguishing Requirements vs Features
- **Assignment Requirements:** Product CRUD, Customer management, Order management (multiple products, total calc, inventory updates, cancellation), Order status.
- **Approved Project Features:** JWT Authentication, Swagger, Pagination/Search, Payments, Shipping, Categories, Reviews, Coupons.

## 3. Assumptions
- **Customer acts as User:** The existing schema has a `Customer` model. I assume we will add authentication fields to this model (or a 1-to-1 User model) to fulfill the User Registration/Login feature.
- **Soft Deletion:** Products should likely be soft-deleted rather than hard-deleted to preserve order history, although strict relational enforcement on `OrderItem` prevents hard deleting a purchased product anyway.
- **Infrastructure:** The current setup relies solely on PostgreSQL. I assume no Redis or external caching is needed as the project does not mandate it, adhering to the "no unnecessary infrastructure" rule.
- **Code State:** Assumed the existing Prisma schema (inspected during design phase) is the baseline and will be updated later via migrations to support the approved features.
