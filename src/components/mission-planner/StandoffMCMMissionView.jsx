import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import {
  MapContainer, TileLayer, Polygon, CircleMarker, Polyline, Tooltip, ZoomControl, useMap
} from 'react-leaflet';
import { Play, Pause, RotateCcw, Target, ChevronLeft, Settings, ArrowLeftRight, Sparkles } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import useMissionStore from '../../store/missionStore';
import useOutfitterStore from '../../store/outfitterStore';
import useConfigurationStore from '../../store/configurationStore';
import useNavigationStore from '../../store/navigationStore';
import { vesselHullData } from '../../data/vesselData';
import { MISSION_ROLES } from '../../data/missionRoles';
import SwapVesselModal from './SwapVesselModal';
import NTDSMarker from './NTDSMarker';
import ReadinessChecklist from './ReadinessChecklist';
import MissionAdvisorChat from '../shared/MissionAdvisorChat';
import { buildMissionContext } from '../../utils/advisorContext';
import { getMissionReadiness } from '../../utils/missionReadiness';
import { HULL_IMAGES } from '../../utils/hullImages';
import { ORCHESTRATION_LAYER, SUCCESS_CRITERIA } from './autonomySeriesShared';

const MISSION_SET_KEY = 'STANDOFF_MCM';

// ─── Geography — Strait of Hormuz ─────────────────────────────────────────────
// Mines laid across the traffic separation scheme between Musandam and the
// Iranian islands; the LCS holds in the Gulf of Oman, outside the field.
// Single fixed frame — the whole scenario (LCS, minefield, lane) fits at this
// zoom, so the camera never moves during the run. No flyTo, no zoom changes.
const MAP_CENTER  = [26.58, 56.62];
const MAP_ZOOM    = 9;

const LCS_POS    = [26.18, 57.00];  // command node in the Gulf of Oman — outside the minefield boundary. This matters.
const MINEFIELD  = [[26.42, 56.32], [26.80, 56.32], [26.80, 56.88], [26.42, 56.88]];
const LANE_START = [26.48, 56.78];
const LANE_END   = [26.74, 56.42];
const MINE_POSITIONS = [
  [26.53, 56.71], [26.58, 56.64], [26.64, 56.56], [26.69, 56.49],
];
// All four contacts classify as confirmed mines and each takes a Barracuda.
// Set to a valid index to make one mine a sensitive/UISS-sweep contact instead;
// -1 means none.
const SENSITIVE_MINE = -1;

// ─── Mission Advisor (plan §5.4) — keep this block identical across the five
// Autonomy Mission Series views except for the questions and accent color ────
const ADVISOR_QUESTIONS = [
  'Why does the LCS stay outside the minefield?',
  'What does the AN/AQS-20C do here?',
  'How are the mines neutralized without a diver in the water?',
];

// ─── Tick milestones ──────────────────────────────────────────────────────────
const T_STANDOFF   =  8;   // lane corridor drawn
const T_HUNT       = 20;   // MCM USV enters the field along the lane
const T_CLASSIFY   = 40;   // Knifefish descends beneath each contact
const T_SWEEP      = 56;   // clearance pass begins — mines clear as the USV passes
const T_NEUTRALIZE = 74;   // clearance pass complete — lane verification
const T_COMPLETE   = 92;   // lane renders CLEARED
const TOTAL_TICKS  = 92;

const CLEAR_DURATION = 5;  // ticks a mine spends visibly detonating/neutralizing

const TICK_MS = 280;

