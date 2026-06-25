/**
 * Data Store
 *
 * Centralized Zustand store that holds all marketplace data.
 * Initialized with the appropriate adapter (static or API) on app boot.
 *
 * ARCHITECTURE:
 *   App.jsx boots → detects mode → creates adapter → initializes dataStore
 *   Components and other stores import from dataStore instead of src/data/*
 *
 * This store provides SYNCHRONOUS access to data that was loaded at boot.
 * For the static adapter, data is available immediately.
 * For the API adapter, data is loaded async and components show loading states.
 *
 * WHY A STORE (not React Context)?
 *   - Zustand stores can be imported by other Zustand stores
 *   - No provider nesting / React tree dependency
 *   - Selectors for performance (components re-render only on their slice)
 *   - Works outside React (in utility functions like sbomGenerator)
 */

import { create } from 'zustand';
import { APP_MODE } from './dataInterface';
import { createStaticAdapter } from './staticAdapter';
import { createApiAdapter } from './apiAdapter';

const useDataStore = create((set, get) => ({
  // ── State ──
  adapter: null,
  mode: APP_MODE,
  isReady: false,
  isLoading: false,
  error: null,

  // Cached data (populated on initialize)
  vessels: [],
  capabilities: [],
  stacks: [],
  squadrons: [],
  swarmSquadrons: [],
  missions: [],
  activeDeployments: [],
  capabilityCategories: {},
  vesselHullComponents: {},
  vesselSlotCapacity: {},
  defaultSlotCapacity: {},
  globalBaselines: {},
  squadronUnitConfigs: {},
  softwareCatalog: {},
  sv2Templates: {},
  loadoutCategoryKeys: [],

  // ── Initialize ──
  // Called once on app boot. Creates the adapter and loads data.
  initialize: async (authToken = null) => {
    const { mode } = get();
    set({ isLoading: true, error: null });

    try {
      // Create the right adapter
      const adapter = mode === 'production'
        ? createApiAdapter(authToken)
        : createStaticAdapter();

      // Load all data
      const [vessels, capabilities, stacks, squadrons, swarmSquadrons, missions, activeDeployments] = await Promise.all([
        adapter.getVessels(),
        adapter.getCapabilities(),
        adapter.getStacks(),
        adapter.getSquadrons(),
        adapter.getSwarmSquadrons(),
        adapter.getMissions(),
        adapter.getActiveDeployments()
      ]);

      set({
        adapter,
        isReady: true,
        isLoading: false,
        vessels,
        capabilities,
        stacks,
        squadrons,
        swarmSquadrons,
        missions,
        activeDeployments,
        capabilityCategories: adapter.getCapabilityCategories(),
        vesselHullComponents: adapter.getVesselHullComponents(),
        vesselSlotCapacity: adapter.getVesselSlotCapacity(),
        defaultSlotCapacity: adapter.getDefaultSlotCapacity(),
        globalBaselines: adapter.getGlobalBaselines(),
        squadronUnitConfigs: adapter.getSquadronUnitConfigs(),
        softwareCatalog: adapter.getSoftwareCatalog(),
        sv2Templates: adapter.getSV2Templates(),
        loadoutCategoryKeys: adapter.getLoadoutCategoryKeys()
      });

    } catch (error) {
      console.error('Failed to initialize data store:', error);
      set({ isLoading: false, error: error.message });
    }
  },

  // ── Sync accessors (for use by other stores and utils) ──
  // These read from the cached state, not the adapter

  getVesselByName: (name) => {
    return get().vessels.find(v => v.name === name) || null;
  },

  getCapabilityByName: (name) => {
    const { capabilities, stacks } = get();
    return capabilities.find(c => c.name === name) ||
           stacks.find(s => s.name === name) ||
           null;
  },

  getHullComponent: (name) => {
    return get().vesselHullComponents[name] || null;
  },

  getSlotCapacity: (hullName) => {
    const { vesselSlotCapacity, defaultSlotCapacity } = get();
    return vesselSlotCapacity[hullName] || defaultSlotCapacity;
  },

  getCatalogEntry: (name) => {
    const { adapter } = get();
    return adapter ? adapter.getCatalogEntry(name) : { componentName: name, version: 'Unknown' };
  },

  // ── SV-2 accessors ──
  getSV2Template: (identifier) => {
    const { adapter } = get();
    return adapter ? adapter.getSV2Template(identifier) : null;
  },

  getArchitectureLayer: (capability, slotCategory) => {
    const { adapter } = get();
    return adapter ? adapter.getArchitectureLayer(capability, slotCategory) : { layerId: 'layer-applications' };
  },

  // ── Mutations (delegated to adapter) ──
  createVessel: async (data) => {
    const { adapter } = get();
    if (!adapter) return null;
    const result = await adapter.createVessel(data);
    if (result) {
      // Refresh vessels cache
      const vessels = await adapter.getVessels();
      set({ vessels });
    }
    return result;
  },

  createCapability: async (data) => {
    const { adapter } = get();
    if (!adapter) return null;
    const result = await adapter.createCapability(data);
    if (result) {
      const capabilities = await adapter.getCapabilities();
      set({ capabilities });
    }
    return result;
  },

  // ── User & Auth ──
  getMe: async () => {
    const { adapter } = get();
    return adapter ? adapter.getMe() : null;
  },

  // ── Saved Configurations ──
  // Use the Supabase JS client directly — bypasses Edge Function gateway issues.
  getConfigs: async () => {
    const { supabase } = await import('../auth/supabaseClient');
    const { data, error } = await supabase
      .from('SavedConfiguration')
      .select('id, name, submittedBy, configData, createdAt, updatedAt, companyId')
      .eq('companyId', 'demo-company-00000000000')
      .order('createdAt', { ascending: false });
    if (error) { console.error('[getConfigs]', error); return []; }
    return data ?? [];
  },

  createConfig: async (data) => {
    const { supabase } = await import('../auth/supabaseClient');
    const { data: row, error } = await supabase
      .from('SavedConfiguration')
      .insert({
        id: crypto.randomUUID(),
        userId: 'demo-user-000000000000',
        companyId: 'demo-company-00000000000',
        name: data.name,
        configData: data.config_data ?? {},
        submittedBy: data.submitted_by ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) { console.error('[createConfig]', error); return null; }
    return row;
  },

  updateConfig: async (id, data) => {
    const { adapter } = get();
    if (!adapter) return null;
    return adapter.updateConfig(id, data);
  },

  deleteConfig: async (id) => {
    const { adapter } = get();
    if (!adapter) return false;
    return adapter.deleteConfig(id);
  },

  // ── Garage ──
  getGarage: async () => {
    const { adapter } = get();
    return adapter ? adapter.getGarage() : [];
  },

  addToGarage: async (data) => {
    const { adapter } = get();
    if (!adapter) return null;
    return adapter.addToGarage(data);
  },

  // ── Analytics ──
  recordEvent: async (data) => {
    const { adapter } = get();
    if (!adapter) return;
    return adapter.recordEvent(data);
  },

  // ── Refresh (re-fetch all data from adapter) ──
  refresh: async () => {
    const { adapter } = get();
    if (!adapter) return;

    const [vessels, capabilities, stacks, squadrons, swarmSquadrons, missions, activeDeployments] = await Promise.all([
      adapter.getVessels(),
      adapter.getCapabilities(),
      adapter.getStacks(),
      adapter.getSquadrons(),
      adapter.getSwarmSquadrons(),
      adapter.getMissions(),
      adapter.getActiveDeployments()
    ]);

    set({ vessels, capabilities, stacks, squadrons, swarmSquadrons, missions, activeDeployments });
  }
}));

export default useDataStore;
