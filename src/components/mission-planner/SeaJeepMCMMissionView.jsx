import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import {
  MapContainer, TileLayer, CircleMarker, Polyline, Rectangle, Tooltip, ZoomControl, useMap
} from 'react-leaflet';
import { Play, Pause, RotateCcw, Anchor, ChevronLeft, Settings, ArrowLeftRight } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import useMissionStore from '../../store/missionStore';
import useOutfitterStore from '../../store/outfitterStore';
import useConfigurationStore from '../../store/configurationStore';
import useNavigationStore from '../../store/navigationStore';
import SwapVesselModal from './SwapVesselModal';
import ReadinessChecklist from './ReadinessChecklist';
import { getMissionReadiness } from '../../utils/missionReadiness';
import { HULL_IMAGES } from '../../utils/hullImages';
import { vesselHullData } from '../../data/vesselData';
import { MISSION_ROLES } from '../../data/missionRoles';
import imgSeaJeep from '../../assets/images/SeaJeep.png';

const MISSION_SET_KEY = 'SEAJEEP_MCM';
const MISSION_SET_CAPS = [
  'EdgeTech 2300-MS FLS',
  'EdgeTech 4125 Side-Scan Sonar',
  'Smart Winch + A-Frame',
  'GPS/INS (jam-resistant)',
  'Iridium SATCOM',
  'Extended Fuel Tank (MCM config)',
];

// ─── Geography ────────────────────────────────────────────────────────────────
const MAP_CENTER   = [46.3, 31.2];
const MAP_ZOOM     = 9;
const ODESSA_PORT  = [46.49, 30.74];
const SURVEY_LANE  = [
  [46.40, 30.90],
  [46.40, 31.30],
  [46.40, 31.70],
  [46.40, 32.10],
];
const MINES = [
  { id: 'M1', pos: [46.38, 31.05], label: 'CONTACT-ALPHA' },
  { id: 'M2', pos: [46.42, 31.45], label: 'CONTACT-BRAVO' },
  { id: 'M3', pos: [46.39, 31.85], label: 'CONTACT-CHARLIE' },
];
const MOC_POS = [46.49, 30.74];

// ─── Loadout ──────────────────────────────────────────────────────────────────
const SEA_JEEP_MCM_MOUNTS = [
  { slot: 'SONAR (forward)', name: 'EdgeTech 2300-MS FLS',           vendor: 'EdgeTech', checked: true, description: 'Forward-Looking SONAR — detects bottom contacts ahead, triggers auto-halt' },
  { slot: 'SONAR (towed)',   name: 'EdgeTech 4125 Side-Scan Sonar',  vendor: 'EdgeTech', checked: true, description: 'Towed fish — maps seabed both flanks, 150m total swath' },
  { slot: 'DEPLOY',          name: 'Smart Winch + A-Frame',          vendor: 'GP-USV',   checked: true, description: 'Deploys and recovers tow fish; maintains constant tow depth' },
  { slot: 'NAV',             name: 'GPS/INS (jam-resistant)',         vendor: '—',        checked: true, description: 'INS for GPS-denied Black Sea environment' },
  { slot: 'COMMS',           name: 'Iridium SATCOM',                 vendor: 'Iridium',  checked: true, description: 'Transmits mine coordinates to Ukrainian Navy MOC and HORUS queue' },
  { slot: 'POWER',           name: 'Extended Fuel Tank (MCM config)', vendor: 'GP-USV',  checked: true, description: 'Increased fuel for full corridor survey endurance' },
];

const VESSEL_ROSTER = [
  {
    name: 'SEA-JEEP-MCM-1',
    roleDescriptor: '(MCM)',
    image: imgSeaJeep,
    hullName: 'GP-USV Sea Jeep',
    capabilities: SEA_JEEP_MCM_MOUNTS.map(m => m.name),
    roleKey: 'SJC_SEAJEEP_1',
  },
];