// ─── Roster — order matches MISSION_ROLES[STANDOFF_MCM].roles ────────────────
// Barracuda neutralizers launch from the MCM USV — no separate neutralizer UUV.
const VESSEL_ROSTER = [
  { name: 'LCS Command Node', roleDescriptor: '(Command Node)', image: HULL_IMAGES['Freedom-class LCS'], hullName: 'Freedom-class LCS', roleKey: 'SMCM_LCS', capabilities: ['TempestOS Core Platform', 'Link 16 Track Broadcast', 'MILSATCOM Terminal', 'HiveLink SDR', 'FMD AutoHook', 'NSYTE AI Maintenance System'] },
  { name: 'MCM USV', roleDescriptor: '(Hunter / Neutralizer)', image: HULL_IMAGES['MCM USV'], hullName: 'MCM USV', roleKey: 'SMCM_HUNTER', capabilities: ['AN/AQS-20C Towed Minehunting Sonar', 'Unmanned Influence Sweep System (UISS)', 'Barracuda Mine Neutralizer', 'AN/DVS-1 COBRA Coastal Recon', 'HiveLink SDR', 'SeaFIND Inertial Navigation', 'Marine AI Guardian Vision CVP'] },
  { name: 'Knifefish', roleDescriptor: '(Classifier)', image: HULL_IMAGES['Knifefish'], hullName: 'Knifefish', roleKey: 'SMCM_CLASSIFIER', capabilities: ['Knifefish LFBB Mine ID Sonar', 'EvoLogics Acoustic Modem', 'SeaFIND Inertial Navigation'] },
];

// ─── Phase narratives ─────────────────────────────────────────────────────────
const PHASE_NARRATIVE = {
  idle:         null,
  standoff:     { title: 'LCS On Station — Outside the Field', body: 'The Freedom-class LCS holds station outside the minefield boundary with no crew at risk. TempestOS is up, and the lane to be opened is laid across the suspected field. Every hull that enters the field from here is unmanned.' },
  hunting:      { title: 'Hunt at Standoff', body: 'The MCM USV enters the field towing the AN/AQS-20C minehunting sonar. Contacts log as unknowns behind the swath — hunted from the surface, cued from standoff, with the mothership still outside the boundary.' },
  classifying:  { title: 'Classify Below', body: 'Knifefish works beneath each contact with low-frequency broadband sonar, identifying mines buried or moored — the classification step that turns a sonar contact into a confirmed target. Sea acceptance testing completed June 2026.' },
  sweeping:     { title: 'The Clearance Pass', body: 'The MCM USV comes back up the lane and clears each mine as it passes: a Barracuda one-shot neutralizer launches on every confirmed mine, with the UISS influence sweep held in reserve for sensitive contacts. The field clears behind the boat, 4 down to 1.' },
  neutralizing: { title: 'Lane Verified — No Diver in the Water', body: 'Every mine is cleared and the USV holds at the lane entrance while the picture is verified. The legacy alternative puts an EOD diver on each of these datums; here the water stayed empty of people the entire time.' },
  complete:     { title: 'Lane Opened — Nobody Entered the Field', body: 'The cleared lane is open. Hunt, classify, sweep, and neutralize ran as one tasked chain under TempestOS rather than four systems with four operator workflows. Crewed hulls in the field: 0. Divers in the water: 0.' },
};

const EVENT_COLORS = {
  warn:    'text-amber-400',
  alert:   'text-red-400',
  info:    'text-cyan-400',
  success: 'text-emerald-400',
};

const TILE_BASE    = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_SEAMARK = 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

const getPhase = (tick) => {
  if (tick < T_STANDOFF)   return 'idle';
  if (tick < T_HUNT)       return 'standoff';
  if (tick < T_CLASSIFY)   return 'hunting';
  if (tick < T_SWEEP)      return 'classifying';
  if (tick < T_NEUTRALIZE) return 'sweeping';
  if (tick < T_COMPLETE)   return 'neutralizing';
  return 'complete';
};

// MCM USV: launches FROM the mothership, transits to the lane entrance during
// the standoff phase, hunts down the lane, sweeps back up it, holds at the lane
// entrance to launch its Barracudas, then exits home
const T_EXIT = T_COMPLETE - 6;
const getHunterPos = (tick) => {
  if (tick < T_STANDOFF) return LCS_POS;   // aboard / alongside the mothership
  if (tick < T_HUNT) return lerp2(LCS_POS, LANE_START, (tick - T_STANDOFF) / (T_HUNT - T_STANDOFF));
  if (tick < T_CLASSIFY) return lerp2(LANE_START, LANE_END, (tick - T_HUNT) / (T_CLASSIFY - T_HUNT));
  if (tick < T_SWEEP) return LANE_END;
  if (tick < T_NEUTRALIZE) return lerp2(LANE_END, LANE_START, (tick - T_SWEEP) / (T_NEUTRALIZE - T_SWEEP));
  if (tick < T_EXIT) return LANE_START;   // firing position — Barracudas away from here
  if (tick < T_COMPLETE) return lerp2(LANE_START, LCS_POS, (tick - T_EXIT) / (T_COMPLETE - T_EXIT));
  return LCS_POS;
};

