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
  if (typeof window === 'undefined') return 'stacks';
  const hash = window.location.hash.replace('#', '');
  const saved = safeLocalStorage.getItem('caliburn-marketplace-view');
  return hash || saved || 'stacks';
};

const useNavigationStore = create((set) => ({
  // Current view
  selectedView: getInitialView(),

  setSelectedView: (view) => {
    set({ selectedView: view });
    if (typeof window !== 'undefined') {
      safeLocalStorage.setItem('caliburn-marketplace-view', view);
      window.history.replaceState(null, '', `#${view}`);
    }
  }
}));

export default useNavigationStore;
