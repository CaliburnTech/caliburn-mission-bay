/**
 * SV2LayerCakeRenderer
 *
 * Renders SV-2 system resource flow data as a DoDAF-style layer-cake
 * architecture diagram — horizontal colored bands per layer, rotated
 * layer labels, component boxes with arrows, and vertical comms bars
 * on the right edge.
 *
 * Layout (left → right):
 *   [Left Panel 130px] [Label Col 80px] [Main Content 900px] [Comms Panel 150px]
 *
 * Edge routing rules:
 *   route:'west' + laneIdx                → orthogonal H/V lanes in label column
 *   Same layer, xDiff > |yDiff|           → horizontal bezier via side exits
 *   Same layer, going DOWN                → vertical bezier via top/bottom exits
 *   Same layer, going UP                  → right-side arc (feedback/return path)
 *   Cross-layer                           → vertical bezier via top/bottom exits
 *
 * Fan-in: multiple edges entering the same target spread across its entry edge.
 */

import { useMemo, useState, useCallback, useRef, useLayoutEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

// ─── Layout constants ────────────────────────────────────────────────────────

const LEFT_PANEL_W  = 130;
const LABEL_COL_W   = 80;
const MAIN_W        = 900;
const RIGHT_PANEL_W = 150;
const TOTAL_W       = LEFT_PANEL_W + LABEL_COL_W + MAIN_W + RIGHT_PANEL_W;
const MAIN_OFF_X    = LEFT_PANEL_W + LABEL_COL_W;
const COMMS_BAR_W   = 22;
const COMMS_BAR_GAP = 8;
const COMP_R        = 5;
const SG_R          = 6;
const ARROW_SIZE    = 7;

// Route return (upward same-layer) edges just outside the right of the main content
const RETURN_ARC_X  = MAIN_OFF_X + MAIN_W + 22;

// West channel: tight orthogonal lanes just left of the main content area.
// Only needs to clear the leftmost component edges (Comms subgroup left = MAIN_OFF_X+10).
// Small hop left (~5-30px) keeps lines out of boxes without "snaking across the diagram".
const WEST_LANE_START = MAIN_OFF_X - 18;    // 192 — just left of main content
const WEST_LANE_STEP  = 5;                  // 5px per lane

const LABEL_COLORS = {
  'layer-shore':        '#7c3aed',
  'layer-missionbay':   '#1d4ed8',
  'layer-hardware':     '#1d4ed8',
  'layer-software':     '#15803d',
  'layer-equipment':    '#0369a1',
  'layer-applications': '#15803d',
  'layer-tempestos':    '#b45309',
  'layer-compute':      '#1e40af',
};

const COMMS_COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];

// ─── Position index ──────────────────────────────────────────────────────────

function buildPositionIndex(sv2Data) {
  const layerMap = {};
  (sv2Data.layers || []).forEach(l => { layerMap[l.id] = l; });

  const sgMap = {};
  (sv2Data.subgroups || []).forEach(sg => {
    const layer = layerMap[sg.layerId];
    if (!layer) return;
    sgMap[sg.id] = { ...sg, absX: sg.x, absY: layer.y + sg.y };
  });

  const compMap = {};
  (sv2Data.components || []).forEach(comp => {
    const w = comp.width  || 150;
    const h = comp.height || 45;

    if (comp.subgroupId) {
      const sg = sgMap[comp.subgroupId];
      if (!sg) return;
      const layer = layerMap[sg.layerId];
      compMap[comp.id] = {
        ...comp, w, h,
        absX: sg.absX + comp.x,
        absY: sg.absY + comp.y,
        layerId: sg.layerId,
        layerY:    layer ? layer.y : 0,
        layerEndY: layer ? layer.y + layer.height : 9999,
      };
    } else if (comp.layerId) {
      const layer = layerMap[comp.layerId];
      if (!layer) return;
      compMap[comp.id] = {
        ...comp, w, h,
        absX: comp.x,
        absY: layer.y + comp.y,
        layerId: comp.layerId,
        layerY:    layer.y,
        layerEndY: layer.y + layer.height,
      };
    }
  });

  return { layerMap, sgMap, compMap };
}

