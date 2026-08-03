import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import {
  MapContainer, TileLayer, Polygon, CircleMarker, Polyline, Tooltip, ZoomControl, useMap
} from 'react-leaflet';
import { Play, Pause, RotateCcw, Crosshair, ChevronLeft, Settings, ArrowLeftRight, Sparkles } from 'lucide-react';
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

const MISSION_SET_KEY = 'MAGAZINE_DEPTH';

// ─── Mission Advisor (plan §5.4) — keep this block identical across the five
// Autonomy Mission Series views except for the questions and accent color ────
const ADVISOR_QUESTIONS = [
  'Why does the LCS never fire?',
  'What does the Mk 70 PDS carry?',
  'What happens when an M48 runs empty?',
];

// ─── Geography — Luzon Strait fires engagement box ────────────────────────────
// Single fixed frame at the working scale — the camera never moves or zooms
// during the run.
const MAP_CENTER  = [20.40, 121.80];
const MAP_ZOOM    = 7;

const LCS_POS     = [21.35, 122.70];  // command node — held back, north-east. Never moves.
const M48_A_POS   = [20.75, 121.80];  // forward shooter Alpha
const M48_B_POS   = [21.10, 121.45];  // forward shooter Bravo
const TARGET_POS  = [19.95, 120.95];  // PLAN SAG track, south-west
// Rearm point on Calayan Island (Babuyan chain, north of Luzon) — an island
// site the crewed LCS cannot reach; only the unmanned M48s make this run
const ROS_POS     = [19.33, 121.48];

// Airborne sensor orbit — the Blackjack flies a continuous racetrack around
// the target area rather than holding a fixed station
const ORBIT_RADIUS_LAT = 0.32;
const ORBIT_RADIUS_LNG = 0.45;
const getAirPos = (tick) => {
  const ang = tick * 0.11;
  return [
    TARGET_POS[0] + ORBIT_RADIUS_LAT * Math.cos(ang),
    TARGET_POS[1] + ORBIT_RADIUS_LNG * Math.sin(ang),
  ];
};

const ENGAGEMENT_BOX = [
  [20.20, 121.00], [21.60, 121.00], [21.60, 122.90], [20.20, 122.90],
];

const LCS_CELLS = 8;  // the LCS's own magazine — displayed and NEVER decremented

// ─── Tick milestones ──────────────────────────────────────────────────────────
const T_ONSTATION = 8;    // engagement box drawn; LCS labeled with launch authority
const T_DETECT    = 20;   // contact appears; dashed bearings
const T_CEC       = 32;   // bearings converge; CEC track goes fire-control quality
const T_AUTH      = 44;   // amber pulse — LCS watch team authorizes
const T_LAUNCH    = 56;   // launch-on-remote; round leaves Alpha; Alpha 4 → 3
const T_EXPENDED  = 70;   // Alpha at 0; cycles to ROS; Bravo slides forward
const T_COMPLETE  = 96;   // Alpha back rearmed; LCS has not moved once
const TOTAL_TICKS = 96;

const TICK_MS = 280;

// ─── Roster — order matches MISSION_ROLES[MAGAZINE_DEPTH].roles ──────────────
const VESSEL_ROSTER = [
  { name: 'LCS Command Node', roleDescriptor: '(Command Node — Launch Authority)', image: HULL_IMAGES['Freedom-class LCS'], hullName: 'Freedom-class LCS', roleKey: 'MAGDEP_LCS', capabilities: ['TempestOS Core Platform', 'Cooperative Engagement Capability (AN/USG-2)', 'Aegis Remote Fire Control', 'Link 16 Track Broadcast', 'MILSATCOM Terminal', 'Nulka Active Missile Decoy', 'NSYTE AI Maintenance System'] },
  { name: 'M48', roleDescriptor: '(Forward Shooter — Alpha)', image: HULL_IMAGES['M48'], hullName: 'M48', roleKey: 'MAGDEP_SHOOTER_1', capabilities: ['Mk 70 Payload Delivery System', 'SM-6 Missile System', 'Tomahawk Block V 8-cell VLS', 'Cooperative Engagement Capability (AN/USG-2)', 'Maritime Surface/Air Search Radar', 'HiveLink SDR', 'SeaFIND Inertial Navigation'] },
  { name: 'M48', roleDescriptor: '(Forward Shooter — Bravo)', image: HULL_IMAGES['M48'], hullName: 'M48', roleKey: 'MAGDEP_SHOOTER_2', capabilities: ['Mk 70 Payload Delivery System', 'SM-6 Missile System', 'Tomahawk Block V 8-cell VLS', 'Cooperative Engagement Capability (AN/USG-2)', 'Maritime Surface/Air Search Radar', 'HiveLink SDR', 'SeaFIND Inertial Navigation'] },
  { name: 'RQ-21A Blackjack', roleDescriptor: '(Airborne Sensor)', image: HULL_IMAGES['RQ-21A Blackjack'], hullName: 'RQ-21A Blackjack', roleKey: 'MAGDEP_SENSOR', capabilities: ['Maritime Surface/Air Search Radar', 'Teledyne FLIR EO/IR Turret', 'Link 16 Track Broadcast'] },
];

