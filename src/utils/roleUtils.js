/**
 * Role eligibility utilities — SWaP-based mission role matching.
 */
import { individualCapabilities } from '../data/marketplaceData';
import { vesselHullData } from '../data/vesselData';
import { ALL_MISSION_ROLES } from '../data/missionRoles';

/** Look up a capability by name, return its swap data or null */
export function getCapabilitySwap(capabilityName) {
  const cap = individualCapabilities.find(c => c.name === capabilityName);
  return cap?.swap ?? null;
}

/** Compute the total SWaP budget required to run a role */
export function getRoleSWaPBudget(role) {
  let weight = 0;
  let power = 0;
  for (const capName of role.capabilities) {
    const swap = getCapabilitySwap(capName);
    if (swap) {
      weight += swap.weight;
      power += swap.power;
    }
  }
  return { weight, power };
}

/** Check if a vessel (by hullName) can carry a role's SWaP budget */
export function isVesselEligibleForRole(hullName, role) {
  const hull = vesselHullData.find(h => h.name === hullName);
  if (!hull) return false;

  // Platform type gate (if role specifies allowed types)
  if (role.allowedPlatformTypes && role.allowedPlatformTypes.length > 0) {
    if (!role.allowedPlatformTypes.includes(hull.platformType)) return false;
  }

  // Hull name gate — overrides platform type when set; only listed hulls are eligible
  if (role.allowedHullNames && role.allowedHullNames.length > 0) {
    if (!role.allowedHullNames.includes(hull.name)) return false;
  }

  // If the role lists capabilities but NONE of them resolve to real SWaP data
  // in marketplaceData, the role cannot be evaluated — treat as ineligible.
  // This prevents phantom zero-cost matches for roles that reference capability
  // names not yet in the catalog.
  if (role.capabilities && role.capabilities.length > 0) {
    const knownCount = role.capabilities.filter(
      capName => individualCapabilities.find(c => c.name === capName)
    ).length;
    if (knownCount === 0) return false;
  }

  // SWaP gate
  const budget = getRoleSWaPBudget(role);
  return (
    hull.capacity.totalWeight >= budget.weight &&
    hull.capacity.totalPower >= budget.power
  );
}

/** Get all mission roles a vessel qualifies for based on SWaP */
export function getEligibleRoles(hullName) {
  return ALL_MISSION_ROLES.filter(role => isVesselEligibleForRole(hullName, role));
}

/** Group eligible roles by mission for display */
export function getEligibleRolesByMission(hullName) {
  const eligible = getEligibleRoles(hullName);
  const grouped = {};
  for (const role of eligible) {
    if (!grouped[role.missionKey]) {
      grouped[role.missionKey] = { missionLabel: role.missionLabel, roles: [] };
    }
    grouped[role.missionKey].roles.push(role);
  }
  return grouped;
}
