import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import {
  MapContainer, TileLayer, Circle, CircleMarker, Polyline, Tooltip, ZoomControl, useMap
} from 'react-leaflet';
import { Play, Pause, RotateCcw, Ship, ChevronLeft, Settings, ArrowLeftRight } from 'lucide-react';
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

const MISSION_SET_KEY = 'MDA_MOTHERSHIP';
const MISSION_SET_CAPS = ['TempestOS Core Platform', 'MILSATCOM Terminal', 'Link 16 Track Broadcast', 'HiveLink SDR', 'Maritime Surface/Air Search Radar', 'Teledyne FLIR EO/IR Turret', 'Marine AI Guardian Vision CVP', 'SeaFIND Inertial Navigation', 'Passive Sonar Track Relay', 'NSYTE AI Maintenance System'];

// ─── Geography — First Island Chain / Luzon Strait ─────────────────────────────
const NM_TO_M = 1852;

const MAP_CENTER  = [20.8, 121.9];
const MAP_ZOOM    = 7;
const MAP_ZOOM_IN = 8;

const LCS_POS      = [20.8, 121.9];   // Freedom-class LCS mothership — launch/recovery node
const AIR_STATION  = [21.85, 121.70]; // MQ-8C over-the-horizon ISR (N)
const SURF_STATION = [20.90, 123.15]; // M48 surface net (E)
const SUB_STATION  = [19.85, 121.60]; // Freedom AUV subsurface (S)

const OP_AREA_NM = 70; // mothership operating-area radius

// ─── Tick milestones ──────────────────────────────────────────────────────────
const T_DEPLOYED  =  8;   // LCS on station
const T_LAUNCH    = 22;   // air/surface/subsurface layers launched (lowered into water)
const T_ONSTATION = 48;   // layers reach their stations
const T_RECOVER   = 66;   // assets recovered / hoisted back to the LCS
const T_COMPLETE  = 86;   // all assets aboard — data collected
const TOTAL_TICKS = 86;

const TICK_MS = 280;

// ─── Roster ─────────────────────────────────────────────────────────────────
const VESSEL_ROSTER = [
  { name: 'LCS Mothership', roleDescriptor: '(Mothership)', image: HULL_IMAGES['Freedom-class LCS'], hullName: 'Freedom-class LCS', roleKey: 'MDAM_LCS', capabilities: ['TempestOS Core Platform', 'MILSATCOM Terminal', 'Link 16 Track Broadcast', 'HiveLink SDR', 'NSYTE AI Maintenance System'] },
  { name: 'MQ-8C Fire Scout', roleDescriptor: '(Air ISR)', image: HULL_IMAGES['MQ-8C Fire Scout'], hullName: 'MQ-8C Fire Scout', roleKey: 'MDAM_AIR', capabilities: ['Maritime Surface/Air Search Radar', 'Teledyne FLIR EO/IR Turret', 'Link 16 Track Broadcast'] },
  { name: 'M48', roleDescriptor: '(Surface ISR)', image: HULL_IMAGES['M48'], hullName: 'M48', roleKey: 'MDAM_SURFACE', capabilities: ['Maritime Surface/Air Search Radar', 'Teledyne FLIR EO/IR Turret', 'Marine AI Guardian Vision CVP', 'SeaFIND Inertial Navigation', 'HiveLink SDR'] },
  { name: 'Freedom AUV', roleDescriptor: '(Subsurface ISR)', image: HULL_IMAGES['Freedom AUV'], hullName: 'Freedom AUV', roleKey: 'MDAM_SUB', capabilities: ['Passive Sonar Track Relay', 'Passive ESM/SIGINT Collection Module'] },
];

