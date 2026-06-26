import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import {
  MapContainer, TileLayer, Circle, CircleMarker, Polyline, Tooltip, ZoomControl, useMap
} from 'react-leaflet';
import { Play, Pause, RotateCcw, Ship, ChevronLeft, Check, Settings, ArrowLeftRight } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import useMissionStore from '../../store/missionStore';
import useOutfitterStore from '../../store/outfitterStore';
import useConfigurationStore from '../../store/configurationStore';
import useNavigationStore from '../../store/navigationStore';
import { vesselHullData } from '../../data/vesselData';
import { MISSION_ROLES } from '../../data/missionRoles';
import imgM48 from '../../assets/images/M48.png';
import imgSubSeaSail from '../../assets/images/SubSeaSail.png';
import SwapVesselModal from './SwapVesselModal';
import ReadinessChecklist from './ReadinessChecklist';
import { getMissionReadiness } from '../../utils/missionReadiness';
import { HULL_IMAGES } from '../../utils/hullImages';

const VESSEL_ROSTER = [
  { name: 'M48 (Supply Carrier)', roleDescriptor: '(Supply Carrier)', image: imgM48, hullName: 'M48', capabilities: ['20-ft TEU Dry Cargo Module', '20-ft TEU Fuel Bladder Module', 'Lattice Mesh Network', 'Bow Ramp Delivery System'], roleKey: 'CL_T82' },
  { name: 'SubSeaSail Horus (Beach Scout)', roleDescriptor: '(Beach Scout)', image: imgSubSeaSail, hullName: 'SubSeaSail Horus', capabilities: ['EO/IR Beach Recon Camera', 'Echodyne EchoGuard CR', 'Encrypted Mesh Link to M48', 'Lattice Mesh Network'], roleKey: 'CL_T12' },
];

const MISSION_SET_KEY = 'CONTESTED_LOGISTICS';
const MISSION_SET_CAPS = ['Echodyne EchoGuard CR', 'Encrypted Mesh Link to M48', 'Lattice Mesh Network'];

// ─── Geography ────────────────────────────────────────────────────────────────
const NM_TO_M = 1852;
const MAP_CENTER = [11.0, 115.5];
const MAP_ZOOM = 7;

// ESB staging position (near Palawan, Philippines — outside WEZ)
const ESB_POS = [10.0, 118.5];

// T82 supply route into EABO position
const SUPPLY_TRACK = [
  [10.0, 118.5],  // Alpha — ESB staging
  [10.4, 115.8],  // Bravo — open water
  [10.9, 114.5],  // Charlie — WEZ entry
  [11.0, 113.5],  // Delta — GPS-denied zone entry
  [11.1, 113.0],  // Echo — EABO delivery point
];

// RTB via alternate route (different from inbound — standard evasion TTP)
const RTB_TRACK = [
  [11.1, 113.0],
  [10.7, 113.6],
  [10.2, 114.8],
  [10.0, 118.5],
];

// Named delivery point (last waypoint on supply track)
const DELIVERY_PT = [11.1, 113.0];

// SubSeaSail HORUS scout — deploys the instant M48 crosses into the DF-26 WEZ.
// Races ahead while M48 handles EMCON, GPS jamming and PLAN probe.
// M48 position at T_SCOUT_LAUNCH=T_EMCON_CONFIRM=20:
//   t = (20-12)/(88-12) = 8/76 ≈ 0.105 → progress = 0.421 → segment 0→1 frac 0.421
//   → lerp([10.0,118.5], [10.4,115.8], 0.421) ≈ [10.168, 117.363]
const SCOUT_LAUNCH_POS = [10.168, 117.363];
const SCOUT_TRACK = [
  SCOUT_LAUNCH_POS,        // detaches from T82 at WEZ boundary
  [10.8, 115.2],           // fast transit ahead of T82
  [11.0, 113.8],           // entering GPS-denied zone before T82
  DELIVERY_PT,             // arrives at EABO island, clears beach
];

// DF-26 A2/AD envelope (anti-ship ballistic missile WEZ, simplified)
const DF26_CENTER  = [22.5, 110.0];
const DF26_RANGE_M = 1500 * 1000; // 1,500 km ≈ inner WEZ

// PLAN surface patrol zone (Spratly Islands area)
const PLAN_PATROL_CENTER = [15.0, 114.0];
const PLAN_PATROL_M      = 80 * NM_TO_M;

// GPS-denied jamming zone
const GPS_DENIED_CENTER = [11.05, 113.4];
const GPS_DENIED_M      = 50 * NM_TO_M;

// ─── Tick milestones ──────────────────────────────────────────────────────────
const T_LOAD_COMPLETE   =  8;
const T_TRANSIT_START   = 12;
const T_EMCON_CONFIRM   = 20;
const T_GPS_ENTRY       = 32;
const T_INS_FALLBACK    = 35;
const T_SCOUT_LAUNCH    = 20;  // T12 deploys the moment T82 crosses into DF-26 WEZ
const T_PLAN_PROBE      = 47;
const T_BEACH_CLEAR     = 54;  // T12 clears LZ — T82 receives go-ahead
const T_APPROACH_START  = 58;  // T82 begins final approach on beach-clear signal
const T_RAMP_DEPLOY     = 70;
const T_OFFLOAD_DONE    = 84;
const T_RTB_START       = 88;
const T_GPS_RESTORED    = 100;
const T_RTB_COMPLETE    = 116;
const TOTAL_TICKS       = 120;

