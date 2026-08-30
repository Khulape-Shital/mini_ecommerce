# Project Context

## Project Purpose
We are building a Mini E-Commerce Order Management System for an assignment.

## Assignment Requirements
1. Product Management (Add, Update, Delete, View)
2. Customer Management (Add, View)
3. Order Management (Place order, Validate availability, Calculate total, Update inventory, View details/status, Cancel)
4. Order Status (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
5. Error Handling (Invalid input, Insufficient inventory, Data consistency, API errors)

## Approved Additional Features
- JWT authentication
- User registration/login
- Swagger/OpenAPI
- Docker
- Pagination
- Search
- Filtering
- Payment management
- Shipping management
- Product categories
- Reviews and ratings
- Discounts/coupons

## Technology Stack
- Backend: Node.js, Express.js, TypeScript, PostgreSQL, Prisma ORM 7.10.0, Zod
- Frontend: React, TypeScript
- Current Database: PostgreSQL on localhost:5432, database: mini_ecommerce

## Current Project State
The existing Prisma setup has already been configured and verified.

## Scope Boundaries
Do not add unrelated major features unless explicitly approved. Assignment requirements are the source of truth for functionality.

## Rule Priority
If two rules conflict, the higher-priority rule wins:
1. Security and data integrity
2. Explicit assignment requirements
3. Approved project requirements
4. Database constraints
5. Architecture rules
6. Performance rules
7. Code quality/style
8. Convenience
