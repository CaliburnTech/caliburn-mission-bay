import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import {
  MapContainer, TileLayer, CircleMarker, Circle, Polyline, Tooltip, ZoomControl, useMap
} from 'react-leaflet';
import { Play, Pause, RotateCcw, ChevronLeft, Check, Shield, Settings, ArrowLeftRight } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import useMissionStore from '../../store/missionStore';
import useOutfitterStore from '../../store/outfitterStore';
import useConfigurationStore from '../../store/configurationStore';
import useNavigationStore from '../../store/navigationStore';
import { vesselHullData } from '../../data/vesselData';
import { MISSION_ROLES } from '../../data/missionRoles';
import imgM48 from '../../assets/images/M48.png';
import imgMariner from '../../assets/images/Mariner.png';
import SwapVesselModal from './SwapVesselModal';
import ReadinessChecklist from './ReadinessChecklist';
import { getMissionReadiness } from '../../utils/missionReadiness';
import { HULL_IMAGES } from '../../utils/hullImages';

const VESSEL_ROSTER = [
  { name: 'M48-A (PORT)', roleDescriptor: '(Port Escort)', image: imgM48, hullName: 'M48', capabilities: ['Epirus Leonidas H2O HPM', 'Coyote Block 3NK ×8 Interceptors', 'HiddenLevel Passive RF Sensor', 'cUxS Escort Picket'], roleKey: 'PROT_M48_ESCORT' },
  { name: 'M48-B (STBD)', roleDescriptor: '(Stbd Escort)', image: imgM48, hullName: 'M48', capabilities: ['Epirus Leonidas H2O HPM', 'Coyote Block 3NK ×8 Interceptors', 'HiddenLevel Passive RF Sensor', 'cUxS Escort Picket'], roleKey: 'PROT_SHADOW_FOX' },
  { name: 'Mariner', image: imgMariner, hullName: 'Mariner', capabilities: ['HiddenLevel Passive RF Sensor', 'Teledyne FLIR EO/IR Day/Night', 'Advance Screen 5nm Ahead', 'UAS Approach Vector Alert'] },
];

const MISSION_SET_KEY = 'PROTECTIONS';
const MISSION_SET_CAPS = ['HiddenLevel Passive RF Sensor', 'cUxS Escort Picket', 'Advance Screen 5nm Ahead'];

// ─── Geography — open Pacific north of Taiwan (east→west transit) ─────────────
const NM_TO_M = 1852;
const MAP_CENTER      = [25.40, 123.50];
const MAP_ZOOM        = 8;

// 26°N keeps the track in open ocean — Taiwan's northern tip is ~25.3°N
const HVU_START       = [26.00, 126.50];
const HVU_END         = [26.00, 121.50];
const DRONE_LAUNCH    = [26.50, 121.00];  // from west/northwest (mainland direction)
const USV_LAUNCH      = [24.00, 122.50];  // south, bearing ~210° from track

const NUM_DRONES = 16;
// At tick 52 (HPM burst), M48-A picket is at ~[26.25, 124.68].
// Targets at 124.45 — ~21km west of M48-A, well within the 20NM HPM ring radius.
// Drones arrive at target and sit there; ring expands and visually engulfs them
// before T_SWARM_KILLED fires at tick 62.
const DRONE_TARGETS = Array.from({ length: NUM_DRONES }, (_, i) => {
  const angle = (i / NUM_DRONES) * Math.PI * 0.65 - Math.PI * 0.325;
  return [26.25 + Math.sin(angle) * 0.15, 124.45 + Math.cos(angle) * 0.06];
});

