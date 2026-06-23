import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import {
  MapContainer, TileLayer, CircleMarker, Circle, Polyline, Tooltip, ZoomControl, useMap
} from 'react-leaflet';
import { Play, Pause, RotateCcw, ChevronLeft, Check, Zap, Settings } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import useMissionStore from '../../store/missionStore';
import useOutfitterStore from '../../store/outfitterStore';
import useConfigurationStore from '../../store/configurationStore';
import useNavigationStore from '../../store/navigationStore';
import { vesselHullData } from '../../data/vesselData';
import { MISSION_ROLES } from '../../data/missionRoles';
import imgM48 from '../../assets/images/M48.png';
import imgSaildrone from '../../assets/images/SaildroneUSV.png';
import imgMQ4CTriton from '../../assets/images/MQ4C Triton.png';

const MISSION_SET_KEY = 'KINETIC_EFFECTS';
const MISSION_SET_CAPS = ['Mk 70 Payload Delivery System', 'SeaFIND Inertial Navigation', 'BDA Assessment'];

// ─── Geography ────────────────────────────────────────────────────────────────
const NM_TO_M = 1852;
const MAP_CENTER       = [21.1, 118.8];
const MAP_ZOOM         = 7;

const M70_ALPHA_STAGE   = [21.60, 120.70];
const M70_BRAVO_STAGE   = [21.45, 120.80];
const M70_CHARLIE_STAGE = [21.30, 120.65];
const SPECTRE_POS       = [21.05, 117.55];  // ~25nm NNE of ECHO-4 — BDA standoff
const M70_ALPHA_FIRE    = [21.40, 119.60];
const M70_BRAVO_FIRE    = [21.20, 119.50];
const M70_CHARLIE_FIRE  = [21.00, 119.65];
const TARGET_POS        = [20.80, 117.30];
const TRITON_CENTER     = [21.15, 117.80];  // center of ISR orbit overhead ECHO-4

// ─── Tick milestones ──────────────────────────────────────────────────────────
const T_STAGED        =  6;
const T_ISR_CUE       = 16;
const T_TASKING       = 26;
const T_EMCON_START   = 34;
const T_FIRE_POS      = 60;
const T_AUTH_REQUEST  = 68;
const T_WEAPONS_FREE  = 80;
const T_LAUNCH        = 88;
const T_MISSILES_FLY  = 90;
const T_IMPACT        = 115;
const T_BDA           = 126;
const TOTAL_TICKS     = 142;
const TICK_MS         = 260;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const getPhase = (tick) => {
  if (tick < T_STAGED)       return 'idle';
  if (tick < T_ISR_CUE)      return 'staged';
  if (tick < T_TASKING)      return 'isr_cue';
  if (tick < T_EMCON_START)  return 'tasking';
  if (tick < T_FIRE_POS)     return 'emcon_transit';
  if (tick < T_AUTH_REQUEST) return 'fire_pos';
  if (tick < T_WEAPONS_FREE) return 'auth_request';
  if (tick < T_LAUNCH)       return 'weapons_free';
  if (tick < T_MISSILES_FLY) return 'launch';
  if (tick < T_IMPACT)       return 'missiles_fly';
  if (tick < T_BDA)          return 'impact';
  return 'bda';
};

const getUSVPos = (tick, stage, fire) => {
  if (tick < T_EMCON_START) return stage;
  if (tick >= T_FIRE_POS)   return fire;
  const t = clamp((tick - T_EMCON_START) / (T_FIRE_POS - T_EMCON_START), 0, 1);
  return lerp2(stage, fire, t);
};

const getMissilePos = (tick, firePos) => {
  if (tick < T_MISSILES_FLY || tick >= T_IMPACT) return null;
  const t = clamp((tick - T_MISSILES_FLY) / (T_IMPACT - T_MISSILES_FLY), 0, 1);
  return lerp2(firePos, TARGET_POS, t);
};

const getBoomRadius  = (tick) => tick < T_IMPACT || tick >= T_IMPACT + 16 ? 0 : clamp((tick - T_IMPACT) / 16, 0, 1) * 35 * NM_TO_M;
const getBoomOpacity = (tick) => tick < T_IMPACT || tick >= T_IMPACT + 16 ? 0 : Math.max(0, 0.85 - (tick - T_IMPACT) * 0.06);