const TILE_BASE    = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_SEAMARK = 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const lerp2    = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const trackPos = (track, t) => {
  const clamped  = Math.min(Math.max(t, 0), 0.9999);
  const progress = clamped * (track.length - 1);
  const idx      = Math.floor(progress);
  return lerp2(track[idx], track[idx + 1], progress - idx);
};

const EVENT_COLORS = {
  warn: 'text-amber-400', alert: 'text-red-400', info: 'text-cyan-400', success: 'text-emerald-400',
};

const getPhase = (tick) => {
  if (tick < T_LOAD_COMPLETE)   return 'loading';
  if (tick < T_TRANSIT_START)   return 'pre_departure';
  if (tick < T_EMCON_CONFIRM)   return 'transit';
  if (tick < T_GPS_ENTRY)       return 'emcon';
  if (tick < T_INS_FALLBACK)    return 'gps_entry';
  if (tick < T_PLAN_PROBE)      return 'ins_active';
  if (tick < T_BEACH_CLEAR)     return 'plan_probe';
  if (tick < T_APPROACH_START)  return 'beach_clear';
  if (tick < T_RAMP_DEPLOY)     return 'approach';
  if (tick < T_OFFLOAD_DONE)    return 'offload';
  if (tick < T_RTB_START)       return 'ramp_retract';
  if (tick < T_GPS_RESTORED)    return 'rtb';
  if (tick < T_RTB_COMPLETE)    return 'gps_restored';
  return 'complete';
};

const getT82Pos = (tick) => {
  if (tick < T_TRANSIT_START)   return SUPPLY_TRACK[0];
  if (tick >= T_RTB_START && tick < T_RTB_COMPLETE) {
    const t = (tick - T_RTB_START) / (T_RTB_COMPLETE - T_RTB_START);
    return trackPos(RTB_TRACK, t);
  }
  if (tick >= T_RTB_COMPLETE)   return RTB_TRACK[RTB_TRACK.length - 1];
  if (tick >= T_OFFLOAD_DONE)   return SUPPLY_TRACK[SUPPLY_TRACK.length - 1];
  const t = (tick - T_TRANSIT_START) / (T_RTB_START - T_TRANSIT_START);
  return trackPos(SUPPLY_TRACK, t);
};

const getScoutPos = (tick) => {
  if (tick < T_SCOUT_LAUNCH) return null;
  // Transit to island ahead of T82
  if (tick < T_BEACH_CLEAR) {
    const t = (tick - T_SCOUT_LAUNCH) / (T_BEACH_CLEAR - T_SCOUT_LAUNCH);
    return trackPos(SCOUT_TRACK, t);
  }
  // LZ overwatch orbit — slow circle around delivery point until T82 departs
  if (tick < T_RTB_START) {
    const angle = ((tick - T_BEACH_CLEAR) / 28) * 2 * Math.PI;
    return [DELIVERY_PT[0] + 0.018 * Math.sin(angle), DELIVERY_PT[1] + 0.025 * Math.cos(angle)];
  }
  // T12 stays at island as USMC comms relay — no longer rendered
  return null;
};