// ─── Edge fan annotation ─────────────────────────────────────────────────────
// Fan-in:  multiple edges arriving at the same target spread across entry edge.
// Fan-out: multiple vertical edges leaving the same source spread at departure.
// West-channel edges are excluded from spreading (they use fixed lane positions).

function annotateFanIn(edges) {
  const counts  = {};
  const indexes = {};
  edges.forEach(e => { counts[e.target] = (counts[e.target] || 0) + 1; });
  return edges.map(e => {
    const idx = indexes[e.target] || 0;
    indexes[e.target] = idx + 1;
    return { ...e, _tIdx: idx, _tTotal: counts[e.target] };
  });
}

// ─── Edge path builder ───────────────────────────────────────────────────────
// Returns { d, midX, midY, labelX, labelY } where labelX/Y are the
// de-conflicted positions for the edge label (not always at midpoint).

function buildEdgePath(edge, compMap) {
  const s = compMap[edge.source];
  const t = compMap[edge.target];
  if (!s || !t) return null;

  const sw = s.w, sh = s.h, tw = t.w, th = t.h;

  const sCX = MAIN_OFF_X + s.absX + sw / 2;
  const sCY = s.absY + sh / 2;

  // Fan-in: spread multiple edges arriving at same target across its entry edge
  const fanFrac = (edge._tTotal || 1) > 1
    ? (edge._tIdx / (edge._tTotal - 1) - 0.5) * 0.65
    : 0;
  const tCX = MAIN_OFF_X + t.absX + tw / 2 + fanFrac * tw;
  const tCY = t.absY + th / 2;

  const sameLayer = s.layerId === t.layerId;
  const yDiff = t.absY - s.absY;
  const xDiff = Math.abs(tCX - sCX);

  // ── West-channel orthogonal routing ─────────────────────────────────────────
  // Long cross-layer edges (and same-layer return arcs that would sweep widely)
  // are routed through a dedicated lane in the label column rather than cutting
  // diagonally through component content.
  //
  //   edge.route = 'west'     — use this mode
  //   edge.laneIdx = 0..7     — which vertical lane (x = WEST_LANE_START + idx*STEP)
  //
  // Path shape:  source left-edge → lane (horizontal) → vertical → target left-edge
  if (edge.route === 'west') {
    const laneX = WEST_LANE_START + (edge.laneIdx || 0) * WEST_LANE_STEP;
    const exitX = MAIN_OFF_X + s.absX;          // left edge of source
    const entX  = MAIN_OFF_X + t.absX;          // left edge of target
    const midY  = (sCY + tCY) / 2;
    return {
      d: `M ${exitX} ${sCY} H ${laneX} V ${tCY} H ${entX}`,
      midX: laneX,
      midY,
      labelX: laneX + 6,
      labelY: midY,
    };
  }

  // ── Horizontal bezier ────────────────────────────────────────────────────────
  // Use when: (a) explicit route:'h', or (b) same layer where horizontal
  // separation exceeds vertical (handles side-by-side components in same layer
  // that happen to differ slightly in y — sensors→MCU, TAK Server→users, etc.)
  const forceH = edge.route === 'h';
  const naturallyH = sameLayer && xDiff > Math.abs(yDiff);

  if (forceH || naturallyH) {
    const goRight = sCX < tCX;
    const exitX = goRight ? MAIN_OFF_X + s.absX + sw : MAIN_OFF_X + s.absX;
    const entX  = goRight ? MAIN_OFF_X + t.absX      : MAIN_OFF_X + t.absX + tw;
    const ctrl  = (exitX + entX) / 2;
    const midY  = (sCY + tCY) / 2;
    return {
      d: `M ${exitX} ${sCY} C ${ctrl} ${sCY} ${ctrl} ${tCY} ${entX} ${tCY}`,
      midX: ctrl, midY,
      labelX: ctrl,
      labelY: goRight ? midY - 13 : midY + 13,
    };
  }

  // ── Left-side arc: same-layer going-UP, hugs just left of the components ──────
  // Compact alternative to the right-side arc — only reaches ~15px into label col.
  // Use for same-layer up-arcs that would otherwise collide with the right-arc.
  if (edge.route === 'left-arc') {
    const arcStep = (edge.arcOffset || 0) * 13;
    const exitX   = MAIN_OFF_X + s.absX;           // left edge of source
    const entX    = MAIN_OFF_X + t.absX;           // left edge of target
    const arcX    = MAIN_OFF_X - 8 - arcStep;      // just left of main content
    const arcMidY = (sCY + tCY) / 2;
    return {
      d: `M ${exitX} ${sCY} C ${arcX} ${sCY} ${arcX} ${tCY} ${entX} ${tCY}`,
      midX: arcX, midY: arcMidY,
      labelX: arcX - 45, labelY: arcMidY,
    };
  }

  // ── Same layer, going UP → right-side arc (feedback/return path) ─────────────
  if (sameLayer && yDiff < 0) {
    const exitX   = MAIN_OFF_X + s.absX + sw;
    const entX    = MAIN_OFF_X + t.absX + tw;
    const arcX    = RETURN_ARC_X;
    const arcMidY = (sCY + tCY) / 2;
    return {
      d: `M ${exitX} ${sCY} C ${arcX} ${sCY} ${arcX} ${tCY} ${entX} ${tCY}`,
      midX: arcX, midY: arcMidY,
      labelX: MAIN_OFF_X + MAIN_W - 75,
      labelY: arcMidY,
    };
  }

  // ── Vertical bezier (same-layer going DOWN, or cross-layer) ─────────────────
  // For cross-layer edges, control points are placed at the LAYER BOUNDARIES
  // rather than the midpoint. This forces the horizontal x-transition to happen
  // in the inter-layer gap (empty space between bands) rather than cutting through
  // intermediate component content.
  const goDown = sCY < tCY;
  const exitY  = goDown ? s.absY + sh : s.absY;
  const entY   = goDown ? t.absY      : t.absY + th;
  const midY   = (exitY + entY) / 2;
  const midX   = (sCX + tCX) / 2;

  let cp1Y, cp2Y;
  if (sameLayer) {
    // Same-layer going DOWN: use midpoint (unchanged classic bezier)
    cp1Y = midY; cp2Y = midY;
  } else {
    // Cross-layer: transition x at the layer boundary, not the midpoint.
    // Path stays near sCX inside the source layer, transitions in the gap,
    // then stays near tCX inside the target layer.
    cp1Y = goDown ? s.layerEndY : s.layerY;
    cp2Y = goDown ? t.layerY    : t.layerEndY;
  }

  const labelX = sameLayer ? midX - 52 : midX + 30;
  return {
    d: `M ${sCX} ${exitY} C ${sCX} ${cp1Y} ${tCX} ${cp2Y} ${tCX} ${entY}`,
    midX, midY,
    labelX,
    labelY: midY,
  };
}

