import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { prisma } from '../../lib/prisma';
import { getAuthContext } from '../../lib/auth';
import { ok, forbidden, notFound, badRequest, serverError } from '../../lib/response';

// POST /admin/companies/:id/approve
export const approveCompany = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    const auth = getAuthContext(event);
    if (!auth.isSuperAdmin) return forbidden('Super-admin required');

    const companyId = event.pathParameters?.id;
    if (!companyId) return badRequest('Company ID required');

    const body = event.body ? (JSON.parse(event.body) as { notes?: string }) : {};

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) return notFound('Company not found');

    const actor = await prisma.user.findUnique({ where: { id: auth.userId } });
    const actorEmail = actor?.email ?? '';

    await prisma.company.update({
      where: { id: companyId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedByEmail: actorEmail,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorType: 'SUPERADMIN',
        actorUserId: auth.userId,
        actorEmail,
        targetCompanyId: companyId,
        action: 'company.approved',
        targetType: 'COMPANY',
        targetId: companyId,
        impersonationSessionId: auth.impersonationSessionId ?? null,
        metadata: body.notes ? { notes: body.notes } : undefined,
      },
    });

    // EventBridge emission for the welcome SES email is consumed by a separate Lambda.

    return ok({ companyId, status: 'APPROVED' });
  } catch (e) {
    return serverError(e);
  }
};
