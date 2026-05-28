import { useState, useEffect } from 'react';
import { ChevronRight, Cpu, Layers, Ship, Target, Shield, Plane, Waves, Zap, Plus } from 'lucide-react';

/**
 * Splash Page C: Mission Control
 * Cinematic positioned layout with dramatic domain gradients
 */
const SplashPageC = ({ onEnter }) => {
  const [showContent, setShowContent] = useState(false);
  const [visibleItems, setVisibleItems] = useState([]);
  const [scanPosition, setScanPosition] = useState(0);
  const [deployingItem, setDeployingItem] = useState(null);
  const [deployedItems, setDeployedItems] = useState([]);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 100);

    // Stagger card appearance
    const timers = [];
    for (let i = 0; i < 20; i++) {
      timers.push(setTimeout(() => setVisibleItems(v => [...v, i]), 300 + i * 100));
    }

    // Animated radar scan
    const scanInterval = setInterval(() => {
      setScanPosition(prev => (prev + 1) % 100);
    }, 50);

    // Deployment story
    const deployTimer = setTimeout(() => {
      setDeployingItem('ms-guardian');
      setTimeout(() => {
        setDeployedItems(prev => [...prev, 'ms-guardian']);
        setDeployingItem(null);

        setTimeout(() => {
          setDeployingItem('mq25-tanker');
          setTimeout(() => {
            setDeployedItems(prev => [...prev, 'mq25-tanker']);
            setDeployingItem(null);
          }, 1800);
        }, 1500);
      }, 1800);
    }, 4000);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(scanInterval);
      clearTimeout(deployTimer);
    };
  }, []);

  // Deployed missions with positions - these are MISSION TYPES
  // AERIAL: y 5-28%, SURFACE: y 38-62%, SUBSURFACE: y 72-95%
  // Icons: Plane=UAV, Ship=USV, Waves=UUV
  // Each mission shows multiple capabilities (the whole point of modular payloads!)
  const aerialMissions = [
    { id: 0, name: 'CONVOY ESCORT', platform: 'M48', icon: Ship, count: 48, caps: ['NGHTS Targeting', 'Jackal Missile', 'Lattice Mesh'], status: 'ACTIVE', x: 70, y: 12 },
    { id: 1, name: 'ISR PATROL', platform: 'M68', icon: Ship, count: 12, caps: ['Scion ESM', 'Hidden Level Radar', 'SeaFIND Nav'], status: 'ACTIVE', x: 25, y: 20 },
  ];

  const surfaceMissions = [
    { id: 2, name: 'SEA DENIAL', platform: 'M48', icon: Ship, count: 280, caps: ['Guardian AI', 'Marine AI', 'Lattice Mesh'], status: 'ACTIVE', x: 20, y: 42 },
    { id: 3, name: 'PORT SECURITY', platform: 'HSMUSV', icon: Ship, count: 24, caps: ['DRAKE Counter-UAS', 'Scion ESM'], status: 'MAINTENANCE', x: 65, y: 52 },
  ];

  const subsurfaceMissions = [
    { id: 4, name: 'ASW PATROL', platform: 'SubSeaSail', icon: Ship, count: 45, caps: ['Towed Sonar', 'SeaFIND Nav', 'Lattice Mesh'], status: 'ACTIVE', x: 45, y: 75 },
    { id: 5, name: 'CABLE SURVEY', platform: 'SubSeaSail Horus', icon: Ship, count: 12, caps: ['Marine AI', 'Scion ESM'], status: 'ACTIVE', x: 75, y: 82 },
    { id: 6, name: 'SEABED RECON', platform: 'SubSeaSail', icon: Ship, count: 8, caps: ['Hidden Level Radar', 'Towed Sonar'], status: 'ACTIVE', x: 20, y: 88 },
  ];

  // Bay items - 7 PIER, 7 HANGAR
  // Each configuration has multiple capabilities - that's the whole point of modular payloads!
  // Deploy positions: AERIAL y<30, SURFACE y 40-60, SUBSURFACE y>70
  const pierItems = [
    { id: 'ms-guardian', name: 'M48 Guardian', platform: 'M48', icon: Ship, caps: ['Guardian AI', 'Marine AI', 'Lattice Mesh'], targetDomain: 'SURFACE', deployX: 85, deployY: 48 },
    { id: 'sss-asw', name: 'SubSeaSail ASW', platform: 'SubSeaSail', icon: Ship, caps: ['Towed Sonar', 'SeaFIND Nav'] },
    { id: 'sd-survey', name: 'SubSeaSail Horus Survey', platform: 'SubSeaSail Horus', icon: Ship, caps: ['Scion ESM', 'Marine AI'] },
    { id: 'aegir-strike', name: 'HSMUSV Strike', platform: 'HSMUSV', icon: Ship, caps: ['Jackal Missile', 'NGHTS Targeting', 'Lattice Mesh'] },
    { id: 'sss-sigint', name: 'SubSeaSail SIGINT', platform: 'SubSeaSail', icon: Ship, caps: ['Hidden Level Radar', 'Scion ESM'] },
    { id: 'ms-swarm', name: 'M48 Swarm', platform: 'M48', icon: Ship, caps: ['Swarm Coordination', 'Guardian AI'] },
    { id: 'sd-relay', name: 'SubSeaSail Horus Relay', platform: 'SubSeaSail Horus', icon: Ship, caps: ['Lattice Mesh', 'Marine AI'] },
  ];

  const hangarItems = [
    { id: 'mq25-tanker', name: 'M68 Tanker', platform: 'M68', icon: Ship, caps: ['Refueling Drogue', 'SeaFIND Nav', 'Lattice Mesh'], targetDomain: 'AERIAL', deployX: 50, deployY: 18 },
    { id: 'mq9b-strike', name: 'M48 Strike', platform: 'M48', icon: Ship, caps: ['NGHTS Targeting', 'Jackal Missile', 'Scion ESM'] },
    { id: 'mq4c-sigint', name: 'M68 SIGINT', platform: 'M68', icon: Ship, caps: ['Scion ESM', 'Hidden Level Radar', 'SeaFIND Nav'] },
    { id: 'mq9b-recon', name: 'M48 Recon', platform: 'M48', icon: Ship, caps: ['Scion ESM', 'Marine AI', 'Lattice Mesh'] },
    { id: 'mq8c-asw', name: 'M48 ASW', platform: 'M48', icon: Ship, caps: ['Towed Sonar', 'SeaFIND Nav'] },
    { id: 'mq4c-ew', name: 'M68 EW', platform: 'M68', icon: Ship, caps: ['DRAKE Counter-UAS', 'Scion ESM'] },
    { id: 'mq8c-mesh', name: 'M48 Mesh Node', platform: 'M48', icon: Ship, caps: ['Lattice Mesh', 'Marine AI'] },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500';
      case 'MAINTENANCE': return 'bg-orange-500';
      case 'CONFIGURING': return 'bg-blue-500';
      case 'READY': return 'bg-lime-brand';
      default: return 'bg-gray-500';
    }
  };

  // Positioned mission card
  const MissionCard = ({ mission, isNew = false }) => {
    const Icon = mission.icon;
    const isVisible = visibleItems.includes(mission.id);

    return (
      <div
        className={`absolute transition-all duration-700 ${isVisible || isNew ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
        style={{ left: `${mission.x}%`, top: `${mission.y}%`, transform: 'translate(-50%, -50%)' }}
      >
        <div className={`bg-gray-900/90 backdrop-blur-sm border border-gray-600/50 rounded-lg p-3 min-w-[140px] relative ${isNew ? 'ring-2 ring-lime-brand shadow-lg shadow-lime-brand/20' : ''}`}>
          <div className="mb-2">
            <span className="text-white font-bold text-sm">{mission.name}</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Icon size={14} className="text-lime-brand" />
            <span className="text-gray-400 text-xs">{mission.platform} ×{mission.count}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {mission.caps.map((cap, i) => (
              <span key={i} className="px-1.5 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300 text-[9px]">
                {cap}
              </span>
            ))}
          </div>
          {/* Status dot at bottom center */}
          <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full ${getStatusColor(mission.status)} ${mission.status === 'ACTIVE' ? 'animate-pulse' : ''}`} />
        </div>
      </div>
    );
  };

  // Bay tile - BOLD version for admirals
  const BayTile = ({ item, isDeploying }) => {
    const Icon = item.icon;
    const isVisible = visibleItems.includes(item.id) || visibleItems.length > 5;

    if (isDeploying) {
      return (
        <div className="bg-lime-brand/20 border-2 border-dashed border-lime-brand rounded-lg flex flex-col items-center justify-center animate-pulse p-3">
          <div className="w-3 h-3 rounded-full bg-lime-brand animate-ping mb-1" />
          <span className="text-lime-brand text-xs font-mono font-bold">DEPLOYING</span>
        </div>
      );
    }

    return (
      <div className={`bg-gray-800/90 border border-gray-600/50 rounded-lg p-3 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'} hover:border-lime-brand cursor-pointer hover:bg-gray-800`}>
        <div className="flex items-center gap-2 mb-1">
          <Icon size={14} className="text-lime-brand flex-shrink-0" />
          <span className="text-white font-bold text-sm truncate">{item.name}</span>
        </div>
        <div className="text-gray-400 text-xs mb-2">{item.platform}</div>
        <div className="flex flex-wrap gap-1">
          {item.caps.map((cap, i) => (
            <span key={i} className="px-1.5 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300 text-[9px]">
              {cap}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // New deployments - show as missions with proper mission names, inherit caps from config
  const newAerial = hangarItems.filter(i => deployedItems.includes(i.id)).map(i => ({
    ...i, id: `new-${i.id}`, name: 'TANKER SUPPORT', count: 24, x: i.deployX, y: i.deployY, status: 'ACTIVE', caps: i.caps
  }));
  const newSurface = pierItems.filter(i => deployedItems.includes(i.id) && i.targetDomain === 'SURFACE').map(i => ({
    ...i, id: `new-${i.id}`, name: 'HARBOR PATROL', count: 48, x: i.deployX, y: i.deployY, status: 'ACTIVE', caps: i.caps
  }));

  const remainingPier = pierItems.filter(i => !deployedItems.includes(i.id));
  const remainingHangar = hangarItems.filter(i => !deployedItems.includes(i.id));

  return (
    <div className="fixed inset-0 bg-darkest flex overflow-hidden">
      {/* Left side - Messaging */}
      <div className={`w-full lg:w-[28%] flex flex-col justify-center px-6 md:px-8 transition-all duration-1000 ${showContent ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-lime-brand rounded-lg flex items-center justify-center">
            <Ship size={22} className="text-black" />
          </div>
          <div>
            <div className="text-white font-bold text-lg">CALIBURN</div>
            <div className="text-gray-500 text-[10px] tracking-widest">MISSION BAY</div>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-[1.1]">
          Configure.<br />
          <span className="text-lime-brand">Deploy.</span><br />
          Command.
        </h1>

        <p className="text-gray-400 text-sm mb-5 leading-relaxed">
          Configure autonomous platforms with modular payloads. Deploy across air, surface, and subsurface domains.
        </p>

        <div className="grid grid-cols-2 gap-2 mb-5">
          {[
            { icon: Layers, label: 'Modular Payloads' },
            { icon: Cpu, label: 'Engineering Stacks' },
            { icon: Target, label: 'Mission Planning' },
            { icon: Shield, label: 'Fleet Management' }
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon size={12} className="text-lime-brand" />
              <span className="text-gray-300 text-xs">{label}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-5">
          <button
            onClick={() => onEnter('shipyard')}
            className="group flex items-center gap-2 px-6 py-3 bg-lime-brand text-black font-bold rounded-lg hover:bg-lime-brand/90 transition-all"
          >
            Explore Fleet
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => onEnter('capabilities')}
            className="px-6 py-3 border border-gray-600 text-gray-300 font-medium rounded-lg hover:border-lime-brand/50 transition-all"
          >
            Capabilities
          </button>
        </div>

        <div className="flex gap-6 pt-4 border-t border-gray-800">
          <div><div className="text-xl font-bold text-white">2,662</div><div className="text-gray-500 text-[10px]">Vessels</div></div>
          <div><div className="text-xl font-bold text-white">9</div><div className="text-gray-500 text-[10px]">Squadrons</div></div>
          <div><div className="text-xl font-bold text-white">47</div><div className="text-gray-500 text-[10px]">Capabilities</div></div>
        </div>
      </div>

      {/* Right side - Mission Control View (4 equal sections) */}
      <div className={`hidden lg:flex w-[72%] flex-col pb-[100px] transition-all duration-1000 delay-200 ${showContent ? 'opacity-100' : 'opacity-0'}`}>

        {/* Theater of Operations - 75% */}
        <div className="h-[75%] relative overflow-hidden">
          {/* Scan line effect */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: `linear-gradient(180deg, transparent ${scanPosition}%, rgba(203,253,0,0.03) ${scanPosition + 2}%, transparent ${scanPosition + 4}%)`
            }}
          />

          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
          />

          {/* AERIAL Domain */}
          <div className="absolute inset-x-0 top-0 h-[33%] bg-gradient-to-b from-slate-900 via-slate-800/80 to-transparent">
            <div className="absolute top-3 left-4 flex items-center gap-2">
              <Plane size={14} className="text-slate-500" />
              <span className="text-slate-500 text-xs font-mono tracking-widest">AERIAL</span>
            </div>
            <div className="absolute top-3 right-4 text-xs text-green-400 font-mono">
              {aerialMissions.length + newAerial.length} ACTIVE
            </div>
            {/* Horizon line */}
            <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
          </div>

          {/* SURFACE Domain */}
          <div className="absolute inset-x-0 top-[33%] h-[34%] bg-gradient-to-b from-cyan-950/50 via-cyan-900/30 to-cyan-950/50">
            <div className="absolute top-3 left-4 flex items-center gap-2">
              <Ship size={14} className="text-cyan-700" />
              <span className="text-cyan-700 text-xs font-mono tracking-widest">SURFACE</span>
            </div>
            <div className="absolute top-3 right-4 text-xs text-green-400 font-mono">
              {surfaceMissions.length + newSurface.length} ACTIVE
            </div>
            {/* Water line */}
            <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
          </div>

          {/* SUBSURFACE Domain */}
          <div className="absolute inset-x-0 top-[67%] h-[33%] bg-gradient-to-b from-blue-950/60 via-blue-900/40 to-blue-950/80">
            <div className="absolute top-3 left-4 flex items-center gap-2">
              <Waves size={14} className="text-blue-700" />
              <span className="text-blue-700 text-xs font-mono tracking-widest">SUBSURFACE</span>
            </div>
            <div className="absolute top-3 right-4 text-xs text-green-400 font-mono">
              {subsurfaceMissions.length} ACTIVE
            </div>
          </div>

          {/* Status bar */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-gray-900/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-700/50">
            <span className="text-white text-xs font-bold tracking-wider">THEATER STATUS</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400 text-xs">5 Active</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-orange-400 text-xs">1 Maint</span>
            </div>
          </div>

          {/* Mission Cards - Positioned */}
          {aerialMissions.map(m => <MissionCard key={m.id} mission={m} />)}
          {surfaceMissions.map(m => <MissionCard key={m.id} mission={m} />)}
          {subsurfaceMissions.map(m => <MissionCard key={m.id} mission={m} />)}

          {/* Newly deployed */}
          {newAerial.map(m => <MissionCard key={m.id} mission={m} isNew />)}
          {newSurface.map(m => <MissionCard key={m.id} mission={m} isNew />)}

          {/* Deployment path animation */}
          {deployingItem && (
            <div className="absolute inset-0 pointer-events-none z-20">
              <svg className="w-full h-full">
                <defs>
                  <linearGradient id="deployGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="rgb(203,253,0)" stopOpacity="0" />
                    <stop offset="50%" stopColor="rgb(203,253,0)" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="rgb(203,253,0)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line
                  x1="50%"
                  y1="100%"
                  x2="50%"
                  y2="40%"
                  stroke="url(#deployGradient)"
                  strokeWidth="2"
                  strokeDasharray="8,4"
                  className="animate-pulse"
                />
              </svg>
            </div>
          )}
        </div>

        {/* MISSION BAY - 25% (equal to each theater domain) */}
        <div className="h-[25%] bg-gray-900/95 border-t-2 border-lime-brand/60 px-6 py-4 relative flex flex-col">
          {/* Subtle glow */}
          <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-lime-brand/5 to-transparent pointer-events-none" />

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Zap size={18} className="text-lime-brand" />
              <span className="text-lime-brand text-lg font-bold tracking-wider">MISSION BAY</span>
              <span className="text-gray-500 text-sm font-mono ml-2">STAGING AREA</span>
            </div>
            <span className="text-gray-400 text-sm font-mono font-bold">
              {remainingPier.filter(i => i.status === 'READY').length + remainingHangar.filter(i => i.status === 'READY').length} READY TO DEPLOY
            </span>
          </div>

          <div className="flex gap-8 flex-1 min-h-0">
            {/* PIER */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Ship size={14} className="text-cyan-400" />
                <span className="text-cyan-400 text-sm font-bold font-mono">PIER</span>
                <span className="text-gray-500 text-xs">→ Surface / Subsurface</span>
              </div>
              <div className="grid grid-cols-4 gap-2 flex-1">
                {remainingPier.map(item => (
                  <BayTile key={item.id} item={item} isDeploying={deployingItem === item.id} />
                ))}
                <div
                  onClick={() => onEnter('shipyard')}
                  className="bg-lime-brand/5 border-2 border-dashed border-lime-brand/40 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-lime-brand/10 hover:border-lime-brand transition-all"
                >
                  <Plus size={24} className="text-lime-brand/80" />
                  <span className="text-lime-brand/80 text-sm font-bold">Configure</span>
                </div>
              </div>
            </div>

            <div className="w-px bg-gray-700/50" />

            {/* HANGAR */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Plane size={14} className="text-slate-400" />
                <span className="text-slate-400 text-sm font-bold font-mono">HANGAR</span>
                <span className="text-gray-500 text-xs">→ Aerial</span>
              </div>
              <div className="grid grid-cols-4 gap-2 flex-1">
                {remainingHangar.map(item => (
                  <BayTile key={item.id} item={item} isDeploying={deployingItem === item.id} />
                ))}
                <div
                  onClick={() => onEnter('shipyard')}
                  className="bg-lime-brand/5 border-2 border-dashed border-lime-brand/40 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-lime-brand/10 hover:border-lime-brand transition-all"
                >
                  <Plus size={24} className="text-lime-brand/80" />
                  <span className="text-lime-brand/80 text-sm font-bold">Configure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashPageC;