// ─── Phase narrative ──────────────────────────────────────────────────────────
const PHASE_NARRATIVE = {
  idle:          { title: 'Awaiting scenario start', body: 'Press Run to begin Operation IRON REEF — long-range surface strike, South China Sea.' },
  staged:        { title: 'Strike package on station', body: 'Three M48 USVs holding in Luzon Strait. Saildrone Spectre screening ahead. All emitters off — EMCON White.' },
  isr_cue:       { title: 'Target cued by MQ-4C Triton', body: 'Triton AN/ZPY-3 AESA radar classifies PLAN Type-052D destroyer at 20.80°N 117.30°E — 94% confidence. Coords transmitted via Ka-SATCOM to TempestOS.' },
  tasking:       { title: 'TempestOS loads strike package', body: '3× M48, 12 VLS cells total. Time-on-target synchronized. Authorization chain initiated: Intel → LEGAD → CO → CCDR.' },
  emcon_transit: { title: 'Strike package transiting under EMCON', body: 'All three M48s moving to firing positions with RF emitters off. GPS-hardened primary nav; SeaFIND INS backup for GPS-denied corridor.' },
  fire_pos:      { title: 'USVs at firing positions', body: 'M70-ALPHA, BRAVO, CHARLIE holding west of Luzon Strait. 12 Tomahawk cells ready. Awaiting CCDR authorization.' },
  auth_request:  { title: '⚡ HITL gate — awaiting CCDR auth', body: 'DODD 3000.09 requires human authorization before any lethal engagement. Full chain: Intel ✓ → LEGAD ✓ → CO ✓ → CCDR reviewing…' },
  weapons_free:  { title: 'Weapons free — CCDR authorized', body: 'PKI authorization token received. TempestOS fire control unlocked. Time-on-target salvo executing.' },
  launch:        { title: '⚡ MK 70 PDS firing — all three M48s', body: 'Each M48 fires its 4-cell Mk 70 Payload Delivery System simultaneously. 12× Tomahawk Block V MST away.' },
  missiles_fly:  { title: 'Tomahawk salvo inbound — time-on-target', body: '12 missiles converging on ECHO-4. GPS/INS terminal guidance. Sea-skimming flight profile.' },
  impact:        { title: '✕ ECHO-4 struck — direct hit confirmed', body: 'Spectre EO/IR confirms all three impacts. Scion ESM: target radar signature lost. Secondary explosions — magazine detonation.' },
  bda:           { title: '✓ BDA complete — sector ECHO-4 cleared', body: 'PLAN Type-052D destroyed. Strike package withdrawing under EMCON. Mission SBOM filed to 7th Fleet MOC.' },
};

const BADGE_CLS = {
  staged:        'bg-cyan-900/80 text-cyan-300 border-cyan-500/40',
  isr_cue:       'bg-blue-900/80 text-blue-300 border-blue-500/40 animate-pulse',
  tasking:       'bg-violet-900/80 text-violet-300 border-violet-500/40',
  emcon_transit: 'bg-slate-700/80 text-slate-300 border-slate-500/40',
  fire_pos:      'bg-amber-900/80 text-amber-300 border-amber-500/40',
  auth_request:  'bg-orange-900/80 text-orange-200 border-orange-400/60 animate-pulse',
  weapons_free:  'bg-emerald-900/80 text-emerald-300 border-emerald-500/40',
  launch:        'bg-red-900/80 text-red-200 border-red-400/60 animate-pulse',
  missiles_fly:  'bg-red-900/80 text-red-300 border-red-500/40 animate-pulse',
  impact:        'bg-red-900/80 text-red-200 border-red-400/60',
  bda:           'bg-emerald-900/80 text-emerald-200 border-emerald-400/40',
};

