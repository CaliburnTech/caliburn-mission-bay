import React, { useMemo } from 'react';
import { Zap, Gauge, Package, Navigation, Eye, AlertTriangle } from 'lucide-react';
import useOutfitterStore from '../store/outfitterStore';

// Stat configuration with icons, colors, and units
const statConfig = {
  speed: {
    label: 'Speed',
    icon: Gauge,
    unit: 'kts',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    higherIsBetter: true
  },
  range: {
    label: 'Range',
    icon: Navigation,
    unit: 'nm',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    higherIsBetter: true
  },
  power: {
    label: 'Power',
    icon: Zap,
    unit: 'kW',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    higherIsBetter: false, // Shows USED - lower usage is better
    isUsage: true
  },
  payload: {
    label: 'Payload',
    icon: Package,
    unit: 'kg',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    higherIsBetter: false, // Shows USED - lower usage is better
    isUsage: true
  },
  signature: {
    label: 'Stealth',
    icon: Eye,
    unit: 'm²',
    color: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.15)',
    higherIsBetter: false, // lower RCS is better (stealthier)
    invertDisplay: true // invert bar so stealthier = more filled
  }
};

// Format value for display
const formatValue = (value, key) => {
  if (value === undefined || value === null) return '—';

  if (key === 'signature') {
    // RCS formatting
    if (value < 0.01) return '<0.01';
    if (value < 1) return value.toFixed(2);
    if (value < 10) return value.toFixed(1);
    return Math.round(value).toLocaleString();
  }

  if (key === 'range' && value > 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }

  if (Math.abs(value) >= 1000) {
    return Math.round(value).toLocaleString();
  }

  if (Number.isInteger(value)) {
    return value.toString();
  }

  return value.toFixed(1);
};

// Format delta for display
const formatDelta = (delta, key) => {
  if (delta === 0 || delta === undefined) return null;
  const sign = delta > 0 ? '+' : '';
  return `${sign}${formatValue(delta, key)}`;
};

// Striped pattern for critical state
const StripedPattern = ({ id }) => (
  <defs>
    <pattern id={id} patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
      <rect width="4" height="8" fill="#ef4444" />
      <rect x="4" width="4" height="8" fill="#fca5a5" />
    </pattern>
  </defs>
);

