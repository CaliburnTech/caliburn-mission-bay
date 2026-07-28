import React, { useState, useMemo, useCallback } from 'react';
import { Anchor, X, Star, Sparkles, ChevronLeft } from 'lucide-react';
import useMissionStore from '../../store/missionStore';
import useIsMobile from '../../hooks/useIsMobile';
import { vesselHullData, isAerialPlatform } from '../../data/vesselData';
import { MISSION_ROLES } from '../../data/missionRoles';
import { isHullSwapEligible } from '../../utils/missionReadiness';
import { HULL_IMAGES } from '../../utils/hullImages';
import MissionAdvisorChat from '../shared/MissionAdvisorChat';
import { buildSwapContext } from '../../utils/advisorContext';

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
  const isMobile = useIsMobile();

  // Swap Consequence Explainer (plan §5.6): when set to a candidate hull name,
  // the modal body is replaced with the advisor chat (modal-over-modal is
  // clumsy), prefilled with the gain/lose question for that candidate.
  const [explainHull, setExplainHull] = useState(null);
  const swapContext = useMemo(
    () => (explainHull ? buildSwapContext(missionKey, roleKey, currentHullName, explainHull) : ''),
    [explainHull, missionKey, roleKey, currentHullName]
  );

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

    // ── Global domain guard ────────────────────────────────────────────────
    // A replacement must be the SAME domain as the vessel it replaces: an aerial
    // platform (UAV) can never replace a boat, and a boat/sub can never replace a
    // UAV. Anchor on the vessel being swapped, falling back to the role's default
    // hull and then its allowed platform types. This runs even when a role lookup
    // fails (role === null), which is what previously let UAVs leak into boat lists.
    const anchorType =
      vesselHullData.find(h => h.name === currentHullName)?.platformType ||
      vesselHullData.find(h => h.name === role?.defaultHullName)?.platformType ||
      platformTypes[0] ||
      null;
    if (anchorType) {
      const anchorIsAerial = isAerialPlatform(anchorType);
      candidates = candidates.filter(
        hull => isAerialPlatform(hull.platformType) === anchorIsAerial
      );
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
  }, [role, currentHullName]);

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
      <div key={hull.name} className="relative">
      {/* Swap Consequence Explainer affordance — sibling of the card button
          (nesting a button inside a button is invalid HTML) */}
      {!isSelected && (
        <button
          onClick={() => setExplainHull(hull.name)}
          title={`What changes if I swap to the ${hull.name}?`}
          aria-label={`Explain swapping to ${hull.name}`}
          className="absolute top-1.5 right-1.5 z-10 p-1 rounded-md text-cyan-500/70 hover:text-cyan-300 hover:bg-cyan-900/40 transition-colors"
        >
          <Sparkles size={12} />
        </button>
      )}
      <button
        onClick={() => handleSelect(hull.name)}
        className={[
          'w-full flex items-center gap-3 rounded-xl border p-2.5 text-left transition-all',
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
      </div>
    );
  };

  return (
    <div
      className={`fixed inset-0 flex bg-black/60 ${isMobile ? 'items-end justify-center' : 'items-center justify-center p-8'}`}
      style={{ zIndex: 9999 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`bg-gray-900 border border-gray-700/60 flex flex-col shadow-2xl overflow-hidden ${isMobile ? 'w-full rounded-t-2xl rounded-b-none max-h-[85vh]' : 'rounded-2xl w-[520px] max-h-[75vh]'}`}>

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

        {/* ── Swap Consequence Explainer — replaces the hull list ── */}
        {explainHull ? (
          <div className="flex-1 min-h-0 flex flex-col p-3 gap-2">
            <button
              onClick={() => setExplainHull(null)}
              className="self-start flex items-center gap-1 text-gray-400 hover:text-white text-[0.72rem] font-semibold transition-colors"
            >
              <ChevronLeft size={13} /> Back to vessels
            </button>
            <div className="flex-1 min-h-0 h-[50vh]">
              <MissionAdvisorChat
                key={explainHull}
                embedded
                contextText={swapContext}
                title={`Swap: ${currentHullName} → ${explainHull}`}
                accentColor="cyan"
                prefill={`What changes if I swap the ${currentHullName} for the ${explainHull} in this role?`}
              />
            </div>
          </div>
        ) : (

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
        )}

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
