import { create } from 'zustand';

// Initialize view from URL hash or localStorage, with fallback
const getInitialView = () => {
  if (typeof window === 'undefined') return 'stacks';
  const hash = window.location.hash.replace('#', '');
  const saved = localStorage.getItem('caliburn-marketplace-view');
  return hash || saved || 'stacks';
};

const useNavigationStore = create((set) => ({
  // Current view
  selectedView: getInitialView(),

  setSelectedView: (view) => {
    set({ selectedView: view });
    if (typeof window !== 'undefined') {
      localStorage.setItem('caliburn-marketplace-view', view);
      window.history.replaceState(null, '', `#${view}`);
    }
  },

  // Navigate to a specific capability (goes to capabilities view with search)
  navigateToCapability: (capabilityName) => {
    set({ selectedView: 'capabilities' });
    if (typeof window !== 'undefined') {
      localStorage.setItem('caliburn-marketplace-view', 'capabilities');
      window.history.replaceState(null, '', '#capabilities');
    }
    // Note: caller should also set searchTerm in filterStore
    return capabilityName;
  }
}));

export default useNavigationStore;
