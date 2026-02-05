import React, { useState } from 'react';
import { Ship, ChevronDown, ChevronUp, Settings, Scale, X, Plus, Rocket, Check, Wrench, Battery, Package, ChevronRight } from 'lucide-react';
import { vesselHullComponents, vesselHullData } from '../data/vesselData';
import { squadronUnitConfigurations, activeDeployments } from '../data/fleetData';
import useSquadronStore from '../store/squadronStore';
import { VariationBadge, ComparisonView } from './variations';

const ShipyardView = ({
  openSquadronManagement,
  onSelectHull,
  showSquadrons,
  setShowSquadrons
}) => {
  const [showHullPicker, setShowHullPicker] = useState(false);
  const [selectedSquadronId, setSelectedSquadronId] = useState(null);

  // Use dynamic squadron data from store
  const {
    swarmSquadrons,
    getResolvedSquadron,
    comparisonSquadronIds,
    addToComparison,
    removeFromComparison,
    clearComparison,
    setComparisonViewOpen
  } = useSquadronStore();

  // Auto-select first squadron if none selected
  React.useEffect(() => {
    if (!selectedSquadronId && swarmSquadrons.length > 0) {
      setSelectedSquadronId(swarmSquadrons[0].id);
    }
  }, [selectedSquadronId, swarmSquadrons]);

  // Get loadout configs for a squadron
  const getSquadronConfigs = (squadronId) => {
    return squadronUnitConfigurations[squadronId]?.outfits || [];
  };

  // Get active deployments for a squadron
  const getSquadronDeployments = (squadronId) => {
    return activeDeployments.filter(d => d.squadronId === squadronId);
  };

  // Get the selected squadron data
  const selectedSquadron = selectedSquadronId
    ? getResolvedSquadron(selectedSquadronId) || swarmSquadrons.find(s => s.id === selectedSquadronId)
    : null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lime-brand font-bold text-3xl mb-1 tracking-tight">
            FLEET INVENTORY
          </h2>
          <p className="text-gray-400">
            {swarmSquadrons.length} squadrons • {swarmSquadrons.reduce((sum, s) => sum + (s.totalUnits || 0), 0).toLocaleString()} autonomous vessels
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
              {vesselHullData.map((vessel) => {
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
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
          {swarmSquadrons.map((rawSquadron) => {
            const squadron = getResolvedSquadron(rawSquadron.id) || rawSquadron;
            const HullComponent = vesselHullComponents[squadron.icon];
            const isSelected = selectedSquadronId === squadron.id;
            const isInComparison = comparisonSquadronIds.includes(squadron.id);
            const totalUnits = squadron.totalUnits || 0;
            const deployments = getSquadronDeployments(squadron.id);
            const deployedCount = deployments.reduce((sum, d) => sum + d.vesselCount, 0);

            return (
              <button
                key={squadron.id}
                onClick={() => setSelectedSquadronId(squadron.id)}
                className={`relative p-3 rounded-xl border-2 transition-all h-[160px] flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-lime-brand/10 border-lime-brand shadow-[0_0_20px_rgba(203,253,0,0.15)]'
                    : isInComparison
                    ? 'bg-blue-500/10 border-blue-500/50 hover:border-blue-400'
                    : 'bg-darker border-gray-700/50 hover:border-gray-600 hover:bg-darker/80'
                }`}
              >
                {/* Hull Thumbnail */}
                <div className="relative mb-2 h-[70px] flex items-center justify-center">
                  {HullComponent ? (
                    <HullComponent size={65} />
                  ) : (
                    <Ship size={50} className="text-gray-600" />
                  )}
                  {/* Deployed indicator */}
                  {deployedCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Rocket size={10} className="text-white" />
                    </div>
                  )}
                </div>
                {/* Squadron Name */}
                <div className={`text-xs font-semibold text-center truncate w-full px-1 ${
                  isSelected ? 'text-lime-brand' : 'text-gray-300'
                }`}>
                  {squadron.name.length > 20
                    ? squadron.name.split(' ').slice(0, 2).join(' ')
                    : squadron.name}
                </div>
                {/* Vessel Count */}
                <div className="text-gray-500 text-[0.7rem] text-center mt-1">
                  {totalUnits} vessels
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
              </button>
            );
          })}
        </div>
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
                      {deployments.reduce((sum, d) => sum + d.vesselCount, 0)} vessels on mission
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
                        onClick={() => openSquadronManagement(squadron, idx)}
                        className="flex items-center justify-between p-4 bg-darkest rounded-xl border border-gray-700/40 hover:border-lime-brand/40 cursor-pointer transition-all hover:bg-lime-brand/5 group"
                      >
                        <div>
                          <div className="text-gray-100 font-semibold group-hover:text-lime-brand transition-colors">
                            {config.name}
                          </div>
                          <div className="text-gray-500 text-sm mt-1">
                            {config.count} vessels configured
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
