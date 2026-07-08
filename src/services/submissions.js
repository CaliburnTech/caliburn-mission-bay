/**
 * submissions.js — public (no-auth) config submission.
 *
 * Non-signed-in users save builds with zero friction: this POSTs the config to
 * the PUBLIC backend endpoint (POST /api/submissions), which stores it in the
 * same table the admin Submissions page reads. Independent of VITE_APP_MODE
 * (demo/production) — submissions always reach the backend.
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Submit an anonymous configuration to the backend.
 * @param {object} args
 * @param {string} [args.name]        Display name for the submission
 * @param {object} args.configData    Full config snapshot (slots, sbom, products, hull, etc.)
 * @param {string} [args.submittedBy] Free-text attribution the user typed
 * @returns {Promise<{id: string} | null>} Created row id, or null on failure.
 */
export async function submitPublicConfig({ name, configData, submittedBy } = {}) {
  if (!configData) return null;
  const res = await fetch(`${API_BASE}/api/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: name ?? null,
      configData,
      submittedBy: submittedBy || null,
    }),
  });
  if (!res.ok) {
    throw new Error(`Submission failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
