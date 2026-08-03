import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import {
  MapContainer, TileLayer, Circle, CircleMarker, Polyline, Tooltip, ZoomControl, useMap
} from 'react-leaflet';
import { Play, Pause, RotateCcw, Waves, ChevronLeft, Settings, ArrowLeftRight, Sparkles } from 'lucide-react';
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

const MISSION_SET_KEY = 'THEATER_ASW';

// ─── Mission Advisor (plan §5.4) — keep this block identical across the five
// Autonomy Mission Series views except for the questions and accent color ────
const ADVISOR_QUESTIONS = [
  'Why only a single confirmation ping?',
  'How does a contact become a firing solution?',
  'What role does the MH-60R play?',
];

// ─── Geography — Luzon Strait, Taiwan-to-Luzon gap ───────────────────────────
const NM_TO_M = 1852;

const MAP_CENTER  = [21.00, 121.65];
const MAP_ZOOM    = 7;
const MAP_ZOOM_IN = 8;

const LCS_POS      = [21.70, 122.35];  // command node, north-east of the barrier
const M48_LEAD     = [21.00, 121.70];  // lead array, centre of the barrier (CAPTAS-4)
const M48_BRAVO    = [20.40, 121.95];  // south array
const M48_CHARLIE  = [21.55, 121.40];  // north array
const SUB_TRACK    = [[20.25, 121.00], [20.80, 121.55], [21.15, 121.85]];  // PLAN boat transit, SW → NE
const BARRIER_LINE = [[20.10, 122.10], [21.90, 121.35]];  // ~150 nm Taiwan-to-Luzon gap

const ARRAYS = [
  { pos: M48_LEAD,    key: 'lead' },
  { pos: M48_BRAVO,   key: 'bravo' },
  { pos: M48_CHARLIE, key: 'charlie' },
];

// ─── Tick milestones ──────────────────────────────────────────────────────────
const T_BARRIER  =  8;   // arrays streaming, EMCON — PASSIVE
const T_TONAL    = 22;   // first bearing from the nearest array
const T_CROSSFIX = 36;   // second and third bearings; track snaps to intersection
const T_WEAPONS  = 52;   // CTF-72 weapons free on the passive track
const T_HELO     = 60;   // MH-60R lifts from the LCS
const T_PING     = 68;   // the single active ping — held until the helo is inbound
const T_DROP     = 82;   // Mk 54 away — torpedo in the water
const T_KILL     = 90;   // detonation on the datum — confirmed kill
const T_COMPLETE = 102;  // helo home, barrier resumes
const TOTAL_TICKS = 102;

const PING_DURATION = 6;  // ticks the single expanding ring lives — exactly one, ever

const TICK_MS = 280;

// ─── Roster — order matches MISSION_ROLES[THEATER_ASW].roles ─────────────────
const VESSEL_ROSTER = [
  { name: 'LCS Command Node', roleDescriptor: '(Command Node)', image: HULL_IMAGES['Freedom-class LCS'], hullName: 'Freedom-class LCS', roleKey: 'TASW_LCS', capabilities: ['TempestOS Core Platform', 'USW-DSS (AN/UYQ-100)', 'Link 16 Track Broadcast', 'MILSATCOM Terminal', 'HiveLink SDR', 'NSYTE AI Maintenance System'] },
  { name: 'M48', roleDescriptor: '(Lead Array — Confirm Ping)', image: HULL_IMAGES['M48'], hullName: 'M48', roleKey: 'TASW_LEAD', capabilities: ['MFTA Towed Array', 'CAPTAS-4 Variable Depth Sonar', 'EvoLogics Acoustic Modem', 'HiveLink SDR', 'SeaFIND Inertial Navigation'] },
  { name: 'M48', roleDescriptor: '(Passive Array — Bravo)', image: HULL_IMAGES['M48'], hullName: 'M48', roleKey: 'TASW_ARRAY_1', capabilities: ['MFTA Towed Array', 'Bistatic Cross-Fix Node', 'EvoLogics Acoustic Modem', 'HiveLink SDR', 'SeaFIND Inertial Navigation'] },
  { name: 'M48', roleDescriptor: '(Passive Array — Charlie)', image: HULL_IMAGES['M48'], hullName: 'M48', roleKey: 'TASW_ARRAY_2', capabilities: ['MFTA Towed Array', 'Bistatic Cross-Fix Node', 'EvoLogics Acoustic Modem', 'HiveLink SDR', 'SeaFIND Inertial Navigation'] },
  { name: 'MH-60R Seahawk', roleDescriptor: '(Prosecutor)', image: HULL_IMAGES['MH-60R Seahawk'], hullName: 'MH-60R Seahawk', roleKey: 'TASW_PROSECUTOR', capabilities: ['AN/AQS-22 ALFS Dipping Sonar', 'Sonobuoys (DIFAR / DICASS)', 'Mk 54 Lightweight Torpedo', 'Link 16 Track Broadcast'] },
];

