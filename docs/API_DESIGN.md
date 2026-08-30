# API Design

RESTful endpoints for the Mini E-Commerce System.

## 1. Product Management (Assignment Requirement)
- `GET /api/v1/products`: List products (supports pagination, search, filtering).
- `GET /api/v1/products/:id`: Get product details.
- `POST /api/v1/products`: Create a new product.
- `PATCH /api/v1/products/:id`: Update a product.
- `DELETE /api/v1/products/:id`: Soft-delete a product.

## 2. Customer Management (Assignment Requirement & Approved Feature)
- `GET /api/v1/customers`: List customers (paginated).
- `GET /api/v1/customers/:id`: Get customer details.
- `POST /api/v1/customers`: Register/add a customer (Auth feature).

## 3. Order Management (Assignment Requirement)
- `POST /api/v1/orders`: Place a new order. Payload includes `items: [{productId, quantity}]` and optional `couponCode`.
- `GET /api/v1/orders`: View orders (filtered by customer, paginated).
- `GET /api/v1/orders/:id`: View specific order details.
- `PATCH /api/v1/orders/:id/status`: Update order status.
- `POST /api/v1/orders/:id/cancel`: Cancel an order.

## 4. Auth (Approved Feature)
- `POST /api/v1/auth/login`: Authenticate customer, returns JWT.

## 5. Payments & Shipping (Approved Feature - Minimum Practical)
- `POST /api/v1/orders/:id/payment`: Simulate payment completion.
- `PATCH /api/v1/orders/:id/shipping`: Update shipping status.

## 6. Search, Filtering, and Pagination Strategy (Approved Feature)
- **Query Params:** `?page=1&limit=20&search=keyword&categoryId=123`
- Pagination is server-side using `skip` and `take` in Prisma.