// ─── Phase narratives ─────────────────────────────────────────────────────────
const PHASE_NARRATIVE = {
  idle:        null,
  deployed:    { title: 'LCS On Station — Command Node', body: 'The Freedom-class LCS takes station as the command node, cells aboard and TempestOS up. Two M48s stand forward of it carrying Mk 70 PDS containers: four Mk 41 strike-length cells each, on top of the LCS\'s own magazine.' },
  sensing:     { title: 'Contact', body: 'A surface action group is detected. Any node can see it first — the airborne sensor, an M48\'s own radar, or the LCS. The bearings start coming in.' },
  fusing:      { title: 'One Fire-Control Picture', body: 'Cooperative Engagement Capability fuses every node\'s contribution into a single fire-control-quality track at the LCS. No one hull could hold this track alone.' },
  authorizing: { title: 'The Decision Stays With the Crew', body: 'The LCS watch team evaluates the track and decides when and what to shoot. Nothing launches until a human on station authorizes it — the appropriate-human-judgment standard of DoDD 3000.09.' },
  firing:      { title: 'Launch on Remote', body: 'The order goes forward. The round leaves M48 Alpha, not the LCS. The command node keeps its own cells and keeps its station; the risk of being the shooter sits on a hull with no crew aboard.' },
  cycling:     { title: 'Regenerate by Cycling Hulls', body: 'M48 Alpha is empty and transits west to the Remote Operating Site for a fresh Mk 70 module, in water the crewed command node cannot enter. M48 Bravo takes its firing position. Depth is regenerated by cycling unmanned hulls, not by sending the command node home.' },
  complete:    { title: 'Fires Sustained — The LCS Never Left', body: 'Alpha is back forward and rearmed. The magazine moved; the decision never did. Swap the payload, not the platform.' },
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
  if (tick < T_ONSTATION) return 'idle';
  if (tick < T_DETECT)    return 'deployed';
  if (tick < T_CEC)       return 'sensing';
  if (tick < T_AUTH)      return 'fusing';
  if (tick < T_LAUNCH)    return 'authorizing';
  if (tick < T_EXPENDED)  return 'firing';
  if (tick < T_COMPLETE)  return 'cycling';
  return 'complete';
};

// Alpha's remaining cells: 4 until launch, one round per 4 ticks while firing,
// 0 while cycling, rearmed to 4 on return. The LCS counter never touches this.
const getAlphaCells = (tick) => {
  if (tick < T_LAUNCH) return 4;
  if (tick >= T_COMPLETE) return 4;
  const fired = Math.min(Math.floor((tick - T_LAUNCH) / 4) + 1, 4);
  return 4 - fired;
};

// Alpha: forward until expended, transits to the ROS, dwells there while the
// fresh Mk 70 module is craned aboard (rearm is not instant), returns forward
const getAlphaPos = (tick) => {
  if (tick < T_EXPENDED) return M48_A_POS;
  const window = T_COMPLETE - T_EXPENDED;
  const arrive = T_EXPENDED + Math.round(window * 0.35);  // outbound leg
  const depart = T_EXPENDED + Math.round(window * 0.75);  // refilling at the ROS
  if (tick < arrive)     return lerp2(M48_A_POS, ROS_POS, (tick - T_EXPENDED) / (arrive - T_EXPENDED));
  if (tick < depart)     return ROS_POS;
  if (tick < T_COMPLETE) return lerp2(ROS_POS, M48_B_POS, (tick - depart) / (T_COMPLETE - depart));
  return M48_B_POS;  // returns to the line on Bravo's old station — both shooters forward
};

