import prisma from '../../_lib/db.js';
import { withHandler } from '../../_lib/handler.js';
import { ok, created, badRequest, methodNotAllowed } from '../../_lib/respond.js';

/**
 * GET  /api/admin/companies — list companies (filter by status / search)
 * POST /api/admin/companies — white-glove create a vendor company.
 *
 * White-glove creation exists so Caliburn can list real, certified vendors
 * (and their products) on their behalf before those vendors ever sign up.
 * The company is created directly in APPROVED state with isSeller=true and
 * the action is audit-logged to the creating super-admin. When the vendor
 * later signs up with a matching email domain, their root user can be
 * attached to this company instead of creating a duplicate.
 */
export default withHandler(
  async (req, res, admin) => {
    if (req.method === 'GET') {
      const { status, search } = req.query;

      const where = {};

      if (status) {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      const companies = await prisma.company.findMany({
        where,
        include: { _count: { select: { users: true } } },
        orderBy: { createdAt: 'desc' },
      });

      return ok(res, { companies });
    }

    if (req.method === 'POST') {
      const { name, email, website, description } = req.body ?? {};

      if (!name?.trim()) return badRequest(res, 'name is required');
      const trimmedName = name.trim().slice(0, 200);

      const existing = await prisma.company.findFirst({
        where: { name: { equals: trimmedName, mode: 'insensitive' } },
      });
      if (existing) {
        return badRequest(res, `A company named "${existing.name}" already exists`);
      }

      const now = new Date();
      const company = await prisma.company.create({
        data: {
          name: trimmedName,
          email: email?.trim() || null,
          website: website?.trim() || null,
          description: description?.trim() || null,
          isSeller: true,
          status: 'APPROVED',
          approvedAt: now,
          approvedByEmail: admin.email,
        },
      });

      await prisma.auditLog.create({
        data: {
          actorType: 'SUPERADMIN',
          actorEmail: admin.email,
          targetCompanyId: company.id,
          action: 'COMPANY_CREATED_WHITE_GLOVE',
          targetType: 'COMPANY',
          targetId: company.id,
          metadata: { name: company.name },
        },
      });

      return created(res, { company });
    }

    return methodNotAllowed(res);
  },
  { auth: 'admin' }
);