// ─── Tick milestones ──────────────────────────────────────────────────────────
const T_TRANSIT       =  8;
const T_DRONE_LAUNCH  = 20;
const T_RF_DETECT     = 32;
const T_CLASSIFY      = 38;  // must be > T_RF_DETECT (was 28 — bug)
const T_AUTH_HPM      = 46;
const T_HPM_BURST     = 52;  // drones at 64% of approach (mid-flight, clearly still incoming)
const T_SWARM_KILLED  = 66;  // T_HPM_BURST+14; drones at 78% when ring finishes
const T_DRONE_REACH   = 70;  // decoupled: where drones WOULD arrive if not shot down
const T_USV_APPEAR    = 80;
const T_USV_DETECTED  = 90;
const T_AUTH_KINETIC  = 92;
const T_COYOTE        = 98;  // T_AUTH_KINETIC+6 — fires as authorization completes
const T_USV_KILLED    = 108; // USV at 56% of would-be approach (~25.1°N, south of M48-B at 25.75°N)
const T_USV_APPROACH  = 130; // decoupled: where USV WOULD arrive if not intercepted
const T_CLEAR         = 118;
const TOTAL_TICKS     = 132;
const TICK_MS         = 260;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const getPhase = (tick) => {
  if (tick < T_TRANSIT)       return 'idle';
  if (tick < T_DRONE_LAUNCH)  return 'transit';
  if (tick < T_RF_DETECT)     return 'drone_launch';
  if (tick < T_CLASSIFY)      return 'rf_detect';
  if (tick < T_AUTH_HPM)      return 'classify';
  if (tick < T_HPM_BURST)     return 'auth_hpm';
  if (tick < T_SWARM_KILLED)  return 'hpm_burst';
  if (tick < T_USV_APPEAR)    return 'swarm_killed';
  if (tick < T_USV_DETECTED)  return 'usv_appear';
  if (tick < T_AUTH_KINETIC)  return 'usv_detected';
  if (tick < T_COYOTE)        return 'auth_kinetic';
  if (tick < T_USV_KILLED)    return 'coyote';
  if (tick < T_CLEAR)         return 'usv_killed';
  return 'clear';
};

const getHVUPos = (tick) => {
  if (tick < T_TRANSIT) return HVU_START;
  const t = clamp((tick - T_TRANSIT) / (TOTAL_TICKS - T_TRANSIT), 0, 1);
  return lerp2(HVU_START, HVU_END, t);
};

const getDronePos = (tick, target) => {
  if (tick < T_DRONE_LAUNCH || tick >= T_SWARM_KILLED) return null;
  const t = clamp((tick - T_DRONE_LAUNCH) / (T_DRONE_REACH - T_DRONE_LAUNCH), 0, 1);
  return lerp2(DRONE_LAUNCH, target, t);
};

const getUSVPos = (tick) => {
  if (tick < T_USV_APPEAR || tick >= T_USV_KILLED) return null;
  const hvuPos = getHVUPos(tick);
  const t = clamp((tick - T_USV_APPEAR) / (T_USV_APPROACH - T_USV_APPEAR), 0, 1);
  return lerp2(USV_LAUNCH, [hvuPos[0], hvuPos[1] + 0.05], t);  // aim at HVU; T_USV_APPROACH decouples arrival from kill
};

const getHPMRadius  = (tick) => tick < T_HPM_BURST || tick >= T_HPM_BURST + 14 ? 0 : clamp((tick - T_HPM_BURST) / 14, 0, 1) * 20 * NM_TO_M;
const getHPMOpacity = (tick) => tick < T_HPM_BURST || tick >= T_HPM_BURST + 14 ? 0 : Math.max(0, 0.8 - (tick - T_HPM_BURST) * 0.06);

const getCoyotePos = (tick) => {
  if (tick < T_COYOTE || tick >= T_USV_KILLED) return null;
  const hvuPos = getHVUPos(tick);
  const firePos = [hvuPos[0] - 0.25, hvuPos[1] - 0.15]; // from M48-B (starboard/south)
  const usvCur  = getUSVPos(tick) || USV_LAUNCH;
  const t = clamp((tick - T_COYOTE) / (T_USV_KILLED - T_COYOTE), 0, 1);
  return lerp2(firePos, usvCur, t);
};

