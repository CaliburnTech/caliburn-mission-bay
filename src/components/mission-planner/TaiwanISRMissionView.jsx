import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import {
  MapContainer, TileLayer, Circle, CircleMarker, Polyline, Tooltip, ZoomControl, useMap
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
import imgM48 from '../../assets/images/M48.png';

const MISSION_SET_KEY = 'COUNTER_C5ISR';
const MISSION_SET_CAPS = ['HiddenLevel Passive RF Sensor', 'Project Scion (Northrop Grumman)', 'RazorChassis C5ISR Link'];

// ─── Geography ────────────────────────────────────────────────────────────────
const NM_TO_M = 1852;

// Map centered on the strait itself — Fujian coast west, Taiwan east, water in the middle
const MAP_CENTER = [24.10, 119.95];
const MAP_ZOOM   = 8;

// M48 patrol track along the median line — ~119.88°E is mid-strait water
// (Fujian coast ≈119.3–119.6°E; Taiwan west coast ≈120.3–120.5°E at these latitudes)
const M48_TRACK = [
  [23.72, 119.88],  // waypoint ALPHA (southern strait)
  [23.95, 119.90],  // waypoint BRAVO
  [24.18, 119.88],  // waypoint CHARLIE (median line, mid-strait)
  [24.40, 119.86],  // waypoint DELTA
  [24.60, 119.85],  // waypoint ECHO (northern approach)
  [24.40, 119.86],  // return south
  [24.18, 119.88],  // loop back
];

const PLA_RADAR_1 = [25.02, 119.45];
const PLA_RADAR_2 = [24.20, 119.35];
const PLA_RADAR_3 = [23.62, 119.52];
const PLA_RADAR_RANGE_NM = 55;

const PLA_UAV_ORIGIN = [25.05, 119.60];
const PLA_UAV_TRACK  = [
  [25.05, 119.60],
  [24.80, 119.82],
  [24.55, 119.92],
  [24.30, 120.00],  // approaches median line over water
];

// Gap at the eastern edge of PLA radar coverage — still water, well clear of Taiwan coast
const COVERAGE_GAP = [24.05, 120.10];
// Submarine: starts east of Taiwan, threads west through the gap into PLA-claimed western strait
const SUBMARINE_THROUGH_GAP = [
  [23.80, 121.00],  // east of Taiwan (safe)
  [24.00, 120.60],  // rounding south of Taiwan
  [24.05, 120.12],  // transiting through the gap — mid-strait water
  [24.08, 119.78],  // through — western strait, PLA-claimed
];

const CTF77_POS          = [35.28, 139.67];
const LANTERN_RADAR_NM   = 17;
const HIDDENLEVEL_NM     = 40;

// Median line runs north–south at ~119.90°E — equidistant between Fujian and Taiwan coasts
const MEDIAN_LINE = [[23.5, 119.90], [25.0, 119.90]];

// ─── Tick milestones ──────────────────────────────────────────────────────────
const T_PATROL_START    =  5;
const T_LANTERN_DEPLOY  = 12;
const T_LANTERN_FULL    = 27;
const T_ON_STATION      = 20;
const T_PLA_MAPPING     = 30;
const T_EMISSION_ALPHA  = 38;
const T_EMISSION_BRAVO  = 48;
const T_GAP_ID          = 58;
const T_RAZOR_TX        = 67;
const T_SUB_ROUTING     = 76;
const T_UAV_DETECT      = 88;
const T_UAV_TRACKED     = 98;
const T_PATROL_SECURE   = 108;
const TOTAL_TICKS       = 120;

const TICK_MS = 280;

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

// ─── Phase narratives ─────────────────────────────────────────────────────────
const PHASE_NARRATIVE = {
  idle:                  null,
  patrol:                { title: 'M48-DELTA Median Line Patrol', body: 'M48-DELTA transits north along the Taiwan Strait median line at ~119.88°E — equidistant between Fujian coast and Taiwan. HiddenLevel passive RF array already listening. No emissions.' },
  lantern_deployed:      { title: 'LANTERN UAS Ascending', body: 'DPI LANTERN tethered drone ascending to 200ft above M48-DELTA. Radar horizon expanding — 17nm sensor ring growing. EO/IR camera slewing. PLA coastal emissions first entering detection envelope.' },
  pla_mapping:           { title: 'PLA Emissions Sweep', body: 'HiddenLevel passive RF: Fujian coastal radar architecture mapping underway. Three candidate emitters on bearing 265–290. SCION autonomy building PLA sensor coverage geometry model.' },
  emission_alpha:        { title: 'PLA Emitter Alpha Detected', body: 'HiddenLevel: UHF-band long-range air surveillance radar geo-located at 25.02°N 119.45°E — classified YLC-8B long-range air defense radar. Coverage arc 055° to 175°. First emitter pinned.' },
  emission_bravo:        { title: 'PLA Emitters Bravo & Charlie Mapped', body: 'Two more emitters geo-located: BRAVO is L-band acquisition radar at 24.20°N 119.35°E. CHARLIE is Dongshan Island OTH radar at 23.62°N 119.52°E. Three-emitter picture complete. SCION modeling combined coverage.' },
  gap_identified:        { title: 'Coverage Gap Identified — 12nm Blind Spot', body: 'SCION: Intersection seam between BRAVO and CHARLIE coverage arcs creates a 12nm PLA radar blind spot at 24.05°N 120.40°E. Emitter duty cycles create intermittent window 0340–0520L. USS Connecticut can thread through undetected.' },
  razorchassis_transmit: { title: 'RazorChassis Transmitting Gap to CTF-70', body: 'RazorChassis C5ISR link encrypts gap geometry and routing window — pushing to 7th Fleet CTF-70 MOC at Yokosuka via SATCOM. Uplink dot tracking. CTF-70 is tasking USS Connecticut SSN-22 now.' },
  sub_routing:           { title: 'USS Connecticut Threading the Gap', body: 'USS Connecticut SSN-22 routing through 12nm PLA radar blind spot at depth 280m — speed 8kt. SCION monitoring EMITTER BRAVO duty cycle in real time. Gap holding. Connecticut clear of all PLA sensor coverage.' },
  pla_uav_detected:      { title: 'PLA BZK-005 UAV Detected', body: 'HiddenLevel: unscheduled RF contact bearing 310, closing at ~85kt — emission pattern matches PLA BZK-005 maritime patrol UAV. LANTERN EO/IR slewing to acquire. RazorChassis transmitting UAV track to CTF-70.' },
  uav_tracked:           { title: 'BZK-005 Tracked — M48 Stealth Maintained', body: 'LANTERN EO/IR: visual contact — BZK-005 at 20km approaching median line. SCION analysis: UAV on ISR profile, photographing M48-DELTA. M48 RCS 0.01m² — appearing as drifting debris. PLA UAV will not report threat.' },
  patrol_secure:         { title: 'Counter-C5ISR Complete', body: '3 PLA emitters mapped, 1 coverage gap exploited, USS Connecticut routed through undetected, 1 PLA UAV tracked. Zero crew exposure throughout. M48-DELTA resuming median line patrol — LANTERN continuous watch.' },
};

// ─── Phase derivation ────────────────────────────────────────────────────────
const getPhase = (tick) => {
  if (tick < T_PATROL_START)   return 'idle';
  if (tick < T_LANTERN_DEPLOY) return 'patrol';
  if (tick < T_PLA_MAPPING)    return 'lantern_deployed';
  if (tick < T_EMISSION_ALPHA) return 'pla_mapping';
  if (tick < T_EMISSION_BRAVO) return 'emission_alpha';
  if (tick < T_GAP_ID)         return 'emission_bravo';
  if (tick < T_RAZOR_TX)       return 'gap_identified';
  if (tick < T_SUB_ROUTING)    return 'razorchassis_transmit';
  if (tick < T_UAV_DETECT)     return 'sub_routing';
  if (tick < T_UAV_TRACKED)    return 'pla_uav_detected';
  if (tick < T_PATROL_SECURE)  return 'uav_tracked';
  return 'patrol_secure';
};

const getM48Pos = (tick) => {
  if (tick < T_PATROL_START) return M48_TRACK[0];
  const t = (tick - T_PATROL_START) / (TOTAL_TICKS - T_PATROL_START);
  return trackPos(M48_TRACK, t);
};

const getPlaUavPos = (tick) => {
  if (tick < T_UAV_DETECT) return null;
  if (tick >= T_PATROL_SECURE) return null;
  const t = (tick - T_UAV_DETECT) / (T_PATROL_SECURE - T_UAV_DETECT);
  return trackPos(PLA_UAV_TRACK, t);
};

const getSubPos = (tick) => {
  if (tick < T_SUB_ROUTING) return null;
  if (tick >= T_UAV_DETECT) return null;
  const t = (tick - T_SUB_ROUTING) / (T_UAV_DETECT - T_SUB_ROUTING);
  return trackPos(SUBMARINE_THROUGH_GAP, t);
};

const getPhaseBadge = (phase) => {
  switch (phase) {
    case 'patrol':              return { cls: 'bg-blue-900/80 text-blue-300 border-blue-500/40',                    label: '→ M48-DELTA Median Line Patrol' };
    case 'lantern_deployed':    return { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40',                    label: '↑ LANTERN Ascending — 200ft' };
    case 'pla_mapping':         return { cls: 'bg-violet-900/80 text-violet-300 border-violet-500/40 animate-pulse', label: '◈ HiddenLevel Mapping PLA Emissions' };
    case 'emission_alpha':      return { cls: 'bg-amber-900/80 text-amber-300 border-amber-500/40 animate-pulse',   label: '⚠ PLA Emitter Alpha Detected' };
    case 'emission_bravo':      return { cls: 'bg-amber-900/80 text-amber-300 border-amber-500/40 animate-pulse',   label: '⚠ PLA Emitters Bravo & Charlie Detected' };
    case 'gap_identified':      return { cls: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40 animate-pulse', label: '◉ Coverage Gap — 12nm Blind Spot' };
    case 'razorchassis_transmit':return { cls: 'bg-red-900/80 text-red-300 border-red-500/40 animate-pulse',        label: '⚡ RazorChassis Gap Data → CTF-70' };
    case 'sub_routing':         return { cls: 'bg-blue-900/80 text-blue-300 border-blue-500/40 animate-pulse',      label: '→ USS Connecticut Routing Through Gap' };
    case 'pla_uav_detected':    return { cls: 'bg-amber-900/80 text-amber-300 border-amber-500/40 animate-pulse',   label: '⚠ PLA BZK-005 UAV Detected' };
    case 'uav_tracked':         return { cls: 'bg-amber-900/80 text-amber-300 border-amber-500/40',                 label: '⚠ BZK-005 Tracked — M48 Stealth Maintained' };
    case 'patrol_secure':       return { cls: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40',           label: '✓ Counter-C5ISR Complete — 0 Crew Exposure' };
    default: return null;
  }
};

// ─── Loadouts ─────────────────────────────────────────────────────────────────
const M48_MOUNTS = [
  { slot: 'ISR DRONE',          name: 'DPI LANTERN Tethered UAS',        vendor: 'Dragonfly Pictures Inc.', description: '200ft elevation — EO/IR tracks PLA UAVs — radar sensor geo-locates PLA emitters' },
  { slot: 'RF / PASSIVE RADAR', name: 'HiddenLevel Passive RF Sensor',   vendor: 'HiddenLevel',             description: 'Zero-emission passive RF — maps PLA coastal radar coverage — identifies blind spots' },
  { slot: 'AUTONOMY',           name: 'Project Scion (Northrop Grumman)',vendor: 'Northrop Grumman',        description: 'Classifies PLA emitter types — models combined coverage geometry — identifies routing windows' },
  { slot: 'FIRE CONTROL LINK',  name: 'RazorChassis C5ISR Link',         vendor: 'RazorChassis',            description: 'Formats PLA gap picture as actionable routing data — pushes to 7th Fleet CTF-70 CIC' },
];

const LANTERN_MOUNTS = [
  { slot: 'EO/IR', name: 'Trillium HD40 EO/IR',        vendor: 'L3Harris Trillium', description: 'Tracks PLA BZK-005 UAVs and PLAN vessels — day/night — auto-cued by HiddenLevel' },
  { slot: 'RADAR', name: 'Emitter Geo-Location Sensor', vendor: '[Classified]',      description: '200ft elevation enables passive triangulation of PLA coastal radar positions at range' },
];

const VESSEL_ROSTER = [
  { name: 'M48 (DPI LANTERN)', roleDescriptor: '(DPI LANTERN)', image: imgM48, hullName: 'M48', capabilities: ['DPI Vulture Tethered UAS', 'HiddenLevel Passive RF Sensor', 'Project Scion (Northrop Grumman)', 'RazorChassis C5ISR Link'], roleKey: 'CC5ISR_M48' },
];

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
const TaiwanISRMissionView = ({ mission, onBack }) => {
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

  const [missionName,     setMissionName]     = useState(mission?.name || '');
  const [currentTick,     setCurrentTick]     = useState(0);
  const [pulseTick,       setPulseTick]       = useState(false);
  const [lanternDeployed, setLanternDeployed] = useState(false);
  const [lanternPulse,    setLanternPulse]    = useState(false);
  const [plaRadars,       setPlaRadars]       = useState([false, false, false]);
  const [gapVisible,      setGapVisible]      = useState(false);
  const [events,          setEvents]          = useState([]);
  const [running,         setRunning]         = useState(false);
  const [paused,        setPaused]        = useState(false);
  const [complete,        setComplete]        = useState(false);

  const tickRef         = useRef(0);
  const tickCallbackRef = useRef(null);
  const mainTimer       = useRef(null);
  const pulseTimer      = useRef(null);
  const lanternTimer    = useRef(null);
  const loopTimer       = useRef(null);
  const addEvtRef       = useRef(null);
  const runScenarioRef  = useRef(null);

  const phase   = getPhase(currentTick);
  const m48Pos  = getM48Pos(currentTick);
  const uavPos  = getPlaUavPos(currentTick);
  const subPos  = getSubPos(currentTick);

  const _addEvent = (msg, type = 'info') => {
    const ts = new Date().toLocaleTimeString('en-US', {
      hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    setEvents(prev => [{ ts, msg, type, id: `${ts}-${msg.slice(0, 10)}` }, ...prev].slice(0, 30));
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
    mainTimer.current = setInterval(tickCallbackRef.current, TICK_MS);
  }, []);


  useLayoutEffect(() => { addEvtRef.current = _addEvent; });

  useEffect(() => {
    clearInterval(pulseTimer.current);
    const needsPulse = [
      'pla_mapping', 'emission_alpha', 'emission_bravo', 'gap_identified',
      'razorchassis_transmit', 'sub_routing', 'pla_uav_detected', 'uav_tracked'
    ].includes(phase);
    if (needsPulse) {
      pulseTimer.current = setInterval(() => setPulseTick(p => !p), 350);
      return () => clearInterval(pulseTimer.current);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset of timer-driven pulse state when the animated phase set is exited; cannot be derived during render
    setPulseTick(false);
  }, [phase]);

  useEffect(() => {
    clearInterval(lanternTimer.current);
    if (lanternDeployed) {
      lanternTimer.current = setInterval(() => setLanternPulse(p => !p), 2000);
      return () => clearInterval(lanternTimer.current);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset of timer-driven pulse state when the animated phase set is exited; cannot be derived during render
    setLanternPulse(false);
  }, [lanternDeployed]);

  const stopAll = useCallback(() => {
    clearInterval(mainTimer.current);
    clearInterval(pulseTimer.current);
    clearInterval(lanternTimer.current);
    clearTimeout(loopTimer.current);
    mainTimer.current = pulseTimer.current = lanternTimer.current = loopTimer.current = null;
  }, []);

  const reset = useCallback(() => {
    stopAll();
    tickRef.current = 0;
    setPaused(false);
    setCurrentTick(0);
    setPulseTick(false);
    setLanternDeployed(false);
    setLanternPulse(false);
    setPlaRadars([false, false, false]);
    setGapVisible(false);
    setEvents([]);
    setRunning(false);
    setComplete(false);
  }, [stopAll]);

  const runScenario = useCallback(() => {
    stopAll();
    tickRef.current = 0;
    setCurrentTick(0);
    setPulseTick(false);
    setLanternDeployed(false);
    setLanternPulse(false);
    setPlaRadars([false, false, false]);
    setGapVisible(false);
    setEvents([]);
    setRunning(true);
    setPaused(false);
    setComplete(false);

    const cb = () => {
      const tick = ++tickRef.current;
      setCurrentTick(tick);

      if (tick === T_PATROL_START) {
        addEvtRef.current('M48-DELTA: Autonomous transit — Taiwan Strait Sector LIMA-4 — median line', 'info');
        addEvtRef.current('7th Fleet CTF-70: M48-DELTA on station — Counter-C5ISR mission active', 'info');
      }
      if (tick === T_LANTERN_DEPLOY) {
        addEvtRef.current('M48-DELTA: LANTERN deployed — ascending to 200ft', 'info');
        addEvtRef.current('M48-DELTA: HiddenLevel passive RF array online — listening for PLA emissions', 'info');
      }
      if (tick === T_ON_STATION) {
        addEvtRef.current('M48-DELTA: M48 radar cross-section 0.01m² — vessel appearing as debris on PLA coastal radar', 'info');
      }
      if (tick === T_LANTERN_FULL) {
        setLanternDeployed(true);
        addEvtRef.current('M48-DELTA: LANTERN at altitude — EO/IR + Radar active — 17nm sensor horizon', 'info');
      }
      if (tick === T_PLA_MAPPING) {
        addEvtRef.current('HiddenLevel: PLA emission sweep initiated — mapping Fujian coast radar architecture', 'info');
        addEvtRef.current('SCION: Building PLA sensor coverage model — stand by', 'info');
      }
      if (tick === T_EMISSION_ALPHA) {
        setPlaRadars([true, false, false]);
        addEvtRef.current('HiddenLevel: EMITTER ALPHA — UHF-band long-range air surveillance radar — bearing 285, geo-located 25.02°N 119.45°E', 'warn');
        addEvtRef.current('SCION: EMITTER ALPHA classified — Type YLC-8B long-range air defense radar — coverage arc 055° to 175°', 'warn');
      }
      if (tick === T_EMISSION_BRAVO) {
        setPlaRadars([true, true, true]);
        addEvtRef.current('HiddenLevel: EMITTER BRAVO — L-band acquisition radar — bearing 272, geo-located 24.20°N 119.35°E', 'warn');
        addEvtRef.current('HiddenLevel: EMITTER CHARLIE — Dongshan Island OTH radar — bearing 260, geo-located 23.62°N 119.52°E', 'warn');
        addEvtRef.current('SCION: 3 PLA emitters mapped — modeling combined coverage geometry', 'info');
      }
      if (tick === T_GAP_ID) {
        setGapVisible(true);
        addEvtRef.current('SCION: COVERAGE GAP IDENTIFIED — intersection seam between EMITTER BRAVO and EMITTER CHARLIE', 'success');
        addEvtRef.current('SCION: Gap coordinates — 24.05°N 120.40°E — width approx 12nm — PLA radar blind spot', 'success');
        addEvtRef.current('SCION: Window: 0340–0520 local — emitter duty cycle creates intermittent gap', 'success');
      }
      if (tick === T_RAZOR_TX) {
        addEvtRef.current('RAZORCHASSIS: Gap geometry formatted — pushing to CTF-70 via encrypted SATCOM', 'alert');
        addEvtRef.current('RAZORCHASSIS: Routing window transmitted — 24.05°N 120.40°E — valid 0340–0520L', 'alert');
        addEvtRef.current('CTF-70: Gap received — tasking USS Connecticut (SSN-22) — standby for routing', 'info');
      }
      if (tick === T_SUB_ROUTING) {
        addEvtRef.current('USS Connecticut: Routing through gap — depth 280m — speed 8kt', 'info');
        addEvtRef.current('SCION: Monitoring EMITTER BRAVO duty cycle — gap holding — Connecticut clear', 'info');
      }
      if (tick === T_SUB_ROUTING + 8) {
        addEvtRef.current('USS Connecticut: Through — on station — PLA radar unaware', 'success');
      }
      if (tick === T_UAV_DETECT) {
        addEvtRef.current('HiddenLevel: RF CONTACT — unscheduled drone emission — bearing 310, closing', 'warn');
        addEvtRef.current('HiddenLevel: Emission consistent with PLA BZK-005 maritime patrol UAV', 'warn');
        addEvtRef.current('LANTERN EO/IR: Slewing to bearing 310 — contact acquisition', 'info');
      }
      if (tick === T_UAV_TRACKED) {
        addEvtRef.current('LANTERN EO/IR: Visual contact — BZK-005 class UAV — estimated 20km — approaching median line', 'warn');
        addEvtRef.current('SCION: UAV on ISR profile — photographing M48-DELTA — M48 RCS too small to positively identify', 'info');
        addEvtRef.current('SCION: M48 appearing as drifting debris — PLA UAV unlikely to report as threat', 'info');
        addEvtRef.current('RAZORCHASSIS: PLA UAV track transmitted to CTF-70 — lat 24.55°N 120.20°E — bearing 135, 85kt', 'alert');
      }
      if (tick === T_PATROL_SECURE) {
        addEvtRef.current('SCION: BZK-005 passing — no PLA ISR lock on M48-DELTA — stealth maintained', 'success');
        addEvtRef.current('USS Connecticut: SITREP — in position — thanks to M48-DELTA gap data', 'success');
        addEvtRef.current('CTF-70: M48-DELTA Counter-C5ISR complete — 3 PLA emitters mapped — 1 gap exploited — 1 UAV tracked — 0 crew exposure', 'success');
        addEvtRef.current('M48-DELTA: Resuming median line patrol — LANTERN continuous watch', 'info');
      }
      if (tick >= TOTAL_TICKS) {
        clearInterval(mainTimer.current);
        mainTimer.current = null;
        setRunning(false);
        setComplete(true);
        // Auto-loop: 5-second pause then restart
        loopTimer.current = setTimeout(() => {
          if (loopTimer.current !== null) runScenarioRef.current?.();
        }, 5000);
      }
    };
    tickCallbackRef.current = cb;
    mainTimer.current = setInterval(cb, TICK_MS);
  }, [stopAll]);

  useLayoutEffect(() => { runScenarioRef.current = runScenario; });
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
      template: 'ISR',
      domain: 'MARITIME',
      status: 'active',
      duration: 'continuous',
      zoneConfig: {
        name: 'Taiwan Strait — Median Line Sector LIMA-4 — Counter-C5ISR Patrol',
        coordinates: [
          { lat: 23.60, lng: 119.90 },
          { lat: 24.80, lng: 119.90 },
          { lat: 24.80, lng: 121.10 },
          { lat: 23.60, lng: 121.10 },
        ],
        swarmSize: 1,
        swarmFormation: 'transit-patrol',
      },
      assignedSquadrons: ['sqdn_016'],
      missionProfile: {
        type: 'ISR',
        lane: 'COUNTER_C5ISR',
      },
      stateHierarchies: {
        default:         ['Navigation', 'Payload', 'Comms', 'Mission', 'Vehicle'],
        emitter_mapping: ['Payload', 'Mission', 'Comms', 'Navigation', 'Vehicle'],
        pla_uav_contact: ['Payload', 'Navigation', 'Mission', 'Comms', 'Vehicle'],
        comms_degraded:  ['Navigation', 'Mission', 'Vehicle', 'Comms', 'Payload'],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      launchedAt: new Date().toISOString(),
      history: [{ action: 'created', timestamp: new Date().toISOString() }],
    };
    if (mission?.id) updateMission(mission.id, data);
    else saveMission(data);
    onBack();
  };

  // ── Derived visual state ──────────────────────────────────────────────────
  const narrative = PHASE_NARRATIVE[phase] || null;
  const badge = getPhaseBadge(phase);
  const showFCLink = ['razorchassis_transmit', 'sub_routing', 'pla_uav_detected', 'uav_tracked', 'patrol_secure'].includes(phase);

  // LANTERN ring growth
  const lanternRiseProgress = currentTick < T_LANTERN_DEPLOY ? 0
    : Math.min((currentTick - T_LANTERN_DEPLOY) / (T_LANTERN_FULL - T_LANTERN_DEPLOY), 1);
  const lanternBaseR  = lanternRiseProgress * LANTERN_RADAR_NM * NM_TO_M;
  const lanternRingR  = lanternDeployed
    ? (lanternPulse ? lanternBaseR + 200 : lanternBaseR - 200)
    : lanternBaseR;
  const lanternRising = currentTick >= T_LANTERN_DEPLOY && !lanternDeployed;

  // RazorChassis uplink dot: travels M48 → CTF77
  const fcDotT   = phase === 'razorchassis_transmit'
    ? Math.min((currentTick - T_RAZOR_TX) / (T_SUB_ROUTING - T_RAZOR_TX), 1)
    : null;
  const fcDotPos = fcDotT !== null ? lerp2(m48Pos, CTF77_POS, fcDotT) : null;

  return (
    <div className="flex flex-col h-full bg-darkest overflow-hidden relative">

      {/* ── Coming Soon Overlay ── */}
      <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center"
        style={{ background: 'rgba(3,7,18,0.72)', backdropFilter: 'blur(2px)' }}
      >
        <button
          onClick={onBack}
          className="absolute top-3 left-3 flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-[0.75rem]"
        >
          <ChevronLeft size={13} /> Back to Library
        </button>
        <div className="flex flex-col items-center gap-3 px-8 py-6 rounded-2xl border border-violet-500/40 bg-gray-950/80">
          <span className="text-[0.65rem] font-bold uppercase tracking-widest text-violet-400">Mission Preview</span>
          <span className="text-white text-xl font-bold tracking-tight">Counter-C5ISR</span>
          <span className="text-gray-400 text-[0.78rem]">Active suppression & deception coming soon</span>
        </div>
      </div>

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-700/50 flex-shrink-0 overflow-x-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-[0.75rem]"
        >
          <ChevronLeft size={13} /> Back to Library
        </button>
        <div className="w-px h-4 bg-gray-700/60" />
        <Anchor size={13} className="text-red-400" />
        <span className="text-red-400 text-[0.8rem] font-semibold tracking-wide">Taiwan Strait Counter-C5ISR — Sector LIMA-4</span>
        <span className="hidden md:inline text-gray-600 text-[0.7rem]">·</span>
        <span className="hidden md:inline text-gray-500 text-[0.68rem]">PLA Sensor Mapping + Gap Exploitation — M48 Median Line Patrol — 7th Fleet</span>
        <div className="flex-1" />
        <span className="px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-400 text-[0.65rem] font-bold uppercase tracking-wider border border-emerald-500/30">
          ACTIVE
        </span>
        <input
          value={missionName}
          onChange={e => setMissionName(e.target.value)}
          placeholder="Mission name…"
          className="hidden md:block bg-gray-800/60 border border-gray-700/60 rounded-md px-3 py-1.5 text-white text-[0.78rem] w-52 placeholder-gray-600 focus:outline-none focus:border-red-500/50 transition-colors"
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

              {/* Median line — always visible, gray dashed */}
              <Polyline
                positions={MEDIAN_LINE}
                pathOptions={{ color: 'var(--caliburn-text-secondary)', weight: 1, opacity: 0.40, dashArray: '8 6' }}
              />

              {/* Median line label (tooltip on mid-point) */}
              <CircleMarker
                center={[24.25, 120.55]}
                radius={0}
                pathOptions={{ opacity: 0, fillOpacity: 0 }}
              >
                <Tooltip permanent direction="right" offset={[4, 0]}>
                  <span style={{ fontSize: 9, color: 'var(--caliburn-text-secondary)' }}>MEDIAN LINE</span>
                </Tooltip>
              </CircleMarker>

              {/* PLA radar coverage circles — appear in sequence */}
              {plaRadars[0] && (
                <Circle
                  center={PLA_RADAR_1}
                  radius={PLA_RADAR_RANGE_NM * NM_TO_M}
                  pathOptions={{ color: '#ef4444', weight: 1, dashArray: '6 4', fillColor: '#ef4444', fillOpacity: 0.07 }}
                >
                  <Tooltip direction="right" offset={[8, 0]}>
                    <span style={{ fontSize: 10, color: '#fca5a5' }}>EMITTER ALPHA — YLC-8B</span>
                  </Tooltip>
                </Circle>
              )}
              {plaRadars[1] && (
                <Circle
                  center={PLA_RADAR_2}
                  radius={PLA_RADAR_RANGE_NM * NM_TO_M}
                  pathOptions={{ color: '#ef4444', weight: 1, dashArray: '6 4', fillColor: '#ef4444', fillOpacity: 0.07 }}
                >
                  <Tooltip direction="right" offset={[8, 0]}>
                    <span style={{ fontSize: 10, color: '#fca5a5' }}>EMITTER BRAVO</span>
                  </Tooltip>
                </Circle>
              )}
              {plaRadars[2] && (
                <Circle
                  center={PLA_RADAR_3}
                  radius={PLA_RADAR_RANGE_NM * NM_TO_M}
                  pathOptions={{ color: '#ef4444', weight: 1, dashArray: '6 4', fillColor: '#ef4444', fillOpacity: 0.07 }}
                >
                  <Tooltip direction="right" offset={[8, 0]}>
                    <span style={{ fontSize: 10, color: '#fca5a5' }}>EMITTER CHARLIE — Dongshan</span>
                  </Tooltip>
                </Circle>
              )}

              {/* PLA radar site markers */}
              {plaRadars[0] && (
                <CircleMarker center={PLA_RADAR_1} radius={5}
                  pathOptions={{ color: '#ef4444', fillColor: '#7f1d1d', fillOpacity: 0.9, weight: 1.5 }}
                />
              )}
              {plaRadars[1] && (
                <CircleMarker center={PLA_RADAR_2} radius={5}
                  pathOptions={{ color: '#ef4444', fillColor: '#7f1d1d', fillOpacity: 0.9, weight: 1.5 }}
                />
              )}
              {plaRadars[2] && (
                <CircleMarker center={PLA_RADAR_3} radius={5}
                  pathOptions={{ color: '#ef4444', fillColor: '#7f1d1d', fillOpacity: 0.9, weight: 1.5 }}
                />
              )}

              {/* Coverage gap highlight — bright green pulsing circle */}
              {gapVisible && (
                <Circle
                  center={COVERAGE_GAP}
                  radius={pulseTick ? 12 * NM_TO_M + 500 : 12 * NM_TO_M}
                  pathOptions={{ color: '#22c55e', weight: 2, fillColor: '#22c55e', fillOpacity: 0.15 }}
                >
                  <Tooltip permanent direction="top" offset={[0, -14]}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#22c55e' }}>PLA GAP — 12nm</span>
                  </Tooltip>
                </Circle>
              )}

              {/* HiddenLevel passive coverage ring */}
              {lanternDeployed && (
                <Circle
                  center={m48Pos}
                  radius={HIDDENLEVEL_NM * NM_TO_M}
                  pathOptions={{ color: '#8b5cf6', fillColor: '#8b5cf6', fillOpacity: 0.04, weight: 1, opacity: 0.22, dashArray: '4 10' }}
                />
              )}

              {/* LANTERN radar horizon ring — grows as drone ascends */}
              {currentTick >= T_LANTERN_DEPLOY && (
                <Circle
                  center={m48Pos}
                  radius={lanternRingR}
                  pathOptions={{
                    color:       '#22d3ee',
                    fillColor:   '#22d3ee',
                    fillOpacity: lanternRising ? 0.07 : 0.03,
                    weight:      lanternRising ? 2.5 : 1.5,
                    opacity:     lanternRising ? 0.80 : 0.55,
                    dashArray:   lanternRising ? null : '7 5',
                  }}
                />
              )}

              {/* M48 patrol track reference line */}
              {currentTick >= T_PATROL_START && (
                <Polyline
                  positions={M48_TRACK}
                  pathOptions={{ color: '#3b82f6', opacity: 0.16, weight: 1.2, dashArray: '4 9' }}
                />
              )}

              {/* RazorChassis uplink line M48 → CTF77 */}
              {showFCLink && (
                <Polyline
                  positions={[m48Pos, CTF77_POS]}
                  pathOptions={{ color: '#d946ef', opacity: 0.55, weight: 1.5, dashArray: '4 7' }}
                />
              )}

              {/* RazorChassis uplink dot: travels M48 → CTF77 */}
              {fcDotPos && (
                <CircleMarker
                  center={fcDotPos}
                  radius={4}
                  pathOptions={{ color: '#d946ef', fillColor: '#f0abfc', fillOpacity: 1, weight: 1 }}
                />
              )}

              {/* CTF77 command node */}
              {showFCLink && (
                <CircleMarker center={CTF77_POS} radius={7}
                  pathOptions={{ color: '#6366f1', fillColor: '#4f46e5', fillOpacity: 0.9, weight: 2 }}
                >
                  <Tooltip direction="right" offset={[10, 0]}>
                    <span style={{ fontSize: 11, fontWeight: 700 }}>CTF-70 / Yokosuka</span>
                  </Tooltip>
                </CircleMarker>
              )}

              {/* USS Connecticut submarine — threads through the gap */}
              {subPos && (
                <>
                  <Polyline
                    positions={SUBMARINE_THROUGH_GAP.slice(0, 2)}
                    pathOptions={{ color: '#1e40af', opacity: 0.30, weight: 1.5, dashArray: '4 7' }}
                  />
                  <CircleMarker
                    center={subPos}
                    radius={7}
                    pathOptions={{ color: '#1e40af', fillColor: '#1e3a8a', fillOpacity: 0.95, weight: 2 }}
                  >
                    <Tooltip direction="bottom" offset={[0, 10]}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#93c5fd' }}>USS Connecticut SSN-22</span>
                    </Tooltip>
                  </CircleMarker>
                </>
              )}

              {/* PLA BZK-005 UAV */}
              {uavPos && (
                <>
                  <Polyline
                    positions={[PLA_UAV_ORIGIN, uavPos]}
                    pathOptions={{ color: '#f97316', opacity: pulseTick ? 0.55 : 0.22, weight: 1.5, dashArray: '4 6' }}
                  />
                  <CircleMarker
                    center={uavPos}
                    radius={pulseTick && phase === 'pla_uav_detected' ? 9 : 7}
                    pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.9, weight: 2 }}
                  >
                    <Tooltip permanent direction="top" offset={[0, -12]}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#fb923c' }}>
                        {phase === 'uav_tracked' ? '⚠ BZK-005 — NO ID LOCK' : '⚠ PLA BZK-005 UAV'}
                      </span>
                    </Tooltip>
                  </CircleMarker>
                </>
              )}

              {/* M48 vessel marker */}
              {currentTick >= T_PATROL_START && (
                <CircleMarker
                  center={m48Pos}
                  radius={8}
                  pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.9, weight: 2 }}
                >
                  <Tooltip direction="top" offset={[0, -14]}>
                    <span style={{ fontSize: 10, color: lanternDeployed ? '#22d3ee' : lanternRising ? '#67e8f9' : '#93c5fd' }}>
                      {lanternDeployed ? 'M48-DELTA · LANTERN ↑ 200ft' : lanternRising ? 'M48-DELTA · LANTERN ↑ ascending…' : 'M48-DELTA'}
                    </span>
                  </Tooltip>
                </CircleMarker>
              )}

            </MapContainer>

            {badge && (
              <div className={`absolute top-3 right-3 z-[500] px-3 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wider pointer-events-none border ${badge.cls}`}>
                {badge.label}
              </div>
            )}

            {/* ── Legend ── */}
            {currentTick >= T_PATROL_START && (
              <div className="hidden md:block absolute top-3 left-3 z-[500] pointer-events-none px-3 py-2 rounded-xl bg-gray-950/80 border border-gray-700/50 backdrop-blur-sm">
                <div className="flex flex-col gap-1">
                  {[
                    { color: '#3b82f6', label: 'M48-DELTA — Counter-C5ISR Patrol' },
                    { color: '#22d3ee', label: 'LANTERN UAS — 200ft EO/IR + Radar' },
                    { color: '#6366f1', label: 'CTF-70 / Yokosuka — Command Node' },
                    { color: '#1e40af', label: 'USS Connecticut SSN-22 — Gap Transit' },
                    { color: '#ef4444', label: 'PLA Coastal Radar Emitters' },
                    { color: '#f97316', label: 'PLA BZK-005 UAV' },
                    { color: '#22c55e', label: 'PLA Radar Coverage Gap' },
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

            <div className="p-4 border-b border-gray-700/50 flex-shrink-0">
              <p className="text-gray-500 text-[0.65rem] uppercase tracking-widest mb-3">Scenario</p>
              <div className="flex gap-2 mb-3">
                {running ? (
                  <button
                    onClick={pause}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[0.78rem] font-semibold transition-colors bg-red-800 hover:bg-red-700 text-white"
                  >
                    <Pause size={13} />
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={paused ? resume : runScenario}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[0.78rem] font-semibold transition-colors bg-red-800 hover:bg-red-700 text-white"
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
                  <div className="text-[0.68rem] font-bold text-red-300 uppercase tracking-wider mb-1">
                    {narrative.title}
                  </div>
                  <div className="text-[0.67rem] text-gray-400 leading-relaxed">
                    {narrative.body}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-[0.68rem]">Magnet Defense M48 · DPI LANTERN · CTF-70 Taiwan Strait</p>
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
              <div className="w-32 flex-shrink-0 bg-gray-950/60 flex items-center justify-center p-2">
                <img src={vessel.image} alt={vessel.name} className="w-full h-full object-contain max-h-24" />
              </div>
              <div className="flex-1 flex flex-col justify-center p-2 gap-1.5">
                <div className="flex items-center mb-0.5">
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

export default TaiwanISRMissionView;
