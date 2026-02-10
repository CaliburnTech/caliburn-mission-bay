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

const useNavigationStore = create((set) => ({
  // Current view
  selectedView: getInitialView(),

  // Fleet sub-tab: 'hangar' (aerial) or 'pier' (maritime)
  fleetSubTab: getInitialFleetSubTab(),

  setSelectedView: (view) => {
    set({ selectedView: view });
    if (typeof window !== 'undefined') {
      safeLocalStorage.setItem('caliburn-marketplace-view', view);
      window.history.replaceState(null, '', `#${view}`);
    }
  },

  setFleetSubTab: (subTab) => {
    set({ fleetSubTab: subTab });
    if (typeof window !== 'undefined') {
      safeLocalStorage.setItem('caliburn-fleet-subtab', subTab);
    }
  }
}));

export default useNavigationStore;
