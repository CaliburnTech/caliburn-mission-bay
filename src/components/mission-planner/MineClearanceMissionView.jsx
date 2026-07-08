import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import {
  MapContainer, TileLayer, CircleMarker, Polyline, Rectangle, Tooltip, ZoomControl, useMap
} from 'react-leaflet';
import { Play, Pause, RotateCcw, Anchor, ChevronLeft, Check, Settings, ArrowLeftRight } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import useMissionStore from '../../store/missionStore';
import useOutfitterStore from '../../store/outfitterStore';
import useConfigurationStore from '../../store/configurationStore';
import useNavigationStore from '../../store/navigationStore';
import { vesselHullData } from '../../data/vesselData';
import { MISSION_ROLES } from '../../data/missionRoles';
import SwapVesselModal from './SwapVesselModal';
import ReadinessChecklist from './ReadinessChecklist';
import { getMissionReadiness } from '../../utils/missionReadiness';
import { HULL_IMAGES } from '../../utils/hullImages';
import imgFreedomAUV from '../../assets/images/FreedomAUV.png';
import imgSubSeaSail from '../../assets/images/SubSeaSail.png';

const MISSION_SET_KEY = 'MCM';
const MISSION_SET_CAPS = ['Micro-SAS Sonar (SAMDIS)', 'Acoustic Indicator Buoy', 'EvoLogics Acoustic Modem', 'LOS Mesh Radio', 'Acoustic Marker Receiver', 'M30 Supercavitating Round', 'OrbComm ST 6100'];

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
  { slot: 'ACOUSTIC SENSORS', name: 'Acoustic Marker Receiver',  vendor: 'Thales',            description: 'Passive acoustic receiver — homes on the 37.5 kHz acoustic indicator buoy deployed by the Freedom AUV for terminal mine localization' },
  { slot: 'WEAPONS',        name: 'M30 Supercavitating Round', vendor: 'Thales',            description: 'Single-shot mine neutralization — fires through hull bottom' },
  { slot: 'SATCOM',         name: 'OrbComm ST 6100',           vendor: 'OrbComm',          description: 'C2 link — receives mine coordinates via SATCOM relay from Freedom AUV' },
  { slot: 'COMMS',          name: 'LOS Mesh Radio',            vendor: 'Persistent Systems', description: 'Direct LOS data link to Freedom AUV at surface — mine contact handoff and coordination' },
];

const FREEDOM_AUV_MOUNTS = [
  { slot: 'SENSORS', name: 'Micro-SAS Sonar (SAMDIS)',  vendor: 'Thales',             description: '150m swath, 30mm resolution — detects, classifies, localizes mines' },
  { slot: 'PAYLOAD', name: 'Acoustic Indicator Buoy',   vendor: 'Oceaneering',        description: 'Deploys acoustic pinger on confirmed mine for HORUS homing' },
  { slot: 'COMMS',   name: 'EvoLogics Acoustic Modem',  vendor: 'EvoLogics',          description: 'Relays mine coordinates to surface relay via underwater acoustic link' },
  { slot: 'COMMS',   name: 'LOS Mesh Radio',            vendor: 'Persistent Systems', description: 'Surface-to-surface mesh link with HORUS when AUV is at/near surface — high-bandwidth contact data sync' },
];

const VESSEL_ROSTER = [
  { name: 'FREEDOM AUV', roleDescriptor: '(Mine Hunter)', image: imgFreedomAUV, hullName: 'Freedom AUV', capabilities: ['Micro-SAS Sonar (SAMDIS)', 'Acoustic Indicator Buoy', 'EvoLogics Acoustic Modem', 'LOS Mesh Radio'], roleKey: 'MCM_FREEDOM_AUV' },
  { name: 'HORUS-1 SSS', roleDescriptor: '(Scout 1)', image: imgSubSeaSail, hullName: 'SubSeaSail Horus', capabilities: ['Acoustic Marker Receiver', 'M30 Supercavitating Round', 'OrbComm ST 6100', 'LOS Mesh Radio'], roleKey: 'MCM_HORUS_1' },
  { name: 'HORUS-2 SSS', roleDescriptor: '(Scout 2)', image: imgSubSeaSail, hullName: 'SubSeaSail Horus', capabilities: ['Acoustic Marker Receiver', 'M30 Supercavitating Round', 'OrbComm ST 6100', 'LOS Mesh Radio'], roleKey: 'MCM_HORUS_2' },
];

