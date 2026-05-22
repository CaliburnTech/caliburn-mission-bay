import type { PostConfirmationTriggerEvent } from 'aws-lambda';
import { prisma } from '../../lib/prisma';
import { isSuperAdmin } from '../../lib/superadmin';

export const handler = async (
  event: PostConfirmationTriggerEvent,
): Promise<PostConfirmationTriggerEvent> => {
  const attrs = event.request.userAttributes;
  const sub = attrs.sub;
  const email = attrs.email ?? '';

  // Parse identities from the Cognito attribute (JSON-encoded string).
  let identities: Array<{ providerName: string; userId: string }> = [];
  try {
    if (attrs['identities']) {
      identities = JSON.parse(attrs['identities']) as typeof identities;
    }
  } catch {
    // Non-federated users have no identities — that is expected.
  }

  const jwtLike = { sub, email, identities };
  const isAdmin = isSuperAdmin(jwtLike);

  if (isAdmin) {
    // Caliburn super-admins: create a User with no Company attachment.
    await prisma.user.upsert({
      where: { cognitoSub: sub },
      update: {},
      create: {
        cognitoSub: sub,
        email,
        role: 'OWNER',
        status: 'ACTIVE',
        companyId: null,
      },
    });
    return event;
  }

  // External user: create a Company (PENDING_APPROVAL) then the OWNER User.
  // Same-domain signups intentionally become a new pending Company — no auto-attach.
  const company = await prisma.company.create({
    data: {
      name: email, // Temporary — updated when the company completes its profile.
      status: 'PENDING_APPROVAL',
    },
  });

  await prisma.user.create({
    data: {
      cognitoSub: sub,
      email,
      role: 'OWNER',
      status: 'ACTIVE',
      companyId: company.id,
    },
  });

  // AuditLog: record the new signup so Caliburn can see pending approvals.
  await prisma.auditLog.create({
    data: {
      actorType: 'USER',
      actorEmail: email,
      targetCompanyId: company.id,
      action: 'company.pending_approval',
      targetType: 'COMPANY',
      targetId: company.id,
      metadata: { email, cognitoSub: sub },
    },
  });

  // EventBridge emission for the SES notification to the Caliburn review team is handled
  // by a separate EventBridge consumer Lambda — this trigger only owns DB writes.

  return event;
};
