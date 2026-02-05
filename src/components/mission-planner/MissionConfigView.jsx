import React, { useState, useEffect } from 'react';
import { ChevronLeft, Layers, Save, Rocket } from 'lucide-react';
import useMissionStore from '../../store/missionStore';
import { missionFlowTemplates, squadrons } from '../../data/marketplaceData';
import { KEY_MISSIONS, hierarchyPresets, nodeTypes, zoneTypes } from './constants';
import FlowCanvas from './FlowCanvas';
import MapZoneEditor from './MapZoneEditor';
import SquadronAssignment from './SquadronAssignment';
import AutonomyPopout from './AutonomyPopout';

// Get default zone config based on mission type's geometry
const getDefaultZoneConfig = (missionKey) => {
  const zoneStyle = zoneTypes[missionKey] || zoneTypes.SEA_DENIAL;
  const geometryType = zoneStyle.geometryType || 'zone';

  switch (geometryType) {
    case 'route':
      return {
        name: '',
        waypoints: [
          { lat: 25.0, lng: -80.5, label: 'A' },
          { lat: 25.5, lng: -79.5, label: 'B' },
          { lat: 26.0, lng: -78.5, label: 'C' }
        ]
      };
    case 'target':
      return {
        name: '',
        targets: [
          { lat: 25.2, lng: -80.0, label: 'T1', type: 'primary' }
        ],
        staging: { lat: 25.0, lng: -81.0, label: 'STAGING' }
      };
    case 'perimeter':
      return {
        name: '',
        center: { lat: 25.2, lng: -80.0 },
        radius: 20,
        assetName: 'Collection Area'
      };
    default: // 'zone'
      return {
        name: '',
        coordinates: [
          { lat: 25.0, lng: -80.5 },
          { lat: 25.5, lng: -80.0 },
          { lat: 25.3, lng: -79.3 },
          { lat: 24.8, lng: -79.5 }
        ]
      };
  }
};

