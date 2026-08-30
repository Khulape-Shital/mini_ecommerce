# Performance

Define practical optimization rules:

## Database
- avoid N+1 queries
- use appropriate indexes
- select only needed data when useful
- paginate large datasets
- avoid unnecessary joins
- avoid loading entire tables

## API
- avoid duplicate database calls
- keep responses reasonable
- paginate collections

## Transactions
- keep transactions short
- never perform external HTTP calls inside database transactions

## Frontend
- avoid unnecessary requests
- avoid unnecessary renders
- use appropriate caching where justified

**IMPORTANT:**
Do not introduce Redis, caching, queues, microservices, or other infrastructure unless there is a demonstrated requirement.

Correctness takes priority over micro-optimization.
