/**
 * ReadinessChecklist
 *
 * Shows per-role requirement status inside vessel cards in mission views.
 * Always visible (not hidden behind a toggle).
 *
 * Props:
 *   config     {object|null}  - activeConfig or null if using default boat
 *   role       {object}       - role definition from MISSION_ROLES (has requirements)
 *   isDefault  {boolean}      - if true, show "Using preset — auto-qualifies" instead of checklist
 */

import React from 'react';
import { meetsRequirements, getSlotKeysCoveredBySubTypes } from '../../utils/missionReadiness';

/**
 * Single requirement row — terminal-style monospace with bracket markers.
 */
function RequirementRow({ label, met }) {
  return (
    <div className="flex items-center gap-1.5 font-mono text-xs leading-snug">
      <span className={met ? 'text-emerald-400' : 'text-red-400'}>
        {met ? '[✓]' : '[✗]'}
      </span>
      <span className={met ? 'text-emerald-400' : 'text-red-400'}>
        {label.toLowerCase()}
      </span>
    </div>
  );
}

export default function ReadinessChecklist({ config, role, isDefault = false }) {
  // ── Guard: no role provided ───────────────────────────────────────────────
  if (!role) return null;

  const hasRequirements =
    role.requirements &&
    (
      (role.requirements.categories?.length ?? 0) > 0 ||
      (role.requirements.subTypes?.length ?? 0) > 0
    );

  // ── Case 1: Default preset or no requirements defined ────────────────────
  if (isDefault || !hasRequirements) {
    return (
      <div className="mt-1.5 px-2 py-1.5 border border-gray-700/50 rounded bg-gray-900/40">
        <p className="font-mono text-[0.62rem] text-emerald-400 leading-snug">
          [✓] preset — auto-qualifies
        </p>
      </div>
    );
  }

  // ── Case 2: Assignment exists but no config object ────────────────────────
  if (!config) {
    return (
      <div className="mt-1.5 px-2 py-1.5 border border-gray-700/50 rounded bg-gray-900/40">
        <p className="font-mono text-[0.62rem] text-amber-400 leading-snug">
          [!] no configuration — assign a boat
        </p>
      </div>
    );
  }

  // ── Case 3: Run requirements check ───────────────────────────────────────
  const { missing } = meetsRequirements(config, role);

  // Build a quick lookup for which keys are missing
  const missingCategories = new Set(
    missing.filter(m => m.type === 'category').map(m => m.key)
  );
  const missingSubTypes = new Set(
    missing.filter(m => m.type === 'subType').map(m => m.key)
  );

  const { categories = [], subTypes = [] } = role.requirements;

  // Hide any category row that's already implied by a more-specific subType requirement.
  // e.g. if SONAR_TOWED is required, showing SENSORS separately is redundant.
  const coveredBySubTypes = getSlotKeysCoveredBySubTypes(subTypes);
  const displayCategories = categories.filter(cat => !coveredBySubTypes.has(cat));

  const allPassing =
    missingCategories.size === 0 && missingSubTypes.size === 0;

  return (
    <div className="mt-1.5 px-2 py-1.5 border border-gray-700/50 rounded bg-gray-900/40">
      {/* Header */}
      <p className="font-mono text-[0.58rem] text-gray-500 mb-1">
        requirements{allPassing && (
          <span className="ml-1 text-emerald-400"> — all met</span>
        )}
      </p>

      {/* Category requirements (suppressed if covered by a subType) */}
      {displayCategories.length > 0 && (
        <div className="space-y-0.5">
          {displayCategories.map(cat => (
            <RequirementRow
              key={`cat-${cat}`}
              label={cat}
              met={!missingCategories.has(cat)}
            />
          ))}
        </div>
      )}

      {/* SubType requirements */}
      {subTypes.length > 0 && (
        <div className="space-y-0.5 mt-0.5">
          {subTypes.map(st => (
            <RequirementRow
              key={`st-${st}`}
              label={st}
              met={!missingSubTypes.has(st)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
