import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import {
  MapContainer, TileLayer, Circle, CircleMarker, Polyline, Tooltip, ZoomControl, useMap
} from 'react-leaflet';
import {
  Play, Pause, RotateCcw, Anchor, ChevronLeft, Check, Settings, ArrowLeftRight
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import useMissionStore from '../../store/missionStore';
import useOutfitterStore from '../../store/outfitterStore';
import useConfigurationStore from '../../store/configurationStore';
import useNavigationStore from '../../store/navigationStore';
import { vesselHullData } from '../../data/vesselData';
import { MISSION_ROLES } from '../../data/missionRoles';
import imgSubSeaSail from '../../assets/images/SubSeaSail.png';
import SwapVesselModal from './SwapVesselModal';
import ReadinessChecklist from './ReadinessChecklist';
import { getMissionReadiness } from '../../utils/missionReadiness';
import { HULL_IMAGES } from '../../utils/hullImages';

const MISSION_SET_KEY = 'PORT_SECURITY';
const MISSION_SET_CAPS = ['Echodyne EchoGuard CR', 'OrbComm ST 6100', 'LOS Mesh Radio', 'OceanSonics icListen HF Smart Hydrophone Array', 'MOOS-IvP'];

// ─── Geography ───────────────────────────────────────────────────────────────
const NM_TO_M = 1852;
const COVERAGE_M = 3 * NM_TO_M;

const NBSD       = [32.681, -117.131];  // Naval Base San Diego (32nd St)
const MAP_CENTER = [32.61,  -117.26];   // Map view — centered on harbor perimeter + approaches

// Boats on the harbor perimeter — bay mouth / outer approach zone
// Pushed south and further out from port relative to NBSD
const BOATS = [
  { id: 'HORUS-1', pos: [32.685, -117.225], sector: 'NW Harbor Security' },   // bay mouth NW
  { id: 'HORUS-2', pos: [32.645, -117.250], sector: 'W Harbor Security'  },   // outer W approach
  { id: 'HORUS-3', pos: [32.605, -117.225], sector: 'SW Harbor Security' },   // outer SW approach
];

// Alert chain — H3 detects → mesh to H2 → mesh to H1 → H1 pings shore
// Chain fires at tick 34 — computed crossing of HORUS-3's 3nm coverage circle
const CHAIN_SEGS = [
  { id: 'h3-h2',    from: BOATS[2].pos, to: BOATS[1].pos, pulseStart: 34, pulseEnd: 37 },
  { id: 'h2-h1',    from: BOATS[1].pos, to: BOATS[0].pos, pulseStart: 37, pulseEnd: 40 },
  { id: 'h1-shore', from: BOATS[0].pos, to: NBSD,         pulseStart: 40, pulseEnd: 47 },
];

// Bad guy USV — approaches from SW through HORUS-3's (SW) zone
// Starts ~10nm SW of NBSD and approaches through the outer harbor perimeter
// Bad guy keeps approaching NBSD — no retreat
const APPROACH_TRACK = [
  [32.52, -117.36],   // start: ~10nm SW of NBSD — well outside perimeter
  [32.54, -117.32],
  [32.57, -117.28],
  [32.59, -117.25],   // crossing perimeter zone boundary
  [32.61, -117.22],
  [32.63, -117.19],
  [32.66, -117.15],   // deep in zone, approaching NBSD
];

// Tick at which HORUS-2 corroborates SIERRA-7743 → localization achieved (2 sensors)
const LOCALIZE_TICK = 37;

// Blue force launches from NAS North Island — direct Pacific access, no peninsula crossing
const BLUE_FORCE_ORIGIN = [32.700, -117.210];  // NAS North Island

// Intercept at tick 68: bogey at [32.621, -117.204] — 1.42nm inside HORUS-3's circle
const INTERCEPT_POINT = [32.621, -117.204];
const INTERCEPT_TICK  = 68;

const APPROACH_TICKS = 90;
const TOTAL_TICKS    = INTERCEPT_TICK + 10;  // brief hold after kill

// ─── Loadout (Port Security Mission Set) ─────────────────────────────────────
const CAP_NAMES = [
  'Echodyne EchoGuard CR',
  'OrbComm ST 6100',
  'LOS Mesh Radio',
];

const PRESETS = {
  standard: {
    label: 'Comms + Mesh',
    ids: new Set(['OrbComm ST 6100', 'LOS Mesh Radio']),
  },
  enhanced: {
    label: 'Full Mission Set',
    ids: new Set(CAP_NAMES),
  },
};

// ─── HORUS mount-point layout (Port Security Mission Set) ─────────────────────
const HORUS_MOUNTS = [
  { id: 'echoguard', label: 'EchoGuard CR Radar', type: 'RADAR/RF',  capName: 'Echodyne EchoGuard CR' },
  { id: 'orbcomm',   label: 'SATCOM Terminal',    type: 'SATCOM',    capName: 'OrbComm ST 6100'        },
  { id: 'mesh',      label: 'Mesh Radio',          type: 'COMMS',    capName: 'LOS Mesh Radio'         },
];

// ─── Vessel roster ────────────────────────────────────────────────────────────
const VESSEL_ROSTER = [
  { name: 'HORUS-1 (NW Harbor)', roleDescriptor: '(NW Harbor)', image: imgSubSeaSail, hullName: 'SubSeaSail Horus', roleKey: 'PS_HORUS_1', capabilities: ['Echodyne EchoGuard CR', 'OrbComm ST 6100', 'LOS Mesh Radio', 'VHF Hailing Capability'] },
  { name: 'HORUS-2 (W Harbor)', roleDescriptor: '(W Harbor)', image: imgSubSeaSail, hullName: 'SubSeaSail Horus', roleKey: 'PS_HORUS_2', capabilities: ['Echodyne EchoGuard CR', 'IFF Negative Alert', 'OrbComm ST 6100', 'LOS Mesh Radio'] },
  { name: 'HORUS-3 (SW Harbor)', roleDescriptor: '(SW Harbor)', image: imgSubSeaSail, hullName: 'SubSeaSail Horus', roleKey: 'PS_HORUS_3', capabilities: ['Echodyne EchoGuard CR', 'VHF Hailing Capability', 'OrbComm ST 6100', 'LOS Mesh Radio'] },
];

// ─── Phase narratives ─────────────────────────────────────────────────────────
const PHASE_NARRATIVE = {
  idle:         null,
  approach:     { title: 'Unidentified Surface Track', body: 'GCCS radar correlates SIERRA-7743 bearing 040° at 8nm SW with no AIS transponder. HORUS cordon active — three USVs hold 3nm harbor security zone sectors NW, W, and SW of Naval Base San Diego.' },
  detection:    { title: 'HORUS-3 — Zone Breach', body: 'SIERRA-7743 crosses HORUS-3 3nm barrier. IFF negative. VHF hails unanswered. HORUS-3 locks on via hydrophone correlation and transmits detection over mesh radio to adjacent nodes.' },
  localization: { title: 'Multi-Sensor Localization', body: 'HORUS-2 independently acquires SIERRA-7743 on bearing 308. Two independent sensor tracks intersect — localization achieved. USW fusion pushes fire-control-quality track to MOC NBSD.' },
  mesh_alert:   { title: 'Mesh Alert Propagating', body: 'Detection relayed node-to-node: HORUS-3 → HORUS-2 → HORUS-1 → shore link. HORUS-1 opens SATCOM channel to Naval Base San Diego Maritime Operations Center.' },
  response:     { title: 'Blue Force Intercept Authorized', body: 'MOC NBSD confirms hostile classification — SIERRA-7743 track quality: fire-control grade. Interceptor launches from 32nd Street Pier. HORUS cordon maintains continuous track.' },
  intercepted:  { title: 'Contact Neutralized', body: 'Interceptor achieves engagement solution using HORUS mesh-relayed track. SIERRA-7743 neutralized. Port approaches secure. HORUS cordon resumes standard patrol posture.' },
};

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
  blue:    'text-blue-400',
  success: 'text-emerald-400',
};

