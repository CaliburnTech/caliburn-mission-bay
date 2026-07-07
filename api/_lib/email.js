/**
 * Transactional email via Resend.
 *
 * Required env vars:
 *   RESEND_API_KEY        — from resend.com (re_...)
 *   CALIBURN_NOTIFY_EMAIL — internal inbox, default: team@caliburn.us
 *
 * All send functions are fire-safe: they return a Promise that resolves
 * on success or rejects with an Error. Callers that don't want to block
 * a response on email delivery should .catch() the result.
 *
 * In demo/dev mode (RESEND_API_KEY absent) every function is a no-op so
 * local dev doesn't require a real API key.
 */

import { Resend } from 'resend';

const APP_URL = process.env.APP_URL || 'https://caliburn-marketplace.vercel.app';
const FROM = 'Mission Bay <noreply@caliburn.us>';
const NOTIFY = process.env.CALIBURN_NOTIFY_EMAIL ?? 'team@caliburn.us';

/** True when a real Resend API key is configured (emails will actually send). */
export const isEmailEnabled = () => Boolean(process.env.RESEND_API_KEY);

let _client = null;
const client = () => {
  if (!_client) {
    const key = process.env.RESEND_API_KEY;
    if (!key) return null; // dev / demo mode — emails are no-ops
    _client = new Resend(key);
  }
  return _client;
};

