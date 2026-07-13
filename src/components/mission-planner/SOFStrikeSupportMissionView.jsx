import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import {
  MapContainer, TileLayer, Circle, CircleMarker, Polyline, Tooltip, ZoomControl, useMap
} from 'react-leaflet';
import { Play, Pause, RotateCcw, Ship, ChevronLeft, Check, Settings, ArrowLeftRight } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import useMissionStore from '../../store/missionStore';
import useOutfitterStore from '../../store/outfitterStore';
import useConfigurationStore from '../../store/configurationStore';
import useNavigationStore from '../../store/navigationStore';
import { vesselHullData } from '../../data/vesselData';
import { MISSION_ROLES } from '../../data/missionRoles';
import imgSaildrone from '../../assets/images/SaildroneUSV.png';
import imgVATN from '../../assets/images/VATN_New.png';
import SwapVesselModal from './SwapVesselModal';
import ReadinessChecklist from './ReadinessChecklist';
import { getMissionReadiness } from '../../utils/missionReadiness';
import { HULL_IMAGES } from '../../utils/hullImages';

const MISSION_SET_KEY = 'SOF_STRIKE_SUPPORT';
const MISSION_SET_CAPS = ['SOF Insertion Pod', 'UUV Disablement Kit', 'HiddenLevel Passive RF Sensor', 'SBG Ekinox Micro INS', 'Cryptographic Communications Module', 'Lattice Mesh Network'];

// ─── Vessel roster ────────────────────────────────────────────────────────────
const VESSEL_ROSTER = [
  { name: 'Saildrone Spectre (Covert SOF Host)', roleDescriptor: '(Covert SOF Host)', image: imgSaildrone, hullName: 'Saildrone Spectre', capabilities: ['SOF Insertion Pod', 'HiddenLevel Passive RF Sensor', 'SBG Ekinox Micro INS', 'Cryptographic Communications Module'], roleKey: 'SOF_HOST' },
  { name: 'VATN S6 (Clandestine Disablement)', roleDescriptor: '(Clandestine Disablement)', image: imgVATN, hullName: 'VATN S6', capabilities: ['UUV Disablement Kit', 'SBG Ekinox Micro INS', 'Lattice Mesh Network'], roleKey: 'SOF_DISABLEMENT' },
];

// ─── Geography ────────────────────────────────────────────────────────────────
// Theater: Strait of Hormuz littoral — CENTCOM / CTF-56 NAVCENT SOF cell.
const NM_TO_M = 1852;
const MAP_CENTER = [26.6, 56.5];
const MAP_ZOOM = 9;

// Covert launch position (host mother-ship stand-off point)
const LAUNCH_POS = [26.35, 56.85];

// Covert transit lane → release point (host, EMCON, sub-surface evasion)
const TRANSIT_TRACK = [
  [26.35, 56.85],  // Alpha — covert launch
  [26.48, 56.72],  // Bravo — lane midpoint
  [26.58, 56.60],  // Charlie — approach to littoral (EW decoy dropped near here, en route)
  [26.64, 56.52],  // Delta — RELEASE POINT
];

// Release point (last waypoint on transit track)
const RELEASE_PT = [26.64, 56.52];

// SOF shore objective — Larak Island, Iran (actually ashore; earlier coordinates
// landed in open water — verified against a land/water mask)
const SOF_OBJECTIVE = [26.85, 56.37];

// SOF delivery track — the host (Spectre) runs this leg itself, round-trip, with the
// SOF element aboard. There is no separate deployable "pod" vehicle: Spectre makes
// the run to the shore objective and back.
const SOF_TRACK = [
  RELEASE_PT,
  [26.745, 56.445],
  SOF_OBJECTIVE,
];
const SOF_TRACK_RETURN = [...SOF_TRACK].slice().reverse();

// Target hull anchored in the littoral (disablement objective)
const TARGET_HULL = [26.58, 56.40];

// UUV disablement track — release point → target hull, GPS-denied INS.
// The UUV is released here BEFORE the host departs for the shore objective, so it
// transits independently while the host is still en route to the island — not after
// the host has already come back.
const UUV_TRACK = [
  RELEASE_PT,
  [26.62, 56.47],
  [26.60, 56.43],
  TARGET_HULL,
];

// Host egress track (alternate route out of the littoral)
const EGRESS_TRACK = [
  RELEASE_PT,
  [26.50, 56.66],
  [26.38, 56.80],
  LAUNCH_POS,
];

// EW decoy / HiddenLevel RF screen node — sits on the host's inbound transit lane
// (near the "Charlie" waypoint) so it reads as something Spectre drops off on the way
// in, not something that appears out of nowhere near the target later.
const EW_DECOY_NODE = [26.55, 56.58];
const EW_SCREEN_M = 9 * NM_TO_M;

// GPS-denied littoral envelope (INS active throughout)
const GPS_DENIED_CENTER = [26.62, 56.48];
const GPS_DENIED_M = 20 * NM_TO_M;

// ─── Tick milestones ──────────────────────────────────────────────────────────
// The host (Spectre) makes the SOF delivery run itself. The UUV is released at the
// release point BEFORE the host departs for the island, so the two effects run
// concurrently: the UUV heads for the target hull on its own while Spectre is still
// en route to (and back from) the shore objective. The EW decoy is dropped on the
// inbound transit leg, then goes active later when the UUV actually needs the screen.
const T_TRANSIT_START        =  6;   // covert_transit
const T_DECOY_DROP           = 18;   // EW decoy node dropped on the transit lane (dormant)
const T_RELEASE_POINT        = 24;   // release_point reached, staging both effects
const T_RELEASE_UUV          = 30;   // UUV released — on the way out, before the SOF run
const T_SOF_DEPART           = 36;   // host departs release point, SOF element aboard
const T_UUV_TRANSIT          = 42;   // UUV begins its own INS transit (concurrent with host's SOF leg)
const T_SOF_ASHORE           = 54;   // host arrives at shore objective
const T_RETURN_DEPART        = 62;   // host departs shore objective, SOF element disembarked
const T_TARGET_ACQUIRED      = 66;   // UUV localizes target hull (host still returning)
const T_FIRING_SOLUTION      = 74;   // UUV computes firing solution
const T_RETURN_RELEASE_POINT = 80;   // host back at release point — relay for UUV authorization traffic
const T_HITL_AUTHORIZE       = 82;   // hitl_authorize (human checkpoint gate — HOLDS)
const T_HITL_CLEARED         = 100;  // authorization granted by tick
const T_DISABLEMENT          = 102;  // disablement_effect
const T_EGRESS               = 112;  // egress begins
const T_EGRESS_COMPLETE      = 130;  // host clear of littoral
const T_EXFIL_CONFIRM        = 136;  // exfil_confirm
const TOTAL_TICKS            = 144;
const TICK_MS                = 180;

