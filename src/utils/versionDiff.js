/**
 * Version Diff Utilities
 *
 * Pure functions for computing changelogs and sync status between version snapshots.
 * No store dependencies — takes snapshots as input, returns structured diffs.
 *
 * GIT ANALOGY: This is `git diff` — compares two commit trees and produces a patch.
 */

/**
 * Compute a human-readable changelog between two version snapshots.
 *
 * @param {object} snapshotA - older snapshot (the "before")
 * @param {object} snapshotB - newer snapshot (the "after")
 * @returns {ChangelogEntry[]} Array of change entries
 */
export const computeChangelog = (snapshotA, snapshotB) => {
  if (!snapshotA || !snapshotB) return [];

  const changes = [];

  // 1. Name change
  if (snapshotA.name !== snapshotB.name) {
    changes.push({
      type: 'NAME_CHANGED',
      category: null,
      subject: 'Configuration',
      detail: `"${snapshotA.name}" → "${snapshotB.name}"`,
      fromValue: snapshotA.name,
      toValue: snapshotB.name
    });
  }

  // 2. Hull change
  if (snapshotA.hullName !== snapshotB.hullName) {
    changes.push({
      type: 'HULL_CHANGED',
      category: null,
      subject: 'Hull',
      detail: `${snapshotA.hullName} → ${snapshotB.hullName}`,
      fromValue: snapshotA.hullName,
      toValue: snapshotB.hullName
    });
  }

  // 3. Slot diffs (capability adds/removes/moves)
  const slotChanges = diffSlots(snapshotA.slots || {}, snapshotB.slots || {});
  changes.push(...slotChanges);

  // 4. Software version bumps
  const versionBumps = diffSoftwareManifest(
    snapshotA.softwareManifest || {},
    snapshotB.softwareManifest || {}
  );
  changes.push(...versionBumps);

  // 5. SV-2 changes
  if (snapshotA.sv2Snapshot && snapshotB.sv2Snapshot) {
    const sv2Diff = diffSV2(snapshotA.sv2Snapshot, snapshotB.sv2Snapshot);
    if (sv2Diff) changes.push(sv2Diff);
  }

  return changes;
};

/**
 * Diff slot arrays between two snapshots.
 * Detects: added capabilities, removed capabilities, moved between categories.
 */
const diffSlots = (slotsA, slotsB) => {
  const changes = [];

  // Collect all capabilities by name → category
  const capsA = {};  // { capName: category }
  const capsB = {};

  Object.entries(slotsA).forEach(([cat, arr]) => {
    (arr || []).forEach(name => { if (name) capsA[name] = cat; });
  });
  Object.entries(slotsB).forEach(([cat, arr]) => {
    (arr || []).forEach(name => { if (name) capsB[name] = cat; });
  });

  const allCaps = new Set([...Object.keys(capsA), ...Object.keys(capsB)]);

  allCaps.forEach(capName => {
    const inA = capsA[capName];
    const inB = capsB[capName];

    if (inA && !inB) {
      // Removed
      changes.push({
        type: 'CAPABILITY_REMOVED',
        category: inA,
        subject: capName,
        detail: `Removed from ${inA}`,
        fromValue: inA,
        toValue: null
      });
    } else if (!inA && inB) {
      // Added
      changes.push({
        type: 'CAPABILITY_ADDED',
        category: inB,
        subject: capName,
        detail: `Added to ${inB}`,
        fromValue: null,
        toValue: inB
      });
    } else if (inA !== inB) {
      // Moved between categories
      changes.push({
        type: 'CAPABILITY_MOVED',
        category: inB,
        subject: capName,
        detail: `Moved from ${inA} → ${inB}`,
        fromValue: inA,
        toValue: inB
      });
    }
  });

  // Slot count changes per category
  Object.keys({ ...slotsA, ...slotsB }).forEach(cat => {
    const countA = (slotsA[cat] || []).length;
    const countB = (slotsB[cat] || []).length;
    if (countB > countA) {
      changes.push({
        type: 'SLOT_ADDED',
        category: cat,
        subject: cat,
        detail: `${countA} → ${countB} slots`,
        fromValue: countA,
        toValue: countB
      });
    } else if (countB < countA) {
      changes.push({
        type: 'SLOT_REMOVED',
        category: cat,
        subject: cat,
        detail: `${countA} → ${countB} slots`,
        fromValue: countA,
        toValue: countB
      });
    }
  });

  return changes;
};

/**
 * Diff software manifests to find version bumps, new dependencies, removed dependencies.
 */
const diffSoftwareManifest = (manifestA, manifestB) => {
  const changes = [];
  const allKeys = new Set([...Object.keys(manifestA), ...Object.keys(manifestB)]);

  allKeys.forEach(name => {
    const vA = manifestA[name];
    const vB = manifestB[name];

    if (vA && vB && vA !== vB) {
      changes.push({
        type: 'SOFTWARE_VERSION_BUMP',
        category: null,
        subject: name,
        detail: `${vA} → ${vB}`,
        fromValue: vA,
        toValue: vB
      });
    } else if (!vA && vB) {
      changes.push({
        type: 'SOFTWARE_ADDED',
        category: null,
        subject: name,
        detail: `Added (${vB})`,
        fromValue: null,
        toValue: vB
      });
    } else if (vA && !vB) {
      changes.push({
        type: 'SOFTWARE_REMOVED',
        category: null,
        subject: name,
        detail: `Removed (was ${vA})`,
        fromValue: vA,
        toValue: null
      });
    }
  });

  return changes;
};