// ─── Phase narratives ─────────────────────────────────────────────────────────
const PHASE_NARRATIVE = {
  idle:       null,
  deployed:   { title: 'LCS On Station', body: 'The Freedom-class LCS moves into the first-island-chain operating area as the launch, recovery, and comms node. TempestOS is up; the unmanned force is stowed on deck and ready.' },
  launching:  { title: 'Launching Every Layer', body: 'The LCS puts the force out: the MQ-8C off the deck for the air layer, and the M48 and Freedom AUV lowered into the water for the surface and subsurface layers.' },
  collecting: { title: 'Streaming Sensor Data', body: 'Air, surface, and subsurface assets are on station and streaming their sensor feeds back to the LCS over Link 16 and HiveLink. TempestOS fuses every layer into one picture — one hull covering more water than a carrier group.' },
  recovering: { title: 'Recover & Cycle', body: 'On-station time complete: the MQ-8C recovers to the deck and the M48 and Freedom AUV are hoisted back aboard (AutoHook-class LARS, through Sea State 4). The force comes home.' },
  complete:   { title: 'Assets Aboard — Picture Delivered', body: 'The unmanned force is recovered and the fused picture has been delivered. Swap the payload, not the platform — one squadron, one picture.' },
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
  if (tick < T_DEPLOYED)  return 'idle';
  if (tick < T_LAUNCH)    return 'deployed';
  if (tick < T_ONSTATION) return 'launching';
  if (tick < T_RECOVER)   return 'collecting';
  if (tick < T_COMPLETE)  return 'recovering';
  return 'complete';
};

// Asset position: on the LCS, out to station, then recovered back
const getAssetPos = (station, tick) => {
  if (tick < T_LAUNCH)    return LCS_POS;
  if (tick < T_ONSTATION) return lerp2(LCS_POS, station, (tick - T_LAUNCH) / (T_ONSTATION - T_LAUNCH));
  if (tick < T_RECOVER)   return station;
  if (tick < T_COMPLETE)  return lerp2(station, LCS_POS, (tick - T_RECOVER) / (T_COMPLETE - T_RECOVER));
  return LCS_POS;
};

