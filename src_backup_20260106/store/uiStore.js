import { create } from 'zustand';

const useUIStore = create((set, get) => ({
  // Expanded stack in stacks view
  expandedStack: null,
  setExpandedStack: (stack) => set({ expandedStack: stack }),

  // Expanded squadron in shipyard view
  expandedSquadron: null,
  setExpandedSquadron: (squadron) => set({ expandedSquadron: squadron }),

  // Show/hide squadrons panel in shipyard
  showSquadrons: true,
  setShowSquadrons: (show) => set({ showSquadrons: show }),

  // Cart visibility
  showCart: false,
  setShowCart: (show) => set({ showCart: show }),
  toggleCart: () => set((state) => ({ showCart: !state.showCart })),

  // Cart items
  outfitterCart: [],
  setOutfitterCart: (cart) => set({ outfitterCart: cart }),
  addToOutfitterCart: (item) => set((state) => ({
    outfitterCart: [...state.outfitterCart, item]
  })),
  removeFromOutfitterCart: (itemId) => set((state) => ({
    outfitterCart: state.outfitterCart.filter(item => item.id !== itemId)
  })),
  clearCart: () => set({ outfitterCart: [] }),

  // Selected drone/vessel in legacy views
  selectedDrone: null,
  setSelectedDrone: (drone) => set({ selectedDrone: drone }),

  // Squadron filters for legacy squadron view
  squadronFilters: {
    status: 'all',
    type: 'all',
    capability: 'all'
  },
  setSquadronFilters: (filters) => set((state) => ({
    squadronFilters: { ...state.squadronFilters, ...filters }
  })),

  // Sorting state (generic, usable by multiple views)
  sortColumn: 'unit_id',
  sortDirection: 'asc',
  setSorting: (column, direction) => set({ sortColumn: column, sortDirection: direction }),
  handleSort: (column) => {
    const state = get();
    const newDirection = state.sortColumn === column && state.sortDirection === 'asc' ? 'desc' : 'asc';
    set({ sortColumn: column, sortDirection: newDirection });
  },

  // Generic sort function for outfit arrays
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
          aValue = a.capabilities?.length || 0;
          bValue = b.capabilities?.length || 0;
          break;
        case 'missionReady':
          aValue = a.status?.missionReady || 0;
          bValue = b.status?.missionReady || 0;
          break;
        case 'deployed':
          aValue = a.status?.deployed || 0;
          bValue = b.status?.deployed || 0;
          break;
        case 'charging':
          aValue = a.status?.charging || 0;
          bValue = b.status?.charging || 0;
          break;
        default:
          aValue = a.unit_id || a.name;
          bValue = b.unit_id || b.name;
      }

      if (aValue < bValue) return state.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return state.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }
}));

export default useUIStore;
