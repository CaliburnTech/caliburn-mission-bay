/**
 * Static Data Adapter (Demo Mode)
 *
 * Wraps all existing src/data/*.js static files behind the DataAdapter interface.
 * Returns Promises that resolve synchronously (for interface compatibility with
 * the API adapter which returns real async Promises).
 *
 * This adapter is the ZERO-CHANGE path: existing demo behavior is preserved
 * exactly as-is. No data transformation, no filtering, no auth.
 */

// Import all static data sources
import {
  engineeringStacks,
  individualCapabilities,
  capabilityCategories,
  squadrons
} from '../data/marketplaceData';

import {
  vesselHullData,
  vesselHullComponents,
  vesselMountPoints,
  VESSEL_SLOT_CAPACITY,
  DEFAULT_SLOT_CAPACITY,
  globalBaselines,
  LOADOUT_CATEGORY_KEYS
} from '../data/vesselData';

import {
  swarmSquadrons,
  squadronUnitConfigurations,
  activeDeployments
} from '../data/fleetData';

import { initialMissions } from '../data/missionsData';

import {
  softwareCatalog,
  getCatalogEntry,
  sv2Architectures,
} from '../data/softwareCatalog';

import { sv2Templates, getSV2Template, getAvailableTemplates } from '../data/sv2Templates';

import {
  SV2_LAYERS,
  SV2_SUBGROUPS,
  getArchitectureLayer,
  BASELINE_COMPONENTS,
  DEFAULT_EDGE_RULES,
  COMPUTE_TEMPLATES,
  LAYOUT,
  getExternalInterfaces
} from '../data/sv2LayerMap';

/**
 * Create the static adapter instance.
 * All query methods return Promises for interface compatibility.
 * Mutation methods are no-ops that log warnings.
 */
export const createStaticAdapter = () => {
  // In-memory demo state (no network, not persisted across reloads)
  const demoConfigs = [];   // saved configurations
  const demoGarage = [];    // garage items
  const demoUser = {
    id: 'demo-user',
    email: 'demo@caliburn.local',
    name: 'Demo User',
    role: 'admin',
    company: { id: 'demo-company', name: 'Caliburn Demo' }
  };

  return ({
  // ── Vessels ──
  getVessels: () => Promise.resolve(vesselHullData),
  getVesselByName: (name) => Promise.resolve(vesselHullData.find(v => v.name === name) || null),
  getVesselHullComponents: () => vesselHullComponents,
  getVesselMountPoints: () => vesselMountPoints || {},
  getVesselSlotCapacity: () => VESSEL_SLOT_CAPACITY,
  getDefaultSlotCapacity: () => DEFAULT_SLOT_CAPACITY,
  getGlobalBaselines: () => globalBaselines,
  getLoadoutCategoryKeys: () => LOADOUT_CATEGORY_KEYS,

  // ── Capabilities ──
  getCapabilities: () => Promise.resolve(individualCapabilities),
  getCapabilityByName: (name) => Promise.resolve(
    individualCapabilities.find(c => c.name === name) ||
    engineeringStacks.find(s => s.name === name) ||
    null
  ),
  getStacks: () => Promise.resolve(engineeringStacks),
  getCapabilityCategories: () => capabilityCategories,

  // ── Squadrons / Fleet ──
  getSquadrons: () => Promise.resolve(squadrons),
  getSwarmSquadrons: () => Promise.resolve(swarmSquadrons),
  getSquadronUnitConfigs: () => squadronUnitConfigurations,
  getActiveDeployments: () => Promise.resolve(activeDeployments),

  // ── Missions ──
  getMissions: () => Promise.resolve(initialMissions),

  // ── Software Catalog ──
  getSoftwareCatalog: () => softwareCatalog,
  getCatalogEntry: (name) => getCatalogEntry(name),
  getSV2Architectures: () => sv2Architectures,

  // ── SV-2 ──
  getSV2Templates: () => sv2Templates,
  getSV2Template: (identifier) => getSV2Template(identifier),
  getAvailableTemplates: () => getAvailableTemplates(),
  getSV2Layers: () => SV2_LAYERS,
  getSV2Subgroups: () => SV2_SUBGROUPS,
  getArchitectureLayer: (capability, slotCategory) => getArchitectureLayer(capability, slotCategory),
  getBaselineComponents: () => BASELINE_COMPONENTS,
  getDefaultEdgeRules: () => DEFAULT_EDGE_RULES,
  getComputeTemplates: () => COMPUTE_TEMPLATES,
  getSV2Layout: () => LAYOUT,
  getExternalInterfaces: (sv2Data) => getExternalInterfaces(sv2Data),

  // ── User & Auth (demo identity, no network) ──
  getMe: () => Promise.resolve(demoUser),

  // ── Saved Configurations (in-memory demo store) ──
  getConfigs: () => Promise.resolve([...demoConfigs]),

  createConfig: (data) => {
    const now = new Date().toISOString();
    const existing = data?.id ? demoConfigs.find(c => c.id === data.id) : null;
    if (existing) {
      // Re-save: update in place, preserve createdAt
      Object.assign(existing, data, { createdAt: existing.createdAt, updatedAt: now });
      return Promise.resolve({ ...existing });
    }
    const row = {
      id: data?.id || (globalThis.crypto?.randomUUID?.() || `cfg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`),
      ...data,
      createdAt: now,
      updatedAt: now
    };
    demoConfigs.push(row);
    return Promise.resolve({ ...row });
  },

  updateConfig: (id, data) => {
    const existing = demoConfigs.find(c => c.id === id);
    if (!existing) return Promise.resolve(null);
    // Never clobber id/createdAt on update
    Object.assign(existing, data, { id: existing.id, createdAt: existing.createdAt, updatedAt: new Date().toISOString() });
    return Promise.resolve({ ...existing });
  },

  deleteConfig: (id) => {
    const idx = demoConfigs.findIndex(c => c.id === id);
    if (idx === -1) return Promise.resolve(false);
    demoConfigs.splice(idx, 1);
    return Promise.resolve(true);
  },

  // ── Garage (in-memory demo store) ──
  getGarage: () => Promise.resolve([...demoGarage]),

  addToGarage: (data) => {
    const row = {
      id: globalThis.crypto?.randomUUID?.() || `gar_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      ...data,
      createdAt: new Date().toISOString()
    };
    demoGarage.push(row);
    return Promise.resolve({ ...row });
  },

  // ── Analytics (no-op in demo) ──
  recordEvent: () => Promise.resolve(),

  // ── Mutations (no-op in demo) ──
  createVessel: () => { console.warn('[Demo] Vessel creation not available'); return Promise.resolve(null); },
  updateVessel: () => { console.warn('[Demo] Vessel update not available'); return Promise.resolve(null); },
  deleteVessel: () => { console.warn('[Demo] Vessel deletion not available'); return Promise.resolve(); },
  createCapability: () => { console.warn('[Demo] Capability creation not available'); return Promise.resolve(null); },
  updateCapability: () => { console.warn('[Demo] Capability update not available'); return Promise.resolve(null); },
  deleteCapability: () => { console.warn('[Demo] Capability deletion not available'); return Promise.resolve(); },

  // ── Meta ──
  mode: 'demo',
  isReady: true
  });
};
