# Authentication

JWT authentication.

**Registration:**
- validate input
- hash password
- never store plaintext passwords

**Login:**
- validate credentials
- issue JWT securely

**Protected APIs:**
- authenticate
- authorize where required

Never rely on frontend authorization.

JWT secrets come from environment variables.

Document token expiration and refresh strategy when implemented.