// ─── Fleet roster (kept but not rendered) ─────────────────────────────────────
const _getFleetRoster = (tick) => {
  const phase = getPhase(tick);
  const inTransit = ['emcon_transit'].includes(phase);
  const atFire    = ['fire_pos', 'auth_request', 'weapons_free'].includes(phase);
  const firing    = ['launch', 'missiles_fly'].includes(phase);
  const bda       = ['impact', 'bda'].includes(phase);
  const staged    = tick >= T_STAGED;
  return [
    {
      id: 'triton',
      name: 'MQ-4C Triton',
      role: 'ISR / Target Cue',
      color: '#3b82f6',
      payload: 'AN/ZPY-3 AESA · Ka-SATCOM',
      status: tick < T_ISR_CUE ? 'AIRBORNE' : tick < T_TASKING ? 'CUEING TARGET' : tick < T_IMPACT ? 'ISR OVERWATCH' : 'BDA',
      active: tick >= T_ISR_CUE,
    },
    {
      id: 'alpha',
      name: 'M70-ALPHA',
      role: 'M48 Strike USV',
      color: '#ef4444',
      payload: '1× Mk 70 PDS · 4 VLS cells · Tomahawk Block V',
      status: !staged ? 'STAGING' : inTransit ? 'EMCON TRANSIT' : atFire ? 'AT FIRING POS' : firing ? 'FIRING — MK 70' : bda ? 'WITHDRAWING' : 'STAGED',
      active: staged,
    },
    {
      id: 'bravo',
      name: 'M70-BRAVO',
      role: 'M48 Strike USV',
      color: '#f97316',
      payload: '1× Mk 70 PDS · 4 VLS cells · Tomahawk Block V',
      status: !staged ? 'STAGING' : inTransit ? 'EMCON TRANSIT' : atFire ? 'AT FIRING POS' : firing ? 'FIRING — MK 70' : bda ? 'WITHDRAWING' : 'STAGED',
      active: staged,
    },
    {
      id: 'charlie',
      name: 'M70-CHARLIE',
      role: 'M48 Strike USV',
      color: '#fbbf24',
      payload: '1× Mk 70 PDS · 4 VLS cells · Tomahawk Block V',
      status: !staged ? 'STAGING' : inTransit ? 'EMCON TRANSIT' : atFire ? 'AT FIRING POS' : firing ? 'FIRING — MK 70' : bda ? 'WITHDRAWING' : 'STAGED',
      active: staged,
    },
    {
      id: 'spectre',
      name: 'Saildrone Spectre',
      role: 'ISR / BDA Platform',
      color: '#06b6d4',
      payload: 'EO/IR · Scion ESM · 365-day endurance',
      status: tick < T_STAGED ? 'PRE-MISSION' : tick < T_IMPACT ? 'ISR SCREEN' : 'BDA CONFIRM',
      active: tick >= T_STAGED,
    },
    {
      id: 'target',
      name: 'ECHO-4 (HOSTILE)',
      role: 'PLAN Type-052D Destroyer',
      color: tick >= T_IMPACT ? '#6b7280' : '#ef4444',
      payload: 'HHQ-9B SAM · YJ-18 AShM · Type-346B radar',
      status: tick < T_ISR_CUE ? '—' : tick < T_IMPACT ? 'DESIGNATED — HOSTILE' : 'DESTROYED',
      active: tick >= T_ISR_CUE,
    },
  ];
};

// ─── Loadouts ─────────────────────────────────────────────────────────────────
const M48_MOUNTS = [
  { slot: 'STRIKE PAYLOAD', name: 'Mk 70 Payload Delivery System', vendor: 'Lockheed Martin', description: '4-cell containerized VLS — Tomahawk Block V MST — deck-mounted on M48 hull' },
  { slot: 'MUNITIONS', name: 'Tomahawk Block V MST', vendor: 'Raytheon', description: '~500nm range — GPS/INS terminal — sea-skimming profile — Maritime Strike (anti-ship) variant' },
  { slot: 'NAVIGATION', name: 'SeaFIND INS', vendor: 'Honeywell', description: 'GPS-hardened inertial nav — EMCON transit compliant — GPS-denied corridor backup' },
];
const SPECTRE_MOUNTS = [
  { slot: 'EO/IR', name: 'Teledyne FLIR EO/IR Turret', vendor: 'Teledyne FLIR', description: 'Day/night optical surveillance — BDA confirmation — 365-day wave-powered endurance' },
  { slot: 'ELINT', name: 'Scion ESM', vendor: 'Scion', description: 'Electronic support measures — radar signature detection — emission monitoring' },
];
const TRITON_MOUNTS = [
  { slot: 'RADAR', name: 'AN/ZPY-3 AESA', vendor: 'Northrop Grumman', description: '360° maritime search — detects periscope masts at 150km+ — Ka-SATCOM data link to TempestOS' },
];

