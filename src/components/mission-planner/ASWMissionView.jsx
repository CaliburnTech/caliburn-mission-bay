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

const MISSION_SET_KEY = 'ASW';
const MISSION_SET_CAPS = ['CAPTAS-4 Variable Depth Sonar', 'USW-DSS (AN/UYQ-100)', 'HiveLink SDR', 'Link 16 Track Broadcast', 'MFTA Towed Array', 'EvoLogics Acoustic Modem', 'Mk 54 Lightweight Torpedo'];

// ─── Geography ────────────────────────────────────────────────────────────────
const NM_TO_M = 1852;

const MAP_CENTER    = [24.35, 135.05];
const MAP_ZOOM      = 8;
const MAP_ZOOM_IN   = 9;   // zooms in when contact established

const M48_CAPTAS_POS = [24.40, 135.20];   // M48-ALPHA — lead passive array + single confirmation ping
const M48_MFTA_1_POS = [24.05, 135.65];   // M48-BRAVO  — passive MFTA receiver SE
const M48_MFTA_2_POS = [24.75, 135.65];   // M48-CHARLIE — passive MFTA receiver NE

const SUB_ECHO_POS = [24.14, 134.96];   // passive contact datum
const SUB_TRACK    = [
  [24.28, 134.38],
  [24.24, 134.56],
  [24.20, 134.74],
  [24.14, 134.96],
  [24.20, 135.08],
];
const HELO_START = [25.05, 135.42];   // MQ-8C Fire Scout ingress from the CSG (NE)
const HELO_DROP  = [24.29, 135.03];   // Mk 54 release point above the datum

const CAPTAS_RANGE_NM = 81;

// ─── Tick milestones ──────────────────────────────────────────────────────────
const T_DEPLOYED          =  8;
const T_PASSIVE_SEARCH    = 20;   // silent passive barrier established
const T_PASSIVE_DETECT    = 40;   // lead M48 holds a passive tonal
const T_MFTA_BRAVO        = 52;   // M48-BRAVO bearing line appears
const T_MFTA_CHARLIE      = 60;   // M48-CHARLIE bearing line appears
const T_CONTACT_EST       = 72;   // passive multistatic cross-fix — track localized
const T_ACTIVE_CONFIRM    = 88;   // lead M48 emits one active confirmation ping
const T_CONFIRMED         = 100;  // classified PLAN Type-093 — weapons free
const T_HELO_INBOUND      = 108;  // MQ-8C Fire Scout vectored to datum
const T_TORPEDO_DROP      = 122;  // Mk 54 lightweight torpedo released
const T_CONTACT_LOST      = 138;  // SIERRA-7 prosecuted
const TOTAL_TICKS         = 152;

const TICK_MS = 280;

// ─── Loadouts ─────────────────────────────────────────────────────────────────
const M48_ALPHA_MOUNTS = [
  { slot: 'PASSIVE + CONFIRM SONAR', name: 'CAPTAS-4 Variable Depth Sonar', vendor: 'Thales',   description: 'Towed passively during the search; emits a single active confirmation ping only once the passive cross-fix holds a fire-control track' },
  { slot: 'C2 / PROCESSING', name: 'USW-DSS (AN/UYQ-100)',          vendor: 'Leidos',   description: 'Network-centric ASW decision support — fuses all platform data — Link 16 broadcast' },
  { slot: 'COMMS',           name: 'HiveLink SDR',                  vendor: 'HiveLink', description: 'Multi-waveform radio — WaveformX, WaveformY, Link 16 — tactical data link node' },
  { slot: 'DATA LINK',       name: 'Link 16 Track Broadcast',       vendor: 'MIDS-LVT', description: 'Dedicated MIDS-LVT Link 16 terminal — broadcasts the common ASW picture in J-series to BRAVO/CHARLIE, the MQ-8C, and manned combatants' },
];
const M48_MFTA_MOUNTS = [
  { slot: 'PASSIVE SONAR',   name: 'MFTA Towed Array',              vendor: 'Lockheed Martin',     description: 'Silent passive receiver — holds the submarine on tonals — multistatic geometry triangulation' },
  { slot: 'C2 / PROCESSING', name: 'USW-DSS (AN/UYQ-100)',          vendor: 'Leidos',              description: 'Receives common ASW picture from lead M48 via Link 16' },
  { slot: 'COMMS',           name: 'HiveLink SDR',                  vendor: 'HiveLink',            description: 'Multi-waveform radio — WaveformX, WaveformY, Link 16 — tactical data link node' },
  { slot: 'ACOUSTIC COMMS',  name: 'EvoLogics Acoustic Modem',      vendor: 'EvoLogics',           description: 'S2C underwater acoustic modem — JANUS (STANAG 4748) capable — silent two-way ACOMMS across the passive line' },
];
const MQ8C_MOUNTS = [
  { slot: 'WEAPON',          name: 'Mk 54 Lightweight Torpedo',     vendor: 'Raytheon',            description: 'Air-dropped lightweight ASW torpedo — parachute retard entry, active/passive acoustic homing on the datum' },
  { slot: 'DATA LINK',       name: 'Link 16 Track Broadcast',       vendor: 'MIDS-LVT',            description: 'Receives the fire-control track from the M48 line and cues the release point' },
];

