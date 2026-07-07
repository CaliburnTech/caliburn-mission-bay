/**
 * Simple in-memory sliding-window rate limiter keyed by client IP.
 *
 * IMPORTANT: this is per-instance and best-effort only. On Vercel
 * serverless, each warm lambda instance has its own memory, instances are
 * recycled at will, and concurrent traffic fans out across instances — so
 * the real ceiling is (limit × number of live instances). It stops naive
 * abuse of public endpoints but is NOT a security boundary. Use a shared
 * store (Upstash Redis / Vercel KV) if hard limits are ever required.
 */

const WINDOWS = new Map(); // key -> number[] (request timestamps, ms)
const MAX_KEYS = 10_000; // safety valve against unbounded memory growth

export function clientIp(req) {
  const forwarded = req.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress ?? 'unknown';
}

/**
 * Returns true if the given identity is within the limit, false otherwise.
 * Use this directly when limiting by something other than IP (e.g. user id).
 * @param {string} identity — stable key for the caller (IP, user id, ...)
 * @param {object} opts     — { limit, windowMs, bucket }
 */
export function checkRateLimitKey(identity, { limit = 5, windowMs = 60_000, bucket = 'default' } = {}) {
  const now = Date.now();
  const key = `${bucket}:${identity}`;

  let timestamps = WINDOWS.get(key) ?? [];
  timestamps = timestamps.filter((t) => now - t < windowMs);

  if (timestamps.length >= limit) {
    WINDOWS.set(key, timestamps);
    return false;
  }

  timestamps.push(now);

  if (WINDOWS.size >= MAX_KEYS && !WINDOWS.has(key)) {
    WINDOWS.clear(); // crude but bounded — acceptable for best-effort limiting
  }
  WINDOWS.set(key, timestamps);
  return true;
}

/**
 * Returns true if the request is within the limit, false otherwise.
 * @param {object} req    — incoming request (IP taken from x-forwarded-for)
 * @param {object} opts   — { limit, windowMs, bucket }
 */
export function checkRateLimit(req, opts) {
  return checkRateLimitKey(clientIp(req), opts);
}

/** Throws a 429 (handled by withHandler) when the limit is exceeded. */
export function assertRateLimit(req, opts) {
  if (!checkRateLimit(req, opts)) {
    throw rateLimitError();
  }
}

/** Like assertRateLimit, but keyed by an arbitrary identity (e.g. user id). */
export function assertRateLimitKey(identity, opts) {
  if (!checkRateLimitKey(identity, opts)) {
    throw rateLimitError();
  }
}

function rateLimitError() {
  const err = new Error('Too many requests — please try again later');
  err.status = 429;
  return err;
}
