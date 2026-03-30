import { create } from 'zustand';
import useDataStore from '../providers/dataStore';
// Fallback imports for before dataStore is initialized
import { engineeringStacks, individualCapabilities } from '../data/marketplaceData';
import { vesselHullData, vesselMountPoints, globalBaselines } from '../data/vesselData';
import useConfigurationStore from './configurationStore';

// Data access helpers — use dataStore when ready, fall back to static imports
const getData = () => {
  const ds = useDataStore.getState();
  if (ds.isReady) {
    return {
      vessels: ds.vessels,
      capabilities: ds.capabilities,
      stacks: ds.stacks,
      mountPoints: ds.adapter?.getVesselMountPoints?.() || vesselMountPoints,
      baselines: ds.globalBaselines || globalBaselines
    };
  }
  return {
    vessels: vesselHullData,
    capabilities: individualCapabilities,
    stacks: engineeringStacks,
    mountPoints: vesselMountPoints,
    baselines: globalBaselines
  };
};

// Restore selectedHull from localStorage on init
const restoreSelectedHull = () => {
  try {
    const saved = localStorage.getItem('caliburn-selected-hull');
    if (saved) {
      const hullName = JSON.parse(saved);
      return getData().vessels.find(h => h.name === hullName) || null;
    }
  } catch { /* ignore */ }
  return null;
};

