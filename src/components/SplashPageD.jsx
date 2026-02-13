import { useState, useEffect } from 'react';
import { ChevronRight, Ship, Plane, AlertTriangle, Check, Eye, Wifi, Crosshair, Navigation, Cpu, Zap, Shield, Anchor } from 'lucide-react';

/**
 * Splash Page D: "The Transformation"
 * Outfitter-style 3-column layout with animated slot filling
 */
const SplashPageD = ({ onEnter }) => {
  const [phase, setPhase] = useState('before'); // before, reconfiguring, complete, deployed
  const [showContent, setShowContent] = useState(false);
  const [filledSlots, setFilledSlots] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const [scenarioIndex, setScenarioIndex] = useState(0);

  // Category definitions matching the Outfitter
  const CATEGORIES = {
    SENSORS: { icon: Eye, color: '#22d3ee', name: 'Sensors', desc: 'Detection & surveillance' },
    COMMS: { icon: Wifi, color: '#a78bfa', name: 'Communications', desc: 'Data links & networking' },
    WEAPONS: { icon: Crosshair, color: '#f87171', name: 'Weapons', desc: 'Offensive capabilities' },
    EW: { icon: Zap, color: '#fbbf24', name: 'Electronic Warfare', desc: 'EW & countermeasures' },
    NAV: { icon: Navigation, color: '#60a5fa', name: 'Navigation', desc: 'Position & guidance' },
    AI: { icon: Cpu, color: '#CBFD00', name: 'AI & Autonomy', desc: 'Autonomous control' },
  };

  // Scenarios
  const scenarios = [
    {
      id: 'asw',
      flash: 'FLASH TRAFFIC: Submarine contact detected. ASW coverage required.',
      platform: 'MQ-8C Fire Scout',
      platformType: 'UAV',
      platformIcon: Plane,
      count: 24,
      before: {
        name: 'ISR Config',
        slots: {
          SENSORS: ['Scion ESM'],
          COMMS: ['Lattice Mesh'],
          AI: ['Marine AI'],
          NAV: ['SeaFIND Nav'],
        }
      },
      after: {
        name: 'ASW Config',
        slots: {
          SENSORS: ['Towed Sonar'],
          COMMS: ['Lattice Mesh'],
          AI: ['Marine AI'],
          EW: ['DRAKE Counter-UAS'],
        }
      },
      swapSequence: [
        { category: 'SENSORS', slot: 0, from: 'Scion ESM', to: 'Towed Sonar' },
        { category: 'NAV', slot: 0, action: 'remove' },
        { category: 'EW', slot: 0, to: 'DRAKE Counter-UAS' },
      ],
      mission: 'ASW PATROL'
    },
    {
      id: 'strike',
      flash: 'FLASH TRAFFIC: High-value target confirmed. Strike package authorized.',
      platform: 'MQ-9B SeaGuardian',
      platformType: 'UAV',
      platformIcon: Plane,
      count: 12,
      before: {
        name: 'Recon Config',
        slots: {
          SENSORS: ['Scion ESM'],
          COMMS: ['Lattice Mesh'],
          AI: ['Marine AI'],
          NAV: ['SeaFIND Nav'],
        }
      },
      after: {
        name: 'Strike Config',
        slots: {
          SENSORS: ['NGHTS Targeting'],
          COMMS: ['Lattice Mesh'],
          WEAPONS: ['Jackal Missile'],
          AI: ['Marine AI'],
          EW: ['Scion ESM'],
        }
      },
      swapSequence: [
        { category: 'SENSORS', slot: 0, from: 'Scion ESM', to: 'NGHTS Targeting' },
        { category: 'WEAPONS', slot: 0, to: 'Jackal Missile' },
        { category: 'NAV', slot: 0, action: 'remove' },
        { category: 'EW', slot: 0, to: 'Scion ESM' },
      ],
      mission: 'PRECISION STRIKE'
    },
    {
      id: 'denial',
      flash: 'FLASH TRAFFIC: Hostile surface contacts. Sea denial posture.',
      platform: 'MetalShark',
      platformType: 'USV',
      platformIcon: Ship,
      count: 48,
      before: {
        name: 'Patrol Config',
        slots: {
          SENSORS: ['Scion ESM'],
          COMMS: ['Lattice Mesh'],
          AI: ['Marine AI'],
          NAV: ['SeaFIND Nav'],
        }
      },
      after: {
        name: 'Guardian Config',
        slots: {
          SENSORS: ['Scion ESM'],
          COMMS: ['Lattice Mesh'],
          AI: ['Guardian AI'],
          EW: ['DRAKE Counter-UAS'],
        }
      },
      swapSequence: [
        { category: 'AI', slot: 0, from: 'Marine AI', to: 'Guardian AI' },
        { category: 'NAV', slot: 0, action: 'remove' },
        { category: 'EW', slot: 0, to: 'DRAKE Counter-UAS' },
      ],
      mission: 'SEA DENIAL'
    }
  ];

  const scenario = scenarios[scenarioIndex];

  useEffect(() => {
    setTimeout(() => setShowContent(true), 100);
  }, []);

  // Animation cycle
  useEffect(() => {
    const runCycle = () => {
      // Reset to "before" state
      setPhase('before');
      setFilledSlots({ ...scenario.before.slots });
      setActiveCategory(null);

      // Start reconfiguring after showing "before"
      setTimeout(() => {
        setPhase('reconfiguring');

        // Animate each swap sequentially
        scenario.swapSequence.forEach((swap, i) => {
          setTimeout(() => {
            setActiveCategory(swap.category);
            setFilledSlots(prev => {
              const next = { ...prev };
              if (swap.action === 'remove') {
                delete next[swap.category];
              } else {
                next[swap.category] = [swap.to];
              }
              return next;
            });
          }, i * 600);
        });

        // Clear active after all swaps
        setTimeout(() => {
          setActiveCategory(null);
        }, scenario.swapSequence.length * 600);
      }, 2000);

      // Complete
      setTimeout(() => {
        setPhase('complete');
      }, 2000 + scenario.swapSequence.length * 600 + 300);

      // Deployed
      setTimeout(() => {
        setPhase('deployed');
      }, 2000 + scenario.swapSequence.length * 600 + 1500);

      // Next scenario
      setTimeout(() => {
        setScenarioIndex(i => (i + 1) % scenarios.length);
      }, 7000);
    };

    runCycle();
    const interval = setInterval(runCycle, 7000);
    return () => clearInterval(interval);
  }, [scenarioIndex, scenario.before.slots, scenario.swapSequence, scenarios.length]);

  const PlatformIcon = scenario.platformIcon;

  // Category Card Component
  const CategoryCard = ({ categoryKey }) => {
    const category = CATEGORIES[categoryKey];
    const slots = filledSlots[categoryKey] || [];
    const isActive = activeCategory === categoryKey;
    const Icon = category.icon;

    return (
      <div
        className={`rounded-lg border transition-all duration-300 ${
          isActive
            ? 'border-lime-brand bg-lime-brand/5 shadow-lg shadow-lime-brand/20'
            : 'border-gray-700/50 bg-gray-900/50'
        }`}
        style={{ minWidth: '200px' }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-700/50">
          <div
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <Icon size={14} style={{ color: category.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-semibold truncate">{category.name}</div>
            <div className="text-gray-500 text-xs truncate">{category.desc}</div>
          </div>
          {slots.length > 0 && (
            <div className="flex gap-1">
              {slots.map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Slots */}
        <div className="p-2 space-y-1.5">
          {slots.length > 0 ? (
            slots.map((capability, i) => (
              <div
                key={i}
                className={`px-3 py-2 rounded border text-sm transition-all duration-300 ${
                  isActive ? 'animate-pulse' : ''
                }`}
                style={{
                  borderColor: category.color,
                  backgroundColor: `${category.color}15`,
                  color: category.color,
                }}
              >
                {capability}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 rounded border border-dashed border-gray-600 text-gray-500 text-sm text-center">
              + Add
            </div>
          )}
        </div>
      </div>
    );
  };

  // Left categories (Sensors, Comms, Weapons)
  const leftCategories = ['SENSORS', 'COMMS', 'WEAPONS'];
  // Right categories (EW, Nav, AI)
  const rightCategories = ['EW', 'NAV', 'AI'];

  return (
    <div className="fixed inset-0 bg-darkest flex flex-col overflow-hidden">
      {/* Flash Traffic Banner */}
      <div className={`bg-red-900/30 border-b border-red-500/50 px-4 py-3 transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-400 animate-pulse flex-shrink-0" />
          <span className="text-red-400 font-mono text-sm">{scenario.flash}</span>
        </div>
      </div>

      {/* Header */}
      <div className={`px-4 py-4 transition-all duration-700 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lime-brand rounded-lg flex items-center justify-center">
              <Anchor size={22} className="text-black" />
            </div>
            <div>
              <span className="text-white font-bold text-lg">CALIBURN MISSION BAY</span>
              <p className="text-gray-500 text-sm">Reconfigure any platform in minutes</p>
            </div>
          </div>

          {/* Config transition indicator */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-gray-500 text-xs">FROM</div>
              <div className="text-white font-mono text-sm">{scenario.before.name}</div>
            </div>
            <div className={`px-3 py-1.5 rounded-full border transition-all duration-300 ${
              phase === 'reconfiguring'
                ? 'border-lime-brand bg-lime-brand/10 text-lime-brand'
                : phase === 'complete' || phase === 'deployed'
                  ? 'border-green-500 bg-green-500/10 text-green-500'
                  : 'border-gray-600 text-gray-500'
            }`}
            >
              {phase === 'before' && <ChevronRight size={16} />}
              {phase === 'reconfiguring' && <span className="text-xs font-mono">SWAPPING</span>}
              {(phase === 'complete' || phase === 'deployed') && <Check size={16} />}
            </div>
            <div className="text-left">
              <div className="text-gray-500 text-xs">TO</div>
              <div className={`font-mono text-sm transition-colors duration-300 ${
                phase === 'complete' || phase === 'deployed' ? 'text-lime-brand font-bold' : 'text-white'
              }`}
              >{scenario.after.name}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Outfitter Layout */}
      <div className={`flex-1 px-4 pb-4 overflow-hidden transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-6xl mx-auto h-full flex gap-4">
          {/* Left Column - Categories */}
          <div className="flex flex-col gap-3 justify-center" style={{ width: '220px' }}>
            {leftCategories.map(cat => (
              <CategoryCard key={cat} categoryKey={cat}  />
            ))}
          </div>

          {/* Center - Platform */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 w-full max-w-sm">
              {/* Platform Image Area */}
              <div className="aspect-video bg-gray-800/50 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(203,253,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(203,253,0,0.1) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}
                />
                <PlatformIcon size={64} className="text-lime-brand/80" />
              </div>

              {/* Platform Name */}
              <div className="text-center mb-4">
                <div className="text-white font-bold text-xl">{scenario.platform}</div>
                <div className="text-gray-500 text-sm">
                  {scenario.platformType === 'UAV' ? 'Unmanned Aerial Vehicle' : 'Unmanned Surface Vessel'}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-lime-brand" />
                  <span className="text-gray-400">Fleet Size</span>
                </div>
                <div className="text-white font-mono text-right">{scenario.count}</div>

                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-cyan-400" />
                  <span className="text-gray-400">Status</span>
                </div>
                <div className={`font-mono text-right text-sm ${
                  phase === 'complete' || phase === 'deployed' ? 'text-green-400' :
                  phase === 'reconfiguring' ? 'text-lime-brand' : 'text-gray-400'
                }`}
                >
                  {phase === 'before' && 'Ready'}
                  {phase === 'reconfiguring' && 'Swapping...'}
                  {phase === 'complete' && 'Complete'}
                  {phase === 'deployed' && 'Deployed'}
                </div>
              </div>
            </div>

            {/* Deployment Banner */}
            <div className={`mt-4 transition-all duration-500 ${phase === 'deployed' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
                <Check size={16} className="text-green-400" />
                <span className="text-green-400 font-mono text-sm">
                  {scenario.count}× deployed — {scenario.mission}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Categories */}
          <div className="flex flex-col gap-3 justify-center" style={{ width: '220px' }}>
            {rightCategories.map(cat => (
              <CategoryCard key={cat} categoryKey={cat}  />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className={`border-t border-gray-800 bg-gray-900/50 transition-all duration-1000 delay-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex gap-8">
            <div>
              <div className="text-xl font-bold text-white">2,662</div>
              <div className="text-gray-500 text-xs">Platforms</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">47</div>
              <div className="text-gray-500 text-xs">Capabilities</div>
            </div>
            <div>
              <div className="text-xl font-bold text-lime-brand">&lt;5 min</div>
              <div className="text-gray-500 text-xs">Reconfigure</div>
            </div>
          </div>

          <button
            onClick={() => onEnter('shipyard')}
            className="group flex items-center gap-2 px-6 py-3 bg-lime-brand text-black font-bold rounded-lg hover:bg-lime-brand/90 transition-all"
          >
            Explore Fleet
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SplashPageD;
