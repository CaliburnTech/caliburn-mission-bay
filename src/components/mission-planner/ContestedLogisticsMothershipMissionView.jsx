import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import {
  MapContainer, TileLayer, Circle, CircleMarker, Polyline, Tooltip, ZoomControl, useMap
} from 'react-leaflet';
import { Play, Pause, RotateCcw, Ship, ChevronLeft, Settings, ArrowLeftRight, Sparkles } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import useMissionStore from '../../store/missionStore';
import useOutfitterStore from '../../store/outfitterStore';
import useConfigurationStore from '../../store/configurationStore';
import useNavigationStore from '../../store/navigationStore';
import { vesselHullData } from '../../data/vesselData';
import { MISSION_ROLES } from '../../data/missionRoles';
import SwapVesselModal from './SwapVesselModal';
import MissionAdvisorChat from '../shared/MissionAdvisorChat';
import { buildMissionContext } from '../../utils/advisorContext';
import ReadinessChecklist from './ReadinessChecklist';
import { getMissionReadiness } from '../../utils/missionReadiness';
import { HULL_IMAGES } from '../../utils/hullImages';
import { ORCHESTRATION_LAYER, SUCCESS_CRITERIA } from './autonomySeriesShared';

const MISSION_SET_KEY = 'CONTESTED_LOGISTICS_MOTHERSHIP';

// ─── Mission Advisor (plan §5.4) — keep this block identical across the five
// Autonomy Mission Series views except for the questions and accent color ────
const ADVISOR_QUESTIONS = [
  'What role does the mothership play here?',
  'How is this mission judged?',
  'What happens when comms are denied?',
];

// ─── Geography — Luzon Strait sustainment network ─────────────────────────────
const NM_TO_M = 1852;

// Single fixed frame — the camera never moves or zooms during the run.
const MAP_CENTER  = [20.80, 123.30];
const MAP_ZOOM    = 7;

const LCS_NODE     = [20.55, 125.10];  // rear logistics node, east of the WEZ on the Guam side. Never moves.
const ROS_POS      = [20.10, 121.10];  // Remote Operating Site
const COMBATANT    = [21.30, 122.60];  // combatant on station, forward edge
// The magazine hull comes alongside the combatant's other quarter — offset so the
// fuel and magazine hulls don't stack on one pixel during the transfer. M48s are
// never resupply destinations: they're the delivery hulls, and an empty one
// transits back to the node itself.
const COMBATANT_ALONGSIDE = [21.22, 122.72];

const WEZ_CENTER    = [24.00, 117.00];  // DF-26 threat ring, projected from the Chinese mainland
const WEZ_RADIUS_NM = 450;              // covers the whole forward area; the WEZ boundary IS the line crewed hulls cannot cross — only the LCS node sits outside it

// ─── Tick milestones ──────────────────────────────────────────────────────────
// Kept tight throughout — the static stretches (loading, alongside, verification)
// are trimmed so the demo never sits still for long.
const T_DEMAND   = 6;    // combatant pulses amber — FUEL 22% / CELLS 1 of 4
const T_LOAD     = 14;   // cargo modules visibly attach at the LCS node
const T_TRANSIT  = 24;   // hulls cross the WEZ boundary
const T_DENIED   = 44;   // link drops on the fuel hull — it keeps going
const T_TRANSFER = 62;   // alongside: combatant (fuel + magazine), ROS
const T_RTB      = 80;   // empty hulls return; combatant flips green
const T_COMPLETE = 98;   // all hulls home — no crewed hull entered the WEZ
const TOTAL_TICKS = 98;

const TICK_MS = 360;

