import React, { useState } from 'react';
import { Ship, Settings, Rocket, MapPin, Clock, Users, ChevronRight, GitBranch, Unlink, Scale } from 'lucide-react';
import useSquadronStore from '../store/squadronStore';
import useNavigationStore from '../store/navigationStore';
import useOutfitterStore from '../store/outfitterStore';
import { VariationBadge, CreateVariationModal, SpinOutConfirmModal } from './variations';

const SquadronManagementModal = () => {
  const {
    selectedSquadronForManagement,
    swarmSquadrons,
    squadronUnitConfigurations,
    closeSquadronManagement,
    getResolvedSquadron,
    openSquadronManagement,
    addToComparison,
    comparisonSquadronIds,
    setComparisonViewOpen
  } = useSquadronStore();

  const { setSelectedView } = useNavigationStore();
  const { setSelectedHull } = useOutfitterStore();

  const [showCreateVariation, setShowCreateVariation] = useState(false);
  const [showSpinOutConfirm, setShowSpinOutConfirm] = useState(false);

  if (selectedSquadronForManagement === null) return null;

  // Use resolved squadron (handles inheritance for variations)
  const squadron = getResolvedSquadron(selectedSquadronForManagement.id) || selectedSquadronForManagement;
  // Look up unit configs by squadron ID
  const unitConfigs = squadronUnitConfigurations[squadron.id];

  const isInComparison = comparisonSquadronIds.includes(squadron.id);

  // Get the hull type for this squadron (for configure action)
  const squadronHull = {
    name: squadron?.type || "USV",
    type: squadron?.type,
    icon: squadron?.type?.includes('USV') ? 'USV' : squadron?.type?.includes('UAV') ? 'UAV' : 'USV'
  };

  const handleConfigure = () => {
    closeSquadronManagement();
    setSelectedHull(squadronHull);
    setSelectedView('outfitter');
  };

  const handleDeployMission = () => {
    closeSquadronManagement();
    setSelectedView('squadron'); // Mission Planner
  };

  const navigateToCapability = () => {
    closeSquadronManagement();
    setSelectedView('capabilities');
  };

  const handleCreateVariationClose = () => {
    setShowCreateVariation(false);
    // If a new variation was created, could optionally open it
  };

  const handleSpinOutClose = () => {
    setShowSpinOutConfirm(false);
    // Modal stays open showing updated (now independent) squadron
  };

  const handleNavigateToParent = (parentId) => {
    const parent = swarmSquadrons.find(s => s.id === parentId);
    if (parent) {
      const parentIndex = swarmSquadrons.findIndex(s => s.id === parentId);
      openSquadronManagement(parent, parentIndex);
    }
  };

  const handleAddToComparison = () => {
    addToComparison(squadron.id);
    if (comparisonSquadronIds.length >= 1) {
      // If we now have 2+, open comparison view
      setComparisonViewOpen(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[1000] flex items-center justify-center p-8">
      <div className="bg-darkest border-2 border-lime-brand/30 rounded-2xl w-[95%] max-w-[900px] max-h-[90%] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-600/30">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-lime-brand/20 flex items-center justify-center">
                <Ship className="text-lime-brand" size={28} />
              </div>
              <div>
                <h2 className="text-lime-brand text-2xl font-bold mb-1">
                  {squadron?.name}
                </h2>
                <div className="flex items-center gap-3">
                  <p className="text-gray-400 text-sm">
                    {squadron?.totalUnits} total units • {squadron?.type}
                  </p>
                  {squadron?.isVariation && (
                    <VariationBadge
                      parentName={squadron.parentName}
                      parentId={squadron.parentId}
                      onNavigateToParent={handleNavigateToParent}
                      size="small"
                    />
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={closeSquadronManagement}
              className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <MapPin size={14} />
              <span>{squadron?.location || 'Pacific Fleet'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Clock size={14} />
              <span>{squadron?.readyTime || '2 hours'}</span>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <Users size={14} />
              <span>{squadron?.operationalStatus || 'MISSION READY'}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Configuration Packages */}
          <div className="mb-8">
            <h3 className="text-gray-300 font-semibold mb-4 text-sm uppercase tracking-wide">
              Unit Configurations
            </h3>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
              {unitConfigs?.outfits.map((outfit) => (
                <div key={outfit.name} className="bg-darker border border-gray-700/50 rounded-lg p-4 hover:border-lime-brand/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white font-semibold text-sm">
                      {outfit.name}
                    </h4>
                    <span className="text-lime-brand text-xs font-bold bg-lime-brand/20 px-2 py-0.5 rounded">
                      {outfit.count} units
                    </span>
                  </div>

                  <div className="text-[0.7rem] text-gray-500 uppercase mb-2">
                    Capabilities:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {outfit.capabilities.map((capability, capIdx) => (
                      <span
                        key={capability}
                        onClick={() => navigateToCapability(capability)}
                        className="text-blue-400 text-xs cursor-pointer hover:text-blue-300 underline"
                      >
                        {capability}{capIdx < outfit.capabilities.length - 1 ? ',' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Squadron Summary Stats */}
          <div className="bg-darker rounded-lg p-4 border border-gray-700/50 mb-6">
            <h3 className="text-gray-300 font-semibold mb-3 text-sm uppercase tracking-wide">
              Squadron Summary
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-lime-brand">{squadron?.totalUnits || 0}</div>
                <div className="text-xs text-gray-500 uppercase">Total Units</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400">{unitConfigs?.outfits?.length || 0}</div>
                <div className="text-xs text-gray-500 uppercase">Configurations</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400">
                  {unitConfigs?.outfits?.reduce((acc, o) => acc + (o.capabilities?.length || 0), 0) || 0}
                </div>
                <div className="text-xs text-gray-500 uppercase">Capabilities</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-6 border-t border-gray-600/30 bg-darker/50">
          {/* Secondary Actions */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setShowCreateVariation(true)}
              className="flex items-center gap-2 px-4 py-2 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/10 transition-colors text-sm font-medium"
            >
              <GitBranch size={16} />
              Create Variation
            </button>
            {squadron?.isVariation && (
              <button
                onClick={() => setShowSpinOutConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 text-orange-400 border border-orange-500/30 rounded-lg hover:bg-orange-500/10 transition-colors text-sm font-medium"
              >
                <Unlink size={16} />
                Spin Out
              </button>
            )}
            <button
              onClick={handleAddToComparison}
              disabled={isInComparison}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                isInComparison
                  ? 'text-gray-500 border-gray-700 cursor-not-allowed'
                  : 'text-blue-400 border-blue-500/30 hover:bg-blue-500/10'
              }`}
            >
              <Scale size={16} />
              {isInComparison ? 'In Comparison' : 'Compare'}
            </button>
          </div>

          {/* Primary Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleConfigure}
              className="flex-1 bg-transparent border-2 border-lime-brand text-lime-brand py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-lime-brand/10 transition-colors"
            >
              <Settings size={18} />
              Configure Units
              <ChevronRight size={16} className="ml-auto" />
            </button>
            <button
              onClick={handleDeployMission}
              className="flex-1 bg-lime-brand text-black py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-lime-brand/90 transition-colors"
            >
              <Rocket size={18} />
              Deploy to Mission
              <ChevronRight size={16} className="ml-auto" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateVariationModal
        isOpen={showCreateVariation}
        onClose={handleCreateVariationClose}
        parentSquadron={squadron}
      />
      <SpinOutConfirmModal
        isOpen={showSpinOutConfirm}
        onClose={handleSpinOutClose}
        squadron={squadron}
      />
    </div>
  );
};

export default SquadronManagementModal;
