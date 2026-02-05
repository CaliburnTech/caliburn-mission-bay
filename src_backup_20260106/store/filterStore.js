import { create } from 'zustand';

const useFilterStore = create((set, get) => ({
  // Search state
  searchTerm: '',
  setSearchTerm: (term) => set({ searchTerm: term }),

  // Capability filters
  selectedFilters: [],
  toggleFilter: (capability) => set((state) => ({
    selectedFilters: state.selectedFilters.includes(capability)
      ? state.selectedFilters.filter(f => f !== capability)
      : [...state.selectedFilters, capability]
  })),

  // Security level filters
  selectedSecurityFilters: [],
  setSelectedSecurityFilters: (filters) => set({ selectedSecurityFilters: filters }),

  // Clear all filters
  clearAllFilters: () => set({
    selectedFilters: [],
    selectedSecurityFilters: [],
    searchTerm: ''
  }),

  // Filter items by search term and selected filters
  getFilteredItems: (items) => {
    const state = get();
    let filtered = items;

    // Apply search filter
    if (state.searchTerm && state.searchTerm.length >= 2) {
      filtered = filtered.filter(item => {
        const searchLower = state.searchTerm.toLowerCase();
        const nameMatch = item.name?.toLowerCase().includes(searchLower);
        const providerMatch = item.provider?.toLowerCase().includes(searchLower);
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
  }
}));

export default useFilterStore;
