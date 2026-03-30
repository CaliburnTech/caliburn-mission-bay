import { create } from 'zustand';
// Fallback imports for before dataStore is initialized
import { swarmSquadrons as initialSquadrons, squadronUnitConfigurations as initialConfigurations, generateSquadronId } from '../data/fleetData';
import { individualCapabilities, engineeringStacks } from '../data/marketplaceData';
import { vesselMountPoints } from '../data/vesselData';

const useSquadronStore = create((set, get) => ({
  // Dynamic squadron data (mutable copy for variations)
  swarmSquadrons: [...initialSquadrons],
  squadronUnitConfigurations: { ...initialConfigurations },
  vesselMountPoints,

  // Get capabilities available for outfitting (from marketplace data)
  getAvailableCapabilities: () => individualCapabilities,
  getAvailableStacks: () => engineeringStacks,

  // ============================================
  // VARIATION CRUD
  // ============================================

  // Create a new variation from an existing squadron
  createVariation: (parentId, variationName, initialOverrides = {}) => {
    const state = get();
    const parent = state.swarmSquadrons.find(s => s.id === parentId);
    if (!parent) return null;

    const newId = generateSquadronId();
    const variation = {
      ...parent,
      id: newId,
      name: variationName || `${parent.name} (Variation)`,
      isVariation: true,
      parentId: parentId,
      parentName: parent.name,
      overrides: {
        name: true, // Name is always overridden
        ...initialOverrides
      }
    };

    // Copy parent's unit configurations if they exist
    const parentConfig = state.squadronUnitConfigurations[parentId];
    const newConfigurations = { ...state.squadronUnitConfigurations };
    if (parentConfig) {
      newConfigurations[newId] = JSON.parse(JSON.stringify(parentConfig));
    }

    set({
      swarmSquadrons: [...state.swarmSquadrons, variation],
      squadronUnitConfigurations: newConfigurations
    });

    return newId;
  },

  // Spin out a variation to become independent (breaks inheritance)
  spinOutVariation: (variationId) => {
    const state = get();
    const variation = state.swarmSquadrons.find(s => s.id === variationId);
    if (!variation || !variation.isVariation) return false;

    // Get resolved data first (merge parent + overrides)
    const resolved = state.getResolvedSquadron(variationId);

    // Create independent squadron with all resolved values
    const independent = {
      ...resolved,
      isVariation: false,
      parentId: null,
      parentName: null,
      overrides: {}
    };

    set({
      swarmSquadrons: state.swarmSquadrons.map(s =>
        s.id === variationId ? independent : s
      )
    });

    return true;
  },

  // Delete a squadron (handles children appropriately)
  deleteSquadron: (squadronId, childAction = 'spinOut') => {
    const state = get();
    const squadron = state.swarmSquadrons.find(s => s.id === squadronId);
    if (!squadron) return false;

    // Find all children (variations of this squadron)
    const children = state.swarmSquadrons.filter(s => s.parentId === squadronId);

    let updatedSquadrons = state.swarmSquadrons;

    if (children.length > 0) {
      if (childAction === 'spinOut') {
        // Spin out all children first
        children.forEach(child => {
          const resolved = state.getResolvedSquadron(child.id);
          updatedSquadrons = updatedSquadrons.map(s =>
            s.id === child.id
              ? { ...resolved, isVariation: false, parentId: null, parentName: null, overrides: {} }
              : s
          );
        });
      } else if (childAction === 'delete') {
        // Delete all children
        const childIds = children.map(c => c.id);
        updatedSquadrons = updatedSquadrons.filter(s => !childIds.includes(s.id));
      }
    }

    // Remove the squadron itself
    updatedSquadrons = updatedSquadrons.filter(s => s.id !== squadronId);

    // Clean up configurations
    const newConfigs = { ...state.squadronUnitConfigurations };
    delete newConfigs[squadronId];
    if (childAction === 'delete') {
      children.forEach(child => delete newConfigs[child.id]);
    }

    set({
      swarmSquadrons: updatedSquadrons,
      squadronUnitConfigurations: newConfigs
    });

    return true;
  },

  // ============================================
  // INHERITANCE RESOLUTION
  // ============================================

  // Get fully resolved squadron (parent values + overrides merged)
  getResolvedSquadron: (squadronId) => {
    const state = get();
    const squadron = state.swarmSquadrons.find(s => s.id === squadronId);
    if (!squadron) return null;
    if (!squadron.isVariation) return squadron;

    const parent = state.swarmSquadrons.find(s => s.id === squadron.parentId);
    if (!parent) return squadron; // Orphaned variation, return as-is

    // Build resolved object
    const resolved = { ...parent };
    const overrides = squadron.overrides || {};

    // Apply overrides - if a field is marked as overridden, use variation's value
    Object.keys(overrides).forEach(key => {
      if (overrides[key] && squadron[key] !== undefined) {
        resolved[key] = squadron[key];
      }
    });

    // Always preserve variation identity
    resolved.id = squadron.id;
    resolved.isVariation = true;
    resolved.parentId = squadron.parentId;
    resolved.parentName = squadron.parentName;
    resolved.overrides = squadron.overrides;

    return resolved;
  },

  // Get all variations of a squadron
  getVariations: (parentId) => {
    const state = get();
    return state.swarmSquadrons.filter(s => s.parentId === parentId);
  },

  // Update a squadron field (handles override tracking for variations)
  updateSquadron: (squadronId, updates) => {
    const state = get();
    const squadron = state.swarmSquadrons.find(s => s.id === squadronId);
    if (!squadron) return false;

    let newSquadron = { ...squadron, ...updates };

    // If this is a variation, mark updated fields as overridden
    if (squadron.isVariation) {
      const newOverrides = { ...squadron.overrides };
      Object.keys(updates).forEach(key => {
        if (!['id', 'isVariation', 'parentId', 'parentName', 'overrides'].includes(key)) {
          newOverrides[key] = true;
        }
      });
      newSquadron.overrides = newOverrides;
    }

    set({
      swarmSquadrons: state.swarmSquadrons.map(s =>
        s.id === squadronId ? newSquadron : s
      )
    });

    return true;
  },

  // Reset a variation field to inherit from parent
  resetToParent: (variationId, fieldName) => {
    const state = get();
    const variation = state.swarmSquadrons.find(s => s.id === variationId);
    if (!variation || !variation.isVariation) return false;

    const parent = state.swarmSquadrons.find(s => s.id === variation.parentId);
    if (!parent) return false;

    const newOverrides = { ...variation.overrides };
    delete newOverrides[fieldName];

    set({
      swarmSquadrons: state.swarmSquadrons.map(s =>
        s.id === variationId
          ? { ...s, [fieldName]: parent[fieldName], overrides: newOverrides }
          : s
      )
    });

    return true;
  },

  // ============================================
  // COMPARISON
  // ============================================

  comparisonSquadronIds: [], // Squadron IDs being compared (max 4)
  isComparisonViewOpen: false,

  addToComparison: (squadronId) => {
    const state = get();
    if (state.comparisonSquadronIds.length >= 4) return false;
    if (state.comparisonSquadronIds.includes(squadronId)) return false;
    set({ comparisonSquadronIds: [...state.comparisonSquadronIds, squadronId] });
    return true;
  },

  removeFromComparison: (squadronId) => {
    const state = get();
    set({
      comparisonSquadronIds: state.comparisonSquadronIds.filter(id => id !== squadronId)
    });
  },

  clearComparison: () => set({ comparisonSquadronIds: [], isComparisonViewOpen: false }),

  setComparisonViewOpen: (open) => set({ isComparisonViewOpen: open }),

  // Get resolved data for all squadrons being compared
  getComparisonData: () => {
    const state = get();
    return state.comparisonSquadronIds.map(id => state.getResolvedSquadron(id)).filter(Boolean);
  },

  // ============================================
  // SQUADRON SELECTION (existing)
  // ============================================

  // Squadron selection for management modal
  selectedSquadronForManagement: null,
  setSelectedSquadronForManagement: (squadron) => set({ selectedSquadronForManagement: squadron }),

  // Squadron index (for accessing unit configurations)
  selectedSquadronIndex: null,
  setSelectedSquadronIndex: (index) => set({ selectedSquadronIndex: index }),

  // Sorting for unit tables
  sortColumn: 'unit_id',
  sortDirection: 'asc',
  setSorting: (column, direction) => set({ sortColumn: column, sortDirection: direction }),
  handleSort: (column) => {
    const state = get();
    const direction = state.sortColumn === column && state.sortDirection === 'asc' ? 'desc' : 'asc';
    set({ sortColumn: column, sortDirection: direction });
  },

  // Get sorted outfits for current squadron (uses squadron ID for config lookup)
  getSortedOutfits: () => {
    const state = get();
    const { selectedSquadronForManagement, sortColumn, sortDirection, squadronUnitConfigurations } = state;
    if (!selectedSquadronForManagement?.id) return [];

    // Look up config by squadron ID
    const config = squadronUnitConfigurations[selectedSquadronForManagement.id];
    if (!config?.outfits) return [];

    return [...config.outfits].sort((a, b) => {
      let aVal, bVal;
      if (sortColumn === 'count') {
        aVal = a.count;
        bVal = b.count;
      } else if (sortColumn === 'name') {
        aVal = a.name;
        bVal = b.name;
      } else {
        aVal = a.name;
        bVal = b.name;
      }

      if (typeof aVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
  },

  // Outfitting state for drag-drop
  draggedCapability: null,
  setDraggedCapability: (capability) => set({ draggedCapability: capability }),

  // Vessel configuration being edited
  vesselConfiguration: {},
  setVesselConfiguration: (config) => set({ vesselConfiguration: config }),
  updateMountPoint: (mountPointName, capability) => set((state) => ({
    vesselConfiguration: {
      ...state.vesselConfiguration,
      [mountPointName]: capability
    }
  })),
  clearMountPoint: (mountPointName) => set((state) => {
    const newConfig = { ...state.vesselConfiguration };
    delete newConfig[mountPointName];
    return { vesselConfiguration: newConfig };
  }),

  // Actions
  openSquadronManagement: (squadron, index) => set({
    selectedSquadronForManagement: squadron,
    selectedSquadronIndex: index,
    sortColumn: 'unit_id',
    sortDirection: 'asc'
  }),

  closeSquadronManagement: () => set({
    selectedSquadronForManagement: null,
    selectedSquadronIndex: null,
    vesselConfiguration: {},
    draggedCapability: null
  }),

  // Get compatible capabilities for a mount point type
  getCompatibleCapabilities: (mountPointType) => {
    return individualCapabilities.filter(cap =>
      cap.type === mountPointType || cap.category === mountPointType
    );
  }
}));

export default useSquadronStore;