const getPhaseBadge = (phase) => {
  const m = {
    loading:       { cls: 'bg-gray-800/80 text-gray-300 border-gray-600/40',                            label: '⬛ Cargo Loading — Manifest Verification' },
    pre_departure: { cls: 'bg-blue-900/80 text-blue-300 border-blue-500/40',                            label: '→ Pre-Departure Checks Complete' },
    transit:       { cls: 'bg-blue-900/80 text-blue-300 border-blue-500/40',                            label: '→ M48 Autonomous Transit — EMCON Route' },
    emcon:         { cls: 'bg-violet-900/80 text-violet-300 border-violet-500/40 animate-pulse',        label: '◈ EMCON Active — Iridium LPI Intervals Only' },
    gps_entry:     { cls: 'bg-amber-900/80 text-amber-300 border-amber-500/40 animate-pulse',           label: '⚠ GPS Jamming Detected — Zone Entry' },
    ins_active:    { cls: 'bg-amber-900/80 text-amber-400 border-amber-400/60 animate-pulse',           label: '⚡ INS Fallback Active — Magnet DriveAI INS' },
    plan_probe:    { cls: 'bg-red-900/80 text-red-300 border-red-500/40 animate-pulse',                 label: '⚠ PLAN Surface Contact — M48 Maintaining Course' },
    approach:      { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40 animate-pulse',              label: '→ Beach Approach — Speed ↓ — Visual Nav Active' },
    beach_clear:   { cls: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40 animate-pulse',     label: '✓ HORUS: Site Clear — Delivery Authorized' },
    offload:       { cls: 'bg-emerald-900/80 text-emerald-400 border-emerald-400/60 animate-pulse',     label: '⬇ Bow Ramp Deployed — Offloading 8.5 MT Cargo' },
    ramp_retract:  { cls: 'bg-blue-900/80 text-blue-300 border-blue-500/40',                            label: '↑ Ramp Retracted — RTB via Alternate Route' },
    rtb:           { cls: 'bg-blue-900/80 text-blue-300 border-blue-500/40 animate-pulse',              label: '← RTB — Alternate Route — EMCON Maintained' },
    gps_restored:  { cls: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40',                   label: '✓ GPS Restored — Normal Navigation Resumed' },
    complete:      { cls: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40',                   label: '✓ EABO Resupply Complete — 0 Crew Exposure' },
  };
  return m[phase] || null;
};

// ─── Phase narratives ─────────────────────────────────────────────────────────
const PHASE_NARRATIVE = {
  loading:       null,
  pre_departure: { title: 'Pre-Departure Checks Complete', body: 'ESB: 2× TEU loaded — Dry Cargo + Fuel Bladder. TempestOS pre-departure checklist verified. Primary route loaded, alternate route pre-calculated. Iridium LPI burst schedule armed.' },
  transit:       { title: 'M48 Autonomous Transit — EMCON Route', body: 'M48 BRAVO underway — autonomous routing toward EABO position inside DF-26 WEZ. EMCON mode engaged — only Iridium LPI scheduled bursts every 47 minutes. Zero RF detectable by PLAN sensors.' },
  emcon:         { title: 'EMCON Active — WEZ Entry', body: 'M48 BRAVO crossing DF-26 A2/AD boundary — Waypoint BRAVO. All non-essential emissions silenced. Magnet DriveAI maintaining course and behavior profile. HORUS scout already advancing ahead.' },
  gps_entry:     { title: 'GPS Jamming Detected — Zone Entry', body: 'TempestOS: GPS signal quality degraded — entering PLAN jamming envelope. Switching to INS fallback: Magnet DriveAI INS. Estimated drift <0.1 nm/hr. Navigation continues uninterrupted.' },
  ins_active:    { title: 'INS Navigation Active', body: 'Magnet DriveAI INS holding position — GPS-denied transit underway. M48 maintaining 15-knot approach. HORUS already deployed ahead, transiting submerged to EABO island for LZ recon before M48 arrives.' },
  plan_probe:    { title: 'PLAN Surface Contact — Probe Underway', body: 'TempestOS: PLAN Type-022 Houbei fast attack craft at bearing 025, range 12nm — tracking M48 BRAVO. DriveAI maintaining course, speed, and behavior profile. No deviations.' },
  beach_clear:   { title: 'HORUS: Beach Clear', body: 'HORUS EO/IR confirms LZ clear — no threat contacts on beach or approach. Encrypted mesh link to M48: GO signal transmitted. HORUS entering LZ overwatch. M48 beginning final approach at 6 knots.' },
  approach:      { title: 'Final Approach — Visual Nav Active', body: 'M48 BRAVO: beach-clear cue received — speed reduced to 6 kts, EO-based approach guidance active. No GPS required. HORUS orbiting in overwatch. Bow ramp ready for autonomous deployment on grounding.' },
  offload:       { title: 'Bow Ramp Deployed — Offloading', body: '8.5 MT cargo transfer underway: Dry cargo pallets down the ramp, JP-8 fuel bladder autonomous pump-out to shore tank. Marine SIF receiving element on beach. HORUS overwatch: site clear throughout.' },
  ramp_retract:  { title: 'Offload Complete — RTB', body: 'Manifest confirmed by receiving unit. 8.5 MT delivered. Bow ramp retracted. M48 departing EABO position via alternate route — heading 135° to avoid inbound track. EMCON maintained.' },
  rtb:           { title: 'Return Transit — Alternate Route', body: 'M48 BRAVO on alternate RTB route — GPS-denied zone fading behind. Iridium LPI burst schedule active. TrellisWare mesh link re-establishing with ESB at range. PLAN unaware of M48 departure.' },
  gps_restored:  { title: 'GPS Restored — Normal Nav', body: 'GPS signal nominal — reverting to GPS/INS hybrid nav. DriveAI accumulated drift within spec. M48 approaching ESB staging position. Mission cost-per-ton logging.' },
  complete:      { title: 'EABO Resupply Complete', body: '8.5 MT delivered inside DF-26 WEZ. Zero crew exposure. PLAN unaware throughout. Transit time 6.2hr. M48 back at ESB. After-action record submitted to INDOPACOM PAE RAS. USV-only logistics pipeline validated.' },
};

// ─── Workflow steps ───────────────────────────────────────────────────────────
const WORKFLOW_STEPS = [
  { key: 'request',  label: 'Resupply Request',   activePhases: [] },
  { key: 'route',    label: 'Route Planning',      activePhases: [] },
  { key: 'loading',  label: 'Loading Sequence',    activePhases: ['loading', 'pre_departure'] },
  { key: 'transit',  label: 'Transit Monitoring',  activePhases: ['transit', 'emcon', 'gps_entry', 'ins_active', 'plan_probe', 'approach', 'beach_clear'] },
  { key: 'delivery', label: 'Delivery Execution',  activePhases: ['offload', 'ramp_retract'] },
  { key: 'aar',      label: 'After-Action Record', activePhases: ['rtb', 'gps_restored', 'complete'] },
];

// ─── Vessel loadouts ──────────────────────────────────────────────────────────
const T82_MOUNTS = [
  { slot: 'CARGO FWD',    name: '20-ft TEU Dry Cargo Module',      vendor: 'PAE RAS Integration',        color: '#8b5cf6', description: 'Ammunition, spare parts, medical — 24,000 kg — automated crane interface + bow ramp' },
  { slot: 'CARGO AFT',    name: '20-ft TEU Fuel Bladder Module',    vendor: 'PAE RAS Integration',        color: '#8b5cf6', description: 'JP-8 / F-76 — 15,000L — autonomous pump-out at beach; gravity or powered' },
  { slot: 'INS',          name: 'Magnet DriveAI INS',              vendor: 'Magnet Defense',             color: '#06b6d4', description: 'GPS-denied fallback — <0.1 nm/hr drift estimated — active for this mission ✓' },
  { slot: 'COMMS',        name: 'Iridium SATCOM — LPI Mode',        vendor: 'Iridium',                    color: '#3b82f6', description: 'Scheduled LPI burst transmissions — EMCON-compliant position updates' },
  { slot: 'DELIVERY',     name: 'Bow Ramp Delivery System',         vendor: 'PAE RAS Integration',        color: '#10b981', description: 'Autonomous deploy/retract — beach delivery — gated by HORUS site-clear cue' },
];

const T12_MOUNTS = [
  { slot: 'SENSOR',   name: 'EO/IR Camera — Beach Recon',      vendor: 'L3Harris',     color: '#06b6d4', description: 'Visual site confirmation before M48 approach — day/night' },
  { slot: 'SENSOR',   name: 'Echodyne EchoGuard CR',            vendor: 'Echodyne',     color: '#f97316', description: '1.25 kg ESA radar — surface threat detection and C-UAS — autonomous abort trigger if contact detected' },
  { slot: 'COMMS',    name: 'Encrypted Mesh Link → M48',        vendor: 'TrellisWare',  color: '#3b82f6', description: 'Site-clear relay to M48 — authorizes bow ramp deployment' },
];

// ─── Cost reference (used in event log only) ──────────────────────────────────
const MISSION_CARGO_TONS     = 8.5;
const USV_PLATFORM_AMORTIZED = 12500;
const USV_FUEL               = 2100;
const USV_TOTAL              = USV_PLATFORM_AMORTIZED + USV_FUEL;
const USV_COST_PER_TON       = Math.round(USV_TOTAL / MISSION_CARGO_TONS);

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
const ContestedLogisticsMissionView = ({ mission, onBack }) => {
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

  const [missionName,       setMissionName]       = useState(mission?.name || '');
  const [currentTick,       setCurrentTick]       = useState(0);
  const [pulseTick,         setPulseTick]         = useState(false);
  const [gpsDeniedVisible,  setGpsDeniedVisible]  = useState(false);
  const [planContactVisible,setPlanContactVisible] = useState(false);
  const [offloadActive,     setOffloadActive]     = useState(false);
  const [events,            setEvents]            = useState([]);
  const [running,           setRunning]           = useState(false);
  const [paused,        setPaused]        = useState(false);
  const [complete,          setComplete]          = useState(false);

  const tickRef        = useRef(0);
  const tickCallbackRef = useRef(null);
  const mainTimer      = useRef(null);
  const pulseTimer     = useRef(null);
  const loopTimer      = useRef(null);
  const addEvtRef      = useRef(null);
  const runScenarioRef = useRef(null);
  const vesselLabelsRef = useRef([]);

  const phase    = getPhase(currentTick);
  const t82Pos   = getT82Pos(currentTick);
  const scoutPos = getScoutPos(currentTick);
  const badge    = getPhaseBadge(phase);
  const narrative = PHASE_NARRATIVE[phase] || null;

  const activeWorkflowStep = WORKFLOW_STEPS.find(s => s.activePhases.includes(phase));

  const _addEvent = (msg, type = 'info') => {
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setEvents(prev => [{ ts, msg, type, id: `${ts}-${msg.slice(0, 12)}` }, ...prev].slice(0, 35));
  };
  const pause = useCallback(() => {
    clearInterval(mainTimer.current);
    mainTimer.current = null;
    clearTimeout(loopTimer.current);
    loopTimer.current = null;
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

  useEffect(() => {
    clearInterval(pulseTimer.current);
    const needsPulse = ['emcon', 'gps_entry', 'ins_active', 'plan_probe', 'approach', 'beach_clear', 'offload', 'rtb'].includes(phase);
    if (needsPulse) {
      pulseTimer.current = setInterval(() => setPulseTick(p => !p), 350);
      return () => clearInterval(pulseTimer.current);
    }
    setPulseTick(false);
  }, [phase]);

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

  const stopAll = useCallback(() => {
    clearInterval(mainTimer.current);
    clearInterval(pulseTimer.current);
    clearTimeout(loopTimer.current);
    mainTimer.current = pulseTimer.current = loopTimer.current = null;
  }, []);

  const reset = useCallback(() => {
    stopAll();
    tickRef.current = 0;
    setPaused(false);
    setCurrentTick(0);
    setPulseTick(false);
    setGpsDeniedVisible(false);
    setPlanContactVisible(false);
    
    setOffloadActive(false);
    setEvents([]);
    setRunning(false);
    setComplete(false);
  }, [stopAll]);

  const runScenario = useCallback(() => {
    stopAll();
    tickRef.current = 0;
    setCurrentTick(0);
    setPulseTick(false);
    setGpsDeniedVisible(false);
    setPlanContactVisible(false);
    
    setOffloadActive(false);
    setEvents([]);
    setRunning(true);
    setPaused(false);
    setComplete(false);

    const cb = () => {
      const tick = ++tickRef.current;
      const v0 = vesselLabelsRef.current[0] ?? 'M48 (Supply Carrier)';
      const v1 = vesselLabelsRef.current[1] ?? 'SubSeaSail Horus (Beach Scout)';
      setCurrentTick(tick);

      if (tick === T_LOAD_COMPLETE) {
        addEvtRef.current('ESB: Cargo manifest verified — 2× 20-ft TEU loaded (Dry Cargo + Fuel Bladder)', 'info');
        addEvtRef.current('TempestOS: Pre-departure checklist complete — nav systems, comms, emergency RTB behavior loaded', 'info');
      }
      if (tick === T_TRANSIT_START) {
        addEvtRef.current(`${v0}: Departing ESB — autonomous transit initiated — EMCON route active`, 'info');
        addEvtRef.current('TempestOS: Primary route loaded — alternate route + emergency RTB waypoints pre-calculated', 'info');
        addEvtRef.current('Iridium: LPI burst schedule active — position update every 47 minutes', 'info');
      }
      if (tick === T_EMCON_CONFIRM) {
        addEvtRef.current(`${v0}: Waypoint BRAVO — entering DF-26 WEZ — radio silence maintained`, 'warn');
        addEvtRef.current('TempestOS: EMCON mode engaged — all non-essential emissions silenced', 'warn');
        addEvtRef.current(`INDOPACOM: ${v0} tracking via Iridium schedule — 0 emissions detected by PLAN sensors`, 'info');
      }
      if (tick === T_GPS_ENTRY) {
        setGpsDeniedVisible(true);
        addEvtRef.current('TempestOS: GPS JAMMING DETECTED — signal quality degraded — Waypoint DELTA entry', 'warn');
        addEvtRef.current('TempestOS: Switching to INS fallback — Magnet DriveAI INS — <0.1 nm/hr drift', 'warn');
      }
      if (tick === T_INS_FALLBACK) {
        addEvtRef.current('DriveAI: INS navigation active — position hold confirmed — continuing to EABO delivery point', 'success');
        addEvtRef.current(`${v0}: Speed maintained at 15 kts on INS — ETA delivery point 42 minutes`, 'info');
      }
      if (tick === T_PLAN_PROBE) {
        setPlanContactVisible(true);
        addEvtRef.current('TempestOS: PLAN surface contact — bearing 025 — estimated Type-022 Houbei FAC — range 12nm', 'alert');
        addEvtRef.current(`TempestOS: Contact tracking ${v0} — DriveAI maintaining course, speed, behavior profile`, 'warn');
        addEvtRef.current(`${v0}: No deviations — PLAN vessel passed without intercept — contact fading`, 'success');
      }
      if (tick === T_SCOUT_LAUNCH) {
        addEvtRef.current(`${v1}: Scout launched ahead of M48 — advancing to EABO island for LZ recon`, 'info');
        addEvtRef.current(`${v1}: EO/IR online — coastal surface radar active — clear-to-deliver check initiated`, 'info');
      }
      if (tick === T_BEACH_CLEAR) {
        setPlanContactVisible(false);
        addEvtRef.current(`${v1}: LZ CLEAR — no threat contacts — beach delivery zone confirmed safe`, 'success');
        addEvtRef.current(`${v1}: Encrypted mesh link → ${v0} — GO signal sent — entering LZ overwatch`, 'success');
      }
      if (tick === T_APPROACH_START) {
        addEvtRef.current(`${v0}: Beach-clear signal received — beginning final approach at 6 kts`, 'info');
        addEvtRef.current('TempestOS: Visual nav active — switching to EO-based approach guidance', 'info');
      }
      if (tick === T_RAMP_DEPLOY) {
        setOffloadActive(true);
        addEvtRef.current(`${v0}: BOW RAMP DEPLOYED — offload sequence initiated`, 'success');
        addEvtRef.current(`${v0}: Dry cargo module offloading — Marine SIF receiving element on beach`, 'info');
      }
      if (tick === T_RAMP_DEPLOY + 7) {
        addEvtRef.current(`${v0}: Fuel bladder autonomous pump-out — JP-8 transfer to shore tank — 15,000L`, 'info');
      }
      if (tick === T_OFFLOAD_DONE) {
        setOffloadActive(false);
        addEvtRef.current(`${v0}: OFFLOAD COMPLETE — manifest confirmed by receiving unit — 8.5 MT delivered`, 'success');
        addEvtRef.current(`${v0}: Bow ramp retracted — RTB via alternate route — departing EABO position`, 'info');
      }
      if (tick === T_RTB_START) {
        addEvtRef.current('TempestOS: RTB route loaded — alternate heading 135° — emergency RTB waypoint set', 'info');
        addEvtRef.current(`${v0}: RTB transit — EMCON maintained — Iridium LPI schedule active`, 'info');
      }
      if (tick === T_GPS_RESTORED) {
        setGpsDeniedVisible(false);
        addEvtRef.current('TempestOS: GPS RESTORED — signal quality nominal — reverting to GPS/INS hybrid nav', 'success');
        addEvtRef.current('TempestOS: DriveAI INS accumulated drift within spec', 'success');
      }
      if (tick === T_RTB_COMPLETE - 5) {
        addEvtRef.current(`${v0}: ESB approach — comms transitioning from Iridium to tactical UHF`, 'info');
      }
      if (tick >= TOTAL_TICKS) {
        clearInterval(mainTimer.current);
        mainTimer.current = null;
        setRunning(false);
        setComplete(true);
        addEvtRef.current('INDOPACOM: Mission complete — 8.5 MT delivered — 0 crew exposure — PLAN unaware', 'success');
        addEvtRef.current(`After-Action: Cost-per-ton $${USV_COST_PER_TON.toLocaleString()} — Transit time 6.2hr — 0 threat incidents`, 'success');
        loopTimer.current = setTimeout(() => { if (loopTimer.current !== null) runScenarioRef.current?.(); }, 5000);
      }
    };
    tickCallbackRef.current = cb;
    mainTimer.current = setInterval(cb, 280);
  }, [stopAll]);

  useLayoutEffect(() => { runScenarioRef.current = runScenario; });
  useEffect(() => () => stopAll(), [stopAll]);

  const handleSave = () => {
    if (!missionName.trim()) return;
    const data = {
      name: missionName.trim(),
      template: 'CONTESTED_LOGISTICS',
      domain: 'MARITIME',
      status: 'active',
      duration: '7d',
      zoneConfig: {
        name: 'INDOPACOM EABO Resupply — SCS Forward Position',
        waypoints: SUPPLY_TRACK.map((pos, i) => ({
          lat: pos[0], lng: pos[1],
          label: ['ESB-STAGING', 'ALPHA', 'BRAVO-WEZ-ENTRY', 'CHARLIE-GPS-DENIED', 'ECHO-DELIVERY'][i],
        })),
      },
      assignedSquadrons: ['sqdn_004'],
      missionProfile: {
        type: 'CONTESTED_LOGISTICS',
        lane: 'EABO_RESUPPLY',
        classification: 'CDR Anderson PAE RAS — INDOPACOM Contested Logistics',
        gpsDeniedConfirmed: true,
        vessels: [
          { type: 'M48', role: 'Main Supply Run', cargoModules: ['DRY_CARGO_TEU', 'FUEL_BLADDER_TEU'] },
          { type: 'SubSeaSail_HORUS', role: 'Scout/Precursor', cargoModules: [] },
        ],
        commsArchitecture: {
          primary: 'Iridium SATCOM (LPI scheduled bursts)',
          secondary: 'TrellisWare TW-950 mesh (ESB range)',
          groundStation: 'INDOPACOM / PAE RAS MOC',
          homeBase: 'ESB Staging Position',
        },
        objectives: {
          primary: 'Deliver 8.5 MT mixed cargo (dry + fuel) to EABO Marine Stand-in Force at SCS forward position inside DF-26 WEZ without crew exposure or strategic signature',
          secondary: 'Validate USV-only logistics pipeline as replacement for manned T-AO within adversary anti-ship missile WEZ — support PAE RAS INDOPACOM Contested Logistics mission set',
        },
        costPerTonUSV: USV_COST_PER_TON,
        wezDelivery: true,
      },
      stateHierarchies: {
        default:       ['Navigation', 'Vehicle', 'Comms', 'Mission', 'Payload'],
        emcon_transit: ['Navigation', 'Comms', 'Vehicle', 'Mission', 'Payload'],
        gps_denied:    ['Navigation', 'Vehicle', 'Mission', 'Comms', 'Payload'],
        threat_probe:  ['Navigation', 'Vehicle', 'Comms', 'Mission', 'Payload'],
        delivery:      ['Mission', 'Payload', 'Navigation', 'Vehicle', 'Comms'],
        rtb:           ['Navigation', 'Vehicle', 'Comms', 'Mission', 'Payload'],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      launchedAt: new Date().toISOString(),
      history: [{ action: 'created', timestamp: new Date().toISOString(), details: 'PAE RAS CDR Anderson INDOPACOM Contested Logistics' }],
    };
    if (mission?.id) updateMission(mission.id, data);
    else saveMission(data);
    onBack();
  };

  // ── Derived visual state ──────────────────────────────────────────────────
  const inRTB = currentTick >= T_RTB_START && currentTick < T_RTB_COMPLETE;
  const isInWez        = currentTick >= T_EMCON_CONFIRM && currentTick < T_RTB_COMPLETE;

  // GPS-denied zone pulsing radius
  const gpsDeniedR = gpsDeniedVisible
    ? GPS_DENIED_M + (pulseTick ? 1200 : 0)
    : GPS_DENIED_M;

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
        <Ship size={13} className="text-violet-400" />
        <span className="text-violet-400 text-[0.8rem] font-semibold tracking-wide">Contested Logistics — EABO Resupply</span>
        <span className="hidden md:inline text-gray-600 text-[0.7rem]">·</span>
        <span className="hidden md:inline text-gray-500 text-[0.68rem]">M48 · SubSeaSail HORUS · SCS INDOPACOM · CDR Anderson, PAE RAS</span>
        <div className="flex-1" />
        <span className="px-2 py-0.5 rounded-full bg-violet-900/50 text-violet-400 text-[0.65rem] font-bold uppercase tracking-wider border border-violet-500/30">
          EABO
        </span>
        <input
          value={missionName}
          onChange={e => setMissionName(e.target.value)}
          placeholder="Mission name…"
          className="hidden md:block bg-gray-800/60 border border-gray-700/60 rounded-md px-3 py-1.5 text-white text-[0.78rem] w-52 placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors"
        />
        <button
          onClick={handleSave}
          disabled={!missionName.trim() || !isDeployable}
          className={`hidden md:block px-3 py-1.5 rounded-md text-[0.78rem] font-semibold transition-colors ${
            missionName.trim() && isDeployable
              ? 'bg-violet-700 hover:bg-violet-600 text-white'
              : 'bg-gray-700/50 text-gray-600 cursor-not-allowed'
          }`}
        >
          Save Draft
        </button>
      </div>

      {/* ── Mission Workflow Steps ── */}
      <div className="flex items-center gap-0 px-4 py-2 border-b border-gray-700/40 flex-shrink-0 bg-darkest">
        {WORKFLOW_STEPS.map((step, i) => {
          const isActive = activeWorkflowStep?.key === step.key;
          const isDone   = WORKFLOW_STEPS.findIndex(s => s.key === activeWorkflowStep?.key) > i;
          return (
            <React.Fragment key={step.key}>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[0.62rem] font-semibold uppercase tracking-wide transition-colors ${
                isActive  ? 'bg-violet-900/60 text-violet-300 border border-violet-500/40' :
                isDone    ? 'text-emerald-400/70' :
                            'text-gray-600'
              }`}
              >
                {isDone && <Check size={9} />}
                <span>{step.label}</span>
              </div>
              {i < WORKFLOW_STEPS.length - 1 && (
                <div className={`w-6 h-px mx-0.5 ${isDone ? 'bg-emerald-500/40' : 'bg-gray-700/60'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 min-h-0 overflow-y-auto">

        {/* ── Map + Sidebar ── */}
        <div className="flex h-[40vh] md:h-[430px]">

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
              <TileLayer url={TILE_SEAMARK} opacity={0.45} />
              <MapInvalidateSize />

              {/* DF-26 A2/AD envelope — large red dashed zone */}
              <Circle
                center={DF26_CENTER}
                radius={DF26_RANGE_M}
                pathOptions={{ color: '#ef4444', weight: 1.5, dashArray: '10 8', fillColor: '#ef4444', fillOpacity: 0.04 }}
              >
                <Tooltip direction="right" offset={[8, 0]}>
                  <span style={{ fontSize: 10, color: '#fca5a5', fontWeight: 700 }}>DF-26 ASBM WEZ</span>
                </Tooltip>
              </Circle>

              {/* PLAN surface patrol zone */}
              <Circle
                center={PLAN_PATROL_CENTER}
                radius={PLAN_PATROL_M}
                pathOptions={{ color: '#f97316', weight: 1, dashArray: '6 5', fillColor: '#f97316', fillOpacity: 0.06 }}
              >
                <Tooltip direction="right" offset={[8, 0]}>
                  <span style={{ fontSize: 10, color: '#fdba74' }}>PLAN Surface Patrol Zone</span>
                </Tooltip>
              </Circle>
              <CircleMarker center={PLAN_PATROL_CENTER} radius={4}
                pathOptions={{ color: '#f97316', fillColor: '#7c2d12', fillOpacity: 0.9, weight: 1.5 }}
              />

              {/* PLAN surface contact (visible during probe phase) */}
              {planContactVisible && (
                <CircleMarker
                    center={[12.5, 114.2]}
                    radius={pulseTick ? 8 : 6}
                    pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.85, weight: 2 }}
                >
                    <Tooltip permanent direction="top" offset={[0, -12]}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#fb923c' }}>⚠ PLAN FAC — Tracking</span>
                    </Tooltip>
                </CircleMarker>
              )}

              {/* GPS-denied zone (amber) */}
              {gpsDeniedVisible && (
                <Circle
                  center={GPS_DENIED_CENTER}
                  radius={gpsDeniedR}
                  pathOptions={{ color: '#f59e0b', weight: 2, fillColor: '#f59e0b', fillOpacity: 0.12 }}
                >
                  <Tooltip permanent direction="top" offset={[0, -14]}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#fbbf24' }}>GPS DENIED — INS ACTIVE</span>
                  </Tooltip>
                </Circle>
              )}
              {/* GPS-denied zone always faint outline */}
              <Circle
                center={GPS_DENIED_CENTER}
                radius={GPS_DENIED_M}
                pathOptions={{ color: '#f59e0b', weight: 1, opacity: 0.25, dashArray: '5 8', fillOpacity: 0 }}
              />

              {/* Supply route track (inbound) */}
              <Polyline
                positions={SUPPLY_TRACK}
                pathOptions={{ color: '#8b5cf6', opacity: 0.22, weight: 1.5, dashArray: '5 9' }}
              />

              {/* RTB track (outbound, alternate route) */}
              {inRTB && (
                <Polyline
                  positions={RTB_TRACK}
                  pathOptions={{ color: '#3b82f6', opacity: 0.30, weight: 1.5, dashArray: '4 8' }}
                />
              )}

              {/* ESB staging marker */}
              <CircleMarker center={ESB_POS} radius={7}
                pathOptions={{ color: '#3b82f6', fillColor: '#1e3a8a', fillOpacity: 0.9, weight: 2 }}
              >
                <Tooltip direction="right" offset={[10, 0]}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#93c5fd' }}>ESB Staging</span>
                </Tooltip>
              </CircleMarker>

              {/* EABO island base — always visible so destination is clear from the start */}
              <CircleMarker
                center={DELIVERY_PT}
                radius={8}
                pathOptions={{ color: '#10b981', fillColor: '#052e16', fillOpacity: 0.85, weight: 2 }}
              >
                <Tooltip direction="top" offset={[0, -12]}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#34d399' }}>EABO Island · USMC SIF</span>
                </Tooltip>
              </CircleMarker>

              {/* Active offload ring — pulses on top of island marker during cargo transfer */}
              {offloadActive && (
                <CircleMarker
                  center={DELIVERY_PT}
                  radius={pulseTick ? 16 : 12}
                  pathOptions={{ color: '#22c55e', fillColor: 'transparent', fillOpacity: 0, weight: 2, opacity: pulseTick ? 0.9 : 0.5 }}
                >
                  <Tooltip direction="bottom" offset={[0, 14]}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#4ade80' }}>⬇ OFFLOADING</span>
                  </Tooltip>
                </CircleMarker>
              )}

              {/* MANTAS T12 scout */}
              {scoutPos && (
                <>
                  {currentTick < T_BEACH_CLEAR && (
                    <Polyline
                      positions={[SCOUT_LAUNCH_POS, scoutPos]}
                      pathOptions={{ color: '#06b6d4', opacity: 0.45, weight: 1.5, dashArray: '4 6' }}
                    />
                  )}
                  <CircleMarker
                    center={scoutPos}
                    radius={currentTick >= T_BEACH_CLEAR ? 4 : 5}
                    pathOptions={{ color: '#06b6d4', fillColor: '#06b6d4', fillOpacity: 0.9, weight: 1.5 }}
                  >
                    <Tooltip direction="top" offset={[0, -10]}>
                      <span style={{ fontSize: 9, color: '#67e8f9' }}>
                        {currentTick >= T_BEACH_CLEAR ? 'HORUS · LZ OVERWATCH' : 'HORUS SCOUT'}
                      </span>
                    </Tooltip>
                  </CircleMarker>
                </>
              )}

              {/* T82 main vessel */}
              {currentTick >= T_TRANSIT_START && (
                <CircleMarker
                  center={t82Pos}
                  radius={9}
                  pathOptions={{ color: '#8b5cf6', fillColor: '#8b5cf6', fillOpacity: 0.9, weight: 2 }}
                >
                  <Tooltip direction="top" offset={[0, -14]}>
                    <span style={{ fontSize: 10, color: isInWez ? '#a78bfa' : '#c4b5fd' }}>
                      {offloadActive ? 'M48 · OFFLOADING' : inRTB ? 'M48 · RTB' : `M48 BRAVO${gpsDeniedVisible ? ' · INS' : ''}`}
                    </span>
                  </Tooltip>
                </CircleMarker>
              )}

            </MapContainer>

            {badge && (
              <div className={`absolute top-3 left-3 z-[500] px-3 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wider pointer-events-none border ${badge.cls}`}>
                {badge.label}
              </div>
            )}

            {/* Legend + WEZ label */}
            <div className="hidden md:flex absolute bottom-3 left-3 z-[500] pointer-events-none flex-col gap-1.5">
              <div className="px-3 py-2 rounded-xl bg-gray-950/80 border border-gray-700/50 backdrop-blur-sm">
                <div className="flex flex-col gap-1">
                  {[
                    { color: '#8b5cf6', label: `${effectiveRoster[0]?.name ?? 'M48 (Supply Carrier)'} — Main Supply Run` },
                    { color: '#06b6d4', label: `${effectiveRoster[1]?.name ?? 'SubSeaSail Horus (Beach Scout)'} — Scout / LZ Overwatch` },
                    { color: '#3b82f6', label: 'ESB Staging Vessel' },
                    { color: '#10b981', label: 'EABO Island — USMC SIF' },
                    { color: '#f59e0b', label: 'GPS-Denied Zone' },
                    { color: '#f97316', label: 'PLAN Surface Patrol / FAC' },
                    { color: '#ef4444', label: 'DF-26 ASBM WEZ' },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                      <span style={{ fontSize: 10, color: '#9ca3af' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/60">
                <div className="w-2 h-px border-t border-red-500 border-dashed" />
                <span className="text-red-400 text-[0.6rem] font-semibold">DF-26 ASBM WEZ — manned logistics impossible</span>
              </div>
            </div>

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
          `}>

            {/* Mobile close button */}
            <div className="md:hidden flex justify-end p-2 border-b border-gray-700/50">
              <button
                onClick={() => setShowLog(false)}
                className="px-3 py-1.5 rounded-lg bg-gray-700/60 text-gray-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <div className="p-4 border-b border-gray-700/50 flex-shrink-0">
              <p className="text-gray-500 text-[0.65rem] uppercase tracking-widest mb-3">Scenario</p>
              <div className="flex gap-2 mb-3">
                {running ? (
                  <button
                    onClick={pause}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[0.78rem] font-semibold transition-colors bg-violet-800 hover:bg-violet-700 text-white"
                  >
                    <Pause size={13} />
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={paused ? resume : runScenario}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[0.78rem] font-semibold transition-colors bg-violet-800 hover:bg-violet-700 text-white"
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

              {narrative ? (
                <div className="rounded-lg bg-gray-800/50 border border-gray-700/40 px-3 py-2.5">
                  <div className="text-[0.68rem] font-bold text-violet-300 uppercase tracking-wider mb-1">
                    {narrative.title}
                  </div>
                  <div className="text-[0.67rem] text-gray-400 leading-relaxed">
                    {narrative.body}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-[0.68rem]">M48 · SubSeaSail HORUS · EABO SCS resupply · PAE RAS</p>
              )}
            </div>

            <div className="flex flex-col overflow-hidden" style={{ flex: '1 1 0' }}>
              <p className="text-gray-500 text-[0.65rem] uppercase tracking-widest px-4 pt-3 pb-2 flex-shrink-0">Event Log</p>
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
        </div>

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
              <div className="w-32 flex-shrink-0 bg-gray-950/60 flex items-center justify-center p-2">
                <img src={vessel.image} alt={vessel.name} className="w-full h-full object-contain max-h-24" />
              </div>
              <div className="flex-1 flex flex-col justify-center p-2 gap-1.5">
                <div className="flex items-center gap-1">
                  <div className="text-[0.65rem] font-bold text-gray-300 uppercase tracking-wider">{vessel.name}</div>
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
                {missionRoleDefs[idx]?.cargoRole && (
                  <div className="mt-1 px-2 py-1.5 rounded bg-amber-900/20 border border-amber-500/30 text-[0.6rem] text-amber-400 leading-snug">
                    ⚠ Cargo role — verify your hull has sufficient payload capacity for your intended cargo.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

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

export default ContestedLogisticsMissionView;