// ─── Roster — order matches MISSION_ROLES[CONTESTED_LOGISTICS_MOTHERSHIP].roles ─
const VESSEL_ROSTER = [
  { name: 'LCS Logistics Node', roleDescriptor: '(Logistics Node)', image: HULL_IMAGES['Freedom-class LCS'], hullName: 'Freedom-class LCS', roleKey: 'CLM_LCS', capabilities: ['TempestOS Core Platform', 'MILSATCOM Terminal', 'Link 16 Track Broadcast', 'HiveLink SDR', 'FMD AutoHook', 'NSYTE AI Maintenance System'] },
  { name: 'M48', roleDescriptor: '(Fuel Run)', image: HULL_IMAGES['M48'], hullName: 'M48', roleKey: 'CLM_FUEL', capabilities: ['20-ft TEU Fuel Bladder Module', 'Autonomous Cargo Handling System', 'Maritime Surface/Air Search Radar', 'Teledyne FLIR EO/IR Turret', 'Marine AI Guardian Vision CVP', 'SeaFIND Inertial Navigation', 'HiveLink SDR', 'Nulka Active Missile Decoy'] },
  { name: 'M48', roleDescriptor: '(Cargo Run)', image: HULL_IMAGES['M48'], hullName: 'M48', roleKey: 'CLM_CARGO', capabilities: ['20-ft TEU Dry Cargo Module', 'Autonomous Cargo Handling System', 'Maritime Surface/Air Search Radar', 'Teledyne FLIR EO/IR Turret', 'Marine AI Guardian Vision CVP', 'SeaFIND Inertial Navigation', 'HiveLink SDR', 'Nulka Active Missile Decoy'] },
  { name: 'M48', roleDescriptor: '(Magazine Run)', image: HULL_IMAGES['M48'], hullName: 'M48', roleKey: 'CLM_MAGAZINE', capabilities: ['Mk 70 PDS Reload Module', 'Autonomous Cargo Handling System', 'Maritime Surface/Air Search Radar', 'Teledyne FLIR EO/IR Turret', 'Marine AI Guardian Vision CVP', 'SeaFIND Inertial Navigation', 'HiveLink SDR', 'Nulka Active Missile Decoy'] },
];

// Run definitions: which hull goes where, and what it carries.
// One color for every M48 (blue — friendly force) and one for every receiving
// point (yellow until served, green after) — the distinction that matters is
// boats vs. islands, not which run is which.
const M48_COLOR      = '#60a5fa';  // all three resupply hulls — friendly blue
const DEST_WAITING   = '#eab308';  // friendly receiving point, still waiting
const DEST_SATISFIED = '#4ade80';  // receiving point, got what it wanted
// parkOffset spreads the three hulls well apart around the LCS node while they
// load, so the formation reads as three distinct boats rather than a cluster.
const RUNS = [
  { rosterIdx: 1, dest: COMBATANT,           module: 'FUEL',     destLabel: 'Combatant on Station', cargoOffset: [0.09, -0.09], parkOffset: [0.38, -0.30] },
  { rosterIdx: 2, dest: ROS_POS,             module: 'CARGO',    destLabel: 'ROS',        cargoOffset: [0.11, 0.05],  parkOffset: [-0.05, 0.48] },
  { rosterIdx: 3, dest: COMBATANT_ALONGSIDE, module: 'MAGAZINE', destLabel: 'Combatant on Station', cargoOffset: [-0.02, 0.12], parkOffset: [-0.42, 0.10] },
];
const DENIED_RUN = 0;  // the fuel hull loses link mid-WEZ and keeps going
// When each run's delivery lands (staggered like the departures)
const getDeliveredAt = (i) => T_TRANSFER + i * 6 + 2;

