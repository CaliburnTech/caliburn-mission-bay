import React, { useState } from 'react';
import { History, FileText, Rocket, Play, Pause, Check, Archive, Edit2, Eye, Copy, Trash2, Plus, Target, Users, Ship, Plane, GitBranch } from 'lucide-react';
import useMissionStore from '../../store/missionStore';
import { squadrons } from '../../data/marketplaceData';
import { getStatusColor, getStatusBg, formatMissionDate } from '../../utils/statusUtils';
import { ALL_MISSIONS } from './constants';
import { generateSBOMFromMission } from '../../utils/sbomGenerator';
import { resolveSV2 } from '../../utils/sv2AutoGenerator';
import { activeDeployments } from '../../data/fleetData';
import SBOMDisplay from '../shared/SBOMDisplay';
import SV2Editor from '../shared/SV2Editor';

// Domain badge colors
const domainStyles = {
  MARITIME: { color: '#3b82f6', icon: Ship, label: 'Maritime' },
  AERIAL: { color: '#06b6d4', icon: Plane, label: 'Aerial' },
  COMBINED: { color: '#8b5cf6', icon: Users, label: 'Combined' }
};

// Mission Library Panel (Compact sidebar view)
export const MissionLibrary = ({ onSelectMission, onCloneMission, currentMissionId }) => {
  const { missions, launchMission, completeMission, deleteMission } = useMissionStore();
  const [filter, setFilter] = useState('all');

  const filteredMissions = missions.filter(m => {
    if (filter === 'all') return m.status !== 'archived';
    return m.status === filter;
  });

  const getStatusIcon = (status) => {
    const icons = { draft: FileText, ready: Rocket, active: Play, paused: Pause, completed: Check, archived: Archive };
    return icons[status] || FileText;
  };

  return (
    <div className="bg-darker rounded-lg border border-border-subtle flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History size={14} color="#cbfd00" />
          <h4 className="text-lime-brand text-[0.7rem] font-semibold m-0">MISSION LIBRARY</h4>
        </div>
        <span className="text-gray-500 text-[0.5rem]">{missions.length} total</span>
      </div>

      <div className="flex p-1.5 gap-1 border-b border-gray-600/20">
        {['all', 'draft', 'active', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-1 rounded text-[0.5rem] font-semibold uppercase cursor-pointer ${
              filter === f ? 'bg-lime-brand/15 border border-lime-brand/30 text-lime-brand' : 'bg-transparent border border-transparent text-gray-500'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filteredMissions.length === 0 ? (
          <div className="text-gray-500 text-[0.55rem] text-center p-4">No missions found</div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {filteredMissions.map(mission => {
              const StatusIcon = getStatusIcon(mission.status);
              const isActive = mission.id === currentMissionId;
              return (
                <div key={mission.id} className={`p-2 rounded-md ${isActive ? 'bg-lime-brand/10 border border-lime-brand/40' : 'bg-darkest border border-border-subtle'}`}>
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <StatusIcon size={12} color={getStatusColor(mission.status)} />
                      <span className="text-gray-50 text-[0.6rem] font-semibold">{mission.name}</span>
                    </div>
                    <span className="px-1 py-0.5 rounded-sm text-[0.45rem] font-semibold uppercase" style={{ backgroundColor: `${getStatusColor(mission.status)}20`, color: getStatusColor(mission.status) }}>
                      {mission.status}
                    </span>
                  </div>
                  <div className="text-gray-500 text-[0.5rem] mb-1.5">
                    {mission.template} • {mission.assignedSquadrons?.length || 0} squadron(s) • {formatMissionDate(mission.createdAt)}
                  </div>
                  <div className="flex gap-1">
                    {mission.status === 'draft' && (
                      <>
                        <button onClick={() => onSelectMission(mission)} className="flex-1 py-1 bg-lime-brand/10 border border-lime-brand/30 rounded text-lime-brand text-[0.45rem] cursor-pointer flex items-center justify-center gap-0.5">
                          <Edit2 size={8} /> Edit
                        </button>
                        <button onClick={() => launchMission(mission.id)} disabled={!mission.assignedSquadrons?.length} className={`flex-1 py-1 rounded text-[0.45rem] flex items-center justify-center gap-0.5 ${mission.assignedSquadrons?.length ? 'bg-green-400/15 border border-green-400/30 text-green-400 cursor-pointer' : 'bg-transparent border border-green-400/30 text-gray-700 cursor-not-allowed'}`}>
                          <Play size={8} /> Launch
                        </button>
                      </>
                    )}
                    {mission.status === 'active' && (
                      <>
                        <button onClick={() => onSelectMission(mission)} className="flex-1 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-500 text-[0.45rem] cursor-pointer flex items-center justify-center gap-0.5">
                          <Eye size={8} /> View
                        </button>
                        <button onClick={() => completeMission(mission.id)} className="flex-1 py-1 bg-green-400/10 border border-green-400/30 rounded text-green-400 text-[0.45rem] cursor-pointer flex items-center justify-center gap-0.5">
                          <Check size={8} /> Complete
                        </button>
                      </>
                    )}
                    {mission.status === 'completed' && (
                      <button onClick={() => onCloneMission(mission.id)} className="flex-1 py-1 bg-violet-500/10 border border-violet-500/30 rounded text-violet-500 text-[0.45rem] cursor-pointer flex items-center justify-center gap-0.5">
                        <Copy size={8} /> Clone
                      </button>
                    )}
                    {(mission.status === 'draft' || mission.status === 'completed') && (
                      <button onClick={() => deleteMission(mission.id)} className="px-1.5 py-1 bg-transparent border border-red-500/30 rounded text-red-500 text-[0.45rem] cursor-pointer">
                        <Trash2 size={8} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Mission Library Table View (Primary View)
export const MissionLibraryTable = ({ onSelectMission, onNewMission }) => {
  const { missions, launchMission, completeMission, cloneMission, deleteMission } = useMissionStore();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortDir, setSortDir] = useState('desc');
  const [showSBOM, setShowSBOM] = useState(false);
  const [showSV2, setShowSV2] = useState(false);
  const [sbomData, setSbomData] = useState(null);
  const [sv2Data, setSv2Data] = useState(null);

  const handleGenerateSBOM = (mission) => {
    const deps = activeDeployments.filter(d => d.missionId === mission.id);
    setSbomData(generateSBOMFromMission(mission, deps));
    setShowSBOM(true);
  };

  const [sv2Mission, setSv2Mission] = useState(null);

  const handleGenerateSV2 = (mission) => {
    setSv2Mission(mission);
    setShowSV2(true);
  };

  const getMissionTypeColor = (template) => {
    const mission = ALL_MISSIONS.find(m => m.key === template);
    return mission?.color || '#6b7280';
  };

  const getMissionDomain = (template) => {
    const mission = ALL_MISSIONS.find(m => m.key === template);
    return mission?.domain || 'MARITIME';
  };

  const filteredMissions = missions
    .filter(m => filter === 'all' ? m.status !== 'archived' : m.status === filter)
    .sort((a, b) => {
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';
      return sortDir === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });

  const stats = {
    total: missions.filter(m => m.status !== 'archived').length,
    active: missions.filter(m => m.status === 'active').length,
    draft: missions.filter(m => m.status === 'draft').length,
    completed: missions.filter(m => m.status === 'completed').length
  };

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
  };

  return (
    <div className="card-accent">
      <div className="flex justify-between items-start mb-lg">
        <div>
          <h2 className="section-title">Mission Planner</h2>
          <p className="section-subtitle">Plan, deploy, and track autonomous missions</p>
        </div>
        <button onClick={onNewMission} className="btn-primary">
          <Plus size={16} /> New Mission
        </button>
      </div>

      <div className="stats-grid mb-lg">
        {[
          { label: 'Total Missions', value: stats.total, color: '#cbfd00' },
          { label: 'Active', value: stats.active, color: '#4ade80' },
          { label: 'Drafts', value: stats.draft, color: '#6b7280' },
          { label: 'Completed', value: stats.completed, color: '#06b6d4' }
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-sm mb-lg">
        {['all', 'active', 'draft', 'completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`filter-tab ${filter === f ? 'filter-tab-active' : ''}`}>
            {f} {f !== 'all' && `(${f === 'active' ? stats.active : f === 'draft' ? stats.draft : stats.completed})`}
          </button>
        ))}
      </div>

      <div className="data-table">
        <div className="data-table-header gap-sm" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1.5fr 180px' }}>
          <div onClick={() => handleSort('name')} className="cursor-pointer flex items-center gap-xs hover:text-gray-300 transition-colors">
            Mission Name {sortBy === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
          </div>
          <div onClick={() => handleSort('template')} className="cursor-pointer hover:text-gray-300 transition-colors">Type</div>
          <div onClick={() => handleSort('status')} className="cursor-pointer hover:text-gray-300 transition-colors">Status</div>
          <div>Squadron</div>
          <div>Zone</div>
          <div onClick={() => handleSort('updatedAt')} className="cursor-pointer hover:text-gray-300 transition-colors">
            Last Updated {sortBy === 'updatedAt' && (sortDir === 'asc' ? '↑' : '↓')}
          </div>
          <div>Actions</div>
        </div>

        <div className="overflow-y-auto max-h-96">
          {filteredMissions.length === 0 ? (
            <div className="p-16 text-center text-muted">
              <FileText size={48} className="mx-auto mb-md opacity-40" />
              <div className="text-base font-medium mb-sm">No missions found</div>
              <div className="text-sm">Create a new mission to get started</div>
            </div>
          ) : (
            filteredMissions.map((mission, idx) => {
              const missionType = ALL_MISSIONS.find(m => m.key === mission.template);
              const MissionIcon = missionType?.icon || Target;
              const domain = mission.domain || getMissionDomain(mission.template);
              const domainStyle = domainStyles[domain] || domainStyles.MARITIME;
              const DomainIcon = domainStyle.icon;
              return (
                <div key={mission.id} onClick={() => onSelectMission(mission)} className={`data-table-row gap-sm ${idx % 2 === 1 ? 'data-table-row-alt' : ''}`} style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1.5fr 180px' }}>
                  <div className="flex items-center gap-md">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${getMissionTypeColor(mission.template)}20` }}>
                      <MissionIcon size={18} color={getMissionTypeColor(mission.template)} />
                    </div>
                    <div>
                      <div className="text-gray-50 text-sm font-semibold">{mission.name}</div>
                      <div className="text-muted text-xs">ID: {mission.id.slice(-8)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-sm">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getMissionTypeColor(mission.template) }} />
                    <span className="text-secondary text-xs">{missionType?.name || mission.template}</span>
                    <DomainIcon size={10} style={{ color: domainStyle.color }} className="ml-1 opacity-60" />
                  </div>
                  <div>
                    <span className="badge-status" style={{ backgroundColor: getStatusBg(mission.status), color: getStatusColor(mission.status) }}>
                      {mission.status}
                    </span>
                  </div>
                  <div className="text-secondary text-xs">
                    {mission.assignedSquadrons?.length ? (
                      <div className="flex flex-col gap-xs">
                        {mission.assignedSquadrons.slice(0, 2).map(sId => {
                          const squadron = squadrons.find(s => s.id === sId);
                          return squadron ? (
                            <div key={sId} className="flex items-center gap-xs">
                              <Users size={12} className="text-muted" />
                              <span>{squadron.name.split(' ').slice(0, 2).join(' ')}</span>
                            </div>
                          ) : null;
                        })}
                        {mission.assignedSquadrons.length > 2 && <span className="text-muted text-xs">+{mission.assignedSquadrons.length - 2} more</span>}
                      </div>
                    ) : (
                      <span className="text-gray-600">No squadron</span>
                    )}
                  </div>
                  <div className="text-secondary text-sm">{mission.zoneConfig?.name || '-'}</div>
                  <div className="text-muted text-xs">{formatMissionDate(mission.updatedAt)}</div>
                  <div className="flex gap-sm" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleGenerateSBOM(mission)} title="Generate SBOM" className="px-2 py-1.5 bg-transparent border border-cyan-500/30 rounded text-cyan-500 text-xs cursor-pointer hover:bg-cyan-500/10 transition-colors">
                      <FileText size={12} />
                    </button>
                    <button onClick={() => handleGenerateSV2(mission)} title="Generate SV-2" className="px-2 py-1.5 bg-transparent border border-violet-500/30 rounded text-violet-500 text-xs cursor-pointer hover:bg-violet-500/10 transition-colors">
                      <GitBranch size={12} />
                    </button>
                    {mission.status === 'draft' && (
                      <>
                        <button onClick={() => launchMission(mission.id)} disabled={!mission.assignedSquadrons?.length} title={mission.assignedSquadrons?.length ? 'Launch mission' : 'Assign squadron first'} className={`px-2.5 py-1.5 rounded text-xs flex items-center gap-xs transition-colors ${mission.assignedSquadrons?.length ? 'bg-green-400/15 border border-green-400/30 text-green-400 cursor-pointer hover:bg-green-400/25' : 'bg-transparent border border-gray-600 text-gray-600 cursor-not-allowed'}`}>
                          <Play size={12} />
                        </button>
                        <button onClick={() => deleteMission(mission.id)} title="Delete" className="px-2.5 py-1.5 bg-transparent border border-red-500/30 rounded text-red-500 text-xs cursor-pointer hover:bg-red-500/15 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                    {mission.status === 'active' && (
                      <button onClick={() => completeMission(mission.id)} title="Complete mission" className="px-3 py-1.5 bg-cyan-500/15 border border-cyan-500/30 rounded text-cyan-500 text-xs cursor-pointer flex items-center gap-xs hover:bg-cyan-500/25 transition-colors">
                        <Check size={12} /> Complete
                      </button>
                    )}
                    {mission.status === 'completed' && (
                      <button onClick={() => cloneMission(mission.id)} title="Clone mission" className="px-3 py-1.5 bg-violet-500/15 border border-violet-500/30 rounded text-violet-500 text-xs cursor-pointer flex items-center gap-xs hover:bg-violet-500/25 transition-colors">
                        <Copy size={12} /> Clone
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SBOM Modal */}
      {showSBOM && sbomData && (
        <SBOMDisplay sbom={sbomData} onClose={() => setShowSBOM(false)} />
      )}

      {/* SV-2 Modal */}
      {showSV2 && (
        <SV2Editor activeConfig={null} hullName={sv2Mission?.name || ''} onClose={() => setShowSV2(false)} />
      )}
    </div>
  );
};
