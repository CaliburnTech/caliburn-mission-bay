/**
 * purchaseRequests — production-mode Buy flow services.
 *
 * Backend contract (api/):
 *   POST /api/configurations      { name?, configData, productVersions? }
 *     → 201 SavedConfiguration row (with DB id). Requires an authed user
 *       with a company (auth.effectiveCompanyId).
 *   POST /api/purchase-requests   { configId, message? }
 *     → 201 { purchaseRequest, garageItem }. configId must be a
 *       SavedConfiguration id belonging to the caller.
 */

import { authedFetch } from './authedFetch';

/** Persist a configuration snapshot to the backend; returns the created row. */
export function saveConfigurationToBackend({ name, configData }) {
  return authedFetch('/configurations', {
    method: 'POST',
    body: JSON.stringify({ name: name ?? null, configData }),
  });
}

/** File a purchase request (Buy / book-a-call) for a saved configuration. */
export function createPurchaseRequest({ configId, message }) {
  return authedFetch('/purchase-requests', {
    method: 'POST',
    body: JSON.stringify({ configId, message: message || null }),
  });
}
