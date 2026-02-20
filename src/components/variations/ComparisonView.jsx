import React, { useMemo } from 'react';
import { X, Ship, Zap, Shield, Check, AlertTriangle, Target, Radio, Eye, Radar, Anchor, Scale } from 'lucide-react';
import useSquadronStore from '../../store/squadronStore';
import VariationBadge from './VariationBadge';
import { vesselHullData } from '../../data/vesselData';

/**
 * Side-by-side comparison view for up to 4 squadrons
 */
const ComparisonView = () => {
  const {
    isComparisonViewOpen,
    setComparisonViewOpen,
    comparisonSquadronIds,
    getComparisonData,
    removeFromComparison,
    clearComparison,
    squadronUnitConfigurations
  } = useSquadronStore();

  // Get squadrons data - call before useMemo to avoid conditional hook calls
  const squadrons = isComparisonViewOpen && comparisonSquadronIds.length >= 2
    ? getComparisonData()
    : [];

  // Get capabilities from unit configs
  const getSquadronCapabilities = (squadronId) => {
    const config = squadronUnitConfigurations[squadronId];
    if (!config?.outfits) return [];
    const allCaps = config.outfits.flatMap(o => o.capabilities || []);
    return [...new Set(allCaps)]; // Unique capabilities
  };

  // Get all unique capabilities across all compared squadrons
  const allCapabilities = useMemo(() => {
    if (squadrons.length === 0) return [];
    return [...new Set(
      squadrons.flatMap(s => getSquadronCapabilities(s.id))
    )].sort();
  }, [squadrons, squadronUnitConfigurations]);

  // Analyze capability compatibility
  const capabilityAnalysis = useMemo(() => {
    if (squadrons.length === 0 || allCapabilities.length === 0) {
      return { shared: [], unique: {} };
    }

    const shared = []; // Capabilities all squadrons have
    const unique = {}; // Capabilities unique to specific squadrons

    allCapabilities.forEach(cap => {
      const squadronsWithCap = squadrons.filter(s =>
        getSquadronCapabilities(s.id).includes(cap)
      );

      if (squadronsWithCap.length === squadrons.length) {
        shared.push(cap);
      } else {
        squadronsWithCap.forEach(s => {
          if (!unique[s.id]) unique[s.id] = [];
          unique[s.id].push(cap);
        });
      }
    });

    return { shared, unique };
  }, [squadrons, allCapabilities]);

  // Early return AFTER all hooks
  if (!isComparisonViewOpen || comparisonSquadronIds.length < 2) return null;

  // Define comparison properties
  const comparisonFields = [
    { key: 'type', label: 'Type', icon: Ship },
    { key: 'totalUnits', label: 'Total Units', icon: Zap, format: (v) => v?.toLocaleString() },
    { key: 'description', label: 'Description', isLong: true },
  ];

  // Status fields to compare
  const statusFields = ['missionReady', 'deployed', 'charging', 'maintenance', 'inRefit', 'atSea'];

  // Get vessel specs for SWaP comparison
  const getVesselSpecs = (squadron) => {
    const vessel = vesselHullData.find(v => v.icon === squadron.icon || v.name === squadron.icon);
    return vessel?.specs || null;
  };

  // Categorize capability for icon
  const getCapabilityIcon = (cap) => {
    const capLower = (cap || '').toLowerCase();
    if (capLower.includes('sensor') || capLower.includes('camera') || capLower.includes('eo/ir')) {
      return <Eye size={12} className="text-cyan-400" />;
    }
    if (capLower.includes('radar') || capLower.includes('sonar')) {
      return <Radar size={12} className="text-blue-400" />;
    }
    if (capLower.includes('weapon') || capLower.includes('missile') || capLower.includes('torpedo')) {
      return <Target size={12} className="text-red-400" />;
    }
    if (capLower.includes('comm') || capLower.includes('satcom') || capLower.includes('link')) {
      return <Radio size={12} className="text-green-400" />;
    }
    if (capLower.includes('esm') || capLower.includes('ew') || capLower.includes('electronic')) {
      return <Shield size={12} className="text-purple-400" />;
    }
    return <Anchor size={12} className="text-gray-400" />;
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[1000] flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700 bg-darkest">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-white text-xl font-bold">Squadron Comparison</h2>
            <span className="text-gray-400 text-sm">
              {squadrons.length} squadrons selected
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={clearComparison}
              className="text-gray-400 hover:text-white text-sm"
            >
              Clear All
            </button>
            <button
              onClick={() => setComparisonViewOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Squadron Headers */}
          <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `200px repeat(${squadrons.length}, 1fr)` }}>
            <div /> {/* Empty corner cell */}
            {squadrons.map((squadron) => (
              <div key={squadron.id} className="bg-darker rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Ship size={18} className="text-lime-brand" />
                    <h3 className="text-white font-bold truncate">{squadron.name}</h3>
                  </div>
                  <button
                    onClick={() => removeFromComparison(squadron.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                {squadron.isVariation && (
                  <VariationBadge
                    parentName={squadron.parentName}
                    parentId={squadron.parentId}
                    size="small"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Basic Properties */}
          <div className="bg-darker rounded-lg border border-gray-700 overflow-hidden mb-6">
            <div className="p-3 border-b border-gray-700 bg-gray-800/50">
              <h4 className="text-gray-300 font-semibold text-sm uppercase tracking-wide">Basic Properties</h4>
            </div>
            {comparisonFields.map((field) => (
              <div
                key={field.key}
                className="grid gap-4 border-b border-gray-700/50 last:border-0"
                style={{ gridTemplateColumns: `200px repeat(${squadrons.length}, 1fr)` }}
              >
                <div className="p-3 bg-gray-800/30 flex items-center gap-2 text-gray-400 text-sm font-medium">
                  {field.icon && <field.icon size={14} />}
                  {field.label}
                </div>
                {squadrons.map((squadron) => {
                  const value = squadron[field.key];
                  const displayValue = field.format ? field.format(value) : value;
                  return (
                    <div
                      key={squadron.id}
                      className={`p-3 text-white ${field.isLong ? 'text-sm' : ''}`}
                    >
                      {displayValue || '-'}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Status Breakdown */}
          <div className="bg-darker rounded-lg border border-gray-700 overflow-hidden mb-6">
            <div className="p-3 border-b border-gray-700 bg-gray-800/50">
              <h4 className="text-gray-300 font-semibold text-sm uppercase tracking-wide">Status Breakdown</h4>
            </div>
            {statusFields.map((field) => {
              // Only show fields that at least one squadron has
              const hasField = squadrons.some(s => s.status?.[field] !== undefined);
              if (!hasField) return null;

              return (
                <div
                  key={field}
                  className="grid gap-4 border-b border-gray-700/50 last:border-0"
                  style={{ gridTemplateColumns: `200px repeat(${squadrons.length}, 1fr)` }}
                >
                  <div className="p-3 bg-gray-800/30 text-gray-400 text-sm font-medium capitalize">
                    {field.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  {squadrons.map((squadron) => {
                    const value = squadron.status?.[field];
                    const total = squadron.totalUnits || 1;
                    const percentage = value ? Math.round((value / total) * 100) : 0;
                    return (
                      <div key={squadron.id} className="p-3 flex items-center gap-2">
                        <span className="text-white">{value?.toLocaleString() || '-'}</span>
                        {value !== undefined && (
                          <span className="text-gray-500 text-xs">({percentage}%)</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Vessel Specs Comparison */}
          <div className="bg-darker rounded-lg border border-gray-700 overflow-hidden mb-6">
            <div className="p-3 border-b border-gray-700 bg-gray-800/50">
              <div className="flex items-center gap-2">
                <Scale size={14} className="text-lime-brand" />
                <h4 className="text-gray-300 font-semibold text-sm uppercase tracking-wide">Platform Specifications</h4>
              </div>
            </div>
            {['speed', 'range', 'rcs'].map((spec) => (
              <div
                key={spec}
                className="grid gap-4 border-b border-gray-700/50 last:border-0"
                style={{ gridTemplateColumns: `200px repeat(${squadrons.length}, 1fr)` }}
              >
                <div className="p-3 bg-gray-800/30 text-gray-400 text-sm font-medium capitalize">
                  {spec === 'rcs' ? 'Radar Cross Section' : spec}
                </div>
                {squadrons.map((squadron) => {
                  const specs = getVesselSpecs(squadron);
                  const value = specs?.[spec];
                  const unit = spec === 'speed' ? 'kts' : spec === 'range' ? 'nm' : 'm²';
                  return (
                    <div key={squadron.id} className="p-3 text-white">
                      {value !== undefined ? `${value} ${unit}` : '-'}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Capability Compatibility Overview */}
          {allCapabilities.length > 0 && (
            <div className="bg-darker rounded-lg border border-lime-brand/30 overflow-hidden mb-6">
              <div className="p-4 border-b border-gray-700 bg-lime-brand/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-lime-brand" />
                    <h4 className="text-lime-brand font-semibold text-sm uppercase tracking-wide">
                      Capability Compatibility Analysis
                    </h4>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Check size={12} className="text-green-400" />
                      <span className="text-green-400">{capabilityAnalysis.shared.length} shared</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertTriangle size={12} className="text-yellow-400" />
                      <span className="text-yellow-400">{allCapabilities.length - capabilityAnalysis.shared.length} unique</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shared Capabilities */}
              {capabilityAnalysis.shared.length > 0 && (
                <div className="p-4 border-b border-gray-700/50">
                  <div className="text-green-400 text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Check size={12} />
                    Shared by All ({capabilityAnalysis.shared.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {capabilityAnalysis.shared.map(cap => (
                      <div
                        key={cap}
                        className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/30 rounded text-xs text-green-300"
                      >
                        {getCapabilityIcon(cap)}
                        {cap}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unique Capabilities per Squadron */}
              {Object.keys(capabilityAnalysis.unique).length > 0 && (
                <div className="p-4">
                  <div className="text-yellow-400 text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    Unique Capabilities
                  </div>
                  <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${squadrons.length}, 1fr)` }}>
                    {squadrons.map(squadron => {
                      const uniqueCaps = capabilityAnalysis.unique[squadron.id] || [];
                      if (uniqueCaps.length === 0) return (
                        <div key={squadron.id} className="text-gray-500 text-xs italic">
                          No unique capabilities
                        </div>
                      );
                      return (
                        <div key={squadron.id} className="space-y-1.5">
                          <div className="text-gray-400 text-[0.65rem] font-semibold truncate">
                            {squadron.name}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {uniqueCaps.map(cap => (
                              <div
                                key={cap}
                                className="flex items-center gap-1 px-1.5 py-0.5 bg-yellow-500/10 border border-yellow-500/30 rounded text-[0.65rem] text-yellow-300"
                              >
                                {getCapabilityIcon(cap)}
                                {cap.length > 20 ? cap.substring(0, 20) + '...' : cap}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full Capabilities Matrix */}
          {allCapabilities.length > 0 && (
            <div className="bg-darker rounded-lg border border-gray-700 overflow-hidden">
              <div className="p-3 border-b border-gray-700 bg-gray-800/50">
                <h4 className="text-gray-300 font-semibold text-sm uppercase tracking-wide">
                  Full Capability Matrix ({allCapabilities.length})
                </h4>
              </div>
              {allCapabilities.map((capability) => {
                const isShared = capabilityAnalysis.shared.includes(capability);
                return (
                  <div
                    key={capability}
                    className={`grid gap-4 border-b border-gray-700/50 last:border-0 ${isShared ? 'bg-green-500/5' : ''}`}
                    style={{ gridTemplateColumns: `200px repeat(${squadrons.length}, 1fr)` }}
                  >
                    <div className="p-3 bg-gray-800/30 text-gray-400 text-sm font-medium truncate flex items-center gap-2" title={capability}>
                      {getCapabilityIcon(capability)}
                      <span className="truncate">{capability}</span>
                    </div>
                    {squadrons.map((squadron) => {
                      const hasCap = getSquadronCapabilities(squadron.id).includes(capability);
                      return (
                        <div key={squadron.id} className="p-3">
                          {hasCap ? (
                            <span className="inline-flex items-center gap-1 text-lime-brand text-sm">
                              <Check size={14} />
                              Yes
                            </span>
                          ) : (
                            <span className="text-gray-600 text-sm">-</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;