const VESSEL_ROSTER = [
  { name: 'M48 ALPHA', roleDescriptor: '(Lead / Passive)', image: imgM48, hullName: 'M48', roleKey: 'ASW_ALPHA', capabilities: ['CAPTAS-4 Variable Depth Sonar', 'USW-DSS (AN/UYQ-100)', 'HiveLink SDR', 'Link 16 Track Broadcast'] },
  { name: 'M48 BRAVO', roleDescriptor: '(Passive MFTA)', image: imgM48, hullName: 'M48', roleKey: 'ASW_BRAVO', capabilities: ['MFTA Towed Array', 'USW-DSS (AN/UYQ-100)', 'HiveLink SDR', 'Link 16 Track Broadcast', 'EvoLogics Acoustic Modem', 'Bistatic Cross-Fix Node'] },
  { name: 'M48 CHARLIE', roleDescriptor: '(Passive MFTA)', image: imgM48, hullName: 'M48', roleKey: 'ASW_CHARLIE', capabilities: ['MFTA Towed Array', 'USW-DSS (AN/UYQ-100)', 'HiveLink SDR', 'Link 16 Track Broadcast', 'EvoLogics Acoustic Modem', 'Bistatic Cross-Fix Node'] },
  { name: 'MQ-8C Fire Scout', roleDescriptor: '(Mk 54)', image: HULL_IMAGES['MQ-8C Fire Scout'], hullName: 'MQ-8C Fire Scout', roleKey: 'ASW_HELO', capabilities: ['Mk 54 Lightweight Torpedo', 'Link 16 Track Broadcast'] },
];

// ─── Phase narratives ─────────────────────────────────────────────────────────
const PHASE_NARRATIVE = {
  idle:             null,
  deployed:         { title: 'Assets on Station', body: 'Three M48s hold station and stream passive towed arrays in a multistatic barrier. The MQ-8C Fire Scout waits on the CSG deck at alert — no aircraft airborne, no active emissions.' },
  passive_search:   { title: 'Silent Passive Barrier', body: 'All three M48s listen only. No pinging, no radiated energy — a transiting submarine has no way to know the barrier is there.' },
  passive_detect:   { title: 'Passive Tonal Held', body: 'Lead M48 (ALPHA) holds a narrowband machinery tonal at bearing 285. Consistent with a large submerged hull. Cueing BRAVO and CHARLIE for a cross-fix — still fully passive.' },
  mfta_correlate:   { title: 'Multistatic Cross-Fix', body: 'BRAVO and CHARLIE add independent passive bearings. Three bearing lines intersect — USW-DSS localizes the contact without a single active emission.' },
  contact_est:      { title: 'SIERRA-7 Localized (Passive)', body: 'USW-DSS holds a fire-control-grade track from passive tonals alone. Signature suggests PLAN Type-093. The fleet is still silent — the submarine remains unaware it has been found.' },
  active_confirm:   { title: 'Single Confirmation Ping', body: 'With the track already localized, the lead M48 emits exactly one active pulse to confirm range and classification. One ping — then straight back to silent.' },
  confirmed:        { title: 'SIERRA-7 Confirmed — Weapons Free', body: 'Active return confirms PLAN Type-093 Shang-class at 87%. CTF-72 authorizes weapons free. MQ-8C Fire Scout launched from the CSG for prosecution.' },
  helo_inbound:     { title: 'MQ-8C Fire Scout Inbound', body: 'The unmanned helicopter is vectored to the datum over Link 16, holding the M48-derived track. Mk 54 lightweight torpedo armed. The sensor line stays silent.' },
  torpedo_drop:     { title: 'Mk 54 Away', body: 'MQ-8C releases the Mk 54 over the datum — parachute retard entry, then active/passive acoustic homing on SIERRA-7. The shooter is an aircraft; the M48s never had to act as bait.' },
  contact_lost:     { title: 'SIERRA-7 Prosecuted', body: 'Acoustic transient consistent with pressure hull failure. SIERRA-7 contact lost — debris field confirmed on HORUS passive arrays. Sector BRAVO-7 cleared. All three M48s intact.' },
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
  if (tick < T_DEPLOYED)        return 'idle';
  if (tick < T_PASSIVE_SEARCH)  return 'deployed';
  if (tick < T_PASSIVE_DETECT)  return 'passive_search';
  if (tick < T_MFTA_BRAVO)      return 'passive_detect';
  if (tick < T_CONTACT_EST)     return 'mfta_correlate';
  if (tick < T_ACTIVE_CONFIRM)  return 'contact_est';
  if (tick < T_CONFIRMED)       return 'active_confirm';
  if (tick < T_HELO_INBOUND)    return 'confirmed';
  if (tick < T_TORPEDO_DROP)    return 'helo_inbound';
  if (tick < T_CONTACT_LOST)    return 'torpedo_drop';
  return 'contact_lost';
};

