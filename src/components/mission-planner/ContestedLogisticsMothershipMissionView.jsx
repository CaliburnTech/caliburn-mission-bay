import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import {
  MapContainer, TileLayer, Circle, CircleMarker, Polyline, Tooltip, ZoomControl, useMap
} from 'react-leaflet';
import { Play, Pause, RotateCcw, Ship, ChevronLeft, Settings, ArrowLeftRight } from 'lucide-react';
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
import { ORCHESTRATION_LAYER, SUCCESS_CRITERIA } from './autonomySeriesShared';

const MISSION_SET_KEY = 'CONTESTED_LOGISTICS_MOTHERSHIP';

// ─── Geography — Luzon Strait sustainment network ─────────────────────────────
const NM_TO_M = 1852;

const MAP_CENTER  = [20.55, 121.60];
const MAP_ZOOM    = 7;
const MAP_ZOOM_IN = 8;

const LCS_NODE     = [19.60, 120.40];  // rear logistics node, behind the stand-off line. Never moves.
const ROS_POS      = [20.10, 121.10];  // Remote Operating Site — Balintang
const COMBATANT    = [21.30, 122.60];  // combatant on station, forward edge
const ADJACENT_M48 = [20.95, 122.20];  // Mission 01 shooter taking the reload module

const STANDOFF_LINE = [[19.90, 119.80], [20.30, 123.40]];  // manned stand-off line
const WEZ_CENTER    = [21.30, 122.30];                     // DF-26 threat ring, forward side
const WEZ_RADIUS_NM = 120;

// ─── Tick milestones ──────────────────────────────────────────────────────────
const T_DEMAND   = 8;    // combatant pulses amber — FUEL 22% / CELLS 1 of 4
const T_LOAD     = 18;   // modules attach at the LCS node
const T_TRANSIT  = 30;   // hulls cross the stand-off line and the WEZ boundary
const T_DENIED   = 46;   // link drops on the fuel hull — it keeps going
const T_TRANSFER = 60;   // alongside: combatant, adjacent M48, ROS
const T_RTB      = 76;   // empty hulls return; combatant flips green
const T_COMPLETE = 92;   // all hulls home — no crewed hull crossed the line
const TOTAL_TICKS = 92;

const TICK_MS = 280;

// ─── Roster — order matches MISSION_ROLES[CONTESTED_LOGISTICS_MOTHERSHIP].roles ─
const VESSEL_ROSTER = [
  { name: 'LCS Logistics Node', roleDescriptor: '(Logistics Node)', image: HULL_IMAGES['Freedom-class LCS'], hullName: 'Freedom-class LCS', roleKey: 'CLM_LCS', capabilities: ['TempestOS Core Platform', 'MILSATCOM Terminal', 'Link 16 Track Broadcast', 'HiveLink SDR', 'Autonomous Cargo Handling System', 'NSYTE AI Maintenance System'] },
  { name: 'M48', roleDescriptor: '(Fuel Run)', image: HULL_IMAGES['M48'], hullName: 'M48', roleKey: 'CLM_FUEL', capabilities: ['20-ft TEU Fuel Bladder Module', 'Autonomous Cargo Handling System', 'Maritime Surface/Air Search Radar', 'Teledyne FLIR EO/IR Turret', 'Marine AI Guardian Vision CVP', 'SeaFIND Inertial Navigation', 'HiveLink SDR', 'Nulka Active Missile Decoy'] },
  { name: 'M48', roleDescriptor: '(Cargo Run)', image: HULL_IMAGES['M48'], hullName: 'M48', roleKey: 'CLM_CARGO', capabilities: ['20-ft TEU Dry Cargo Module', 'Autonomous Cargo Handling System', 'Maritime Surface/Air Search Radar', 'Teledyne FLIR EO/IR Turret', 'Marine AI Guardian Vision CVP', 'SeaFIND Inertial Navigation', 'HiveLink SDR', 'Nulka Active Missile Decoy'] },
  { name: 'M48', roleDescriptor: '(Magazine Run)', image: HULL_IMAGES['M48'], hullName: 'M48', roleKey: 'CLM_MAGAZINE', capabilities: ['Mk 70 PDS Reload Module', 'Autonomous Cargo Handling System', 'Maritime Surface/Air Search Radar', 'Teledyne FLIR EO/IR Turret', 'Marine AI Guardian Vision CVP', 'SeaFIND Inertial Navigation', 'HiveLink SDR', 'Nulka Active Missile Decoy'] },
];

