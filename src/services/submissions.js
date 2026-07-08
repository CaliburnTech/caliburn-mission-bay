/**
 * submissions.js — public (no-auth) config submission.
 *
 * Non-signed-in users save builds with zero friction: this POSTs the config to
 * the PUBLIC backend endpoint (POST /api/submissions), which stores it in the
 * same table the admin Submissions page reads. Independent of VITE_APP_MODE
 * (demo/production) — submissions always reach the backend.
 */

import { apiUrl } from './apiBase';

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
  const url = apiUrl('/submissions');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: name ?? null,
      configData,
      submittedBy: submittedBy || null,
    }),
  });
  if (!res.ok) {
    // Surface the failure in the console so silent save issues are debuggable.
    console.warn(`[submissions] POST ${url} failed: ${res.status} ${res.statusText}`);
    throw new Error(`Submission failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
