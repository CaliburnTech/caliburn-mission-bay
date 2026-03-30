/**
 * Version Control View
 *
 * Top-level tab view showing fleet-wide version management.
 * Left: squadron/config selector + version timeline
 * Right: version detail panel OR diff viewer OR fleet status board
 *
 * Also accessible inline from LoadoutBuilder (version history per config).
 */

import { useState, useMemo } from 'react';
import { GitCommit, Ship, Users, Clock, History, Diff, ShieldCheck } from 'lucide-react';
import useVersionStore from '../store/versionStore';
import useConfigurationStore from '../store/configurationStore';
import { swarmSquadrons } from '../data/fleetData';
import useDataStore from '../providers/dataStore';
import VersionTimeline from './versions/VersionTimeline';
import VersionDetailPanel from './versions/VersionDetailPanel';
import VersionDiffViewer from './versions/VersionDiffViewer';
import FleetStatusBoard from './versions/FleetStatusBoard';

const VersionControlView = () => {
  const dataStore = useDataStore();
  const savedConfigurations = useConfigurationStore(s => s.savedConfigurations);
  const totalVersions = useVersionStore(s => s.getTotalVersionCount());

  // UI state
  const [selectedSquadronId, setSelectedSquadronId] = useState(null);
  const [selectedConfigId, setSelectedConfigId] = useState(null);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [comparisonVersionIds, setComparisonVersionIds] = useState(null); // [idA, idB]
  const [rightPanel, setRightPanel] = useState('detail'); // 'detail' | 'diff' | 'fleet'

  // Get configs, optionally filtered by squadron
  const configs = useMemo(() => {
    return Object.values(savedConfigurations).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }, [savedConfigurations]);

  // Selected version object
  const selectedVersion = useVersionStore(s => selectedVersionId ? s.versions[selectedVersionId] : null);

  const handleSelectVersion = (version) => {
    setSelectedVersionId(version.id);
    setRightPanel('detail');
    setComparisonVersionIds(null);
  };

  const handleCompareVersions = (idA, idB) => {
    setComparisonVersionIds([idA, idB]);
    setRightPanel('diff');
  };

  return (
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
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '16px', minHeight: '500px' }}>

          {/* Left: Config selector + Timeline */}
          <div className="flex flex-col gap-3">
            {/* Config selector */}
            <div>
              <div className="subsection-label mb-1">Configuration</div>
              <div className="flex flex-col gap-1">
                {configs.length === 0 ? (
                  <div className="card-inner p-4 text-center">
                    <p className="text-gray-600 text-xs">No saved configurations yet</p>
                  </div>
                ) : (
                  configs.map(config => (
                    <button
                      key={config.id}
                      onClick={() => { setSelectedConfigId(config.id); setSelectedVersionId(null); setComparisonVersionIds(null); }}
                      className="text-left p-2 rounded-lg cursor-pointer transition-colors"
                      style={{
                        backgroundColor: selectedConfigId === config.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                        border: selectedConfigId === config.id ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(75, 85, 99, 0.2)'
                      }}
                    >
                      <div className="text-gray-200 text-xs font-semibold">{config.name || 'Untitled'}</div>
                      <div style={{ fontSize: '10px', color: '#6b7280' }}>
                        {config.hullName} • {new Date(config.updatedAt).toLocaleDateString()}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Timeline */}
            {selectedConfigId && (
              <div>
                <div className="subsection-label mb-1">Version History</div>
                <div className="card-inner" style={{ padding: '8px', maxHeight: '400px', overflow: 'auto' }}>
                  <VersionTimeline
                    configId={selectedConfigId}
                    selectedVersionId={selectedVersionId}
                    onSelectVersion={handleSelectVersion}
                    onCompareVersions={handleCompareVersions}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right: Detail or Diff */}
          <div className="card-inner" style={{ padding: 0, overflow: 'hidden' }}>
            {rightPanel === 'diff' && comparisonVersionIds ? (
              <div style={{ padding: '12px' }}>
                <VersionDiffViewer
                  versionIdA={comparisonVersionIds[0]}
                  versionIdB={comparisonVersionIds[1]}
                  onClose={() => { setComparisonVersionIds(null); setRightPanel('detail'); }}
                />
              </div>
            ) : selectedVersionId ? (
              <VersionDetailPanel version={selectedVersion} />
            ) : (
              <div className="flex items-center justify-center h-full p-8">
                <div className="text-center">
                  <GitCommit size={32} className="mx-auto mb-3 opacity-20 text-gray-500" />
                  <p className="text-gray-500 text-sm">
                    {selectedConfigId ? 'Select a version from the timeline' : 'Select a configuration to view its history'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionControlView;
