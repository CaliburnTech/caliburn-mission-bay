import { useState, useMemo } from 'react';
import { Eye, ShoppingCart, ChevronDown, ChevronUp, Package, Layers, Ship, Check, X, AlertTriangle, Gauge, Zap, Scale } from 'lucide-react';
import { SecurityBadge, TRLBadge } from './shared';
import { vesselHullData } from '../data/vesselData';

const CapabilitiesView = ({
  individualCapabilities,
  engineeringStacks = [],
  getFilteredItems,
  searchTerm,
  selectedFilters,
  addToCart,
  outfitterCart,
  setSelectedCapabilityDetails,
  expandedStack,
  setExpandedStack
}) => {
  const [viewMode, setViewMode] = useState('items'); // 'items' or 'stacks'
  const [fitCheckVessel, setFitCheckVessel] = useState(null); // Selected vessel for "Will it fit?" mode
  const [selectedForFit, setSelectedForFit] = useState([]); // Capabilities selected for fit check

  // Get vessel SWaP capacity
  const vesselCapacity = useMemo(() => {
    if (!fitCheckVessel) return null;
    const vessel = vesselHullData.find(v => v.name === fitCheckVessel);
    if (!vessel?.capacity) return null;
    return {
      weight: vessel.capacity.totalWeight || 0,
      power: vessel.capacity.totalPower || 0,
      name: vessel.name,
      type: vessel.type,
      specs: vessel.specs
    };
  }, [fitCheckVessel]);

  // Calculate running totals for selected capabilities
  const fitTotals = useMemo(() => {
    const totals = { weight: 0, power: 0 };
    selectedForFit.forEach(capName => {
      const cap = individualCapabilities.find(c => c.name === capName);
      if (cap?.swap) {
        totals.weight += cap.swap.weight || 0;
        totals.power += cap.swap.power || 0;
      }
    });
    return totals;
  }, [selectedForFit, individualCapabilities]);

  // Toggle capability selection for fit check
  const toggleFitSelection = (capName) => {
    setSelectedForFit(prev =>
      prev.includes(capName)
        ? prev.filter(n => n !== capName)
        : [...prev, capName]
    );
  };

  // Check if a capability fits within remaining capacity
  const checkFit = (capability) => {
    if (!vesselCapacity || !capability.swap) return { fits: true, reason: null };
    const remainingWeight = vesselCapacity.weight - fitTotals.weight;
    const remainingPower = vesselCapacity.power - fitTotals.power;

    const capWeight = capability.swap.weight || 0;
    const capPower = capability.swap.power || 0;

    if (capWeight > remainingWeight && capPower > remainingPower) {
      return { fits: false, reason: 'Exceeds weight and power' };
    }
    if (capWeight > remainingWeight) {
      return { fits: false, reason: `Exceeds weight by ${(capWeight - remainingWeight).toFixed(1)}kg` };
    }
    if (capPower > remainingPower) {
      return { fits: false, reason: `Exceeds power by ${(capPower - remainingPower).toFixed(1)}kW` };
    }
    return { fits: true, reason: null };
  };

  const filteredCapabilities = getFilteredItems(individualCapabilities);
  const filteredStacks = getFilteredItems(engineeringStacks);

  return (
    <div>
      {/* View Mode Toggle */}
      <div className="toggle-group mb-4">
        <button
          onClick={() => setViewMode('items')}
          className={`toggle-btn ${viewMode === 'items' ? 'toggle-btn-active' : ''}`}
        >
          <Package size={16} />
          All Items
        </button>
      </div>

      {/* "Will it fit?" Mode */}
      <div className="bg-darker rounded-lg border border-border-subtle p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Ship size={18} className="text-lime-brand" />
          <span className="text-lime-brand font-semibold text-sm">WILL IT FIT?</span>
          <span className="text-gray-500 text-xs ml-2">Select a platform to check capability compatibility</span>
        </div>

        <div className="flex gap-3 items-start">
          {/* Vessel Selector */}
          <div className="flex-1">
            <select
              value={fitCheckVessel || ''}
              onChange={(e) => {
                setFitCheckVessel(e.target.value || null);
                setSelectedForFit([]);
              }}
              className="w-full bg-darkest border border-border-subtle rounded px-3 py-2 text-white text-sm"
            >
              <option value="">Select a platform...</option>
              <optgroup label="Small USV">
                {vesselHullData.filter(v => v.type?.includes('Small USV')).map(v => (
                  <option key={v.name} value={v.name}>{v.name}</option>
                ))}
              </optgroup>
              <optgroup label="Medium USV">
                {vesselHullData.filter(v => v.type?.includes('Medium USV')).map(v => (
                  <option key={v.name} value={v.name}>{v.name}</option>
                ))}
              </optgroup>
              <optgroup label="Large USV">
                {vesselHullData.filter(v => v.type?.includes('Large USV')).map(v => (
                  <option key={v.name} value={v.name}>{v.name}</option>
                ))}
              </optgroup>
              <optgroup label="UUV">
                {vesselHullData.filter(v => v.platformType === 'UUV').map(v => (
                  <option key={v.name} value={v.name}>{v.name}</option>
                ))}
              </optgroup>
              <optgroup label="UAV">
                {vesselHullData.filter(v => v.platformType === 'UAV').map(v => (
                  <option key={v.name} value={v.name}>{v.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Capacity Display */}
          {vesselCapacity && (
            <div className="flex gap-4 items-center">
              {/* Weight Progress */}
              <div className="flex flex-col items-center">
                <Scale size={14} className={fitTotals.weight > vesselCapacity.weight ? 'text-red-400' : 'text-cyan-400'} />
                <div className="text-[0.65rem] text-gray-400 mt-0.5">Weight</div>
                <div className={`text-sm font-bold ${fitTotals.weight > vesselCapacity.weight ? 'text-red-400' : 'text-white'}`}>
                  {fitTotals.weight.toFixed(0)}/{vesselCapacity.weight}kg
                </div>
                <div className="w-16 h-1.5 bg-gray-700 rounded-full mt-1 overflow-hidden">
                  <div
                    className={`h-full transition-all ${fitTotals.weight > vesselCapacity.weight ? 'bg-red-500' : 'bg-cyan-400'}`}
                    style={{ width: `${Math.min(100, (fitTotals.weight / vesselCapacity.weight) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Power Progress */}
              <div className="flex flex-col items-center">
                <Zap size={14} className={fitTotals.power > vesselCapacity.power ? 'text-red-400' : 'text-yellow-400'} />
                <div className="text-[0.65rem] text-gray-400 mt-0.5">Power</div>
                <div className={`text-sm font-bold ${fitTotals.power > vesselCapacity.power ? 'text-red-400' : 'text-white'}`}>
                  {fitTotals.power.toFixed(1)}/{vesselCapacity.power}kW
                </div>
                <div className="w-16 h-1.5 bg-gray-700 rounded-full mt-1 overflow-hidden">
                  <div
                    className={`h-full transition-all ${fitTotals.power > vesselCapacity.power ? 'bg-red-500' : 'bg-yellow-400'}`}
                    style={{ width: `${Math.min(100, (fitTotals.power / vesselCapacity.power) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Clear Selection */}
              {selectedForFit.length > 0 && (
                <button
                  onClick={() => setSelectedForFit([])}
                  className="text-gray-400 hover:text-white text-xs px-2 py-1 bg-gray-700/50 rounded"
                >
                  Clear ({selectedForFit.length})
                </button>
              )}
            </div>
          )}
        </div>

        {/* Vessel Specs Summary */}
        {vesselCapacity && vesselCapacity.specs && (
          <div className="flex gap-4 mt-3 pt-3 border-t border-gray-700/50">
            <div className="text-xs">
              <span className="text-gray-500">Type:</span>{' '}
              <span className="text-gray-300">{vesselCapacity.type}</span>
            </div>
            {vesselCapacity.specs.speed && (
              <div className="text-xs">
                <span className="text-gray-500">Speed:</span>{' '}
                <span className="text-gray-300">{vesselCapacity.specs.speed}kts</span>
              </div>
            )}
            {vesselCapacity.specs.range && (
              <div className="text-xs">
                <span className="text-gray-500">Range:</span>{' '}
                <span className="text-gray-300">{vesselCapacity.specs.range}nm</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Individual Capabilities View */}
      {viewMode === 'items' && (
        <>
          <div className="section-subtitle">
            {filteredCapabilities.length} of {individualCapabilities.length} individual capabilities
            {(searchTerm && searchTerm.length >= 2) || selectedFilters.length > 0 ? ' matching your filters' : ''}
          </div>
          <div className="card-grid">
            {filteredCapabilities.map((capability) => {
              // Vendor (DB) products have no icon component; fall back to Package.
              const IconComponent = capability.icon || Package;
              const isSelectedForFit = selectedForFit.includes(capability.name);
              const fitStatus = fitCheckVessel ? checkFit(capability) : null;
              const hasSWaP = capability.swap && (capability.swap.weight > 0 || capability.swap.power > 0);

              return (
                <div
                  key={capability.name}
                  className={`card card-interactive relative ${
                    fitCheckVessel && isSelectedForFit ? 'ring-2 ring-lime-brand' : ''
                  } ${fitCheckVessel && !fitStatus?.fits ? 'opacity-60' : ''}`}
                  onClick={fitCheckVessel && hasSWaP ? () => toggleFitSelection(capability.name) : undefined}
                  style={fitCheckVessel && hasSWaP ? { cursor: 'pointer' } : {}}
                >
                  {/* Fit Check Selection Indicator */}
                  {fitCheckVessel && hasSWaP && (
                    <div
                      className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center ${
                        isSelectedForFit ? 'bg-lime-brand' : 'bg-gray-700 border border-gray-600'
                      }`}
                    >
                      {isSelectedForFit && <Check size={12} className="text-black" />}
                    </div>
                  )}

                  {/* Fit Status Badge */}
                  {fitCheckVessel && fitStatus && (
                    <div
                      className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[0.6rem] font-semibold flex items-center gap-1 ${
                        fitStatus.fits
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {fitStatus.fits ? (
                        <>
                          <Check size={10} />
                          FITS
                        </>
                      ) : (
                        <>
                          <X size={10} />
                          {fitStatus.reason}
                        </>
                      )}
                    </div>
                  )}

                  <div className="flex items-start gap-md mb-md">
                    <div className="p-3 bg-lime-brand/10 rounded-lg flex-shrink-0">
                      <IconComponent size={24} className="text-primary-brand" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-white font-bold mb-sm text-lg ${fitCheckVessel ? 'mt-4' : ''}`}>
                        {capability.name}
                      </h3>
                      <div className="flex gap-sm mb-sm flex-wrap items-center">
                        <div className="badge-category">
                          {capability.category}
                        </div>

                        {capability.securityLevel && capability.securityLevel.length > 0 && (
                          <div className="flex gap-xs items-center">
                            {capability.securityLevel.includes('NSA-Approved Crypto') && <SecurityBadge type="NSA-Approved Crypto" />}
                            {capability.securityLevel.includes('Zero Trust Architecture') && <SecurityBadge type="Zero Trust Architecture" />}
                            {capability.securityLevel.includes('DDIL Capable') && <SecurityBadge type="DDIL Capable" />}
                            {(capability.securityLevel.includes('End-to-End Encrypted') || capability.securityLevel.includes('Mesh Network')) && <SecurityBadge type="End-to-End Encrypted" />}
                          </div>
                        )}

                        <TRLBadge trl={capability.trl} />
                      </div>
                      <p className="text-secondary text-sm mb-md">
                        {capability.provider}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed mb-lg">
                    {capability.description}
                  </p>

                  {capability.specs && (
                    <div className="mb-lg">
                      <h4 className="text-primary-brand font-bold mb-sm text-base">
                        Specifications
                      </h4>
                      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-sm">
                        {Object.entries(capability.specs).map(([key, value]) => (
                          <div key={key} className="card-inner">
                            <div className="text-muted text-xs mb-xs">
                              {key.charAt(0).toUpperCase() + key.slice(1)}
                            </div>
                            <div className="text-white text-sm font-medium">
                              {value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-sm items-stretch">
                    <button
                      onClick={() => setSelectedCapabilityDetails(capability)}
                      className="btn-secondary flex-1"
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Saved Stacks View */}
      {viewMode === 'stacks' && (
        <>
          <div className="section-subtitle">
            {filteredStacks.length} of {engineeringStacks.length} saved capability packages
            {(searchTerm && searchTerm.length >= 2) || selectedFilters.length > 0 ? ' matching your filters' : ''}
          </div>

          {filteredStacks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-8 bg-darker rounded-xl border border-gray-700/50">
              <Layers size={48} className="text-gray-600 mb-4" />
              <h3 className="text-gray-300 text-lg font-semibold mb-2">No Saved Stacks</h3>
              <p className="text-gray-500 text-sm text-center max-w-md mb-4">
                Stacks are pre-configured capability bundles. Create them by saving a configuration from the Fleet tab, or they can be auto-generated from mission templates.
              </p>
              <button
                onClick={() => setViewMode('items')}
                className="text-lime-brand hover:underline text-sm"
              >
                Browse individual capabilities instead
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-lg">
              {filteredStacks.map((stack) => {
                const IconComponent = stack.icon;
                const isExpanded = expandedStack === stack.name;
                const isInCart = outfitterCart.some(item => item.name === stack.name);

                return (
                  <div
                    key={stack.name}
                    className="card-accent relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-md">
                      <div className="flex items-center gap-md">
                        <div className="bg-lime-brand/20 p-3 rounded-lg">
                          <IconComponent size={32} />
                        </div>
                        <div>
                          <h3 className="section-title mb-sm">
                            {stack.name}
                          </h3>
                          <p className="text-secondary text-sm">{stack.provider}</p>
                        </div>
                      </div>
                      <TRLBadge trl={stack.trl} />
                    </div>

                    <p className="text-gray-200 mb-md leading-relaxed">
                      {stack.description}
                    </p>

                    <div className="flex gap-lg items-start flex-wrap mb-md">
                      <div className="flex-1">
                        {/* Components List */}
                        {stack.components && (
                          <div className="mb-md">
                            <div className="text-primary-brand text-sm font-semibold mb-sm">
                              Components:
                            </div>
                            <ul className="list-none p-0 m-0">
                              {stack.components.map((component, compIdx) => (
                                <li key={compIdx} className="text-gray-300 text-sm mb-1">
                                  <span className="text-primary-brand mr-2">•</span>
                                  {component}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Mission Tags */}
                        {stack.missionTags && (
                          <div className="flex gap-sm flex-wrap">
                            {stack.missionTags.map(tag => (
                              <span
                                key={tag}
                                className="bg-blue-500/80 text-white px-3 py-1 rounded text-xs font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-sm">
                        <button
                          onClick={() => setExpandedStack(isExpanded ? null : stack.name)}
                          className="btn-secondary flex items-center gap-sm"
                        >
                          {isExpanded ? 'Hide Details' : 'View Details'}
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <button
                          onClick={() => addToCart({ ...stack, type: 'stack' })}
                          disabled={isInCart}
                          className={`btn-primary ${
                            isInCart
                              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                              : ''
                          }`}
                        >
                          <ShoppingCart size={16} />
                          {isInCart ? 'Added' : 'Add All'}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && stack.specs && (
                      <div className="border-t border-gray-700/50 pt-md mt-md">
                        <h4 className="text-primary-brand font-bold mb-sm">
                          Stack Specifications
                        </h4>
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-sm">
                          {Object.entries(stack.specs).map(([key, value]) => (
                            <div key={key} className="card-inner">
                              <div className="text-muted text-xs mb-xs">
                                {key.charAt(0).toUpperCase() + key.slice(1)}
                              </div>
                              <div className="text-white text-sm font-medium">
                                {typeof value === 'object' ? JSON.stringify(value) : value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CapabilitiesView;
