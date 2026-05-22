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
 * NOTE: User.cognitoSub stores the Supabase user UUID. The column will be
 * renamed to authId in a future migration once all streams are merged.
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

  if (type === 'INSERT' || type === 'UPDATE') {
    try {
      const { id, email, raw_user_meta_data } = record;
      const name = raw_user_meta_data?.name ||
                   raw_user_meta_data?.full_name ||
                   null;
      const isCaliburnStaff = typeof email === 'string' &&
                              email.endsWith(`@${CALIBURN_DOMAIN}`);

      await prisma.user.upsert({
        where: { cognitoSub: id },
        update: { email, name },
        create: {
          cognitoSub: id,
          email,
          name,
          role: isCaliburnStaff ? 'ADMIN' : 'MEMBER',
          onboardingComplete: isCaliburnStaff,
        },
      });
    } catch (err) {
      return serverError(res, err);
    }
  }

  return ok(res, { received: true });
}