// ─── Tick milestones ──────────────────────────────────────────────────────────
const T_DEPART            = 5;
const T_TOW_DEPLOYED      = 15;
const T_FLS_HALT_ALPHA    = 28;
const T_MINE_ALPHA        = 36;
const T_RESUME            = 44;
const T_SIDESCAN_BRAVO    = 55;
const T_MINE_BRAVO        = 63;
const T_MID_SURVEY        = 72;
const T_FLS_HALT_CHARLIE  = 82;
const T_MINE_CHARLIE      = 88;
const T_SURVEY_COMPLETE   = 94;
const T_DATA_TRANSMITTED  = 100;
const TOTAL_TICKS         = 110;

// ─── Phase state machine ──────────────────────────────────────────────────────
const getPhase = (tick) => {
  if (tick < T_DEPART)           return 'idle';
  if (tick < T_TOW_DEPLOYED)     return 'departing';
  if (tick < T_FLS_HALT_ALPHA)   return 'tow_deployed';
  if (tick < T_MINE_ALPHA)       return 'fls_halt_alpha';
  if (tick < T_RESUME)           return 'mine_alpha_confirmed';
  if (tick < T_SIDESCAN_BRAVO)   return 'resume_survey';
  if (tick < T_MINE_BRAVO)       return 'sidescan_bravo';
  if (tick < T_MID_SURVEY)       return 'mine_bravo_confirmed';
  if (tick < T_FLS_HALT_CHARLIE) return 'mid_survey';
  if (tick < T_MINE_CHARLIE)     return 'fls_halt_charlie';
  if (tick < T_SURVEY_COMPLETE)  return 'mine_charlie_confirmed';
  if (tick < T_DATA_TRANSMITTED) return 'survey_complete';
  return 'data_transmitted';
};

// ─── Mine detection state ─────────────────────────────────────────────────────
const getMineState = (mineId, tick) => {
  if (mineId === 'M1') {
    if (tick < T_FLS_HALT_ALPHA) return 'hidden';
    if (tick < T_MINE_ALPHA)     return 'contact';
    return 'marked';
  }
  if (mineId === 'M2') {
    if (tick < T_SIDESCAN_BRAVO) return 'hidden';
    if (tick < T_MINE_BRAVO)     return 'contact';
    return 'marked';
  }
  if (mineId === 'M3') {
    if (tick < T_FLS_HALT_CHARLIE) return 'hidden';
    if (tick < T_MINE_CHARLIE)     return 'contact';
    return 'marked';
  }
  return 'hidden';
};

// ─── Sea Jeep position along survey lane ─────────────────────────────────────
const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

const trackPos = (track, t) => {
  const clamped = Math.min(Math.max(t, 0), 0.9999);
  const progress = clamped * (track.length - 1);
  const idx = Math.floor(progress);
  return lerp2(track[idx], track[idx + 1], progress - idx);
};

const getSeaJeepPos = (tick) => {
  if (tick < T_DEPART) return null;
  // Depart Odessa → survey lane start
  if (tick < T_TOW_DEPLOYED) {
    const t = (tick - T_DEPART) / (T_TOW_DEPLOYED - T_DEPART);
    return lerp2(ODESSA_PORT, SURVEY_LANE[0], Math.min(t, 1));
  }
  // Auto-halt at ALPHA — hold position
  if (tick >= T_FLS_HALT_ALPHA && tick < T_RESUME) {
    const surveyT = (T_FLS_HALT_ALPHA - T_TOW_DEPLOYED) / (TOTAL_TICKS - T_TOW_DEPLOYED);
    return trackPos(SURVEY_LANE, surveyT * 0.85);
  }
  // Auto-halt at CHARLIE — hold position
  if (tick >= T_FLS_HALT_CHARLIE && tick < T_SURVEY_COMPLETE) {
    const surveyT = (T_FLS_HALT_CHARLIE - T_TOW_DEPLOYED) / (TOTAL_TICKS - T_TOW_DEPLOYED);
    return trackPos(SURVEY_LANE, surveyT * 0.85);
  }
  // Full survey lane traversal (skipping halt windows above)
  const activeRange = TOTAL_TICKS - T_TOW_DEPLOYED;
  const effectiveTick = tick - T_TOW_DEPLOYED;
  const t = Math.min(effectiveTick / activeRange, 0.9999) * 0.85;
  return trackPos(SURVEY_LANE, t);
};

const getTowFishPos = (tick, jeepPos) => {
  if (tick < T_TOW_DEPLOYED || !jeepPos) return null;
  // Offset ~0.005° behind (west of) Sea Jeep
  return [jeepPos[0], jeepPos[1] - 0.005];
};

