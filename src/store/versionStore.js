/**
 * Version Control Store
 *
 * Tracks configuration versions, fleet deployment state, and provides
 * the foundation for Avalon git integration.
 *
 * GIT MAPPING:
 *   createVersion()        → git commit
 *   versions{}             → object store (commits by hash)
 *   versionHistory{}       → ref log (ordered commit list per branch)
 *   squadronIntended{}     → main branch HEAD per squadron
 *   vesselStates{}         → per-vessel branches
 *   tagVersion()           → git tag
 *   getChangelog()         → git diff
 *   isAncestor check       → git merge-base --is-ancestor
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { snapshotCurrentConfig, hashSnapshot } from '../utils/versionSnapshot';
import { computeChangelog, computeSyncStatus, countVersionsBehind } from '../utils/versionDiff';

// Generate unique version ID
const generateVersionId = () => `ver_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;

const useVersionStore = create(
  persist(
    (set, get) => ({
      // ════════════════════════════════════════
      // VERSION STORAGE
      // ════════════════════════════════════════

      // All version snapshots (immutable, content-addressed)
      // { [versionId]: ConfigVersion }
      versions: {},

      // Version chains per config (ordered newest-first)
      // { [configId]: [versionId, versionId, ...] }
      versionHistory: {},

      // ════════════════════════════════════════
      // FLEET STATE
      // ════════════════════════════════════════

      // Per-squadron intended configuration
      // { [squadronId]: { intendedVersionId, outfitName, lastUpdated } }
      squadronIntended: {},

      // Per-vessel actual running state
      // { [vesselId]: { vesselName, squadronId, runningVersionId, lastSyncAt, lastSeenAt, overrideVersionId } }
      vesselStates: {},

      // ════════════════════════════════════════
      // UI STATE (not persisted)
      // ════════════════════════════════════════

      selectedVersionId: null,
      comparisonVersionId: null,

      setSelectedVersion: (versionId) => set({ selectedVersionId: versionId }),
      setComparisonVersion: (versionId) => set({ comparisonVersionId: versionId }),

      // ════════════════════════════════════════
      // VERSION ACTIONS
      // ════════════════════════════════════════

      /**
       * Create a new version from a configuration.
       * GIT: `git commit -m "message"`
       *
       * @param {string} configId - the configuration being versioned
       * @param {object} activeConfig - current config state (from configurationStore)
       * @param {string} hullName - vessel hull name
       * @param {string} message - commit message
       * @param {string|null} tag - optional version tag
       * @param {object|null} sv2Customizations - SV-2 edits from sv2Store
       * @returns {string} versionId
       */
      createVersion: (configId, activeConfig, hullName, message, tag = null, sv2Customizations = null) => {
        const state = get();
        const versionId = generateVersionId();

        // Find parent (latest version for this config)
        const history = state.versionHistory[configId] || [];
        const parentId = history.length > 0 ? history[0] : null;

        // Create frozen snapshot
        const snapshot = snapshotCurrentConfig(activeConfig, hullName, sv2Customizations);
        if (!snapshot) return null;

        const version = {
          id: versionId,
          parentId,
          configId,
          createdAt: Date.now(),
          createdBy: 'user',
          tag,
          message: message || 'Configuration updated',
          contentHash: hashSnapshot(snapshot),
          snapshot
        };

        set(s => ({
          versions: { ...s.versions, [versionId]: version },
          versionHistory: {
            ...s.versionHistory,
            [configId]: [versionId, ...(s.versionHistory[configId] || [])]
          }
        }));

        return versionId;
      },

      /**
       * Tag a version with a human-readable label.
       * GIT: `git tag v3.2.1`
       */
      tagVersion: (versionId, tag) => {
        set(s => {
          const version = s.versions[versionId];
          if (!version) return s;
          return {
            versions: {
              ...s.versions,
              [versionId]: { ...version, tag }
            }
          };
        });
      },

      /**
       * Update the message on a version (amend).
       */
      amendVersionMessage: (versionId, message) => {
        set(s => {
          const version = s.versions[versionId];
          if (!version) return s;
          return {
            versions: {
              ...s.versions,
              [versionId]: { ...version, message }
            }
          };
        });
      },

      // ════════════════════════════════════════
      // FLEET STATE ACTIONS
      // ════════════════════════════════════════

      /**
       * Set the intended config version for a squadron.
       * GIT: `git push origin main` (updates what main points to)
       */
      setSquadronIntended: (squadronId, versionId, outfitName = '') => {
        set(s => ({
          squadronIntended: {
            ...s.squadronIntended,
            [squadronId]: {
              intendedVersionId: versionId,
              outfitName,
              lastUpdated: Date.now()
            }
          }
        }));
      },

      /**
       * Record what a vessel is actually running.
       * GIT: Moving a vessel branch pointer.
       */
      setVesselRunningVersion: (vesselId, versionId, vesselName = '', squadronId = '') => {
        set(s => ({
          vesselStates: {
            ...s.vesselStates,
            [vesselId]: {
              ...s.vesselStates[vesselId],
              vesselName: vesselName || s.vesselStates[vesselId]?.vesselName || vesselId,
              squadronId: squadronId || s.vesselStates[vesselId]?.squadronId || '',
              runningVersionId: versionId,
              lastSyncAt: Date.now(),
              lastSeenAt: Date.now()
            }
          }
        }));
      },

      /**
       * Mark a vessel as having a unique override config.
       * GIT: Vessel branch diverges from main.
       */
      setVesselOverride: (vesselId, overrideVersionId) => {
        set(s => ({
          vesselStates: {
            ...s.vesselStates,
            [vesselId]: {
              ...s.vesselStates[vesselId],
              overrideVersionId
            }
          }
        }));
      },

      /**
       * Report that a vessel was seen (heartbeat).
       */
      reportVesselSeen: (vesselId) => {
        set(s => ({
          vesselStates: {
            ...s.vesselStates,
            [vesselId]: {
              ...s.vesselStates[vesselId],
              lastSeenAt: Date.now()
            }
          }
        }));
      },

      /**
       * Sync a vessel to the squadron's intended version.
       * GIT: `git merge main` on a vessel branch.
       */
      syncVessel: (vesselId) => {
        const state = get();
        const vessel = state.vesselStates[vesselId];
        if (!vessel) return;

        const intended = state.squadronIntended[vessel.squadronId];
        if (!intended) return;

        set(s => ({
          vesselStates: {
            ...s.vesselStates,
            [vesselId]: {
              ...s.vesselStates[vesselId],
              runningVersionId: intended.intendedVersionId,
              overrideVersionId: null,
              lastSyncAt: Date.now(),
              lastSeenAt: Date.now()
            }
          }
        }));
      },

      /**
       * Sync all vessels in a squadron to intended.
       * GIT: Force-push main to all vessel branches.
       */
      syncAllVessels: (squadronId) => {
        const state = get();
        const intended = state.squadronIntended[squadronId];
        if (!intended) return;

        const updates = {};
        Object.entries(state.vesselStates).forEach(([vid, vessel]) => {
          if (vessel.squadronId === squadronId) {
            updates[vid] = {
              ...vessel,
              runningVersionId: intended.intendedVersionId,
              overrideVersionId: null,
              lastSyncAt: Date.now(),
              lastSeenAt: Date.now()
            };
          }
        });

        set(s => ({
          vesselStates: { ...s.vesselStates, ...updates }
        }));
      },

      // ════════════════════════════════════════
      // COMPUTED / SELECTORS
      // ════════════════════════════════════════

      /**
       * Get version history for a config (ordered newest-first).
       */
      getVersionHistory: (configId) => {
        const state = get();
        const ids = state.versionHistory[configId] || [];
        return ids.map(id => state.versions[id]).filter(Boolean);
      },

      /**
       * Get the latest version for a config.
       */
      getLatestVersion: (configId) => {
        const state = get();
        const ids = state.versionHistory[configId] || [];
        return ids.length > 0 ? state.versions[ids[0]] : null;
      },

      /**
       * Get changelog between two versions.
       * GIT: `git diff versionA..versionB`
       */
      getChangelog: (versionIdA, versionIdB) => {
        const state = get();
        const vA = state.versions[versionIdA];
        const vB = state.versions[versionIdB];
        if (!vA || !vB) return [];
        return computeChangelog(vA.snapshot, vB.snapshot);
      },

      /**
       * Get fleet status for a squadron.
       * Returns array of vessel statuses with sync info.
       */
      getFleetStatus: (squadronId) => {
        const state = get();
        const intended = state.squadronIntended[squadronId];
        if (!intended) return [];

        return Object.entries(state.vesselStates)
          .filter(([, vessel]) => vessel.squadronId === squadronId)
          .map(([vesselId, vessel]) => ({
            vesselId,
            vesselName: vessel.vesselName,
            runningVersionId: vessel.runningVersionId,
            intendedVersionId: intended.intendedVersionId,
            syncStatus: computeSyncStatus(
              vessel.runningVersionId,
              intended.intendedVersionId,
              state.versions,
              vessel.lastSeenAt,
              vessel.overrideVersionId
            ),
            versionsBehind: countVersionsBehind(
              vessel.runningVersionId,
              intended.intendedVersionId,
              state.versions
            ),
            lastSeenAt: vessel.lastSeenAt,
            lastSyncAt: vessel.lastSyncAt,
            hasOverride: !!vessel.overrideVersionId,
            overrideVersionId: vessel.overrideVersionId
          }));
      },

      /**
       * Get fleet sync summary for a squadron (for badges).
       * Returns { total, current, behind, diverged, disconnected }
       */
      getFleetSyncSummary: (squadronId) => {
        const fleet = get().getFleetStatus(squadronId);
        return {
          total: fleet.length,
          current: fleet.filter(v => v.syncStatus === 'CURRENT').length,
          behind: fleet.filter(v => v.syncStatus === 'BEHIND').length,
          diverged: fleet.filter(v => v.syncStatus === 'DIVERGED').length,
          disconnected: fleet.filter(v => v.syncStatus === 'DISCONNECTED').length
        };
      },

      /**
       * Get all versions that have a specific tag prefix (e.g., "v3.2").
       */
      getVersionsByTag: (tagPrefix) => {
        const state = get();
        return Object.values(state.versions)
          .filter(v => v.tag && v.tag.startsWith(tagPrefix))
          .sort((a, b) => b.createdAt - a.createdAt);
      },

      /**
       * Get total version count across all configs.
       */
      getTotalVersionCount: () => {
        return Object.keys(get().versions).length;
      },

      // ════════════════════════════════════════
      // MAINTENANCE
      // ════════════════════════════════════════

      /**
       * Prune old versions, keeping the most recent N plus all tagged versions.
       * GIT: `git gc` / `git reflog expire`
       */
      pruneVersions: (configId, keepCount = 20) => {
        const state = get();
        const history = state.versionHistory[configId] || [];
        if (history.length <= keepCount) return;

        const keep = new Set();
        // Always keep the most recent N
        history.slice(0, keepCount).forEach(id => keep.add(id));
        // Always keep tagged versions
        history.forEach(id => {
          if (state.versions[id]?.tag) keep.add(id);
        });

        const newHistory = history.filter(id => keep.has(id));
        const removedIds = history.filter(id => !keep.has(id));

        set(s => {
          const newVersions = { ...s.versions };
          removedIds.forEach(id => delete newVersions[id]);
          return {
            versions: newVersions,
            versionHistory: {
              ...s.versionHistory,
              [configId]: newHistory
            }
          };
        });
      },

      /**
       * Bootstrap: create initial versions for existing saved configs that have no history.
       * Called once on first load after version store is added.
       */
      bootstrapExistingConfigs: (savedConfigurations) => {
        const state = get();
        Object.values(savedConfigurations).forEach(config => {
          if (!config.id) return;
          const hasHistory = (state.versionHistory[config.id] || []).length > 0;
          if (hasHistory) return;

          // Create an initial "imported" version
          state.createVersion(
            config.id,
            config,
            config.hullName,
            'Initial configuration (imported)',
            null
          );
        });
      }
    }),
    {
      name: 'caliburn-version-control',
      partialize: (state) => ({
        versions: state.versions,
        versionHistory: state.versionHistory,
        squadronIntended: state.squadronIntended,
        vesselStates: state.vesselStates
        // UI state NOT persisted
      })
    }
  )
);

export default useVersionStore;
