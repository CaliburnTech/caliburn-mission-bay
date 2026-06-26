import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import {
  MapContainer, TileLayer, CircleMarker, Polyline, Rectangle, Tooltip, ZoomControl, useMap
} from 'react-leaflet';
import { Play, Pause, RotateCcw, Anchor, ChevronLeft, Settings, ArrowLeftRight } from 'lucide-react';
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
import imgSeaJeep from '../../assets/images/SeaJeep.png';

const MISSION_SET_KEY = 'SEAJEEP_BASE';
const MISSION_SET_CAPS = [
  'Trillium HD25e Gimbal Camera',
  'Iridium 9770 SATCOM',
  'GPS/INS + AIS Receiver',
  'Solar Wing + Li-ion Bank',
];

// ─── Geography ────────────────────────────────────────────────────────────────
const MAP_CENTER       = [9.8, 115.0];
const MAP_ZOOM         = 8;
const MISCHIEF_REEF    = [9.9,  115.53];
const WHITSUN_REEF     = [9.78, 114.47];

// Patrol box defined by corners: NW → NE → SE → SW
const PATROL_WAYPOINTS = [
  [10.2, 114.2],
  [10.2, 115.8],
  [9.4,  115.8],
  [9.4,  114.2],
];

const CONTACTS = [
  { id: 'C1', pos: [9.92, 115.50], label: 'DARK-ALPHA' },
  { id: 'C2', pos: [9.85, 115.55], label: 'DARK-BRAVO' },
  { id: 'C3', pos: [9.78, 114.48], label: 'DARK-CHARLIE' },
];

// Top-right edge of map — SATCOM uplink endpoint (approx)
const SATCOM_UPLINK_DEST = [10.2, 115.8];

// ─── Loadout ─────────────────────────────────────────────────────────────────
const SEA_JEEP_BASE_MOUNTS = [
  { slot: 'EO/IR',  name: 'Trillium HD25e Gimbal Camera', vendor: 'Trillium',     checked: true, description: 'Day/night EO/IR — photographs AIS-dark vessels for 7th Fleet MDA cell' },
  { slot: 'COMMS',  name: 'Iridium 9770 SATCOM',          vendor: 'Iridium',      checked: true, description: 'Transmits contact reports and imagery to MOC via satellite' },
  { slot: 'NAV',    name: 'GPS/INS + AIS Receiver',       vendor: '—',            checked: true, description: 'AIS receiver logs active transponders; dark contacts detected by camera' },
  { slot: 'POWER',  name: 'Solar Wing + Li-ion Bank',     vendor: 'Ocean Aero',   checked: true, description: '30+ day endurance — no fuel logistics required' },
];

const VESSEL_ROSTER = [
  {
    name: 'SEA-JEEP-1',
    roleDescriptor: '(Patrol)',
    image: imgSeaJeep,
    hullName: 'GP-USV Sea Jeep',
    capabilities: [
      'Trillium HD25e Gimbal Camera',
      'Iridium 9770 SATCOM',
      'GPS/INS + AIS Receiver',
      'Solar Wing + Li-ion Bank',
    ],
    roleKey: 'SJM_SEAJEEP_1',
  },
];

// ─── Tick milestones (~180ms/tick) ───────────────────────────────────────────
const T_TRANSIT          = 5;
const T_PATROL_BOX       = 15;
const T_CONTACT_ALPHA    = 28;
const T_PHOTO_ALPHA      = 35;
const T_CONTACT_BRAVO    = 45;
const T_TRANSIT_WHITSUN  = 58;
const T_CONTACT_CHARLIE  = 70;
const T_REPORT           = 80;
const T_PATROL_COMPLETE  = 90;
const TOTAL_TICKS        = 100;

// ─── Tile layers ─────────────────────────────────────────────────────────────
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

// ─── Derived phase from tick ──────────────────────────────────────────────────
const getPhase = (tick) => {
  if (tick < T_TRANSIT)         return 'idle';
  if (tick < T_PATROL_BOX)      return 'transit';
  if (tick < T_CONTACT_ALPHA)   return 'patrol_box';
  if (tick < T_PHOTO_ALPHA)     return 'contact_alpha';
  if (tick < T_CONTACT_BRAVO)   return 'photo_alpha';
  if (tick < T_TRANSIT_WHITSUN) return 'contact_bravo';
  if (tick < T_CONTACT_CHARLIE) return 'transit_whitsun';
  if (tick < T_REPORT)          return 'contact_charlie';
  if (tick < T_PATROL_COMPLETE) return 'report_transmitted';
  return 'patrol_complete';
};

