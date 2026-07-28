/**
 * advisorContext.js — context builders for the Mission Advisor.
 *
 * Pure functions, no React. Each returns a compact plain-text digest of the
 * mission / loadout / swap data on screen, sent to /api/ai/mission-advisor as
 * the first user turn (the guardrail system prompt lives server-side and
 * instructs Claude to answer ONLY from this text).
 *
 * Budget: ≤ 18,000 characters per context (endpoint cap is 20,000).
 * Trim descriptions, never truncate names or numbers.
 *
 * See docs/MISSION_ADVISOR_CLAUDE_PLAN.md §5.2.
 */

import { initialMissions } from '../data/missionsData';
import { MISSION_ROLES } from '../data/missionRoles';
import { individualCapabilities } from '../data/marketplaceData';
import {
  vesselHullData,
  VESSEL_SLOT_CAPACITY,
  DEFAULT_SLOT_CAPACITY,
  isAerialPlatform,
} from '../data/vesselData';
import {
  meetsRequirements,
  isHullSwapEligible,
  CAP_CATEGORY_TO_SLOT,
} from './missionReadiness';
import {
  ORCHESTRATION_LAYER,
  SUCCESS_CRITERIA,
} from '../components/mission-planner/autonomySeriesShared';

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Trim prose to ~n chars on a word boundary. Names/numbers are never passed here. */
const trim = (text, n = 200) => {
  if (!text) return '';
  const s = String(text).replace(/\s+/g, ' ').trim();
  if (s.length <= n) return s;
  const cut = s.slice(0, n);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 60 ? lastSpace : n)}…`;
};

const findCap = (name) => individualCapabilities.find((c) => c.name === name);
const findHull = (name) => vesselHullData.find((h) => h.name === name);

const slotCapacityFor = (hullName) =>
  VESSEL_SLOT_CAPACITY[hullName] || DEFAULT_SLOT_CAPACITY;

/** One-line digest of a capability: name, provider, category, SWaP, short description. */
const capLine = (name) => {
  const cap = findCap(name);
  if (!cap) return `- ${name} (not in catalog)`;
  const sub = cap.subType ? ` / ${cap.subType}` : '';
  const swap = cap.swap
    ? ` | SWaP: ${cap.swap.weight ?? 0} kg, ${cap.swap.power ?? 0} kW`
    : '';
  const trl = cap.trl ? ` | ${cap.trl}` : '';
  return `- ${cap.name} (${cap.provider}) | ${cap.category}${sub}${swap}${trl}\n  ${trim(cap.description, 200)}`;
};

/** One-line digest of a hull: type, speed/range, payload capacity. */
const hullLine = (name) => {
  const hull = findHull(name);
  if (!hull) return `- ${name} (not in hull catalog)`;
  const specs = hull.specs || {};
  const cap = hull.capacity || {};
  const capStr =
    cap.totalWeight != null || cap.totalPower != null
      ? ` | payload capacity: ${cap.totalWeight ?? '?'} kg, ${cap.totalPower ?? '?'} kW`
      : '';
  return `- ${hull.name} | ${hull.type} (${hull.platformType})${hull.displacement ? ` | ${hull.displacement}` : ''} | speed ${specs.speed ?? '?'} kt, range ${specs.range ?? '?'} nm${capStr}\n  ${trim(hull.description, 180)}`;
};

const slotCapacityLine = (hullName) => {
  const sc = slotCapacityFor(hullName);
  return Object.entries(sc)
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `${k}: ${n}`)
    .join(', ');
};

/** Sum the SWaP of a list of capability names (negatives clamp at 0 total, matching missionReadiness). */
const sumSwap = (capNames) => {
  let weight = 0;
  let power = 0;
  for (const name of capNames) {
    const cap = findCap(name);
    if (cap?.swap) {
      weight += cap.swap.weight ?? 0;
      power += cap.swap.power ?? 0;
    }
  }
  return { weight: Math.max(0, weight), power: Math.max(0, power) };
};

// ─── Feature 1: mission context ──────────────────────────────────────────────

/**
 * Compact plain-text digest of one Autonomy Mission Series mission:
 * the mission record, every role (with requirements and hulls), every
 * capability referenced by a role, every default/suggested hull, and the
 * shared series framing (success criteria, orchestration layer).
 *
 * @param {string} missionSetKey e.g. 'STANDOFF_MCM'
 * @returns {string}
 */
export function buildMissionContext(missionSetKey) {
  const missionDef = MISSION_ROLES[missionSetKey];
  const mission = initialMissions.find((m) => m.template === missionSetKey);
  if (!missionDef) return `No mission data found for ${missionSetKey}.`;

  const lines = [];
  lines.push(`MISSION: ${missionDef.missionLabel} (${missionSetKey})`);

  const profile = mission?.missionProfile;
  if (mission) {
    lines.push(
      `Record: ${mission.name} | domain ${mission.domain} | duration ${mission.duration} | zone: ${mission.zoneConfig?.name ?? 'n/a'}`
    );
  }
  if (profile?.objectives?.primary) {
    lines.push(`PRIMARY OBJECTIVE: ${profile.objectives.primary}`);
  }
  if (profile?.objectives?.secondary) {
    lines.push(`SECONDARY OBJECTIVE: ${profile.objectives.secondary}`);
  }
  if (profile?.threat) lines.push(`THREAT: ${profile.threat}`);
  if (profile?.whyThisConfig) {
    lines.push(`WHY THIS CONFIGURATION: ${profile.whyThisConfig}`);
  }
  if (profile?.squadronComposition) {
    lines.push('SQUADRON COMPOSITION:');
    for (const [slot, desc] of Object.entries(profile.squadronComposition)) {
      lines.push(`- ${slot}: ${desc}`);
    }
  }
  if (profile?.escalationTriggers?.length) {
    lines.push('TASKED CHAIN / ESCALATION:');
    profile.escalationTriggers.forEach((t, i) => lines.push(`${i + 1}. ${t}`));
  }
  if (profile?.commsArchitecture) {
    const c = profile.commsArchitecture;
    lines.push(
      `COMMS ARCHITECTURE: primary ${c.primary}; secondary ${c.secondary}; tertiary ${c.tertiary}; ground station ${c.groundStation}; home base ${c.homeBase}`
    );
  }

  const criteria = SUCCESS_CRITERIA[missionSetKey];
  if (criteria) {
    lines.push('SUCCESS CRITERIA (how this mission is judged):');
    criteria.forEach((c) => lines.push(`- ${c}`));
  }
  lines.push(`${ORCHESTRATION_LAYER.title}:`);
  ORCHESTRATION_LAYER.points.forEach((p) => lines.push(`- ${p}`));

  // Roles
  const capNames = new Set();
  const hullNames = new Set();
  lines.push('');
  lines.push('ROLES:');
  for (const role of missionDef.roles) {
    lines.push(`ROLE: ${role.roleLabel} [${role.roleKey}]`);
    lines.push(`  ${trim(role.description, 320)}`);
    lines.push(
      `  Default hull: ${role.defaultHullName ?? 'n/a'} | Suggested hulls: ${(role.suggestedHullNames ?? []).join(', ') || 'n/a'} | Allowed platform types: ${(role.allowedPlatformTypes ?? []).join(', ') || 'any'}`
    );
    const req = role.requirements || {};
    lines.push(
      `  Readiness requirements: categories [${(req.categories ?? []).join(', ') || 'none'}]; subTypes [${(req.subTypes ?? []).join(', ') || 'none'}]`
    );
    lines.push(`  Capabilities: ${(role.capabilities ?? []).join('; ')}`);
    (role.capabilities ?? []).forEach((c) => capNames.add(c));
    if (role.defaultHullName) hullNames.add(role.defaultHullName);
    (role.suggestedHullNames ?? []).forEach((h) => hullNames.add(h));
  }

  // Hulls
  lines.push('');
  lines.push('HULL SPECIFICATIONS:');
  for (const name of hullNames) lines.push(hullLine(name));

  // Capabilities
  lines.push('');
  lines.push('CAPABILITY CATALOG (payloads referenced by this mission):');
  for (const name of capNames) lines.push(capLine(name));

  lines.push('');
  lines.push(
    'NOTE: TempestOS Core Platform is the operating-system layer — it occupies no payload slot and appears on the command node, not as swappable hardware.'
  );

  return lines.join('\n');
}

// ─── Feature 2: loadout context ──────────────────────────────────────────────

/**
 * Digest of the current LoadoutBuilder state: hull, equipped payloads per
 * slot, SWaP headroom, the applied mission role's requirements, the readiness
 * verdict, and — for every unmet requirement — the catalog capabilities that
 * would satisfy it AND fit the remaining SWaP (computed here in JS so Claude
 * explains rather than searches).
 *
 * @param {object} hull          selectedHull from outfitterStore (vesselHullData entry)
 * @param {object} activeConfig  { hullName, slots: { SENSORS: [name|null, ...], ... } }
 * @param {string} [missionSetKey] applied mission set, if any
 * @param {string} [roleKey]       applied role within that mission, if any
 * @returns {string}
 */
export function buildLoadoutContext(hull, activeConfig, missionSetKey, roleKey) {
  if (!hull) return 'No hull selected.';
  const lines = [];

  lines.push(`LOADOUT REVIEW: ${hull.name}`);
  lines.push(hullLine(hull.name));
  lines.push(`Slot capacity: ${slotCapacityLine(hull.name)}`);

  // Equipped payloads per slot
  const equipped = [];
  lines.push('');
  lines.push('EQUIPPED PAYLOADS BY SLOT:');
  const slots = activeConfig?.slots ?? {};
  const slotCap = slotCapacityFor(hull.name);
  let anyEquipped = false;
  for (const [slotKey, capNames] of Object.entries(slots)) {
    const filled = (capNames ?? []).filter(Boolean);
    if (filled.length === 0) continue;
    anyEquipped = true;
    lines.push(`- ${slotKey} (${filled.length}/${slotCap[slotKey] ?? 0} slots): ${filled.join('; ')}`);
    equipped.push(...filled);
  }
  if (!anyEquipped) lines.push('- (nothing equipped yet)');

  // SWaP budget
  const used = sumSwap(equipped);
  const maxWeight = hull.capacity?.totalWeight ?? null;
  const maxPower = hull.capacity?.totalPower ?? null;
  const headWeight = maxWeight != null ? maxWeight - used.weight : null;
  const headPower = maxPower != null ? maxPower - used.power : null;
  lines.push('');
  lines.push(
    `SWaP BUDGET: equipped payloads total ${used.weight} kg / ${used.power} kW.` +
      (maxWeight != null
        ? ` Hull capacity ${maxWeight} kg / ${maxPower} kW → headroom ${headWeight} kg / ${headPower} kW.`
        : ' Hull capacity not specified.')
  );

  // Role requirements + readiness verdict
  const role = MISSION_ROLES[missionSetKey]?.roles?.find((r) => r.roleKey === roleKey) ?? null;
  const missing = [];
  if (role) {
    lines.push('');
    lines.push(
      `MISSION ROLE: ${role.roleLabel} [${roleKey}] in ${MISSION_ROLES[missionSetKey].missionLabel} (${missionSetKey})`
    );
    lines.push(`  ${trim(role.description, 280)}`);
    const req = role.requirements || {};
    lines.push(
      `  Requirements: categories [${(req.categories ?? []).join(', ') || 'none'}]; subTypes [${(req.subTypes ?? []).join(', ') || 'none'}]`
    );
    const verdict = meetsRequirements(activeConfig, role);
    missing.push(...verdict.missing);
    lines.push(
      `READINESS VERDICT: ${verdict.ready ? 'READY — all requirements met.' : `NOT READY — unmet: ${verdict.missing.map((m) => `${m.type} ${m.key}`).join(', ')}`}`
    );
  } else {
    lines.push('');
    lines.push('MISSION ROLE: none applied — this is a freeform loadout.');
  }

  // Suggestions for each unmet requirement, filtered to remaining SWaP
  if (missing.length > 0) {
    lines.push('');
    lines.push('CATALOG OPTIONS THAT WOULD SATISFY EACH UNMET REQUIREMENT (and fit remaining SWaP):');
    for (const m of missing) {
      const matches = individualCapabilities.filter((cap) => {
        const satisfies =
          m.type === 'category'
            ? CAP_CATEGORY_TO_SLOT[cap.category] === m.key
            : cap.subType === m.key;
        if (!satisfies) return false;
        const w = cap.swap?.weight ?? 0;
        const p = cap.swap?.power ?? 0;
        const fitsWeight = headWeight == null || w <= headWeight;
        const fitsPower = headPower == null || p <= headPower;
        return fitsWeight && fitsPower;
      });
      const summary = matches
        .slice(0, 6)
        .map((c) => `${c.name} (${c.swap?.weight ?? 0} kg / ${c.swap?.power ?? 0} kW)`)
        .join('; ');
      lines.push(
        `- Unmet ${m.type} ${m.key}: ${matches.length === 0 ? 'no catalog capability fits the remaining SWaP' : summary}`
      );
    }
  }

  // Details on equipped capabilities
  if (equipped.length > 0) {
    lines.push('');
    lines.push('EQUIPPED CAPABILITY DETAILS:');
    for (const name of new Set(equipped)) lines.push(capLine(name));
  }

  lines.push('');
  lines.push(
    'NOTE: TempestOS Core Platform is the locked operating-system layer on every configuration — it occupies no payload slot and does not count against SWaP.'
  );

  return lines.join('\n');
}

// ─── Feature 3: swap context ─────────────────────────────────────────────────

/**
 * Digest for "what do I gain/lose swapping hull X for hull Y in this role?":
 * both hulls' full specs and slot capacities, the role's capability list with
 * summed SWaP, the eligibility verdict for each hull, and a platform-domain
 * note (aerial vs maritime).
 *
 * @param {string} missionSetKey
 * @param {string} roleKey
 * @param {string} currentHullName
 * @param {string} candidateHullName
 * @returns {string}
 */
export function buildSwapContext(missionSetKey, roleKey, currentHullName, candidateHullName) {
  const missionDef = MISSION_ROLES[missionSetKey];
  const role = missionDef?.roles?.find((r) => r.roleKey === roleKey) ?? null;
  const lines = [];

  lines.push(
    `HULL SWAP COMPARISON: ${currentHullName} (current) vs ${candidateHullName} (candidate)` +
      (missionDef ? ` for the ${role?.roleLabel ?? roleKey} role in ${missionDef.missionLabel} (${missionSetKey})` : '')
  );

  if (role) {
    lines.push('');
    lines.push(`ROLE: ${role.roleLabel} [${role.roleKey}]`);
    lines.push(`  ${trim(role.description, 320)}`);
    const req = role.requirements || {};
    lines.push(
      `  Requirements: categories [${(req.categories ?? []).join(', ') || 'none'}]; subTypes [${(req.subTypes ?? []).join(', ') || 'none'}]`
    );
    const roleCaps = role.capabilities ?? [];
    const swap = sumSwap(roleCaps);
    lines.push(
      `  Role payload package (${roleCaps.length} capabilities, total SWaP ${swap.weight} kg / ${swap.power} kW): ${roleCaps.join('; ')}`
    );
  }

  const describeHull = (label, hullName) => {
    lines.push('');
    lines.push(`${label}:`);
    lines.push(hullLine(hullName));
    lines.push(`  Slot capacity: ${slotCapacityLine(hullName)}`);
    if (role) {
      const verdict = isHullSwapEligible(hullName, role);
      lines.push(
        `  SWaP eligibility for this role: ${verdict.eligible ? 'ELIGIBLE — can carry the role payload package.' : `NOT ELIGIBLE — ${verdict.reason}`}`
      );
    }
  };

  describeHull('CURRENT HULL', currentHullName);
  describeHull('CANDIDATE HULL', candidateHullName);

  // Domain note
  const currentHull = findHull(currentHullName);
  const candidateHull = findHull(candidateHullName);
  if (currentHull && candidateHull) {
    const curAir = isAerialPlatform(currentHull.platformType);
    const candAir = isAerialPlatform(candidateHull.platformType);
    lines.push('');
    lines.push(
      `PLATFORM DOMAIN: current hull is ${curAir ? 'AERIAL' : 'MARITIME'}; candidate is ${candAir ? 'AERIAL' : 'MARITIME'}.` +
        (curAir !== candAir
          ? ' Cross-domain swaps are not permitted — a UAV cannot replace a boat and vice versa.'
          : ' Same domain — swap permitted if SWaP allows.')
    );
  }

  // Role capability details (so gain/lose answers can quote numbers)
  if (role?.capabilities?.length) {
    lines.push('');
    lines.push('ROLE CAPABILITY DETAILS:');
    for (const name of role.capabilities) lines.push(capLine(name));
  }

  return lines.join('\n');
}
