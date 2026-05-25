import { createClient } from '@supabase/supabase-js';
import prisma from '../../../_lib/db.js';
import { requireCaliburnAdmin, handleAuthError } from '../../../_lib/auth.js';
import { ok, notFound, serverError, methodNotAllowed } from '../../../_lib/respond.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res);

  let admin;
  try {
    admin = await requireCaliburnAdmin(req);
  } catch (err) {
    if (handleAuthError(err, res)) return;
    return serverError(res, err);
  }

  const { id } = req.query;

  const user = await prisma.user.findUnique({ where: { id }, select: { email: true } });
  if (!user) return notFound(res);

  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  await supabaseAdmin.auth.admin.generateLink({ type: 'recovery', email: user.email });

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
}
