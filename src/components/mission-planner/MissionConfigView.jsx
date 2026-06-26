import React, { useState, useEffect } from 'react';
import { ChevronLeft, Layers, Save, Rocket, Ship, Plane, Users, FileText, GitBranch } from 'lucide-react';
import useMissionStore from '../../store/missionStore';
import { missionFlowTemplates } from '../../data/marketplaceData';
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
import MDAISRMissionView from './MDAISRMissionView';
import ProtectionsMissionView from './ProtectionsMissionView';
import NonKineticMissionView from './NonKineticMissionView';
import KineticEffectsMissionView from './KineticEffectsMissionView';
import ContestedLogisticsMissionView from './ContestedLogisticsMissionView';
import SeaJeepBaseMissionView from './SeaJeepBaseMissionView';
import SeaJeepISRMissionView from './SeaJeepISRMissionView';
import SeaJeepMCMMissionView from './SeaJeepMCMMissionView';
import SeaJeepLogisticsMissionView from './SeaJeepLogisticsMissionView';

// Get default zone config based on mission type's geometry
const getDefaultZoneConfig = (missionKey) => {
  const zoneStyle = zoneTypes[missionKey] || zoneTypes.ASW;
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
    setSelectedMissionTemplate,
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

  // Navy group filter (maritime only)
  const [navyGroup, setNavyGroup] = useState('ALL');

  const NAVY_GROUPS = [
    { key: 'ALL',        label: 'All Missions' },
    { key: 'PAE_RAS',   label: 'PAE RAS',        keys: ['KINETIC_EFFECTS', 'NON_KINETIC_EW', 'MDA_ISR', 'CONTESTED_LOGISTICS', 'PROTECTIONS'] },
    { key: 'FLEET',     label: '5th & 7th Fleet', keys: ['ISR', 'COUNTER_C5ISR', 'MCM', 'ASW'] },
    { key: 'OTHER',     label: 'Other',           keys: ['PORT_SECURITY'] },
    { key: 'SEA_JEEP', label: 'Sea Jeep', keys: ['SEAJEEP_BASE', 'SEAJEEP_ISR', 'SEAJEEP_MCM', 'SEAJEEP_LOGISTICS'] },
  ];

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
  const [_selectedNode, setSelectedNode] = useState(null);
  const [_showAutonomyPopout, setShowAutonomyPopout] = useState(false);

  // SBOM / SV-2 modal state
  const [showSBOM, setShowSBOM] = useState(false);
  const [showSV2, setShowSV2] = useState(false);
  const [sbomData, setSbomData] = useState(null);

  const _handleGenerateSBOM = () => {
    const missionData = mission || { id: 'new', name: missionPlannerConfig.name, template: selectedMissionTemplate, missionProfile: {} };
    const missionDeployments = activeDeployments.filter(d => d.missionId === missionData.id);
    const sbom = generateSBOMFromMission(missionData, missionDeployments);
    setSbomData(sbom);
    setShowSBOM(true);
  };

  const _handleGenerateSV2 = () => {
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
      : getDefaultZoneConfig(mission?.template || 'MCM');
  });

  // Assigned squadrons for this mission
  // For COMBINED: { aerial: [], maritime: [] }
  // For single-domain: []
  const [assignedSquadrons, setAssignedSquadrons] = useState(() => {
    if (mission?.assignedSquadrons) return mission.assignedSquadrons;
    if (selectedDomain === 'COMBINED') return { aerial: [], maritime: [] };
    return [];
  });

  // Initialize from existing mission (edit flow only — new missions start on the picker)
  useEffect(() => {
    if (mission) {
      const tmpl = missionFlowTemplates[mission.template];
      if (tmpl) loadMissionTemplate(mission.template, tmpl);
      setMissionPlannerConfig({ name: mission.name, duration: mission.duration });
    }
  }, [mission]);

  const selectMission = (missionKey) => {
    // COUNTER_C5ISR uses the ISR autonomy flow template
    const templateKey = missionKey === 'COUNTER_C5ISR' ? 'ISR' : missionKey;
    const template = missionFlowTemplates[templateKey];
    const missionDomain = getMissionDomain(missionKey);

    if (!template) {
      // Missions with specialized views (no flow template) — just set the template key
      // so the routing checks at the top of this component can fire.
      setSelectedMissionTemplate(missionKey);
      return;
    }

    if (template) {
      loadMissionTemplate(missionKey, template);

      // Initialize state hierarchies based on mission type
      const baseHierarchy = missionKey === 'SEA_DENIAL' || missionKey === 'REFLEX_SWARM_ATTACK'
        ? hierarchyPresets.OFFENSIVE
        : missionKey === 'CONTESTED_LOGISTICS'
        ? hierarchyPresets.EVASIVE
        : missionKey === 'RECONNAISSANCE' || missionKey === 'AERIAL_ISR'
        ? hierarchyPresets.ISR
        : missionKey === 'ISR' || missionKey === 'COUNTER_C5ISR'
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

  // Handle domain tab change — just switch tabs, don't auto-select a mission
  const handleDomainChange = (newDomain) => {
    setSelectedDomain(newDomain);
    setNavyGroup('ALL');
    setAssignedSquadrons(newDomain === 'COMBINED' ? { aerial: [], maritime: [] } : []);
    setSelectedMissionTemplate(null);
  };

  const _handleNodeClick = (node) => {
    if (node.type === 'decide' || node.type === 'decision' || node.type === 'human_checkpoint') {
      setSelectedNode(node);
      setShowAutonomyPopout(true);
    }
  };

  const _handleSave = (asDraft = true) => {
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
  const _getAssignedCount = () => {
    if (selectedDomain === 'COMBINED') {
      const aerial = assignedSquadrons?.aerial?.length || 0;
      const maritime = assignedSquadrons?.maritime?.length || 0;
      return aerial + maritime;
    }
    return assignedSquadrons?.length || 0;
  };


  const currentMission = ALL_MISSIONS.find(m => m.key === selectedMissionTemplate);
  const domainMissions = getMissionsForDomain(selectedDomain);
  const activeGroup = NAVY_GROUPS.find(g => g.key === navyGroup);
  const filteredMissions = (selectedDomain === 'MARITIME' && activeGroup?.keys)
    ? domainMissions.filter(m => activeGroup.keys.includes(m.key))
    : domainMissions;
  const _configuredStates = Object.keys(stateHierarchies).length;

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

  if (selectedMissionTemplate === 'COUNTER_C5ISR' || mission?.template === 'COUNTER_C5ISR') {
    return <TaiwanISRMissionView mission={mission} onBack={onBack} />;
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

  if (selectedMissionTemplate === 'NON_KINETIC_EW' || mission?.template === 'NON_KINETIC_EW') {
    return <NonKineticMissionView mission={mission} onBack={onBack} />;
  }

  if (selectedMissionTemplate === 'MDA_ISR' || mission?.template === 'MDA_ISR') {
    return <MDAISRMissionView mission={mission} onBack={onBack} />;
  }

  if (selectedMissionTemplate === 'PROTECTIONS' || mission?.template === 'PROTECTIONS') {
    return <ProtectionsMissionView mission={mission} onBack={onBack} />;
  }

  if (selectedMissionTemplate === 'CONTESTED_LOGISTICS' || mission?.template === 'CONTESTED_LOGISTICS') {
    return <ContestedLogisticsMissionView mission={mission} onBack={onBack} />;
  }

  if (selectedMissionTemplate === 'KINETIC_EFFECTS' || mission?.template === 'KINETIC_EFFECTS') {
    return <KineticEffectsMissionView mission={mission} onBack={onBack} />;
  }

  if (selectedMissionTemplate === 'SEAJEEP_BASE' || mission?.template === 'SEAJEEP_BASE') {
    return <SeaJeepBaseMissionView mission={mission} onBack={onBack} />;
  }

  if (selectedMissionTemplate === 'SEAJEEP_ISR' || mission?.template === 'SEAJEEP_ISR') {
    return <SeaJeepISRMissionView mission={mission} onBack={onBack} />;
  }

  if (selectedMissionTemplate === 'SEAJEEP_MCM' || mission?.template === 'SEAJEEP_MCM') {
    return <SeaJeepMCMMissionView mission={mission} onBack={onBack} />;
  }

  if (selectedMissionTemplate === 'SEAJEEP_LOGISTICS' || mission?.template === 'SEAJEEP_LOGISTICS') {
    return <SeaJeepLogisticsMissionView mission={mission} onBack={onBack} />;
  }

  return (
    <div className="flex flex-col gap-4 min-h-[600px] overflow-hidden w-full max-w-full">
      {/* Header with Back Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
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

        {/* Navy Group Filter — maritime only */}
        {selectedDomain === 'MARITIME' && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-gray-600 text-[0.6rem] uppercase tracking-widest">Filter:</span>
            {/* Mobile: dropdown */}
            <select
              className="md:hidden bg-darkest border border-gray-700 text-gray-300 text-xs rounded-lg px-3 py-1.5 focus:border-lime-brand focus:outline-none"
              value={navyGroup}
              onChange={e => setNavyGroup(e.target.value)}
            >
              {NAVY_GROUPS.map(({ key, label }) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            {/* Desktop: pills */}
            <div className="hidden md:flex gap-1">
              {NAVY_GROUPS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setNavyGroup(key)}
                  className={`px-3 py-1 rounded-full text-[0.65rem] font-semibold transition-all border ${
                    navyGroup === key
                      ? 'bg-lime-brand/20 border-lime-brand text-lime-brand'
                      : 'bg-transparent border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mission Cards */}
        <div className={`grid gap-3 grid-cols-2 ${filteredMissions.length <= 4 ? 'md:grid-cols-4' : filteredMissions.length <= 5 ? 'md:grid-cols-5' : 'md:grid-cols-6'}`}>
          {filteredMissions.map((m) => {
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
                <div className="hidden md:block text-gray-500 text-[0.5rem] leading-tight">
                  {m.description}
                </div>
              </button>
            );
          })}
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
