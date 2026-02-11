import { useState, useEffect } from 'react';
import { ChevronRight, Cpu, Layers, Ship, Anchor, Radio, Target, Shield, Plane, Waves, Zap } from 'lucide-react';

/**
 * Splash Page C: Platform Overview
 * Domain-oriented map with Mission Bay (Pier + Hangar)
 * Animated deployment story
 */
const SplashPageC = ({ onEnter }) => {
  const [showContent, setShowContent] = useState(false);
  const [visibleItems, setVisibleItems] = useState([]);

  // Animation states for the story
  const [deployingItem, setDeployingItem] = useState(null); // Item being deployed from bay
  const [configuringItem, setConfiguringItem] = useState(null); // Item being configured
  const [configProgress, setConfigProgress] = useState(0);
  const [returningItem, setReturningItem] = useState(null); // Item returning to bay

  useEffect(() => {
    setTimeout(() => setShowContent(true), 100);

    // Stagger appearance of items
    const timers = [];
    for (let i = 0; i < 25; i++) {
      timers.push(setTimeout(() => setVisibleItems(v => [...v, i]), 200 + i * 80));
    }

    // Start the deployment story after items appear
    const storyTimer = setTimeout(() => {
      // Story 1: Deploy "Hammerhead" from Pier to Surface
      setDeployingItem('hammerhead');

      // Story 2: Configure "Nighthawk" and deploy it
      setTimeout(() => {
        setConfiguringItem('nighthawk');
        let progress = 45;
        const configInterval = setInterval(() => {
          progress += 3;
          setConfigProgress(progress);
          if (progress >= 100) {
            clearInterval(configInterval);
            setTimeout(() => {
              setConfiguringItem(null);
              setDeployingItem('nighthawk');
            }, 500);
          }
        }, 100);
      }, 2000);

      // Story 3: Return "ISR PATROL" from Surface to Pier
      setTimeout(() => {
        setReturningItem('isr-patrol');
      }, 5000);

    }, 3000);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(storyTimer);
    };
  }, []);

  // Deployed assets organized by domain
  const deployments = [
    // AERIAL
    { id: 'd0', mission: 'CONVOY ESCORT', platform: 'MQ-9', icon: Plane, count: 48, capabilities: ['Swarm', 'Strike'], status: 'ACTIVE', x: 18, y: 12 },
    { id: 'd1', mission: 'OVERWATCH', platform: 'MQ-4C', icon: Plane, count: 12, capabilities: ['ISR', 'SIGINT'], status: 'ACTIVE', x: 72, y: 8 },
    { id: 'd2', mission: 'RECON', platform: 'MQ-8C', icon: Plane, count: 6, capabilities: ['ISR'], status: 'ACTIVE', x: 45, y: 15 },
    // SURFACE
    { id: 'd3', mission: 'SEA DENIAL', platform: 'MetalShark', icon: Anchor, count: 280, capabilities: ['Guardian AI', 'Mesh'], status: 'ACTIVE', x: 15, y: 38 },
    { id: 'd4', mission: 'ISR PATROL', platform: 'Saildrone', icon: Radio, count: 117, capabilities: ['EW', 'SIGINT'], status: 'ACTIVE', x: 78, y: 35, returning: true },
    { id: 'd5', mission: 'REFIT', platform: 'AEGIR-F', icon: Anchor, count: 24, capabilities: ['Kinetic'], status: 'MAINTENANCE', x: 48, y: 42 },
    // SUBSURFACE
    { id: 'd6', mission: 'SIGINT OPS', platform: 'SubSeaSail', icon: Waves, count: 45, capabilities: ['ASW'], status: 'ACTIVE', x: 70, y: 62 },
    { id: 'd7', mission: 'CABLE SURVEY', platform: 'Remus', icon: Waves, count: 8, capabilities: ['Sonar'], status: 'ACTIVE', x: 22, y: 58 },
  ];

  // Mission Bay - Pier (maritime) - more items!
  const pierItems = [
    { id: 'p0', name: 'Black Widow', platform: 'MetalShark', icon: Anchor, status: 'READY', capabilities: ['Guardian AI'] },
    { id: 'p1', name: 'Hammerhead', platform: 'AEGIR-W', icon: Anchor, status: 'READY', capabilities: ['Strike Pkg'], deployTarget: 'd-new' },
    { id: 'p2', name: 'Deep Six', platform: 'SubSeaSail', icon: Waves, status: 'CONFIGURING', progress: 72, capabilities: ['ASW'] },
    { id: 'p3', name: 'Tidehunter', platform: 'Saildrone', icon: Radio, status: 'QUEUED', capabilities: ['ISR'] },
    { id: 'p4', name: 'Stingray', platform: 'Remus', icon: Waves, status: 'READY', capabilities: ['Sonar'] },
    { id: 'p5', name: 'Barracuda', platform: 'AEGIR-F', icon: Anchor, status: 'CONFIGURING', progress: 35, capabilities: ['Kinetic'] },
  ];

  // Mission Bay - Hangar (aerial) - more items!
  const hangarItems = [
    { id: 'h0', name: 'Phantom Wing', platform: 'MQ-25', icon: Plane, status: 'READY', capabilities: ['Tanker'] },
    { id: 'h1', name: 'Viper Squad', platform: 'MQ-9B', icon: Plane, status: 'READY', capabilities: ['Strike'] },
    { id: 'h2', name: 'Sentinel', platform: 'MQ-4C', icon: Plane, status: 'QUEUED', capabilities: ['SIGINT'] },
    { id: 'h3', name: 'Nighthawk', platform: 'MQ-8C', icon: Plane, status: 'CONFIGURING', progress: 45, capabilities: ['Recon'], configTarget: true },
    { id: 'h4', name: 'Raptor Eye', platform: 'MQ-9B', icon: Plane, status: 'READY', capabilities: ['ISR'] },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return { dot: 'bg-green-500', border: 'border-green-500/40', bg: 'bg-green-500/10' };
      case 'MAINTENANCE': return { dot: 'bg-orange-500', border: 'border-orange-500/40', bg: 'bg-orange-500/10' };
      case 'CONFIGURING': return { dot: 'bg-blue-500', border: 'border-blue-500/40', bg: 'bg-blue-500/10' };
      case 'READY': return { dot: 'bg-lime-brand', border: 'border-lime-brand/40', bg: 'bg-lime-brand/10' };
      case 'QUEUED': return { dot: 'bg-gray-500', border: 'border-gray-500/40', bg: 'bg-gray-500/10' };
      default: return { dot: 'bg-gray-500', border: 'border-gray-500/40', bg: 'bg-gray-500/10' };
    }
  };

  // Compact tile used everywhere - uniform size
  const CompactTile = ({ item, isDeploying, isConfiguring, configProg }) => {
    const Icon = item.icon;
    const isVisible = visibleItems.includes(item.id) || visibleItems.length > 20;
    const colors = getStatusColor(item.status);
    const progress = isConfiguring ? configProg : item.progress;

    // Handle deploying animation
    if (isDeploying) {
      return (
        <div className="w-[90px] h-[52px] bg-lime-brand/20 border border-lime-brand/60 border-dashed rounded flex items-center justify-center">
          <span className="text-lime-brand text-[8px] font-mono animate-pulse">DEPLOYING...</span>
        </div>
      );
    }

    return (
      <div className={`w-[90px] h-[52px] bg-gray-800/90 border ${colors.border} rounded p-1.5 transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'} ${item.status === 'READY' ? 'hover:border-lime-brand cursor-pointer' : ''}`}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <Icon size={10} className="text-lime-brand" />
            <span className="text-white text-[8px] font-bold truncate max-w-[50px]">{item.name}</span>
          </div>
          <div className={`w-1.5 h-1.5 rounded-full ${colors.dot} ${item.status === 'ACTIVE' ? 'animate-pulse' : ''}`} />
        </div>

        {progress !== undefined && (
          <div className="mb-1">
            <div className="h-0.5 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="flex gap-0.5">
          {item.capabilities.slice(0, 1).map(cap => (
            <span key={cap} className="px-1 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300 text-[6px]">{cap}</span>
          ))}
          <span className="text-gray-500 text-[6px] ml-auto">{item.platform}</span>
        </div>
      </div>
    );
  };

  // Deployment card in domain zones - same compact size
  const DeploymentTile = ({ dep, isReturning }) => {
    const Icon = dep.icon;
    const isVisible = visibleItems.includes(dep.id) || visibleItems.length > 15;
    const colors = getStatusColor(dep.status);

    return (
      <div
        className={`absolute transition-all duration-1000 ${isVisible && !isReturning ? 'opacity-100 scale-100' : isReturning ? 'opacity-50 scale-90' : 'opacity-0 scale-75'}`}
        style={{ left: `${dep.x}%`, top: `${dep.y}%`, transform: 'translate(-50%, -50%)' }}
      >
        <div className={`w-[100px] bg-gray-900/95 border ${colors.border} rounded p-1.5 backdrop-blur-sm ${isReturning ? 'animate-pulse border-dashed' : ''}`}>
          <div className="flex items-center gap-1 mb-1">
            <div className={`w-1.5 h-1.5 rounded-full ${colors.dot} ${dep.status === 'ACTIVE' ? 'animate-pulse' : ''}`} />
            <span className="text-white font-bold text-[8px] truncate">{dep.mission}</span>
          </div>
          <div className="flex items-center gap-1 mb-1">
            <Icon size={9} className="text-lime-brand" />
            <span className="text-gray-400 text-[7px]">{dep.platform} ×{dep.count}</span>
          </div>
          <div className="flex gap-0.5">
            {dep.capabilities.map(cap => (
              <span key={cap} className="px-1 py-0.5 bg-purple-500/15 border border-purple-500/25 rounded text-purple-300 text-[6px]">{cap}</span>
            ))}
          </div>
        </div>
        {isReturning && (
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[7px] text-cyan-400 font-mono whitespace-nowrap">← RETURNING</div>
        )}
      </div>
    );
  };

  const totalInBay = pierItems.length + hangarItems.length;

  return (
    <div className="fixed inset-0 bg-darkest flex overflow-hidden">
      {/* Left side - Messaging */}
      <div className={`w-full lg:w-[38%] flex flex-col justify-center px-6 md:px-10 lg:px-10 transition-all duration-1000 ${showContent ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
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
      <div className={`hidden lg:flex w-[62%] flex-col relative transition-all duration-1000 delay-200 ${showContent ? 'opacity-100' : 'opacity-0'}`}>

        {/* Domain zones */}
        <div className="h-[52%] relative">
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

          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

          <div className="absolute top-2 right-3 flex items-center gap-3 z-20">
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /><span className="text-green-400 text-[9px] font-mono">7 ACTIVE</span></div>
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-orange-500" /><span className="text-orange-400 text-[9px] font-mono">1 MAINT</span></div>
          </div>

          {/* Deployment tiles */}
          {deployments.map((dep) => (
            <DeploymentTile
              key={dep.id}
              dep={dep}
              isReturning={returningItem === 'isr-patrol' && dep.id === 'd4'}
            />
          ))}

          {/* New deployment appearing (from Hammerhead) */}
          {deployingItem === 'hammerhead' && (
            <div className="absolute transition-all duration-1000 opacity-100 scale-100 animate-pulse" style={{ left: '55%', top: '35%', transform: 'translate(-50%, -50%)' }}>
              <div className="w-[100px] bg-lime-brand/20 border border-lime-brand rounded p-1.5 backdrop-blur-sm">
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-lime-brand animate-pulse" />
                  <span className="text-lime-brand font-bold text-[8px]">STRIKE OPS</span>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <Anchor size={9} className="text-lime-brand" />
                  <span className="text-gray-300 text-[7px]">AEGIR-W ×24</span>
                </div>
                <div className="flex gap-0.5">
                  <span className="px-1 py-0.5 bg-lime-brand/20 border border-lime-brand/40 rounded text-lime-brand text-[6px]">Strike Pkg</span>
                </div>
              </div>
            </div>
          )}

          {/* Nighthawk deploying */}
          {deployingItem === 'nighthawk' && (
            <div className="absolute transition-all duration-1000 opacity-100 scale-100 animate-pulse" style={{ left: '60%', top: '12%', transform: 'translate(-50%, -50%)' }}>
              <div className="w-[100px] bg-lime-brand/20 border border-lime-brand rounded p-1.5 backdrop-blur-sm">
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-lime-brand animate-pulse" />
                  <span className="text-lime-brand font-bold text-[8px]">RECON OPS</span>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <Plane size={9} className="text-lime-brand" />
                  <span className="text-gray-300 text-[7px]">MQ-8C ×8</span>
                </div>
                <div className="flex gap-0.5">
                  <span className="px-1 py-0.5 bg-lime-brand/20 border border-lime-brand/40 rounded text-lime-brand text-[6px]">Recon</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mission Bay */}
        <div className="h-[48%] bg-gradient-to-t from-gray-900 via-gray-900/95 to-gray-800/80 border-t-2 border-lime-brand/40 relative overflow-hidden">
          {/* Grid background */}
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `linear-gradient(rgba(203,253,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(203,253,0,0.5) 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />

          {/* Bay header */}
          <div className="absolute top-2 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-lime-brand" />
              <span className="text-lime-brand text-[10px] font-mono tracking-widest font-bold">MISSION BAY</span>
            </div>
            <span className="text-gray-500 text-[9px] font-mono">{totalInBay} READY TO DEPLOY</span>
          </div>

          <div className="absolute top-9 left-3 right-3 bottom-2 flex gap-4">
            {/* Pier section */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-1.5 mb-2">
                <Anchor size={10} className="text-cyan-400" />
                <span className="text-cyan-400 text-[9px] font-mono tracking-wider">PIER</span>
                <span className="text-gray-600 text-[8px]">Maritime</span>
              </div>
              <div className="flex-1 flex flex-wrap gap-1.5 content-start">
                {pierItems.map(item => (
                  <CompactTile
                    key={item.id}
                    item={item}
                    isDeploying={deployingItem === 'hammerhead' && item.name === 'Hammerhead'}
                  />
                ))}
                {/* Returning item placeholder */}
                {returningItem === 'isr-patrol' && (
                  <div className="w-[90px] h-[52px] bg-cyan-500/10 border border-cyan-500/40 border-dashed rounded flex items-center justify-center animate-pulse">
                    <span className="text-cyan-400 text-[8px] font-mono">INCOMING...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="w-px bg-gray-700/50" />

            {/* Hangar section */}
            <div className="w-[42%] flex flex-col">
              <div className="flex items-center gap-1.5 mb-2">
                <Plane size={10} className="text-slate-400" />
                <span className="text-slate-400 text-[9px] font-mono tracking-wider">HANGAR</span>
                <span className="text-gray-600 text-[8px]">Aerial</span>
              </div>
              <div className="flex-1 flex flex-wrap gap-1.5 content-start">
                {hangarItems.map(item => (
                  <CompactTile
                    key={item.id}
                    item={item}
                    isDeploying={deployingItem === 'nighthawk' && item.name === 'Nighthawk'}
                    isConfiguring={configuringItem === 'nighthawk' && item.name === 'Nighthawk'}
                    configProg={configProgress}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashPageC;
