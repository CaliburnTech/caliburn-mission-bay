import React, { useState, useEffect } from 'react';
import { ChevronLeft, Layers, Save, Rocket, Ship, Plane, Users, FileText, GitBranch } from 'lucide-react';
import useMissionStore from '../../store/missionStore';
import { missionFlowTemplates, squadrons } from '../../data/marketplaceData';
import { generateSBOMFromMission } from '../../utils/sbomGenerator';
import { activeDeployments } from '../../data/fleetData';
import SBOMDisplay from '../shared/SBOMDisplay';
import SV2Editor from '../shared/SV2Editor';
import {
  KEY_MARITIME_MISSIONS,
  KEY_AERIAL_MISSIONS,
  KEY_COMBINED_MISSIONS,
  ALL_MISSIONS,
  MISSION_DOMAINS,
  hierarchyPresets,
  nodeTypes,
  zoneTypes
} from './constants';
import FlowCanvas from './FlowCanvas';
import MapZoneEditor from './MapZoneEditor';
import SquadronAssignment from './SquadronAssignment';
import AutonomyPopout from './AutonomyPopout';
import PortSecurityMissionView from './PortSecurityMissionView';
import MineClearanceMissionView from './MineClearanceMissionView';
import ISRTetheredDroneMissionView from './ISRTetheredDroneMissionView';
import ASWMissionView from './ASWMissionView';
import TaiwanISRMissionView from './TaiwanISRMissionView';

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
      if (missionKey === 'PORT_SECURITY') {
        return {
          name: '',
          center: { lat: 21.35, lng: -157.97 },
          radius: 8,
          assetName: 'Naval Station Pearl Harbor'
        };
      }
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

// Get mission domain from template key
const getMissionDomain = (templateKey) => {
  const mission = ALL_MISSIONS.find(m => m.key === templateKey);
  return mission?.domain || 'MARITIME';
};

