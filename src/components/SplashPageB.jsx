import { useState, useEffect } from 'react';
import { Anchor, Shield, Crosshair, ChevronRight, Radio, Zap } from 'lucide-react';

/**
 * Splash Page B: Mission Brief Style
 * Military briefing aesthetic with dramatic status display
 */
const SplashPageB = ({ onEnter }) => {
  const [counters, setCounters] = useState({ vessels: 0, squadrons: 0, capabilities: 0 });
  const [statusReady, setStatusReady] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Animated counters
  useEffect(() => {
    const targets = { vessels: 2662, squadrons: 9, capabilities: 47 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      setCounters({
        vessels: Math.floor(targets.vessels * eased),
        squadrons: Math.floor(targets.squadrons * eased),
        capabilities: Math.floor(targets.capabilities * eased)
      });

      if (step >= steps) {
        clearInterval(timer);
        setCounters(targets);
        setTimeout(() => setStatusReady(true), 300);
      }
    }, interval);

    // Fade in content
    setTimeout(() => setShowContent(true), 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-darkest flex flex-col items-center justify-center overflow-hidden">
      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
        }}
      />

      {/* Grid background */}
      <div className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(203,253,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(203,253,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Corner accents */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-lime-brand/50" />
      <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-lime-brand/50" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-lime-brand/50" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-lime-brand/50" />

      {/* Main content */}
      <div className={`relative z-10 text-center transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Top classification bar */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-16 bg-lime-brand/50" />
          <span className="text-lime-brand/70 text-xs tracking-[0.3em] font-mono">CALIBURN SYSTEMS</span>
          <div className="h-px w-16 bg-lime-brand/50" />
        </div>

        {/* Mission Bay title */}
        <h1 className="text-6xl md:text-8xl font-black text-white mb-4 tracking-tight">
          MISSION <span className="text-lime-brand">BAY</span>
        </h1>

        {/* Status indicator */}
        <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border-2 mb-12 transition-all duration-500 ${
          statusReady
            ? 'border-lime-brand bg-lime-brand/10'
            : 'border-yellow-500/50 bg-yellow-500/5'
        }`}
        >
          <div className={`w-3 h-3 rounded-full ${statusReady ? 'bg-lime-brand animate-pulse' : 'bg-yellow-500 animate-pulse'}`} />
          <span className={`font-mono text-sm tracking-wider ${statusReady ? 'text-lime-brand' : 'text-yellow-500'}`}>
            {statusReady ? 'FLEET STATUS: OPERATIONAL' : 'INITIALIZING SYSTEMS...'}
          </span>
        </div>

        {/* Animated counters */}
        <div className="grid grid-cols-3 gap-8 md:gap-16 mb-12">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-white font-mono mb-2">
              {counters.vessels.toLocaleString()}
            </div>
            <div className="text-gray-500 text-sm uppercase tracking-wider">Vessels</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-white font-mono mb-2">
              {counters.squadrons}
            </div>
            <div className="text-gray-500 text-sm uppercase tracking-wider">Squadrons</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-white font-mono mb-2">
              {counters.capabilities}
            </div>
            <div className="text-gray-500 text-sm uppercase tracking-wider">Capabilities</div>
          </div>
        </div>

        {/* Entry points */}
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
          <button
            onClick={() => onEnter('shipyard')}
            className="group flex items-center justify-center gap-3 px-8 py-4 bg-lime-brand text-black font-bold rounded-lg hover:bg-lime-brand/90 transition-all"
          >
            <Anchor size={20} />
            Fleet Command
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => onEnter('capabilities')}
            className="group flex items-center justify-center gap-3 px-8 py-4 bg-transparent border-2 border-gray-600 text-gray-300 font-bold rounded-lg hover:border-lime-brand hover:text-lime-brand transition-all"
          >
            <Shield size={20} />
            Capabilities
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => onEnter('squadron')}
            className="group flex items-center justify-center gap-3 px-8 py-4 bg-transparent border-2 border-gray-600 text-gray-300 font-bold rounded-lg hover:border-lime-brand hover:text-lime-brand transition-all"
          >
            <Crosshair size={20} />
            Plan Mission
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Tagline */}
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Autonomous fleet configuration and deployment platform powered by TempestOS
        </p>
      </div>

      {/* Bottom status bar */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-darkest/80 border-t border-gray-800 flex items-center justify-center gap-8 text-xs font-mono text-gray-600">
        <span className="flex items-center gap-2">
          <Radio size={12} className="text-lime-brand" />
          COMMS ONLINE
        </span>
        <span className="flex items-center gap-2">
          <Zap size={12} className="text-lime-brand" />
          SYSTEMS NOMINAL
        </span>
        <span>TempestOS v2.4.1</span>
      </div>
    </div>
  );
};

export default SplashPageB;
