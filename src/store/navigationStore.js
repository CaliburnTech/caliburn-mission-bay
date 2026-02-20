import { create } from 'zustand';

// Safe localStorage wrapper (handles private browsing mode)
const safeLocalStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Silently fail in private browsing mode
    }
  }
};

// Initialize view from URL hash or localStorage, with fallback
const getInitialView = () => {
  if (typeof window === 'undefined') return 'shipyard';
  const hash = window.location.hash.replace('#', '');
  const saved = safeLocalStorage.getItem('caliburn-marketplace-view');
  // Redirect legacy 'stacks' view to 'capabilities'
  const view = hash || saved || 'shipyard';
  return view === 'stacks' ? 'capabilities' : view;
};

// Initialize fleet sub-tab (hangar vs pier)
const getInitialFleetSubTab = () => {
  if (typeof window === 'undefined') return 'pier';
  const saved = safeLocalStorage.getItem('caliburn-fleet-subtab');
  return saved || 'pier'; // Default to pier (maritime)
};

const useNavigationStore = create((set, get) => ({
  // Current view
  selectedView: getInitialView(),

  // Navigation history stack for back functionality
  viewHistory: [],

  // Fleet sub-tab: 'hangar' (aerial) or 'pier' (maritime)
  fleetSubTab: getInitialFleetSubTab(),

  // Selected squadron ID (persists across view changes for "back" navigation)
  selectedSquadronId: null,

  // Navigate to a view, pushing current view to history
  setSelectedView: (view, { skipHistory = false } = {}) => {
    const currentView = get().selectedView;

    // Don't push to history if navigating to same view or if skipHistory is true
    if (view === currentView) return;

    set((state) => ({
      selectedView: view,
      // Only push to history if not skipping (e.g., when going back)
      viewHistory: skipHistory ? state.viewHistory : [...state.viewHistory, currentView]
    }));

    if (typeof window !== 'undefined') {
      safeLocalStorage.setItem('caliburn-marketplace-view', view);
      window.history.replaceState(null, '', `#${view}`);
    }
  },

  // Go back to previous view
  goBack: (fallbackView = 'shipyard') => {
    const { viewHistory } = get();

    if (viewHistory.length > 0) {
      const previousView = viewHistory[viewHistory.length - 1];
      set((state) => ({
        selectedView: previousView,
        viewHistory: state.viewHistory.slice(0, -1)
      }));

      if (typeof window !== 'undefined') {
        safeLocalStorage.setItem('caliburn-marketplace-view', previousView);
        window.history.replaceState(null, '', `#${previousView}`);
      }
    } else {
      // No history, go to fallback
      set({ selectedView: fallbackView });
      if (typeof window !== 'undefined') {
        safeLocalStorage.setItem('caliburn-marketplace-view', fallbackView);
        window.history.replaceState(null, '', `#${fallbackView}`);
      }
    }
  },

  // Check if we can go back
  canGoBack: () => get().viewHistory.length > 0,

  // Get previous view name (for display purposes)
  getPreviousView: () => {
    const { viewHistory } = get();
    return viewHistory.length > 0 ? viewHistory[viewHistory.length - 1] : null;
  },

  setFleetSubTab: (subTab) => {
    set({ fleetSubTab: subTab });
    if (typeof window !== 'undefined') {
      safeLocalStorage.setItem('caliburn-fleet-subtab', subTab);
    }
  },

  setSelectedSquadronId: (squadronId) => {
    set({ selectedSquadronId: squadronId });
  }
}));

export default useNavigationStore;