// ─── Phase narratives ─────────────────────────────────────────────────────────
const PHASE_NARRATIVE = {
  idle:              null,
  auv_transit:       { title: 'AUV Transit to Minefield', body: 'FREEDOM-1 AUV deployed from USS Lewis B. Puller (ESB-3). Initiating transit to Strait of Hormuz shipping lane Alpha-7. Micro-SAS sonar powering up for boustrophedon sweep.' },
  sweeping:          { title: 'Micro-SAS Sweep Active', body: 'FREEDOM-1 executing 5-pass lawnmower survey at 4kt. 150m swath, 30mm resolution. Contacts logged to onboard memory — AUV does not divert. Full minefield picture before any re-attack.' },
  sweep_complete:    { title: 'Sweep Complete — Uploading Contacts', body: 'All 5 passes complete. FREEDOM-1 surfacing. Contact list uploading via EvoLogics acoustic modem → SATCOM relay → MOC Bahrain. 2 bottom contacts confirmed. Initiating re-attack.' },
  marking_alpha:     { title: 'Re-Attack Phase — Marking Mines', body: 'FREEDOM-1 returning to MINE-ALPHA contact position. Deploying Oceaneering acoustic indicator buoy. Will transit to MINE-BRAVO to complete marking before HORUS engagement.' },
  horus_inbound:     { title: 'All Mines Marked — HORUS Inbound', body: 'MINE-ALPHA and MINE-BRAVO both marked with 37.5kHz acoustic beacons. HORUS-1 and HORUS-2 homing on pinger signals. M30 supercavitating rounds armed. FREEDOM-1 RTB.' },
  horus_locked:      { title: 'Acoustic Lock Achieved', body: 'HORUS-1 and HORUS-2 on station — 37.5kHz pinger locks confirmed. Supercavitating rounds aligned to mine-bearing vectors. MOC Bahrain: weapons free.' },
  engaging_alpha:    { title: 'Engaging MINE-ALPHA', body: 'HORUS-1: M30 supercavitating round away — penetrating water column. Kinetic neutralization via hull perforation initiates sympathetic detonation sequence on MINE-ALPHA.' },
  alpha_neutralized: { title: 'MINE-ALPHA Neutralized', body: 'Detonation confirmed on MINE-ALPHA. Debris field assessed — no secondary hazards. HORUS-1 standing by. HORUS-2 engaging MINE-BRAVO on independent solution.' },
  engaging_bravo:    { title: 'Engaging MINE-BRAVO', body: 'HORUS-2: M30 supercavitating round away. Fire control solution from acoustic beacon relay — precision terminal engagement. MCM kill chain executing nominally.' },
  bravo_neutralized: { title: 'MINE-BRAVO Neutralized', body: 'Detonation confirmed on MINE-BRAVO. 2 of 5 mines in Alpha-7 lane eliminated. HORUS-3 standing by for remaining mines CHARLIE, DELTA, ECHO. FREEDOM-1 reloading for second sweep.' },
  lane_clear:        { title: 'Sector Alpha-7 Cleared', body: 'Shipping lane Alpha-7 declared safe for transit. NAVCENT notified. VLCC convoy routing through cleared corridor. HORUS-3 commencing sweep cycle for residual mines.' },
};

// ─── Tick milestones ──────────────────────────────────────────────────────────
const T_AUV_TRANSIT      = 5;
const T_AUV_ARRIVE       = 15;
const T_SWEEP_START      = 25;   // SAS sonar active event
const T_SWEEP_CONTACT_A  = 38;   // Mine A sonar return during sweep (AUV does NOT divert)
const T_SWEEP_CONTACT_B  = 55;   // Mine B sonar return during sweep
const T_SWEEP_DONE       = 72;   // Full lawnmower complete — all 5 passes
const T_REPORT           = 78;   // AUV surfaces, uploads contact list
const T_MARK_A           = 92;   // Re-attack: AUV deploys marker on MINE-ALPHA
const T_MARK_B           = 108;  // Re-attack: AUV deploys marker on MINE-BRAVO
const T_HORUS_TASK       = 108;  // HORUS tasked (both markers now active)
const T_HORUS_ARRIVE     = 135;
const T_ENGAGE_A         = 142;
const T_NEUT_A           = 148;
const T_ENGAGE_B         = 155;
const T_NEUT_B           = 161;
const T_LANE_CLEAR       = 168;
const TOTAL_TICKS        = 182;

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
  if (tick < T_AUV_TRANSIT)   return 'idle';
  if (tick < T_AUV_ARRIVE)    return 'auv_transit';
  if (tick < T_SWEEP_DONE)    return 'sweeping';
  if (tick < T_MARK_A)        return 'sweep_complete';  // surfacing + reporting
  if (tick < T_HORUS_TASK)    return 'marking_alpha';   // re-attack: alpha then bravo
  if (tick < T_HORUS_ARRIVE)  return 'horus_inbound';
  if (tick < T_ENGAGE_A)      return 'horus_locked';
  if (tick < T_NEUT_A)        return 'engaging_alpha';
  if (tick < T_ENGAGE_B)      return 'alpha_neutralized';
  if (tick < T_NEUT_B)        return 'engaging_bravo';
  if (tick < T_LANE_CLEAR)    return 'bravo_neutralized';
  return 'lane_clear';
};

