/**
 * missionReadiness.js
 * Pure utility functions for capability-based launch gate checks.
 *
 * Depends on:
 *   - individualCapabilities from marketplaceData (for subType lookups)
 *   - MISSION_ROLES from missionRoles (for role.requirements)
 *   - vesselHullData from vesselData (for hull capacity / SWaP checks)
 *
 * Does NOT import from any store — callers pass in the data they need.
 */

import { individualCapabilities } from '../data/marketplaceData';
import { MISSION_ROLES } from '../data/missionRoles';
import { vesselHullData } from '../data/vesselData';

// ─────────────────────────────────────────────────────────────────────────────
// Helper: flatten all non-null capability names from a config's slots
// ─────────────────────────────────────────────────────────────────────────────
function equippedCapNames(config) {
  if (!config?.slots) return [];
  return Object.values(config.slots)
    .flat()
    .filter(Boolean);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: get slot category keys that have at least one equipped capability
// ─────────────────────────────────────────────────────────────────────────────
function filledCategories(config) {
  if (!config?.slots) return new Set();
  return new Set(
    Object.entries(config.slots)
      .filter(([, caps]) => caps.some(Boolean))
      .map(([cat]) => cat)
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Function 1: meetsRequirements
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check whether a configured boat meets a role's functional requirements.
 *
 * @param {object} config  - activeConfig shape: { hullName, slots: { SENSORS: [capName|null, ...], ... } }
 * @param {object} role    - role definition from MISSION_ROLES (has role.requirements)
 * @returns {{ ready: boolean, missing: Array<{ type: 'category'|'subType', key: string }> }}
 */
export function meetsRequirements(config, role) {
  // If no requirements defined on role, default to ready
  if (!role?.requirements) {
    return { ready: true, missing: [] };
  }

  const missing = [];
  const { categories = [], subTypes = [] } = role.requirements;

  // Check 1: each required category must have at least one non-null slot
  const filled = filledCategories(config);
  for (const cat of categories) {
    if (!filled.has(cat)) {
      missing.push({ type: 'category', key: cat });
    }
  }

  // Check 2: each required subType must match at least one equipped capability's subType
  if (subTypes.length > 0) {
    const capNames = equippedCapNames(config);
    // Build set of subTypes currently equipped
    const equippedSubTypes = new Set();
    for (const capName of capNames) {
      const cap = individualCapabilities.find(c => c.name === capName);
      if (cap?.subType) {
        equippedSubTypes.add(cap.subType);
      }
    }

    for (const st of subTypes) {
      if (!equippedSubTypes.has(st)) {
        missing.push({ type: 'subType', key: st });
      }
    }
  }

  return {
    ready: missing.length === 0,
    missing,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Function 2: isHullSwapEligible
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if a hull can physically carry the capabilities required for a role (SWaP check).
 * Used to sort hulls in the SwapVesselModal — ineligible hulls go to the bottom.
 *
 * Sums the swap.weight and swap.power of the capabilities listed in role.capabilities.
 * Negative swap values (power/weight providers) reduce the total — clamp sum to 0.
 * Compares against hull's capacity.totalWeight (kg) and capacity.totalPower (kW).
 *
 * @param {string} hullName
 * @param {object} role  - role from MISSION_ROLES (has role.capabilities string[])
 * @returns {{ eligible: boolean, reason?: string }}
 */
export function isHullSwapEligible(hullName, role) {
  // Find hull
  const hull = vesselHullData.find(h => h.name === hullName);
  if (!hull) {
    return { eligible: false, reason: `Hull "${hullName}" not found` };
  }

  // Resolve capacity — check both capacity.* and specs.* fields
  const maxWeight =
    hull.capacity?.totalWeight ??
    hull.specs?.totalWeight ??
    null;
  const maxPower =
    hull.capacity?.totalPower ??
    hull.specs?.totalPower ??
    null;

  // If hull has no capacity data at all, allow it (can't block what we can't measure)
  if (maxWeight === null && maxPower === null) {
    return { eligible: true };
  }

  // Sum SWaP from the role's capability list
  const roleCaps = role?.capabilities ?? [];
  let totalWeight = 0;
  let totalPower = 0;

  for (const capName of roleCaps) {
    const cap = individualCapabilities.find(c => c.name === capName);
    if (cap?.swap) {
      totalWeight += cap.swap.weight ?? 0;
      totalPower += cap.swap.power ?? 0;
    }
  }

  // Clamp totals to 0 (negative contributors can't make the sum negative)
  totalWeight = Math.max(0, totalWeight);
  totalPower = Math.max(0, totalPower);

  // Weight check
  if (maxWeight !== null && totalWeight > maxWeight) {
    return {
      eligible: false,
      reason: `Required payload ${totalWeight} kg exceeds hull capacity ${maxWeight} kg`,
    };
  }

  // Power check
  if (maxPower !== null && totalPower > maxPower) {
    return {
      eligible: false,
      reason: `Required power ${totalPower} kW exceeds hull capacity ${maxPower} kW`,
    };
  }

  return { eligible: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Function 3: getMissionReadiness
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the overall readiness state of a mission.
 * Used to enable/disable the Deploy button in mission views.
 *
 * A role is "ready" if:
 *   - It has no explicit assignment (uses default) → auto-passes (preset boats always qualify)
 *   - OR it has an explicit assignment AND meetsRequirements passes
 *
 * The mission is deployable when ALL roles are ready.
 *
 * @param {string} missionKey  - e.g. 'ASW'
 * @param {object} roleAssignments  - from missionStore: { [missionKey]: { [roleKey]: {...} | null } }
 * @param {object} savedConfigurations  - from configurationStore: { [configId]: config }
 * @returns {{
 *   deployable: boolean,
 *   roles: Array<{ roleKey, roleLabel, ready, missing, isDefault }>
 * }}
 */
export function getMissionReadiness(missionKey, roleAssignments, savedConfigurations) {
  const missionDef = MISSION_ROLES[missionKey];
  if (!missionDef) {
    return { deployable: false, roles: [] };
  }

  const missionAssignments = roleAssignments?.[missionKey] ?? {};
  const configs = savedConfigurations ?? {};

  const roleResults = missionDef.roles.map(role => {
    const { roleKey, roleLabel } = role;
    const assignment = missionAssignments[roleKey];

    // No explicit assignment → using default preset → auto-qualifies
    if (!assignment) {
      return {
        roleKey,
        roleLabel,
        ready: true,
        missing: [],
        isDefault: true,
      };
    }

    // Has an assignment — try to find a saved config for this hull
    // Saved configs are keyed by configId; find one whose hullName matches
    const { hullName } = assignment;
    let config = null;

    if (hullName) {
      // Find the most recently saved config for this hull
      const matchingConfigs = Object.values(configs).filter(
        c => c.hullName === hullName
      );
      if (matchingConfigs.length > 0) {
        // Use the last one (highest key / most recently added)
        config = matchingConfigs[matchingConfigs.length - 1];
      }
    }

    // If we found a config, run the requirements check
    if (config) {
      const { ready, missing } = meetsRequirements(config, role);
      return { roleKey, roleLabel, ready, missing, isDefault: false };
    }

    // Assignment exists but no saved config found — treat as ready
    // (don't block default-preset missions when user just swapped the hull label)
    return {
      roleKey,
      roleLabel,
      ready: true,
      missing: [],
      isDefault: false,
    };
  });

  const deployable = roleResults.every(r => r.ready);
  return { deployable, roles: roleResults };
}

// ─────────────────────────────────────────────────────────────────────────────
// Capability category → slot key mapping (mirrors LOADOUT_CATEGORIES in LoadoutBuilder)
// ─────────────────────────────────────────────────────────────────────────────
const CAP_CATEGORY_TO_SLOT = {
  'EO/IR SENSORS': 'SENSORS', 'RADAR/RF': 'SENSORS', 'ACOUSTIC/SONAR': 'SENSORS',
  'ELECTRONIC SUPPORT': 'SENSORS', 'ELECTRONIC PROTECTION': 'SENSORS',
  'ACOUSTIC SENSORS': 'SENSORS', 'ACOUSTIC DECOY': 'SENSORS', 'RADAR SENSORS': 'SENSORS',
  'SENSORS & DETECTION': 'SENSORS', 'SIGNALS INTELLIGENCE': 'SENSORS',
  'ISR': 'SENSORS', 'ISR & SURVEILLANCE': 'SENSORS', 'SAR': 'SENSORS',
  'MCM': 'SENSORS', 'MCM SYSTEMS': 'SENSORS', 'EW': 'SENSORS', 'ASW': 'SENSORS',
  'RF COMMUNICATIONS': 'COMMS', 'SATCOM': 'COMMS',
  'UNDERWATER COMMS': 'COMMS', 'COMMUNICATIONS': 'COMMS',
  'KINETIC WEAPONS': 'WEAPONS', 'DIRECTED ENERGY': 'WEAPONS', 'WEAPONS': 'WEAPONS',
  'COMBAT': 'WEAPONS', 'SEA_CONTROL': 'WEAPONS', 'FORCE_PROTECTION': 'WEAPONS',
  'ELECTRONIC ATTACK': 'WEAPONS',
  'C2 SYSTEMS': 'C2', 'COMMAND & CONTROL': 'C2',
  'NAVIGATION': 'NAV',
  'UNMANNED SYSTEMS': 'AI',
  'LOGISTICS': 'UTILITY', 'LOGISTICS & SUPPORT': 'UTILITY', 'MAINTENANCE': 'UTILITY',
  'SUPPLY CHAIN': 'UTILITY', 'DATA PROCESSING': 'UTILITY', 'CYBER DEFENSE': 'UTILITY',
  'DEFENSE': 'UTILITY', 'ESCORT': 'UTILITY',
};

/**
 * Given a list of required subTypes, return the set of slot-category keys
 * that are already "covered" — i.e. satisfying the subType requirement
 * inherently satisfies the broader category requirement.
 *
 * Used by ReadinessChecklist to suppress redundant category rows when a
 * more specific subType requirement is present.
 *
 * @param {string[]} requiredSubTypes
 * @returns {Set<string>} slot-category keys covered (e.g. {'SENSORS'})
 */
export function getSlotKeysCoveredBySubTypes(requiredSubTypes) {
  const covered = new Set();
  for (const subType of requiredSubTypes) {
    for (const cap of individualCapabilities) {
      if (cap.subType === subType && cap.category) {
        const slotKey = CAP_CATEGORY_TO_SLOT[cap.category];
        if (slotKey) covered.add(slotKey);
      }
    }
  }
  return covered;
}
