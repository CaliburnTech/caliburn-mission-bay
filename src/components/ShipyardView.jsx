import React, { useState } from 'react';
import { Ship, ChevronDown, ChevronUp, Settings, X, Plus, Check, ChevronRight, Plane, Anchor, AlertTriangle } from 'lucide-react';
import { vesselHullComponents, vesselHullData, isAerialPlatform, isMaritimePlatform } from '../data/vesselData';
import useDataStore from '../providers/dataStore';
import useSquadronStore from '../store/squadronStore';
import useNavigationStore from '../store/navigationStore';
import { VariationBadge } from './variations';

const ShipyardView = ({
  onSelectHull
}) => {
  const _dataStore = useDataStore();
  const [showHullPicker, setShowHullPicker] = useState(false);

  // Fleet sub-tab state (hangar vs pier) and selected squadron (persisted for back navigation)
  const { fleetSubTab, setFleetSubTab, selectedSquadronId, setSelectedSquadronId } = useNavigationStore();

  // Use dynamic squadron data from store
  const {
    swarmSquadrons: allSquadrons,
    getResolvedSquadron,
    comparisonSquadronIds
  } = useSquadronStore();

  // Helper to get platformType from squadron
  const getSquadronPlatformType = (squadron) => {
    // First check if squadron has platformType directly
    if (squadron.platformType) return squadron.platformType;
    // Fallback: look up by icon
    const vessel = vesselHullData.find(v => v.icon === squadron.icon || v.name === squadron.icon);
    return vessel?.platformType;
  };

  // Filter squadrons based on selected sub-tab
  // Pier (maritime) is capped at 12 — edit PIER_LIMIT to show more
  const PIER_LIMIT = 12;
  const swarmSquadrons = allSquadrons.filter(squadron => {
    const platformType = getSquadronPlatformType(squadron);
    if (fleetSubTab === 'hangar') {
      return isAerialPlatform(platformType);
    }
    return isMaritimePlatform(platformType);
  }).slice(0, fleetSubTab === 'hangar' ? Infinity : PIER_LIMIT);

  // Filter hull data for hull picker based on sub-tab
  const filteredHullData = vesselHullData.filter(vessel => {
    if (fleetSubTab === 'hangar') {
      return isAerialPlatform(vessel.platformType);
    }
    return isMaritimePlatform(vessel.platformType);
  });

  // Auto-select first squadron if none selected or current selection not in filtered list
  React.useEffect(() => {
    const currentInList = swarmSquadrons.some(s => s.id === selectedSquadronId);
    if ((!selectedSquadronId || !currentInList) && swarmSquadrons.length > 0) {
      setSelectedSquadronId(swarmSquadrons[0].id);
    }
  }, [selectedSquadronId, swarmSquadrons, fleetSubTab, setSelectedSquadronId]);

  // Calculate mission readiness percentage
  const getMissionReadiness = (squadron) => {
    const status = squadron.status || {};
    const missionReady = status.missionReady || 0;
    const total = squadron.totalUnits || 1;
    return Math.round((missionReady / total) * 100);
  };

  // Get the selected squadron data
  const selectedSquadron = selectedSquadronId
    ? getResolvedSquadron(selectedSquadronId) || swarmSquadrons.find(s => s.id === selectedSquadronId)
    : null;

  return (
    <div>
      {/* Header with Hangar/Pier Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          {/* Sub-tab Toggle */}
          <div className="toggle-group mb-3">
            <button
              onClick={() => setFleetSubTab('pier')}
              className={`toggle-btn ${fleetSubTab === 'pier' ? 'toggle-btn-active' : ''}`}
            >
              <Anchor size={16} />
              PIER
            </button>
            <button
              onClick={() => setFleetSubTab('hangar')}
              className={`toggle-btn ${fleetSubTab === 'hangar' ? 'toggle-btn-active' : ''}`}
            >
              <Plane size={16} />
              HANGAR
            </button>
          </div>
        </div>
        <button
          onClick={() => {
            if (selectedSquadron) {
              const vessel = vesselHullData.find(v => v.name === selectedSquadron.icon || v.icon === selectedSquadron.icon);
              if (vessel) onSelectHull(vessel);
            } else {
              setShowHullPicker(!showHullPicker);
            }
          }}
          className="px-4 py-2.5 md:px-5 md:py-3 bg-lime-brand text-black rounded-lg font-bold flex items-center gap-2 hover:bg-lime-brand/90 transition-colors text-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Configuration</span>
          <span className="sm:hidden">New Config</span>
        </button>
      </div>

      {/* Collapsible Hull Picker */}
      {showHullPicker && (
        <div className="bg-darker rounded-xl border border-lime-brand/30 mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700/30 flex items-center justify-between bg-lime-brand/5">
            <div className="flex items-center gap-3">
              <Settings className="text-lime-brand" size={20} />
              <span className="text-lime-brand font-semibold">Select Platform for New Configuration</span>
            </div>
            <button
              onClick={() => setShowHullPicker(false)}
              className="text-gray-400 hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
              {filteredHullData.map((vessel) => {
                const HullComponent = vesselHullComponents[vessel.icon];
                return (
                  <div
                    key={vessel.name}
                    onClick={() => {
                      onSelectHull(vessel);
                      setShowHullPicker(false);
                    }}
                    className="bg-darkest border border-gray-700/50 rounded-lg p-4 cursor-pointer transition-all hover:border-lime-brand hover:shadow-[0_0_20px_rgba(203,253,0,0.1)] group"
                  >
                    <div className="mb-3 flex justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                      {HullComponent && <HullComponent size={70} />}
                    </div>
                    <h3 className="text-lime-brand font-bold text-sm text-center mb-1">
                      {vessel.name.toUpperCase()}
                    </h3>
                    <p className="text-gray-500 text-xs text-center">
                      {vessel.type}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Squadron Grid - Scalable for many squadrons */}
      <div className="mb-6">
        {swarmSquadrons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 bg-darker rounded-xl border border-gray-700/50">
            {fleetSubTab === 'hangar' ? (
              <>
                <Plane size={48} className="text-gray-600 mb-4" />
                <h3 className="text-gray-300 text-lg font-semibold mb-2">No Aircraft Configured</h3>
                <p className="text-gray-500 text-sm text-center max-w-md mb-6">
                  Add UAV platforms like MQ-9 Reaper, MQ-25 Stingray, or MQ-8C Fire Scout to your air wing.
                </p>
              </>
            ) : (
              <>
                <Anchor size={48} className="text-gray-600 mb-4" />
                <h3 className="text-gray-300 text-lg font-semibold mb-2">No Vessels Configured</h3>
                <p className="text-gray-500 text-sm text-center max-w-md mb-6">
                  Add maritime platforms like MetalShark patrol boats, Saildrone USVs, or autonomous UUVs to your fleet.
                </p>
              </>
            )}
            <button
              onClick={() => setShowHullPicker(true)}
              className="px-5 py-3 bg-lime-brand text-black rounded-lg font-bold flex items-center gap-2 hover:bg-lime-brand/90 transition-colors text-sm"
            >
              <Plus size={18} />
              Add {fleetSubTab === 'hangar' ? 'Aircraft' : 'Vessel'}
            </button>
          </div>
        ) : (
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-6" style={{ scrollbarWidth: 'none' }}>
          {swarmSquadrons.map((rawSquadron) => {
            const squadron = getResolvedSquadron(rawSquadron.id) || rawSquadron;
            const HullComponent = vesselHullComponents[squadron.icon];
            const isSelected = selectedSquadronId === squadron.id;
            const isInComparison = comparisonSquadronIds.includes(squadron.id);
            const readinessPercent = getMissionReadiness(squadron);

            return (
              <button
                key={squadron.id}
                onClick={() => setSelectedSquadronId(squadron.id)}
                className={`relative p-3 rounded-xl border-2 transition-all h-[200px] flex flex-col items-center justify-between
                  snap-start flex-shrink-0 w-[75%] md:w-auto md:flex-shrink ${
                  isSelected
                    ? 'bg-lime-brand/10 border-lime-brand shadow-[0_0_20px_rgba(203,253,0,0.15)]'
                    : isInComparison
                    ? 'bg-blue-500/10 border-blue-500/50 hover:border-blue-400'
                    : 'bg-darker border-gray-700/50 hover:border-gray-600 hover:bg-darker/80'
                }`}
              >
                {/* Top Section: Hull + Status */}
                <div className="flex-1 flex flex-col items-center justify-center w-full">
                  {/* Hull Thumbnail */}
                  <div className="relative mb-2 flex-1 min-h-[110px] w-full flex items-center justify-center">
                    {HullComponent ? (
                      <HullComponent size={115} />
                    ) : (
                      <Ship size={95} className="text-gray-600" />
                    )}
                  </div>
                  {/* Squadron Name */}
                  <div
                    className={`text-xs font-semibold text-center truncate w-full px-1 ${
                      isSelected ? 'text-lime-brand' : 'text-gray-300'
                    }`}
                  >
                    {squadron.name.length > 20
                      ? squadron.name.split(' ').slice(0, 2).join(' ')
                      : squadron.name}
                  </div>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-lime-brand" />
                )}
                {/* Comparison checkbox indicator */}
                {isInComparison && !isSelected && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded flex items-center justify-center">
                    <Check size={10} className="text-white" />
                  </div>
                )}
                {/* Low readiness warning */}
                {readinessPercent < 30 && readinessPercent > 0 && (
                  <div className="absolute top-2 left-2">
                    <AlertTriangle size={12} className="text-red-400" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        )}
      </div>

      {/* Selected Squadron Detail Card */}
      {selectedSquadron && (() => {
        const squadron = selectedSquadron;
        const isInComparison = comparisonSquadronIds.includes(squadron.id);
        const HullComponent = vesselHullComponents[squadron.icon];

        return (
          <div
            className={`bg-darker border-2 rounded-2xl overflow-hidden transition-all ${
              isInComparison
                ? 'border-blue-500/50'
                : 'border-lime-brand/30'
            }`}
          >
            {/* Hero Section with Large Hull */}
            <div className="relative">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-lime-brand/5 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-darker" />

              <div className="relative flex flex-col md:flex-row items-center p-5 md:p-8 gap-2 md:gap-0">
                {/* Large Hull Visualization */}
                <div className="flex-shrink-0 md:mr-10">
                  <div className="relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 blur-3xl bg-lime-brand/15 rounded-full scale-75" />
                    <div className="relative">
                      {HullComponent ? (
                        <HullComponent size={200} />
                      ) : (
                        <Ship size={160} className="text-gray-600" />
                      )}
                    </div>
                  </div>
                  {/* Mobile: Configure button under image */}
                  <button
                    onClick={() => {
                      const vessel = vesselHullData.find(v => v.name === squadron.icon || v.icon === squadron.icon);
                      if (vessel) onSelectHull(vessel);
                    }}
                    className="md:hidden mt-4 w-full px-6 py-2.5 bg-lime-brand text-black rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-lime-brand/90 transition-colors"
                  >
                    Configure
                    <ChevronRight size={18} />
                  </button>
                </div>

                {/* Squadron Info */}
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-start justify-between mb-3 md:mb-6">
                    <div>
                      <h3 className="text-gray-50 font-bold text-2xl md:text-3xl mb-2 text-center md:text-left">
                        {squadron.name}
                      </h3>
                      <p className="text-gray-400 hidden md:block">
                        {squadron.type} • {squadron.description}
                      </p>
                      {squadron.isVariation && (
                        <div className="mt-3">
                          <VariationBadge
                            parentName={squadron.parentName}
                            parentId={squadron.parentId}
                            size="small"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Configure — desktop only */}
                  <div className="hidden md:flex items-center">
                    {/* Configure Button */}
                    <button
                      onClick={() => {
                        const vessel = vesselHullData.find(v => v.name === squadron.icon || v.icon === squadron.icon);
                        if (vessel) onSelectHull(vessel);
                      }}
                      className="px-6 py-3 bg-lime-brand text-black rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-lime-brand/90 transition-colors"
                    >
                      Configure
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        );
      })()}

    </div>
  );
};

export default ShipyardView;