const getSubPos = (tick) => {
  if (tick < T_PASSIVE_DETECT) return null;
  if (tick >= T_CONTACT_LOST)  return null;
  if (tick < T_CONTACT_EST)    return SUB_ECHO_POS;
  const t = Math.min((tick - T_CONTACT_EST) / (T_CONTACT_LOST - T_CONTACT_EST), 1);
  return lerp2(SUB_TRACK[3], SUB_TRACK[4], t);
};

// Single confirmation ping wave from the lead M48
const getPingWaves = (tick) => {
  const waves = [];
  const elapsed = tick - T_ACTIVE_CONFIRM;
  if (elapsed >= 0 && elapsed <= 16) {
    const p = elapsed / 16;
    waves.push({ radius: p * CAPTAS_RANGE_NM * NM_TO_M, opacity: 0.70 * (1 - p) });
  }
  return waves;
};

// Orange ring blooming at sub position when the confirmation ping returns
const getEchoRing = (tick) => {
  const elapsed = tick - (T_ACTIVE_CONFIRM + 8);
  if (elapsed < 0 || elapsed > 10) return null;
  const p = elapsed / 10;
  return { radius: p * 18 * NM_TO_M, opacity: 0.65 * (1 - p) };
};

// MQ-8C Fire Scout: flies from the CSG toward the drop point, then loiters at release point
const getHeloPos = (tick) => {
  if (tick < T_HELO_INBOUND) return null;
  if (tick < T_TORPEDO_DROP) {
    const t = (tick - T_HELO_INBOUND) / (T_TORPEDO_DROP - T_HELO_INBOUND);
    return lerp2(HELO_START, HELO_DROP, Math.min(t, 1));
  }
  return HELO_DROP;
};

// Mk 54 torpedo: travels from the helo drop point to the sub's final position
const getFriendlyTorpedoPos = (tick) => {
  if (tick < T_TORPEDO_DROP || tick >= T_CONTACT_LOST) return null;
  const t = (tick - T_TORPEDO_DROP) / (T_CONTACT_LOST - T_TORPEDO_DROP);
  return lerp2(HELO_DROP, SUB_TRACK[4], Math.min(t, 1));
};