const getUSVBoomR = (tick) => tick < T_USV_KILLED || tick >= T_USV_KILLED + 12 ? 0 : clamp((tick - T_USV_KILLED) / 12, 0, 1) * 8 * NM_TO_M;
const getUSVBoomO = (tick) => tick < T_USV_KILLED || tick >= T_USV_KILLED + 12 ? 0 : Math.max(0, 0.8 - (tick - T_USV_KILLED) * 0.07);

// ─── Phase narrative ──────────────────────────────────────────────────────────
const PHASE_NARRATIVE = {
  idle:         { title: 'Awaiting scenario start', body: 'Press Run to begin Operation IRON SHIELD — cUxS escort of CVN transit, Taiwan Strait.' },
  transit:      { title: 'HVU transit active — escort on station', body: 'CVN heading west — northern Taiwan Strait. M48-A on port flank, M48-B on starboard flank, Mariner 5nm ahead. Link 16 COP to HVU CIC.' },
  drone_launch: { title: '⚠ PLAN drone swarm launched — mainland', body: '16 UAS airborne from mainland — bearing 285°. HiddenLevel passive RF detects drone control links. M48-A radar confirms multiple contacts closing at ~80 kts.' },
  rf_detect:    { title: 'Swarm classified — 16 Group 1–2 UAS', body: 'HiddenLevel: 2.4 GHz control links — Bayraktar-pattern UAS. TempestOS recommends Leonidas H2O HPM. Non-kinetic — supervisory authorization only needed.' },
  classify:     { title: 'Engagement package ready', body: 'TempestOS: Leonidas H2O HPM on M48-A covers entire swarm bearing. Coyote 3NK on M48-B on standby for any survivors. Watch officer authorizing HPM burst.' },
  auth_hpm:     { title: '⚡ Supervisory auth — HPM approved', body: 'Non-lethal directed energy: single watch officer approval per DODD 3000.09 — no full HITL chain required. Leonidas H2O capacitor charged. Firing.' },
  hpm_burst:    { title: '⚡ LEONIDAS H2O — HPM burst firing', body: 'M48-A fires high-power microwave burst. Defeats Groups 1–3 UAS. 20-ft TEU containerized — ~$0 marginal cost per shot.' },
  swarm_killed: { title: '✓ Drone swarm defeated — 16 contacts lost', body: 'All 16 drone contacts lost. Leonidas achieved 100% effect. HVU corridor clear of air threat. Capacitor recharging — ready for follow-on in 4 seconds.' },
  usv_appear:   { title: '⚠ Fast-attack USV — bearing 210°', body: 'Mariner radar: fast surface contact at ~42 kts, direct approach on HVU track. Time to HVU: 7 min. Pattern consistent with Magura V5/V7 class.' },
  usv_detected: { title: 'Magura V5 confirmed — non-kinetic intercept', body: 'Starlink uplink detected — RF jamming INEFFECTIVE. 200 kg explosive payload. TempestOS: Coyote Block 3NK HPM defeat recommended. HITL gate required — electronics defeat engagement.' },
  auth_kinetic: { title: '⚡ HITL gate — watch officer authorizing', body: 'DODD 3000.09: human-in-the-loop for Coyote deployment. TempestOS sends imagery + intercept geometry to watch officer. 90-second window. Coyote deployment AUTHORIZED.' },
  coyote:       { title: '⚡ COYOTE BLOCK 3NK — interceptor away', body: 'M48-B fires Coyote Block 3NK recoverable interceptor. Non-kinetic HPM payload targeting Magura V5 electronics — Starlink control link and guidance system defeat mode engaged.' },
  usv_killed:   { title: '✓ Fast-attack USV disabled — HPM defeat', body: 'Coyote HPM burst — Magura V5 electronics disabled before reaching HVU zone. Propulsion and detonation circuit inoperable. Payload did not detonate. Coyote recovery initiated. Engagement record filed.' },
  clear:        { title: '✓ HVU corridor clear — mission complete', body: 'All threats prosecuted: 1× HPM swarm defeat, 1× Coyote non-kinetic HPM defeat. CVN transit continues. Engagement records to 7th Fleet MOC.' },
};

