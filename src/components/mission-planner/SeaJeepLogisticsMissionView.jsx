// Real-world analogue: USMC ALPV (Autonomous Low-Profile Vessel) by Leidos
// First island chain transit: Sep 2025 (Okinawa → Ryukyu Islands, 3-day transit)
// 12th Littoral Logistics Battalion IOC: Resolute Dragon 2025
// Subic Bay warehouse leased by USMC: early 2026
// Pentagon sought ALPV expansion: March 2026

import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import {
  MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, ZoomControl, useMap
} from 'react-leaflet';
import { Play, Pause, RotateCcw, Package, ChevronLeft, Check, Settings, ArrowLeftRight } from 'lucide-react';
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

const MISSION_SET_KEY = 'SEAJEEP_LOGISTICS';
const MISSION_SET_CAPS = ['Sealed Dry Cargo Pod (~20kg)', 'GPS/INS + AIS Transponder', 'Iridium SATCOM', 'Solar Wing + Li-ion Battery Bank'];

// ─── Geography ────────────────────────────────────────────────────────────────
const MAP_CENTER = [17.5, 120.8];
const MAP_ZOOM = 6;
const SUBIC_BAY = [14.81, 120.27];
const ROUTE_WAYPOINTS = [
  [14.81, 120.27],  // Subic Bay (start)
  [14.40, 119.70],  // WP-ALPHA — exit WSW into South China Sea (clears Zambales coast)
  [16.50, 119.70],  // WP-BRAVO — north through SCS, clear of entire Luzon west coast
  [18.49, 120.56],  // WP-CHARLIE — Cape Bojeador (NW tip of Luzon)
  [19.80, 120.70],  // WP-DELTA — Luzon Strait (open water)
  [20.45, 121.97],  // Batanes (delivery) — ~390nm all-water
];
const DELIVERY_POINT = [20.45, 121.97];
const APARRI_PORT = [18.35, 121.64]; // Aparri Naval Station, N. Luzon
const RETURN_WAYPOINTS = [
  [20.45, 121.97],  // Batanes
  [19.30, 121.20],  // WP-ECHO — Babuyan Channel (west of Babuyan Islands)
  [18.35, 121.64],  // Aparri Naval Station (end-of-mission port) — ~130nm from Batanes
];
const MOC_POS = [14.59, 120.98]; // USMC Forward Command, Luzon

// Intermediate waypoint markers (indices 1-3 of ROUTE_WAYPOINTS)
const WP_MARKERS = [
  { pos: [14.40, 119.70], label: 'WP-ALPHA' },
  { pos: [16.50, 119.70], label: 'WP-BRAVO' },
  { pos: [18.49, 120.56], label: 'WP-CHARLIE' },
  { pos: [19.80, 120.70], label: 'WP-DELTA' },
];

// ─── Tick milestones ──────────────────────────────────────────────────────────
const T_CARGO_LOADING     =  5;
const T_OUTBOUND_TRANSIT  = 12;
const T_WAYPOINT_BRAVO    = 25;
const T_WAYPOINT_CHARLIE  = 38;
const T_WAYPOINT_DELTA    = 52;
const T_APPROACH_BATANES  = 65;
const T_DELIVERY          = 72;
const T_RETURN_TRANSIT    = 80;
const T_RETURN_WAYPOINT   = 92;
const T_ARRIVAL_APARRI     = 105;
const T_COMPLETE          = 115;
const TOTAL_TICKS         = 115;

// Phase names indexed by tick
const getPhase = (tick) => {
  if (tick < T_CARGO_LOADING)    return 'idle';
  if (tick < T_OUTBOUND_TRANSIT) return 'cargo_loading';
  if (tick < T_WAYPOINT_BRAVO)   return 'outbound_transit';
  if (tick < T_WAYPOINT_CHARLIE) return 'waypoint_bravo';
  if (tick < T_WAYPOINT_DELTA)   return 'waypoint_charlie';
  if (tick < T_APPROACH_BATANES) return 'waypoint_delta';
  if (tick < T_DELIVERY)         return 'approach_batanes';
  if (tick < T_RETURN_TRANSIT)   return 'delivery_confirmed';
  if (tick < T_RETURN_WAYPOINT)  return 'return_transit';
  if (tick < T_ARRIVAL_APARRI)    return 'return_waypoint';
  if (tick < T_COMPLETE)         return 'arrival_aparri';
  return 'mission_complete';
};

// Whether cargo is still aboard
const cargoAboard = (phase) =>
  ['cargo_loading', 'outbound_transit', 'waypoint_bravo', 'waypoint_charlie',
   'waypoint_delta', 'approach_batanes'].includes(phase);

