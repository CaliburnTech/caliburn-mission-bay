import React from 'react';
import { GitBranch } from 'lucide-react';

/**
 * Badge showing "Based on: X" for variation squadrons
 * Clicking navigates to the parent squadron
 */
const VariationBadge = ({ parentName, parentId, onNavigateToParent, size = 'default' }) => {
  if (!parentName) return null;

  const handleClick = (e) => {
    e.stopPropagation();
    if (onNavigateToParent) {
      onNavigateToParent(parentId);
    }
  };

  const isSmall = size === 'small';

  return (
    <div
      onClick={handleClick}
      className={`inline-flex items-center gap-1 bg-purple-500/20 text-purple-300 rounded-full cursor-pointer hover:bg-purple-500/30 transition-colors ${
        isSmall ? 'px-2 py-0.5 text-[0.65rem]' : 'px-2.5 py-1 text-xs'
      }`}
      title={`Based on "${parentName}" - Click to view parent`}
    >
      <GitBranch size={isSmall ? 10 : 12} />
      <span className="font-medium">Based on: {parentName}</span>
    </div>
  );
};

export default VariationBadge;
