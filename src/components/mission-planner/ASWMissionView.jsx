import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import {
  MapContainer, TileLayer, Circle, CircleMarker, Polyline, Tooltip, ZoomControl, useMap
} from 'react-leaflet';
import { Play, Pause, RotateCcw, Anchor, ChevronLeft, Check, Settings } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import useMissionStore from '../../store/missionStore';
import useOutfitterStore from '../../store/outfitterStore';
import useConfigurationStore from '../../store/configurationStore';
import useNavigationStore from '../../store/navigationStore';
import { vesselHullData } from '../../data/vesselData';
import { MISSION_ROLES } from '../../data/missionRoles';
import imgM48 from '../../assets/images/M48.png';
import imgArleighBurke from '../../assets/images/ArleighBurke.png';

const MISSION_SET_KEY = 'ASW';
const MISSION_SET_CAPS = ['CAPTAS-4 Variable Depth Sonar', 'USW-DSS (AN/UYQ-100)', 'HiveLink SDR', 'MFTA Towed Array', 'Hanwha Naval Missile System'];

// ─── Geography ────────────────────────────────────────────────────────────────
const NM_TO_M = 1852;

const MAP_CENTER    = [24.35, 135.05];
const MAP_ZOOM      = 8;
const MAP_ZOOM_IN   = 9;   // zooms in when contact established

const M48_CAPTAS_POS = [24.40, 135.20];   // M48-ALPHA — CAPTAS active pinger (the bait)
const M48_MFTA_1_POS = [24.05, 135.65];   // M48-BRAVO  — passive MFTA receiver SE
const M48_MFTA_2_POS = [24.75, 135.65];   // M48-CHARLIE — passive MFTA receiver NE

const SUB_ECHO_POS = [24.14, 134.96];   // where echo is detected / sub contact — midpoint Virginia ↔ M48-ALPHA
const SUB_TRACK    = [
  [24.28, 134.38],
  [24.24, 134.56],
  [24.20, 134.74],
  [24.14, 134.96],
  [24.20, 135.08],
];
const VIRGINIA_POS = [23.88, 134.72];

const CAPTAS_RANGE_NM = 81;

// ─── Tick milestones ──────────────────────────────────────────────────────────
const T_DEPLOYED          =  8;
const T_CAPTAS_PING       = 18;
const T_PING_PROP         = 30;
const T_ECHO_DETECT       = 42;
const T_MFTA_BRAVO        = 52;   // M48-BRAVO bearing line appears
const T_MFTA_CHARLIE      = 57;   // M48-CHARLIE bearing line appears
const T_CONTACT_EST       = 65;   // contact established — enemy locked
const T_ENEMY_FIRES       = 76;   // SIERRA-7 fires torpedo at M48-ALPHA
const T_ALPHA_HIT         = 90;   // M48-ALPHA destroyed
const T_VIRGINIA_CUED     = 100;
const T_ENGAGEMENT        = 112;  // Virginia + Hanwha fire
const T_CONTACT_LOST      = 128;
const TOTAL_TICKS         = 144;

const TICK_MS = 280;

// ─── Loadouts ─────────────────────────────────────────────────────────────────
const M48_CAPTAS_MOUNTS = [
  { slot: 'ACTIVE SONAR',    name: 'CAPTAS-4 Variable Depth Sonar', vendor: 'Thales',   description: '150km detection range — 2nd convergence zone — 300m depth — active + passive combined' },
  { slot: 'C2 / PROCESSING', name: 'USW-DSS (AN/UYQ-100)',          vendor: 'Leidos',   description: 'Network-centric ASW decision support — fuses all platform data — Link 16 broadcast' },
  { slot: 'COMMS',           name: 'HiveLink SDR',                  vendor: 'HiveLink', description: 'Multi-waveform radio — WaveformX, WaveformY, Link 16 — tactical data link node' },
];
const M48_MFTA_MOUNTS = [
  { slot: 'PASSIVE SONAR',   name: 'MFTA Towed Array',              vendor: 'Lockheed Martin',     description: 'Passive receiver — listens for CAPTAS echo returns — bistatic geometry triangulation' },
  { slot: 'WEAPONS',         name: 'Hanwha Naval Missile System',   vendor: 'Hanwha Defense USA',  description: 'Surface prosecution capability — demo barge tested summer 2026 — fires on USW-DSS cue' },
  { slot: 'C2 / PROCESSING', name: 'USW-DSS (AN/UYQ-100)',          vendor: 'Leidos',              description: 'Receives common ASW picture from lead M48 via Link 16' },
];

