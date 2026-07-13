import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import {
  MapContainer, TileLayer, Circle, CircleMarker, Polyline, Polygon, Tooltip, ZoomControl, useMap
} from 'react-leaflet';
import { Zap, ChevronLeft, Play, Pause, RotateCcw, Check, Anchor, Settings, ArrowLeftRight } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import useMissionStore from '../../store/missionStore';
import useOutfitterStore from '../../store/outfitterStore';
import useConfigurationStore from '../../store/configurationStore';
import useNavigationStore from '../../store/navigationStore';
import { vesselHullData } from '../../data/vesselData';
import { MISSION_ROLES } from '../../data/missionRoles';
import imgM48 from '../../assets/images/M48.png';
// imgSaildrone unused
import SwapVesselModal from './SwapVesselModal';
import ReadinessChecklist from './ReadinessChecklist';
import { getMissionReadiness } from '../../utils/missionReadiness';
import { HULL_IMAGES } from '../../utils/hullImages';

const MISSION_SET_KEY = 'NON_KINETIC_EW';
const MISSION_SET_CAPS = ['False Fleet Projection Package', 'LEED Dispenser (Long Endurance Electronic Decoy)', 'SOEA Container (Scaled Onboard Electronic Attack)', 'EMATT Mod 4 Acoustic Decoy Module', 'Passive ESM/SIGINT Collection Module'];

// ─── Geography ────────────────────────────────────────────────────────────────
// Theater: Luzon Strait / northwest SCS — open ocean south of Taiwan, no land conflicts.
// CVN transits the eastern corridor (Luzon Strait, ~121°E). False fleet occupies the
// western SCS (~118°E). Separation: ~130nm. PLAN destroyer drawn WSW away from CVN track.
const NM_TO_M = 1852;
const MAP_CENTER = [20.5, 119.5];
const MAP_ZOOM   = 7;

// PLAN Type-055 radar picket ship — holding position in western SCS, realistic for PLAN SCS ops
const PINGTAN = [21.5, 116.5];

// PLAN Luyang-III destroyer: starts NE in Philippine Sea, commits WSW toward false fleet
const DESTROYER_START = [24.0, 124.0];
const DESTROYER_END   = [19.8, 117.8];

// CVN-78 Gerald R. Ford — eastern corridor through Luzon Strait (~121°E)
// All open ocean. ~130nm from false fleet at crossing latitude. No land.
const CVN_START = [18.0, 123.5];
const CVN_END   = [25.5, 122.0];
const CVN_MID   = [21.75, 122.75];

// NEMESIS false fleet — western SCS, 130nm WSW of CVN corridor
const M48_ALPHA = [19.5, 117.8];   // false fleet lead
const M48_BRAVO = [20.2, 117.6];   // false fleet trail
const BS_M48    = [20.8, 118.2];   // M48 CHARLIE — active jammer
const ORCA_POS  = [20.0, 119.0];   // Freedom AUV — acoustic decoys, submerged
const SAILDRONE = [18.5, 120.0];   // Saildrone Voyager — passive ESM, southern entry

// False EMATT acoustic contacts — near Freedom AUV position
const EMATT_CONTACTS = [
  [20.5, 119.2],
  [19.8, 118.8],
  [20.2, 119.5],
];

// LEED vehicle tracks (logic only, not rendered visually)
const LEED_TRACKS = [
  [M48_ALPHA, [19.8, 118.1], [20.1, 118.4]],
  [M48_ALPHA, [19.5, 118.2], [19.6, 118.5]],
  [M48_ALPHA, [19.3, 117.9], [19.1, 118.2]],
];

// Bearing from PLAN radar picket toward false fleet (~135° SE)
const RADAR_TRACK_ANGLE = 135;
// Radar range
const RADAR_RANGE_M = 85 * NM_TO_M;

// ─── Tick milestones ──────────────────────────────────────────────────────────
const T_DEPLOYED         =  8;
const T_PLAN_SEARCH      = 18;
const T_ORCA_DEPLOYS     = 22;
const T_FALSE_FLEET_UP   = 30;
const T_PLAN_DETECTS     = 36;
const T_DESTROYER_TURNS  = 42;
const T_LEED_LAUNCH      = 84;
const T_CVN_MIDPOINT     = 96;
const T_CVN_CLEARS       = 116;
const T_TERMINATE        = 130;
const TOTAL_TICKS        = 144;
const TICK_MS            = 280;

