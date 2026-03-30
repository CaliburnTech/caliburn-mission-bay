/**
 * Version Diff Viewer
 *
 * Two-column comparison showing what changed between two versions.
 * Capability adds/removes, version bumps, SV-2 changes.
 *
 * GIT ANALOGY: `git diff commitA..commitB`
 */

import { ArrowRight, Plus, Minus, RefreshCw, GitBranch, ArrowUpRight } from 'lucide-react';
import useVersionStore from '../../store/versionStore';
import { getChangeTypeColor } from '../../utils/versionDiff';

const CHANGE_ICONS = {
  CAPABILITY_ADDED: Plus,
  CAPABILITY_REMOVED: Minus,
  CAPABILITY_MOVED: ArrowRight,
  SOFTWARE_VERSION_BUMP: ArrowUpRight,
  SOFTWARE_ADDED: Plus,
  SOFTWARE_REMOVED: Minus,
  SLOT_ADDED: Plus,
  SLOT_REMOVED: Minus,
  SV2_CHANGED: GitBranch,
  NAME_CHANGED: RefreshCw,
  HULL_CHANGED: RefreshCw
};

const CHANGE_LABELS = {
  CAPABILITY_ADDED: 'Added',
  CAPABILITY_REMOVED: 'Removed',
  CAPABILITY_MOVED: 'Moved',
  SOFTWARE_VERSION_BUMP: 'Updated',
  SOFTWARE_ADDED: 'New dependency',
  SOFTWARE_REMOVED: 'Removed dependency',
  SLOT_ADDED: 'Slots added',
  SLOT_REMOVED: 'Slots removed',
  SV2_CHANGED: 'Architecture changed',
  NAME_CHANGED: 'Renamed',
  HULL_CHANGED: 'Hull changed'
};

const VersionDiffViewer = ({ versionIdA, versionIdB, onClose }) => {
  const changelog = useVersionStore(s => s.getChangelog(versionIdA, versionIdB));
  const versionA = useVersionStore(s => s.versions[versionIdA]);
  const versionB = useVersionStore(s => s.versions[versionIdB]);

  if (!versionA || !versionB) {
    return (
      <div className="card-inner p-6 text-center">
        <p className="text-gray-500 text-sm">Select two versions to compare</p>
      </div>
    );
  }

  // Group changes by type
  const grouped = {};
  changelog.forEach(change => {
    const group = change.type.includes('CAPABILITY') ? 'Capabilities'
      : change.type.includes('SOFTWARE') ? 'Software'
      : change.type.includes('SLOT') ? 'Slots'
      : 'Other';
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(change);
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3" style={{ fontSize: '12px', color: '#9ca3af' }}>
        <VersionLabel version={versionA} />
        <ArrowRight size={14} className="text-gray-600" />
        <VersionLabel version={versionB} />
        {onClose && (
          <button onClick={onClose} className="ml-auto text-gray-600 text-xs cursor-pointer" style={{ background: 'none', border: 'none' }}>
            Clear comparison
          </button>
        )}
      </div>

      {changelog.length === 0 ? (
        <div className="card-inner p-4 text-center">
          <p className="text-gray-500 text-sm">No differences detected</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Summary */}
          <div className="flex gap-2 flex-wrap">
            {changelog.filter(c => c.type === 'CAPABILITY_ADDED').length > 0 && (
              <CountBadge count={changelog.filter(c => c.type === 'CAPABILITY_ADDED').length} label="added" color="#22c55e" />
            )}
            {changelog.filter(c => c.type === 'CAPABILITY_REMOVED').length > 0 && (
              <CountBadge count={changelog.filter(c => c.type === 'CAPABILITY_REMOVED').length} label="removed" color="#ef4444" />
            )}
            {changelog.filter(c => c.type === 'SOFTWARE_VERSION_BUMP').length > 0 && (
              <CountBadge count={changelog.filter(c => c.type === 'SOFTWARE_VERSION_BUMP').length} label="updated" color="#f97316" />
            )}
          </div>

          {/* Grouped changes */}
          {Object.entries(grouped).map(([group, changes]) => (
            <div key={group}>
              <div className="subsection-label mb-1">{group}</div>
              <div className="card-inner" style={{ padding: 0, overflow: 'hidden' }}>
                {changes.map((change, i) => {
                  const Icon = CHANGE_ICONS[change.type] || RefreshCw;
                  const color = getChangeTypeColor(change.type);
                  return (
                    <div key={i} className="flex items-center gap-2 px-3 py-2" style={{
                      borderBottom: i < changes.length - 1 ? '1px solid rgba(75, 85, 99, 0.15)' : 'none'
                    }}
                    >
                      <Icon size={12} style={{ color, flexShrink: 0 }} />
                      <span className="text-gray-200 text-xs font-medium flex-1">{change.subject}</span>
                      <span style={{ fontSize: '10px', color: '#9ca3af' }}>{change.detail}</span>
                      <span style={{
                        fontSize: '9px', fontWeight: 600, color, backgroundColor: `${color}15`,
                        padding: '1px 6px', borderRadius: '3px'
                      }}
                      >
                        {CHANGE_LABELS[change.type] || change.type}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const VersionLabel = ({ version }) => (
  <span className="inline-flex items-center gap-1" style={{
    fontSize: '11px', fontFamily: 'monospace', color: '#d1d5db',
    backgroundColor: 'rgba(75, 85, 99, 0.2)', padding: '2px 8px', borderRadius: '4px'
  }}
  >
    {version.tag || version.id.slice(-8)}
  </span>
);

const CountBadge = ({ count, label, color }) => (
  <span style={{
    fontSize: '11px', fontWeight: 600, color,
    backgroundColor: `${color}15`, padding: '2px 8px', borderRadius: '4px'
  }}
  >
    {count} {label}
  </span>
);

export default VersionDiffViewer;
