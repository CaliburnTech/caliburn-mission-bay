/**
 * Data Interface
 *
 * Defines the contract that both the static adapter (demo) and API adapter
 * (production) must implement. This is the abstraction boundary between
 * the UI layer and the data source.
 *
 * ARCHITECTURE:
 *   Components → Zustand stores → dataStore.js → adapter → { static files | API }
 *
 * Both adapters return the same data shapes. The UI never knows which
 * adapter is active.
 */

/**
 * @typedef {Object} DataAdapter
 *
 * @property {() => Promise<Array>} getVessels - All confirmed vessel hull definitions
 * @property {(name: string) => Promise<Object|null>} getVesselByName
 * @property {() => Object} getVesselHullComponents - Hull name → React component mapping
 * @property {() => Object} getVesselMountPoints - Mount point definitions per hull
 * @property {() => Object} getVesselSlotCapacity - Slot counts per hull
 * @property {() => Object} getDefaultSlotCapacity - Fallback slot counts
 * @property {() => Object} getGlobalBaselines - Performance baseline thresholds
 *
 * @property {() => Promise<Array>} getCapabilities - All confirmed individual capabilities
 * @property {(name: string) => Promise<Object|null>} getCapabilityByName
 * @property {() => Promise<Array>} getStacks - Engineering stacks
 * @property {() => Object} getCapabilityCategories - Category filter definitions
 *
 * @property {() => Promise<Array>} getSquadrons - Fleet squadrons (from marketplaceData)
 * @property {() => Promise<Array>} getSwarmSquadrons - Swarm squadrons (from fleetData)
 * @property {() => Object} getSquadronUnitConfigs - Unit configurations per squadron
 * @property {() => Promise<Array>} getActiveDeployments - Current fleet deployments
 *
 * @property {() => Promise<Array>} getMissions - Pre-populated missions
 *
 * @property {() => Object} getSoftwareCatalog - Software component metadata
 * @property {(name: string) => Object} getCatalogEntry - Single catalog entry
 *
 * @property {() => Object} getSV2Templates - Hand-crafted SV-2 diagram templates
 * @property {() => Object} getSV2LayerMap - Architecture layer definitions
 *
 * // Mutations (no-op in demo mode, real API calls in production)
 * @property {(data: Object) => Promise<Object>} [createVessel]
 * @property {(id: string, data: Object) => Promise<Object>} [updateVessel]
 * @property {(id: string) => Promise<void>} [deleteVessel]
 * @property {(data: Object) => Promise<Object>} [createCapability]
 * @property {(id: string, data: Object) => Promise<Object>} [updateCapability]
 * @property {(id: string) => Promise<void>} [deleteCapability]
 */

// Mode detection
export const APP_MODE = import.meta.env.VITE_APP_MODE || 'demo';
export const isProduction = APP_MODE === 'production';
export const isDemo = APP_MODE === 'demo';
