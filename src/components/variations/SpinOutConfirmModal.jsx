import React from 'react';
import { Unlink, X, AlertTriangle } from 'lucide-react';
import useSquadronStore from '../../store/squadronStore';

/**
 * Confirmation modal for spinning out a variation to become independent
 */
const SpinOutConfirmModal = ({ isOpen, onClose, squadron }) => {
  const { spinOutVariation } = useSquadronStore();

  if (!isOpen || !squadron || !squadron.isVariation) return null;

  const handleSpinOut = () => {
    const success = spinOutVariation(squadron.id);
    if (success) {
      onClose(true); // Pass success flag
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[1100] flex items-center justify-center p-8">
      <div className="bg-darkest border-2 border-orange-500/30 rounded-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-600/30">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Unlink className="text-orange-400" size={20} />
              </div>
              <div>
                <h2 className="text-white text-lg font-bold">Spin Out Variation</h2>
                <p className="text-gray-400 text-sm">Break inheritance link</p>
              </div>
            </div>
            <button
              onClick={() => onClose(false)}
              className="text-gray-400 hover:text-white transition-colors text-xl leading-none"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Warning */}
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-5">
            <div className="flex gap-3">
              <AlertTriangle className="text-orange-400 flex-shrink-0 mt-0.5" size={18} />
              <div className="text-orange-200 text-sm">
                <p className="font-medium mb-1">This action cannot be undone</p>
                <p className="text-orange-300/80">
                  {`"${squadron.name}" will become an independent squadron. It will no longer inherit changes from "${squadron.parentName}".`}
                </p>
              </div>
            </div>
          </div>

          {/* What happens */}
          <div className="space-y-3 text-sm">
            <h3 className="text-gray-300 font-medium">What happens:</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-lime-brand mt-1">•</span>
                <span>{`All current values (inherited + overridden) become this squadron's own values`}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lime-brand mt-1">•</span>
                <span>{`The "Based on" link will be removed`}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lime-brand mt-1">•</span>
                <span>{`Future changes to "${squadron.parentName}" won't affect this squadron`}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-600/30 bg-darker/50 flex gap-3">
          <button
            onClick={() => onClose(false)}
            className="flex-1 bg-transparent border-2 border-gray-600 text-gray-300 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-700/30 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSpinOut}
            className="flex-1 bg-orange-500 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
          >
            <Unlink size={16} />
            Spin Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpinOutConfirmModal;