const BADGE_CLS = {
  transit:      'bg-cyan-900/80 text-cyan-300 border-cyan-500/40',
  drone_launch: 'bg-amber-900/80 text-amber-300 border-amber-500/40 animate-pulse',
  rf_detect:    'bg-amber-900/80 text-amber-200 border-amber-500/40 animate-pulse',
  classify:     'bg-violet-900/80 text-violet-300 border-violet-500/40',
  auth_hpm:     'bg-orange-900/80 text-orange-200 border-orange-400/60 animate-pulse',
  hpm_burst:    'bg-lime-900/80 text-lime-200 border-lime-400/60 animate-pulse',
  swarm_killed: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40',
  usv_appear:   'bg-amber-900/80 text-amber-300 border-amber-500/40 animate-pulse',
  usv_detected: 'bg-red-900/80 text-red-300 border-red-500/40 animate-pulse',
  auth_kinetic: 'bg-orange-900/80 text-orange-200 border-orange-400/60 animate-pulse',
  coyote:       'bg-red-900/80 text-red-200 border-red-400/60 animate-pulse',
  usv_killed:   'bg-emerald-900/80 text-emerald-300 border-emerald-500/40',
  clear:        'bg-emerald-900/80 text-emerald-200 border-emerald-400/40',
};

// ─── Fleet roster (kept but not rendered) ─────────────────────────────────────
const _getFleetRoster = (tick) => {
  const phase = getPhase(tick);
  const transiting = tick >= T_TRANSIT;
  return [
    {
      id: 'hvu',
      name: 'CVN — High Value Unit',
      role: 'Carrier Strike Group · transiting east',
      color: '#eab308',
      payload: 'Strike group · 5,000 crew · $15–20B hull value',
      status: tick < T_TRANSIT ? 'PRE-MISSION' : tick >= T_CLEAR ? 'TRANSIT CLEAR' : 'TRANSITING — UNDER ESCORT',
      active: transiting,
    },
    {
      id: 'mascar-a',
      name: 'M48-A',
      role: 'cUxS Picket — Port Flank',
      color: '#ef4444',
      payload: 'Epirus Leonidas H2O HPM · Coyote 3NK ×8',
      status: !transiting ? 'STAGING' : phase === 'hpm_burst' ? 'FIRING — LEONIDAS HPM' : phase === 'swarm_killed' ? 'HPM COMPLETE' : 'ESCORT / SCREEN',
      active: transiting,
    },
    {
      id: 'masc-b',
      name: 'M48-B',
      role: 'cUxS Picket — Starboard Flank',
      color: '#f97316',
      payload: 'Coyote Block 3NK ×8 · HPM backup',
      status: !transiting ? 'STAGING' : phase === 'coyote' ? 'COYOTE AWAY' : phase === 'usv_killed' || phase === 'clear' ? 'USV NEUTRALIZED' : 'ESCORT / SCREEN',
      active: transiting,
    },
    {
      id: 'shadowfox',
      name: 'Mariner',
      role: 'Advance Screen — 5nm ahead',
      color: '#10b981',
      payload: 'HiddenLevel RF passive · EO/IR · FLIR',
      status: !transiting ? 'STAGING' : ['drone_launch','rf_detect'].includes(phase) ? 'THREAT DETECTED' : 'ADVANCE PATROL',
      active: transiting,
    },
    {
      id: 'swarm',
      name: 'PLAN Drone Swarm',
      role: 'Enemy · 16× Group 1–2 UAS',
      color: tick >= T_SWARM_KILLED ? '#6b7280' : '#ef4444',
      payload: 'Bayraktar-pattern · 2.4 GHz ctrl · ~80 kt closing',
      status: tick < T_DRONE_LAUNCH ? '—' : tick < T_SWARM_KILLED ? 'INBOUND — CLOSING' : 'DEFEATED BY HPM',
      active: tick >= T_DRONE_LAUNCH,
    },
    {
      id: 'usv',
      name: 'Magura V5 USV',
      role: 'Enemy · Fast-Attack USV',
      color: tick >= T_USV_KILLED ? '#6b7280' : '#ef4444',
      payload: '200 kg explosive · Starlink ctrl · ~42 kts',
      status: tick < T_USV_APPEAR ? '—' : tick < T_USV_KILLED ? 'INBOUND — ~42 KTS' : 'DISABLED',
      active: tick >= T_USV_APPEAR,
    },
  ];
};

