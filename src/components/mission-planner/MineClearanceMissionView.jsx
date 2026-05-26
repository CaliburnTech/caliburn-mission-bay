import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import {
  MapContainer, TileLayer, CircleMarker, Polyline, Rectangle, Tooltip, ZoomControl, useMap
} from 'react-leaflet';
import { Play, RotateCcw, Anchor, ChevronLeft, Check } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import useMissionStore from '../../store/missionStore';

// ─── Geography ────────────────────────────────────────────────────────────────
const MAP_CENTER = [26.52, 56.35];
const MAP_ZOOM   = 10;

const AUV_SHIP     = [26.78, 56.85];   // USS Lewis B. Puller ESB-3
const MOC_POS      = [26.22, 50.58];   // NSA Bahrain MOC
const HORUS_STAGING = [25.80, 55.90];  // Over-the-horizon launch point

const MINES = [
  { id: 'M1', pos: [26.55, 56.12], label: 'MINE-ALPHA' },
  { id: 'M2', pos: [26.48, 56.24], label: 'MINE-BRAVO' },
  { id: 'M3', pos: [26.53, 56.38], label: 'MINE-CHARLIE' },
  { id: 'M4', pos: [26.44, 56.48], label: 'MINE-DELTA' },
  { id: 'M5', pos: [26.58, 56.50], label: 'MINE-ECHO' },
];

// Flat waypoint array — 5 boustrophedon (lawnmower) passes for trackPos()
const AUV_SWEEP_TRACK = [
  [26.62, 56.00], [26.62, 56.60],  // pass 1 (N, W→E)
  [26.57, 56.60], [26.57, 56.00],  // pass 2 (E→W)
  [26.52, 56.00], [26.52, 56.60],  // pass 3
  [26.47, 56.60], [26.47, 56.00],  // pass 4
  [26.42, 56.00], [26.42, 56.60],  // pass 5 (S)
];

// HORUS vessels — SSS-1 targets M1, SSS-2 targets M2
const HORUS_VESSELS = [
  { id: 'SSS-1', label: 'HORUS-1', targetMine: 'M1' },
  { id: 'SSS-2', label: 'HORUS-2', targetMine: 'M2' },
  { id: 'SSS-3', label: 'HORUS-3', targetMine: null },
];

// ─── Loadouts ─────────────────────────────────────────────────────────────────
const HORUS_MCM_MOUNTS = [
  { slot: 'ACOUSTIC/SONAR', name: 'Acoustic Marker Receiver', vendor: 'Thales',      description: 'Homes on indicator buoy deployed by Freedom AUV' },
  { slot: 'WEAPONS',        name: 'M30 Supercavitating Round', vendor: 'Thales',     description: 'Single-shot mine neutralization — fires through hull bottom' },
  { slot: 'SATCOM',         name: 'OrbComm ST 6100',           vendor: 'OrbComm',   description: 'C2 link — receives mine coordinates via SATCOM relay from Freedom AUV' },
];

const FREEDOM_AUV_MOUNTS = [
  { slot: 'SENSORS', name: 'Micro-SAS Sonar (SAMDIS)',  vendor: 'Thales',      description: '150m swath, 30mm resolution — detects, classifies, localizes mines' },
  { slot: 'PAYLOAD', name: 'Acoustic Indicator Buoy',   vendor: 'Oceaneering', description: 'Deploys acoustic pinger on confirmed mine for HORUS homing' },
  { slot: 'COMMS',   name: 'EvoLogics Acoustic Modem',  vendor: 'EvoLogics',   description: 'Relays mine coordinates to surface relay via underwater acoustic link' },
];

