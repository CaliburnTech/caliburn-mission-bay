/**
 * Version Timeline
 *
 * Vertical commit log for a configuration. Shows version history with
 * messages, tags, timestamps. Click to select, shift-click to compare.
 *
 * GIT ANALOGY: `git log --oneline --graph`
 */

import { GitCommit, Tag, Clock, ChevronRight, Diff } from 'lucide-react';
import useVersionStore from '../../store/versionStore';

const VersionTimeline = ({ configId, onSelectVersion, onCompareVersions, selectedVersionId }) => {
  const versions = useVersionStore(s => {
    const ids = s.versionHistory[configId] || [];
    return ids.map(id => s.versions[id]).filter(Boolean);
  });

  if (versions.length === 0) {
    return (
      <div className="text-center p-8">
        <GitCommit size={32} className="mx-auto mb-3 opacity-30 text-gray-500" />
        <p className="text-gray-500 text-sm">No versions saved yet</p>
        <p className="text-gray-600 text-xs mt-1">Save a configuration to start tracking versions</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0">
      {versions.map((version, idx) => {
        const isSelected = version.id === selectedVersionId;
        const isLatest = idx === 0;
        const date = new Date(version.createdAt);
        const timeStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
          ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        return (
          <div key={version.id} className="flex gap-3" style={{ minHeight: '56px' }}>
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center" style={{ width: '20px', flexShrink: 0 }}>
              <div style={{
                width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0,
                backgroundColor: isLatest ? '#cbfd00' : isSelected ? '#3b82f6' : '#4b5563',
                border: isSelected ? '2px solid #60a5fa' : '2px solid transparent'
              }}
              />
              {idx < versions.length - 1 && (
                <div style={{ width: '2px', flex: 1, backgroundColor: '#374151', minHeight: '20px' }} />
              )}
            </div>

            {/* Version card */}
            <div
              onClick={() => onSelectVersion?.(version)}
              className="flex-1 cursor-pointer rounded-lg p-2.5 mb-1 transition-colors"
              style={{
                backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                border: isSelected ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent'
              }}
            >
              {/* Tag badge */}
              {version.tag && (
                <span className="inline-flex items-center gap-1 mb-1" style={{
                  fontSize: '10px', fontWeight: 700, color: '#cbfd00', backgroundColor: 'rgba(203, 253, 0, 0.1)',
                  padding: '1px 6px', borderRadius: '3px', border: '1px solid rgba(203, 253, 0, 0.2)',
                  fontFamily: 'monospace'
                }}
                >
                  <Tag size={8} /> {version.tag}
                </span>
              )}

              {/* Message */}
              <div className="text-gray-200 text-xs font-medium" style={{ lineHeight: '1.4' }}>
                {version.message}
              </div>

              {/* Meta */}
              <div className="flex items-center gap-3 mt-1" style={{ fontSize: '10px', color: '#6b7280' }}>
                <span className="flex items-center gap-1">
                  <Clock size={9} /> {timeStr}
                </span>
                {version.snapshot?.equippedCount !== undefined && (
                  <span>{version.snapshot.equippedCount} capabilities</span>
                )}
                {isLatest && (
                  <span style={{ color: '#cbfd00', fontWeight: 600 }}>LATEST</span>
                )}
              </div>
            </div>

            {/* Compare button (show when a version is selected and this isn't it) */}
            {selectedVersionId && !isSelected && onCompareVersions && (
              <button
                onClick={(e) => { e.stopPropagation(); onCompareVersions(selectedVersionId, version.id); }}
                title="Compare with selected"
                className="self-center"
                style={{
                  padding: '4px 6px', backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '4px',
                  color: '#a78bfa', fontSize: '9px', cursor: 'pointer', flexShrink: 0
                }}
              >
                <Diff size={12} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default VersionTimeline;
