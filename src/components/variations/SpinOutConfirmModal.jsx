import { Unlink, AlertTriangle } from 'lucide-react';
import useSquadronStore from '../../store/squadronStore';
import Modal from '../ui/Modal';

/**
 * Confirmation modal for spinning out a variation to become independent
 */
const SpinOutConfirmModal = ({ isOpen, onClose, squadron }) => {
  const { spinOutVariation } = useSquadronStore();

  if (!squadron || !squadron.isVariation) return null;

  const handleSpinOut = () => {
    const success = spinOutVariation(squadron.id);
    if (success) {
      onClose(true); // Pass success flag
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose(false)}
      size="md"
      accent="orange"
      zIndex={1100}
    >
      <Modal.Header
        title="Spin Out Variation"
        subtitle="Break inheritance link"
        icon={Unlink}
        iconColor="text-orange-400"
        iconBg="bg-orange-500/20"
        onClose={() => onClose(false)}
      />

      <Modal.Content>
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
      </Modal.Content>

      <Modal.Footer className="flex gap-3">
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
      </Modal.Footer>
    </Modal>
  );
};

export default SpinOutConfirmModal;
