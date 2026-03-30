import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Initialize Mermaid with clean default theme
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  themeVariables: {
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    fontSize: '14px'
  },
  flowchart: {
    htmlLabels: true,
    curve: 'basis',
    padding: 16,
    nodeSpacing: 30,
    rankSpacing: 40
  },
  securityLevel: 'loose'
});

const MermaidDiagram = ({ diagram, className = '', hideActions = false }) => {
  const containerRef = useRef(null);
  const [svgContent, setSvgContent] = useState('');
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!diagram) return;

    const renderDiagram = async () => {
      try {
        setError(null);
        const id = `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const { svg } = await mermaid.render(id, diagram);
        setSvgContent(svg);
        setZoom(1); // Reset zoom on new render
      } catch (err) {
        console.error('Mermaid render error:', err);
        setError(err.message || 'Failed to render diagram');
      }
    };

    renderDiagram();
  }, [diagram]);

  // After SVG is inserted, remove hardcoded dimensions so it scales
  useEffect(() => {
    if (!containerRef.current || !svgContent) return;
    const svg = containerRef.current.querySelector('svg');
    if (svg) {
      // Store original viewBox if not already set
      if (!svg.getAttribute('viewBox')) {
        const w = svg.getAttribute('width') || svg.getBoundingClientRect().width;
        const h = svg.getAttribute('height') || svg.getBoundingClientRect().height;
        const width = parseFloat(w) || 800;
        const height = parseFloat(h) || 600;
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      }
      // Remove fixed dimensions so it fills container
      svg.removeAttribute('width');
      svg.removeAttribute('height');
      svg.removeAttribute('max-width');
      svg.style.width = '100%';
      svg.style.height = '100%';
      svg.style.maxWidth = 'none';

      // Darken cluster label color (no size/weight changes — breaks Mermaid's layout)
      const clusterLabels = svg.querySelectorAll('.cluster-label text, .cluster-label span');
      clusterLabels.forEach(label => {
        label.style.fill = '#1f2937';
      });
    }
  }, [svgContent]);

  const handleExportSVG = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'sv2-diagram.svg';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySource = () => {
    navigator.clipboard.writeText(diagram);
  };

  if (error) {
    return (
      <div style={{ padding: '16px' }}>
        <p style={{ color: '#ef4444', fontSize: '14px', margin: '0 0 8px 0' }}>Diagram render error</p>
        <pre style={{ color: '#666', fontSize: '12px', whiteSpace: 'pre-wrap', backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '6px', border: '1px solid #e5e5e5' }}>{error}</pre>
        <details style={{ marginTop: '8px' }}>
          <summary style={{ fontSize: '11px', color: '#999', cursor: 'pointer' }}>Show source</summary>
          <pre style={{ color: '#666', fontSize: '11px', whiteSpace: 'pre-wrap', marginTop: '4px' }}>{diagram}</pre>
        </details>
      </div>
    );
  }

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* Zoom controls */}
      <div style={{ display: 'flex', gap: '4px', padding: '4px 8px', justifyContent: 'flex-end', flexShrink: 0 }}>
        <button onClick={() => setZoom(z => Math.max(0.25, z - 0.25))} style={zoomBtnStyle}>−</button>
        <span style={{ fontSize: '10px', color: '#999', padding: '2px 6px', minWidth: '40px', textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} style={zoomBtnStyle}>+</button>
        <button onClick={() => setZoom(1)} style={{ ...zoomBtnStyle, fontSize: '9px', width: 'auto', padding: '2px 8px' }}>Fit</button>
      </div>

      {/* SVG container — scrollable, zoomable */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '12px',
          cursor: 'grab'
        }}
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            minWidth: zoom < 1 ? '100%' : undefined
          }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </div>

      {/* Action bar */}
      {!hideActions && (
        <div className="flex gap-2" style={{ padding: '8px', flexShrink: 0 }}>
          <button onClick={handleExportSVG} className="btn-secondary" style={{ fontSize: '12px', padding: '4px 10px', minHeight: 'auto' }}>
            Download SVG
          </button>
          <button onClick={handleCopySource} className="btn-ghost" style={{ fontSize: '12px', padding: '4px 10px', minHeight: 'auto' }}>
            Copy Source
          </button>
        </div>
      )}
    </div>
  );
};

const zoomBtnStyle = {
  width: '24px', height: '24px', border: '1px solid #e5e5e5', borderRadius: '4px',
  backgroundColor: '#fff', color: '#666', cursor: 'pointer', fontSize: '14px',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
};

export default MermaidDiagram;