const useOutfitterStore = create((set, get) => ({
  // Hull selection (persisted to localStorage for refresh survival)
  selectedHull: restoreSelectedHull(),
  setSelectedHull: (hull) => {
    set({ selectedHull: hull });
    try {
      if (hull) {
        localStorage.setItem('caliburn-selected-hull', JSON.stringify(hull.name));
      } else {
        localStorage.removeItem('caliburn-selected-hull');
      }
    } catch { /* ignore in private browsing */ }
  },

  // Load a saved configuration into the outfitter
  // Takes a squadron and configuration object, sets up the hull and pre-populates capabilities
  // This now uses the unified configurationStore for LoadoutBuilder compatibility
  loadSavedConfiguration: (squadron, configOutfit) => {
    // Find the actual vessel using squadron icon
    const vessel = getData().vessels.find(v =>
      v.name === squadron.icon || v.icon === squadron.icon
    );

    if (!vessel) {
      console.warn('Could not find vessel for squadron:', squadron.icon);
      return false;
    }

    // Use the unified configuration store to load the configuration
    // This ensures LoadoutBuilder will have access to the capabilities
    const configStore = useConfigurationStore.getState();
    configStore.loadFromFleetData(squadron, configOutfit);

    // Also set the selectedHull in outfitterStore for navigation
    set({
      selectedHull: vessel,
      selectedMountPoint: null,
      selectedCategory: null
    });
    try { localStorage.setItem('caliburn-selected-hull', JSON.stringify(vessel.name)); } catch { /* */ }

    return true;
  },

  // Mount point selection
  selectedMountPoint: null,
  setSelectedMountPoint: (mountPoint) => set({ selectedMountPoint: mountPoint }),

  // Vessel configuration (hull -> mountPoint -> capability)
  vesselConfiguration: {},
  setVesselConfiguration: (config) => set({ vesselConfiguration: config }),

  // Custom slots that can be added to vessels
  availableSlots: [],
  setAvailableSlots: (slots) => set({ availableSlots: slots }),

  // Category filter for capability browser
  selectedCategory: null,
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  // Capability details modal
  selectedCapabilityDetails: null,
  setSelectedCapabilityDetails: (details) => set({ selectedCapabilityDetails: details }),

  // Custom slot positions (for drag-drop repositioning)
  slotPositions: {},
  setSlotPositions: (positions) => set({ slotPositions: positions }),

  // Full screen configuration view
  isFullScreenConfig: false,
  setIsFullScreenConfig: (fullScreen) => set({ isFullScreenConfig: fullScreen }),

  // Drag state for capability cards
  draggedCapability: null,
  setDraggedCapability: (capability) => set({ draggedCapability: capability }),

  // Move mode - for relocating equipped capabilities to different mounts
  movingFromMount: null,
  setMovingFromMount: (mountPoint) => set({ movingFromMount: mountPoint }),

  // Move a capability from one mount to another
  moveCapability: (fromMount, toMount) => {
    const state = get();
    if (!state.selectedHull || !fromMount || !toMount) return;

    const hullName = state.selectedHull.name;
    const capability = state.vesselConfiguration[hullName]?.[fromMount];

    if (!capability) return;

    set((s) => {
      const updated = { ...s.vesselConfiguration };
      if (!updated[hullName]) updated[hullName] = {};

      // Remove from old mount
      delete updated[hullName][fromMount];

      // Add to new mount
      updated[hullName][toMount] = capability;

      return {
        vesselConfiguration: updated,
        movingFromMount: null,
        selectedMountPoint: null
      };
    });
  },

  // Add a new custom slot to current hull
  addNewSlot: () => {
    const state = get();
    if (!state.selectedHull) return;

    const newSlotId = `custom-slot-${Date.now()}`;
    const newSlot = {
      id: newSlotId,
      name: `Custom Mount ${state.availableSlots.length + 1}`,
      type: 'MODULAR',
      x: 50 + (Math.random() * 30 - 15),
      y: 50 + (Math.random() * 30 - 15),
      category: 'Custom Systems',
      isCustom: true
    };

    set((state) => ({
      availableSlots: [...state.availableSlots, newSlot]
    }));
  },

  // Remove a custom slot
  removeSlot: (slotId) => {
    const state = get();
    set((s) => ({
      availableSlots: s.availableSlots.filter(slot => slot.id !== slotId)
    }));

    // Also remove any configuration for this slot
    if (state.selectedHull) {
      set((s) => {
        const updated = { ...s.vesselConfiguration };
        if (updated[state.selectedHull.name]) {
          delete updated[state.selectedHull.name][slotId];
        }
        return { vesselConfiguration: updated };
      });
    }
  },

  // Update position of a custom slot
  updateSlotPosition: (slotId, x, y) => {
    set((state) => ({
      slotPositions: {
        ...state.slotPositions,
        [slotId]: { x, y }
      }
    }));
  },

  // Equip a capability to a mount point
  equipCapability: (mountPoint, capability) => {
    const state = get();
    if (!state.selectedHull) return;

    set((s) => ({
      vesselConfiguration: {
        ...s.vesselConfiguration,
        [state.selectedHull.name]: {
          ...s.vesselConfiguration[state.selectedHull.name],
          [mountPoint]: capability
        }
      },
      selectedMountPoint: null
    }));
  },

  // Remove capability from a mount point
  unequipMountPoint: (mountPoint) => {
    const state = get();
    if (!state.selectedHull) return;

    set((s) => {
      const updated = { ...s.vesselConfiguration };
      if (updated[state.selectedHull.name]) {
        delete updated[state.selectedHull.name][mountPoint];
      }
      return { vesselConfiguration: updated };
    });
  },

  // Get capabilities compatible with a mount point type
  getCompatibleCapabilities: (mountPointType) => {
    if (mountPointType === 'DRONE_STACK') {
      return [];
    }

    const { capabilities: caps, stacks } = getData();
    const compatibleIndividualCaps = caps.filter(
      cap => cap.category === mountPointType
    );
    const compatibleStacks = stacks.filter(
      stack => stack.category === mountPointType
    );

    return [...compatibleStacks, ...compatibleIndividualCaps];
  },

  // Check if a capability is compatible with a mount point
  // Returns { compatible: boolean, warnings: string[] }
  checkCompatibility: (capability, mountPointName) => {
    const state = get();
    if (!state.selectedHull || !capability) {
      return { compatible: true, warnings: [] };
    }

    const warnings = [];
    const hullName = state.selectedHull.name;
    const mountPoints = getData().mountPoints[hullName];
    const mountPoint = mountPoints?.[mountPointName];
    const hullData = getData().vessels.find(h => h.name === hullName);

    if (!mountPoint || !hullData) {
      return { compatible: true, warnings: [] };
    }

    // Check mount point constraints if they exist
    if (mountPoint.constraints) {
      const capSwap = capability.swap || {};

      if (mountPoint.constraints.maxWeight && capSwap.weight > mountPoint.constraints.maxWeight) {
        warnings.push(`Weight: ${capSwap.weight}kg exceeds mount limit of ${mountPoint.constraints.maxWeight}kg`);
      }

      if (mountPoint.constraints.maxPower && capSwap.power > mountPoint.constraints.maxPower) {
        warnings.push(`Power: ${capSwap.power}kW exceeds mount limit of ${mountPoint.constraints.maxPower}kW`);
      }

      // Size compatibility check
      const sizeOrder = ['small', 'medium', 'large', 'xlarge'];
      if (mountPoint.constraints.maxSize && capSwap.size) {
        const maxSizeIdx = sizeOrder.indexOf(mountPoint.constraints.maxSize);
        const capSizeIdx = sizeOrder.indexOf(capSwap.size);
        if (capSizeIdx > maxSizeIdx) {
          warnings.push(`Size: ${capSwap.size} too large for ${mountPoint.constraints.maxSize} mount`);
        }
      }
    }

    // Check vessel capacity limits
    const currentConfig = state.vesselConfiguration[hullName] || {};
    let totalWeight = 0;
    let totalPower = 0;

    // Sum up all equipped capabilities
    Object.values(currentConfig).forEach(equippedCap => {
      if (equippedCap?.swap) {
        totalWeight += equippedCap.swap.weight || 0;
        totalPower += equippedCap.swap.power || 0;
      }
    });

    // Add the proposed capability
    const capSwap = capability.swap || {};
    totalWeight += capSwap.weight || 0;
    totalPower += capSwap.power || 0;

    // Check against hull capacity
    if (hullData.capacity) {
      if (hullData.capacity.totalWeight && totalWeight > hullData.capacity.totalWeight) {
        warnings.push(`Total weight (${totalWeight}kg) exceeds hull capacity (${hullData.capacity.totalWeight}kg)`);
      }
      if (hullData.capacity.totalPower && totalPower > hullData.capacity.totalPower) {
        warnings.push(`Total power (${totalPower.toFixed(1)}kW) exceeds hull capacity (${hullData.capacity.totalPower}kW)`);
      }
    }

    // Return compatible=true with warnings (warn but allow per plan)
    return {
      compatible: true,
      warnings
    };
  },

  // Calculate weight balance based on mount point positions
  // Returns { centerOfMass: {x, y}, offset: number, status: 'balanced'|'warning'|'critical' }
  calculateBalance: () => {
    const state = get();
    if (!state.selectedHull) return null;

    const hullName = state.selectedHull.name;
    const mountPoints = getData().mountPoints[hullName];
    const currentConfig = state.vesselConfiguration[hullName] || {};

    if (!mountPoints) return null;

    // Center of vessel is at (50, 50)
    const center = { x: 50, y: 50 };
    let totalWeight = 0;
    let weightedX = 0;
    let weightedY = 0;

    // Calculate weighted center of mass
    Object.entries(currentConfig).forEach(([mountName, capability]) => {
      const mountPoint = mountPoints[mountName];
      if (!mountPoint || !capability?.swap?.weight) return;

      const weight = capability.swap.weight;
      if (weight <= 0) return;

      totalWeight += weight;
      weightedX += mountPoint.x * weight;
      weightedY += mountPoint.y * weight;
    });

    // If no weight, vessel is balanced
    if (totalWeight === 0) {
      return {
        centerOfMass: center,
        offset: 0,
        offsetX: 0,
        offsetY: 0,
        status: 'balanced',
        totalWeight: 0
      };
    }

    // Calculate center of mass
    const comX = weightedX / totalWeight;
    const comY = weightedY / totalWeight;

    // Calculate offset from center (as percentage, max ~50)
    const offsetX = comX - center.x;
    const offsetY = comY - center.y;
    const offset = Math.sqrt(offsetX * offsetX + offsetY * offsetY);

    // Determine status based on offset
    // Small vessels are more sensitive to imbalance
    const hullData = getData().vessels.find(h => h.name === hullName);
    const isSmallVessel = hullData?.type?.includes('Small') || hullData?.displacement?.includes('< 5');
    const warningThreshold = isSmallVessel ? 8 : 15;
    const criticalThreshold = isSmallVessel ? 15 : 25;

    let status = 'balanced';
    if (offset > criticalThreshold) {
      status = 'critical';
    } else if (offset > warningThreshold) {
      status = 'warning';
    }

    return {
      centerOfMass: { x: comX, y: comY },
      offset: Math.round(offset),
      offsetX: Math.round(offsetX),
      offsetY: Math.round(offsetY),
      status,
      totalWeight
    };
  },

  // Calculate vessel stats based on real unit specs + equipped capabilities
  // Returns stats in real units (knots, nm, kW, kg, m²)
  calculateVesselStats: () => {
    const state = get();
    if (!state.selectedHull) {
      return null;
    }

    const hullName = state.selectedHull.name;
    const hullData = getData().vessels.find(h => h.name === hullName);

    if (!hullData?.specs) {
      return null;
    }

    // Base specs in real units
    const baseSpecs = {
      speed: hullData.specs.speed || 0,           // knots
      range: hullData.specs.range || 0,           // nm
      rcs: hullData.specs.rcs || 1,               // m²
    };

    // Base capacity from hull
    const baseCapacity = {
      power: hullData.capacity?.totalPower || 0,  // kW available
      payload: hullData.capacity?.totalWeight || 0 // kg capacity
    };

    // Track deltas from capabilities
    const deltas = { speed: 0, range: 0, rcs: 0 };
    // Track used (consumed) and provided (added capacity)
    const consumed = { power: 0, payload: 0 };
    const provided = { power: 0, payload: 0 };
    const unknownImpacts = [];

    // Sum up all equipped capability impacts
    const currentConfig = state.vesselConfiguration[hullName] || {};
    Object.values(currentConfig).forEach((capability) => {
      // SWaP - negative values mean capability PROVIDES resource
      if (capability?.swap) {
        const powerValue = capability.swap.power || 0;
        const weightValue = capability.swap.weight || 0;

        if (powerValue < 0) {
          // Negative power = provides power (like a battery pack)
          provided.power += Math.abs(powerValue);
        } else {
          // Positive power = consumes power
          consumed.power += powerValue;
        }

        if (weightValue < 0) {
          // Negative weight = reduces weight / increases capacity (like carbon fiber)
          provided.payload += Math.abs(weightValue);
        } else {
          // Positive weight = uses payload capacity
          consumed.payload += weightValue;
        }
      }

      // Performance impacts (in real units)
      if (capability?.statImpacts) {
        // Map old stat names to new ones
        if (capability.statImpacts.speed !== undefined) {
          deltas.speed += capability.statImpacts.speed;
        }
        if (capability.statImpacts.range !== undefined) {
          deltas.range += capability.statImpacts.range;
        }
        // RCS can come from 'stealth' (inverted) or 'rcs' (direct)
        if (capability.statImpacts.rcs !== undefined) {
          deltas.rcs += capability.statImpacts.rcs;
        } else if (capability.statImpacts.stealth !== undefined) {
          // Old format: stealth was 0-100 scale, positive = stealthier
          // Convert: +5 stealth ≈ -0.5 rcs (reduces signature)
          deltas.rcs -= capability.statImpacts.stealth * 0.1;
        }
      } else if (capability && !capability.statImpacts) {
        unknownImpacts.push(capability.name);
      }
    });

    // Calculate total capacity (base + provided)
    const totalCapacity = {
      power: baseCapacity.power + provided.power,
      payload: baseCapacity.payload + provided.payload
    };

    // Calculate current values
    const current = {
      speed: Math.max(0, baseSpecs.speed + deltas.speed),
      range: Math.max(0, baseSpecs.range + deltas.range),
      rcs: Math.max(0.001, baseSpecs.rcs + deltas.rcs), // RCS can't be 0
    };

    // For power/payload: show used vs total
    const used = {
      power: consumed.power,
      payload: consumed.payload
    };

    // Determine status for each stat
    const bl = getData().baselines;
    const status = {
      speed: current.speed < bl.speed.criticalLow ? 'critical' :
             current.speed < bl.speed.baseline * 0.5 ? 'warning' : 'normal',
      range: current.range < bl.range.criticalLow ? 'critical' :
             current.range < bl.range.baseline * 0.5 ? 'warning' : 'normal',
      power: used.power > totalCapacity.power ? 'critical' :
             used.power > totalCapacity.power * 0.9 ? 'warning' : 'normal',
      payload: used.payload > totalCapacity.payload ? 'critical' :
               used.payload > totalCapacity.payload * 0.9 ? 'warning' : 'normal',
      signature: current.rcs > bl.signature.highSignature ? 'critical' :
                 current.rcs > bl.signature.baseline ? 'warning' : 'normal'
    };

    return {
      baseSpecs,
      baseCapacity,
      totalCapacity,
      current,
      deltas,
      used,
      provided,
      status,
      unknownImpacts,
      baselines: getData().baselines
    };
  },

  // Reset outfitter state (when leaving outfitter view)
  resetOutfitter: () => {
    try { localStorage.removeItem('caliburn-selected-hull'); } catch { /* */ }
    set({
      selectedHull: null,
      selectedMountPoint: null,
      selectedCategory: null,
      isFullScreenConfig: false,
      draggedCapability: null
    });
  }
}));

export default useOutfitterStore;