// ─── Tick milestones ──────────────────────────────────────────────────────────
const T_AUV_TRANSIT   = 5;
const T_AUV_ARRIVE    = 15;
const T_SWEEP_START   = 25;
const T_CONTACT_A     = 48;
const T_CLASSIFY      = 55;
const T_CONFIRM_A     = 62;
const T_MARKER_A      = 68;
const T_CONTACT_B     = 75;
const T_CONFIRM_B     = 82;
const T_HORUS_TASK    = 88;
const T_HORUS_ARRIVE  = 115;
const T_ENGAGE_A      = 122;
const T_NEUT_A        = 128;
const T_ENGAGE_B      = 134;
const T_NEUT_B        = 140;
const T_LANE_CLEAR    = 148;
const TOTAL_TICKS     = 162;

// ─── Tile layers ──────────────────────────────────────────────────────────────
const TILE_BASE    = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_SEAMARK = 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png';

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
  success: 'text-emerald-400',
};

// ─── Derived state helpers ────────────────────────────────────────────────────
const getPhase = (tick) => {
  if (tick < T_AUV_TRANSIT)  return 'idle';
  if (tick < T_SWEEP_START)  return 'auv_transit';
  if (tick < T_CONTACT_A)    return 'sweeping';
  if (tick < T_CLASSIFY)     return 'contact_alpha';
  if (tick < T_CONFIRM_A)    return 'classifying';
  if (tick < T_MARKER_A)     return 'marker_alpha_pending';
  if (tick < T_CONTACT_B)    return 'marker_alpha_deployed';
  if (tick < T_CONFIRM_B)    return 'contact_bravo';
  if (tick < T_HORUS_TASK)   return 'marker_bravo_deployed';
  if (tick < T_HORUS_ARRIVE) return 'horus_inbound';
  if (tick < T_ENGAGE_A)     return 'horus_locked';
  if (tick < T_NEUT_A)       return 'engaging_alpha';
  if (tick < T_ENGAGE_B)     return 'alpha_neutralized';
  if (tick < T_NEUT_B)       return 'engaging_bravo';
  if (tick < T_LANE_CLEAR)   return 'bravo_neutralized';
  return 'lane_clear';
};

const getMineState = (mineId, tick) => {
  if (mineId === 'M1') {
    if (tick < T_CONTACT_A) return 'hidden';
    if (tick < T_CONFIRM_A) return 'contact';
    if (tick < T_MARKER_A)  return 'confirmed';
    if (tick < T_ENGAGE_A)  return 'marked';
    if (tick < T_NEUT_A)    return 'engaging';
    return 'neutralized';
  }
  if (mineId === 'M2') {
    if (tick < T_CONTACT_B) return 'hidden';
    if (tick < T_CONFIRM_B) return 'contact';
    if (tick < T_ENGAGE_B)  return 'marked';
    if (tick < T_NEUT_B)    return 'engaging';
    return 'neutralized';
  }
  return 'hidden';
};

const hasPinger = (mineId, tick) => {
  if (mineId === 'M1') return tick >= T_MARKER_A && getMineState('M1', tick) !== 'neutralized';
  if (mineId === 'M2') return tick >= T_CONFIRM_B && getMineState('M2', tick) !== 'neutralized';
  return false;
};

const getAuvPos = (tick) => {
  if (tick < T_AUV_TRANSIT) return null;
  if (tick < T_AUV_ARRIVE) {
    const t = (tick - T_AUV_TRANSIT) / (T_AUV_ARRIVE - T_AUV_TRANSIT);
    return lerp2(AUV_SHIP, AUV_SWEEP_TRACK[0], Math.min(t, 1));
  }
  if (tick <= T_HORUS_TASK) {
    const t = (tick - T_AUV_ARRIVE) / (T_HORUS_TASK - T_AUV_ARRIVE);
    return trackPos(AUV_SWEEP_TRACK, t);
  }
  return AUV_SWEEP_TRACK[AUV_SWEEP_TRACK.length - 1];
};

const getHorusPos = (vessel, tick) => {
  if (!vessel.targetMine || tick < T_HORUS_TASK) return null;
  const mine = MINES.find(m => m.id === vessel.targetMine);
  if (!mine) return null;
  if (tick >= T_HORUS_ARRIVE) return mine.pos;
  const t = (tick - T_HORUS_TASK) / (T_HORUS_ARRIVE - T_HORUS_TASK);
  return lerp2(HORUS_STAGING, mine.pos, Math.min(t, 1));
};

