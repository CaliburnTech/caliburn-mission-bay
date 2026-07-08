import prisma from '../_lib/db.js';
import { withHandler } from '../_lib/handler.js';
import { assertRateLimit } from '../_lib/rateLimit.js';
import { badRequest, created, methodNotAllowed } from '../_lib/respond.js';

/**
 * POST /api/submissions — PUBLIC, no authentication.
 *
 * Zero-friction anonymous config save: a non-signed-in user saves a build and
 * it lands in the same `SavedConfiguration` table the admin Submissions page
 * reads (GET /api/admin/submissions).
 *
 * `SavedConfiguration.userId` and `.companyId` are required foreign keys, so
 * anonymous saves are attached to fixed sentinel identities (created on demand,
 * idempotent). Free-text attribution the user types is stored in `submittedBy`.
 * Products are kept inside `configData` (static demo capability names don't map
 * to real Product rows), so we do NOT create ConfigurationProduct links here.
 *
 * Body: { name?: string, configData: object (required), submittedBy?: string }
 */

// Stable sentinel rows that anonymous submissions hang off of.
const ANON_COMPANY_ID = 'anon-demo-company';
const ANON_USER_ID = 'anon-demo-user';

async function ensureAnonIdentities() {
  await prisma.company.upsert({
    where: { id: ANON_COMPANY_ID },
    update: {},
    create: { id: ANON_COMPANY_ID, name: 'Anonymous Demo Submissions' },
  });
  await prisma.user.upsert({
    where: { id: ANON_USER_ID },
    update: {},
    create: {
      id: ANON_USER_ID,
      email: 'anonymous@demo.caliburn.local',
      name: 'Anonymous (Demo)',
      companyId: ANON_COMPANY_ID,
    },
  });
}

export default withHandler(
  async (req, res) => {
    if (req.method !== 'POST') return methodNotAllowed(res);

    // Public endpoint — best-effort per-instance IP rate limit to blunt abuse.
    assertRateLimit(req, { limit: 20, windowMs: 60_000, bucket: 'public-submissions' });

    const { name, configData, submittedBy } = req.body ?? {};

    if (!configData || typeof configData !== 'object') {
      return badRequest(res, 'configData is required');
    }
    if (name != null && String(name).length > 300) {
      return badRequest(res, 'name is too long (max 300)');
    }
    if (submittedBy != null && String(submittedBy).length > 320) {
      return badRequest(res, 'submittedBy is too long (max 320)');
    }

    await ensureAnonIdentities();

    const config = await prisma.savedConfiguration.create({
      data: {
        userId: ANON_USER_ID,
        companyId: ANON_COMPANY_ID,
        name: name ? String(name) : null,
        submittedBy: submittedBy ? String(submittedBy) : null,
        configData,
      },
      select: { id: true, createdAt: true },
    });

    return created(res, { id: config.id, createdAt: config.createdAt });
  },
  { auth: 'none' }
);