// ─── Sea Jeep position helpers ────────────────────────────────────────────────
const lerp2    = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const trackPos = (track, t) => {
  const clamped  = Math.min(Math.max(t, 0), 0.9999);
  const progress = clamped * (track.length - 1);
  const idx      = Math.floor(progress);
  return lerp2(track[idx], track[idx + 1], progress - idx);
};

const getSeaJeepPos = (tick) => {
  // Stationary at Subic Bay before departure
  if (tick < T_OUTBOUND_TRANSIT) return SUBIC_BAY;
  // Outbound — arrives at Batanes by T_DELIVERY
  if (tick < T_DELIVERY) {
    const t = (tick - T_OUTBOUND_TRANSIT) / (T_DELIVERY - T_OUTBOUND_TRANSIT);
    return trackPos(ROUTE_WAYPOINTS, t);
  }
  // Stationary at delivery point during delivery/return_transit startup
  if (tick < T_RETURN_TRANSIT) return DELIVERY_POINT;
  // Return transit — to Aparri by T_ARRIVAL_APARRI
  if (tick < T_ARRIVAL_APARRI) {
    const t = (tick - T_RETURN_TRANSIT) / (T_ARRIVAL_APARRI - T_RETURN_TRANSIT);
    return trackPos(RETURN_WAYPOINTS, t);
  }
  return APARRI_PORT;
};

// Build the completed outbound trail (positions from departure up to current)
const getOutboundTrail = (tick) => {
  if (tick < T_OUTBOUND_TRANSIT) return null;
  if (tick >= T_DELIVERY)        return ROUTE_WAYPOINTS;
  const t = (tick - T_OUTBOUND_TRANSIT) / (T_DELIVERY - T_OUTBOUND_TRANSIT);
  const current = trackPos(ROUTE_WAYPOINTS, t);
  // Collect full waypoints passed so far, then add current position
  const clamped  = Math.min(Math.max(t, 0), 0.9999);
  const progress = clamped * (ROUTE_WAYPOINTS.length - 1);
  const idx      = Math.floor(progress);
  return [...ROUTE_WAYPOINTS.slice(0, idx + 1), current];
};

const getReturnTrail = (tick) => {
  if (tick < T_RETURN_TRANSIT) return null;
  if (tick >= T_ARRIVAL_APARRI) return RETURN_WAYPOINTS;
  const t = (tick - T_RETURN_TRANSIT) / (T_ARRIVAL_APARRI - T_RETURN_TRANSIT);
  const current = trackPos(RETURN_WAYPOINTS, t);
  const clamped  = Math.min(Math.max(t, 0), 0.9999);
  const progress = clamped * (RETURN_WAYPOINTS.length - 1);
  const idx      = Math.floor(progress);
  return [...RETURN_WAYPOINTS.slice(0, idx + 1), current];
};

