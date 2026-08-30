# Database

Define PostgreSQL database standards:

- relational design
- normalization
- foreign keys
- unique constraints
- appropriate indexes
- NOT NULL where appropriate
- UUID identifiers
- createdAt/updatedAt where appropriate
- database constraints for critical invariants

## Money
- use DECIMAL/NUMERIC
- never use floating point for financial values

## Inventory
- inventory changes must be atomic
- order creation and inventory deduction must be transactionally consistent
- cancellation and inventory restoration must be transactionally consistent

## Historical order data
- preserve purchase-time price using OrderItem.unitPrice or equivalent

## Deletion
- protect historical order data
- avoid deleting records that would break historical integrity
- use soft deletion only where justified

## Migrations
- schema changes must use Prisma migrations
- no destructive database operations without explicit approval
