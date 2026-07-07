import React, { useMemo } from 'react';
import { Users, Check, Plane, Ship, Radar, Target, Radio, Gauge, Zap, AlertTriangle, Eye, Shield, Waves, Crosshair, Wifi, Satellite, Clock, MapPin } from 'lucide-react';
import { isAerialSquadron, isMaritimeSquadron } from '../../data/fleetData';
import { vesselHullData } from '../../data/vesselData';

// Mission requirements - what capabilities each mission type needs
const MISSION_REQUIREMENTS = {
  // Maritime missions
  SEA_DENIAL: {
    required: ['weapons', 'sensors'],
    optional: ['comms', 'ew'],
    labels: { weapons: 'Strike Capability', sensors: 'Target Detection' }
  },
  MCM: {
    required: ['sonar', 'sensors'],
    optional: ['weapons'],
    labels: { sonar: 'Side-scan Sonar', sensors: 'Mine Detection' }
  },
  ASW: {
    required: ['sonar', 'sensors'],
    optional: ['weapons', 'comms'],
    labels: { sonar: 'Sonar Array', sensors: 'Sub Detection' }
  },
  SURVEY: {
    required: ['sensors', 'comms'],
    optional: [],
    labels: { sensors: 'Bathymetric Sensors', comms: 'Data Link' }
  },
  RECONNAISSANCE: {
    required: ['sensors', 'comms'],
    optional: ['ew'],
    labels: { sensors: 'ISR Sensors', comms: 'SATCOM' }
  },
  ESCORT: {
    required: ['sensors', 'weapons'],
    optional: ['comms', 'ew'],
    labels: { sensors: 'Threat Detection', weapons: 'Point Defense' }
  },
  CONTESTED_LOGISTICS: {
    required: ['sensors', 'comms'],
    optional: ['ew'],
    labels: { sensors: 'Situational Awareness', comms: 'Covert Comms' }
  },
  REFLEX_SWARM_ATTACK: {
    required: ['weapons', 'comms'],
    optional: ['sensors'],
    labels: { weapons: 'Strike Package', comms: 'Swarm Coordination' }
  },
  ROBOT_DEFENSE_OODA: {
    required: ['ew', 'comms'],
    optional: ['sensors'],
    labels: { ew: 'SIGINT Collection', comms: 'Data Exfil' }
  },
  // Aerial missions
  AERIAL_ISR: {
    required: ['sensors', 'comms'],
    optional: [],
    labels: { sensors: 'EO/IR Sensors', comms: 'BLOS Link' }
  },
  PERSISTENT_MDA: {
    required: ['sensors', 'comms'],
    optional: ['ew'],
    labels: { sensors: 'Radar/SIGINT', comms: 'SATCOM' }
  },
  AERIAL_REFUELING: {
    required: ['comms'],
    optional: [],
    labels: { comms: 'Tanker Link' }
  },
  TACTICAL_SUPPORT: {
    required: ['sensors', 'weapons'],
    optional: ['comms'],
    labels: { sensors: 'Targeting', weapons: 'Ordnance' }
  },
  COMMS_RELAY: {
    required: ['comms'],
    optional: [],
    labels: { comms: 'Relay Package' }
  },
  // Combined missions
  COMBINED_ISR_DENIAL: {
    required: ['sensors', 'weapons', 'comms'],
    optional: ['ew'],
    labels: { sensors: 'Multi-domain ISR', weapons: 'Strike', comms: 'C2 Link' }
  },
  COMBINED_ASW: {
    required: ['sonar', 'sensors', 'comms'],
    optional: ['weapons'],
    labels: { sonar: 'Sonar Array', sensors: 'Detection', comms: 'Coordination' }
  },
  COMBINED_ESCORT: {
    required: ['sensors', 'comms'],
    optional: ['weapons', 'ew'],
    labels: { sensors: 'Overwatch', comms: 'Tactical Net' }
  },
  COMBINED_STRIKE: {
    required: ['sensors', 'weapons', 'comms'],
    optional: [],
    labels: { sensors: 'Targeting', weapons: 'Strike Package', comms: 'Kill Chain' }
  }
};

