import prisma from '../../_lib/db.js';
import { withHandler } from '../../_lib/handler.js';
import { requireCaliburnAdmin } from '../../_lib/auth.js';
import { assertRateLimit } from '../../_lib/rateLimit.js';
import { sendVendorApplicationReceived } from '../../_lib/email.js';
import { ok, created, badRequest, methodNotAllowed } from '../../_lib/respond.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * GET  /api/admin/applications  — list all vendor applications (admin only)
 * POST /api/admin/applications  — submit a new vendor application (public,
 *                                 rate-limited, validated)
 */
export default withHandler(
  async (req, res) => {
    if (req.method === 'POST') {
      // Public endpoint — rate limit by IP (best-effort, per instance).
      assertRateLimit(req, { limit: 5, windowMs: 60_000, bucket: 'vendor-applications' });

      const { companyName, contactName, email, website, message } = req.body ?? {};

      if (!companyName?.trim() || !contactName?.trim() || !email?.trim()) {
        return badRequest(res, 'companyName, contactName, and email are required');
      }
      if (!EMAIL_RE.test(email.trim()) || email.trim().length > 320) {
        return badRequest(res, 'A valid email address is required');
      }
      if (companyName.trim().length > 200) return badRequest(res, 'companyName is too long (max 200)');
      if (contactName.trim().length > 200) return badRequest(res, 'contactName is too long (max 200)');
      if (website != null && String(website).length > 500) return badRequest(res, 'website is too long (max 500)');
      if (message != null && String(message).length > 5000) return badRequest(res, 'message is too long (max 5000)');

      const application = await prisma.vendorApplication.create({
        data: {
          companyName: companyName.trim(),
          contactName: contactName.trim(),
          email: email.trim(),
          website: website ? String(website) : null,
          message: message ? String(message) : null,
        },
      });

      sendVendorApplicationReceived({
        companyName: companyName.trim(),
        contactName: contactName.trim(),
        contactEmail: email.trim(),
      }).catch((err) => console.error('[applications] notify email failed:', err));

      return created(res, application);
    }

    if (req.method === 'GET') {
      // Admin-only listing — errors carry .status and are mapped by withHandler.
      await requireCaliburnAdmin(req);

      const { status } = req.query;
      const applications = await prisma.vendorApplication.findMany({
        where: status ? { status } : undefined,
        orderBy: { createdAt: 'desc' },
      });
      return ok(res, applications);
    }

    return methodNotAllowed(res);
  },
  { auth: 'none' }
);