// Returns array of completed + partial sweep polyline segments
const getAuvSweepSegments = (tick) => {
  if (tick < T_AUV_ARRIVE) return [];
  const t = Math.min((tick - T_AUV_ARRIVE) / (T_HORUS_TASK - T_AUV_ARRIVE), 1);
  const progress = t * (AUV_SWEEP_TRACK.length - 1);
  const idx = Math.floor(progress);
  const segs = [];
  for (let i = 0; i < Math.min(idx, AUV_SWEEP_TRACK.length - 1); i++) {
    segs.push([AUV_SWEEP_TRACK[i], AUV_SWEEP_TRACK[i + 1]]);
  }
  if (idx < AUV_SWEEP_TRACK.length - 1) {
    const sub = progress - idx;
    segs.push([AUV_SWEEP_TRACK[idx], lerp2(AUV_SWEEP_TRACK[idx], AUV_SWEEP_TRACK[idx + 1], sub)]);
  }
  return segs;
};

const mineMarkerOpts = (state, pulse) => {
  switch (state) {
    case 'contact':
      return pulse
        ? { color: '#fb923c', fillColor: '#fb923c', fillOpacity: 0.9,  weight: 3 }
        : { color: '#f97316', fillColor: '#f97316', fillOpacity: 0.65, weight: 2 };
    case 'confirmed':
      return { color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.85, weight: 2 };
    case 'marked':
      return { color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.85, weight: 2 };
    case 'engaging':
      return pulse
        ? { color: '#fbbf24', fillColor: '#fbbf24', fillOpacity: 0.95, weight: 3 }
        : { color: '#f97316', fillColor: '#f97316', fillOpacity: 0.85, weight: 3 };
    case 'neutralized':
      return { color: '#10b981', fillColor: '#10b981', fillOpacity: 0.85, weight: 2 };
    default:
      return null;
  }
};

