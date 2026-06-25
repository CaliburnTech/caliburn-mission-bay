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
import { meetsRequirements } from '../../utils/missionReadiness';

/**
 * Single requirement row — shows a green check or red X with the key.
 */
function RequirementRow({ label, met }) {
  return (
    <div className="flex items-center gap-1">
      {met ? (
        <span className="text-emerald-400 leading-none">✓</span>
      ) : (
        <span className="text-red-400 leading-none">✗</span>
      )}
      <span className={met ? 'text-emerald-400' : 'text-red-400'}>
        {label}
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
        <p className="text-[0.62rem] text-emerald-400 leading-snug">
          ✓ Preset config — auto-qualifies
        </p>
      </div>
    );
  }

  // ── Case 2: Assignment exists but no config object ────────────────────────
  if (!config) {
    return (
      <div className="mt-1.5 px-2 py-1.5 border border-gray-700/50 rounded bg-gray-900/40">
        <p className="text-[0.62rem] text-amber-400 leading-snug">
          ⚠ No configuration — assign a boat
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
  const allPassing =
    missingCategories.size === 0 && missingSubTypes.size === 0;

  return (
    <div className="mt-1.5 px-2 py-1.5 border border-gray-700/50 rounded bg-gray-900/40">
      {/* Header */}
      <p className="text-[0.58rem] font-semibold uppercase tracking-wider text-gray-500 mb-1">
        Requirements
        {allPassing && (
          <span className="ml-1 text-emerald-400 normal-case font-normal tracking-normal">
            — all met
          </span>
        )}
      </p>

      {/* Category requirements */}
      {categories.length > 0 && (
        <div className="space-y-0.5">
          {categories.map(cat => (
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
