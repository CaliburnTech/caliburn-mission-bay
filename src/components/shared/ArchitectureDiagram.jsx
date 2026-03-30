import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { X, Download, Cpu, Plus, Trash2, Link2, Undo2, Redo2 } from 'lucide-react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  MarkerType,
  useNodesState,
  useEdgesState,
  addEdge,
  getNodesBounds,
  getViewportForBounds
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toSvg } from 'html-to-image';
import { resolveSV2 } from '../../utils/sv2AutoGenerator';
import useSV2Store from '../../store/sv2Store';

// Inject styles for group node labels (React Flow renders them as inner divs)
const SV2Styles = () => (
  <style>{`
    .react-flow__node-group > div {
      font-size: 10px;
      font-weight: 700;
      color: rgba(0,0,0,0.4);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 4px 8px;
      pointer-events: none;
    }
  `}</style>
);

const DIAGRAM_WIDTH = 900;

// Component node style
const componentStyle = (width = 150, height = 45) => ({
  width, height,
  backgroundColor: '#ffffff',
  border: '1.5px solid #d4a843',
  borderRadius: '4px',
  fontSize: '11px', fontWeight: 500, color: '#333',
  display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
  padding: '4px 8px', whiteSpace: 'pre-line', lineHeight: '1.3',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
});

// Default edge style
const defaultEdgeOpts = (dashed = false) => ({
  type: 'smoothstep',
  animated: false,
  style: { stroke: dashed ? '#999' : '#666', strokeWidth: 1.5, strokeDasharray: dashed ? '6,3' : undefined },
  labelStyle: { fill: '#555', fontSize: 9, fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontWeight: 500 },
  labelBgStyle: { fill: '#fff', fillOpacity: 0.85 },
  labelBgPadding: [4, 2],
  labelBgBorderRadius: 2,
  markerEnd: { type: MarkerType.ArrowClosed, color: '#666', width: 14, height: 14 }
});

// Build nodes from template
const buildNodes = (template) => {
  const nodes = [];

  template.layers.forEach((layer) => {
    // Layer band — NOT draggable (fixed structure)
    // The label is rendered via the React Flow group label, not a child node
    nodes.push({
      id: layer.id,
      type: 'group',
      position: { x: 0, y: layer.y },
      draggable: false,
      selectable: false,
      style: {
        width: DIAGRAM_WIDTH, height: layer.height,
        backgroundColor: layer.color, borderRadius: '4px',
        border: '1px solid rgba(0,0,0,0.1)', opacity: 0.95
      },
      data: { label: layer.label, nodeKind: 'layer' }
    });
  });

  template.subgroups.forEach((sg) => {
    nodes.push({
      id: sg.id,
      parentId: sg.layerId,
      type: 'group',
      extent: 'parent',
      position: { x: sg.x, y: sg.y },
      style: {
        width: sg.width, height: sg.height,
        backgroundColor: sg.color,
        border: '1px solid rgba(0,0,0,0.15)', borderRadius: '6px'
      },
      data: { label: sg.label, nodeKind: 'subgroup' }
    });
  });

  template.components.forEach((comp) => {
    const parentId = comp.subgroupId || comp.layerId;
    nodes.push({
      id: comp.id,
      parentId,
      extent: 'parent',
      type: 'default',
      position: { x: comp.x, y: comp.y },
      style: componentStyle(comp.width, comp.height),
      data: { label: comp.label, nodeKind: 'component' }
    });
  });

  return nodes;
};

// Build edges from template
const buildEdges = (template) => {
  return template.edges.map((edge, idx) => ({
    id: `e-${idx}-${edge.source}-${edge.target}`,
    source: edge.source,
    target: edge.target,
    label: edge.label || '',
    ...defaultEdgeOpts(edge.style === 'dashed')
  }));
};

// ─── History helpers ───
const takeSnapshot = (nodes, edges) => ({
  nodes: structuredClone(nodes),
  edges: structuredClone(edges)
});

