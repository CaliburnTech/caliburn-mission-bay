import { create } from 'zustand';
import { initialMissions } from '../data/missionsData';

const useMissionStore = create((set) => ({
  // Mission template selection
  selectedMissionTemplate: null,
  setSelectedMissionTemplate: (template) => set({ selectedMissionTemplate: template }),

  // Mission flow builder - nodes
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

  // Mission flow builder - connections
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

  // Mission planner configuration form
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
      status: missionData.status || 'draft',
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
      assignedSquadrons: [],
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

  // Load a mission template into the planner
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

  // Clear mission planner state
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

  // Legacy support - saved mission plans
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
  }))
}));

export default useMissionStore;
