import { create } from 'zustand';
import { engineeringStacks, individualCapabilities } from '../data/marketplaceData';
import { fleetVessels } from '../data/fleetVessels';
import { initialMissions } from '../data/missionsData';

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
  setSelectedSecurityFilters: (filters) => set({ selectedSecurityFilters: filters }),
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
  expandedSquadron: null,
  setExpandedSquadron: (fleet) => set({ expandedSquadron: fleet }),
  showSquadrons: true,
  setShowSquadrons: (show) => set({ showSquadrons: show }),
  isFullScreenConfig: false,
  setIsFullScreenConfig: (fullScreen) => set({ isFullScreenConfig: fullScreen }),
  draggedCapability: null,
  setDraggedCapability: (capability) => set({ draggedCapability: capability }),

  // Squadron Management State
  selectedSquadronForManagement: null,
  setSelectedSquadronForManagement: (fleet) => set({ selectedSquadronForManagement: fleet }),
  sortColumn: 'unit_id',
  sortDirection: 'asc',
  setSorting: (column, direction) => set({ sortColumn: column, sortDirection: direction }),

  // Deployment State
  showDeploymentModal: false,
  setShowDeploymentModal: (show) => set({ showDeploymentModal: show }),
  deploymentContext: null,
  setDeploymentContext: (context) => set({ deploymentContext: context }),
  selectedMissionCategory: null,
  setSelectedMissionCategory: (category) => set({ selectedMissionCategory: category }),
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

  // Fleet/Squadron - Real vessels linked to Shipyard configurations
  droneSquadron: fleetVessels,
  selectedDrone: null,
  setSelectedDrone: (drone) => set({ selectedDrone: drone }),
  squadronFilters: {
    status: 'all', // all | mission-ready | deployed | returned | maintenance
    type: 'all', // all | reconnaissance | attack | logistics | etc
    capability: 'all'
  },
  setSquadronFilters: (filters) => set((state) => ({
    squadronFilters: { ...state.squadronFilters, ...filters }
  })),

  // Mission Planner State
  selectedMissionTemplate: null,
  setSelectedMissionTemplate: (template) => set({ selectedMissionTemplate: template }),
  missionFlowNodes: [],
  setMissionFlowNodes: (nodes) => set({ missionFlowNodes: nodes }),
  addMissionFlowNode: (node) => set((state) => ({
    missionFlowNodes: [...state.missionFlowNodes, node]
  })),
  updateMissionFlowNode: (nodeId, updates) => set((state) => ({
    missionFlowNodes: state.missionFlowNodes.map(node =>
      node.id === nodeId ? { ...node, ...updates } : node
    )
  })),
  removeMissionFlowNode: (nodeId) => set((state) => ({
    missionFlowNodes: state.missionFlowNodes.filter(node => node.id !== nodeId),
    missionFlowConnections: state.missionFlowConnections.filter(
      conn => conn.from !== nodeId && conn.to !== nodeId
    )
  })),
  missionFlowConnections: [],
  setMissionFlowConnections: (connections) => set({ missionFlowConnections: connections }),
  addMissionFlowConnection: (connection) => set((state) => ({
    missionFlowConnections: [...state.missionFlowConnections, connection]
  })),
  removeMissionFlowConnection: (fromId, toId) => set((state) => ({
    missionFlowConnections: state.missionFlowConnections.filter(
      conn => !(conn.from === fromId && conn.to === toId)
    )
  })),
  missionPlannerConfig: {
    name: '',
    duration: '',
    priority: 'medium',
    roe: null,
    assignedSquadrons: [],
    endConditions: []
  },
  setMissionPlannerConfig: (config) => set((state) => ({
    missionPlannerConfig: { ...state.missionPlannerConfig, ...config }
  })),
  resetMissionPlannerConfig: () => set({
    missionPlannerConfig: {
      name: '',
      duration: '',
      priority: 'medium',
      roe: null,
      assignedSquadrons: [],
      endConditions: []
    }
  }),
  // Mission Library - all missions with states
  missions: initialMissions,

  // Save a new mission (draft or ready to deploy)
  saveMission: (missionData) => set((state) => {
    const mission = {
      ...missionData,
      id: `mission-${Date.now()}`,
      status: missionData.status || 'draft', // draft | ready | active | paused | completed | archived
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      launchedAt: null,
      completedAt: null,
      assignedSquadrons: missionData.assignedSquadrons || [],
      history: [{
        action: 'created',
        timestamp: new Date().toISOString(),
        details: 'Mission created'
      }]
    };
    return { missions: [...state.missions, mission] };
  }),

  // Update existing mission
  updateMission: (missionId, updates) => set((state) => ({
    missions: state.missions.map(m =>
      m.id === missionId
        ? {
            ...m,
            ...updates,
            updatedAt: new Date().toISOString(),
            history: [...(m.history || []), {
              action: 'updated',
              timestamp: new Date().toISOString(),
              details: updates.historyNote || 'Mission updated'
            }]
          }
        : m
    )
  })),

  // Launch mission (draft/ready -> active)
  launchMission: (missionId) => set((state) => ({
    missions: state.missions.map(m =>
      m.id === missionId
        ? {
            ...m,
            status: 'active',
            launchedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            history: [...(m.history || []), {
              action: 'launched',
              timestamp: new Date().toISOString(),
              details: `Mission launched with ${m.assignedSquadrons?.length || 0} squadron(s)`
            }]
          }
        : m
    )
  })),

  // Complete mission
  completeMission: (missionId) => set((state) => ({
    missions: state.missions.map(m =>
      m.id === missionId
        ? {
            ...m,
            status: 'completed',
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            history: [...(m.history || []), {
              action: 'completed',
              timestamp: new Date().toISOString(),
              details: 'Mission completed'
            }]
          }
        : m
    )
  })),

  // Clone mission
  cloneMission: (missionId) => set((state) => {
    const original = state.missions.find(m => m.id === missionId);
    if (!original) return state;

    const cloned = {
      ...original,
      id: `mission-${Date.now()}`,
      name: `${original.name} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      launchedAt: null,
      completedAt: null,
      assignedSquadrons: [], // Don't clone squadron assignments
      history: [{
        action: 'cloned',
        timestamp: new Date().toISOString(),
        details: `Cloned from ${original.name}`
      }]
    };
    return { missions: [...state.missions, cloned] };
  }),

  // Swap squadrons on active mission
  swapMissionSquadrons: (missionId, oldSquadronId, newSquadronId) => set((state) => ({
    missions: state.missions.map(m => {
      if (m.id !== missionId) return m;
      const newAssigned = m.assignedSquadrons.map(s => s === oldSquadronId ? newSquadronId : s);
      return {
        ...m,
        assignedSquadrons: newAssigned,
        updatedAt: new Date().toISOString(),
        history: [...(m.history || []), {
          action: 'squadron_swap',
          timestamp: new Date().toISOString(),
          details: `Swapped squadron ${oldSquadronId} for ${newSquadronId}`
        }]
      };
    })
  })),

  // Delete mission (only drafts)
  deleteMission: (missionId) => set((state) => ({
    missions: state.missions.filter(m => m.id !== missionId)
  })),

  // Archive mission
  archiveMission: (missionId) => set((state) => ({
    missions: state.missions.map(m =>
      m.id === missionId ? { ...m, status: 'archived', updatedAt: new Date().toISOString() } : m
    )
  })),

  // Legacy support - keep savedMissionPlans for backwards compat
  savedMissionPlans: [],
  saveMissionPlan: (plan) => set((state) => ({
    savedMissionPlans: [...state.savedMissionPlans, {
      ...plan,
      id: `plan-${Date.now()}`,
      createdAt: new Date().toISOString()
    }]
  })),
  deleteMissionPlan: (planId) => set((state) => ({
    savedMissionPlans: state.savedMissionPlans.filter(plan => plan.id !== planId)
  })),
  loadMissionTemplate: (templateKey, template) => {
    set({
      selectedMissionTemplate: templateKey,
      missionFlowNodes: template.nodes ? [...template.nodes] : [],
      missionFlowConnections: template.connections ? [...template.connections] : [],
      missionPlannerConfig: {
        name: template.name || '',
        duration: '',
        priority: 'medium',
        roe: null,
        assignedSquadrons: [],
        endConditions: []
      }
    });
  },
  clearMissionPlanner: () => set({
    selectedMissionTemplate: null,
    missionFlowNodes: [],
    missionFlowConnections: [],
    missionPlannerConfig: {
      name: '',
      duration: '',
      priority: 'medium',
      roe: null,
      assignedSquadrons: [],
      endConditions: []
    }
  }),

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
      deploymentStep: 'mission-select',
      selectedUnitsForDeployment: []
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

  // Track active deployment timers to allow cleanup
  _deploymentTimers: {},

  simulateDeploymentProgress: (deploymentId) => {
    // Clear any existing timer for this deployment
    const timers = get()._deploymentTimers;
    if (timers[deploymentId]) {
      clearTimeout(timers[deploymentId]);
    }

    const updateProgress = () => {
      const state = get();
      const deployment = state.activeDeployments.find(d => d.id === deploymentId);

      // Stop if deployment no longer exists or is complete
      if (!deployment || deployment.progress >= 100) {
        const { [deploymentId]: removed, ...remainingTimers } = state._deploymentTimers;
        set({ _deploymentTimers: remainingTimers });
        return;
      }

      set((state) => ({
        activeDeployments: state.activeDeployments.map(dep =>
          dep.id === deploymentId
            ? { ...dep, progress: Math.min(dep.progress + Math.random() * 15, 100) }
            : dep
        )
      }));

      // Schedule next update
      const timerId = setTimeout(updateProgress, 2000);
      set((state) => ({
        _deploymentTimers: { ...state._deploymentTimers, [deploymentId]: timerId }
      }));
    };

    // Start the progress simulation
    const timerId = setTimeout(updateProgress, 1000);
    set((state) => ({
      _deploymentTimers: { ...state._deploymentTimers, [deploymentId]: timerId }
    }));
  },

  // Cleanup function to cancel all deployment timers
  cancelDeploymentProgress: (deploymentId) => {
    const timers = get()._deploymentTimers;
    if (timers[deploymentId]) {
      clearTimeout(timers[deploymentId]);
      const { [deploymentId]: removed, ...remainingTimers } = timers;
      set({ _deploymentTimers: remainingTimers });
    }
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