import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  AdminUserGlobalSignOutCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { prisma } from '../../lib/prisma';
import { getAuthContext } from '../../lib/auth';
import { ok, forbidden, notFound, badRequest, serverError } from '../../lib/response';

const cognito = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID ?? '';

interface BanBody {
  banType: 'SOFT' | 'HARD';
  reason: string;
}

// POST /admin/companies/:id/ban
export const banCompany = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    const auth = getAuthContext(event);
    if (!auth.isSuperAdmin) return forbidden('Super-admin required');

    const companyId = event.pathParameters?.id;
    if (!companyId) return badRequest('Company ID required');
    if (!event.body) return badRequest('Request body required');

    const { banType, reason } = JSON.parse(event.body) as BanBody;
    if (banType !== 'SOFT' && banType !== 'HARD') return badRequest('banType must be SOFT or HARD');
    if (!reason?.trim()) return badRequest('reason is required');

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { users: true },
    });
    if (!company) return notFound('Company not found');

    const actor = await prisma.user.findUnique({ where: { id: auth.userId } });
    const actorEmail = actor?.email ?? '';
    const now = new Date();

    await prisma.company.update({
      where: { id: companyId },
      data: {
        status: 'BANNED',
        lastBanType: banType,
        bannedAt: now,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorType: 'SUPERADMIN',
        actorUserId: auth.userId,
        actorEmail,
        targetCompanyId: companyId,
        action: banType === 'SOFT' ? 'company.banned.soft' : 'company.banned.hard',
        targetType: 'COMPANY',
        targetId: companyId,
        impersonationSessionId: auth.impersonationSessionId ?? null,
        metadata: { reason, banType },
      },
    });

    if (banType === 'HARD') {
      // Hard ban: Cognito global sign-out for every company user + add their JTIs to deny-list.
      // Access tokens expire in 15 min max, so the deny-list ensures immediate cutoff.
      const accessTokenTtlMs = 15 * 60 * 1000;
      const expiresAt = new Date(now.getTime() + accessTokenTtlMs);

      await Promise.all(
        company.users
          .filter((u) => u.authId !== null)
          .map(async (user) => {
            try {
              await cognito.send(
                new AdminUserGlobalSignOutCommand({
                  UserPoolId: USER_POOL_ID,
                  Username: user.authId!,
                }),
              );
            } catch (cognitoErr) {
              console.error(`Cognito sign-out failed for ${user.authId}:`, cognitoErr);
            }

            // Deny-list entry keyed on the user's sub — authorizer checks by userId field too.
            await prisma.sessionDenyList.upsert({
              where: { jwtJti: `sub:${user.authId}` },
              update: { expiresAt },
              create: {
                jwtJti: `sub:${user.authId}`,
                userId: user.id,
                reason: 'hard_ban',
                expiresAt,
              },
            });
          }),
      );

      await prisma.auditLog.create({
        data: {
          actorType: 'SUPERADMIN',
          actorUserId: auth.userId,
          actorEmail,
          targetCompanyId: companyId,
          action: 'company.sessions_revoked',
          targetType: 'COMPANY',
          targetId: companyId,
          metadata: { userCount: company.users.length },
        },
      });
    }

    return ok({ companyId, status: 'BANNED', banType });
  } catch (e) {
    return serverError(e);
  }
};

// POST /admin/companies/:id/unban
export const unbanCompany = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    const auth = getAuthContext(event);
    if (!auth.isSuperAdmin) return forbidden('Super-admin required');

    const companyId = event.pathParameters?.id;
    if (!companyId) return badRequest('Company ID required');

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) return notFound('Company not found');
    if (company.status !== 'BANNED') return badRequest('Company is not banned');

    // Hard unban requires the caller to have explicitly removed deny-list entries first
    // (two-step safeguard against accidentally reactivating a hard-banned account).
    if (company.lastBanType === 'HARD') {
      const users = await prisma.user.findMany({ where: { companyId } });
      const subs = users
        .map((u) => `sub:${u.authId}`)
        .filter((s) => s !== 'sub:null');
      const activeEntries = await prisma.sessionDenyList.findMany({
        where: { jwtJti: { in: subs } },
      });
      if (activeEntries.length > 0) {
        return forbidden(
          'Hard-ban unban requires manual deny-list removal first. ' +
            `${activeEntries.length} active entries remain.`,
        );
      }
    }

    const actor = await prisma.user.findUnique({ where: { id: auth.userId } });
    const actorEmail = actor?.email ?? '';

    await prisma.company.update({
      where: { id: companyId },
      data: { status: 'APPROVED', lastBanType: null },
    });

    await prisma.auditLog.create({
      data: {
        actorType: 'SUPERADMIN',
        actorUserId: auth.userId,
        actorEmail,
        targetCompanyId: companyId,
        action: 'company.unbanned',
        targetType: 'COMPANY',
        targetId: companyId,
        impersonationSessionId: auth.impersonationSessionId ?? null,
      },
    });

    return ok({ companyId, status: 'APPROVED' });
  } catch (e) {
    return serverError(e);
  }
};