// ─── Phase narratives ─────────────────────────────────────────────────────────
const PHASE_NARRATIVE = {
  idle:         null,
  demand:       { title: 'The Edge Reports Its State', body: 'A combatant on station inside the weapons engagement zone reports fuel at 22% and one cell remaining. Roughly 1,400 nm separate Guam from this fight, and no port inside the WEZ can service it. The demand goes to the rear LCS node.' },
  loading:      { title: 'Assigned by Mission Order', body: 'TempestOS assigns each M48 a run by mission order rather than fixed schedule: a fuel bladder, a dry cargo module, and a Mk 70 reload magazine. The LCS loads them outside the WEZ, on the Guam side.' },
  transiting:   { title: 'Only Unmanned Hulls Enter the WEZ', body: 'Three M48s cross the WEZ boundary under EMCON discipline. The LCS does not move. Every crewed oiler in the theater stays outside the threat ring; the transit risk sits entirely on hulls with nobody aboard.' },
  denied:       { title: 'Link Drops — The Run Completes Anyway', body: 'GPS jamming and comms denial hit the forward leg. The fuel hull holds its last routing order and executes pre-authorized rules to completion, navigating on INS. A run does not need a live link to finish.' },
  transferring: { title: 'The Last Contested Mile', body: 'The fuel hull comes alongside the combatant\'s port quarter while the magazine hull cross-loads a fresh Mk 70 module on the starboard side, and the cargo hull delivers at the ROS. The containers are mature; the autonomous transfer at sea is the gap this mission proves.' },
  returning:    { title: 'Refueled and Rearmed — Without Leaving the Fight', body: 'The combatant reads FUEL 96%, CELLS 4 of 4, and it never left station. Empty hulls transit back through the WEZ toward the node. A hull lost on this leg costs no mariners and carries no strategic signature.' },
  complete:     { title: 'No Crewed Hull Entered the WEZ', body: 'All three M48s are back at the node. The forward fight is sustained, and every human stayed outside the WEZ. Sustainment is decided at the last contested mile, and the last mile is unmanned.' },
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
  if (tick < T_DEMAND)   return 'idle';
  if (tick < T_LOAD)     return 'demand';
  if (tick < T_TRANSIT)  return 'loading';
  if (tick < T_DENIED)   return 'transiting';
  if (tick < T_TRANSFER) return 'denied';
  if (tick < T_RTB)      return 'transferring';
  if (tick < T_COMPLETE) return 'returning';
  return 'complete';
};

// Resupply hull position: parked at the node (staggered), transit out, alongside,
// transit back. `origin` is the hull's parking spot beside the LCS so the three
// hulls don't stack on one pixel during loading. `delay` staggers the departures
// so the runs leave one at a time and the sequence is readable: fuel, then cargo,
// then magazine.
const RUN_STAGGER = 6;
const getRunPos = (origin, dest, tick, delay) => {
  if (tick < T_TRANSIT + delay)  return origin;
  if (tick < T_TRANSFER + delay) return lerp2(origin, dest, (tick - T_TRANSIT - delay) / (T_TRANSFER - T_TRANSIT));
  if (tick < T_RTB)      return dest;
  if (tick < T_COMPLETE) return lerp2(dest, origin, (tick - T_RTB) / (T_COMPLETE - T_RTB));
  return origin;
};

const getParkedPos = (run) => [
  LCS_NODE[0] + run.parkOffset[0],
  LCS_NODE[1] + run.parkOffset[1],
];

