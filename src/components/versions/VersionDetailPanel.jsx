/**
 * Version Detail Panel
 *
 * Shows the full snapshot of a selected version: slots, software manifest,
 * SBOM stats, SV-2 summary. Used in both the top-level Versions tab and
 * inline in the LoadoutBuilder.
 */

import { useMemo } from 'react';
import { Package, Cpu, GitCommit, Tag, Clock, FileText, GitBranch, Layers } from 'lucide-react';

const VersionDetailPanel = ({ version }) => {
  if (!version) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-gray-600 text-sm">Select a version to view details</p>
      </div>
    );
  }

  const { snapshot } = version;
  const date = new Date(version.createdAt);

  const manifestEntries = useMemo(() => {
    return Object.entries(snapshot?.softwareManifest || {}).sort((a, b) => a[0].localeCompare(b[0]));
  }, [snapshot]);

  const sbomCount = snapshot?.sbomSnapshot?.components?.length || 0;

  return (
    <div className="flex flex-col gap-3 p-3 overflow-auto h-full">
      {/* Header */}
      <div className="card-inner" style={{ padding: '10px 12px' }}>
        <div className="flex items-center gap-2 mb-1">
          <GitCommit size={14} className="text-lime-brand" />
          <span className="text-gray-200 text-sm font-semibold">{version.message}</span>
        </div>
        {version.tag && (
          <span className="inline-flex items-center gap-1 mb-1" style={{
            fontSize: '10px', fontWeight: 700, color: '#cbfd00', backgroundColor: 'rgba(203, 253, 0, 0.1)',
            padding: '1px 6px', borderRadius: '3px', border: '1px solid rgba(203, 253, 0, 0.2)',
            fontFamily: 'monospace'
          }}>
            <Tag size={8} /> {version.tag}
          </span>
        )}
        <div className="flex gap-3 mt-1" style={{ fontSize: '10px', color: '#6b7280' }}>
          <span className="flex items-center gap-1">
            <Clock size={9} /> {date.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Package size={9} /> {snapshot?.hullName}
          </span>
        </div>
      </div>

      {/* Equipped Capabilities */}
      <div>
        <div className="subsection-label mb-1">Equipped Capabilities ({snapshot?.equippedCount || 0})</div>
        <div className="card-inner" style={{ padding: '8px 10px' }}>
          {Object.entries(snapshot?.slots || {}).map(([cat, slots]) => {
            const equipped = (slots || []).filter(Boolean);
            if (equipped.length === 0) return null;
            return (
              <div key={cat} className="mb-2 last:mb-0">
                <div style={{ fontSize: '9px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                  {cat}
                </div>
                {equipped.map((name, i) => (
                  <div key={i} className="flex items-center gap-1.5" style={{ fontSize: '11px', color: '#d1d5db', padding: '1px 0' }}>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#cbfd00', flexShrink: 0 }} />
                    {name}
                    {snapshot?.softwareManifest?.[name] && (
                      <span style={{ fontSize: '9px', color: '#6b7280', fontFamily: 'monospace' }}>
                        v{snapshot.softwareManifest[name]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Software Manifest */}
      <div>
        <div className="subsection-label mb-1">Software Manifest ({manifestEntries.length})</div>
        <div className="card-inner" style={{ padding: '8px 10px', maxHeight: '200px', overflow: 'auto' }}>
          {manifestEntries.map(([name, version]) => (
            <div key={name} className="flex items-center justify-between" style={{ fontSize: '11px', padding: '2px 0', borderBottom: '1px solid rgba(75, 85, 99, 0.15)' }}>
              <span style={{ color: '#d1d5db' }}>{name}</span>
              <span style={{ color: '#9ca3af', fontFamily: 'monospace', fontSize: '10px' }}>{version}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-2">
        {sbomCount > 0 && (
          <div className="card-inner flex items-center gap-1.5 flex-1" style={{ padding: '8px 10px' }}>
            <FileText size={12} className="text-cyan-500" />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#e5e7eb', fontFamily: 'monospace' }}>{sbomCount}</div>
              <div style={{ fontSize: '9px', color: '#6b7280' }}>SBOM Components</div>
            </div>
          </div>
        )}
        {snapshot?.sv2Snapshot && (
          <div className="card-inner flex items-center gap-1.5 flex-1" style={{ padding: '8px 10px' }}>
            <GitBranch size={12} className="text-violet-500" />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#e5e7eb', fontFamily: 'monospace' }}>{snapshot.sv2Snapshot.componentCount || 0}</div>
              <div style={{ fontSize: '9px', color: '#6b7280' }}>SV-2 Components</div>
            </div>
          </div>
        )}
      </div>

      {/* Version ID (for debugging / reference) */}
      <div style={{ fontSize: '9px', color: '#4b5563', fontFamily: 'monospace', padding: '4px 0' }}>
        ID: {version.id} | Hash: {version.contentHash}
      </div>
    </div>
  );
};

export default VersionDetailPanel;