// ─── Phase badge ──────────────────────────────────────────────────────────────
const getPhaseBadge = (phase) => {
  const m = {
    idle:              null,
    cargo_loading:     { cls: 'bg-gray-800/80 text-gray-300 border-gray-600/40',                      label: '⬛ Cargo Loading — Subic Bay' },
    outbound_transit:  { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40',                      label: '→ Outbound Transit — 380nm to Batanes' },
    waypoint_bravo:    { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40',                      label: '◉ Waypoint BRAVO — North Luzon Coast' },
    waypoint_charlie:  { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40',                      label: '◉ Waypoint CHARLIE — Open Water' },
    waypoint_delta:    { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40',                      label: '◉ Waypoint DELTA — 28nm to Delivery' },
    approach_batanes:  { cls: 'bg-cyan-900/80 text-cyan-200 border-cyan-400/50 animate-pulse',        label: '→ Approach — Batan Island in Sight' },
    delivery_confirmed:{ cls: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40 animate-pulse',label: '✓ DELIVERY CONFIRMED — Cargo Released' },
    return_transit:    { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40',                      label: '← Recovery Transit — 130nm to Aparri' },
    return_waypoint:   { cls: 'bg-cyan-900/80 text-cyan-300 border-cyan-500/40',                      label: '← Recovery — Babuyan Channel' },
    arrival_aparri:    { cls: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40',             label: '✓ Arrived Aparri Naval Station' },
    mission_complete:  { cls: 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40',             label: '✓ Mission Complete — WHISKEY-3 Cycle Logged' },
  };
  return m[phase] || null;
};

// ─── Phase narratives ─────────────────────────────────────────────────────────
const PHASE_NARRATIVE = {
  idle:              null,
  cargo_loading:     { title: 'Cargo Loading — Subic Bay', body: 'Sea Jeep cargo pod loaded with 18.5kg critical resupply: batteries, Iridium handset, 7-day rations, medical kit. AIS transponder broadcasting for commercial de-confliction. Pre-departure system check complete.' },
  outbound_transit:  { title: 'Outbound Transit — Route WHISKEY-3', body: 'Sea Jeep autonomous transit initiated. 380nm to Batanes forward observation post. Solar wing at 4.8 knots — zero fuel cost. AIS active. MOC Luzon tracking via Iridium position reports.' },
  waypoint_bravo:    { title: 'WP-BRAVO — North Luzon Coast', body: 'Waypoint BRAVO confirmed on track. Coastal transit complete — entering open water leg. Solar charging nominal. No commercial traffic conflicts detected by AIS.' },
  waypoint_charlie:  { title: 'WP-CHARLIE — Open Water', body: 'Open water transit underway at 4.8 knots on solar/wind. Li-ion bank at 87% — well within mission margin. Next waypoint: DELTA, 28nm before Batanes.' },
  waypoint_delta:    { title: 'WP-DELTA — Batanes Approach', body: 'Waypoint DELTA — 28nm to delivery point. MOC Luzon alerting Batanes observation post. Forward post personnel moving to receive position. ETA 6 hours.' },
  approach_batanes:  { title: 'Approach — Batan Island', body: 'Batanes Island confirmed in sensor range. Sea Jeep reducing speed for final approach. Cargo pod sealed and delivery-ready. Post acknowledged receipt of ETA notification.' },
  delivery_confirmed:{ title: 'Delivery Confirmed', body: 'Cargo pod released — all 18.5kg intact. Batanes observation post confirms receipt: batteries, Iridium handset, 7-day rations, medical kit. MOC Luzon logs WHISKEY-3 complete.' },
  return_transit:    { title: 'Recovery Transit — Aparri Naval Station', body: 'Sea Jeep initiating recovery transit. 130nm south to Aparri Naval Station via Babuyan Channel. Solar recharging en route. AIS active throughout.' },
  return_waypoint:   { title: 'Recovery — Babuyan Channel', body: 'Transiting Babuyan Channel westbound — clear of Babuyan Islands. Solar recharging nominal. Li-ion bank rebuilding. ETA Aparri Naval Station: 26 hours. Cargo pod empty.' },
  arrival_aparri:    { title: 'Arrived Aparri Naval Station', body: 'Sea Jeep docked at Aparri Naval Station, N. Luzon. Mission complete. Cargo pod empty and ready for reload. Total mission: Subic→Batanes→Aparri, ~520nm. Zero crew, zero fuel cost. Platform ready for immediate re-tasking.' },
  mission_complete:  { title: 'WHISKEY-3 Complete', body: '18.5kg delivered to Batanes forward post. Sea Jeep recovered at Aparri Naval Station — 130nm vs. 390nm if returning to Subic. ~520nm total mission. Zero crew exposure. Zero fuel cost. Solar/wind validated for first island chain logistics.' },
};

// ─── Workflow steps ───────────────────────────────────────────────────────────
const WORKFLOW_STEPS = [
  { key: 'loading',  label: 'Cargo Loading',     activePhases: ['cargo_loading'] },
  { key: 'outbound', label: 'Outbound Transit',   activePhases: ['outbound_transit', 'waypoint_bravo', 'waypoint_charlie', 'waypoint_delta', 'approach_batanes'] },
  { key: 'delivery', label: 'Delivery',           activePhases: ['delivery_confirmed'] },
  { key: 'return',   label: 'Recovery Transit',   activePhases: ['return_transit', 'return_waypoint', 'arrival_aparri'] },
  { key: 'complete', label: 'Mission Complete',   activePhases: ['mission_complete'] },
];

// ─── Loadout (Sea Jeep Logistics) ─────────────────────────────────────────────
const SEA_JEEP_LOGISTICS_MOUNTS = [
  { slot: 'CARGO', name: 'Sealed Dry Cargo Pod (~20kg)', vendor: '—', checked: true, description: 'Watertight cargo pod — batteries, comms gear, rations, medical supplies for forward post' },
  { slot: 'NAV',   name: 'GPS/INS + AIS Transponder',   vendor: '—', checked: true, description: 'Full route navigation + AIS broadcast for de-confliction with commercial shipping' },
  { slot: 'COMMS', name: 'Iridium SATCOM',               vendor: 'Iridium',     checked: true, description: 'Position reporting to MOC and delivery confirmation at post' },
  { slot: 'POWER', name: 'Solar Wing + Li-ion Battery Bank', vendor: 'Ocean Aero', checked: true, description: '30+ day endurance — ~520nm total on solar/wind, no fuel' },
  { slot: 'MAST',  name: 'Low-Profile Logistics Mast (no sensors)', vendor: 'GP-USV', checked: true, description: 'Reduced height for lower windage and drag — optimized for long transit efficiency' },
];

// ─── Vessel roster ────────────────────────────────────────────────────────────
const VESSEL_ROSTER = [
  {
    name: 'SEA-JEEP-LOG-1',
    roleDescriptor: '(Logistics)',
    image: imgSeaJeep,
    hullName: 'GP-USV Sea Jeep',
    roleKey: 'SJL_SEAJEEP_1',
    capabilities: ['Sealed Dry Cargo Pod (~20kg)', 'GPS/INS + AIS Transponder', 'Iridium SATCOM', 'Solar Wing + Li-ion Battery Bank'],
  },
];

// ─── Colors ───────────────────────────────────────────────────────────────────
const EVENT_COLORS = {
  warn:    'text-amber-400',
  alert:   'text-red-400',
  info:    'text-cyan-400',
  success: 'text-emerald-400',
};

// ─── Tile layers ──────────────────────────────────────────────────────────────
const TILE_BASE    = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const TILE_SEAMARK = 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png';

// ─── Map resize helper ────────────────────────────────────────────────────────
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
const SeaJeepLogisticsMissionView = ({ mission, onBack }) => {
  const { saveMission, updateMission } = useMissionStore();
  const { setSelectedHull }            = useOutfitterStore();
  const { startNewConfiguration, setPendingMissionSetKey, setPendingMissionSetCaps, setPendingRoleKey, setPendingVesselLabel, activeConfig } = useConfigurationStore();
  const { setSelectedView }            = useNavigationStore();
  const roleAssignments                = useMissionStore(s => s.roleAssignments);
  const savedConfigurations = useConfigurationStore(s => s.savedConfigurations);
  const [swapModal, setSwapModal] = useState(null); // { roleKey: string } | null
  const [showLog, setShowLog] = useState(false);

  // Build effective roster — override default slots with assigned vessels
  const missionRoleDefs = MISSION_ROLES[MISSION_SET_KEY]?.roles ?? [];
  const effectiveRoster = VESSEL_ROSTER.map((vessel, idx) => {
    const roleDef    = missionRoleDefs[idx];
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
      name:         vessel.roleDescriptor ? `${assignment.hullName} ${vessel.roleDescriptor}` : (assignment.vesselLabel || assignment.hullName),
      hullName:     assignment.hullName,
      capabilities,
      image:        HULL_IMAGES[assignment.hullName] || vessel.image,
    };
  });

  const readiness = getMissionReadiness(MISSION_SET_KEY, roleAssignments, savedConfigurations);
  const isDeployable = readiness.deployable;

  // ── State ────────────────────────────────────────────────────────────────
  const [missionName, setMissionName] = useState(mission?.name || '');
  const [currentTick, setCurrentTick] = useState(0);
  const [pulseTick,   setPulseTick]   = useState(false);
  const [deliveryFlash, setDeliveryFlash] = useState(false); // yellow cargo dot at delivery point
  const [events,      setEvents]      = useState([]);
  const [running,     setRunning]     = useState(false);
  const [paused,      setPaused]      = useState(false);
  const [complete,    setComplete]    = useState(false);

  const tickRef          = useRef(0);
  const tickCallbackRef  = useRef(null);
  const mainTimer        = useRef(null);
  const pulseTimer       = useRef(null);
  const loopTimer        = useRef(null);
  const addEvtRef        = useRef(null);
  const vesselLabelsRef  = useRef([]);
  const runScenarioRef   = useRef(null);

  // Derived from tick
  const phase     = getPhase(currentTick);
  const seaJeepPos = getSeaJeepPos(currentTick);
  const outboundTrail = getOutboundTrail(currentTick);
  const returnTrail   = getReturnTrail(currentTick);
  const badge     = getPhaseBadge(phase);
  const narrative = PHASE_NARRATIVE[phase] || null;
  const hasCargo  = cargoAboard(phase);
  const isDelivered = ['delivery_confirmed', 'return_transit', 'return_waypoint',
                        'arrival_subic', 'mission_complete'].includes(phase);
  const batanesPulsing = phase === 'delivery_confirmed';

  const activeWorkflowStep = WORKFLOW_STEPS.find(s => s.activePhases.includes(phase));

  // ── Event logger ──────────────────────────────────────────────────────────
  const _addEvent = (msg, type = 'info') => {
    const ts = new Date().toLocaleTimeString('en-US', {
      hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    setEvents(prev => [{ ts, msg, type, id: `${ts}-${msg.slice(0, 12)}` }, ...prev].slice(0, 30));
  };

  useLayoutEffect(() => { addEvtRef.current = _addEvent; });
  useLayoutEffect(() => { vesselLabelsRef.current = effectiveRoster.map(v => v.name); });

  // ── Pulse timer (gentle, delivery/approach phases) ────────────────────────
  useEffect(() => {
    clearInterval(pulseTimer.current);
    if (['approach_batanes', 'delivery_confirmed', 'arrival_subic', 'mission_complete'].includes(phase)) {
      pulseTimer.current = setInterval(() => setPulseTick(p => !p), 500);
      return () => clearInterval(pulseTimer.current);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset of timer-driven pulse state when the animated phase set is exited; cannot be derived during render
    setPulseTick(false);
  }, [phase]);

  // ── Pause / Resume ────────────────────────────────────────────────────────
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
    mainTimer.current = setInterval(tickCallbackRef.current, 180);
  }, []);

  // ── Stop all timers ───────────────────────────────────────────────────────
  const stopAll = useCallback(() => {
    clearInterval(mainTimer.current);
    clearInterval(pulseTimer.current);
    clearTimeout(loopTimer.current);
    mainTimer.current = pulseTimer.current = loopTimer.current = null;
  }, []);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    stopAll();
    tickRef.current = 0;
    setPaused(false);
    setCurrentTick(0);
    setPulseTick(false);
    setDeliveryFlash(false);
    setEvents([]);
    setRunning(false);
    setComplete(false);
  }, [stopAll]);

  // ── Run scenario ──────────────────────────────────────────────────────────
  const runScenario = useCallback(() => {
    stopAll();
    tickRef.current = 0;
    setCurrentTick(0);
    setPulseTick(false);
    setDeliveryFlash(false);
    setEvents([]);
    setRunning(true);
    setPaused(false);
    setComplete(false);

    const cb = () => {
      const tick = ++tickRef.current;
      const v0 = vesselLabelsRef.current[0] ?? 'SEA-JEEP-LOG-1';
      setCurrentTick(tick);

      if (tick === T_CARGO_LOADING) {
        addEvtRef.current(`${v0}: Cargo pod loaded — Subic Bay — 18.5kg critical supplies`, 'info');
        addEvtRef.current(`${v0}: Contents: batteries, Iridium handset, rations (7-day), medical kit`, 'info');
      }
      if (tick === T_OUTBOUND_TRANSIT) {
        addEvtRef.current(`${v0}: Departing Subic Bay — autonomous transit initiated`, 'info');
        addEvtRef.current('MOC LUZON: Resupply route WHISKEY-3 authorized — 380nm to Batanes', 'info');
      }
      if (tick === T_WAYPOINT_BRAVO) {
        addEvtRef.current(`${v0}: Waypoint BRAVO — North Luzon coast, on track`, 'info');
      }
      if (tick === T_WAYPOINT_CHARLIE) {
        addEvtRef.current(`${v0}: Waypoint CHARLIE — open water transit, solar charging 4.8kts`, 'info');
      }
      if (tick === T_WAYPOINT_DELTA) {
        addEvtRef.current(`${v0}: Waypoint DELTA — Batanes approach, 28nm to delivery`, 'info');
        addEvtRef.current('MOC LUZON: Sea Jeep on track — alerting forward post, ETA 6 hours', 'info');
      }
      if (tick === T_APPROACH_BATANES) {
        addEvtRef.current(`${v0}: Batan Island — delivery point in sight`, 'info');
      }
      if (tick === T_DELIVERY) {
        addEvtRef.current(`${v0}: DELIVERY CONFIRMED — cargo pod released, post acknowledged`, 'success');
        addEvtRef.current('BATANES OBS POST: Resupply received — 18.5kg, all items intact', 'success');
        addEvtRef.current('MOC LUZON: Mission success — WHISKEY-3 resupply complete', 'success');
        // Brief flash of yellow cargo dot at delivery point
        setDeliveryFlash(true);
        setTimeout(() => setDeliveryFlash(false), 2000);
      }
      if (tick === T_RETURN_TRANSIT) {
        addEvtRef.current(`${v0}: Initiating recovery transit — Aparri Naval Station, 130nm`, 'info');
      }
      if (tick === T_RETURN_WAYPOINT) {
        addEvtRef.current(`${v0}: Transiting Babuyan Channel — Aparri approach, 65nm`, 'info');
      }
      if (tick === T_ARRIVAL_APARRI) {
        addEvtRef.current(`${v0}: Arrived Aparri Naval Station — recovery complete, ready for reload`, 'success');
        addEvtRef.current('MOC LUZON: WHISKEY-3 complete — Subic→Batanes→Aparri, ~520nm, zero crew, zero fuel cost', 'success');
      }
      if (tick >= TOTAL_TICKS) {
        clearInterval(mainTimer.current);
        mainTimer.current = null;
        setRunning(false);
        setComplete(true);
        loopTimer.current = setTimeout(() => {
          if (loopTimer.current !== null) runScenarioRef.current?.();
        }, 5000);
      }
    };

    tickCallbackRef.current = cb;
    mainTimer.current = setInterval(cb, 180);
  }, [stopAll]);

  useLayoutEffect(() => { runScenarioRef.current = runScenario; });
  useEffect(() => () => stopAll(), [stopAll]);

  // ── Configure vessel handler ───────────────────────────────────────────────
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
    else setPendingRoleKey(null);
    setPendingVesselLabel(vessel.name);
    setSelectedView('outfitter');
  };

  // ── Save handler ───────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!missionName.trim()) return;
    const data = {
      name: missionName.trim(),
      template: 'SEAJEEP_LOGISTICS',
      domain: 'MARITIME',
      status: 'active',
      duration: '30d',
      zoneConfig: {
        name: 'Batanes Resupply — Route WHISKEY-3',
        waypoints: ROUTE_WAYPOINTS.map((pos, i) => ({
          lat: pos[0], lng: pos[1],
          label: ['SUBIC-BAY', 'WP-BRAVO', 'WP-CHARLIE', 'WP-DELTA', 'BATANES-OBS'][i],
        })),
      },
      assignedSquadrons: [],
      missionProfile: {
        type: 'SEAJEEP_LOGISTICS',
        lane: 'ISLAND_CHAIN_RESUPPLY',
        platform: 'GP-USV Sea Jeep — Logistics Config (No RADAR/PTZ)',
        cargoWeight_kg: 18.5,
        totalNm: 520,
        cycleTimeHours: 29,
        crewExposure: 0,
        fuelCost: 0,
        propulsion: 'Solar/Wind',
      },
      stateHierarchies: {
        default:          ['Navigation', 'Payload', 'Comms', 'Vehicle', 'Mission'],
        cargo_loaded:     ['Payload', 'Navigation', 'Comms', 'Vehicle', 'Mission'],
        delivery:         ['Mission', 'Payload', 'Navigation', 'Comms', 'Vehicle'],
        return_transit:   ['Navigation', 'Vehicle', 'Comms', 'Mission', 'Payload'],
      },
      createdAt:  new Date().toISOString(),
      updatedAt:  new Date().toISOString(),
      launchedAt: new Date().toISOString(),
      history: [{ action: 'created', timestamp: new Date().toISOString(), details: 'Batanes Resupply — Philippine Island Chain' }],
    };
    if (mission?.id) updateMission(mission.id, data);
    else saveMission(data);
    onBack();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
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
        <Package size={13} className="text-cyan-400" />
        <span className="text-cyan-400 text-[0.8rem] font-semibold tracking-wide">Batanes Resupply — Philippine Island Chain</span>
        <span className="hidden md:inline text-gray-600 text-[0.7rem]">·</span>
        <span className="hidden md:inline text-gray-500 text-[0.68rem]">Autonomous logistics delivery — forward observation post resupply</span>
        <div className="flex-1" />
        <span className="px-2 py-0.5 rounded-full bg-cyan-900/50 text-cyan-400 text-[0.65rem] font-bold uppercase tracking-wider border border-cyan-500/30">
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
              ? 'bg-cyan-700 hover:bg-cyan-600 text-white'
              : 'bg-gray-700/50 text-gray-600 cursor-not-allowed'
          }`}
        >
          Save Draft
        </button>
      </div>

      {/* ── Workflow Steps ── */}
      <div className="flex items-center gap-0 px-4 py-2 border-b border-gray-700/40 flex-shrink-0 bg-darkest">
        {WORKFLOW_STEPS.map((step, i) => {
          const isActive = activeWorkflowStep?.key === step.key;
          const isDone   = WORKFLOW_STEPS.findIndex(s => s.key === activeWorkflowStep?.key) > i;
          return (
            <React.Fragment key={step.key}>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[0.62rem] font-semibold uppercase tracking-wide transition-colors ${
                isActive ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-500/40' :
                isDone   ? 'text-emerald-400/70' :
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
              center={MAP_CENTER}
              zoom={MAP_ZOOM}
              style={{ width: '100%', height: '100%' }}
              zoomControl={false}
              scrollWheelZoom={false}
              attributionControl={false}
            >
              <ZoomControl position="topright" />
              <TileLayer url={TILE_BASE} />
              <TileLayer url={TILE_SEAMARK} opacity={0.5} />
              <MapInvalidateSize />

              {/* ── Full route guide (dashed cyan, always visible) ── */}
              <Polyline
                positions={ROUTE_WAYPOINTS}
                pathOptions={{ color: '#06b6d4', opacity: 0.20, weight: 1.5, dashArray: '5 8' }}
              />

              {/* ── Completed outbound track (solid cyan trail) ── */}
              {outboundTrail && outboundTrail.length >= 2 && (
                <Polyline
                  positions={outboundTrail}
                  pathOptions={{ color: '#06b6d4', opacity: 0.70, weight: 2 }}
                />
              )}

              {/* ── Return track (slightly offset, solid cyan) ── */}
              {returnTrail && returnTrail.length >= 2 && (
                <Polyline
                  positions={returnTrail}
                  pathOptions={{ color: '#06b6d4', opacity: 0.55, weight: 2, dashArray: '6 4' }}
                />
              )}

              {/* ── Intermediate waypoint dots ── */}
              {WP_MARKERS.map(wp => (
                <CircleMarker
                  key={wp.label}
                  center={wp.pos}
                  radius={3}
                  pathOptions={{ color: '#06b6d4', fillColor: '#06b6d4', fillOpacity: 0.7, weight: 1 }}
                >
                  <Tooltip direction="right" offset={[6, 0]}>
                    <span style={{ fontSize: 10, color: '#67e8f9' }}>{wp.label}</span>
                  </Tooltip>
                </CircleMarker>
              ))}

              {/* ── MOC Luzon marker ── */}
              <CircleMarker
                center={MOC_POS}
                radius={5}
                pathOptions={{ color: '#6b7280', fillColor: '#374151', fillOpacity: 0.9, weight: 1.5 }}
              >
                <Tooltip direction="left" offset={[-8, 0]}>
                  <span style={{ fontSize: 10, color: '#9ca3af' }}>USMC Forward Command — Luzon</span>
                </Tooltip>
              </CircleMarker>

              {/* ── Subic Bay marker ── */}
              <CircleMarker
                center={SUBIC_BAY}
                radius={6}
                pathOptions={{ color: '#6b7280', fillColor: '#374151', fillOpacity: 0.9, weight: 1.5 }}
              >
                <Tooltip direction="right" offset={[10, 0]}>
                  <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>Subic Bay — Departure</span>
                </Tooltip>
              </CircleMarker>

              {/* ── Delivery point — grey until delivered, then green pulsing ── */}
              <CircleMarker
                center={DELIVERY_POINT}
                radius={batanesPulsing ? (pulseTick ? 10 : 7) : 7}
                pathOptions={{
                  color:       isDelivered ? '#10b981' : '#6b7280',
                  fillColor:   isDelivered ? '#052e16' : '#374151',
                  fillOpacity: 0.9,
                  weight:      isDelivered ? 2 : 1.5,
                }}
              >
                <Tooltip direction="top" offset={[0, -12]}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: isDelivered ? '#34d399' : '#9ca3af' }}>
                    {isDelivered ? '✓ USMC Forward Post — Batanes' : 'USMC Forward Post — Batanes'}
                  </span>
                </Tooltip>
              </CircleMarker>

              {/* ── Aparri Naval Station (end port) ── */}
              <CircleMarker
                center={APARRI_PORT}
                radius={6}
                pathOptions={{ color: '#8b5cf6', fillColor: '#2e1065', fillOpacity: 0.9, weight: 1.5 }}
              >
                <Tooltip direction="right" offset={[10, 0]}>
                  <span style={{ fontSize: 10, color: '#c4b5fd', fontWeight: 600 }}>Aparri Naval Station — Recovery Port</span>
                </Tooltip>
              </CircleMarker>

              {/* ── Delivery flash — yellow cargo dot briefly at delivery point ── */}
              {deliveryFlash && (
                <CircleMarker
                  center={DELIVERY_POINT}
                  radius={6}
                  pathOptions={{ color: '#eab308', fillColor: '#eab308', fillOpacity: 0.85, weight: 2 }}
                >
                  <Tooltip direction="bottom" offset={[0, 10]}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#fde047' }}>⬇ CARGO RELEASED</span>
                  </Tooltip>
                </CircleMarker>
              )}

              {/* ── Sea Jeep marker ── */}
              {phase !== 'idle' && seaJeepPos && (
                <CircleMarker
                  center={seaJeepPos}
                  radius={7}
                  pathOptions={{ color: '#06b6d4', fillColor: '#06b6d4', fillOpacity: 0.9, weight: 2 }}
                >
                  <Tooltip direction="top" offset={[0, -12]}>
                    <span style={{ fontSize: 10, color: '#67e8f9', fontWeight: 700 }}>
                      SEA-JEEP-LOG-1{hasCargo ? ' · CARGO' : ''}
                    </span>
                  </Tooltip>
                </CircleMarker>
              )}

              {/* ── Cargo pod indicator — small yellow dot offset from Sea Jeep while loaded ── */}
              {phase !== 'idle' && seaJeepPos && hasCargo && (
                <CircleMarker
                  center={[seaJeepPos[0] + 0.04, seaJeepPos[1] + 0.04]}
                  radius={4}
                  pathOptions={{ color: '#eab308', fillColor: '#eab308', fillOpacity: 0.9, weight: 1 }}
                >
                  <Tooltip direction="top" offset={[0, -8]}>
                    <span style={{ fontSize: 9, color: '#fde047' }}>18.5kg cargo pod</span>
                  </Tooltip>
                </CircleMarker>
              )}

            </MapContainer>

            {/* ── Phase status badge ── */}
            {badge && (
              <div className={`absolute top-3 left-3 z-[500] px-3 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wider pointer-events-none border ${badge.cls}`}>
                {badge.label}
              </div>
            )}

            {/* ── Map legend ── */}
            <div className="hidden md:block absolute bottom-3 left-3 z-[500] pointer-events-none px-3 py-2 rounded-xl bg-gray-950/80 border border-gray-700/50 backdrop-blur-sm">
              <div className="flex flex-col gap-1">
                {[
                  { color: '#06b6d4', label: 'GP-USV Sea Jeep — Logistics Config' },
                  { color: '#eab308', label: 'Cargo Pod (18.5kg — loaded)' },
                  { color: '#6b7280', label: 'Subic Bay — Departure' },
                  { color: '#8b5cf6', label: 'Aparri Naval Station — Recovery Port' },
                  { color: '#10b981', label: 'USMC Forward Post — Batanes' },
                  { color: '#6b7280', label: 'MOC Luzon — USMC Fwd Command' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: '#9ca3af' }}>{label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 mt-0.5">
                  <div style={{ width: 16, height: 2, background: 'repeating-linear-gradient(90deg, #06b6d4 0 5px, transparent 5px 10px)', flexShrink: 0 }} />
                  <span style={{ fontSize: 10, color: '#9ca3af' }}>Route WHISKEY-3 (guide)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div style={{ width: 16, height: 2, background: '#06b6d4', flexShrink: 0 }} />
                  <span style={{ fontSize: 10, color: '#9ca3af' }}>Completed track</span>
                </div>
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
                <p className="text-gray-600 text-[0.68rem]">GP-USV Sea Jeep — Logistics Config · Route WHISKEY-3 · 296nm round trip</p>
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
        </div>{/* /map+sidebar row */}

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
                <div className="text-[0.58rem] text-gray-600 mb-0.5">Ocean Aero Triton placeholder</div>
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
                {missionRoleDefs[idx]?.cargoRole && (
                  <div className="mt-1 px-2 py-1.5 rounded bg-amber-900/20 border border-amber-500/30 text-[0.6rem] text-amber-400 leading-snug">
                    ⚠ Cargo role — verify your hull has sufficient payload capacity for your intended cargo.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Mission Description ── */}
        <div className="px-4 pb-5 border-t border-gray-700/50">
          <div className="mt-3 px-4 py-3 rounded-xl bg-gray-800/60 border border-gray-700/40">
            <div className="text-[0.65rem] font-bold text-purple-400 uppercase tracking-widest mb-1.5">Mission Brief</div>
            <p className="text-[0.75rem] text-gray-300 leading-relaxed">
              A USMC observation post on Batanes needs resupply: batteries, comms gear, rations, medical supplies. The Sea Jeep loads a sealed cargo pod at Subic Bay, transits 390nm up the west coast of Luzon and through the Luzon Strait, drops the cargo, and recovers at Aparri. No crew, no fuel bill, no helicopter request that tips off adversaries. The same logic that gave the military the Jeep, just unmanned and on water.
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

export default SeaJeepLogisticsMissionView;