// Compute Sea Jeep position — loops around PATROL_WAYPOINTS extended with Mischief/Whitsun sectors
const getJeepTrack = () => {
  // Full route: start outside box → NW corner → patrol box loop → transit to Whitsun → back to NW
  return [
    // Start a bit south of NW corner
    [9.8, 114.0],
    // Entry / transit into box
    PATROL_WAYPOINTS[0],
    // Patrol box clockwise: NW → NE → loop toward Mischief → SE → SW → back NW
    PATROL_WAYPOINTS[1],  // NE
    [9.92, 115.50],       // near Mischief / DARK-ALPHA
    PATROL_WAYPOINTS[2],  // SE
    // transit toward Whitsun
    WHITSUN_REEF,
    PATROL_WAYPOINTS[3],  // SW
    PATROL_WAYPOINTS[0],  // back to NW — cycle complete
  ];
};

const JEEP_TRACK = getJeepTrack();

const getJeepPos = (tick) => {
  if (tick < T_TRANSIT) return null;
  const t = (tick - T_TRANSIT) / (TOTAL_TICKS - T_TRANSIT);
  return trackPos(JEEP_TRACK, Math.min(t, 0.9999));
};

// Trail: all positions from tick T_TRANSIT up to current tick
const buildTrail = (tick) => {
  if (tick < T_TRANSIT) return [];
  const points = [];
  const steps = tick - T_TRANSIT;
  for (let i = 0; i <= steps; i++) {
    const t = i / (TOTAL_TICKS - T_TRANSIT);
    points.push(trackPos(JEEP_TRACK, Math.min(t, 0.9999)));
  }
  return points;
};

// Contact state logic
const getContactState = (cId, tick) => {
  if (cId === 'C1') {
    if (tick < T_CONTACT_ALPHA)  return 'hidden';
    if (tick < T_PHOTO_ALPHA)    return 'detected';
    return 'photographed';
  }
  if (cId === 'C2') {
    if (tick < T_CONTACT_BRAVO)  return 'hidden';
    if (tick < T_TRANSIT_WHITSUN + 5) return 'detected';
    return 'photographed';
  }
  if (cId === 'C3') {
    if (tick < T_CONTACT_CHARLIE) return 'hidden';
    if (tick < T_REPORT)          return 'detected';
    return 'photographed';
  }
  return 'hidden';
};

