import { create } from 'zustand';
import { navyMissionTypes, roeParameters } from '../data/deploymentData';
import { missionIcons } from '../data/iconMappings';
import { Shield } from 'lucide-react';

// Helper to resolve mission icons from iconKey
const getMissionIcon = (iconKey) => missionIcons[iconKey] || Shield;

// Transform navyMissionTypes to have actual icon components
const navyMissionTypesWithIcons = Object.fromEntries(
  Object.entries(navyMissionTypes).map(([key, value]) => [
    key,
    { ...value, icon: getMissionIcon(value.iconKey) }
  ])
);

const useDeploymentStore = create((set, get) => ({
  // Static data (available to all consumers)
  navyMissionTypes: navyMissionTypesWithIcons,
  roeParameters,

  // Modal visibility
  showDeploymentModal: false,
  setShowDeploymentModal: (show) => set({ showDeploymentModal: show }),

  // Deployment context (what's being deployed - squadron or single unit)
  deploymentContext: null,
  setDeploymentContext: (context) => set({ deploymentContext: context }),

  // Mission selection
  selectedMissionCategory: null,
  setSelectedMissionCategory: (category) => set({ selectedMissionCategory: category }),
  selectedMissionType: null,
  setSelectedMissionType: (type) => set({ selectedMissionType: type }),

  // Rules of Engagement
  selectedROE: null,
  setSelectedROE: (roe) => set({ selectedROE: roe }),

  // Deployment workflow
  deploymentStep: 'mission-select',
  setDeploymentStep: (step) => set({ deploymentStep: step }),
  selectedUnitsForDeployment: [],
  setSelectedUnitsForDeployment: (units) => set({ selectedUnitsForDeployment: units }),

  // Active deployments tracking
  activeDeployments: [],
  setActiveDeployments: (deployments) => set({ activeDeployments: deployments }),
  addActiveDeployment: (deployment) => set((state) => ({
    activeDeployments: [...state.activeDeployments, deployment]
  })),
  updateActiveDeployment: (deploymentId, updates) => set((state) => ({
    activeDeployments: state.activeDeployments.map(d =>
      d.id === deploymentId ? { ...d, ...updates } : d
    )
  })),
  removeActiveDeployment: (deploymentId) => set((state) => ({
    activeDeployments: state.activeDeployments.filter(d => d.id !== deploymentId)
  })),

  // Active deployments panel visibility
  showActiveDeployments: false,
  setShowActiveDeployments: (show) => set({ showActiveDeployments: show }),

  // Actions
  openDeploymentModal: (context) => set({
    showDeploymentModal: true,
    deploymentContext: context,
    deploymentStep: 'mission-select',
    selectedMissionCategory: null,
    selectedMissionType: null,
    selectedROE: null,
    selectedUnitsForDeployment: []
  }),

  closeDeploymentModal: () => set({
    showDeploymentModal: false,
    deploymentContext: null,
    selectedMissionCategory: null,
    selectedMissionType: null,
    selectedROE: null,
    deploymentStep: 'mission-select',
    selectedUnitsForDeployment: []
  }),

  // Execute deployment (creates active deployment)
  executeDeployment: () => {
    const state = get();
    if (!state.selectedMissionType || !state.selectedROE) return null;

    const newDeployment = {
      id: `DEP-${Date.now()}`,
      missionType: state.selectedMissionType,
      roe: state.selectedROE,
      context: state.deploymentContext,
      units: state.selectedUnitsForDeployment.length || state.deploymentContext?.totalUnits || 1,
      status: 'LAUNCHING',
      progress: 0,
      currentPhase: 'Initializing deployment sequence...',
      startTime: new Date(),
      eta: new Date(Date.now() + 300000), // 5 min default
      location: state.deploymentContext?.location || 'Unspecified'
    };

    set((s) => ({
      activeDeployments: [...s.activeDeployments, newDeployment],
      showDeploymentModal: false,
      showActiveDeployments: true
    }));

    return newDeployment;
  }
}));

export default useDeploymentStore;
