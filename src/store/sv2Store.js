/**
 * SV-2 Customization Store
 *
 * Persists user edits to SV-2 diagrams so they survive capability changes.
 * Stores deltas (added nodes, moved positions, custom edges, label overrides)
 * keyed by configuration ID or hull name.
 *
 * When the base diagram regenerates (because capabilities changed), the merge
 * algorithm preserves customizations that still apply and flags stale ones.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSV2Store = create(
  persist(
    (set, get) => ({
      // Key: configKey (configId or 'hull_<hullName>' for unsaved configs)
      // Value: customization delta object
      customizations: {},

      /**
       * Save customizations for a configuration.
       * Called when user closes the SV-2 editor after making changes.
       *
       * @param {string} configKey - unique key for this config
       * @param {object} delta - {
       *   baseHash: string,           // hash of generated diagram when edits were made
       *   addedComponents: [],         // user-added nodes not from capabilities
       *   addedEdges: [],              // user-added connections
       *   removedEdgeIds: [],          // auto-gen edges the user deleted
       *   movedPositions: {},          // { componentId: { x, y } }
       *   labelOverrides: {},          // { componentId: newLabel } or { edgeId: newLabel }
       *   notes: []                    // freeform annotations
       * }
       */
      saveCustomizations: (configKey, delta) => {
        set(state => ({
          customizations: {
            ...state.customizations,
            [configKey]: {
              ...delta,
              updatedAt: Date.now()
            }
          }
        }));
      },

      /**
       * Get customizations for a configuration.
       * Returns null if none saved.
       */
      getCustomizations: (configKey) => {
        return get().customizations[configKey] || null;
      },

      /**
       * Clear customizations for a configuration.
       */
      clearCustomizations: (configKey) => {
        set(state => {
          const updated = { ...state.customizations };
          delete updated[configKey];
          return { customizations: updated };
        });
      },

      /**
       * Merge saved customizations with a newly generated base diagram.
       * Preserves edits that still apply, drops ones that reference
       * components that no longer exist.
       *
       * @param {string} configKey
       * @param {object} baseDiagram - newly generated SV-2 data
       * @returns {{ merged: object, staleCount: number }}
       */
      mergeCustomizations: (configKey, baseDiagram) => {
        const saved = get().customizations[configKey];
        if (!saved) return { merged: baseDiagram, staleCount: 0 };

        const baseComponentIds = new Set(baseDiagram.components.map(c => c.id));
        const _baseEdgeKeys = new Set(baseDiagram.edges.map(e => `${e.source}->${e.target}`));

        let staleCount = 0;

        // Apply moved positions (only for components that still exist)
        if (saved.movedPositions) {
          baseDiagram.components = baseDiagram.components.map(c => {
            if (saved.movedPositions[c.id]) {
              return { ...c, x: saved.movedPositions[c.id].x, y: saved.movedPositions[c.id].y };
            }
            return c;
          });
          // Count stale position overrides
          Object.keys(saved.movedPositions).forEach(id => {
            if (!baseComponentIds.has(id)) staleCount++;
          });
        }

        // Apply label overrides (only for existing components/edges)
        if (saved.labelOverrides) {
          baseDiagram.components = baseDiagram.components.map(c => {
            if (saved.labelOverrides[c.id]) {
              return { ...c, label: saved.labelOverrides[c.id] };
            }
            return c;
          });
          baseDiagram.edges = baseDiagram.edges.map(e => {
            const key = `${e.source}->${e.target}`;
            if (saved.labelOverrides[key]) {
              return { ...e, label: saved.labelOverrides[key] };
            }
            return e;
          });
        }

        // Add user-added components (always preserved)
        if (saved.addedComponents?.length) {
          baseDiagram.components = [...baseDiagram.components, ...saved.addedComponents];
        }

        // Add user-added edges (preserved if both endpoints exist)
        if (saved.addedEdges?.length) {
          const allIds = new Set([
            ...baseDiagram.components.map(c => c.id),
            ...(saved.addedComponents || []).map(c => c.id)
          ]);
          saved.addedEdges.forEach(e => {
            if (allIds.has(e.source) && allIds.has(e.target)) {
              baseDiagram.edges.push(e);
            } else {
              staleCount++;
            }
          });
        }

        // Remove user-deleted edges (if they still exist in the base)
        if (saved.removedEdgeIds?.length) {
          const removeSet = new Set(saved.removedEdgeIds);
          baseDiagram.edges = baseDiagram.edges.filter(e => !removeSet.has(e.id));
        }

        return { merged: baseDiagram, staleCount };
      },

      /**
       * Get the config key for a given active config and hull.
       * Uses configId if saved, otherwise falls back to hull name.
       */
      getConfigKey: (activeConfig, hullName) => {
        if (activeConfig?.id) return activeConfig.id;
        return `hull_${hullName || 'unknown'}`;
      }
    }),
    {
      name: 'caliburn-sv2-customizations',
      partialize: (state) => ({ customizations: state.customizations })
    }
  )
);

export default useSV2Store;
