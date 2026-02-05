import { create } from 'zustand';
import { engineeringStacks, individualCapabilities } from '../data/marketplaceData';

const useMarketplaceStore = create((set, get) => ({
  // Navigation State
  selectedView: (() => {
    const saved = localStorage.getItem('caliburn-marketplace-view');
    const hash = window.location.hash.replace('#', '');
    return hash || saved || 'stacks';
  })(),
  setSelectedView: (view) => {
    set({ selectedView: view });
    localStorage.setItem('caliburn-marketplace-view', view);
    window.history.replaceState(null, '', `#${view}`);
  },

  // Search and Filter State
  searchTerm: '',
  setSearchTerm: (term) => set({ searchTerm: term }),
  selectedFilters: [],
  selectedSecurityFilters: [],
  toggleFilter: (capability) => set((state) => ({
    selectedFilters: state.selectedFilters.includes(capability)
      ? state.selectedFilters.filter(f => f !== capability)
      : [...state.selectedFilters, capability]
  })),
  clearAllFilters: () => set({ selectedFilters: [], searchTerm: '' }),

  // Outfitter State
  selectedHull: null,
  setSelectedHull: (hull) => set({ selectedHull: hull }),
  selectedMountPoint: null,
  setSelectedMountPoint: (mountPoint) => set({ selectedMountPoint: mountPoint }),
  vesselConfiguration: {},
  setVesselConfiguration: (config) => set({ vesselConfiguration: config }),
  availableSlots: [],
  setAvailableSlots: (slots) => set({ availableSlots: slots }),
  selectedCategory: null,
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  selectedCapabilityDetails: null,
  setSelectedCapabilityDetails: (details) => set({ selectedCapabilityDetails: details }),
  slotPositions: {},
  setSlotPositions: (positions) => set({ slotPositions: positions }),

  // Cart State
  outfitterCart: [],
  setOutfitterCart: (cart) => set({ outfitterCart: cart }),
  addToOutfitterCart: (item) => set((state) => ({
    outfitterCart: [...state.outfitterCart, item]
  })),
  showCart: false,
  setShowCart: (show) => set({ showCart: show }),
  toggleCart: () => set((state) => ({ showCart: !state.showCart })),

  // UI State
  expandedStack: null,
  setExpandedStack: (stack) => set({ expandedStack: stack }),
  expandedFleet: null,
  setExpandedFleet: (fleet) => set({ expandedFleet: fleet }),
  isFullScreenConfig: false,
  setIsFullScreenConfig: (fullScreen) => set({ isFullScreenConfig: fullScreen }),
  draggedCapability: null,
  setDraggedCapability: (capability) => set({ draggedCapability: capability }),

  // Fleet Management State
  selectedFleetForManagement: null,
  setSelectedFleetForManagement: (fleet) => set({ selectedFleetForManagement: fleet }),
  sortColumn: 'unit_id',
  sortDirection: 'asc',
  setSorting: (column, direction) => set({ sortColumn: column, sortDirection: direction }),

  // Deployment State
  showDeploymentModal: false,
  setShowDeploymentModal: (show) => set({ showDeploymentModal: show }),
  deploymentContext: null,
  setDeploymentContext: (context) => set({ deploymentContext: context }),
  selectedMissionType: null,
  setSelectedMissionType: (type) => set({ selectedMissionType: type }),
  selectedROE: null,
  setSelectedROE: (roe) => set({ selectedROE: roe }),
  deploymentStep: 'mission-select',
  setDeploymentStep: (step) => set({ deploymentStep: step }),
  selectedUnitsForDeployment: [],
  setSelectedUnitsForDeployment: (units) => set({ selectedUnitsForDeployment: units }),
  activeDeployments: [],
  setActiveDeployments: (deployments) => set({ activeDeployments: deployments }),
  showActiveDeployments: false,
  setShowActiveDeployments: (show) => set({ showActiveDeployments: show }),

  // Actions
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

  removeSlot: (slotId) => {
    const state = get();
    set((state) => ({
      availableSlots: state.availableSlots.filter(slot => slot.id !== slotId)
    }));
    
    // Also remove any configuration for this slot
    if (state.selectedHull) {
      set((state) => {
        const updated = { ...state.vesselConfiguration };
        if (updated[state.selectedHull.name]) {
          delete updated[state.selectedHull.name][slotId];
        }
        return { vesselConfiguration: updated };
      });
    }
  },

  updateSlotPosition: (slotId, x, y) => {
    set((state) => ({
      slotPositions: {
        ...state.slotPositions,
        [slotId]: { x, y }
      }
    }));
  },

  equipCapability: (mountPoint, capability) => {
    const state = get();
    if (!state.selectedHull) return;
    
    set((state) => ({
      vesselConfiguration: {
        ...state.vesselConfiguration,
        [state.selectedHull.name]: {
          ...state.vesselConfiguration[state.selectedHull.name],
          [mountPoint]: capability
        }
      },
      selectedMountPoint: null
    }));
  },

  unequipMountPoint: (mountPoint) => {
    const state = get();
    if (!state.selectedHull) return;
    
    set((state) => {
      const updated = { ...state.vesselConfiguration };
      if (updated[state.selectedHull.name]) {
        delete updated[state.selectedHull.name][mountPoint];
      }
      return { vesselConfiguration: updated };
    });
  },

  getCompatibleCapabilities: (mountPointType) => {
    if (mountPointType === 'DRONE_STACK') {
      // Return drone stacks when available
      return [];
    }
    
    const compatibleIndividualCaps = individualCapabilities.filter(cap => cap.category === mountPointType);
    const compatibleStacks = engineeringStacks.filter(stack => stack.category === mountPointType);
    
    return [...compatibleStacks, ...compatibleIndividualCaps];
  },

  handleSort: (column) => {
    const state = get();
    const newDirection = state.sortColumn === column && state.sortDirection === 'asc' ? 'desc' : 'asc';
    set({ sortColumn: column, sortDirection: newDirection });
  },

  getSortedOutfits: (outfits) => {
    const state = get();
    if (!outfits) return [];
    
    return [...outfits].sort((a, b) => {
      let aValue, bValue;
      
      switch (state.sortColumn) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'count':
          aValue = a.count;
          bValue = b.count;
          break;
        case 'capabilities':
          aValue = a.capabilities.length;
          bValue = b.capabilities.length;
          break;
        case 'missionReady':
          aValue = a.status.missionReady;
          bValue = b.status.missionReady;
          break;
        case 'deployed':
          aValue = a.status.deployed;
          bValue = b.status.deployed;
          break;
        case 'charging':
          aValue = a.status.charging;
          bValue = b.status.charging;
          break;
        default:
          aValue = a.unit_id;
          bValue = b.unit_id;
      }
      
      if (aValue < bValue) return state.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return state.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  },

  getFilteredItems: (items) => {
    const state = get();
    let filtered = items;

    // Apply search filter
    if (state.searchTerm && state.searchTerm.length >= 2) {
      filtered = filtered.filter(item => {
        const searchLower = state.searchTerm.toLowerCase();
        const nameMatch = item.name.toLowerCase().includes(searchLower);
        const providerMatch = item.provider.toLowerCase().includes(searchLower);
        const descriptionMatch = item.description?.toLowerCase().includes(searchLower);
        
        return nameMatch || providerMatch || descriptionMatch;
      });
    }

    // Apply capability filters
    if (state.selectedFilters.length > 0) {
      filtered = filtered.filter(item => 
        state.selectedFilters.some(filter => {
          if (item.capabilityRefs) {
            return item.capabilityRefs.some(ref => 
              ref.toLowerCase().includes(filter.toLowerCase())
            );
          }
          if (item.category) {
            return item.category.toLowerCase().includes(filter.toLowerCase());
          }
          return false;
        })
      );
    }

    return filtered;
  },

  initiateDeployment: (context) => {
    set({
      deploymentContext: context,
      showDeploymentModal: true,
      deploymentStep: 'mission-select'
    });
  },

  executeDeployment: () => {
    const state = get();
    if (!state.selectedMissionType || !state.selectedROE || state.selectedUnitsForDeployment.length === 0) {
      return;
    }

    const deploymentId = `dep-${Date.now()}`;
    const newDeployment = {
      id: deploymentId,
      missionType: state.selectedMissionType,
      roe: state.selectedROE,
      units: state.selectedUnitsForDeployment,
      startTime: new Date().toISOString(),
      status: 'active',
      progress: 0
    };

    set((state) => ({
      activeDeployments: [...state.activeDeployments, newDeployment],
      showDeploymentModal: false,
      selectedMissionType: null,
      selectedROE: null,
      selectedUnitsForDeployment: [],
      deploymentStep: 'mission-select'
    }));

    // Simulate deployment progress
    get().simulateDeploymentProgress(deploymentId);
  },

  simulateDeploymentProgress: (deploymentId) => {
    const updateProgress = () => {
      set((state) => ({
        activeDeployments: state.activeDeployments.map(dep =>
          dep.id === deploymentId
            ? { ...dep, progress: Math.min(dep.progress + Math.random() * 15, 100) }
            : dep
        )
      }));
      
      const deployment = get().activeDeployments.find(d => d.id === deploymentId);
      if (deployment && deployment.progress < 100) {
        setTimeout(updateProgress, 2000);
      }
    };
    
    setTimeout(updateProgress, 1000);
  },

  navigateToCapability: (capabilityName) => {
    set({
      selectedView: 'capabilities',
      searchTerm: capabilityName
    });
    localStorage.setItem('caliburn-marketplace-view', 'capabilities');
    window.history.replaceState(null, '', '#capabilities');
  }
}));

export default useMarketplaceStore;