// ─── Loadout configs ──────────────────────────────────────────────────────────
const M48_MOUNTS = [
  { slot: 'DECEPTION',   name: 'False Fleet Projection Package', vendor: 'Elbit / SRC',      description: 'Corner reflector array (frigate RCS) + AIS false-track broadcaster + waveform transponder' },
  { slot: 'DEPLOYER',    name: 'LEED Dispenser — 4× magazine',   vendor: 'BAE / Raytheon',   description: 'Autonomous RF decoy vehicles extend deception into terminal guidance phase' },
  { slot: 'COMMS',       name: 'TempestOS Core Platform',       vendor: 'Caliburn',         description: 'EMCON-compliant encrypted C2 — zero detectable RF in EMCON mode' },
];
const BS_M48_MOUNTS = [
  { slot: 'EA PAYLOAD',  name: 'SOEA Container (100 kW)',         vendor: 'General Atomics',  description: 'C/X/Ku-band active jamming — anti-ship missile seeker defeat — full 100kW on 198kW hull' },
  { slot: 'COMMS',       name: 'TempestOS Core Platform',       vendor: 'Caliburn',         description: 'NEMESIS coordinator receive — activates SOEA on commander authorization only' },
];
const ORCA_MOUNTS = [
  { slot: 'ACOUSTIC',    name: 'EMATT Mod 4 — 8× tube-launch',   vendor: 'Saab (formerly LM Sippican)', description: 'Programmable Type-093-class acoustic signatures — PLAN ASW deception at ~183m depth (600ft)' },
  { slot: 'NAVIGATION',  name: 'Autonomous Subsurface Nav',        vendor: 'Boeing',           description: 'Operates at 183–200m depth — zero surface RF — full EMCON throughout' },
];
const SAILDRONE_MOUNTS = [
  { slot: 'ESM',         name: 'Passive ESM/SIGINT Collection Module',       vendor: 'Northrop / Elbit', description: '~5 kW draw — passive intercept only — 80NM coverage — zero RF emissions' },
  { slot: 'COMMS',       name: 'TempestOS Core Platform', vendor: 'Caliburn',         description: 'NEMESIS coordinator data feed — waveform library updates — reaction assessment' },
];

// ─── Vessel roster ────────────────────────────────────────────────────────────
const VESSEL_ROSTER = [
  { name: 'M48 ALPHA', roleDescriptor: '(EW Strike)', image: imgM48, hullName: 'M48', capabilities: ['False Fleet Projection Package', 'LEED Dispenser (Long Endurance Electronic Decoy)', 'SOEA Container (Scaled Onboard Electronic Attack)'], roleKey: 'NK_M48_ALPHA' },
  { name: 'M48 BRAVO', roleDescriptor: '(EW SIGINT)', image: imgM48, hullName: 'M48', capabilities: ['False Fleet Projection Package', 'LEED Dispenser (Long Endurance Electronic Decoy)', 'Passive ESM/SIGINT Collection Module'], roleKey: 'NK_M48_BRAVO' },
  { name: 'M48 CHARLIE', roleDescriptor: '(EW Decoy)', image: imgM48, hullName: 'M48', capabilities: ['SOEA Container (Scaled Onboard Electronic Attack)', 'False Fleet Projection Package', 'LEED Dispenser (Long Endurance Electronic Decoy)'], roleKey: 'NK_BLACKSEA_M48' },
];

// ─── Phase narratives ─────────────────────────────────────────────────────────
const PHASE_NARRATIVE = {
  idle:            null,
  deployed:        { title: 'CVN-78 Enters Luzon Strait', body: 'Gerald R. Ford transiting NNW through the Luzon Strait on the eastern corridor (~121°E) — open ocean, no land. NEMESIS false fleet holding 130nm WSW in the western SCS (~118°E). EMCON maintained across all nodes.' },
  plan_search:     { title: 'PLAN Radar Picket — Search Mode', body: 'PLAN Type-055 radar picket sweeping full sector from western SCS position. CVN running dark through Luzon Strait. NEMESIS activation sequence begins — picket radar faces WSW toward false fleet, away from CVN corridor.' },
  orca_deploys:    { title: 'EMATT Acoustic Decoys Active', body: 'Freedom AUV deploys 8× EMATT Mod 4 at ~183m depth in open SCS water. PLAN passive sonar arrays now detect 3 false submarine contacts west of the CVN corridor. ASW attention fragmenting toward the western SCS.' },
  false_fleet_up:  { title: 'FALSE FLEET ACTIVE — Western SCS', body: 'M48 ALPHA/BRAVO broadcasting DDG-174 HEFEI and DDG-139 NINGBO on AIS at ~118°E. Corner reflectors project frigate RCS. M48 CHARLIE 100kW jammer active. PLAN radar picket locks the western formation — CVN is 130nm east, outside their attention sector.' },
  plan_detects:    { title: '⚠ PLAN RADAR LOCKS FALSE FLEET', body: 'Type-055 radar transitions to track mode — narrowbeam aimed WSW at false DDG formation. PLAN scope shows a 2-ship formation at 118°E. CVN at 121°E is 130nm east and completely outside their sensor focus.' },
  destroyer_turns: { title: 'PLAN Destroyer Commits WSW', body: 'PLAN Luyang-III commits — heading 245° at 28 knots toward the false DDG formation in the western SCS. Moving directly away from CVN\'s Luzon Strait corridor. Separation now growing — 130nm and increasing.' },
  leed_launch:     { title: 'LEED Vehicles Deployed', body: '3× LEED autonomous decoy vehicles extend the false fleet signature further west. Destroyer fully committed. CVN approaching midpoint through Luzon Strait — clean corridor.' },
  cvn_midpoint:    { title: '✓ CVN-78 Midpoint — Clean', body: 'Gerald R. Ford at 20.5°N through Luzon Strait — 130nm east of false fleet, open ocean throughout. Destroyer committed WSW for 38 ticks, now 180+ NM from CVN track. PLAN radar looking the wrong direction. Clean pass.' },
  cvn_clears:      { title: '✓ CVN-78 TRANSIT COMPLETE', body: 'USS Gerald R. Ford clears the Luzon Strait undetected. PLAN assets converging on empty ocean in the western SCS. CTF-70: terminate order inbound.' },
  terminate:       { title: 'NEMESIS Terminated', body: 'All emissions cease. AIS spoofers off. SOEA off. Freedom AUV recovering. PLAN Luyang-III will reach empty ocean in 40 minutes. NEMESIS package transitions to recovery — EMCON ALPHA.' },
};