const VESSEL_ROSTER = [
  { name: 'M48-ALPHA (CAPTAS)', image: imgM48, hullName: 'M48', roleKey: 'ASW_ALPHA', capabilities: ['CAPTAS-4 Variable Depth Sonar', 'USW-DSS (AN/UYQ-100)', 'HiveLink SDR'] },
  { name: 'M48-BRAVO (MFTA)',   image: imgM48, hullName: 'M48', roleKey: 'ASW_BRAVO', capabilities: ['MFTA Towed Array', 'Hanwha Naval Missile System', 'USW-DSS (AN/UYQ-100)', 'Bistatic Cross-Fix Node'] },
  { name: 'M48-CHARLIE (MFTA)', image: imgM48, hullName: 'M48', roleKey: 'ASW_CHARLIE', capabilities: ['MFTA Towed Array', 'Hanwha Naval Missile System', 'Link 16 Track Broadcast', 'Bistatic Cross-Fix Node'] },
  { name: 'USS Virginia SSN-774', image: imgArleighBurke, hullName: 'Virginia Class', roleKey: 'ASW_VIRGINIA', capabilities: ['Mk 48 ADCAP Torpedo', 'ACOMMS Track Receive', 'Fire Control System', 'Sprint & Drift Transit'] },
];

// ─── Phase narratives ─────────────────────────────────────────────────────────
const PHASE_NARRATIVE = {
  idle:             null,
  deployed:         { title: 'Assets on Station', body: 'M48-ALPHA holds station — CAPTAS-4 VDS descending to 200m. M48-BRAVO and M48-CHARLIE tow passive MFTA arrays in bistatic geometry.' },
  captas_ping:      { title: 'CAPTAS-4 Active Ping', body: 'M48-ALPHA fires a 900–2100 Hz acoustic pulse. Sound propagates outward at 1,500 m/s. M48-ALPHA is the bait — the enemy may hear it and shoot.' },
  ping_prop:        { title: 'Pulse Propagating', body: 'Acoustic energy bends along the SOFAR channel toward the 2nd convergence zone at 150km. M48-BRAVO and M48-CHARLIE listen silently for any echo.' },
  echo_detect:      { title: 'Anomalous Echo Return', body: 'Return amplitude and Doppler consistent with a large submerged metal hull at bearing 285. M48-BRAVO and M48-CHARLIE begin cross-bearing.' },
  mfta_correlate:   { title: 'Bistatic Cross-Fix', body: 'M48-BRAVO and M48-CHARLIE receive independent echoes from different angles. Two bearing lines intersect — USW-DSS computes contact position.' },
  contact_est:      { title: 'SIERRA-7 Identified', body: 'USW-DSS cross-references acoustic signature: PLAN Type-093 Shang-class — 87% confidence. Track quality: fire control grade. Weapons free authorized.' },
  enemy_fires:      { title: '⚠ Torpedo Inbound — M48-ALPHA', body: 'SIERRA-7 fires on the CAPTAS pinger. M48-ALPHA is crewless by design — this is expected. M48-BRAVO and M48-CHARLIE already hold the track via Link 16.' },
  alpha_hit:        { title: 'M48-ALPHA Destroyed', body: 'M48-ALPHA hit — CAPTAS hull sinking. Zero crew casualties. USW-DSS track data preserved in M48-BRAVO and M48-CHARLIE. Contact maintained.' },
  virginia_cued:    { title: 'Virginia Class Cued', body: 'USW-DSS compresses SIERRA-7 datum, confidence score, and intercept vector into a short ACOMMS burst — transmitted to USS Virginia via acoustic modem. Virginia receives without surfacing or reducing speed. Mk 48 fire control solution confirmed against pre-positioned track.' },
  engagement:       { title: 'Dual Prosecution Underway', body: 'USS Virginia: Mk 48 ADCAP torpedo away — active homing. M48-CHARLIE: Hanwha missile away — surface prosecution. SIERRA-7 in weapons engagement zone.' },
  contact_lost:     { title: 'SIERRA-7 Prosecuted', body: 'Acoustic transient consistent with pressure hull failure. SIERRA-7 contact lost — debris field confirmed on HORUS passive arrays. Sector BRAVO-7 cleared.' },
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
  if (tick < T_DEPLOYED)     return 'idle';
  if (tick < T_CAPTAS_PING)  return 'deployed';
  if (tick < T_PING_PROP)    return 'captas_ping';
  if (tick < T_ECHO_DETECT)  return 'ping_prop';
  if (tick < T_MFTA_BRAVO)   return 'echo_detect';
  if (tick < T_CONTACT_EST)  return 'mfta_correlate';
  if (tick < T_ENEMY_FIRES)  return 'contact_est';
  if (tick < T_ALPHA_HIT)    return 'enemy_fires';
  if (tick < T_VIRGINIA_CUED)return 'alpha_hit';
  if (tick < T_ENGAGEMENT)   return 'virginia_cued';
  if (tick < T_CONTACT_LOST) return 'engagement';
  return 'contact_lost';
};