const ArchitectureDiagram = ({ activeConfig, hullName, onClose }) => {
  // ALL hooks must be before any conditional return
  const containerRef = useRef(null);
  const flowRef = useRef(null);

  const { getConfigKey, mergeCustomizations } = useSV2Store();

  // Resolve diagram: template override → auto-generate → merge user customizations
  const template = useMemo(() => {
    const base = resolveSV2(activeConfig, hullName);
    if (!base) return null;

    // Merge any saved user customizations
    const configKey = getConfigKey(activeConfig, hullName);
    const { merged } = mergeCustomizations(configKey, structuredClone(base));
    return merged;
  }, [activeConfig, hullName, getConfigKey, mergeCustomizations]);

  const initialNodes = useMemo(() => template ? buildNodes(template) : [], [template]);
  const initialEdges = useMemo(() => template ? buildEdges(template) : [], [template]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // ── Undo / Redo ──
  const historyRef = useRef([takeSnapshot(initialNodes, initialEdges)]);
  const historyIndexRef = useRef(0);
  const skipNextSnapshotRef = useRef(0); // counter, not boolean — avoids race conditions
  const [historyVersion, setHistoryVersion] = useState(0); // forces button re-render

  const pushSnapshot = useCallback((n, e) => {
    const idx = historyIndexRef.current;
    historyRef.current = historyRef.current.slice(0, idx + 1);
    historyRef.current.push(takeSnapshot(n, e));
    if (historyRef.current.length > 50) historyRef.current.shift();
    historyIndexRef.current = historyRef.current.length - 1;
    setHistoryVersion(v => v + 1);
  }, []);

  // Push history on drag end (single entry per drag, not per pixel)
  const onNodeDragStop = useCallback(() => {
    pushSnapshot(nodes, edges);
  }, [nodes, edges, pushSnapshot]);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    skipNextSnapshotRef.current += 1;
    const snap = historyRef.current[historyIndexRef.current];
    setNodes(structuredClone(snap.nodes));
    setEdges(structuredClone(snap.edges));
    setHistoryVersion(v => v + 1);
  }, [setNodes, setEdges]);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    skipNextSnapshotRef.current += 1;
    const snap = historyRef.current[historyIndexRef.current];
    setNodes(structuredClone(snap.nodes));
    setEdges(structuredClone(snap.edges));
    setHistoryVersion(v => v + 1);
  }, [setNodes, setEdges]);

  // Snapshot on non-drag changes (label edits, add/delete) via useEffect
  const lastKeyRef = useRef('');
  useEffect(() => {
    // Skip snapshots triggered by undo/redo
    if (skipNextSnapshotRef.current > 0) {
      skipNextSnapshotRef.current -= 1;
      return;
    }
    // Build a key that includes labels, node count, and edge count (NOT positions — drags use onNodeDragStop)
    const key = JSON.stringify({
      nc: nodes.length,
      ec: edges.length,
      nl: nodes.filter(n => n.data?.nodeKind === 'component').map(n => n.data.label).sort(),
      el: edges.map(e => e.label).sort()
    });
    if (key !== lastKeyRef.current) {
      lastKeyRef.current = key;
      pushSnapshot(nodes, edges);
    }
  }, [nodes, edges, pushSnapshot]);

  // Editing state
  const [editMode, setEditMode] = useState('select');
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [editingEdgeId, setEditingEdgeId] = useState(null);
  const [editText, setEditText] = useState('');
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [addNodeModal, setAddNodeModal] = useState(false);
  const [addNodeName, setAddNodeName] = useState('');
  const [addNodeLayer, setAddNodeLayer] = useState('');
  const [connectLabel, setConnectLabel] = useState('');
  const [pendingConnection, setPendingConnection] = useState(null);
  const editInputRef = useRef(null);
  const addInputRef = useRef(null);

  const hasSelection = selectedNodes.filter(n => n.data?.nodeKind === 'component').length > 0 || selectedEdges.length > 0;
  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  // Auto-focus container
  useEffect(() => { containerRef.current?.focus(); }, []);

  const onSelectionChange = useCallback(({ nodes: sn, edges: se }) => {
    setSelectedNodes(sn || []);
    setSelectedEdges(se || []);
  }, []);

  // Double-click to edit
  const onNodeDoubleClick = useCallback((_, node) => {
    if (node.data?.nodeKind !== 'component') return;
    setEditingNodeId(node.id);
    setEditText(node.data?.label || '');
    setEditingEdgeId(null);
    setTimeout(() => editInputRef.current?.focus(), 50);
  }, []);

  const onEdgeDoubleClick = useCallback((_, edge) => {
    setEditingEdgeId(edge.id);
    setEditText(edge.label || '');
    setEditingNodeId(null);
    setTimeout(() => editInputRef.current?.focus(), 50);
  }, []);

  const commitEdit = useCallback(() => {
    if (editingNodeId) {
      setNodes(nds => nds.map(n => n.id === editingNodeId ? { ...n, data: { ...n.data, label: editText } } : n));
    }
    if (editingEdgeId) {
      setEdges(eds => eds.map(e => e.id === editingEdgeId ? { ...e, label: editText } : e));
    }
    setEditingNodeId(null);
    setEditingEdgeId(null);
    setEditText('');
  }, [editingNodeId, editingEdgeId, editText, setNodes, setEdges]);

  const cancelEdit = useCallback(() => {
    setEditingNodeId(null);
    setEditingEdgeId(null);
    setEditText('');
  }, []);

  // Connect: show inline label prompt instead of window.prompt
  const onConnect = useCallback((connection) => {
    setPendingConnection(connection);
    setConnectLabel('');
  }, []);

  const commitConnection = useCallback(() => {
    if (!pendingConnection) return;
    const newEdge = {
      ...pendingConnection,
      id: `e-custom-${Date.now()}`,
      label: connectLabel,
      ...defaultEdgeOpts()
    };
    setEdges(eds => addEdge(newEdge, eds));
    setPendingConnection(null);
    setConnectLabel('');
  }, [pendingConnection, connectLabel, setEdges]);

  // Add component: inline modal instead of prompt()
  const handleAddComponent = useCallback(() => {
    setAddNodeModal(true);
    setAddNodeName('');
    setAddNodeLayer('');
    setTimeout(() => addInputRef.current?.focus(), 50);
  }, []);

  const commitAddComponent = useCallback(() => {
    if (!addNodeName.trim()) return;
    const layerMap = { '1': 'layer-shore', '2': 'layer-cloud', '3': 'layer-equipment', '4': 'layer-applications', '5': 'layer-tempestos', '6': 'layer-compute' };
    const parentId = layerMap[addNodeLayer] || undefined;
    const newNode = {
      id: `comp-${Date.now()}`,
      parentId,
      extent: parentId ? 'parent' : undefined,
      type: 'default',
      position: { x: 350, y: parentId ? 40 : 400 },
      style: componentStyle(160, 50),
      data: { label: addNodeName.trim(), nodeKind: 'component' }
    };
    setNodes(nds => [...nds, newNode]);
    setAddNodeModal(false);
  }, [addNodeName, addNodeLayer, setNodes]);

  // Delete selected
  const handleDelete = useCallback(() => {
    const nodeIds = new Set(selectedNodes.filter(n => n.data?.nodeKind === 'component').map(n => n.id));
    const edgeIds = new Set(selectedEdges.map(e => e.id));
    if (nodeIds.size === 0 && edgeIds.size === 0) return;
    setNodes(nds => nds.filter(n => !nodeIds.has(n.id)));
    setEdges(eds => eds.filter(e => !edgeIds.has(e.id) && !nodeIds.has(e.source) && !nodeIds.has(e.target)));
    setSelectedNodes([]);
    setSelectedEdges([]);
  }, [selectedNodes, selectedEdges, setNodes, setEdges]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault(); e.stopPropagation(); undo(); return;
    }
    if ((e.metaKey || e.ctrlKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
      e.preventDefault(); e.stopPropagation(); redo(); return;
    }
    if ((e.key === 'Delete' || e.key === 'Backspace') && !editingNodeId && !editingEdgeId && !addNodeModal) {
      e.preventDefault(); handleDelete();
    }
    if (e.key === 'Escape') {
      cancelEdit();
      setAddNodeModal(false);
      setPendingConnection(null);
    }
  }, [handleDelete, cancelEdit, editingNodeId, editingEdgeId, addNodeModal, undo, redo]);

  // SVG export using html-to-image
  // Save customizations on close
  const { saveCustomizations } = useSV2Store();
  const handleClose = useCallback(() => {
    // Extract delta by comparing current state to initial
    const configKey = getConfigKey(activeConfig, hullName);
    const movedPositions = {};
    nodes.forEach(n => {
      if (n.data?.nodeKind === 'component') {
        const initial = initialNodes.find(in_ => in_.id === n.id);
        if (initial && (initial.position.x !== n.position.x || initial.position.y !== n.position.y)) {
          movedPositions[n.id] = n.position;
        }
      }
    });

    const labelOverrides = {};
    nodes.forEach(n => {
      if (n.data?.nodeKind === 'component') {
        const initial = initialNodes.find(in_ => in_.id === n.id);
        if (initial && initial.data.label !== n.data.label) {
          labelOverrides[n.id] = n.data.label;
        }
      }
    });
    edges.forEach(e => {
      const initial = initialEdges.find(ie => ie.id === e.id);
      if (initial && initial.label !== e.label) {
        labelOverrides[e.id] = e.label;
      }
    });

    const initialIds = new Set(initialNodes.map(n => n.id));
    const addedComponents = nodes.filter(n => n.data?.nodeKind === 'component' && !initialIds.has(n.id))
      .map(n => ({ id: n.id, label: n.data.label, layerId: n.parentId, x: n.position.x, y: n.position.y, width: 160, height: 45 }));

    const initialEdgeIds = new Set(initialEdges.map(e => e.id));
    const addedEdges = edges.filter(e => !initialEdgeIds.has(e.id))
      .map(e => ({ id: e.id, source: e.source, target: e.target, label: e.label }));

    const currentEdgeIds = new Set(edges.map(e => e.id));
    const removedEdgeIds = initialEdges.filter(e => !currentEdgeIds.has(e.id)).map(e => e.id);

    const hasChanges = Object.keys(movedPositions).length > 0 || Object.keys(labelOverrides).length > 0 ||
      addedComponents.length > 0 || addedEdges.length > 0 || removedEdgeIds.length > 0;

    if (hasChanges) {
      saveCustomizations(configKey, {
        baseHash: template?._configHash || '',
        movedPositions,
        labelOverrides,
        addedComponents,
        addedEdges,
        removedEdgeIds
      });
    }

    onClose();
  }, [nodes, edges, initialNodes, initialEdges, activeConfig, hullName, template, onClose, getConfigKey, saveCustomizations]);

  const handleExportSVG = useCallback(() => {
    const viewport = document.querySelector('.react-flow__viewport');
    if (!viewport) return;
    toSvg(viewport, { backgroundColor: '#fafaf5' }).then(dataUrl => {
      const link = document.createElement('a');
      link.download = `sv2-${template?.name || 'architecture'}.svg`;
      link.href = dataUrl;
      link.click();
    });
  }, [template]);

  // ── Render ──
  if (!template) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999 }}>
        <div style={{ backgroundColor: '#1a2530', border: '2px solid rgba(203, 253, 0, 0.3)', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
          <p style={{ color: '#e5e7eb', fontSize: '16px', marginBottom: '8px' }}>No SV-2 template available for this configuration.</p>
          <button onClick={onClose} className="btn-primary" style={{ marginTop: '12px' }}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, outline: 'none' }} onKeyDown={handleKeyDown} tabIndex={-1}>
      <div className="flex flex-col" style={{ backgroundColor: '#fafaf5', border: '2px solid rgba(0,0,0,0.15)', borderRadius: '12px', width: '94vw', maxWidth: '1400px', height: '90vh', overflow: 'hidden' }}>
        {/* Header */}
        <div className="flex items-center justify-between" style={{ padding: '10px 20px', borderBottom: '1px solid rgba(0,0,0,0.1)', backgroundColor: '#fff' }}>
          <div className="flex items-center gap-3">
            <Cpu size={20} style={{ color: '#d4a843' }} />
            <div>
              <h2 style={{ color: '#333', fontSize: '16px', fontWeight: 700, margin: 0 }}>{template.name}</h2>
              <p style={{ color: '#888', fontSize: '11px', margin: 0 }}>{template.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExportSVG} style={{ padding: '6px 14px', backgroundColor: '#f5f5f0', border: '1px solid #ddd', borderRadius: '6px', fontSize: '12px', color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Download size={13} /> Export SVG
            </button>
            <button onClick={handleClose} style={{ padding: '6px 10px', backgroundColor: 'transparent', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', color: '#888' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1" style={{ backgroundColor: '#fafaf5', position: 'relative' }}>
          <ReactFlow
            ref={flowRef}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={editMode === 'connect' ? onConnect : undefined}
            onNodeDoubleClick={onNodeDoubleClick}
            onEdgeDoubleClick={onEdgeDoubleClick}
            onNodeDragStop={onNodeDragStop}
            onSelectionChange={onSelectionChange}
            fitView
            fitViewOptions={{ padding: 0.08 }}
            proOptions={{ hideAttribution: true }}
            nodesDraggable={true}
            nodesConnectable={editMode === 'connect'}
            elementsSelectable={true}
            deleteKeyCode={null}
            minZoom={0.3}
            maxZoom={2}
            snapToGrid={true}
            snapGrid={[10, 10]}
          >
            <SV2Styles />
            <Background color="#e8e8e0" gap={20} size={1} variant="dots" />
            <Controls showInteractive={false} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }} />
            <MiniMap
              style={{ background: '#f5f5f0', border: '1px solid #ddd', borderRadius: '6px' }}
              nodeColor={(n) => {
                if (n.data?.nodeKind === 'layer') return n.style?.backgroundColor || '#ddd';
                if (n.data?.nodeKind === 'subgroup') return '#ccc';
                return '#d4a843';
              }}
              maskColor="rgba(0,0,0,0.05)"
            />

            {/* Toolbar */}
            <Panel position="top-left" style={{ margin: '8px' }}>
              <div style={{ display: 'flex', gap: '4px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <TBtn icon={<Undo2 size={14} />} label="Undo (⌘Z)" onClick={undo} disabled={!canUndo} />
                <TBtn icon={<Redo2 size={14} />} label="Redo (⌘⇧Z)" onClick={redo} disabled={!canRedo} />
                <Sep />
                <TBtn icon={<span style={{ fontSize: '14px' }}>↖</span>} label="Select" active={editMode === 'select'} onClick={() => setEditMode('select')} />
                <TBtn icon={<Link2 size={14} />} label="Connect" active={editMode === 'connect'} onClick={() => setEditMode('connect')} />
                <Sep />
                <TBtn icon={<Plus size={14} />} label="Add Component" onClick={handleAddComponent} />
                <TBtn icon={<Trash2 size={14} />} label="Delete Selected" onClick={handleDelete} disabled={!hasSelection} danger />
              </div>
              {editMode === 'connect' && (
                <div style={{ marginTop: '4px', padding: '4px 10px', backgroundColor: '#e0f2fe', border: '1px solid #7dd3fc', borderRadius: '6px', fontSize: '10px', color: '#0369a1' }}>
                  Drag from a node handle to another to create a connection
                </div>
              )}
            </Panel>
          </ReactFlow>

          {/* Edit label overlay */}
          {(editingNodeId || editingEdgeId) && (
            <Overlay>
              <OverlayTitle>{editingNodeId ? 'Edit Component Label' : 'Edit Data Flow Label'}</OverlayTitle>
              <input ref={editInputRef} type="text" value={editText} onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') cancelEdit(); }}
                style={inputStyle} placeholder="Enter label..." />
              <OverlayActions onCancel={cancelEdit} onConfirm={commitEdit} />
            </Overlay>
          )}

          {/* Add component overlay */}
          {addNodeModal && (
            <Overlay>
              <OverlayTitle>Add Component</OverlayTitle>
              <input ref={addInputRef} type="text" value={addNodeName} onChange={(e) => setAddNodeName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') commitAddComponent(); if (e.key === 'Escape') setAddNodeModal(false); }}
                style={inputStyle} placeholder="Component name..." />
              <select value={addNodeLayer} onChange={(e) => setAddNodeLayer(e.target.value)} style={{ ...inputStyle, marginTop: '6px' }}>
                <option value="">Floating (no layer)</option>
                {template.layers.map((l, i) => <option key={l.id} value={String(i + 1)}>{l.label}</option>)}
              </select>
              <OverlayActions onCancel={() => setAddNodeModal(false)} onConfirm={commitAddComponent} confirmLabel="Add" />
            </Overlay>
          )}

          {/* Connection label overlay */}
          {pendingConnection && (
            <Overlay>
              <OverlayTitle>Data Flow Label</OverlayTitle>
              <input type="text" value={connectLabel} onChange={(e) => setConnectLabel(e.target.value)} autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') commitConnection(); if (e.key === 'Escape') setPendingConnection(null); }}
                style={inputStyle} placeholder='e.g., "C2", "Env Data", "NMEA 2000"' />
              <OverlayActions onCancel={() => setPendingConnection(null)} onConfirm={commitConnection} confirmLabel="Create" />
            </Overlay>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between" style={{ padding: '8px 20px', borderTop: '1px solid rgba(0,0,0,0.1)', backgroundColor: '#fff' }}>
          <div className="flex gap-4">
            {template.layers.map(layer => (
              <span key={layer.id} className="flex items-center gap-1.5" style={{ fontSize: '10px', color: '#777' }}>
                <span style={{ width: '12px', height: '12px', backgroundColor: layer.color, border: '1px solid rgba(0,0,0,0.15)', borderRadius: '2px', display: 'inline-block' }} />
                {layer.label}
              </span>
            ))}
          </div>
          <span style={{ color: '#aaa', fontSize: '10px' }}>
            Double-click to edit • Del to remove • ⌘Z undo • ⌘⇧Z redo
          </span>
        </div>
      </div>
    </div>
  );
};

// ── Sub-components ──

const TBtn = ({ icon, label, active, onClick, disabled, danger }) => (
  <button onClick={onClick} disabled={disabled} title={label} style={{
    display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px',
    backgroundColor: active ? '#e8f4fd' : disabled ? '#f9f9f9' : 'transparent',
    border: active ? '1px solid #7dd3fc' : '1px solid transparent',
    borderRadius: '5px', fontSize: '11px', fontWeight: 500,
    color: disabled ? '#ccc' : danger ? '#dc2626' : active ? '#0369a1' : '#555',
    cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.15s'
  }}>
    {icon}<span>{label}</span>
  </button>
);

const Sep = () => <div style={{ width: '1px', backgroundColor: '#e5e5e5', margin: '2px 4px' }} />;

const Overlay = ({ children }) => (
  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, backgroundColor: '#fff', border: '2px solid #d4a843', borderRadius: '8px', padding: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', minWidth: '320px' }}>
    {children}
  </div>
);

const OverlayTitle = ({ children }) => (
  <div style={{ fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '8px' }}>{children}</div>
);

const OverlayActions = ({ onCancel, onConfirm, confirmLabel = 'Save' }) => (
  <div style={{ display: 'flex', gap: '8px', marginTop: '10px', justifyContent: 'flex-end' }}>
    <button onClick={onCancel} style={{ padding: '4px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px', color: '#777', cursor: 'pointer', backgroundColor: '#f9f9f9' }}>Cancel</button>
    <button onClick={onConfirm} style={{ padding: '4px 12px', border: '1px solid #d4a843', borderRadius: '4px', fontSize: '12px', color: '#fff', cursor: 'pointer', backgroundColor: '#d4a843', fontWeight: 600 }}>{confirmLabel}</button>
  </div>
);

const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };

export default ArchitectureDiagram;
