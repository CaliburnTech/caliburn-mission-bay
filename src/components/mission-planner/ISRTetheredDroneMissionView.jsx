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
import m48Img from '../../assets/images/M48.png';

const MISSION_SET_KEY = 'ISR';
const MISSION_SET_CAPS = ['DPI Vulture Tethered UAS', 'HiddenLevel Passive RF Sensor', 'Project Scion (Northrop Grumman)', 'RazorChassis FC Integration'];

// ─── Geography ────────────────────────────────────────────────────────────────
const NM_TO_M = 1852;

const MAP_CENTER = [25.85, 55.10];
const MAP_ZOOM   = 10;

const M48_TRACK = [
  [25.65, 54.85],
  [25.80, 55.00],
  [25.92, 55.18],
  [25.78, 55.30],
  [25.60, 55.15],
  [25.65, 54.85],
];

const ABU_MUSA       = [25.875, 55.033];
const THREAT_ORIGIN  = [25.92, 55.05];
const NAVCENT_POS    = [26.22, 50.58];
const USS_LABOON_POS = [25.60, 54.80];

const THREAT_TRACK = [
  [25.92, 55.05],
  [25.85, 54.98],
  [25.76, 54.88],
  [25.65, 54.75],
];

// Exact last position on the threat track — destroy marker and missile target land here
const KILL_POS = THREAT_TRACK[THREAT_TRACK.length - 1];

const SHIPPING_LANE = [
  [25.50, 54.60],
  [25.70, 54.90],
  [25.90, 55.20],
];

const LANTERN_RADAR_NM = 17;
const HIDDENLEVEL_NM   = 25;

// ─── Tick milestones ──────────────────────────────────────────────────────────
const T_PATROL_START    = 5;
const T_LANTERN_DEPLOY  = 12;  // drone leaves deck — ring starts growing
const T_LANTERN_FULL    = 27;  // drone at 200ft — ring fully expanded, pulse begins
const T_ON_STATION      = 20;
const T_RF_DETECT       = 30;
const T_RADAR_TRACK     = 38;
const T_EO_VISUAL       = 45;
const T_SCION_CLASSIFY  = 52;
const T_THREAT_CONFIRM  = 60;
const T_RAZOR_CUEING    = 67;
const T_FC_ALERTED      = 74;
const T_MISSILE_LAUNCH  = 78;  // "ESSM AWAY" — missile dot appears
const T_THREAT_NEUT     = 82;  // missile hits — threat gone
const T_LANE_SECURE     = 90;
const TOTAL_TICKS       = 100;

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

// ─── Derived position helpers ─────────────────────────────────────────────────
const getPhase = (tick) => {
  if (tick < T_PATROL_START)   return 'idle';
  if (tick < T_LANTERN_DEPLOY) return 'm48_patrol';
  if (tick < T_RF_DETECT)      return 'lantern_deployed';
  if (tick < T_RADAR_TRACK)    return 'rf_detect';
  if (tick < T_SCION_CLASSIFY) return 'radar_track';
  if (tick < T_THREAT_CONFIRM) return 'scion_classify';
  if (tick < T_RAZOR_CUEING)   return 'threat_confirmed';
  if (tick < T_FC_ALERTED)     return 'razorchassis_cueing';
  if (tick < T_THREAT_NEUT)    return 'fire_control_alerted';
  if (tick < T_LANE_SECURE)    return 'threat_neutralized';
  return 'lane_secure';
};

const getM48Pos = (tick) => {
  if (tick < T_PATROL_START) return M48_TRACK[0];
  const t = (tick - T_PATROL_START) / (TOTAL_TICKS - T_PATROL_START);
  return trackPos(M48_TRACK, t);
};

const getThreatPos = (tick) => {
  if (tick < T_RF_DETECT)      return null;
  if (tick < T_THREAT_CONFIRM) return THREAT_ORIGIN;
  if (tick >= T_THREAT_NEUT)   return null;
  const t = (tick - T_THREAT_CONFIRM) / (T_THREAT_NEUT - T_THREAT_CONFIRM);
  return trackPos(THREAT_TRACK, t);
};

