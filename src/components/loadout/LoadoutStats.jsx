import { useMemo } from 'react';
import { Zap, Navigation, Ship, Rocket, Check, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CATEGORY_COLORS } from '../../constants/colors';

/**
 * Mario Kart style stat bars showing vessel performance metrics.
 * Updates in real-time as capabilities are added/removed.
 */
export const LoadoutStatsDisplay = ({ vessel, loadout, previewCapability }) => {
  // Calculate current totals from loadout
  const currentStats = useMemo(() => {
    let powerUsed = 0;
    let weightUsed = 0;
    let speedDelta = 0;
    let rangeDelta = 0;

    Object.values(loadout).forEach(categoryItems => {
      categoryItems.forEach(cap => {
        if (cap?.swap) {
          powerUsed += cap.swap.power || 0;
          weightUsed += cap.swap.weight || 0;
        }
        if (cap?.statImpacts) {
          speedDelta += cap.statImpacts.speed || 0;
          rangeDelta += cap.statImpacts.range || 0;
        }
      });
    });

    const baseSpeed = vessel?.specs?.speed || 10;
    const baseRange = vessel?.specs?.range || 100;
    const powerCapacity = vessel?.capacity?.totalPower || 10;
    const weightCapacity = vessel?.capacity?.totalWeight || 500;
    const baseSignature = vessel?.specs?.rcs || 5;

    return {
      speed: Math.max(0, baseSpeed + speedDelta),
      baseSpeed,
      range: Math.max(0, baseRange + rangeDelta),
      baseRange,
      powerUsed,
      powerCapacity,
      powerRemaining: powerCapacity - powerUsed,
      weightUsed,
      weightCapacity,
      weightRemaining: weightCapacity - weightUsed,
      signature: baseSignature
    };
  }, [vessel, loadout]);

  // Calculate preview deltas if hovering a capability
  const previewDeltas = useMemo(() => {
    if (!previewCapability) return null;

    const swap = previewCapability.swap || {};
    const impacts = previewCapability.statImpacts || {};

    return {
      speed: impacts.speed || 0,
      range: impacts.range || 0,
      power: swap.power || 0,
      weight: swap.weight || 0
    };
  }, [previewCapability]);

  // Stat bar with Mario Kart style segments
  const StatBar = ({ label, icon: Icon, value, maxValue, unit, color, previewDelta, isCapacity }) => {
    const basePercent = Math.min(100, (value / maxValue) * 100);
    const deltaPercent = previewDelta ? Math.min(100 - basePercent, Math.max(-basePercent, (Math.abs(previewDelta) / maxValue) * 100)) : 0;
    const isPositive = previewDelta > 0;
    const isNegative = previewDelta < 0;

    // For capacity stats (power/payload), negative delta means using more = bad
    const showWarning = isCapacity ? (value - (previewDelta || 0)) < 0 : false;

    return (
      <div className="flex items-center gap-3">
        <div className="w-6 flex justify-center">
          <Icon size={14} style={{ color }} />
        </div>
        <div className="w-16 text-gray-400 text-xs font-medium">{label}</div>
        <div className="flex-1 h-3 bg-gray-800/80 rounded-full overflow-hidden flex relative">
          {/* Base bar */}
          <div
            className="h-full rounded-full transition-all duration-300 relative z-10"
            style={{
              width: `${basePercent}%`,
              backgroundColor: color,
              boxShadow: `0 0 8px ${color}40`
            }}
          />
          {/* Preview delta overlay */}
          {previewDelta !== 0 && previewDelta && (
            <div
              className={`h-full absolute transition-all duration-300 ${isPositive ? 'rounded-r-full' : 'rounded-l-full'}`}
              style={{
                width: `${deltaPercent}%`,
                left: isNegative ? `${basePercent - deltaPercent}%` : `${basePercent}%`,
                backgroundColor: isCapacity
                  ? (isNegative ? '#ef4444' : '#22c55e')
                  : (isPositive ? '#22c55e' : '#ef4444'),
                opacity: 0.8,
                animation: 'pulse 1s ease-in-out infinite'
              }}
            />
          )}
          {/* Segment lines for Mario Kart feel */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex-1 border-r border-gray-700/30 last:border-0" />
            ))}
          </div>
        </div>
        <div className="w-20 text-right">
          <span className={`text-sm font-bold ${showWarning ? 'text-red-400' : 'text-gray-200'}`}>
            {isCapacity ? `${value}` : value}
          </span>
          {previewDelta !== 0 && previewDelta && (
            <span className={`text-xs ml-1 font-semibold ${
              isCapacity
                ? (previewDelta < 0 ? 'text-red-400' : 'text-green-400')
                : (previewDelta > 0 ? 'text-green-400' : 'text-red-400')
            }`}
            >
              {previewDelta > 0 ? '+' : ''}{isCapacity ? -previewDelta : previewDelta}
            </span>
          )}
          <span className="text-gray-500 text-xs ml-1">{unit}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-darker/50 rounded-xl p-4 space-y-2.5">
      <StatBar
        label="SPEED"
        icon={Zap}
        value={currentStats.speed}
        maxValue={50}
        unit="kts"
        color={CATEGORY_COLORS.SENSORS.hex}
        previewDelta={previewDeltas?.speed}
      />
      <StatBar
        label="RANGE"
        icon={Navigation}
        value={currentStats.range}
        maxValue={Math.max(1000, currentStats.baseRange * 1.5)}
        unit="nm"
        color={CATEGORY_COLORS.NAV.hex}
        previewDelta={previewDeltas?.range}
      />
      <StatBar
        label="POWER"
        icon={Zap}
        value={currentStats.powerRemaining}
        maxValue={currentStats.powerCapacity}
        unit="kW"
        color={CATEGORY_COLORS.EW.hex}
        previewDelta={previewDeltas?.power}
        isCapacity
      />
      <StatBar
        label="PAYLOAD"
        icon={Ship}
        value={currentStats.weightRemaining}
        maxValue={currentStats.weightCapacity}
        unit="kg"
        color={CATEGORY_COLORS.COMMS.hex}
        previewDelta={previewDeltas?.weight}
        isCapacity
      />
    </div>
  );
};