// Run definitions: which hull goes where, and what it carries
const RUNS = [
  { rosterIdx: 1, dest: COMBATANT,    color: '#fbbf24', module: 'FUEL',     destLabel: 'Combatant on Station' },
  { rosterIdx: 2, dest: ROS_POS,      color: '#67e8f9', module: 'CARGO',    destLabel: 'ROS Balintang' },
  { rosterIdx: 3, dest: ADJACENT_M48, color: '#f43f5e', module: 'MAGAZINE', destLabel: 'Mission 01 M48 — Cross-Load' },
];
const DENIED_RUN = 0;  // the fuel hull loses link mid-WEZ and keeps going

// ─── Phase narratives ─────────────────────────────────────────────────────────
const PHASE_NARRATIVE = {
  idle:         null,
  demand:       { title: 'The Edge Reports Its State', body: 'A combatant on station inside the weapons engagement zone reports fuel at 22% and one cell remaining. Roughly 1,400 nm separate Guam from this fight, and no port inside the WEZ can service it. The demand goes to the rear LCS node.' },
  loading:      { title: 'Assigned by Mission Order', body: 'TempestOS assigns each M48 a run by mission order rather than fixed schedule: a fuel bladder, a dry cargo module, and a Mk 70 reload magazine. The LCS loads them behind the manned stand-off line.' },
  transiting:   { title: 'Only Unmanned Hulls Cross the Line', body: 'Three M48s cross the stand-off line and the WEZ boundary under EMCON discipline. The LCS does not move. Every crewed oiler in the theater stays outside the threat ring; the transit risk sits entirely on hulls with nobody aboard.' },
  denied:       { title: 'Link Drops — The Run Completes Anyway', body: 'GPS jamming and comms denial hit the forward leg. The fuel hull holds its last routing order and executes pre-authorized rules to completion, navigating on INS. A run does not need a live link to finish.' },
  transferring: { title: 'The Last Contested Mile', body: 'The fuel hull comes alongside the combatant, the magazine hull cross-loads a fresh Mk 70 module to a Mission 01 shooter, and the cargo hull delivers at the ROS. The containers are mature; the autonomous transfer at sea is the gap this mission proves.' },
  returning:    { title: 'Refueled and Rearmed — Without Leaving the Fight', body: 'The combatant reads FUEL 96%, CELLS 4 of 4, and it never left station. Empty hulls transit back through the WEZ toward the node. A hull lost on this leg costs no mariners and carries no strategic signature.' },
  complete:     { title: 'No Crewed Hull Crossed the Line', body: 'All three M48s are back at the node. The forward fight is sustained, and every human stayed behind the stand-off line. Sustainment is decided at the last contested mile — and the last mile is unmanned.' },
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

// Resupply hull position: at the node, transit out, alongside, transit back
const getRunPos = (dest, tick) => {
  if (tick < T_TRANSIT)  return LCS_NODE;
  if (tick < T_TRANSFER) return lerp2(LCS_NODE, dest, (tick - T_TRANSIT) / (T_TRANSFER - T_TRANSIT));
  if (tick < T_RTB)      return dest;
  if (tick < T_COMPLETE) return lerp2(dest, LCS_NODE, (tick - T_RTB) / (T_COMPLETE - T_RTB));
  return LCS_NODE;
};

const getPhaseBadge = (phase) => {
  const m = {
    demand:       { cls: 'bg-amber-900/80 text-amber-300 border-amber-500/40 animate-pulse',   label: '⚠ Combatant — FUEL 22% · CELLS 1/4' },
    loading:      { cls: 'bg-violet-900/80 text-violet-300 border-violet-500/40',              label: '⬒ Loading — Fuel · Cargo · Magazine' },
    transiting:   { cls: 'bg-violet-900/80 text-violet-200 border-violet-400/40 animate-pulse', label: '➤ Crossing the Stand-Off Line — Unmanned Only' },
    denied:       { cls: 'bg-red-900/80 text-red-300 border-red-500/40 animate-pulse',         label: '✕ Link Denied — Run Completes Regardless' },
    transferring: { cls: 'bg-violet-900/80 text-violet-200 border-violet-400/40 animate-pulse', label: '⇄ Autonomous Transfer Alongside' },
    returning:    { cls: 'bg-violet-900/80 text-violet-300 border-violet-500/40',              label: '⟲ RTB — Combatant FUEL 96% · CELLS 4/4' },
    complete:     { cls: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40',           label: '✓ Sustained — No Crewed Hull Crossed the Line' },
  };
  return m[phase] || null;
};

// ─── Map controller — handles flyTo zoom ──────────────────────────────────────
const MapController = ({ phase }) => {
  const map = useMap();
  const prev = useRef(phase);
  useEffect(() => {
    if (prev.current === phase) return;
    prev.current = phase;
    if (phase === 'transferring') {
      map.flyTo(MAP_CENTER, MAP_ZOOM_IN, { duration: 1.5 });
    } else if (phase === 'demand' || phase === 'idle' || phase === 'returning') {
      map.flyTo(MAP_CENTER, MAP_ZOOM, { duration: 1.2 });
    }
  }, [phase, map]);
  return null;
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
const ContestedLogisticsMothershipMissionView = ({ mission, onBack }) => {
  const { saveMission, updateMission } = useMissionStore();
  const { setSelectedHull } = useOutfitterStore();
  const { startNewConfiguration, setPendingMissionSetKey, setPendingMissionSetCaps, setPendingRoleKey, setPendingVesselLabel, activeConfig } = useConfigurationStore();
  const { setSelectedView } = useNavigationStore();
  const roleAssignments = useMissionStore(s => s.roleAssignments);
  const savedConfigurations = useConfigurationStore(s => s.savedConfigurations);
  const [swapModal, setSwapModal] = useState(null);

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
  const runPositions = RUNS.map(r => getRunPos(r.dest, currentTick));

  const showRuns      = currentTick >= T_TRANSIT && currentTick < T_COMPLETE;
  const linkDenied    = currentTick >= T_DENIED && currentTick < T_TRANSFER;
  const transferring  = phase === 'transferring';
  const combatSatisfied = currentTick >= T_RTB;

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
        addEvtRef.current('Three unmanned hulls cross the stand-off line — EMCON discipline', 'info');
        addEvtRef.current(`${v0}: Holding behind the line. No crewed hull goes forward`, 'success');
      }
      if (tick === T_DENIED) {
        addEvtRef.current(`${v1}: LINK DENIED mid-WEZ — holding last routing order, INS-only`, 'alert');
      }
      if (tick === T_TRANSFER) {
        addEvtRef.current(`${v1}: Alongside the combatant — autonomous fuel transfer`, 'info');
        addEvtRef.current(`${v3}: Cross-loading Mk 70 module to a Mission 01 shooter`, 'info');
        addEvtRef.current(`${v2}: Delivering dry cargo at ROS Balintang`, 'info');
      }
      if (tick === T_RTB) {
        addEvtRef.current('Combatant: FUEL 96% · CELLS 4 of 4 — never left station', 'success');
        addEvtRef.current('Empty hulls RTB through the WEZ', 'info');
      }
      if (tick === T_COMPLETE) {
        addEvtRef.current('All hulls back at the node — forward fight sustained', 'success');
        addEvtRef.current('Crewed hulls across the stand-off line: 0', 'success');
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
              <MapController phase={phase} />

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

              {/* ── The stand-off line — the single most important visual ── */}
              <Polyline
                positions={STANDOFF_LINE}
                pathOptions={{
                  color: phase === 'complete' ? '#4ade80' : '#e2e8f0',
                  weight: phase === 'complete' ? 4 : 2.5,
                  opacity: phase === 'complete' ? 0.9 : 0.6,
                  dashArray: '12 8',
                }}
              >
                <Tooltip direction="top" sticky>
                  <span style={{ fontSize: 10, fontWeight: 700, color: phase === 'complete' ? '#4ade80' : '#e2e8f0' }}>
                    {phase === 'complete' ? 'Manned Stand-Off Line — no crewed hull crossed this line' : 'Manned Stand-Off Line'}
                  </span>
                </Tooltip>
              </Polyline>

              {/* ── Remote Operating Site ── */}
              <CircleMarker
                center={ROS_POS}
                radius={7}
                pathOptions={{ color: '#94a3b8', fillColor: '#1e293b', fillOpacity: 0.9, weight: 1.5, dashArray: '2 3' }}
              >
                <Tooltip direction="bottom" offset={[0, 8]}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>ROS Balintang — refuel · rearm · repair, no port required</span>
                </Tooltip>
              </CircleMarker>

              {/* ── Adjacent Mission 01 M48 (cross-load recipient) ── */}
              <CircleMarker
                center={ADJACENT_M48}
                radius={8}
                pathOptions={{ color: '#fb7185', fillColor: '#881337', fillOpacity: 0.9, weight: 2 }}
              >
                <Tooltip direction="right" offset={[8, 0]}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#fb7185' }}>Mission 01 M48 — awaiting Mk 70 reload</span>
                </Tooltip>
              </CircleMarker>

              {/* ── Combatant on station ── */}
              <CircleMarker
                center={COMBATANT}
                radius={phase === 'demand' && pulse ? 12 : 9}
                pathOptions={{
                  color: combatSatisfied ? '#4ade80' : (currentTick >= T_DEMAND ? '#fbbf24' : '#94a3b8'),
                  fillColor: combatSatisfied ? '#14532d' : (currentTick >= T_DEMAND ? '#92400e' : '#1e293b'),
                  fillOpacity: 0.95, weight: 2,
                }}
              >
                <Tooltip direction="top" offset={[0, -8]} permanent={currentTick >= T_DEMAND}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: combatSatisfied ? '#4ade80' : '#fbbf24' }}>
                    {combatSatisfied ? 'COMBATANT · FUEL 96% · CELLS 4/4' : (currentTick >= T_DEMAND ? 'COMBATANT · FUEL 22% · CELLS 1/4' : 'Combatant on Station')}
                  </span>
                </Tooltip>
              </CircleMarker>

              {/* ── Resupply runs ── */}
              {showRuns && RUNS.map((run, i) => {
                const pos = runPositions[i];
                const denied = i === DENIED_RUN && linkDenied;
                return (
                  <React.Fragment key={`run-${i}`}>
                    <Polyline
                      positions={[LCS_NODE, run.dest]}
                      pathOptions={{ color: run.color, weight: 1, opacity: 0.25, dashArray: '3 7' }}
                    />
                    <CircleMarker
                      center={pos}
                      radius={transferring ? 11 : 9}
                      pathOptions={{ color: denied ? '#ef4444' : run.color, fillColor: '#312e81', fillOpacity: 0.95, weight: denied ? 3 : 2, dashArray: denied ? '3 3' : undefined }}
                    >
                      <Tooltip direction="top" offset={[0, -8]} permanent={denied}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: denied ? '#ef4444' : run.color }}>
                          {denied
                            ? 'LINK DENIED — Holding Last Routing Order'
                            : `${effectiveRoster[run.rosterIdx]?.hullName ?? 'M48'} · ${run.module} → ${run.destLabel}`}
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
                pathOptions={{ color: '#a78bfa', fillColor: '#4c1d95', fillOpacity: 0.95, weight: 3 }}
              >
                <Tooltip direction="bottom" offset={[0, 10]} permanent={currentTick >= T_DEMAND}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#a78bfa' }}>LCS NODE — Behind the Line · Loads, Routes, Orchestrates</span>
                </Tooltip>
              </CircleMarker>

            </MapContainer>

            {/* ── The whole mission in two numbers ── */}
            <div className="absolute top-3 right-3 z-[500] pointer-events-none px-3 py-2 rounded-xl bg-gray-950/85 border border-violet-500/30 backdrop-blur-sm">
              <div className="text-[0.6rem] uppercase tracking-widest text-violet-400/80 font-bold mb-0.5">Across the Stand-Off Line</div>
              <div className="text-[0.72rem] text-gray-200 tabular-nums">Unmanned hulls: <span className="font-bold text-violet-300">{showRuns ? 3 : 0}</span></div>
              <div className="text-[0.72rem] text-gray-200 tabular-nums">Crewed hulls: <span className="font-bold text-emerald-400">0</span></div>
            </div>

            {/* ── Phase badge ── */}
            {badge && (
              <div className={`absolute top-3 left-3 z-[500] px-3 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wider pointer-events-none border ${badge.cls}`}>
                {badge.label}
              </div>
            )}

            {/* ── Legend ── */}
            {currentTick >= T_DEMAND && (
              <div className="hidden md:block absolute bottom-3 left-3 z-[500] pointer-events-none px-3 py-2 rounded-xl bg-gray-950/80 border border-gray-700/50 backdrop-blur-sm">
                <div className="flex flex-col gap-1">
                  {[
                    { color: '#a78bfa', label: `${effectiveRoster[0]?.name ?? 'LCS'} — Rear Node` },
                    { color: '#fbbf24', label: 'M48 — Fuel Run (22,000 kg)' },
                    { color: '#67e8f9', label: 'M48 — Cargo Run (24,000 kg)' },
                    { color: '#f43f5e', label: 'M48 — Magazine Run (Mk 70 reload)' },
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

export default ContestedLogisticsMothershipMissionView;