const getMineState = (mineId, tick) => {
  if (mineId === 'M1') {
    if (tick < T_SWEEP_CONTACT_A) return 'hidden';
    if (tick < T_REPORT)          return 'contact';    // detected during sweep — AUV keeps going
    if (tick < T_MARK_A)          return 'confirmed';  // contacts uploaded, awaiting marker
    if (tick < T_ENGAGE_A)        return 'marked';
    if (tick < T_NEUT_A)          return 'engaging';
    return 'neutralized';
  }
  if (mineId === 'M2') {
    if (tick < T_SWEEP_CONTACT_B) return 'hidden';
    if (tick < T_REPORT)          return 'contact';
    if (tick < T_MARK_B)          return 'confirmed';
    if (tick < T_ENGAGE_B)        return 'marked';
    if (tick < T_NEUT_B)          return 'engaging';
    return 'neutralized';
  }
  return 'hidden';
};

const hasPinger = (mineId, tick) => {
  if (mineId === 'M1') return tick >= T_MARK_A && getMineState('M1', tick) !== 'neutralized';
  if (mineId === 'M2') return tick >= T_MARK_B && getMineState('M2', tick) !== 'neutralized';
  return false;
};

const getAuvPos = (tick) => {
  if (tick < T_AUV_TRANSIT) return null;
  // Transit ship → sweep start
  if (tick < T_AUV_ARRIVE) {
    const t = (tick - T_AUV_TRANSIT) / (T_AUV_ARRIVE - T_AUV_TRANSIT);
    return lerp2(AUV_SHIP, AUV_SWEEP_TRACK[0], Math.min(t, 1));
  }
  // Full lawnmower sweep — no diversion on contact
  if (tick < T_SWEEP_DONE) {
    const t = (tick - T_AUV_ARRIVE) / (T_SWEEP_DONE - T_AUV_ARRIVE);
    return trackPos(AUV_SWEEP_TRACK, Math.min(t, 0.9999));
  }
  // Surface / report — hold at sweep end point
  if (tick < T_REPORT) return AUV_SWEEP_TRACK[AUV_SWEEP_TRACK.length - 1];
  // Re-attack: transit sweep end → MINE-ALPHA
  if (tick < T_MARK_A) {
    const t = (tick - T_REPORT) / (T_MARK_A - T_REPORT);
    return lerp2(AUV_SWEEP_TRACK[AUV_SWEEP_TRACK.length - 1], MINES[0].pos, Math.min(t, 1));
  }
  // Transit MINE-ALPHA → MINE-BRAVO (marker already dropped on ALPHA)
  if (tick < T_MARK_B) {
    const t = (tick - T_MARK_A) / (T_MARK_B - T_MARK_A);
    return lerp2(MINES[0].pos, MINES[1].pos, Math.min(t, 1));
  }
  // RTB to USS Lewis B. Puller
  const t = Math.min((tick - T_MARK_B) / (T_HORUS_ARRIVE - T_MARK_B), 1);
  return lerp2(MINES[1].pos, AUV_SHIP, t);
};

const getHorusPos = (vessel, tick) => {
  if (!vessel.targetMine || tick < T_HORUS_TASK) return null;
  const mine = MINES.find(m => m.id === vessel.targetMine);
  if (!mine) return null;
  if (tick >= T_HORUS_ARRIVE) return mine.pos;
  const t = (tick - T_HORUS_TASK) / (T_HORUS_ARRIVE - T_HORUS_TASK);
  return lerp2(AUV_SHIP, mine.pos, Math.min(t, 1));
};