/**
 * Diff two SV-2 snapshots at a high level.
 */
const diffSV2 = (sv2A, sv2B) => {
  const compDiff = (sv2B.componentCount || 0) - (sv2A.componentCount || 0);
  const edgeDiff = (sv2B.edgeCount || 0) - (sv2A.edgeCount || 0);
  const mermaidChanged = sv2A.mermaidSource !== sv2B.mermaidSource;

  if (compDiff === 0 && edgeDiff === 0 && !mermaidChanged) return null;

  const details = [];
  if (compDiff !== 0) details.push(`${compDiff > 0 ? '+' : ''}${compDiff} components`);
  if (edgeDiff !== 0) details.push(`${edgeDiff > 0 ? '+' : ''}${edgeDiff} edges`);
  if (mermaidChanged && compDiff === 0 && edgeDiff === 0) details.push('diagram layout changed');

  return {
    type: 'SV2_CHANGED',
    category: null,
    subject: 'Architecture Diagram',
    detail: details.join(', '),
    fromValue: { components: sv2A.componentCount, edges: sv2A.edgeCount },
    toValue: { components: sv2B.componentCount, edges: sv2B.edgeCount }
  };
};

/**
 * Compute sync status for a vessel by comparing running vs intended versions.
 *
 * @param {string} runningVersionId - what the vessel is running
 * @param {string} intendedVersionId - what it should be running
 * @param {object} versions - version store's versions map
 * @param {number|null} lastSeenAt - when vessel last reported in
 * @param {string|null} overrideVersionId - non-null if vessel has unique config
 * @param {number} disconnectThresholdMs - how long before marking disconnected (default 7 days)
 * @returns {'CURRENT' | 'BEHIND' | 'DIVERGED' | 'DISCONNECTED' | 'UNKNOWN'}
 */
export const computeSyncStatus = (
  runningVersionId,
  intendedVersionId,
  versions,
  lastSeenAt = null,
  overrideVersionId = null,
  disconnectThresholdMs = 7 * 24 * 60 * 60 * 1000
) => {
  // Disconnected check
  if (lastSeenAt && (Date.now() - lastSeenAt) > disconnectThresholdMs) {
    return 'DISCONNECTED';
  }

  // Explicit override = diverged
  if (overrideVersionId) {
    return 'DIVERGED';
  }

  // Running what's intended
  if (runningVersionId === intendedVersionId) {
    return 'CURRENT';
  }

  // Check if running version is an ancestor of intended (= just behind)
  if (isAncestor(runningVersionId, intendedVersionId, versions)) {
    return 'BEHIND';
  }

  // Not an ancestor = diverged
  if (runningVersionId && intendedVersionId) {
    return 'DIVERGED';
  }

  return 'UNKNOWN';
};

/**
 * Walk the parent chain from descendantId to see if ancestorId is in the history.
 * GIT ANALOGY: `git merge-base --is-ancestor ancestorId descendantId`
 *
 * @param {string} ancestorId - potential ancestor version
 * @param {string} descendantId - potential descendant version
 * @param {object} versions - { versionId: { parentId, ... } }
 * @returns {boolean}
 */
export const isAncestor = (ancestorId, descendantId, versions) => {
  if (!ancestorId || !descendantId || !versions) return false;

  let current = descendantId;
  const visited = new Set();

  while (current) {
    if (current === ancestorId) return true;
    if (visited.has(current)) return false; // cycle protection
    visited.add(current);

    const version = versions[current];
    current = version?.parentId || null;
  }

  return false;
};

/**
 * Count how many versions behind a vessel is.
 * GIT ANALOGY: `git rev-list runningId..intendedId --count`
 */
export const countVersionsBehind = (runningVersionId, intendedVersionId, versions) => {
  if (!runningVersionId || !intendedVersionId || runningVersionId === intendedVersionId) return 0;

  let count = 0;
  let current = intendedVersionId;
  const visited = new Set();

  while (current && current !== runningVersionId) {
    if (visited.has(current)) return count; // cycle protection
    visited.add(current);
    count++;
    const version = versions[current];
    current = version?.parentId || null;
  }

  return current === runningVersionId ? count : -1; // -1 = not in same lineage
};

/**
 * Get the change type badge color for UI rendering.
 */
export const getChangeTypeColor = (type) => {
  switch (type) {
    case 'CAPABILITY_ADDED':
    case 'SOFTWARE_ADDED':
    case 'SLOT_ADDED':
      return '#22c55e'; // green
    case 'CAPABILITY_REMOVED':
    case 'SOFTWARE_REMOVED':
    case 'SLOT_REMOVED':
      return '#ef4444'; // red
    case 'CAPABILITY_MOVED':
      return '#3b82f6'; // blue
    case 'SOFTWARE_VERSION_BUMP':
      return '#f97316'; // orange
    case 'SV2_CHANGED':
      return '#8b5cf6'; // purple
    case 'NAME_CHANGED':
    case 'HULL_CHANGED':
      return '#6b7280'; // gray
    default:
      return '#9ca3af';
  }
};

/**
 * Get sync status badge color for fleet UI.
 */
export const getSyncStatusColor = (status) => {
  switch (status) {
    case 'CURRENT': return '#22c55e';
    case 'BEHIND': return '#f59e0b';
    case 'DIVERGED': return '#ef4444';
    case 'DISCONNECTED': return '#6b7280';
    default: return '#9ca3af';
  }
};
