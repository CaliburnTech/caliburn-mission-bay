import prisma from '../_lib/db.js';
import { withHandler } from '../_lib/handler.js';
import { encryptSecret, decryptSecret } from '../_lib/crypto.js';
import { ok, badRequest, forbidden, methodNotAllowed } from '../_lib/respond.js';

/**
 * GET    /api/company/anthropic-key — { configured, last4 }
 * PUT    /api/company/anthropic-key — body { apiKey }; stores it AES-256-GCM
 *        encrypted on the company row. Returns { configured: true, last4 }.
 * DELETE /api/company/anthropic-key — clears the key. { configured: false }
 *
 * Seller-only, and additionally restricted to company OWNER / ADMIN roles.
 * The plaintext key is never returned or logged — only its last 4 chars.
 */

const KEY_PREFIX = 'sk-ant-';
const KEY_MIN_LENGTH = 20;
const KEY_MAX_LENGTH = 300;

const last4Of = (encrypted) => {
  try {
    return decryptSecret(encrypted).slice(-4);
  } catch (err) {
    console.error('[company/anthropic-key] could not decrypt stored key:', err.message);
    return null;
  }
};

export default withHandler(
  async (req, res, auth) => {
    if (auth.role !== 'OWNER' && auth.role !== 'ADMIN') {
      return forbidden(res, 'Only company owners or admins can manage the API key');
    }

    const companyId = auth.effectiveCompanyId;

    if (req.method === 'GET') {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { anthropicKeyEnc: true },
      });
      const enc = company?.anthropicKeyEnc ?? null;
      return ok(res, { configured: Boolean(enc), last4: enc ? last4Of(enc) : null });
    }

    if (req.method === 'PUT') {
      const apiKey = typeof req.body?.apiKey === 'string' ? req.body.apiKey.trim() : '';
      if (
        !apiKey.startsWith(KEY_PREFIX) ||
        apiKey.length < KEY_MIN_LENGTH ||
        apiKey.length > KEY_MAX_LENGTH
      ) {
        return badRequest(res, "That doesn't look like an Anthropic API key (expected sk-ant-...)");
      }

      await prisma.company.update({
        where: { id: companyId },
        data: { anthropicKeyEnc: encryptSecret(apiKey) },
      });
      return ok(res, { configured: true, last4: apiKey.slice(-4) });
    }

    if (req.method === 'DELETE') {
      await prisma.company.update({
        where: { id: companyId },
        data: { anthropicKeyEnc: null },
      });
      return ok(res, { configured: false });
    }

    return methodNotAllowed(res);
  },
  { auth: 'seller' }
);