// ─── Loadouts ─────────────────────────────────────────────────────────────────
const M48A_MOUNTS = [
  { slot: 'DIRECTED ENERGY', name: 'Epirus Leonidas H2O HPM', vendor: 'Epirus', description: 'High-power microwave — defeats Groups 1–3 UAS — 20ft TEU containerized — ~$0 marginal cost per shot — 4s recharge' },
  { slot: 'NON-KINETIC INTERCEPT', name: 'Coyote Block 3NK ×8', vendor: 'Raytheon', description: 'Recoverable loitering interceptor — non-kinetic HPM payload — disables target electronics (propulsion, guidance, detonation circuit)' },
  { slot: 'RF DETECTION', name: 'HiddenLevel Passive RF', vendor: 'HiddenLevel', description: 'Passive RF sensor — detects drone control links at 2.4/5.8 GHz — no emission — covert screen' },
];
const SHADOW_MOUNTS = [
  { slot: 'RF / SIGINT', name: 'HiddenLevel Passive Array', vendor: 'HiddenLevel', description: 'Advance screen — 5nm ahead of HVU — passive RF detection of UAS swarm approach vectors' },
  { slot: 'EO/IR', name: 'Teledyne FLIR EO/IR', vendor: 'Teledyne FLIR', description: 'Day/night optical — surface contact classification — approach vector confirmation' },
];

// ─── Map helpers ──────────────────────────────────────────────────────────────
const TILE_BASE    = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_SEAMARK = 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png';

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

const EVENT_COLORS = {
  warn:    'text-amber-400',
  alert:   'text-red-400',
  info:    'text-cyan-400',
  success: 'text-emerald-400',
};

