# System Design

## 1. System Architecture
**Type:** Client-Server Monolith
**Frontend:** React (TypeScript) SPA for the user interface.
**Backend:** Node.js + Express.js + TypeScript REST API.
**Database:** PostgreSQL, accessed via Prisma ORM.

**Architecture Layers (Backend):**
- **Routes:** Define HTTP endpoints and apply middleware.
- **Middleware:** Authentication (JWT), authorization, Zod validation, error handling.
- **Controllers:** Handle HTTP requests and responses, invoking services.
- **Services:** Contain core business logic, orchestrate database transactions.
- **Data Access:** Prisma client calls.

## 2. Backend/Frontend Module Structure
**Backend:**
- `/src/routes`: Express routers
- `/src/controllers`: HTTP controllers
- `/src/services`: Business logic
- `/src/middlewares`: Custom middlewares (auth, error handler)
- `/src/schemas`: Zod validation schemas
- `/src/utils`: Utilities (JWT, hashing, logger)

**Frontend (React):**
- `/src/components`: Reusable UI components
- `/src/pages`: Route-level components
- `/src/hooks`: Custom React hooks (e.g., for API fetching)
- `/src/services`: API client functions
- `/src/store`: Global state management (if needed)

## 3. Security and Performance Considerations
**Security:**
- JWT for authentication (Approved Feature).
- Password hashing (bcrypt/argon2).
- Zod for strict input validation to prevent injection or malformed data.
- CORS configured for the frontend origin.

**Performance:**
- Pagination for large collections (Products, Orders, Customers).
- Database-level filtering and search (no loading entire tables).
- Efficient indexes on foreign keys and frequently queried fields (e.g., `status`, `email`).

## 4. Testing Strategy
- **Unit Tests:** Jest for isolated business logic in services (e.g., total calculation, inventory validation).
- **Integration Tests:** Supertest for testing API endpoints with a test database.
- **Frontend Tests:** React Testing Library for critical UI flows (e.g., placing an order).