// Knifefish: launches from the LCS mission bay, transits into the field, works
// mine to mine during classification, then swims home — no teleporting
const getClassifierPos = (tick) => {
  const launch = T_HUNT + 6;
  if (tick < launch) return null;                       // still in the mission bay
  if (tick < T_CLASSIFY) {
    return lerp2(LCS_POS, MINE_POSITIONS[0], (tick - launch) / (T_CLASSIFY - launch));
  }
  if (tick < T_SWEEP) {
    const seg = (tick - T_CLASSIFY) / (T_SWEEP - T_CLASSIFY) * (MINE_POSITIONS.length - 1);
    const i = Math.min(Math.floor(seg), MINE_POSITIONS.length - 2);
    return lerp2(MINE_POSITIONS[i], MINE_POSITIONS[i + 1], seg - i);
  }
  if (tick < T_COMPLETE) {
    // Different route home: swing south out of the field and approach the LCS
    // from below, instead of retracing the inbound leg
    const RETURN_ROUTE = [
      MINE_POSITIONS[MINE_POSITIONS.length - 1],
      [26.46, 56.82],   // drop south inside the field
      [26.25, 56.88],   // exit the southern boundary, well clear of the lane
      LCS_POS,
    ];
    const t = (tick - T_SWEEP) / (T_COMPLETE - T_SWEEP);
    const seg = t * (RETURN_ROUTE.length - 1);
    const i = Math.min(Math.floor(seg), RETURN_ROUTE.length - 2);
    return lerp2(RETURN_ROUTE[i], RETURN_ROUTE[i + 1], seg - i);
  }
  return null;                                          // recovered
};

// When the returning USV passes mine `idx` on its sweep-back leg (LANE_END →
// LANE_START). Mines sit at lane fractions (idx+1)/5, so the pass order — and
// therefore the clearing order — is 4, 3, 2, 1.
const getPassAt = (idx) =>
  T_SWEEP + Math.round((1 - (idx + 1) / (MINE_POSITIONS.length + 1)) * (T_NEUTRALIZE - T_SWEEP));

// Per-mine state machine, derived from the tick
// 'hidden' → 'unknown' (swath passes) → 'confirmed' | 'sensitive' → 'cleared'
// Each mine clears AS THE USV PASSES IT on the return leg: a Barracuda takes
// each confirmed one (UISS handles a sensitive contact if one is designated).
// `since` records when the current state began, so labels can fade after ~2 s.
const getMineState = (idx, tick) => {
  const revealAt   = T_HUNT + 3 + idx * 4;
  const classifyAt = T_CLASSIFY + 2 + idx * 3;
  const passAt     = getPassAt(idx);
  if (tick < revealAt) return { state: 'hidden', since: 0 };
  if (tick < classifyAt) return { state: 'unknown', since: revealAt };
  if (tick < passAt) return { state: idx === SENSITIVE_MINE ? 'sensitive' : 'confirmed', since: classifyAt };
  // Neutralization takes visible time — the mine detonates over CLEAR_DURATION
  // ticks rather than blinking out the instant the boat passes
  if (tick < passAt + CLEAR_DURATION) return { state: 'clearing', since: passAt };
  return { state: 'cleared', since: passAt + CLEAR_DURATION };
};

// A label stays on screen for ~2 s (7 ticks) after its state changes, then
// collapses back to hover-only so the map doesn't drown in tags
const LABEL_LINGER = 7;

const MINE_STYLE = {
  unknown:   { color: '#facc15', fill: '#a16207', label: '? Unknown Contact' },
  sensitive: { color: '#fb923c', fill: '#9a3412', label: '⚠ Sensitive — Sweep' },
  confirmed: { color: '#ef4444', fill: '#7f1d1d', label: '● Mine Confirmed' },
  clearing:  { color: '#fbbf24', fill: '#78350f', label: '✸ Neutralizing…' },
  cleared:   { color: '#4ade80', fill: '#14532d', label: '✓ Cleared' },
};