// Trail grows along survey lane as Sea Jeep advances
const getSurveyTrail = (tick) => {
  if (tick < T_TOW_DEPLOYED) return [];
  const activeRange = TOTAL_TICKS - T_TOW_DEPLOYED;
  const effectiveTick = Math.min(tick, T_SURVEY_COMPLETE) - T_TOW_DEPLOYED;
  const t = Math.min(effectiveTick / activeRange, 0.9999) * 0.85;
  const progress = t * (SURVEY_LANE.length - 1);
  const idx = Math.floor(progress);
  const trail = [];
  for (let i = 0; i <= Math.min(idx, SURVEY_LANE.length - 2); i++) {
    trail.push(SURVEY_LANE[i]);
  }
  if (idx < SURVEY_LANE.length - 1) {
    const sub = progress - idx;
    trail.push(lerp2(SURVEY_LANE[idx], SURVEY_LANE[idx + 1], sub));
  }
  return trail;
};

// Side-scan swath coverage — rectangles growing along track
const getSwathBounds = (tick) => {
  if (tick < T_TOW_DEPLOYED) return [];
  const jeepPos = getSeaJeepPos(tick);
  if (!jeepPos) return [];
  const swathHalf = 0.018; // ~75m each side in degrees lat/lng approx
  return [
    // Port swath
    [[jeepPos[0] - 0.003, SURVEY_LANE[0][1]], [jeepPos[0] + 0.003, jeepPos[1] - swathHalf]],
    // Starboard swath
    [[jeepPos[0] - 0.003, jeepPos[1] + swathHalf], [jeepPos[0] + 0.003, jeepPos[1]]],
  ];
};

// ─── Mine marker appearance ───────────────────────────────────────────────────
const mineMarkerOpts = (state, pulse) => {
  switch (state) {
    case 'contact':
      return pulse
        ? { color: '#fb923c', fillColor: '#fb923c', fillOpacity: 0.9,  weight: 3 }
        : { color: '#f97316', fillColor: '#f97316', fillOpacity: 0.65, weight: 2 };
    case 'marked':
      return { color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.85, weight: 2 };
    default:
      return null;
  }
};