// Mission Configuration View (opened when clicking a mission or creating new)
const MissionConfigView = ({ mission, onBack }) => {
  const {
    selectedMissionTemplate,
    missionPlannerConfig,
    setMissionPlannerConfig,
    loadMissionTemplate,
    saveMission,
    updateMission
  } = useMissionStore();

  // State-based autonomy hierarchies (keyed by node ID)
  const [stateHierarchies, setStateHierarchies] = useState(
    mission?.stateHierarchies || {
      default: [...hierarchyPresets.DEFAULT],
      threat_detected: [...hierarchyPresets.OFFENSIVE],
      engaged: [...hierarchyPresets.OFFENSIVE],
      evading: [...hierarchyPresets.EVASIVE]
    }
  );

  // Selected node for autonomy popout
  const [selectedNode, setSelectedNode] = useState(null);
  const [showAutonomyPopout, setShowAutonomyPopout] = useState(false);

  // Check if zone config has actual geometry data
  const hasZoneData = (config) => {
    if (!config) return false;
    return (
      (config.coordinates && config.coordinates.length > 0) ||
      (config.waypoints && config.waypoints.length > 0) ||
      (config.targets && config.targets.length > 0) ||
      config.center
    );
  };

  const [zoneConfig, setZoneConfig] = useState(() => {
    const missionZone = mission?.zoneConfig;
    return hasZoneData(missionZone)
      ? missionZone
      : getDefaultZoneConfig(mission?.template || 'SEA_DENIAL');
  });

  // Assigned squadrons for this mission (hierarchy: Vessels → Squadrons → Fleets)
  const [assignedSquadrons, setAssignedSquadrons] = useState(mission?.assignedSquadrons || []);

  // Initialize from mission or load default
  useEffect(() => {
    if (mission) {
      loadMissionTemplate(mission.template, missionFlowTemplates[mission.template]);
      setMissionPlannerConfig({ name: mission.name, duration: mission.duration });
    } else if (!selectedMissionTemplate) {
      const defaultMission = KEY_MISSIONS[0];
      const template = missionFlowTemplates[defaultMission.key];
      if (template) {
        loadMissionTemplate(defaultMission.key, template);
        setMissionPlannerConfig({ name: '' });
      }
    }
  }, [mission]);

  const selectMission = (missionKey) => {
    const template = missionFlowTemplates[missionKey];
    if (template) {
      loadMissionTemplate(missionKey, template);

      // Initialize state hierarchies based on mission type
      const baseHierarchy = missionKey === 'SEA_DENIAL' || missionKey === 'REFLEX_SWARM_ATTACK'
        ? hierarchyPresets.OFFENSIVE
        : missionKey === 'CONTESTED_LOGISTICS'
        ? hierarchyPresets.EVASIVE
        : missionKey === 'RECONNAISSANCE'
        ? hierarchyPresets.ISR
        : hierarchyPresets.DEFAULT;

      setStateHierarchies({
        default: [...baseHierarchy],
        threat_detected: [...hierarchyPresets.OFFENSIVE],
        engaged: [...hierarchyPresets.OFFENSIVE],
        evading: [...hierarchyPresets.EVASIVE],
        searching: [...hierarchyPresets.ISR]
      });

      // Reset zone config to match the new mission type's geometry
      setZoneConfig(getDefaultZoneConfig(missionKey));
    }
  };

  const handleNodeClick = (node) => {
    if (node.type === 'decide' || node.type === 'decision' || node.type === 'human_checkpoint') {
      setSelectedNode(node);
      setShowAutonomyPopout(true);
    }
  };

  const handleSave = (asDraft = true) => {
    if (!missionPlannerConfig.name || !selectedMissionTemplate) return;

    const missionData = {
      name: missionPlannerConfig.name,
      duration: missionPlannerConfig.duration,
      template: selectedMissionTemplate,
      stateHierarchies,
      zoneConfig,
      assignedSquadrons,
      status: asDraft ? 'draft' : 'ready'
    };

    if (mission?.id) {
      updateMission(mission.id, missionData);
    } else {
      saveMission(missionData);
    }

    onBack();
  };


  const currentMission = KEY_MISSIONS.find(m => m.key === selectedMissionTemplate);
  const configuredStates = Object.keys(stateHierarchies).length;

  // Auto-generate mission name
  const generateMissionName = () => {
    const missionPrefix = currentMission?.name?.split(' ')[0] || 'Mission';
    const zonePart = zoneConfig?.name ? `-${zoneConfig.name.replace(/\s+/g, '')}` : '';
    const datePart = new Date().toISOString().slice(5, 10).replace('-', '');
    const timePart = new Date().toISOString().slice(11, 16).replace(':', '');
    return `${missionPrefix}${zonePart}-${datePart}-${timePart}`;
  };

  useEffect(() => {
    if (!mission && selectedMissionTemplate && (!missionPlannerConfig.name || missionPlannerConfig.name.match(/^(Sea|Contested|Convoy|Swarm|Robot|ISR)/))) {
      setMissionPlannerConfig({ name: generateMissionName() });
    }
  }, [selectedMissionTemplate, zoneConfig?.name]);

  return (
    <div className="flex flex-col gap-4 min-h-[600px] overflow-hidden w-full max-w-full">
      {/* Header with Back Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-2.5 py-1.5 bg-transparent border border-gray-600/40 rounded-md text-gray-400 text-[0.65rem] cursor-pointer flex items-center gap-1"
          >
            <ChevronLeft size={14} /> Back to Library
          </button>
          <h2 className="text-gray-50 text-base font-semibold m-0">
            {mission ? 'Edit Mission' : 'New Mission'}
          </h2>
          {mission && (
            <span className="px-2 py-1 bg-yellow-400/15 border border-yellow-400/30 rounded text-yellow-400 text-[0.6rem] font-semibold">
              {mission.status.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Mission Selector - Horizontal Cards */}
      <div className="bg-darker rounded-lg border border-border-subtle p-4">
        <h3 className="text-lime-brand text-[0.85rem] font-semibold mb-3">SELECT MISSION TYPE</h3>
        <div className="grid grid-cols-6 gap-3">
          {KEY_MISSIONS.map((m) => {
            const Icon = m.icon;
            const isSelected = selectedMissionTemplate === m.key;
            return (
              <button
                key={m.key}
                onClick={() => selectMission(m.key)}
                className={`px-2 py-3 rounded-lg cursor-pointer transition-all text-center ${
                  isSelected ? 'border-2' : 'border bg-darkest border-border-subtle'
                }`}
                style={isSelected ? {
                  backgroundColor: `${m.color}20`,
                  borderColor: m.color
                } : {}}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2"
                  style={{ backgroundColor: isSelected ? m.color : `${m.color}30` }}
                >
                  <Icon size={18} color={isSelected ? '#000' : m.color} />
                </div>
                <div
                  className="text-[0.7rem] font-semibold mb-1"
                  style={{ color: isSelected ? m.color : '#f9fafb' }}
                >
                  {m.name}
                </div>
                <div className="text-gray-500 text-[0.5rem] leading-tight">
                  {m.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex gap-4 flex-1 overflow-hidden">
        {/* Center - Wide Mission Flow with Autonomy Popout */}
        <div className="flex-1 min-w-0 bg-darker rounded-lg border border-border-subtle flex flex-col relative">
          <div className="px-3 py-2 border-b border-border-subtle bg-gray-600/10 flex justify-between items-center">
            <div>
              <h3 className="text-gray-50 text-[0.8rem] font-semibold m-0">
                {currentMission?.name || 'Mission'} Flow
              </h3>
              <p className="text-gray-500 text-[0.55rem] m-0 mt-0.5">
                {selectedMissionTemplate ? `${missionFlowTemplates[selectedMissionTemplate]?.nodes?.length || 0} nodes` : 'Select a mission'} • Click decision nodes to configure autonomy
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 bg-lime-brand/10 border border-lime-brand/30 rounded flex items-center gap-1">
                <Layers size={12} color="#cbfd00" />
                <span className="text-lime-brand text-[0.55rem] font-semibold">{configuredStates} Autonomy States</span>
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-[350px] relative overflow-auto">
            <FlowCanvas
              template={selectedMissionTemplate ? missionFlowTemplates[selectedMissionTemplate] : null}
              onNodeClick={handleNodeClick}
              stateHierarchies={stateHierarchies}
            />

            {/* Autonomy Popout Overlay */}
            {showAutonomyPopout && selectedNode && (
              <>
                {/* Backdrop */}
                <div
                  onClick={() => setShowAutonomyPopout(false)}
                  className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 z-[999]"
                />
                <AutonomyPopout
                  node={selectedNode}
                  stateHierarchies={stateHierarchies}
                  setStateHierarchies={setStateHierarchies}
                  onClose={() => setShowAutonomyPopout(false)}
                />
              </>
            )}
          </div>
          {/* Legend with decision node hint */}
          <div className="px-3 py-1 border-t border-border-subtle bg-gray-600/10">
            <div className="flex flex-wrap gap-3 justify-center items-center">
              {Object.entries(nodeTypes).slice(0, 6).map(([key, config]) => (
                <div key={key} className="flex items-center gap-0.5">
                  <div
                    className={config.size === 'small' ? 'w-2 h-2 rounded-full' : 'w-2 h-2 rounded-sm'}
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="text-gray-500 text-[0.5rem]">{config.label}</span>
                </div>
              ))}
              <div className="text-gray-500 text-[0.5rem] italic">
                Click <span className="text-yellow-400">Decision</span> nodes to set autonomy
              </div>
            </div>
          </div>
        </div>

        {/* Right - Map + Fleet + Config */}
        <div className="w-[340px] min-w-[280px] flex-shrink flex flex-col gap-3 overflow-hidden">
          {/* Map Zone Editor */}
          <div className="flex-1 min-h-[220px]">
            <MapZoneEditor zoneConfig={zoneConfig} setZoneConfig={setZoneConfig} missionType={selectedMissionTemplate} />
          </div>

          {/* Squadron Assignment */}
          <div className="h-[180px]">
            <SquadronAssignment
              assignedSquadrons={assignedSquadrons}
              setAssignedSquadrons={setAssignedSquadrons}
              availableSquadrons={squadrons}
            />
          </div>

          {/* Mission Config - Compact */}
          <div className="bg-darker rounded-lg border border-border-subtle p-3">
            <h4 className="text-gray-400 text-[0.65rem] mb-2 font-semibold">MISSION CONFIG</h4>

            <input
              type="text"
              value={missionPlannerConfig.name}
              onChange={(e) => setMissionPlannerConfig({ name: e.target.value })}
              placeholder="Mission Name *"
              className="w-full px-1.5 py-1.5 bg-darkest border border-gray-600/40 rounded text-gray-50 text-[0.7rem] mb-2"
            />

            <div className="mb-2">
              <label className="text-gray-500 text-[0.5rem] block mb-0.5">Duration</label>
              <input
                type="text"
                value={missionPlannerConfig.duration || ''}
                onChange={(e) => setMissionPlannerConfig({ duration: e.target.value })}
                placeholder="e.g., 24h, 7d, indefinite"
                className="w-full px-1 py-1 bg-darkest border border-gray-600/40 rounded text-gray-50 text-[0.6rem]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleSave(true)}
                disabled={!missionPlannerConfig.name || !selectedMissionTemplate}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 bg-transparent rounded text-[0.65rem] font-semibold ${
                  missionPlannerConfig.name && selectedMissionTemplate
                    ? 'border border-gray-600/40 text-gray-400 cursor-pointer'
                    : 'border border-gray-600/20 text-gray-700 cursor-not-allowed'
                }`}
              >
                <Save size={12} />
                Save Draft
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={!missionPlannerConfig.name || !selectedMissionTemplate || assignedSquadrons.length === 0}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 border-0 rounded text-[0.65rem] font-semibold ${
                  missionPlannerConfig.name && selectedMissionTemplate && assignedSquadrons.length > 0
                    ? 'bg-lime-brand text-black cursor-pointer'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Rocket size={12} />
                Deploy ({assignedSquadrons.length} sqdn)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionConfigView;