const getPhaseBadge = (phase) => {
  const m = {
    deployed:       { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40',                   label: '● Sensors Deployed' },
    passive_search: { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40',                   label: '◌ Passive Barrier — Silent' },
    passive_detect: { cls: 'bg-amber-900/80 text-amber-300 border-amber-500/40 animate-pulse',  label: '⚠ Passive Tonal Held' },
    mfta_correlate: { cls: 'bg-amber-900/80 text-amber-200 border-amber-500/40 animate-pulse',  label: '◈ Multistatic Cross-Fix' },
    contact_est:    { cls: 'bg-red-900/80 text-red-300 border-red-500/40',                      label: '● SIERRA-7 Localized (Passive)' },
    active_confirm: { cls: 'bg-cyan-900/80 text-cyan-200 border-cyan-400/40 animate-pulse',     label: '⚡ Single Confirmation Ping' },
    confirmed:      { cls: 'bg-red-900/80 text-red-300 border-red-500/40',                      label: '● SIERRA-7 Confirmed — Weapons Free' },
    helo_inbound:   { cls: 'bg-blue-900/80 text-blue-300 border-blue-500/40 animate-pulse',     label: '→ MQ-8C Fire Scout Inbound' },
    torpedo_drop:   { cls: 'bg-red-900/80 text-red-300 border-red-500/40 animate-pulse',        label: '⚡ Mk 54 Away' },
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
  const { startNewConfiguration, setPendingMissionSetKey, setPendingMissionSetCaps, setPendingRoleKey, setPendingVesselLabel, activeConfig } = useConfigurationStore();
  const { setSelectedView } = useNavigationStore();
  const roleAssignments = useMissionStore(s => s.roleAssignments);
  const savedConfigurations = useConfigurationStore(s => s.savedConfigurations);
  const [swapModal, setSwapModal] = useState(null); // { roleKey: string } | null

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

  const [showLog, setShowLog] = useState(false);
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
  const vesselLabelsRef = useRef([]);
  const runScenRef = useRef(null);

  // ── Derived from currentTick ──────────────────────────────────────────────
  const phase      = getPhase(currentTick);
  const subPos     = getSubPos(currentTick);
  const pingWaves  = getPingWaves(currentTick);
  const echoRing   = getEchoRing(currentTick);
  const heloPos            = getHeloPos(currentTick);
  const friendlyTorpedoPos = getFriendlyTorpedoPos(currentTick);

  const showSubAnomaly  = currentTick >= T_PASSIVE_DETECT && currentTick < T_CONFIRMED;
  const showSubContact  = currentTick >= T_CONFIRMED && currentTick < T_CONTACT_LOST;
  const showExplosion   = currentTick >= T_CONTACT_LOST && currentTick < TOTAL_TICKS;
  const subBoomRadius   = showExplosion ? (currentTick - T_CONTACT_LOST) * 8000 : 0;
  const subBoomOpacity  = showExplosion ? Math.max(0, 0.75 - (currentTick - T_CONTACT_LOST) * 0.07) : 0;

  // Passive listening rings around each M48 while the barrier is silent
  const showPassiveListening = currentTick >= T_PASSIVE_SEARCH && currentTick < T_ACTIVE_CONFIRM;
  // The lead M48 emits its single active ping during the confirm window
  const alphaPinging = currentTick >= T_ACTIVE_CONFIRM && currentTick < T_ACTIVE_CONFIRM + 16;

  // Triangulation bearing lines: ALPHA holds first, BRAVO and CHARLIE complete the cross-fix
  const showAlphaBearing   = currentTick >= T_PASSIVE_DETECT && currentTick < T_CONTACT_LOST;
  const showBravoBearing   = currentTick >= T_MFTA_BRAVO  && currentTick < T_CONTACT_LOST;
  const showCharlieBearing = currentTick >= T_MFTA_CHARLIE && currentTick < T_CONTACT_LOST;
  // Bistatic triangle (M48-BRAVO ↔ M48-CHARLIE ↔ intersection) appears during correlate
  const showTriangle = currentTick >= T_MFTA_BRAVO && currentTick < T_CONTACT_LOST;

  const showHelo    = currentTick >= T_HELO_INBOUND;

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
    const needsPulse = ['passive_detect', 'mfta_correlate', 'contact_est', 'active_confirm', 'confirmed', 'torpedo_drop'].includes(phase);
    if (needsPulse) {
      pulseTimer.current = setInterval(() => setSubPulse(p => !p), 350);
      return () => clearInterval(pulseTimer.current);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset of timer-driven pulse state when the animated phase set is exited; cannot be derived during render
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
      const v0 = vesselLabelsRef.current[0] ?? 'M48 (Lead)';
      const v1 = vesselLabelsRef.current[1] ?? 'M48 (MFTA)';
      const v2 = vesselLabelsRef.current[2] ?? 'M48 (MFTA)';
      const v3 = vesselLabelsRef.current[3] ?? 'MQ-8C Fire Scout';
      setCurrentTick(tick);

      if (tick === T_DEPLOYED) {
        addEvtRef.current('CTF-72: ASW patrol active — Philippine Sea Sector BRAVO-7', 'info');
        addEvtRef.current(`${v0}: Passive towed array deployed — lead receiver, EMCON strict`, 'info');
        addEvtRef.current(`${v1}: MFTA passive array deployed — receiver SE`, 'info');
        addEvtRef.current(`${v2}: MFTA passive array deployed — receiver NE`, 'info');
        addEvtRef.current(`${v3}: On CSG deck — alert-15 — no aircraft airborne`, 'info');
      }
      if (tick === T_PASSIVE_SEARCH) {
        addEvtRef.current('Barrier established — all arrays passive — zero radiated energy', 'info');
      }
      if (tick === T_PASSIVE_DETECT) {
        addEvtRef.current(`${v0}: PASSIVE TONAL — bearing 285 — narrowband machinery line`, 'warn');
        addEvtRef.current(`${v0}: Signature consistent with submerged hull — cueing ${v1}/${v2}`, 'warn');
      }
      if (tick === T_MFTA_BRAVO) {
        addEvtRef.current(`${v1}: Passive bearing 308 — cross-fix initiated — still silent`, 'warn');
      }
      if (tick === T_MFTA_CHARLIE) {
        addEvtRef.current(`${v2}: Passive bearing 261 — 3-array triangulation active`, 'warn');
        addEvtRef.current('USW-DSS: Independent bearings intersecting — confidence rising', 'info');
      }
      if (tick === T_CONTACT_EST) {
        addEvtRef.current('USW-DSS: CONTACT LOCALIZED (PASSIVE) — 24.14°N 134.96°E — depth est. 280m', 'alert');
        addEvtRef.current('USW-DSS: Signature suggests PLAN Type-093 Shang-class — passive match', 'alert');
        addEvtRef.current('Track fire-control grade — submarine unaware — fleet still silent', 'info');
      }
      if (tick === T_ACTIVE_CONFIRM) {
        addEvtRef.current(`${v0}: SINGLE CONFIRMATION PING — 900-2100Hz — one pulse only`, 'warn');
        addEvtRef.current(`${v0}: Ping complete — returning to passive — EMCON restored`, 'info');
      }
      if (tick === T_CONFIRMED) {
        addEvtRef.current('USW-DSS: Active return confirms PLAN Type-093 — 87% classification', 'alert');
        addEvtRef.current('CTF-72: SIERRA-7 — HOSTILE — weapons free authorized', 'alert');
        addEvtRef.current(`${v3}: Launch — vectoring to datum via Link 16 — Mk 54 armed`, 'warn');
      }
      if (tick === T_HELO_INBOUND) {
        addEvtRef.current(`${v3}: Inbound — holding M48-derived track — sensor line silent`, 'info');
      }
      if (tick === T_TORPEDO_DROP) {
        addEvtRef.current(`${v3}: Mk 54 AWAY — parachute retard — active/passive homing`, 'alert');
        addEvtRef.current('SIERRA-7: Evasive maneuver — high-speed cavitation — too late', 'alert');
      }
      if (tick === T_CONTACT_LOST) {
        addEvtRef.current('USW-DSS: SIERRA-7 — contact lost — pressure hull failure acoustic', 'success');
        addEvtRef.current(`${v1}: Debris field detected — bearing 095 — engagement confirmed`, 'success');
        addEvtRef.current('CTF-72: SIERRA-7 PROSECUTED — sector BRAVO-7 cleared — all M48s intact', 'success');
        addEvtRef.current(`${v0} ${v1} ${v2}: Resuming passive barrier patrol`, 'info');
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
    // Only start fresh if no active config for this hull — preserve user's customisations on re-entry
    const currentActive = useConfigurationStore.getState().activeConfig;
    if (!currentActive || currentActive.hullName !== vessel.hullName) {
      startNewConfiguration(vessel.hullName);
    }
    setPendingMissionSetCaps(vessel.capabilities);
    setPendingMissionSetKey(MISSION_SET_KEY);
    // Pass the specific role key so LoadoutBuilder highlights the exact role
    if (vessel.roleKey) setPendingRoleKey(vessel.roleKey);
    setPendingVesselLabel(vessel.name);
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
    <div className="flex flex-col bg-darkest">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-700/50 flex-shrink-0 overflow-x-auto">
        <button onClick={onBack} className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-[0.75rem]">
          <ChevronLeft size={13} /> Back to Library
        </button>
        <div className="w-px h-4 bg-gray-700/60" />
        <Anchor size={13} className="text-cyan-400" />
        <span className="text-cyan-400 text-[0.8rem] font-semibold tracking-wide">Philippine Sea ASW — BRAVO-7</span>
        <span className="hidden md:inline text-gray-600 text-[0.7rem]">·</span>
        <span className="hidden md:inline text-gray-500 text-[0.68rem]">Passive Multistatic Kill Chain — 7th Fleet / CTF-72</span>
        <div className="flex-1" />
        <span className="px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-400 text-[0.65rem] font-bold uppercase tracking-wider border border-emerald-500/30">ACTIVE</span>
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

              {/* ── Passive listening rings around each M48 (silent search) ── */}
              {showPassiveListening && [M48_CAPTAS_POS, M48_MFTA_1_POS, M48_MFTA_2_POS].map((pos, i) => (
                <Circle
                  key={`listen-${i}`}
                  center={pos}
                  radius={38 * NM_TO_M}
                  pathOptions={{ color: '#3b82f6', weight: 1, fill: false, opacity: 0.14, dashArray: '3 8' }}
                />
              ))}

              {/* ── CAPTAS confirmation-ping range envelope (only while pinging) ── */}
              {alphaPinging && (
                <Circle
                  center={M48_CAPTAS_POS}
                  radius={CAPTAS_RANGE_NM * NM_TO_M}
                  pathOptions={{ color: '#67e8f9', weight: 1, fill: false, opacity: 0.10, dashArray: '8 10' }}
                />
              )}

              {/* ── Single confirmation ping wave ── */}
              {pingWaves.map((w, i) => (
                <Circle
                  key={`ping-${i}`}
                  center={M48_CAPTAS_POS}
                  radius={w.radius}
                  pathOptions={{ color: '#67e8f9', weight: 3, fill: false, opacity: w.opacity }}
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

              {/* ── Bearing lines — ALPHA (passive), then BRAVO + CHARLIE triangulate ── */}
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

              {/* ── MQ-8C Fire Scout ingress path + Mk 54 torpedo ── */}
              {friendlyTorpedoPos && (
                <>
                  <Polyline
                    positions={[HELO_DROP, friendlyTorpedoPos]}
                    pathOptions={{ color: '#ffffff', weight: 1.5, opacity: 0.35, dashArray: '3 5' }}
                  />
                  <CircleMarker
                    center={friendlyTorpedoPos}
                    radius={6}
                    pathOptions={{ color: '#ffffff', fillColor: '#67e8f9', fillOpacity: 1, weight: 2 }}
                  >
                    <Tooltip direction="top" offset={[0, -8]}>
                      <span style={{ fontSize: 11, fontWeight: 700 }}>Mk 54 Torpedo</span>
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

              {/* ── MQ-8C Fire Scout ── */}
              {showHelo && heloPos && (
                <CircleMarker center={heloPos} radius={10}
                  pathOptions={{ color: '#4ade80', fillColor: '#166534', fillOpacity: 0.95, weight: 2 }}
                >
                  <Tooltip direction="top" offset={[0, -8]}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#4ade80' }}>MQ-8C Fire Scout</span>
                  </Tooltip>
                </CircleMarker>
              )}

              {/* ── M48-ALPHA (lead passive array / single confirm ping) ── */}
              {currentTick >= T_DEPLOYED && (
                <CircleMarker
                  center={M48_CAPTAS_POS}
                  radius={alphaPinging ? 16 : 13}
                  pathOptions={{
                    color:       '#67e8f9',
                    fillColor:   '#67e8f9',
                    fillOpacity: 0.90,
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
              <div className="hidden md:block absolute bottom-3 left-3 z-[500] pointer-events-none px-3 py-2 rounded-xl bg-gray-950/80 border border-gray-700/50 backdrop-blur-sm">
                <div className="flex flex-col gap-1">
                  {[
                    { color: '#67e8f9', label: `${effectiveRoster[0]?.name ?? 'M48 (Lead)'} — Lead Passive / Confirm Ping` },
                    { color: '#fbbf24', label: `${effectiveRoster[1]?.name ?? 'M48 (MFTA)'} / ${effectiveRoster[2]?.name ?? 'M48 (MFTA)'} — MFTA Passive` },
                    { color: '#ef4444', label: 'SIERRA-7 — PLAN Type-093' },
                    { color: '#4ade80', label: `${effectiveRoster[3]?.name ?? 'MQ-8C Fire Scout'} — Mk 54 Prosecutor` },
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
                  3× Magnet M48 · MQ-8C Fire Scout
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

export default ASWMissionView;