// Returns array of completed + partial sweep polyline segments (trail stops when AUV leaves track)
const getAuvSweepSegments = (tick) => {
  if (tick < T_AUV_ARRIVE) return [];
  const cappedTick = Math.min(tick, T_SWEEP_DONE);
  const t = Math.min((cappedTick - T_AUV_ARRIVE) / (T_SWEEP_DONE - T_AUV_ARRIVE), 1);
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
    case 'auv_transit':      return { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40',                  label: '→ AUV Transit' };
    case 'sweeping':         return { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40',                  label: '◈ SAS Sweep Active' };
    case 'sweep_complete':   return { cls: 'bg-amber-900/80 text-amber-300 border-amber-500/40',               label: '↑ Sweep Complete — Uploading' };
    case 'marking_alpha':    return { cls: 'bg-red-900/80 text-red-300 border-red-500/40',                     label: '● Re-Attack — Marking Mines' };
    case 'horus_inbound':    return { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40',                  label: '→ HORUS Inbound' };
    case 'horus_locked':     return { cls: 'bg-amber-900/80 text-amber-300 border-amber-500/40',               label: '◉ Acoustic Lock' };
    case 'engaging_alpha':   return { cls: 'bg-red-900/80 text-red-300 border-red-500/40 animate-pulse',       label: '⚡ Engaging MINE-ALPHA' };
    case 'alpha_neutralized':return { cls: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40',         label: '✓ MINE-ALPHA Neutralized' };
    case 'engaging_bravo':   return { cls: 'bg-red-900/80 text-red-300 border-red-500/40 animate-pulse',       label: '⚡ Engaging MINE-BRAVO' };
    case 'bravo_neutralized':return { cls: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40',         label: '✓ MINE-BRAVO Neutralized' };
    case 'lane_clear':       return { cls: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40',         label: '✓ Sector Alpha-7 Clear' };
    default:                 return null;
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
  const { setSelectedHull } = useOutfitterStore();
  const { startNewConfiguration, setPendingMissionSetKey, setPendingRoleKey, setPendingVesselLabel, setPendingMissionSetCaps, activeConfig } = useConfigurationStore();
  const { setSelectedView } = useNavigationStore();
  const roleAssignments = useMissionStore(s => s.roleAssignments);
  const savedConfigurations = useConfigurationStore(s => s.savedConfigurations);
  const [swapModal, setSwapModal] = useState(null); // { roleKey: string } | null
  const [showLog, setShowLog] = useState(false);

  // Build effective roster — override default slots with assigned vessels
  const missionRoleDefs = MISSION_ROLES[MISSION_SET_KEY]?.roles ?? [];
  const effectiveRoster = VESSEL_ROSTER.map((vessel, idx) => {
    const roleDef = missionRoleDefs[idx];
    if (!roleDef) return vessel;
    const assignment = roleAssignments?.[MISSION_SET_KEY]?.[roleDef.roleKey];
    if (!assignment) return { ...vessel, name: vessel.roleDescriptor ? `${vessel.hullName} ${vessel.roleDescriptor}` : vessel.name };
    // Derive displayed capabilities from actual config if available
    let capabilities = roleDef.capabilities?.length ? roleDef.capabilities : vessel.capabilities;
    if (activeConfig && activeConfig.hullName === assignment.hullName) {
      const caps = Object.values(activeConfig.slots).flat().filter(Boolean);
      if (caps.length) capabilities = caps;
    } else if (savedConfigurations) {
      const saved = Object.values(savedConfigurations).find(c => c.hullName === assignment.hullName);
      if (saved) {
        const caps = Object.values(saved.slots).flat().filter(Boolean);
        if (caps.length) capabilities = caps;
      }
    }
    return {
      ...vessel,
      name: vessel.roleDescriptor ? `${assignment.hullName} ${vessel.roleDescriptor}` : (assignment.vesselLabel || assignment.hullName),
      hullName: assignment.hullName,
      capabilities,
      image: HULL_IMAGES[assignment.hullName] || vessel.image,
    };
  });

  const readiness = getMissionReadiness(MISSION_SET_KEY, roleAssignments, savedConfigurations);
  const isDeployable = readiness.deployable;

  const [missionName, setMissionName] = useState(mission?.name || '');
  const [currentTick,  setCurrentTick]  = useState(0);
  const [minePulse,    setMinePulse]    = useState(false);
  const [events,       setEvents]       = useState([]);
  const [running,      setRunning]      = useState(false);
  const [paused,        setPaused]        = useState(false);
  const [complete,     setComplete]     = useState(false);

  const tickRef    = useRef(0);
  const tickCallbackRef = useRef(null);
  const mainTimer  = useRef(null);
  const pulseTimer = useRef(null);
  const addEvtRef  = useRef(null);
  const vesselLabelsRef = useRef([]);

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
  const pause = useCallback(() => {
    clearInterval(mainTimer.current);
    mainTimer.current = null;
    setRunning(false);
    setPaused(true);
  }, []);

  const resume = useCallback(() => {
    if (!tickCallbackRef.current) return;
    setRunning(true);
    setPaused(false);
    mainTimer.current = setInterval(tickCallbackRef.current, 280);
  }, []);


  useLayoutEffect(() => { addEvtRef.current = _addEvent; });
  useLayoutEffect(() => { vesselLabelsRef.current = effectiveRoster.map(v => v.name); });

  // Mine contact / engagement pulse
  useEffect(() => {
    clearInterval(pulseTimer.current);
    const needsPulse = ['sweeping', 'sweep_complete', 'marking_alpha', 'horus_inbound', 'horus_locked', 'engaging_alpha', 'engaging_bravo'].includes(phase);
    if (needsPulse) {
      pulseTimer.current = setInterval(() => setMinePulse(p => !p), 350);
      return () => clearInterval(pulseTimer.current);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset of timer-driven pulse state when the animated phase set is exited; cannot be derived during render
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
    setPaused(false);
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
    setPaused(false);
    setComplete(false);

    const cb = () => {
      const tick = ++tickRef.current;
      const v0 = vesselLabelsRef.current[0] ?? 'Freedom AUV (Mine Hunter)';
      const v1 = vesselLabelsRef.current[1] ?? 'SubSeaSail Horus (Scout 1)';
      const v2 = vesselLabelsRef.current[2] ?? 'SubSeaSail Horus (Scout 2)';
      setCurrentTick(tick);

      if (tick === T_AUV_TRANSIT) {
        addEvtRef.current(`${v0}: AUV deployed from USS Puller — initiating transit to minefield`, 'info');
      }
      if (tick === T_AUV_ARRIVE) {
        addEvtRef.current(`${v0}: Sweep start — Pass 1 of 5. Contacts logged to memory — no diversion until sweep complete.`, 'info');
      }
      if (tick === T_SWEEP_START) {
        addEvtRef.current(`${v0}: SAS sonar active — 150m swath, 0.03m resolution`, 'info');
      }
      if (tick === T_SWEEP_CONTACT_A) {
        addEvtRef.current(`${v0}: SONAR RETURN — bottom object 26°33'N 56°07'E — logged CONTACT-1. Sweep continuing.`, 'warn');
      }
      if (tick === T_SWEEP_CONTACT_B) {
        addEvtRef.current(`${v0}: SONAR RETURN — bottom object 26°28'N 56°14'E — logged CONTACT-2. Sweep continuing.`, 'warn');
      }
      if (tick === T_SWEEP_DONE) {
        addEvtRef.current(`${v0}: Sweep complete — 5 passes, 2 contacts logged — surfacing to report`, 'info');
      }
      if (tick === T_REPORT) {
        addEvtRef.current(`${v0}: Contact list uploaded — 2 bottom objects — MOC Bahrain correlating`, 'info');
        addEvtRef.current('MOC Bahrain: CONTACT-1 and CONTACT-2 match threat database — MINES CONFIRMED', 'alert');
        addEvtRef.current(`${v0}: Re-attack phase initiated — returning to MINE-ALPHA`, 'info');
      }
      if (tick === T_MARK_A) {
        addEvtRef.current(`${v0}: Acoustic indicator buoy deployed on MINE-ALPHA — pinger active 37.5kHz`, 'info');
        addEvtRef.current(`${v0}: Transiting to MINE-BRAVO`, 'info');
      }
      if (tick === T_MARK_B) {
        addEvtRef.current(`${v0}: Acoustic indicator buoy deployed on MINE-BRAVO — both mines marked`, 'info');
        addEvtRef.current(`${v0}: Re-attack complete — RTB to USS Lewis B. Puller (ESB-3)`, 'info');
        addEvtRef.current(`MOC Bahrain: ${v1} ${v2} tasked — homing on acoustic beacons`, 'info');
      }
      if (tick === 122) {
        addEvtRef.current(`${v1}: Acoustic marker acquired — homing on MINE-ALPHA`, 'info');
        addEvtRef.current(`${v2}: Acoustic marker acquired — homing on MINE-BRAVO`, 'info');
      }
      if (tick === T_HORUS_ARRIVE) {
        addEvtRef.current(`${v1}: On station — MINE-ALPHA — supercavitating round armed`, 'warn');
        addEvtRef.current(`${v2}: On station — MINE-BRAVO — supercavitating round armed`, 'warn');
      }
      if (tick === T_ENGAGE_A) {
        addEvtRef.current(`${v1}: Firing — round away`, 'alert');
      }
      if (tick === T_NEUT_A) {
        addEvtRef.current('MINE-ALPHA: NEUTRALIZED — detonation confirmed', 'success');
        addEvtRef.current(`${v1}: Round expended — standing by for recovery tasking`, 'info');
      }
      if (tick === T_ENGAGE_B) {
        addEvtRef.current(`${v2}: Firing — round away`, 'alert');
      }
      if (tick === T_NEUT_B) {
        addEvtRef.current('MINE-BRAVO: NEUTRALIZED — detonation confirmed', 'success');
        addEvtRef.current(`${v2}: Round expended — mission complete`, 'info');
      }
      if (tick === T_LANE_CLEAR) {
        addEvtRef.current(`MOC Bahrain: Shipping lane ALPHA-7 — 2 of 5 mines neutralized — ${v2} tasked for remaining`, 'info');
        addEvtRef.current('STRAIT CLEAR — Sector Alpha-7 safe for transit — notifying NAVCENT', 'success');
      }
      if (tick >= TOTAL_TICKS) {
        clearInterval(mainTimer.current);
        setRunning(false);
        setComplete(true);
      }
    };
    tickCallbackRef.current = cb;
    mainTimer.current = setInterval(cb, 280);
  }, [stopAll]);

  useEffect(() => () => stopAll(), [stopAll]);

  const handleConfigureVessel = (vessel) => {
    if (!vessel.hullName) return;
    const hull = vesselHullData.find(h => h.name === vessel.hullName);
    if (!hull) return;

    setSelectedHull(hull);
    const currentActive = useConfigurationStore.getState().activeConfig;
    if (!currentActive || currentActive.hullName !== vessel.hullName) {
      startNewConfiguration(vessel.hullName);
    }

    setPendingMissionSetCaps(vessel.capabilities);

    setPendingMissionSetKey(MISSION_SET_KEY);
    if (vessel.roleKey) setPendingRoleKey(vessel.roleKey);
    setPendingVesselLabel(vessel.name);
    setSelectedView('outfitter');
  };

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
  const narrative = PHASE_NARRATIVE[phase] || null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-darkest overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-700/50 flex-shrink-0 overflow-x-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-[0.75rem]"
        >
          <ChevronLeft size={13} /> Back to Library
        </button>
        <div className="w-px h-4 bg-gray-700/60" />
        <Anchor size={13} className="text-cyan-400" />
        <span className="text-cyan-400 text-[0.8rem] font-semibold tracking-wide">Hormuz Mine Clearance — 5th Fleet</span>
        <span className="hidden md:inline text-gray-600 text-[0.7rem]">·</span>
        <span className="hidden md:inline text-gray-500 text-[0.68rem]">Autonomous mine neutralization — Strait of Hormuz, Lane Alpha-7</span>
        <div className="flex-1" />
        <span className="px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-400 text-[0.65rem] font-bold uppercase tracking-wider border border-emerald-500/30">
          ACTIVE
        </span>
        <input
          value={missionName}
          onChange={e => setMissionName(e.target.value)}
          placeholder="Mission name…"
          className="hidden md:block bg-gray-800/60 border border-gray-700/60 rounded-md px-3 py-1.5 text-white text-[0.78rem] w-52 placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
        />
        <button
          onClick={handleSave}
          disabled={!missionName.trim() || !isDeployable}
          className={`hidden md:block px-3 py-1.5 rounded-md text-[0.78rem] font-semibold transition-colors ${
            missionName.trim() && isDeployable
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
        <div className="flex h-[40vh] md:h-[460px]">

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
                <Tooltip direction="right" offset={[10, 0]}>
                  <span style={{ fontSize: 11, fontWeight: 700 }}>USS Puller</span>
                </Tooltip>
              </CircleMarker>

              {/* ── NSA Bahrain MOC ── */}
              <CircleMarker
                center={MOC_POS}
                radius={7}
                pathOptions={{ color: '#6366f1', fillColor: '#4f46e5', fillOpacity: 0.9, weight: 2 }}
              >
                <Tooltip direction="right" offset={[10, 0]}>
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

                    {/* Acoustic pinger beacon (yellow) */}
                    {showPinger && (
                      <CircleMarker
                        center={mine.pos}
                        radius={5}
                        pathOptions={{ color: '#fbbf24', fillColor: '#fbbf24', fillOpacity: 1, weight: 2 }}
                      >
                        <Tooltip direction="bottom" offset={[0, 8]}>
                          <span style={{ fontSize: 11, fontWeight: 700 }}>Acoustic Pinger — Active</span>
                        </Tooltip>
                      </CircleMarker>
                    )}
                    {/* Pinger pulse ring */}
                    {showPinger && minePulse && (
                      <CircleMarker
                        center={mine.pos}
                        radius={13}
                        pathOptions={{ color: '#fbbf24', fillOpacity: 0, weight: 1.5, opacity: 0.55 }}
                      />
                    )}

                    {/* Acoustic uplink dashed line — AUV to marked mine */}
                    {showPinger && auvRef && (
                      <Polyline
                        positions={[auvRef, mine.pos]}
                        pathOptions={{ color: '#22d3ee', weight: 1.5, opacity: 0.55, dashArray: '3 7' }}
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

                    {/* Acoustic homing line — HORUS tracking pinger while inbound and locked */}
                    {mine && mineState !== 'neutralized' && currentTick >= T_HORUS_TASK && (
                      <Polyline
                        positions={[pos, mine.pos]}
                        pathOptions={isLocked
                          ? { color: '#fbbf24', weight: 2, opacity: 0.80 }
                          : { color: '#fbbf24', weight: 1, opacity: 0.45, dashArray: '4 6' }
                        }
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

            {/* ── Legend ── */}
            {currentTick >= T_AUV_TRANSIT && (
              <div className="hidden md:block absolute bottom-3 left-3 z-[500] pointer-events-none px-3 py-2 rounded-xl bg-gray-950/80 border border-gray-700/50 backdrop-blur-sm">
                <div className="flex flex-col gap-1">
                  {[
                    { color: '#22d3ee', label: `${effectiveRoster[0]?.name ?? 'Freedom AUV (Mine Hunter)'} — Mine Hunt` },
                    { color: '#22d3ee', label: `${effectiveRoster[1]?.name ?? 'SubSeaSail Horus (Scout 1)'} / ${effectiveRoster[2]?.name ?? 'SubSeaSail Horus (Scout 2)'} — Neutralization` },
                    { color: '#94a3b8', label: 'USS Lewis B. Puller (ESB-3)' },
                    { color: '#6366f1', label: 'MOC — NSA Bahrain' },
                    { color: '#ef4444', label: 'Confirmed Mine Contact' },
                    { color: '#10b981', label: 'Neutralized Mine' },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                      <span style={{ fontSize: 10, color: '#9ca3af' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile: Show Log button */}
            <button
              onClick={() => setShowLog(true)}
              className="md:hidden absolute bottom-3 right-3 z-[500] px-3 py-1.5 rounded-lg bg-gray-900/90 border border-gray-700/60 text-gray-300 text-xs font-semibold backdrop-blur-sm"
            >
              Show Log
            </button>
          </div>

          {/* ── Sidebar ── */}
          <div className={`
            flex-col border-l border-gray-700/50 overflow-hidden bg-darkest
            ${showLog
              ? 'fixed inset-0 z-[600] flex w-full'
              : 'hidden md:flex md:w-[300px] md:flex-shrink-0'}
          `}
          >

            {/* Mobile close button */}
            <div className="md:hidden flex justify-end p-2 border-b border-gray-700/50">
              <button
                onClick={() => setShowLog(false)}
                className="px-3 py-1.5 rounded-lg bg-gray-700/60 text-gray-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>

            {/* Controls */}
            <div className="p-4 border-b border-gray-700/50 flex-shrink-0">
              <p className="text-gray-500 text-[0.65rem] uppercase tracking-widest mb-3">Scenario</p>
              <div className="flex gap-2 mb-3">
                {running ? (
                  <button
                    onClick={pause}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[0.78rem] font-semibold transition-colors bg-cyan-700 hover:bg-cyan-600 text-white"
                  >
                    <Pause size={13} />
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={paused ? resume : runScenario}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[0.78rem] font-semibold transition-colors bg-cyan-700 hover:bg-cyan-600 text-white"
                  >
                    <Play size={13} />
                    {paused ? 'Resume' : complete ? 'Run Again' : 'Run Scenario'}
                  </button>
                )}
                <button
                  onClick={reset}
                  className="p-2 rounded-lg bg-gray-700/40 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                  title="Reset"
                >
                  <RotateCcw size={13} />
                </button>
              </div>

              {/* Phase narrative */}
              {narrative ? (
                <div className="rounded-lg bg-gray-800/50 border border-gray-700/40 px-3 py-2.5">
                  <div className="text-[0.68rem] font-bold text-cyan-300 uppercase tracking-wider mb-1">
                    {narrative.title}
                  </div>
                  <div className="text-[0.67rem] text-gray-400 leading-relaxed">
                    {narrative.body}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-[0.68rem]">
                  Freedom AUV + 3× SubSeaSail HORUS · MCM Kill Chain
                </p>
              )}
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

        {/* Mobile: play controls */}
        <div className="md:hidden flex items-center gap-2 px-4 py-3 border-b border-gray-700/30 bg-gray-900/30">
          {running ? (
            <button
              onClick={pause}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white text-sm font-semibold transition-colors"
            >
              <Pause size={15} />
              Pause
            </button>
          ) : (
            <button
              onClick={paused ? resume : runScenario}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white text-sm font-semibold transition-colors"
            >
              <Play size={15} />
              {paused ? 'Resume' : complete ? 'Run Again' : 'Run Scenario'}
            </button>
          )}
          <button
            onClick={reset}
            className="p-2.5 rounded-lg bg-gray-700/40 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title="Reset"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        {/* ── Vessel Roster ── */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {effectiveRoster.map((vessel, idx) => (
            <div key={`${vessel.roleKey || vessel.name}-${vessel.hullName}`} className="flex border border-gray-700/50 rounded-lg overflow-hidden bg-gray-900/40">
              {/* Image */}
              <div className="w-32 flex-shrink-0 bg-gray-950/60 flex items-center justify-center p-2">
                <img src={vessel.image} alt={vessel.name} className="w-full h-full object-contain max-h-24" />
              </div>
              {/* Capabilities */}
              <div className="flex-1 flex flex-col justify-center p-2 gap-1.5">
                <div className="flex items-center">
                  <div className="text-[0.65rem] font-bold text-gray-300 uppercase tracking-wider mb-0.5">{vessel.name}</div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleConfigureVessel(vessel); }}
                    disabled={!vessel.hullName}
                    className="ml-auto p-1 rounded text-gray-400 hover:text-cyan-400 hover:bg-gray-700/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Configure loadout"
                  >
                    <Settings size={13} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSwapModal({ roleKey: missionRoleDefs[idx]?.roleKey }); }}
                    disabled={!missionRoleDefs[idx]}
                    className="ml-1 p-1 rounded text-gray-400 hover:text-blue-400 hover:bg-gray-700/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Swap vessel"
                  >
                    <ArrowLeftRight size={13} />
                  </button>
                </div>
                {vessel.capabilities.map((cap, i) => (
                  <div key={i} className="border border-gray-700/50 rounded px-2 py-0.5 text-[0.62rem] text-gray-400 bg-gray-800/30">
                    {cap}
                  </div>
                ))}
                {missionRoleDefs[idx] && (
                  <ReadinessChecklist
                    config={
                      (() => {
                        const assignment = roleAssignments?.[MISSION_SET_KEY]?.[missionRoleDefs[idx]?.roleKey];
                        if (!assignment) return null;
                        // Prefer the in-flight active config — it reflects the latest unsaved changes.
                        // Only fall back to savedConfigurations if activeConfig is for a different hull.
                        const ac = useConfigurationStore.getState().activeConfig;
                        if (ac && ac.hullName === assignment.hullName) return ac;
                        const saved = Object.values(savedConfigurations).find(c => c.hullName === assignment.hullName);
                        return saved ?? null;
                      })()
                    }
                    role={missionRoleDefs[idx]}
                    isDefault={!roleAssignments?.[MISSION_SET_KEY]?.[missionRoleDefs[idx]?.roleKey]}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

      </div>{/* /scrollable content */}

      {swapModal && (
        <SwapVesselModal
          isOpen={!!swapModal}
          onClose={() => setSwapModal(null)}
          missionKey={MISSION_SET_KEY}
          roleKey={swapModal.roleKey}
          currentHullName={
            effectiveRoster.find(v => v.roleKey === swapModal.roleKey)?.hullName
          }
        />
      )}
    </div>
  );
};

export default MineClearanceMissionView;
