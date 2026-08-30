# System Design

## 1. System Architecture (Engineering Decision)
**Type:** Client-Server Monolith
**Frontend:** React (TypeScript) SPA for the user interface.
**Backend:** Node.js + Express.js + TypeScript REST API.
**Database:** PostgreSQL, accessed via Prisma ORM.

**Architecture Layers (Backend):**
- **Routes:** Define HTTP endpoints and apply middleware.
- **Middleware:** Authentication (JWT), Zod validation, error handling.
- **Controllers:** Handle HTTP requests and responses, invoking services.
- **Services:** Contain core business logic, orchestrate database transactions.
- **Data Access:** Prisma client calls.

## 2. Backend/Frontend Module Structure (Engineering Decision)
**Backend:**
- `/src/routes`: Express routers
- `/src/controllers`: HTTP controllers
- `/src/services`: Business logic
- `/src/middlewares`: Custom middlewares (auth, error handler)
- `/src/schemas`: Zod validation schemas
- `/src/utils`: Utilities (JWT, hashing)

**Frontend (React):**
- `/src/components`: Reusable UI components
- `/src/pages`: Route-level components
- `/src/hooks`: Custom React hooks
- `/src/services`: API client functions

## 3. Security and Performance Considerations (Assignment Requirement & Approved Feature)
**Security:**
- JWT for authentication (Approved Feature).
- Password hashing (bcrypt) for Customer accounts.
- Zod for strict input validation to prevent injection or malformed data (Assignment Requirement).
- CORS configured for the frontend origin.

**Performance:**
- Pagination for large collections (Products, Orders, Customers) (Approved Feature).
- Database-level filtering and search (no loading entire tables).
- Efficient indexes on foreign keys and frequently queried fields.

## 4. Testing Strategy (Assignment Requirement)
- **Unit Tests:** Jest for isolated business logic in services (e.g., total calculation, inventory validation).
- **Integration Tests:** Supertest for testing API endpoints.
