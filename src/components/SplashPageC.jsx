import { useState, useEffect } from 'react';
import { ChevronRight, Cpu, Layers, Ship, Anchor, Radio, Target, Shield, Plane, Waves, Zap, Plus } from 'lucide-react';

/**
 * Splash Page C: Platform Overview
 * Proposal B: Domain bands with 2-column grids, larger readable cards
 */
const SplashPageC = ({ onEnter }) => {
  const [showContent, setShowContent] = useState(false);
  const [visibleItems, setVisibleItems] = useState([]);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 100);

    // Stagger appearance
    const timers = [];
    for (let i = 0; i < 20; i++) {
      timers.push(setTimeout(() => setVisibleItems(v => [...v, i]), 150 + i * 100));
    }

    return () => timers.forEach(clearTimeout);
  }, []);

  // Deployments by domain
  const aerialDeployments = [
    { id: 0, mission: 'CONVOY ESCORT', platform: 'MQ-9', icon: Plane, count: 48, capabilities: ['Swarm', 'Strike'], status: 'ACTIVE' },
    { id: 1, mission: 'OVERWATCH', platform: 'MQ-4C', icon: Plane, count: 12, capabilities: ['ISR', 'SIGINT'], status: 'ACTIVE' },
  ];

  const surfaceDeployments = [
    { id: 2, mission: 'SEA DENIAL', platform: 'MetalShark', icon: Anchor, count: 280, capabilities: ['Guardian AI', 'Mesh'], status: 'ACTIVE' },
    { id: 3, mission: 'REFIT', platform: 'AEGIR-F', icon: Anchor, count: 24, capabilities: ['Kinetic'], status: 'MAINTENANCE' },
  ];

  const subsurfaceDeployments = [
    { id: 4, mission: 'SIGINT OPS', platform: 'SubSeaSail', icon: Waves, count: 45, capabilities: ['ASW', 'Acoustic'], status: 'ACTIVE' },
    { id: 5, mission: 'CABLE SURVEY', platform: 'Remus', icon: Waves, count: 8, capabilities: ['Sonar', 'Mapping'], status: 'ACTIVE' },
  ];

  // Mission Bay items
  const pierItems = [
    { id: 6, name: 'Black Widow', platform: 'MetalShark', icon: Anchor, status: 'READY', capabilities: ['Guardian AI'] },
    { id: 7, name: 'Deep Six', platform: 'SubSeaSail', icon: Waves, status: 'CONFIGURING', progress: 72, capabilities: ['ASW'] },
    { id: 8, name: 'Tidehunter', platform: 'Saildrone', icon: Radio, status: 'READY', capabilities: ['ISR'] },
  ];

  const hangarItems = [
    { id: 9, name: 'Phantom Wing', platform: 'MQ-25', icon: Plane, status: 'READY', capabilities: ['Tanker'] },
    { id: 10, name: 'Viper Squad', platform: 'MQ-9B', icon: Plane, status: 'READY', capabilities: ['Strike'] },
    { id: 11, name: 'Sentinel', platform: 'MQ-4C', icon: Plane, status: 'CONFIGURING', progress: 88, capabilities: ['SIGINT'] },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return { dot: 'bg-green-500', border: 'border-green-500/50', text: 'text-green-400' };
      case 'MAINTENANCE': return { dot: 'bg-orange-500', border: 'border-orange-500/50', text: 'text-orange-400' };
      case 'CONFIGURING': return { dot: 'bg-blue-500', border: 'border-blue-500/50', text: 'text-blue-400' };
      case 'READY': return { dot: 'bg-lime-brand', border: 'border-lime-brand/50', text: 'text-lime-brand' };
      default: return { dot: 'bg-gray-500', border: 'border-gray-500/50', text: 'text-gray-400' };
    }
  };

  // Large deployment card for domain grids
  const DeploymentCard = ({ dep }) => {
    const Icon = dep.icon;
    const isVisible = visibleItems.includes(dep.id);
    const colors = getStatusColor(dep.status);

    return (
      <div className={`bg-gray-800/90 border ${colors.border} rounded-lg p-3 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-bold text-sm">{dep.mission}</span>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${colors.dot} ${dep.status === 'ACTIVE' ? 'animate-pulse' : ''}`} />
            <span className={`text-xs font-mono ${colors.text}`}>{dep.status}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Icon size={16} className="text-lime-brand" />
          <span className="text-gray-300 text-sm">{dep.platform} ×{dep.count}</span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {dep.capabilities.map(cap => (
            <span key={cap} className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300 text-xs">{cap}</span>
          ))}
        </div>
      </div>
    );
  };

  // Bay tile for Mission Bay
  const BayTile = ({ item }) => {
    const Icon = item.icon;
    const isVisible = visibleItems.includes(item.id);
    const colors = getStatusColor(item.status);

    return (
      <div className={`w-[140px] bg-gray-800/90 border ${colors.border} rounded-lg p-2.5 transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'} hover:border-lime-brand cursor-pointer`}>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <Icon size={14} className="text-lime-brand" />
            <span className="text-white text-xs font-bold truncate max-w-[80px]">{item.name}</span>
          </div>
          <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
        </div>
        {item.progress !== undefined && (
          <div className="mb-1.5">
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000" style={{ width: `${item.progress}%` }} />
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="px-1.5 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300 text-[10px]">{item.capabilities[0]}</span>
          <span className="text-gray-500 text-[10px]">{item.platform}</span>
        </div>
      </div>
    );
  };

  // CTA tile
  const ConfigureCTA = ({ onClick }) => (
    <div
      onClick={onClick}
      className="w-[140px] bg-lime-brand/10 border-2 border-dashed border-lime-brand/50 rounded-lg p-2.5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-lime-brand/20 hover:border-lime-brand transition-all"
    >
      <div className="w-8 h-8 rounded-full bg-lime-brand/20 flex items-center justify-center">
        <Plus size={18} className="text-lime-brand" />
      </div>
      <span className="text-lime-brand text-xs font-bold text-center">Configure Your Own</span>
    </div>
  );

  // Domain band component
  const DomainBand = ({ title, color, deployments, stats }) => (
    <div className={`flex-1 ${color} border-b border-gray-700/50 p-3`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono text-gray-400 tracking-widest">{title}</span>
        <div className="flex items-center gap-2">
          {stats.active > 0 && (
            <span className="flex items-center gap-1 text-green-400 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {stats.active} Active
            </span>
          )}
          {stats.maint > 0 && (
            <span className="flex items-center gap-1 text-orange-400 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              {stats.maint} Maint
            </span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {deployments.map((dep, i) => (
          <DeploymentCard key={dep.id} dep={dep} index={i} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-darkest flex overflow-hidden">
      {/* Left side - Messaging */}
      <div className={`w-full lg:w-[35%] flex flex-col justify-center px-6 md:px-10 lg:px-10 transition-all duration-1000 ${showContent ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
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

      {/* Right side - Domain bands + Mission Bay */}
      <div className={`hidden lg:flex w-[65%] flex-col transition-all duration-1000 delay-200 ${showContent ? 'opacity-100' : 'opacity-0'}`}>

        {/* Domain bands - stacked */}
        <div className="flex-1 flex flex-col">
          <DomainBand
            title="AERIAL"
            color="bg-gradient-to-r from-slate-900/60 to-slate-800/40"
            deployments={aerialDeployments}
            stats={{ active: 2, maint: 0 }}
          />
          <DomainBand
            title="SURFACE"
            color="bg-gradient-to-r from-cyan-950/40 to-cyan-900/20"
            deployments={surfaceDeployments}
            stats={{ active: 1, maint: 1 }}
          />
          <DomainBand
            title="SUBSURFACE"
            color="bg-gradient-to-r from-blue-950/50 to-blue-900/30"
            deployments={subsurfaceDeployments}
            stats={{ active: 2, maint: 0 }}
          />
        </div>

        {/* Mission Bay - compact row at bottom */}
        <div className="h-[140px] bg-gray-900 border-t-2 border-lime-brand/50 p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-lime-brand" />
              <span className="text-lime-brand text-sm font-mono tracking-wider font-bold">MISSION BAY</span>
            </div>
            <span className="text-gray-500 text-xs font-mono">6 READY TO DEPLOY</span>
          </div>

          <div className="flex gap-6">
            {/* Pier */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Anchor size={12} className="text-cyan-400" />
                <span className="text-cyan-400 text-xs font-mono">PIER</span>
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {pierItems.map(item => <BayTile key={item.id} item={item} />)}
                <ConfigureCTA onClick={() => onEnter('shipyard')} />
              </div>
            </div>

            {/* Divider */}
            <div className="w-px bg-gray-700/50" />

            {/* Hangar */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Plane size={12} className="text-slate-400" />
                <span className="text-slate-400 text-xs font-mono">HANGAR</span>
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {hangarItems.map(item => <BayTile key={item.id} item={item} />)}
                <ConfigureCTA onClick={() => onEnter('shipyard')} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashPageC;
