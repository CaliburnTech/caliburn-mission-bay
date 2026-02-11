import { useState, useEffect } from 'react';
import { ChevronRight, Cpu, Layers, Ship, Anchor, Radio, Target, Shield, Plane, Waves, Wrench, Settings, ArrowRight } from 'lucide-react';

/**
 * Splash Page C: Platform Overview
 * Domain-oriented map with Mission Bay configuration dock
 */
const SplashPageC = ({ onEnter }) => {
  const [showContent, setShowContent] = useState(false);
  const [visibleItems, setVisibleItems] = useState([]);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 100);

    // Stagger appearance
    const timers = [];
    for (let i = 0; i < 9; i++) {
      timers.push(setTimeout(() => setVisibleItems(v => [...v, i]), 400 + i * 150));
    }

    return () => timers.forEach(clearTimeout);
  }, []);

  // Deployed assets organized by domain
  const deployments = [
    // AERIAL - top section
    {
      id: 0,
      domain: 'aerial',
      mission: 'CONVOY ESCORT',
      region: 'Red Sea',
      platform: { name: 'MQ-9 Reaper', icon: Plane, count: 48 },
      capabilities: ['Swarm Coord', 'Strike Pkg'],
      status: 'ACTIVE',
      x: 25, y: 8,
      labelSide: 'right'
    },
    {
      id: 1,
      domain: 'aerial',
      mission: 'OVERWATCH',
      region: 'Persian Gulf',
      platform: { name: 'MQ-4C Triton', icon: Plane, count: 12 },
      capabilities: ['Wide-Area ISR', 'SIGINT'],
      status: 'ACTIVE',
      x: 70, y: 12,
      labelSide: 'left'
    },
    // SURFACE - middle section
    {
      id: 2,
      domain: 'surface',
      mission: 'SEA DENIAL',
      region: 'Hormuz',
      platform: { name: 'MetalShark', icon: Anchor, count: 280 },
      capabilities: ['Guardian AI', 'Mesh Comms'],
      status: 'ACTIVE',
      x: 18, y: 32,
      labelSide: 'right'
    },
    {
      id: 3,
      domain: 'surface',
      mission: 'ISR PATROL',
      region: 'Taiwan Strait',
      platform: { name: 'Saildrone', icon: Radio, count: 117 },
      capabilities: ['EW Suite', 'SIGINT'],
      status: 'ACTIVE',
      x: 78, y: 28,
      labelSide: 'left'
    },
    {
      id: 4,
      domain: 'surface',
      mission: 'REFIT',
      region: 'Guam',
      platform: { name: 'AEGIR-F', icon: Anchor, count: 24 },
      capabilities: ['Kinetic Strike'],
      status: 'MAINTENANCE',
      x: 55, y: 38,
      labelSide: 'left'
    },
    // SUBSURFACE - lower section
    {
      id: 5,
      domain: 'subsurface',
      mission: 'SIGINT OPS',
      region: 'South China Sea',
      platform: { name: 'SubSeaSail', icon: Waves, count: 45 },
      capabilities: ['ASW Pkg', 'Acoustic'],
      status: 'ACTIVE',
      x: 72, y: 52,
      labelSide: 'left'
    },
    {
      id: 6,
      domain: 'subsurface',
      mission: 'CABLE SURVEY',
      region: 'Pacific',
      platform: { name: 'Remus UUV', icon: Waves, count: 8 },
      capabilities: ['Sonar Array', 'Mapping'],
      status: 'ACTIVE',
      x: 22, y: 55,
      labelSide: 'right'
    },
  ];

  // Mission Bay items (configuring/ready)
  const bayItems = [
    {
      id: 7,
      name: 'Black Widow Squadron',
      platform: 'MetalShark',
      icon: Anchor,
      status: 'CONFIGURING',
      progress: 72,
      capabilities: ['Guardian AI', 'EW Suite']
    },
    {
      id: 8,
      name: 'Phantom Wing',
      platform: 'MQ-25 Stingray',
      icon: Plane,
      status: 'READY',
      capabilities: ['Tanker Ops', 'ISR Pod']
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return { dot: 'bg-green-500', text: 'text-green-400', glow: 'rgba(34,197,94,0.5)' };
      case 'MAINTENANCE': return { dot: 'bg-orange-500', text: 'text-orange-400', glow: 'rgba(249,115,22,0.5)' };
      case 'STANDBY': return { dot: 'bg-yellow-500', text: 'text-yellow-400', glow: 'rgba(234,179,8,0.5)' };
      case 'CONFIGURING': return { dot: 'bg-blue-500', text: 'text-blue-400', glow: 'rgba(59,130,246,0.5)' };
      case 'READY': return { dot: 'bg-lime-brand', text: 'text-lime-brand', glow: 'rgba(203,253,0,0.5)' };
      default: return { dot: 'bg-gray-500', text: 'text-gray-400', glow: 'rgba(107,114,128,0.5)' };
    }
  };

  return (
    <div className="fixed inset-0 bg-darkest flex overflow-hidden">
      {/* Left side - Messaging */}
      <div className={`w-full lg:w-[45%] flex flex-col justify-center px-8 md:px-12 lg:px-16 transition-all duration-1000 ${showContent ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-lime-brand rounded-lg flex items-center justify-center">
            <Ship size={24} className="text-black" />
          </div>
          <div>
            <div className="text-white font-bold text-lg">CALIBURN</div>
            <div className="text-gray-500 text-xs tracking-wider">MISSION BAY</div>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
          Configure.<br />
          <span className="text-lime-brand">Deploy.</span><br />
          Command.
        </h1>

        {/* Description */}
        <p className="text-gray-400 text-base md:text-lg mb-6 max-w-md leading-relaxed">
          Configure autonomous platforms with modular payloads. Deploy across air, surface, and subsurface domains.
        </p>

        {/* Feature bullets - compact */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { icon: Layers, label: 'Modular Payloads' },
            { icon: Cpu, label: 'Engineering Stacks' },
            { icon: Target, label: 'Mission Planning' },
            { icon: Shield, label: 'Fleet Management' }
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon size={14} className="text-lime-brand" />
              <span className="text-gray-300 text-sm">{label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => onEnter('shipyard')}
            className="group flex items-center gap-2 px-6 py-3 bg-lime-brand text-black font-bold rounded-lg hover:bg-lime-brand/90 transition-all"
          >
            Explore Fleet
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => onEnter('capabilities')}
            className="px-6 py-3 border border-gray-700 text-gray-300 font-medium rounded-lg hover:border-lime-brand/50 transition-all"
          >
            Capabilities
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-6 pt-6 border-t border-gray-800">
          <div>
            <div className="text-xl font-bold text-white">2,662</div>
            <div className="text-gray-500 text-xs">Vessels</div>
          </div>
          <div>
            <div className="text-xl font-bold text-white">9</div>
            <div className="text-gray-500 text-xs">Squadrons</div>
          </div>
          <div>
            <div className="text-xl font-bold text-white">47</div>
            <div className="text-gray-500 text-xs">Capabilities</div>
          </div>
        </div>
      </div>

      {/* Right side - Domain map + Mission Bay */}
      <div className={`hidden lg:flex w-[55%] flex-col relative transition-all duration-1000 delay-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>

        {/* Domain zones */}
        <div className="flex-1 relative">
          {/* Zone backgrounds */}
          <div className="absolute inset-0 flex flex-col">
            {/* Aerial zone */}
            <div className="flex-1 bg-gradient-to-b from-slate-900/80 to-slate-800/40 relative">
              <div className="absolute top-3 left-4 text-[10px] font-mono text-slate-500 tracking-widest">AERIAL</div>
            </div>
            {/* Surface zone */}
            <div className="flex-1 bg-gradient-to-b from-cyan-950/30 to-cyan-900/20 relative border-t border-cyan-800/20">
              <div className="absolute top-3 left-4 text-[10px] font-mono text-cyan-700/60 tracking-widest">SURFACE</div>
            </div>
            {/* Subsurface zone */}
            <div className="flex-1 bg-gradient-to-b from-blue-950/40 to-blue-950/60 relative border-t border-blue-800/20">
              <div className="absolute top-3 left-4 text-[10px] font-mono text-blue-700/50 tracking-widest">SUBSURFACE</div>
            </div>
          </div>

          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          />

          {/* Status header */}
          <div className="absolute top-3 right-4 flex items-center gap-3 z-20">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-green-400 text-[10px] font-mono">5 ACTIVE</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              <span className="text-orange-400 text-[10px] font-mono">1 MAINT</span>
            </div>
          </div>

          {/* Deployment dots + labels */}
          {deployments.map((dep) => {
            const PlatformIcon = dep.platform.icon;
            const isVisible = visibleItems.includes(dep.id);
            const isLeft = dep.labelSide === 'left';
            const colors = getStatusColor(dep.status);

            return (
              <div
                key={dep.id}
                className={`absolute transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
                style={{ left: `${dep.x}%`, top: `${dep.y}%` }}
              >
                {/* Dot */}
                <div
                  className={`relative w-3 h-3 rounded-full ${colors.dot}`}
                  style={{ boxShadow: `0 0 12px ${colors.glow}` }}
                >
                  {dep.status === 'ACTIVE' && (
                    <div className={`absolute inset-0 rounded-full ${colors.dot} animate-ping opacity-40`} />
                  )}
                </div>

                {/* Label */}
                <div
                  className={`absolute top-1/2 -translate-y-1/2 ${isLeft ? 'right-6' : 'left-6'}`}
                  style={{ width: '150px' }}
                >
                  <div className="bg-gray-900/90 border border-gray-700/60 rounded-lg p-2.5 backdrop-blur-sm">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                      <span className="text-white font-bold text-[11px]">{dep.mission}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <PlatformIcon size={12} className="text-lime-brand" />
                      <span className="text-gray-400 text-[10px]">{dep.platform.name} ×{dep.platform.count}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {dep.capabilities.map(cap => (
                        <span key={cap} className="px-1.5 py-0.5 bg-purple-500/15 border border-purple-500/25 rounded text-purple-300 text-[8px]">
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className={`absolute top-1/2 ${isLeft ? '-right-3' : '-left-3'} w-3 h-px bg-gray-600`} style={{ transform: 'translateY(-50%)' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Mission Bay dock */}
        <div className="h-32 bg-gradient-to-t from-gray-900 to-gray-900/80 border-t-2 border-lime-brand/30 relative">
          {/* Bay label */}
          <div className="absolute top-2 left-4 flex items-center gap-2">
            <Settings size={12} className="text-lime-brand" />
            <span className="text-lime-brand text-[10px] font-mono tracking-widest">MISSION BAY</span>
          </div>

          {/* Configuring items */}
          <div className="absolute bottom-4 left-4 right-4 flex gap-3">
            {bayItems.map((item) => {
              const Icon = item.icon;
              const isVisible = visibleItems.includes(item.id);
              const colors = getStatusColor(item.status);

              return (
                <div
                  key={item.id}
                  className={`flex-1 bg-gray-800/80 border border-gray-700/50 rounded-lg p-3 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className="text-lime-brand" />
                      <span className="text-white text-xs font-medium">{item.name}</span>
                    </div>
                    <span className={`text-[9px] font-mono ${colors.text}`}>{item.status}</span>
                  </div>

                  {item.progress !== undefined && (
                    <div className="mb-2">
                      <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.progress}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {item.capabilities.map(cap => (
                        <span key={cap} className="px-1 py-0.5 bg-purple-500/15 border border-purple-500/25 rounded text-purple-300 text-[7px]">
                          {cap}
                        </span>
                      ))}
                    </div>
                    {item.status === 'READY' && (
                      <ArrowRight size={12} className="text-lime-brand" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashPageC;
