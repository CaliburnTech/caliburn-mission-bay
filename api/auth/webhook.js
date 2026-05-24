import { timingSafeEqual } from 'crypto';
import prisma from '../_lib/db.js';
import { ok, badRequest, serverError } from '../_lib/respond.js';

const CALIBURN_DOMAIN = 'caliburn.us';

/**
 * POST /api/auth/webhook
 * Supabase database webhook — syncs auth.users INSERT/UPDATE events to the DB.
 *
 * Configure in Supabase Dashboard → Database → Webhooks:
 *   Table: auth.users  |  Events: INSERT, UPDATE  |  URL: <this endpoint>
 *   HTTP Header: x-webhook-secret: <SUPABASE_WEBHOOK_SECRET>
 *
 * INSERT: creates a Company (PENDING_APPROVAL) and an OWNER User linked to it.
 * UPDATE: syncs mutable profile fields on the existing User row.
 *
 * Note: @caliburn.us accounts are treated as super-admins at JWT-validation time
 * (derived from email domain). There is no isSuperAdmin column in the schema.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Verify shared secret sent as a custom header in the Supabase webhook config
  const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;
  if (webhookSecret) {
    const incoming = req.headers['x-webhook-secret'] ?? '';
    const expected = Buffer.from(webhookSecret);
    const actual = Buffer.from(incoming);
    const valid = actual.length === expected.length &&
      timingSafeEqual(actual, expected);
    if (!valid) return badRequest(res, 'Invalid webhook secret');
  }

  const { type, record } = req.body ?? {};
  if (!record) return badRequest(res, 'Missing record');

  if (type === 'INSERT') {
    const { id: authId, email, raw_user_meta_data } = record;
    const name = raw_user_meta_data?.name || raw_user_meta_data?.full_name || null;
    // Company name placeholder derived from email domain; updated during onboarding.
    const companyName = typeof email === 'string' ? email.split('@')[1] ?? email : 'Unknown';

    try {
      await prisma.$transaction(async (tx) => {
        const company = await tx.company.create({
          data: { name: companyName, status: 'PENDING_APPROVAL' },
        });

        await tx.user.create({
          data: {
            authId,
            email,
            name,
            role: 'OWNER',
            companyId: company.id,
          },
        });
      });
    } catch (err) {
      return serverError(res, err);
    }
  }

  if (type === 'UPDATE') {
    const { id: authId, email, raw_user_meta_data } = record;
    const name = raw_user_meta_data?.name || raw_user_meta_data?.full_name || null;

    try {
      await prisma.user.update({
        where: { authId },
        data: { email, name },
      });
    } catch (err) {
      return serverError(res, err);
    }
  }

  return ok(res, { received: true });
}
