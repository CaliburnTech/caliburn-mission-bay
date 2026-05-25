/**
 * Prisma database client — Prisma v7 adapter pattern.
 *
 * In Prisma v7 the datasource URL is no longer set in schema.prisma.
 * It must be supplied at runtime via a driver adapter passed to PrismaClient.
 * We use @prisma/adapter-pg (already in dependencies) with the pooled
 * DATABASE_URL (PgBouncer, port 6543).
 *
 * prisma.config.ts holds the DIRECT_URL for Prisma CLI migrations only.
 *
 * Required env vars:
 *   DATABASE_URL — pooled connection string (port 6543, ?pgbouncer=true)
 */

// Prisma v7: client is generated to ./generated/prisma (not node_modules/@prisma/client)
// Path from api/_lib/ → ../../generated/prisma/client
import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const makeClient = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('[db] DATABASE_URL is not set — check Vercel environment variables');
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
};

const prisma = globalThis.__prisma ?? makeClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export default prisma;
