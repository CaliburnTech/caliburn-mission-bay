import { useState } from 'react';
import { GitBranch, Ship, AlertCircle } from 'lucide-react';
import useSquadronStore from '../../store/squadronStore';
import Modal from '../ui/Modal';

/**
 * Modal for creating a new variation from an existing squadron
 */
const CreateVariationModal = ({ isOpen, onClose, parentSquadron }) => {
  const { createVariation } = useSquadronStore();
  const [variationName, setVariationName] = useState('');
  const [error, setError] = useState('');

  if (!parentSquadron) return null;

  const handleCreate = () => {
    const trimmedName = variationName.trim();

    if (!trimmedName) {
      setError('Please enter a name for the variation');
      return;
    }

    const newId = createVariation(parentSquadron.id, trimmedName);

    if (newId) {
      setVariationName('');
      setError('');
      onClose(newId); // Pass new ID so parent can optionally navigate to it
    } else {
      setError('Failed to create variation');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCreate();
    }
  };

  const handleClose = () => {
    setVariationName('');
    setError('');
    onClose();
  };

  const suggestedName = `${parentSquadron.name} - Variant`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      accent="purple"
      zIndex={1100}
    >
      <Modal.Header
        title="Create Variation"
        subtitle={`From: ${parentSquadron.name}`}
        icon={GitBranch}
        iconColor="text-purple-400"
        iconBg="bg-purple-500/20"
        onClose={handleClose}
      />

      <Modal.Content>
        {/* Parent Squadron Preview */}
        <div className="bg-darker rounded-lg p-4 mb-5 border border-gray-700/50">
          <div className="flex items-center gap-3 mb-2">
            <Ship size={18} className="text-lime-brand" />
            <span className="text-white font-medium">{parentSquadron.name}</span>
          </div>
          <div className="text-gray-400 text-sm">
            {parentSquadron.totalUnits} units • {parentSquadron.type}
          </div>
        </div>

        {/* Name Input */}
        <div className="mb-5">
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Variation Name
          </label>
          <input
            type="text"
            value={variationName}
            onChange={(e) => {
              setVariationName(e.target.value);
              setError('');
            }}
            onKeyDown={handleKeyDown}
            placeholder={suggestedName}
            className="w-full bg-darker border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-lime-brand focus:outline-none transition-colors"
            autoFocus
          />
          {error && (
            <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-purple-500/10 rounded-lg p-3 text-purple-300 text-sm">
          <p>
            {`This variation will inherit all properties from the parent squadron. You can modify any property, and it will track what you've changed. Changes to the parent will cascade to inherited fields.`}
          </p>
        </div>
      </Modal.Content>

      <Modal.Footer className="flex gap-3">
        <button
          onClick={handleClose}
          className="flex-1 bg-transparent border-2 border-gray-600 text-gray-300 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-700/30 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          className="flex-1 bg-purple-500 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
        >
          <GitBranch size={16} />
          Create Variation
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateVariationModal;
