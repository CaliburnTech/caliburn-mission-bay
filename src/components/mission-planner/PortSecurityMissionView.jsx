import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import {
  MapContainer, TileLayer, Circle, CircleMarker, Polyline, Tooltip, ZoomControl, useMap
} from 'react-leaflet';
import {
  Play, RotateCcw, Anchor, ChevronLeft, Check, Settings
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { individualCapabilities } from '../../data/marketplaceData';
import useMissionStore from '../../store/missionStore';

// ─── Geography ───────────────────────────────────────────────────────────────
const NM_TO_M = 1852;
const COVERAGE_M = 20 * NM_TO_M;

const NBSD       = [32.681, -117.131];  // Naval Base San Diego (32nd St)
const MAP_CENTER = [32.57,  -117.60];   // Map view — shows approaches + all 3 boats

// Boats placed at exactly 20nm from NBSD on correct bearings (verified w/ haversine)
// NW 315° → 20nm, W 270° → 20nm, SW 225° → 20nm
const BOATS = [
  { id: 'HORUS-1', pos: [32.916, -117.412], sector: 'NW Screen' },   // 20.0nm from NBSD
  { id: 'HORUS-2', pos: [32.681, -117.527], sector: 'W Screen'  },   // 20.0nm from NBSD
  { id: 'HORUS-3', pos: [32.445, -117.410], sector: 'SW Screen' },   // 20.0nm from NBSD
];

// Alert chain — H3 detects → mesh to H2 → mesh to H1 → H1 pings shore
const CHAIN_SEGS = [
  { id: 'h3-h2',    from: BOATS[2].pos, to: BOATS[1].pos, pulseStart: 58, pulseEnd: 63 },
  { id: 'h2-h1',    from: BOATS[1].pos, to: BOATS[0].pos, pulseStart: 63, pulseEnd: 68 },
  { id: 'h1-shore', from: BOATS[0].pos, to: NBSD,         pulseStart: 68, pulseEnd: 75 },
];

// Bad guy USV — approaches from SW Pacific through HORUS-3's (SW) zone
// Verified: enters HORUS-3's 20nm zone at tick ~39 (21.4nm→16.8nm across WP3→WP4)
// Bad guy keeps approaching NBSD — no retreat
const APPROACH_TRACK = [
  [32.10, -118.10],   // start: ~41nm from HORUS-3, outside all zones
  [32.16, -118.02],
  [32.22, -117.93],
  [32.28, -117.84],   // ~24nm from HORUS-3 — early radar return
  [32.33, -117.76],   // crossing 20nm boundary
  [32.38, -117.67],
  [32.43, -117.59],   // deep in zone
];

// After APPROACH_TICKS the bad guy continues on this vector toward NBSD
const APPROACH_CONTINUE_END = [32.60, -117.30];

// Tick at which HORUS-2 corroborates SIERRA-7743 → localization achieved (2 sensors)
const LOCALIZE_TICK = 67;

// Interceptor launches from NBSD at tick 84 and meets bad guy here at tick 115
const INTERCEPT_POINT = APPROACH_CONTINUE_END;
const INTERCEPT_TICK  = 115;

const APPROACH_TICKS = 90;
const TOTAL_TICKS    = INTERCEPT_TICK + 10;  // brief hold after kill

// ─── Loadout (Port Security Mission Set) ─────────────────────────────────────
const CAP_NAMES = [
  'Towed Hydrophone Array',
  'OrbComm ST 6100',
  'MOOS-IvP',
];

const PRESETS = {
  standard: {
    label: 'Comms + Autonomy',
    ids: new Set(['OrbComm ST 6100', 'MOOS-IvP']),
  },
  enhanced: {
    label: 'Full Mission Set',
    ids: new Set(CAP_NAMES),
  },
};

// ─── HORUS mount-point layout (Port Security Mission Set) ─────────────────────
const HORUS_MOUNTS = [
  { id: 'hydrophone', label: 'Towed Hydrophone', type: 'ACOUSTIC/SONAR',   capName: 'Towed Hydrophone Array' },
  { id: 'orbcomm',    label: 'SATCOM Terminal',  type: 'SATCOM',            capName: 'OrbComm ST 6100'        },
  { id: 'moos',       label: 'Autonomy Engine',  type: 'UNMANNED SYSTEMS',  capName: 'MOOS-IvP'               },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

const trackPos = (track, t) => {
  const clamped = Math.min(Math.max(t, 0), 0.9999);
  const progress = clamped * (track.length - 1);
  const idx = Math.floor(progress);
  return lerp2(track[idx], track[idx + 1], progress - idx);
};

const EVENT_COLORS = {
  warn:    'text-amber-400',
  alert:   'text-red-400',
  info:    'text-cyan-400',
  blue:    'text-blue-400',
  success: 'text-emerald-400',
};

// ─── Tile layers ─────────────────────────────────────────────────────────────
const TILE_BASE    = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const TILE_SEAMARK = 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png';

// Forces Leaflet to recalculate tile layout after flex containers settle
const MapInvalidateSize = () => {
  const map = useMap();
  useEffect(() => {
    const timers = [100, 300, 600].map(d => setTimeout(() => map.invalidateSize(), d));
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(map.getContainer());
    return () => { timers.forEach(clearTimeout); ro.disconnect(); };
  }, [map]);
  return null;
};

// ─── Component ───────────────────────────────────────────────────────────────
const PortSecurityMissionView = ({ mission, onBack }) => {
  const { saveMission, updateMission } = useMissionStore();

  // Metadata
  const [missionName, setMissionName] = useState(mission?.name || '');

  // Animation
  const [phase,        setPhase]        = useState('idle');
  const [badGuyPos,    setBadGuyPos]    = useState(null);
  const [detectedBoats, setDetectedBoats] = useState(new Set());
  const [localized,     setLocalized]     = useState(false);
  const [interceptorPos, setInterceptorPos] = useState(null);  // moving blue force
  const [killed,         setKilled]         = useState(false);  // intercept fired
  const [killPos,        setKillPos]        = useState(null);
  const [meshPulse,    setMeshPulse]    = useState(false);
  const [circPulse,    setCircPulse]    = useState(false);
  const [complete,     setComplete]     = useState(false);
  const [running,      setRunning]      = useState(false);
  const [events,       setEvents]       = useState([]);
  const [currentTick,  setCurrentTick]  = useState(0);   // drives chain animation

  // Loadout (fixed to full mission set — sidebar panel removed)
  const preset   = 'enhanced';
  const enabled  = new Set(PRESETS.enhanced.ids);

  const tickRef    = useRef(0);
  const mainTimer  = useRef(null);
  const meshTimer  = useRef(null);
  const circTimer  = useRef(null);
  const addEvtRef  = useRef(null);

  // Keep addEvent fresh in closures — update the ref outside render via useLayoutEffect
  const _addEvent = (msg, type = 'info') => {
    const ts = new Date().toLocaleTimeString('en-US', {
      hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    setEvents(prev => [{ ts, msg, type, id: `${ts}-${msg.slice(0, 10)}` }, ...prev].slice(0, 22));
  };
  useLayoutEffect(() => {
    addEvtRef.current = _addEvent;
  });

  // Mesh pulse tied to phase
  useEffect(() => {
    clearInterval(meshTimer.current);
    if (['detection', 'localization', 'mesh_alert', 'response'].includes(phase)) {
      meshTimer.current = setInterval(() => setMeshPulse(p => !p), 280);
      return () => clearInterval(meshTimer.current);
    }
    setMeshPulse(false);
  }, [phase]);

  // Circle pulse on detection / localization
  useEffect(() => {
    clearInterval(circTimer.current);
    if (['detection', 'localization', 'mesh_alert'].includes(phase)) {
      circTimer.current = setInterval(() => setCircPulse(p => !p), 380);
      return () => clearInterval(circTimer.current);
    }
    setCircPulse(false);
  }, [phase]);

  const stopAll = useCallback(() => {
    clearInterval(mainTimer.current);
    clearInterval(meshTimer.current);
    clearInterval(circTimer.current);
    mainTimer.current = meshTimer.current = circTimer.current = null;
  }, []);

  const reset = useCallback(() => {
    stopAll();
    tickRef.current = 0;
    setPhase('idle');
    setBadGuyPos(null);
    setDetectedBoats(new Set());
    setLocalized(false);
    setInterceptorPos(null);
    setKilled(false);
    setKillPos(null);
    setMeshPulse(false);
    setCircPulse(false);
    setComplete(false);
    setRunning(false);
    setEvents([]);
    setCurrentTick(0);
  }, [stopAll]);

  const runScenario = useCallback(() => {
    stopAll();
    tickRef.current = 0;
    // Reset visual state for fresh run
    setPhase('approach');
    setBadGuyPos(APPROACH_TRACK[0]);
    setDetectedBoats(new Set());
    setLocalized(false);
    setInterceptorPos(null);
    setKilled(false);
    setKillPos(null);
    setMeshPulse(false);
    setCircPulse(false);
    setComplete(false);
    setRunning(true);
    setEvents([]);
    setCurrentTick(0);

    addEvtRef.current('Fleet GCCS: unidentified surface track SIERRA-7743, 41nm SW, bearing 040°, no AIS', 'warn');

    mainTimer.current = setInterval(() => {
      const tick = ++tickRef.current;

      // ── Bad guy position — keeps advancing until intercepted ──
      if (tick <= APPROACH_TICKS) {
        setBadGuyPos(trackPos(APPROACH_TRACK, tick / APPROACH_TICKS));
      } else if (tick < INTERCEPT_TICK) {
        const t = (tick - APPROACH_TICKS) / (INTERCEPT_TICK - APPROACH_TICKS);
        setBadGuyPos(lerp2(APPROACH_TRACK[APPROACH_TRACK.length - 1], APPROACH_CONTINUE_END, t));
      }

      // ── Interceptor position — moves from NBSD to intercept point ──
      if (tick >= 84 && tick < INTERCEPT_TICK) {
        const t = (tick - 84) / (INTERCEPT_TICK - 84);
        setInterceptorPos(lerp2(NBSD, INTERCEPT_POINT, t));
      }

      // Drive chain animation
      setCurrentTick(tick);

      // ── Events ──
      if (tick === 45) {
        // bad guy at ~24nm from HORUS-3
        addEvtRef.current('HORUS-3: Radar correlation — SIERRA-7743, 24nm, no AIS. Monitoring.', 'warn');
      }
      if (tick === 58) {
        // actual zone entry (haversine-verified at 19.7nm from HORUS-3)
        setDetectedBoats(new Set(['HORUS-3']));
        setPhase('detection');
        addEvtRef.current('HORUS-3: CONTACT IN ZONE — hostile USV, IFF negative, VHF no reply', 'alert');
      }
      if (tick === 63) {
        // h3→h2 mesh link completes — HORUS-2 cued
        addEvtRef.current('HORUS-3 → HORUS-2: Detection relay — cueing second sensor', 'info');
      }
      if (tick === LOCALIZE_TICK) {
        // HORUS-2 independently acquires — 2 sensors tracking → LOCALIZATION achieved
        setDetectedBoats(new Set(['HORUS-3', 'HORUS-2']));
        setLocalized(true);
        setPhase('localization');
        addEvtRef.current('HORUS-2: Track corroborated — LOCALIZATION acquired. 2 sensors on SIERRA-7743.', 'blue');
        addEvtRef.current('NET: Multi-sensor fusion complete — cueing blue force interceptor', 'blue');
      }
      if (tick === 68) {
        // h2→h1 mesh link completes — full inter-boat cordon, H1 now pings shore
        setPhase('mesh_alert');
        addEvtRef.current('HORUS-1: Alert received — relaying to MOC NBSD', 'info');
      }
      if (tick === 75) {
        // h1→shore completes — MOC receives alert via HORUS-1
        addEvtRef.current('NBSD MOC: Alert received from HORUS-1 — track confirmed hostile', 'alert');
      }
      if (tick === 79) {
        addEvtRef.current('MOC NBSD: Blue forces authorized — intercepting', 'alert');
      }
      if (tick === 84) {
        setPhase('response');
        addEvtRef.current('INTERCEPTOR: Launching from Naval Base San Diego', 'blue');
      }
      if (tick === INTERCEPT_TICK) {
        // Kill
        setBadGuyPos(null);
        setInterceptorPos(null);
        setKilled(true);
        setKillPos(INTERCEPT_POINT);
        setPhase('intercepted');
        addEvtRef.current('INTERCEPTOR: CONTACT NEUTRALIZED — SIERRA-7743 eliminated', 'success');
      }
      if (tick === TOTAL_TICKS) {
        stopAll();
        setRunning(false);
        setComplete(true);
        addEvtRef.current('PERIMETER SECURED — threat eliminated, zone clear', 'success');
      }
    }, 180);
  }, [stopAll]);

  // Cleanup on unmount
  useEffect(() => () => stopAll(), [stopAll]);

  // ── Chain link helpers ── (mocOpacity removed — replaced by CHAIN_SEGS) — derive state from currentTick (no extra state needed)
  const chainState = (seg) => {
    if (currentTick < seg.pulseStart) return 'inactive';
    if (currentTick <= seg.pulseEnd)  return 'pulsing';
    return 'active';
  };
  const chainPulsePos = (seg) => {
    if (currentTick < seg.pulseStart || currentTick > seg.pulseEnd) return null;
    const t = (currentTick - seg.pulseStart) / (seg.pulseEnd - seg.pulseStart);
    return lerp2(seg.from, seg.to, Math.min(t, 1));
  };

  const circleOpts = (boatId) => {
    const isDetecting = detectedBoats.has(boatId);
    if (phase === 'intercepted') {
      return { color: '#10b981', fillColor: '#10b981', fillOpacity: 0.06, weight: 1.5, dashArray: '6 4' };
    }
    if (isDetecting && circPulse) {
      // Localized boats pulse blue; first-detect boat pulses red
      const pulseColor = (localized && boatId !== 'HORUS-3') ? '#3b82f6' : '#ef4444';
      return { color: pulseColor, fillColor: pulseColor, fillOpacity: 0.13, weight: 3, dashArray: null };
    }
    if (isDetecting || (detectedBoats.size > 0 && ['mesh_alert', 'response'].includes(phase))) {
      return { color: '#f97316', fillColor: '#f97316', fillOpacity: 0.07, weight: 2, dashArray: '5 3' };
    }
    return { color: '#06b6d4', fillColor: '#06b6d4', fillOpacity: 0.05, weight: 1.5, dashArray: '6 5' };
  };

  const handleSave = () => {
    if (!missionName.trim()) return;
    const data = {
      name: missionName.trim(),
      template: 'PORT_SECURITY',
      domain: 'MARITIME',
      status: 'draft',
      duration: '30d',
      zoneConfig: { center: { lat: NBSD[0], lng: NBSD[1] }, radius: 20, assetName: 'Naval Base San Diego' },
      assignedSquadrons: [],
      loadout: { preset, capabilities: [...enabled] },
      stateHierarchies: {
        default:        ['Navigation', 'Payload', 'Comms', 'Mission', 'Vehicle'],
        contact_flagged:['Payload', 'Mission', 'Comms', 'Navigation', 'Vehicle'],
        comms_degraded: ['Navigation', 'Comms', 'Mission', 'Vehicle', 'Payload'],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      launchedAt: null,
      history: [{ action: 'created', timestamp: new Date().toISOString() }],
    };
    if (mission?.id) updateMission(mission.id, data);
    else saveMission(data);
    onBack();
  };

  const portCaps = individualCapabilities.filter(c => CAP_NAMES.includes(c.name));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-darkest overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-700/50 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-[0.75rem]"
        >
          <ChevronLeft size={13} /> Back to Library
        </button>
        <div className="w-px h-4 bg-gray-700/60" />
        <Anchor size={13} className="text-emerald-400" />
        <span className="text-emerald-400 text-[0.8rem] font-semibold tracking-wide">Port Security</span>
        <div className="flex-1" />
        <input
          value={missionName}
          onChange={e => setMissionName(e.target.value)}
          placeholder="Mission name…"
          className="bg-gray-800/60 border border-gray-700/60 rounded-md px-3 py-1.5 text-white text-[0.78rem] w-52 placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
        />
        <button
          onClick={handleSave}
          disabled={!missionName.trim()}
          className={`px-3 py-1.5 rounded-md text-[0.78rem] font-semibold transition-colors ${
            missionName.trim()
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-gray-700/50 text-gray-600 cursor-not-allowed'
          }`}
        >
          Save Draft
        </button>
      </div>

      {/* ── Scrollable content (animation + outfitter) ── */}
      <div className="flex-1 min-h-0 overflow-y-auto">

      {/* ── Animation row ── */}
      <div className="flex" style={{ height: '430px' }}>

        {/* ── Map ── */}
        <div className="flex-1 relative overflow-hidden">
          <MapContainer
            center={MAP_CENTER}
            zoom={9}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
            scrollWheelZoom
            attributionControl={false}
          >
            <ZoomControl position="topright" />
            <TileLayer url={TILE_BASE} />
            <TileLayer url={TILE_SEAMARK} opacity={0.6} />
            <MapInvalidateSize />

            {/* ── 20nm coverage circles ── */}
            {BOATS.map(b => (
              <React.Fragment key={b.id}>
                <Circle center={b.pos} radius={COVERAGE_M} pathOptions={circleOpts(b.id)} />
                {/* Pulse ring on detection / localization */}
                {detectedBoats.has(b.id) && circPulse && (
                  <Circle
                    center={b.pos}
                    radius={COVERAGE_M * 1.03}
                    pathOptions={{
                      color:   localized && b.id !== 'HORUS-3' ? '#3b82f6' : '#ef4444',
                      fillOpacity: 0,
                      weight:  3,
                      opacity: 0.55,
                    }}
                  />
                )}
              </React.Fragment>
            ))}

            {/* ── Sensor-to-contact tracking lines ── */}
            {/* Detection: HORUS-3 lock-on line (amber) */}
            {badGuyPos && detectedBoats.has('HORUS-3') && (
              <Polyline
                positions={[BOATS[2].pos, badGuyPos]}
                pathOptions={{ color: '#f97316', weight: 1.5, opacity: meshPulse ? 0.75 : 0.35, dashArray: '4 6' }}
              />
            )}
            {/* Localization: HORUS-2 corroboration line (blue) */}
            {badGuyPos && detectedBoats.has('HORUS-2') && (
              <Polyline
                positions={[BOATS[1].pos, badGuyPos]}
                pathOptions={{ color: '#3b82f6', weight: 1.5, opacity: meshPulse ? 0.80 : 0.38, dashArray: '4 6' }}
              />
            )}

            {/* ── Ambient mesh background (all pairs, very dim) ── */}
            {BOATS.flatMap((b, i) =>
              BOATS.slice(i + 1).map(b2 => (
                <Polyline
                  key={`mesh-bg-${b.id}-${b2.id}`}
                  positions={[b.pos, b2.pos]}
                  pathOptions={{ color: '#06b6d4', opacity: 0.10, weight: 1, dashArray: '3 9' }}
                />
              ))
            )}

            {/* ── Alert chain — sequential pulse propagation ── */}
            {CHAIN_SEGS.map(seg => {
              const state   = chainState(seg);
              const pulsePt = chainPulsePos(seg);
              const isShore = seg.id.includes('shore');
              const activeColor = isShore ? '#f97316' : '#06b6d4';
              return (
                <React.Fragment key={seg.id}>
                  {/* Persistent line once activated */}
                  {state !== 'inactive' && (
                    <Polyline
                      positions={[seg.from, seg.to]}
                      pathOptions={{
                        color:     activeColor,
                        opacity:   state === 'active' ? 0.70 : 0.28,
                        weight:    state === 'active' ? 2 : 1.5,
                        dashArray: state === 'active' ? null : '4 6',
                      }}
                    />
                  )}
                  {/* Traveling pulse dot */}
                  {pulsePt && (
                    <CircleMarker
                      center={pulsePt}
                      radius={4}
                      pathOptions={{
                        color: activeColor, fillColor: '#fff',
                        fillOpacity: 0.95, weight: 2,
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}

            {/* ── Boat markers ── */}
            {BOATS.map(b => (
              <CircleMarker
                key={b.id}
                center={b.pos}
                radius={7}
                pathOptions={{ color: '#06b6d4', fillColor: '#06b6d4', fillOpacity: 0.9, weight: 2 }}
              >
                <Tooltip direction="top" offset={[0, -10]}>
                  <div style={{ fontSize: 11 }}>
                    <strong>SubSeaSail {b.id}</strong><br />
                    {b.sector} · 20 nm coverage
                  </div>
                </Tooltip>
              </CircleMarker>
            ))}

            {/* ── Naval Base San Diego ── */}
            <CircleMarker
              center={NBSD}
              radius={8}
              pathOptions={{
                color:       currentTick >= 75 ? '#f97316' : '#10b981',
                fillColor:   currentTick >= 75 ? '#f97316' : '#10b981',
                fillOpacity: 1,
                weight:      2,
              }}
            >
              <Tooltip permanent direction="right" offset={[12, 0]}>
                <span style={{ fontSize: 11, fontWeight: 700 }}>
                  {currentTick >= 75 ? '⚡ MOC NBSD' : 'Naval Base San Diego'}
                </span>
              </Tooltip>
            </CircleMarker>
            {/* Alert pulse ring on NBSD once H1's shore link arrives */}
            {currentTick >= 75 && currentTick < 84 && meshPulse && (
              <CircleMarker
                center={NBSD}
                radius={14}
                pathOptions={{ color: '#f97316', fillOpacity: 0, weight: 2, opacity: 0.5 }}
              />
            )}

            {/* ── Interceptor trail ── */}
            {interceptorPos && (
              <Polyline
                positions={[NBSD, interceptorPos]}
                pathOptions={{ color: '#3b82f6', weight: 2, opacity: 0.45, dashArray: '4 5' }}
              />
            )}

            {/* ── Interceptor vessel (moving blue force) ── */}
            {interceptorPos && (
              <CircleMarker
                center={interceptorPos}
                radius={7}
                pathOptions={{ color: '#3b82f6', fillColor: '#93c5fd', fillOpacity: 1, weight: 2 }}
              >
                <Tooltip direction="top" offset={[0, -10]}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6' }}>↗ Interceptor</span>
                </Tooltip>
              </CircleMarker>
            )}

            {/* ── Kill marker ── */}
            {killed && killPos && (
              <CircleMarker
                center={killPos}
                radius={11}
                pathOptions={{ color: '#ef4444', fillColor: '#f97316', fillOpacity: 0.75, weight: 3 }}
              >
                <Tooltip permanent direction="top" offset={[0, -14]}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444' }}>✕ NEUTRALIZED</span>
                </Tooltip>
              </CircleMarker>
            )}

            {/* ── Bad guy USV (keeps advancing until killed) ── */}
            {badGuyPos && (
              <CircleMarker
                center={badGuyPos}
                radius={8}
                pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.9, weight: 2 }}
              >
                <Tooltip permanent direction="top" offset={[0, -12]}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444' }}>⚠ SIERRA-7743</span>
                </Tooltip>
              </CircleMarker>
            )}
          </MapContainer>

          {/* ── Phase status badge ── */}
          {phase !== 'idle' && (
            <div className={`absolute top-3 left-3 z-[500] px-3 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wider pointer-events-none ${
              phase === 'intercepted'
                ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-500/40'
                : phase === 'response'
                ? 'bg-blue-900/80 text-blue-300 border border-blue-500/40'
                : phase === 'localization'
                ? 'bg-blue-900/80 text-blue-200 border border-blue-400/50 animate-pulse'
                : phase === 'detection' || phase === 'mesh_alert'
                ? 'bg-red-900/80 text-red-300 border border-red-500/40 animate-pulse'
                : 'bg-amber-900/80 text-amber-300 border border-amber-500/40'
            }`}
            >
              {phase === 'approach'      && '● Tracking Contact'}
              {phase === 'detection'     && '⚠ Detection — 1 Sensor'}
              {phase === 'localization'  && '◈ Localization — 2 Sensors'}
              {phase === 'mesh_alert'    && '⚡ Mesh Alert — All Units'}
              {phase === 'response'      && '→ Interceptor Inbound'}
              {phase === 'intercepted'   && '✓ Contact Neutralized'}
            </div>
          )}

          {/* ── Detection / Localization HUD (bottom-left) ── */}
          {currentTick >= 58 && currentTick < INTERCEPT_TICK && (
            <div className="absolute bottom-3 left-3 z-[500] pointer-events-none">
              <div className={`px-3 py-2.5 rounded-xl backdrop-blur-sm border transition-all ${
                localized
                  ? 'bg-blue-950/90 border-blue-500/40'
                  : 'bg-amber-950/90 border-amber-500/40'
              }`}
              >
                <div className={`text-[0.72rem] font-bold uppercase tracking-widest ${
                  localized ? 'text-blue-200' : 'text-amber-200'
                }`}
                >
                  {localized ? '◈ Localization' : '◉ Detection'}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  {BOATS.map(b => (
                    <div
                      key={b.id}
                      className={`w-2 h-2 rounded-full ${
                        detectedBoats.has(b.id)
                          ? localized && b.id === 'HORUS-2'
                            ? 'bg-blue-400'
                            : 'bg-amber-400'
                          : 'bg-gray-600'
                      }`}
                      title={b.id}
                    />
                  ))}
                  <span className="text-[0.62rem] text-gray-400 ml-0.5">
                    {detectedBoats.size}/3 sensors
                  </span>
                </div>
                {localized && (
                  <div className="text-[0.62rem] text-blue-400 mt-1 font-semibold">
                    Blue force cued ↗
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="w-[300px] flex-shrink-0 flex flex-col border-l border-gray-700/50 overflow-hidden bg-darkest">

          {/* Scenario controls */}
          <div className="p-4 border-b border-gray-700/50 flex-shrink-0">
            <p className="text-gray-500 text-[0.65rem] uppercase tracking-widest mb-3">Scenario</p>
            <div className="flex gap-2 mb-2">
              <button
                onClick={runScenario}
                disabled={running}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[0.78rem] font-semibold transition-colors ${
                  running
                    ? 'bg-gray-700/60 text-gray-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <Play size={13} />
                {running ? 'Running…' : complete ? 'Run Again' : 'Run Scenario'}
              </button>
              <button
                onClick={reset}
                className="p-2 rounded-lg bg-gray-700/40 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                title="Reset"
              >
                <RotateCcw size={13} />
              </button>
            </div>
            <p className="text-gray-600 text-[0.68rem]">
              3× SubSeaSail HORUS AUSV · 20 nm coverage each
            </p>
          </div>

          {/* Event log */}
          <div className="flex flex-col overflow-hidden" style={{ flex: '1 1 0' }}>
            <p className="text-gray-500 text-[0.65rem] uppercase tracking-widest px-4 pt-3 pb-2 flex-shrink-0">
              Event Log
            </p>
            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 min-h-0">
              {events.length === 0 ? (
                <p className="text-gray-600 text-[0.7rem] px-1 pt-1">Run the scenario to see live events.</p>
              ) : (
                events.map(e => (
                  <div key={e.id} className="flex gap-2 text-[0.7rem] leading-snug">
                    <span className="text-gray-600 tabular-nums flex-shrink-0 pt-px">{e.ts}</span>
                    <span className={EVENT_COLORS[e.type] ?? 'text-gray-300'}>{e.msg}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>{/* /animation row */}

      {/* ── SubSeaSail HORUS — Outfitter Configuration ─────────────────────── */}
      <div className="border-t border-gray-700/50 flex-shrink-0">

        {/* Section header */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-gray-700/30">
          <div className="w-5 h-5 rounded bg-lime-brand/15 flex items-center justify-center flex-shrink-0">
            <Anchor size={11} color="#cbfd00" />
          </div>
          <span className="text-[0.78rem] font-semibold text-gray-100">SubSeaSail HORUS</span>
          <span className="text-gray-600 text-[0.68rem]">·</span>
          <span className="text-gray-400 text-[0.68rem]">Mission Loadout — 3× per squadron</span>
          <div className="ml-auto flex items-center gap-1.5 text-[0.65rem]">
            <span className="text-gray-600">
              {[...HORUS_MOUNTS].filter(m => enabled.has(m.capName)).length}/{HORUS_MOUNTS.length}
            </span>
            <span className="text-gray-600">slots filled</span>
          </div>
        </div>

        {/* Mount-point cards */}
        <div className="p-4 grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))' }}>
          {HORUS_MOUNTS.map(mount => {
            const isEquipped = enabled.has(mount.capName);
            const cap = portCaps.find(c => c.name === mount.capName);
            const CapIcon = cap?.icon;
            return (
              <div
                key={mount.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isEquipped
                    ? 'bg-lime-brand/5 border border-lime-brand/25'
                    : 'bg-gray-800/20 border border-dashed border-gray-700/35 opacity-40'
                }`}
              >
                {/* Icon */}
                <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${
                  isEquipped ? 'bg-lime-brand/12' : 'bg-gray-700/30'
                }`}
                >
                  {isEquipped && CapIcon
                    ? <CapIcon size={15} color="#cbfd00" />
                    : <Settings size={14} className="text-gray-600" />
                  }
                </div>

                {/* Labels */}
                <div className="flex-1 min-w-0">
                  <div className="text-[0.58rem] text-gray-600 uppercase tracking-widest mb-0.5 truncate">{mount.type}</div>
                  {isEquipped ? (
                    <>
                      <div className="text-[0.73rem] font-semibold text-gray-100 truncate">{mount.capName}</div>
                      <div className="text-[0.62rem] text-gray-500 truncate">{cap?.provider}</div>
                    </>
                  ) : (
                    <div className="text-[0.7rem] text-gray-600 truncate">{mount.label}</div>
                  )}
                </div>

                {/* Status dot */}
                {isEquipped && (
                  <div className="w-4 h-4 rounded-full bg-lime-brand/20 flex items-center justify-center flex-shrink-0">
                    <Check size={9} color="#cbfd00" strokeWidth={3} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>{/* /outfitter */}

      </div>{/* /scrollable content */}
    </div>
  );
};

export default PortSecurityMissionView;
