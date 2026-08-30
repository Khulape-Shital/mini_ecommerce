import { PrismaClient } from './generated/prisma/client.js';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:1Codex2Shital@localhost:5432/mini_ecommerce' });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function test() {
  console.log("Connecting prisma...");
  try {
    const res = await prisma.$queryRaw`SELECT 1`;
    console.log("Result:", res);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
    pool.end();
  }
}
test();
