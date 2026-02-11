import { useState, useEffect } from 'react';
import { ChevronRight, Cpu, Layers, Ship, Anchor, Radio, Target, Shield, Plane, Waves, Zap, Plus, ArrowUp } from 'lucide-react';

/**
 * Splash Page C: Platform Overview
 * Matching tiles with domain organization (AERIAL/SURFACE/SUBSURFACE)
 * and bay organization (PIER/HANGAR)
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
      // Deploy "Black Widow" from PIER to SURFACE
      setDeployingItem('black-widow');
      setTimeout(() => {
        setDeployedItems(prev => [...prev, 'black-widow']);
        setDeployingItem(null);

        // Then deploy "Phantom Wing" from HANGAR to AERIAL
        setTimeout(() => {
          setDeployingItem('phantom-wing');
          setTimeout(() => {
            setDeployedItems(prev => [...prev, 'phantom-wing']);
            setDeployingItem(null);
          }, 1500);
        }, 1000);
      }, 1500);
    }, 3500);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(deployTimer);
    };
  }, []);

  // Deployed missions organized by domain
  const aerialMissions = [
    { id: 'd0', name: 'CONVOY ESCORT', platform: 'MQ-9', icon: Plane, count: 48, capabilities: ['Swarm', 'Strike'], status: 'ACTIVE' },
    { id: 'd1', name: 'OVERWATCH', platform: 'MQ-4C', icon: Plane, count: 12, capabilities: ['ISR', 'SIGINT'], status: 'ACTIVE' },
  ];

  const surfaceMissions = [
    { id: 'd2', name: 'SEA DENIAL', platform: 'MetalShark', icon: Anchor, count: 280, capabilities: ['Guardian AI'], status: 'ACTIVE' },
    { id: 'd3', name: 'REFIT', platform: 'AEGIR-F', icon: Anchor, count: 24, capabilities: ['Kinetic'], status: 'MAINTENANCE' },
  ];

  const subsurfaceMissions = [
    { id: 'd4', name: 'SIGINT OPS', platform: 'SubSeaSail', icon: Waves, count: 45, capabilities: ['ASW'], status: 'ACTIVE' },
  ];

  // Mission Bay - PIER (maritime: USV/UUV → SURFACE/SUBSURFACE)
  const pierItems = [
    { id: 'black-widow', name: 'Black Widow', platform: 'MetalShark', icon: Anchor, status: 'READY', capabilities: ['Guardian AI'], targetDomain: 'SURFACE' },
    { id: 'deep-six', name: 'Deep Six', platform: 'SubSeaSail', icon: Waves, status: 'CONFIGURING', progress: 72, capabilities: ['ASW'], targetDomain: 'SUBSURFACE' },
    { id: 'tidehunter', name: 'Tidehunter', platform: 'Saildrone', icon: Radio, status: 'READY', capabilities: ['ISR'], targetDomain: 'SURFACE' },
  ];

  // Mission Bay - HANGAR (aerial: UAV → AERIAL)
  const hangarItems = [
    { id: 'phantom-wing', name: 'Phantom Wing', platform: 'MQ-25', icon: Plane, status: 'READY', capabilities: ['Tanker'], targetDomain: 'AERIAL' },
    { id: 'viper-squad', name: 'Viper Squad', platform: 'MQ-9B', icon: Plane, status: 'READY', capabilities: ['Strike'], targetDomain: 'AERIAL' },
    { id: 'sentinel', name: 'Sentinel', platform: 'MQ-4C', icon: Plane, status: 'CONFIGURING', progress: 88, capabilities: ['SIGINT'], targetDomain: 'AERIAL' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return { dot: 'bg-green-500', text: 'text-green-400' };
      case 'MAINTENANCE': return { dot: 'bg-orange-500', text: 'text-orange-400' };
      case 'CONFIGURING': return { dot: 'bg-blue-500', text: 'text-blue-400' };
      case 'READY': return { dot: 'bg-lime-brand', text: 'text-lime-brand' };
      default: return { dot: 'bg-gray-500', text: 'text-gray-400' };
    }
  };

  // Compact tile for deployed missions
  const DeployedTile = ({ item, isNew = false }) => {
    const Icon = item.icon;
    const isVisible = visibleItems.includes(item.id) || visibleItems.length > 10;
    const colors = getStatusColor(item.status);

    return (
      <div
        className={`w-[145px] bg-gray-800/90 border border-gray-600/50 rounded-lg p-2.5 transition-all duration-500
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          ${isNew ? 'ring-2 ring-lime-brand animate-pulse' : ''}
        `}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-white font-bold text-xs truncate max-w-[90px]">{item.name}</span>
          <div className={`w-2 h-2 rounded-full ${colors.dot} ${item.status === 'ACTIVE' ? 'animate-pulse' : ''}`} />
        </div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Icon size={12} className="text-lime-brand" />
          <span className="text-gray-400 text-[10px]">{item.platform} ×{item.count}</span>
        </div>
        <span className="px-1.5 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300 text-[9px]">
          {item.capabilities[0]}
        </span>
      </div>
    );
  };

  // Bay tile (for PIER and HANGAR)
  const BayTile = ({ item, isDeploying = false }) => {
    const Icon = item.icon;
    const isVisible = visibleItems.includes(item.id) || visibleItems.length > 10;
    const colors = getStatusColor(item.status);

    if (isDeploying) {
      return (
        <div className="w-[145px] h-[75px] bg-lime-brand/20 border-2 border-dashed border-lime-brand/60 rounded-lg flex flex-col items-center justify-center gap-1 animate-pulse">
          <ArrowUp size={16} className="text-lime-brand animate-bounce" />
          <span className="text-lime-brand text-[10px] font-mono">DEPLOYING...</span>
        </div>
      );
    }

    return (
      <div
        className={`w-[145px] bg-gray-800/90 border border-gray-600/50 rounded-lg p-2.5 transition-all duration-500
          ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
          ${item.status === 'READY' ? 'hover:border-lime-brand cursor-pointer' : ''}
        `}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-white font-bold text-xs truncate max-w-[90px]">{item.name}</span>
          <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
        </div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Icon size={12} className="text-lime-brand" />
          <span className="text-gray-400 text-[10px]">{item.platform}</span>
        </div>
        {item.progress !== undefined ? (
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        ) : (
          <span className="px-1.5 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300 text-[9px]">
            {item.capabilities[0]}
          </span>
        )}
      </div>
    );
  };

  // Domain zone component
  const DomainZone = ({ title, icon: DomainIcon, color, missions, newMissions = [] }) => (
    <div className={`flex-1 ${color} p-2.5 min-h-[90px]`}>
      <div className="flex items-center gap-2 mb-2">
        <DomainIcon size={12} className="text-gray-400" />
        <span className="text-[10px] font-mono text-gray-400 tracking-wider">{title}</span>
        <span className="text-[10px] text-green-400 ml-auto">{missions.length + newMissions.length} active</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {missions.map(m => <DeployedTile key={m.id} item={m} />)}
        {newMissions.map(m => <DeployedTile key={m.id} item={m} isNew />)}
      </div>
    </div>
  );

  // Filter out deployed items from bay
  const remainingPier = pierItems.filter(item => !deployedItems.includes(item.id));
  const remainingHangar = hangarItems.filter(item => !deployedItems.includes(item.id));

  // Newly deployed items
  const newAerialMissions = hangarItems
    .filter(item => deployedItems.includes(item.id))
    .map(item => ({ ...item, status: 'ACTIVE', count: 24 }));

  const newSurfaceMissions = pierItems
    .filter(item => deployedItems.includes(item.id) && item.targetDomain === 'SURFACE')
    .map(item => ({ ...item, status: 'ACTIVE', count: 48 }));

  return (
    <div className="fixed inset-0 bg-darkest flex overflow-hidden">
      {/* Left side - Messaging */}
      <div className={`w-full lg:w-[30%] flex flex-col justify-center px-6 md:px-8 transition-all duration-1000 ${showContent ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
        <div className="flex items-center gap-3 mb-4">
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

        <p className="text-gray-400 text-sm mb-4 max-w-sm leading-relaxed">
          Configure autonomous platforms with modular payloads. Deploy across air, surface, and subsurface domains.
        </p>

        <div className="grid grid-cols-2 gap-2 mb-4">
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

        <div className="flex gap-2 mb-4">
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

      {/* Right side - Deployed domains + Mission Bay */}
      <div className={`hidden lg:flex w-[70%] flex-col transition-all duration-1000 delay-200 ${showContent ? 'opacity-100' : 'opacity-0'}`}>

        {/* DEPLOYED - Domain zones stacked */}
        <div className="flex-1 flex flex-col">
          <div className="px-3 pt-2 pb-1 flex items-center justify-between">
            <span className="text-white text-sm font-bold tracking-wider">DEPLOYED</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-green-400 text-xs">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                5 Active
              </span>
              <span className="flex items-center gap-1 text-orange-400 text-xs">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                1 Maint
              </span>
            </div>
          </div>

          <DomainZone
            title="AERIAL"
            icon={Plane}
            color="bg-gradient-to-r from-slate-900/60 to-slate-800/30"
            missions={aerialMissions}
            newMissions={newAerialMissions}
          />
          <DomainZone
            title="SURFACE"
            icon={Anchor}
            color="bg-gradient-to-r from-cyan-950/40 to-cyan-900/20"
            missions={surfaceMissions}
            newMissions={newSurfaceMissions}
          />
          <DomainZone
            title="SUBSURFACE"
            icon={Waves}
            color="bg-gradient-to-r from-blue-950/50 to-blue-900/30"
            missions={subsurfaceMissions}
          />
        </div>

        {/* Deploy indicator */}
        {deployingItem && (
          <div className="h-10 flex items-center justify-center bg-gradient-to-b from-transparent via-lime-brand/10 to-transparent">
            <div className="flex items-center gap-2 text-lime-brand">
              <ArrowUp size={16} className="animate-bounce" />
              <span className="text-xs font-mono">DEPLOYING</span>
              <ArrowUp size={16} className="animate-bounce" />
            </div>
          </div>
        )}

        {/* MISSION BAY - PIER + HANGAR */}
        <div className="h-[160px] bg-gray-900 border-t-2 border-lime-brand/50 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-lime-brand" />
              <span className="text-lime-brand text-sm font-bold tracking-wider">MISSION BAY</span>
            </div>
            <span className="text-gray-500 text-xs font-mono">
              {remainingPier.filter(i => i.status === 'READY').length + remainingHangar.filter(i => i.status === 'READY').length} READY
            </span>
          </div>

          <div className="flex gap-4 h-[calc(100%-32px)]">
            {/* PIER - Maritime */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Anchor size={11} className="text-cyan-400" />
                <span className="text-cyan-400 text-[10px] font-mono tracking-wider">PIER</span>
                <span className="text-gray-600 text-[9px]">→ Surface/Subsurface</span>
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {remainingPier.map(item => (
                  <BayTile key={item.id} item={item} isDeploying={deployingItem === item.id} />
                ))}
                <div
                  onClick={() => onEnter('shipyard')}
                  className="w-[145px] h-[75px] bg-lime-brand/10 border-2 border-dashed border-lime-brand/40 rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-lime-brand/20 hover:border-lime-brand transition-all flex-shrink-0"
                >
                  <Plus size={16} className="text-lime-brand" />
                  <span className="text-lime-brand text-[10px] font-bold">Configure</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px bg-gray-700/50" />

            {/* HANGAR - Aerial */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Plane size={11} className="text-slate-400" />
                <span className="text-slate-400 text-[10px] font-mono tracking-wider">HANGAR</span>
                <span className="text-gray-600 text-[9px]">→ Aerial</span>
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {remainingHangar.map(item => (
                  <BayTile key={item.id} item={item} isDeploying={deployingItem === item.id} />
                ))}
                <div
                  onClick={() => onEnter('shipyard')}
                  className="w-[145px] h-[75px] bg-lime-brand/10 border-2 border-dashed border-lime-brand/40 rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-lime-brand/20 hover:border-lime-brand transition-all flex-shrink-0"
                >
                  <Plus size={16} className="text-lime-brand" />
                  <span className="text-lime-brand text-[10px] font-bold">Configure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashPageC;