/**
 * Shows deployment readiness status with issues and deploy button.
 */
export const DeploymentStatus = ({ isReady, issues, equippedCount, onDeploy }) => {
  return (
    <div className={`mt-4 rounded-xl border-2 p-4 transition-all ${
      isReady
        ? 'bg-lime-brand/10 border-lime-brand/50'
        : 'bg-gray-800/50 border-gray-600/50'
    }`}
    >
      {/* Status Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isReady ? (
            <CheckCircle2 size={20} className="text-lime-brand" />
          ) : (
            <AlertCircle size={20} className="text-yellow-400" />
          )}
          <span className={`font-bold text-sm ${isReady ? 'text-lime-brand' : 'text-yellow-400'}`}>
            {isReady ? 'READY TO DEPLOY' : 'CONFIGURATION INCOMPLETE'}
          </span>
        </div>
        <span className="text-gray-400 text-xs">
          {equippedCount} capabilities equipped
        </span>
      </div>

      {/* Issues List (when not ready) */}
      {!isReady && issues.length > 0 && (
        <div className="space-y-1 mb-3">
          {issues.map((issue, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <div className={`w-1.5 h-1.5 rounded-full ${
                issue.severity === 'error' ? 'bg-red-400' : 'bg-yellow-400'
              }`}
              />
              <span className={issue.severity === 'error' ? 'text-red-400' : 'text-yellow-400'}>
                {issue.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Ready Checklist (when ready) */}
      {isReady && (
        <div className="grid grid-cols-2 gap-1 mb-3 text-xs">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Check size={12} className="text-lime-brand" /> Power budget OK
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Check size={12} className="text-lime-brand" /> Payload capacity OK
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Check size={12} className="text-lime-brand" /> Core systems active
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Check size={12} className="text-lime-brand" /> Capabilities loaded
          </div>
        </div>
      )}

      {/* Deploy Button */}
      <button
        onClick={onDeploy}
        disabled={!isReady}
        className={`w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
          isReady
            ? 'bg-lime-brand text-black hover:bg-lime-brand/90 cursor-pointer'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        <Rocket size={16} />
        {isReady ? 'Deploy to Mission' : 'Complete Configuration to Deploy'}
      </button>
    </div>
  );
};