// ─── Phase badge ─────────────────────────────────────────────────────────────
const getPhaseBadge = (phase) => {
  switch (phase) {
    case 'transit':           return { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40',          label: '→ Transit to Patrol Box' };
    case 'patrol_box':        return { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40',          label: '◈ Patrol Box Active — EO/IR Scanning' };
    case 'contact_alpha':     return { cls: 'bg-amber-900/80 text-amber-300 border-amber-500/40 animate-pulse', label: '⚠ CONTACT — DARK-ALPHA' };
    case 'photo_alpha':       return { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40',          label: '📷 DARK-ALPHA Photographed' };
    case 'contact_bravo':     return { cls: 'bg-amber-900/80 text-amber-300 border-amber-500/40 animate-pulse', label: '⚠ CONTACT — DARK-BRAVO' };
    case 'transit_whitsun':   return { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40',          label: '→ Transit to Whitsun Reef' };
    case 'contact_charlie':   return { cls: 'bg-amber-900/80 text-amber-300 border-amber-500/40 animate-pulse', label: '⚠ CONTACT — DARK-CHARLIE' };
    case 'report_transmitted':return { cls: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40', label: '↑ Report Transmitted — 7th Fleet MOC' };
    case 'patrol_complete':   return { cls: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40', label: '✓ Patrol Cycle Complete' };
    default:                  return null;
  }
};

// ─── Phase narratives ─────────────────────────────────────────────────────────
const PHASE_NARRATIVE = {
  idle:               null,
  transit:            { title: 'Transit to Patrol Area', body: 'SEA-JEEP-1 transiting to Spratly Islands patrol box. Ocean Aero Triton USV — 4.4m, solar/wind propulsion, 30+ day endurance. EO/IR camera warming up for AIS-dark vessel detection.' },
  patrol_box:         { title: 'Patrol Box — Mischief Reef Sector', body: 'SEA-JEEP-1 on station, executing patrol box around Mischief and Whitsun Reefs. Trillium HD25e EO/IR gimbal active — scanning for AIS-dark fishing militia vessels. All detections relayed to 7th Fleet MOC Yokosuka.' },
  contact_alpha:      { title: 'AIS-Dark Contact — DARK-ALPHA', body: 'EO/IR camera has acquired an AIS-dark vessel at 9.92°N 115.50°E near Mischief Reef. Contact is not transmitting AIS. SEA-JEEP-1 maneuvering for photographic documentation.' },
  photo_alpha:        { title: 'DARK-ALPHA Photographed', body: 'DARK-ALPHA imagery captured and transmitted via Iridium SATCOM to 7th Fleet MDA cell. MOC Yokosuka correlates contact as Chinese maritime militia — Type 3 fishing hull in swarming pattern.' },
  contact_bravo:      { title: 'Second Contact — DARK-BRAVO', body: 'Second AIS-dark vessel detected near Mischief Reef. DARK-BRAVO exhibiting swarming pattern consistent with maritime militia operations. MOC Yokosuka updating pattern-of-life database.' },
  transit_whitsun:    { title: 'Transit to Whitsun Reef', body: 'SEA-JEEP-1 completing Mischief sector pass. Transiting to Whitsun Reef for next sweep leg. 2 militia contacts logged this cycle.' },
  contact_charlie:    { title: 'Contact — DARK-CHARLIE at Whitsun', body: 'Third AIS-dark contact detected at Whitsun Reef. DARK-CHARLIE photographed and logged. Pattern of life now shows 3-vessel militia formation across both reef systems.' },
  report_transmitted: { title: 'Report Transmitted to 7th Fleet', body: 'All 3 contacts documented and transmitted via Iridium 9770 SATCOM. USS Carl Vinson CSG receiving contact package. 7th Fleet MOC updating MDA picture for INDOPACOM.' },
  patrol_complete:    { title: 'Patrol Cycle Complete', body: 'SEA-JEEP-1 patrol cycle complete — 3 AIS-dark militia vessels documented, imagery forwarded to 7th Fleet MDA cell. No fuel consumed. Returning to waypoint ALPHA for next pass.' },
};

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
const SeaJeepBaseMissionView = ({ mission, onBack }) => {
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
  const [currentTick,  setCurrentTick]  = useState(0);
  const [contactPulse, setContactPulse] = useState(false);
  const [_satcomPulse, setSatcomPulse]  = useState(false);   // brief SATCOM arc
  const [satcomTick,   setSatcomTick]   = useState(null);    // tick when SATCOM fired
  const [events,       setEvents]       = useState([]);
  const [running,      setRunning]      = useState(false);
  const [paused,       setPaused]       = useState(false);
  const [complete,     setComplete]     = useState(false);

  const tickRef         = useRef(0);
  const tickCallbackRef = useRef(null);
  const mainTimer       = useRef(null);
  const pulseTimer      = useRef(null);
  const addEvtRef       = useRef(null);
  const vesselLabelsRef = useRef([]);

  // Derived from currentTick — no stale-closure risk
  const phase    = getPhase(currentTick);
  const jeepPos  = getJeepPos(currentTick);
  const trail    = buildTrail(currentTick);

  // SATCOM arc shows for 3 ticks after T_REPORT
  const showSatcom = satcomTick !== null && currentTick >= satcomTick && currentTick < satcomTick + 3;

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
    mainTimer.current = setInterval(tickCallbackRef.current, 180);
  }, []);

  useLayoutEffect(() => { addEvtRef.current = _addEvent; });
  useLayoutEffect(() => { vesselLabelsRef.current = effectiveRoster.map(v => v.name); });

  // Contact pulse — active during any contact/photo phase
  useEffect(() => {
    clearInterval(pulseTimer.current);
    const needsPulse = ['contact_alpha', 'photo_alpha', 'contact_bravo', 'contact_charlie', 'report_transmitted'].includes(phase);
    if (needsPulse) {
      pulseTimer.current = setInterval(() => setContactPulse(p => !p), 350);
      return () => clearInterval(pulseTimer.current);
    }
    setContactPulse(false);
  }, [phase]);

  const stopAll = useCallback(() => {
    clearInterval(mainTimer.current);
    clearInterval(pulseTimer.current);
    mainTimer.current = pulseTimer.current = null;
  }, []);

  const reset = useCallback(() => {
    stopAll();
    tickRef.current = 0;
    setPaused(false);
    setCurrentTick(0);
    setContactPulse(false);
    setSatcomPulse(false);
    setSatcomTick(null);
    setEvents([]);
    setRunning(false);
    setComplete(false);
  }, [stopAll]);

  const runScenario = useCallback(() => {
    stopAll();
    tickRef.current = 0;
    setCurrentTick(0);
    setContactPulse(false);
    setSatcomPulse(false);
    setSatcomTick(null);
    setEvents([]);
    setRunning(true);
    setPaused(false);
    setComplete(false);

    const cb = () => {
      const tick = ++tickRef.current;
      const v0 = vesselLabelsRef.current[0] ?? 'SEA-JEEP-1';
      setCurrentTick(tick);

      if (tick === T_TRANSIT) {
        addEvtRef.current(`${v0}: Entering patrol box — Mischief Reef sector`, 'info');
      }
      if (tick === T_PATROL_BOX) {
        addEvtRef.current(`${v0}: EO/IR camera active — scanning for AIS-dark contacts`, 'info');
      }
      if (tick === T_CONTACT_ALPHA) {
        addEvtRef.current(`${v0}: CONTACT — AIS-dark vessel at 9.92°N 115.50°E — photographing`, 'warn');
      }
      if (tick === T_PHOTO_ALPHA) {
        addEvtRef.current(`${v0}: DARK-ALPHA photographed — forwarding to 7th Fleet MDA cell`, 'info');
        addEvtRef.current('MOC YOKOSUKA: Contact correlated — militia vessel, Type 3 fishing hull', 'info');
      }
      if (tick === T_CONTACT_BRAVO) {
        addEvtRef.current(`${v0}: Second AIS-dark contact — DARK-BRAVO — swarming pattern detected`, 'warn');
        addEvtRef.current('MOC YOKOSUKA: Pattern of life update — 2 militia vessels, Mischief sector', 'info');
      }
      if (tick === T_TRANSIT_WHITSUN) {
        addEvtRef.current(`${v0}: Transit to Whitsun Reef sector — next waypoint`, 'info');
      }
      if (tick === T_CONTACT_CHARLIE) {
        addEvtRef.current(`${v0}: CONTACT — DARK-CHARLIE — Whitsun Reef, AIS-dark, photographing`, 'warn');
      }
      if (tick === T_REPORT) {
        addEvtRef.current(`${v0}: DARK-CHARLIE logged — 3 militia contacts this patrol cycle`, 'info');
        addEvtRef.current('MOC YOKOSUKA: Report transmitted to USS Carl Vinson CSG — pattern of life updated', 'success');
        setSatcomTick(tick);
      }
      if (tick === T_PATROL_COMPLETE) {
        addEvtRef.current(`${v0}: Patrol cycle complete — returning to waypoint ALPHA for next pass`, 'success');
      }
      if (tick >= TOTAL_TICKS) {
        clearInterval(mainTimer.current);
        setRunning(false);
        setComplete(true);
      }
    };
    tickCallbackRef.current = cb;
    mainTimer.current = setInterval(cb, 180);
  }, [stopAll]);

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
    if (vessel.roleKey) setPendingRoleKey(vessel.roleKey);
    setPendingVesselLabel(vessel.name);
    setSelectedView('outfitter');
  };

  const handleSave = () => {
    if (!missionName.trim()) return;
    const data = {
      name: missionName.trim(),
      template: 'SEAJEEP_BASE',
      domain: 'MARITIME',
      status: 'draft',
      duration: '30d',
      zoneConfig: {
        name: 'South China Sea — Spratly MDA',
        coordinates: PATROL_WAYPOINTS.map(([lat, lng]) => ({ lat, lng })),
        reefs: ['Mischief Reef', 'Whitsun Reef'],
      },
      assignedSquadrons: [],
      loadout: { capabilities: SEA_JEEP_BASE_MOUNTS.map(m => m.name) },
      stateHierarchies: {
        default:          ['Navigation', 'Payload', 'Comms', 'Mission', 'Vehicle'],
        contact_detected: ['Payload', 'Mission', 'Comms', 'Navigation', 'Vehicle'],
        comms_degraded:   ['Navigation', 'Mission', 'Vehicle', 'Comms', 'Payload'],
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

  const badge     = getPhaseBadge(phase);
  const narrative = PHASE_NARRATIVE[phase] || null;

  // ── Render ────────────────────────────────────────────────────────────────
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
        <Anchor size={13} className="text-cyan-400" />
        <span className="text-cyan-400 text-[0.8rem] font-semibold tracking-wide">Spratly MDA — South China Sea</span>
        <span className="hidden md:inline text-gray-600 text-[0.7rem]">·</span>
        <span className="hidden md:inline text-gray-500 text-[0.68rem]">Autonomous gray zone monitoring — Mischief &amp; Whitsun Reefs</span>
        <div className="flex-1" />
        <span className="px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-400 text-[0.65rem] font-bold uppercase tracking-wider border border-emerald-500/30">
          ACTIVE
        </span>
        <input
          value={missionName}
          onChange={e => setMissionName(e.target.value)}
          placeholder="Mission name…"
          className="hidden md:block bg-gray-800/60 border border-gray-700/60 rounded-md px-3 py-1.5 text-white text-[0.78rem] w-52 placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
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
              <TileLayer url={TILE_SEAMARK} opacity={0.55} />
              <MapInvalidateSize />

              {/* ── Patrol box — faint dashed white rectangle, always visible ── */}
              <Rectangle
                bounds={[
                  [9.4, 114.2],
                  [10.2, 115.8],
                ]}
                pathOptions={{
                  color: '#e2e8f0',
                  fillOpacity: 0.03,
                  weight: 1,
                  dashArray: '6 5',
                  opacity: 0.35,
                }}
              />

              {/* ── Completed track trail — solid cyan polyline ── */}
              {trail.length >= 2 && (
                <Polyline
                  positions={trail}
                  pathOptions={{ color: '#22d3ee', weight: 1.5, opacity: 0.50 }}
                />
              )}

              {/* ── SATCOM uplink arc — brief dashed cyan line, 3-tick duration ── */}
              {showSatcom && jeepPos && (
                <Polyline
                  positions={[jeepPos, SATCOM_UPLINK_DEST]}
                  pathOptions={{ color: '#22d3ee', weight: 1.5, opacity: 0.75, dashArray: '4 5' }}
                />
              )}

              {/* ── Reef landmarks — grey CircleMarker, always visible ── */}
              <CircleMarker
                center={MISCHIEF_REEF}
                radius={5}
                pathOptions={{ color: '#6b7280', fillColor: '#6b7280', fillOpacity: 0.8, weight: 1.5 }}
              >
                <Tooltip direction="right" offset={[8, 0]}>
                  <span style={{ fontSize: 11, fontWeight: 700 }}>Mischief Reef</span>
                </Tooltip>
              </CircleMarker>

              <CircleMarker
                center={WHITSUN_REEF}
                radius={5}
                pathOptions={{ color: '#6b7280', fillColor: '#6b7280', fillOpacity: 0.8, weight: 1.5 }}
              >
                <Tooltip direction="left" offset={[-8, 0]}>
                  <span style={{ fontSize: 11, fontWeight: 700 }}>Whitsun Reef</span>
                </Tooltip>
              </CircleMarker>

              {/* ── Contact markers ── */}
              {CONTACTS.map(contact => {
                const state = getContactState(contact.id, currentTick);
                if (state === 'hidden') return null;

                const isPhotographed = state === 'photographed';
                const isDetected     = state === 'detected';

                // Orange when detected, yellow when photographed
                const fillColor = isPhotographed ? '#fbbf24' : '#f97316';
                const color     = isPhotographed ? '#fbbf24' : '#f97316';

                return (
                  <React.Fragment key={contact.id}>
                    {/* Contact marker */}
                    <CircleMarker
                      center={contact.pos}
                      radius={8}
                      pathOptions={{ color, fillColor, fillOpacity: isDetected && contactPulse ? 0.95 : 0.75, weight: 2 }}
                    >
                      <Tooltip direction="top" offset={[0, -12]}>
                        <div style={{ fontSize: 11 }}>
                          <strong>{contact.label}</strong><br />
                          {isDetected && 'AIS-DARK — photographing'}
                          {isPhotographed && '✓ PHOTOGRAPHED — forwarded to MOC'}
                        </div>
                      </Tooltip>
                    </CircleMarker>

                    {/* Pulse ring on detection */}
                    {isDetected && contactPulse && (
                      <CircleMarker
                        center={contact.pos}
                        radius={14}
                        pathOptions={{ color: '#f97316', fillOpacity: 0, weight: 2, opacity: 0.50 }}
                      />
                    )}
                  </React.Fragment>
                );
              })}

              {/* ── Sea Jeep USV — cyan CircleMarker ── */}
              {jeepPos && (
                <CircleMarker
                  center={jeepPos}
                  radius={7}
                  pathOptions={{ color: '#22d3ee', fillColor: '#22d3ee', fillOpacity: 0.95, weight: 2 }}
                >
                  <Tooltip direction="top" offset={[0, -10]}>
                    <div style={{ fontSize: 11 }}>
                      <strong>SEA-JEEP-1</strong><br />
                      GP-USV — Ocean Aero Triton
                    </div>
                  </Tooltip>
                </CircleMarker>
              )}

            </MapContainer>

            {/* ── Phase badge ── */}
            {badge && (
              <div className={`absolute top-3 left-3 z-[500] px-3 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wider pointer-events-none border ${badge.cls}`}>
                {badge.label}
              </div>
            )}

            {/* ── Legend ── */}
            {currentTick >= T_TRANSIT && (
              <div className="hidden md:block absolute bottom-3 left-3 z-[500] pointer-events-none px-3 py-2 rounded-xl bg-gray-950/80 border border-gray-700/50 backdrop-blur-sm">
                <div className="flex flex-col gap-1">
                  {[
                    { color: '#22d3ee', label: 'SEA-JEEP-1 — GP-USV' },
                    { color: '#6b7280', label: 'Reef Landmark' },
                    { color: '#f97316', label: 'AIS-Dark Contact — Detecting' },
                    { color: '#fbbf24', label: 'Contact — Photographed' },
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
                  GP-USV Sea Jeep · Gray zone MDA · 7th Fleet MOC Yokosuka
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
        <div className="p-4 border-t border-gray-700/50 grid grid-cols-1 md:grid-cols-2 gap-3">
          {effectiveRoster.map((vessel, idx) => (
            <div key={`${vessel.roleKey || vessel.name}-${vessel.hullName}`} className="flex border border-gray-700/50 rounded-lg overflow-hidden bg-gray-900/40">
              {/* Placeholder when no image */}
              <div className="w-32 flex-shrink-0 bg-gray-950/60 flex items-center justify-center p-2">
                {vessel.image ? (
                  <img src={vessel.image} alt={vessel.name} className="w-full h-full object-contain max-h-24" />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1 opacity-40">
                    <Anchor size={24} className="text-cyan-400" />
                    <span className="text-[0.6rem] text-gray-400 text-center leading-tight">Ocean Aero Triton</span>
                  </div>
                )}
              </div>
              {/* Capabilities */}
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

        {/* ── Mission Description ── */}
        <div className="px-4 pb-5 border-t border-gray-700/50">
          <div className="mt-3 px-4 py-3 rounded-xl bg-gray-800/60 border border-gray-700/40">
            <div className="text-[0.65rem] font-bold text-teal-400 uppercase tracking-widest mb-1.5">Mission Brief</div>
            <p className="text-[0.75rem] text-gray-300 leading-relaxed">
              China&apos;s maritime militia routinely goes AIS-dark: boats turn off their transponders to disappear from standard tracking. The Sea Jeep patrols the Mischief and Whitsun Reef area, photographs every dark contact it finds with its EO/IR camera, and relays imagery to 7th Fleet via Iridium satellite. At 4.4m long it looks like ocean debris to radar. It can loiter for 30+ days on solar power without burning a drop of fuel, quietly building the pattern-of-life picture China doesn&apos;t want anyone to have.
            </p>
          </div>
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

export default SeaJeepBaseMissionView;
