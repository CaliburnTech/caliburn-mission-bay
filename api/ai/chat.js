import Anthropic from '@anthropic-ai/sdk';
import prisma from '../_lib/db.js';
import { withHandler } from '../_lib/handler.js';
import { decryptSecret } from '../_lib/crypto.js';
import { assertRateLimitKey } from '../_lib/rateLimit.js';
import { ok, badRequest, methodNotAllowed } from '../_lib/respond.js';

/**
 * POST /api/ai/chat — server-side Anthropic proxy.
 *
 * Body: { messages: [{ role: 'user'|'assistant', content: string }], system?: string }
 * Response: { reply: string, usage: { inputTokens, outputTokens } }
 *
 * Key resolution: the caller's company key (Company.anthropicKeyEnc,
 * decrypted server-side) → env ANTHROPIC_API_KEY fallback → 503.
 * The model is fixed server-side; clients cannot choose it. The API key is
 * never logged, echoed, or accepted from the client.
 */

const MODEL = 'claude-sonnet-4-5';
const MAX_TOKENS = 2048;
const MAX_MESSAGES = 50;
const MAX_TOTAL_CONTENT_CHARS = 32_000;
const MAX_SYSTEM_CHARS = 4_000;
const RATE_LIMIT = { limit: 20, windowMs: 60_000, bucket: 'ai-chat' };

function validateBody(body) {
  const { messages, system } = body ?? {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return 'messages must be a non-empty array';
  }
  if (messages.length > MAX_MESSAGES) {
    return `messages must contain at most ${MAX_MESSAGES} entries`;
  }

  let totalChars = 0;
  for (const msg of messages) {
    if (msg?.role !== 'user' && msg?.role !== 'assistant') {
      return "each message role must be 'user' or 'assistant'";
    }
    if (typeof msg.content !== 'string' || msg.content.length === 0) {
      return 'each message content must be a non-empty string';
    }
    totalChars += msg.content.length;
  }
  if (totalChars > MAX_TOTAL_CONTENT_CHARS) {
    return `total message content must be under ${MAX_TOTAL_CONTENT_CHARS} characters`;
  }

  if (system !== undefined) {
    if (typeof system !== 'string') return 'system must be a string';
    if (system.length > MAX_SYSTEM_CHARS) {
      return `system must be under ${MAX_SYSTEM_CHARS} characters`;
    }
  }

  return null;
}

async function resolveApiKey(companyId) {
  if (companyId) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { anthropicKeyEnc: true },
    });
    if (company?.anthropicKeyEnc) {
      return { apiKey: decryptSecret(company.anthropicKeyEnc), source: 'company' };
    }
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return { apiKey: process.env.ANTHROPIC_API_KEY, source: 'env' };
  }
  return null;
}

export default withHandler(
  async (req, res, auth) => {
    if (req.method !== 'POST') return methodNotAllowed(res);

    assertRateLimitKey(auth.id ?? auth.authId, RATE_LIMIT);

    const validationError = validateBody(req.body);
    if (validationError) return badRequest(res, validationError);

    const resolved = await resolveApiKey(auth.effectiveCompanyId);
    if (!resolved) {
      return res.status(503).json({ error: 'AI is not configured' });
    }

    const { messages, system } = req.body;
    const client = new Anthropic({ apiKey: resolved.apiKey });

    let response;
    try {
      response = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        ...(system ? { system } : {}),
        messages: messages.map(({ role, content }) => ({ role, content })),
      });
    } catch (err) {
      // Never log err bodies verbatim beyond status/message — and never the key.
      console.error('[ai/chat] Anthropic request failed:', err?.status, err?.message);
      if (err?.status === 401) {
        return res.status(502).json({
          error:
            resolved.source === 'company'
              ? "Your company's Anthropic API key was rejected — update it in settings"
              : 'The configured Anthropic API key was rejected',
        });
      }
      return res.status(502).json({ error: 'AI request failed — please try again' });
    }

    const reply = (response.content ?? [])
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('');

    return ok(res, {
      reply,
      usage: {
        inputTokens: response.usage?.input_tokens ?? 0,
        outputTokens: response.usage?.output_tokens ?? 0,
      },
    });
  },
  { auth: 'user' }
);
