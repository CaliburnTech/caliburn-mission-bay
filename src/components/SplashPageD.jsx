import { useState, useEffect } from 'react';
import { ChevronRight, Ship, Plane, AlertTriangle, Clock, Zap, Check } from 'lucide-react';

/**
 * Splash Page D: "The Transformation"
 * Hero: Before/After configuration with animated transformation
 * Scenario-driven with flash traffic urgency
 */
const SplashPageD = ({ onEnter }) => {
  const [phase, setPhase] = useState('before'); // before, transforming, after, deployed
  const [timer, setTimer] = useState(0);
  const [showContent, setShowContent] = useState(false);

  // Scenarios to cycle through
  const scenarios = [
    {
      id: 'asw',
      flash: 'FLASH TRAFFIC: Submarine contact, Taiwan Strait. ASW coverage needed.',
      platform: 'MQ-8C',
      platformIcon: Plane,
      count: 24,
      before: { name: 'ISR Config', caps: ['Scion ESM', 'Marine AI', 'Lattice Mesh'] },
      after: { name: 'ASW Config', caps: ['Towed Sonar', 'SeaFIND Nav', 'Lattice Mesh'] },
      domain: 'SUBSURFACE',
      mission: 'ASW PATROL'
    },
    {
      id: 'strike',
      flash: 'FLASH TRAFFIC: High-value target identified. Strike package required.',
      platform: 'MQ-9B',
      platformIcon: Plane,
      count: 12,
      before: { name: 'Recon Config', caps: ['Scion ESM', 'Hidden Level Radar'] },
      after: { name: 'Strike Config', caps: ['NGHTS Targeting', 'Jackal Missile', 'Lattice Mesh'] },
      domain: 'AERIAL',
      mission: 'PRECISION STRIKE'
    },
    {
      id: 'denial',
      flash: 'FLASH TRAFFIC: Hostile surface contacts approaching. Sea denial required.',
      platform: 'MetalShark',
      platformIcon: Ship,
      count: 48,
      before: { name: 'Patrol Config', caps: ['Marine AI', 'Lattice Mesh'] },
      after: { name: 'Guardian Config', caps: ['Guardian AI', 'Marine AI', 'DRAKE Counter-UAS'] },
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
      // Phase 1: Show "before" state
      setPhase('before');
      setTimer(0);

      // Phase 2: Start transformation after 2s
      setTimeout(() => {
        setPhase('transforming');
        // Count up timer during transformation
        let t = 0;
        const timerInterval = setInterval(() => {
          t += 1;
          setTimer(t);
          if (t >= 47) {
            clearInterval(timerInterval);
          }
        }, 30); // 47 * 30ms = ~1.4s for transformation
      }, 2500);

      // Phase 3: Show "after" state
      setTimeout(() => {
        setPhase('after');
      }, 4000);

      // Phase 4: Deploy
      setTimeout(() => {
        setPhase('deployed');
      }, 5500);

      // Phase 5: Next scenario
      setTimeout(() => {
        setScenarioIndex(i => (i + 1) % scenarios.length);
      }, 8000);
    };

    cycle();
    const interval = setInterval(cycle, 8000);
    return () => clearInterval(interval);
  }, [scenarioIndex, scenarios.length]);

  const Icon = scenario.platformIcon;

  const CapBadge = ({ cap, fading = false }) => (
    <span className={`px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300 text-xs font-medium transition-all duration-500 ${fading ? 'opacity-30 scale-95' : 'opacity-100 scale-100'}`}>
      {cap}
    </span>
  );

  const ConfigCard = ({ config, label, isActive, isTransforming }) => (
    <div className={`bg-gray-800/90 border-2 rounded-xl p-6 transition-all duration-500 ${isActive ? 'border-lime-brand shadow-lg shadow-lime-brand/20' : 'border-gray-700/50'} ${isTransforming ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
      <div className="text-gray-500 text-xs uppercase tracking-wider mb-2">{label}</div>
      <div className="flex items-center gap-3 mb-4">
        <Icon size={24} className="text-lime-brand" />
        <div>
          <div className="text-white font-bold text-lg">{scenario.platform}</div>
          <div className="text-gray-400 text-sm">{config.name}</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {config.caps.map((cap, i) => (
          <CapBadge key={i} cap={cap} fading={isTransforming} />
        ))}
      </div>
      <div className="text-gray-500 text-sm">
        ×{scenario.count} aircraft
      </div>
    </div>
  );

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
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-lime-brand rounded-lg flex items-center justify-center">
                <Ship size={22} className="text-black" />
              </div>
              <span className="text-white font-bold text-xl">CALIBURN MISSION BAY</span>
            </div>
            <p className="text-gray-400 text-lg">Same platform. New mission. <span className="text-lime-brand font-bold">Minutes, not months.</span></p>
          </div>

          {/* Transformation Hero */}
          <div className="flex items-center gap-8 mb-8">
            {/* Before */}
            <ConfigCard
              config={scenario.before}
              label="Current Configuration"
              isActive={phase === 'before'}
              isTransforming={phase === 'transforming'}
            />

            {/* Transformation Indicator */}
            <div className="flex flex-col items-center gap-3">
              <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
                phase === 'transforming'
                  ? 'border-lime-brand bg-lime-brand/10 animate-pulse'
                  : phase === 'after' || phase === 'deployed'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-600 bg-gray-800/50'
              }`}
              >
                {phase === 'transforming' ? (
                  <div className="text-center">
                    <Clock size={20} className="text-lime-brand mx-auto mb-1" />
                    <span className="text-lime-brand font-mono text-lg font-bold">{timer}s</span>
                  </div>
                ) : phase === 'after' || phase === 'deployed' ? (
                  <Check size={32} className="text-green-500" />
                ) : (
                  <ChevronRight size={32} className="text-gray-500" />
                )}
              </div>
              <span className={`text-sm font-mono uppercase tracking-wider transition-colors duration-300 ${
                phase === 'transforming'
                  ? 'text-lime-brand'
                  : phase === 'after' || phase === 'deployed'
                    ? 'text-green-500'
                    : 'text-gray-600'
              }`}
              >
                {phase === 'before' && 'Ready'}
                {phase === 'transforming' && 'Reconfiguring'}
                {phase === 'after' && 'Complete'}
                {phase === 'deployed' && 'Deployed'}
              </span>
            </div>

            {/* After */}
            <ConfigCard
              config={scenario.after}
              label="New Configuration"
              isActive={phase === 'after' || phase === 'deployed'}
              isTransforming={false}
            />
          </div>

          {/* Deployment Indicator */}
          <div className={`text-center transition-all duration-500 ${phase === 'deployed' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-500/10 border border-green-500/30 rounded-full">
              <Zap size={18} className="text-green-400" />
              <span className="text-green-400 font-mono">
                {scenario.count}× {scenario.platform} deployed to {scenario.domain} — Mission: {scenario.mission}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className={`border-t border-gray-800 bg-gray-900/50 transition-all duration-1000 delay-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-6xl mx-auto px-8 py-6 flex items-center justify-between">

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
          <div className="text-center">
            <div className="text-gray-400 text-sm mb-1">Traditional Navy: fixed configs, 18-month procurement cycles</div>
            <div className="text-lime-brand font-bold">Mission Bay: reconfigure any platform in minutes</div>
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
