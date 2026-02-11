import { useState, useEffect } from 'react';
import { ChevronRight, Cpu, Layers, Navigation, Ship, Anchor, Radio, Target, Shield, Plane } from 'lucide-react';

/**
 * Splash Page C: Platform Overview
 * Split hero with messaging and live deployment status
 */
const SplashPageC = ({ onEnter }) => {
  const [showContent, setShowContent] = useState(false);
  const [activeMission, setActiveMission] = useState(0);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 100);

    // Cycle through active missions
    const interval = setInterval(() => {
      setActiveMission(m => (m + 1) % 4);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Active deployments with real squadron/mission/stack data
  const activeDeployments = [
    {
      squadron: 'MetalShark Patrol',
      vessels: 280,
      mission: 'Hormuz Sea Denial',
      stack: 'Guardian AI Targeting',
      status: 'ACTIVE',
      icon: Anchor,
      color: '#22c55e'
    },
    {
      squadron: 'Saildrone Autonomous',
      vessels: 117,
      mission: 'Taiwan Strait ISR',
      stack: 'Autonomous EW Nav Suite',
      status: 'ACTIVE',
      icon: Radio,
      color: '#22c55e'
    },
    {
      squadron: 'MQ-9 Strike Wing',
      vessels: 48,
      mission: 'Red Sea Convoy Guard',
      stack: 'Swarm Coordination',
      status: 'STANDBY',
      icon: Plane,
      color: '#eab308'
    },
    {
      squadron: 'SubSeaSail UUV',
      vessels: 45,
      mission: 'SCS SIGINT Collection',
      stack: 'ASW Detection Package',
      status: 'ACTIVE',
      icon: Navigation,
      color: '#22c55e'
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
              <div className="text-gray-500 text-xs">Drag-and-drop payload configuration</div>
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

      {/* Right side - Active Deployments */}
      <div className={`hidden lg:flex w-1/2 relative bg-gradient-to-br from-gray-900 to-darkest flex-col transition-all duration-1000 delay-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(203,253,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(203,253,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Header */}
        <div className="relative z-10 p-8 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-500 text-xs font-mono tracking-wider mb-1">LIVE FLEET STATUS</div>
              <div className="text-white text-xl font-bold">Active Deployments</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400 text-sm font-mono">4 MISSIONS ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Deployment cards */}
        <div className="relative z-10 flex-1 px-8 py-4 space-y-4 overflow-hidden">
          {activeDeployments.map((deployment, idx) => {
            const Icon = deployment.icon;
            const isActive = activeMission === idx;

            return (
              <div
                key={deployment.squadron}
                className={`relative p-4 rounded-xl border transition-all duration-500 ${
                  isActive
                    ? 'bg-lime-brand/5 border-lime-brand/50 scale-[1.02]'
                    : 'bg-gray-900/50 border-gray-700/50'
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -left-px top-4 bottom-4 w-1 bg-lime-brand rounded-full" />
                )}

                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                    isActive ? 'bg-lime-brand/20' : 'bg-gray-800'
                  }`}
                  >
                    <Icon size={24} className={isActive ? 'text-lime-brand' : 'text-gray-500'} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className={`font-bold transition-colors ${isActive ? 'text-lime-brand' : 'text-white'}`}>
                        {deployment.squadron}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: deployment.color }}
                        />
                        <span
                          className="text-xs font-mono"
                          style={{ color: deployment.color }}
                        >
                          {deployment.status}
                        </span>
                      </div>
                    </div>

                    <div className="text-gray-400 text-sm mb-2">
                      {deployment.vessels} vessels • <span className="text-cyan-400">{deployment.mission}</span>
                    </div>

                    {/* Stack badge */}
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded text-xs">
                      <Cpu size={10} className="text-purple-400" />
                      <span className="text-purple-300">{deployment.stack}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom status */}
        <div className="relative z-10 p-8 pt-4 border-t border-gray-800/50">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-4">
              <span className="text-gray-600">TempestOS v2.4.1</span>
              <span className="text-gray-600">|</span>
              <span className="text-lime-brand">ALL SYSTEMS NOMINAL</span>
            </div>
            <div className="text-gray-500">
              Last sync: <span className="text-gray-400">2s ago</span>
            </div>
          </div>
        </div>

        {/* Decorative corner */}
        <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-lime-brand/20 rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-lime-brand/20 rounded-bl-lg" />
      </div>
    </div>
  );
};

export default SplashPageC;
