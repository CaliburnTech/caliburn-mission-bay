/**
 * Configuration Store - Unified data model for vessel configurations
 *
 * ARCHITECTURE PRINCIPLES:
 * 1. Capabilities are referenced by NAME (string), not copied as objects
 * 2. When displaying, we look up the full capability from individualCapabilities
 * 3. This ensures capability updates (specs, SWaP) propagate to all configurations
 * 4. Single source of truth for both saved and active configurations
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { individualCapabilities, engineeringStacks } from '../data/marketplaceData';
import { vesselHullData, VESSEL_SLOT_CAPACITY, DEFAULT_SLOT_CAPACITY } from '../data/vesselData';

// Helper: Look up a capability object by name
export const getCapabilityByName = (name) => {
  if (!name) return null;
  return individualCapabilities.find(c => c.name === name) ||
         engineeringStacks.find(s => s.name === name) ||
         null;
};

// Helper: Get slot capacity for a hull
export const getSlotCapacity = (hullName) => {
  return VESSEL_SLOT_CAPACITY[hullName] || DEFAULT_SLOT_CAPACITY;
};

// Helper: Generate unique config ID
const generateConfigId = () => `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Category keys in display order
export const CATEGORY_KEYS = ['SENSORS', 'COMMS', 'WEAPONS', 'C2', 'NAV', 'AI', 'UTILITY', 'OTHER'];

// Initialize empty slots based on hull capacity
const createEmptySlots = (hullName) => {
  const capacity = getSlotCapacity(hullName);
  const slots = {};
  CATEGORY_KEYS.forEach(cat => {
    const count = capacity[cat] || 0;
    slots[cat] = Array(count).fill(null);
  });
  return slots;
};

const useConfigurationStore = create(
  persist(
    (set, get) => ({
      // ============================================
      // SAVED CONFIGURATIONS
      // Persisted configurations that have been saved
      // ============================================
      savedConfigurations: {},
      // Structure:
      // {
      //   [configId]: {
      //     id: string,
      //     squadronId: string | null,
      //     name: string,
      //     hullName: string,
      //     slots: { SENSORS: [capName, capName, null], COMMS: [...], ... },
      //     unitCount: number,
      //     status: { missionReady, deployed, ... },
      //     createdAt: timestamp,
      //     updatedAt: timestamp
      //   }
      // }

      // ============================================
      // ACTIVE CONFIGURATION (being edited)
      // ============================================
      activeConfig: null,
      // Structure when active:
      // {
      //   id: string | null (null = new unsaved config),
      //   squadronId: string | null,
      //   name: string,
      //   hullName: string,
      //   slots: { SENSORS: [capName, ...], COMMS: [...], ... },
      //   isDirty: boolean (has unsaved changes)
      // }

      // ============================================
      // ACTIONS: Loading Configurations
      // ============================================

      // Start a new empty configuration for a hull
      startNewConfiguration: (hullName) => {
        const hull = vesselHullData.find(h => h.name === hullName);
        if (!hull) {
          console.warn('Hull not found:', hullName);
          return false;
        }

        set({
          activeConfig: {
            id: null,
            squadronId: null,
            name: '',
            hullName,
            slots: createEmptySlots(hullName),
            isDirty: false
          }
        });
        return true;
      },

      // Load a saved configuration for editing
      loadSavedConfiguration: (configId) => {
        const config = get().savedConfigurations[configId];
        if (!config) {
          console.warn('Configuration not found:', configId);
          return false;
        }

        set({
          activeConfig: {
            ...config,
            isDirty: false
          }
        });
        return true;
      },

      // Load a configuration from fleet data (legacy format)
      loadFromFleetData: (squadron, outfit) => {
        // Find the hull for this squadron
        const hull = vesselHullData.find(v =>
          v.name === squadron.icon || v.icon === squadron.icon
        );

        if (!hull) {
          console.warn('Hull not found for squadron:', squadron.icon);
          return false;
        }

        const hullName = hull.name;
        const slots = createEmptySlots(hullName);

        // Map capability names to slots by category
        if (outfit?.capabilities) {
          outfit.capabilities.forEach(capName => {
            const capability = getCapabilityByName(capName);
            if (capability) {
              // Determine which category this capability belongs to
              const category = mapCapabilityToCategory(capability);
              // Find first empty slot in that category
              const slotIndex = slots[category]?.findIndex(s => s === null);
              if (slotIndex !== -1 && slotIndex !== undefined) {
                slots[category][slotIndex] = capName;
              } else {
                // If no slots in preferred category, try OTHER
                const otherIndex = slots.OTHER?.findIndex(s => s === null);
                if (otherIndex !== -1 && otherIndex !== undefined) {
                  slots.OTHER[otherIndex] = capName;
                }
              }
            }
          });
        }

        set({
          activeConfig: {
            id: null, // Not yet saved to our store
            squadronId: squadron.id,
            name: outfit?.name || 'Untitled Configuration',
            hullName,
            slots,
            isDirty: false
          }
        });
        return true;
      },

      // ============================================
      // ACTIONS: Editing Active Configuration
      // ============================================

      // Set a capability in a slot (null to clear)
      setSlotCapability: (category, slotIndex, capabilityName) => {
        const { activeConfig } = get();
        if (!activeConfig) return;

        const newSlots = { ...activeConfig.slots };
        newSlots[category] = [...(newSlots[category] || [])];
        newSlots[category][slotIndex] = capabilityName;

        set({
          activeConfig: {
            ...activeConfig,
            slots: newSlots,
            isDirty: true
          }
        });
      },

      // Add a new slot to a category
      addSlot: (category) => {
        const { activeConfig } = get();
        if (!activeConfig) return;

        const newSlots = { ...activeConfig.slots };
        newSlots[category] = [...(newSlots[category] || []), null];

        set({
          activeConfig: {
            ...activeConfig,
            slots: newSlots,
            isDirty: true
          }
        });
      },

      // Remove last empty slot from a category
      removeSlot: (category) => {
        const { activeConfig } = get();
        if (!activeConfig) return;

        const slots = activeConfig.slots[category] || [];
        // Only remove if last slot is empty
        if (slots.length > 0 && slots[slots.length - 1] === null) {
          const newSlots = { ...activeConfig.slots };
          newSlots[category] = slots.slice(0, -1);

          set({
            activeConfig: {
              ...activeConfig,
              slots: newSlots,
              isDirty: true
            }
          });
        }
      },

      // Update configuration name
      setConfigName: (name) => {
        const { activeConfig } = get();
        if (!activeConfig) return;

        set({
          activeConfig: {
            ...activeConfig,
            name,
            isDirty: true
          }
        });
      },

      // ============================================
      // ACTIONS: Saving Configurations
      // ============================================

      // Save the active configuration
      saveActiveConfiguration: () => {
        const { activeConfig, savedConfigurations } = get();
        if (!activeConfig) return null;

        const now = Date.now();
        const configId = activeConfig.id || generateConfigId();

        const savedConfig = {
          ...activeConfig,
          id: configId,
          unitCount: activeConfig.unitCount || 1,
          status: activeConfig.status || { missionReady: 1, deployed: 0 },
          createdAt: activeConfig.createdAt || now,
          updatedAt: now
        };

        set({
          savedConfigurations: {
            ...savedConfigurations,
            [configId]: savedConfig
          },
          activeConfig: {
            ...savedConfig,
            isDirty: false
          }
        });

        return configId;
      },

      // Save as a new configuration (clone)
      saveAsNewConfiguration: (newName) => {
        const { activeConfig, savedConfigurations } = get();
        if (!activeConfig) return null;

        const now = Date.now();
        const configId = generateConfigId();

        const savedConfig = {
          ...activeConfig,
          id: configId,
          name: newName || `${activeConfig.name} (Copy)`,
          unitCount: 1,
          status: { missionReady: 1, deployed: 0 },
          createdAt: now,
          updatedAt: now
        };

        set({
          savedConfigurations: {
            ...savedConfigurations,
            [configId]: savedConfig
          },
          activeConfig: {
            ...savedConfig,
            isDirty: false
          }
        });

        return configId;
      },

      // Delete a saved configuration
      deleteConfiguration: (configId) => {
        const { savedConfigurations, activeConfig } = get();
        const newSaved = { ...savedConfigurations };
        delete newSaved[configId];

        set({
          savedConfigurations: newSaved,
          // Clear active if it was the deleted one
          activeConfig: activeConfig?.id === configId ? null : activeConfig
        });
      },

      // ============================================
      // ACTIONS: Utility
      // ============================================

      // Close active configuration (discard if unsaved)
      closeActiveConfiguration: () => {
        set({ activeConfig: null });
      },

      // Get configurations for a specific squadron
      getConfigurationsForSquadron: (squadronId) => {
        const { savedConfigurations } = get();
        return Object.values(savedConfigurations).filter(c => c.squadronId === squadronId);
      },

      // Get configurations for a specific hull
      getConfigurationsForHull: (hullName) => {
        const { savedConfigurations } = get();
        return Object.values(savedConfigurations).filter(c => c.hullName === hullName);
      },

      // ============================================
      // COMPUTED: Active Configuration Stats
      // ============================================

      // Get the equipped capabilities as full objects (for display/calculations)
      getEquippedCapabilities: () => {
        const { activeConfig } = get();
        if (!activeConfig) return [];

        const equipped = [];
        CATEGORY_KEYS.forEach(category => {
          (activeConfig.slots[category] || []).forEach((capName, index) => {
            if (capName) {
              const capability = getCapabilityByName(capName);
              if (capability) {
                equipped.push({
                  ...capability,
                  _slotCategory: category,
                  _slotIndex: index
                });
              }
            }
          });
        });
        return equipped;
      },

      // Get count of equipped capabilities
      getEquippedCount: () => {
        const { activeConfig } = get();
        if (!activeConfig) return 0;

        let count = 0;
        CATEGORY_KEYS.forEach(category => {
          (activeConfig.slots[category] || []).forEach(capName => {
            if (capName) count++;
          });
        });
        return count;
      }
    }),
    {
      name: 'caliburn-configurations',
      // Only persist savedConfigurations, not activeConfig
      partialize: (state) => ({ savedConfigurations: state.savedConfigurations })
    }
  )
);

// Helper: Map a capability to its appropriate category
function mapCapabilityToCategory(capability) {
  const categoryType = capability.category?.toUpperCase() || '';

  // Map capability categories to slot categories
  if (categoryType.includes('SENSOR') || categoryType.includes('EO/IR') ||
      categoryType.includes('RADAR') || categoryType.includes('SONAR') ||
      categoryType.includes('ACOUSTIC')) {
    return 'SENSORS';
  }
  if (categoryType.includes('COMM') || categoryType.includes('SATCOM') ||
      categoryType.includes('RF COMM')) {
    return 'COMMS';
  }
  if (categoryType.includes('WEAPON') || categoryType.includes('KINETIC') ||
      categoryType.includes('DIRECTED ENERGY')) {
    return 'WEAPONS';
  }
  if (categoryType.includes('ELECTRONIC') || categoryType.includes('EW') ||
      categoryType.includes('SIGNALS INTELLIGENCE')) {
    return 'SENSORS';  // EW merged into SENSORS
  }
  if (categoryType.includes('C2 SYSTEM') || categoryType === 'C2') {
    return 'C2';
  }
  if (categoryType.includes('NAV')) {
    return 'NAV';
  }
  if (categoryType.includes('UNMANNED') || categoryType.includes('COMMAND') ||
      categoryType.includes('AUTONOMY') || categoryType.includes('AI')) {
    return 'AI';
  }
  if (categoryType.includes('LOGISTICS') || categoryType.includes('MAINTENANCE') ||
      categoryType.includes('UTILITY')) {
    return 'UTILITY';
  }
  return 'OTHER';
}

export default useConfigurationStore;