const TILE_BASE    = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_SEAMARK = 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const lerp2    = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const trackPos = (track, t) => {
  const clamped  = Math.min(Math.max(t, 0), 0.9999);
  const progress = clamped * (track.length - 1);
  const idx      = Math.floor(progress);
  return lerp2(track[idx], track[idx + 1], progress - idx);
};

const EVENT_COLORS = {
  warn: 'text-amber-400', alert: 'text-red-400', info: 'text-cyan-400', success: 'text-emerald-400',
};

const getPhase = (tick) => {
  if (tick < T_TRANSIT_START)        return 'idle';
  if (tick < T_RELEASE_POINT)        return 'covert_transit';
  if (tick < T_RELEASE_UUV)          return 'release_point';
  if (tick < T_SOF_DEPART)           return 'release_uuv';
  if (tick < T_UUV_TRANSIT)          return 'sof_delivery_transit';
  if (tick < T_SOF_ASHORE)           return 'uuv_ins_transit';
  if (tick < T_RETURN_DEPART)        return 'sof_ashore';
  if (tick < T_TARGET_ACQUIRED)      return 'return_transit';
  if (tick < T_FIRING_SOLUTION)      return 'target_acquired';
  if (tick < T_HITL_AUTHORIZE)       return 'firing_solution';
  if (tick < T_DISABLEMENT)          return 'hitl_authorize';
  if (tick < T_EGRESS)               return 'disablement_effect';
  if (tick < T_EXFIL_CONFIRM)        return 'egress';
  return 'exfil_confirm';
};

// Host (Saildrone Spectre) position across the entire mission — including the SOF
// delivery leg, which the host runs itself instead of a separate deployable pod.
const getHostPos = (tick) => {
  if (tick < T_TRANSIT_START) return TRANSIT_TRACK[0];
  if (tick < T_RELEASE_POINT) {
    const t = (tick - T_TRANSIT_START) / (T_RELEASE_POINT - T_TRANSIT_START);
    return trackPos(TRANSIT_TRACK, t);
  }
  if (tick < T_SOF_DEPART) {
    // Holding at the release point — staging both effects (UUV releases first)
    return RELEASE_PT;
  }
  if (tick < T_SOF_ASHORE) {
    // Host itself transits from the release point to the shore objective — SOF element
    // aboard. The UUV was already released before this leg and is now transiting on its own.
    const t = (tick - T_SOF_DEPART) / (T_SOF_ASHORE - T_SOF_DEPART);
    return trackPos(SOF_TRACK, t);
  }
  if (tick < T_RETURN_DEPART) {
    // Holding at the shore objective while the SOF element disembarks
    return SOF_OBJECTIVE;
  }
  if (tick < T_RETURN_RELEASE_POINT) {
    // Host reverses course, returning to the release point
    const t = (tick - T_RETURN_DEPART) / (T_RETURN_RELEASE_POINT - T_RETURN_DEPART);
    return trackPos(SOF_TRACK_RETURN, t);
  }
  if (tick < T_EGRESS) {
    // Back at the release point — standing by as comms relay for the UUV's HITL traffic
    return RELEASE_PT;
  }
  if (tick < T_EGRESS_COMPLETE) {
    const t = (tick - T_EGRESS) / (T_EGRESS_COMPLETE - T_EGRESS);
    return trackPos(EGRESS_TRACK, t);
  }
  return EGRESS_TRACK[EGRESS_TRACK.length - 1];
};

// UUV position — released at the release point, then transits independently to the
// target hull while the host is off doing the SOF delivery run.
const getUuvPos = (tick) => {
  if (tick < T_RELEASE_UUV) return null;
  if (tick < T_TARGET_ACQUIRED) {
    const t = (tick - T_UUV_TRANSIT) / (T_TARGET_ACQUIRED - T_UUV_TRANSIT);
    if (tick < T_UUV_TRANSIT) return RELEASE_PT;
    return trackPos(UUV_TRACK, t);
  }
  return TARGET_HULL; // localized / attached at target
};