const VesselStatsDisplay = () => {
  const { calculateVesselStats, calculateBalance, selectedHull, vesselConfiguration } = useOutfitterStore();

  // Memoize expensive calculations - recalculate only when hull or config changes
  const stats = useMemo(() => calculateVesselStats(), [calculateVesselStats, selectedHull, vesselConfiguration]);
  const balance = useMemo(() => calculateBalance(), [calculateBalance, selectedHull, vesselConfiguration]);

  if (!selectedHull || !stats) {
    return null;
  }

  const { totalCapacity, current, deltas, used, provided, status, unknownImpacts, baselines } = stats;

  // Calculate bar fill percentages based on global baselines
  const getBarFill = (key) => {
    if (key === 'speed') {
      // Speed: 0 to max (50 kts), baseline at 15 kts (30%)
      const pct = Math.min(100, (current.speed / baselines.speed.max) * 100);
      return pct;
    }

    if (key === 'range') {
      // Range: logarithmic scale because values vary wildly (80nm to 100000nm)
      const logValue = Math.log10(Math.max(1, current.range));
      const logMax = Math.log10(baselines.range.max);
      return Math.min(100, (logValue / logMax) * 100);
    }

    if (key === 'power') {
      // Power: shows USED / TOTAL - bar fills as you add consumers
      if (totalCapacity.power === 0) return 0;
      const pct = (used.power / totalCapacity.power) * 100;
      return Math.min(110, pct); // Allow overflow for visual
    }

    if (key === 'payload') {
      // Payload: shows USED / TOTAL - bar fills as you add weight
      if (totalCapacity.payload === 0) return 0;
      const pct = (used.payload / totalCapacity.payload) * 100;
      return Math.min(110, pct);
    }

    if (key === 'signature') {
      // RCS: inverted - lower RCS = higher bar (stealthier)
      // Log scale: 0.001 m² = 100%, 100 m² = 0%
      const logValue = Math.log10(Math.max(0.001, current.rcs));
      const logMin = Math.log10(0.001); // -3
      const logMax = Math.log10(100);   // 2
      const pct = 100 - ((logValue - logMin) / (logMax - logMin) * 100);
      return Math.max(0, Math.min(100, pct));
    }

    return 50;
  };

  // Get the value to display for each stat
  const getValue = (key) => {
    switch (key) {
      case 'speed': return current.speed;
      case 'range': return current.range;
      case 'power': return used.power; // Show used, not remaining
      case 'payload': return used.payload;
      case 'signature': return current.rcs;
      default: return 0;
    }
  };

  // Get delta for display (change from baseline/empty)
  const getDelta = (key) => {
    switch (key) {
      case 'speed': return deltas.speed;
      case 'range': return deltas.range;
      case 'power':
        // Show net change: +consumed, -provided (battery adds shows as negative delta = good)
        return used.power - provided.power;
      case 'payload':
        return used.payload - provided.payload;
      case 'signature': return deltas.rcs;
      default: return 0;
    }
  };

  // Get status color
  const getStatusColor = (key) => {
    const s = status[key];
    if (s === 'critical') return '#ef4444';
    if (s === 'warning') return '#fbbf24';
    return statConfig[key].color;
  };

  return (
    <div className="bg-darker/95 backdrop-blur-sm rounded-xl border border-lime-brand/30 shadow-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h4 className="text-lime-brand font-bold tracking-wide text-sm">
          VESSEL PERFORMANCE
        </h4>
        {unknownImpacts.length > 0 && (
          <div
            className="flex items-center gap-1.5 text-yellow-400 cursor-help"
            title={`Unknown impact: ${unknownImpacts.join(', ')}`}
          >
            <AlertTriangle size={14} />
            <span className="text-xs">{unknownImpacts.length}</span>
          </div>
        )}
      </div>

      {/* Stats Bars */}
      <div className="flex justify-between gap-2 mb-5">
        {Object.entries(statConfig).map(([key, config]) => {
          const Icon = config.icon;
          const value = getValue(key);
          const delta = getDelta(key);
          const fill = getBarFill(key);
          const isCritical = status[key] === 'critical';
          const isWarning = status[key] === 'warning';
          const barColor = getStatusColor(key);

          return (
            <div key={key} className="flex flex-col items-center flex-1">
              {/* Delta indicator */}
              <div
                className="h-5 flex items-center justify-center text-xs font-bold tabular-nums mb-1"
                style={{
                  color: delta === 0 ? '#6b7280' :
                         (config.higherIsBetter ? (delta > 0 ? '#4ade80' : '#f87171') : (delta < 0 ? '#4ade80' : '#f87171')),
                  transition: 'color 300ms ease',
                }}
              >
                {formatDelta(delta, key) || ''}
              </div>

              {/* Vertical bar container */}
              <div
                className="relative w-full h-32 rounded-lg overflow-hidden"
                style={{ backgroundColor: config.bgColor }}
              >
                {/* SVG for striped pattern when critical */}
                {isCritical && (
                  <svg className="absolute inset-0 w-full h-full">
                    <StripedPattern id={`stripes-${key}`} />
                    <rect
                      x="0"
                      y={`${100 - Math.max(0, fill)}%`}
                      width="100%"
                      height={`${Math.max(0, fill)}%`}
                      fill={`url(#stripes-${key})`}
                      className="transition-all duration-500"
                    />
                  </svg>
                )}

                {/* Normal bar fill */}
                {!isCritical && (
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-b-lg transition-all duration-500"
                    style={{
                      height: `${Math.max(0, fill)}%`,
                      backgroundColor: barColor,
                      boxShadow: `0 0 20px ${barColor}40`
                    }}
                  >
                    {/* Shine effect */}
                    <div
                      className="absolute inset-0 opacity-40"
                      style={{
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%)'
                      }}
                    />
                  </div>
                )}

                {/* Warning pulse overlay */}
                {isWarning && (
                  <div
                    className="absolute inset-0 animate-pulse"
                    style={{
                      background: 'linear-gradient(to top, rgba(251, 191, 36, 0.2) 0%, transparent 50%)'
                    }}
                  />
                )}

                {/* Value display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className="text-lg font-bold tabular-nums"
                    style={{
                      color: isCritical ? '#fff' : (fill > 40 ? 'white' : barColor),
                      textShadow: '0 1px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.5)'
                    }}
                  >
                    {formatValue(value, key)}
                  </span>
                  <span
                    className="text-[0.6rem] font-semibold"
                    style={{
                      color: 'white',
                      textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.7)'
                    }}
                  >
                    {config.unit}
                  </span>
                </div>
              </div>

              {/* Icon */}
              <div className="mt-2 mb-1">
                <Icon size={16} color={barColor} />
              </div>

              {/* Label */}
              <div className="text-[0.65rem] text-gray-400 font-semibold tracking-wide">
                {config.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Balance Indicator */}
      {balance && balance.totalWeight > 0 && (
        <div className="border-t border-gray-700/50 pt-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[0.65rem] text-gray-500 font-semibold tracking-wide">
              WEIGHT BALANCE
            </div>
            <div
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor:
                  balance.status === 'critical' ? 'rgba(248, 113, 113, 0.2)' :
                  balance.status === 'warning' ? 'rgba(251, 191, 36, 0.2)' :
                  'rgba(74, 222, 128, 0.2)',
                color:
                  balance.status === 'critical' ? '#f87171' :
                  balance.status === 'warning' ? '#fbbf24' :
                  '#4ade80'
              }}
            >
              {balance.status === 'critical' ? 'CRITICAL' :
               balance.status === 'warning' ? 'WARNING' :
               'BALANCED'}
            </div>
          </div>

          {/* Visual balance indicator - top-down vessel view */}
          <div className="relative w-full h-28 bg-gray-800/40 rounded-lg overflow-hidden">
            {/* Vessel outline - top-down boat shape */}
            <svg
              viewBox="0 0 100 70"
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Hull outline - pointed bow, wider stern */}
              <path
                d="M 50 8
                   L 62 18
                   Q 68 24 70 32
                   L 72 48
                   Q 72 58 68 62
                   L 32 62
                   Q 28 58 28 48
                   L 30 32
                   Q 32 24 38 18
                   Z"
                fill="rgba(163, 230, 53, 0.08)"
                stroke="rgba(163, 230, 53, 0.5)"
                strokeWidth="1.5"
              />
              {/* Deck/cabin area */}
              <rect
                x="40" y="28" width="20" height="18" rx="2"
                fill="rgba(163, 230, 53, 0.15)"
                stroke="rgba(163, 230, 53, 0.3)"
                strokeWidth="0.5"
              />
              {/* Bow point accent */}
              <circle cx="50" cy="12" r="2" fill="rgba(163, 230, 53, 0.4)" />
              {/* Port rail */}
              <line x1="34" y1="22" x2="30" y2="50" stroke="rgba(163, 230, 53, 0.25)" strokeWidth="1" />
              {/* Starboard rail */}
              <line x1="66" y1="22" x2="70" y2="50" stroke="rgba(163, 230, 53, 0.25)" strokeWidth="1" />
              {/* Stern transom */}
              <line x1="34" y1="60" x2="66" y2="60" stroke="rgba(163, 230, 53, 0.3)" strokeWidth="1" />

              {/* Center crosshairs */}
              <line x1="50" y1="18" x2="50" y2="55" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" strokeDasharray="2,2" />
              <line x1="32" y1="37" x2="68" y2="37" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" strokeDasharray="2,2" />
              {/* Center point */}
              <circle cx="50" cy="37" r="1.5" fill="rgba(255,255,255,0.25)" />

              {/* Center of mass indicator */}
              <g
                style={{
                  transform: `translate(${balance.offsetX * 0.35}px, ${balance.offsetY * 0.35}px)`,
                  transition: 'transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                <circle
                  cx="50"
                  cy="37"
                  r="6"
                  fill={
                    balance.status === 'critical' ? '#f87171' :
                    balance.status === 'warning' ? '#fbbf24' :
                    '#4ade80'
                  }
                  style={{
                    transition: 'fill 300ms ease',
                    filter: `drop-shadow(0 0 8px ${
                      balance.status === 'critical' ? '#f87171' :
                      balance.status === 'warning' ? '#fbbf24' :
                      '#4ade80'
                    })`
                  }}
                />
                {/* Weight/balance icon */}
                <text
                  x="50"
                  y="38"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="7"
                  fontWeight="bold"
                >
                  ⚖
                </text>
              </g>
            </svg>

            {/* Direction labels */}
            <div className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[0.55rem] text-gray-500 font-semibold tracking-wider">
              BOW
            </div>
            <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[0.55rem] text-gray-500 font-semibold tracking-wider">
              STERN
            </div>
            <div className="absolute left-0.5 top-1/2 -translate-y-1/2 text-[0.55rem] text-gray-500 font-semibold tracking-wider">
              PORT
            </div>
            <div className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[0.55rem] text-gray-500 font-semibold tracking-wider">
              STBD
            </div>
          </div>

          {/* Offset info */}
          {balance.offset > 0 && (
            <div className="mt-2 text-xs text-gray-400 text-center">
              {balance.offsetY < -3 ? 'Bow heavy' :
               balance.offsetY > 3 ? 'Stern heavy' : ''}
              {Math.abs(balance.offsetY) > 3 && Math.abs(balance.offsetX) > 3 ? ', ' : ''}
              {balance.offsetX < -3 ? 'Port heavy' :
               balance.offsetX > 3 ? 'Starboard heavy' : ''}
              {balance.offset > 0 && ` (${balance.offset}% offset)`}
            </div>
          )}
        </div>
      )}

      {/* Capacity Summary */}
      <div className="border-t border-gray-700/50 pt-4">
        <div className="text-[0.65rem] text-gray-500 font-semibold tracking-wide mb-3">
          CAPACITY UTILIZATION
        </div>

        {/* Weight */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Payload{provided.payload > 0 ? ` (+${provided.payload}kg)` : ''}</span>
            <span
              className={`font-semibold ${status.payload === 'critical' ? 'text-red-400' : status.payload === 'warning' ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              {used.payload.toFixed(0)} / {totalCapacity.payload} kg
            </span>
          </div>
          <div className="h-2.5 bg-gray-800/60 rounded-full overflow-hidden relative">
            {status.payload === 'critical' ? (
              <svg className="absolute inset-0 w-full h-full">
                <StripedPattern id="stripes-payload-bar" />
                <rect width="100%" height="100%" fill="url(#stripes-payload-bar)" />
              </svg>
            ) : (
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (used.payload / totalCapacity.payload) * 100)}%`,
                  backgroundColor: status.payload === 'warning' ? '#fbbf24' : '#8b5cf6',
                  boxShadow: `0 0 10px ${status.payload === 'warning' ? '#fbbf2440' : '#8b5cf640'}`
                }}
              />
            )}
          </div>
        </div>

        {/* Power */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Power{provided.power > 0 ? ` (+${provided.power}kW)` : ''}</span>
            <span
              className={`font-semibold ${status.power === 'critical' ? 'text-red-400' : status.power === 'warning' ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              {used.power.toFixed(1)} / {totalCapacity.power} kW
            </span>
          </div>
          <div className="h-2.5 bg-gray-800/60 rounded-full overflow-hidden relative">
            {status.power === 'critical' ? (
              <svg className="absolute inset-0 w-full h-full">
                <StripedPattern id="stripes-power-bar" />
                <rect width="100%" height="100%" fill="url(#stripes-power-bar)" />
              </svg>
            ) : (
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (used.power / totalCapacity.power) * 100)}%`,
                  backgroundColor: status.power === 'warning' ? '#fbbf24' : '#f59e0b',
                  boxShadow: `0 0 10px ${status.power === 'warning' ? '#fbbf2440' : '#f59e0b40'}`
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Unknown impacts warning */}
      {unknownImpacts.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700/50 text-xs text-yellow-400/80 flex items-start gap-1.5">
          <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
          <span>
            Unknown impact: {unknownImpacts.slice(0, 2).join(', ')}
            {unknownImpacts.length > 2 ? ` +${unknownImpacts.length - 2} more` : ''}
          </span>
        </div>
      )}
    </div>
  );
};

export default VesselStatsDisplay;
