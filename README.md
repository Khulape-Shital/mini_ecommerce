# Mini E-Commerce API

## Project Overview
This project is a RESTful API for a mini e-commerce platform. It provides core functionality for managing products, customers, and orders, along with inventory management and order status tracking. The system ensures robust data consistency using database transactions.

## CORE ASSIGNMENT FEATURES
- **Product Management**: Add, update, delete, and view products with `name`, `price`, `description`, and `quantity`.
- **Customer Management**: Add and view customers with `name`, `email`, and `contact`.
- **Order Management**: 
  - Create orders containing multiple products.
  - Server-side inventory validation and total calculation.
  - Atomic inventory deduction upon successful order placement.
  - View order details.
- **Order Status Tracking**: Supports `PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, and `CANCELLED`.
- **Error Handling**: Comprehensive input validation and conflict prevention for inventory (avoids overselling).

## ADDITIONAL FEATURES CURRENTLY IMPLEMENTED
- **Categories**: Group products into categories.
- **Coupons**: Apply discount codes during checkout.
- **Reviews**: Customers can leave product reviews.
- **Payments**: Basic tracking of payment status (`PENDING`, `COMPLETED`, `FAILED`).
- **Shipping**: Basic tracking of shipping status and addresses.

## Technology Stack
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database ORM**: Prisma
- **Database**: PostgreSQL
- **Validation**: Zod
- **Testing**: Vitest & Supertest

## Project Architecture
The project follows a layered architecture:
- **Routes (`src/routes`)**: Defines API endpoints and maps them to controllers.
- **Controllers (`src/controllers`)**: Handles HTTP requests, extracts parameters, and formats responses.
- **Services (`src/services`)**: Contains the core business logic, database interactions, and transactional operations.
- **Schemas (`src/schemas`)**: Zod validation schemas for incoming request payloads.
- **Middlewares (`src/middlewares`)**: Error handling and request validation.

## Database Design Overview
The database uses a relational model via Prisma/PostgreSQL. 
- **Customer**: Stores customer profiles.
- **Product**: Stores product details and available quantity.
- **Order**: Links to `Customer` and tracks total cost and status.
- **OrderItem**: Acts as a junction table between `Order` and `Product`, capturing purchased quantities and frozen unit prices.

*(Additional tables exist for Categories, Reviews, Payments, Shipping, and Coupons)*

## Setup and Installation

### Backend Setup
1. Clone the repository.
2. Navigate to the `backend` directory: `cd backend`
3. Install dependencies: `npm install`

## Environment Variables
Create a `.env` file in the `backend` directory:
```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce?schema=public"
NODE_ENV="development"
```

## Prisma / Database Setup
1. Apply database migrations: `npx prisma migrate dev`
2. Generate Prisma client (if not automatically done): `npx prisma generate`

## How to Run the Application

### Backend
- **Development**: `npm run dev`
- **Build**: `npm run build`
- **Production**: `npm start`

### Frontend Setup & Run
1. Navigate to the `frontend` directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run the application:
   - **Development**: `npm run dev`
   - **Build**: `npm run build`

## How to Run Tests
The project uses Vitest for backend testing. Navigate to the `backend` directory and run the test suite using:
```bash
npm test
```

## API Endpoint Documentation

### Products
- `GET /api/v1/products` - List all products
- `POST /api/v1/products` - Create a product
- `GET /api/v1/products/:id` - Get product details
- `PATCH /api/v1/products/:id` - Update a product
- `DELETE /api/v1/products/:id` - Delete a product

### Customers
- `GET /api/v1/customers` - List all customers
- `POST /api/v1/customers` - Create a customer
- `GET /api/v1/customers/:id` - Get customer details
- `PATCH /api/v1/customers/:id` - Update a customer
- `DELETE /api/v1/customers/:id` - Delete a customer

### Orders
- `GET /api/v1/orders` - List all orders
- `POST /api/v1/orders` - Create an order
- `GET /api/v1/orders/:id` - Get order details
- `PATCH /api/v1/orders/:id/status` - Update order status
- `POST /api/v1/orders/:id/cancel` - Cancel an order

## Sample API Requests

**Create a Product:**
```json
POST /api/v1/products
{
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse",
  "price": 29.99,
  "quantity": 100
}
```

**Create an Order:**
```json
POST /api/v1/orders
{
  "name": "John Doe",
  "email": "john@example.com",
  "contact": "+1234567890",
  "items": [
    { "productId": "uuid-here", "quantity": 2 }
  ],
  "shippingAddress": "123 Main St",
  "couponCode": "SAVE20"
}
```

## Assumptions & Design Decisions
- **Inventory Locking**: Inventory is eagerly deducted during order creation using database transactions to prevent overselling.
- **Price Freezing**: The unit price of a product is copied to the `OrderItem` at checkout so that future product price changes do not alter past orders.
- **Hard Deletion with Dependency Checks**: Entities like customers and products cannot be deleted if they are referenced by existing orders, ensuring data integrity.

## Limitations & Future Improvements
- Implement pagination comprehensively across all list endpoints.
- Introduce caching for frequently accessed data like products.
- Enhance authentication/authorization (currently omitted by assignment design).
