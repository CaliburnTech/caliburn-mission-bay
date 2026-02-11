import { useState, useEffect } from 'react';
import { ChevronRight, Cpu, Layers, Ship, Anchor, Radio, Target, Shield, Plane, Waves } from 'lucide-react';

/**
 * Splash Page C: Platform Overview
 * Map-style visualization with positioned deployment labels
 */
const SplashPageC = ({ onEnter }) => {
  const [showContent, setShowContent] = useState(false);
  const [visibleDots, setVisibleDots] = useState([]);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 100);

    // Stagger dot appearance
    const timers = [
      setTimeout(() => setVisibleDots(v => [...v, 0]), 500),
      setTimeout(() => setVisibleDots(v => [...v, 1]), 800),
      setTimeout(() => setVisibleDots(v => [...v, 2]), 1100),
      setTimeout(() => setVisibleDots(v => [...v, 3]), 1400),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  // Deployed missions with map positions
  const deployments = [
    {
      mission: 'SEA DENIAL',
      region: 'Hormuz',
      platform: { name: 'MetalShark', icon: Anchor, count: 280 },
      capabilities: ['Guardian AI', 'Mesh Comms'],
      status: 'ACTIVE',
      x: 18, y: 22,
      labelSide: 'right'
    },
    {
      mission: 'ISR PATROL',
      region: 'Taiwan Strait',
      platform: { name: 'Saildrone', icon: Radio, count: 117 },
      capabilities: ['EW Suite', 'SIGINT'],
      status: 'ACTIVE',
      x: 75, y: 18,
      labelSide: 'left'
    },
    {
      mission: 'CONVOY ESCORT',
      region: 'Red Sea',
      platform: { name: 'MQ-9', icon: Plane, count: 48 },
      capabilities: ['Swarm Coord', 'Strike Pkg'],
      status: 'STANDBY',
      x: 22, y: 68,
      labelSide: 'right'
    },
    {
      mission: 'SIGINT OPS',
      region: 'South China Sea',
      platform: { name: 'SubSeaSail', icon: Waves, count: 45 },
      capabilities: ['ASW Pkg', 'Acoustic'],
      status: 'ACTIVE',
      x: 72, y: 72,
      labelSide: 'left'
    }
  ];

  return (
    <div className="fixed inset-0 bg-darkest flex overflow-hidden">
      {/* Left side - Messaging */}
      <div className={`w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-20 transition-all duration-1000 ${showContent ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
        {/* Logo area */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-lime-brand rounded-lg flex items-center justify-center">
            <Ship size={24} className="text-black" />
          </div>
          <div>
            <div className="text-white font-bold text-lg">CALIBURN</div>
            <div className="text-gray-500 text-xs tracking-wider">MISSION BAY</div>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
          Configure.<br />
          <span className="text-lime-brand">Deploy.</span><br />
          Command.
        </h1>

        {/* Description */}
        <p className="text-gray-400 text-lg md:text-xl mb-8 max-w-lg leading-relaxed">
          The autonomous fleet management platform. Configure vessel capabilities,
          plan missions, and deploy swarms—all powered by TempestOS.
        </p>

        {/* Feature bullets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-lime-brand/10 flex items-center justify-center flex-shrink-0">
              <Layers size={16} className="text-lime-brand" />
            </div>
            <div>
              <div className="text-white font-medium text-sm">Modular Capabilities</div>
              <div className="text-gray-500 text-xs">Mix-and-match payload configuration</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-lime-brand/10 flex items-center justify-center flex-shrink-0">
              <Cpu size={16} className="text-lime-brand" />
            </div>
            <div>
              <div className="text-white font-medium text-sm">Engineering Stacks</div>
              <div className="text-gray-500 text-xs">Pre-validated multi-vendor packages</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-lime-brand/10 flex items-center justify-center flex-shrink-0">
              <Target size={16} className="text-lime-brand" />
            </div>
            <div>
              <div className="text-white font-medium text-sm">Mission Planning</div>
              <div className="text-gray-500 text-xs">Visual route and zone editing</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-lime-brand/10 flex items-center justify-center flex-shrink-0">
              <Shield size={16} className="text-lime-brand" />
            </div>
            <div>
              <div className="text-white font-medium text-sm">Fleet Management</div>
              <div className="text-gray-500 text-xs">Squadron deployment and tracking</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => onEnter('shipyard')}
            className="group flex items-center justify-center gap-2 px-8 py-4 bg-lime-brand text-black font-bold rounded-lg hover:bg-lime-brand/90 transition-all text-lg"
          >
            Explore Fleet
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => onEnter('capabilities')}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-gray-700 text-gray-300 font-medium rounded-lg hover:border-lime-brand/50 hover:text-white transition-all"
          >
            Browse Capabilities
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex gap-8 mt-12 pt-8 border-t border-gray-800">
          <div>
            <div className="text-2xl font-bold text-white">2,662</div>
            <div className="text-gray-500 text-xs uppercase tracking-wider">Vessels</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">9</div>
            <div className="text-gray-500 text-xs uppercase tracking-wider">Squadrons</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">47</div>
            <div className="text-gray-500 text-xs uppercase tracking-wider">Capabilities</div>
          </div>
        </div>
      </div>

      {/* Right side - Map with deployment labels */}
      <div className={`hidden lg:block w-1/2 relative bg-gradient-to-br from-gray-900/80 to-darkest transition-all duration-1000 delay-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        {/* Ocean/map texture */}
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 30% 20%, rgba(6, 182, 212, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 60%, rgba(6, 182, 212, 0.05) 0%, transparent 40%),
              radial-gradient(ellipse at 50% 80%, rgba(6, 182, 212, 0.06) 0%, transparent 45%)
            `
          }}
        />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(203,253,0,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(203,253,0,0.15) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />

        {/* Header */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
          <div className="text-gray-500 text-xs font-mono tracking-wider">OPERATIONAL THEATER</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-400 text-xs font-mono">4 ACTIVE</span>
          </div>
        </div>

        {/* Deployment dots with labels */}
        {deployments.map((dep, idx) => {
          const PlatformIcon = dep.platform.icon;
          const isVisible = visibleDots.includes(idx);
          const isLeft = dep.labelSide === 'left';

          return (
            <div
              key={dep.mission}
              className={`absolute transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
              style={{
                left: `${dep.x}%`,
                top: `${dep.y}%`,
              }}
            >
              {/* Ping effect */}
              <div className="absolute -inset-4 flex items-center justify-center">
                <div
                  className="w-12 h-12 rounded-full border border-lime-brand/20"
                  style={{
                    animation: isVisible ? 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' : 'none',
                    animationDelay: `${idx * 0.5}s`
                  }}
                />
              </div>

              {/* Dot */}
              <div className={`relative w-4 h-4 rounded-full ${dep.status === 'ACTIVE' ? 'bg-lime-brand' : 'bg-yellow-500'} shadow-lg`}
                style={{ boxShadow: dep.status === 'ACTIVE' ? '0 0 20px rgba(203,253,0,0.5)' : '0 0 20px rgba(234,179,8,0.5)' }}
              >
                <div className={`absolute inset-0 rounded-full ${dep.status === 'ACTIVE' ? 'bg-lime-brand' : 'bg-yellow-500'} animate-ping opacity-30`} />
              </div>

              {/* Label card */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 ${isLeft ? 'right-8' : 'left-8'}`}
                style={{ width: '180px' }}
              >
                <div className="bg-gray-900/95 border border-gray-700/80 rounded-lg p-3 backdrop-blur-sm">
                  {/* Mission name */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${dep.status === 'ACTIVE' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <span className="text-white font-bold text-xs tracking-wide">{dep.mission}</span>
                  </div>

                  {/* Platform row */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded bg-gray-800 flex items-center justify-center">
                      <PlatformIcon size={14} className="text-lime-brand" />
                    </div>
                    <div>
                      <div className="text-gray-300 text-[11px] font-medium">{dep.platform.name}</div>
                      <div className="text-gray-500 text-[10px]">{dep.platform.count} vessels • {dep.region}</div>
                    </div>
                  </div>

                  {/* Capability pills */}
                  <div className="flex flex-wrap gap-1">
                    {dep.capabilities.map(cap => (
                      <span
                        key={cap}
                        className="px-1.5 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300 text-[9px] font-medium"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Connector line */}
                <div
                  className={`absolute top-1/2 ${isLeft ? '-right-4' : '-left-4'} w-4 h-px bg-gray-600`}
                  style={{ transform: 'translateY(-50%)' }}
                />
              </div>
            </div>
          );
        })}

        {/* Center TempestOS indicator */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-16 h-16 rounded-full border border-lime-brand/20 flex items-center justify-center bg-darkest/60">
            <div className="w-10 h-10 rounded-full border border-lime-brand/40 flex items-center justify-center">
              <Cpu size={20} className="text-lime-brand/70" />
            </div>
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-lime-brand/60 text-[10px] font-mono">TempestOS</span>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs font-mono text-gray-600">
          <span>Live configurations</span>
          <span>490 vessels deployed</span>
        </div>
      </div>
    </div>
  );
};

export default SplashPageC;