const send = async (to, subject, html) => {
  const resend = client();
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set — skipping "${subject}"`);
    return;
  }
  const { error } = await resend.emails.send({
    from: FROM,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  });
  if (error) throw new Error(`Resend error: ${error.message}`);
};

// ── Template 1 — New signup alert (to Caliburn team) ─────────────────────────
// Fired: POST /api/auth/webhook on INSERT
export const sendSignupAlert = ({ companyName, ownerEmail }) =>
  send(
    NOTIFY,
    `[Mission Bay] New signup awaiting approval — ${companyName}`,
    `
    <p>A new company has signed up on Mission Bay and is waiting for approval.</p>
    <table style="border-collapse:collapse;margin:16px 0">
      <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Company</td><td><strong>${companyName}</strong></td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Owner email</td><td>${ownerEmail}</td></tr>
    </table>
    <p>
      <a href="${APP_URL}/admin" style="display:inline-block;padding:10px 20px;background:#1d4ed8;color:#fff;text-decoration:none;border-radius:6px">
        Review in Admin Portal →
      </a>
    </p>
    `,
  );

// ── Template 2 — Approval granted (to company OWNER) ─────────────────────────
// Fired: POST /api/admin/companies/:id/approve
export const sendApprovalGranted = ({ ownerEmail, companyName }) =>
  send(
    ownerEmail,
    `[Mission Bay] Your account has been approved`,
    `
    <p>Good news — <strong>${companyName}</strong> has been approved on Mission Bay.</p>
    <p>You can now log in and access the full platform.</p>
    <p>
      <a href="${APP_URL}" style="display:inline-block;padding:10px 20px;background:#1d4ed8;color:#fff;text-decoration:none;border-radius:6px">
        Go to Mission Bay →
      </a>
    </p>
    <p style="color:#6b7280;font-size:14px">
      Questions? Reach us at <a href="mailto:team@caliburn.us">team@caliburn.us</a>
    </p>
    `,
  );

// ── Template 3 — Ban notice (to company OWNER) ───────────────────────────────
// Fired: POST /api/admin/companies/:id/ban
export const sendBanNotice = ({ ownerEmail, companyName }) =>
  send(
    ownerEmail,
    `[Mission Bay] Your account has been suspended`,
    `
    <p>Your Mission Bay account for <strong>${companyName}</strong> has been suspended.</p>
    <p>If you believe this is an error, please contact us:</p>
    <p>
      <a href="mailto:team@caliburn.us" style="display:inline-block;padding:10px 20px;background:#1d4ed8;color:#fff;text-decoration:none;border-radius:6px">
        Contact Caliburn →
      </a>
    </p>
    `,
  );

// ── Template 4 — Config saved (to buyer) ────────────────────────────────────
// Fired: POST /api/configurations
export const sendConfigSaved = ({ buyerEmail, configName }) =>
  send(
    buyerEmail,
    `[Mission Bay] Configuration saved — ${configName}`,
    `
    <p>Your configuration <strong>${configName}</strong> has been saved to Mission Bay.</p>
    <p>You can view and manage your saved configurations from your account at any time.</p>
    <p>
      <a href="${APP_URL}" style="display:inline-block;padding:10px 20px;background:#1d4ed8;color:#fff;text-decoration:none;border-radius:6px">
        View your configurations →
      </a>
    </p>
    `,
  );

// ── Template 4b — Config updated by vendor (to buyer) ───────────────────────
// Fired: POST /api/products/:id/publish (for each affected saved config)
export const sendConfigUpdated = ({ buyerEmail, productName, configName }) =>
  send(
    buyerEmail,
    `[Mission Bay] A product in your configuration was updated`,
    `
    <p><strong>${productName}</strong> has published a new version.</p>
    <p>Your saved configuration <strong>${configName}</strong> has been updated to reference the latest version.</p>
    <p>
      <a href="${APP_URL}" style="display:inline-block;padding:10px 20px;background:#1d4ed8;color:#fff;text-decoration:none;border-radius:6px">
        Review your configuration →
      </a>
    </p>
    `,
  );

// ── Template 4c — Vendor application received (to Caliburn team) ────────────
// Fired: POST /api/admin/applications (public form)
export const sendVendorApplicationReceived = ({ companyName, contactName, contactEmail }) =>
  send(
    NOTIFY,
    `[Mission Bay] New vendor application — ${companyName}`,
    `
    <p>A new vendor application has been submitted on Mission Bay.</p>
    <table style="border-collapse:collapse;margin:16px 0">
      <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Company</td><td><strong>${companyName}</strong></td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Contact</td><td>${contactName}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Email</td><td>${contactEmail}</td></tr>
    </table>
    <p>
      <a href="${APP_URL}/admin" style="display:inline-block;padding:10px 20px;background:#1d4ed8;color:#fff;text-decoration:none;border-radius:6px">
        Review in Admin Portal →
      </a>
    </p>
    `,
  );

// ── Template 4d — Password reset link (to user) ─────────────────────────────
// Fired: POST /api/admin/users/:id/reset-password
export const sendPasswordReset = ({ to, actionLink }) =>
  send(
    to,
    `[Mission Bay] Reset your password`,
    `
    <p>A password reset was requested for your Mission Bay account.</p>
    <p>
      <a href="${actionLink}" style="display:inline-block;padding:10px 20px;background:#1d4ed8;color:#fff;text-decoration:none;border-radius:6px">
        Reset password →
      </a>
    </p>
    <p style="color:#6b7280;font-size:14px">
      If you did not request this, you can safely ignore this email.
    </p>
    `,
  );

// ── Template 5 — Lead created (to Caliburn team) ─────────────────────────────
// Fired: POST /api/purchase-requests
export const sendLeadCreated = ({ buyerName, buyerEmail, companyName, configName, productNames }) =>
  send(
    NOTIFY,
    `[Mission Bay] New purchase request — ${companyName}`,
    `
    <p>A buyer has submitted a purchase request on Mission Bay.</p>
    <table style="border-collapse:collapse;margin:16px 0">
      <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Buyer</td><td><strong>${buyerName}</strong></td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Email</td><td>${buyerEmail}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Company</td><td>${companyName ?? '—'}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Configuration</td><td>${configName ?? 'Untitled'}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Products</td><td>${productNames?.join(', ') ?? '—'}</td></tr>
    </table>
    <p>
      <a href="${APP_URL}/admin" style="display:inline-block;padding:10px 20px;background:#1d4ed8;color:#fff;text-decoration:none;border-radius:6px">
        View in Admin Portal →
      </a>
    </p>
    `,
  );