// Get missions for a specific domain
const getMissionsForDomain = (domain) => {
  switch (domain) {
    case 'AERIAL': return KEY_AERIAL_MISSIONS;
    case 'COMBINED': return KEY_COMBINED_MISSIONS;
    default: return KEY_MARITIME_MISSIONS;
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

  // Domain filter state - derive from existing mission or default to MARITIME
  const [selectedDomain, setSelectedDomain] = useState(
    mission?.domain || getMissionDomain(mission?.template) || 'MARITIME'
  );

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

  // SBOM / SV-2 modal state
  const [showSBOM, setShowSBOM] = useState(false);
  const [showSV2, setShowSV2] = useState(false);
  const [sbomData, setSbomData] = useState(null);

  const handleGenerateSBOM = () => {
    const missionData = mission || { id: 'new', name: missionPlannerConfig.name, template: selectedMissionTemplate, missionProfile: {} };
    const missionDeployments = activeDeployments.filter(d => d.missionId === missionData.id);
    const sbom = generateSBOMFromMission(missionData, missionDeployments);
    setSbomData(sbom);
    setShowSBOM(true);
  };

  const handleGenerateSV2 = () => {
    setShowSV2(true);
  };

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

  // Assigned squadrons for this mission
  // For COMBINED: { aerial: [], maritime: [] }
  // For single-domain: []
  const [assignedSquadrons, setAssignedSquadrons] = useState(() => {
    if (mission?.assignedSquadrons) return mission.assignedSquadrons;
    if (selectedDomain === 'COMBINED') return { aerial: [], maritime: [] };
    return [];
  });

  // Initialize from mission or load default
  useEffect(() => {
    if (mission) {
      loadMissionTemplate(mission.template, missionFlowTemplates[mission.template]);
      setMissionPlannerConfig({ name: mission.name, duration: mission.duration });
    } else if (!selectedMissionTemplate) {
      const domainMissions = getMissionsForDomain(selectedDomain);
      const defaultMission = domainMissions[0];
      const template = missionFlowTemplates[defaultMission?.key];
      if (template) {
        loadMissionTemplate(defaultMission.key, template);
        setMissionPlannerConfig({ name: '' });
      }
    }
  }, [mission]);

  const selectMission = (missionKey) => {
    const template = missionFlowTemplates[missionKey];
    const missionDomain = getMissionDomain(missionKey);

    if (template) {
      loadMissionTemplate(missionKey, template);

      // Initialize state hierarchies based on mission type
      const baseHierarchy = missionKey === 'SEA_DENIAL' || missionKey === 'REFLEX_SWARM_ATTACK'
        ? hierarchyPresets.OFFENSIVE
        : missionKey === 'CONTESTED_LOGISTICS'
        ? hierarchyPresets.EVASIVE
        : missionKey === 'RECONNAISSANCE' || missionKey === 'AERIAL_ISR'
        ? hierarchyPresets.ISR
        : missionKey === 'PORT_SECURITY'
        ? hierarchyPresets.SAR  // Navigation-first: COLREGS priority in busy port, human cue for escalation
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

      // Reset assignedSquadrons if domain changed
      if (missionDomain !== selectedDomain) {
        setSelectedDomain(missionDomain);
        setAssignedSquadrons(missionDomain === 'COMBINED' ? { aerial: [], maritime: [] } : []);
      }
    }
  };

  // Handle domain tab change
  const handleDomainChange = (newDomain) => {
    setSelectedDomain(newDomain);
    // Reset assignedSquadrons format
    setAssignedSquadrons(newDomain === 'COMBINED' ? { aerial: [], maritime: [] } : []);
    // Select first mission in new domain
    const domainMissions = getMissionsForDomain(newDomain);
    if (domainMissions.length > 0) {
      selectMission(domainMissions[0].key);
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
      domain: selectedDomain,
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

  // Get total assigned squadrons count (handles both formats)
  const getAssignedCount = () => {
    if (selectedDomain === 'COMBINED') {
      const aerial = assignedSquadrons?.aerial?.length || 0;
      const maritime = assignedSquadrons?.maritime?.length || 0;
      return aerial + maritime;
    }
    return assignedSquadrons?.length || 0;
  };


  const currentMission = ALL_MISSIONS.find(m => m.key === selectedMissionTemplate);
  const domainMissions = getMissionsForDomain(selectedDomain);
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

  if (selectedMissionTemplate === 'PORT_SECURITY' || mission?.template === 'PORT_SECURITY') {
    return <PortSecurityMissionView mission={mission} onBack={onBack} />;
  }

  if (selectedMissionTemplate === 'MCM' || mission?.template === 'MCM') {
    return <MineClearanceMissionView mission={mission} onBack={onBack} />;
  }

  if (selectedMissionTemplate === 'ISR' || mission?.template === 'ISR') {
    if (mission?.missionProfile?.lane === 'COUNTER_C5ISR') {
      return <TaiwanISRMissionView mission={mission} onBack={onBack} />;
    }
    return <ISRTetheredDroneMissionView mission={mission} onBack={onBack} />;
  }

  if (selectedMissionTemplate === 'ASW' || mission?.template === 'ASW') {
    return <ASWMissionView mission={mission} onBack={onBack} />;
  }

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

      {/* Mission Selector - Domain Tabs + Horizontal Cards */}
      <div className="bg-darker rounded-lg border border-border-subtle p-4">
        {/* Domain Tabs */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lime-brand text-[0.85rem] font-semibold">SELECT MISSION TYPE</h3>
          <div className="flex gap-1 bg-darkest rounded-lg p-1">
            {[
              { key: 'MARITIME', label: 'Maritime', icon: Ship, color: '#3b82f6' },
              { key: 'AERIAL', label: 'Aerial', icon: Plane, color: '#06b6d4' },
              { key: 'COMBINED', label: 'Combined', icon: Users, color: '#8b5cf6' }
            ].map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => handleDomainChange(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[0.65rem] font-semibold transition-all ${
                  selectedDomain === key
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
                style={selectedDomain === key ? { backgroundColor: `${color}30`, color } : {}}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Mission Cards */}
        <div className={`grid gap-3 ${domainMissions.length <= 4 ? 'grid-cols-4' : domainMissions.length <= 5 ? 'grid-cols-5' : 'grid-cols-6'}`}>
          {domainMissions.map((m) => {
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
          <div className="flex-1 min-h-[200px]">
            <SquadronAssignment
              assignedSquadrons={assignedSquadrons}
              setAssignedSquadrons={setAssignedSquadrons}
              availableSquadrons={squadrons}
              missionDomain={selectedDomain}
              missionType={selectedMissionTemplate}
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
                disabled={!missionPlannerConfig.name || !selectedMissionTemplate || getAssignedCount() === 0}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 border-0 rounded text-[0.65rem] font-semibold ${
                  missionPlannerConfig.name && selectedMissionTemplate && getAssignedCount() > 0
                    ? 'bg-lime-brand text-black cursor-pointer'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Rocket size={12} />
                Deploy ({getAssignedCount()} sqdn)
              </button>
            </div>

            {/* SBOM / SV-2 Generation */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleGenerateSBOM}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-transparent border border-cyan-500/30 rounded text-cyan-500 text-[0.6rem] font-semibold cursor-pointer hover:bg-cyan-500/10 transition-colors"
              >
                <FileText size={11} />
                SBOM
              </button>
              <button
                onClick={handleGenerateSV2}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-transparent border border-violet-500/30 rounded text-violet-500 text-[0.6rem] font-semibold cursor-pointer hover:bg-violet-500/10 transition-colors"
              >
                <GitBranch size={11} />
                SV-2
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SBOM Modal */}
      {showSBOM && sbomData && (
        <SBOMDisplay sbom={sbomData} onClose={() => setShowSBOM(false)} />
      )}

      {/* SV-2 Modal */}
      {showSV2 && (
        <SV2Editor activeConfig={null} hullName={mission?.name || missionPlannerConfig?.name || ''} onClose={() => setShowSV2(false)} />
      )}
    </div>
  );
};

export default MissionConfigView;