// ─── Phase narratives ─────────────────────────────────────────────────────────
const PHASE_NARRATIVE = {
  idle:        null,
  listening:   { title: 'The Barrier Listens', body: 'Three M48s tow passive MFTA arrays across the Taiwan-to-Luzon gap and never radiate. The barrier is held by machines under emission control; the LCS command node fuses whatever they hear. Nothing in the water is emitting.' },
  contact:     { title: 'A Tonal, One Bearing', body: 'A submarine tonal rises above threshold on the nearest array. One passive bearing is a line on a chart, not a target — the barrier stays silent and keeps listening while USW-DSS is tasked.' },
  crossfixing: { title: 'Cross-Fix Without a Sound', body: 'Overlapping bearings from the dispersed arrays intersect at the LCS. USW-DSS cross-fixes the contact into a track — still zero acoustic emissions. No single hull could have held this track alone.' },
  confirming:  { title: 'Exactly One Ping', body: 'With the MH-60R already inbound, the lead M48\'s CAPTAS-4 emits one active confirmation ping — one, and then silence again. Range and classification are confirmed seconds before the drop, so the barrier gives away nothing until the shooter is on top of the contact.' },
  authorizing: { title: 'Weapons Free — A Human Decides', body: 'CTF-72 evaluates the passive track and authorizes prosecution. The hunters stay silent and unlocalized; the decision to kill is made by people, off the barrier. The confirmation ping is held until the shooter is airborne.' },
  prosecuting: { title: 'Kill From the Air', body: 'The MH-60R lifts off the LCS flight deck — the only crewed asset exposed, after the contact is found, for the kill rather than the search. ALFS refines the datum and a Mk 54 goes on it.' },
  complete:    { title: 'Confirmed Kill — Barrier Held', body: 'Mk 54 detonation on the datum: contact destroyed, kill confirmed by the ALFS. The helo recovers to the LCS and the barrier resumes passive watch. Total acoustic emissions for the entire engagement: one ping. Hunt on passive. Confirm with one ping. Kill from the air.' },
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
  if (tick < T_BARRIER)  return 'idle';
  if (tick < T_TONAL)    return 'listening';
  if (tick < T_CROSSFIX) return 'contact';
  if (tick < T_WEAPONS)  return 'crossfixing';
  if (tick < T_HELO)     return 'authorizing';
  if (tick < T_PING)     return 'prosecuting';
  if (tick < T_PING + PING_DURATION) return 'confirming';
  if (tick < T_COMPLETE) return 'prosecuting';
  return 'complete';
};

// Submarine position along its transit track: moves from T_TONAL, freezes at the
// datum once the ping has fixed it, destroyed at T_KILL
const getSubPos = (tick) => {
  if (tick < T_TONAL) return null;
  if (tick >= T_KILL) return null;   // confirmed kill — the boat is gone
  const t = Math.min((tick - T_TONAL) / (T_PING - T_TONAL), 1);
  const seg = t * (SUB_TRACK.length - 1);
  const i = Math.min(Math.floor(seg), SUB_TRACK.length - 2);
  return lerp2(SUB_TRACK[i], SUB_TRACK[i + 1], seg - i);
};

// MH-60R: on deck until T_HELO, flies to the datum, drops, returns to the LCS
const getHeloPos = (tick, datum) => {
  if (tick < T_HELO || !datum) return null;
  if (tick >= T_COMPLETE) return null;
  const arrive = T_HELO + 10;
  if (tick < arrive) return lerp2(LCS_POS, datum, (tick - T_HELO) / (arrive - T_HELO));
  if (tick < T_KILL + 2) return datum;
  return lerp2(datum, LCS_POS, (tick - T_KILL - 2) / (T_COMPLETE - T_KILL - 2));
};

