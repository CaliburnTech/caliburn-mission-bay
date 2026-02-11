import { useState, useEffect } from 'react';
import { ChevronRight, Cpu, Layers, Navigation, Ship, Anchor, Radio, Target, Shield, Plane } from 'lucide-react';

/**
 * Splash Page C: Platform Overview
 * Split hero with messaging and animated fleet visualization
 */
const SplashPageC = ({ onEnter }) => {
  const [showContent, setShowContent] = useState(false);
  const [activeDeployment, setActiveDeployment] = useState(0);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 100);

    // Cycle through deployments
    const interval = setInterval(() => {
      setActiveDeployment(d => (d + 1) % 4);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Deployed squadrons with positions on the visualization
  const deployments = [
    {
      squadron: 'MetalShark Patrol',
      vessels: 280,
      mission: 'Hormuz Sea Denial',
      stack: 'Guardian AI Targeting',
      icon: Anchor,
      x: 25,
      y: 30
    },
    {
      squadron: 'Saildrone Autonomous',
      vessels: 117,
      mission: 'Taiwan Strait ISR',
      stack: 'Autonomous EW Nav Suite',
      icon: Radio,
      x: 70,
      y: 25
    },
    {
      squadron: 'MQ-9 Strike Wing',
      vessels: 48,
      mission: 'Red Sea Convoy Guard',
      stack: 'Swarm Coordination',
      icon: Plane,
      x: 30,
      y: 70
    },
    {
      squadron: 'SubSeaSail UUV',
      vessels: 45,
      mission: 'SCS SIGINT Collection',
      stack: 'ASW Detection Package',
      icon: Navigation,
      x: 75,
      y: 65
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

      {/* Right side - Animated fleet visualization */}
      <div className={`hidden lg:flex w-1/2 relative bg-gradient-to-br from-gray-900 to-darkest items-center justify-center transition-all duration-1000 delay-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(203,253,0,0.1) 0%, transparent 50%),
              linear-gradient(rgba(203,253,0,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(203,253,0,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 40px 40px, 40px 40px'
          }}
        />

        {/* Deployed squadrons as dots with metadata */}
        <div className="relative w-full h-full">
          {deployments.map((deployment, idx) => {
            const Icon = deployment.icon;
            const isActive = activeDeployment === idx;

            return (
              <div
                key={deployment.squadron}
                className={`absolute transition-all duration-700 ${isActive ? 'z-20' : 'z-10'}`}
                style={{
                  left: `${deployment.x}%`,
                  top: `${deployment.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {/* Radar ping effect for active */}
                {isActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border border-lime-brand/30 animate-ping" style={{ animationDuration: '2s' }} />
                  </div>
                )}

                {/* Orbit ring */}
                <svg className="absolute w-24 h-24 -ml-12 -mt-12 pointer-events-none" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={isActive ? 'rgba(203,253,0,0.3)' : 'rgba(255,255,255,0.1)'}
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    className={isActive ? 'animate-spin' : ''}
                    style={{ animationDuration: '10s', transformOrigin: 'center' }}
                  />
                </svg>

                {/* Main dot */}
                <div className={`relative w-5 h-5 rounded-full transition-all duration-500 flex items-center justify-center ${
                  isActive
                    ? 'bg-lime-brand shadow-lg shadow-lime-brand/50 scale-125'
                    : 'bg-gray-500'
                }`}>
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-lime-brand animate-ping opacity-40" />
                  )}
                </div>

                {/* Metadata label */}
                <div className={`absolute left-8 top-1/2 -translate-y-1/2 transition-all duration-500 ${
                  isActive ? 'opacity-100 translate-x-0' : 'opacity-50 -translate-x-1'
                }`}
                style={{ width: '200px' }}
                >
                  {/* Squadron name */}
                  <div className={`font-bold text-sm whitespace-nowrap transition-colors ${
                    isActive ? 'text-lime-brand' : 'text-gray-400'
                  }`}>
                    {deployment.squadron}
                  </div>

                  {/* Vessel count + Mission */}
                  <div className="text-xs text-gray-500 whitespace-nowrap">
                    {deployment.vessels} vessels • <span className={isActive ? 'text-cyan-400' : 'text-gray-500'}>{deployment.mission}</span>
                  </div>

                  {/* Stack badge - only show when active */}
                  {isActive && (
                    <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-purple-500/20 border border-purple-500/40 rounded text-[10px]">
                      <Cpu size={8} className="text-purple-400" />
                      <span className="text-purple-300">{deployment.stack}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Center TempestOS hub */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-20 h-20 rounded-full border-2 border-lime-brand/30 flex items-center justify-center bg-darkest/80">
              <div className="w-12 h-12 rounded-full border border-lime-brand/50 flex items-center justify-center">
                <Cpu size={24} className="text-lime-brand" />
              </div>
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <div className="text-lime-brand text-xs font-mono tracking-wider">TempestOS</div>
            </div>
          </div>
        </div>

        {/* Status indicators */}
        <div className="absolute top-8 right-8 text-right">
          <div className="text-gray-600 text-xs font-mono">FLEET.STATUS</div>
          <div className="text-lime-brand text-sm font-mono flex items-center justify-end gap-2">
            <span className="w-2 h-2 rounded-full bg-lime-brand animate-pulse" />
            OPERATIONAL
          </div>
        </div>
        <div className="absolute bottom-8 right-8 text-right">
          <div className="text-gray-600 text-xs font-mono">ACTIVE.MISSIONS</div>
          <div className="text-white text-sm font-mono">4</div>
        </div>
        <div className="absolute bottom-8 left-8 text-left">
          <div className="text-gray-600 text-xs font-mono">TempestOS v2.4.1</div>
        </div>
      </div>
    </div>
  );
};

export default SplashPageC;