const getPhaseBadge = (phase) => {
  const m = {
    deployed:   { cls: 'bg-sky-900/80 text-sky-300 border-sky-500/40',                     label: '● LCS On Station' },
    launching:  { cls: 'bg-sky-900/80 text-sky-200 border-sky-400/40 animate-pulse',        label: '↓ Launching Layers' },
    collecting: { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40 animate-pulse',     label: '⇠ Streaming Sensor Data' },
    recovering: { cls: 'bg-sky-900/80 text-sky-300 border-sky-500/40',                      label: '↑ Recover & Cycle' },
    complete:   { cls: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40',          label: '✓ Assets Aboard — Picture Delivered' },
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
    if (phase === 'collecting') {
      map.flyTo(MAP_CENTER, MAP_ZOOM_IN, { duration: 1.5 });
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
const MDAMothershipMissionView = ({ mission, onBack }) => {
  const { saveMission, updateMission } = useMissionStore();
  const { setSelectedHull } = useOutfitterStore();
  const { startNewConfiguration, setPendingMissionSetKey, setPendingMissionSetCaps, setPendingRoleKey, setPendingVesselLabel, activeConfig } = useConfigurationStore();
  const { setSelectedView } = useNavigationStore();
  const roleAssignments = useMissionStore(s => s.roleAssignments);
  const savedConfigurations = useConfigurationStore(s => s.savedConfigurations);
  const [swapModal, setSwapModal] = useState(null);

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

  const phase   = getPhase(currentTick);
  const airPos  = getAssetPos(AIR_STATION, currentTick);
  const surfPos = getAssetPos(SURF_STATION, currentTick);
  const subPos  = getAssetPos(SUB_STATION, currentTick);

  const showAssets  = currentTick >= T_LAUNCH;
  const streaming   = currentTick >= T_ONSTATION && currentTick < T_RECOVER;
  const recovering  = currentTick >= T_RECOVER && currentTick < T_COMPLETE;

  const narrative = PHASE_NARRATIVE[phase] || null;
  const badge     = getPhaseBadge(phase);

  // Sensor-data packets streaming from an asset back to the LCS
  const dataDots = (from) => {
    if (!streaming) return [];
    const out = [];
    for (const off of [0, 0.34, 0.68]) {
      const f = (((currentTick / 7) + off) % 1);
      out.push(lerp2(from, LCS_POS, f));
    }
    return out;
  };

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
    if (phase === 'collecting') {
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
      const v0 = vesselLabelsRef.current[0] ?? 'LCS Mothership';
      const v1 = vesselLabelsRef.current[1] ?? 'MQ-8C Fire Scout';
      const v2 = vesselLabelsRef.current[2] ?? 'M48';
      const v3 = vesselLabelsRef.current[3] ?? 'Freedom AUV';
      setCurrentTick(tick);

      if (tick === T_DEPLOYED) {
        addEvtRef.current(`${v0}: On station — first island chain — TempestOS online`, 'info');
        addEvtRef.current(`${v0}: Launch/recovery node set — unmanned force ready`, 'info');
      }
      if (tick === T_LAUNCH) {
        addEvtRef.current(`${v1}: Off the deck — air layer over-the-horizon`, 'info');
        addEvtRef.current(`${v2}: Lowered into the water — surface net`, 'info');
        addEvtRef.current(`${v3}: Lowered into the water — subsurface layer`, 'info');
      }
      if (tick === T_ONSTATION) {
        addEvtRef.current('All layers on station — streaming sensor data to the LCS', 'info');
        addEvtRef.current(`${v0}: TempestOS fusing air/surface/subsurface feeds into one picture`, 'success');
      }
      if (tick === T_RECOVER) {
        addEvtRef.current(`${v0}: On-station time complete — recovering the force (LARS)`, 'info');
        addEvtRef.current(`${v2} ${v3}: Hoisted back aboard — Sea State 4 recovery`, 'info');
        addEvtRef.current(`${v1}: Recovering to the deck`, 'info');
      }
      if (tick === T_COMPLETE) {
        addEvtRef.current(`${v0}: All assets aboard — fused picture delivered`, 'success');
        addEvtRef.current('Swap the payload, not the platform — one squadron, one picture', 'success');
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
      template: 'MDA_MOTHERSHIP',
      domain: 'MARITIME',
      status: 'draft',
      duration: 'continuous',
      zoneConfig: {
        name: 'First Island Chain — MDA Mothership Operating Area',
        coordinates: [
          { lat: 19.8, lng: 120.8 }, { lat: 21.8, lng: 120.8 },
          { lat: 21.8, lng: 123.2 }, { lat: 19.8, lng: 123.2 },
        ],
        swarmSize: 4,
        swarmFormation: 'multi-domain-star',
      },
      assignedSquadrons: [],
      stateHierarchies: {
        default:       ['Payload', 'Mission', 'Comms', 'Navigation', 'Vehicle'],
        collecting:    ['Payload', 'Comms', 'Mission', 'Navigation', 'Vehicle'],
        recovery:      ['Navigation', 'Vehicle', 'Comms', 'Mission', 'Payload'],
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

  const LAYERS = [
    { pos: airPos,  color: '#a78bfa', label: 'Air' },
    { pos: surfPos, color: '#67e8f9', label: 'Surface' },
    { pos: subPos,  color: '#4ade80', label: 'Subsurface' },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col bg-darkest">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-700/50 flex-shrink-0 overflow-x-auto">
        <button onClick={onBack} className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-[0.75rem]">
          <ChevronLeft size={13} /> Back to Library
        </button>
        <div className="w-px h-4 bg-gray-700/60" />
        <Ship size={13} className="text-sky-400" />
        <span className="text-sky-400 text-[0.8rem] font-semibold tracking-wide">MDA Mothership — Mission 05</span>
        <span className="hidden md:inline text-gray-600 text-[0.7rem]">·</span>
        <span className="hidden md:inline text-gray-500 text-[0.68rem]">One LCS · Launch, Collect &amp; Recover a Multi-Domain Sensor Force</span>
        <div className="flex-1" />
        <span className="px-2 py-0.5 rounded-full bg-sky-900/50 text-sky-400 text-[0.65rem] font-bold uppercase tracking-wider border border-sky-500/30">DRAFT</span>
        <input
          value={missionName}
          onChange={e => setMissionName(e.target.value)}
          placeholder="Mission name…"
          className="hidden md:block bg-gray-800/60 border border-gray-700/60 rounded-md px-3 py-1.5 text-white text-[0.78rem] w-52 placeholder-gray-600 focus:outline-none focus:border-sky-500/50 transition-colors"
        />
        <button
          onClick={handleSave}
          disabled={!missionName.trim() || !isDeployable}
          className={`hidden md:block px-3 py-1.5 rounded-md text-[0.78rem] font-semibold transition-colors ${missionName.trim() && isDeployable ? 'bg-sky-600 hover:bg-sky-500 text-white' : 'bg-gray-700/50 text-gray-600 cursor-not-allowed'}`}
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

              {/* ── Mothership operating area ── */}
              {currentTick >= T_DEPLOYED && (
                <Circle
                  center={LCS_POS}
                  radius={OP_AREA_NM * NM_TO_M}
                  pathOptions={{ color: '#0ea5e9', weight: 1, fill: false, opacity: 0.08, dashArray: '8 10' }}
                />
              )}

              {/* ── Per-layer: launch/recovery tether, sensor-data stream, asset marker ── */}
              {showAssets && LAYERS.map((L, i) => (
                <React.Fragment key={`layer-${i}`}>
                  {/* tether / transit line LCS ↔ asset */}
                  <Polyline
                    positions={[LCS_POS, L.pos]}
                    pathOptions={{ color: L.color, weight: 1.2, opacity: recovering ? 0.55 : (streaming ? 0.35 : 0.25), dashArray: '3 7' }}
                  />
                  {/* sensor-data packets streaming asset → LCS */}
                  {dataDots(L.pos).map((d, j) => (
                    <CircleMarker
                      key={`dot-${i}-${j}`}
                      center={d}
                      radius={3}
                      pathOptions={{ color: L.color, fillColor: L.color, fillOpacity: 0.95, weight: 0 }}
                    />
                  ))}
                  {/* asset marker */}
                  <CircleMarker
                    center={L.pos}
                    radius={11}
                    pathOptions={{ color: L.color, fillColor: L.color, fillOpacity: 0.9, weight: 2 }}
                  >
                    <Tooltip direction="top" offset={[0, -8]}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: L.color }}>{`${L.label} layer`}</span>
                    </Tooltip>
                  </CircleMarker>
                </React.Fragment>
              ))}

              {/* ── LCS mothership (glows while receiving data) ── */}
              {currentTick >= T_DEPLOYED && (
                <CircleMarker
                  center={LCS_POS}
                  radius={streaming && pulse ? 17 : 14}
                  pathOptions={{ color: '#0ea5e9', fillColor: '#0369a1', fillOpacity: 0.95, weight: 3 }}
                >
                  <Tooltip direction="top" offset={[0, -10]}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8' }}>LCS Mothership</span>
                  </Tooltip>
                </CircleMarker>
              )}

            </MapContainer>

            {/* ── Corner feed: launch & recovery (LARS) ── */}
            {(() => {
              const W = 240, H = 160;
              const waterY = 128;
              const lcsImg = effectiveRoster[0]?.image;

              // USV animation: complete lowering very fast (by T_LAUNCH + 8 ticks), then drive away during collecting, return during recovery
              const usvLowerCompleteAt = T_LAUNCH + 4;
              const usvLowerProgress = currentTick < T_LAUNCH
                ? 0
                : currentTick < usvLowerCompleteAt
                  ? Math.min((currentTick - T_LAUNCH) / (usvLowerCompleteAt - T_LAUNCH), 1)
                  : 1;
              // Drive off immediately after lowering completes (30x speed), return during recovery (3x speed = 30x / 10)
              let usvDriveProgress = 0;
              let usvRaiseProgress = 0;
              if (currentTick > usvLowerCompleteAt) {
                if (phase === 'recovering') {
                  // Delay raising by 2 ticks, then raise over 12 ticks (showcase the davit tech)
                  const raiseDelay = 2;
                  const raiseDuration = 12;
                  usvRaiseProgress = currentTick < T_RECOVER + raiseDelay
                    ? 0
                    : Math.min(((currentTick - T_RECOVER - raiseDelay) / raiseDuration), 1);
                  usvDriveProgress = Math.max(1 - (usvRaiseProgress * 3), 0);
                } else {
                  usvDriveProgress = Math.min(((currentTick - usvLowerCompleteAt) / (T_RECOVER - usvLowerCompleteAt)) * 30, 1);
                }
              }
              const usvY = 95 + usvLowerProgress * (waterY - 95) - usvRaiseProgress * (waterY - 95);
              const usvX = 135 - usvDriveProgress * 150; // drives off to the right, returns from off-screen during recovery

              return (
                <div
                  className="absolute bottom-3 right-3 z-[500] pointer-events-none"
                  style={{ width: W, height: H, borderRadius: 12, overflow: 'hidden',
                    background: 'rgba(5,10,18,0.85)', border: '1px solid rgba(100,120,150,0.3)',
                    backdropFilter: 'blur(4px)' }}
                >
                  {/* LCS image filling the frame, cropped at edges */}
                  {lcsImg && (
                    <img
                      src={lcsImg} alt="LCS"
                      style={{ position: 'absolute', left: -1, top: -40,
                        width: 440, height: 240, objectFit: 'cover', opacity: 0.95 }}
                    />
                  )}

                  <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
                    {/* Water line and below */}
                    <line x1={0} y1={waterY} x2={W} y2={waterY} stroke="#164e63" strokeWidth={2} />
                    <rect x={0} y={waterY} width={W} height={H - waterY} fill="#0c2233" opacity={0.65} />

                    {/* USV (show throughout) */}
                    {(
                      <g transform={`translate(${usvX},${usvY})`}>
                        <path d="M -10 -3 L 10 -3 L 8 6 L -8 6 Z" fill="#67e8f9" opacity={0.96} />
                        <rect x={-4} y={-8} width={8} height={5} rx={1} fill="#67e8f9" opacity={0.96} />
                      </g>
                    )}

                    {/* Ripple where USV enters water */}
                    {usvY > waterY - 5 && usvY < waterY + 5 && (
                      <ellipse cx={usvX + 8} cy={waterY} rx={14} ry={3} fill="none" stroke="#38bdf8" strokeWidth={1} opacity={0.6} />
                    )}
                  </svg>
                </div>
              );
            })()}

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
                    { color: '#0ea5e9', label: `${effectiveRoster[0]?.name ?? 'LCS'} — Mothership` },
                    { color: '#a78bfa', label: `${effectiveRoster[1]?.name ?? 'MQ-8C'} — Air Layer` },
                    { color: '#67e8f9', label: `${effectiveRoster[2]?.name ?? 'M48'} — Surface Layer` },
                    { color: '#4ade80', label: `${effectiveRoster[3]?.name ?? 'Freedom AUV'} — Subsurface Layer` },
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
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[0.78rem] font-semibold transition-colors bg-sky-700 hover:bg-sky-600 text-white"
                  >
                    <Pause size={13} />
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={paused ? resume : runScenario}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[0.78rem] font-semibold transition-colors bg-sky-700 hover:bg-sky-600 text-white"
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
                  <div className="text-[0.68rem] font-bold text-sky-300 uppercase tracking-wider mb-1">
                    {narrative.title}
                  </div>
                  <div className="text-[0.67rem] text-gray-400 leading-relaxed">
                    {narrative.body}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-[0.68rem]">
                  1× LCS · MQ-8C · M48 · Freedom AUV
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
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-sky-700 hover:bg-sky-600 text-white text-sm font-semibold transition-colors"
            >
              <Pause size={15} />
              Pause
            </button>
          ) : (
            <button
              onClick={paused ? resume : runScenario}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-sky-700 hover:bg-sky-600 text-white text-sm font-semibold transition-colors"
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
                    className="ml-auto p-1 rounded text-gray-400 hover:text-sky-400 hover:bg-gray-700/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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

export default MDAMothershipMissionView;
