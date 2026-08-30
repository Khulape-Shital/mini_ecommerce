import { PrismaClient } from '../../generated/prisma/client.js';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from '../config/env.js';

const connectionString = env.DATABASE_URL;

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
export { Prisma } from '../../generated/prisma/client.js';
