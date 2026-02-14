import React, { useMemo } from 'react';
import { Clock, Navigation, Package, Radio, Fuel, AlertTriangle } from 'lucide-react';
import useOutfitterStore from '../store/outfitterStore';
import { aerialBaselines } from '../data/vesselData';

// Stat configuration for aerial platforms
const aerialStatConfig = {
  endurance: {
    label: 'Endurance',
    icon: Clock,
    unit: 'hrs',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    higherIsBetter: true
  },
  missionRadius: {
    label: 'Radius',
    icon: Navigation,
    unit: 'nm',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    higherIsBetter: true
  },
  payload: {
    label: 'Payload',
    icon: Package,
    unit: 'lbs',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    higherIsBetter: false, // Shows USED - lower usage is better
    isUsage: true
  },
  burnRate: {
    label: 'Burn Rate',
    icon: Fuel,
    unit: '%',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    higherIsBetter: false // Lower burn = better
  }
};

// Format value for display
const formatValue = (value, key) => {
  if (value === undefined || value === null) return '—';

  if (key === 'endurance') {
    if (value >= 24) return `${Math.round(value)}`;
    return value.toFixed(1);
  }

  if (key === 'missionRadius' && value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }

  if (key === 'burnRate') {
    return `${Math.round(value)}`;
  }

  if (Math.abs(value) >= 1000) {
    return Math.round(value).toLocaleString();
  }

  if (Number.isInteger(value)) {
    return value.toString();
  }

  return value.toFixed(1);
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

const AerialStatsDisplay = () => {
  const { selectedHull, vesselConfiguration, calculateVesselStats } = useOutfitterStore();

  // Calculate aerial-specific stats
  const aerialStats = useMemo(() => {
    if (!selectedHull || !selectedHull.aerialSpecs) return null;

    const baseStats = calculateVesselStats();
    if (!baseStats) return null;

    const { aerialSpecs } = selectedHull;
    const { used, totalCapacity } = baseStats;

    // Calculate payload usage (convert kg to lbs if needed)
    const maxPayloadLbs = totalCapacity.payload * 2.205; // kg to lbs
    const usedPayloadLbs = used.payload * 2.205;
    const payloadUsagePercent = maxPayloadLbs > 0 ? (usedPayloadLbs / maxPayloadLbs) * 100 : 0;

    // Calculate burn rate effect on endurance
    const burnRateType = aerialSpecs.burnRateType || 'MALE';
    const burnFactor = aerialBaselines.burnRate.sensitivityByType[burnRateType] || aerialBaselines.burnRate.baseFactor;
    const burnRatePercent = payloadUsagePercent * burnFactor;

    // Effective endurance = base * (1 - burnRate/100)
    const baseEndurance = aerialSpecs.endurance || 12;
    const effectiveEndurance = baseEndurance * (1 - burnRatePercent / 100);
    const enduranceLoss = baseEndurance - effectiveEndurance;

    return {
      endurance: {
        base: baseEndurance,
        effective: effectiveEndurance,
        loss: enduranceLoss,
        status: effectiveEndurance < aerialBaselines.endurance.criticalLow ? 'critical' :
                effectiveEndurance < baseEndurance * 0.5 ? 'warning' : 'nominal'
      },
      missionRadius: {
        value: aerialSpecs.missionRadius || 500,
        status: 'nominal'
      },
      payload: {
        used: usedPayloadLbs,
        total: maxPayloadLbs,
        percent: payloadUsagePercent,
        status: payloadUsagePercent > 100 ? 'critical' :
                payloadUsagePercent > 80 ? 'warning' : 'nominal'
      },
      burnRate: {
        value: burnRatePercent,
        factor: burnFactor,
        type: burnRateType,
        status: burnRatePercent > 30 ? 'warning' : 'nominal'
      },
      datalink: {
        tier: aerialSpecs.datalinkTier || 2,
        info: aerialBaselines.datalink.tiers[aerialSpecs.datalinkTier - 1] || aerialBaselines.datalink.tiers[1]
      },
      ceiling: aerialSpecs.ceiling || 20000
    };
  }, [selectedHull, vesselConfiguration, calculateVesselStats]);

  if (!selectedHull || !selectedHull.aerialSpecs || !aerialStats) {
    return null;
  }

  // Calculate bar fill percentages
  const getBarFill = (key) => {
    switch (key) {
      case 'endurance':
        return Math.min(100, (aerialStats.endurance.effective / aerialBaselines.endurance.max) * 100);
      case 'missionRadius':
        return Math.min(100, (aerialStats.missionRadius.value / aerialBaselines.missionRadius.max) * 100);
      case 'payload':
        return Math.min(110, aerialStats.payload.percent);
      case 'burnRate':
        return Math.min(100, aerialStats.burnRate.value / 50 * 100); // 50% burn rate = full bar
      default:
        return 50;
    }
  };

  // Get the value to display
  const getValue = (key) => {
    switch (key) {
      case 'endurance': return aerialStats.endurance.effective;
      case 'missionRadius': return aerialStats.missionRadius.value;
      case 'payload': return aerialStats.payload.used;
      case 'burnRate': return aerialStats.burnRate.value;
      default: return 0;
    }
  };

  // Get status for coloring
  const getStatus = (key) => {
    switch (key) {
      case 'endurance': return aerialStats.endurance.status;
      case 'missionRadius': return aerialStats.missionRadius.status;
      case 'payload': return aerialStats.payload.status;
      case 'burnRate': return aerialStats.burnRate.status;
      default: return 'nominal';
    }
  };

  const getStatusColor = (key) => {
    const status = getStatus(key);
    if (status === 'critical') return '#ef4444';
    if (status === 'warning') return '#fbbf24';
    return aerialStatConfig[key].color;
  };

  const datalinkTier = aerialStats.datalink.info;

  return (
    <div className="bg-darker/95 backdrop-blur-sm rounded-xl border border-lime-brand/30 shadow-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h4 className="text-lime-brand font-bold tracking-wide text-sm">
          AERIAL PERFORMANCE
        </h4>
        <div className="text-xs text-gray-500">
          Ceiling: {(aerialStats.ceiling / 1000).toFixed(0)}k ft
        </div>
      </div>

      {/* Stats Bars */}
      <div className="flex justify-between gap-2 mb-5">
        {Object.entries(aerialStatConfig).map(([key, config]) => {
          const Icon = config.icon;
          const value = getValue(key);
          const fill = getBarFill(key);
          const status = getStatus(key);
          const isCritical = status === 'critical';
          const isWarning = status === 'warning';
          const barColor = getStatusColor(key);

          return (
            <div key={key} className="flex flex-col items-center flex-1">
              {/* Delta/modifier indicator for endurance */}
              <div
                className="h-5 flex items-center justify-center text-xs font-bold tabular-nums mb-1"
                style={{
                  color: key === 'endurance' && aerialStats.endurance.loss > 0
                    ? '#f87171'
                    : '#6b7280',
                }}
              >
                {key === 'endurance' && aerialStats.endurance.loss > 0.5
                  ? `-${aerialStats.endurance.loss.toFixed(1)}`
                  : ''}
              </div>

              {/* Vertical bar container */}
              <div
                className="relative w-full h-32 rounded-lg overflow-hidden"
                style={{ backgroundColor: config.bgColor }}
              >
                {/* SVG for striped pattern when critical */}
                {isCritical && (
                  <svg className="absolute inset-0 w-full h-full">
                    <StripedPattern id={`stripes-aerial-${key}`} />
                    <rect
                      x="0"
                      y={`${100 - Math.max(0, fill)}%`}
                      width="100%"
                      height={`${Math.max(0, fill)}%`}
                      fill={`url(#stripes-aerial-${key})`}
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

                {/* Base endurance marker (ghost bar) */}
                {key === 'endurance' && aerialStats.endurance.loss > 0 && (
                  <div
                    className="absolute bottom-0 left-0 right-0 border-t-2 border-dashed opacity-30 transition-all duration-500"
                    style={{
                      height: `${(aerialStats.endurance.base / aerialBaselines.endurance.max) * 100}%`,
                      borderColor: config.color
                    }}
                  />
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

      {/* Datalink Tier Indicator */}
      <div className="border-t border-gray-700/50 pt-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio size={14} className="text-gray-400" />
            <span className="text-[0.65rem] text-gray-500 font-semibold tracking-wide">
              C2 DATALINK
            </span>
          </div>
          <div
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${datalinkTier.color}20`,
              color: datalinkTier.color
            }}
          >
            {datalinkTier.name.toUpperCase()}
          </div>
        </div>

        {/* Datalink tier visualization */}
        <div className="flex gap-1">
          {aerialBaselines.datalink.tiers.map((tier, i) => (
            <div
              key={tier.level}
              className="flex-1 h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: i < aerialStats.datalink.tier
                  ? tier.color
                  : '#1e293b'
              }}
            />
          ))}
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {datalinkTier.desc}
        </div>
      </div>

      {/* Payload Capacity Summary */}
      <div className="border-t border-gray-700/50 pt-4">
        <div className="text-[0.65rem] text-gray-500 font-semibold tracking-wide mb-3">
          PAYLOAD UTILIZATION
        </div>

        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Weight</span>
          <span
            className={`font-semibold ${
              aerialStats.payload.status === 'critical' ? 'text-red-400' :
              aerialStats.payload.status === 'warning' ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            {aerialStats.payload.used.toFixed(0)} / {aerialStats.payload.total.toFixed(0)} lbs
          </span>
        </div>
        <div className="h-2.5 bg-gray-800/60 rounded-full overflow-hidden relative">
          {aerialStats.payload.status === 'critical' ? (
            <svg className="absolute inset-0 w-full h-full">
              <StripedPattern id="stripes-aerial-payload-bar" />
              <rect width="100%" height="100%" fill="url(#stripes-aerial-payload-bar)" />
            </svg>
          ) : (
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, aerialStats.payload.percent)}%`,
                backgroundColor: aerialStats.payload.status === 'warning' ? '#fbbf24' : '#8b5cf6',
                boxShadow: `0 0 10px ${aerialStats.payload.status === 'warning' ? '#fbbf2440' : '#8b5cf640'}`
              }}
            />
          )}
        </div>

        {/* Burn rate effect explanation */}
        {aerialStats.burnRate.value > 5 && (
          <div className="mt-3 flex items-start gap-1.5 text-xs text-yellow-400/80">
            <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
            <span>
              Payload weight reducing endurance by {aerialStats.endurance.loss.toFixed(1)} hrs
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AerialStatsDisplay;
