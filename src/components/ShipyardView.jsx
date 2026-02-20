import React, { useState } from 'react';
import { Ship, ChevronDown, ChevronUp, Settings, Scale, X, Plus, Rocket, Check, Wrench, Battery, Package, ChevronRight, Plane, Anchor, Edit3, Target, Radio, Eye, Shield, AlertTriangle } from 'lucide-react';
import { vesselHullComponents, vesselHullData, isAerialPlatform, isMaritimePlatform } from '../data/vesselData';
import { squadronUnitConfigurations, activeDeployments } from '../data/fleetData';
import useSquadronStore from '../store/squadronStore';
import useNavigationStore from '../store/navigationStore';
import useOutfitterStore from '../store/outfitterStore';
import { VariationBadge, ComparisonView } from './variations';

const ShipyardView = ({
  openSquadronManagement,
  onSelectHull
}) => {
  const [showHullPicker, setShowHullPicker] = useState(false);

  // Fleet sub-tab state (hangar vs pier) and selected squadron (persisted for back navigation)
  const { fleetSubTab, setFleetSubTab, setSelectedView, selectedSquadronId, setSelectedSquadronId } = useNavigationStore();

  // Outfitter store for loading saved configurations
  const { loadSavedConfiguration } = useOutfitterStore();

  // Use dynamic squadron data from store
  const {
    swarmSquadrons: allSquadrons,
    getResolvedSquadron,
    comparisonSquadronIds,
    addToComparison,
    removeFromComparison,
    clearComparison,
    setComparisonViewOpen
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
  const swarmSquadrons = allSquadrons.filter(squadron => {
    const platformType = getSquadronPlatformType(squadron);
    if (fleetSubTab === 'hangar') {
      return isAerialPlatform(platformType);
    }
    return isMaritimePlatform(platformType);
  });

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
  }, [selectedSquadronId, swarmSquadrons, fleetSubTab]);

  // Get loadout configs for a squadron
  const getSquadronConfigs = (squadronId) => {
    return squadronUnitConfigurations[squadronId]?.outfits || [];
  };

  // Get active deployments for a squadron
  const getSquadronDeployments = (squadronId) => {
    return activeDeployments.filter(d => d.squadronId === squadronId);
  };

  // Calculate mission readiness percentage
  const getMissionReadiness = (squadron) => {
    const status = squadron.status || {};
    const missionReady = status.missionReady || 0;
    const total = squadron.totalUnits || 1;
    return Math.round((missionReady / total) * 100);
  };

  // Get capability indicators for a squadron based on its configurations
  const getCapabilityIndicators = (squadronId) => {
    const configs = getSquadronConfigs(squadronId);
    const capabilities = {
      hasSensors: false,
      hasWeapons: false,
      hasComms: false,
      hasEW: false
    };

    configs.forEach(config => {
      const capList = config.capabilities || [];
      capList.forEach(cap => {
        const capLower = (cap || '').toLowerCase();
        if (capLower.includes('sensor') || capLower.includes('radar') || capLower.includes('sonar') || capLower.includes('camera')) {
          capabilities.hasSensors = true;
        }
        if (capLower.includes('weapon') || capLower.includes('missile') || capLower.includes('torpedo') || capLower.includes('gun')) {
          capabilities.hasWeapons = true;
        }
        if (capLower.includes('comm') || capLower.includes('satcom') || capLower.includes('link')) {
          capabilities.hasComms = true;
        }
        if (capLower.includes('ew') || capLower.includes('electronic') || capLower.includes('esm') || capLower.includes('jam')) {
          capabilities.hasEW = true;
        }
      });
    });

    return capabilities;
  };

  // Handle direct edit of a saved configuration
  const handleEditConfig = (squadron, config) => {
    const success = loadSavedConfiguration(squadron, config);
    if (success) {
      setSelectedView('outfitter');
    }
  };

  // Get the selected squadron data
  const selectedSquadron = selectedSquadronId
    ? getResolvedSquadron(selectedSquadronId) || swarmSquadrons.find(s => s.id === selectedSquadronId)
    : null;

  return (
    <div>
      {/* Header with Hangar/Pier Toggle */}
      <div className="flex items-center justify-between mb-6">
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
          <p className="text-gray-400">
            {swarmSquadrons.length} squadrons • {swarmSquadrons.reduce((sum, s) => sum + (s.totalUnits || 0), 0).toLocaleString()} {fleetSubTab === 'hangar' ? 'aircraft' : 'vessels'}
          </p>
        </div>
        <button
          onClick={() => setShowHullPicker(!showHullPicker)}
          className="px-5 py-3 bg-lime-brand text-black rounded-lg font-bold flex items-center gap-2 hover:bg-lime-brand/90 transition-colors text-sm"
        >
          <Plus size={18} />
          New Configuration
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

      {/* Capability Legend */}
      <div className="flex items-center justify-end gap-4 mb-3 text-[0.65rem]">
        <span className="text-gray-500 uppercase tracking-wide">Capabilities:</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-cyan-500/20 flex items-center justify-center">
            <Eye size={8} className="text-cyan-400" />
          </div>
          <span className="text-gray-400">Sensors</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500/20 flex items-center justify-center">
            <Target size={8} className="text-red-400" />
          </div>
          <span className="text-gray-400">Weapons</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500/20 flex items-center justify-center">
            <Radio size={8} className="text-green-400" />
          </div>
          <span className="text-gray-400">Comms</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-purple-500/20 flex items-center justify-center">
            <Shield size={8} className="text-purple-400" />
          </div>
          <span className="text-gray-400">EW</span>
        </div>
      </div>

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
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
          {swarmSquadrons.map((rawSquadron) => {
            const squadron = getResolvedSquadron(rawSquadron.id) || rawSquadron;
            const HullComponent = vesselHullComponents[squadron.icon];
            const isSelected = selectedSquadronId === squadron.id;
            const isInComparison = comparisonSquadronIds.includes(squadron.id);
            const totalUnits = squadron.totalUnits || 0;
            const deployments = getSquadronDeployments(squadron.id);
            const deployedCount = deployments.reduce((sum, d) => sum + d.vesselCount, 0);
            const readinessPercent = getMissionReadiness(squadron);
            const caps = getCapabilityIndicators(squadron.id);
            const missionReady = squadron.status?.missionReady || 0;

            return (
              <button
                key={squadron.id}
                onClick={() => setSelectedSquadronId(squadron.id)}
                className={`relative p-3 rounded-xl border-2 transition-all h-[180px] flex flex-col items-center justify-between ${
                  isSelected
                    ? 'bg-lime-brand/10 border-lime-brand shadow-[0_0_20px_rgba(203,253,0,0.15)]'
                    : isInComparison
                    ? 'bg-blue-500/10 border-blue-500/50 hover:border-blue-400'
                    : 'bg-darker border-gray-700/50 hover:border-gray-600 hover:bg-darker/80'
                }`}
              >
                {/* Top Section: Hull + Status */}
                <div className="flex-1 flex flex-col items-center justify-center">
                  {/* Hull Thumbnail */}
                  <div className="relative mb-2 h-[60px] flex items-center justify-center">
                    {HullComponent ? (
                      <HullComponent size={55} />
                    ) : (
                      <Ship size={45} className="text-gray-600" />
                    )}
                    {/* Deployed indicator */}
                    {deployedCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Rocket size={10} className="text-white" />
                      </div>
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
                  {/* Unit Count */}
                  <div className="text-gray-500 text-[0.65rem] text-center">
                    {totalUnits} {fleetSubTab === 'hangar' ? 'aircraft' : 'vessels'}
                  </div>
                </div>

                {/* Mission Readiness Bar */}
                <div className="w-full px-1">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[0.55rem] font-semibold ${
                        readinessPercent >= 80 ? 'text-green-400' :
                        readinessPercent >= 50 ? 'text-yellow-400' : 'text-red-400'
                      }`}
                    >
                      {missionReady} READY
                    </span>
                    <span className="text-gray-500 text-[0.5rem]">{readinessPercent}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        readinessPercent >= 80 ? 'bg-green-500' :
                        readinessPercent >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${readinessPercent}%` }}
                    />
                  </div>
                </div>

                {/* Capability Icons */}
                {(caps.hasSensors || caps.hasWeapons || caps.hasComms || caps.hasEW) && (
                  <div className="flex items-center justify-center gap-1.5 mt-1.5">
                    {caps.hasSensors && (
                      <div className="w-4 h-4 rounded bg-cyan-500/20 flex items-center justify-center cursor-help hover:bg-cyan-500/40 transition-colors" title="Sensors: Cameras, Radar, Sonar">
                        <Eye size={10} className="text-cyan-400" />
                      </div>
                    )}
                    {caps.hasWeapons && (
                      <div className="w-4 h-4 rounded bg-red-500/20 flex items-center justify-center cursor-help hover:bg-red-500/40 transition-colors" title="Weapons: Missiles, Torpedoes, Guns">
                        <Target size={10} className="text-red-400" />
                      </div>
                    )}
                    {caps.hasComms && (
                      <div className="w-4 h-4 rounded bg-green-500/20 flex items-center justify-center cursor-help hover:bg-green-500/40 transition-colors" title="Comms: SATCOM, Data Links">
                        <Radio size={10} className="text-green-400" />
                      </div>
                    )}
                    {caps.hasEW && (
                      <div className="w-4 h-4 rounded bg-purple-500/20 flex items-center justify-center cursor-help hover:bg-purple-500/40 transition-colors" title="Electronic Warfare: ESM, Jamming">
                        <Shield size={10} className="text-purple-400" />
                      </div>
                    )}
                  </div>
                )}

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
        const configs = getSquadronConfigs(squadron.id);
        const deployments = getSquadronDeployments(squadron.id);
        const isInComparison = comparisonSquadronIds.includes(squadron.id);
        const HullComponent = vesselHullComponents[squadron.icon];

        // Calculate status totals
        const status = squadron.status || {};
        const missionReady = status.missionReady || 0;
        const deployed = status.deployed || 0;
        const charging = status.charging || 0;
        const maintenance = status.maintenance || 0;
        const totalUnits = squadron.totalUnits || missionReady + deployed + charging + maintenance;

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

              <div className="relative flex items-center p-8">
                {/* Large Hull Visualization */}
                <div className="flex-shrink-0 mr-10">
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
                </div>

                {/* Squadron Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-gray-50 font-bold text-3xl mb-2">
                        {squadron.name}
                      </h3>
                      <p className="text-gray-400">
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isInComparison) {
                          removeFromComparison(squadron.id);
                        } else {
                          addToComparison(squadron.id);
                        }
                      }}
                      className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-colors ${
                        isInComparison
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-600 hover:border-blue-400 bg-darkest/50'
                      }`}
                      title={isInComparison ? 'Remove from comparison' : 'Add to comparison'}
                    >
                      <Scale size={18} className={isInComparison ? 'text-white' : 'text-gray-400'} />
                    </button>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-8">
                    {/* Total Vessels */}
                    <div>
                      <div className="text-5xl font-bold text-lime-brand">{totalUnits.toLocaleString()}</div>
                      <div className="text-gray-500 text-sm uppercase tracking-wide">Total Vessels</div>
                    </div>

                    {/* Status Breakdown */}
                    <div className="flex-1 max-w-lg">
                      <div className="flex items-center gap-5 mb-3">
                        {missionReady > 0 && (
                          <div className="flex items-center gap-2">
                            <Check size={16} className="text-green-400" />
                            <span className="text-green-400 font-semibold">{missionReady}</span>
                            <span className="text-gray-500 text-sm">ready</span>
                          </div>
                        )}
                        {deployed > 0 && (
                          <div className="flex items-center gap-2">
                            <Rocket size={16} className="text-blue-400" />
                            <span className="text-blue-400 font-semibold">{deployed}</span>
                            <span className="text-gray-500 text-sm">deployed</span>
                          </div>
                        )}
                        {charging > 0 && (
                          <div className="flex items-center gap-2">
                            <Battery size={16} className="text-yellow-400" />
                            <span className="text-yellow-400 font-semibold">{charging}</span>
                            <span className="text-gray-500 text-sm">charging</span>
                          </div>
                        )}
                        {maintenance > 0 && (
                          <div className="flex items-center gap-2">
                            <Wrench size={16} className="text-red-400" />
                            <span className="text-red-400 font-semibold">{maintenance}</span>
                            <span className="text-gray-500 text-sm">maintenance</span>
                          </div>
                        )}
                      </div>
                      {/* Status Bar */}
                      <div className="h-3 bg-gray-800 rounded-full overflow-hidden flex">
                        {missionReady > 0 && (
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${(missionReady / totalUnits) * 100}%` }}
                          />
                        )}
                        {deployed > 0 && (
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${(deployed / totalUnits) * 100}%` }}
                          />
                        )}
                        {charging > 0 && (
                          <div
                            className="h-full bg-yellow-500"
                            style={{ width: `${(charging / totalUnits) * 100}%` }}
                          />
                        )}
                        {maintenance > 0 && (
                          <div
                            className="h-full bg-red-500"
                            style={{ width: `${(maintenance / totalUnits) * 100}%` }}
                          />
                        )}
                      </div>
                    </div>

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

            {/* Configurations Section */}
            {configs.length > 0 && (
              <div className="px-8 pb-6 pt-2">
                <div className="flex items-center gap-2 mb-4">
                  <Package size={16} className="text-gray-500" />
                  <span className="text-gray-400 text-sm font-semibold uppercase tracking-wide">
                    {configs.length} Saved Configuration{configs.length !== 1 ? 's' : ''}
                  </span>
                  {deployments.length > 0 && (
                    <span className="ml-auto text-blue-400 text-sm flex items-center gap-1.5">
                      <Rocket size={14} />
                      {deployments.reduce((sum, d) => sum + d.vesselCount, 0)} {fleetSubTab === 'hangar' ? 'aircraft' : 'vessels'} on mission
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
                  {configs.map((config, idx) => {
                    const configStatus = config.status || {};
                    const configDeployed = configStatus.deployed || 0;
                    const configReady = configStatus.missionReady || 0;

                    return (
                      <div
                        key={idx}
                        className="flex flex-col p-4 bg-darkest rounded-xl border border-gray-700/40 hover:border-lime-brand/40 transition-all hover:bg-lime-brand/5 group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-gray-100 font-semibold group-hover:text-lime-brand transition-colors">
                              {config.name}
                            </div>
                            <div className="text-gray-500 text-sm mt-1">
                              {config.count} {fleetSubTab === 'hangar' ? 'aircraft' : 'vessels'} configured
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {configDeployed > 0 && (
                              <span className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg">
                                <Rocket size={12} /> {configDeployed}
                              </span>
                            )}
                            {configReady > 0 && (
                              <span className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-green-500/10 text-green-400 rounded-lg">
                                <Check size={12} /> {configReady}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-auto">
                          <button
                            onClick={() => handleEditConfig(squadron, config)}
                            className="flex-1 py-2 px-3 bg-lime-brand text-black rounded-lg text-xs font-bold hover:bg-lime-brand/90 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Edit3 size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() => openSquadronManagement(squadron, idx)}
                            className="py-2 px-3 bg-gray-700/50 text-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-700 transition-colors"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No Configs Yet */}
            {configs.length === 0 && (
              <div className="px-8 pb-6 pt-2">
                <button
                  onClick={() => {
                    const vessel = vesselHullData.find(v => v.name === squadron.icon || v.icon === squadron.icon);
                    if (vessel) onSelectHull(vessel);
                  }}
                  className="w-full py-4 border border-dashed border-lime-brand/30 rounded-xl text-lime-brand/70 hover:border-lime-brand hover:text-lime-brand hover:bg-lime-brand/5 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Create First Configuration
                </button>
              </div>
            )}
          </div>
        );
      })()}

      {/* Floating Compare Button */}
      {comparisonSquadronIds.length >= 2 && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          <button
            onClick={clearComparison}
            className="bg-gray-800 text-gray-300 px-4 py-3 rounded-lg shadow-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <X size={18} />
            Clear ({comparisonSquadronIds.length})
          </button>
          <button
            onClick={() => setComparisonViewOpen(true)}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition-colors flex items-center gap-2 font-semibold"
          >
            <Scale size={18} />
            Compare Selected
          </button>
        </div>
      )}

      {/* Comparison View Modal */}
      <ComparisonView />
    </div>
  );
};

export default ShipyardView;
