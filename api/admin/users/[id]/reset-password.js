import { createClient } from '@supabase/supabase-js';
import prisma from '../../../_lib/db.js';
import { withHandler } from '../../../_lib/handler.js';
import { isEmailEnabled, sendPasswordReset } from '../../../_lib/email.js';
import { ok, notFound, methodNotAllowed } from '../../../_lib/respond.js';

/**
 * POST /api/admin/users/:id/reset-password
 * Generates a Supabase recovery link for the user and emails it via Resend.
 */
export default withHandler(
  async (req, res, admin) => {
    if (req.method !== 'POST') return methodNotAllowed(res);

    const { id } = req.query;

    const user = await prisma.user.findUnique({ where: { id }, select: { email: true } });
    if (!user) return notFound(res);

    // Without a Resend key the recovery link would be generated and then
    // silently dropped — fail loudly instead.
    if (!isEmailEnabled()) {
      return ok(res, {
        sent: false,
        error: 'RESEND_API_KEY is not configured — password reset email cannot be sent',
      });
    }

    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } },
    );

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: user.email,
    });

    if (error || !data?.properties?.action_link) {
      console.error('[reset-password] generateLink failed:', error?.message);
      return res.status(502).json({ sent: false, error: 'Failed to generate recovery link' });
    }

    await sendPasswordReset({ to: user.email, actionLink: data.properties.action_link });

    await prisma.auditLog.create({
      data: {
        actorType: 'SUPERADMIN',
        actorEmail: admin.email,
        targetUserId: id,
        action: 'PASSWORD_RESET',
        targetType: 'USER',
        targetId: id,
      },
    });

    return ok(res, { sent: true });
  },
  { auth: 'admin' }
);