// Map capability keywords to categories
const categorizeCapabilities = (capabilities = []) => {
  const cats = {
    sensors: false,
    weapons: false,
    comms: false,
    ew: false,
    sonar: false
  };

  capabilities.forEach(cap => {
    const capLower = (cap || '').toLowerCase();
    if (capLower.includes('sensor') || capLower.includes('camera') || capLower.includes('radar') || capLower.includes('detection') || capLower.includes('isr') || capLower.includes('surveillance')) {
      cats.sensors = true;
    }
    if (capLower.includes('weapon') || capLower.includes('missile') || capLower.includes('torpedo') || capLower.includes('attack') || capLower.includes('strike') || capLower.includes('ordnance')) {
      cats.weapons = true;
    }
    if (capLower.includes('comm') || capLower.includes('satcom') || capLower.includes('link') || capLower.includes('relay') || capLower.includes('network')) {
      cats.comms = true;
    }
    if (capLower.includes('ew') || capLower.includes('electronic') || capLower.includes('sigint') || capLower.includes('elint') || capLower.includes('jamming')) {
      cats.ew = true;
    }
    if (capLower.includes('sonar') || capLower.includes('acoustic') || capLower.includes('asw') || capLower.includes('submarine')) {
      cats.sonar = true;
    }
  });

  return cats;
};

// Capability icons
const CAPABILITY_ICONS = {
  sensors: { icon: Eye, color: 'cyan', label: 'Sensors' },
  weapons: { icon: Target, color: 'red', label: 'Weapons' },
  comms: { icon: Radio, color: 'green', label: 'Comms' },
  c2: { icon: Shield, color: 'orange', label: 'C2' },
  sonar: { icon: Waves, color: 'blue', label: 'Sonar' }
};

// For COMBINED missions, we use a structured format: { aerial: [], maritime: [] }
// For single-domain missions, we use a flat array: []