const getPhaseBadge = (phase) => {
  switch (phase) {
    case 'm48_patrol':          return { cls: 'bg-blue-900/80 text-blue-300 border-blue-500/40',                  label: '→ M48-ALPHA Autonomous Patrol' };
    case 'lantern_deployed':    return { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40',                  label: '↑ DPI Vulture Ascending — 200ft' };
    case 'rf_detect':           return { cls: 'bg-amber-900/80 text-amber-300 border-amber-500/40 animate-pulse', label: '⚠ HiddenLevel RF Anomaly' };
    case 'radar_track':         return { cls: 'bg-amber-900/80 text-amber-300 border-amber-500/40 animate-pulse', label: '⚠ DPI Vulture Radar Track Initiated' };
    case 'scion_classify':      return { cls: 'bg-violet-900/80 text-violet-300 border-violet-500/40 animate-pulse', label: '◈ Scion — Multi-Sensor Fusion' };
    case 'threat_confirmed':    return { cls: 'bg-red-900/80 text-red-300 border-red-500/40 animate-pulse',       label: '⚡ THREAT CONFIRMED — Shahed-136' };
    case 'razorchassis_cueing': return { cls: 'bg-red-900/80 text-red-300 border-red-500/40 animate-pulse',       label: '⚡ RazorChassis FC Track Transmitted' };
    case 'fire_control_alerted':return { cls: 'bg-amber-900/80 text-amber-300 border-amber-500/40',               label: '→ USS Laboon Engagement Solution Locked' };
    case 'threat_neutralized':  return { cls: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40',         label: '✓ Shahed-136 Destroyed' };
    case 'lane_secure':         return { cls: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40',         label: '✓ Shipping Lane Secure — Patrol Resuming' };
    default: return null;
  }
};

// ─── Phase narratives ─────────────────────────────────────────────────────────
const PHASE_NARRATIVE = {
  idle:                   null,
  m48_patrol:             { title: 'M48-ALPHA Autonomous Patrol', body: 'M48-ALPHA executing DriveAI waypoint loop in Abu Musa approaches. HiddenLevel passive RF sensor monitoring zero-emissions posture. DPI Vulture tethered UAS pre-deployed on deck.' },
  lantern_deployed:       { title: 'DPI Vulture Ascending', body: 'DPI Vulture deployed — ascending to 200ft tether limit. Radar horizon expanding as altitude increases. Trillium HD40 EO/IR camera slewing to full 360° surveillance coverage.' },
  rf_detect:              { title: 'HiddenLevel RF Anomaly', body: 'HiddenLevel passive sensor detects unscheduled RF emission at 25.90°N 55.03°E — bearing 005. Emission profile cross-correlated against Shahed-class drone RF library. Cueing DPI Vulture radar.' },
  radar_track:            { title: 'DPI Vulture Radar Track', body: 'DPI Vulture radar initiates track — air contact bearing 005, range 14nm, altitude 300ft. EO/IR slewing to contact for visual acquisition. Scion autonomy stack receiving multi-sensor feeds.' },
  scion_classify:         { title: 'Scion Multi-Sensor Fusion', body: 'Scion fusing RF signature, radar track, and EO/IR visual. Three independent sensor modalities corroborating single threat hypothesis. Classification confidence building — track quality rising to fire-control grade.' },
  threat_confirmed:       { title: 'Threat Confirmed — Shahed-136', body: 'Scion classification complete: Shahed-136 class loitering munition — 94% confidence. Projected course intercepts VLCC shipping lane in 8 minutes. RazorChassis fire control track generated.' },
  razorchassis_cueing:    { title: 'RazorChassis FC Track Transmitted', body: 'RazorChassis pushes fire-control-quality track to NAVCENT MOC network. Track includes lat/lon, heading, speed, altitude. Cueing USS Laboon AN/SPY-1 fire control radar for ESSM intercept solution.' },
  fire_control_alerted:   { title: 'USS Laboon Engagement Solution Locked', body: 'NAVCENT MOC receives RazorChassis track — ESSM engagement solution computed. USS Laboon CIC reports weapons free. M48-ALPHA provided fire-control-grade data without any crewed vessel exposure.' },
  threat_neutralized:     { title: 'Shahed-136 Destroyed', body: 'USS Laboon ESSM detonates proximate to Shahed-136. Track terminated — debris field confirmed. NAVCENT: threat neutralized. M48-ALPHA resumes patrol — zero crew exposure throughout engagement.' },
  lane_secure:            { title: 'Shipping Lane Secure', body: 'Shipping lane VLCC corridor declared safe. HiddenLevel continues passive RF monitoring. M48-ALPHA resuming waypoint patrol in Gulf-7 sector. TF59 SITREP: autonomous ISR platform cued successful DDG engagement.' },
};

// ─── Loadouts ─────────────────────────────────────────────────────────────────
const M48_MOUNTS = [
  { slot: 'ISR DRONE',          name: 'DPI Vulture Tethered UAS',       vendor: 'Dragonfly Pictures Inc.'    },
  { slot: 'RF / PASSIVE RADAR', name: 'HiddenLevel Passive RF Sensor',   vendor: 'HiddenLevel'             },
  { slot: 'AUTONOMY',           name: 'Project Scion (Northrop Grumman)',vendor: 'Northrop Grumman'        },
  { slot: 'FIRE CONTROL LINK',  name: 'RazorChassis FC Integration',     vendor: 'RazorChassis'            },
];

const LANTERN_MOUNTS = [
  { slot: 'EO/IR', name: 'Trillium HD40 EO/IR Camera',        vendor: 'L3Harris Trillium' },
  { slot: 'RADAR', name: 'Maritime Surface/Air Search Radar', vendor: '[Classified]'      },
];

const VESSEL_ROSTER = [
  { name: 'M48 (DPI Vulture)', roleDescriptor: '(DPI Vulture)', image: imgM48, hullName: 'M48', capabilities: ['DPI Vulture Tethered UAS', 'HiddenLevel Passive RF Sensor', 'Project Scion (Northrop Grumman)', 'RazorChassis FC Integration'], roleKey: 'ISR_M48_LANTERN' },
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
const ISRTetheredDroneMissionView = ({ mission, onBack }) => {
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
  const [threatPulse,     setThreatPulse]     = useState(false);
  const [lanternPulse,    setLanternPulse]    = useState(false);
  const [lanternDeployed, setLanternDeployed] = useState(false);
  const [events,          setEvents]          = useState([]);
  const [running,         setRunning]         = useState(false);
  const [paused,        setPaused]        = useState(false);
  const [complete,        setComplete]        = useState(false);

  const tickRef      = useRef(0);
  const tickCallbackRef = useRef(null);
  const mainTimer    = useRef(null);
  const pulseTimer   = useRef(null);
  const lanternTimer = useRef(null);
  const addEvtRef    = useRef(null);
  const vesselLabelsRef = useRef([]);

  const phase     = getPhase(currentTick);
  const m48Pos    = getM48Pos(currentTick);
  const threatPos = getThreatPos(currentTick);
  const showThreat  = currentTick >= T_RF_DETECT && currentTick < T_THREAT_NEUT;
  const showDestroy = currentTick >= T_THREAT_NEUT && currentTick < TOTAL_TICKS;

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

  useEffect(() => {
    clearInterval(pulseTimer.current);
    const needsPulse = [
      'rf_detect', 'radar_track', 'scion_classify',
      'threat_confirmed', 'razorchassis_cueing', 'fire_control_alerted'
    ].includes(phase);
    if (needsPulse) {
      pulseTimer.current = setInterval(() => setThreatPulse(p => !p), 350);
      return () => clearInterval(pulseTimer.current);
    }
    setThreatPulse(false);
  }, [phase]);

  useEffect(() => {
    clearInterval(lanternTimer.current);
    if (lanternDeployed) {
      lanternTimer.current = setInterval(() => setLanternPulse(p => !p), 2000);
      return () => clearInterval(lanternTimer.current);
    }
    setLanternPulse(false);
  }, [lanternDeployed]);

  const stopAll = useCallback(() => {
    clearInterval(mainTimer.current);
    clearInterval(pulseTimer.current);
    clearInterval(lanternTimer.current);
    mainTimer.current = pulseTimer.current = lanternTimer.current = null;
  }, []);

  const reset = useCallback(() => {
    stopAll();
    tickRef.current = 0;
    setPaused(false);
    setCurrentTick(0);
    setThreatPulse(false);
    setLanternPulse(false);
    setLanternDeployed(false);
    setEvents([]);
    setRunning(false);
    setComplete(false);
  }, [stopAll]);

  const runScenario = useCallback(() => {
    stopAll();
    tickRef.current = 0;
    setCurrentTick(0);
    setThreatPulse(false);
    setLanternPulse(false);
    setLanternDeployed(false);
    setEvents([]);
    setRunning(true);
    setPaused(false);
    setComplete(false);

    const cb = () => {
      const tick = ++tickRef.current;
      const v0 = vesselLabelsRef.current[0] ?? 'M48 (DPI Vulture)';
      setCurrentTick(tick);

      if (tick === T_PATROL_START) {
        addEvtRef.current(`${v0}: Autonomous patrol initiated — Abu Musa sector`, 'info');
        addEvtRef.current(`${v0}: DriveAI online — waypoint ALPHA set`, 'info');
      }
      if (tick === T_LANTERN_DEPLOY) {
        addEvtRef.current(`${v0}: DPI Vulture deployed — ascending to 200ft`, 'info');
      }
      if (tick === T_ON_STATION) {
        addEvtRef.current(`NAVCENT: ${v0} on station — Task Force 59 sector GULF-7`, 'info');
      }
      if (tick === T_LANTERN_FULL) {
        setLanternDeployed(true);
        addEvtRef.current(`${v0}: DPI Vulture at altitude — Trillium HD40 EO/IR online, 17nm radar horizon established`, 'info');
        addEvtRef.current('HiddenLevel: Passive RF monitoring active — zero emissions', 'info');
      }
      if (tick === T_RF_DETECT) {
        addEvtRef.current('HiddenLevel: RF ANOMALY — unscheduled emission at 25.90°N 55.03°E — bearing 005 from M48', 'warn');
        addEvtRef.current('HiddenLevel: Emission signature consistent with Shahed-class drone RF profile', 'warn');
      }
      if (tick === T_RADAR_TRACK) {
        addEvtRef.current('DPI Vulture RADAR: TRACK INITIATED — air contact, bearing 005, range 14nm, altitude 300ft', 'warn');
        addEvtRef.current('DPI Vulture EO/IR: Slewing to bearing 005 — contact acquisition', 'info');
      }
      if (tick === T_EO_VISUAL) {
        addEvtRef.current('DPI Vulture EO/IR: Visual contact — monoplane UAS, wingspan ~3m — POSSIBLE HOSTILE', 'warn');
        addEvtRef.current(`${v0}: Contact relayed to Scion autonomy stack — classification in progress`, 'info');
      }
      if (tick === T_SCION_CLASSIFY) {
        addEvtRef.current('SCION: Multi-sensor fusion in progress — RF + Radar + EO/IR correlation', 'info');
        addEvtRef.current('SCION: Track confidence 78% — continuing classification', 'info');
        addEvtRef.current(`NAVCENT: ${v0} reporting unidentified air contact — TF59 alerted`, 'warn');
      }
      if (tick === T_THREAT_CONFIRM) {
        addEvtRef.current('SCION: CLASSIFICATION COMPLETE — Shahed-136 class loitering munition — confidence 94%', 'alert');
        addEvtRef.current('SCION: Projected course intercepts VLCC shipping lane in approx 8min — THREAT', 'alert');
        addEvtRef.current(`NAVCENT: Threat confirmed — hostile UAS bearing 005, range 11nm from ${v0}`, 'alert');
      }
      if (tick === T_RAZOR_CUEING) {
        addEvtRef.current('RAZORCHASSIS: Fire control track generated — lat 25.85°N 55.00°E, hdg 230, 85kt', 'alert');
        addEvtRef.current('RAZORCHASSIS: Track quality — fire control grade — pushing to NAVCENT MOC network', 'alert');
        addEvtRef.current('RAZORCHASSIS: Cueing USS Laboon fire control radar for intercept', 'alert');
      }
      if (tick === T_FC_ALERTED) {
        addEvtRef.current('NAVCENT MOC: Fire control track received — engagement solution computed', 'info');
        addEvtRef.current('USS Laboon: ESSM engagement solution locked — STANDING BY', 'warn');
        addEvtRef.current('NAVCENT: Weapons free authorized — engagement in progress', 'alert');
      }
      if (tick === T_MISSILE_LAUNCH) {
        addEvtRef.current('USS Laboon: ESSM AWAY — missile inbound', 'alert');
      }
      if (tick === T_THREAT_NEUT) {
        addEvtRef.current('SCION: Track terminated — contact destroyed', 'success');
        addEvtRef.current('NAVCENT: THREAT NEUTRALIZED — Shahed-136 down — shipping lane secure', 'success');
      }
      if (tick === T_LANE_SECURE) {
        addEvtRef.current(`${v0}: Resuming patrol — continuing TF59 Gulf-7 sector coverage`, 'info');
        addEvtRef.current('HiddenLevel: RF monitoring active — no further anomalies detected', 'info');
        addEvtRef.current('NAVCENT: SITREP — TF59 autonomous ISR platform successfully cued DDG engagement — zero crew exposure', 'success');
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
      template: 'ISR',
      domain: 'MARITIME',
      status: 'active',
      duration: 'continuous',
      zoneConfig: {
        name: 'Abu Musa Approaches — Arabian Gulf Sector Gulf-7',
        coordinates: [
          { lat: 25.50, lng: 54.70 },
          { lat: 26.10, lng: 54.70 },
          { lat: 26.10, lng: 55.40 },
          { lat: 25.50, lng: 55.40 },
        ],
        swarmSize: 1,
        swarmFormation: 'loiter',
      },
      assignedSquadrons: ['sqdn_016'],
      stateHierarchies: {
        default:          ['Navigation', 'Payload', 'Comms', 'Mission', 'Vehicle'],
        contact_detected: ['Payload', 'Mission', 'Comms', 'Navigation', 'Vehicle'],
        threat_confirmed: ['Mission', 'Payload', 'Comms', 'Navigation', 'Vehicle'],
        comms_degraded:   ['Navigation', 'Mission', 'Vehicle', 'Comms', 'Payload'],
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
  const badge      = getPhaseBadge(phase);
  const narrative  = PHASE_NARRATIVE[phase] || null;
  const showFCLink = ['razorchassis_cueing', 'fire_control_alerted', 'threat_neutralized', 'lane_secure'].includes(phase);
  const laneSec    = phase === 'lane_secure';

  const tColor = ['threat_confirmed', 'razorchassis_cueing', 'fire_control_alerted'].includes(phase)
    ? '#ef4444'
    : (threatPulse ? '#fbbf24' : '#f97316');

  // LANTERN ring: grows from radius 0 as drone ascends (ticks 12→27), pulses gently at full altitude
  const lanternRiseProgress = currentTick < T_LANTERN_DEPLOY ? 0
    : Math.min((currentTick - T_LANTERN_DEPLOY) / (T_LANTERN_FULL - T_LANTERN_DEPLOY), 1);
  const lanternBaseR = lanternRiseProgress * LANTERN_RADAR_NM * NM_TO_M;
  const lanternRingR = lanternDeployed
    ? (lanternPulse ? lanternBaseR + 200 : lanternBaseR - 200)
    : lanternBaseR;
  const lanternRising = currentTick >= T_LANTERN_DEPLOY && !lanternDeployed;

  // HiddenLevel → M48 comms dot: travels from threat origin to M48 during rf_detect
  const rfDotT   = phase === 'rf_detect'
    ? Math.min((currentTick - T_RF_DETECT) / (T_RADAR_TRACK - T_RF_DETECT), 1)
    : null;
  const rfDotPos = rfDotT !== null ? lerp2(THREAT_ORIGIN, m48Pos, rfDotT) : null;

  // Scion classification pulse ring around M48
  const showScionRing = phase === 'scion_classify';

  // RazorChassis uplink dot: travels from M48 toward NAVCENT during razorchassis_cueing
  const fcDotT   = phase === 'razorchassis_cueing'
    ? Math.min((currentTick - T_RAZOR_CUEING) / (T_FC_ALERTED - T_RAZOR_CUEING), 1)
    : null;
  const fcDotPos = fcDotT !== null ? lerp2(m48Pos, NAVCENT_POS, fcDotT) : null;

  // Missile dot: travels from USS Laboon to kill position (ticks 78→82)
  const missilePos = currentTick >= T_MISSILE_LAUNCH && currentTick < T_THREAT_NEUT
    ? lerp2(USS_LABOON_POS, KILL_POS,
        (currentTick - T_MISSILE_LAUNCH) / (T_THREAT_NEUT - T_MISSILE_LAUNCH))
    : null;

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
        <Anchor size={13} className="text-violet-400" />
        <span className="text-violet-400 text-[0.8rem] font-semibold tracking-wide">Gulf-7 Persistent ISR — Task Force 59</span>
        <span className="hidden md:inline text-gray-600 text-[0.7rem]">·</span>
        <span className="hidden md:inline text-gray-500 text-[0.68rem]">{effectiveRoster[0]?.name ?? 'M48'} + DPI Vulture + HiddenLevel → RazorChassis FC Link — Arabian Gulf</span>
        <div className="flex-1" />
        <span className="px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-400 text-[0.65rem] font-bold uppercase tracking-wider border border-emerald-500/30">
          ACTIVE
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

              {/* Shipping lane — glows green once secure */}
              <Polyline
                positions={SHIPPING_LANE}
                pathOptions={{
                  color:     laneSec ? '#10b981' : '#4ade80',
                  opacity:   laneSec ? 0.85 : 0.22,
                  weight:    laneSec ? 3.5 : 1.5,
                  dashArray: laneSec ? null : '6 6',
                }}
              />
              {laneSec && (
                <Polyline
                  positions={SHIPPING_LANE}
                  pathOptions={{ color: '#10b981', opacity: 0.25, weight: 10, dashArray: null }}
                />
              )}

              {/* HiddenLevel passive coverage ring — appears once LANTERN is fully deployed */}
              {lanternDeployed && (
                <Circle
                  center={m48Pos}
                  radius={HIDDENLEVEL_NM * NM_TO_M}
                  pathOptions={{ color: '#8b5cf6', fillColor: '#8b5cf6', fillOpacity: 0.04, weight: 1, opacity: 0.22, dashArray: '4 10' }}
                />
              )}

              {/* LANTERN radar horizon ring — visible from tick 12, grows to full radius by tick 27 */}
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

              {/* RF emission rings from threat origin — pulsing radar echo during rf_detect */}
              {phase === 'rf_detect' && (
                <>
                  <Circle
                    center={THREAT_ORIGIN}
                    radius={threatPulse ? 9000 : 5000}
                    pathOptions={{ color: '#f97316', fillOpacity: 0, weight: 1.5, opacity: threatPulse ? 0.55 : 0.20 }}
                  />
                  <Circle
                    center={THREAT_ORIGIN}
                    radius={threatPulse ? 5000 : 9000}
                    pathOptions={{ color: '#f97316', fillOpacity: 0, weight: 1, opacity: threatPulse ? 0.20 : 0.45 }}
                  />
                </>
              )}

              {/* RF signal comms dot: HiddenLevel → M48 */}
              {rfDotPos && (
                <CircleMarker
                  center={rfDotPos}
                  radius={4}
                  pathOptions={{ color: '#f97316', fillColor: '#fbbf24', fillOpacity: 1, weight: 1 }}
                />
              )}

              {/* RF anomaly bearing line */}
              {phase === 'rf_detect' && (
                <Polyline
                  positions={[THREAT_ORIGIN, m48Pos]}
                  pathOptions={{ color: '#f97316', opacity: threatPulse ? 0.55 : 0.18, weight: 1.5, dashArray: '3 8' }}
                />
              )}

              {/* Radar bearing line M48 → contact */}
              {['radar_track', 'scion_classify', 'threat_confirmed'].includes(phase) && threatPos && (
                <Polyline
                  positions={[m48Pos, threatPos]}
                  pathOptions={{ color: '#f97316', opacity: 0.65, weight: 1.5, dashArray: '4 4' }}
                />
              )}

              {/* Scion multi-sensor fusion lines */}
              {phase === 'scion_classify' && threatPos && (
                <>
                  <Polyline
                    positions={[m48Pos, threatPos]}
                    pathOptions={{ color: '#8b5cf6', opacity: threatPulse ? 0.60 : 0.20, weight: 1.5, dashArray: '3 6' }}
                  />
                  <Polyline
                    positions={[m48Pos, threatPos]}
                    pathOptions={{ color: '#22d3ee', opacity: threatPulse ? 0.45 : 0.12, weight: 1, dashArray: '2 8' }}
                  />
                </>
              )}

              {/* Scion processing pulse ring on M48 */}
              {showScionRing && (
                <Circle
                  center={m48Pos}
                  radius={threatPulse ? 14000 : 9000}
                  pathOptions={{ color: '#8b5cf6', fillOpacity: 0, weight: 1.5, opacity: threatPulse ? 0.45 : 0.15, dashArray: '4 5' }}
                />
              )}

              {/* RazorChassis FC data link line (magenta) */}
              {showFCLink && (
                <Polyline
                  positions={[m48Pos, NAVCENT_POS]}
                  pathOptions={{ color: '#d946ef', opacity: 0.70, weight: 2 }}
                />
              )}

              {/* RazorChassis uplink dot: travels M48 → NAVCENT */}
              {fcDotPos && (
                <CircleMarker
                  center={fcDotPos}
                  radius={4}
                  pathOptions={{ color: '#d946ef', fillColor: '#f0abfc', fillOpacity: 1, weight: 1 }}
                />
              )}

              {/* USS Laboon */}
              <CircleMarker
                center={USS_LABOON_POS}
                radius={7}
                pathOptions={{ color: 'var(--caliburn-text-secondary)', fillColor: '#334155', fillOpacity: 0.9, weight: 2 }}
              >
                <Tooltip permanent direction="right" offset={[10, 0]}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--caliburn-text-secondary)' }}>USS Laboon</span>
                </Tooltip>
              </CircleMarker>

              {/* Engagement solution vector USS Laboon → threat */}
              {phase === 'fire_control_alerted' && threatPos && (
                <Polyline
                  positions={[USS_LABOON_POS, threatPos]}
                  pathOptions={{ color: '#10b981', opacity: 0.80, weight: 2 }}
                />
              )}

              {/* Missile in flight — tiny red dot from USS Laboon to kill position */}
              {missilePos && (
                <>
                  <Polyline
                    positions={[USS_LABOON_POS, missilePos]}
                    pathOptions={{ color: '#ef4444', opacity: 0.55, weight: 1, dashArray: '3 5' }}
                  />
                  <CircleMarker
                    center={missilePos}
                    radius={4}
                    pathOptions={{ color: '#ef4444', fillColor: '#fca5a5', fillOpacity: 1, weight: 1.5 }}
                  >
                    <Tooltip direction="top" offset={[0, -8]}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444' }}>ESSM</span>
                    </Tooltip>
                  </CircleMarker>
                </>
              )}

              {/* Destroy marker — appears at exact threat last position, no teleport */}
              {showDestroy && (
                <CircleMarker
                  center={KILL_POS}
                  radius={phase === 'threat_neutralized' ? 11 : 6}
                  pathOptions={{
                    color:       '#10b981',
                    fillColor:   '#10b981',
                    fillOpacity: phase === 'threat_neutralized' ? 0.75 : 0.30,
                    weight:      2,
                  }}
                >
                  <Tooltip permanent direction="top" offset={[0, -14]}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>✓ DESTROYED</span>
                  </Tooltip>
                </CircleMarker>
              )}

              {/* Threat marker */}
              {showThreat && threatPos && (
                <CircleMarker
                  center={threatPos}
                  radius={threatPulse && ['rf_detect', 'radar_track', 'scion_classify'].includes(phase) ? 10 : 8}
                  pathOptions={{ color: tColor, fillColor: tColor, fillOpacity: 0.9, weight: 2 }}
                >
                  <Tooltip permanent direction="top" offset={[0, -12]}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: tColor }}>
                      {['threat_confirmed', 'razorchassis_cueing', 'fire_control_alerted'].includes(phase)
                        ? '⚡ HOSTILE — Shahed-136'
                        : phase === 'scion_classify'
                        ? '⚠ CLASSIFYING...'
                        : '⚠ UNIDENTIFIED UAS'
                      }
                    </span>
                  </Tooltip>
                </CircleMarker>
              )}

              {/* Abu Musa Island */}
              <CircleMarker
                center={ABU_MUSA}
                radius={5}
                pathOptions={{ color: '#ef4444', fillColor: '#7f1d1d', fillOpacity: 0.80, weight: 1.5 }}
              >
                <Tooltip direction="right" offset={[8, 0]}>
                  <span style={{ fontSize: 10, color: '#fca5a5' }}>Abu Musa Island (IR)</span>
                </Tooltip>
              </CircleMarker>

              {/* NAVCENT — NSA Bahrain */}
              <CircleMarker
                center={NAVCENT_POS}
                radius={7}
                pathOptions={{ color: '#6366f1', fillColor: '#4f46e5', fillOpacity: 0.9, weight: 2 }}
              >
                <Tooltip direction="right" offset={[10, 0]}>
                  <span style={{ fontSize: 11, fontWeight: 700 }}>NAVCENT — NSA Bahrain</span>
                </Tooltip>
              </CircleMarker>

              {/* M48 vessel marker */}
              {currentTick >= T_PATROL_START && (
                <CircleMarker
                  center={m48Pos}
                  radius={8}
                  pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.9, weight: 2 }}
                >
                  <Tooltip direction="top" offset={[0, -14]}>
                    <span style={{ fontSize: 10, color: lanternDeployed ? '#22d3ee' : lanternRising ? '#67e8f9' : '#93c5fd' }}>
                      {lanternDeployed ? `${effectiveRoster[0]?.name ?? 'M48'} · DPI Vulture ↑ 200ft` : lanternRising ? `${effectiveRoster[0]?.name ?? 'M48'} · LANTERN ↑ ascending…` : (effectiveRoster[0]?.name ?? 'M48')}
                    </span>
                  </Tooltip>
                </CircleMarker>
              )}

            </MapContainer>

            {/* ── Corner drone-ascent view ── */}
            {(() => {
              const W = 192, H = 148;
              const waterY = H - 28;
              const boatW = 130, boatH = 52;
              const boatX = (W - boatW) / 2;
              const boatY = waterY - boatH + 10;
              // mast origin on the boat (roughly center-top of hull)
              const mastX = W / 2 + 4, mastBaseY = boatY + 8;
              const maxRise = mastBaseY - 18;
              const droneY = mastBaseY - lanternRiseProgress * maxRise;
              const scanHalfAngle = 38; // degrees
              const scanR = lanternRiseProgress * 90;
              const angleL = (90 + scanHalfAngle) * Math.PI / 180;
              const angleR = (90 - scanHalfAngle) * Math.PI / 180;
              const sx1 = mastX + scanR * Math.cos(angleL);
              const sy1 = droneY + scanR * Math.sin(angleL);
              const sx2 = mastX + scanR * Math.cos(angleR);
              const sy2 = droneY + scanR * Math.sin(angleR);
              return (
                <div
                  className="absolute bottom-3 right-3 z-[500] pointer-events-none"
                  style={{ width: W, height: H, borderRadius: 12, overflow: 'hidden',
                    background: 'rgba(5,10,18,0.82)', border: '1px solid rgba(100,120,150,0.25)',
                    backdropFilter: 'blur(4px)' }}
                >

                  {/* Vessel image — updates when hull is swapped */}
                  <img
                    src={effectiveRoster[0]?.image ?? m48Img} alt={effectiveRoster[0]?.name ?? 'M48'}
                    style={{ position: 'absolute', left: boatX, top: boatY,
                      width: boatW, height: boatH, objectFit: 'contain', opacity: 0.90 }}
                  />

                  {/* Animated SVG: water, tether, scan cone, drone */}
                  <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
                    {/* Water line */}
                    <line
                      x1={0} y1={waterY} x2={W} y2={waterY}
                      stroke="#164e63" strokeWidth={1.5}
                    />
                    <rect
                      x={0} y={waterY} width={W} height={H - waterY}
                      fill="#0c2233" opacity={0.7}
                    />

                    {/* Scan cone */}
                    {lanternRiseProgress > 0.02 && (
                      <path
                        d={`M ${mastX} ${droneY} L ${sx1} ${sy1} A ${scanR} ${scanR} 0 0 0 ${sx2} ${sy2} Z`}
                        fill="#67e8f9" opacity={0.10 + lanternRiseProgress * 0.08}
                      />
                    )}
                    {lanternRiseProgress > 0.02 && (
                      <>
                        <line x1={mastX} y1={droneY} x2={sx1} y2={sy1}
                          stroke="#67e8f9" strokeWidth={0.8} opacity={0.45}
                        />
                        <line x1={mastX} y1={droneY} x2={sx2} y2={sy2}
                          stroke="#67e8f9" strokeWidth={0.8} opacity={0.45}
                        />
                      </>
                    )}

                    {/* Tether */}
                    {lanternRiseProgress > 0 && (
                      <line x1={mastX} y1={mastBaseY} x2={mastX} y2={droneY + 5}
                        stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 2" opacity={0.7}
                      />
                    )}

                    {/* Drone body */}
                    {lanternRiseProgress > 0 && (
                      <g transform={`translate(${mastX},${droneY})`}>
                        {/* Arms */}
                        {[[-9,-6],[9,-6],[-9,6],[9,6]].map(([dx,dy],i) => (
                          <line key={i} x1={0} y1={0} x2={dx} y2={dy}
                            stroke="#67e8f9" strokeWidth={1.5} opacity={0.9}
                          />
                        ))}
                        {/* Rotors */}
                        {[[-9,-6],[9,-6],[-9,6],[9,6]].map(([dx,dy],i) => (
                          <circle key={i} cx={dx} cy={dy} r={3}
                            fill="none" stroke="#67e8f9" strokeWidth={1.2} opacity={0.85}
                          />
                        ))}
                        {/* Body */}
                        <rect x={-3} y={-3} width={6} height={6} rx={1}
                          fill="#67e8f9" opacity={0.9}
                        />
                      </g>
                    )}

                    {/* Label */}
                    <text x={8} y={14} fill="#475569" fontSize={9}
                      fontFamily="monospace" letterSpacing={1}
                    >
                      DPI VULTURE
                    </text>
                    {lanternRiseProgress >= 1 && (
                      <text x={8} y={26} fill="#67e8f9" fontSize={8} fontFamily="monospace">
                        200ft · scanning
                      </text>
                    )}
                    {lanternRiseProgress > 0 && lanternRiseProgress < 1 && (
                      <text x={8} y={26} fill="#94a3b8" fontSize={8} fontFamily="monospace">
                        ascending…
                      </text>
                    )}
                  </svg>
                </div>
              );
            })()}

            {badge && (
              <div className={`absolute top-3 right-3 z-[500] px-3 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wider pointer-events-none border ${badge.cls}`}>
                {badge.label}
              </div>
            )}

            {/* Mobile: Show Log button */}
            <button
              onClick={() => setShowLog(true)}
              className="md:hidden absolute bottom-3 left-3 z-[500] px-3 py-1.5 rounded-lg bg-gray-900/90 border border-gray-700/60 text-gray-300 text-xs font-semibold backdrop-blur-sm"
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
                <p className="text-gray-600 text-[0.68rem]">{effectiveRoster[0]?.name ?? 'M48'} · Vulture · TF59 Gulf-7</p>
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

export default ISRTetheredDroneMissionView;