const getSubPos = (tick) => {
  if (tick < T_ECHO_DETECT)  return null;
  if (tick >= T_CONTACT_LOST) return null;
  if (tick < T_CONTACT_EST)  return SUB_ECHO_POS;
  const t = Math.min((tick - T_CONTACT_EST) / (T_CONTACT_LOST - T_CONTACT_EST), 1);
  return lerp2(SUB_TRACK[3], SUB_TRACK[4], t);
};

// Three staggered sonar ping waves
const getPingWaves = (tick) => {
  const waves = [];
  const offsets = [0, 6, 12];
  for (const off of offsets) {
    const start = T_CAPTAS_PING + off;
    const elapsed = tick - start;
    if (elapsed >= 0 && elapsed <= 16) {
      const p = elapsed / 16;
      waves.push({ radius: p * CAPTAS_RANGE_NM * NM_TO_M, opacity: 0.70 * (1 - p) });
    }
  }
  return waves;
};

// Small orange ring blooming at sub position on echo return
const getEchoRing = (tick) => {
  const elapsed = tick - T_ECHO_DETECT;
  if (elapsed < 0 || elapsed > 10) return null;
  const p = elapsed / 10;
  return { radius: p * 18 * NM_TO_M, opacity: 0.65 * (1 - p) };
};

// Enemy torpedo: travels from sub toward M48-ALPHA
const getEnemyTorpedoPos = (tick) => {
  if (tick < T_ENEMY_FIRES || tick >= T_ALPHA_HIT) return null;
  const t = (tick - T_ENEMY_FIRES) / (T_ALPHA_HIT - T_ENEMY_FIRES);
  return lerp2(SUB_ECHO_POS, M48_CAPTAS_POS, Math.min(t, 1));
};

// Friendly torpedo: travels from Virginia toward sub's final position
const getFriendlyTorpedoPos = (tick) => {
  if (tick < T_ENGAGEMENT || tick >= T_CONTACT_LOST) return null;
  const t = (tick - T_ENGAGEMENT) / (T_CONTACT_LOST - T_ENGAGEMENT);
  return lerp2(VIRGINIA_POS, SUB_TRACK[4], Math.min(t, 1));
};