const getPhaseBadge = (phase) => {
  const m = {
    idle:                 { cls: 'bg-gray-800/80 text-gray-300 border-gray-600/40',                        label: '⬛ On Station — EMCON Hold' },
    covert_transit:       { cls: 'bg-violet-900/80 text-violet-300 border-violet-500/40 animate-pulse',    label: '◈ Covert Transit — EMCON · Stealth Strike Config' },
    release_point:        { cls: 'bg-blue-900/80 text-blue-300 border-blue-500/40',                         label: '→ Release Point Reached — INS Hold' },
    release_uuv:          { cls: 'bg-blue-900/80 text-blue-300 border-blue-500/40 animate-pulse',           label: '⬇ Releasing Disablement UUV' },
    sof_delivery_transit: { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40 animate-pulse',           label: '→ Spectre Inbound — Delivering SOF Element' },
    uuv_ins_transit:      { cls: 'bg-amber-900/80 text-amber-400 border-amber-400/60 animate-pulse',        label: '⚡ UUV INS Transit — GPS-Denied · RF Screen Up' },
    sof_ashore:           { cls: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40',                label: '✓ At Shore Objective — SOF Disembarking' },
    return_transit:       { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40 animate-pulse',           label: '← Spectre Returning to Release Point' },
    target_acquired:      { cls: 'bg-amber-900/80 text-amber-300 border-amber-500/40 animate-pulse',        label: '◎ Target Hull Localized' },
    firing_solution:      { cls: 'bg-amber-900/80 text-amber-300 border-amber-500/40 animate-pulse',        label: '◎ Attach / Firing Solution Computed' },
    hitl_authorize:       { cls: 'bg-orange-900/80 text-orange-300 border-orange-400/60 animate-pulse',     label: '⚠ HITL GATE — Awaiting Operator Authorization' },
    disablement_effect:   { cls: 'bg-red-900/80 text-red-300 border-red-500/40 animate-pulse',              label: '✷ Disablement Effect — Mobility Kill' },
    egress:               { cls: 'bg-blue-900/80 text-blue-300 border-blue-500/40 animate-pulse',           label: '← Egress — EMCON Maintained' },
    exfil_confirm:        { cls: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40',                label: '✓ Exfil Confirmed — SOF & Host Clear' },
  };
  return m[phase] || null;
};

// ─── Phase narratives ─────────────────────────────────────────────────────────
const PHASE_NARRATIVE = {
  idle:                 null,
  covert_transit:       { title: 'Covert Transit — EMCON', body: 'Saildrone Spectre (Stealth Strike configuration) underway from the launch point — wingless low-signature hull form, RF emitters secured, GPS-denied dead-reckoning on Ekinox Micro INS for this leg of the transit. Burst-only SATCOM. An EW decoy node is dropped on this inbound lane for later use. Transiting toward the release point.' },
  release_point:        { title: 'Release Point Reached', body: 'Spectre holds at the release point on INS — course/behavior profile nominal. Two effects stage here: the VATN S6 disablement UUV releases first, then Spectre itself departs with the SOF element for the shore objective. EMCON maintained.' },
  release_uuv:          { title: 'Releasing Disablement UUV', body: 'Spectre releases the man-portable VATN S6 UUV at the release point — on the way out, ahead of the SOF delivery run. UUV powers to standby, acquires an Ekinox Micro INS fix, and receives its GPS-denied route to the target hull.' },
  sof_delivery_transit: { title: 'Spectre Inbound — Delivering SOF Element', body: 'Spectre itself departs the release point and closes on the littoral objective, SOF element aboard for the whole run — Stealth Strike low-signature configuration, RF-quiet, no separate craft involved. The VATN S6 is already away and transiting toward the target hull on its own, in parallel.' },
  uuv_ins_transit:      { title: 'UUV INS Transit — GPS-Denied', body: 'VATN S6 navigating on its Ekinox Micro INS + DVL toward the target hull — jam-resistant, no GPS — while Spectre is still en route to the shore objective. The EW decoy node dropped earlier on the transit lane activates now, holding a screen on the flank to mask the UUV’s approach. EvoLogics acoustic modem for covert low-rate cueing only.' },
  sof_ashore:           { title: 'At Shore Objective — SOF Disembarking', body: 'Spectre holds at the shore objective while the SOF element disembarks directly from the host. Specialized strike support leg complete — the host made the delivery itself, no unmanned intermediary.' },
  return_transit:       { title: 'Returning to Release Point', body: 'SOF element ashore. Spectre reverses course back to the release point. The disablement UUV is already well into its own run by now and doesn’t need the host for this leg.' },
  target_acquired:      { title: 'Target Hull Localized', body: 'UUV localizes the target hull and stabilizes stand-off. Passive-only classification confirms the intended hull. No emissions. Holding for attach/firing-solution computation — Spectre is still returning to the release point.' },
  firing_solution:      { title: 'Attach / Firing Solution Computed', body: 'UUV computes a disablement solution below the propeller/rudder — limpet attach or lightweight torpedo. Mobility kill, not area destruction. Solution complete — awaiting strict human authorization before any release.' },
  hitl_authorize:       { title: 'HITL Gate — No Autonomous Release', body: 'HUMAN-IN-THE-LOOP AUTHORIZATION GATE. No autonomous weapons release. CTF-56 / NAVCENT SOF cell reviewing the disablement solution over covert burst SATCOM, relayed through Spectre at the release point. The UUV holds — the effect will not execute until an operator authorizes.' },
  disablement_effect:   { title: 'Disablement Effect — Mobility Kill', body: 'Operator authorization received. UUV executes the disablement effect below the propeller/rudder — a mobility kill, not area destruction. Effect confirmed. UUV backs off station.' },
  egress:               { title: 'Egress — EMCON Maintained', body: 'Spectre, back at the release point, departs via an alternate egress lane — EMCON maintained, burst-only SATCOM. GPS-denied zone fading behind on INS.' },
  exfil_confirm:        { title: 'Exfil Confirmed', body: 'Host clear of the littoral; SOF element exfil confirmed. Mobility kill achieved with a strict HITL gate and zero autonomous release. LOE 3 safety / QA / operational-risk record emitted for transition review.' },
};

// ─── Workflow steps ───────────────────────────────────────────────────────────
const WORKFLOW_STEPS = [
  { key: 'transit',     label: 'Covert Transit',      activePhases: ['covert_transit', 'release_point'] },
  { key: 'uuv_release', label: 'UUV Release',         activePhases: ['release_uuv'] },
  { key: 'insertion',   label: 'SOF Insertion',       activePhases: ['sof_delivery_transit', 'uuv_ins_transit', 'sof_ashore', 'return_transit'] },
  { key: 'approach',    label: 'UUV Approach',        activePhases: ['target_acquired', 'firing_solution'] },
  { key: 'authorize',   label: 'HITL Authorization',  activePhases: ['hitl_authorize'] },
  { key: 'disablement', label: 'Disablement',         activePhases: ['disablement_effect'] },
  { key: 'exfil',       label: 'Egress / Exfil',      activePhases: ['egress', 'exfil_confirm'] },
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
const SOFStrikeSupportMissionView = ({ mission, onBack }) => {
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

  const [missionName,        setMissionName]        = useState(mission?.name || '');
  const [currentTick,        setCurrentTick]        = useState(0);
  const [pulseTick,          setPulseTick]          = useState(false);
  const [gpsDeniedVisible,   setGpsDeniedVisible]   = useState(false);
  const [ewScreenActive,     setEwScreenActive]     = useState(false);
  const [hitlPending,        setHitlPending]        = useState(false);
  const [disablementActive,  setDisablementActive]  = useState(false);
  const [events,             setEvents]             = useState([]);
  const [running,            setRunning]            = useState(false);
  const [paused,             setPaused]            = useState(false);
  const [complete,           setComplete]           = useState(false);

  const tickRef         = useRef(0);
  const tickCallbackRef = useRef(null);
  const mainTimer       = useRef(null);
  const pulseTimer      = useRef(null);
  const loopTimer       = useRef(null);
  const addEvtRef       = useRef(null);
  const runScenarioRef  = useRef(null);
  const vesselLabelsRef = useRef([]);

  const phase     = getPhase(currentTick);
  const hostPos   = getHostPos(currentTick);
  const uuvPos    = getUuvPos(currentTick);
  const badge     = getPhaseBadge(phase);
  const narrative = PHASE_NARRATIVE[phase] || null;

  const activeWorkflowStep = WORKFLOW_STEPS.find(s => s.activePhases.includes(phase));

  const _addEvent = (msg, type = 'info') => {
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setEvents(prev => [{ ts, msg, type, id: `${ts}-${msg.slice(0, 12)}` }, ...prev].slice(0, 35));
  };

  const pause = useCallback(() => {
    clearInterval(mainTimer.current);
    mainTimer.current = null;
    clearTimeout(loopTimer.current);
    loopTimer.current = null;
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
    const needsPulse = ['covert_transit', 'release_uuv', 'sof_delivery_transit', 'uuv_ins_transit', 'return_transit', 'target_acquired', 'firing_solution', 'hitl_authorize', 'disablement_effect', 'egress'].includes(phase);
    if (needsPulse) {
      pulseTimer.current = setInterval(() => setPulseTick(p => !p), 350);
      return () => clearInterval(pulseTimer.current);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset of timer-driven pulse state when the animated phase set is exited; cannot be derived during render
    setPulseTick(false);
  }, [phase]);

  const handleConfigureVessel = (vessel) => {
    if (!vessel.hullName) return;
    const hull = vesselHullData.find(h => h.name === vessel.hullName);
    if (!hull) return;

    setSelectedHull(hull);
    const currentActive = useConfigurationStore.getState().activeConfig;
    if (!currentActive || currentActive.hullName !== vessel.hullName || currentActive.missionSetKey !== MISSION_SET_KEY) {
      startNewConfiguration(vessel.hullName, MISSION_SET_KEY);
    }

    setPendingMissionSetCaps(vessel.capabilities);

    setPendingMissionSetKey(MISSION_SET_KEY);
    if (vessel.roleKey) setPendingRoleKey(vessel.roleKey);
    setPendingVesselLabel(vessel.name);
    setSelectedView('outfitter');
  };

  const stopAll = useCallback(() => {
    clearInterval(mainTimer.current);
    clearInterval(pulseTimer.current);
    clearTimeout(loopTimer.current);
    mainTimer.current = pulseTimer.current = loopTimer.current = null;
  }, []);

  const reset = useCallback(() => {
    stopAll();
    tickRef.current = 0;
    setPaused(false);
    setCurrentTick(0);
    setPulseTick(false);
    setGpsDeniedVisible(false);
    setEwScreenActive(false);
    setHitlPending(false);
    setDisablementActive(false);
    setEvents([]);
    setRunning(false);
    setComplete(false);
  }, [stopAll]);

  const runScenario = useCallback(() => {
    stopAll();
    tickRef.current = 0;
    setCurrentTick(0);
    setPulseTick(false);
    setGpsDeniedVisible(false);
    setEwScreenActive(false);
    setHitlPending(false);
    setDisablementActive(false);
    setEvents([]);
    setRunning(true);
    setPaused(false);
    setComplete(false);

    const cb = () => {
      const tick = ++tickRef.current;
      const v0 = vesselLabelsRef.current[0] ?? 'Saildrone Spectre (Covert SOF Host)';
      const v1 = vesselLabelsRef.current[1] ?? 'VATN S6 (Clandestine Disablement)';
      setCurrentTick(tick);

      if (tick === T_TRANSIT_START) {
        setGpsDeniedVisible(true);
        addEvtRef.current(`${v0}: Departing covert launch — EMCON transit initiated — low RCS, sub-surface evasion`, 'info');
        addEvtRef.current('TempestOS: Ekinox Micro INS active — GPS-denied littoral — burst-only SATCOM armed', 'info');
        addEvtRef.current('CTF-56 / NAVCENT SOF cell: Mission on covert timeline — no continuous RF', 'info');
      }
      if (tick === T_DECOY_DROP) {
        addEvtRef.current(`${v0}: EW decoy node dropped on the transit lane — HiddenLevel package emplaced for later use`, 'info');
      }
      if (tick === T_RELEASE_POINT) {
        addEvtRef.current(`${v0}: Release point reached — holding on INS — behavior profile nominal`, 'success');
        addEvtRef.current(`${v0}: Staging both effects — disablement UUV releases first, then the SOF delivery run`, 'info');
      }
      if (tick === T_RELEASE_UUV) {
        addEvtRef.current(`${v0}: Releasing ${v1} — on the way out, ahead of the SOF delivery run`, 'warn');
        addEvtRef.current(`${v1}: Powered to standby — Ekinox Micro INS fix acquired — GPS-denied route loaded`, 'info');
      }
      if (tick === T_SOF_DEPART) {
        addEvtRef.current(`${v0}: Departing release point — inbound to shore objective, SOF element aboard`, 'warn');
      }
      if (tick === T_UUV_TRANSIT) {
        setEwScreenActive(true);
        addEvtRef.current(`${v1}: INS transit underway — GPS-denied — no GPS dependency`, 'info');
        addEvtRef.current('HiddenLevel: pre-positioned EW decoy node ACTIVATED — masking UUV approach', 'warn');
        addEvtRef.current(`${v1}: EvoLogics acoustic modem — covert low-rate cueing only`, 'info');
      }
      if (tick === T_SOF_ASHORE) {
        addEvtRef.current(`${v0}: At shore objective — SOF element disembarking directly from host`, 'success');
        addEvtRef.current('SOF element: ASHORE — littoral objective reached — specialized strike support leg complete', 'success');
      }
      if (tick === T_RETURN_DEPART) {
        addEvtRef.current(`${v0}: Departing shore objective — returning to release point`, 'info');
      }
      if (tick === T_TARGET_ACQUIRED) {
        addEvtRef.current(`${v1}: TARGET HULL LOCALIZED — passive-only classification confirms intended hull`, 'warn');
        addEvtRef.current(`${v1}: Stand-off stabilized — zero emissions — holding`, 'info');
      }
      if (tick === T_FIRING_SOLUTION) {
        addEvtRef.current(`${v1}: Attach / firing solution COMPUTED — below propeller/rudder — mobility kill`, 'warn');
        addEvtRef.current(`${v1}: Solution complete — NO release without human authorization`, 'alert');
      }
      if (tick === T_RETURN_RELEASE_POINT) {
        addEvtRef.current(`${v0}: Back at release point — standing by as comms relay for ${v1}'s authorization traffic`, 'success');
      }
      if (tick === T_HITL_AUTHORIZE) {
        setHitlPending(true);
        addEvtRef.current('HITL GATE: Human-in-the-loop authorization required — no autonomous weapons release', 'alert');
        addEvtRef.current('CTF-56 / NAVCENT SOF cell: Reviewing disablement solution over covert burst SATCOM', 'warn');
        addEvtRef.current(`${v1}: HOLDING — effect will NOT execute until an operator authorizes`, 'warn');
      }
      if (tick === T_HITL_CLEARED) {
        setHitlPending(false);
        addEvtRef.current('CTF-56 / NAVCENT SOF cell: AUTHORIZATION GRANTED — operator token received', 'success');
      }
      if (tick === T_DISABLEMENT) {
        setDisablementActive(true);
        addEvtRef.current(`${v1}: DISABLEMENT EFFECT executed below propeller/rudder — mobility kill, not area destruction`, 'alert');
        addEvtRef.current(`${v1}: Effect confirmed — backing off station`, 'success');
      }
      if (tick === T_EGRESS) {
        setDisablementActive(false);
        addEvtRef.current(`${v0}: Egress via alternate lane — EMCON maintained`, 'info');
        addEvtRef.current('TempestOS: GPS-denied zone fading behind — Ekinox Micro INS drift within spec for the transit leg', 'info');
      }
      if (tick === T_EGRESS_COMPLETE) {
        setGpsDeniedVisible(false);
        setEwScreenActive(false);
        addEvtRef.current(`${v0}: Clear of the littoral — returning to covert launch point`, 'success');
      }
      if (tick === T_EXFIL_CONFIRM) {
        addEvtRef.current('CTF-56 / NAVCENT SOF cell: SOF element exfil CONFIRMED — host clear', 'success');
      }
      if (tick >= TOTAL_TICKS) {
        clearInterval(mainTimer.current);
        mainTimer.current = null;
        setRunning(false);
        setComplete(true);
        addEvtRef.current('NAVCENT: Mission complete — mobility kill achieved — strict HITL gate, 0 autonomous release', 'success');
        addEvtRef.current('After-Action: LOE 3 safety / QA / operational-risk record emitted for transition review', 'success');
        loopTimer.current = setTimeout(() => { if (loopTimer.current !== null) runScenarioRef.current?.(); }, 5000);
      }
    };
    tickCallbackRef.current = cb;
    mainTimer.current = setInterval(cb, TICK_MS);
  }, [stopAll]);

  useLayoutEffect(() => { runScenarioRef.current = runScenario; });
  useEffect(() => () => stopAll(), [stopAll]);

  const handleSave = () => {
    if (!missionName.trim()) return;
    const center = mission?.zoneConfig?.center ?? { lat: 26.6, lng: 56.5 };
    const data = {
      name: missionName.trim(),
      template: 'SOF_STRIKE_SUPPORT',
      domain: 'MARITIME',
      jmnAlignment: 'SPEAR',
      status: 'active',
      duration: '4d',
      zoneConfig: {
        name: 'CENTCOM Hormuz Littoral — Clandestine Disablement & SOF Support',
        center,
        geometryType: 'route',
        waypoints: TRANSIT_TRACK.map((pos, i) => ({
          lat: pos[0], lng: pos[1],
          label: ['LAUNCH-ALPHA', 'LANE-BRAVO', 'APPROACH-CHARLIE', 'RELEASE-DELTA'][i],
        })),
      },
      assignedSquadrons: ['sqdn_005'],
      missionProfile: {
        type: 'SOF_STRIKE_SUPPORT',
        lane: 'HORMUZ_CLANDESTINE_DISABLEMENT',
        classification: 'CTF-56 / NAVCENT SOF cell — CENTCOM Clandestine Disablement & SOF Support',
        hitlCompliant: true,
        autonomousRelease: false,
        gpsDeniedConfirmed: true,
        effectType: 'MOBILITY_KILL',
        vessels: [
          { type: 'Saildrone Spectre', role: 'Covert SOF Host', payloads: ['DIRECT_SOF_DELIVERY', 'HIDDENLEVEL_RF', 'EW_DECOY'] },
          { type: 'VATN S6', role: 'Clandestine Disablement UUV', payloads: ['UUV_DISABLEMENT_KIT'] },
        ],
        commsArchitecture: {
          primary: 'EvoLogics acoustic modem (covert low-rate cueing)',
          secondary: 'Iridium SATCOM (LPI scheduled bursts)',
          mesh: 'Lattice Mesh Network',
          groundStation: 'CTF-56 / NAVCENT SOF cell',
          homeBase: 'Covert launch stand-off point',
        },
        objectives: {
          primary: 'Clandestinely disable a target hull (mobility kill below propeller/rudder) and support a low-profile SOF insertion to a littoral objective in the Strait of Hormuz — from one covert unmanned surface host that releases the disablement UUV on the way out and makes the SOF delivery run itself, under a strict human-in-the-loop authorization gate',
          secondary: 'Validate emerging maritime-SOF UUV doctrine (JMN capability area #10 / LOE 3 — SPEAR) with a safety / QA / operational-risk record for transition',
        },
      },
      stateHierarchies: {
        default:         ['Navigation', 'Vehicle', 'Comms', 'Mission', 'Payload'],
        covert_transit:  ['Navigation', 'Vehicle', 'Comms', 'Mission', 'Payload'],
        uuv_ins_transit: ['Navigation', 'Payload', 'Vehicle', 'Comms', 'Mission'],
        hitl_authorize:  ['Mission', 'Comms', 'Payload', 'Navigation', 'Vehicle'],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      launchedAt: new Date().toISOString(),
      history: [{ action: 'created', timestamp: new Date().toISOString(), details: 'CTF-56 / NAVCENT SOF cell — CENTCOM Clandestine Disablement & SOF Support' }],
    };
    if (mission?.id) updateMission(mission.id, data);
    else saveMission(data);
    onBack();
  };

  // ── Derived visual state ──────────────────────────────────────────────────
  const center     = mission?.zoneConfig?.center
    ? [mission.zoneConfig.center.lat, mission.zoneConfig.center.lng]
    : MAP_CENTER;
  const inEgress   = currentTick >= T_EGRESS && currentTick < T_EGRESS_COMPLETE;
  const inSofRun   = currentTick >= T_SOF_DEPART && currentTick < T_SOF_ASHORE;
  const atShore    = currentTick >= T_SOF_ASHORE && currentTick < T_RETURN_DEPART;
  const inReturn   = currentTick >= T_RETURN_DEPART && currentTick < T_RETURN_RELEASE_POINT;
  const hostActive = currentTick >= T_TRANSIT_START && currentTick < T_EGRESS_COMPLETE;
  const sofAshore  = currentTick >= T_SOF_ASHORE;
  const decoyDeployed = currentTick >= T_DECOY_DROP;

  // Concise map-marker labels follow the rostered vessels (fall back to hull identity)
  const hostName = effectiveRoster[0]?.hullName ?? 'Saildrone Spectre';
  const uuvName  = effectiveRoster[1]?.hullName ?? 'VATN S6';

  const gpsDeniedR = gpsDeniedVisible
    ? GPS_DENIED_M + (pulseTick ? 900 : 0)
    : GPS_DENIED_M;

  return (
    <div className="flex flex-col bg-darkest">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-700/50 flex-shrink-0 overflow-x-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-[0.75rem]"
        >
          <ChevronLeft size={13} /> Back to Library
        </button>
        <div className="w-px h-4 bg-gray-700/60" />
        <Ship size={13} className="text-violet-400" />
        <span className="text-violet-400 text-[0.8rem] font-semibold tracking-wide">SOF Strike Support — Hormuz</span>
        <span className="hidden md:inline text-gray-600 text-[0.7rem]">·</span>
        <span className="hidden md:inline text-gray-500 text-[0.68rem]">Saildrone Spectre · VATN S6 UUV · CTF-56 / NAVCENT SOF cell</span>
        <div className="flex-1" />
        <span className="px-2 py-0.5 rounded-full bg-orange-900/50 text-orange-400 text-[0.65rem] font-bold uppercase tracking-wider border border-orange-500/30">
          HITL REQUIRED
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
              ? 'bg-violet-700 hover:bg-violet-600 text-white'
              : 'bg-gray-700/50 text-gray-600 cursor-not-allowed'
          }`}
        >
          Save Draft
        </button>
      </div>

      {/* ── Mission Workflow Steps ── */}
      <div className="flex items-center gap-0 px-4 py-2 border-b border-gray-700/40 flex-shrink-0 bg-darkest overflow-x-auto">
        {WORKFLOW_STEPS.map((step, i) => {
          const isActive = activeWorkflowStep?.key === step.key;
          const isDone   = WORKFLOW_STEPS.findIndex(s => s.key === activeWorkflowStep?.key) > i;
          const isHitl   = step.key === 'authorize';
          return (
            <React.Fragment key={step.key}>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[0.62rem] font-semibold uppercase tracking-wide transition-colors ${
                isActive  ? (isHitl ? 'bg-orange-900/60 text-orange-300 border border-orange-500/40' : 'bg-violet-900/60 text-violet-300 border border-violet-500/40') :
                isDone    ? 'text-emerald-400/70' :
                            'text-gray-600'
              }`}
              >
                {isDone && <Check size={9} />}
                <span>{step.label}</span>
              </div>
              {i < WORKFLOW_STEPS.length - 1 && (
                <div className={`w-6 h-px mx-0.5 ${isDone ? 'bg-emerald-500/40' : 'bg-gray-700/60'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Scrollable content ── */}
      <div>

        {/* ── Map + Sidebar ── */}
        <div className="flex h-[40vh] md:h-[460px]">

          {/* ── Map ── */}
          <div className="flex-1 relative overflow-hidden">
            <MapContainer
              center={center}
              zoom={MAP_ZOOM}
              style={{ width: '100%', height: '100%' }}
              zoomControl={false}
              scrollWheelZoom={false}
              attributionControl={false}
            >
              <ZoomControl position="topright" />
              <TileLayer url={TILE_BASE} />
              <TileLayer url={TILE_SEAMARK} opacity={0.45} />
              <MapInvalidateSize />

              {/* GPS-denied littoral envelope (amber) */}
              {gpsDeniedVisible && (
                <Circle
                  center={GPS_DENIED_CENTER}
                  radius={gpsDeniedR}
                  pathOptions={{ color: '#f59e0b', weight: 1.5, fillColor: '#f59e0b', fillOpacity: 0.06, dashArray: '6 8' }}
                >
                  <Tooltip direction="top" offset={[0, -14]}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#fbbf24' }}>GPS DENIED — INS ACTIVE</span>
                  </Tooltip>
                </Circle>
              )}
              {/* GPS-denied zone always faint outline */}
              <Circle
                center={GPS_DENIED_CENTER}
                radius={GPS_DENIED_M}
                pathOptions={{ color: '#f59e0b', weight: 1, opacity: 0.22, dashArray: '5 8', fillOpacity: 0 }}
              />

              {/* HiddenLevel RF + EW decoy node — dropped on the transit lane, activated later */}
              {decoyDeployed && (
                <>
                  {ewScreenActive && (
                    <Circle
                      center={EW_DECOY_NODE}
                      radius={EW_SCREEN_M + (pulseTick ? 700 : 0)}
                      pathOptions={{ color: '#f59e0b', weight: 1.5, fillColor: '#f59e0b', fillOpacity: pulseTick ? 0.10 : 0.06, opacity: 0.45, dashArray: '4 6' }}
                    />
                  )}
                  <CircleMarker
                    center={EW_DECOY_NODE}
                    radius={ewScreenActive ? (pulseTick ? 7 : 5) : 4}
                    pathOptions={{
                      color: '#f59e0b',
                      fillColor: ewScreenActive ? '#f59e0b' : '#78350f',
                      fillOpacity: ewScreenActive ? 0.85 : 0.55,
                      weight: 1.5,
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -10]}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#fbbf24' }}>
                        {ewScreenActive ? 'HiddenLevel RF + EW Decoy — ACTIVE' : 'HiddenLevel RF + EW Decoy — deployed, dormant'}
                      </span>
                    </Tooltip>
                  </CircleMarker>
                </>
              )}

              {/* Covert transit lane (host inbound) */}
              <Polyline
                positions={TRANSIT_TRACK}
                pathOptions={{ color: '#8b5cf6', opacity: 0.22, weight: 1.5, dashArray: '5 9' }}
              />

              {/* SOF delivery lane — the host runs this leg itself, round-trip */}
              <Polyline
                positions={SOF_TRACK}
                pathOptions={{ color: '#06b6d4', opacity: 0.20, weight: 1.5, dashArray: '4 7' }}
              />

              {/* Egress lane (host outbound, alternate) */}
              {inEgress && (
                <Polyline
                  positions={EGRESS_TRACK}
                  pathOptions={{ color: '#3b82f6', opacity: 0.30, weight: 1.5, dashArray: '4 8' }}
                />
              )}

              {/* Covert launch stand-off marker */}
              <CircleMarker center={LAUNCH_POS} radius={7}
                pathOptions={{ color: '#3b82f6', fillColor: '#1e3a8a', fillOpacity: 0.9, weight: 2 }}
              >
                <Tooltip direction="right" offset={[10, 0]}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#93c5fd' }}>Covert Launch — Stand-off</span>
                </Tooltip>
              </CircleMarker>

              {/* Release point marker */}
              <CircleMarker center={RELEASE_PT} radius={6}
                pathOptions={{ color: '#94a3b8', fillColor: '#334155', fillOpacity: 0.85, weight: 2 }}
              >
                <Tooltip direction="top" offset={[0, -10]}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#cbd5e1' }}>Release Point</span>
                </Tooltip>
              </CircleMarker>

              {/* SOF shore objective — always visible so destination is clear */}
              <CircleMarker center={SOF_OBJECTIVE} radius={8}
                pathOptions={{ color: '#10b981', fillColor: '#052e16', fillOpacity: 0.85, weight: 2 }}
              >
                <Tooltip direction="top" offset={[0, -12]}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#34d399' }}>{sofAshore ? 'SOF Objective · ELEMENT ASHORE' : 'SOF Objective (Ashore)'}</span>
                </Tooltip>
              </CircleMarker>

              {/* Target hull — always visible */}
              <CircleMarker
                center={TARGET_HULL}
                radius={disablementActive ? (pulseTick ? 11 : 9) : 8}
                pathOptions={{
                  color:       disablementActive ? '#ef4444' : '#f87171',
                  fillColor:   disablementActive ? '#7f1d1d' : '#450a0a',
                  fillOpacity: 0.9,
                  weight: 2,
                }}
              >
                <Tooltip direction="bottom" offset={[0, 12]}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#f87171' }}>
                    {disablementActive ? '✷ TARGET HULL — MOBILITY KILL' : 'Target Hull'}
                  </span>
                </Tooltip>
              </CircleMarker>

              {/* Disablement effect ring — pulses at target hull */}
              {disablementActive && (
                <CircleMarker
                  center={TARGET_HULL}
                  radius={pulseTick ? 18 : 13}
                  pathOptions={{ color: '#ef4444', fillColor: 'transparent', fillOpacity: 0, weight: 2, opacity: pulseTick ? 0.9 : 0.5 }}
                />
              )}

              {/* UUV disablement leg — released before the host departs for the island, so it
                  transits independently while the host is still en route to / at the shore objective */}
              {uuvPos && (
                <>
                  {currentTick < T_TARGET_ACQUIRED && (
                    <Polyline
                      positions={[RELEASE_PT, uuvPos]}
                      pathOptions={{ color: '#14b8a6', opacity: 0.45, weight: 1.5, dashArray: '4 6' }}
                    />
                  )}
                  <CircleMarker
                    center={uuvPos}
                    radius={6}
                    pathOptions={{ color: '#14b8a6', fillColor: '#0f766e', fillOpacity: 0.9, weight: 2 }}
                  >
                    <Tooltip direction="top" offset={[0, -10]}>
                      <span style={{ fontSize: 9, color: '#5eead4' }}>
                        {currentTick >= T_TARGET_ACQUIRED ? `${uuvName} · ON TARGET` : `${uuvName}${gpsDeniedVisible ? ' · INS' : ''}`}
                      </span>
                    </Tooltip>
                  </CircleMarker>
                </>
              )}

              {/* Host (Saildrone Spectre) — makes the SOF delivery run itself */}
              {hostActive && (
                <CircleMarker
                  center={hostPos}
                  radius={9}
                  pathOptions={{ color: '#8b5cf6', fillColor: '#8b5cf6', fillOpacity: 0.9, weight: 2 }}
                >
                  <Tooltip direction="top" offset={[0, -14]}>
                    <span style={{ fontSize: 10, color: '#c4b5fd' }}>
                      {inEgress ? `${hostName} · EGRESS`
                        : atShore ? `${hostName} · AT SHORE OBJECTIVE`
                        : inSofRun ? `${hostName} · DELIVERING SOF ELEMENT`
                        : inReturn ? `${hostName} · RETURNING TO RELEASE POINT`
                        : `${hostName}${gpsDeniedVisible ? ' · EMCON · INS' : ''}`}
                    </span>
                  </Tooltip>
                </CircleMarker>
              )}

            </MapContainer>

            {badge && (
              <div className={`absolute top-3 left-3 z-[500] px-3 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wider pointer-events-none border ${badge.cls}`}>
                {badge.label}
              </div>
            )}

            {/* HITL gate overlay — human checkpoint (orange) */}
            {hitlPending && (
              <div className="absolute top-14 left-3 z-[500] px-3 py-2.5 rounded-xl bg-orange-950/85 border border-orange-500/50 backdrop-blur-sm pointer-events-none max-w-[280px]">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${pulseTick ? 'bg-orange-400' : 'bg-orange-600'}`} />
                  <span className="text-orange-300 text-[0.68rem] font-bold uppercase tracking-wider">Human Authorization Gate</span>
                </div>
                <div className="text-[0.63rem] text-orange-200/80 leading-relaxed">
                  No autonomous weapons release. Chain: Intel ✓ → LEGAD ✓ → SOF CO ✓ → CTF-56 / NAVCENT reviewing…
                </div>
                <div className="mt-1.5 text-[0.6rem] text-orange-400/70 font-semibold uppercase tracking-wide">
                  UUV holding — awaiting operator authorization
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="hidden md:flex absolute bottom-3 left-3 z-[500] pointer-events-none flex-col gap-1.5">
              <div className="px-3 py-2 rounded-xl bg-gray-950/80 border border-gray-700/50 backdrop-blur-sm">
                <div className="flex flex-col gap-1">
                  {[
                    { color: '#8b5cf6', label: `${effectiveRoster[0]?.name ?? 'Saildrone Spectre (Covert SOF Host)'} — Covert Host` },
                    { color: '#94a3b8', label: 'Release Point' },
                    { color: '#14b8a6', label: `${effectiveRoster[1]?.name ?? 'VATN S6 (Clandestine Disablement)'} — Disablement UUV` },
                    { color: '#f59e0b', label: 'HiddenLevel RF + EW Decoy' },
                    { color: '#10b981', label: 'SOF Objective (Ashore)' },
                    { color: '#f87171', label: 'Target Hull — Disablement' },
                    { color: '#3b82f6', label: 'Covert Launch Stand-off' },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                      <span style={{ fontSize: 10, color: '#9ca3af' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/60">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-orange-400 text-[0.6rem] font-semibold">Strict HITL gate — no autonomous weapons release</span>
              </div>
            </div>

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

            <div className="p-4 border-b border-gray-700/50 flex-shrink-0">
              <p className="text-gray-500 text-[0.65rem] uppercase tracking-widest mb-3">Scenario</p>
              <div className="flex gap-2 mb-3">
                {running ? (
                  <button
                    onClick={pause}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[0.78rem] font-semibold transition-colors bg-violet-800 hover:bg-violet-700 text-white"
                  >
                    <Pause size={13} />
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={paused ? resume : runScenario}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[0.78rem] font-semibold transition-colors bg-violet-800 hover:bg-violet-700 text-white"
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

              {narrative ? (
                <div className={`rounded-lg border px-3 py-2.5 ${phase === 'hitl_authorize' ? 'bg-orange-950/40 border-orange-500/40' : 'bg-gray-800/50 border-gray-700/40'}`}>
                  <div className={`text-[0.68rem] font-bold uppercase tracking-wider mb-1 ${phase === 'hitl_authorize' ? 'text-orange-300' : 'text-violet-300'}`}>
                    {narrative.title}
                  </div>
                  <div className="text-[0.67rem] text-gray-400 leading-relaxed">
                    {narrative.body}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-[0.68rem]">Saildrone Spectre · VATN S6 UUV · Hormuz clandestine disablement · CTF-56 / NAVCENT</p>
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
        </div>

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

        {/* ── Loadout / Vessel Roster ── */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {effectiveRoster.map((vessel, idx) => {
            return (
              <div key={`${vessel.roleKey || vessel.name}-${vessel.hullName}`} className="flex flex-col border border-gray-700/50 rounded-lg overflow-hidden bg-gray-900/40">
                <div className="flex">
                  <div className="w-32 flex-shrink-0 bg-gray-950/60 flex items-center justify-center p-2">
                    <img src={vessel.image} alt={vessel.name} className="w-full h-full object-contain max-h-24" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center p-2 gap-1.5">
                    <div className="flex items-center gap-1">
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
              </div>
            );
          })}
        </div>

      </div>

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

export default SOFStrikeSupportMissionView;
