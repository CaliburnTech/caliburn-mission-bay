import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { prisma } from '../../lib/prisma';
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

// ── Helpers ───────────────────────────────────────────────────────────────────

const getOwnProduct = async (id: string, companyId: string) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.companyId !== companyId) return null;
  return product;
};

// Pre-approval access: PENDING_APPROVAL companies can only see their own drafts.
const buildCatalogWhere = (auth: ReturnType<typeof getAuthContext>) => {
  if (auth.isSuperAdmin) return {};
  return {
    OR: [
      { status: 'APPROVED' as const },
      { companyId: auth.companyId },
    ],
  };
};

// ── Routes ────────────────────────────────────────────────────────────────────

// GET /catalog
const listCatalog = async (auth: ReturnType<typeof getAuthContext>) => {
  const where = buildCatalogWhere(auth);
  const products = await prisma.product.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: {
      company: { select: { id: true, name: true, logoUrl: true } },
      _count: { select: { events: true, leads: true } },
    },
  });
  return ok(products);
};

// GET /catalog/:id
const getCatalogItem = async (id: string, auth: ReturnType<typeof getAuthContext>) => {
  const where = buildCatalogWhere(auth);
  const product = await prisma.product.findFirst({
    where: { id, ...where },
    include: {
      company: { select: { id: true, name: true, logoUrl: true } },
      versions: { orderBy: { versionNumber: 'desc' }, take: 1 },
    },
  });
  if (!product) return notFound();
  return ok(product);
};

// GET /catalog/mine — vendor's own products
const listMine = async (companyId: string) => {
  const products = await prisma.product.findMany({
    where: { companyId },
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { events: true, leads: true } } },
  });
  return ok(products);
};

// POST /catalog
const createProduct = async (
  auth: ReturnType<typeof getAuthContext>,
  body: Record<string, unknown>,
) => {
  if (!auth.companyId) return forbidden('No company associated with this account');

  const { type, name, description, category, trlLevel } = body;

  if (!['PLATFORM', 'CAPABILITY'].includes(type as string)) {
    return badRequest('type must be PLATFORM or CAPABILITY');
  }
  if (!(name as string)?.trim()) return badRequest('name is required');

  const product = await prisma.product.create({
    data: {
      companyId: auth.companyId,
      type: type as 'PLATFORM' | 'CAPABILITY',
      name: (name as string).trim(),
      description: (description as string) ?? undefined,
      category: (category as string) ?? undefined,
      trlLevel: trlLevel ? parseInt(trlLevel as string) : undefined,
      status: 'DRAFT',
    },
  });
  return created(product);
};

// PUT /catalog/:id
const updateProduct = async (
  id: string,
  auth: ReturnType<typeof getAuthContext>,
  body: Record<string, unknown>,
) => {
  if (!auth.companyId) return forbidden('No company associated with this account');

  const product = await getOwnProduct(id, auth.companyId);
  if (!product) return notFound();
  if (product.status === 'ARCHIVED') return badRequest('Archived products cannot be edited');

  const { name, description, category, trlLevel } = body;
  if (!(name as string)?.trim()) return badRequest('name is required');

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: (name as string).trim(),
      description: (description as string | undefined) ?? undefined,
      category: (category as string | undefined) ?? undefined,
      trlLevel: trlLevel ? parseInt(trlLevel as string) : undefined,
    },
  });
  return ok(updated);
};

// DELETE /catalog/:id — archive
const archiveProduct = async (id: string, auth: ReturnType<typeof getAuthContext>) => {
  if (!auth.companyId) return forbidden('No company associated with this account');

  const product = await getOwnProduct(id, auth.companyId);
  if (!product) return notFound();

  await prisma.product.update({ where: { id }, data: { status: 'ARCHIVED' } });
  return ok({ archived: true });
};

// POST /catalog/:id/submit — DRAFT → IN_REVIEW
const submitProduct = async (id: string, auth: ReturnType<typeof getAuthContext>) => {
  if (!auth.companyId) return forbidden('No company associated with this account');

  const product = await getOwnProduct(id, auth.companyId);
  if (!product) return notFound();
  if (product.status !== 'DRAFT') {
    return badRequest(`Cannot submit a product with status: ${product.status}`);
  }

  const updated = await prisma.product.update({ where: { id }, data: { status: 'IN_REVIEW' } });
  return ok(updated);
};

