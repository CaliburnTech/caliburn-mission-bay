import { useState, useEffect } from 'react';
import { ChevronRight, Ship, Plane, AlertTriangle, Clock, Zap, Check, Eye, Wifi, Crosshair, Navigation, Cpu, Shield } from 'lucide-react';

/**
 * Splash Page D: "The Transformation"
 * Shows actual payload slots being reconfigured - Outfitter-style visualization
 */
const SplashPageD = ({ onEnter }) => {
  const [phase, setPhase] = useState('before'); // before, transforming, after, deployed
  const [timer, setTimer] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [swappingSlot, setSwappingSlot] = useState(null);

  // Slot categories with colors matching the Outfitter
  const SLOT_TYPES = {
    SENSORS: { icon: Eye, color: '#22d3ee', label: 'Sensors' },      // cyan
    COMMS: { icon: Wifi, color: '#a78bfa', label: 'Comms' },         // purple
    WEAPONS: { icon: Crosshair, color: '#f87171', label: 'Weapons' }, // red
    NAV: { icon: Navigation, color: '#60a5fa', label: 'Nav' },        // blue
    AI: { icon: Cpu, color: '#CBFD00', label: 'AI Core' },            // lime
    EW: { icon: Zap, color: '#fbbf24', label: 'EW' },                  // yellow
  };

  // Scenarios with slot-based configurations
  const scenarios = [
    {
      id: 'asw',
      flash: 'FLASH TRAFFIC: Submarine contact, Taiwan Strait. ASW coverage needed.',
      platform: 'MQ-8C',
      platformIcon: Plane,
      count: 24,
      slots: [
        { type: 'AI', angle: 0 },      // top
        { type: 'SENSORS', angle: 72 },
        { type: 'COMMS', angle: 144 },
        { type: 'NAV', angle: 216 },
        { type: 'EW', angle: 288 },
      ],
      before: {
        name: 'ISR Config',
        fills: {
          AI: 'Marine AI',
          SENSORS: 'Scion ESM',
          COMMS: 'Lattice Mesh',
          NAV: 'SeaFIND Nav',
          EW: null,
        }
      },
      after: {
        name: 'ASW Config',
        fills: {
          AI: 'Marine AI',
          SENSORS: 'Towed Sonar',
          COMMS: 'Lattice Mesh',
          NAV: 'SeaFIND Nav',
          EW: 'DRAKE Counter-UAS',
        }
      },
      swapOrder: ['SENSORS', 'EW'],
      domain: 'SUBSURFACE',
      mission: 'ASW PATROL'
    },
    {
      id: 'strike',
      flash: 'FLASH TRAFFIC: High-value target identified. Strike package required.',
      platform: 'MQ-9B',
      platformIcon: Plane,
      count: 12,
      slots: [
        { type: 'AI', angle: 0 },
        { type: 'SENSORS', angle: 60 },
        { type: 'WEAPONS', angle: 120 },
        { type: 'COMMS', angle: 180 },
        { type: 'NAV', angle: 240 },
        { type: 'EW', angle: 300 },
      ],
      before: {
        name: 'Recon Config',
        fills: {
          AI: 'Marine AI',
          SENSORS: 'Scion ESM',
          WEAPONS: null,
          COMMS: 'Lattice Mesh',
          NAV: 'SeaFIND Nav',
          EW: null,
        }
      },
      after: {
        name: 'Strike Config',
        fills: {
          AI: 'Marine AI',
          SENSORS: 'NGHTS Targeting',
          WEAPONS: 'Jackal Missile',
          COMMS: 'Lattice Mesh',
          NAV: 'SeaFIND Nav',
          EW: 'Scion ESM',
        }
      },
      swapOrder: ['SENSORS', 'WEAPONS', 'EW'],
      domain: 'AERIAL',
      mission: 'PRECISION STRIKE'
    },
    {
      id: 'denial',
      flash: 'FLASH TRAFFIC: Hostile surface contacts approaching. Sea denial required.',
      platform: 'MetalShark',
      platformIcon: Ship,
      count: 48,
      slots: [
        { type: 'AI', angle: 0 },
        { type: 'SENSORS', angle: 90 },
        { type: 'COMMS', angle: 180 },
        { type: 'EW', angle: 270 },
      ],
      before: {
        name: 'Patrol Config',
        fills: {
          AI: 'Marine AI',
          SENSORS: 'Scion ESM',
          COMMS: 'Lattice Mesh',
          EW: null,
        }
      },
      after: {
        name: 'Guardian Config',
        fills: {
          AI: 'Guardian AI',
          SENSORS: 'Scion ESM',
          COMMS: 'Lattice Mesh',
          EW: 'DRAKE Counter-UAS',
        }
      },
      swapOrder: ['AI', 'EW'],
      domain: 'SURFACE',
      mission: 'SEA DENIAL'
    }
  ];

  const [scenarioIndex, setScenarioIndex] = useState(0);
  const scenario = scenarios[scenarioIndex];

  useEffect(() => {
    setTimeout(() => setShowContent(true), 100);
  }, []);

  // Animation cycle
  useEffect(() => {
    const cycle = () => {
      setPhase('before');
      setTimer(0);
      setSwappingSlot(null);

      // Start transformation after 2.5s
      setTimeout(() => {
        setPhase('transforming');

        // Animate slot swaps sequentially
        scenario.swapOrder.forEach((slotType, i) => {
          setTimeout(() => {
            setSwappingSlot(slotType);
          }, i * 400);
        });

        // Count up timer
        let t = 0;
        const timerInterval = setInterval(() => {
          t += 1;
          setTimer(t);
          if (t >= 47) clearInterval(timerInterval);
        }, 30);
      }, 2500);

      // Show "after" state
      setTimeout(() => {
        setPhase('after');
        setSwappingSlot(null);
      }, 2500 + scenario.swapOrder.length * 400 + 500);

      // Deploy
      setTimeout(() => {
        setPhase('deployed');
      }, 5000);

      // Next scenario
      setTimeout(() => {
        setScenarioIndex(i => (i + 1) % scenarios.length);
      }, 7500);
    };

    cycle();
    const interval = setInterval(cycle, 7500);
    return () => clearInterval(interval);
  }, [scenarioIndex, scenarios.length, scenario.swapOrder]);

  const PlatformIcon = scenario.platformIcon;

  // Render a single slot node
  const SlotNode = ({ slot, fill, isSwapping }) => {
    const slotConfig = SLOT_TYPES[slot.type];
    const Icon = slotConfig.icon;
    const radius = 90; // distance from center
    const x = 50 + radius * Math.sin((slot.angle * Math.PI) / 180);
    const y = 50 - radius * Math.cos((slot.angle * Math.PI) / 180);

    const isEmpty = !fill;
    const isBeingSwapped = isSwapping && swappingSlot === slot.type;

    return (
      <g>
        {/* Connection line to center */}
        <line
          x1={`${x}%`}
          y1={`${y}%`}
          x2="50%"
          y2="50%"
          stroke={isEmpty ? '#CBFD0033' : slotConfig.color}
          strokeWidth={isEmpty ? 1 : 2}
          strokeDasharray={isEmpty ? '4,4' : 'none'}
          opacity={isBeingSwapped ? 0.3 : 0.6}
          className="transition-all duration-300"
        />
        {/* Slot circle */}
        <circle
          cx={`${x}%`}
          cy={`${y}%`}
          r="24"
          fill={isEmpty ? '#1e293b' : `${slotConfig.color}20`}
          stroke={slotConfig.color}
          strokeWidth={isEmpty ? 1 : 2}
          strokeDasharray={isEmpty ? '4,4' : 'none'}
          className={`transition-all duration-300 ${isBeingSwapped ? 'animate-pulse' : ''}`}
          style={{
            filter: isBeingSwapped ? `drop-shadow(0 0 8px ${slotConfig.color})` : 'none'
          }}
        />
        {/* Slot icon or capability initial */}
        <text
          x={`${x}%`}
          y={`${y}%`}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={isEmpty ? '#64748b' : slotConfig.color}
          fontSize="10"
          fontWeight="bold"
          className="transition-all duration-300"
        >
          {fill ? fill.split(' ')[0].substring(0, 6) : '+'}
        </text>
      </g>
    );
  };

  // The visual configuration diagram
  const ConfigDiagram = ({ config, label, isActive, isTransforming }) => {
    const fills = isTransforming && phase === 'after' ? scenario.after.fills : config.fills;

    return (
      <div className={`relative transition-all duration-500 ${isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-60'}`}>
        <div className="text-center mb-2">
          <span className="text-gray-500 text-xs uppercase tracking-wider">{label}</span>
        </div>

        {/* The diagram */}
        <div className="relative w-64 h-64 bg-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Render slots */}
            {scenario.slots.map((slot) => (
              <SlotNode
                key={slot.type}
                slot={slot}
                fill={fills[slot.type]}
                isSwapping={isTransforming}
              />
            ))}

            {/* Center platform */}
            <circle
              cx="50%"
              cy="50%"
              r="20"
              fill="#CBFD0015"
              stroke="#CBFD00"
              strokeWidth="2"
            />
          </svg>

          {/* Platform icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <PlatformIcon size={28} className="text-lime-brand" />
          </div>
        </div>

        {/* Config name */}
        <div className="text-center mt-3">
          <div className="text-white font-bold">{config.name}</div>
          <div className="text-gray-500 text-sm">{scenario.platform} ×{scenario.count}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-darkest flex flex-col overflow-hidden">
      {/* Flash Traffic Banner */}
      <div className={`bg-red-900/30 border-b border-red-500/50 px-6 py-3 transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-400 animate-pulse" />
          <span className="text-red-400 font-mono text-sm tracking-wide">{scenario.flash}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className={`transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 bg-lime-brand rounded-lg flex items-center justify-center">
                <Ship size={22} className="text-black" />
              </div>
              <span className="text-white font-bold text-xl">CALIBURN MISSION BAY</span>
            </div>
            <p className="text-gray-400 text-lg">Same platform. New mission. <span className="text-lime-brand font-bold">Minutes, not months.</span></p>
          </div>

          {/* Transformation Hero */}
          <div className="flex items-center gap-6 mb-6">
            {/* Before */}
            <ConfigDiagram
              config={scenario.before}
              label="Current Configuration"
              isActive={phase === 'before'}
              isTransforming={false}
            />

            {/* Transformation Indicator */}
            <div className="flex flex-col items-center gap-3 w-32">
              <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
                phase === 'transforming'
                  ? 'border-lime-brand bg-lime-brand/10 animate-pulse'
                  : phase === 'after' || phase === 'deployed'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-600 bg-gray-800/50'
              }`}
              >
                {phase === 'transforming' ? (
                  <div className="text-center">
                    <Clock size={16} className="text-lime-brand mx-auto mb-1" />
                    <span className="text-lime-brand font-mono text-sm font-bold">{timer}s</span>
                  </div>
                ) : phase === 'after' || phase === 'deployed' ? (
                  <Check size={28} className="text-green-500" />
                ) : (
                  <ChevronRight size={28} className="text-gray-500" />
                )}
              </div>
              <span className={`text-xs font-mono uppercase tracking-wider transition-colors duration-300 ${
                phase === 'transforming' ? 'text-lime-brand' :
                phase === 'after' || phase === 'deployed' ? 'text-green-500' : 'text-gray-600'
              }`}
              >
                {phase === 'before' && 'Ready'}
                {phase === 'transforming' && 'Swapping'}
                {phase === 'after' && 'Complete'}
                {phase === 'deployed' && 'Deployed'}
              </span>

              {/* Slot legend during transformation */}
              {phase === 'transforming' && swappingSlot && (
                <div className="text-center animate-pulse">
                  <div className="text-xs text-gray-400">Swapping</div>
                  <div className="text-sm font-bold" style={{ color: SLOT_TYPES[swappingSlot].color }}>
                    {SLOT_TYPES[swappingSlot].label}
                  </div>
                </div>
              )}
            </div>

            {/* After */}
            <ConfigDiagram
              config={scenario.after}
              label="New Configuration"
              isActive={phase === 'after' || phase === 'deployed'}
              isTransforming={phase === 'transforming'}
            />
          </div>

          {/* Deployment Indicator */}
          <div className={`text-center transition-all duration-500 ${phase === 'deployed' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-500/10 border border-green-500/30 rounded-full">
              <Zap size={18} className="text-green-400" />
              <span className="text-green-400 font-mono text-sm">
                {scenario.count}× {scenario.platform} deployed to {scenario.domain} — Mission: {scenario.mission}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className={`border-t border-gray-800 bg-gray-900/50 transition-all duration-1000 delay-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          {/* Stats */}
          <div className="flex gap-8">
            <div>
              <div className="text-2xl font-bold text-white">2,662</div>
              <div className="text-gray-500 text-xs">Vessels Ready</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">14</div>
              <div className="text-gray-500 text-xs">Configurations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">47</div>
              <div className="text-gray-500 text-xs">Capabilities</div>
            </div>
          </div>

          {/* Value Prop */}
          <div className="text-center max-w-md">
            <div className="text-gray-500 text-sm">Traditional Navy: fixed configs, 18-month procurement</div>
            <div className="text-lime-brand font-bold">Mission Bay: swap any payload in minutes</div>
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