// ─── Comms bars ──────────────────────────────────────────────────────────────
// Opt-in: only shown when sv2Data.commsBars is explicitly defined.
// Add  commsBars: [{ id, label, color }]  to a template to enable the panel.

function deriveCommsBars(sv2Data) {
  if (!sv2Data.commsBars) return [];  // not requested — hide the panel
  if (sv2Data.commsBars.length) return sv2Data.commsBars;
  // commsBars: [] → auto-detect from components tagged externalInterface
  const radios = (sv2Data.components || []).filter(c => c.externalInterface);
  return radios.slice(0, 5).map((c, i) => ({
    id: c.id, label: c.label || 'Radio', color: COMMS_COLORS[i % COMMS_COLORS.length],
  }));
}

// ─── Main component ──────────────────────────────────────────────────────────

export const SV2LayerCakeRenderer = ({ sv2Data, testSuiteLabel }) => {
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef(null);
  // Tracks whether the user has manually zoomed — once they have, we stop
  // auto-fitting so we don't fight their choice.
  const userZoomedRef = useRef(false);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    userZoomedRef.current = true;
    setZoom(z => Math.min(2.5, Math.max(0.25, z - e.deltaY * 0.001)));
  }, []);

  const zoomIn  = useCallback(() => { userZoomedRef.current = true; setZoom(z => Math.min(2.5, z + 0.15)); }, []);
  const zoomOut = useCallback(() => { userZoomedRef.current = true; setZoom(z => Math.max(0.25, z - 0.15)); }, []);

  const { sgMap, compMap } = useMemo(() => buildPositionIndex(sv2Data), [sv2Data]);
  const commsBars = useMemo(() => deriveCommsBars(sv2Data), [sv2Data]);

  const annotatedEdges = useMemo(
    () => annotateFanIn(sv2Data.edges || []),
    [sv2Data.edges]
  );

  const totalH = useMemo(() => {
    const layers = sv2Data.layers || [];
    if (!layers.length) return 600;
    const last = layers[layers.length - 1];
    return last.y + last.height + 24;
  }, [sv2Data]);

  const rightW  = commsBars.length ? RIGHT_PANEL_W : 0;
  const totalW  = LEFT_PANEL_W + LABEL_COL_W + MAIN_W + rightW;

  // Fit the whole diagram (including the right-hand comms panel) to the panel
  // width so nothing is clipped on the right by default. Users can still zoom.
  const fitToWidth = useCallback(() => {
    const el = canvasRef.current;
    if (!el || !totalW) return;
    const avail = el.clientWidth - 16; // small padding allowance
    if (avail > 0) setZoom(Math.min(1, avail / totalW));
  }, [totalW]);

  // Auto-fit on mount and whenever the diagram width changes — but only until the
  // user manually zooms.
  useLayoutEffect(() => {
    if (userZoomedRef.current) return;
    fitToWidth();
    const el = canvasRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => { if (!userZoomedRef.current) fitToWidth(); });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fitToWidth]);

  const resetFit = useCallback(() => { userZoomedRef.current = false; fitToWidth(); }, [fitToWidth]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8f8f4' }}>

      {/* Zoom toolbar */}
      <div style={{
        display: 'flex', gap: 6, padding: '4px 10px', flexShrink: 0,
        borderBottom: '1px solid #e5e5e5', background: '#fff', alignItems: 'center',
      }}
      >
        <button onClick={zoomIn} style={zBtnStyle}><ZoomIn size={13} /></button>
        <button onClick={zoomOut} style={zBtnStyle}><ZoomOut size={13} /></button>
        <button onClick={resetFit} style={zBtnStyle} title="Fit to width"><Maximize2 size={13} /></button>
        <span style={{ fontSize: 10, color: '#aaa', marginLeft: 4 }}>{Math.round(zoom * 100)}% · fit to width · scroll to zoom</span>
        <span style={{ fontSize: 10, color: '#bbb', marginLeft: 'auto' }}>{sv2Data.name}</span>
      </div>

      {/* Canvas — the SVG is sized to totalW*zoom so the scroll region matches the
          visible content and the right-hand side is always reachable. */}
      <div ref={canvasRef} onWheel={handleWheel} style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ width: totalW * zoom, height: totalH * zoom }}>
          <svg viewBox={`0 0 ${totalW} ${totalH}`} width={totalW * zoom} height={totalH * zoom}
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'block', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}
          >

            <defs>
              {/* Forward arrowhead */}
              <marker id="arr" markerWidth={ARROW_SIZE} markerHeight={ARROW_SIZE}
                refX={ARROW_SIZE - 1} refY={ARROW_SIZE / 2}
                orient="auto" markerUnits="userSpaceOnUse"
              >
                <path d={`M 0 0 L ${ARROW_SIZE} ${ARROW_SIZE / 2} L 0 ${ARROW_SIZE} z`} fill="#64748b" />
              </marker>
              {/* Reverse arrowhead for bidirectional edges */}
              <marker id="arr-rev" markerWidth={ARROW_SIZE} markerHeight={ARROW_SIZE}
                refX={1} refY={ARROW_SIZE / 2}
                orient="auto-start-reverse" markerUnits="userSpaceOnUse"
              >
                <path d={`M 0 0 L ${ARROW_SIZE} ${ARROW_SIZE / 2} L 0 ${ARROW_SIZE} z`} fill="#64748b" />
              </marker>
              <filter id="sh" x="-8%" y="-8%" width="120%" height="130%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#00000018" />
              </filter>
            </defs>

            <LeftPanel totalH={totalH} label={testSuiteLabel} />

            {(sv2Data.layers || []).map(layer => (
              <LayerBand key={layer.id} layer={layer} sgMap={sgMap} compMap={compMap}
                subgroups={(sv2Data.subgroups || []).filter(sg => sg.layerId === layer.id)}
                components={(sv2Data.components || []).filter(c =>
                  c.layerId === layer.id ||
                  (c.subgroupId && sgMap[c.subgroupId]?.layerId === layer.id)
                )}
              />
            ))}

            {/* Edges — drawn under labels */}
            <g>
              {annotatedEdges.map((edge, i) => {
                const ep = buildEdgePath(edge, compMap);
                if (!ep) return null;
                const dashed = edge.style === 'dashed';
                return (
                  <g key={`e${i}`}>
                    <path
                      d={ep.d}
                      fill="none"
                      stroke={dashed ? '#94a3b8' : '#64748b'}
                      strokeWidth={dashed ? 1.2 : 1.5}
                      strokeDasharray={dashed ? '5,4' : undefined}
                      markerEnd="url(#arr)"
                      markerStart={edge.bidirectional ? 'url(#arr-rev)' : undefined}
                      opacity={0.75}
                    />
                    {edge.label && (
                      <EdgeLabel
                        x={ep.labelX ?? ep.midX}
                        y={ep.labelY ?? ep.midY}
                        label={edge.label}
                      />
                    )}
                  </g>
                );
              })}
            </g>

            {commsBars.length > 0 && (
              <CommsPanel totalH={totalH} bars={commsBars} layers={sv2Data.layers || []} />
            )}

          </svg>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function LeftPanel({ totalH, label }) {
  const items = label ? [label] : ['OPA Unit Tests', 'Integration Tests', 'Hardware-in-Loop'];
  return (
    <g>
      <rect x={0} y={0} width={LEFT_PANEL_W} height={totalH} fill="#f0f0ec" stroke="#d0d0cc" strokeWidth={1} />
      <rect x={4} y={4} width={LEFT_PANEL_W - 8} height={24} fill="#e4e4e0" rx={4} />
      <text x={LEFT_PANEL_W / 2} y={20} textAnchor="middle" fontSize={10} fontWeight={700} fill="#555">
        Test Suite
      </text>
      <line x1={6} y1={34} x2={LEFT_PANEL_W - 6} y2={34} stroke="#ccc" strokeWidth={0.5} />
      {items.map((item, i) => (
        <g key={i}>
          <rect x={8} y={42 + i * 36} width={LEFT_PANEL_W - 16} height={28}
            fill="#fff" rx={4} stroke="#d4d4d0" strokeWidth={0.75} filter="url(#sh)"
          />
          <text x={LEFT_PANEL_W / 2} y={42 + i * 36 + 17} textAnchor="middle" fontSize={8.5} fill="#555">
            {item}
          </text>
        </g>
      ))}
      <text x={12} y={totalH / 2}
        transform={`rotate(-90 12 ${totalH / 2})`}
        textAnchor="middle" fontSize={9} fontWeight={600} fill="#ccc" letterSpacing={1}
      >
        TEST SUITE
      </text>
    </g>
  );
}