// ─── Tile layers ─────────────────────────────────────────────────────────────
const TILE_BASE    = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const TILE_SEAMARK = 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png';

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
const PortSecurityMissionView = ({ mission, onBack }) => {
  const { saveMission, updateMission } = useMissionStore();
  const { setSelectedHull } = useOutfitterStore();
  const { startNewConfiguration, setPendingMissionSetKey, setPendingMissionSetCaps, setPendingRoleKey, setPendingVesselLabel, activeConfig } = useConfigurationStore();
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

  // Metadata
  const [missionName, setMissionName] = useState(mission?.name || '');

  // Animation
  const [phase,        setPhase]        = useState('idle');
  const [badGuyPos,    setBadGuyPos]    = useState(null);
  const [detectedBoats, setDetectedBoats] = useState(new Set());
  const [localized,     setLocalized]     = useState(false);
  const [interceptorPos, setInterceptorPos] = useState(null);  // moving blue force
  const [killed,         setKilled]         = useState(false);  // intercept fired
  const [killPos,        setKillPos]        = useState(null);
  const [meshPulse,    setMeshPulse]    = useState(false);
  const [circPulse,    setCircPulse]    = useState(false);
  const [complete,     setComplete]     = useState(false);
  const [running,      setRunning]      = useState(false);
  const [paused,        setPaused]        = useState(false);
  const [events,       setEvents]       = useState([]);
  const [currentTick,  setCurrentTick]  = useState(0);   // drives chain animation

  // Loadout (fixed to full mission set — sidebar panel removed)
  const preset   = 'enhanced';
  const enabled  = new Set(PRESETS.enhanced.ids);

  const tickRef    = useRef(0);
  const tickCallbackRef = useRef(null);
  const mainTimer  = useRef(null);
  const meshTimer  = useRef(null);
  const circTimer  = useRef(null);
  const addEvtRef  = useRef(null);
  const vesselLabelsRef = useRef([]);

  // Keep addEvent fresh in closures — update the ref outside render via useLayoutEffect
  const _addEvent = (msg, type = 'info') => {
    const ts = new Date().toLocaleTimeString('en-US', {
      hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    setEvents(prev => [{ ts, msg, type, id: `${ts}-${msg.slice(0, 10)}` }, ...prev].slice(0, 22));
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


  useLayoutEffect(() => {
    addEvtRef.current = _addEvent;
  });

  // Mesh pulse tied to phase
  useEffect(() => {
    clearInterval(meshTimer.current);
    if (['detection', 'localization', 'mesh_alert', 'response'].includes(phase)) {
      meshTimer.current = setInterval(() => setMeshPulse(p => !p), 280);
      return () => clearInterval(meshTimer.current);
    }
    setMeshPulse(false);
  }, [phase]);

  // Circle pulse on detection / localization
  useEffect(() => {
    clearInterval(circTimer.current);
    if (['detection', 'localization', 'mesh_alert'].includes(phase)) {
      circTimer.current = setInterval(() => setCircPulse(p => !p), 380);
      return () => clearInterval(circTimer.current);
    }
    setCircPulse(false);
  }, [phase]);

  const stopAll = useCallback(() => {
    clearInterval(mainTimer.current);
    clearInterval(meshTimer.current);
    clearInterval(circTimer.current);
    mainTimer.current = meshTimer.current = circTimer.current = null;
  }, []);

  const reset = useCallback(() => {
    stopAll();
    tickRef.current = 0;
    setPaused(false);
    setPhase('idle');
    setBadGuyPos(null);
    setDetectedBoats(new Set());
    setLocalized(false);
    setInterceptorPos(null);
    setKilled(false);
    setKillPos(null);
    setMeshPulse(false);
    setCircPulse(false);
    setComplete(false);
    setRunning(false);
    setEvents([]);
    setCurrentTick(0);
  }, [stopAll]);

  const runScenario = useCallback(() => {
    stopAll();
    tickRef.current = 0;
    // Reset visual state for fresh run
    setPhase('approach');
    setBadGuyPos(APPROACH_TRACK[0]);
    setDetectedBoats(new Set());
    setLocalized(false);
    setInterceptorPos(null);
    setKilled(false);
    setKillPos(null);
    setMeshPulse(false);
    setCircPulse(false);
    setComplete(false);
    setRunning(true);
    setPaused(false);
    setEvents([]);
    setCurrentTick(0);

    addEvtRef.current('Fleet GCCS: unidentified surface track SIERRA-7743, 8nm SW, bearing 040°, no AIS', 'warn');

    const cb = () => {
      const tick = ++tickRef.current;
      const v0 = vesselLabelsRef.current[0] ?? 'SubSeaSail Horus (NW Harbor)';
      const v1 = vesselLabelsRef.current[1] ?? 'SubSeaSail Horus (W Harbor)';
      const v2 = vesselLabelsRef.current[2] ?? 'SubSeaSail Horus (SW Harbor)';

      // ── Bad guy position — intercept happens before approach track ends ──
      if (tick < INTERCEPT_TICK) {
        setBadGuyPos(trackPos(APPROACH_TRACK, tick / APPROACH_TICKS));
      }

      // ── Interceptor position — launches from NAS North Island, direct ocean route ──
      if (tick >= 56 && tick < INTERCEPT_TICK) {
        const t = (tick - 56) / (INTERCEPT_TICK - 56);
        setInterceptorPos(lerp2(BLUE_FORCE_ORIGIN, INTERCEPT_POINT, t));
      }

      // Drive chain animation
      setCurrentTick(tick);

      // ── Events ──
      if (tick === 34) {
        // bogey crosses HORUS-3's 3nm radar circle — computed tick
        setDetectedBoats(new Set(['HORUS-3']));
        setPhase('detection');
        addEvtRef.current(`${v2}: ZONE BREACH — SIERRA-7743 crossed 3nm barrier. IFF negative. VHF no reply. Alerting cordon.`, 'alert');
      }
      if (tick === 35) {
        addEvtRef.current(`${v2} → ${v1}: Detection relay — cueing second sensor`, 'info');
      }
      if (tick === LOCALIZE_TICK) {
        // HORUS-2 independently acquires — 2 sensors tracking → LOCALIZATION achieved
        setDetectedBoats(new Set(['HORUS-3', 'HORUS-2']));
        setLocalized(true);
        setPhase('localization');
        addEvtRef.current(`${v1}: Track corroborated — LOCALIZATION acquired. 2 sensors on SIERRA-7743.`, 'blue');
        addEvtRef.current('NET: Multi-sensor fusion complete — cueing blue force interceptor', 'blue');
      }
      if (tick === 40) {
        // h2→h1 mesh link completes — H1 pings shore
        setPhase('mesh_alert');
        addEvtRef.current(`${v0}: Alert received — relaying to MOC NBSD`, 'info');
      }
      if (tick === 47) {
        // h1→shore completes — MOC receives alert
        addEvtRef.current(`NBSD MOC: Alert received from ${v0} — track confirmed hostile`, 'alert');
      }
      if (tick === 51) {
        addEvtRef.current('MOC NBSD: Blue forces authorized — intercepting', 'alert');
      }
      if (tick === 56) {
        setPhase('response');
        addEvtRef.current('INTERCEPTOR: Launching from NAS North Island — direct ocean intercept vector', 'blue');
      }
      if (tick === INTERCEPT_TICK) {
        // Kill
        setBadGuyPos(null);
        setInterceptorPos(null);
        setKilled(true);
        setKillPos(INTERCEPT_POINT);
        setPhase('intercepted');
        addEvtRef.current('INTERCEPTOR: CONTACT NEUTRALIZED — SIERRA-7743 eliminated', 'success');
      }
      if (tick === TOTAL_TICKS) {
        stopAll();
        setRunning(false);
        setComplete(true);
        addEvtRef.current('PERIMETER SECURED — threat eliminated, zone clear', 'success');
      }
    };
    tickCallbackRef.current = cb;
    mainTimer.current = setInterval(cb, 280);
  }, [stopAll]);

  // Cleanup on unmount
  useEffect(() => () => stopAll(), [stopAll]);

  // ── Chain link helpers ── (mocOpacity removed — replaced by CHAIN_SEGS) — derive state from currentTick (no extra state needed)
  const chainState = (seg) => {
    if (currentTick < seg.pulseStart) return 'inactive';
    if (currentTick <= seg.pulseEnd)  return 'pulsing';
    return 'active';
  };
  const chainPulsePos = (seg) => {
    if (currentTick < seg.pulseStart || currentTick > seg.pulseEnd) return null;
    const t = (currentTick - seg.pulseStart) / (seg.pulseEnd - seg.pulseStart);
    return lerp2(seg.from, seg.to, Math.min(t, 1));
  };

  const circleOpts = (boatId) => {
    const isDetecting = detectedBoats.has(boatId);
    if (phase === 'intercepted') {
      return { color: '#10b981', fillColor: '#10b981', fillOpacity: 0.06, weight: 1.5, dashArray: '6 4' };
    }
    if (isDetecting && circPulse) {
      // Localized boats pulse blue; first-detect boat pulses red
      const pulseColor = (localized && boatId !== 'HORUS-3') ? '#3b82f6' : '#ef4444';
      return { color: pulseColor, fillColor: pulseColor, fillOpacity: 0.13, weight: 3, dashArray: null };
    }
    if (isDetecting || (detectedBoats.size > 0 && ['mesh_alert', 'response'].includes(phase))) {
      return { color: '#f97316', fillColor: '#f97316', fillOpacity: 0.07, weight: 2, dashArray: '5 3' };
    }
    return { color: '#06b6d4', fillColor: '#06b6d4', fillOpacity: 0.05, weight: 1.5, dashArray: '6 5' };
  };


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
    // Pass the specific role key so LoadoutBuilder applies the correct HORUS role
    // and clears any stale roleKey from a previous mission
    if (vessel.roleKey) {
      setPendingRoleKey(vessel.roleKey);
    } else {
      setPendingRoleKey(null);
    }
    setPendingVesselLabel(vessel.name);
    setSelectedView('outfitter');
  };

  const handleSave = () => {
    if (!missionName.trim()) return;
    const data = {
      name: missionName.trim(),
      template: 'PORT_SECURITY',
      domain: 'MARITIME',
      status: 'draft',
      duration: '30d',
      zoneConfig: { center: { lat: NBSD[0], lng: NBSD[1] }, radius: 20, assetName: 'Naval Base San Diego' },
      assignedSquadrons: [],
      loadout: { preset, capabilities: [...enabled] },
      stateHierarchies: {
        default:        ['Navigation', 'Payload', 'Comms', 'Mission', 'Vehicle'],
        contact_flagged:['Payload', 'Mission', 'Comms', 'Navigation', 'Vehicle'],
        comms_degraded: ['Navigation', 'Comms', 'Mission', 'Vehicle', 'Payload'],
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
        <Anchor size={13} className="text-emerald-400" />
        <span className="text-emerald-400 text-[0.8rem] font-semibold tracking-wide">Port Security</span>
        <div className="flex-1" />
        <input
          value={missionName}
          onChange={e => setMissionName(e.target.value)}
          placeholder="Mission name…"
          className="hidden md:block bg-gray-800/60 border border-gray-700/60 rounded-md px-3 py-1.5 text-white text-[0.78rem] w-52 placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
        />
        <button
          onClick={handleSave}
          disabled={!missionName.trim() || !isDeployable}
          className={`hidden md:block px-3 py-1.5 rounded-md text-[0.78rem] font-semibold transition-colors ${
            missionName.trim() && isDeployable
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-gray-700/50 text-gray-600 cursor-not-allowed'
          }`}
        >
          Save Draft
        </button>
      </div>

      {/* ── Scrollable content (animation + outfitter) ── */}
      <div className="flex-1 min-h-0 overflow-y-auto">

      {/* ── Animation row ── */}
      <div className="flex h-[40vh] md:h-[460px]">

        {/* ── Map ── */}
        <div className="flex-1 relative overflow-hidden">
          <MapContainer
            center={MAP_CENTER}
            zoom={11}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
            scrollWheelZoom
            attributionControl={false}
          >
            <ZoomControl position="topright" />
            <TileLayer url={TILE_BASE} />
            <TileLayer url={TILE_SEAMARK} opacity={0.6} />
            <MapInvalidateSize />

            {/* ── 3nm harbor security coverage circles ── */}
            {BOATS.map(b => (
              <React.Fragment key={b.id}>
                <Circle center={b.pos} radius={COVERAGE_M} pathOptions={circleOpts(b.id)} />
                {/* Pulse ring on detection / localization */}
                {detectedBoats.has(b.id) && circPulse && (
                  <Circle
                    center={b.pos}
                    radius={COVERAGE_M * 1.03}
                    pathOptions={{
                      color:   localized && b.id !== 'HORUS-3' ? '#3b82f6' : '#ef4444',
                      fillOpacity: 0,
                      weight:  3,
                      opacity: 0.55,
                    }}
                  />
                )}
              </React.Fragment>
            ))}

            {/* ── Sensor-to-contact tracking lines ── */}
            {/* Detection: HORUS-3 lock-on line (amber) */}
            {badGuyPos && detectedBoats.has('HORUS-3') && (
              <Polyline
                positions={[BOATS[2].pos, badGuyPos]}
                pathOptions={{ color: '#f97316', weight: 1.5, opacity: meshPulse ? 0.75 : 0.35, dashArray: '4 6' }}
              />
            )}
            {/* Localization: HORUS-2 corroboration line (blue) */}
            {badGuyPos && detectedBoats.has('HORUS-2') && (
              <Polyline
                positions={[BOATS[1].pos, badGuyPos]}
                pathOptions={{ color: '#3b82f6', weight: 1.5, opacity: meshPulse ? 0.80 : 0.38, dashArray: '4 6' }}
              />
            )}

            {/* ── Ambient mesh background (all pairs, very dim) ── */}
            {BOATS.flatMap((b, i) =>
              BOATS.slice(i + 1).map(b2 => (
                <Polyline
                  key={`mesh-bg-${b.id}-${b2.id}`}
                  positions={[b.pos, b2.pos]}
                  pathOptions={{ color: '#06b6d4', opacity: 0.10, weight: 1, dashArray: '3 9' }}
                />
              ))
            )}

            {/* ── Alert chain — sequential pulse propagation ── */}
            {CHAIN_SEGS.map(seg => {
              const state   = chainState(seg);
              const pulsePt = chainPulsePos(seg);
              const isShore = seg.id.includes('shore');
              const activeColor = isShore ? '#f97316' : '#06b6d4';
              return (
                <React.Fragment key={seg.id}>
                  {/* Persistent line once activated */}
                  {state !== 'inactive' && (
                    <Polyline
                      positions={[seg.from, seg.to]}
                      pathOptions={{
                        color:     activeColor,
                        opacity:   state === 'active' ? 0.70 : 0.28,
                        weight:    state === 'active' ? 2 : 1.5,
                        dashArray: state === 'active' ? null : '4 6',
                      }}
                    />
                  )}
                  {/* Traveling pulse dot */}
                  {pulsePt && (
                    <CircleMarker
                      center={pulsePt}
                      radius={4}
                      pathOptions={{
                        color: activeColor, fillColor: '#fff',
                        fillOpacity: 0.95, weight: 2,
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}

            {/* ── Boat markers ── */}
            {BOATS.map(b => (
              <CircleMarker
                key={b.id}
                center={b.pos}
                radius={7}
                pathOptions={{ color: '#06b6d4', fillColor: '#06b6d4', fillOpacity: 0.9, weight: 2 }}
              >
                <Tooltip direction="top" offset={[0, -10]}>
                  <div style={{ fontSize: 11 }}>
                    <strong>SubSeaSail {b.id}</strong><br />
                    {b.sector} · 3nm coverage
                  </div>
                </Tooltip>
              </CircleMarker>
            ))}

            {/* ── Naval Base San Diego ── */}
            <CircleMarker
              center={NBSD}
              radius={8}
              pathOptions={{
                color:       currentTick >= 75 ? '#f97316' : '#10b981',
                fillColor:   currentTick >= 75 ? '#f97316' : '#10b981',
                fillOpacity: 1,
                weight:      2,
              }}
            >
              <Tooltip direction="right" offset={[12, 0]}>
                <span style={{ fontSize: 11, fontWeight: 700 }}>
                  {currentTick >= 75 ? '⚡ MOC NBSD' : 'Naval Base San Diego'}
                </span>
              </Tooltip>
            </CircleMarker>
            {/* Alert pulse ring on NBSD once H1's shore link arrives */}
            {currentTick >= 75 && currentTick < 84 && meshPulse && (
              <CircleMarker
                center={NBSD}
                radius={14}
                pathOptions={{ color: '#f97316', fillOpacity: 0, weight: 2, opacity: 0.5 }}
              />
            )}

            {/* ── Interceptor trail ── */}
            {interceptorPos && (
              <Polyline
                positions={[NBSD, interceptorPos]}
                pathOptions={{ color: '#3b82f6', weight: 2, opacity: 0.45, dashArray: '4 5' }}
              />
            )}

            {/* ── Interceptor vessel (moving blue force) ── */}
            {interceptorPos && (
              <CircleMarker
                center={interceptorPos}
                radius={7}
                pathOptions={{ color: '#3b82f6', fillColor: '#93c5fd', fillOpacity: 1, weight: 2 }}
              >
                <Tooltip direction="top" offset={[0, -10]}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6' }}>↗ Interceptor</span>
                </Tooltip>
              </CircleMarker>
            )}

            {/* ── Kill marker ── */}
            {killed && killPos && (
              <CircleMarker
                center={killPos}
                radius={11}
                pathOptions={{ color: '#ef4444', fillColor: '#f97316', fillOpacity: 0.75, weight: 3 }}
              >
                <Tooltip permanent direction="top" offset={[0, -14]}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444' }}>✕ NEUTRALIZED</span>
                </Tooltip>
              </CircleMarker>
            )}

            {/* ── Bad guy USV (keeps advancing until killed) ── */}
            {badGuyPos && (
              <CircleMarker
                center={badGuyPos}
                radius={8}
                pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.9, weight: 2 }}
              >
                <Tooltip permanent direction="top" offset={[0, -12]}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444' }}>⚠ SIERRA-7743</span>
                </Tooltip>
              </CircleMarker>
            )}
          </MapContainer>

          {/* ── Phase status badge ── */}
          {phase !== 'idle' && (
            <div className={`absolute top-3 left-3 z-[500] px-3 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wider pointer-events-none ${
              phase === 'intercepted'
                ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-500/40'
                : phase === 'response'
                ? 'bg-blue-900/80 text-blue-300 border border-blue-500/40'
                : phase === 'localization'
                ? 'bg-blue-900/80 text-blue-200 border border-blue-400/50 animate-pulse'
                : phase === 'detection' || phase === 'mesh_alert'
                ? 'bg-red-900/80 text-red-300 border border-red-500/40 animate-pulse'
                : 'bg-amber-900/80 text-amber-300 border border-amber-500/40'
            }`}
            >
              {phase === 'approach'      && '● Tracking Contact'}
              {phase === 'detection'     && '⚠ Detection — 1 Sensor'}
              {phase === 'localization'  && '◈ Localization — 2 Sensors'}
              {phase === 'mesh_alert'    && '⚡ Mesh Alert — All Units'}
              {phase === 'response'      && '→ Interceptor Inbound'}
              {phase === 'intercepted'   && '✓ Contact Neutralized'}
            </div>
          )}

          {/* ── Map legend (bottom-left) — hidden while detection HUD is showing ── */}
          {(currentTick < 58 || currentTick >= INTERCEPT_TICK) && (
            <div className="hidden md:block absolute bottom-3 left-3 z-[500] pointer-events-none px-3 py-2 rounded-xl bg-gray-950/80 border border-gray-700/50 backdrop-blur-sm">
              <div className="flex flex-col gap-1">
                {[
                  { color: '#06b6d4', label: `${effectiveRoster[0]?.hullName ?? 'SubSeaSail Horus'} — Barrier Sensor Node` },
                  { color: '#ef4444', label: 'SIERRA-7743 — Hostile USV' },
                  { color: '#10b981', label: 'Naval Base San Diego' },
                  { color: '#3b82f6', label: 'Interceptor — Blue Force' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: '#9ca3af' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Detection / Localization HUD (bottom-left) ── */}
          {currentTick >= 58 && currentTick < INTERCEPT_TICK && (
            <div className="absolute bottom-3 left-3 z-[500] pointer-events-none">
              <div className={`px-3 py-2.5 rounded-xl backdrop-blur-sm border transition-all ${
                localized
                  ? 'bg-blue-950/90 border-blue-500/40'
                  : 'bg-amber-950/90 border-amber-500/40'
              }`}
              >
                <div className={`text-[0.72rem] font-bold uppercase tracking-widest ${
                  localized ? 'text-blue-200' : 'text-amber-200'
                }`}
                >
                  {localized ? '◈ Localization' : '◉ Detection'}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  {BOATS.map(b => (
                    <div
                      key={b.id}
                      className={`w-2 h-2 rounded-full ${
                        detectedBoats.has(b.id)
                          ? localized && b.id === 'HORUS-2'
                            ? 'bg-blue-400'
                            : 'bg-amber-400'
                          : 'bg-gray-600'
                      }`}
                      title={b.id}
                    />
                  ))}
                  <span className="text-[0.62rem] text-gray-400 ml-0.5">
                    {detectedBoats.size}/3 sensors
                  </span>
                </div>
                {localized && (
                  <div className="text-[0.62rem] text-blue-400 mt-1 font-semibold">
                    Blue force cued ↗
                  </div>
                )}
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
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[0.78rem] font-semibold transition-colors bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  <Pause size={13} />
                  Pause
                </button>
              ) : (
                <button
                  onClick={paused ? resume : runScenario}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[0.78rem] font-semibold transition-colors bg-emerald-600 hover:bg-emerald-500 text-white"
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
                <div className="text-[0.68rem] font-bold text-emerald-300 uppercase tracking-wider mb-1">
                  {narrative.title}
                </div>
                <div className="text-[0.67rem] text-gray-400 leading-relaxed">
                  {narrative.body}
                </div>
              </div>
            ) : (
              <p className="text-gray-600 text-[0.68rem]">
                3× SubSeaSail HORUS AUSV · 3nm harbor security zone
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

export default PortSecurityMissionView;