const VESSEL_ROSTER = [
  { name: 'M48 (Mk70 PDS)', image: imgM48, hullName: 'M48', capabilities: ['Mk 70 Payload Delivery System', 'Tomahawk Block V 8-cell VLS', 'SeaFIND Inertial Navigation', 'EMCON Transit Capable'] },
  { name: 'Saildrone Spectre', image: imgSaildrone, hullName: 'Saildrone Spectre', capabilities: ['Teledyne FLIR EO/IR Turret', 'Scion ESM Electronic Support', 'BDA Assessment', '365-Day Endurance'] },
  { name: 'MQ-4C Triton', image: imgMQ4CTriton, hullName: 'MQ-4C Triton', capabilities: ['AN/ZPY-3 AESA Radar', '150km+ Periscope Detection', 'Ka-SATCOM to TempestOS', 'Wide-Area Target Cue'] },
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
const KineticEffectsMissionView = ({ mission, onBack }) => {
  const { saveMission, updateMission } = useMissionStore();
  const { setSelectedHull } = useOutfitterStore();
  const { startNewConfiguration, setPendingMissionSetKey, setPendingMissionSetCaps } = useConfigurationStore();
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
      name: assignment.vesselLabel || assignment.hullName,
      hullName: assignment.hullName,
    };
  });
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
  const alphaPos   = getUSVPos(tick, M70_ALPHA_STAGE,   M70_ALPHA_FIRE);
  const bravoPos   = getUSVPos(tick, M70_BRAVO_STAGE,   M70_BRAVO_FIRE);
  const charliePos = getUSVPos(tick, M70_CHARLIE_STAGE, M70_CHARLIE_FIRE);
  const mAlpha     = getMissilePos(tick, M70_ALPHA_FIRE);
  const mBravo     = getMissilePos(tick, M70_BRAVO_FIRE);
  const mCharlie   = getMissilePos(tick, M70_CHARLIE_FIRE);
  const boomR      = getBoomRadius(tick);
  const boomO      = getBoomOpacity(tick);
  const narrative  = PHASE_NARRATIVE[phase];
  const badgeCls   = BADGE_CLS[phase];

  const showSpectre = tick >= T_STAGED;
  const showTriton  = tick >= T_ISR_CUE;
  const showTarget  = tick >= T_ISR_CUE;
  const targetDead  = tick >= T_IMPACT;

  // Triton flies a slow elliptical surveillance orbit around TRITON_CENTER
  const tritonAngle = (tick - T_ISR_CUE) * 0.11;
  const tritonPos   = [
    TRITON_CENTER[0] + 0.10 * Math.sin(tritonAngle),
    TRITON_CENTER[1] + 0.16 * Math.cos(tritonAngle),
  ];

  const handleConfigureVessel = (vessel) => {
    if (!vessel.hullName) return;
    const hull = vesselHullData.find(h => h.name === vessel.hullName);
    if (!hull) return;

    setSelectedHull(hull);
    startNewConfiguration(vessel.hullName);

    setPendingMissionSetCaps(vessel.capabilities);

    setPendingMissionSetKey(MISSION_SET_KEY);
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

      if (t === T_STAGED)       { addEvtRef.current('CTF-72: Strike package staged — Luzon Strait east', 'info'); addEvtRef.current('M48 USVs: on station — EMCON White — all emitters secured', 'info'); }
      if (t === T_ISR_CUE)      { addEvtRef.current('MQ-4C Triton: PLAN Type-052D at 20.80°N 117.30°E — 94% confidence', 'warn'); addEvtRef.current('Target designated ECHO-4 — HOSTILE — pending CCDR auth', 'warn'); }
      if (t === T_TASKING)      { addEvtRef.current('TempestOS: 3× M48, 12 VLS cells — time-on-target synced', 'info'); addEvtRef.current('Authorization chain opened: Intel → LEGAD → CO → CCDR', 'info'); }
      if (t === T_EMCON_START)  { addEvtRef.current('EMCON transit: RF emitters secured — GPS-hardened nav active', 'info'); }
      if (t === T_FIRE_POS)     { addEvtRef.current('M70-ALPHA/BRAVO/CHARLIE: firing positions confirmed', 'warn'); addEvtRef.current('12 VLS cells ready — awaiting CCDR authorization', 'info'); }
      if (t === T_AUTH_REQUEST) { addEvtRef.current('HITL GATE: DODD 3000.09 — auth request transmitted to CCDR', 'warn'); }
      if (t === T_AUTH_REQUEST + 4) { addEvtRef.current('Intel ✓ · LEGAD ✓ (LOAC compliant) · CO ✓ — transmitting to CCDR', 'warn'); }
      if (t === T_WEAPONS_FREE) { addEvtRef.current('CCDR: WEAPONS FREE — PKI token valid — fire control unlocked', 'alert'); }
      if (t === T_LAUNCH)       { addEvtRef.current('M70-ALPHA: MK 70 PDS — 4× Tomahawk Block V MST AWAY', 'alert'); addEvtRef.current('M70-BRAVO: MK 70 PDS — 4× Tomahawk Block V MST AWAY', 'alert'); addEvtRef.current('M70-CHARLIE: MK 70 PDS — 4× Tomahawk Block V MST AWAY', 'alert'); }
      if (t === T_IMPACT)       { addEvtRef.current('IMPACT: ECHO-4 — direct hits — Spectre EO/IR confirms', 'alert'); addEvtRef.current('Scion ESM: target radar lost — magazine detonation — hull breach', 'success'); }
      if (t === T_BDA)          { addEvtRef.current('BDA: PLAN Type-052D DESTROYED — sector ECHO-4 cleared', 'success'); addEvtRef.current('Strike package withdrawing EMCON — mission SBOM filed', 'info'); }

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
    const name = missionName.trim() || `PAERAS-STRIKE-${new Date().toISOString().slice(5, 10)}`;
    const data = { name, template: 'KINETIC_EFFECTS', domain: 'MARITIME', status: 'draft', duration: '72h', missionProfile: { type: 'KINETIC_EFFECTS', subMode: 'STRIKE', hitlCompliant: true, dodd300009: true } };
    if (mission?.id) updateMission(mission.id, data); else saveMission(data);
    setSaved(true); setTimeout(() => setSaved(false), 2400);
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
        <Zap size={13} className="text-red-400" />
        <span className="text-red-400 text-[0.8rem] font-semibold tracking-wide">Operation IRON REEF</span>
        <span className="text-gray-600 text-[0.7rem]">·</span>
        <span className="text-gray-500 text-[0.68rem]">South China Sea · Luzon Strait · Long-Range Strike</span>
        <div className="flex-1" />
        <span className="px-2 py-0.5 rounded-full bg-orange-900/50 text-orange-400 text-[0.65rem] font-bold uppercase tracking-wider border border-orange-500/30">DODD 3000.09 · HITL REQUIRED</span>
        <input
          value={missionName}
          onChange={e => setMissionName(e.target.value)}
          placeholder="Mission designator…"
          className="bg-gray-800/60 border border-gray-700/60 rounded-md px-3 py-1.5 text-white text-[0.78rem] w-52 placeholder-gray-600 focus:outline-none focus:border-red-500/50 transition-colors"
        />
        <button
          onClick={handleSave}
          className={`px-3 py-1.5 rounded-md text-[0.78rem] font-semibold transition-colors flex items-center gap-1.5 ${saved ? 'bg-emerald-700 text-white' : 'bg-red-700 hover:bg-red-600 text-white'}`}
        >
          {saved ? <><Check size={11} /> Saved</> : 'Save Draft'}
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
              <TileLayer url={TILE_SEAMARK} opacity={0.3} />
              <MapInvalidateSize />

              {/* Spectre ISR — draws BDA observation line after impact */}
              {showSpectre && (
                <>
                  <CircleMarker center={SPECTRE_POS} radius={7} pathOptions={{ color: '#06b6d4', fillColor: '#06b6d4', fillOpacity: 0.9, weight: 2 }} />
                  {tick >= T_IMPACT && (
                    <Polyline
                      positions={[SPECTRE_POS, TARGET_POS]}
                      pathOptions={{ color: '#06b6d4', weight: 1.5, dashArray: '5 6', opacity: tick >= T_BDA ? 0.8 : 0.4 }}
                    />
                  )}
                  {tick >= T_BDA && (
                    <Circle center={SPECTRE_POS} radius={18 * NM_TO_M} pathOptions={{ color: '#06b6d4', fillOpacity: 0, weight: 1.5, opacity: 0.35, dashArray: '6 4' }} />
                  )}
                </>
              )}

              {/* Triton — flies an elliptical ISR orbit; targeting line while target is alive, BDA line after impact */}
              {showTriton && (
                <>
                  <CircleMarker center={tritonPos} radius={6} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.7, weight: 2 }} />
                  {!targetDead && (
                    <Polyline
                      positions={[tritonPos, TARGET_POS]}
                      pathOptions={{ color: '#3b82f6', weight: 1.5, dashArray: '6 5', opacity: 0.65 }}
                    />
                  )}
                  {targetDead && (
                    <Polyline
                      positions={[tritonPos, TARGET_POS]}
                      pathOptions={{ color: '#6b7280', weight: 1, dashArray: '4 8', opacity: 0.4 }}
                    />
                  )}
                  <Circle center={TRITON_CENTER} radius={25 * NM_TO_M} pathOptions={{ color: '#3b82f6', fillOpacity: 0, weight: 1, opacity: 0.2, dashArray: '4 6' }} />
                </>
              )}

              {/* M48 USVs */}
              {[
                { pos: alphaPos,   color: '#ef4444' },
                { pos: bravoPos,   color: '#f97316' },
                { pos: charliePos, color: '#fbbf24' },
              ].map(({ pos, color }, i) => (
                <CircleMarker key={i} center={pos} radius={8} pathOptions={{ color, fillColor: color, fillOpacity: 0.95, weight: 2 }} />
              ))}

              {/* Target */}
              {showTarget && !targetDead && (
                <CircleMarker center={TARGET_POS} radius={8} pathOptions={{ color: '#ef4444', fillColor: '#1a0000', fillOpacity: 0.95, weight: 2.5, dashArray: '5 3' }} />
              )}
              {targetDead && boomO < 0.1 && (
                <CircleMarker center={TARGET_POS} radius={8} pathOptions={{ color: '#6b7280', fillColor: '#111', fillOpacity: 0.9, weight: 2 }} />
              )}

              {/* Missiles */}
              {[{ pos: mAlpha, c: '#ef4444' }, { pos: mBravo, c: '#f97316' }, { pos: mCharlie, c: '#fbbf24' }]
                .filter(m => m.pos).map(({ pos, c }, i) => (
                  <CircleMarker key={`m${i}`} center={pos} radius={4} pathOptions={{ color: c, fillColor: c, fillOpacity: 1, weight: 1 }} />
                ))}
              {mAlpha   && <Polyline positions={[M70_ALPHA_FIRE,   mAlpha]} pathOptions={{ color: '#ef4444', weight: 1, dashArray: '4 4', opacity: 0.45 }} />}
              {mBravo   && <Polyline positions={[M70_BRAVO_FIRE,   mBravo]} pathOptions={{ color: '#f97316', weight: 1, dashArray: '4 4', opacity: 0.45 }} />}
              {mCharlie && <Polyline positions={[M70_CHARLIE_FIRE, mCharlie]} pathOptions={{ color: '#fbbf24', weight: 1, dashArray: '4 4', opacity: 0.45 }} />}

              {/* Explosion */}
              {boomO > 0 && <Circle center={TARGET_POS} radius={boomR} pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: boomO * 0.35, weight: 2, opacity: boomO }} />}

            </MapContainer>

            {/* ── Phase badge ── */}
            {badgeCls && narrative && (
              <div className={`absolute top-3 left-3 z-[500] px-3 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wider pointer-events-none border ${badgeCls}`}>
                {narrative.title}
              </div>
            )}

            {/* ── Legend ── */}
            {tick >= T_STAGED && (
              <div className="absolute bottom-3 left-3 z-[500] pointer-events-none px-3 py-2 rounded-xl bg-gray-950/80 border border-gray-700/50 backdrop-blur-sm">
                <div className="flex flex-col gap-1">
                  {[
                    { color: '#ef4444', label: 'M70-ALPHA — M48 Strike USV',           dashed: false },
                    { color: '#f97316', label: 'M70-BRAVO — M48 Strike USV',           dashed: false },
                    { color: '#fbbf24', label: 'M70-CHARLIE — M48 Strike USV',         dashed: false },
                    { color: '#06b6d4', label: 'Saildrone Spectre — ISR / BDA',        dashed: false },
                    { color: '#3b82f6', label: 'MQ-4C Triton — Target Cue',            dashed: false },
                    { color: '#ef4444', label: 'ECHO-4 — PLAN Type-052D (HOSTILE)',    dashed: true  },
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
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[0.78rem] font-semibold transition-colors $bg-red-700 hover:bg-red-600 text-white"
                  >
                    <Pause size={13} />
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={paused ? resume : runScenario}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[0.78rem] font-semibold transition-colors $bg-red-700 hover:bg-red-600 text-white"
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
                  <div className="text-[0.68rem] font-bold text-red-400 uppercase tracking-wider mb-1">
                    {narrative.title}
                  </div>
                  <div className="text-[0.67rem] text-gray-400 leading-relaxed">
                    {narrative.body}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-[0.68rem]">
                  3× M48 M70 · Saildrone Spectre · MQ-4C Triton
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

export default KineticEffectsMissionView;