// Bravo: holds until Alpha empties, then slides into Alpha's firing position
const getBravoPos = (tick) => {
  if (tick < T_EXPENDED) return M48_B_POS;
  const arrive = T_EXPENDED + 8;
  if (tick < arrive) return lerp2(M48_B_POS, M48_A_POS, (tick - T_EXPENDED) / (arrive - T_EXPENDED));
  return M48_A_POS;
};

// The round in flight: one animated dot Alpha → target per fired cell
const getRoundPos = (tick, alphaPos) => {
  if (tick < T_LAUNCH || tick >= T_EXPENDED) return null;
  const within = (tick - T_LAUNCH) % 4;
  return lerp2(alphaPos, TARGET_POS, (within + 1) / 4);
};

const getPhaseBadge = (phase) => {
  const m = {
    deployed:    { cls: 'bg-rose-900/80 text-rose-300 border-rose-500/40',                  label: '● LCS On Station · Launch Authority' },
    sensing:     { cls: 'bg-rose-900/80 text-rose-200 border-rose-400/40 animate-pulse',    label: '⌐ Contact · Bearings Inbound' },
    fusing:      { cls: 'bg-rose-900/80 text-rose-200 border-rose-400/40 animate-pulse',    label: '✕ CEC · One Fire-Control Picture' },
    authorizing: { cls: 'bg-amber-900/80 text-amber-300 border-amber-500/40 animate-pulse', label: '⚑ LCS Watch Team · Authorize?' },
    firing:      { cls: 'bg-red-900/80 text-red-300 border-red-500/40 animate-pulse',       label: '➤ Launch on Remote · M48 Fires' },
    cycling:     { cls: 'bg-rose-900/80 text-rose-300 border-rose-500/40',                  label: '⟳ Cycling · Magazine Regenerates' },
    complete:    { cls: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40',         label: '✓ Fires Sustained · LCS Never Left' },
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
const MagazineDepthMissionView = ({ mission, onBack }) => {
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

  const phase      = getPhase(currentTick);
  const alphaPos   = getAlphaPos(currentTick);
  const bravoPos   = getBravoPos(currentTick);
  const alphaCells = getAlphaCells(currentTick);
  const roundPos   = getRoundPos(currentTick, alphaPos);

  const showTarget  = currentTick >= T_DETECT && currentTick < T_COMPLETE;
  const cecFused    = currentTick >= T_CEC;
  const authorized  = currentTick >= T_LAUNCH;   // the launch-authority line exists ONLY after human auth
  const firing      = phase === 'firing';
  const authorizing = phase === 'authorizing';
  const cycling     = phase === 'cycling';

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
    if (phase === 'authorizing' || phase === 'firing') {
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
      const v1 = vesselLabelsRef.current[1] ?? 'M48 (Alpha)';
      const v2 = vesselLabelsRef.current[2] ?? 'M48 (Bravo)';
      const v3 = vesselLabelsRef.current[3] ?? 'RQ-21A Blackjack';
      setCurrentTick(tick);

      if (tick === T_ONSTATION) {
        addEvtRef.current(`${v0}: On station — command node, launch authority, own cells aboard`, 'info');
        addEvtRef.current(`${v1} ${v2}: Forward with Mk 70 PDS — 4 cells each`, 'info');
      }
      if (tick === T_DETECT) {
        addEvtRef.current(`${v3}: Surface action group detected — bearings inbound`, 'warn');
      }
      if (tick === T_CEC) {
        addEvtRef.current('CEC: every node fused into one fire-control-quality track', 'info');
        addEvtRef.current(`${v0}: Track presented to the watch team`, 'info');
      }
      if (tick === T_AUTH) {
        addEvtRef.current(`${v0}: WATCH TEAM EVALUATING — nothing fires until a human authorizes`, 'warn');
      }
      if (tick === T_LAUNCH) {
        addEvtRef.current(`${v0}: Engagement AUTHORIZED — launch-on-remote order to ${v1}`, 'alert');
        addEvtRef.current(`${v1}: Round away — LCS cells untouched`, 'alert');
      }
      if (tick === T_LAUNCH + 8) {
        addEvtRef.current(`${v1}: Cells expending — ${v0} magazine still full, still on station`, 'info');
      }
      if (tick === T_EXPENDED) {
        addEvtRef.current(`${v1}: Cells at 0 — cycling to Remote Operating Site`, 'info');
        addEvtRef.current(`${v2}: Sliding into Alpha's firing position — depth maintained`, 'info');
      }
      if (tick === T_COMPLETE) {
        addEvtRef.current(`${v1}: Back forward, rearmed — both shooters on the line`, 'success');
        addEvtRef.current(`${v0}: Never moved. The magazine cycled; the decision never did`, 'success');
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
      template: 'MAGAZINE_DEPTH',
      domain: 'MARITIME',
      status: 'draft',
      duration: 'continuous',
      zoneConfig: {
        name: 'Luzon Strait — Fires Engagement Box',
        coordinates: [
          { lat: 20.20, lng: 121.00 }, { lat: 21.60, lng: 121.00 },
          { lat: 21.60, lng: 122.90 }, { lat: 20.20, lng: 122.90 },
        ],
        swarmSize: 3,
        swarmFormation: 'forward-shooter-line',
      },
      assignedSquadrons: ['sqdn_034', 'sqdn_016'],
      stateHierarchies: {
        default:        ['Mission', 'Payload', 'Comms', 'Navigation', 'Vehicle'],
        track_hold:     ['Payload', 'Mission', 'Comms', 'Navigation', 'Vehicle'],
        authorized:     ['Payload', 'Mission', 'Comms', 'Navigation', 'Vehicle'],
        magazine_cycle: ['Navigation', 'Vehicle', 'Mission', 'Comms', 'Payload'],
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

  // Bearing/CEC lines into the LCS from every contributing node
  const airPos = getAirPos(currentTick);
  const cecSources = [alphaPos, bravoPos, airPos];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col bg-darkest">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-700/50 flex-shrink-0 overflow-x-auto">
        <button onClick={onBack} className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-[0.75rem]">
          <ChevronLeft size={13} /> Back to Library
        </button>
        <div className="w-px h-4 bg-gray-700/60" />
        <Crosshair size={13} className="text-rose-400" />
        <span className="text-rose-400 text-[0.8rem] font-semibold tracking-wide">Magazine Depth — Mission 01</span>
        <span className="hidden md:inline text-gray-600 text-[0.7rem]">·</span>
        <span className="hidden md:inline text-gray-500 text-[0.68rem]">The Magazine Moves Forward on Unmanned Hulls · The Decision Stays With the Crew</span>
        <div className="flex-1" />
        <button
          onClick={() => setShowAdvisor(v => !v)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[0.7rem] font-semibold transition-colors flex-shrink-0 ${showAdvisor ? 'border-rose-500/60 bg-rose-900/40 text-rose-300' : 'border-rose-500/30 text-rose-400 hover:bg-rose-900/30'}`}
          title="Ask the Mission Advisor"
        >
          <Sparkles size={12} />
          <span className="hidden sm:inline">Ask the Advisor</span>
        </button>
        <span className="px-2 py-0.5 rounded-full bg-rose-900/50 text-rose-400 text-[0.65rem] font-bold uppercase tracking-wider border border-rose-500/30">DRAFT</span>
        <input
          value={missionName}
          onChange={e => setMissionName(e.target.value)}
          placeholder="Mission name…"
          className="hidden md:block bg-gray-800/60 border border-gray-700/60 rounded-md px-3 py-1.5 text-white text-[0.78rem] w-52 placeholder-gray-600 focus:outline-none focus:border-rose-500/50 transition-colors"
        />
        <button
          onClick={handleSave}
          disabled={!missionName.trim() || !isDeployable}
          className={`hidden md:block px-3 py-1.5 rounded-md text-[0.78rem] font-semibold transition-colors ${missionName.trim() && isDeployable ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-gray-700/50 text-gray-600 cursor-not-allowed'}`}
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

              {/* ── Fires engagement box ── */}
              {currentTick >= T_ONSTATION && (
                <Polygon
                  positions={ENGAGEMENT_BOX}
                  pathOptions={{ color: '#3b82f6', weight: 1.5, dashArray: '8 10', fillColor: '#3b82f6', fillOpacity: 0.05 }}
                >
                  <Tooltip direction="top" sticky>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#60a5fa' }}>Fires Engagement Box</span>
                  </Tooltip>
                </Polygon>
              )}

              {/* ── Remote Operating Site ── */}
              {currentTick >= T_ONSTATION && (
                <CircleMarker
                  center={ROS_POS}
                  radius={7}
                  pathOptions={{ color: '#94a3b8', fillColor: '#1e293b', fillOpacity: 0.9, weight: 1.5, dashArray: '2 3' }}
                >
                  <Tooltip direction="bottom" offset={[0, 8]}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>Remote Operating Site · Rearm · Unmanned Hulls Only</span>
                  </Tooltip>
                </CircleMarker>
              )}

              {/* ── CEC / bearing lines into the LCS ── */}
              {showTarget && cecSources.map((src, i) => (
                <Polyline
                  key={`cec-${i}`}
                  positions={[src, LCS_POS]}
                  pathOptions={{ color: cecFused ? '#3b82f6' : '#93c5fd', weight: cecFused ? 1.6 : 1.0, opacity: cecFused ? 0.6 : 0.35, dashArray: cecFused ? undefined : '4 6' }}
                />
              ))}

              {/* ── Bearings to the target from sensor + Alpha ── */}
              {showTarget && !authorized && [airPos, alphaPos].map((src, i) => (
                <Polyline
                  key={`bearing-${i}`}
                  positions={[src, TARGET_POS]}
                  pathOptions={{ color: '#67e8f9', weight: 1.1, opacity: 0.4, dashArray: '4 6' }}
                />
              ))}

              {/* ── Launch-authority line — exists ONLY after the human authorizes ── */}
              {authorized && currentTick < T_EXPENDED && (
                <Polyline
                  positions={[LCS_POS, alphaPos]}
                  pathOptions={{ color: '#fbbf24', weight: 2.5, opacity: pulse ? 0.95 : 0.6 }}
                >
                  <Tooltip direction="center" sticky>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#fbbf24' }}>Launch-on-Remote — Authorized by LCS Watch Team</span>
                  </Tooltip>
                </Polyline>
              )}

              {/* ── Round in flight ── */}
              {roundPos && (
                <CircleMarker
                  center={roundPos}
                  radius={4}
                  pathOptions={{ color: '#fef08a', fillColor: '#fef08a', fillOpacity: 1, weight: 0 }}
                />
              )}

              {/* ── Target — PLAN SAG ── */}
              {showTarget && (
                <CircleMarker
                  center={TARGET_POS}
                  radius={9}
                  pathOptions={{ color: '#ef4444', fillColor: '#450a0a', fillOpacity: 0.9, weight: 2 }}
                >
                  <Tooltip direction="top" offset={[0, -8]}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444' }}>
                      {cecFused ? 'PLAN SAG — Fire-Control Quality' : 'PLAN SAG — Track Building'}
                    </span>
                  </Tooltip>
                </CircleMarker>
              )}

              {/* ── Airborne sensor ── */}
              {currentTick >= T_ONSTATION && (
                <CircleMarker
                  center={airPos}
                  radius={8}
                  pathOptions={{ color: '#a78bfa', fillColor: '#4c1d95', fillOpacity: 0.95, weight: 2 }}
                >
                  <Tooltip direction="top" offset={[0, -8]}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#a78bfa' }}>{`${effectiveRoster[3]?.hullName ?? 'RQ-21A Blackjack'} — Airborne Sensor`}</span>
                  </Tooltip>
                </CircleMarker>
              )}

              {/* ── M48 Alpha with cell counter ── */}
              {currentTick >= T_ONSTATION && (
                <CircleMarker
                  center={alphaPos}
                  radius={firing && pulse ? 12 : 10}
                  pathOptions={{ color: cycling && alphaCells === 0 ? '#94a3b8' : '#60a5fa', fillColor: '#1e3a8a', fillOpacity: 0.95, weight: 2 }}
                />
              )}

              {/* ── M48 Bravo with cell counter ── */}
              {currentTick >= T_ONSTATION && (
                <CircleMarker
                  center={bravoPos}
                  radius={10}
                  pathOptions={{ color: '#60a5fa', fillColor: '#1e3a8a', fillOpacity: 0.95, weight: 2 }}
                />
              )}

              {/* ── LCS command node — cell counter NEVER decrements, position never changes ── */}
              <CircleMarker
                center={LCS_POS}
                radius={authorizing && pulse ? 17 : 14}
                pathOptions={{ color: authorizing ? '#fbbf24' : '#3b82f6', fillColor: authorizing ? '#92400e' : '#1e3a8a', fillOpacity: 0.95, weight: 3 }}
              >
                <Tooltip direction="top" offset={[0, -10]} permanent={currentTick >= T_ONSTATION}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: authorizing ? '#fbbf24' : '#60a5fa' }}>
                    {authorizing
                      ? 'LCS WATCH TEAM — AUTHORIZE ENGAGEMENT'
                      : `LCS — Launch Authority · Own Cells: ${LCS_CELLS}/${LCS_CELLS}`}
                  </span>
                </Tooltip>
              </CircleMarker>

            </MapContainer>

            {/* ── The deck's claim, in numbers that never change ── */}
            <div className="absolute top-3 right-3 z-[500] pointer-events-none px-3 py-2 rounded-xl bg-gray-950/85 border border-rose-500/30 backdrop-blur-sm">
              <div className="text-[0.6rem] uppercase tracking-widest text-rose-400/80 font-bold mb-0.5">Command Node</div>
              <div className="text-[0.72rem] text-gray-200 tabular-nums">LCS cells expended: <span className="font-bold text-emerald-400">0</span></div>
              <div className="text-[0.72rem] text-gray-200 tabular-nums">LCS station changes: <span className="font-bold text-emerald-400">0</span></div>
              <div className="text-[0.72rem] text-gray-200 tabular-nums">Launches w/o human auth: <span className="font-bold text-emerald-400">0</span></div>
            </div>

            {/* ── Phase badge ── */}
            {badge && (
              <div className={`absolute top-3 left-3 z-[500] px-3 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wider pointer-events-none border ${badge.cls}`}>
                {badge.label}
              </div>
            )}

            {/* ── Legend ── */}
            {currentTick >= T_ONSTATION && (
              <div className="hidden md:block absolute bottom-3 left-3 z-[500] pointer-events-none px-3 py-2 rounded-xl bg-gray-950/80 border border-gray-700/50 backdrop-blur-sm">
                <div className="flex flex-col gap-1">
                  {[
                    { color: '#3b82f6', label: `${effectiveRoster[0]?.name ?? 'LCS'} — Launch Authority` },
                    { color: '#60a5fa', label: '2× M48 — Forward Shooters (Mk 70)' },
                    { color: '#a78bfa', label: `${effectiveRoster[3]?.name ?? 'RQ-21A'} — Airborne Sensor` },
                    { color: '#fbbf24', label: 'Launch-on-Remote (after human auth)' },
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
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[0.78rem] font-semibold transition-colors bg-rose-700 hover:bg-rose-600 text-white"
                  >
                    <Pause size={13} />
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={paused ? resume : runScenario}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[0.78rem] font-semibold transition-colors bg-rose-700 hover:bg-rose-600 text-white"
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
                  <div className="text-[0.68rem] font-bold text-rose-300 uppercase tracking-wider mb-1">
                    {narrative.title}
                  </div>
                  <div className="text-[0.67rem] text-gray-400 leading-relaxed">
                    {narrative.body}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-[0.68rem]">
                  1× LCS · 2× M48 · RQ-21A Blackjack
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
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white text-sm font-semibold transition-colors"
            >
              <Pause size={15} />
              Pause
            </button>
          ) : (
            <button
              onClick={paused ? resume : runScenario}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white text-sm font-semibold transition-colors"
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
                    className="ml-auto p-1 rounded text-gray-400 hover:text-rose-400 hover:bg-gray-700/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
          title="Mission Advisor — Magazine Depth"
          accentColor="rose"
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

export default MagazineDepthMissionView;
