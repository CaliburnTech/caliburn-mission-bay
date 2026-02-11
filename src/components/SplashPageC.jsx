import { useState, useEffect } from 'react';
import { ChevronRight, Cpu, Layers, Ship, Anchor, Radio, Target, Shield, Plane, Waves, Settings, ArrowRight, Zap } from 'lucide-react';

/**
 * Splash Page C: Platform Overview
 * Domain-oriented map with Mission Bay (Pier + Hangar)
 */
const SplashPageC = ({ onEnter }) => {
  const [showContent, setShowContent] = useState(false);
  const [visibleItems, setVisibleItems] = useState([]);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 100);

    // Stagger appearance
    const timers = [];
    for (let i = 0; i < 15; i++) {
      timers.push(setTimeout(() => setVisibleItems(v => [...v, i]), 300 + i * 100));
    }

    return () => timers.forEach(clearTimeout);
  }, []);

  // Deployed assets organized by domain
  const deployments = [
    // AERIAL
    { id: 0, mission: 'CONVOY ESCORT', platform: { name: 'MQ-9', icon: Plane, count: 48 }, capabilities: ['Swarm', 'Strike'], status: 'ACTIVE', x: 20, y: 10, labelSide: 'right' },
    { id: 1, mission: 'OVERWATCH', platform: { name: 'MQ-4C', icon: Plane, count: 12 }, capabilities: ['ISR', 'SIGINT'], status: 'ACTIVE', x: 75, y: 8, labelSide: 'left' },
    // SURFACE
    { id: 2, mission: 'SEA DENIAL', platform: { name: 'MetalShark', icon: Anchor, count: 280 }, capabilities: ['Guardian AI', 'Mesh'], status: 'ACTIVE', x: 15, y: 32, labelSide: 'right' },
    { id: 3, mission: 'ISR PATROL', platform: { name: 'Saildrone', icon: Radio, count: 117 }, capabilities: ['EW', 'SIGINT'], status: 'ACTIVE', x: 80, y: 30, labelSide: 'left' },
    { id: 4, mission: 'REFIT', platform: { name: 'AEGIR-F', icon: Anchor, count: 24 }, capabilities: ['Kinetic'], status: 'MAINTENANCE', x: 50, y: 36, labelSide: 'right' },
    // SUBSURFACE
    { id: 5, mission: 'SIGINT OPS', platform: { name: 'SubSeaSail', icon: Waves, count: 45 }, capabilities: ['ASW', 'Acoustic'], status: 'ACTIVE', x: 75, y: 54, labelSide: 'left' },
    { id: 6, mission: 'CABLE SURVEY', platform: { name: 'Remus', icon: Waves, count: 8 }, capabilities: ['Sonar', 'Mapping'], status: 'ACTIVE', x: 20, y: 52, labelSide: 'right' },
  ];

  // Mission Bay - Pier (maritime)
  const pierItems = [
    { id: 7, name: 'Black Widow', platform: 'MetalShark', icon: Anchor, status: 'CONFIGURING', progress: 72, capabilities: ['Guardian AI', 'EW Suite'] },
    { id: 8, name: 'Hammerhead', platform: 'AEGIR-W', icon: Anchor, status: 'READY', capabilities: ['Strike Pkg', 'Targeting'] },
    { id: 9, name: 'Deep Six', platform: 'SubSeaSail', icon: Waves, status: 'CONFIGURING', progress: 45, capabilities: ['ASW Array'] },
    { id: 10, name: 'Tidehunter', platform: 'Saildrone', icon: Radio, status: 'QUEUED', capabilities: ['ISR Pod'] },
  ];

  // Mission Bay - Hangar (aerial)
  const hangarItems = [
    { id: 11, name: 'Phantom Wing', platform: 'MQ-25', icon: Plane, status: 'READY', capabilities: ['Tanker', 'ISR'] },
    { id: 12, name: 'Viper Squad', platform: 'MQ-9B', icon: Plane, status: 'CONFIGURING', progress: 88, capabilities: ['Strike', 'Recon'] },
    { id: 13, name: 'Sentinel', platform: 'MQ-4C', icon: Plane, status: 'QUEUED', capabilities: ['SIGINT'] },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return { dot: 'bg-green-500', text: 'text-green-400', glow: 'rgba(34,197,94,0.5)', bg: 'bg-green-500/10', border: 'border-green-500/30' };
      case 'MAINTENANCE': return { dot: 'bg-orange-500', text: 'text-orange-400', glow: 'rgba(249,115,22,0.5)', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
      case 'CONFIGURING': return { dot: 'bg-blue-500', text: 'text-blue-400', glow: 'rgba(59,130,246,0.5)', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
      case 'READY': return { dot: 'bg-lime-brand', text: 'text-lime-brand', glow: 'rgba(203,253,0,0.5)', bg: 'bg-lime-brand/10', border: 'border-lime-brand/30' };
      case 'QUEUED': return { dot: 'bg-gray-500', text: 'text-gray-400', glow: 'rgba(107,114,128,0.3)', bg: 'bg-gray-500/10', border: 'border-gray-500/30' };
      default: return { dot: 'bg-gray-500', text: 'text-gray-400', glow: 'rgba(107,114,128,0.5)', bg: 'bg-gray-500/10', border: 'border-gray-500/30' };
    }
  };

  const BayTile = ({ item, compact = false }) => {
    const Icon = item.icon;
    const isVisible = visibleItems.includes(item.id);
    const colors = getStatusColor(item.status);

    return (
      <div className={`${compact ? 'p-2' : 'p-2.5'} bg-gray-800/90 border ${colors.border} rounded-lg transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'}`}>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <div className={`w-5 h-5 rounded ${colors.bg} flex items-center justify-center`}>
              <Icon size={12} className="text-lime-brand" />
            </div>
            <span className="text-white text-[10px] font-bold truncate max-w-[70px]">{item.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
            {item.status === 'READY' && <ArrowRight size={10} className="text-lime-brand" />}
          </div>
        </div>

        {item.progress !== undefined && (
          <div className="mb-1.5">
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000"
                style={{ width: isVisible ? `${item.progress}%` : '0%' }}
              />
            </div>
            <div className="text-[8px] text-gray-500 mt-0.5">{item.progress}%</div>
          </div>
        )}

        <div className="flex gap-1 flex-wrap">
          {item.capabilities.slice(0, 2).map(cap => (
            <span key={cap} className="px-1 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300 text-[7px]">
              {cap}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-darkest flex overflow-hidden">
      {/* Left side - Messaging */}
      <div className={`w-full lg:w-[42%] flex flex-col justify-center px-6 md:px-10 lg:px-12 transition-all duration-1000 ${showContent ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-lime-brand rounded-lg flex items-center justify-center">
            <Ship size={20} className="text-black" />
          </div>
          <div>
            <div className="text-white font-bold">CALIBURN</div>
            <div className="text-gray-500 text-[10px] tracking-wider">MISSION BAY</div>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight">
          Configure.<br />
          <span className="text-lime-brand">Deploy.</span><br />
          Command.
        </h1>

        <p className="text-gray-400 text-sm md:text-base mb-5 max-w-sm leading-relaxed">
          Configure autonomous platforms with modular payloads. Deploy across air, surface, and subsurface domains.
        </p>

        <div className="grid grid-cols-2 gap-2 mb-6">
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

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => onEnter('shipyard')}
            className="group flex items-center gap-2 px-5 py-2.5 bg-lime-brand text-black font-bold rounded-lg hover:bg-lime-brand/90 transition-all text-sm"
          >
            Explore Fleet
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => onEnter('capabilities')}
            className="px-5 py-2.5 border border-gray-700 text-gray-300 font-medium rounded-lg hover:border-lime-brand/50 transition-all text-sm"
          >
            Capabilities
          </button>
        </div>

        <div className="flex gap-5 pt-5 border-t border-gray-800">
          <div><div className="text-lg font-bold text-white">2,662</div><div className="text-gray-500 text-[10px]">Vessels</div></div>
          <div><div className="text-lg font-bold text-white">9</div><div className="text-gray-500 text-[10px]">Squadrons</div></div>
          <div><div className="text-lg font-bold text-white">47</div><div className="text-gray-500 text-[10px]">Capabilities</div></div>
        </div>
      </div>

      {/* Right side - Domain map + Mission Bay */}
      <div className={`hidden lg:flex w-[58%] flex-col relative transition-all duration-1000 delay-200 ${showContent ? 'opacity-100' : 'opacity-0'}`}>

        {/* Domain zones - compressed */}
        <div className="h-[55%] relative">
          <div className="absolute inset-0 flex flex-col">
            <div className="flex-1 bg-gradient-to-b from-slate-900/80 to-slate-800/40 relative">
              <div className="absolute top-2 left-3 text-[9px] font-mono text-slate-500 tracking-widest">AERIAL</div>
            </div>
            <div className="flex-1 bg-gradient-to-b from-cyan-950/30 to-cyan-900/20 relative border-t border-cyan-800/20">
              <div className="absolute top-2 left-3 text-[9px] font-mono text-cyan-700/60 tracking-widest">SURFACE</div>
            </div>
            <div className="flex-1 bg-gradient-to-b from-blue-950/40 to-blue-950/60 relative border-t border-blue-800/20">
              <div className="absolute top-2 left-3 text-[9px] font-mono text-blue-700/50 tracking-widest">SUBSURFACE</div>
            </div>
          </div>

          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

          <div className="absolute top-2 right-3 flex items-center gap-2 z-20">
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /><span className="text-green-400 text-[9px] font-mono">6 ACTIVE</span></div>
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-orange-500" /><span className="text-orange-400 text-[9px] font-mono">1 MAINT</span></div>
          </div>

          {/* Deployment dots + labels - smaller */}
          {deployments.map((dep) => {
            const PlatformIcon = dep.platform.icon;
            const isVisible = visibleItems.includes(dep.id);
            const isLeft = dep.labelSide === 'left';
            const colors = getStatusColor(dep.status);

            return (
              <div key={dep.id} className={`absolute transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} style={{ left: `${dep.x}%`, top: `${dep.y}%` }}>
                <div className={`relative w-2.5 h-2.5 rounded-full ${colors.dot}`} style={{ boxShadow: `0 0 10px ${colors.glow}` }}>
                  {dep.status === 'ACTIVE' && <div className={`absolute inset-0 rounded-full ${colors.dot} animate-ping opacity-40`} />}
                </div>
                <div className={`absolute top-1/2 -translate-y-1/2 ${isLeft ? 'right-5' : 'left-5'}`} style={{ width: '120px' }}>
                  <div className="bg-gray-900/95 border border-gray-700/60 rounded p-2 backdrop-blur-sm">
                    <div className="flex items-center gap-1 mb-1">
                      <div className={`w-1 h-1 rounded-full ${colors.dot}`} />
                      <span className="text-white font-bold text-[9px]">{dep.mission}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <PlatformIcon size={10} className="text-lime-brand" />
                      <span className="text-gray-400 text-[8px]">{dep.platform.name} ×{dep.platform.count}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {dep.capabilities.map(cap => (
                        <span key={cap} className="px-1 py-0.5 bg-purple-500/15 border border-purple-500/25 rounded text-purple-300 text-[7px]">{cap}</span>
                      ))}
                    </div>
                  </div>
                  <div className={`absolute top-1/2 ${isLeft ? '-right-2' : '-left-2'} w-2 h-px bg-gray-600`} style={{ transform: 'translateY(-50%)' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Mission Bay - expanded with Pier + Hangar */}
        <div className="h-[45%] bg-gradient-to-t from-gray-900 via-gray-900/95 to-gray-800/80 border-t-2 border-lime-brand/40 relative">
          {/* Bay header */}
          <div className="absolute top-2 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-lime-brand" />
              <span className="text-lime-brand text-[10px] font-mono tracking-widest font-bold">MISSION BAY</span>
            </div>
            <span className="text-gray-500 text-[9px] font-mono">7 IN QUEUE</span>
          </div>

          <div className="absolute top-10 left-3 right-3 bottom-3 flex gap-3">
            {/* Pier section */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-1.5 mb-2">
                <Anchor size={10} className="text-cyan-400" />
                <span className="text-cyan-400 text-[9px] font-mono tracking-wider">PIER</span>
                <span className="text-gray-600 text-[8px]">Maritime</span>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-2">
                {pierItems.map(item => <BayTile key={item.id} item={item} />)}
              </div>
            </div>

            {/* Divider */}
            <div className="w-px bg-gray-700/50" />

            {/* Hangar section */}
            <div className="w-[45%] flex flex-col">
              <div className="flex items-center gap-1.5 mb-2">
                <Plane size={10} className="text-slate-400" />
                <span className="text-slate-400 text-[9px] font-mono tracking-wider">HANGAR</span>
                <span className="text-gray-600 text-[8px]">Aerial</span>
              </div>
              <div className="flex-1 grid grid-cols-1 gap-2">
                {hangarItems.map(item => <BayTile key={item.id} item={item} compact />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashPageC;
