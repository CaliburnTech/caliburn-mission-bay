import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { prisma } from '../../lib/prisma';
import { notifyVendorApplication } from '../../lib/ses';
import { getAuthContext } from '../../lib/auth';
import {
  ok,
  created,
  badRequest,
  forbidden,
  notFound,
  methodNotAllowed,
  serverError,
} from '../../lib/response';

const VALID_GARAGE_STATUSES = [
  'SAVED',
  'PURCHASE_REQUESTED',
  'IN_PROCUREMENT',
  'CONTRACTED',
  'DELIVERED',
] as const;

// Super-admin guard: @caliburn.us email derives isSuperAdmin in the Lambda Authorizer.
const requireSuperAdmin = (auth: ReturnType<typeof getAuthContext>) => {
  if (!auth.isSuperAdmin) return forbidden('Admin access requires a @caliburn.us account');
  return null;
};

// ── Vendor Applications ───────────────────────────────────────────────────────

// GET /admin/applications[?status=PENDING]
const listApplications = async (
  auth: ReturnType<typeof getAuthContext>,
  status?: string,
) => {
  const guard = requireSuperAdmin(auth);
  if (guard) return guard;

  const applications = await prisma.vendorApplication.findMany({
    where: status ? { status: status as 'PENDING' | 'APPROVED' | 'DENIED' } : undefined,
    orderBy: { createdAt: 'desc' },
  });
  return ok(applications);
};

// POST /admin/applications — public, no auth required
const submitApplication = async (body: Record<string, unknown>) => {
  const { companyName, contactName, email, website, message } = body;

  if (
    !(companyName as string)?.trim() ||
    !(contactName as string)?.trim() ||
    !(email as string)?.trim()
  ) {
    return badRequest('companyName, contactName, and email are required');
  }

  const application = await prisma.vendorApplication.create({
    data: {
      companyName: (companyName as string).trim(),
      contactName: (contactName as string).trim(),
      email: (email as string).trim(),
      website: (website as string) ?? undefined,
      message: (message as string) ?? undefined,
    },
  });

  await notifyVendorApplication({
    companyName: (companyName as string).trim(),
    contactName: (contactName as string).trim(),
    contactEmail: (email as string).trim(),
  }).catch(console.error);

  return created(application);
};

// POST /admin/applications/:id/approve
const approveApplication = async (
  id: string,
  auth: ReturnType<typeof getAuthContext>,
) => {
  const guard = requireSuperAdmin(auth);
  if (guard) return guard;

  const application = await prisma.vendorApplication.findUnique({ where: { id } });
  if (!application) return notFound();
  if (application.status !== 'PENDING') {
    return badRequest(`Application is already ${application.status}`);
  }

  const company = application.companyId
    ? await prisma.company.update({
        where: { id: application.companyId },
        data: { status: 'APPROVED', isSeller: true },
      })
    : await prisma.company.create({
        data: { name: application.companyName, status: 'APPROVED', isSeller: true },
      });

  const updated = await prisma.vendorApplication.update({
    where: { id },
    data: {
      status: 'APPROVED',
      reviewedBy: auth.userId,
      reviewedAt: new Date(),
      companyId: company.id,
    },
  });

  return ok({ application: updated, company });
};

// POST /admin/applications/:id/deny
const denyApplication = async (
  id: string,
  auth: ReturnType<typeof getAuthContext>,
) => {
  const guard = requireSuperAdmin(auth);
  if (guard) return guard;

  const application = await prisma.vendorApplication.findUnique({ where: { id } });
  if (!application) return notFound();
  if (application.status !== 'PENDING') {
    return badRequest(`Application is already ${application.status}`);
  }

  const updated = await prisma.vendorApplication.update({
    where: { id },
    data: { status: 'DENIED', reviewedBy: auth.userId, reviewedAt: new Date() },
  });
  return ok(updated);
};

// ── Product Review ─────────────────────────────────────────────────────────────

// GET /admin/products — all products IN_REVIEW
const listProductsInReview = async (auth: ReturnType<typeof getAuthContext>) => {
  const guard = requireSuperAdmin(auth);
  if (guard) return guard;

  const products = await prisma.product.findMany({
    where: { status: 'IN_REVIEW' },
    include: { company: { select: { id: true, name: true } } },
    orderBy: { updatedAt: 'asc' },
  });
  return ok(products);
};

