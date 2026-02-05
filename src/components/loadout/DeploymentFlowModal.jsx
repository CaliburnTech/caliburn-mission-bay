import React, { useState, useMemo } from 'react';
import {
  X, Ship, Rocket, ChevronRight, Plus, Check, AlertCircle,
  Anchor, Target, Shield, Radio, Navigation, Cpu, Zap,
  Battery, Wrench, Clock, MapPin
} from 'lucide-react';
import { swarmSquadrons, squadronUnitConfigurations, activeDeployments, getDeploymentsByMission, getDeploymentsByHull } from '../../data/fleetData';
import useMissionStore from '../../store/missionStore';
import { missionFlowTemplates } from '../../data/marketplaceData';

// Mission type icons mapping
const MISSION_ICONS = {
  SEA_DENIAL: Target,
  RECONNAISSANCE: Radio,
  ESCORT: Shield,
  CONTESTED_LOGISTICS: Ship,
  REFLEX_SWARM_ATTACK: Zap,
  ROBOT_DEFENSE_OODA: Cpu
};

// Status colors
const STATUS_COLORS = {
  missionReady: '#22c55e',
  deployed: '#3b82f6',
  charging: '#f59e0b',
  maintenance: '#ef4444',
  inRefit: '#8b5cf6',
  atSea: '#06b6d4'
};