function LayerBand({ layer, subgroups, components, sgMap, compMap }) {
  const bx = MAIN_OFF_X;
  const by = layer.y;
  const bw = MAIN_W;
  const bh = layer.height;
  const labelX = LEFT_PANEL_W;
  const textColor = LABEL_COLORS[layer.id] || '#444';

  const directComps = components.filter(c => c.layerId === layer.id && !c.subgroupId);
  const sgComps     = components.filter(c => c.subgroupId && sgMap[c.subgroupId]?.layerId === layer.id);

  return (
    <g>
      {/* Label column */}
      <rect x={labelX} y={by} width={LABEL_COL_W} height={bh}
        fill={layer.color} fillOpacity={0.6} stroke="#c8c8c4" strokeWidth={0.5}
      />
      <text
        x={labelX + LABEL_COL_W / 2} y={by + bh / 2}
        transform={`rotate(-90 ${labelX + LABEL_COL_W / 2} ${by + bh / 2})`}
        textAnchor="middle" fontSize={10} fontWeight={700} fill={textColor} letterSpacing={0.5}
      >
        {layer.label.toUpperCase()}
      </text>

      {/* Main band */}
      <rect x={bx} y={by} width={bw} height={bh}
        fill={layer.color} fillOpacity={0.22} stroke="#c0c0bc" strokeWidth={0.75}
      />

      {/* Subgroups */}
      {subgroups.map(sg => {
        const s = sgMap[sg.id];
        if (!s) return null;
        return (
          <g key={sg.id}>
            <rect x={bx + s.absX} y={s.absY} width={s.width} height={s.height}
              fill={sg.color || '#dde8f0'} fillOpacity={0.55}
              stroke="#9baaba" strokeWidth={0.75} rx={SG_R}
            />
            <text x={bx + s.absX + 8} y={s.absY + 13}
              fontSize={7.5} fontWeight={700} fill="#667" letterSpacing={0.3}
            >
              {(sg.label || '').toUpperCase()}
            </text>
          </g>
        );
      })}

      {/* Direct layer components */}
      {directComps.map(comp => {
        const cp = compMap[comp.id];
        if (!cp) return null;
        return <CompBox key={comp.id} comp={comp} absX={bx + cp.absX} absY={cp.absY} />;
      })}

      {/* Subgroup components */}
      {sgComps.map(comp => {
        const cp = compMap[comp.id];
        if (!cp) return null;
        return <CompBox key={comp.id} comp={comp} absX={bx + cp.absX} absY={cp.absY} />;
      })}
    </g>
  );
}