// ─── Phase badge ──────────────────────────────────────────────────────────────
const getPhaseBadge = (phase) => {
  switch (phase) {
    case 'departing':             return { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40',       label: '→ Departing Odessa' };
    case 'tow_deployed':          return { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40',       label: '◈ Tow Fish Deployed' };
    case 'fls_halt_alpha':        return { cls: 'bg-amber-900/80 text-amber-300 border-amber-500/40 animate-pulse', label: '⚠ FLS HALT — Classifying' };
    case 'mine_alpha_confirmed':  return { cls: 'bg-red-900/80 text-red-300 border-red-500/40',          label: '● ALPHA Confirmed — Marking' };
    case 'resume_survey':         return { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40',       label: '→ Routing Around ALPHA' };
    case 'sidescan_bravo':        return { cls: 'bg-amber-900/80 text-amber-300 border-amber-500/40',    label: '◉ Side-Scan Contact — BRAVO' };
    case 'mine_bravo_confirmed':  return { cls: 'bg-red-900/80 text-red-300 border-red-500/40',          label: '● BRAVO Confirmed — Marking' };
    case 'mid_survey':            return { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40',       label: '◈ Mid-Corridor — 90% Coverage' };
    case 'fls_halt_charlie':      return { cls: 'bg-amber-900/80 text-amber-300 border-amber-500/40 animate-pulse', label: '⚠ FLS HALT — Classifying' };
    case 'mine_charlie_confirmed':return { cls: 'bg-red-900/80 text-red-300 border-red-500/40',          label: '● CHARLIE Confirmed — Marking' };
    case 'survey_complete':       return { cls: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40', label: '✓ Survey Complete — 3 Mines Mapped' };
    case 'data_transmitted':      return { cls: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40', label: '✓ Mine Map Transmitted — HORUS Tasked' };
    default:                      return null;
  }
};

// ─── Phase narrative ──────────────────────────────────────────────────────────
const PHASE_NARRATIVE = {
  idle:                  null,
  departing:             { title: 'Sea Jeep MCM — Departing Odessa', body: 'GP-USV Sea Jeep MCM-1 departing Odessa port. A-frame deploying tow fish on exit. FLS active on bow. INS confirmed — GPS-denied environment. Survey lane CORRIDOR-ALPHA ahead.' },
  tow_deployed:          { title: 'Tow Fish Deployed — Survey Active', body: 'EdgeTech 4125 tow fish deployed — 150m total swath active. EdgeTech 2300-MS FLS scanning ahead for bottom contacts. INS maintaining position in GPS-denied environment. MOC Odessa: transit authorized.' },
  fls_halt_alpha:        { title: 'FLS Contact — Auto-Halt Engaged', body: 'Forward-looking sonar detected bottom object ahead. Sea Jeep has auto-halted per MCM rules of engagement. Classifying CONTACT-ALPHA. Tow fish holding. This platform does NOT neutralize — contact classification only.' },
  mine_alpha_confirmed:  { title: 'MINE CONFIRMED — CONTACT-ALPHA', body: 'CONTACT-ALPHA classified as moored mine. Coordinates marked and transmitted to MOC Odessa. HORUS MCM queue updated. Sea Jeep will route around — HORUS neutralizes on a follow-on tasking.' },
  resume_survey:         { title: 'Routing Around ALPHA — Resuming Survey', body: 'Sea Jeep routing around CONTACT-ALPHA and resuming survey. Tow fish back on track. Side-scan and FLS both active. Continue to far end of CORRIDOR-ALPHA.' },
  sidescan_bravo:        { title: 'Side-Scan Contact — BRAVO', body: 'Towed side-scan sonar returns a bottom contact 40m port of track. CONTACT-BRAVO. Sea Jeep slowing — classifying. This is a side-scan detection rather than FLS — contact is off the direct track.' },
  mine_bravo_confirmed:  { title: 'MINE CONFIRMED — CONTACT-BRAVO', body: 'CONTACT-BRAVO confirmed as bottom mine. Marking and transmitting to MOC Odessa. 2 mines now logged to HORUS MCM queue. Sea Jeep resumes survey — no attempt to neutralize.' },
  mid_survey:            { title: 'Mid-Corridor — 90% Swath Coverage', body: 'Sea Jeep mid-corridor. Sonar swath coverage at 90% of CORRIDOR-ALPHA. FLS and tow fish operating nominally. No additional contacts yet. Approaching far end of lane.' },
  fls_halt_charlie:      { title: 'FLS Contact — Auto-Halt', body: 'FLS returns a third bottom contact directly ahead — CONTACT-CHARLIE. Auto-halt engaged. Classifying. Two prior marks already in HORUS queue — any additional contacts follow same detect-and-mark protocol.' },
  mine_charlie_confirmed:{ title: 'MINE CONFIRMED — CONTACT-CHARLIE', body: 'CONTACT-CHARLIE confirmed — third mine in corridor. Marked and transmitted. 3 mines total mapped across CORRIDOR-ALPHA. Sea Jeep completing survey and recovering tow fish for RTB.' },
  survey_complete:       { title: 'Full Corridor Survey Complete', body: 'All of CORRIDOR-ALPHA surveyed. 3 mines mapped and marked: CONTACT-ALPHA, BRAVO, CHARLIE. Tow fish recovered via A-frame. Sea Jeep returning to Odessa. Mine map compiling for transmission.' },
  data_transmitted:      { title: 'Mine Map Transmitted — HORUS MCM Tasked', body: 'Full CORRIDOR-ALPHA mine survey archived at MOC Odessa. 3 mine coordinates transmitted to HORUS MCM neutralization team. Grain corridor clearance sequence initiated. Sea Jeep mission complete.' },
};

// ─── Event colors ─────────────────────────────────────────────────────────────
const EVENT_COLORS = {
  warn:    'text-amber-400',
  alert:   'text-red-400',
  info:    'text-cyan-400',
  success: 'text-emerald-400',
};

// ─── Tile layers ──────────────────────────────────────────────────────────────
const TILE_BASE    = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_SEAMARK = 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png';

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
const SeaJeepMCMMissionView = ({ mission, onBack }) => {
  const { saveMission, updateMission } = useMissionStore();
  const { setSelectedHull } = useOutfitterStore();
  const { startNewConfiguration, setPendingMissionSetKey, setPendingRoleKey, setPendingVesselLabel, setPendingMissionSetCaps, activeConfig } = useConfigurationStore();
  const { setSelectedView } = useNavigationStore();
  const roleAssignments = useMissionStore(s => s.roleAssignments);
  const savedConfigurations = useConfigurationStore(s => s.savedConfigurations);
  const [swapModal, setSwapModal] = useState(null); // { roleKey: string } | null
  const [showLog, setShowLog] = useState(false);

  // Build effective roster
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
  const [jeepPulse,    setJeepPulse]    = useState(false);
  const [events,       setEvents]       = useState([]);
  const [running,      setRunning]      = useState(false);
  const [paused,       setPaused]       = useState(false);
  const [complete,     setComplete]     = useState(false);

  const tickRef         = useRef(0);
  const tickCallbackRef = useRef(null);
  const mainTimer       = useRef(null);
  const pulseTimer      = useRef(null);
  const jeepPulseTimer  = useRef(null);
  const addEvtRef       = useRef(null);
  const vesselLabelsRef = useRef([]);

  // Derived from currentTick
  const phase    = getPhase(currentTick);
  const jeepPos  = getSeaJeepPos(currentTick);
  const towPos   = getTowFishPos(currentTick, jeepPos);
  const trail    = getSurveyTrail(currentTick);
  const swaths   = getSwathBounds(currentTick);
  const badge    = getPhaseBadge(phase);
  const narrative = PHASE_NARRATIVE[phase] || null;

  const _addEvent = (msg, type = 'info') => {
    const ts = new Date().toLocaleTimeString('en-US', {
      hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    setEvents(prev => [{ ts, msg, type, id: `${ts}-${msg.slice(0, 12)}` }, ...prev].slice(0, 30));
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
    mainTimer.current = setInterval(tickCallbackRef.current, 180);
  }, []);

  useLayoutEffect(() => { addEvtRef.current = _addEvent; });
  useLayoutEffect(() => { vesselLabelsRef.current = effectiveRoster.map(v => v.name); });

  // Mine pulse (active during detection phases)
  useEffect(() => {
    clearInterval(pulseTimer.current);
    const needsPulse = [
      'fls_halt_alpha', 'mine_alpha_confirmed',
      'sidescan_bravo', 'mine_bravo_confirmed',
      'fls_halt_charlie', 'mine_charlie_confirmed',
    ].includes(phase);
    if (needsPulse) {
      pulseTimer.current = setInterval(() => setMinePulse(p => !p), 350);
      return () => clearInterval(pulseTimer.current);
    }
    setMinePulse(false);
  }, [phase]);

  // Sea Jeep white pulse on auto-halt
  useEffect(() => {
    clearInterval(jeepPulseTimer.current);
    const isHalted = phase === 'fls_halt_alpha' || phase === 'fls_halt_charlie';
    if (isHalted) {
      jeepPulseTimer.current = setInterval(() => setJeepPulse(p => !p), 280);
      return () => clearInterval(jeepPulseTimer.current);
    }
    setJeepPulse(false);
  }, [phase]);

  const stopAll = useCallback(() => {
    clearInterval(mainTimer.current);
    clearInterval(pulseTimer.current);
    clearInterval(jeepPulseTimer.current);
    mainTimer.current = pulseTimer.current = jeepPulseTimer.current = null;
  }, []);

  const reset = useCallback(() => {
    stopAll();
    tickRef.current = 0;
    setPaused(false);
    setCurrentTick(0);
    setMinePulse(false);
    setJeepPulse(false);
    setEvents([]);
    setRunning(false);
    setComplete(false);
  }, [stopAll]);

  const runScenario = useCallback(() => {
    stopAll();
    tickRef.current = 0;
    setCurrentTick(0);
    setMinePulse(false);
    setJeepPulse(false);
    setEvents([]);
    setRunning(true);
    setPaused(false);
    setComplete(false);

    const cb = () => {
      const tick = ++tickRef.current;
      const v0 = vesselLabelsRef.current[0] ?? 'SEA-JEEP-MCM-1';
      setCurrentTick(tick);

      if (tick === T_DEPART) {
        addEvtRef.current(`${v0}: Departing Odessa — deploying tow array via A-frame`, 'info');
      }
      if (tick === T_TOW_DEPLOYED) {
        addEvtRef.current(`${v0}: Tow fish deployed — side-scan sonar active, FLS active`, 'info');
        addEvtRef.current(`${v0}: INS active — GPS denied environment confirmed`, 'info');
        addEvtRef.current('MOC ODESSA: Survey lane CORRIDOR-ALPHA — transit authorized', 'info');
      }
      if (tick === T_FLS_HALT_ALPHA) {
        addEvtRef.current(`${v0}: FLS CONTACT — bottom object ahead — auto-halt engaged`, 'warn');
        addEvtRef.current(`${v0}: Holding position — classifying CONTACT-ALPHA`, 'warn');
      }
      if (tick === T_MINE_ALPHA) {
        addEvtRef.current(`${v0}: MINE CONFIRMED — moored contact, CONTACT-ALPHA — marking`, 'alert');
        addEvtRef.current('MOC ODESSA: CONTACT-ALPHA logged — coordinates in HORUS MCM queue', 'info');
      }
      if (tick === T_RESUME) {
        addEvtRef.current(`${v0}: Routing around CONTACT-ALPHA — resuming survey`, 'info');
      }
      if (tick === T_SIDESCAN_BRAVO) {
        addEvtRef.current(`${v0}: Side-scan contact — CONTACT-BRAVO, port flank, 40m off track`, 'warn');
      }
      if (tick === T_MINE_BRAVO) {
        addEvtRef.current(`${v0}: CONTACT-BRAVO confirmed — bottom mine — marking`, 'alert');
        addEvtRef.current('MOC ODESSA: CONTACT-BRAVO logged — 2 mines mapped in CORRIDOR-ALPHA', 'info');
      }
      if (tick === T_MID_SURVEY) {
        addEvtRef.current(`${v0}: Mid-corridor — sonar swath coverage 90%`, 'info');
      }
      if (tick === T_FLS_HALT_CHARLIE) {
        addEvtRef.current(`${v0}: FLS CONTACT — CONTACT-CHARLIE, ahead — auto-halt`, 'warn');
      }
      if (tick === T_MINE_CHARLIE) {
        addEvtRef.current(`${v0}: CONTACT-CHARLIE confirmed — marking`, 'alert');
      }
      if (tick === T_SURVEY_COMPLETE) {
        addEvtRef.current(`${v0}: Full corridor survey complete — 3 mines mapped`, 'success');
        addEvtRef.current(`${v0}: Recovering tow fish — returning to Odessa`, 'info');
      }
      if (tick === T_DATA_TRANSMITTED) {
        addEvtRef.current('MOC ODESSA: Mine map transmitted — HORUS MCM tasked for neutralization', 'success');
        addEvtRef.current('MOC ODESSA: CORRIDOR-ALPHA survey archived — grain corridor clearance initiated', 'success');
      }
      if (tick >= TOTAL_TICKS) {
        clearInterval(mainTimer.current);
        setRunning(false);
        setComplete(true);
      }
    };
    tickCallbackRef.current = cb;
    mainTimer.current = setInterval(cb, 180);
  }, [stopAll]);

  useEffect(() => () => stopAll(), [stopAll]);

  const handleConfigureVessel = (vessel) => {
    if (!vessel.hullName) return;
    const hull = vesselHullData.find(h => h.name === vessel.hullName);
    if (!hull) return;
    setSelectedHull(hull);
    // Only start fresh if no active config for this hull — preserve user's customisations on re-entry
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
      template: 'SEAJEEP_MCM',
      domain: 'MARITIME',
      status: 'draft',
      duration: '48h',
      zoneConfig: {
        name: 'Black Sea — Odessa Corridor (CORRIDOR-ALPHA)',
        coordinates: [
          { lat: 46.36, lng: 30.85 },
          { lat: 46.36, lng: 32.15 },
          { lat: 46.44, lng: 32.15 },
          { lat: 46.44, lng: 30.85 },
        ],
        swarmSize: 1,
        swarmFormation: 'single',
      },
      assignedSquadrons: [],
      stateHierarchies: {
        default:          ['Navigation', 'Payload', 'Comms', 'Mission', 'Vehicle'],
        contact_detected: ['Payload', 'Mission', 'Comms', 'Navigation', 'Vehicle'],
        comms_degraded:   ['Navigation', 'Mission', 'Vehicle', 'Comms', 'Payload'],
      },
      createdAt:  new Date().toISOString(),
      updatedAt:  new Date().toISOString(),
      launchedAt: null,
      history: [{ action: 'created', timestamp: new Date().toISOString() }],
    };
    if (mission?.id) updateMission(mission.id, data);
    else saveMission(data);
    onBack();
  };

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
        <span className="text-cyan-400 text-[0.8rem] font-semibold tracking-wide">Black Sea Mine Survey — Odessa Corridor</span>
        <span className="hidden md:inline text-gray-600 text-[0.7rem]">·</span>
        <span className="hidden md:inline text-gray-500 text-[0.68rem]">Legacy mine detection and mapping — grain corridor clearance</span>
        <div className="flex-1" />
        {/* DETECT ONLY badge — amber, persistent */}
        <span className="px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-300 text-[0.65rem] font-bold uppercase tracking-wider border border-amber-500/40">
          DETECT ONLY
        </span>
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

              {/* ── Side-scan swath coverage ── */}
              {swaths.map((bounds, i) => (
                <Rectangle
                  key={`swath-${i}`}
                  bounds={bounds}
                  pathOptions={{ color: '#0d9488', fillColor: '#0d9488', fillOpacity: 0.07, weight: 0.5, opacity: 0.3 }}
                />
              ))}

              {/* ── Survey trail (cyan polyline growing behind Sea Jeep) ── */}
              {trail.length >= 2 && (
                <Polyline
                  positions={trail}
                  pathOptions={{ color: '#22d3ee', weight: 2, opacity: 0.55, dashArray: '5 4' }}
                />
              )}

              {/* ── Tow fish ── */}
              {towPos && (
                <CircleMarker
                  center={towPos}
                  radius={3}
                  pathOptions={{ color: '#fbbf24', fillColor: '#fbbf24', fillOpacity: 1, weight: 1.5 }}
                >
                  <Tooltip direction="bottom" offset={[0, 6]}>
                    <span style={{ fontSize: 11, fontWeight: 700 }}>Tow Fish — Side-Scan Active</span>
                  </Tooltip>
                </CircleMarker>
              )}

              {/* ── Sea Jeep ── */}
              {jeepPos && (
                <CircleMarker
                  center={jeepPos}
                  radius={7}
                  pathOptions={{
                    color:       jeepPulse ? '#ffffff' : '#22d3ee',
                    fillColor:   jeepPulse ? '#ffffff' : '#22d3ee',
                    fillOpacity: 0.95,
                    weight:      jeepPulse ? 3 : 2,
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]}>
                    <span style={{ fontSize: 11, fontWeight: 700 }}>SEA-JEEP-MCM-1</span>
                  </Tooltip>
                </CircleMarker>
              )}

              {/* ── Halt pulse ring on Sea Jeep ── */}
              {jeepPos && jeepPulse && (
                <CircleMarker
                  center={jeepPos}
                  radius={14}
                  pathOptions={{ color: '#ffffff', fillOpacity: 0, weight: 2, opacity: 0.45 }}
                />
              )}

              {/* ── Odessa MOC ── */}
              <CircleMarker
                center={MOC_POS}
                radius={5}
                pathOptions={{ color: '#94a3b8', fillColor: '#475569', fillOpacity: 0.9, weight: 2 }}
              >
                <Tooltip direction="right" offset={[8, 0]}>
                  <span style={{ fontSize: 11, fontWeight: 700 }}>Odessa MOC</span>
                </Tooltip>
              </CircleMarker>

              {/* ── Mine contacts ── */}
              {MINES.map(mine => {
                const state = getMineState(mine.id, currentTick);
                if (state === 'hidden') return null;
                const opts = mineMarkerOpts(state, minePulse);
                if (!opts) return null;
                return (
                  <React.Fragment key={mine.id}>
                    {/* Mine circle */}
                    <CircleMarker
                      center={mine.pos}
                      radius={8}
                      pathOptions={opts}
                    >
                      <Tooltip direction="top" offset={[0, -12]}>
                        <div style={{ fontSize: 11 }}>
                          <strong>{mine.label}</strong><br />
                          {state === 'contact' && 'CONTACT — classifying'}
                          {state === 'marked'  && 'MARKED — HORUS QUEUED'}
                        </div>
                      </Tooltip>
                    </CircleMarker>

                    {/* Pulse ring on first contact */}
                    {state === 'contact' && minePulse && (
                      <CircleMarker
                        center={mine.pos}
                        radius={15}
                        pathOptions={{ color: '#f97316', fillOpacity: 0, weight: 2, opacity: 0.45 }}
                      />
                    )}

                    {/* White outline ring when marked + HORUS queued */}
                    {state === 'marked' && (
                      <CircleMarker
                        center={mine.pos}
                        radius={12}
                        pathOptions={{ color: '#ffffff', fillOpacity: 0, weight: 1.5, opacity: 0.55 }}
                      />
                    )}
                  </React.Fragment>
                );
              })}

            </MapContainer>

            {/* ── Phase badge ── */}
            {badge && (
              <div className={`absolute top-3 left-3 z-[500] px-3 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wider pointer-events-none border ${badge.cls}`}>
                {badge.label}
              </div>
            )}

            {/* ── Legend ── */}
            {currentTick >= T_DEPART && (
              <div className="hidden md:block absolute bottom-3 left-3 z-[500] pointer-events-none px-3 py-2 rounded-xl bg-gray-950/80 border border-gray-700/50 backdrop-blur-sm">
                <div className="flex flex-col gap-1">
                  {[
                    { color: '#22d3ee', label: 'SEA-JEEP-MCM-1 — GP-USV Survey' },
                    { color: '#fbbf24', label: 'Tow Fish — Side-Scan Sonar' },
                    { color: '#f97316', label: 'Mine Contact — Detected' },
                    { color: '#ef4444', label: 'Confirmed Mine — HORUS Queued' },
                    { color: '#0d9488', label: 'Side-Scan Swath Coverage' },
                    { color: '#94a3b8', label: 'Odessa MOC' },
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
                  GP-USV Sea Jeep — MCM Config (FLS + Towed Side-Scan)
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
        <div className="p-4 border-t border-gray-700/50 grid grid-cols-1 md:grid-cols-2 gap-3">
          {effectiveRoster.map((vessel, idx) => (
            <div key={`${vessel.roleKey || vessel.name}-${vessel.hullName}`} className="flex border border-gray-700/50 rounded-lg overflow-hidden bg-gray-900/40">
              <div className="w-32 flex-shrink-0 bg-gray-950/60 flex items-center justify-center p-2">
                <img src={vessel.image} alt={vessel.name} className="w-full h-full object-contain max-h-24" />
              </div>
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
                {vessel.capabilities.slice(0, 4).map((cap, i) => (
                  <div key={i} className="border border-gray-700/50 rounded px-2 py-0.5 text-[0.62rem] text-gray-400 bg-gray-800/30">
                    {cap}
                  </div>
                ))}
                {vessel.capabilities.length > 4 && (
                  <div className="text-[0.6rem] text-gray-600 px-1">
                    +{vessel.capabilities.length - 4} more
                  </div>
                )}
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

        {/* ── Mission Description ── */}
        <div className="px-4 pb-5 border-t border-gray-700/50">
          <div className="mt-3 px-4 py-3 rounded-xl bg-gray-800/60 border border-gray-700/40">
            <div className="text-[0.65rem] font-bold text-amber-400 uppercase tracking-widest mb-1.5">Mission Brief</div>
            <p className="text-[0.75rem] text-gray-300 leading-relaxed">
              Russia mined the Odessa shipping approaches in 2022. The mines are still there. The Sea Jeep tows a side-scan sonar fish through the proposed grain corridor and uses forward-look sonar to stop automatically if anything is directly ahead. Each contact gets GPS-logged and handed off to clearance teams. This mission maps the threat but does not neutralize it. That job goes to a different platform.
            </p>
          </div>
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

export default SeaJeepMCMMissionView;
