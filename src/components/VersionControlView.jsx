/**
 * Version Control View
 *
 * Top-level tab view showing fleet-wide version management.
 * Left: squadron/config selector + version timeline
 * Right: version detail panel OR diff viewer OR fleet status board
 *
 * Also accessible inline from LoadoutBuilder (version history per config).
 */

import { useState, useMemo, useEffect } from 'react';
import { GitCommit, Ship, Users, Clock, History, Layers, Package, X, Download, Trash2 } from 'lucide-react';
import useVersionStore from '../store/versionStore';
import useConfigurationStore from '../store/configurationStore';
import useOutfitterStore from '../store/outfitterStore';
import useNavigationStore from '../store/navigationStore';
import { swarmSquadrons } from '../data/fleetData';
import { vesselHullData, vesselHullComponents } from '../data/vesselData';
import useDataStore from '../providers/dataStore';
import VersionTimeline from './versions/VersionTimeline';
import VersionDetailPanel from './versions/VersionDetailPanel';
import VersionDiffViewer from './versions/VersionDiffViewer';
import FleetStatusBoard from './versions/FleetStatusBoard';
import SBOMDisplay from './shared/SBOMDisplay';
import MermaidDiagram from './shared/MermaidDiagram';

/** Shown when a config is selected but has no saved versions yet */
const ConfigNoVersionPanel = ({ config }) => {
  if (!config) return null;
  return (
    <div className="flex flex-col gap-3 p-3 overflow-auto h-full">
      <div className="card-inner" style={{ padding: '10px 12px' }}>
        <div className="flex items-center gap-2 mb-1">
          <Package size={14} className="text-lime-brand" />
          <span className="text-gray-200 text-sm font-semibold">{config.name || 'Untitled'}</span>
        </div>
        <div className="flex gap-3 mt-1" style={{ fontSize: '10px', color: '#6b7280' }}>
          <span className="flex items-center gap-1"><Clock size={9} /> {config.updatedAt ? new Date(config.updatedAt).toLocaleString() : '—'}</span>
          <span className="flex items-center gap-1"><Layers size={9} /> {config.hullName || 'Unknown hull'}</span>
        </div>
        {config.submitted_by && (
          <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>Saved by: {config.submitted_by}</div>
        )}
      </div>
      {config.slots && Object.keys(config.slots).length > 0 && (
        <div>
          <div className="subsection-label mb-1">Equipped Capabilities</div>
          <div className="card-inner" style={{ padding: '8px 10px' }}>
            {Object.entries(config.slots).map(([cat, slots]) => {
              const equipped = (slots || []).filter(Boolean);
              if (equipped.length === 0) return null;
              return (
                <div key={cat} className="mb-2 last:mb-0">
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>{cat}</div>
                  {equipped.map((name, i) => (
                    <div key={i} className="flex items-center gap-1.5" style={{ fontSize: '11px', color: '#d1d5db', padding: '1px 0' }}>
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#cbfd00', flexShrink: 0 }} />
                      {name}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="card-inner" style={{ padding: '8px 12px' }}>
        <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>
          No version history yet. Re-save this configuration from the Loadout Builder to start tracking versions.
        </p>
      </div>
    </div>
  );
};

const VersionControlView = () => {
  const _dataStore = useDataStore();
  const savedConfigurations = useConfigurationStore(s => s.savedConfigurations);
  const loadFromVersionSnapshot = useConfigurationStore(s => s.loadFromVersionSnapshot);
  const deleteConfiguration = useConfigurationStore(s => s.deleteConfiguration);
  const { setSelectedView } = useNavigationStore();
  const { setSelectedHull } = useOutfitterStore();
  const totalVersions = useVersionStore(s => s.getTotalVersionCount());

  // Server-side configs fetched from backend
  const [serverConfigs, setServerConfigs] = useState([]);

  // Fetch server configs on mount — best-effort, don't block UI if offline
  useEffect(() => {
    const dataStoreState = useDataStore.getState();
    dataStoreState.getConfigs().then((results) => {
      if (Array.isArray(results)) setServerConfigs(results);
    }).catch(() => {
      // Best-effort — swallow silently if backend is unreachable
    });
  }, []);

  // UI state
  const [selectedSquadronId, setSelectedSquadronId] = useState(null);
  const [selectedConfigId, setSelectedConfigId] = useState(null);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [comparisonVersionIds, setComparisonVersionIds] = useState(null); // [idA, idB]
  const [rightPanel, setRightPanel] = useState('detail'); // 'detail' | 'diff' | 'fleet'

  // Modal state
  const [sbomModalData, setSbomModalData] = useState(null);   // opens SBOMDisplay
  const [sv2ModalSource, setSv2ModalSource] = useState(null); // opens SV-2 viewer

  // Merge localStorage configs with server configs for display.
  // Server configs take precedence when the same id exists in both.
  const configs = useMemo(() => {
    const localList = Object.values(savedConfigurations);
    const localById = Object.fromEntries(localList.map(c => [c.id, c]));
    // Normalize server config shape to match local config shape
    const serverById = {};
    serverConfigs.forEach(sc => {
      serverById[sc.id] = {
        id: sc.id,
        name: sc.name,
        hullName: sc.configData?.hullName || '',
        slots: sc.configData?.slots || {},
        submitted_by: sc.submittedBy || null,
        createdAt: sc.createdAt ? new Date(sc.createdAt).getTime() : 0,
        updatedAt: sc.updatedAt ? new Date(sc.updatedAt).getTime() : 0,
        _fromServer: true,
      };
    });
    // Merge: server wins on collision
    const merged = { ...localById, ...serverById };
    return Object.values(merged).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }, [savedConfigurations, serverConfigs]);

  // Latest version ID for selected config — stable (returns a string, not an array)
  const latestVersionIdForConfig = useVersionStore(s => {
    if (!selectedConfigId) return null;
    const history = s.versionHistory[selectedConfigId] || [];
    return history[0] || null;
  });

  // Effective version to display: explicit selection, or fall back to latest for config
  const effectiveVersionId = selectedVersionId || latestVersionIdForConfig;
  const selectedVersion = useVersionStore(s => effectiveVersionId ? s.versions[effectiveVersionId] : null);

  // Selected config object (for showing data when no versions exist)
  const selectedConfig = useMemo(() => configs.find(c => c.id === selectedConfigId) || null, [configs, selectedConfigId]);

  const handleSelectVersion = (version) => {
    setSelectedVersionId(version.id);
    setRightPanel('detail');
    setComparisonVersionIds(null);
  };

  const handleCompareVersions = (idA, idB) => {
    setComparisonVersionIds([idA, idB]);
    setRightPanel('diff');
  };

  const handleEdit = () => {
    if (!selectedVersion) return;
    loadFromVersionSnapshot(selectedVersion);
    // LoadoutBuilder requires selectedHull to be set — look it up by hullName from snapshot
    const hullName = selectedVersion.snapshot?.hullName;
    if (hullName) {
      const ds = useDataStore.getState();
      const allVessels = ds.isReady && ds.vessels?.length ? ds.vessels : vesselHullData;
      const hull = allVessels.find(v => v.name === hullName);
      if (hull) setSelectedHull(hull);
    }
    setSelectedView('outfitter');
  };

  const handleDeleteConfig = (configId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this configuration and all its version history?')) return;
    // Wipe version history + orphaned version objects for this config
    useVersionStore.setState(s => {
      const idsToRemove = new Set(s.versionHistory[configId] || []);
      const newVersions = { ...s.versions };
      idsToRemove.forEach(id => delete newVersions[id]);
      const newHistory = { ...s.versionHistory };
      delete newHistory[configId];
      return { versions: newVersions, versionHistory: newHistory };
    });
    deleteConfiguration(configId);
    setServerConfigs(prev => prev.filter(sc => sc.id !== configId));
    if (selectedConfigId === configId) {
      setSelectedConfigId(null);
      setSelectedVersionId(null);
    }
  };

  const handleShowSBOM = () => {
    const sbom = selectedVersion?.snapshot?.sbomSnapshot;
    if (sbom) setSbomModalData(sbom);
  };

  const handleShowSV2 = () => {
    const src = selectedVersion?.snapshot?.sv2Snapshot?.mermaidSource;
    if (src) setSv2ModalSource(src);
  };

  const handleDownloadSV2 = () => {
    if (!sv2ModalSource) return;
    const blob = new Blob([sv2ModalSource], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sv2-${selectedVersion?.snapshot?.name || 'config'}-${Date.now()}.mmd`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
    <div className="card-accent">
      {/* Header */}
      <div className="flex justify-between items-start mb-lg">
        <div>
          <h2 className="section-title">Version Control</h2>
          <p className="section-subtitle">Track configuration versions, fleet deployment state, and changes over time</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="stat-card" style={{ padding: '8px 16px' }}>
            <div className="stat-value" style={{ fontSize: '20px' }}>{totalVersions}</div>
            <div className="stat-label">Total Versions</div>
          </div>
          <div className="stat-card" style={{ padding: '8px 16px' }}>
            <div className="stat-value" style={{ fontSize: '20px' }}>{configs.length}</div>
            <div className="stat-label">Configurations</div>
          </div>
        </div>
      </div>

      {/* Tab bar: Timeline / Fleet Status */}
      <div className="flex gap-sm mb-lg">
        <button
          onClick={() => setRightPanel('detail')}
          className={`filter-tab ${rightPanel === 'detail' || rightPanel === 'diff' ? 'filter-tab-active' : ''}`}
        >
          <History size={14} style={{ marginRight: '4px' }} /> Version History
        </button>
        <button
          onClick={() => setRightPanel('fleet')}
          className={`filter-tab ${rightPanel === 'fleet' ? 'filter-tab-active' : ''}`}
        >
          <Ship size={14} style={{ marginRight: '4px' }} /> Fleet Status
        </button>
      </div>

      {rightPanel === 'fleet' ? (
        /* ── Fleet Status Mode ── */
        <div>
          <div className="flex gap-2 mb-3 flex-wrap">
            {swarmSquadrons.map(sq => (
              <button
                key={sq.id}
                onClick={() => setSelectedSquadronId(sq.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  selectedSquadronId === sq.id
                    ? 'bg-lime-brand/15 border border-lime-brand/30 text-lime-brand'
                    : 'bg-transparent border border-gray-600/30 text-gray-400'
                }`}
              >
                {sq.name}
              </button>
            ))}
          </div>
          {selectedSquadronId ? (
            <FleetStatusBoard
              squadronId={selectedSquadronId}
              squadronName={swarmSquadrons.find(s => s.id === selectedSquadronId)?.name}
            />
          ) : (
            <div className="card-inner p-8 text-center">
              <Users size={28} className="mx-auto mb-2 opacity-30 text-gray-500" />
              <p className="text-gray-500 text-sm">Select a squadron to view fleet status</p>
            </div>
          )}
        </div>
      ) : (
        /* ── Version History Mode ── */
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', minHeight: '500px' }}>

          {/* Left: Config list with boat thumbnails */}
          <div className="flex flex-col gap-1" style={{ overflowY: 'auto', maxHeight: '75vh' }}>
            <div className="subsection-label mb-1">Configurations ({configs.length})</div>
            {configs.length === 0 ? (
              <div className="card-inner p-4 text-center">
                <p className="text-gray-600 text-xs">No saved configurations yet</p>
              </div>
            ) : (
              configs.map(config => {
                const HullSvg = vesselHullComponents[config.hullName] || null;
                const isSelected = selectedConfigId === config.id;
                return (
                  <div key={config.id} className="relative group">
                    <button
                      onClick={() => { setSelectedConfigId(config.id); setSelectedVersionId(null); setComparisonVersionIds(null); setRightPanel('detail'); }}
                      className="text-left w-full rounded-lg cursor-pointer transition-colors pr-7 overflow-hidden"
                      style={{
                        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(17,24,32,0.4)',
                        border: isSelected ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(75, 85, 99, 0.2)',
                        display: 'flex', alignItems: 'stretch',
                      }}
                    >
                      {/* Boat thumbnail */}
                      {HullSvg && (
                        <div
                          style={{
                            width: '56px', flexShrink: 0,
                            backgroundColor: isSelected ? 'rgba(59,130,246,0.08)' : 'rgba(75,85,99,0.1)',
                            borderRight: '1px solid rgba(75,85,99,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '6px',
                          }}
                        >
                          <HullSvg size={40} />
                        </div>
                      )}
                      <div style={{ padding: '8px 10px', flex: 1, minWidth: 0 }}>
                        <div className="text-gray-200 font-semibold truncate" style={{ fontSize: '12px' }}>
                          {config.name || 'Untitled'}
                        </div>
                        <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '1px' }}>
                          {config.hullName} • {config.updatedAt ? new Date(config.updatedAt).toLocaleDateString() : '—'}
                        </div>
                        {config.submitted_by && (
                          <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '1px' }}>
                            {config.submitted_by}
                          </div>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={(e) => handleDeleteConfig(config.id, e)}
                      title="Delete configuration"
                      className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ padding: '3px', borderRadius: '4px', border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Timeline on top, detail below */}
          <div className="flex flex-col gap-3" style={{ minHeight: 0 }}>
            {selectedConfigId ? (
              <>
                {/* Version Timeline — always visible when config selected */}
                <div className="card-inner" style={{ padding: '8px 10px', flexShrink: 0 }}>
                  <div className="subsection-label mb-2" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <History size={11} /> Version History
                  </div>
                  <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                    <VersionTimeline
                      configId={selectedConfigId}
                      selectedVersionId={effectiveVersionId}
                      onSelectVersion={handleSelectVersion}
                      onCompareVersions={handleCompareVersions}
                    />
                  </div>
                </div>

                {/* Detail / Diff panel */}
                <div className="card-inner" style={{ padding: 0, overflow: 'hidden', flex: 1 }}>
                  {rightPanel === 'diff' && comparisonVersionIds ? (
                    <div style={{ padding: '12px' }}>
                      <VersionDiffViewer
                        versionIdA={comparisonVersionIds[0]}
                        versionIdB={comparisonVersionIds[1]}
                        onClose={() => { setComparisonVersionIds(null); setRightPanel('detail'); }}
                      />
                    </div>
                  ) : effectiveVersionId ? (
                    <VersionDetailPanel
                      version={selectedVersion}
                      onEdit={handleEdit}
                      onShowSBOM={selectedVersion?.snapshot?.sbomSnapshot ? handleShowSBOM : undefined}
                      onShowSV2={selectedVersion?.snapshot?.sv2Snapshot?.mermaidSource ? handleShowSV2 : undefined}
                    />
                  ) : (
                    /* Config selected, no versions yet */
                    <ConfigNoVersionPanel config={selectedConfig} />
                  )}
                </div>
              </>
            ) : (
              <div className="card-inner flex items-center justify-center" style={{ flex: 1 }}>
                <div className="text-center">
                  <GitCommit size={32} className="mx-auto mb-3 opacity-20 text-gray-500" />
                  <p className="text-gray-500 text-sm">Select a configuration to view its history</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>

      {/* SBOM Modal */}
      {sbomModalData && (
        <SBOMDisplay sbom={sbomModalData} onClose={() => setSbomModalData(null)} />
      )}

      {/* SV-2 Diagram Modal */}
      {sv2ModalSource && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 10000 }}>
          <div className="card-accent flex flex-col" style={{ width: '90vw', maxWidth: '1100px', height: '85vh' }}>
            <div className="flex items-center justify-between" style={{ padding: '12px 16px', borderBottom: '1px solid rgba(75,85,99,0.3)', flexShrink: 0 }}>
              <span className="text-gray-100 font-semibold text-sm">SV-2 Architecture Diagram</span>
              <div className="flex items-center gap-2">
                <button onClick={handleDownloadSV2} className="flex items-center gap-1 btn-ghost" style={{ fontSize: '12px', padding: '4px 10px', minHeight: 'auto' }}>
                  <Download size={13} /> Download .mmd
                </button>
                <button onClick={() => setSv2ModalSource(null)} className="btn-ghost" style={{ padding: '4px', minHeight: 'auto' }}>
                  <X size={16} />
                </button>
              </div>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
              <MermaidDiagram diagram={sv2ModalSource} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VersionControlView;
