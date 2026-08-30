# Implementation Workflow

This is mandatory.

For every implementation task:
1. Read relevant rules.
2. Inspect existing implementation.
3. Inspect database/schema/migrations if relevant.
4. Identify dependencies.
5. Plan changes.
6. Implement minimal necessary changes.
7. Run validation.
8. Run tests.
9. Review security.
10. Review database consistency.
11. Review performance.
12. Report changes.

Do not assume repository state.
Do not invent files, APIs, tables, or functionality.

If uncertain:
- state what cannot be verified
- inspect the repository
- then proceed

For database changes:
- explain schema change
- create migration
- verify migration

For API changes:
- validate inputs
- implement business logic in service layer
- add error handling
- add tests
