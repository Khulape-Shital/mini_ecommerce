# Security

Define:
- secret management
- environment variables
- password hashing
- JWT security
- authorization
- Zod validation
- SQL injection prevention
- CORS
- Helmet
- rate limiting for sensitive endpoints
- safe error responses
- safe logging

## Never Expose:
- passwords
- JWT secrets
- API keys
- DATABASE_URL
- authorization headers
- stack traces in production
- SQL errors containing sensitive information

## Never Trust Client-Provided:
- order totals
- discount amounts
- inventory quantities
- payment success state
- authorization claims