const getPhaseBadge = (phase) => {
  const m = {
    standoff:     { cls: 'bg-orange-900/80 text-orange-300 border-orange-500/40',                 label: '● LCS Outside the Field' },
    hunting:      { cls: 'bg-orange-900/80 text-orange-200 border-orange-400/40 animate-pulse',   label: '⌖ Hunting · AN/AQS-20C' },
    classifying:  { cls: 'bg-amber-900/80 text-amber-300 border-amber-500/40 animate-pulse',      label: '◎ Knifefish Classifying' },
    sweeping:     { cls: 'bg-red-900/80 text-red-300 border-red-500/40 animate-pulse',            label: '✸ Clearance Pass · Mines Clearing 4 → 1' },
    neutralizing: { cls: 'bg-orange-900/80 text-orange-300 border-orange-500/40',                 label: '☑ Verifying the Cleared Lane' },
    complete:     { cls: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40',              label: '✓ Lane Cleared · No Diver in the Water' },
  };
  return m[phase] || null;
};

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
const StandoffMCMMissionView = ({ mission, onBack }) => {
  const { saveMission, updateMission } = useMissionStore();
  const { setSelectedHull } = useOutfitterStore();
  const { startNewConfiguration, setPendingMissionSetKey, setPendingMissionSetCaps, setPendingRoleKey, setPendingVesselLabel, activeConfig } = useConfigurationStore();
  const { setSelectedView } = useNavigationStore();
  const roleAssignments = useMissionStore(s => s.roleAssignments);
  const savedConfigurations = useConfigurationStore(s => s.savedConfigurations);
  const [swapModal, setSwapModal] = useState(null);
  const [showAdvisor, setShowAdvisor] = useState(false);
  const advisorContext = useMemo(() => buildMissionContext(MISSION_SET_KEY), []);

  const missionRoleDefs = MISSION_ROLES[MISSION_SET_KEY]?.roles ?? [];
  const effectiveRoster = VESSEL_ROSTER.map((vessel, idx) => {
    const roleDef = missionRoleDefs[idx];
    if (!roleDef) return vessel;
    const assignment = roleAssignments?.[MISSION_SET_KEY]?.[roleDef.roleKey];
    if (!assignment) return { ...vessel, name: vessel.roleDescriptor ? `${vessel.hullName} ${vessel.roleDescriptor}` : vessel.name };
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

  const [showLog, setShowLog] = useState(false);
  const [missionName, setMissionName] = useState(mission?.name || '');
  const [currentTick,  setCurrentTick]  = useState(0);
  const [pulse,        setPulse]        = useState(false);
  const [events,       setEvents]       = useState([]);
  const [running,      setRunning]      = useState(false);
  const [paused,       setPaused]       = useState(false);
  const [complete,     setComplete]     = useState(false);

  const tickRef    = useRef(0);
  const tickCallbackRef = useRef(null);
  const mainTimer  = useRef(null);
  const pulseTimer = useRef(null);
  const resetTimer = useRef(null);
  const addEvtRef  = useRef(null);
  const vesselLabelsRef = useRef([]);
  const runScenRef = useRef(null);

  const phase     = getPhase(currentTick);
  const hunterPos = getHunterPos(currentTick);

  const showHunter   = currentTick >= T_STANDOFF && currentTick < T_COMPLETE;
  const sweeping     = phase === 'sweeping';
  const classifying  = phase === 'classifying';
  const classifierWorking = classifying;   // on-station beneath the contacts
  const neutralizing = phase === 'neutralizing';
  const laneCleared  = currentTick >= T_COMPLETE;
  const mineStates   = MINE_POSITIONS.map((_, i) => getMineState(i, currentTick));

  const narrative = PHASE_NARRATIVE[phase] || null;
  const badge     = getPhaseBadge(phase);

  const _addEvent = (msg, type = 'info') => {
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setEvents(prev => [{ ts, msg, type, id: `${ts}-${msg.slice(0, 10)}` }, ...prev].slice(0, 30));
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

  useEffect(() => {
    clearInterval(pulseTimer.current);
    if (phase === 'hunting' || phase === 'sweeping' || phase === 'neutralizing') {
      pulseTimer.current = setInterval(() => setPulse(p => !p), 350);
      return () => clearInterval(pulseTimer.current);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset of timer-driven pulse state when the animated phase is exited; cannot be derived during render
    setPulse(false);
  }, [phase]);

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
      const v0 = vesselLabelsRef.current[0] ?? 'LCS Command Node';
      const v1 = vesselLabelsRef.current[1] ?? 'MCM USV';
      const v2 = vesselLabelsRef.current[2] ?? 'Knifefish';
      setCurrentTick(tick);

      if (tick === T_STANDOFF) {
        addEvtRef.current(`${v0}: On station outside the minefield — TempestOS sequencing the chain`, 'info');
        addEvtRef.current(`${v1}: Launched from the mothership — transiting to the lane entrance`, 'info');
        addEvtRef.current('Lane Alpha corridor laid across the suspected field', 'info');
      }
      if (tick === T_HUNT) {
        addEvtRef.current(`${v1}: Entering the field — AN/AQS-20C streaming at standoff`, 'info');
        addEvtRef.current('No crewed hull inside the boundary', 'success');
      }
      if (tick === T_HUNT + 7) {
        addEvtRef.current(`${v1}: Sonar contacts logged — cueing classification`, 'warn');
      }
      if (tick === T_CLASSIFY) {
        addEvtRef.current(`${v2}: Descending on each contact — LFBB sonar, buried or moored`, 'info');
      }
      if (tick === T_CLASSIFY + 8) {
        addEvtRef.current('Contacts resolving: mines confirmed on the lane', 'alert');
      }
      if (tick === T_SWEEP) {
        addEvtRef.current(`${v1}: Clearance pass — neutralizing each mine as it passes, 4 down to 1`, 'info');
      }
      if (tick === T_SWEEP + 4) {
        addEvtRef.current(`${v1}: Barracuda away — MINE 4 neutralizing`, 'alert');
      }
      if (tick === T_SWEEP + 11) {
        addEvtRef.current(`${v1}: Barracuda away — MINE 2 neutralizing`, 'alert');
      }
      if (tick === T_NEUTRALIZE) {
        addEvtRef.current('All mines cleared — 4 for 4 — verifying the lane', 'success');
      }
      if (tick === T_COMPLETE) {
        addEvtRef.current('Lane Alpha CLEARED — crewed hulls in the field: 0 · divers in the water: 0', 'success');
        addEvtRef.current('Detect-to-neutralize ran as one tasked chain under TempestOS', 'success');
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
      template: 'STANDOFF_MCM',
      domain: 'MARITIME',
      status: 'draft',
      duration: '14d',
      zoneConfig: {
        name: 'Strait of Hormuz — Suspected Minefield and Cleared Lane Alpha',
        coordinates: [
          { lat: 26.38, lng: 56.25 }, { lat: 26.85, lng: 56.25 },
          { lat: 26.85, lng: 56.95 }, { lat: 26.38, lng: 56.95 },
        ],
        swarmSize: 4,
        swarmFormation: 'standoff-lane-clearance',
      },
      assignedSquadrons: ['sqdn_034'],
      stateHierarchies: {
        default:      ['Payload', 'Navigation', 'Comms', 'Mission', 'Vehicle'],
        hunt:         ['Payload', 'Mission', 'Navigation', 'Comms', 'Vehicle'],
        classify:     ['Payload', 'Mission', 'Comms', 'Navigation', 'Vehicle'],
        neutralize:   ['Mission', 'Payload', 'Comms', 'Navigation', 'Vehicle'],
        lane_transit: ['Navigation', 'Vehicle', 'Payload', 'Mission', 'Comms'],
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

  // Knifefish classifier: full launch → transit → classify → recover track
  const classifierPos = getClassifierPos(currentTick);

  // Barracuda run lines: launched FROM THE MCM USV at each confirmed mine in the
  // seconds before the boat passes it on the sweep-back leg
  const barracudaRuns = MINE_POSITIONS
    .map((pos, i) => ({ pos, i, passAt: getPassAt(i) }))
    .filter(({ i, passAt }) => i !== SENSITIVE_MINE && currentTick >= passAt - 3 && currentTick < passAt)
    .map(({ pos }) => [hunterPos, pos]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col bg-darkest">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-x border-t border-b border-gray-700/50 flex-shrink-0 overflow-x-auto">
        <button onClick={onBack} className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-[0.75rem]">
          <ChevronLeft size={13} /> Back to Library
        </button>
        <div className="w-px h-4 bg-gray-700/60" />
        <Target size={13} className="text-orange-400" />
        <span className="text-orange-400 text-[0.8rem] font-semibold tracking-wide">Standoff MCM — Mission 04</span>
        <span className="hidden md:inline text-gray-600 text-[0.7rem]">·</span>
        <span className="hidden md:inline text-gray-500 text-[0.68rem]">Hunt · Classify · Sweep · Neutralize — Open the Water Without a Diver in It</span>
        <div className="flex-1" />
        <button
          onClick={() => setShowAdvisor(v => !v)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[0.7rem] font-semibold transition-colors flex-shrink-0 ${showAdvisor ? 'border-orange-500/60 bg-orange-900/40 text-orange-300' : 'border-orange-500/30 text-orange-400 hover:bg-orange-900/30'}`}
          title="Ask the Mission Advisor"
        >
          <Sparkles size={12} />
          <span className="hidden sm:inline">Ask the Advisor</span>
        </button>
        <span className="px-2 py-0.5 rounded-full bg-orange-900/50 text-orange-400 text-[0.65rem] font-bold uppercase tracking-wider border border-orange-500/30">DRAFT</span>
        <input
          value={missionName}
          onChange={e => setMissionName(e.target.value)}
          placeholder="Mission name…"
          className="hidden md:block bg-gray-800/60 border border-gray-700/60 rounded-md px-3 py-1.5 text-white text-[0.78rem] w-52 placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors"
        />
        <button
          onClick={handleSave}
          disabled={!missionName.trim() || !isDeployable}
          className={`hidden md:block px-3 py-1.5 rounded-md text-[0.78rem] font-semibold transition-colors ${missionName.trim() && isDeployable ? 'bg-orange-600 hover:bg-orange-500 text-white' : 'bg-gray-700/50 text-gray-600 cursor-not-allowed'}`}
        >
          Save Draft
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div>

        {/* ── Animation row ── */}
        <div className="flex h-[40vh] md:h-[460px] border-x border-b border-gray-700/50">

          {/* ── Map ── */}
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
              <TileLayer url={TILE_SEAMARK} opacity={0.4} />
              <MapInvalidateSize />

              {/* ── Suspected minefield ── */}
              <Polygon
                positions={MINEFIELD}
                pathOptions={{ color: '#fb923c', weight: 2, dashArray: '6 8', fillColor: '#fb923c', fillOpacity: 0.08 }}
              >
                <Tooltip direction="top" sticky>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#fb923c' }}>Suspected Minefield</span>
                </Tooltip>
              </Polygon>

              {/* ── Lane corridor ── */}
              {currentTick >= T_STANDOFF && (
                <Polyline
                  positions={[LANE_START, LANE_END]}
                  pathOptions={laneCleared
                    ? { color: '#4ade80', weight: 6, opacity: 0.85 }
                    : { color: '#fdba74', weight: 3, opacity: 0.5, dashArray: '8 10' }}
                >
                  <Tooltip direction="top" sticky>
                    <span style={{ fontSize: 10, fontWeight: 700, color: laneCleared ? '#4ade80' : '#fdba74' }}>
                      {laneCleared ? 'Lane Alpha — CLEARED' : 'Lane Alpha — to be opened'}
                    </span>
                  </Tooltip>
                </Polyline>
              )}

              {/* ── UISS sweep trail behind the hunter ── */}
              {sweeping && (
                <Polyline
                  positions={[LANE_END, hunterPos]}
                  pathOptions={{ color: '#fbbf24', weight: 5, opacity: pulse ? 0.7 : 0.35, dashArray: '2 6' }}
                />
              )}

              {/* ── Barracuda run lines ── */}
              {barracudaRuns.map((run, i) => (
                <Polyline
                  key={`barracuda-${i}`}
                  positions={run}
                  pathOptions={{ color: '#ef4444', weight: 1.5, opacity: 0.7, dashArray: '4 5' }}
                />
              ))}

              {/* ── Mines ── */}
              {MINE_POSITIONS.map((pos, i) => {
                const { state: st, since } = mineStates[i];
                if (st === 'hidden') return null;
                const s = MINE_STYLE[st];
                // Label shows for ~2 s after each state change, then hover-only.
                // The key forces the Tooltip to remount when permanence flips —
                // Leaflet binds `permanent` at creation time.
                const fresh = currentTick - since < LABEL_LINGER;
                return (
                  <CircleMarker
                    key={`mine-${i}-${st}-${fresh}`}
                    center={pos}
                    radius={st === 'clearing' ? (pulse ? 12 : 9) : st === 'cleared' ? 6 : 8}
                    pathOptions={{ color: s.color, fillColor: s.fill, fillOpacity: 0.9, weight: st === 'clearing' ? 3 : 2 }}
                  >
                    <Tooltip direction="top" offset={[0, -8]} permanent={fresh}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: s.color }}>{`MINE ${i + 1} · ${s.label}`}</span>
                    </Tooltip>
                  </CircleMarker>
                );
              })}

              {/* ── Knifefish classifier ── */}
              {classifierPos && (
                <NTDSMarker
                  position={classifierPos}
                  domain="sub"
                  affiliation="friend"
                  color="#4ade80"
                  size={14}
                  weight={2}
                  dashed
                  label={effectiveRoster[2]?.hullName ?? 'Knifefish'}
                >
                  <Tooltip direction="bottom" offset={[0, 8]}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#4ade80' }}>{`${effectiveRoster[2]?.hullName ?? 'Knifefish'} — ${classifierWorking ? 'classifying below' : currentTick < T_CLASSIFY ? 'transiting from LCS mission bay' : 'RTB — recovering to LCS'}`}</span>
                  </Tooltip>
                </NTDSMarker>
              )}

              {/* ── MCM USV hunter with sonar swath ── */}
              {showHunter && (
                <>
                  <CircleMarker
                    center={hunterPos}
                    radius={pulse && (phase === 'hunting' || sweeping) ? 24 : 20}
                    pathOptions={{ color: '#fdba74', fill: false, weight: 1, opacity: 0.35 }}
                  />
                  <NTDSMarker
                    position={hunterPos}
                    domain="surface"
                    affiliation="friend"
                    color="#fb923c"
                    fill="#9a3412"
                    fillOpacity={0.95}
                    size={20}
                    weight={2}
                    label={effectiveRoster[1]?.hullName ?? 'MCM USV'}
                  >
                    <Tooltip direction="top" offset={[0, -8]}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#fb923c' }}>{`${effectiveRoster[1]?.hullName ?? 'MCM USV'} — ${currentTick < T_HUNT ? 'launched from mothership, transiting' : sweeping ? 'clearance pass' : neutralizing ? 'Barracuda firing position' : 'AN/AQS-20C tow'}`}</span>
                    </Tooltip>
                  </NTDSMarker>
                </>
              )}

              {/* ── LCS command node — outside the field, never moves ── */}
              <NTDSMarker
                position={LCS_POS}
                affiliation="ownship"
                color="#fb923c"
                fill="#7c2d12"
                fillOpacity={0.95}
                size={28}
                weight={3}
                label="LCS"
              >
                <Tooltip direction="top" offset={[0, -10]} permanent={currentTick >= T_STANDOFF}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#fdba74' }}>LCS — No Crew at Risk</span>
                </Tooltip>
              </NTDSMarker>

            </MapContainer>

            {/* ── The whole mission in two numbers — on screen from tick 0 ── */}
            <div className="absolute top-3 right-14 z-[500] pointer-events-none px-3 py-2 rounded-xl bg-gray-950/85 border border-orange-500/30 backdrop-blur-sm">
              <div className="text-[0.6rem] uppercase tracking-widest text-orange-400/80 font-bold mb-0.5">Inside the Minefield</div>
              <div className="text-[0.72rem] text-gray-200 tabular-nums">Crewed hulls: <span className="font-bold text-emerald-400">0</span></div>
              <div className="text-[0.72rem] text-gray-200 tabular-nums">Divers in the water: <span className="font-bold text-emerald-400">0</span></div>
            </div>

            {/* ── Phase badge ── */}
            {badge && (
              <div className={`absolute top-3 left-3 z-[500] px-3 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wider pointer-events-none border ${badge.cls}`}>
                {badge.label}
              </div>
            )}

            {/* ── Legend ── */}
            {currentTick >= T_STANDOFF && (
              <div className="hidden md:block absolute bottom-3 left-3 z-[500] pointer-events-none px-3 py-2 rounded-xl bg-gray-950/80 border border-gray-700/50 backdrop-blur-sm">
                <div className="flex flex-col gap-1">
                  {[
                    { color: '#fb923c', label: `${effectiveRoster[0]?.name ?? 'LCS'} — Outside the Field` },
                    { color: '#fdba74', label: `${effectiveRoster[1]?.name ?? 'MCM USV'} — Hunter / Sweep` },
                    { color: '#4ade80', label: `${effectiveRoster[2]?.name ?? 'Knifefish'} — Classifier` },
                    { color: '#ef4444', label: 'Barracuda — launched from the USV' },
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
            <div className="p-4 border-b border-gray-700/50 overflow-y-auto min-h-0">
              <p className="text-gray-500 text-[0.65rem] uppercase tracking-widest mb-3">Scenario</p>
              <div className="flex gap-2 mb-3">
                {running ? (
                  <button
                    onClick={pause}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[0.78rem] font-semibold transition-colors bg-orange-700 hover:bg-orange-600 text-white"
                  >
                    <Pause size={13} />
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={paused ? resume : runScenario}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[0.78rem] font-semibold transition-colors bg-orange-700 hover:bg-orange-600 text-white"
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
                  <div className="text-[0.68rem] font-bold text-orange-300 uppercase tracking-wider mb-1">
                    {narrative.title}
                  </div>
                  <div className="text-[0.67rem] text-gray-400 leading-relaxed">
                    {narrative.body}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-[0.68rem]">
                  1× LCS · MCM USV · Knifefish
                </p>
              )}

              {/* Shared series panels — the deck's ASK and orchestration slides (plan §8.3) */}
              <div className="mt-3 rounded-lg bg-gray-800/30 border border-gray-700/40 px-3 py-2.5">
                <div className="text-[0.62rem] font-bold text-gray-400 uppercase tracking-wider mb-1">How This Mission Is Judged</div>
                {SUCCESS_CRITERIA[MISSION_SET_KEY].map(c => (
                  <div key={c} className="text-[0.65rem] text-gray-500 leading-relaxed">· {c}</div>
                ))}
                <div className="text-[0.62rem] font-bold text-gray-400 uppercase tracking-wider mt-2 mb-1">{ORCHESTRATION_LAYER.title}</div>
                {ORCHESTRATION_LAYER.points.map(p => (
                  <div key={p} className="text-[0.65rem] text-gray-500 leading-relaxed">· {p}</div>
                ))}
              </div>
            </div>

            {/* Event log */}
            <div className="flex flex-col overflow-hidden" style={{ flex: '1 1 0', minHeight: 110 }}>
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
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-orange-700 hover:bg-orange-600 text-white text-sm font-semibold transition-colors"
            >
              <Pause size={15} />
              Pause
            </button>
          ) : (
            <button
              onClick={paused ? resume : runScenario}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-orange-700 hover:bg-orange-600 text-white text-sm font-semibold transition-colors"
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
                    className="ml-auto p-1 rounded text-gray-400 hover:text-orange-400 hover:bg-gray-700/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
                {vessel.capabilities.filter(cap => cap !== 'TempestOS Core Platform').map((cap, i) => (
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

      {showAdvisor && (
        <MissionAdvisorChat
          contextText={advisorContext}
          title="Mission Advisor — Standoff MCM"
          accentColor="orange"
          suggestedQuestions={ADVISOR_QUESTIONS}
          onClose={() => setShowAdvisor(false)}
        />
      )}

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

export default StandoffMCMMissionView;
