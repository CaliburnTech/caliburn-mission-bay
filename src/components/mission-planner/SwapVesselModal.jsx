import React, { useMemo, useCallback } from 'react';
import { Anchor, X, Star } from 'lucide-react';
import useMissionStore from '../../store/missionStore';
import { vesselHullData } from '../../data/vesselData';
import { MISSION_ROLES } from '../../data/missionRoles';
import { isHullSwapEligible } from '../../utils/missionReadiness';
import { HULL_IMAGES } from '../../utils/hullImages';

/**
 * SwapVesselModal
 *
 * Props:
 *   isOpen          {boolean}
 *   onClose         {() => void}
 *   missionKey      {string}  e.g. 'ASW'
 *   roleKey         {string}  e.g. 'ASW_ALPHA'
 *   currentHullName {string}  currently assigned hull name
 */
const SwapVesselModal = ({ isOpen, onClose, missionKey, roleKey, currentHullName }) => {
  const assignVesselToRole = useMissionStore(s => s.assignVesselToRole);

  const role = useMemo(() => {
    const missionDef = MISSION_ROLES[missionKey];
    if (!missionDef) return null;
    return missionDef.roles.find(r => r.roleKey === roleKey) ?? null;
  }, [missionKey, roleKey]);

  // Build candidate pool, then split into suggested vs other.
  //
  // If allowedHullNames is set → hard-filter to exactly those hulls (must have image).
  // Otherwise → filter by allowedPlatformTypes (must have image).
  // suggestedHullNames → shown first in a labelled "Suggested" section.
  const { suggested, other } = useMemo(() => {
    const allowedNames   = role?.allowedHullNames  ?? null;
    const suggestedNames = role?.suggestedHullNames ?? [];
    const platformTypes  = role?.allowedPlatformTypes ?? [];

    let candidates;
    if (allowedNames && allowedNames.length > 0) {
      candidates = vesselHullData.filter(
        hull => allowedNames.includes(hull.name) && HULL_IMAGES[hull.name]
      );
    } else {
      candidates = vesselHullData.filter(hull => {
        if (!HULL_IMAGES[hull.name]) return false;
        if (platformTypes.length > 0) {
          return platformTypes.some(pt => hull.platformType?.includes(pt));
        }
        return true;
      });
    }

    // Annotate with SWaP eligibility
    const annotated = candidates.map(hull => {
      if (!role) return { hull, eligible: true };
      const { eligible } = isHullSwapEligible(hull.name, role);
      return { hull, eligible };
    });

    // No suggestedNames and no hard-filter → treat everything as "suggested"
    if (suggestedNames.length === 0 && !allowedNames) {
      const sort = arr => [...arr.filter(a => a.eligible), ...arr.filter(a => !a.eligible)];
      return { suggested: sort(annotated), other: [] };
    }

    // Split into suggested (preserving defined order) vs other
    const suggestedSet = new Set(suggestedNames);
    const suggestedList = suggestedNames
      .map(name => annotated.find(a => a.hull.name === name))
      .filter(Boolean);
    const otherList = annotated.filter(a => !suggestedSet.has(a.hull.name));

    // Sort other: eligible first
    otherList.sort((a, b) => (b.eligible ? 1 : 0) - (a.eligible ? 1 : 0));

    return { suggested: suggestedList, other: otherList };
  }, [role]);

  const handleSelect = useCallback((hullName) => {
    assignVesselToRole(missionKey, roleKey, hullName, hullName, hullName);
    onClose();
  }, [assignVesselToRole, missionKey, roleKey, onClose]);

  if (!isOpen) return null;

  const roleLabel = role?.roleLabel ?? roleKey;
  const hasOther  = other.length > 0;

  // Inline render function (not a component) — avoids React treating it as a new
  // component type on every render, which would cause unmount/remount flicker.
  const renderCard = (hull, eligible) => {
    const isSelected = hull.name === currentHullName;
    return (
      <button
        key={hull.name}
        onClick={() => handleSelect(hull.name)}
        className={[
          'flex items-center gap-3 rounded-xl border p-2.5 text-left transition-all',
          isSelected
            ? 'border-cyan-500 bg-cyan-900/20 ring-1 ring-cyan-500/40'
            : 'border-gray-700/50 bg-gray-800/30 hover:border-gray-600/60 hover:bg-gray-800/60',
          !eligible ? 'opacity-60' : '',
        ].join(' ')}
      >
        <div className="w-14 h-14 flex-shrink-0 bg-gray-950/60 rounded-lg flex items-center justify-center overflow-hidden">
          {HULL_IMAGES[hull.name]
            ? <img src={HULL_IMAGES[hull.name]} alt={hull.name} className="w-full h-full object-contain p-1" />
            : <Anchor size={22} className="text-cyan-500/50" />
          }
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-[0.78rem] font-semibold text-gray-200 leading-tight truncate">
            {hull.name}
          </span>
          <span className="text-[0.65rem] text-gray-500 leading-tight truncate">
            {hull.platformType}
          </span>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {isSelected && (
              <span className="inline-flex items-center px-1.5 py-px rounded text-[0.62rem] font-bold bg-cyan-900/60 text-cyan-400 border border-cyan-500/40 uppercase tracking-wide">
                Current
              </span>
            )}
            {!eligible && (
              <span className="inline-flex items-center px-1.5 py-px rounded text-[0.62rem] font-semibold bg-amber-900/40 text-amber-400 border border-amber-500/30">
                ⚠ Exceeds SWaP
              </span>
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60"
      style={{ zIndex: 9999 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-gray-900 border border-gray-700/60 rounded-2xl w-[520px] max-h-[75vh] flex flex-col shadow-2xl">

        {/* ── Header ── */}
        <div className="p-4 border-b border-gray-700/50 flex items-center justify-between flex-shrink-0">
          <div className="flex flex-col gap-0.5">
            <span className="text-[0.65rem] text-gray-500 uppercase tracking-widest font-semibold">
              Swap Vessel
            </span>
            <span className="text-[0.85rem] text-white font-semibold leading-tight">
              {roleLabel}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/60 transition-colors"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Hull list ── */}
        <div className="flex-1 overflow-y-auto p-3 min-h-0 flex flex-col gap-3">

          {/* Suggested section */}
          {suggested.length > 0 && (
            <div className="flex flex-col gap-2">
              {hasOther && (
                <div className="flex items-center gap-1.5 px-0.5">
                  <Star size={10} className="text-amber-400 fill-amber-400" />
                  <span className="text-[0.62rem] font-semibold text-amber-400 uppercase tracking-widest">
                    Suggested for this role
                  </span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                {suggested.map(({ hull, eligible }) => renderCard(hull, eligible))}
              </div>
            </div>
          )}

          {/* Other compatible vessels */}
          {hasOther && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 px-0.5">
                <span className="text-[0.62rem] font-semibold text-gray-500 uppercase tracking-widest">
                  Other compatible vessels
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {other.map(({ hull, eligible }) => renderCard(hull, eligible))}
              </div>
            </div>
          )}

        </div>

        {/* ── Footer ── */}
        <div className="px-4 py-2.5 border-t border-gray-700/50 flex-shrink-0">
          <span className="text-[0.65rem] text-gray-600">
            Click a vessel to assign it to this role. Vessels marked ⚠ Exceeds SWaP may lack capacity for all required payloads.
          </span>
        </div>

      </div>
    </div>
  );
};

export default SwapVesselModal;