// POST /catalog/:id/publish — create new ProductVersion, notify buyers
const publishProduct = async (
  id: string,
  auth: ReturnType<typeof getAuthContext>,
  body: Record<string, unknown>,
) => {
  if (!auth.companyId) return forbidden('No company associated with this account');

  // Pre-approval guard: PENDING_APPROVAL companies cannot publish
  const company = await prisma.company.findUnique({ where: { id: auth.companyId } });
  if (company?.status === 'PENDING_APPROVAL') {
    return forbidden('Account pending approval — can only save drafts');
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } },
  });
  if (!product || product.companyId !== auth.companyId) return notFound();
  if (product.status !== 'APPROVED') {
    return badRequest('Only APPROVED products can be published');
  }

  const { changelog } = body;
  const prevVersionNumber = product.versions[0]?.versionNumber ?? 0;
  const nextVersionNumber = prevVersionNumber + 1;

  const newVersion = await prisma.productVersion.create({
    data: {
      productId: id,
      versionNumber: nextVersionNumber,
      data: {
        name: product.name,
        description: product.description,
        category: product.category,
        trlLevel: product.trlLevel,
        type: product.type,
      },
      changelog: (changelog as string) ?? undefined,
      publishedById: auth.userId,
    },
  });

  await prisma.product.update({ where: { id }, data: { currentVersionId: newVersion.id } });

  // Update saved configs pointing at the previous version and notify buyers
  if (prevVersionNumber > 0) {
    const prevVersion = product.versions[0];

    const affected = await prisma.configurationProduct.findMany({
      where: { productId: id, productVersionId: prevVersion.id },
      include: { config: { include: { user: true } } },
    });

    await Promise.all(
      affected.map(async (cp) => {
        await prisma.configurationProduct.update({
          where: { configId_productId: { configId: cp.configId, productId: id } },
          data: { productVersionId: newVersion.id },
        });
        await prisma.savedConfiguration.update({
          where: { id: cp.configId },
          data: { updatedAt: new Date() },
        });

        if (cp.config.user?.email) {
          const { notifyConfigUpdated } = await import('../../lib/ses');
          await notifyConfigUpdated({
            buyerEmail: cp.config.user.email,
            productName: product.name,
            configName: cp.config.name ?? 'Unnamed configuration',
          }).catch(console.error);
        }
      }),
    );
  }

  return ok({ version: newVersion, updatedConfigs: true });
};

// GET /catalog/:id/stats — 30-day metrics
const getProductStats = async (id: string, auth: ReturnType<typeof getAuthContext>) => {
  if (!auth.companyId) return forbidden('No company associated with this account');

  const product = await getOwnProduct(id, auth.companyId);
  if (!product) return notFound();

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [views, configures, leads] = await Promise.all([
    prisma.event.count({ where: { productId: id, type: 'VIEW', createdAt: { gte: since } } }),
    prisma.event.count({ where: { productId: id, type: 'CONFIGURE', createdAt: { gte: since } } }),
    prisma.lead.count({ where: { productId: id, createdAt: { gte: since } } }),
  ]);

  return ok({ views, configurations: configures, leads, period: '30d' });
};

// GET /catalog/:id/leads — vendor's interested buyers
const getProductLeads = async (id: string, auth: ReturnType<typeof getAuthContext>) => {
  if (!auth.companyId) return forbidden('No company associated with this account');

  const product = await getOwnProduct(id, auth.companyId);
  if (!product) return notFound();

  const leads = await prisma.lead.findMany({
    where: { productId: id },
    orderBy: { createdAt: 'desc' },
  });
  return ok(leads);
};

// GET /catalog/:id/configs — SBOM view: configs that include this product
const getProductConfigs = async (id: string, auth: ReturnType<typeof getAuthContext>) => {
  if (!auth.companyId) return forbidden('No company associated with this account');

  const product = await getOwnProduct(id, auth.companyId);
  if (!product) return notFound();

  const configProducts = await prisma.configurationProduct.findMany({
    where: { productId: id },
    include: {
      config: {
        include: {
          products: {
            include: { product: { select: { id: true, name: true, type: true, category: true } } },
          },
        },
      },
    },
    orderBy: { config: { updatedAt: 'desc' } },
    take: 20,
  });

  const summaries = configProducts.map((cp) => ({
    configId: cp.configId,
    configName: cp.config.name,
    coProducts: cp.config.products
      .filter((p) => p.productId !== id)
      .map((p) => p.product),
  }));

  return ok(summaries);
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

    // /catalog/mine
    if (method === 'GET' && path === '/catalog/mine') {
      return await listMine(auth.companyId);
    }

    // /catalog (collection)
    if (path === '/catalog') {
      if (method === 'GET') return await listCatalog(auth);
      if (method === 'POST') return await createProduct(auth, body);
      return methodNotAllowed();
    }

    // /catalog/:id sub-routes
    const subMatch = path.match(/^\/catalog\/([^/]+)\/([^/]+)$/);
    if (subMatch) {
      const [, id, sub] = subMatch;
      if (method === 'POST' && sub === 'submit') return await submitProduct(id, auth);
      if (method === 'POST' && sub === 'publish') return await publishProduct(id, auth, body);
      if (method === 'GET' && sub === 'stats') return await getProductStats(id, auth);
      if (method === 'GET' && sub === 'leads') return await getProductLeads(id, auth);
      if (method === 'GET' && sub === 'configs') return await getProductConfigs(id, auth);
      return notFound();
    }

    // /catalog/:id
    const itemMatch = path.match(/^\/catalog\/([^/]+)$/);
    if (itemMatch) {
      const [, id] = itemMatch;
      if (method === 'GET') return await getCatalogItem(id, auth);
      if (method === 'PUT') return await updateProduct(id, auth, body);
      if (method === 'DELETE') return await archiveProduct(id, auth);
      return methodNotAllowed();
    }

    return notFound();
  } catch (e) {
    return serverError(e);
  }
};
