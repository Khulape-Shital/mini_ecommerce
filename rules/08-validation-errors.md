# Validation and Errors

Use Zod for external input validation.

Validate:
- request body
- route params
- query params
- relevant headers

Separate:
- Input validation
- from
- Business validation

Example:
Invalid quantity format → validation error
Insufficient inventory → business error

Use centralized error handling.
Use stable machine-readable error codes.

Examples:
- PRODUCT_NOT_FOUND
- CUSTOMER_NOT_FOUND
- ORDER_NOT_FOUND
- INSUFFICIENT_INVENTORY
- INVALID_ORDER_STATUS
- DUPLICATE_EMAIL
- INVALID_COUPON
- COUPON_EXPIRED
- PAYMENT_FAILED
