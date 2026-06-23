/**
 * SV-2 Diagram Editor
 *
 * Three-panel layout:
 *   Left:   Monaco editor with Mermaid source (the source of truth)
 *   Center: Live Mermaid diagram preview
 *   Right:  AI Chat panel (Claude) for conversational diagram editing
 *
 * Mermaid source is the single source of truth.
 * Visual preview renders from it. AI chat modifies it.
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { X, Download, Cpu, Copy, Check, PanelLeftClose, Sparkles, Save, AlertTriangle, GitCommit } from 'lucide-react';
import MermaidDiagram from './MermaidDiagram';
import AIChat from './AIChat';
import CreateVersionModal from './CreateVersionModal';
import { resolveSV2 } from '../../utils/sv2AutoGenerator';
import { sv2DataToFlowchart, mergeWithEngineerAdditions, hasAutoSectionChanged, ENGINEER_MARKER } from '../../utils/sv2MermaidGenerator';
import useSV2Store from '../../store/sv2Store';
import useConfigurationStore, { CATEGORY_KEYS } from '../../store/configurationStore';

const SV2Editor = ({ activeConfig, hullName, onClose }) => {
  const { getConfigKey, saveCustomizations, getCustomizations } = useSV2Store();

  // Generate fresh Mermaid from current config
  const sv2Data = useMemo(() => resolveSV2(activeConfig, hullName), [activeConfig, hullName]);
  const generatedMermaid = useMemo(() => {
    if (!sv2Data) return '%% No diagram data';
    return sv2DataToFlowchart(sv2Data);
  }, [sv2Data]);

  // Load saved source (with engineer additions) or use generated
  const [mermaidSource, setMermaidSource] = useState('');
  const [configChanged, setConfigChanged] = useState(false);
  const initializedRef = useRef(false);

  // On mount: load saved Mermaid (with engineer edits) or use fresh generation
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const configKey = getConfigKey(activeConfig, hullName);
    const saved = getCustomizations(configKey);

    if (saved?.mermaidSource) {
      // We have a saved version with possible engineer additions
      // Check if the config has changed since the save
      if (hasAutoSectionChanged(generatedMermaid, saved.mermaidSource)) {
        // Config changed — merge: new auto section + preserved engineer additions
        const merged = mergeWithEngineerAdditions(generatedMermaid, saved.mermaidSource);
        setMermaidSource(merged);
        setConfigChanged(true);
      } else {
        // Config hasn't changed — use saved as-is
        setMermaidSource(saved.mermaidSource);
      }
    } else {
      // No saved version — use fresh generation
      setMermaidSource(generatedMermaid);
    }
  }, [generatedMermaid, activeConfig, hullName, getConfigKey, getCustomizations]);

  // Track user edits
  const handleSourceChange = useCallback((value) => {
    setMermaidSource(value || '');
    setConfigChanged(false); // dismiss notification once they edit
  }, []);

  // Accept merge (dismiss notification)
  const handleAcceptMerge = useCallback(() => {
    setConfigChanged(false);
  }, []);

  // Reject merge — regenerate fresh, discarding engineer additions
  const handleRegenerate = useCallback(() => {
    setMermaidSource(generatedMermaid);
    setConfigChanged(false);
  }, [generatedMermaid]);

  // Panel visibility
  const [showCode, setShowCode] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [copied, setCopied] = useState(false);

  // AI chat applies modified mermaid
  const handleAIApply = useCallback((newMermaid) => {
    setMermaidSource(newMermaid);
  }, []);

  // Versioning + capability removal detection
  const { activeConfig: currentConfig, setSlotCapability, saveActiveConfiguration } = useConfigurationStore();
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [removedCaps, setRemovedCaps] = useState(null); // { capName, category, slotIndex }[]

  /**
   * Detect capabilities that were in the auto-generated section but are no longer
   * present in the current Mermaid source. These are candidates for removal from config.
   */
  const detectRemovedCapabilities = useCallback(() => {
    if (!activeConfig?.slots) return [];

    const removed = [];
    // Check each equipped capability — is its sanitized ID still in the Mermaid source?
    CATEGORY_KEYS.forEach(category => {
      (activeConfig.slots[category] || []).forEach((capName, slotIndex) => {
        if (!capName) return;
        // The auto-generator creates node IDs like cap_SENSORS_0, cap_COMMS_1, etc.
        const nodeId = `cap_${category}_${slotIndex}`;
        // Also check for the capability name itself (in case of template-generated IDs)
        const sanitizedName = capName.replace(/[^a-zA-Z0-9_]/g, '_');
        if (!mermaidSource.includes(nodeId) && !mermaidSource.includes(sanitizedName) && !mermaidSource.includes(capName)) {
          removed.push({ capName, category, slotIndex });
        }
      });
    });

    return removed;
  }, [activeConfig, mermaidSource]);

  // Persist Mermaid source and open version modal
  const doPersistAndVersion = () => {
    // Save the config first if it hasn't been saved yet (needs an id for versioning)
    if (!activeConfig?.id) {
      saveActiveConfiguration();
    }
    const configKey = getConfigKey(activeConfig, hullName);
    saveCustomizations(configKey, { mermaidSource, updatedAt: Date.now() });
    setShowVersionModal(true);
  };

  // Save: detect removals, confirm if needed, create version
  const handleSave = () => {
    const removed = detectRemovedCapabilities();
    if (removed.length > 0) {
      setRemovedCaps(removed);
    } else {
      doPersistAndVersion();
    }
  };

  // Confirm capability removal and proceed to version
  const handleConfirmRemovals = () => {
    if (removedCaps) {
      removedCaps.forEach(({ category, slotIndex }) => {
        setSlotCapability(category, slotIndex, null);
      });
    }
    setRemovedCaps(null);
    doPersistAndVersion();
  };

  // Skip removals (keep capabilities, just save the diagram)
  const handleSkipRemovals = () => {
    setRemovedCaps(null);
    doPersistAndVersion();
  };

  // Copy mermaid source
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(mermaidSource);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [mermaidSource]);

  // Export as .mmd file
  const handleExport = useCallback(() => {
    const blob = new Blob([mermaidSource], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `sv2-${sv2Data?.name || 'diagram'}.mmd`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [mermaidSource, sv2Data]);

  // Save on close
  const handleClose = useCallback(() => {
    if (mermaidSource !== generatedMermaid) {
      const configKey = getConfigKey(activeConfig, hullName);
      saveCustomizations(configKey, {
        mermaidSource,
        updatedAt: Date.now()
      });
    }
    onClose();
  }, [mermaidSource, generatedMermaid, activeConfig, hullName, onClose, getConfigKey, saveCustomizations]);

  if (!sv2Data) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999 }}>
        <div style={{ backgroundColor: 'var(--caliburn-darker)', border: '2px solid rgba(203, 253, 0, 0.3)', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
          <p style={{ color: '#e5e7eb', fontSize: '16px' }}>No SV-2 data available.</p>
          <button onClick={onClose} className="btn-primary" style={{ marginTop: '12px' }}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999 }}>
      <div className="flex flex-col" style={{ height: '100vh', backgroundColor: '#fafaf5' }}>

        {/* Header */}
        <div className="flex items-center justify-between" style={{ padding: '8px 16px', borderBottom: '1px solid rgba(0,0,0,0.1)', backgroundColor: '#fff', flexShrink: 0 }}>
          <div className="flex items-center gap-3">
            <Cpu size={18} style={{ color: '#d4a843' }} />
            <div>
              <h2 style={{ color: '#333', fontSize: '15px', fontWeight: 700, margin: 0 }}>{sv2Data.name}</h2>
              <p style={{ color: '#888', fontSize: '10px', margin: 0 }}>{sv2Data.description}</p>
            </div>
          </div>

          {/* Panel toggles */}
          <div className="flex items-center gap-1" style={{ backgroundColor: '#f3f3f0', borderRadius: '6px', padding: '2px' }}>
            <ToggleBtn active={showCode} onClick={() => setShowCode(!showCode)} icon={<PanelLeftClose size={13} />} label="Code" />
            <ToggleBtn active={showChat} onClick={() => setShowChat(!showChat)} icon={<Sparkles size={13} />} label="AI Chat" />
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleSave} style={{ ...headerBtnStyle, backgroundColor: '#d4a843', color: '#fff', border: '1px solid #d4a843', fontWeight: 600 }}>
              <GitCommit size={12} /> Save Version
            </button>
            <button onClick={handleCopy} style={headerBtnStyle}>
              {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
            </button>
            <button onClick={handleExport} style={headerBtnStyle}>
              <Download size={12} /> .mmd
            </button>
            <button onClick={handleClose} style={{ ...headerBtnStyle, border: '1px solid #ddd' }}>
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Config changed notification */}
        {configChanged && (
          <div style={{
            padding: '8px 16px', backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0
          }}
          >
            <span style={{ fontSize: '12px', color: '#f59e0b' }}>
              Config changed — auto-generated section updated. Your engineer additions are preserved.
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={handleAcceptMerge} style={{
                padding: '3px 10px', fontSize: '11px', fontWeight: 600,
                backgroundColor: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '4px', color: '#f59e0b', cursor: 'pointer'
              }}
              >
                Got it
              </button>
              <button onClick={handleRegenerate} style={{
                padding: '3px 10px', fontSize: '11px',
                backgroundColor: 'transparent', border: '1px solid rgba(107, 114, 128, 0.3)',
                borderRadius: '4px', color: '#6b7280', cursor: 'pointer'
              }}
              >
                Regenerate fresh
              </button>
            </div>
          </div>
        )}

        {/* Three-panel layout */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Left: Monaco editor */}
          {showCode && (
            <div style={{ width: showChat ? '30%' : '40%', minWidth: '280px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e5e5e5' }}>
              <div style={{ padding: '5px 12px', backgroundColor: '#f9f9f6', borderBottom: '1px solid #e5e5e5', fontSize: '10px', fontWeight: 700, color: '#999', letterSpacing: '0.05em' }}>
                MERMAID SOURCE
              </div>
              <textarea
                value={mermaidSource}
                onChange={(e) => handleSourceChange(e.target.value)}
                spellCheck={false}
                style={{
                  flex: 1,
                  width: '100%',
                  padding: '12px',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
                  fontSize: '12px',
                  lineHeight: '1.6',
                  color: '#333',
                  backgroundColor: '#fafaf5',
                  tabSize: 4
                }}
              />
            </div>
          )}

          {/* Center: Mermaid preview — fills all available space */}
          <div style={{ flex: 1, overflow: 'hidden', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
            <MermaidDiagram diagram={mermaidSource} hideActions />
          </div>

          {/* Right: AI Chat */}
          {showChat && (
            <div style={{ width: '300px', minWidth: '260px', borderLeft: '1px solid #e5e5e5', display: 'flex', flexDirection: 'column' }}>
              <AIChat
                mermaidSource={mermaidSource}
                onApplyMermaid={handleAIApply}
                diagramName={sv2Data.name}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between" style={{ padding: '6px 16px', borderTop: '1px solid rgba(0,0,0,0.1)', backgroundColor: '#fff', flexShrink: 0 }}>
          <div className="flex gap-3">
            {sv2Data.layers?.map(layer => (
              <span key={layer.id} className="flex items-center gap-1" style={{ fontSize: '9px', color: '#999' }}>
                <span style={{ width: '8px', height: '8px', backgroundColor: layer.color, border: '1px solid rgba(0,0,0,0.15)', borderRadius: '2px', display: 'inline-block' }} />
                {layer.label}
              </span>
            ))}
          </div>
          <span style={{ color: '#bbb', fontSize: '9px' }}>
            DoDAF SV-2 • Edit Mermaid source or ask AI to modify • Paste into GitHub, Confluence, Notion
          </span>
        </div>
      </div>

      {/* Capability removal confirmation */}
      {removedCaps && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10001 }}>
          <div className="card-accent" style={{ width: '440px', maxWidth: '90vw', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <div className="flex items-center gap-2" style={{ padding: '14px 18px', borderBottom: '1px solid rgba(75, 85, 99, 0.3)' }}>
              <AlertTriangle size={18} style={{ color: '#ef4444' }} />
              <h3 className="text-gray-100 font-bold text-sm m-0">Capabilities Removed from Diagram</h3>
            </div>
            <div style={{ padding: '14px 18px' }}>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 12px 0' }}>
                The following capabilities were removed from the SV-2 diagram. Do you also want to remove them from the vessel configuration?
              </p>
              <div className="card-inner" style={{ padding: '8px 10px' }}>
                {removedCaps.map((cap, i) => (
                  <div key={i} className="flex items-center gap-2 py-1" style={{ borderBottom: i < removedCaps.length - 1 ? '1px solid rgba(75, 85, 99, 0.15)' : 'none' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444', flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: '#e5e7eb' }}>{cap.capName}</span>
                    <span style={{ fontSize: '10px', color: '#6b7280' }}>({cap.category})</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2" style={{ padding: '10px 18px', borderTop: '1px solid rgba(75, 85, 99, 0.3)' }}>
              <button onClick={handleSkipRemovals} className="btn-ghost" style={{ fontSize: '12px', padding: '6px 14px', minHeight: 'auto' }}>
                Keep in config
              </button>
              <button onClick={handleConfirmRemovals} style={{
                padding: '6px 14px', fontSize: '12px', fontWeight: 600, borderRadius: '6px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444', cursor: 'pointer'
              }}
              >
                Remove from config
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version commit modal — use currentConfig from store (has id after save) */}
      {showVersionModal && (currentConfig?.id || activeConfig?.id) && (
        <CreateVersionModal
          configId={currentConfig?.id || activeConfig?.id}
          activeConfig={currentConfig || activeConfig}
          hullName={hullName}
          onClose={() => setShowVersionModal(false)}
        />
      )}
    </div>
  );
};

// Sub-components
const ToggleBtn = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} style={{
    padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
    backgroundColor: active ? '#fff' : 'transparent',
    color: active ? '#333' : '#aaa',
    boxShadow: active ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
  }}
  >
    {icon} {label}
  </button>
);

const headerBtnStyle = {
  padding: '5px 10px', backgroundColor: '#f5f5f0', border: '1px solid #e5e5e5',
  borderRadius: '5px', fontSize: '11px', color: '#666', cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: '4px'
};

export default SV2Editor;
