/**
 * Fleet Status Board
 *
 * Table showing all vessels in a squadron with their sync status.
 * Color-coded: green=current, amber=behind, red=diverged, gray=disconnected.
 *
 * GIT ANALOGY: `git branch -v` showing which branches are ahead/behind main.
 */

import { Ship, Check, AlertTriangle, GitBranch, Wifi, WifiOff, RefreshCw, Zap } from 'lucide-react';
import useVersionStore from '../../store/versionStore';

const STATUS_CONFIG = {
  CURRENT: { label: 'Current', icon: Check, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
  BEHIND: { label: 'Behind', icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  DIVERGED: { label: 'Diverged', icon: GitBranch, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
  DISCONNECTED: { label: 'Disconnected', icon: WifiOff, color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' },
  UNKNOWN: { label: 'Unknown', icon: Wifi, color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.1)' }
};

const FleetStatusBoard = ({ squadronId }) => {
  const fleetStatus = useVersionStore(s => s.getFleetStatus(squadronId));
  const syncVessel = useVersionStore(s => s.syncVessel);
  const syncAllVessels = useVersionStore(s => s.syncAllVessels);
  const summary = useVersionStore(s => s.getFleetSyncSummary(squadronId));

  if (fleetStatus.length === 0) {
    return (
      <div className="card-inner p-6 text-center">
        <Ship size={28} className="mx-auto mb-2 opacity-30 text-gray-500" />
        <p className="text-gray-500 text-sm">No vessels tracked for this squadron</p>
        <p className="text-gray-600 text-xs mt-1">Deploy a configuration to start tracking vessel states</p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-3">
          {summary.current > 0 && <StatusBadge count={summary.current} status="CURRENT" />}
          {summary.behind > 0 && <StatusBadge count={summary.behind} status="BEHIND" />}
          {summary.diverged > 0 && <StatusBadge count={summary.diverged} status="DIVERGED" />}
          {summary.disconnected > 0 && <StatusBadge count={summary.disconnected} status="DISCONNECTED" />}
        </div>
        {(summary.behind > 0 || summary.diverged > 0) && (
          <button
            onClick={() => syncAllVessels(squadronId)}
            className="btn-primary"
            style={{ fontSize: '11px', padding: '4px 12px', minHeight: 'auto' }}
          >
            <RefreshCw size={11} style={{ marginRight: '4px' }} />
            Sync All ({summary.behind + summary.diverged})
          </button>
        )}
      </div>

      {/* Vessel table */}
      <div className="card-inner" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div className="flex gap-2 px-3 py-2" style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.3)', fontSize: '10px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <div style={{ flex: 2 }}>Vessel</div>
          <div style={{ flex: 1 }}>Status</div>
          <div style={{ flex: 1 }}>Running</div>
          <div style={{ flex: 1 }}>Last Seen</div>
          <div style={{ width: '80px', textAlign: 'right' }}>Actions</div>
        </div>

        {/* Rows */}
        {fleetStatus.map((vessel, idx) => {
          const config = STATUS_CONFIG[vessel.syncStatus] || STATUS_CONFIG.UNKNOWN;
          const StatusIcon = config.icon;
          const lastSeen = vessel.lastSeenAt
            ? formatRelativeTime(vessel.lastSeenAt)
            : 'Never';

          return (
            <div
              key={vessel.vesselId}
              className="flex gap-2 px-3 py-2 items-center"
              style={{
                borderBottom: idx < fleetStatus.length - 1 ? '1px solid rgba(75, 85, 99, 0.15)' : 'none',
                backgroundColor: idx % 2 === 1 ? 'rgba(75, 85, 99, 0.05)' : 'transparent'
              }}
            >
              {/* Vessel name */}
              <div className="flex items-center gap-2" style={{ flex: 2 }}>
                <Ship size={12} style={{ color: config.color }} />
                <span className="text-gray-200 text-xs font-medium">{vessel.vesselName}</span>
              </div>

              {/* Status */}
              <div style={{ flex: 1 }}>
                <span className="inline-flex items-center gap-1" style={{
                  fontSize: '10px', fontWeight: 600, color: config.color,
                  backgroundColor: config.bg, padding: '2px 8px', borderRadius: '4px'
                }}
                >
                  <StatusIcon size={10} />
                  {config.label}
                  {vessel.versionsBehind > 0 && vessel.syncStatus === 'BEHIND' && (
                    <span style={{ fontFamily: 'monospace' }}>({vessel.versionsBehind})</span>
                  )}
                </span>
              </div>

              {/* Running version */}
              <div style={{ flex: 1, fontSize: '10px', color: '#9ca3af', fontFamily: 'monospace' }}>
                {vessel.runningVersionId ? vessel.runningVersionId.slice(-8) : '—'}
                {vessel.hasOverride && (
                  <span style={{ color: '#ef4444', marginLeft: '4px', fontSize: '9px' }}>★ override</span>
                )}
              </div>

              {/* Last seen */}
              <div style={{ flex: 1, fontSize: '10px', color: '#6b7280' }}>
                {lastSeen}
              </div>

              {/* Actions */}
              <div style={{ width: '80px', textAlign: 'right' }}>
                {(vessel.syncStatus === 'BEHIND' || vessel.syncStatus === 'DIVERGED') && (
                  <button
                    onClick={() => syncVessel(vessel.vesselId)}
                    title="Sync to intended version"
                    style={{
                      padding: '2px 8px', fontSize: '9px', fontWeight: 600,
                      backgroundColor: 'rgba(203, 253, 0, 0.1)', border: '1px solid rgba(203, 253, 0, 0.3)',
                      borderRadius: '3px', color: '#cbfd00', cursor: 'pointer'
                    }}
                  >
                    Sync
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StatusBadge = ({ count, status }) => {
  const config = STATUS_CONFIG[status];
  return (
    <span className="inline-flex items-center gap-1" style={{
      fontSize: '11px', fontWeight: 600, color: config.color,
      backgroundColor: config.bg, padding: '3px 10px', borderRadius: '6px'
    }}
    >
      {count} {config.label}
    </span>
  );
};

const formatRelativeTime = (timestamp) => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export default FleetStatusBoard;
