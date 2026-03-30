/**
 * Database Client (placeholder)
 *
 * Phase 3 will add Prisma + Vercel Postgres here.
 * For now, exports a stub that logs warnings.
 */

// Phase 3: Replace with:
// import { PrismaClient } from '@prisma/client'
// const prisma = new PrismaClient()
// export default prisma

export const db = {
  _placeholder: true,
  query: () => {
    console.warn('[DB] Database not yet configured. Phase 3 will add Prisma + Vercel Postgres.');
    return Promise.resolve([]);
  }
};

export default db;
