/**
 * Create Version Modal
 *
 * Shown after a configuration save. Prompts for a commit message and optional tag.
 * Creates an immutable version snapshot in the version store.
 *
 * GIT ANALOGY: This is the `git commit` dialog.
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { X, GitCommit, Tag, Clock, Package, User } from 'lucide-react';
import useVersionStore from '../../store/versionStore';
import useSV2Store from '../../store/sv2Store';
import { computeChangelog, getChangeTypeColor } from '../../utils/versionDiff';

const CreateVersionModal = ({ configId, activeConfig, hullName, onClose }) => {
  const { createVersion, getLatestVersion } = useVersionStore();
  const { getCustomizations, getConfigKey } = useSV2Store();

  const [message, setMessage] = useState('');
  const [tag, setTag] = useState('');
  const [submittedBy, setSubmittedBy] = useState('');
  const [showTag, setShowTag] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Previous version for change detection
  const previousVersion = useMemo(() => getLatestVersion(configId), [configId, getLatestVersion]);

  const detectedChanges = useMemo(() => {
    if (!previousVersion || !activeConfig) return [];
    return computeChangelog(
      previousVersion.snapshot,
      { name: activeConfig.name, hullName, slots: activeConfig.slots || {}, softwareManifest: {} }
    );
  }, [previousVersion, activeConfig, hullName]);

  const suggestedMessage = useMemo(() => {
    if (detectedChanges.length === 0) return '';
    if (detectedChanges.length === 1) return `${detectedChanges[0].subject}: ${detectedChanges[0].detail}`;
    const added = detectedChanges.filter(c => c.type === 'CAPABILITY_ADDED');
    if (added.length === detectedChanges.length) return `Added ${added.map(c => c.subject).join(', ')}`;
    return `${detectedChanges.length} changes`;
  }, [detectedChanges]);

  const handleCreate = () => {
    const sv2Key = getConfigKey(activeConfig, hullName);
    const sv2Customizations = getCustomizations(sv2Key);
    const versionId = createVersion(
      configId, activeConfig, hullName,
      message || suggestedMessage || 'Configuration updated',
      tag || null, sv2Customizations
    );
    if (versionId) onClose(versionId, submittedBy.trim() || null, message || suggestedMessage || null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleCreate();
    if (e.key === 'Escape') onClose(null, null);
  };

  const versionCount = (useVersionStore.getState().versionHistory[configId] || []).length;

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10000 }}>
      <div className="card-accent" style={{ width: '480px', maxWidth: '90vw', borderColor: 'rgba(203, 253, 0, 0.3)' }} onKeyDown={handleKeyDown}>

        {/* Header */}
        <div className="flex items-center justify-between" style={{ padding: '14px 18px', borderBottom: '1px solid rgba(75, 85, 99, 0.3)' }}>
          <div className="flex items-center gap-2">
            <GitCommit size={18} className="text-lime-brand" />
            <h3 className="text-gray-100 font-bold text-base m-0">Save Version</h3>
          </div>
          <button onClick={() => onClose(null, null)} className="btn-ghost" style={{ padding: '4px', minHeight: 'auto' }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '14px 18px' }}>

          {/* Version info */}
          <div className="flex gap-3 mb-3" style={{ fontSize: '12px', color: '#9ca3af' }}>
            <span className="flex items-center gap-1">
              <Package size={12} /> {activeConfig?.name || 'Configuration'}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} /> Version #{versionCount + 1}
            </span>
          </div>

          {/* Detected changes */}
          {detectedChanges.length > 0 && (
            <div className="card-inner mb-3" style={{ padding: '10px 12px' }}>
              <div className="subsection-label" style={{ marginBottom: '6px' }}>Changes detected</div>
              {detectedChanges.slice(0, 5).map((change, i) => (
                <div key={i} className="flex items-center gap-2" style={{ marginBottom: '3px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: getChangeTypeColor(change.type), flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: '#d1d5db' }}>
                    <strong className="text-gray-100">{change.subject}</strong> — {change.detail}
                  </span>
                </div>
              ))}
              {detectedChanges.length > 5 && (
                <span style={{ fontSize: '11px', color: '#6b7280' }}>+{detectedChanges.length - 5} more</span>
              )}
            </div>
          )}

          {/* Commit message */}
          <div className="mb-3">
            <label className="subsection-label" style={{ marginBottom: '4px', display: 'block' }}>
              What changed?
            </label>
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={suggestedMessage || 'Describe this version...'}
              rows={2}
              style={{
                width: '100%', padding: '8px 10px', borderRadius: '6px',
                fontSize: '13px', fontFamily: 'inherit', resize: 'none', outline: 'none',
                lineHeight: '1.4', boxSizing: 'border-box',
                color: '#e5e7eb', backgroundColor: '#0f1419',
                border: '1px solid rgba(75, 85, 99, 0.4)'
              }}
            />
          </div>

          {/* Your name */}
          <div className="mb-3">
            <label className="subsection-label" style={{ marginBottom: '4px', display: 'block' }}>
              Your name (optional)
            </label>
            <div style={{ position: 'relative' }}>
              <User size={12} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', pointerEvents: 'none' }} />
              <input
                type="text"
                value={submittedBy}
                onChange={(e) => setSubmittedBy(e.target.value)}
                placeholder="e.g., Tiffany R."
                style={{
                  width: '100%', padding: '8px 10px 8px 28px', borderRadius: '6px',
                  fontSize: '13px', fontFamily: 'inherit', outline: 'none',
                  boxSizing: 'border-box', color: '#e5e7eb', backgroundColor: '#0f1419',
                  border: '1px solid rgba(75, 85, 99, 0.4)'
                }}
              />
            </div>
          </div>

          {/* Optional tag */}
          {showTag ? (
            <div className="mb-3">
              <label className="subsection-label" style={{ marginBottom: '4px', display: 'block' }}>
                Version tag (optional)
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="e.g., v3.2.1, pre-antx-refit"
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: '6px',
                  fontSize: '13px', fontFamily: 'ui-monospace, monospace', outline: 'none',
                  boxSizing: 'border-box', color: '#cbfd00', backgroundColor: '#0f1419',
                  border: '1px solid rgba(75, 85, 99, 0.4)'
                }}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowTag(true)}
              className="flex items-center gap-1 mb-3"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '12px', color: '#6b7280' }}
            >
              <Tag size={12} /> Add version tag
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between" style={{ padding: '10px 18px', borderTop: '1px solid rgba(75, 85, 99, 0.3)' }}>
          <span style={{ fontSize: '10px', color: '#4b5563' }}>⌘+Enter to save</span>
          <div className="flex gap-2">
            <button onClick={() => onClose(null, null)} className="btn-ghost" style={{ fontSize: '12px', padding: '6px 14px', minHeight: 'auto' }}>
              Skip
            </button>
            <button onClick={handleCreate} className="btn-primary" style={{ fontSize: '12px', padding: '6px 16px', minHeight: 'auto' }}>
              <GitCommit size={13} style={{ marginRight: '4px' }} /> Save Version
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateVersionModal;
