/**
 * API Data Adapter (Production Mode)
 *
 * Fetches data from the backend API. Includes auth headers from Supabase.
 * Shape-normalizes Prisma flat records into the richer shapes the UI expects.
 * Fields the API does not yet provide are set to safe defaults (see API_SWAP_REVIEW.md).
 *
 * ENV: VITE_API_URL — base URL for all requests (no trailing slash)
 */

import { createStaticAdapter } from './staticAdapter';

const API_BASE = import.meta.env.VITE_API_URL || '';

// ── Shape normalization ────────────────────────────────────────────────────

const normalizeCapability = (product) => ({
  ...product,
  trl: product.trlLevel != null ? `TRL ${product.trlLevel}` : null,
  provider: product.company?.name || null,
  icon: null,          // API_GAP-11: no icon field in API
  specs: {},           // API_GAP-12: no specs object in API
  statImpacts: {},     // API_GAP-13: no SWaP effects in API
  missionTags: [],     // API_GAP-14: no mission tags in API
  capabilityRefs: [],  // API_GAP-15: no capability refs in API
  components: [],      // API_GAP-16: no component list in API
  securityClearance: null, // API_GAP-17: no security clearance in API
  swapData: null,      // API_GAP-18: no SWaP table data in API
  integration: product.description || '',
});

const normalizePlatform = (product) => ({
  ...product,
  trl: product.trlLevel != null ? `TRL ${product.trlLevel}` : null,
  provider: product.company?.name || null,
  icon: null,          // API_GAP-19: no icon in API
  specs: {},
  // API_GAP-20: speed/range/payload/endurance not in API
  // API_GAP-21: mountPoints not in API
  // API_GAP-22: platformType not in API
  // API_GAP-23: dimensions not in API
  // API_GAP-24: propulsion not in API
  // API_GAP-25: securityClassification not in API
  // API_GAP-26: statImpacts not in API
});

// ── HTTP helpers ───────────────────────────────────────────────────────────

export const createApiAdapter = (authToken = null) => {
  const staticFallback = createStaticAdapter();

  // Warn once when synchronous by-name lookups fall back to static data in
  // production mode (the API has no synchronous lookup; callers should prefer
  // the cached dataStore state).
  let warnedStaticNameLookup = false;
  const warnStaticNameLookup = (fn) => {
    if (warnedStaticNameLookup) return;
    warnedStaticNameLookup = true;
    console.warn(
      `[apiAdapter] ${fn} is using static demo data as a fallback in production mode. ` +
      'Use the cached dataStore state (getVesselByName/getCapabilityByName on the store) for API-backed lookups.'
    );
  };

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  });

  const fetchJSON = async (path) => {
    const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders() });
    if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText} (${path})`);
    return res.json();
  };

  const postJSON = async (path, body) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText} (POST ${path})`);
    return res.json();
  };

  const putJSON = async (path, body) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText} (PUT ${path})`);
    return res.json();
  };

  const deleteReq = async (path) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText} (DELETE ${path})`);
    return res.ok;
  };

  return {
    mode: 'production',
    isReady: true,

    // ── Capabilities & Platforms ─────────────────────────────────────────

    getCapabilities: async () => {
      const data = await fetchJSON('/marketplace/capabilities');
      return (data.items ?? data).map(normalizeCapability);
    },

    getVessels: async () => {
      const data = await fetchJSON('/marketplace/platforms');
      return (data.items ?? data).map(normalizePlatform);
    },

    getVesselByName: (name) => {
      // Synchronous — not available from API; callers must use cached store state
      warnStaticNameLookup('getVesselByName');
      return staticFallback.getVesselByName(name);
    },

    getCapabilityByName: (name) => {
      // Synchronous — not available from API; callers must use cached store state
      warnStaticNameLookup('getCapabilityByName');
      return staticFallback.getCapabilityByName(name);
    },

    // ── Static fallbacks (no backend endpoints yet) ──────────────────────

    // API_GAP-01: No stacks endpoint — engineering stacks remain static
    getStacks: () => staticFallback.getStacks(),

    // API_GAP-02: No missions endpoint — initial missions remain static
    getMissions: () => staticFallback.getMissions(),

    // API_GAP-03: No swarm squadrons endpoint
    getSwarmSquadrons: () => staticFallback.getSwarmSquadrons(),

    // API_GAP-04: No squadron unit configs endpoint
    getSquadronUnitConfigs: () => staticFallback.getSquadronUnitConfigs(),

    // API_GAP-05: No active deployments endpoint
    getActiveDeployments: () => staticFallback.getActiveDeployments(),

    // API_GAP-06: No squadrons endpoint
    getSquadrons: () => staticFallback.getSquadrons(),

    // API_GAP-07: No software catalog endpoint
    getSoftwareCatalog: () => staticFallback.getSoftwareCatalog(),
    getCatalogEntry: (name) => staticFallback.getCatalogEntry(name),

    // API_GAP-08: No SV-2 templates endpoint
    getSV2Templates: () => staticFallback.getSV2Templates(),
    getSV2Template: (identifier) => staticFallback.getSV2Template(identifier),

    // API_GAP-09: No SV-2 layer map endpoint
    getArchitectureLayer: (capability, slotCategory) =>
      staticFallback.getArchitectureLayer(capability, slotCategory),

    // API_GAP-10: No fleet vessels endpoint
    getCapabilityCategories: () => staticFallback.getCapabilityCategories(),
    getVesselHullComponents: () => staticFallback.getVesselHullComponents(),
    getVesselSlotCapacity: () => staticFallback.getVesselSlotCapacity(),
    getDefaultSlotCapacity: () => staticFallback.getDefaultSlotCapacity(),
    getGlobalBaselines: () => staticFallback.getGlobalBaselines(),
    getLoadoutCategoryKeys: () => staticFallback.getLoadoutCategoryKeys(),
    getHullComponent: (name) => staticFallback.getHullComponent(name),
    getSlotCapacity: (hullName) => staticFallback.getSlotCapacity(hullName),

    // ── User & Auth ───────────────────────────────────────────────────────

    getMe: () => fetchJSON('/me'),

    // ── Saved Configurations ──────────────────────────────────────────────

    getConfigs: async () => {
      const data = await fetchJSON('/configurations');
      return data?.items ?? data ?? [];
    },
    createConfig: (data) => postJSON('/configurations', data),
    updateConfig: (id, data) => putJSON(`/configurations/${id}`, data),
    deleteConfig: (id) => deleteReq(`/configurations/${id}`),

    // ── Garage ────────────────────────────────────────────────────────────

    getGarage: () => fetchJSON('/garage'),
    addToGarage: (data) => postJSON('/garage', data),

    // ── Analytics ─────────────────────────────────────────────────────────

    recordEvent: (data) => postJSON('/marketplace/events', data),

    // ── Vendor Mutations (admin — not exposed in buyer portal yet) ────────

    createVessel: async () => {
      console.warn('createVessel: no vendor write endpoint in buyer portal');
      return null;
    },

    createCapability: async () => {
      console.warn('createCapability: no vendor write endpoint in buyer portal');
      return null;
    },
  };
};