// Vessel Inventory Panel Component
const VesselInventoryPanel = ({ hullName, loadout, onSavePackage }) => {
  // Find squadrons matching this hull type
  const matchingSquadrons = useMemo(() => {
    return swarmSquadrons.filter(s => s.icon === hullName);
  }, [hullName]);

  // Calculate totals across all matching squadrons
  const totals = useMemo(() => {
    return matchingSquadrons.reduce((acc, sqdn) => {
      acc.total += sqdn.totalUnits || 0;
      Object.entries(sqdn.status || {}).forEach(([key, val]) => {
        acc[key] = (acc[key] || 0) + val;
      });
      return acc;
    }, { total: 0 });
  }, [matchingSquadrons]);

  // Get loadout packages for first matching squadron
  const existingPackages = useMemo(() => {
    if (matchingSquadrons.length === 0) return [];
    const config = squadronUnitConfigurations[matchingSquadrons[0].id];
    return config?.outfits || [];
  }, [matchingSquadrons]);

  const readyCount = totals.missionReady || 0;
  const readyPercent = totals.total > 0 ? (readyCount / totals.total) * 100 : 0;

  if (matchingSquadrons.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <Ship size={40} className="text-gray-600 mb-3" />
        <p className="text-gray-400 text-sm">No {hullName} vessels in fleet</p>
        <p className="text-gray-500 text-xs mt-1">Add vessels via Squadron Management</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-gray-400 text-xs font-semibold mb-3 uppercase tracking-wider">
        Vessel Inventory
      </h3>

      {/* Hull Summary */}
      <div className="bg-darkest rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-100 font-semibold">{hullName}</span>
          <span className="text-gray-400 text-sm">{totals.total} total</span>
        </div>

        {/* Progress Bar */}
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${readyPercent}%`,
              backgroundColor: STATUS_COLORS.missionReady,
              boxShadow: `0 0 8px ${STATUS_COLORS.missionReady}40`
            }}
          />
        </div>

        <div className="text-xs text-gray-400">
          <span className="text-green-400 font-semibold">{readyCount}</span> mission ready
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-darkest rounded-lg p-3 mb-3">
        <h4 className="text-gray-500 text-[0.65rem] font-semibold mb-2 uppercase">Status Breakdown</h4>
        <div className="space-y-1.5">
          {totals.missionReady > 0 && (
            <StatusRow icon={Check} label="Mission Ready" count={totals.missionReady} color={STATUS_COLORS.missionReady} />
          )}
          {totals.deployed > 0 && (
            <StatusRow icon={Rocket} label="Deployed" count={totals.deployed} color={STATUS_COLORS.deployed} />
          )}
          {totals.charging > 0 && (
            <StatusRow icon={Battery} label="Charging" count={totals.charging} color={STATUS_COLORS.charging} />
          )}
          {totals.maintenance > 0 && (
            <StatusRow icon={Wrench} label="Maintenance" count={totals.maintenance} color={STATUS_COLORS.maintenance} />
          )}
          {totals.inRefit > 0 && (
            <StatusRow icon={Wrench} label="In Refit" count={totals.inRefit} color={STATUS_COLORS.inRefit} />
          )}
          {totals.atSea > 0 && (
            <StatusRow icon={Anchor} label="At Sea" count={totals.atSea} color={STATUS_COLORS.atSea} />
          )}
        </div>
      </div>

      {/* Active Deployments for this hull type */}
      <div className="flex-1 overflow-y-auto">
        <h4 className="text-gray-500 text-[0.65rem] font-semibold mb-2 uppercase">Active Deployments</h4>
        {(() => {
          const hullDeployments = getDeploymentsByHull(hullName);
          if (hullDeployments.length === 0) {
            return (
              <div className="text-gray-500 text-xs text-center py-3 italic">
                No active deployments
              </div>
            );
          }
          return (
            <div className="space-y-2">
              {hullDeployments.map((dep) => (
                <div key={dep.id} className="bg-darkest rounded-lg p-2.5 border border-gray-700/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-200 text-xs font-semibold">{dep.loadoutName}</span>
                    <span className={`text-[0.6rem] font-semibold px-1.5 py-0.5 rounded ${
                      dep.status === 'active' ? 'bg-green-400/20 text-green-400' : 'bg-yellow-400/20 text-yellow-400'
                    }`}>
                      {dep.vesselCount} {dep.status === 'active' ? 'ACTIVE' : 'STAGING'}
                    </span>
                  </div>
                  <div className="text-gray-500 text-[0.6rem] mb-1.5">
                    → {dep.missionName}
                  </div>
                  {/* Health Status */}
                  <div className="flex gap-2 text-[0.55rem]">
                    {dep.healthStatus.operational > 0 && (
                      <span className="text-green-400">{dep.healthStatus.operational} OK</span>
                    )}
                    {dep.healthStatus.degraded > 0 && (
                      <span className="text-yellow-400">{dep.healthStatus.degraded} degraded</span>
                    )}
                    {dep.healthStatus.offline > 0 && (
                      <span className="text-red-400">{dep.healthStatus.offline} offline</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Existing Loadout Packages */}
      {existingPackages.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700/30">
          <h4 className="text-gray-500 text-[0.65rem] font-semibold mb-2 uppercase">Loadout Templates</h4>
          <div className="space-y-1">
            {existingPackages.slice(0, 3).map((pkg, idx) => (
              <div key={idx} className="flex justify-between text-xs">
                <span className="text-gray-400">{pkg.name}</span>
                <span className="text-gray-500">{pkg.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save as Package Button */}
      <button
        onClick={onSavePackage}
        className="mt-3 w-full py-2 bg-transparent border border-gray-600/50 rounded-lg text-gray-400 text-xs font-semibold hover:bg-gray-700/30 hover:text-gray-200 transition-colors"
      >
        Save as Package
      </button>
    </div>
  );
};

// Status Row Helper
const StatusRow = ({ icon: Icon, label, count, color }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Icon size={12} style={{ color }} />
      <span className="text-gray-400 text-xs">{label}</span>
    </div>
    <span className="text-gray-200 text-xs font-semibold">{count}</span>
  </div>
);

// Mission Selector Panel Component
const MissionSelectorPanel = ({ selectedMission, onSelectMission, onNewMission }) => {
  const { missions } = useMissionStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and group missions
  const groupedMissions = useMemo(() => {
    const filtered = missions.filter(m =>
      !['completed', 'archived'].includes(m.status) &&
      (searchTerm === '' || m.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return {
      active: filtered.filter(m => m.status === 'active'),
      draft: filtered.filter(m => m.status === 'draft' || m.status === 'ready')
    };
  }, [missions, searchTerm]);

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-gray-400 text-xs font-semibold mb-3 uppercase tracking-wider">
        Select Mission
      </h3>

      {/* New Mission Button */}
      <button
        onClick={onNewMission}
        className="w-full py-3 bg-lime-brand/10 border border-lime-brand/30 rounded-lg text-lime-brand text-sm font-semibold flex items-center justify-center gap-2 hover:bg-lime-brand/20 transition-colors mb-3"
      >
        <Plus size={16} />
        Plan New Mission
      </button>

      {/* Search */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search missions..."
        className="w-full px-3 py-2 bg-darkest border border-gray-600/50 rounded-lg text-gray-100 text-sm placeholder:text-gray-500 mb-3"
      />

      {/* Mission Groups */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Active Missions */}
        {groupedMissions.active.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-semibold uppercase">Active</span>
            </div>
            <div className="space-y-2">
              {groupedMissions.active.map(mission => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  isSelected={selectedMission?.id === mission.id}
                  onSelect={() => onSelectMission(mission)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Draft Missions */}
        {groupedMissions.draft.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-yellow-400 text-xs font-semibold uppercase">Draft / Ready</span>
            </div>
            <div className="space-y-2">
              {groupedMissions.draft.map(mission => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  isSelected={selectedMission?.id === mission.id}
                  onSelect={() => onSelectMission(mission)}
                />
              ))}
            </div>
          </div>
        )}

        {/* No Missions */}
        {groupedMissions.active.length === 0 && groupedMissions.draft.length === 0 && (
          <div className="text-center py-8">
            <MapPin size={32} className="text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No active or draft missions</p>
            <p className="text-gray-600 text-xs mt-1">Create a new mission to deploy</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Mission Card Component
const MissionCard = ({ mission, isSelected, onSelect }) => {
  const Icon = MISSION_ICONS[mission.template] || Target;

  // Get actual deployments for this mission
  const missionDeployments = useMemo(() => {
    return getDeploymentsByMission(mission.id);
  }, [mission.id]);

  const totalVessels = missionDeployments.reduce((sum, d) => sum + d.vesselCount, 0);
  const deploymentCount = missionDeployments.length;

  return (
    <button
      onClick={onSelect}
      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
        isSelected
          ? 'bg-lime-brand/10 border-lime-brand'
          : 'bg-darkest border-gray-700/50 hover:border-gray-600'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isSelected ? 'bg-lime-brand/20' : 'bg-gray-700/50'
        }`}>
          <Icon size={16} className={isSelected ? 'text-lime-brand' : 'text-gray-400'} />
        </div>
        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-sm truncate ${
            isSelected ? 'text-lime-brand' : 'text-gray-200'
          }`}>
            {mission.name}
          </div>
          <div className="text-gray-500 text-xs mt-0.5">
            {mission.template?.replace(/_/g, ' ')}
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs">
            {totalVessels > 0 ? (
              <>
                <span className="text-blue-400 font-semibold">{totalVessels} vessels</span>
                <span className="text-gray-500">{deploymentCount} loadout{deploymentCount !== 1 ? 's' : ''}</span>
              </>
            ) : (
              <span className="text-gray-500 italic">No vessels assigned</span>
            )}
            {mission.duration && <span className="text-gray-500">{mission.duration}</span>}
          </div>
          {/* Show deployed loadout types */}
          {missionDeployments.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {missionDeployments.slice(0, 2).map((dep, idx) => (
                <span key={idx} className="text-[0.6rem] px-1.5 py-0.5 bg-blue-400/10 text-blue-400 rounded">
                  {dep.vesselCount}× {dep.loadoutName.split(' ')[0]}
                </span>
              ))}
              {missionDeployments.length > 2 && (
                <span className="text-[0.6rem] px-1.5 py-0.5 bg-gray-700 text-gray-400 rounded">
                  +{missionDeployments.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>
        {isSelected && (
          <Check size={16} className="text-lime-brand flex-shrink-0" />
        )}
      </div>
    </button>
  );
};

// Deployment Summary Panel Component
const DeploymentSummaryPanel = ({
  hull,
  loadout,
  selectedMission,
  vesselCount,
  maxVessels,
  onVesselCountChange,
  onDeploy
}) => {
  const equippedCount = Object.values(loadout).flat().filter(Boolean).length;
  const canDeploy = selectedMission && vesselCount > 0 && vesselCount <= maxVessels;

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-gray-400 text-xs font-semibold mb-3 uppercase tracking-wider">
        Deployment Summary
      </h3>

      {/* Loadout Summary */}
      <div className="bg-darkest rounded-lg p-3 mb-3">
        <h4 className="text-gray-500 text-[0.65rem] font-semibold mb-2 uppercase">Loadout</h4>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Hull</span>
            <span className="text-gray-100 font-semibold">{hull?.name || 'Unknown'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Capabilities</span>
            <span className="text-lime-brand font-semibold">{equippedCount} equipped</span>
          </div>
        </div>
      </div>

      {/* Selected Mission */}
      <div className="bg-darkest rounded-lg p-3 mb-3">
        <h4 className="text-gray-500 text-[0.65rem] font-semibold mb-2 uppercase">Assigning To</h4>
        {selectedMission ? (
          <>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded bg-lime-brand/20 flex items-center justify-center">
                {(() => {
                  const Icon = MISSION_ICONS[selectedMission.template] || Target;
                  return <Icon size={12} className="text-lime-brand" />;
                })()}
              </div>
              <span className="text-gray-100 text-sm font-semibold">{selectedMission.name}</span>
            </div>
            {/* Show existing deployments on this mission */}
            {(() => {
              const existingDeps = getDeploymentsByMission(selectedMission.id);
              if (existingDeps.length === 0) return null;
              const totalExisting = existingDeps.reduce((sum, d) => sum + d.vesselCount, 0);
              return (
                <div className="pt-2 border-t border-gray-700/30">
                  <div className="text-gray-400 text-[0.6rem] mb-1.5">
                    Currently deployed: <span className="text-blue-400 font-semibold">{totalExisting} vessels</span>
                  </div>
                  <div className="space-y-1">
                    {existingDeps.map((dep, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[0.6rem]">
                        <span className="text-gray-400">{dep.loadoutName}</span>
                        <span className="text-blue-400">{dep.vesselCount}×</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </>
        ) : (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <AlertCircle size={14} />
            <span>Select a mission</span>
          </div>
        )}
      </div>

      {/* Vessel Count Selector */}
      <div className="bg-darkest rounded-lg p-3 mb-3">
        <h4 className="text-gray-500 text-[0.65rem] font-semibold mb-2 uppercase">Vessels to Deploy</h4>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => onVesselCountChange(Math.max(1, vesselCount - 1))}
            disabled={vesselCount <= 1}
            className="w-8 h-8 rounded-lg bg-gray-700 text-gray-300 flex items-center justify-center hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            -
          </button>
          <div className="text-center">
            <span className="text-2xl font-bold text-gray-100">{vesselCount}</span>
            <div className="text-gray-500 text-xs">of {maxVessels} available</div>
          </div>
          <button
            onClick={() => onVesselCountChange(Math.min(maxVessels, vesselCount + 1))}
            disabled={vesselCount >= maxVessels}
            className="w-8 h-8 rounded-lg bg-gray-700 text-gray-300 flex items-center justify-center hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>

        {/* Quick Select Buttons */}
        <div className="flex gap-2 mt-3 justify-center">
          {[1, 4, 12].filter(n => n <= maxVessels).map(n => (
            <button
              key={n}
              onClick={() => onVesselCountChange(n)}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                vesselCount === n
                  ? 'bg-lime-brand text-black'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Source Pool */}
      <div className="bg-darkest rounded-lg p-3 mb-3 flex items-center gap-2">
        <Check size={14} className="text-green-400" />
        <span className="text-gray-400 text-xs">From: </span>
        <span className="text-green-400 text-xs font-semibold">Mission Ready Pool</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Deploy Button */}
      <button
        onClick={onDeploy}
        disabled={!canDeploy}
        className={`w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
          canDeploy
            ? 'bg-lime-brand text-black hover:bg-lime-brand/90 cursor-pointer'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        <Rocket size={18} />
        {canDeploy ? `Deploy ${vesselCount} Vessel${vesselCount !== 1 ? 's' : ''}` : 'Select Mission to Deploy'}
      </button>
    </div>
  );
};

