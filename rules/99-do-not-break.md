# Do Not Break

This is the final safety layer.

NEVER:
- expose secrets
- commit .env
- reset the database without approval
- delete migrations
- bypass validation
- trust client-calculated totals
- trust client inventory values
- use floating point for money
- perform inconsistent inventory updates
- put business logic in routes
- put authoritative business logic in React
- silently change existing behavior
- rewrite unrelated working code
- add unrelated features
- invent requirements
- claim something was verified when it was not

If something cannot be verified from the repository:
Explicitly say: "I cannot verify this from the current repository."
Then inspect the relevant files.