// ─── Phase badge styles ───────────────────────────────────────────────────────
const PHASE_BADGE = {
  deployed:        { cls: 'bg-gray-900/90 text-gray-300 border-gray-600/50',                      label: '● NEMESIS On Station — EMCON' },
  plan_search:     { cls: 'bg-blue-900/80 text-blue-300 border-blue-500/40',                       label: '◎ PLAN Radar — Search Mode' },
  orca_deploys:    { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40 animate-pulse',         label: '⚡ EMATT Acoustic Decoys Active' },
  false_fleet_up:  { cls: 'bg-amber-900/80 text-amber-200 border-amber-500/40 animate-pulse',     label: '⚡ FALSE FLEET ACTIVE' },
  plan_detects:    { cls: 'bg-red-900/80 text-red-300 border-red-500/40 animate-pulse',            label: '⚠ PLAN RADAR LOCKED — False Fleet' },
  destroyer_turns: { cls: 'bg-red-900/80 text-red-200 border-red-400/60 animate-pulse',            label: '⚠ PLAN Destroyer — Vectoring to Decoy' },
  leed_launch:     { cls: 'bg-amber-900/80 text-amber-300 border-amber-500/40',                   label: '⚡ LEED Vehicles Deployed' },
  cvn_midpoint:    { cls: 'bg-emerald-900/80 text-emerald-200 border-emerald-500/40',             label: '✓ CVN-78 Midpoint — Track Clear' },
  cvn_clears:      { cls: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40',             label: '✓ CVN-78 TRANSIT COMPLETE' },
  terminate:       { cls: 'bg-gray-900/90 text-gray-400 border-gray-600/40',                      label: '● NEMESIS Terminated — Recovery' },
};

const EVENT_COLORS = {
  warn:    'text-amber-400',
  alert:   'text-red-400',
  info:    'text-purple-400',
  success: 'text-emerald-400',
};

const TILE_BASE    = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_SEAMARK = 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

const getPhase = (tick) => {
  if (tick < T_DEPLOYED)        return 'idle';
  if (tick < T_PLAN_SEARCH)     return 'deployed';
  if (tick < T_ORCA_DEPLOYS)    return 'plan_search';
  if (tick < T_FALSE_FLEET_UP)  return 'orca_deploys';
  if (tick < T_PLAN_DETECTS)    return 'false_fleet_up';
  if (tick < T_DESTROYER_TURNS) return 'plan_detects';
  if (tick < T_LEED_LAUNCH)     return 'destroyer_turns';
  if (tick < T_CVN_MIDPOINT)    return 'leed_launch';
  if (tick < T_CVN_CLEARS)      return 'cvn_midpoint';
  if (tick < T_TERMINATE)       return 'cvn_clears';
  return 'terminate';
};

// CVN moves south→north across entire scenario
const getCVNPos = (tick) => {
  if (tick < T_DEPLOYED) return CVN_START;
  if (tick >= T_CVN_CLEARS) return CVN_END;
  const t = (tick - T_DEPLOYED) / (T_CVN_CLEARS - T_DEPLOYED);
  return lerp2(CVN_START, CVN_END, Math.min(t, 1));
};

// PLAN destroyer turns SW and commits to false fleet
const getDestroyerPos = (tick) => {
  if (tick < T_DESTROYER_TURNS) return DESTROYER_START;
  const t = Math.min((tick - T_DESTROYER_TURNS) / (T_CVN_CLEARS - T_DESTROYER_TURNS) * 1.8, 1);
  return lerp2(DESTROYER_START, DESTROYER_END, t);
};

// Convert bearing + range from PINGTAN to a lat/lng point
const beamEdge = (bearingDeg, rangeM) => {
  const rad = (bearingDeg * Math.PI) / 180;
  const cosLat = Math.cos(PINGTAN[0] * Math.PI / 180);
  return [
    PINGTAN[0] + Math.cos(rad) * rangeM / 111111,
    PINGTAN[1] + Math.sin(rad) * rangeM / (111111 * cosLat),
  ];
};

// Radar sector polygon: center + arc
const sectorPoly = (angleDeg, halfWidthDeg, rangeM) => {
  const pts = [PINGTAN];
  const steps = 14;
  for (let i = 0; i <= steps; i++) {
    const a = angleDeg - halfWidthDeg + (2 * halfWidthDeg * i) / steps;
    pts.push(beamEdge(a, rangeM));
  }
  pts.push(PINGTAN);
  return pts;
};

// PLAN radar sweep angle
const getRadarAngle = (tick) => {
  if (tick < T_PLAN_SEARCH) return null;
  if (tick >= T_PLAN_DETECTS) return RADAR_TRACK_ANGLE;
  return ((tick - T_PLAN_SEARCH) * 7) % 360;
};

// Outgoing radar ping waves (search mode only)
const getRadarPings = (tick) => {
  if (tick < T_PLAN_SEARCH || tick >= T_PLAN_DETECTS) return [];
  const waves = [];
  for (const offset of [0, 8, 16]) {
    const elapsed = (tick - T_PLAN_SEARCH - offset) % 22;
    if (elapsed >= 0 && elapsed <= 11) {
      const p = elapsed / 11;
      waves.push({ radius: p * RADAR_RANGE_M, opacity: 0.35 * (1 - p) });
    }
  }
  return waves;
};

// LEED vehicle progress
const getLeedProgress = (tick) => {
  if (tick < T_LEED_LAUNCH || tick >= T_TERMINATE) return 0;
  return Math.min((tick - T_LEED_LAUNCH) / (T_CVN_CLEARS - T_LEED_LAUNCH), 1);
};

const _getLeedTip = (track, progress) => {
  if (progress <= 0) return null;
  const t = progress * (track.length - 1);
  const idx = Math.min(Math.floor(t), track.length - 2);
  const frac = t - idx;
  return lerp2(track[idx], track[idx + 1], frac);
};

// CVN success burst (blooms when it clears)
const getCVNBurst = (tick) => {
  const elapsed = tick - T_CVN_CLEARS;
  if (elapsed < 0 || elapsed > 14) return null;
  const p = elapsed / 14;
  return { radius: p * 30 * NM_TO_M, opacity: 0.70 * (1 - p) };
};

// ─── Map size fix ─────────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────
const NonKineticMissionView = ({ mission, onBack }) => {
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
  const [currentTick, setCurrentTick] = useState(0);
  const [events,      setEvents]      = useState([]);
  const [running,     setRunning]     = useState(false);
  const [paused,        setPaused]        = useState(false);
  const [complete,    setComplete]    = useState(false);
  const [pulse,       setPulse]       = useState(false);

  const tickRef    = useRef(0);
  const tickCallbackRef = useRef(null);
  const mainTimer  = useRef(null);
  const pulseTimer = useRef(null);
  const resetTimer = useRef(null);
  const addEvtRef  = useRef(null);
  const vesselLabelsRef = useRef([]);
  const runScenRef = useRef(null);

  const phase     = getPhase(currentTick);
  const narrative = PHASE_NARRATIVE[phase] || null;
  const badge     = PHASE_BADGE[phase] || null;

  // Derived state
  const cvnPos         = getCVNPos(currentTick);
  const destroyerPos   = getDestroyerPos(currentTick);
  const radarAngle     = getRadarAngle(currentTick);
  const radarPings     = getRadarPings(currentTick);
  const _leedProgress  = getLeedProgress(currentTick);
  const cvnBurst       = getCVNBurst(currentTick);

  const radarLocked     = currentTick >= T_PLAN_DETECTS;
  const orcaActive      = currentTick >= T_ORCA_DEPLOYS && currentTick < T_TERMINATE;
  const falseFleetUp    = currentTick >= T_FALSE_FLEET_UP && currentTick < T_TERMINATE;
  const jammerActive    = currentTick >= T_FALSE_FLEET_UP && currentTick < T_TERMINATE;
  const destroyerMoving = currentTick >= T_DESTROYER_TURNS;
  const cvnCleared      = currentTick >= T_CVN_CLEARS;
  const terminated      = currentTick >= T_TERMINATE;

  // Pulsing for locked/active phases
  useEffect(() => {
    clearInterval(pulseTimer.current);
    if (['plan_detects', 'destroyer_turns', 'leed_launch', 'cvn_midpoint'].includes(phase)) {
      pulseTimer.current = setInterval(() => setPulse(p => !p), 400);
      return () => clearInterval(pulseTimer.current);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset of timer-driven pulse state when the animated phase set is exited; cannot be derived during render
    setPulse(false);
  }, [phase]);

  const _addEvent = (msg, type = 'info') => {
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setEvents(prev => [{ ts, msg, type, id: `${ts}-${msg.slice(0, 12)}` }, ...prev].slice(0, 30));
  };
  const pause = useCallback(() => {
    clearInterval(mainTimer.current);
    mainTimer.current = null;
    clearTimeout(resetTimer.current);
    resetTimer.current = null;
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
  useLayoutEffect(() => { vesselLabelsRef.current = effectiveRoster.map(v => v.name); });

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
    clearTimeout(resetTimer.current);
    mainTimer.current = pulseTimer.current = resetTimer.current = null;
  }, []);

  const reset = useCallback(() => {
    stopAll();
    tickRef.current = 0;
    setPaused(false);
    setCurrentTick(0);
    setPulse(false);
    setEvents([]);
    setRunning(false);
    setComplete(false);
  }, [stopAll]);

  const runScenario = useCallback(() => {
    stopAll();
    tickRef.current = 0;
    setCurrentTick(0);
    setPulse(false);
    setEvents([]);
    setRunning(true);
    setPaused(false);
    setComplete(false);

    const cb = () => {
      const tick = ++tickRef.current;
      const v0 = vesselLabelsRef.current[0] ?? 'M48 (EW Strike)';
      const v1 = vesselLabelsRef.current[1] ?? 'M48 (EW SIGINT)';
      const v2 = vesselLabelsRef.current[2] ?? 'M48 (EW Decoy)';
      setCurrentTick(tick);

      if (tick === T_DEPLOYED) {
        addEvtRef.current('CVN-78: Gerald R. Ford entering Luzon Strait — EMCON, no AIS, no radar', 'warn');
        addEvtRef.current('TempestOS: All NEMESIS nodes on station — EMCON ALPHA confirmed', 'info');
        addEvtRef.current('Freedom AUV: Submerged to 150m — acoustic comms only', 'info');
      }
      if (tick === T_PLAN_SEARCH) {
        addEvtRef.current('ESM: PLAN Type-055 radar picket — SEARCH mode — 70 rpm — western SCS sweep', 'info');
        addEvtRef.current('CTF-70: NEMESIS mission AUTHORIZED — execute activation sequence', 'warn');
        addEvtRef.current('NEMESIS coordinator: Step 1 of 5 — Freedom AUV acoustic first', 'info');
      }
      if (tick === T_ORCA_DEPLOYS) {
        addEvtRef.current('Freedom AUV: 8× EMATT Mod 4 deployed — depth ~183m (600ft)', 'warn');
        addEvtRef.current('EMATT: Type-093 acoustic library active — 3 false contacts generated', 'warn');
        addEvtRef.current('PLAN ASW: Multiple subsurface contacts in western SCS — assets responding', 'alert');
        addEvtRef.current('Saildrone Voyager: Passive ESM active — 80NM coverage — baseline set', 'info');
      }
      if (tick === T_FALSE_FLEET_UP) {
        addEvtRef.current(`${v0}: Corner reflectors DEPLOYED — RCS → DDG-class`, 'warn');
        addEvtRef.current(`${v0}: AIS transmitting DDG-174 HEFEI — 090° at 18 kts`, 'warn');
        addEvtRef.current(`${v1}: AIS transmitting DDG-139 NINGBO — 085° at 17 kts`, 'warn');
        addEvtRef.current(`${v2}: SOEA ACTIVE — 100kW — C/X/Ku-band jamming`, 'alert');
        addEvtRef.current('NEMESIS: Full false fleet picture coherent — radar + AIS + acoustic', 'info');
      }
      if (tick === T_PLAN_DETECTS) {
        addEvtRef.current('ESM ALERT: PLAN Type-055 — TRACK MODE — 12rpm narrowbeam', 'alert');
        addEvtRef.current('ESM: PLAN radar aimed at DDG-174/139 false formation — bait taken', 'alert');
        addEvtRef.current('CTF-70: PLAN attention fixed on western SCS — CVN-78 Luzon Strait sector clear', 'success');
      }
      if (tick === T_DESTROYER_TURNS) {
        addEvtRef.current('ESM: PLAN Luyang-III — new course 245° — 28 knots — WSW intercept', 'alert');
        addEvtRef.current('ESM: PLAN destroyer committed — vectoring toward false DDG formation at 118°E', 'alert');
        addEvtRef.current('CTF-70: PLAN surface assets moving away from CVN-78 Luzon Strait corridor', 'success');
      }
      if (tick === T_LEED_LAUNCH) {
        addEvtRef.current(`${v0}: 3× LEED vehicles AWAY — terminal deception extended`, 'warn');
        addEvtRef.current('LEED: Autonomous RF decoys extending false picture 40NM toward PLAN picket', 'info');
      }
      if (tick === T_CVN_MIDPOINT) {
        addEvtRef.current('CVN-78: MIDPOINT — 130nm east of false fleet — PLAN attention on decoy', 'success');
        addEvtRef.current('ESM: Zero PLAN emissions in CVN-78 Luzon Strait sector — deception holding', 'success');
        addEvtRef.current('PLAN destroyer: 180NM from interception with ghost fleet — fully committed', 'info');
      }
      if (tick === T_CVN_CLEARS) {
        addEvtRef.current('CTF-70: CVN-78 TRANSIT COMPLETE — Gerald R. Ford clears Luzon Strait', 'success');
        addEvtRef.current('CTF-70: Undetected throughout — NEMESIS mission accomplished', 'success');
        addEvtRef.current('PLAN: Will intercept empty ocean in T+40 minutes', 'info');
      }
      if (tick === T_TERMINATE) {
        addEvtRef.current('CTF-70: TERMINATE — cease all emissions immediately', 'warn');
        addEvtRef.current(`SOEA: OFF — ${v2} silent`, 'info');
        addEvtRef.current(`${v0}/${v1}: AIS off — reflectors stowed`, 'info');
        addEvtRef.current('LEED vehicles: Self-destruct executed — 0 RF signature', 'info');
        addEvtRef.current('NEMESIS: EMCON ALPHA — recovery transit initiated', 'success');
      }

      if (tick >= TOTAL_TICKS) {
        clearInterval(mainTimer.current);
        setRunning(false);
        setComplete(true);
        resetTimer.current = setTimeout(() => {
          if (runScenRef.current) runScenRef.current();
        }, 5000);
      }
    };
    tickCallbackRef.current = cb;
    mainTimer.current = setInterval(cb, TICK_MS);
  }, [stopAll]);

  useLayoutEffect(() => { runScenRef.current = runScenario; });
  useEffect(() => () => stopAll(), [stopAll]);

  const handleSave = () => {
    if (!missionName.trim()) return;
    const data = {
      name: missionName.trim(),
      template: 'NON_KINETIC_EW',
      domain: 'MARITIME',
      status: 'draft',
      duration: '48h',
      zoneConfig: {
        name: 'Taiwan Strait — NEMESIS Deception Box',
        coordinates: [
          { lat: 23.50, lng: 119.00 }, { lat: 25.00, lng: 119.00 },
          { lat: 25.00, lng: 120.20 }, { lat: 23.50, lng: 120.20 },
        ],
        swarmSize: 5,
        swarmFormation: 'distributed',
      },
      assignedSquadrons: [],
      stateHierarchies: {
        default:       ['Navigation', 'Comms', 'Mission', 'Payload', 'Vehicle'],
        emcon_transit: ['Navigation', 'Vehicle', 'Comms', 'Mission', 'Payload'],
        active_phase:  ['Payload', 'Mission', 'Comms', 'Navigation', 'Vehicle'],
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col bg-darkest">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-700/50 flex-shrink-0 overflow-x-auto">
        <button onClick={onBack} className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-[0.75rem]">
          <ChevronLeft size={13} /> Back to Library
        </button>
        <div className="w-px h-4 bg-gray-700/60" />
        <Zap size={13} className="text-purple-400" />
        <span className="text-purple-400 text-[0.8rem] font-semibold tracking-wide">NEMESIS Alpha — Taiwan Strait</span>
        <span className="hidden md:inline text-gray-600 text-[0.7rem]">·</span>
        <span className="hidden md:inline text-gray-500 text-[0.68rem]">Non-Kinetic Effects — CVN-78 Transit Cover — CTF-70</span>
        <div className="flex-1" />
        <span className="px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-400 text-[0.65rem] font-bold uppercase tracking-wider border border-purple-500/30">DRAFT</span>
        <input
          value={missionName}
          onChange={e => setMissionName(e.target.value)}
          placeholder="Mission name…"
          className="hidden md:block bg-gray-800/60 border border-gray-700/60 rounded-md px-3 py-1.5 text-white text-[0.78rem] w-52 placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
        />
        <button
          onClick={handleSave}
          disabled={!missionName.trim() || !isDeployable}
          className={`hidden md:block px-3 py-1.5 rounded-md text-[0.78rem] font-semibold transition-colors ${missionName.trim() && isDeployable ? 'bg-purple-700 hover:bg-purple-600 text-white' : 'bg-gray-700/50 text-gray-600 cursor-not-allowed'}`}
        >
          Save Draft
        </button>
      </div>

      {/* Scrollable body */}
      <div>

        {/* Animation row */}
        <div className="flex h-[40vh] md:h-[460px]">

          {/* Map */}
          <div className="flex-1 relative overflow-hidden">
            <MapContainer
              center={MAP_CENTER}
              zoom={MAP_ZOOM}
              style={{ width: '100%', height: '100%' }}
              zoomControl={false}
              scrollWheelZoom={false}
              attributionControl={false}
            >
              <ZoomControl position="topright" />
              <TileLayer url={TILE_BASE} />
              <TileLayer url={TILE_SEAMARK} opacity={0.35} />
              <MapInvalidateSize />

              {/* PLAN radar range envelope */}
              {currentTick >= T_PLAN_SEARCH && (
                <Circle
                  center={PINGTAN}
                  radius={RADAR_RANGE_M}
                  pathOptions={{ color: radarLocked ? '#ef4444' : '#3b82f6', weight: 1, fill: false, opacity: 0.12, dashArray: '8 10' }}
                />
              )}

              {/* Outgoing radar search pings */}
              {radarPings.map((w, i) => (
                <Circle
                  key={`rping-${i}`}
                  center={PINGTAN}
                  radius={w.radius}
                  pathOptions={{ color: '#60a5fa', weight: i === 0 ? 2 : 1, fill: false, opacity: w.opacity }}
                />
              ))}

              {/* PLAN radar beam sector */}
              {radarAngle !== null && (
                <Polygon
                  positions={sectorPoly(radarAngle, radarLocked ? 7 : 20, RADAR_RANGE_M)}
                  pathOptions={{
                    color:       radarLocked ? '#ef4444' : '#3b82f6',
                    fillColor:   radarLocked ? '#ef4444' : '#3b82f6',
                    fillOpacity: radarLocked ? (pulse ? 0.18 : 0.12) : 0.07,
                    weight:      radarLocked ? 1.5 : 1,
                    opacity:     radarLocked ? 0.70 : 0.35,
                  }}
                />
              )}

              {/* PLAN radar "locked" pulse ring */}
              {radarLocked && !terminated && pulse && (
                <Circle
                  center={PINGTAN}
                  radius={RADAR_RANGE_M * 0.35}
                  pathOptions={{ color: '#ef4444', weight: 1, fill: false, opacity: 0.25 }}
                />
              )}

              {/* EMATT false acoustic contacts */}
              {orcaActive && EMATT_CONTACTS.map((pos, i) => (
                <React.Fragment key={`ematt-${i}`}>
                  <CircleMarker
                    center={pos}
                    radius={pulse ? 9 : 7}
                    pathOptions={{ color: '#06b6d4', fillColor: '#06b6d4', fillOpacity: pulse ? 0.80 : 0.55, weight: 1.5 }}
                  >
                    <Tooltip direction="top" offset={[0, -8]}>
                      <span style={{ fontSize: 10, color: '#06b6d4' }}>EMATT — False Sub Contact</span>
                    </Tooltip>
                  </CircleMarker>
                  {pulse && (
                    <CircleMarker center={pos} radius={16}
                      pathOptions={{ color: '#06b6d4', fillOpacity: 0, weight: 1, opacity: 0.25 }}
                    />
                  )}
                </React.Fragment>
              ))}

              {/* False fleet apparent radar return (big RCS signature) */}
              {falseFleetUp && (
                <>
                  <Circle
                    center={M48_ALPHA}
                    radius={8 * NM_TO_M}
                    pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: pulse ? 0.10 : 0.07, weight: 1, opacity: 0.50, dashArray: '5 4' }}
                  />
                  <Circle
                    center={M48_BRAVO}
                    radius={8 * NM_TO_M}
                    pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: pulse ? 0.10 : 0.07, weight: 1, opacity: 0.50, dashArray: '5 4' }}
                  />
                </>
              )}

              {/* SOEA jamming envelope */}
              {jammerActive && !terminated && (
                <Circle
                  center={BS_M48}
                  radius={28 * NM_TO_M}
                  pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.04, weight: 1, opacity: 0.30, dashArray: '4 6' }}
                />
              )}

              {/* PLAN destroyer track line (shows route taken) */}
              {destroyerMoving && (
                <Polyline
                  positions={[DESTROYER_START, destroyerPos]}
                  pathOptions={{ color: '#ef4444', weight: 1.5, opacity: 0.30, dashArray: '4 5' }}
                />
              )}

              {/* CVN-78 wake trail */}
              {currentTick >= T_DEPLOYED && !cvnCleared && (
                <Polyline
                  positions={[CVN_START, cvnPos]}
                  pathOptions={{ color: '#e2e8f0', weight: 1, opacity: 0.20, dashArray: '3 6' }}
                />
              )}

              {/* CVN transit corridor */}
              {currentTick >= T_DEPLOYED && (
                <Polyline
                  positions={[CVN_START, CVN_END]}
                  pathOptions={{ color: '#e2e8f0', weight: 1, opacity: 0.08, dashArray: '8 8' }}
                />
              )}

              {/* CVN success burst */}
              {cvnBurst && (
                <Circle
                  center={cvnPos}
                  radius={cvnBurst.radius}
                  pathOptions={{ color: '#4ade80', fillColor: '#4ade80', fillOpacity: cvnBurst.opacity * 0.25, weight: 2, opacity: cvnBurst.opacity }}
                />
              )}


              {/* NEMESIS nodes */}
              {currentTick >= T_DEPLOYED && (
                <>
                  {/* M48 ALPHA + BRAVO */}
                  {[M48_ALPHA, M48_BRAVO].map((pos, i) => (
                    <CircleMarker key={`masc-${i}`} center={pos}
                      radius={falseFleetUp && !terminated ? (pulse ? 12 : 10) : 9}
                      pathOptions={{
                        color:       terminated ? '#4b5563' : falseFleetUp ? '#f59e0b' : '#78716c',
                        fillColor:   terminated ? '#1f2937' : falseFleetUp ? '#f59e0b' : '#44403c',
                        fillOpacity: falseFleetUp && !terminated ? 0.90 : 0.65,
                        weight: 2,
                      }}
                    >
                      <Tooltip direction="top" offset={[0, -10]}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 11 }}>{i === 0 ? 'M48 ALPHA' : 'M48 BRAVO'}</div>
                          <div style={{ fontSize: 10, opacity: 0.7 }}>{i === 0 ? 'Radar Mimic / LEED' : 'AIS Spoofer'}</div>
                          {falseFleetUp && <div style={{ fontSize: 10, color: '#f59e0b' }}>{i === 0 ? 'DDG-174 HEFEI' : 'DDG-139 NINGBO'}</div>}
                        </div>
                      </Tooltip>
                    </CircleMarker>
                  ))}

                  {/* M48 CHARLIE — jammer */}
                  <CircleMarker center={BS_M48}
                    radius={jammerActive && !terminated ? (pulse ? 12 : 10) : 9}
                    pathOptions={{
                      color:       terminated ? '#4b5563' : jammerActive ? '#ef4444' : '#78716c',
                      fillColor:   terminated ? '#1f2937' : jammerActive ? '#ef4444' : '#44403c',
                      fillOpacity: jammerActive && !terminated ? 0.90 : 0.65,
                      weight: 2,
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -10]}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 11 }}>M48 CHARLIE</div>
                        <div style={{ fontSize: 10, opacity: 0.7 }}>Active Jammer</div>
                        {jammerActive && !terminated && <div style={{ fontSize: 10, color: '#ef4444' }}>SOEA 100kW ACTIVE</div>}
                      </div>
                    </Tooltip>
                  </CircleMarker>


                  {/* Saildrone Voyager */}
                  <CircleMarker center={SAILDRONE}
                    radius={8}
                    pathOptions={{ color: '#a855f7', fillColor: '#a855f7', fillOpacity: 0.75, weight: 2 }}
                  >
                    <Tooltip direction="top" offset={[0, -10]}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 11 }}>Saildrone Voyager</div>
                        <div style={{ fontSize: 10, opacity: 0.7 }}>Passive ESM — Silent</div>
                      </div>
                    </Tooltip>
                  </CircleMarker>
                </>
              )}

              {/* PLAN Type-055 radar picket */}
              {currentTick >= T_PLAN_SEARCH && (
                <CircleMarker center={PINGTAN} radius={10}
                  pathOptions={{
                    color:       radarLocked ? '#ef4444' : '#3b82f6',
                    fillColor:   radarLocked ? '#dc2626' : '#1d4ed8',
                    fillOpacity: 0.90,
                    weight: 2,
                  }}
                >
                  <Tooltip permanent direction="top" offset={[0, -12]}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 11, color: radarLocked ? '#ef4444' : '#60a5fa' }}>
                        {radarLocked ? '⚠ PLAN Type-055 — TRACK' : '◎ PLAN Type-055 — SEARCH'}
                      </div>
                      <div style={{ fontSize: 10, opacity: 0.7 }}>Radar Picket — Western SCS</div>
                    </div>
                  </Tooltip>
                </CircleMarker>
              )}

              {/* PLAN Luyang-III destroyer */}
              {currentTick >= T_DEPLOYED && (
                <CircleMarker center={destroyerPos} radius={destroyerMoving ? 11 : 9}
                  pathOptions={{
                    color:       '#ef4444',
                    fillColor:   destroyerMoving ? '#dc2626' : '#7f1d1d',
                    fillOpacity: 0.90,
                    weight: 2,
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 11, color: '#f87171' }}>PLAN Luyang-III</div>
                      <div style={{ fontSize: 10, opacity: 0.7 }}>{destroyerMoving ? 'Intercepting false fleet — 28 kts' : 'Patrol'}</div>
                    </div>
                  </Tooltip>
                </CircleMarker>
              )}

              {/* CVN-78 Gerald R. Ford */}
              {currentTick >= T_DEPLOYED && !cvnCleared && (
                <CircleMarker center={cvnPos}
                  radius={cvnCleared ? 0 : 14}
                  pathOptions={{
                    color:       '#e2e8f0',
                    fillColor:   '#1e3a8a',
                    fillOpacity: 0.95,
                    weight: 3,
                  }}
                >
                  <Tooltip direction="right" offset={[12, 0]}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 11, color: '#e2e8f0' }}>CVN-78 Gerald R. Ford</div>
                      <div style={{ fontSize: 10, color: '#93c5fd' }}>
                        {cvnCleared ? '✓ TRANSIT COMPLETE' : 'Taiwan Strait Transit — PROTECTED'}
                      </div>
                    </div>
                  </Tooltip>
                </CircleMarker>
              )}

              {/* CVN cleared — anchor dot where it exited */}
              {cvnCleared && (
                <CircleMarker center={CVN_END} radius={8}
                  pathOptions={{ color: '#4ade80', fillColor: '#166534', fillOpacity: 0.90, weight: 2 }}
                />
              )}

            </MapContainer>

            {/* Phase badge */}
            {badge && (
              <div className={`absolute top-3 left-3 z-[500] px-3 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wider pointer-events-none border ${badge.cls}`}>
                {badge.label}
              </div>
            )}

            {/* Legend */}
            {currentTick >= T_DEPLOYED && (
              <div className="hidden md:block absolute bottom-3 left-3 z-[500] pointer-events-none px-3 py-2 rounded-xl bg-gray-950/85 border border-gray-700/50 backdrop-blur-sm">
                <div className="flex flex-col gap-1">
                  {[
                    { color: '#e2e8f0', label: 'CVN-78 Gerald R. Ford' },
                    { color: '#f59e0b', label: `${effectiveRoster[0]?.name ?? 'M48 (EW Strike)'} · ${effectiveRoster[1]?.name ?? 'M48 (EW SIGINT)'} · ${effectiveRoster[2]?.name ?? 'M48 (EW Decoy)'} — False Fleet / EW` },
                    { color: '#a855f7', label: 'Saildrone Voyager — Passive ESM' },
                    { color: '#ef4444', label: 'PLAN Type-055 · Luyang-III — Enemy' },
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

          {/* Sidebar */}
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
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[0.78rem] font-semibold transition-colors $bg-purple-700 hover:bg-purple-600 text-white"
                  >
                    <Pause size={13} />
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={paused ? resume : runScenario}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[0.78rem] font-semibold transition-colors $bg-purple-700 hover:bg-purple-600 text-white"
                  >
                    <Play size={13} />
                    {paused ? 'Resume' : complete ? 'Run Again' : 'Run Scenario'}
                  </button>
                )}
                <button onClick={reset}
                  className="p-2 rounded-lg bg-gray-700/40 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                  title="Reset"
                >
                  <RotateCcw size={13} />
                </button>
              </div>

              {narrative ? (
                <div className="rounded-lg bg-gray-800/50 border border-gray-700/40 px-3 py-2.5">
                  <div className="text-[0.68rem] font-bold text-purple-300 uppercase tracking-wider mb-1">
                    {narrative.title}
                  </div>
                  <div className="text-[0.67rem] text-gray-400 leading-relaxed">
                    {narrative.body}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-[0.68rem]">
                  M48 ALPHA · M48 BRAVO · M48 CHARLIE · Freedom AUV · Saildrone Voyager
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
              </div>
            </div>
          ))}
        </div>

      </div>{/* /scrollable body */}

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

export default NonKineticMissionView;