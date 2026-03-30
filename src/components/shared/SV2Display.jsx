import { useState } from 'react';
import { X, GitBranch, ChevronDown, ChevronRight, Code } from 'lucide-react';
import MermaidDiagram from './MermaidDiagram';
import { getSV2MermaidSource } from '../../utils/sv2Generator';

const SV2Display = ({ sv2Result, onClose }) => {
  const [showSource, setShowSource] = useState(false);

  if (!sv2Result) return null;

  const mermaidSource = getSV2MermaidSource(sv2Result);

  // Category color legend
  const categoryColors = {
    'User Interface': '#06b6d4',
    'C2 Software': '#3b82f6',
    'Middleware': '#8b5cf6',
    'Hardware Interface': '#f97316',
    'Autonomy / Navigation': '#4ade80',
    'Vehicle Platform': '#ef4444',
    'Communications': '#eab308',
    'Infrastructure': '#6b7280',
    'Services': '#ec4899',
    'Sensor Interface': '#14b8a6'
  };

  // Get unique categories from the systems in this SV-2
  const usedCategories = {};
  if (sv2Result.systems) {
    // Import dynamically would be complex, just show all that are in the standard set
    Object.entries(categoryColors).forEach(([cat, color]) => {
      usedCategories[cat] = color;
    });
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999 }}>
      <div className="flex flex-col" style={{ backgroundColor: '#1a2530', border: '2px solid rgba(203, 253, 0, 0.3)', borderRadius: '12px', width: '92vw', maxWidth: '1200px', maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between" style={{ padding: '16px 20px', borderBottom: '1px solid rgba(75, 85, 99, 0.3)' }}>
          <div className="flex items-center gap-3">
            <GitBranch size={20} style={{ color: '#cbfd00' }} />
            <div>
              <h2 style={{ color: '#e5e7eb', fontSize: '18px', fontWeight: 700, margin: 0 }}>SV-2 Systems Communication Description</h2>
              <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
                {sv2Result.title} — {sv2Result.systems?.length || 0} systems, {sv2Result.connectionCount || 0} interfaces
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px', minHeight: 'auto' }}>
            <X size={18} />
          </button>
        </div>

        {/* Info bar */}
        <div className="flex items-center justify-between" style={{ padding: '8px 20px', borderBottom: '1px solid rgba(75, 85, 99, 0.2)' }}>
          <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>{sv2Result.description}</p>
          <div className="flex gap-1 flex-wrap" style={{ maxWidth: '500px' }}>
            {Object.entries(usedCategories).map(([cat, color]) => (
              <span
                key={cat}
                style={{
                  fontSize: '10px',
                  padding: '1px 6px',
                  borderRadius: '3px',
                  backgroundColor: `${color}20`,
                  color,
                  border: `1px solid ${color}40`,
                  whiteSpace: 'nowrap'
                }}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Diagram area */}
        <div className="flex-1 overflow-auto" style={{ padding: '16px 20px' }}>
          <MermaidDiagram diagram={mermaidSource} />
        </div>

        {/* Mermaid source toggle */}
        <div style={{ padding: '0 20px' }}>
          <button
            onClick={() => setShowSource(!showSource)}
            className="flex items-center gap-2"
            style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '13px', cursor: 'pointer', padding: '8px 0' }}
          >
            <Code size={14} />
            {showSource ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            Mermaid Source
          </button>

          {showSource && (
            <pre
              style={{
                backgroundColor: '#0f1419',
                border: '1px solid rgba(75, 85, 99, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                color: '#d1d5db',
                fontSize: '12px',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                maxHeight: '200px',
                overflow: 'auto',
                marginBottom: '12px'
              }}
            >
              {mermaidSource}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between" style={{ padding: '12px 20px', borderTop: '1px solid rgba(75, 85, 99, 0.3)' }}>
          <span style={{ color: '#6b7280', fontSize: '12px' }}>
            DoDAF SV-2 — Mermaid JS format, reusable in documentation and wikis
          </span>
          <span style={{ color: '#6b7280', fontSize: '11px' }}>
            Use SVG or Mermaid source for integration into external tools
          </span>
        </div>
      </div>
    </div>
  );
};

export default SV2Display;
