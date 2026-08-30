# Architecture

Preferred architecture:
HTTP Request -> Route -> Middleware -> Validation -> Controller -> Service -> Prisma -> PostgreSQL

## Responsibilities

**Routes:**
- endpoint definitions
- middleware composition
- no business logic

**Controllers:**
- HTTP concerns
- request/response handling
- call services
- no complex business logic

**Services:**
- business rules
- transactions
- calculations
- inventory logic
- order logic
- coupon logic
- payment state logic

**Repositories:**
- Only introduce a repository layer if it provides real value.
- Do not create unnecessary abstractions over Prisma.

**Middleware:**
- authentication
- authorization
- validation
- errors
- logging