// Main Modal Component
const DeploymentFlowModal = ({ isOpen, onClose, hull, loadout, onNavigateToMissionPlanner }) => {
  const [selectedMission, setSelectedMission] = useState(null);
  const [vesselCount, setVesselCount] = useState(1);
  const { updateMission } = useMissionStore();

  // Calculate max available vessels
  const maxVessels = useMemo(() => {
    const matchingSquadrons = swarmSquadrons.filter(s => s.icon === hull?.name);
    return matchingSquadrons.reduce((sum, s) => sum + (s.status?.missionReady || 0), 0);
  }, [hull]);

  // Handle deploy
  const handleDeploy = () => {
    if (!selectedMission || vesselCount <= 0) return;

    // Update mission with new squadron assignment
    // In a real app, this would create vessel instances with the loadout
    updateMission(selectedMission.id, {
      historyNote: `Deployed ${vesselCount} ${hull?.name} vessel(s) with custom loadout`
    });

    alert(`Successfully deployed ${vesselCount} ${hull?.name} vessel(s) to ${selectedMission.name}!`);
    onClose();
  };

  // Handle new mission
  const handleNewMission = () => {
    onClose();
    onNavigateToMissionPlanner?.();
  };

  // Handle save as package
  const handleSavePackage = () => {
    const name = prompt('Enter package name:', `${hull?.name} Custom Loadout`);
    if (name) {
      alert(`Loadout saved as "${name}"`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-darker rounded-2xl border border-gray-700/50 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700/50 flex items-center justify-between">
          <div>
            <h2 className="text-gray-100 text-lg font-bold">
              Deploy {hull?.name?.toUpperCase()} Loadout
            </h2>
            <p className="text-gray-500 text-sm">
              Assign configured vessel to a mission
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Body - 3 Columns */}
        <div className="flex-1 grid grid-cols-3 divide-x divide-gray-700/50 overflow-hidden">
          {/* Left - Vessel Inventory */}
          <div className="p-4 overflow-y-auto">
            <VesselInventoryPanel
              hullName={hull?.name}
              loadout={loadout}
              onSavePackage={handleSavePackage}
            />
          </div>

          {/* Center - Mission Selector */}
          <div className="p-4 overflow-y-auto">
            <MissionSelectorPanel
              selectedMission={selectedMission}
              onSelectMission={setSelectedMission}
              onNewMission={handleNewMission}
            />
          </div>

          {/* Right - Deployment Summary */}
          <div className="p-4 overflow-y-auto">
            <DeploymentSummaryPanel
              hull={hull}
              loadout={loadout}
              selectedMission={selectedMission}
              vesselCount={vesselCount}
              maxVessels={maxVessels || 10}
              onVesselCountChange={setVesselCount}
              onDeploy={handleDeploy}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentFlowModal;
