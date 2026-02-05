import { create } from 'zustand';
import { swarmSquadrons, squadronUnitConfigurations } from '../data/fleetData';
import { individualCapabilities, engineeringStacks } from '../data/marketplaceData';
import { vesselMountPoints } from '../data/vesselData';

const useSquadronStore = create((set, get) => ({
  // Static data (available to all consumers)
  swarmSquadrons,
  squadronUnitConfigurations,
  vesselMountPoints,

  // Get capabilities available for outfitting (from marketplace data)
  getAvailableCapabilities: () => individualCapabilities,
  getAvailableStacks: () => engineeringStacks,

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

  // Get sorted outfits for current squadron
  getSortedOutfits: () => {
    const state = get();
    const { selectedSquadronIndex, sortColumn, sortDirection } = state;
    if (selectedSquadronIndex === null) return [];

    const config = squadronUnitConfigurations[selectedSquadronIndex];
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
