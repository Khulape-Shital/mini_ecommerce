# Prisma

Target Prisma 7.10.0.

Rules:

- Follow the actual installed Prisma version.
- Do not blindly use Prisma 5/6 tutorials.
- Respect the existing prisma7.config.ts.
- Respect the existing generated client configuration.
- Use the configured PostgreSQL adapter.
- Never hardcode credentials.
- Never log DATABASE_URL.
- Never commit .env.
- Use migrations for schema changes.
- Inspect existing schema and migrations before modifying them.
- Do not reset databases.
- Do not delete migrations to solve problems.
