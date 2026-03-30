/**
 * Auth Middleware (placeholder)
 *
 * Phase 2 will add Clerk JWT verification here.
 * For now, passes all requests through.
 */

// Phase 2: Replace with:
// import { verifyToken } from '@clerk/backend'
// export const requireAuth = async (req) => { ... }

export const requireAuth = async () => {
  // Phase 2: Verify Clerk JWT from Authorization header
  // For now, return a mock user
  return {
    userId: 'demo-user',
    companyId: 'demo-company',
    role: 'admin'
  };
};

export const requireRole = (role) => async (req) => {
  const user = await requireAuth(req);
  if (user.role !== role && user.role !== 'admin') {
    throw new Error(`Required role: ${role}`);
  }
  return user;
};
