import { useState, useEffect } from 'react';
import { ChevronRight, Cpu, Layers, Ship, Anchor, Radio, Target, Shield, Plane, Waves, Zap, Plus, ArrowUp } from 'lucide-react';

/**
 * Splash Page C: Platform Overview
 * Option 3: Matching tiles with animated deployment connection
 */
const SplashPageC = ({ onEnter }) => {
  const [showContent, setShowContent] = useState(false);
  const [visibleItems, setVisibleItems] = useState([]);
  const [deployingItem, setDeployingItem] = useState(null);
  const [deployedItems, setDeployedItems] = useState([]);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 100);

    // Stagger appearance
    const timers = [];
    for (let i = 0; i < 20; i++) {
      timers.push(setTimeout(() => setVisibleItems(v => [...v, i]), 150 + i * 100));
    }

    // Deployment animation story
    const deployTimer = setTimeout(() => {
      // Deploy "Black Widow" to Surface
      setDeployingItem('black-widow');
      setTimeout(() => {
        setDeployedItems(prev => [...prev, 'black-widow']);
        setDeployingItem(null);

        // Then deploy "Phantom Wing" to Aerial
        setTimeout(() => {
          setDeployingItem('phantom-wing');
          setTimeout(() => {
            setDeployedItems(prev => [...prev, 'phantom-wing']);
            setDeployingItem(null);
          }, 1500);
        }, 1000);
      }, 1500);
    }, 3000);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(deployTimer);
    };
  }, []);

  // All deployed missions
  const deployedMissions = [
    { id: 'd0', name: 'CONVOY ESCORT', platform: 'MQ-9', icon: Plane, count: 48, capabilities: ['Swarm', 'Strike'], status: 'ACTIVE', domain: 'AERIAL' },
    { id: 'd1', name: 'OVERWATCH', platform: 'MQ-4C', icon: Plane, count: 12, capabilities: ['ISR', 'SIGINT'], status: 'ACTIVE', domain: 'AERIAL' },
    { id: 'd2', name: 'SEA DENIAL', platform: 'MetalShark', icon: Anchor, count: 280, capabilities: ['Guardian AI'], status: 'ACTIVE', domain: 'SURFACE' },
    { id: 'd3', name: 'REFIT', platform: 'AEGIR-F', icon: Anchor, count: 24, capabilities: ['Kinetic'], status: 'MAINTENANCE', domain: 'SURFACE' },
    { id: 'd4', name: 'SIGINT OPS', platform: 'SubSeaSail', icon: Waves, count: 45, capabilities: ['ASW'], status: 'ACTIVE', domain: 'SUBSURFACE' },
    { id: 'd5', name: 'CABLE SURVEY', platform: 'Remus', icon: Waves, count: 8, capabilities: ['Sonar'], status: 'ACTIVE', domain: 'SUBSURFACE' },
  ];

  // Mission Bay items (ready to deploy)
  const bayItems = [
    { id: 'black-widow', name: 'Black Widow', platform: 'MetalShark', icon: Anchor, status: 'READY', capabilities: ['Guardian AI'], targetDomain: 'SURFACE' },
    { id: 'deep-six', name: 'Deep Six', platform: 'SubSeaSail', icon: Waves, status: 'CONFIGURING', progress: 72, capabilities: ['ASW'], targetDomain: 'SUBSURFACE' },
    { id: 'tidehunter', name: 'Tidehunter', platform: 'Saildrone', icon: Radio, status: 'READY', capabilities: ['ISR'], targetDomain: 'SURFACE' },
    { id: 'phantom-wing', name: 'Phantom Wing', platform: 'MQ-25', icon: Plane, status: 'READY', capabilities: ['Tanker'], targetDomain: 'AERIAL' },
    { id: 'viper-squad', name: 'Viper Squad', platform: 'MQ-9B', icon: Plane, status: 'READY', capabilities: ['Strike'], targetDomain: 'AERIAL' },
    { id: 'sentinel', name: 'Sentinel', platform: 'MQ-4C', icon: Plane, status: 'CONFIGURING', progress: 88, capabilities: ['SIGINT'], targetDomain: 'AERIAL' },
  ];

  const getDomainColor = (domain) => {
    switch (domain) {
      case 'AERIAL': return 'bg-slate-600 text-slate-200';
      case 'SURFACE': return 'bg-cyan-700 text-cyan-100';
      case 'SUBSURFACE': return 'bg-blue-800 text-blue-100';
      default: return 'bg-gray-600 text-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return { dot: 'bg-green-500', text: 'text-green-400' };
      case 'MAINTENANCE': return { dot: 'bg-orange-500', text: 'text-orange-400' };
      case 'CONFIGURING': return { dot: 'bg-blue-500', text: 'text-blue-400' };
      case 'READY': return { dot: 'bg-lime-brand', text: 'text-lime-brand' };
      default: return { dot: 'bg-gray-500', text: 'text-gray-400' };
    }
  };

  // Unified tile component - same format for deployed and bay items
  const UnifiedTile = ({ item, isDeployed = false, isDeploying = false, isNewlyDeployed = false }) => {
    const Icon = item.icon;
    const isVisible = visibleItems.includes(item.id) || visibleItems.length > 15;
    const colors = getStatusColor(item.status);
    const domain = isDeployed ? item.domain : item.targetDomain;

    // Deploying animation state
    if (isDeploying) {
      return (
        <div className="w-[160px] h-[85px] relative">
          <div className="absolute inset-0 bg-lime-brand/20 border-2 border-dashed border-lime-brand/60 rounded-lg flex flex-col items-center justify-center gap-2 animate-pulse">
            <ArrowUp size={20} className="text-lime-brand animate-bounce" />
            <span className="text-lime-brand text-xs font-mono">DEPLOYING...</span>
          </div>
        </div>
      );
    }

    return (
      <div className={`w-[160px] h-[85px] bg-gray-800/90 border border-gray-600/50 rounded-lg p-3 transition-all duration-500
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${isNewlyDeployed ? 'ring-2 ring-lime-brand animate-pulse' : ''}
        ${!isDeployed && item.status === 'READY' ? 'hover:border-lime-brand cursor-pointer' : ''}
      `}
      >
        {/* Header: Name + Status */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-bold text-sm truncate max-w-[100px]">{item.name}</span>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${colors.dot} ${item.status === 'ACTIVE' ? 'animate-pulse' : ''}`} />
          </div>
        </div>

        {/* Platform info */}
        <div className="flex items-center gap-2 mb-2">
          <Icon size={14} className="text-lime-brand flex-shrink-0" />
          <span className="text-gray-400 text-xs">
            {item.platform}
            {item.count && ` ×${item.count}`}
          </span>
        </div>

        {/* Progress bar for configuring items */}
        {item.progress !== undefined && (
          <div className="mb-2">
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer: Capability + Domain badge */}
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300 text-[10px]">
            {item.capabilities[0]}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${getDomainColor(domain)}`}>
            {domain}
          </span>
        </div>
      </div>
    );
  };

  // Items that are still in bay (not deployed yet)
  const remainingBayItems = bayItems.filter(item => !deployedItems.includes(item.id));

  // Newly deployed items (from bay)
  const newlyDeployedFromBay = bayItems.filter(item => deployedItems.includes(item.id)).map(item => ({
    ...item,
    status: 'ACTIVE',
    domain: item.targetDomain,
    count: item.platform.includes('MQ') ? 24 : 48,
  }));

  return (
    <div className="fixed inset-0 bg-darkest flex overflow-hidden">
      {/* Left side - Messaging */}
      <div className={`w-full lg:w-[32%] flex flex-col justify-center px-6 md:px-10 lg:px-8 transition-all duration-1000 ${showContent ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
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

        <p className="text-gray-400 text-sm mb-5 max-w-sm leading-relaxed">
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

        <div className="flex gap-5 pt-4 border-t border-gray-800">
          <div><div className="text-lg font-bold text-white">2,662</div><div className="text-gray-500 text-[10px]">Vessels</div></div>
          <div><div className="text-lg font-bold text-white">9</div><div className="text-gray-500 text-[10px]">Squadrons</div></div>
          <div><div className="text-lg font-bold text-white">47</div><div className="text-gray-500 text-[10px]">Capabilities</div></div>
        </div>
      </div>

      {/* Right side - Deployed + Mission Bay with matching tiles */}
      <div className={`hidden lg:flex w-[68%] flex-col transition-all duration-1000 delay-200 ${showContent ? 'opacity-100' : 'opacity-0'}`}>

        {/* DEPLOYED Section */}
        <div className="flex-1 bg-gradient-to-b from-gray-900/50 to-gray-800/30 p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-white text-sm font-bold tracking-wider">DEPLOYED</span>
              <span className="text-gray-500 text-xs font-mono">{deployedMissions.length + newlyDeployedFromBay.length} ACTIVE MISSIONS</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-green-400 text-xs">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {deployedMissions.filter(d => d.status === 'ACTIVE').length + newlyDeployedFromBay.length} Active
              </span>
              <span className="flex items-center gap-1 text-orange-400 text-xs">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                {deployedMissions.filter(d => d.status === 'MAINTENANCE').length} Maint
              </span>
            </div>
          </div>

          {/* Deployed tiles grid */}
          <div className="flex flex-wrap gap-3 content-start">
            {deployedMissions.map(mission => (
              <UnifiedTile key={mission.id} item={mission} isDeployed />
            ))}
            {newlyDeployedFromBay.map(mission => (
              <UnifiedTile key={mission.id} item={mission} isDeployed isNewlyDeployed />
            ))}
          </div>
        </div>

        {/* Deploy arrow indicator */}
        {deployingItem && (
          <div className="h-12 flex items-center justify-center bg-gradient-to-b from-transparent via-lime-brand/10 to-transparent">
            <div className="flex items-center gap-2 text-lime-brand">
              <ArrowUp size={20} className="animate-bounce" />
              <span className="text-sm font-mono">DEPLOYING TO MISSION</span>
              <ArrowUp size={20} className="animate-bounce" />
            </div>
          </div>
        )}

        {/* MISSION BAY Section */}
        <div className="h-[180px] bg-gray-900 border-t-2 border-lime-brand/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-lime-brand" />
              <span className="text-lime-brand text-sm font-bold tracking-wider">MISSION BAY</span>
              <span className="text-gray-500 text-xs font-mono ml-2">STAGING AREA</span>
            </div>
            <span className="text-gray-500 text-xs font-mono">{remainingBayItems.filter(i => i.status === 'READY').length} READY TO DEPLOY</span>
          </div>

          {/* Bay tiles */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {remainingBayItems.map(item => (
              <UnifiedTile
                key={item.id}
                item={item}
                isDeploying={deployingItem === item.id}
              />
            ))}
            {/* Configure Your Own CTA */}
            <div
              onClick={() => onEnter('shipyard')}
              className="w-[160px] h-[85px] bg-lime-brand/10 border-2 border-dashed border-lime-brand/50 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-lime-brand/20 hover:border-lime-brand transition-all flex-shrink-0"
            >
              <div className="w-10 h-10 rounded-full bg-lime-brand/20 flex items-center justify-center">
                <Plus size={20} className="text-lime-brand" />
              </div>
              <span className="text-lime-brand text-xs font-bold">Configure Your Own</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashPageC;