const getPhaseBadge = (phase) => {
  switch (phase) {
    case 'auv_transit':           return { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40',             label: '→ AUV Transit' };
    case 'sweeping':              return { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40',             label: '◈ SAS Sweep Active' };
    case 'contact_alpha':         return { cls: 'bg-amber-900/80 text-amber-300 border-amber-500/40 animate-pulse', label: '⚠ Contact — Classifying' };
    case 'classifying':           return { cls: 'bg-amber-900/80 text-amber-300 border-amber-500/40 animate-pulse', label: '⚠ Classifying Contact' };
    case 'marker_alpha_pending':  return { cls: 'bg-red-900/80 text-red-300 border-red-500/40',               label: '● MINE-ALPHA Confirmed' };
    case 'marker_alpha_deployed': return { cls: 'bg-red-900/80 text-red-300 border-red-500/40',               label: '● MINE-ALPHA Marked' };
    case 'contact_bravo':         return { cls: 'bg-amber-900/80 text-amber-300 border-amber-500/40 animate-pulse', label: '⚠ MINE-BRAVO — Classifying' };
    case 'marker_bravo_deployed': return { cls: 'bg-red-900/80 text-red-300 border-red-500/40',               label: '● 2 Mines Marked' };
    case 'horus_inbound':         return { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40',             label: '→ HORUS Inbound' };
    case 'horus_locked':          return { cls: 'bg-amber-900/80 text-amber-300 border-amber-500/40',         label: '◉ Acoustic Lock' };
    case 'engaging_alpha':        return { cls: 'bg-red-900/80 text-red-300 border-red-500/40 animate-pulse', label: '⚡ Engaging MINE-ALPHA' };
    case 'alpha_neutralized':     return { cls: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40',   label: '✓ MINE-ALPHA Neutralized' };
    case 'engaging_bravo':        return { cls: 'bg-red-900/80 text-red-300 border-red-500/40 animate-pulse', label: '⚡ Engaging MINE-BRAVO' };
    case 'bravo_neutralized':     return { cls: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40',   label: '✓ MINE-BRAVO Neutralized' };
    case 'lane_clear':            return { cls: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40',   label: '✓ Sector Alpha-7 Clear' };
    default:                      return null;
  }
};

// ─── MapInvalidateSize ────────────────────────────────────────────────────────
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
const MineClearanceMissionView = ({ mission, onBack }) => {
  const { saveMission, updateMission } = useMissionStore();

  const [missionName, setMissionName] = useState(mission?.name || '');
  const [currentTick,  setCurrentTick]  = useState(0);
  const [minePulse,    setMinePulse]    = useState(false);
  const [events,       setEvents]       = useState([]);
  const [running,      setRunning]      = useState(false);
  const [complete,     setComplete]     = useState(false);

  const tickRef    = useRef(0);
  const mainTimer  = useRef(null);
  const pulseTimer = useRef(null);
  const addEvtRef  = useRef(null);

  // Derived from currentTick — no stale-closure risk
  const phase    = getPhase(currentTick);
  const auvPos   = getAuvPos(currentTick);
  const sweepSegs = getAuvSweepSegments(currentTick);

  const _addEvent = (msg, type = 'info') => {
    const ts = new Date().toLocaleTimeString('en-US', {
      hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    setEvents(prev => [{ ts, msg, type, id: `${ts}-${msg.slice(0, 10)}` }, ...prev].slice(0, 30));
  };
  useLayoutEffect(() => { addEvtRef.current = _addEvent; });

  // Mine contact / engagement pulse
  useEffect(() => {
    clearInterval(pulseTimer.current);
    const needsPulse = ['contact_alpha', 'classifying', 'contact_bravo', 'engaging_alpha', 'engaging_bravo'].includes(phase);
    if (needsPulse) {
      pulseTimer.current = setInterval(() => setMinePulse(p => !p), 350);
      return () => clearInterval(pulseTimer.current);
    }
    setMinePulse(false);
  }, [phase]);

  const stopAll = useCallback(() => {
    clearInterval(mainTimer.current);
    clearInterval(pulseTimer.current);
    mainTimer.current = pulseTimer.current = null;
  }, []);

  const reset = useCallback(() => {
    stopAll();
    tickRef.current = 0;
    setCurrentTick(0);
    setMinePulse(false);
    setEvents([]);
    setRunning(false);
    setComplete(false);
  }, [stopAll]);

  const runScenario = useCallback(() => {
    stopAll();
    tickRef.current = 0;
    setCurrentTick(0);
    setMinePulse(false);
    setEvents([]);
    setRunning(true);
    setComplete(false);

    mainTimer.current = setInterval(() => {
      const tick = ++tickRef.current;
      setCurrentTick(tick);

      if (tick === T_AUV_TRANSIT) {
        addEvtRef.current('FREEDOM-1: AUV deployed from USS Puller — initiating transit to minefield', 'info');
      }
      if (tick === T_AUV_ARRIVE) {
        addEvtRef.current('FREEDOM-1: Beginning micro-SAS sweep — Pass 1 of 5', 'info');
      }
      if (tick === T_SWEEP_START) {
        addEvtRef.current('FREEDOM-1: SAS sonar active — 150m swath, 0.03m resolution', 'info');
      }
      if (tick === 35) {
        addEvtRef.current('FREEDOM-1: Pass 1 complete — no contacts', 'info');
      }
      if (tick === T_CONTACT_A) {
        addEvtRef.current('FREEDOM-1: CONTACT — bottom object detected at 26.55°N 56.12°E — classifying', 'warn');
      }
      if (tick === T_CLASSIFY) {
        addEvtRef.current('FREEDOM-1: Multi-aspect classification in progress — stand by', 'info');
        addEvtRef.current('MOC NBSD: Freedom-1 contact correlation — checking against HUMINT threat data', 'info');
      }
      if (tick === T_CONFIRM_A) {
        addEvtRef.current('FREEDOM-1: MINE CONFIRMED — moored contact, MINE-ALPHA — confidence 94%', 'alert');
        addEvtRef.current('MOC NBSD: Blue forces authorized to engage MINE-ALPHA', 'info');
      }
      if (tick === T_MARKER_A) {
        addEvtRef.current('FREEDOM-1: Acoustic indicator beacon deployed on MINE-ALPHA', 'info');
        addEvtRef.current('FREEDOM-1: Coordinates relayed via acoustic modem → SATCOM → MOC', 'info');
      }
      if (tick === T_CONTACT_B) {
        addEvtRef.current('FREEDOM-1: CONTACT — bottom object at 26.48°N 56.24°E — MINE-BRAVO suspected', 'warn');
      }
      if (tick === T_CONFIRM_B) {
        addEvtRef.current('FREEDOM-1: MINE-BRAVO confirmed — deploying acoustic marker', 'alert');
        addEvtRef.current('FREEDOM-1: Marker deployed — 2 mines marked for engagement', 'info');
      }
      if (tick === T_HORUS_TASK) {
        addEvtRef.current('MOC NBSD: HORUS-1 HORUS-2 tasked — navigating to acoustic markers', 'info');
      }
      if (tick === 100) {
        addEvtRef.current('HORUS-1: Acoustic marker acquired — homing on MINE-ALPHA', 'info');
        addEvtRef.current('HORUS-2: Acoustic marker acquired — homing on MINE-BRAVO', 'info');
      }
      if (tick === T_HORUS_ARRIVE) {
        addEvtRef.current('HORUS-1: On station — MINE-ALPHA — supercavitating round armed', 'warn');
        addEvtRef.current('HORUS-2: On station — MINE-BRAVO — supercavitating round armed', 'warn');
      }
      if (tick === T_ENGAGE_A) {
        addEvtRef.current('HORUS-1: Firing — round away', 'alert');
      }
      if (tick === T_NEUT_A) {
        addEvtRef.current('MINE-ALPHA: NEUTRALIZED — detonation confirmed', 'success');
        addEvtRef.current('HORUS-1: Round expended — standing by for recovery tasking', 'info');
      }
      if (tick === T_ENGAGE_B) {
        addEvtRef.current('HORUS-2: Firing — round away', 'alert');
      }
      if (tick === T_NEUT_B) {
        addEvtRef.current('MINE-BRAVO: NEUTRALIZED — detonation confirmed', 'success');
        addEvtRef.current('HORUS-2: Round expended — mission complete', 'info');
      }
      if (tick === T_LANE_CLEAR) {
        addEvtRef.current('MOC NBSD: Shipping lane ALPHA-7 — 2 of 5 mines neutralized — HORUS-3 tasked for remaining', 'info');
        addEvtRef.current('STRAIT CLEAR — Sector Alpha-7 safe for transit — notifying NAVCENT', 'success');
      }
      if (tick >= TOTAL_TICKS) {
        clearInterval(mainTimer.current);
        setRunning(false);
        setComplete(true);
      }
    }, 180);
  }, [stopAll]);

  useEffect(() => () => stopAll(), [stopAll]);

  const handleSave = () => {
    if (!missionName.trim()) return;
    const data = {
      name: missionName.trim(),
      template: 'MCM',
      domain: 'MARITIME',
      status: 'draft',
      duration: '72h',
      zoneConfig: {
        name: 'Strait of Hormuz — Shipping Lane Alpha-7',
        coordinates: [
          { lat: 26.62, lng: 56.00 },
          { lat: 26.62, lng: 56.60 },
          { lat: 26.40, lng: 56.60 },
          { lat: 26.40, lng: 56.00 },
        ],
        swarmSize: 3,
        swarmFormation: 'sequential',
      },
      assignedSquadrons: ['sqdn_004'],
      stateHierarchies: {
        default:          ['Navigation', 'Payload', 'Comms', 'Mission', 'Vehicle'],
        contact_detected: ['Payload', 'Mission', 'Comms', 'Navigation', 'Vehicle'],
        engaging:         ['Mission', 'Payload', 'Navigation', 'Comms', 'Vehicle'],
        comms_degraded:   ['Navigation', 'Mission', 'Vehicle', 'Comms', 'Payload'],
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

  const badge = getPhaseBadge(phase);

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
        <Anchor size={13} className="text-cyan-400" />
        <span className="text-cyan-400 text-[0.8rem] font-semibold tracking-wide">Hormuz Mine Clearance — 5th Fleet</span>
        <span className="text-gray-600 text-[0.7rem]">·</span>
        <span className="text-gray-500 text-[0.68rem]">Autonomous mine neutralization — Strait of Hormuz, Lane Alpha-7</span>
        <div className="flex-1" />
        <span className="px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-400 text-[0.65rem] font-bold uppercase tracking-wider border border-emerald-500/30">
          ACTIVE
        </span>
        <input
          value={missionName}
          onChange={e => setMissionName(e.target.value)}
          placeholder="Mission name…"
          className="bg-gray-800/60 border border-gray-700/60 rounded-md px-3 py-1.5 text-white text-[0.78rem] w-52 placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
        />
        <button
          onClick={handleSave}
          disabled={!missionName.trim()}
          className={`px-3 py-1.5 rounded-md text-[0.78rem] font-semibold transition-colors ${
            missionName.trim()
              ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
              : 'bg-gray-700/50 text-gray-600 cursor-not-allowed'
          }`}
        >
          Save Draft
        </button>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 min-h-0 overflow-y-auto">

        {/* ── Animation row ── */}
        <div className="flex" style={{ height: '430px' }}>

          {/* ── Map ── */}
          <div className="flex-1 relative overflow-hidden">
            <MapContainer
              center={MAP_CENTER}
              zoom={MAP_ZOOM}
              style={{ width: '100%', height: '100%' }}
              zoomControl={false}
              scrollWheelZoom
              attributionControl={false}
            >
              <ZoomControl position="topright" />
              <TileLayer url={TILE_BASE} />
              <TileLayer url={TILE_SEAMARK} opacity={0.55} />
              <MapInvalidateSize />

              {/* ── AUV sweep trail (completed + partial segments) ── */}
              {sweepSegs.map((seg, i) => (
                <Polyline
                  key={`sweep-${i}`}
                  positions={seg}
                  pathOptions={{ color: '#22d3ee', weight: 1.5, opacity: 0.50, dashArray: '4 5' }}
                />
              ))}

              {/* ── AUV marker ── */}
              {auvPos && (
                <CircleMarker
                  center={auvPos}
                  radius={5}
                  pathOptions={{ color: '#22d3ee', fillColor: '#22d3ee', fillOpacity: 0.95, weight: 2 }}
                >
                  <Tooltip direction="top" offset={[0, -8]}>
                    <span style={{ fontSize: 11, fontWeight: 700 }}>FREEDOM-1 AUV</span>
                  </Tooltip>
                </CircleMarker>
              )}

              {/* ── USS Lewis B. Puller launch vessel ── */}
              <CircleMarker
                center={AUV_SHIP}
                radius={7}
                pathOptions={{ color: '#94a3b8', fillColor: '#475569', fillOpacity: 0.9, weight: 2 }}
              >
                <Tooltip permanent direction="right" offset={[10, 0]}>
                  <span style={{ fontSize: 11, fontWeight: 700 }}>USS Puller (ESB-3)</span>
                </Tooltip>
              </CircleMarker>

              {/* ── NSA Bahrain MOC ── */}
              <CircleMarker
                center={MOC_POS}
                radius={7}
                pathOptions={{ color: '#6366f1', fillColor: '#4f46e5', fillOpacity: 0.9, weight: 2 }}
              >
                <Tooltip permanent direction="right" offset={[10, 0]}>
                  <span style={{ fontSize: 11, fontWeight: 700 }}>MOC — NSA Bahrain</span>
                </Tooltip>
              </CircleMarker>

              {/* ── Mine markers ── */}
              {MINES.map(mine => {
                const state = getMineState(mine.id, currentTick);
                if (state === 'hidden') return null;
                const opts = mineMarkerOpts(state, minePulse);
                if (!opts) return null;
                const showPinger = hasPinger(mine.id, currentTick);
                const auvRef = getAuvPos(currentTick);
                return (
                  <React.Fragment key={mine.id}>
                    {/* Mine circle */}
                    <CircleMarker
                      center={mine.pos}
                      radius={state === 'engaging' ? 10 : 7}
                      pathOptions={opts}
                    >
                      <Tooltip direction="top" offset={[0, -10]}>
                        <div style={{ fontSize: 11 }}>
                          <strong>{mine.label}</strong><br />
                          {state === 'contact'     && 'CONTACT — classifying'}
                          {state === 'confirmed'   && 'CONFIRMED — moored mine'}
                          {state === 'marked'      && 'MARKED — acoustic pinger active'}
                          {state === 'engaging'    && '⚡ ENGAGING'}
                          {state === 'neutralized' && '✓ NEUTRALIZED'}
                        </div>
                      </Tooltip>
                    </CircleMarker>

                    {/* Pulse ring on contact */}
                    {(state === 'contact') && minePulse && (
                      <CircleMarker
                        center={mine.pos}
                        radius={14}
                        pathOptions={{ color: '#f97316', fillOpacity: 0, weight: 2, opacity: 0.45 }}
                      />
                    )}

                    {/* Acoustic pinger dot (yellow) */}
                    {showPinger && (
                      <CircleMarker
                        center={mine.pos}
                        radius={3}
                        pathOptions={{ color: '#fbbf24', fillColor: '#fbbf24', fillOpacity: 1, weight: 1 }}
                      />
                    )}

                    {/* Acoustic uplink dashed line — AUV to marked mine */}
                    {showPinger && auvRef && (
                      <Polyline
                        positions={[auvRef, mine.pos]}
                        pathOptions={{ color: '#22d3ee', weight: 1, opacity: 0.25, dashArray: '3 7' }}
                      />
                    )}
                  </React.Fragment>
                );
              })}

              {/* ── HORUS vessels ── */}
              {HORUS_VESSELS.map(vessel => {
                const pos = getHorusPos(vessel, currentTick);
                if (!pos) return null;
                const mine = vessel.targetMine ? MINES.find(m => m.id === vessel.targetMine) : null;
                const isLocked = currentTick >= T_HORUS_ARRIVE && vessel.targetMine !== null;
                const mineState = vessel.targetMine ? getMineState(vessel.targetMine, currentTick) : 'hidden';
                return (
                  <React.Fragment key={vessel.id}>
                    <CircleMarker
                      center={pos}
                      radius={7}
                      pathOptions={{ color: '#22d3ee', fillColor: '#22d3ee', fillOpacity: 0.9, weight: 2 }}
                    >
                      <Tooltip direction="top" offset={[0, -10]}>
                        <span style={{ fontSize: 11, fontWeight: 700 }}>SubSeaSail {vessel.label}</span>
                      </Tooltip>
                    </CircleMarker>

                    {/* Acoustic lock line — HORUS to target mine */}
                    {isLocked && mine && mineState !== 'neutralized' && (
                      <Polyline
                        positions={[pos, mine.pos]}
                        pathOptions={{ color: '#22d3ee', weight: 2, opacity: 0.70 }}
                      />
                    )}
                  </React.Fragment>
                );
              })}

              {/* ── Cleared shipping lane corridor ── */}
              {currentTick >= T_LANE_CLEAR && (
                <Rectangle
                  bounds={[[26.47, 56.00], [26.56, 56.60]]}
                  pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.07, weight: 1.5, dashArray: null }}
                />
              )}

            </MapContainer>

            {/* ── Phase badge ── */}
            {badge && (
              <div className={`absolute top-3 left-3 z-[500] px-3 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wider pointer-events-none border ${badge.cls}`}>
                {badge.label}
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="w-[300px] flex-shrink-0 flex flex-col border-l border-gray-700/50 overflow-hidden bg-darkest">

            {/* Controls */}
            <div className="p-4 border-b border-gray-700/50 flex-shrink-0">
              <p className="text-gray-500 text-[0.65rem] uppercase tracking-widest mb-3">Scenario</p>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={runScenario}
                  disabled={running}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[0.78rem] font-semibold transition-colors ${
                    running
                      ? 'bg-gray-700/60 text-gray-500 cursor-not-allowed'
                      : 'bg-cyan-700 hover:bg-cyan-600 text-white'
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
                Freedom AUV + 3× SubSeaSail HORUS · MCM Kill Chain
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

        {/* ── SubSeaSail HORUS MCM Loadout ── */}
        <div className="border-t border-gray-700/50 flex-shrink-0">
          <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-gray-700/30">
            <div className="w-5 h-5 rounded bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
              <Anchor size={11} color="#22d3ee" />
            </div>
            <span className="text-[0.78rem] font-semibold text-gray-100">SubSeaSail HORUS</span>
            <span className="text-gray-600 text-[0.68rem]">·</span>
            <span className="text-gray-400 text-[0.68rem]">MCM Mine Neutralization Package — 3× per squadron</span>
            <div className="ml-auto text-[0.65rem] text-gray-600">
              {HORUS_MCM_MOUNTS.length}/{HORUS_MCM_MOUNTS.length} slots filled
            </div>
          </div>
          <div className="p-4 grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))' }}>
            {HORUS_MCM_MOUNTS.map((mount, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-cyan-500/5 border border-cyan-500/25"
              >
                <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 bg-cyan-500/12">
                  <Anchor size={14} color="#22d3ee" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[0.58rem] text-gray-600 uppercase tracking-widest mb-0.5 truncate">{mount.slot}</div>
                  <div className="text-[0.73rem] font-semibold text-gray-100 truncate">{mount.name}</div>
                  <div className="text-[0.62rem] text-gray-500 truncate">{mount.vendor}</div>
                </div>
                <div className="w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <Check size={9} color="#22d3ee" strokeWidth={3} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Oceaneering Freedom AUV Loadout ── */}
        <div className="border-t border-gray-700/50 flex-shrink-0">
          <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-gray-700/30">
            <div className="w-5 h-5 rounded bg-violet-500/15 flex items-center justify-center flex-shrink-0">
              <Anchor size={11} color="#a78bfa" />
            </div>
            <span className="text-[0.78rem] font-semibold text-gray-100">Oceaneering Freedom AUV</span>
            <span className="text-gray-600 text-[0.68rem]">·</span>
            <span className="text-gray-400 text-[0.68rem]">HUNT/MARK Package — micro-SAS sonar + acoustic beacons</span>
            <div className="ml-auto text-[0.65rem] text-gray-600">
              {FREEDOM_AUV_MOUNTS.length}/{FREEDOM_AUV_MOUNTS.length} slots filled
            </div>
          </div>
          <div className="p-4 grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))' }}>
            {FREEDOM_AUV_MOUNTS.map((mount, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-violet-500/5 border border-violet-500/25"
              >
                <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 bg-violet-500/12">
                  <Anchor size={14} color="#a78bfa" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[0.58rem] text-gray-600 uppercase tracking-widest mb-0.5 truncate">{mount.slot}</div>
                  <div className="text-[0.73rem] font-semibold text-gray-100 truncate">{mount.name}</div>
                  <div className="text-[0.62rem] text-gray-500 truncate">{mount.vendor}</div>
                </div>
                <div className="w-4 h-4 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <Check size={9} color="#a78bfa" strokeWidth={3} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>{/* /scrollable content */}
    </div>
  );
};

export default MineClearanceMissionView;