const getPhaseBadge = (phase) => {
  const m = {
    demand:       { cls: 'bg-amber-900/80 text-amber-300 border-amber-500/40 animate-pulse',   label: '⚠ Combatant · FUEL 22% · CELLS 1/4' },
    loading:      { cls: 'bg-violet-900/80 text-violet-300 border-violet-500/40',              label: '⬒ Loading · Fuel · Cargo · Magazine' },
    transiting:   { cls: 'bg-violet-900/80 text-violet-200 border-violet-400/40 animate-pulse', label: '➤ Entering the WEZ · Unmanned Only' },
    denied:       { cls: 'bg-red-900/80 text-red-300 border-red-500/40 animate-pulse',         label: '✕ Link Denied' },
    transferring: { cls: 'bg-violet-900/80 text-violet-200 border-violet-400/40 animate-pulse', label: '⇄ Autonomous Transfer' },
    returning:    { cls: 'bg-violet-900/80 text-violet-300 border-violet-500/40',              label: '⟲ RTB · Combatant FUEL 96% · CELLS 4/4' },
    complete:     { cls: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40',           label: '✓ Sustained · No Crewed Hull Entered the WEZ' },
  };
  return m[phase] || null;
};

// Badge behaves as a notification, not a permanent caption: it appears when the
// phase changes and fades once the update is a few seconds old.
const PHASE_STARTS = {
  demand: T_DEMAND, loading: T_LOAD, transiting: T_TRANSIT, denied: T_DENIED,
  transferring: T_TRANSFER, returning: T_RTB, complete: T_COMPLETE,
};
const BADGE_LINGER_TICKS = 12;

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
const ContestedLogisticsMothershipMissionView = ({ mission, onBack }) => {
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

  const phase = getPhase(currentTick);
  const runPositions = RUNS.map((r, i) => getRunPos(getParkedPos(r), r.dest, currentTick, i * RUN_STAGGER));

  const showRuns      = currentTick >= T_LOAD && currentTick < T_COMPLETE;  // visible from loading onward
  const linkDenied    = currentTick >= T_DENIED && currentTick < T_TRANSFER;
  const transferring  = phase === 'transferring';

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
    if (phase === 'demand' || phase === 'denied' || phase === 'transferring') {
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
      const v0 = vesselLabelsRef.current[0] ?? 'LCS Logistics Node';
      const v1 = vesselLabelsRef.current[1] ?? 'M48 (Fuel)';
      const v2 = vesselLabelsRef.current[2] ?? 'M48 (Cargo)';
      const v3 = vesselLabelsRef.current[3] ?? 'M48 (Magazine)';
      setCurrentTick(tick);

      if (tick === T_DEMAND) {
        addEvtRef.current('Combatant on station: FUEL 22% · CELLS 1 of 4 — demand signaled', 'warn');
      }
      if (tick === T_LOAD) {
        addEvtRef.current(`${v0}: TempestOS assigns three runs by mission order`, 'info');
        addEvtRef.current(`${v1}: fuel bladder · ${v2}: dry cargo · ${v3}: Mk 70 reload`, 'info');
      }
      if (tick === T_TRANSIT) {
        addEvtRef.current(`${v1}: FUEL run underway — first into the WEZ`, 'info');
        addEvtRef.current(`${v0}: Holding outside the WEZ. No crewed hull goes forward`, 'success');
      }
      if (tick === T_TRANSIT + 8) {
        addEvtRef.current(`${v2}: CARGO run underway — second into the WEZ`, 'info');
      }
      if (tick === T_TRANSIT + 16) {
        addEvtRef.current(`${v3}: MAGAZINE run underway — third into the WEZ`, 'info');
      }
      if (tick === T_DENIED) {
        addEvtRef.current(`${v1}: LINK DENIED mid-WEZ — holding last routing order, INS-only`, 'alert');
      }
      if (tick === T_TRANSFER) {
        addEvtRef.current(`${v1}: Alongside the combatant — autonomous fuel transfer`, 'info');
        addEvtRef.current(`${v3}: Cross-loading Mk 70 reload module to the combatant`, 'info');
        addEvtRef.current(`${v2}: Delivering dry cargo at the ROS`, 'info');
      }
      if (tick === T_RTB) {
        addEvtRef.current('Combatant: FUEL 96% · CELLS 4 of 4 — never left station', 'success');
        addEvtRef.current('Empty hulls RTB through the WEZ', 'info');
      }
      if (tick === T_COMPLETE) {
        addEvtRef.current('All hulls back at the node — forward fight sustained', 'success');
        addEvtRef.current('Crewed hulls inside the WEZ: 0', 'success');
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
      template: 'CONTESTED_LOGISTICS_MOTHERSHIP',
      domain: 'MARITIME',
      status: 'draft',
      duration: 'continuous',
      zoneConfig: {
        name: 'Luzon Strait — Sustainment Network, Rear Node to Forward Edge',
        waypoints: [
          { lat: 19.60, lng: 120.40, label: 'LCS-REAR-NODE' },
          { lat: 20.10, lng: 121.10, label: 'ROS-BALINTANG' },
          { lat: 20.75, lng: 121.95, label: 'WEZ-ENTRY' },
          { lat: 21.30, lng: 122.60, label: 'COMBATANT-ON-STATION' },
          { lat: 20.95, lng: 122.20, label: 'ADJACENT-M48-CROSSLOAD' },
        ],
      },
      assignedSquadrons: ['sqdn_034', 'sqdn_016'],
      stateHierarchies: {
        default:     ['Navigation', 'Vehicle', 'Comms', 'Mission', 'Payload'],
        wez_transit: ['Navigation', 'Comms', 'Vehicle', 'Mission', 'Payload'],
        gps_denied:  ['Navigation', 'Vehicle', 'Mission', 'Comms', 'Payload'],
        transfer:    ['Payload', 'Mission', 'Navigation', 'Vehicle', 'Comms'],
        rtb:         ['Navigation', 'Vehicle', 'Comms', 'Mission', 'Payload'],
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

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-700/50 flex-shrink-0 overflow-x-auto">
        <button onClick={onBack} className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-[0.75rem]">
          <ChevronLeft size={13} /> Back to Library
        </button>
        <div className="w-px h-4 bg-gray-700/60" />
        <Ship size={13} className="text-violet-400" />
        <span className="text-violet-400 text-[0.8rem] font-semibold tracking-wide">Contested Logistics — Mission 02</span>
        <span className="hidden md:inline text-gray-600 text-[0.7rem]">·</span>
        <span className="hidden md:inline text-gray-500 text-[0.68rem]">Unmanned Hulls Take the Risk Forward · Manned Ships Stay Out of the Threat</span>
        <div className="flex-1" />
        <button
          onClick={() => setShowAdvisor(v => !v)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[0.7rem] font-semibold transition-colors flex-shrink-0 ${showAdvisor ? 'border-violet-500/60 bg-violet-900/40 text-violet-300' : 'border-violet-500/30 text-violet-400 hover:bg-violet-900/30'}`}
          title="Ask the Mission Advisor"
        >
          <Sparkles size={12} />
          <span className="hidden sm:inline">Ask the Advisor</span>
        </button>
        <span className="px-2 py-0.5 rounded-full bg-violet-900/50 text-violet-400 text-[0.65rem] font-bold uppercase tracking-wider border border-violet-500/30">DRAFT</span>
        <input
          value={missionName}
          onChange={e => setMissionName(e.target.value)}
          placeholder="Mission name…"
          className="hidden md:block bg-gray-800/60 border border-gray-700/60 rounded-md px-3 py-1.5 text-white text-[0.78rem] w-52 placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors"
        />
        <button
          onClick={handleSave}
          disabled={!missionName.trim() || !isDeployable}
          className={`hidden md:block px-3 py-1.5 rounded-md text-[0.78rem] font-semibold transition-colors ${missionName.trim() && isDeployable ? 'bg-violet-600 hover:bg-violet-500 text-white' : 'bg-gray-700/50 text-gray-600 cursor-not-allowed'}`}
        >
          Save Draft
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div>

        {/* ── Animation row ── */}
        <div className="flex h-[40vh] md:h-[460px]">

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

              {/* ── Weapons engagement zone ── */}
              <Circle
                center={WEZ_CENTER}
                radius={WEZ_RADIUS_NM * NM_TO_M}
                pathOptions={{ color: '#ef4444', weight: 1.5, fill: true, fillColor: '#ef4444', fillOpacity: 0.05, opacity: 0.35, dashArray: '6 8' }}
              >
                <Tooltip direction="top" sticky>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#f87171' }}>DF-26 Weapons Engagement Zone — no safe harbor inside</span>
                </Tooltip>
              </Circle>

              {/* ── Receiving points — one shared color scheme: amber while waiting,
                     green once their delivery lands. The combatant takes two runs
                     (fuel + magazine), so its gauges update per delivery and it
                     only flips green once both have landed. ── */}
              {(() => {
                const fuelDone  = currentTick >= getDeliveredAt(0);
                const cargoDone = currentTick >= getDeliveredAt(1);
                const magDone   = currentTick >= getDeliveredAt(2);
                const points = [
                  {
                    key: 'combatant', pos: COMBATANT, delivered: fuelDone && magDone,
                    label: currentTick >= T_DEMAND
                      ? `COMBATANT · FUEL ${fuelDone ? '96%' : '22%'} · CELLS ${magDone ? '4/4' : '1/4'}`
                      : 'Combatant on Station',
                    demandPulse: true, tooltipDir: 'top',
                  },
                  {
                    key: 'ros', pos: ROS_POS, delivered: cargoDone,
                    label: `ROS${cargoDone ? ' · RESUPPLIED' : (currentTick >= T_DEMAND ? ' · AWAITING CARGO' : '')}`,
                    demandPulse: false, tooltipDir: 'bottom',
                  },
                ];
                return points.map((p) => {
                  const waiting = currentTick >= T_DEMAND && !p.delivered;
                  const color = p.delivered ? DEST_SATISFIED : (waiting ? DEST_WAITING : '#94a3b8');
                  const fill  = p.delivered ? '#14532d' : (waiting ? '#713f12' : '#1e293b');
                  // Labels pin for the first ~7 s (orientation), collapse to
                  // hover-only during the runs, then pin again once resupplied
                  const showLabel = currentTick < 20 || p.delivered;
                  return (
                    <CircleMarker
                      key={`dest-${p.key}-${p.delivered}-${waiting}-${showLabel}-${p.label}`}
                      center={p.pos}
                      radius={p.demandPulse && phase === 'demand' && pulse ? 12 : 10}
                      pathOptions={{ color, fillColor: fill, fillOpacity: 0.9, weight: 2.5 }}
                    >
                      <Tooltip direction={p.tooltipDir} offset={[0, p.tooltipDir === 'bottom' ? 10 : -8]} permanent={showLabel}>
                        <span style={{ fontSize: 9, fontWeight: 700, color }}>{p.label}</span>
                      </Tooltip>
                    </CircleMarker>
                  );
                });
              })()}

              {/* ── Resupply runs — every M48 wears the same friendly blue ── */}
              {showRuns && RUNS.map((run, i) => {
                const pos = runPositions[i];
                const denied = i === DENIED_RUN && linkDenied;
                // The cargo dot: rides beside the hull from loading until handoff,
                // then sits at the destination — the run visibly delivers something.
                const cargoDelivered = currentTick >= getDeliveredAt(i);
                const cargoPos = cargoDelivered
                  ? [run.dest[0] + 0.09, run.dest[1] + 0.09]
                  : [pos[0] + 0.085, pos[1] + 0.085];
                const showCargo = currentTick >= T_LOAD;
                return (
                  <React.Fragment key={`run-${i}`}>
                    {currentTick >= T_TRANSIT && (
                      <Polyline
                        positions={[LCS_NODE, run.dest]}
                        pathOptions={{ color: M48_COLOR, weight: 1, opacity: 0.25, dashArray: '3 7' }}
                      />
                    )}
                    {showCargo && (
                      <CircleMarker
                        center={cargoPos}
                        radius={6}
                        pathOptions={{ color: '#ffffff', fillColor: M48_COLOR, fillOpacity: 1, weight: 2.5 }}
                      >
                        <Tooltip direction="right" offset={[6, 0]}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: M48_COLOR }}>
                            {cargoDelivered ? `${run.module} — DELIVERED` : `${run.module} module aboard`}
                          </span>
                        </Tooltip>
                      </CircleMarker>
                    )}
                    <CircleMarker
                      center={pos}
                      radius={transferring ? 11 : 9}
                      pathOptions={{ color: denied ? '#ef4444' : M48_COLOR, fillColor: '#1e3a8a', fillOpacity: 0.95, weight: denied ? 3 : 2, dashArray: denied ? '3 3' : undefined }}
                    >
                      <Tooltip direction="top" offset={[0, -8]} permanent={denied}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: denied ? '#ef4444' : M48_COLOR }}>
                          {denied
                            ? 'LINK DENIED — Holding Last Routing Order'
                            : `${effectiveRoster[run.rosterIdx]?.hullName ?? 'M48'} · ${run.module} ${cargoDelivered ? '(empty — RTB)' : `→ ${run.destLabel}`}`}
                        </span>
                      </Tooltip>
                    </CircleMarker>
                  </React.Fragment>
                );
              })}

              {/* ── LCS logistics node — never moves, never crosses ── */}
              <CircleMarker
                center={LCS_NODE}
                radius={14}
                pathOptions={{ color: '#3b82f6', fillColor: '#1e3a8a', fillOpacity: 0.95, weight: 3 }}
              >
                <Tooltip direction="bottom" offset={[0, 10]} permanent={currentTick >= T_DEMAND}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#60a5fa' }}>LCS NODE · Outside the WEZ · Loads, Routes, Orchestrates</span>
                </Tooltip>
              </CircleMarker>

            </MapContainer>

            {/* ── The whole mission in two numbers ── */}
            <div className="absolute top-3 right-3 z-[500] pointer-events-none px-3 py-2 rounded-xl bg-gray-950/85 border border-violet-500/30 backdrop-blur-sm">
              <div className="text-[0.6rem] uppercase tracking-widest text-violet-400/80 font-bold mb-0.5">Inside the WEZ</div>
              <div className="text-[0.72rem] text-gray-200 tabular-nums">Unmanned hulls: <span className="font-bold text-violet-300">{showRuns ? 3 : 0}</span></div>
              <div className="text-[0.72rem] text-gray-200 tabular-nums">Crewed hulls: <span className="font-bold text-emerald-400">0</span></div>
            </div>

            {/* ── Phase badge — shown only while the update is fresh ── */}
            {badge && currentTick - (PHASE_STARTS[phase] ?? 0) < BADGE_LINGER_TICKS && (
              <div className={`absolute top-3 left-3 z-[500] px-3 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wider pointer-events-none border ${badge.cls}`}>
                {badge.label}
              </div>
            )}

            {/* ── Legend ── */}
            {currentTick >= T_DEMAND && (
              <div className="hidden md:block absolute bottom-3 left-3 z-[500] pointer-events-none px-3 py-2 rounded-xl bg-gray-950/80 border border-gray-700/50 backdrop-blur-sm">
                <div className="flex flex-col gap-1">
                  {[
                    { color: '#3b82f6', label: `${effectiveRoster[0]?.name ?? 'LCS'} — Rear Node` },
                    { color: M48_COLOR, label: '3× M48 — Fuel · Cargo · Magazine runs' },
                    { color: DEST_WAITING, label: 'Receiving point — awaiting delivery' },
                    { color: DEST_SATISFIED, label: 'Receiving point — resupplied' },
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
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[0.78rem] font-semibold transition-colors bg-violet-700 hover:bg-violet-600 text-white"
                  >
                    <Pause size={13} />
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={paused ? resume : runScenario}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[0.78rem] font-semibold transition-colors bg-violet-700 hover:bg-violet-600 text-white"
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
                  <div className="text-[0.68rem] font-bold text-violet-300 uppercase tracking-wider mb-1">
                    {narrative.title}
                  </div>
                  <div className="text-[0.67rem] text-gray-400 leading-relaxed">
                    {narrative.body}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-[0.68rem]">
                  1× LCS · 3× M48 resupply hulls
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
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-violet-700 hover:bg-violet-600 text-white text-sm font-semibold transition-colors"
            >
              <Pause size={15} />
              Pause
            </button>
          ) : (
            <button
              onClick={paused ? resume : runScenario}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-violet-700 hover:bg-violet-600 text-white text-sm font-semibold transition-colors"
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
                    className="ml-auto p-1 rounded text-gray-400 hover:text-violet-400 hover:bg-gray-700/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
          title="Mission Advisor — Contested Logistics"
          accentColor="violet"
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

export default ContestedLogisticsMothershipMissionView;