// POST /admin/products/:id/approve — IN_REVIEW → APPROVED
const approveProduct = async (
  id: string,
  auth: ReturnType<typeof getAuthContext>,
) => {
  const guard = requireSuperAdmin(auth);
  if (guard) return guard;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return notFound();
  if (product.status !== 'IN_REVIEW') {
    return badRequest(`Product status is ${product.status}, expected IN_REVIEW`);
  }

  const updated = await prisma.product.update({ where: { id }, data: { status: 'APPROVED' } });
  return ok(updated);
};

// POST /admin/products/:id/reject — IN_REVIEW → DRAFT
const rejectProduct = async (
  id: string,
  auth: ReturnType<typeof getAuthContext>,
) => {
  const guard = requireSuperAdmin(auth);
  if (guard) return guard;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return notFound();
  if (product.status !== 'IN_REVIEW') {
    return badRequest(`Product status is ${product.status}, expected IN_REVIEW`);
  }

  const updated = await prisma.product.update({ where: { id }, data: { status: 'DRAFT' } });
  return ok(updated);
};

// ── Garage Admin ──────────────────────────────────────────────────────────────

// PUT /admin/garage/:id/status — manually advance a garage item through procurement
const updateGarageStatus = async (
  id: string,
  auth: ReturnType<typeof getAuthContext>,
  body: Record<string, unknown>,
) => {
  const guard = requireSuperAdmin(auth);
  if (guard) return guard;

  const { status, notes } = body;

  if (!VALID_GARAGE_STATUSES.includes(status as (typeof VALID_GARAGE_STATUSES)[number])) {
    return badRequest(`status must be one of: ${VALID_GARAGE_STATUSES.join(', ')}`);
  }

  const item = await prisma.garageItem.findUnique({ where: { id } });
  if (!item) return notFound();

  const updated = await prisma.garageItem.update({
    where: { id },
    data: {
      status: status as (typeof VALID_GARAGE_STATUSES)[number],
      ...(notes !== undefined ? { notes: notes as string } : {}),
    },
  });
  return ok(updated);
};

// ── Handler ───────────────────────────────────────────────────────────────────

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    const auth = getAuthContext(event);
    const method = event.requestContext.http.method;
    const path = event.rawPath;
    const body = event.body ? (JSON.parse(event.body) as Record<string, unknown>) : {};
    const qs = event.queryStringParameters ?? {};

    // /admin/applications
    if (path === '/admin/applications') {
      if (method === 'GET') return await listApplications(auth, qs.status);
      if (method === 'POST') return await submitApplication(body);
      return methodNotAllowed();
    }

    // /admin/applications/:id/approve|deny
    const appMatch = path.match(/^\/admin\/applications\/([^/]+)\/(approve|deny)$/);
    if (appMatch) {
      const [, id, action] = appMatch;
      if (method !== 'POST') return methodNotAllowed();
      if (action === 'approve') return await approveApplication(id, auth);
      if (action === 'deny') return await denyApplication(id, auth);
    }

    // /admin/products
    if (path === '/admin/products') {
      if (method === 'GET') return await listProductsInReview(auth);
      return methodNotAllowed();
    }

    // /admin/products/:id/approve|reject
    const prodMatch = path.match(/^\/admin\/products\/([^/]+)\/(approve|reject)$/);
    if (prodMatch) {
      const [, id, action] = prodMatch;
      if (method !== 'POST') return methodNotAllowed();
      if (action === 'approve') return await approveProduct(id, auth);
      if (action === 'reject') return await rejectProduct(id, auth);
    }

    // /admin/garage/:id/status
    const garageMatch = path.match(/^\/admin\/garage\/([^/]+)\/status$/);
    if (garageMatch) {
      const [, id] = garageMatch;
      if (method !== 'PUT') return methodNotAllowed();
      return await updateGarageStatus(id, auth, body);
    }

    return notFound();
  } catch (e) {
    return serverError(e);
  }
};
