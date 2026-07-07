import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';

// We need to reset the store state between tests
let useNavigationStore;

describe('navigationStore', () => {
  beforeEach(async () => {
    vi.resetModules();
    // Re-import the store fresh for each test
    const module = await import('./navigationStore');
    useNavigationStore = module.default;
  });

  describe('setSelectedView', () => {
    it('changes the selected view', () => {
      const store = useNavigationStore.getState();
      act(() => {
        store.setSelectedView('matrix');
      });
      expect(useNavigationStore.getState().selectedView).toBe('matrix');
    });

    it('pushes previous view to history', () => {
      const store = useNavigationStore.getState();
      const initialView = store.selectedView;

      act(() => {
        store.setSelectedView('matrix');
      });

      expect(useNavigationStore.getState().viewHistory).toContain(initialView);
    });

    it('does not push to history when navigating to same view', () => {
      const store = useNavigationStore.getState();
      act(() => {
        store.setSelectedView('matrix');
      });
      const historyLength = useNavigationStore.getState().viewHistory.length;

      act(() => {
        store.setSelectedView('matrix'); // Same view
      });

      expect(useNavigationStore.getState().viewHistory.length).toBe(historyLength);
    });

    it('respects skipHistory option', () => {
      const store = useNavigationStore.getState();
      const historyLength = store.viewHistory.length;

      act(() => {
        store.setSelectedView('matrix', { skipHistory: true });
      });

      expect(useNavigationStore.getState().viewHistory.length).toBe(historyLength);
    });
  });

  describe('goBack', () => {
    it('returns to previous view', () => {
      const store = useNavigationStore.getState();

      act(() => {
        store.setSelectedView('matrix');
        store.setSelectedView('outfitter');
      });

      act(() => {
        store.goBack();
      });

      expect(useNavigationStore.getState().selectedView).toBe('matrix');
    });

    it('uses fallback when history is empty', () => {
      const store = useNavigationStore.getState();

      // Clear history by setting view with skipHistory multiple times
      act(() => {
        useNavigationStore.setState({ viewHistory: [], selectedView: 'outfitter' });
      });

      act(() => {
        store.goBack('shipyard');
      });

      expect(useNavigationStore.getState().selectedView).toBe('shipyard');
    });

    it('removes last item from history after going back', () => {
      const store = useNavigationStore.getState();

      act(() => {
        store.setSelectedView('matrix');
        store.setSelectedView('outfitter');
        store.setSelectedView('capabilities');
      });

      const historyBefore = useNavigationStore.getState().viewHistory.length;

      act(() => {
        store.goBack();
      });

      expect(useNavigationStore.getState().viewHistory.length).toBe(historyBefore - 1);
    });
  });

  describe('getPreviousView', () => {
    it('returns the last view in history', () => {
      const store = useNavigationStore.getState();

      act(() => {
        store.setSelectedView('matrix');
        store.setSelectedView('outfitter');
      });

      expect(store.getPreviousView()).toBe('matrix');
    });

    it('returns null when history is empty', () => {
      act(() => {
        useNavigationStore.setState({ viewHistory: [] });
      });

      const store = useNavigationStore.getState();
      expect(store.getPreviousView()).toBeNull();
    });
  });

  describe('canGoBack', () => {
    it('returns true when history has items', () => {
      const store = useNavigationStore.getState();

      act(() => {
        store.setSelectedView('matrix');
      });

      expect(store.canGoBack()).toBe(true);
    });

    it('returns false when history is empty', () => {
      act(() => {
        useNavigationStore.setState({ viewHistory: [] });
      });

      const store = useNavigationStore.getState();
      expect(store.canGoBack()).toBe(false);
    });
  });
});

describe('navigationStore - Edge Cases', () => {
  beforeEach(async () => {
    vi.resetModules();
    const module = await import('./navigationStore');
    useNavigationStore = module.default;
  });

  it('handles rapid navigation changes', () => {
    const store = useNavigationStore.getState();

    act(() => {
      store.setSelectedView('outfitter');
      store.setSelectedView('capabilities');
      store.setSelectedView('matrix');
      store.setSelectedView('squadron');
    });

    expect(useNavigationStore.getState().viewHistory).toHaveLength(4);

    act(() => {
      store.goBack();
      store.goBack();
    });

    expect(useNavigationStore.getState().selectedView).toBe('capabilities');
  });

  it('handles going back more times than history length', () => {
    const store = useNavigationStore.getState();

    act(() => {
      store.setSelectedView('matrix');
    });

    // Try to go back multiple times
    act(() => {
      store.goBack('fallback');
      store.goBack('fallback');
      store.goBack('fallback');
    });

    // Should end up at fallback without crashing
    expect(useNavigationStore.getState().selectedView).toBe('fallback');
  });
});