const getPhaseBadge = (phase) => {
  const m = {
    deployed:       { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40',                   label: '● Sensors Deployed' },
    captas_ping:    { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40 animate-pulse',     label: '⚡ CAPTAS-4 Active Ping' },
    ping_prop:      { cls: 'bg-cyan-900/80 text-cyan-200 border-cyan-400/40',                   label: '◈ Pulse Propagating' },
    echo_detect:    { cls: 'bg-amber-900/80 text-amber-300 border-amber-500/40 animate-pulse',  label: '⚠ Anomalous Echo Return' },
    mfta_correlate: { cls: 'bg-amber-900/80 text-amber-200 border-amber-500/40 animate-pulse',  label: '◈ Bistatic Cross-Fix' },
    contact_est:    { cls: 'bg-red-900/80 text-red-300 border-red-500/40',                      label: '● SIERRA-7 Identified' },
    enemy_fires:    { cls: 'bg-red-900/80 text-red-200 border-red-400/60 animate-pulse',        label: '⚠ TORPEDO INBOUND — M48-ALPHA' },
    alpha_hit:      { cls: 'bg-orange-900/80 text-orange-300 border-orange-500/40',             label: '✕ M48-ALPHA Destroyed' },
    virginia_cued:  { cls: 'bg-blue-900/80 text-blue-300 border-blue-500/40',                   label: '→ Virginia Cued via ACOMMS' },
    engagement:     { cls: 'bg-red-900/80 text-red-300 border-red-500/40 animate-pulse',        label: '⚡ TORPEDO AWAY — Mk 48 ADCAP' },
    contact_lost:   { cls: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40',          label: '✓ SIERRA-7 Prosecuted' },
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
    if (phase === 'contact_est') {
      map.flyTo(SUB_ECHO_POS, MAP_ZOOM_IN, { duration: 1.5 });
    } else if (phase === 'deployed' || phase === 'idle') {
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
const ASWMissionView = ({ mission, onBack }) => {
  const { saveMission, updateMission } = useMissionStore();
  const { setSelectedHull } = useOutfitterStore();
  const { startNewConfiguration, setPendingMissionSetKey, setPendingMissionSetCaps, setPendingRoleKey } = useConfigurationStore();
  const { setSelectedView } = useNavigationStore();
  const roleAssignments = useMissionStore(s => s.roleAssignments);

  // Build effective roster — override default slots with assigned vessels
  const missionRoleDefs = MISSION_ROLES[MISSION_SET_KEY]?.roles ?? [];
  const effectiveRoster = VESSEL_ROSTER.map((vessel, idx) => {
    const roleDef = missionRoleDefs[idx];
    if (!roleDef) return vessel;
    const assignment = roleAssignments?.[MISSION_SET_KEY]?.[roleDef.roleKey];
    if (!assignment) return vessel;
    return {
      ...vessel,
      // Only use assignment label if it's a custom name (not just the hull name fallback)
      name: (assignment.vesselLabel && assignment.vesselLabel !== assignment.hullName)
        ? assignment.vesselLabel
        : vessel.name,
      hullName: assignment.hullName,
    };
  });
  const [missionName, setMissionName] = useState(mission?.name || '');
  const [currentTick,  setCurrentTick]  = useState(0);
  const [subPulse,     setSubPulse]     = useState(false);
  const [events,       setEvents]       = useState([]);
  const [running,      setRunning]      = useState(false);
  const [paused,        setPaused]        = useState(false);
  const [complete,     setComplete]     = useState(false);

  const tickRef    = useRef(0);
  const tickCallbackRef = useRef(null);
  const mainTimer  = useRef(null);
  const pulseTimer = useRef(null);
  const resetTimer = useRef(null);
  const addEvtRef  = useRef(null);
  const runScenRef = useRef(null);

  // ── Derived from currentTick ──────────────────────────────────────────────
  const phase      = getPhase(currentTick);
  const subPos     = getSubPos(currentTick);
  const pingWaves  = getPingWaves(currentTick);
  const echoRing   = getEchoRing(currentTick);
  const enemyTorpedoPos    = getEnemyTorpedoPos(currentTick);
  const friendlyTorpedoPos = getFriendlyTorpedoPos(currentTick);

  const alphaDestroyed  = currentTick >= T_ALPHA_HIT;
  const showSubAnomaly  = currentTick >= T_ECHO_DETECT && currentTick < T_CONTACT_EST;
  const showSubContact  = currentTick >= T_CONTACT_EST && currentTick < T_CONTACT_LOST;
  const showExplosion   = currentTick >= T_CONTACT_LOST && currentTick < TOTAL_TICKS;
  const showAlphaBoom   = currentTick >= T_ALPHA_HIT && currentTick < T_ALPHA_HIT + 12;
  const alphaBoomRadius = showAlphaBoom ? (currentTick - T_ALPHA_HIT) * 6000 : 0;
  const alphaBoomOpacity = showAlphaBoom ? Math.max(0, 0.75 - (currentTick - T_ALPHA_HIT) * 0.07) : 0;
  const subBoomRadius   = showExplosion ? (currentTick - T_CONTACT_LOST) * 8000 : 0;
  const subBoomOpacity  = showExplosion ? Math.max(0, 0.75 - (currentTick - T_CONTACT_LOST) * 0.07) : 0;

  // Triangulation bearing lines: BRAVO and CHARLIE triangulate, ALPHA shown briefly
  const showAlphaBearing   = currentTick >= T_ECHO_DETECT && currentTick < T_ALPHA_HIT;
  const showBravoBearing   = currentTick >= T_MFTA_BRAVO  && currentTick < T_CONTACT_LOST;
  const showCharlieBearing = currentTick >= T_MFTA_CHARLIE && currentTick < T_CONTACT_LOST;
  // Bistatic triangle (M48-BRAVO ↔ M48-CHARLIE ↔ intersection) appears during correlate
  const showTriangle = currentTick >= T_MFTA_BRAVO && currentTick < T_CONTACT_LOST;

  const showVirginia    = currentTick >= T_VIRGINIA_CUED;

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

  useEffect(() => {
    clearInterval(pulseTimer.current);
    const needsPulse = ['echo_detect', 'mfta_correlate', 'contact_est', 'enemy_fires', 'engagement'].includes(phase);
    if (needsPulse) {
      pulseTimer.current = setInterval(() => setSubPulse(p => !p), 350);
      return () => clearInterval(pulseTimer.current);
    }
    setSubPulse(false);
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
    setSubPulse(false);
    setEvents([]);
    setRunning(false);
    setComplete(false);
  }, [stopAll]);

  const runScenario = useCallback(() => {
    stopAll();
    tickRef.current = 0;
    setCurrentTick(0);
    setSubPulse(false);
    setEvents([]);
    setRunning(true);
    setPaused(false);
    setComplete(false);

    const cb = () => {
      const tick = ++tickRef.current;
      setCurrentTick(tick);

      if (tick === T_DEPLOYED) {
        addEvtRef.current('CTF-72: ASW patrol active — Philippine Sea Sector BRAVO-7', 'info');
        addEvtRef.current('M48-ALPHA: CAPTAS-4 VDS deployed — depth 200m — active sonar ready', 'info');
        addEvtRef.current('M48-BRAVO: MFTA passive array deployed — bistatic receiver SE', 'info');
        addEvtRef.current('M48-CHARLIE: MFTA passive array deployed — bistatic receiver NE', 'info');
      }
      if (tick === T_CAPTAS_PING) {
        addEvtRef.current('M48-ALPHA: CAPTAS PING — 900-2100Hz active pulse — 360° — position revealed', 'warn');
        addEvtRef.current('M48-ALPHA is the bait — crewless hull at risk to draw out submarine', 'info');
      }
      if (tick === T_PING_PROP) {
        addEvtRef.current('M48-ALPHA: Ping propagating — monitoring for returns at 150km envelope', 'info');
      }
      if (tick === T_ECHO_DETECT) {
        addEvtRef.current('M48-ALPHA: ANOMALOUS RETURN — bearing 285, range 42nm — large submerged object', 'warn');
        addEvtRef.current('M48-ALPHA: Doppler shift consistent with submarine hull — cueing M48-BRAVO/CHARLIE', 'warn');
      }
      if (tick === T_MFTA_BRAVO) {
        addEvtRef.current('M48-BRAVO: Bistatic echo received — bearing 308 — cross-fix initiated', 'warn');
      }
      if (tick === T_MFTA_CHARLIE) {
        addEvtRef.current('M48-CHARLIE: Bistatic echo received — bearing 261 — 2-bearing triangulation active', 'warn');
        addEvtRef.current('USW-DSS: Two independent bearings — intersection computing — confidence rising', 'info');
      }
      if (tick === T_CONTACT_EST) {
        addEvtRef.current('USW-DSS: CONTACT ESTABLISHED — 24.14°N 134.96°E — depth est. 280m', 'alert');
        addEvtRef.current('USW-DSS: PLAN Type-093 Shang-class — acoustic signature match 87%', 'alert');
        addEvtRef.current('CTF-72: SIERRA-7 — HOSTILE — weapons free authorized', 'alert');
      }
      if (tick === T_ENEMY_FIRES) {
        addEvtRef.current('SIERRA-7: TORPEDO AWAY — targeting M48-ALPHA CAPTAS pinger', 'alert');
        addEvtRef.current('CTF-72: TORPEDO INBOUND M48-ALPHA — crewless — no crew at risk', 'warn');
        addEvtRef.current('USW-DSS: M48-ALPHA track already shared to BRAVO/CHARLIE via Link 16', 'info');
      }
      if (tick === T_ALPHA_HIT) {
        addEvtRef.current('M48-ALPHA: HIT — CAPTAS hull destroyed — sinking', 'alert');
        addEvtRef.current('M48-ALPHA: Zero crew casualties — unmanned hull expended as designed', 'warn');
        addEvtRef.current('M48-BRAVO M48-CHARLIE: Track maintained — hold SIERRA-7 position', 'info');
        addEvtRef.current('SIERRA-7 has exposed itself — contact quality: fire control grade', 'alert');
      }
      if (tick === T_VIRGINIA_CUED) {
        addEvtRef.current('USW-DSS: ACOMMS burst transmitted — datum 24.14°N 134.96°E — intercept vector encoded — compressed burst', 'info');
        addEvtRef.current('USS Virginia: ACOMMS received — Mk 48 fire control confirmed', 'warn');
      }
      if (tick === T_ENGAGEMENT) {
        addEvtRef.current('USS Virginia: TORPEDO AWAY — Mk 48 ADCAP — active homing', 'alert');
        addEvtRef.current('SIERRA-7: Evasive maneuver — high-speed cavitation — too late', 'alert');
      }
      if (tick === T_CONTACT_LOST) {
        addEvtRef.current('USW-DSS: SIERRA-7 — contact lost — pressure hull failure acoustic', 'success');
        addEvtRef.current('M48-BRAVO: Debris field detected — bearing 095 — engagement confirmed', 'success');
        addEvtRef.current('CTF-72: SIERRA-7 PROSECUTED — sector BRAVO-7 cleared', 'success');
        addEvtRef.current('M48-BRAVO M48-CHARLIE: Initiating second ping cycle', 'info');
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
    startNewConfiguration(vessel.hullName);
    setPendingMissionSetCaps(vessel.capabilities);
    setPendingMissionSetKey(MISSION_SET_KEY);
    // Pass the specific role key so LoadoutBuilder highlights the exact role
    if (vessel.roleKey) setPendingRoleKey(vessel.roleKey);
    setSelectedView('outfitter');
  };

  const handleSave = () => {
    if (!missionName.trim()) return;
    const data = {
      name: missionName.trim(),
      template: 'ASW',
      domain: 'MARITIME',
      status: 'draft',
      duration: 'continuous',
      zoneConfig: {
        name: 'Philippine Sea — Sector BRAVO-7 — PLAN Submarine Transit Route',
        coordinates: [
          { lat: 23.70, lng: 134.30 }, { lat: 25.10, lng: 134.30 },
          { lat: 25.10, lng: 136.10 }, { lat: 23.70, lng: 136.10 },
        ],
        swarmSize: 9,
        swarmFormation: 'bistatic-mesh',
      },
      assignedSquadrons: [],
      stateHierarchies: {
        default:          ['Navigation', 'Payload', 'Comms', 'Mission', 'Vehicle'],
        contact_detected: ['Payload', 'Mission', 'Comms', 'Navigation', 'Vehicle'],
        prosecution:      ['Mission', 'Payload', 'Comms', 'Navigation', 'Vehicle'],
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
    <div className="flex flex-col h-full bg-darkest overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-700/50 flex-shrink-0">
        <button onClick={onBack} className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-[0.75rem]">
          <ChevronLeft size={13} /> Back to Library
        </button>
        <div className="w-px h-4 bg-gray-700/60" />
        <Anchor size={13} className="text-cyan-400" />
        <span className="text-cyan-400 text-[0.8rem] font-semibold tracking-wide">Philippine Sea ASW — BRAVO-7</span>
        <span className="text-gray-600 text-[0.7rem]">·</span>
        <span className="text-gray-500 text-[0.68rem]">CAPTAS/MFTA Multistatic Kill Chain — 7th Fleet / CTF-72</span>
        <div className="flex-1" />
        <span className="px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-400 text-[0.65rem] font-bold uppercase tracking-wider border border-emerald-500/30">ACTIVE</span>
        <input
          value={missionName}
          onChange={e => setMissionName(e.target.value)}
          placeholder="Mission name…"
          className="bg-gray-800/60 border border-gray-700/60 rounded-md px-3 py-1.5 text-white text-[0.78rem] w-52 placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
        />
        <button
          onClick={handleSave}
          disabled={!missionName.trim()}
          className={`px-3 py-1.5 rounded-md text-[0.78rem] font-semibold transition-colors ${missionName.trim() ? 'bg-cyan-600 hover:bg-cyan-500 text-white' : 'bg-gray-700/50 text-gray-600 cursor-not-allowed'}`}
        >
          Save Draft
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 min-h-0 overflow-y-auto">

        {/* ── Animation row ── */}
        <div className="flex" style={{ height: '460px' }}>

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
              <TileLayer url={TILE_SEAMARK} opacity={0.4} />
              <MapInvalidateSize />
              <MapController phase={phase} />

              {/* ── CAPTAS max-range envelope ── */}
              {currentTick >= T_DEPLOYED && (
                <Circle
                  center={M48_CAPTAS_POS}
                  radius={CAPTAS_RANGE_NM * NM_TO_M}
                  pathOptions={{ color: '#67e8f9', weight: 1, fill: false, opacity: 0.10, dashArray: '8 10' }}
                />
              )}

              {/* ── Three staggered sonar ping waves ── */}
              {pingWaves.map((w, i) => (
                <Circle
                  key={`ping-${i}`}
                  center={M48_CAPTAS_POS}
                  radius={w.radius}
                  pathOptions={{ color: '#67e8f9', weight: i === 0 ? 3 : 2, fill: false, opacity: w.opacity }}
                />
              ))}

              {/* ── Echo return ring at sub position ── */}
              {echoRing && (
                <Circle
                  center={SUB_ECHO_POS}
                  radius={echoRing.radius}
                  pathOptions={{ color: '#f97316', weight: 2, fill: false, opacity: echoRing.opacity }}
                />
              )}

              {/* ── Bistatic triangle: M48-BRAVO ↔ M48-CHARLIE ↔ sub ── */}
              {showTriangle && subPos && (
                <Polyline
                  positions={[M48_MFTA_1_POS, subPos, M48_MFTA_2_POS]}
                  pathOptions={{ color: '#fbbf24', weight: 1.5, opacity: 0.35, dashArray: '5 6' }}
                />
              )}

              {/* ── Bearing lines — ALPHA (initial detection), then BRAVO + CHARLIE triangulate ── */}
              {showAlphaBearing && subPos && (
                <Polyline
                  positions={[M48_CAPTAS_POS, subPos]}
                  pathOptions={{ color: '#67e8f9', weight: 2, opacity: 0.50, dashArray: '5 5' }}
                />
              )}
              {showBravoBearing && subPos && (
                <Polyline
                  positions={[M48_MFTA_1_POS, subPos]}
                  pathOptions={{ color: '#fbbf24', weight: 2.5, opacity: 0.75, dashArray: '5 4' }}
                />
              )}
              {showCharlieBearing && subPos && (
                <Polyline
                  positions={[M48_MFTA_2_POS, subPos]}
                  pathOptions={{ color: '#fbbf24', weight: 2.5, opacity: 0.75, dashArray: '5 4' }}
                />
              )}

              {/* ── Submarine projected track ── */}
              {currentTick >= T_CONTACT_EST && currentTick < T_CONTACT_LOST && (
                <Polyline
                  positions={[SUB_TRACK[3], SUB_TRACK[4]]}
                  pathOptions={{ color: '#ef4444', weight: 1.5, opacity: 0.35, dashArray: '6 5' }}
                />
              )}

              {/* ── Enemy torpedo: sub → M48-ALPHA ── */}
              {enemyTorpedoPos && (
                <>
                  <Polyline
                    positions={[SUB_ECHO_POS, enemyTorpedoPos]}
                    pathOptions={{ color: '#ef4444', weight: 1.5, opacity: 0.45, dashArray: '3 5' }}
                  />
                  <CircleMarker
                    center={enemyTorpedoPos}
                    radius={6}
                    pathOptions={{ color: '#ef4444', fillColor: '#fbbf24', fillOpacity: 1, weight: 2 }}
                  >
                    <Tooltip direction="top" offset={[0, -8]}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444' }}>⚠ TORPEDO — SIERRA-7</span>
                    </Tooltip>
                  </CircleMarker>
                </>
              )}

              {/* ── M48-ALPHA explosion ── */}
              {showAlphaBoom && alphaBoomRadius > 0 && (
                <Circle
                  center={M48_CAPTAS_POS}
                  radius={alphaBoomRadius}
                  pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: alphaBoomOpacity * 0.3, weight: 2, opacity: alphaBoomOpacity }}
                />
              )}

              {/* ── Friendly torpedo: Virginia → sub ── */}
              {friendlyTorpedoPos && (
                <>
                  <Polyline
                    positions={[VIRGINIA_POS, friendlyTorpedoPos]}
                    pathOptions={{ color: '#ffffff', weight: 1.5, opacity: 0.35, dashArray: '3 5' }}
                  />
                  <CircleMarker
                    center={friendlyTorpedoPos}
                    radius={6}
                    pathOptions={{ color: '#ffffff', fillColor: '#67e8f9', fillOpacity: 1, weight: 2 }}
                  >
                    <Tooltip direction="top" offset={[0, -8]}>
                      <span style={{ fontSize: 11, fontWeight: 700 }}>Mk 48 ADCAP</span>
                    </Tooltip>
                  </CircleMarker>
                </>
              )}

              {/* ── Hostile sub — anomalous (orange pulsing) ── */}
              {showSubAnomaly && subPos && (
                <>
                  <CircleMarker
                    center={subPos}
                    radius={subPulse ? 13 : 10}
                    pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: subPulse ? 0.85 : 0.55, weight: 2 }}
                  />

                  {subPulse && (
                    <CircleMarker center={subPos} radius={20}
                      pathOptions={{ color: '#f97316', fillOpacity: 0, weight: 2, opacity: 0.30 }}
                    />
                  )}
                </>
              )}

              {/* ── Hostile sub — confirmed contact (red) ── */}
              {showSubContact && subPos && (
                <>
                  <CircleMarker
                    center={subPos}
                    radius={subPulse ? 14 : 11}
                    pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: subPulse ? 0.95 : 0.80, weight: 2 }}
                  />
                  {subPulse && (
                    <CircleMarker center={subPos} radius={22}
                      pathOptions={{ color: '#ef4444', fillOpacity: 0, weight: 2, opacity: 0.35 }}
                    />
                  )}
                </>
              )}

              {/* ── Sub explosion / debris ── */}
              {showExplosion && subBoomRadius > 0 && (
                <Circle
                  center={SUB_TRACK[4]}
                  radius={subBoomRadius}
                  pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: subBoomOpacity * 0.25, weight: 2, opacity: subBoomOpacity }}
                />
              )}
              {currentTick >= T_CONTACT_LOST && (
                <CircleMarker center={SUB_TRACK[4]} radius={6}
                  pathOptions={{ color: '#6b7280', fillColor: '#374151', fillOpacity: 0.9, weight: 1 }}
                />
              )}

              {/* ── Virginia class ── */}
              {showVirginia && (
                <CircleMarker center={VIRGINIA_POS} radius={11}
                  pathOptions={{ color: '#1d4ed8', fillColor: '#1e3a8a', fillOpacity: 0.95, weight: 2 }}
                />
              )}

              {/* ── M48-ALPHA (CAPTAS pinger) ── */}
              {currentTick >= T_DEPLOYED && (
                <CircleMarker
                  center={M48_CAPTAS_POS}
                  radius={alphaDestroyed ? 8 : (phase === 'captas_ping' || phase === 'ping_prop' ? 16 : 13)}
                  pathOptions={{
                    color:       alphaDestroyed ? '#6b7280' : '#67e8f9',
                    fillColor:   alphaDestroyed ? '#374151' : '#67e8f9',
                    fillOpacity: alphaDestroyed ? 0.60 : 0.90,
                    weight: 2,
                  }}
                />
              )}

              {/* ── M48-BRAVO (MFTA passive SE) ── */}
              {currentTick >= T_DEPLOYED && (
                <CircleMarker
                  center={M48_MFTA_1_POS}
                  radius={showBravoBearing ? 13 : 11}
                  pathOptions={{
                    color:       showBravoBearing ? '#fbbf24' : '#3b82f6',
                    fillColor:   showBravoBearing ? '#fbbf24' : '#3b82f6',
                    fillOpacity: 0.90,
                    weight: 2,
                  }}
                />
              )}

              {/* ── M48-CHARLIE (MFTA passive NE) ── */}
              {currentTick >= T_DEPLOYED && (
                <CircleMarker
                  center={M48_MFTA_2_POS}
                  radius={showCharlieBearing ? 13 : 11}
                  pathOptions={{
                    color:       showCharlieBearing ? '#fbbf24' : '#3b82f6',
                    fillColor:   showCharlieBearing ? '#fbbf24' : '#3b82f6',
                    fillOpacity: 0.90,
                    weight: 2,
                  }}
                />
              )}


            </MapContainer>

            {/* ── Phase badge ── */}
            {badge && (
              <div className={`absolute top-3 left-3 z-[500] px-3 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wider pointer-events-none border ${badge.cls}`}>
                {badge.label}
              </div>
            )}

            {/* ── Legend ── */}
            {currentTick >= T_DEPLOYED && (
              <div className="absolute bottom-3 left-3 z-[500] pointer-events-none px-3 py-2 rounded-xl bg-gray-950/80 border border-gray-700/50 backdrop-blur-sm">
                <div className="flex flex-col gap-1">
                  {[
                    { color: '#67e8f9', label: 'M48-ALPHA — CAPTAS Pinger (bait)' },
                    { color: '#fbbf24', label: 'M48-BRAVO/CHARLIE — MFTA + Hanwha' },
                    { color: '#ef4444', label: 'SIERRA-7 — PLAN Type-093' },
                    { color: '#1d4ed8', label: 'USS Virginia (SSN-774)' },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                      <span style={{ fontSize: 10, color: '#9ca3af' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="w-[300px] flex-shrink-0 flex flex-col border-l border-gray-700/50 overflow-hidden bg-darkest">

            {/* Controls */}
            <div className="p-4 border-b border-gray-700/50 flex-shrink-0">
              <p className="text-gray-500 text-[0.65rem] uppercase tracking-widest mb-3">Scenario</p>
              <div className="flex gap-2 mb-3">
                {running ? (
                  <button
                    onClick={pause}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[0.78rem] font-semibold transition-colors $bg-cyan-700 hover:bg-cyan-600 text-white"
                  >
                    <Pause size={13} />
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={paused ? resume : runScenario}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[0.78rem] font-semibold transition-colors $bg-cyan-700 hover:bg-cyan-600 text-white"
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
                  3× Magnet M48 · Virginia SSN-774
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

        {/* ── Vessel Roster ── */}
        <div className="p-4 grid grid-cols-2 gap-3">
          {effectiveRoster.map(vessel => (
            <div key={vessel.name} className="flex border border-gray-700/50 rounded-lg overflow-hidden bg-gray-900/40">
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
                </div>
                {vessel.capabilities.map((cap, i) => (
                  <div key={i} className="border border-gray-700/50 rounded px-2 py-0.5 text-[0.62rem] text-gray-400 bg-gray-800/30">
                    {cap}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>{/* /scrollable body */}
    </div>
  );
};

export default ASWMissionView;