const SquadronAssignment = ({
  assignedSquadrons,
  setAssignedSquadrons,
  availableSquadrons,
  missionDomain = 'MARITIME', // 'MARITIME' | 'AERIAL' | 'COMBINED'
  missionType = null // e.g., 'MCM', 'SEA_DENIAL', etc.
}) => {
  const isCombined = missionDomain === 'COMBINED';
  const requirements = useMemo(
    () => MISSION_REQUIREMENTS[missionType] || { required: [], optional: [], labels: {} },
    [missionType]
  );

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
    let minRange = Infinity;
    let minEndurance = Infinity;
    let aerialUnits = 0;
    let maritimeUnits = 0;

    // Track capabilities coverage
    const coveredCapabilities = {
      sensors: false,
      weapons: false,
      comms: false,
      ew: false,
      sonar: false
    };
    const capabilityCounts = { sensors: 0, weapons: 0, comms: 0, ew: 0, sonar: 0 };

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

      // Categorize squadron capabilities
      const squadronCaps = categorizeCapabilities(squadron.capabilities || []);
      Object.keys(squadronCaps).forEach(key => {
        if (squadronCaps[key]) {
          coveredCapabilities[key] = true;
          capabilityCounts[key] += readyUnits;
        }
      });
    });

    // Calculate coverage percentage based on mission requirements
    const requiredCaps = requirements.required || [];
    const coveredRequired = requiredCaps.filter(cap => coveredCapabilities[cap]).length;
    const coveragePercent = requiredCaps.length > 0
      ? Math.round((coveredRequired / requiredCaps.length) * 100)
      : 100;

    // Find gaps
    const gaps = requiredCaps.filter(cap => !coveredCapabilities[cap]);

    return {
      totalUnits,
      totalReadyUnits,
      minRange: minRange === Infinity ? null : minRange,
      minEndurance: minEndurance === Infinity ? null : minEndurance,
      aerialUnits,
      maritimeUnits,
      squadronCount: selectedSquadrons.length,
      coveredCapabilities,
      capabilityCounts,
      coveragePercent,
      gaps,
      isComplete: gaps.length === 0 && selectedSquadrons.length > 0
    };
  }, [isCombined, aerialAssigned, maritimeAssigned, assignedSquadrons, availableSquadrons, requirements]);

  // Analyze each squadron's fit for this mission
  const getSquadronFit = (squadron) => {
    const squadronCaps = categorizeCapabilities(squadron.capabilities || []);
    const requiredCaps = requirements.required || [];

    const matchedRequired = requiredCaps.filter(cap => squadronCaps[cap]);
    const matchPercent = requiredCaps.length > 0
      ? Math.round((matchedRequired.length / requiredCaps.length) * 100)
      : 100;

    return {
      matchPercent,
      matchedRequired,
      missingRequired: requiredCaps.filter(cap => !squadronCaps[cap]),
      squadronCaps,
      isBestMatch: matchPercent >= 80,
      isPartialMatch: matchPercent >= 50 && matchPercent < 80,
      isPoorMatch: matchPercent < 50
    };
  };

  // Mission Requirements Bar (plain render function — not a nested component,
  // which would remount on every parent render)
  const renderMissionRequirementsBar = () => {
    if (!missionType || requirements.required.length === 0) return null;

    const requiredCaps = requirements.required;
    const coveredCaps = combinedStats?.coveredCapabilities || {};

    return (
      <div className="bg-darkest rounded border border-gray-700/50 p-2 mb-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-gray-400 text-[0.5rem] font-semibold uppercase">Mission Requires</span>
          {combinedStats && (
            <span
              className={`text-[0.5rem] font-bold ${
                combinedStats.gaps.length === 0 ? 'text-green-400' : 'text-orange-400'
              }`}
            >
              {combinedStats.gaps.length === 0 ? '✓ All covered' : `${combinedStats.gaps.length} gap${combinedStats.gaps.length > 1 ? 's' : ''}`}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {requiredCaps.map(cap => {
            const capConfig = CAPABILITY_ICONS[cap];
            const isCovered = coveredCaps[cap];
            const Icon = capConfig?.icon || Eye;
            const label = requirements.labels?.[cap] || capConfig?.label || cap;

            return (
              <div
                key={cap}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.5rem] font-medium ${
                  isCovered
                    ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                    : 'bg-gray-700/50 border border-gray-600/50 text-gray-400'
                }`}
              >
                {isCovered ? <Check size={8} /> : <Icon size={8} />}
                {label}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Combined Stats Display (plain render function — see note above)
  const renderCombinedStatsPanel = () => {
    if (!combinedStats) return null;

    return (
      <div
        className={`bg-darkest rounded border p-2 mb-2 ${
          combinedStats.isComplete ? 'border-lime-brand/30' : 'border-gray-700/50'
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-lime-brand text-[0.5rem] font-semibold flex items-center gap-1">
            <Zap size={10} />
            ASSEMBLED FORCE
          </div>
          {missionType && (
            <div className="flex items-center gap-1">
              <div
                className={`text-[0.55rem] font-bold ${
                  combinedStats.coveragePercent >= 100 ? 'text-green-400' :
                  combinedStats.coveragePercent >= 50 ? 'text-yellow-400' : 'text-red-400'
                }`}
              >
                {combinedStats.coveragePercent}%
              </div>
              <span className="text-gray-500 text-[0.45rem]">coverage</span>
            </div>
          )}
        </div>

        {/* Coverage Progress Bar */}
        {missionType && (
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full transition-all ${
                combinedStats.coveragePercent >= 100 ? 'bg-green-500' :
                combinedStats.coveragePercent >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${combinedStats.coveragePercent}%` }}
            />
          </div>
        )}

        {/* Primary Stats Row */}
        <div className="grid grid-cols-3 gap-1.5 mb-1.5">
          <div className="bg-darker rounded p-1.5 text-center">
            <div className="text-lime-brand text-[0.75rem] font-bold">{combinedStats.totalReadyUnits}</div>
            <div className="text-gray-500 text-[0.4rem] uppercase">Ready</div>
          </div>
          <div className="bg-darker rounded p-1.5 text-center">
            <div className="text-cyan-400 text-[0.75rem] font-bold">{combinedStats.squadronCount}</div>
            <div className="text-gray-500 text-[0.4rem] uppercase">Sqdn</div>
          </div>
          <div className="bg-darker rounded p-1.5 text-center">
            <div className="text-yellow-400 text-[0.75rem] font-bold">
              {combinedStats.minRange ? `${combinedStats.minRange}` : '—'}
            </div>
            <div className="text-gray-500 text-[0.4rem] uppercase">Range nm</div>
          </div>
        </div>

        {/* Capability Coverage Icons */}
        <div className="flex justify-center gap-1.5">
          {Object.entries(combinedStats.capabilityCounts).map(([cap, count]) => {
            if (count === 0) return null;
            const capConfig = CAPABILITY_ICONS[cap];
            const Icon = capConfig?.icon || Eye;
            const colorClass = {
              cyan: 'text-cyan-400 bg-cyan-500/20',
              red: 'text-red-400 bg-red-500/20',
              green: 'text-green-400 bg-green-500/20',
              purple: 'text-purple-400 bg-purple-500/20',
              blue: 'text-blue-400 bg-blue-500/20'
            }[capConfig?.color] || 'text-gray-400 bg-gray-500/20';

            return (
              <div
                key={cap}
                className={`flex items-center gap-0.5 px-1 py-0.5 rounded ${colorClass}`}
                title={`${capConfig?.label}: ${count} units`}
              >
                <Icon size={10} />
                <span className="text-[0.5rem] font-semibold">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Domain Breakdown (for combined missions) */}
        {isCombined && (combinedStats.aerialUnits > 0 || combinedStats.maritimeUnits > 0) && (
          <div className="flex gap-1.5 mt-1.5">
            {combinedStats.aerialUnits > 0 && (
              <div className="flex-1 flex items-center justify-center gap-1 bg-cyan-500/10 rounded px-1.5 py-0.5">
                <Plane size={8} className="text-cyan-400" />
                <span className="text-cyan-400 text-[0.5rem] font-semibold">{combinedStats.aerialUnits}</span>
                <span className="text-gray-500 text-[0.4rem]">air</span>
              </div>
            )}
            {combinedStats.maritimeUnits > 0 && (
              <div className="flex-1 flex items-center justify-center gap-1 bg-blue-500/10 rounded px-1.5 py-0.5">
                <Ship size={8} className="text-blue-400" />
                <span className="text-blue-400 text-[0.5rem] font-semibold">{combinedStats.maritimeUnits}</span>
                <span className="text-gray-500 text-[0.4rem]">sea</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderSquadronButton = (squadron, isSelected, domain) => {
    const fit = missionType ? getSquadronFit(squadron) : null;
    const readyCount = squadron.status?.missionReady || 0;

    return (
      <button
        key={squadron.id}
        onClick={() => toggleSquadron(squadron.id, domain)}
        className={`relative flex flex-col gap-1 p-2 rounded cursor-pointer w-full text-left transition-colors
          ${isSelected
            ? 'bg-lime-brand/15 border-2 border-lime-brand'
            : fit?.isBestMatch
            ? 'bg-green-500/5 border border-green-500/30 hover:border-green-500/50'
            : fit?.isPartialMatch
            ? 'bg-yellow-500/5 border border-yellow-500/20 hover:border-yellow-500/40'
            : 'bg-darkest border border-border-subtle hover:border-gray-500'
          }`}
      >
        {/* Top row: checkbox + name + ready count */}
        <div className="flex items-center gap-2">
          <div
            className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
              isSelected ? 'bg-lime-brand' : 'bg-transparent border border-gray-500'
            }`}
          >
            {isSelected && <Check size={10} className="text-black" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-gray-50 text-[0.6rem] font-semibold truncate">{squadron.name}</div>
          </div>
          <div className="text-green-400 text-[0.45rem] px-1 py-0.5 bg-green-400/10 rounded flex-shrink-0">
            {readyCount} READY
          </div>
        </div>

        {/* Bottom row: unit count + capability icons + fit indicator */}
        <div className="flex items-center gap-1.5 pl-6">
          <span className="text-gray-500 text-[0.45rem]">
            {squadron.totalUnits || squadron.units} units
          </span>

          {/* Capability icons */}
          {fit && (
            <div className="flex items-center gap-0.5 ml-auto">
              {Object.entries(fit.squadronCaps).map(([cap, hasCap]) => {
                if (!hasCap) return null;
                const capConfig = CAPABILITY_ICONS[cap];
                const Icon = capConfig?.icon || Eye;
                const isRequired = requirements.required.includes(cap);
                return (
                  <div
                    key={cap}
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center ${
                      isRequired ? 'bg-green-500/30' : 'bg-gray-600/30'
                    }`}
                    title={capConfig?.label}
                  >
                    <Icon size={8} className={isRequired ? 'text-green-400' : 'text-gray-400'} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Mission fit badge */}
          {fit && missionType && (
            <div
              className={`text-[0.4rem] font-bold px-1 py-0.5 rounded ${
                fit.isBestMatch
                  ? 'bg-green-500/20 text-green-400'
                  : fit.isPartialMatch
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-gray-600/20 text-gray-500'
              }`}
            >
              {fit.matchPercent}%
            </div>
          )}
        </div>
      </button>
    );
  };

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

      {renderMissionRequirementsBar()}
      {renderCombinedStatsPanel()}

      {isCombined ? renderCombinedView() : renderSingleDomainView()}
    </div>
  );
};

export default SquadronAssignment;