// ─── Component ────────────────────────────────────────────────────────────────
const ProtectionsMissionView = ({ mission, onBack }) => {
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
  const [tick,     setTick]    = useState(0);
  const [events,   setEvents]  = useState([]);
  const [running,  setRunning] = useState(false);
  const [paused,        setPaused]        = useState(false);
  const [complete, setComplete] = useState(false);
  const [saved,    setSaved]   = useState(false);

  const tickRef    = useRef(0);
  const tickCallbackRef = useRef(null);
  const mainTimer  = useRef(null);
  const resetTimer = useRef(null);
  const addEvtRef  = useRef(null);
  const runScenRef = useRef(null);

  const phase      = getPhase(tick);
  const hvuPos     = getHVUPos(tick);
  const picketAPos = [hvuPos[0] + 0.25, hvuPos[1] - 0.15];
  const picketBPos = [hvuPos[0] - 0.25, hvuPos[1] - 0.15];
  const shadowPos  = [hvuPos[0] + 0.02, hvuPos[1] - 0.75];  // farther ahead for forward scan
  const usvPos     = getUSVPos(tick);
  const hpmR       = getHPMRadius(tick);
  const hpmO       = getHPMOpacity(tick);
  const coyotePos  = getCoyotePos(tick);
  const usvBoomR   = getUSVBoomR(tick);
  const usvBoomO   = getUSVBoomO(tick);
  const narrative  = PHASE_NARRATIVE[phase];
  const badgeCls   = BADGE_CLS[phase];

  const dronesActive = tick >= T_DRONE_LAUNCH && tick < T_SWARM_KILLED;
  const showUSV      = tick >= T_USV_APPEAR && tick < T_USV_KILLED;
  const showCVN      = tick >= T_TRANSIT;

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

  const _addEvent = (msg, type = 'info') => {
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setEvents(prev => [{ ts, msg, type, id: `${ts}-${msg.slice(0, 12)}` }, ...prev].slice(0, 25));
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

  const stopAll = useCallback(() => {
    clearInterval(mainTimer.current);
    clearTimeout(resetTimer.current);
  }, []);

  const reset = useCallback(() => {
    stopAll();
    tickRef.current = 0;
    setPaused(false);
    setTick(0); setEvents([]); setRunning(false); setComplete(false);
  }, [stopAll]);

  const runScenario = useCallback(() => {
    stopAll();
    tickRef.current = 0;
    setTick(0); setEvents([]); setRunning(true); setComplete(false);

    const cb = () => {
      const t = ++tickRef.current;
      setTick(t);

      if (t === T_TRANSIT)      { addEvtRef.current('CTF-70: CVN transit underway — northern Taiwan Strait, heading west', 'info'); addEvtRef.current('M48-A (port) M48-B (starboard): escort station active', 'info'); addEvtRef.current('Mariner: advance screen — 5nm ahead — HiddenLevel RF + EO/IR', 'info'); }
      if (t === T_DRONE_LAUNCH) { addEvtRef.current('HiddenLevel: drone RF links detected — mainland bearing 285°', 'warn'); addEvtRef.current('M48-A radar: 16 airborne contacts — Group 1–2 UAS — closing ~80 kts', 'warn'); }
      if (t === T_RF_DETECT)    { addEvtRef.current('HiddenLevel: 2.4 GHz ctrl links — Bayraktar-pattern classification', 'warn'); addEvtRef.current('TempestOS: Leonidas H2O HPM recommended — non-kinetic', 'info'); }
      if (t === T_CLASSIFY)     { addEvtRef.current('TempestOS AI: 16 contacts — Group 1–2 UAS — 97% confidence', 'info'); }
      if (t === T_AUTH_HPM)     { addEvtRef.current('Watch officer: HPM non-kinetic APPROVED — supervisory auth', 'warn'); addEvtRef.current('DODD 3000.09: non-lethal directed energy — supervisory auth sufficient', 'info'); }
      if (t === T_HPM_BURST)    { addEvtRef.current('M48-A: LEONIDAS H2O — HPM BURST — high-power microwave', 'alert'); addEvtRef.current('Marginal cost: $0 — electrical — capacitor recharge in 4s', 'info'); }
      if (t === T_SWARM_KILLED) { addEvtRef.current('TempestOS: ALL 16 DRONE CONTACTS LOST — HPM confirmed', 'success'); addEvtRef.current('HVU corridor: air threat clear — Leonidas recharging', 'success'); }
      if (t === T_USV_APPEAR)   { addEvtRef.current('Mariner: fast surface contact bearing 210° — ~42 kts closing', 'warn'); addEvtRef.current('Time to HVU: 7 minutes — direct approach profile', 'warn'); }
      if (t === T_USV_DETECTED) { addEvtRef.current('TempestOS AI: Magura V5/V7 — 94% confidence', 'alert'); addEvtRef.current('Starlink uplink detected — RF jamming INEFFECTIVE', 'alert'); addEvtRef.current('HITL GATE: Coyote 3NK HPM deployment authorization required — DODD 3000.09', 'warn'); }
      if (t === T_AUTH_KINETIC) { addEvtRef.current('Watch officer: reviewing intercept package — 90s window', 'warn'); }
      if (t === T_AUTH_KINETIC + 6) { addEvtRef.current('Watch officer: Coyote 3NK HPM defeat AUTHORIZED', 'alert'); }
      if (t === T_COYOTE)       { addEvtRef.current('M48-B: COYOTE BLOCK 3NK AWAY — HPM non-kinetic defeat mode', 'alert'); }
      if (t === T_USV_KILLED)   { addEvtRef.current('COYOTE: HPM DEFEAT — Magura V5 electronics disabled', 'success'); addEvtRef.current('Propulsion and detonation circuit inoperable. Coyote recovery initiated.', 'success'); }
      if (t === T_CLEAR)        { addEvtRef.current('CTF-70: HVU CORRIDOR CLEAR — all threats prosecuted', 'success'); addEvtRef.current('1× HPM swarm defeat · 1× Coyote HPM electronics defeat · 0 crew casualties', 'success'); addEvtRef.current('Engagement records transmitted to 7th Fleet MOC', 'info'); }

      if (t >= TOTAL_TICKS) {
        clearInterval(mainTimer.current);
        setRunning(false); setComplete(true);
        resetTimer.current = setTimeout(() => { if (runScenRef.current) runScenRef.current(); }, 6000);
      }
    };
    tickCallbackRef.current = cb;
    mainTimer.current = setInterval(cb, TICK_MS);
  }, [stopAll]);

  useLayoutEffect(() => { runScenRef.current = runScenario; });
  useEffect(() => () => stopAll(), [stopAll]);

  const handleSave = () => {
    const name = missionName.trim() || `Protections-HVU-cUxS-${new Date().toISOString().slice(5, 10)}`;
    const data = { name, template: 'PROTECTIONS', domain: 'MARITIME', status: 'draft', duration: '24h', missionProfile: { type: 'PROTECTIONS', subMission: 'HVU_CUXS', hitlCompliant: true, dodd300009: true } };
    if (mission?.id) updateMission(mission.id, data); else saveMission(data);
    setSaved(true); setTimeout(() => setSaved(false), 2400);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-darkest overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-700/50 flex-shrink-0 overflow-x-auto">
        <button onClick={onBack} className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-[0.75rem]">
          <ChevronLeft size={13} /> Back to Library
        </button>
        <div className="w-px h-4 bg-gray-700/60" />
        <Shield size={13} className="text-amber-400" />
        <span className="text-amber-400 text-[0.8rem] font-semibold tracking-wide">Operation IRON SHIELD</span>
        <span className="hidden md:inline text-gray-600 text-[0.7rem]">·</span>
        <span className="hidden md:inline text-gray-500 text-[0.68rem]">Taiwan Strait · HVU Escort · cUxS Defense</span>
        <div className="flex-1" />
        <span className="px-2 py-0.5 rounded-full bg-amber-900/50 text-amber-400 text-[0.65rem] font-bold uppercase tracking-wider border border-amber-500/30">HPM: SUPERVISORY · KINETIC: HITL</span>
        <input
          value={missionName}
          onChange={e => setMissionName(e.target.value)}
          placeholder="Mission designator…"
          className="hidden md:block bg-gray-800/60 border border-gray-700/60 rounded-md px-3 py-1.5 text-white text-[0.78rem] w-52 placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
        />
        <button
          onClick={handleSave}
          disabled={!missionName.trim() || !isDeployable}
          className={`hidden md:block px-3 py-1.5 rounded-md text-[0.78rem] font-semibold transition-colors flex items-center gap-1.5 ${saved ? 'bg-emerald-700 text-white' : missionName.trim() && isDeployable ? 'bg-amber-700 hover:bg-amber-600 text-white' : 'bg-gray-700/50 text-gray-600 cursor-not-allowed'}`}
        >
          {saved ? <><Check size={11} /> Saved</> : 'Save Draft'}
        </button>
      </div>

      {/* ── Scrollable body ── */}
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
              <TileLayer url={TILE_SEAMARK} opacity={0.3} />
              <MapInvalidateSize />

              {/* CVN */}
              {showCVN && (
                <CircleMarker center={hvuPos} radius={12} pathOptions={{ color: '#eab308', fillColor: '#1a1500', fillOpacity: 0.95, weight: 3 }} />
              )}

              {/* M48-A (port) */}
              {showCVN && (
                <CircleMarker center={picketAPos} radius={7} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.9, weight: 2 }} />
              )}

              {/* M48-B (starboard) */}
              {showCVN && (
                <CircleMarker center={picketBPos} radius={7} pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.9, weight: 2 }} />
              )}

              {/* Mariner */}
              {showCVN && (
                <CircleMarker center={shadowPos} radius={6} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.85, weight: 2 }} />
              )}

              {/* Drone swarm dots */}
              {dronesActive && DRONE_TARGETS.map((target, i) => {
                const pos = getDronePos(tick, target);
                if (!pos) return null;
                return <CircleMarker key={`d${i}`} center={pos} radius={3} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.75, weight: 1 }} />;
              })}

              {/* HPM burst ring */}
              {hpmO > 0 && <Circle center={picketAPos} radius={hpmR} pathOptions={{ color: '#cbfd00', fillColor: '#cbfd00', fillOpacity: hpmO * 0.2, weight: 2, opacity: hpmO }} />}

              {/* Fast-attack USV */}
              {showUSV && usvPos && (
                <CircleMarker center={usvPos} radius={6} pathOptions={{ color: '#ef4444', fillColor: '#7f0000', fillOpacity: 0.9, weight: 2, dashArray: '4 2' }}>
                  <Tooltip permanent direction="right" offset={[8, 0]}>
                    <span style={{ fontSize: 10, whiteSpace: 'nowrap', color: '#ef4444', fontWeight: 700 }}>Magura V5 · HOSTILE USV</span>
                  </Tooltip>
                </CircleMarker>
              )}

              {/* Coyote */}
              {coyotePos && (
                <CircleMarker center={coyotePos} radius={4} pathOptions={{ color: '#fbbf24', fillColor: '#fbbf24', fillOpacity: 1, weight: 1 }}>
                  <Tooltip permanent direction="top" offset={[0, -8]}>
                    <span style={{ fontSize: 9, whiteSpace: 'nowrap', color: '#fbbf24' }}>Coyote 3NK</span>
                  </Tooltip>
                </CircleMarker>
              )}

              {/* USV explosion */}
              {usvBoomO > 0 && usvPos && <Circle center={usvPos} radius={usvBoomR} pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: usvBoomO * 0.35, weight: 2, opacity: usvBoomO }} />}

            </MapContainer>

            {/* ── Phase badge ── */}
            {badgeCls && narrative && (
              <div className={`absolute top-3 left-3 z-[500] px-3 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wider pointer-events-none border ${badgeCls}`}>
                {narrative.title}
              </div>
            )}

            {/* ── Legend ── */}
            {tick >= T_TRANSIT && (
              <div className="hidden md:block absolute bottom-3 left-3 z-[500] pointer-events-none px-3 py-2 rounded-xl bg-gray-950/80 border border-gray-700/50 backdrop-blur-sm">
                <div className="flex flex-col gap-1">
                  {[
                    { color: '#eab308', label: 'CVN — High Value Unit', dashed: false },
                    { color: '#ef4444', label: `${effectiveRoster[0]?.name ?? 'M48 (Port Escort)'} — Leonidas HPM / Coyote`, dashed: false },
                    { color: '#f97316', label: `${effectiveRoster[1]?.name ?? 'M48 (Stbd Escort)'} — Coyote 3NK`, dashed: false },
                    { color: '#10b981', label: 'Mariner — Advance Screen', dashed: false },
                    { color: '#ef4444', label: 'Magura V5 — Fast Attack USV (HOSTILE)', dashed: true },
                  ].map(({ color, label, dashed }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: dashed ? 'transparent' : color,
                        border: dashed ? `2px dashed ${color}` : 'none',
                        flexShrink: 0,
                      }}
                      />
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
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[0.78rem] font-semibold transition-colors $bg-amber-700 hover:bg-amber-600 text-white"
                  >
                    <Pause size={13} />
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={paused ? resume : runScenario}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[0.78rem] font-semibold transition-colors $bg-amber-700 hover:bg-amber-600 text-white"
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
                  <div className="text-[0.68rem] font-bold text-amber-400 uppercase tracking-wider mb-1">
                    {narrative.title}
                  </div>
                  <div className="text-[0.67rem] text-gray-400 leading-relaxed">
                    {narrative.body}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-[0.68rem]">
                  2× M48 Escort · Mariner · CVN Transit
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
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
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

export default ProtectionsMissionView;