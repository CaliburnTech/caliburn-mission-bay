import { timingSafeEqual } from 'crypto';
import prisma from '../_lib/db.js';
import { withHandler } from '../_lib/handler.js';
import { ok, badRequest, methodNotAllowed } from '../_lib/respond.js';

/**
 * POST /api/auth/webhook
 * Supabase database webhook — syncs auth.users INSERT/UPDATE events to the DB.
 *
 * Configure in Supabase Dashboard → Database → Webhooks:
 *   Table: auth.users  |  Events: INSERT, UPDATE  |  URL: <this endpoint>
 *   HTTP Header: x-webhook-secret: <SUPABASE_WEBHOOK_SECRET>
 *
 * Security: fails CLOSED — if SUPABASE_WEBHOOK_SECRET is unset the endpoint
 * returns 500 rather than accepting unauthenticated writes.
 *
 * INSERT: upserts the User row keyed by authId (idempotent — Supabase may
 *         redeliver). Does NOT create a Company: companies are created only
 *         via /api/auth/complete-onboarding when the user picks SELLER.
 * UPDATE: syncs mutable profile fields; a missing row is a no-op.
 *
 * Note: @caliburn.us accounts are treated as super-admins at JWT-validation
 * time (derived from email domain). There is no isSuperAdmin column.
 */
export default withHandler(
  async (req, res) => {
    if (req.method !== 'POST') return methodNotAllowed(res);

    // Fail closed: without a configured secret we cannot authenticate callers.
    const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[webhook] SUPABASE_WEBHOOK_SECRET is not set — rejecting request');
      return res.status(500).json({ error: 'Webhook not configured' });
    }

    const incoming = String(req.headers['x-webhook-secret'] ?? '');
    const expected = Buffer.from(webhookSecret);
    const actual = Buffer.from(incoming);
    const valid = actual.length === expected.length && timingSafeEqual(actual, expected);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid webhook secret' });
    }

    const { type, record } = req.body ?? {};
    if (!record?.id) return badRequest(res, 'Missing record');

    const { id: authId, email, raw_user_meta_data: meta } = record;
    const name = meta?.name || meta?.full_name || null;

    if (type === 'INSERT') {
      if (!email) return badRequest(res, 'Missing email on record');
      try {
        await prisma.user.upsert({
          where: { authId },
          update: { email, name },
          create: { authId, email, name },
        });
      } catch (err) {
        // Unique email collision: a pre-provisioned row exists without an
        // authId — link it instead of failing the (re)delivery.
        if (err?.code === 'P2002') {
          await prisma.user.update({
            where: { email },
            data: { authId, name },
          });
        } else {
          throw err;
        }
      }
    }

    if (type === 'UPDATE') {
      // updateMany: gracefully no-ops when the row doesn't exist (redelivery
      // ordering, deleted users, etc.).
      await prisma.user.updateMany({
        where: { authId },
        data: { ...(email ? { email } : {}), name },
      });
    }

    return ok(res, { received: true });
  },
  { auth: 'none' }
);
