import { useState, useEffect } from 'react';
import { ChevronRight, Cpu, Layers, Navigation, Ship, Anchor, Radio, Target, Shield, Plane, Waves, Settings } from 'lucide-react';

/**
 * Splash Page C: Platform Overview
 * Mission-first cards showing configured deployments
 */
const SplashPageC = ({ onEnter }) => {
  const [showContent, setShowContent] = useState(false);
  const [visibleCards, setVisibleCards] = useState([]);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 100);

    // Stagger card appearance to show "assembling" feel
    const timers = [
      setTimeout(() => setVisibleCards(v => [...v, 0]), 400),
      setTimeout(() => setVisibleCards(v => [...v, 1]), 700),
      setTimeout(() => setVisibleCards(v => [...v, 2]), 1000),
      setTimeout(() => setVisibleCards(v => [...v, 3]), 1300),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  // Active missions with their configurations
  const missions = [
    {
      name: 'SEA DENIAL',
      region: 'Strait of Hormuz',
      platform: { name: 'MetalShark USV', icon: Anchor, count: 280 },
      capabilities: [
        { name: 'Guardian AI', color: '#f59e0b' },
        { name: 'Mesh Comms', color: '#8b5cf6' },
        { name: 'Passive Radar', color: '#06b6d4' }
      ],
      configuredAgo: '2h',
      status: 'ACTIVE'
    },
    {
      name: 'ISR PATROL',
      region: 'Taiwan Strait',
      platform: { name: 'Saildrone Explorer', icon: Radio, count: 117 },
      capabilities: [
        { name: 'EW Suite', color: '#ec4899' },
        { name: 'SIGINT Array', color: '#06b6d4' },
        { name: 'Sat Uplink', color: '#8b5cf6' }
      ],
      configuredAgo: '45m',
      status: 'ACTIVE'
    },
    {
      name: 'CONVOY ESCORT',
      region: 'Red Sea Transit',
      platform: { name: 'MQ-9 Reaper', icon: Plane, count: 48 },
      capabilities: [
        { name: 'Swarm Coord', color: '#f59e0b' },
        { name: 'Strike Package', color: '#ef4444' },
        { name: 'ISR Pod', color: '#06b6d4' }
      ],
      configuredAgo: '6h',
      status: 'STANDBY'
    },
    {
      name: 'SIGINT COLLECTION',
      region: 'South China Sea',
      platform: { name: 'SubSeaSail UUV', icon: Waves, count: 45 },
      capabilities: [
        { name: 'ASW Package', color: '#06b6d4' },
        { name: 'Acoustic Array', color: '#8b5cf6' },
        { name: 'Covert Nav', color: '#22c55e' }
      ],
      configuredAgo: '12h',
      status: 'ACTIVE'
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

      {/* Right side - Mission Cards */}
      <div className={`hidden lg:flex w-1/2 relative bg-gradient-to-br from-gray-900/50 to-darkest flex-col transition-all duration-1000 delay-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Header */}
        <div className="relative z-10 p-6 pb-2">
          <div className="flex items-center justify-between">
            <div className="text-gray-500 text-xs font-mono tracking-wider">ACTIVE MISSIONS</div>
            <div className="flex items-center gap-2">
              <Settings size={12} className="text-gray-600" />
              <span className="text-gray-600 text-xs font-mono">LIVE CONFIG</span>
            </div>
          </div>
        </div>

        {/* Mission Cards */}
        <div className="relative z-10 flex-1 px-6 py-2 space-y-3 overflow-hidden">
          {missions.map((mission, idx) => {
            const PlatformIcon = mission.platform.icon;
            const isVisible = visibleCards.includes(idx);

            return (
              <div
                key={mission.name}
                className={`bg-gray-900/80 border border-gray-700/50 rounded-xl overflow-hidden transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                }`}
              >
                {/* Mission Header */}
                <div className="px-4 py-3 border-b border-gray-700/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${mission.status === 'ACTIVE' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <div>
                      <div className="text-white font-bold text-sm tracking-wide">
                        MISSION: {mission.name}
                      </div>
                      <div className="text-gray-500 text-xs">{mission.region}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-mono ${mission.status === 'ACTIVE' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {mission.status}
                    </div>
                  </div>
                </div>

                {/* Configuration */}
                <div className="px-4 py-3">
                  <div className="text-gray-600 text-[10px] uppercase tracking-wider mb-2">Configured with</div>

                  {/* Lego blocks row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Platform block */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-800 border border-gray-600/50 rounded-lg">
                      <PlatformIcon size={14} className="text-lime-brand" />
                      <span className="text-gray-300 text-xs font-medium">{mission.platform.name}</span>
                      <span className="text-gray-500 text-xs">×{mission.platform.count}</span>
                    </div>

                    <span className="text-gray-600 text-xs">+</span>

                    {/* Capability blocks */}
                    {mission.capabilities.map((cap, capIdx) => (
                      <div
                        key={cap.name}
                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium"
                        style={{
                          backgroundColor: `${cap.color}15`,
                          borderWidth: 1,
                          borderColor: `${cap.color}40`
                        }}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: cap.color }}
                        />
                        <span style={{ color: cap.color }}>{cap.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Timestamp */}
                  <div className="mt-2 text-gray-600 text-[10px]">
                    Configured {mission.configuredAgo} ago
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="relative z-10 p-6 pt-2 border-t border-gray-800/50">
          <div className="flex items-center justify-between text-xs font-mono text-gray-600">
            <span>Powered by TempestOS</span>
            <span>4 missions • 490 vessels deployed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashPageC;
