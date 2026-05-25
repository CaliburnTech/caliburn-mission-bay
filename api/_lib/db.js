/**
 * Prisma database client — shared singleton for Vercel API functions.
 *
 * Uses a global singleton to avoid exhausting connections during hot-reload
 * in local dev (each module re-evaluation would create a new PrismaClient).
 * In production Vercel functions each instance is isolated, so no issue there.
 *
 * Requires env vars:
 *   DATABASE_URL  — pooled connection string (PgBouncer, port 6543)
 *   DIRECT_URL    — direct connection string (port 5432, used by Prisma CLI only)
 */

import { PrismaClient } from '@prisma/client';

const prisma =
  globalThis.__prisma ??
  new PrismaClient({
    datasources: {
      db: { url: process.env.DATABASE_URL },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export default prisma;
