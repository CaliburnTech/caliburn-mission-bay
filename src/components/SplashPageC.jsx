import { useState, useEffect } from 'react';
import { ChevronRight, Cpu, Layers, Navigation, Ship } from 'lucide-react';

/**
 * Splash Page C: Platform Overview
 * Split hero with messaging and animated fleet graphic
 */
const SplashPageC = ({ onEnter }) => {
  const [showContent, setShowContent] = useState(false);
  const [activeVessel, setActiveVessel] = useState(0);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 100);

    // Cycle through vessels
    const interval = setInterval(() => {
      setActiveVessel(v => (v + 1) % 4);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const vessels = [
    { name: 'MetalShark USV', type: 'Surface Patrol', x: 30, y: 40 },
    { name: 'Saildrone', type: 'Long-Range ISR', x: 60, y: 25 },
    { name: 'MQ-9 Reaper', type: 'Aerial Strike', x: 70, y: 60 },
    { name: 'SubSeaSail UUV', type: 'Subsurface Recon', x: 40, y: 70 }
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
              <div className="text-white font-medium text-sm">TempestOS Integration</div>
              <div className="text-gray-500 text-xs">Pre-validated software stacks</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-lime-brand/10 flex items-center justify-center flex-shrink-0">
              <Navigation size={16} className="text-lime-brand" />
            </div>
            <div>
              <div className="text-white font-medium text-sm">Mission Planning</div>
              <div className="text-gray-500 text-xs">Visual route and zone editing</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-lime-brand/10 flex items-center justify-center flex-shrink-0">
              <Ship size={16} className="text-lime-brand" />
            </div>
            <div>
              <div className="text-white font-medium text-sm">Fleet Management</div>
              <div className="text-gray-500 text-xs">Squadron organization and deployment</div>
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

      {/* Right side - Animated graphic */}
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

        {/* Animated vessels */}
        <div className="relative w-full h-full max-w-lg max-h-lg">
          {vessels.map((vessel, idx) => (
            <div
              key={vessel.name}
              className={`absolute transition-all duration-700 ${activeVessel === idx ? 'scale-110' : 'scale-100'}`}
              style={{ left: `${vessel.x}%`, top: `${vessel.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              {/* Connection lines */}
              {activeVessel === idx && (
                <svg className="absolute -inset-20 w-40 h-40 pointer-events-none" style={{ left: '-80px', top: '-80px' }}>
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    stroke="rgba(203,253,0,0.2)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    className="animate-spin"
                    style={{ animationDuration: '10s' }}
                  />
                </svg>
              )}

              {/* Vessel dot */}
              <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
                activeVessel === idx ? 'bg-lime-brand shadow-lg shadow-lime-brand/50' : 'bg-gray-600'
              }`}
              >
                {activeVessel === idx && (
                  <div className="absolute inset-0 rounded-full bg-lime-brand animate-ping opacity-50" />
                )}
              </div>

              {/* Label */}
              <div className={`absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap transition-all duration-300 ${
                activeVessel === idx ? 'opacity-100' : 'opacity-40'
              }`}
              >
                <div className={`text-sm font-medium ${activeVessel === idx ? 'text-lime-brand' : 'text-gray-400'}`}>
                  {vessel.name}
                </div>
                <div className="text-xs text-gray-500">{vessel.type}</div>
              </div>
            </div>
          ))}

          {/* Center hub */}
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

        {/* Decorative elements */}
        <div className="absolute top-8 right-8 text-right">
          <div className="text-gray-600 text-xs font-mono">SYS.STATUS</div>
          <div className="text-lime-brand text-sm font-mono">ONLINE</div>
        </div>
        <div className="absolute bottom-8 right-8 text-right">
          <div className="text-gray-600 text-xs font-mono">FLEET.READY</div>
          <div className="text-lime-brand text-sm font-mono">100%</div>
        </div>
      </div>
    </div>
  );
};

export default SplashPageC;
