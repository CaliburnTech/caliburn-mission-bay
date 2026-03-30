import { useState, useMemo } from 'react';
import { X, Download, Copy, ChevronDown, ChevronRight, FileText, Package, Shield } from 'lucide-react';
import { sbomToJSON, sbomToCSV, getSBOMStats } from '../../utils/sbomGenerator';

const SBOMDisplay = ({ sbom, onClose }) => {
  const [sortField, setSortField] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);

  const [copiedJSON, setCopiedJSON] = useState(false);

  const stats = useMemo(() => getSBOMStats(sbom), [sbom]);

  const sorted = useMemo(() => {
    const items = [...sbom.components];
    items.sort((a, b) => {
      const av = a[sortField] || '';
      const bv = b[sortField] || '';
      const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
      return sortAsc ? cmp : -cmp;
    });
    return items;
  }, [sbom, sortField, sortAsc]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleDownloadJSON = () => {
    const json = sbomToJSON(sbom);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `sbom-${sbom.context?.missionName || 'config'}-${Date.now()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    const csv = sbomToCSV(sbom);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `sbom-${sbom.context?.missionName || 'config'}-${Date.now()}.csv`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(sbomToJSON(sbom));
    setCopiedJSON(true);
    setTimeout(() => setCopiedJSON(false), 2000);
  };

  const SortHeader = ({ field, label }) => (
    <th
      className="text-left cursor-pointer select-none"
      style={{ padding: '10px 12px', color: '#9ca3af', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(75, 85, 99, 0.3)' }}
      onClick={() => handleSort(field)}
    >
      {label} {sortField === field ? (sortAsc ? '↑' : '↓') : ''}
    </th>
  );

  const licenseColor = (license) => {
    if (license.includes('GPL')) return '#f97316';
    if (license.includes('Apache') || license.includes('MIT')) return '#4ade80';
    if (license.includes('Proprietary')) return '#ef4444';
    if (license.includes('Government')) return '#3b82f6';
    if (license.includes('Commercial')) return '#eab308';
    return '#9ca3af';
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999 }}>
      <div className="flex flex-col" style={{ backgroundColor: '#1a2530', border: '2px solid rgba(203, 253, 0, 0.3)', borderRadius: '12px', width: '90vw', maxWidth: '1100px', maxHeight: '85vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between" style={{ padding: '16px 20px', borderBottom: '1px solid rgba(75, 85, 99, 0.3)' }}>
          <div className="flex items-center gap-3">
            <FileText size={20} style={{ color: '#cbfd00' }} />
            <div>
              <h2 style={{ color: '#e5e7eb', fontSize: '18px', fontWeight: 700, margin: 0 }}>Software Bill of Materials</h2>
              <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
                {sbom.context?.missionName || sbom.context?.outfitName || 'Configuration'} — CycloneDX v{sbom.specVersion}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px', minHeight: 'auto' }}>
            <X size={18} />
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex gap-4" style={{ padding: '12px 20px', borderBottom: '1px solid rgba(75, 85, 99, 0.2)' }}>
          <StatBadge icon={Package} label="Components" value={stats.totalComponents} color="#cbfd00" />
          <StatBadge icon={Package} label="Top-Level" value={stats.topLevelComponents} color="#3b82f6" />
          <StatBadge icon={Package} label="Dependencies" value={stats.dependencyCount} color="#9ca3af" />
          <StatBadge icon={Shield} label="Licenses" value={Object.keys(stats.licenses).length} color="#f97316" />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto" style={{ padding: '0 20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <SortHeader field="name" label="Component" />
                <SortHeader field="version" label="Version" />
                <SortHeader field="supplier" label="Supplier" />
                <SortHeader field="license" label="License" />
                <SortHeader field="category" label="Category" />
                <th style={{ padding: '10px 12px', color: '#9ca3af', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid rgba(75, 85, 99, 0.3)' }}>Deps</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c, i) => (
                <tr
                  key={c.purl}
                  style={{
                    backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(75, 85, 99, 0.05)',
                    borderBottom: '1px solid rgba(75, 85, 99, 0.15)'
                  }}
                >
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {c.isTopLevel && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#cbfd00', flexShrink: 0 }} />}
                      <span style={{ color: '#e5e7eb', fontSize: '13px', fontWeight: c.isTopLevel ? 600 : 400 }}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '8px 12px', color: '#d1d5db', fontSize: '13px', fontFamily: 'monospace' }}>{c.version}</td>
                  <td style={{ padding: '8px 12px', color: '#9ca3af', fontSize: '13px' }}>{c.supplier.name}</td>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: `${licenseColor(c.license)}20`,
                      color: licenseColor(c.license),
                      border: `1px solid ${licenseColor(c.license)}40`
                    }}
                    >
                      {c.license}
                    </span>
                  </td>
                  <td style={{ padding: '8px 12px', color: '#9ca3af', fontSize: '12px' }}>{c.category}</td>
                  <td style={{ padding: '8px 12px', color: '#6b7280', fontSize: '12px', textAlign: 'center' }}>
                    {c.dependencyNames.length || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer / Export */}
        <div className="flex items-center justify-between" style={{ padding: '12px 20px', borderTop: '1px solid rgba(75, 85, 99, 0.3)' }}>
          <span style={{ color: '#6b7280', fontSize: '12px' }}>
            Generated {new Date(sbom.metadata.timestamp).toLocaleString()}
          </span>
          <div className="flex gap-2">
            <button onClick={handleCopyJSON} className="btn-ghost" style={{ fontSize: '13px', padding: '6px 12px', minHeight: 'auto' }}>
              <Copy size={14} style={{ marginRight: '4px' }} />
              {copiedJSON ? 'Copied!' : 'Copy JSON'}
            </button>
            <button onClick={handleDownloadCSV} className="btn-secondary" style={{ fontSize: '13px', padding: '6px 12px', minHeight: 'auto' }}>
              <Download size={14} style={{ marginRight: '4px' }} />
              CSV
            </button>
            <button onClick={handleDownloadJSON} className="btn-primary" style={{ fontSize: '13px', padding: '6px 12px', minHeight: 'auto' }}>
              <Download size={14} style={{ marginRight: '4px' }} />
              CycloneDX JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBadge = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-2" style={{ padding: '6px 12px', backgroundColor: 'rgba(75, 85, 99, 0.1)', borderRadius: '6px' }}>
    <Icon size={14} style={{ color }} />
    <span style={{ color: '#9ca3af', fontSize: '12px' }}>{label}</span>
    <span style={{ color, fontSize: '14px', fontWeight: 700, fontFamily: 'monospace' }}>{value}</span>
  </div>
);

export default SBOMDisplay;
