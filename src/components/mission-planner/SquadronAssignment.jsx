import React, { useMemo } from 'react';
import { Users, Check, Plane, Ship, Radar, Target, Radio, Gauge, Zap, AlertTriangle } from 'lucide-react';
import { isAerialSquadron, isMaritimeSquadron } from '../../data/fleetData';
import { vesselHullData } from '../../data/vesselData';

// For COMBINED missions, we use a structured format: { aerial: [], maritime: [] }
// For single-domain missions, we use a flat array: []

const SquadronAssignment = ({
  assignedSquadrons,
  setAssignedSquadrons,
  availableSquadrons,
  missionDomain = 'MARITIME' // 'MARITIME' | 'AERIAL' | 'COMBINED'
}) => {
  const isCombined = missionDomain === 'COMBINED';

  // Normalize assignedSquadrons to handle both formats
  const getAssignedForDomain = (domain) => {
    if (isCombined) {
      return assignedSquadrons?.[domain.toLowerCase()] || [];
    }
    return assignedSquadrons || [];
  };

  const aerialAssigned = getAssignedForDomain('AERIAL');
  const maritimeAssigned = getAssignedForDomain('MARITIME');

  const toggleSquadron = (squadronId, squadronDomain) => {
    if (isCombined) {
      const key = squadronDomain === 'AERIAL' ? 'aerial' : 'maritime';
      const currentList = assignedSquadrons?.[key] || [];
      const newList = currentList.includes(squadronId)
        ? currentList.filter(id => id !== squadronId)
        : [...currentList, squadronId];
      setAssignedSquadrons({
        ...assignedSquadrons,
        [key]: newList
      });
    } else {
      if (assignedSquadrons.includes(squadronId)) {
        setAssignedSquadrons(assignedSquadrons.filter(id => id !== squadronId));
      } else {
        setAssignedSquadrons([...assignedSquadrons, squadronId]);
      }
    }
  };

  const getMissionTypeColorClass = (objective) => {
    const colors = {
      'target_destruction': 'bg-red-500',
      'reconnaissance': 'bg-cyan-500',
      'interdiction': 'bg-orange-500',
      'logistics_support': 'bg-violet-500'
    };
    return colors[objective] || 'bg-gray-500';
  };

  // Filter squadrons by domain
  const filterByDomain = (squadrons, domain) => {
    if (domain === 'AERIAL') return squadrons.filter(isAerialSquadron);
    if (domain === 'MARITIME') return squadrons.filter(isMaritimeSquadron);
    return squadrons;
  };

  // Get squadrons for the current mission domain
  const getRelevantSquadrons = () => {
    if (missionDomain === 'AERIAL') return filterByDomain(availableSquadrons, 'AERIAL');
    if (missionDomain === 'MARITIME') return filterByDomain(availableSquadrons, 'MARITIME');
    return availableSquadrons; // COMBINED shows all
  };

  const relevantSquadrons = getRelevantSquadrons();
  const readySquadrons = relevantSquadrons.filter(s => s.operationalStatus === 'MISSION READY' || s.status?.missionReady > 0);
  const deployedSquadrons = relevantSquadrons.filter(s => s.operationalStatus === 'DEPLOYED' || s.status?.deployed > 0);

  // For combined missions, split ready squadrons by domain
  const aerialReady = readySquadrons.filter(isAerialSquadron);
  const maritimeReady = readySquadrons.filter(isMaritimeSquadron);

  const getTotalSelected = () => {
    if (isCombined) {
      return (aerialAssigned.length || 0) + (maritimeAssigned.length || 0);
    }
    return assignedSquadrons?.length || 0;
  };

  // Calculate combined fleet stats based on selected squadrons
  const combinedStats = useMemo(() => {
    const getAllSelectedIds = () => {
      if (isCombined) {
        return [...(aerialAssigned || []), ...(maritimeAssigned || [])];
      }
      return assignedSquadrons || [];
    };

    const selectedIds = getAllSelectedIds();
    const selectedSquadrons = availableSquadrons.filter(s => selectedIds.includes(s.id));

    if (selectedSquadrons.length === 0) {
      return null;
    }

    // Calculate totals
    let totalUnits = 0;
    let totalReadyUnits = 0;
    let sensorCount = 0;
    let weaponCount = 0;
    let commsCount = 0;
    let minRange = Infinity;
    let minEndurance = Infinity;
    let aerialUnits = 0;
    let maritimeUnits = 0;

    selectedSquadrons.forEach(squadron => {
      const units = squadron.totalUnits || squadron.units || 0;
      const readyUnits = squadron.status?.missionReady || 0;
      totalUnits += units;
      totalReadyUnits += readyUnits;

      if (isAerialSquadron(squadron)) {
        aerialUnits += readyUnits;
      } else {
        maritimeUnits += readyUnits;
      }

      // Get vessel specs for range calculation
      const hullData = vesselHullData.find(v => v.name === squadron.icon || v.icon === squadron.icon);
      if (hullData?.specs?.range) {
        minRange = Math.min(minRange, hullData.specs.range);
      }
      if (hullData?.aerialSpecs?.endurance) {
        minEndurance = Math.min(minEndurance, hullData.aerialSpecs.endurance);
      }

      // Count capabilities from squadron configuration if available
      const config = squadron.configuration || squadron.outfits || [];
      if (Array.isArray(config)) {
        config.forEach(slot => {
          const cat = slot?.category?.toUpperCase() || '';
          if (cat.includes('SENSOR') || cat.includes('EO/IR') || cat.includes('RADAR')) {
            sensorCount++;
          } else if (cat.includes('WEAPON') || cat.includes('KINETIC')) {
            weaponCount++;
          } else if (cat.includes('COMM') || cat.includes('SATCOM')) {
            commsCount++;
          }
        });
      }
    });

    return {
      totalUnits,
      totalReadyUnits,
      sensorCount,
      weaponCount,
      commsCount,
      minRange: minRange === Infinity ? null : minRange,
      minEndurance: minEndurance === Infinity ? null : minEndurance,
      aerialUnits,
      maritimeUnits,
      squadronCount: selectedSquadrons.length
    };
  }, [isCombined, aerialAssigned, maritimeAssigned, assignedSquadrons, availableSquadrons]);

  // Combined Stats Display Component
  const CombinedStatsPanel = () => {
    if (!combinedStats) return null;

    return (
      <div className="bg-darkest rounded border border-lime-brand/30 p-2 mb-2">
        <div className="text-lime-brand text-[0.5rem] font-semibold mb-1.5 flex items-center gap-1">
          <Zap size={10} />
          COMBINED FLEET STATS
        </div>

        {/* Primary Stats Row */}
        <div className="grid grid-cols-3 gap-1.5 mb-1.5">
          <div className="bg-darker rounded p-1.5 text-center">
            <div className="text-lime-brand text-[0.75rem] font-bold">{combinedStats.totalReadyUnits}</div>
            <div className="text-gray-500 text-[0.4rem] uppercase">Ready Units</div>
          </div>
          <div className="bg-darker rounded p-1.5 text-center">
            <div className="text-cyan-400 text-[0.75rem] font-bold">{combinedStats.squadronCount}</div>
            <div className="text-gray-500 text-[0.4rem] uppercase">Squadrons</div>
          </div>
          <div className="bg-darker rounded p-1.5 text-center">
            <div className="text-yellow-400 text-[0.75rem] font-bold">
              {combinedStats.minRange ? `${combinedStats.minRange}nm` : '—'}
            </div>
            <div className="text-gray-500 text-[0.4rem] uppercase">Fleet Range</div>
          </div>
        </div>

        {/* Domain Breakdown (for combined missions) */}
        {isCombined && (combinedStats.aerialUnits > 0 || combinedStats.maritimeUnits > 0) && (
          <div className="flex gap-1.5 mb-1.5">
            {combinedStats.aerialUnits > 0 && (
              <div className="flex-1 flex items-center gap-1 bg-cyan-500/10 rounded px-1.5 py-0.5">
                <Plane size={8} className="text-cyan-400" />
                <span className="text-cyan-400 text-[0.45rem] font-semibold">{combinedStats.aerialUnits}</span>
                <span className="text-gray-500 text-[0.4rem]">air</span>
              </div>
            )}
            {combinedStats.maritimeUnits > 0 && (
              <div className="flex-1 flex items-center gap-1 bg-blue-500/10 rounded px-1.5 py-0.5">
                <Ship size={8} className="text-blue-400" />
                <span className="text-blue-400 text-[0.45rem] font-semibold">{combinedStats.maritimeUnits}</span>
                <span className="text-gray-500 text-[0.4rem]">surface</span>
              </div>
            )}
          </div>
        )}

        {/* Capability Icons */}
        <div className="flex gap-2 justify-center">
          {combinedStats.sensorCount > 0 && (
            <div className="flex items-center gap-0.5" title="Sensor Systems">
              <Radar size={10} className="text-cyan-400" />
              <span className="text-cyan-400 text-[0.5rem]">{combinedStats.sensorCount}</span>
            </div>
          )}
          {combinedStats.weaponCount > 0 && (
            <div className="flex items-center gap-0.5" title="Weapon Systems">
              <Target size={10} className="text-red-400" />
              <span className="text-red-400 text-[0.5rem]">{combinedStats.weaponCount}</span>
            </div>
          )}
          {combinedStats.commsCount > 0 && (
            <div className="flex items-center gap-0.5" title="Comms Systems">
              <Radio size={10} className="text-green-400" />
              <span className="text-green-400 text-[0.5rem]">{combinedStats.commsCount}</span>
            </div>
          )}
          {combinedStats.minEndurance && (
            <div className="flex items-center gap-0.5" title="Min Endurance">
              <Gauge size={10} className="text-yellow-400" />
              <span className="text-yellow-400 text-[0.5rem]">{combinedStats.minEndurance}h</span>
            </div>
          )}
        </div>

        {/* Fleet Range Warning */}
        {combinedStats.minRange && combinedStats.minRange < 100 && (
          <div className="flex items-center gap-1 mt-1.5 text-orange-400 text-[0.4rem] bg-orange-500/10 rounded px-1.5 py-0.5">
            <AlertTriangle size={8} />
            <span>Limited fleet range ({combinedStats.minRange}nm) - consider logistics support</span>
          </div>
        )}
      </div>
    );
  };

  const renderSquadronButton = (squadron, isSelected, domain) => (
    <button
      key={squadron.id}
      onClick={() => toggleSquadron(squadron.id, domain)}
      className={`flex items-center gap-2 p-2 rounded cursor-pointer w-full text-left transition-colors
        ${isSelected
          ? 'bg-lime-brand/15 border border-lime-brand'
          : 'bg-darkest border border-border-subtle hover:border-gray-500'
        }`}
    >
      <div
        className={`w-4 h-4 rounded flex items-center justify-center ${
          isSelected ? 'bg-lime-brand' : 'bg-transparent border border-gray-500'
        }`}
      >
        {isSelected && <Check size={10} className="text-black" />}
      </div>
      <div className={`w-2 h-2 rounded-full ${getMissionTypeColorClass(squadron.missionObjective)}`} />
      <div className="flex-1 min-w-0">
        <div className="text-gray-50 text-[0.6rem] font-semibold truncate">{squadron.name}</div>
        <div className="text-gray-500 text-[0.45rem] truncate">
          {squadron.totalUnits || squadron.units} units
        </div>
      </div>
      <div className="text-green-400 text-[0.4rem] px-1 py-0.5 bg-green-400/10 rounded flex-shrink-0">
        {squadron.status?.missionReady || 0} READY
      </div>
    </button>
  );

  // Single-domain view (AERIAL or MARITIME)
  const renderSingleDomainView = () => (
    <div className="flex-1 overflow-y-auto">
      <div className="text-green-400 text-[0.5rem] font-semibold mb-1">
        MISSION READY ({readySquadrons.length})
      </div>
      <div className="flex flex-col gap-1 mb-2">
        {readySquadrons.map(squadron => {
          const isSelected = assignedSquadrons.includes(squadron.id);
          return renderSquadronButton(squadron, isSelected, missionDomain);
        })}
        {readySquadrons.length === 0 && (
          <div className="text-gray-500 text-[0.55rem] p-2 text-center">
            No {missionDomain.toLowerCase()} squadrons available
          </div>
        )}
      </div>

      {deployedSquadrons.length > 0 && (
        <>
          <div className="text-orange-500 text-[0.5rem] font-semibold mb-1">
            DEPLOYED ({deployedSquadrons.length})
          </div>
          <div className="flex flex-col gap-1">
            {deployedSquadrons.map(squadron => {
              const isSelected = assignedSquadrons.includes(squadron.id);
              return (
                <button
                  key={squadron.id}
                  onClick={() => toggleSquadron(squadron.id, missionDomain)}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer w-full text-left transition-colors
                    ${isSelected
                      ? 'bg-orange-500/15 border border-orange-500'
                      : 'bg-orange-500/5 border border-orange-500/20 hover:border-orange-500/50'
                    }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center ${
                      isSelected ? 'bg-orange-500' : 'bg-transparent border border-orange-500/50'
                    }`}
                  >
                    {isSelected && <Check size={10} className="text-black" />}
                  </div>
                  <div className={`w-2 h-2 rounded-full ${getMissionTypeColorClass(squadron.missionObjective)}`} />
                  <div className="flex-1">
                    <div className="text-gray-50 text-[0.6rem] font-semibold">{squadron.name}</div>
                    <div className="text-orange-500 text-[0.45rem]">{squadron.totalUnits || squadron.units} units</div>
                  </div>
                  <div className="text-orange-500 text-[0.4rem] px-1 py-0.5 bg-orange-500/10 rounded">
                    {squadron.status?.deployed || 0} DEPLOYED
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );

  // Combined view (AERIAL + MARITIME)
  const renderCombinedView = () => (
    <div className="flex-1 overflow-y-auto">
      {/* Aerial Section */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Plane size={12} className="text-cyan-400" />
          <span className="text-cyan-400 text-[0.5rem] font-semibold tracking-wide">
            AIR WING ({aerialReady.length})
          </span>
          {aerialAssigned.length > 0 && (
            <span className="text-lime-brand text-[0.45rem] ml-auto">
              {aerialAssigned.length} selected
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          {aerialReady.map(squadron => {
            const isSelected = aerialAssigned.includes(squadron.id);
            return renderSquadronButton(squadron, isSelected, 'AERIAL');
          })}
          {aerialReady.length === 0 && (
            <div className="text-gray-500 text-[0.5rem] p-1.5 text-center bg-darkest rounded">
              No aerial squadrons available
            </div>
          )}
        </div>
      </div>

      {/* Maritime Section */}
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Ship size={12} className="text-blue-400" />
          <span className="text-blue-400 text-[0.5rem] font-semibold tracking-wide">
            SURFACE/SUBSURFACE ({maritimeReady.length})
          </span>
          {maritimeAssigned.length > 0 && (
            <span className="text-lime-brand text-[0.45rem] ml-auto">
              {maritimeAssigned.length} selected
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          {maritimeReady.map(squadron => {
            const isSelected = maritimeAssigned.includes(squadron.id);
            return renderSquadronButton(squadron, isSelected, 'MARITIME');
          })}
          {maritimeReady.length === 0 && (
            <div className="text-gray-500 text-[0.5rem] p-1.5 text-center bg-darkest rounded">
              No maritime squadrons available
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-darker rounded-lg border border-border-subtle p-3 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-lime-brand" />
          <h4 className="text-lime-brand text-[0.7rem] font-semibold m-0">
            {isCombined ? 'COMBINED FORCES' : 'ASSIGN SQUADRON'}
          </h4>
        </div>
        <span className="text-gray-500 text-[0.55rem]">
          {getTotalSelected()} selected
        </span>
      </div>

      <CombinedStatsPanel />

      {isCombined ? renderCombinedView() : renderSingleDomainView()}
    </div>
  );
};

export default SquadronAssignment;
