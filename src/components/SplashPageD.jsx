import { useState, useEffect } from 'react';
import { ChevronRight, Ship, Plane, AlertTriangle, Check, Eye, Wifi, Crosshair, Navigation, Cpu, Zap, Anchor } from 'lucide-react';

/**
 * Splash Page D: "The Transformation"
 * Full-screen platform with mechanical payload swap animation
 */
const SplashPageD = ({ onEnter }) => {
  const [phase, setPhase] = useState('idle'); // idle, opening, swapping, closing, ready, deployed
  const [showContent, setShowContent] = useState(false);
  const [activeSwapIndex, setActiveSwapIndex] = useState(0);
  const [scenarioIndex, setScenarioIndex] = useState(0);

  // Payload definitions with icons and colors
  const PAYLOADS = {
    'Scion ESM': { icon: Eye, color: '#22d3ee', category: 'SENSORS' },
    'Towed Sonar': { icon: Eye, color: '#22d3ee', category: 'SENSORS' },
    'NGHTS Targeting': { icon: Crosshair, color: '#f87171', category: 'SENSORS' },
    'Lattice Mesh': { icon: Wifi, color: '#a78bfa', category: 'COMMS' },
    'Marine AI': { icon: Cpu, color: '#CBFD00', category: 'AI' },
    'Guardian AI': { icon: Cpu, color: '#CBFD00', category: 'AI' },
    'SeaFIND Nav': { icon: Navigation, color: '#60a5fa', category: 'NAV' },
    'DRAKE Counter-UAS': { icon: Zap, color: '#fbbf24', category: 'EW' },
    'Jackal Missile': { icon: Crosshair, color: '#f87171', category: 'WEAPONS' },
  };

  // Scenarios - each shows a different platform reconfiguring
  const scenarios = [
    {
      id: 'asw',
      flash: 'FLASH TRAFFIC: Submarine contact detected. ASW coverage required immediately.',
      platform: 'MQ-8C Fire Scout',
      platformType: 'UAV',
      platformIcon: Plane,
      before: {
        name: 'ISR Configuration',
        payloads: ['Scion ESM', 'Lattice Mesh', 'Marine AI', 'SeaFIND Nav']
      },
      after: {
        name: 'ASW Configuration',
        payloads: ['Towed Sonar', 'Lattice Mesh', 'Marine AI', 'DRAKE Counter-UAS']
      },
      swaps: [
        { bay: 0, from: 'Scion ESM', to: 'Towed Sonar' },
        { bay: 3, from: 'SeaFIND Nav', to: 'DRAKE Counter-UAS' }
      ],
      count: 24,
      domain: 'SUBSURFACE',
      mission: 'ASW PATROL'
    },
    {
      id: 'strike',
      flash: 'FLASH TRAFFIC: High-value target confirmed. Strike package authorized.',
      platform: 'MQ-9B SeaGuardian',
      platformType: 'UAV',
      platformIcon: Plane,
      before: {
        name: 'Recon Configuration',
        payloads: ['Scion ESM', 'Lattice Mesh', 'Marine AI', 'SeaFIND Nav']
      },
      after: {
        name: 'Strike Configuration',
        payloads: ['NGHTS Targeting', 'Lattice Mesh', 'Marine AI', 'Jackal Missile']
      },
      swaps: [
        { bay: 0, from: 'Scion ESM', to: 'NGHTS Targeting' },
        { bay: 3, from: 'SeaFIND Nav', to: 'Jackal Missile' }
      ],
      count: 12,
      domain: 'AERIAL',
      mission: 'PRECISION STRIKE'
    },
    {
      id: 'denial',
      flash: 'FLASH TRAFFIC: Hostile surface contacts approaching. Sea denial posture.',
      platform: 'MetalShark USV',
      platformType: 'USV',
      platformIcon: Ship,
      before: {
        name: 'Patrol Configuration',
        payloads: ['Scion ESM', 'Lattice Mesh', 'Marine AI', 'SeaFIND Nav']
      },
      after: {
        name: 'Guardian Configuration',
        payloads: ['Scion ESM', 'Lattice Mesh', 'Guardian AI', 'DRAKE Counter-UAS']
      },
      swaps: [
        { bay: 2, from: 'Marine AI', to: 'Guardian AI' },
        { bay: 3, from: 'SeaFIND Nav', to: 'DRAKE Counter-UAS' }
      ],
      count: 48,
      domain: 'SURFACE',
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
      // Reset
      setPhase('idle');
      setActiveSwapIndex(0);

      // Start opening bays after showing "before" state
      setTimeout(() => setPhase('opening'), 2000);

      // Start swapping sequence
      setTimeout(() => {
        setPhase('swapping');
        // Animate each swap sequentially
        scenario.swaps.forEach((_, i) => {
          setTimeout(() => setActiveSwapIndex(i), i * 800);
        });
      }, 2500);

      // Close bays
      setTimeout(() => setPhase('closing'), 2500 + scenario.swaps.length * 800 + 400);

      // Ready state
      setTimeout(() => setPhase('ready'), 2500 + scenario.swaps.length * 800 + 900);

      // Deployed
      setTimeout(() => setPhase('deployed'), 2500 + scenario.swaps.length * 800 + 1800);

      // Next scenario
      setTimeout(() => {
        setScenarioIndex(i => (i + 1) % scenarios.length);
      }, 8000);
    };

    runCycle();
    const interval = setInterval(runCycle, 8000);
    return () => clearInterval(interval);
  }, [scenarioIndex, scenario.swaps.length, scenarios.length]);

  // Get current payload for a bay based on phase
  const getPayloadForBay = (bayIndex) => {
    if (phase === 'idle' || phase === 'opening') {
      return scenario.before.payloads[bayIndex];
    }

    // During/after swapping, check if this bay has been swapped
    const swapForBay = scenario.swaps.find(s => s.bay === bayIndex);
    if (swapForBay) {
      const swapIndex = scenario.swaps.indexOf(swapForBay);
      if (phase === 'swapping' && activeSwapIndex < swapIndex) {
        return scenario.before.payloads[bayIndex];
      }
      return swapForBay.to;
    }
    return scenario.before.payloads[bayIndex];
  };

  // Check if a bay is currently being swapped
  const isBaySwapping = (bayIndex) => {
    if (phase !== 'swapping') return false;
    const swapForBay = scenario.swaps.find(s => s.bay === bayIndex);
    if (!swapForBay) return false;
    return scenario.swaps.indexOf(swapForBay) === activeSwapIndex;
  };

  // Check if a bay door should be open
  const isBayOpen = (bayIndex) => {
    const swapForBay = scenario.swaps.find(s => s.bay === bayIndex);
    if (!swapForBay) return false;
    return phase === 'opening' || phase === 'swapping';
  };

  const PlatformIcon = scenario.platformIcon;

  // Payload Bay Component
  const PayloadBay = ({ index, x, y, width, height, label }) => {
    const payloadName = getPayloadForBay(index);
    const payload = PAYLOADS[payloadName];
    const isSwapping = isBaySwapping(index);
    const isOpen = isBayOpen(index);
    const willSwap = scenario.swaps.some(s => s.bay === index);

    return (
      <g>
        {/* Bay housing */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={4}
          fill={isOpen ? '#1e293b' : '#0f172a'}
          stroke={isSwapping ? '#CBFD00' : willSwap ? '#475569' : '#334155'}
          strokeWidth={isSwapping ? 2 : 1}
          className="transition-all duration-300"
          style={{
            filter: isSwapping ? 'drop-shadow(0 0 10px #CBFD00)' : 'none'
          }}
        />

        {/* Bay door (top) */}
        <rect
          x={x}
          y={y}
          width={width}
          height={4}
          fill={isOpen ? '#0f172a' : '#475569'}
          className="transition-all duration-300"
          style={{
            transform: isOpen ? `translateY(-8px)` : 'translateY(0)',
            transformOrigin: `${x + width/2}px ${y}px`
          }}
        />

        {/* Bay door (bottom) */}
        <rect
          x={x}
          y={y + height - 4}
          width={width}
          height={4}
          fill={isOpen ? '#0f172a' : '#475569'}
          className="transition-all duration-300"
          style={{
            transform: isOpen ? `translateY(8px)` : 'translateY(0)',
            transformOrigin: `${x + width/2}px ${y + height}px`
          }}
        />

        {/* Payload module */}
        <g
          className="transition-all duration-500"
          style={{
            transform: isSwapping ? 'translateY(-20px)' : 'translateY(0)',
            opacity: isSwapping ? 0 : 1
          }}
        >
          <rect
            x={x + 4}
            y={y + 8}
            width={width - 8}
            height={height - 16}
            rx={2}
            fill={`${payload?.color || '#64748b'}20`}
            stroke={payload?.color || '#64748b'}
            strokeWidth={1}
          />
          {/* Payload icon placeholder */}
          <circle
            cx={x + width/2}
            cy={y + height/2 - 6}
            r={8}
            fill={`${payload?.color || '#64748b'}40`}
          />
        </g>

        {/* Incoming payload (during swap) */}
        {isSwapping && (
          <g
            className="transition-all duration-500"
            style={{
              animation: 'slideIn 0.5s ease-out forwards'
            }}
          >
            <rect
              x={x + 4}
              y={y + 8}
              width={width - 8}
              height={height - 16}
              rx={2}
              fill={`${PAYLOADS[scenario.swaps.find(s => s.bay === index)?.to]?.color || '#64748b'}20`}
              stroke={PAYLOADS[scenario.swaps.find(s => s.bay === index)?.to]?.color || '#64748b'}
              strokeWidth={1}
            />
            <circle
              cx={x + width/2}
              cy={y + height/2 - 6}
              r={8}
              fill={`${PAYLOADS[scenario.swaps.find(s => s.bay === index)?.to]?.color || '#64748b'}40`}
            />
          </g>
        )}

        {/* Bay label */}
        <text
          x={x + width/2}
          y={y + height + 14}
          textAnchor="middle"
          fill={isSwapping ? '#CBFD00' : '#64748b'}
          fontSize="10"
          fontFamily="monospace"
          className="transition-colors duration-300"
        >
          {label}
        </text>

        {/* Payload name below */}
        <text
          x={x + width/2}
          y={y + height + 26}
          textAnchor="middle"
          fill={payload?.color || '#64748b'}
          fontSize="9"
          fontWeight="bold"
          className="transition-all duration-300"
        >
          {payloadName?.split(' ')[0] || '—'}
        </text>
      </g>
    );
  };

  // Platform schematic - simplified top-down view
  const PlatformSchematic = () => {
    const isUAV = scenario.platformType === 'UAV';

    return (
      <svg viewBox="0 0 400 300" className="w-full h-full max-w-2xl">
        {/* Grid background */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" opacity="0.5" />

        {isUAV ? (
          // UAV Schematic (top-down drone view)
          <g transform="translate(200, 150)">
            {/* Fuselage */}
            <ellipse cx="0" cy="0" rx="80" ry="25" fill="#1e293b" stroke="#475569" strokeWidth="1" />

            {/* Wings */}
            <path
              d="M -20 0 L -120 -60 L -120 -50 L -30 0 L -120 50 L -120 60 Z"
              fill="#1e293b"
              stroke="#475569"
              strokeWidth="1"
            />
            <path
              d="M 20 0 L 120 -60 L 120 -50 L 30 0 L 120 50 L 120 60 Z"
              fill="#1e293b"
              stroke="#475569"
              strokeWidth="1"
            />

            {/* Tail */}
            <path
              d="M 60 0 L 90 -25 L 90 25 Z"
              fill="#1e293b"
              stroke="#475569"
              strokeWidth="1"
            />

            {/* Nose */}
            <ellipse cx="-70" cy="0" rx="15" ry="12" fill="#0f172a" stroke="#CBFD00" strokeWidth="1" />

            {/* Engine glow */}
            <ellipse cx="75" cy="0" rx="8" ry="6" fill="#CBFD0040" />

            {/* Payload bays */}
            <g transform="translate(-140, -100)">
              <PayloadBay index={0} x={0} y={0} width={50} height={60} label="BAY 1" />
              <PayloadBay index={1} x={70} y={0} width={50} height={60} label="BAY 2" />
              <PayloadBay index={2} x={160} y={0} width={50} height={60} label="BAY 3" />
              <PayloadBay index={3} x={230} y={0} width={50} height={60} label="BAY 4" />
            </g>
          </g>
        ) : (
          // USV Schematic (top-down boat view)
          <g transform="translate(200, 150)">
            {/* Hull */}
            <path
              d="M -80 0 Q -80 -30 -40 -35 L 60 -30 Q 90 -25 90 0 Q 90 25 60 30 L -40 35 Q -80 30 -80 0 Z"
              fill="#1e293b"
              stroke="#475569"
              strokeWidth="1"
            />

            {/* Bow */}
            <path
              d="M 60 -30 Q 100 -20 110 0 Q 100 20 60 30"
              fill="none"
              stroke="#CBFD00"
              strokeWidth="1"
            />

            {/* Deck structure */}
            <rect x="-50" y="-20" width="80" height="40" rx="4" fill="#0f172a" stroke="#475569" />

            {/* Bridge */}
            <rect x="-30" y="-12" width="30" height="24" rx="2" fill="#1e293b" stroke="#CBFD00" strokeWidth="1" />

            {/* Payload bays */}
            <g transform="translate(-140, -100)">
              <PayloadBay index={0} x={0} y={0} width={50} height={60} label="BAY 1" />
              <PayloadBay index={1} x={70} y={0} width={50} height={60} label="BAY 2" />
              <PayloadBay index={2} x={160} y={0} width={50} height={60} label="BAY 3" />
              <PayloadBay index={3} x={230} y={0} width={50} height={60} label="BAY 4" />
            </g>
          </g>
        )}

        {/* Status indicator */}
        <g transform="translate(200, 270)">
          <rect
            x="-60"
            y="-12"
            width="120"
            height="24"
            rx="12"
            fill={phase === 'ready' || phase === 'deployed' ? '#22c55e20' : phase === 'swapping' ? '#CBFD0020' : '#1e293b'}
            stroke={phase === 'ready' || phase === 'deployed' ? '#22c55e' : phase === 'swapping' ? '#CBFD00' : '#475569'}
            strokeWidth="1"
            className="transition-all duration-300"
          />
          <text
            x="0"
            y="4"
            textAnchor="middle"
            fill={phase === 'ready' || phase === 'deployed' ? '#22c55e' : phase === 'swapping' ? '#CBFD00' : '#94a3b8'}
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {phase === 'idle' && 'STANDING BY'}
            {phase === 'opening' && 'BAYS OPENING'}
            {phase === 'swapping' && 'RECONFIGURING'}
            {phase === 'closing' && 'BAYS CLOSING'}
            {phase === 'ready' && 'READY'}
            {phase === 'deployed' && 'DEPLOYED'}
          </text>
        </g>
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 bg-darkest flex flex-col overflow-hidden">
      {/* CSS for animations */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateY(-30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}
      </style>

      {/* Flash Traffic Banner */}
      <div className={`bg-red-900/30 border-b border-red-500/50 px-6 py-4 transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <AlertTriangle size={20} className="text-red-400 animate-pulse flex-shrink-0" />
          <span className="text-red-400 font-mono text-sm tracking-wide">{scenario.flash}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-6">
        <div className={`w-full max-w-4xl transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

          {/* Header */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 bg-lime-brand rounded-lg flex items-center justify-center">
                <Anchor size={22} className="text-black" />
              </div>
              <span className="text-white font-bold text-xl">CALIBURN MISSION BAY</span>
            </div>
            <p className="text-gray-400">
              Watch payloads swap in real-time. <span className="text-lime-brand font-bold">Minutes, not months.</span>
            </p>
          </div>

          {/* Platform Info Bar */}
          <div className="flex items-center justify-between mb-4 px-4">
            <div className="flex items-center gap-3">
              <PlatformIcon size={24} className="text-lime-brand" />
              <div>
                <div className="text-white font-bold">{scenario.platform}</div>
                <div className="text-gray-500 text-sm">{scenario.count} units in fleet</div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-gray-500 text-xs uppercase">From</div>
                <div className="text-white font-mono text-sm">{scenario.before.name}</div>
              </div>
              <ChevronRight size={20} className={`transition-colors duration-300 ${phase === 'swapping' ? 'text-lime-brand' : 'text-gray-600'}`} />
              <div className="text-right">
                <div className="text-gray-500 text-xs uppercase">To</div>
                <div className={`font-mono text-sm transition-colors duration-300 ${phase === 'ready' || phase === 'deployed' ? 'text-lime-brand font-bold' : 'text-white'}`}>
                  {scenario.after.name}
                </div>
              </div>
            </div>
          </div>

          {/* Platform Schematic */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 mb-4">
            <div className="flex justify-center">
              <PlatformSchematic />
            </div>
          </div>

          {/* Deployment Confirmation */}
          <div className={`text-center transition-all duration-500 ${phase === 'deployed' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-500/10 border border-green-500/30 rounded-full">
              <Check size={18} className="text-green-400" />
              <span className="text-green-400 font-mono text-sm">
                {scenario.count}× {scenario.platform.split(' ')[0]} deployed — {scenario.mission}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className={`border-t border-gray-800 bg-gray-900/50 transition-all duration-1000 delay-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-4xl mx-auto px-8 py-5 flex items-center justify-between">
          {/* Stats */}
          <div className="flex gap-8">
            <div>
              <div className="text-2xl font-bold text-white">2,662</div>
              <div className="text-gray-500 text-xs">Vessels Ready</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">47</div>
              <div className="text-gray-500 text-xs">Payload Options</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-lime-brand">&lt;5 min</div>
              <div className="text-gray-500 text-xs">Reconfigure Time</div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => onEnter('shipyard')}
            className="group flex items-center gap-2 px-8 py-4 bg-lime-brand text-black font-bold rounded-lg hover:bg-lime-brand/90 transition-all"
          >
            Explore Fleet
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SplashPageD;
