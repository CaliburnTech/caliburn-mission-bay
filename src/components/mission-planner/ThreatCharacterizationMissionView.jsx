import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import {
  MapContainer, TileLayer, Circle, CircleMarker, Polyline, Tooltip, ZoomControl, useMap
} from 'react-leaflet';
import {
  Play, Pause, RotateCcw, ChevronLeft, Check, Satellite, Radio, Eye, Waves,
  DollarSign, AlertTriangle, ArrowRight, Settings, ArrowLeftRight, ShieldAlert
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import useMissionStore from '../../store/missionStore';
import useOutfitterStore from '../../store/outfitterStore';
import useConfigurationStore from '../../store/configurationStore';
import useNavigationStore from '../../store/navigationStore';
import SwapVesselModal from './SwapVesselModal';
import ReadinessChecklist from './ReadinessChecklist';
import { getMissionReadiness } from '../../utils/missionReadiness';
import { HULL_IMAGES } from '../../utils/hullImages';
import { vesselHullData } from '../../data/vesselData';
import { MISSION_ROLES } from '../../data/missionRoles';
import imgSaildrone  from '../../assets/images/SaildroneUSV.png';

const VESSEL_ROSTER = [
  { name: 'Saildrone Voyager (Characterization Picket)', roleDescriptor: '(Characterization Picket)', image: imgSaildrone, hullName: 'Saildrone Voyager', capabilities: ['Gamma/Neutron Radiological Detector', 'Trace Chemical/Explosive Sniffer', 'Advanced EO/IR Camera System', 'HiddenLevel Passive RF Sensor', 'Iridium SATCOM'], roleKey: 'THREATCHAR_PICKET' },
];

const MISSION_SET_KEY = 'THREAT_CHARACTERIZATION';
const MISSION_SET_CAPS = ['Gamma/Neutron Radiological Detector', 'Trace Chemical/Explosive Sniffer', 'Advanced EO/IR Camera System', 'HiddenLevel Passive RF Sensor', 'Iridium SATCOM'];

// ─── Geography ────────────────────────────────────────────────────────────────
const NM_TO_M = 1852;

const MAP_CENTER = [8.0, -90.0];   // Eastern Pacific transit corridor — JIATF-South AOR
const MAP_ZOOM   = 7;
const MAP_ZOOM_IN = 9;

// Barrier picket line (~30 nm) across the transit corridor
const BARRIER_A = [8.28, -90.0];
const BARRIER_B = [7.72, -90.0];

// Saildrone Voyager picket patrol track — patrols along the barrier line
const PICKET_HOME   = [8.0, -90.0];
const PATROL_AMP    = 0.24;   // patrol amplitude (deg) along barrier
const PATROL_PERIOD = 24;     // ticks per patrol sweep

// Semi-submersible "sleeper" contact
const CONTACT_1_POS = [8.16, -89.78];  // NARCOTIC — the prosecuted contact

// Covert stand-off point near the contact — close enough for EO/IR classify and material
// scan (well inside the 8nm EO/IR ring), but deliberately not sitting on top of the contact.
const PICKET_STANDOFF_POS = [8.115, -89.825]; // ~3.8nm SW of CONTACT_1_POS

// Deterministic material result (repeatable loop)
const CONTACT_RESULT = 'NARCOTIC';

// Prosecuting USCG cutter — dispatched from a distant patrol station, well outside the
// initial map view, so it visibly sails in over the hand-off window instead of appearing
// already close to the contact.
const CUTTER_START = [12.5, -85.0];
const CUTTER_HANDOFF_DEST = [CONTACT_1_POS[0] + 0.05, CONTACT_1_POS[1] + 0.05];

// MOC — JIATF-South, Key West
const MOC_POS = [24.55, -81.78];

// Coverage radii in NM
const PICKET_TRIPWIRE_NM = 22;   // passive acoustic + magnetometer tripwire
const PICKET_EOIR_NM     = 8;    // EO/IR classify range

// ─── Tick milestones ──────────────────────────────────────────────────────────
const T_PATROL       = 10;   // barrier_patrol
const T_CONTACT      = 24;   // passive_contact
const T_APPROACH     = 38;   // covert_approach
const T_EOIR         = 54;   // eoir_classify
const T_MATSCAN      = 68;   // material_scan
const T_CHARACTERIZED = 84;  // threat_characterized (branch)
const T_REPORT       = 96;   // track_report
const T_HANDOFF      = 120;  // handoff_to_cutter (SLEEPER-01 — NARCOTIC) — longer transit, cutter starts far out
const T_RESUME       = 134;  // resume_patrol
const TOTAL_TICKS    = 148;

const TICK_MS = 180;

// ─── Phase definitions ────────────────────────────────────────────────────────
const getPhase = (tick) => {
  if (tick < T_PATROL)        return 'idle';
  if (tick < T_CONTACT)       return 'barrier_patrol';
  if (tick < T_APPROACH)      return 'passive_contact';
  if (tick < T_EOIR)          return 'covert_approach';
  if (tick < T_MATSCAN)       return 'eoir_classify';
  if (tick < T_CHARACTERIZED) return 'material_scan';
  if (tick < T_REPORT)        return 'threat_characterized';
  if (tick < T_HANDOFF)       return 'track_report';
  if (tick < T_RESUME)        return 'handoff_to_cutter';
  return 'resume_patrol';
};

const PHASE_NARRATIVE = {
  idle:                 null,
  barrier_patrol:       { title: 'Barrier Patrol On Station', body: 'Saildrone Voyager runs a ~30 NM picket barrier across the E. Pacific transit corridor on electric + wind propulsion — quiet running, no exhaust plume. Passive acoustic + magnetometer tripwire armed; EO/IR scanning.' },
  passive_contact:      { title: 'Passive Contact — Low-Freeboard Sleeper', body: 'Tripwire detects a low-freeboard semi-submersible "sleeper" contact. HiddenLevel passive RF flags a Starlink control-link emission — the unmanned narco-sub tell. Contact designated SLEEPER-01.' },
  covert_approach:      { title: 'Covert Approach', body: 'Saildrone Voyager closes toward SLEEPER-01 on quiet electric power, staying under the horizon and holding a stand-off distance — passive sensors only, no active emissions that would alert a remote operator.' },
  eoir_classify:        { title: 'EO/IR Classification', body: 'Trillium HD25e EO/IR confirms contact class from stand-off: wave-washed semi-submersible, minimal freeboard, no visible crew. Hull class confirmed — cargo unknown. Radar alone cannot answer what it is carrying.' },
  material_scan:        { title: 'Material Scan — Characterize', body: 'Material-characterization payloads brought to bear from stand-off: gamma/neutron radiological detector and trace chemical/explosive sniffer sampling the contact wake and signature to distinguish explosive / chemical / narcotic / inert.' },
  threat_characterized: { title: 'Threat Characterized — NARCOTIC', body: 'Onboard analytics classify SLEEPER-01 as NARCOTIC contraband (contraband-consistent signature, no radiological/explosive indicators). Confidence caveat recorded. Counter-narcotic hand-off to LE authority initiated.' },
  track_report:         { title: 'Track + Material Report → MOC', body: 'Track and material-classification report — with stated confidence / false-alarm caveat — transmitted to JIATF-South (Key West) over Iridium SATCOM. Prosecution authority requested.' },
  handoff_to_cutter:    { title: 'Hand-off to USCG Cutter — SLEEPER-01', body: 'USCG cutter vectored to SLEEPER-01 with a pre-fused track and material classification — arrives to interdict, not search. Boarding team informed of cargo class before contact.' },
  resume_patrol:        { title: 'Resume Barrier Patrol', body: 'SLEEPER-01 handed to counter-narcotic authority. Observe-characterize-report complete; no organic weapon employed. Saildrone Voyager resumes the picket barrier and re-arms the passive tripwire.' },
};

const getPhaseBadge = (phase) => {
  const m = {
    barrier_patrol:       { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40',                     label: '● Barrier Patrol Active' },
    passive_contact:      { cls: 'bg-amber-900/80 text-amber-300 border-amber-500/40 animate-pulse',    label: '⚠ Passive Contact — Sleeper' },
    covert_approach:      { cls: 'bg-amber-900/80 text-amber-200 border-amber-500/40',                  label: '◈ Covert Approach' },
    eoir_classify:        { cls: 'bg-blue-900/80 text-blue-300 border-blue-500/40',                     label: '◉ EO/IR Classification' },
    material_scan:        { cls: 'bg-violet-900/80 text-violet-300 border-violet-500/40 animate-pulse', label: '⚡ Material Scan — Characterize' },
    threat_characterized: { cls: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40 animate-pulse', label: '✓ Threat Characterized — Narcotic' },
    track_report:         { cls: 'bg-blue-900/80 text-blue-300 border-blue-500/40',                     label: '→ Track Report → JIATF-South' },
    handoff_to_cutter:    { cls: 'bg-emerald-900/80 text-emerald-200 border-emerald-400/60',            label: '⚓ Hand-off to USCG Cutter' },
    resume_patrol:        { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40',                     label: '● Resume Barrier Patrol' },
  };
  return m[phase] || null;
};

const EVENT_COLORS = {
  warn:    'text-amber-400',
  alert:   'text-red-400',
  info:    'text-cyan-400',
  success: 'text-emerald-400',
};

const TILE_BASE    = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_SEAMARK = 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png';

const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

// Saildrone Voyager picket position — patrols the barrier, then closes to a stand-off point near
// the contact (not on top of it) and returns
const getPicketPos = (tick) => {
  if (tick < T_CONTACT) {
    // Patrol sweep along barrier line
    const angle = (tick / PATROL_PERIOD) * 2 * Math.PI;
    return [PICKET_HOME[0] + PATROL_AMP * Math.sin(angle), PICKET_HOME[1]];
  }
  if (tick < T_EOIR) {
    // Covert approach toward the stand-off point near SLEEPER-01
    const t = (tick - T_CONTACT) / (T_EOIR - T_CONTACT);
    return lerp2(PICKET_HOME, PICKET_STANDOFF_POS, Math.min(t, 1));
  }
  if (tick < T_RESUME) {
    // Hold at stand-off during classify / scan / characterize / report / hand-off
    return PICKET_STANDOFF_POS;
  }
  // Resume patrol — return toward barrier home
  const t = (tick - T_RESUME) / (TOTAL_TICKS - T_RESUME);
  return lerp2(PICKET_STANDOFF_POS, PICKET_HOME, Math.min(t, 1));
};

// USCG cutter position — dispatched from its patrol station the moment tasking is
// authorized (T_REPORT), then visibly closes the distance to SLEEPER-01 over the
// hand-off window rather than appearing already on top of the contact.
const getCutterPos = (tick) => {
  if (tick < T_REPORT) return CUTTER_START;
  if (tick < T_HANDOFF) {
    const t = (tick - T_REPORT) / (T_HANDOFF - T_REPORT);
    return lerp2(CUTTER_START, CUTTER_HANDOFF_DEST, Math.min(t, 1));
  }
  return CUTTER_HANDOFF_DEST;
};

// ─── Map sub-components ───────────────────────────────────────────────────────
const MapController = () => null;

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

// ─── Main Component ───────────────────────────────────────────────────────────
const ThreatCharacterizationMissionView = ({ mission, onBack }) => {
  const { saveMission, updateMission } = useMissionStore();
  const { setSelectedHull } = useOutfitterStore();
  const { startNewConfiguration, setPendingMissionSetKey, setPendingRoleKey, setPendingVesselLabel, setPendingMissionSetCaps, activeConfig } = useConfigurationStore();
  const { setSelectedView } = useNavigationStore();
  const roleAssignments = useMissionStore(s => s.roleAssignments);
  const savedConfigurations = useConfigurationStore(s => s.savedConfigurations);
  const [swapModal, setSwapModal] = useState(null); // { roleKey: string } | null
  const [showLog, setShowLog] = useState(false);

  // Map center — prefer mission zoneConfig center, else E. Pacific default
  const zc = mission?.zoneConfig;
  const mapCenter = (zc?.center && typeof zc.center.lat === 'number' && typeof zc.center.lng === 'number')
    ? [zc.center.lat, zc.center.lng]
    : MAP_CENTER;

  // Build effective roster — override default slots with assigned vessels
  const missionRoleDefs = MISSION_ROLES[MISSION_SET_KEY]?.roles ?? [];
  const effectiveRoster = VESSEL_ROSTER.map((vessel, idx) => {
    const roleDef = missionRoleDefs[idx];
    if (!roleDef) return vessel;
    const assignment = roleAssignments?.[MISSION_SET_KEY]?.[roleDef.roleKey];
    if (!assignment) return { ...vessel, name: vessel.roleDescriptor ? `${vessel.hullName} ${vessel.roleDescriptor}` : vessel.name };
    // Derive displayed capabilities from actual config if available;
    // fall back to the role's required capabilities so a swapped-but-unconfigured
    // hull doesn't display the previous vessel's capability tags.
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

  const [currentTick, setCurrentTick] = useState(0);
  const [events,      setEvents]      = useState([]);
  const [running,     setRunning]     = useState(false);
  const [paused,      setPaused]      = useState(false);
  const [complete,    setComplete]    = useState(false);
  const [contactPulse, setContactPulse] = useState(false);

  const tickRef    = useRef(0);
  const tickCallbackRef = useRef(null);
  const mainTimer  = useRef(null);
  const pulseTimer = useRef(null);
  const resetTimer = useRef(null);
  const addEvtRef  = useRef(null);
  const vesselLabelsRef = useRef([]);
  const runScenRef = useRef(null);

  const phase       = getPhase(currentTick);
  const picketPos   = getPicketPos(currentTick);
  const cutterPos   = getCutterPos(currentTick);
  const narrative   = PHASE_NARRATIVE[phase] || null;
  const badge       = getPhaseBadge(phase);

  const showPicket        = true;
  const showBarrier       = true;
  const showContact1      = currentTick >= T_CONTACT;
  const contact1Characterized = currentTick >= T_CHARACTERIZED;
  const showCutter        = currentTick >= T_REPORT;
  const showMoc           = currentTick >= T_REPORT;

  const _addEvent = (msg, type = 'info') => {
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setEvents(prev => [{ ts, msg, type, id: `${ts}-${msg.slice(0, 10)}` }, ...prev].slice(0, 40));
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
    const needsPulse = ['passive_contact', 'covert_approach', 'material_scan', 'threat_characterized'].includes(phase);
    if (needsPulse) {
      pulseTimer.current = setInterval(() => setContactPulse(p => !p), 380);
      return () => clearInterval(pulseTimer.current);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset of timer-driven pulse state when the animated phase set is exited; cannot be derived during render
    setContactPulse(false);
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
    setContactPulse(false);
    setEvents([]);
    setRunning(false);
    setComplete(false);
  }, [stopAll]);

  const runScenario = useCallback(() => {
    stopAll();
    tickRef.current = 0;
    setCurrentTick(0);
    setContactPulse(false);
    setEvents([]);
    setRunning(true);
    setPaused(false);
    setComplete(false);

    const cb = () => {
      const tick = ++tickRef.current;
      const v0 = vesselLabelsRef.current[0] ?? 'Saildrone Voyager (Characterization Picket)';
      setCurrentTick(tick);

      if (tick === T_PATROL) {
        addEvtRef.current('JIATF-South: E. Pacific sleeper watch — Saildrone Voyager on station — ~30 NM picket barrier', 'info');
        addEvtRef.current(`${v0}: Passive acoustic + magnetometer tripwire ARMED — EO/IR scanning`, 'info');
        addEvtRef.current(`${v0}: Quiet electric + wind profile maintained — picket remains a non-target`, 'info');
      }
      if (tick === T_CONTACT) {
        addEvtRef.current(`${v0}: Tripwire hit — low-freeboard semi-submersible contact — SLEEPER-01`, 'warn');
        addEvtRef.current(`${v0}: HiddenLevel passive RF — Starlink control-link emission detected — unmanned indicator`, 'warn');
      }
      if (tick === T_APPROACH) {
        addEvtRef.current(`${v0}: Covert approach toward SLEEPER-01 — passive sensors only, no active emissions`, 'info');
        addEvtRef.current(`${v0}: Closing to a stand-off distance — holding under the horizon, remote operator not alerted`, 'info');
      }
      if (tick === T_EOIR) {
        addEvtRef.current(`${v0}: Trillium HD25e EO/IR — wave-washed semi-submersible, minimal freeboard, no visible crew`, 'warn');
        addEvtRef.current(`${v0}: Hull class confirmed — cargo UNKNOWN — radar cannot answer "what is it carrying?"`, 'warn');
      }
      if (tick === T_MATSCAN) {
        addEvtRef.current(`${v0}: Material scan initiated — gamma/neutron detector + trace chemical/explosive sniffer`, 'info');
        addEvtRef.current(`${v0}: Sampling contact wake / signature from stand-off — explosive / chemical / narcotic / inert discrimination`, 'info');
      }
      if (tick === T_CHARACTERIZED) {
        // threat_characterized — branch by deterministic per-contact result
        if (CONTACT_RESULT === 'NARCOTIC') {
          addEvtRef.current('SLEEPER-01 CHARACTERIZED — NARCOTIC contraband — no radiological / explosive indicators', 'success');
          addEvtRef.current('Onboard analytics: contraband-consistent signature — confidence caveat recorded', 'success');
          addEvtRef.current('Counter-narcotic hand-off to law-enforcement authority initiated', 'success');
        } else if (CONTACT_RESULT === 'EXPLOSIVE' || CONTACT_RESULT === 'CHEMICAL') {
          addEvtRef.current(`SLEEPER-01 CHARACTERIZED — ${CONTACT_RESULT} — CBRNE INDICATOR`, 'alert');
          addEvtRef.current('CBRNE ALERT: material-ID payload positive — pre-staged hazard suspected', 'alert');
          addEvtRef.current('Escalation to JIATF-South / SOUTHCOM — CBRNE prosecution authority requested', 'alert');
        } else {
          // INERT — false alarm; log decision-threshold / false-alarm note
          addEvtRef.current('SLEEPER-01 CHARACTERIZED — INERT — no threat material detected', 'info');
          addEvtRef.current('Decision-threshold note: below alert threshold — logged as FALSE ALARM', 'info');
          addEvtRef.current('LOE 2: false-alarm impact recorded — threshold characterization updated', 'info');
        }
      }
      if (tick === T_REPORT) {
        addEvtRef.current(`${v0}: Track + material-classification report → JIATF-South (Key West) via Iridium SATCOM`, 'info');
        addEvtRef.current('Report includes stated confidence / false-alarm caveat — prosecution authority requested', 'info');
        addEvtRef.current('JIATF-South MOC: report received — SLEEPER-01 NARCOTIC — cutter tasking authorized', 'success');
        addEvtRef.current('USCG Cutter underway from patrol station — inbound to SLEEPER-01 with pre-fused track', 'info');
      }
      if (tick === T_HANDOFF) {
        addEvtRef.current('USCG Cutter on scene at SLEEPER-01 — pre-fused track + material class — arrives to interdict', 'info');
        addEvtRef.current('Boarding team informed of cargo class BEFORE contact — no unknown-hull risk', 'success');
        addEvtRef.current('SLEEPER-01 interdicted — NARCOTIC contact handed to law-enforcement authority', 'success');
        addEvtRef.current(`${v0}: Observe-characterize-report complete — no organic weapon employed`, 'success');
      }
      if (tick === T_RESUME) {
        addEvtRef.current(`${v0}: Resuming low-signature barrier patrol — passive tripwire re-armed`, 'info');
        addEvtRef.current('DETECT-TO-CHARACTERIZE: narcotic hand-off complete — no crew at risk', 'success');
      }

      if (tick >= TOTAL_TICKS) {
        clearInterval(mainTimer.current);
        setRunning(false);
        setComplete(true);
        resetTimer.current = setTimeout(() => {
          if (runScenRef.current) runScenRef.current();
        }, 6000);
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
    if (!currentActive || currentActive.hullName !== vessel.hullName || currentActive.missionSetKey !== MISSION_SET_KEY) {
      startNewConfiguration(vessel.hullName, MISSION_SET_KEY);
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
      template: 'THREAT_CHARACTERIZATION',
      domain: 'MARITIME',
      jmnAlignment: 'SHIELD',
      status: 'draft',
      duration: 'continuous',
      missionProfile: {
        type: 'THREAT_CHARACTERIZATION',
        lane: 'THREAT_DETECTION_CHARACTERIZATION',
        missionManager: 'JIATF-South Watch',
        collectionTypes: ['PASSIVE_ACOUSTIC', 'MAGNETOMETER', 'EO_IR', 'RADIOLOGICAL', 'TRACE_CHEMICAL', 'PASSIVE_RF'],
        commsArchitecture: {
          primary: 'Iridium SATCOM (BLOS report)',
          secondary: 'HiddenLevel Passive RF (Starlink-link detect)',
          groundStation: 'JIATF-South — Key West, FL',
          fusion: 'Onboard material-classification analytics',
        },
        objectives: {
          primary: 'Detect a low-freeboard semi-submersible "sleeper" contact and characterize cargo material — explosive / chemical / narcotic / inert',
          secondary: 'Report track + material classification (with confidence / false-alarm caveat) to the MOC and hand off to a manned cutter / LE asset — observe-characterize-report, no organic weapon',
        },
      },
      zoneConfig: {
        name: 'Eastern Pacific Transit Corridor — Sleeper Watch',
        center: { lat: 8.0, lng: -90.0 },
        geometryType: 'zone',
        coordinates: [
          { lat: 8.28, lng: -90.30 },
          { lat: 8.28, lng: -89.70 },
          { lat: 7.72, lng: -89.70 },
          { lat: 7.72, lng: -90.30 },
        ],
        swarmSize: 1,
        swarmFormation: 'picket-barrier',
      },
      assignedSquadrons: [],
      stateHierarchies: {
        default:          ['Navigation', 'Payload', 'Mission', 'Comms', 'Vehicle'],
        passive_contact:  ['Payload', 'Navigation', 'Mission', 'Comms', 'Vehicle'],
        material_scan:    ['Payload', 'Mission', 'Comms', 'Navigation', 'Vehicle'],
        characterized:    ['Mission', 'Comms', 'Payload', 'Navigation', 'Vehicle'],
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

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col bg-darkest">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-700/50 flex-shrink-0 overflow-x-auto">
        <button onClick={onBack} className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-[0.75rem]">
          <ChevronLeft size={13} /> Back to Library
        </button>
        <div className="w-px h-4 bg-gray-700/60" />
        <ShieldAlert size={13} className="text-cyan-400" />
        <span className="text-cyan-400 text-[0.8rem] font-semibold tracking-wide">Threat Detection &amp; Characterization — E. Pacific Sleeper Watch</span>
        <span className="hidden md:inline text-gray-600 text-[0.7rem]">·</span>
        <span className="hidden md:inline text-gray-500 text-[0.68rem]">JIATF-South AOR · CBRNE / Contraband Material-ID</span>
        <div className="flex-1" />
        <span className="px-2 py-0.5 rounded-full bg-cyan-900/50 text-cyan-400 text-[0.65rem] font-bold uppercase tracking-wider border border-cyan-500/30">SHIELD</span>
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
              center={mapCenter}
              zoom={MAP_ZOOM}
              style={{ width: '100%', height: '100%' }}
              zoomControl={false}
              scrollWheelZoom={false}
              attributionControl={false}
            >
              <ZoomControl position="topright" />
              <TileLayer url={TILE_BASE} />
              <TileLayer url={TILE_SEAMARK} opacity={0.35} />
              <MapInvalidateSize />
              <MapController />

              {/* ── Picket barrier line (~30 NM) ── */}
              {showBarrier && (
                <Polyline
                  positions={[BARRIER_A, BARRIER_B]}
                  pathOptions={{ color: '#06b6d4', weight: 2, opacity: 0.55, dashArray: '8 8' }}
                />
              )}

              {/* ── Tripwire coverage ── */}
              {showPicket && (
                <Circle center={picketPos} radius={PICKET_TRIPWIRE_NM * NM_TO_M}
                  pathOptions={{ color: '#22d3ee', weight: 1, fill: true, fillColor: '#22d3ee', fillOpacity: 0.04, opacity: 0.30, dashArray: '6 8' }}
                />
              )}

              {/* ── EO/IR classify ring (during approach / classify / scan) ── */}
              {showPicket && currentTick >= T_APPROACH && currentTick < T_RESUME && (
                <Circle center={picketPos} radius={PICKET_EOIR_NM * NM_TO_M}
                  pathOptions={{ color: '#3b82f6', weight: 1, fill: true, fillColor: '#3b82f6', fillOpacity: 0.05, opacity: 0.35, dashArray: '4 6' }}
                />
              )}

              {/* ── Covert approach track ── */}
              {currentTick >= T_CONTACT && currentTick < T_EOIR && (
                <Polyline
                  positions={[PICKET_HOME, picketPos]}
                  pathOptions={{ color: '#22d3ee', weight: 2, opacity: 0.55, dashArray: '5 6' }}
                />
              )}

              {/* ── Stand-off line — picket to contact (shows the covert stand-off distance) ── */}
              {showContact1 && (
                <Polyline
                  positions={[picketPos, CONTACT_1_POS]}
                  pathOptions={{ color: '#f59e0b', weight: 1, opacity: 0.30, dashArray: '2 6' }}
                />
              )}

              {/* ── Report link to MOC (Iridium) ── */}
              {showMoc && (
                <Polyline
                  positions={[CONTACT_1_POS, MOC_POS]}
                  pathOptions={{ color: '#10b981', weight: 1.5, opacity: 0.40, dashArray: '3 8' }}
                />
              )}

              {/* ── SLEEPER-01 contact (NARCOTIC) ── */}
              {showContact1 && (
                <>
                  <CircleMarker
                    center={CONTACT_1_POS}
                    radius={contact1Characterized ? 10 : (contactPulse ? 13 : 10)}
                    pathOptions={{
                      color:       contact1Characterized ? '#10b981' : '#f59e0b',
                      fillColor:   contact1Characterized ? '#10b981' : '#f59e0b',
                      fillOpacity: contact1Characterized ? 0.95 : (contactPulse ? 0.85 : 0.55),
                      weight: 2,
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -10]} permanent={currentTick >= T_EOIR}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: contact1Characterized ? '#10b981' : '#f59e0b' }}>
                        {contact1Characterized ? '✓ SLEEPER-01 — NARCOTIC' : '⚠ SLEEPER-01 — SEMI-SUB'}
                      </span>
                    </Tooltip>
                  </CircleMarker>
                  {contactPulse && !contact1Characterized && (
                    <CircleMarker center={CONTACT_1_POS} radius={22}
                      pathOptions={{ color: '#f59e0b', fillOpacity: 0, weight: 1.5, opacity: 0.25 }}
                    />
                  )}
                </>
              )}

              {/* ── Saildrone Voyager picket ── */}
              {showPicket && (
                <CircleMarker center={picketPos} radius={9}
                  pathOptions={{ color: '#22d3ee', fillColor: '#22d3ee', fillOpacity: 0.90, weight: 2 }}
                >
                  <Tooltip direction="top" offset={[0, -8]}>
                    <span style={{ fontSize: 10 }}>{effectiveRoster[0]?.name ?? 'Saildrone Voyager — Characterization Picket'}</span>
                  </Tooltip>
                </CircleMarker>
              )}

              {/* ── USCG cutter ── */}
              {showCutter && (
                <>
                  <Polyline
                    positions={[CUTTER_START, cutterPos]}
                    pathOptions={{ color: '#a78bfa', weight: 2, opacity: 0.55, dashArray: '5 6' }}
                  />
                  {/* Larger radius than the picket (9) or the contact (10, pulses to 13) — a cutter is a much bigger hull */}
                  <CircleMarker center={cutterPos} radius={16}
                    pathOptions={{ color: '#a78bfa', fillColor: '#a78bfa', fillOpacity: 0.95, weight: 2 }}
                  >
                    <Tooltip direction="top" offset={[0, -12]}>
                      <span style={{ fontSize: 10 }}>
                        {currentTick < T_HANDOFF ? 'USCG Cutter — Inbound from Patrol Station' : 'USCG Cutter — Prosecuting Asset'}
                      </span>
                    </Tooltip>
                  </CircleMarker>
                </>
              )}

            </MapContainer>

            {/* ── Phase badge ── */}
            {badge && (
              <div className={`absolute top-3 left-3 z-[500] px-3 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wider pointer-events-none border ${badge.cls}`}>
                {badge.label}
              </div>
            )}

            {/* ── Legend ── */}
            {showPicket && (
              <div className="hidden md:block absolute bottom-3 left-3 z-[500] pointer-events-none px-3 py-2 rounded-xl bg-gray-950/85 border border-gray-700/50 backdrop-blur-sm">
                <div className="flex flex-col gap-1">
                  {[
                    { color: '#22d3ee', label: `${effectiveRoster[0]?.name ?? 'Saildrone Voyager'} — Picket` },
                    { color: '#f59e0b', label: 'SLEEPER-01 — Semi-Sub (Narcotic)' },
                    { color: '#a78bfa', label: 'USCG Cutter — Prosecutor' },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
                      <span style={{ fontSize: 9.5, color: '#9ca3af' }}>{label}</span>
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
                  1 picket · JIATF-South AOR · detect → characterize → report
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

export default ThreatCharacterizationMissionView;