const getPhaseBadge = (phase) => {
  const m = {
    listening:   { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40',                  label: '◉ EMCON · Passive Barrier' },
    contact:     { cls: 'bg-cyan-900/80 text-cyan-200 border-cyan-400/40 animate-pulse',    label: '⌐ Tonal Above Threshold' },
    crossfixing: { cls: 'bg-cyan-900/80 text-cyan-200 border-cyan-400/40 animate-pulse',    label: '✕ USW-DSS Cross-Fix · Still Silent' },
    confirming:  { cls: 'bg-amber-900/80 text-amber-300 border-amber-500/40 animate-pulse', label: '◎ One Active Ping' },
    authorizing: { cls: 'bg-orange-900/80 text-orange-300 border-orange-500/40 animate-pulse', label: '⚑ CTF-72 · Weapons Free?' },
    prosecuting: { cls: 'bg-red-900/80 text-red-300 border-red-500/40 animate-pulse',       label: '➤ MH-60R Prosecuting' },
    complete:    { cls: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40',         label: '✓ Confirmed Kill · One Ping Total' },
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
    if (phase === 'crossfixing') {
      map.flyTo(MAP_CENTER, MAP_ZOOM_IN, { duration: 1.5 });
    } else if (phase === 'listening' || phase === 'idle') {
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
const TheaterASWMissionView = ({ mission, onBack }) => {
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

  const phase  = getPhase(currentTick);
  const subPos = getSubPos(currentTick);
  // The datum is where the ping caught the boat — frozen at the ping tick
  const datum  = getSubPos(Math.min(currentTick, T_PING));
  const heloPos = getHeloPos(currentTick, datum);

  // The single sonar ring: alive only in [T_PING, T_PING + PING_DURATION). Once.
  const pingAge  = currentTick - T_PING;
  const pingLive = pingAge >= 0 && pingAge < PING_DURATION;
  const pingRadiusNm = 8 + pingAge * 7;

  const bearingsVisible =
    currentTick >= T_TONAL
      ? (currentTick >= T_CROSSFIX ? 3 : 1)
      : 0;
  const crossFixed = currentTick >= T_CROSSFIX && currentTick < T_COMPLETE;
  const leadActive = pingLive;

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
    if (phase === 'authorizing' || phase === 'prosecuting') {
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
      const v1 = vesselLabelsRef.current[1] ?? 'M48 (Lead)';
      const v4 = vesselLabelsRef.current[4] ?? 'MH-60R Seahawk';
      setCurrentTick(tick);

      if (tick === T_BARRIER) {
        addEvtRef.current('Barrier established — 3× MFTA arrays streaming, EMCON PASSIVE', 'info');
        addEvtRef.current(`${v0}: USW-DSS up — fusing the passive picture`, 'info');
      }
      if (tick === T_TONAL) {
        addEvtRef.current('Passive tonal above threshold — one bearing held', 'warn');
        addEvtRef.current('Barrier stays silent — no emissions', 'info');
      }
      if (tick === T_CROSSFIX) {
        addEvtRef.current('Overlapping bearings cross-fix the contact — track opened', 'warn');
        addEvtRef.current(`${v0}: Track building toward firing-solution quality — still zero emissions`, 'info');
      }
      if (tick === T_WEAPONS) {
        addEvtRef.current('CTF-72: passive track at firing-solution quality — WEAPONS FREE', 'alert');
      }
      if (tick === T_HELO) {
        addEvtRef.current(`${v4}: Airborne off the LCS deck — only crewed asset exposed`, 'info');
      }
      if (tick === T_PING) {
        addEvtRef.current(`${v1}: CAPTAS-4 — ONE active confirmation ping — ${v4} inbound`, 'alert');
      }
      if (tick === T_PING + PING_DURATION) {
        addEvtRef.current('Silence resumed — firing solution confirmed for the drop', 'info');
      }
      if (tick === T_DROP) {
        addEvtRef.current(`${v4}: Mk 54 away — torpedo in the water`, 'alert');
      }
      if (tick === T_KILL) {
        addEvtRef.current('Detonation on the datum — CONFIRMED KILL', 'alert');
      }
      if (tick === T_KILL + 4) {
        addEvtRef.current(`${v4}: Kill assessed via ALFS — recovering to the LCS`, 'success');
      }
      if (tick === T_COMPLETE) {
        addEvtRef.current('Contact destroyed — barrier resumes passive watch', 'success');
        addEvtRef.current('Total acoustic emissions this engagement: 1 ping', 'success');
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
      template: 'THEATER_ASW',
      domain: 'MARITIME',
      status: 'draft',
      duration: 'continuous',
      zoneConfig: {
        name: 'Luzon Strait — Theater ASW Barrier — Taiwan to Luzon Gap',
        coordinates: [
          { lat: 20.10, lng: 120.90 }, { lat: 21.90, lng: 120.90 },
          { lat: 21.90, lng: 122.40 }, { lat: 20.10, lng: 122.40 },
        ],
        swarmSize: 3,
        swarmFormation: 'passive-barrier-line',
      },
      assignedSquadrons: ['sqdn_034', 'sqdn_016'],
      stateHierarchies: {
        default:        ['Payload', 'Navigation', 'Comms', 'Mission', 'Vehicle'],
        passive_hold:   ['Payload', 'Mission', 'Comms', 'Navigation', 'Vehicle'],
        confirm_ping:   ['Payload', 'Mission', 'Comms', 'Navigation', 'Vehicle'],
        prosecution:    ['Mission', 'Payload', 'Comms', 'Navigation', 'Vehicle'],
        emcon_degraded: ['Navigation', 'Payload', 'Mission', 'Vehicle', 'Comms'],
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

  // Which arrays contribute bearings: nearest first (lead), then bravo + charlie
  const bearingSources = [M48_LEAD, M48_BRAVO, M48_CHARLIE].slice(0, bearingsVisible);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col bg-darkest">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-700/50 flex-shrink-0 overflow-x-auto">
        <button onClick={onBack} className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-[0.75rem]">
          <ChevronLeft size={13} /> Back to Library
        </button>
        <div className="w-px h-4 bg-gray-700/60" />
        <Waves size={13} className="text-cyan-400" />
        <span className="text-cyan-400 text-[0.8rem] font-semibold tracking-wide">Theater ASW — Mission 03</span>
        <span className="hidden md:inline text-gray-600 text-[0.7rem]">·</span>
        <span className="hidden md:inline text-gray-500 text-[0.68rem]">Hunt on Passive · Confirm With One Ping · Kill From the Air</span>
        <div className="flex-1" />
        <button
          onClick={() => setShowAdvisor(v => !v)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[0.7rem] font-semibold transition-colors flex-shrink-0 ${showAdvisor ? 'border-cyan-500/60 bg-cyan-900/40 text-cyan-300' : 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/30'}`}
          title="Ask the Mission Advisor"
        >
          <Sparkles size={12} />
          <span className="hidden sm:inline">Ask the Advisor</span>
        </button>
        <span className="px-2 py-0.5 rounded-full bg-cyan-900/50 text-cyan-400 text-[0.65rem] font-bold uppercase tracking-wider border border-cyan-500/30">DRAFT</span>
        <input
          value={missionName}
          onChange={e => setMissionName(e.target.value)}
          placeholder="Mission name…"
          className="hidden md:block bg-gray-800/60 border border-gray-700/60 rounded-md px-3 py-1.5 text-white text-[0.78rem] w-52 placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
        />
        <button
          onClick={handleSave}
          disabled={!missionName.trim() || !isDeployable}
          className={`hidden md:block px-3 py-1.5 rounded-md text-[0.78rem] font-semibold transition-colors ${missionName.trim() && isDeployable ? 'bg-cyan-600 hover:bg-cyan-500 text-white' : 'bg-gray-700/50 text-gray-600 cursor-not-allowed'}`}
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

              {/* ── Barrier line ── */}
              <Polyline
                positions={BARRIER_LINE}
                pathOptions={{ color: '#0891b2', weight: 2, opacity: 0.5, dashArray: '10 8' }}
              >
                <Tooltip direction="top" sticky>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#22d3ee' }}>ASW Barrier — ~150 nm Taiwan-to-Luzon gap</span>
                </Tooltip>
              </Polyline>

              {/* ── The single sonar ring — exactly one for the entire mission ── */}
              {pingLive && (
                <Circle
                  center={M48_LEAD}
                  radius={pingRadiusNm * NM_TO_M}
                  pathOptions={{ color: '#fbbf24', weight: 2, fill: false, opacity: Math.max(0.9 - pingAge * 0.15, 0.1) }}
                />
              )}

              {/* ── Passive bearing lines ── */}
              {subPos && bearingSources.map((src, i) => (
                <Polyline
                  key={`bearing-${i}`}
                  positions={[src, crossFixed && datum ? datum : subPos]}
                  pathOptions={{ color: crossFixed ? '#22d3ee' : '#67e8f9', weight: crossFixed ? 1.6 : 1.1, opacity: crossFixed ? 0.7 : 0.45, dashArray: crossFixed ? undefined : '4 6' }}
                />
              ))}

              {/* ── Cross-fixed track marker ── */}
              {crossFixed && datum && (
                <CircleMarker
                  center={currentTick < T_PING ? subPos : datum}
                  radius={7}
                  pathOptions={{ color: '#f87171', fill: false, weight: 2, dashArray: '3 3' }}
                >
                  <Tooltip direction="right" offset={[8, 0]}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#f87171' }}>
                      {currentTick >= T_PING ? 'Firing-Solution Quality' : 'Cross-Fixed Track'}
                    </span>
                  </Tooltip>
                </CircleMarker>
              )}

              {/* ── Hostile submarine ── */}
              {subPos && (
                <CircleMarker
                  center={subPos}
                  radius={8}
                  pathOptions={{ color: '#ef4444', fillColor: '#450a0a', fillOpacity: 0.9, weight: 2 }}
                >
                  <Tooltip direction="bottom" offset={[0, 8]}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444' }}>PLAN Submarine</span>
                  </Tooltip>
                </CircleMarker>
              )}

              {/* ── Mk 54 detonation on the datum ── */}
              {currentTick >= T_KILL && currentTick < T_KILL + 8 && datum && (
                <Circle
                  center={datum}
                  radius={(2 + (currentTick - T_KILL) * 2.5) * NM_TO_M}
                  pathOptions={{ color: '#f97316', weight: 2.5, fillColor: '#f97316', fillOpacity: Math.max(0.4 - (currentTick - T_KILL) * 0.06, 0), opacity: Math.max(0.9 - (currentTick - T_KILL) * 0.12, 0.1) }}
                />
              )}

              {/* ── Confirmed kill marker — persists once the boat is dead ── */}
              {currentTick >= T_KILL + 2 && datum && (
                <CircleMarker
                  center={datum}
                  radius={7}
                  pathOptions={{ color: '#ef4444', fillColor: '#7f1d1d', fillOpacity: 0.9, weight: 2.5 }}
                >
                  <Tooltip direction="bottom" offset={[0, 8]} permanent>
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#ef4444' }}>✕ CONFIRMED KILL</span>
                  </Tooltip>
                </CircleMarker>
              )}

              {/* ── M48 arrays with trailing MFTA lines ── */}
              {ARRAYS.map((a, i) => {
                const isLead = i === 0;
                const active = isLead && leadActive;
                const trail = [a.pos, [a.pos[0] - 0.14, a.pos[1] - 0.10]];
                return (
                  <React.Fragment key={a.key}>
                    {currentTick >= T_BARRIER && (
                      <Polyline
                        positions={trail}
                        pathOptions={{ color: '#0891b2', weight: 1.4, opacity: 0.55, dashArray: '2 4' }}
                      />
                    )}
                    <CircleMarker
                      center={a.pos}
                      radius={active ? 12 : 10}
                      pathOptions={{ color: active ? '#fbbf24' : '#0891b2', fillColor: active ? '#92400e' : '#164e63', fillOpacity: 0.95, weight: 2 }}
                    >
                      <Tooltip direction="top" offset={[0, -8]}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: active ? '#fbbf24' : '#22d3ee' }}>
                          {active
                            ? `${effectiveRoster[1]?.hullName ?? 'M48'} — ACTIVE, 1 PING`
                            : `${effectiveRoster[i + 1]?.hullName ?? 'M48'} — EMCON PASSIVE`}
                        </span>
                      </Tooltip>
                    </CircleMarker>
                  </React.Fragment>
                );
              })}

              {/* ── MH-60R prosecutor ── */}
              {heloPos && (
                <>
                  <Polyline
                    positions={[LCS_POS, heloPos]}
                    pathOptions={{ color: '#f97316', weight: 1.2, opacity: 0.5, dashArray: '3 6' }}
                  />
                  <CircleMarker
                    center={heloPos}
                    radius={9}
                    pathOptions={{ color: '#f97316', fillColor: '#7c2d12', fillOpacity: 0.95, weight: 2 }}
                  >
                    <Tooltip direction="top" offset={[0, -8]}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#fb923c' }}>
                        {`${effectiveRoster[4]?.hullName ?? 'MH-60R'} — ${currentTick >= T_DROP ? 'Mk 54 away' : 'inbound to datum'}`}
                      </span>
                    </Tooltip>
                  </CircleMarker>
                </>
              )}

              {/* ── LCS command node ── */}
              <CircleMarker
                center={LCS_POS}
                radius={phase === 'authorizing' && pulse ? 17 : 14}
                pathOptions={{ color: phase === 'authorizing' ? '#fbbf24' : '#0891b2', fillColor: phase === 'authorizing' ? '#92400e' : '#155e75', fillOpacity: 0.95, weight: 3 }}
              >
                <Tooltip direction="top" offset={[0, -10]} permanent={phase === 'authorizing'}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: phase === 'authorizing' ? '#fbbf24' : '#22d3ee' }}>
                    {phase === 'authorizing' ? 'CTF-72 — Weapons Free Authorization' : 'LCS Command Node'}
                  </span>
                </Tooltip>
              </CircleMarker>

            </MapContainer>

            {/* ── Corner feed: the prosecution — helo, torpedo, confirmed kill ── */}
            {currentTick >= T_HELO && (() => {
              const W = 240, H = 160;
              const waterY = 72;
              const heloImg = effectiveRoster[4]?.image;

              // Helo flies in from the left and hovers DIRECTLY over the boat,
              // nose-forward (art is mirrored below), so the drop is a plumb line.
              // When it turns for home on the main map (T_KILL + 2), it exits the
              // frame to the right — it should not linger over a dead contact.
              const heloArrive = T_HELO + 8;
              const heloDepart = T_KILL + 2;
              const heloX = currentTick < heloArrive
                ? -70 + ((currentTick - T_HELO) / (heloArrive - T_HELO)) * 218
                : currentTick < heloDepart
                  ? 148   // image center ≈ heloX + 10 = 158 — right above the sub
                  : 148 + ((currentTick - heloDepart) / (T_COMPLETE - heloDepart)) * 220;

              // Torpedo: released over the boat and falls STRAIGHT DOWN
              let torpY = null;
              const torpX = 158;
              if (currentTick >= T_DROP && currentTick < T_KILL) {
                const p = (currentTick - T_DROP) / (T_KILL - T_DROP);
                torpY = 52 + p * (120 - 52);
              }

              const subVisible = currentTick < T_KILL + 2;
              const explAge = currentTick - T_KILL;
              const exploding = explAge >= 0 && explAge < 8;
              const killed = currentTick >= T_KILL + 6;

              return (
                <div
                  className="absolute bottom-3 right-3 z-[500] pointer-events-none"
                  style={{ width: W, height: H, borderRadius: 12, overflow: 'hidden',
                    background: 'rgba(5,10,18,0.88)', border: '1px solid rgba(100,120,150,0.3)',
                    backdropFilter: 'blur(4px)' }}
                >
                  {/* Helicopter artwork — mirrored so the nose leads the flight path */}
                  {heloImg && (
                    <img
                      src={heloImg} alt="MH-60R"
                      style={{ position: 'absolute', left: heloX - 55, top: 6,
                        width: 130, height: 62, objectFit: 'contain', opacity: 0.95,
                        transform: 'scaleX(-1)' }}
                    />
                  )}

                  <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
                    {/* Water line and column */}
                    <line x1={0} y1={waterY} x2={W} y2={waterY} stroke="#164e63" strokeWidth={2} />
                    <rect x={0} y={waterY} width={W} height={H - waterY} fill="#0c2233" opacity={0.65} />

                    {/* Dipping-sonar cable while on station, before the drop */}
                    {currentTick >= heloArrive && currentTick < T_DROP && (
                      <>
                        <line x1={heloX + 10} y1={54} x2={heloX + 10} y2={104} stroke="#22d3ee" strokeWidth={1} strokeDasharray="4 3" />
                        <circle cx={heloX + 10} cy={108} r={4} fill="none" stroke="#22d3ee" strokeWidth={1.2} />
                      </>
                    )}

                    {/* Torpedo — nose-down, falling vertically onto the boat */}
                    {torpY !== null && (
                      <g transform={`translate(${torpX},${torpY}) rotate(90)`}>
                        <rect x={-7} y={-2} width={14} height={4} rx={2} fill="#fbbf24" />
                      </g>
                    )}

                    {/* The boat */}
                    {subVisible && (
                      <g transform="translate(158,124)">
                        <ellipse cx={0} cy={0} rx={30} ry={7} fill="#450a0a" stroke="#ef4444" strokeWidth={1.5} />
                        <rect x={-5} y={-13} width={10} height={7} rx={2} fill="#450a0a" stroke="#ef4444" strokeWidth={1.2} />
                      </g>
                    )}

                    {/* Detonation */}
                    {exploding && (
                      <>
                        <circle cx={158} cy={124} r={6 + explAge * 5} fill="#f97316" opacity={Math.max(0.55 - explAge * 0.07, 0)} />
                        <circle cx={158} cy={124} r={10 + explAge * 7} fill="none" stroke="#fbbf24" strokeWidth={2} opacity={Math.max(0.9 - explAge * 0.12, 0)} />
                      </>
                    )}

                    {/* Kill confirmation */}
                    {killed && (
                      <text x={W / 2} y={H - 14} textAnchor="middle" fontSize={13} fontWeight={800} fill="#4ade80" fontFamily="monospace">
                        ✕ CONFIRMED KILL
                      </text>
                    )}
                  </svg>
                </div>
              );
            })()}

            {/* ── Emissions counter — the deck's argument in one number ── */}
            <div className="absolute top-3 right-3 z-[500] pointer-events-none px-3 py-2 rounded-xl bg-gray-950/85 border border-cyan-500/30 backdrop-blur-sm">
              <div className="text-[0.6rem] uppercase tracking-widest text-cyan-400/80 font-bold mb-0.5">Barrier Acoustic Emissions</div>
              <div className="text-[0.72rem] text-gray-200 tabular-nums">
                Active pings this mission: <span className={`font-bold ${currentTick >= T_PING ? 'text-amber-400' : 'text-emerald-400'}`}>{currentTick >= T_PING ? 1 : 0}</span>
              </div>
            </div>

            {/* ── Phase badge ── */}
            {badge && (
              <div className={`absolute top-3 left-3 z-[500] px-3 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wider pointer-events-none border ${badge.cls}`}>
                {badge.label}
              </div>
            )}

            {/* ── Legend ── */}
            {currentTick >= T_BARRIER && (
              <div className="hidden md:block absolute bottom-3 left-3 z-[500] pointer-events-none px-3 py-2 rounded-xl bg-gray-950/80 border border-gray-700/50 backdrop-blur-sm">
                <div className="flex flex-col gap-1">
                  {[
                    { color: '#0891b2', label: `${effectiveRoster[0]?.name ?? 'LCS'} — Command Node` },
                    { color: '#22d3ee', label: '3× M48 — Passive MFTA Barrier' },
                    { color: '#fbbf24', label: 'Lead M48 — CAPTAS-4 (1 ping)' },
                    { color: '#f97316', label: `${effectiveRoster[4]?.name ?? 'MH-60R'} — Prosecutor` },
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
                  1× LCS · 3× M48 · MH-60R
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
          title="Mission Advisor — Theater ASW"
          accentColor="cyan"
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

export default TheaterASWMissionView;
