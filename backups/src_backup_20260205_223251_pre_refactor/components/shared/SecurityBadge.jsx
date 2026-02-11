import { Shield, Lock, Unlink, Network } from 'lucide-react';

const SecurityBadge = ({ type, size = 14 }) => {
  const badges = {
    'NSA-Approved Crypto': { icon: Shield, color: 'text-red-500', bg: 'bg-red-500/20', title: 'NSA-Approved Cryptography' },
    'Zero Trust Architecture': { icon: Lock, color: 'text-emerald-500', bg: 'bg-emerald-500/20', title: 'Zero Trust Architecture' },
    'DDIL Capable': { icon: Unlink, color: 'text-yellow-400', bg: 'bg-yellow-400/20', title: 'DDIL (Disconnected/Degraded/Intermittent/Limited) Capable' },
    'End-to-End Encrypted': { icon: Network, color: 'text-blue-500', bg: 'bg-blue-500/20', title: 'Encrypted Mesh Network' },
    'Mesh Network': { icon: Network, color: 'text-blue-500', bg: 'bg-blue-500/20', title: 'Encrypted Mesh Network' }
  };

  const badge = badges[type];
  if (!badge) return null;

  const Icon = badge.icon;
  return (
    <div className={`${badge.bg} p-1 rounded flex items-center`} title={badge.title}>
      <Icon size={size} className={badge.color} />
    </div>
  );
};

export default SecurityBadge;