function CompBox({ comp, absX, absY }) {
  const w = comp.width  || 150;
  const h = comp.height || 45;
  const lines = (comp.label || '').split('\n');
  const lineH  = 13;
  const totalTH = lines.length * lineH;
  const startY  = absY + Math.max(0, (h - totalTH) / 2) + lineH - 2;

  return (
    <g>
      <rect x={absX} y={absY} width={w} height={h}
        fill="#ffffff" stroke="#9ab0c8" strokeWidth={1}
        rx={COMP_R} filter="url(#sh)"
      />
      {lines.map((line, i) => (
        <text key={i}
          x={absX + w / 2} y={startY + i * lineH}
          textAnchor="middle" fontSize={9} fill="#1e293b"
          fontWeight={i === 0 ? 600 : 400}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function EdgeLabel({ x, y, label }) {
  const text = (label || '').replace(/\n/g, ' / ');
  const trimmed = text.length > 22 ? text.slice(0, 21) + '…' : text;
  const w = trimmed.length * 5.0 + 10;
  return (
    <g>
      <rect x={x - w / 2} y={y - 8} width={w} height={13}
        fill="rgba(255,255,255,0.92)" stroke="#cdd5e0" strokeWidth={0.5} rx={3}
      />
      <text x={x} y={y + 2.5} textAnchor="middle" fontSize={7.5} fill="#475569">
        {trimmed}
      </text>
    </g>
  );
}

function CommsPanel({ totalH, bars, layers }) {
  const px = MAIN_OFF_X + MAIN_W;
  return (
    <g>
      <rect x={px} y={0} width={RIGHT_PANEL_W} height={totalH}
        fill="#f5f5f0" stroke="#d0d0cc" strokeWidth={1}
      />
      <rect x={px + 4} y={4} width={RIGHT_PANEL_W - 8} height={22} fill="#e4e4e0" rx={3} />
      <text x={px + RIGHT_PANEL_W / 2} y={19}
        textAnchor="middle" fontSize={9} fontWeight={700} fill="#555" letterSpacing={0.3}
      >
        Communications
      </text>
      {bars.map((bar, i) => {
        const bx = px + 14 + i * (COMMS_BAR_W + COMMS_BAR_GAP);
        const by = 32;
        const bh = totalH - 40;
        return (
          <g key={bar.id}>
            <rect x={bx} y={by} width={COMMS_BAR_W} height={bh}
              fill={bar.color} fillOpacity={0.82} rx={3}
            />
            <text x={bx + COMMS_BAR_W / 2} y={by + bh / 2}
              transform={`rotate(-90 ${bx + COMMS_BAR_W / 2} ${by + bh / 2})`}
              textAnchor="middle" fontSize={8} fontWeight={700} fill="#fff" letterSpacing={0.5}
            >
              {bar.label}
            </text>
            {layers.map(layer => (
              <line key={`tick-${bar.id}-${layer.id}`}
                x1={bx} y1={layer.y} x2={bx + COMMS_BAR_W} y2={layer.y}
                stroke="rgba(0,0,0,0.18)" strokeWidth={0.75}
              />
            ))}
          </g>
        );
      })}
    </g>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const zBtnStyle = {
  padding: '3px 7px', border: '1px solid #e0e0e0', borderRadius: 4,
  background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#555',
};

export default SV2LayerCakeRenderer;
