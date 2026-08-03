/**
 * PurchaseRequestModal (production mode only)
 *
 * "Buy" / book-a-call flow for the active configuration:
 *   1. POST /api/configurations — persist the config snapshot server-side
 *      (purchase requests require a SavedConfiguration DB id owned by the user)
 *   2. POST /api/purchase-requests { configId, message? } — creates the
 *      PurchaseRequest + garage item, emails the Caliburn team, generates
 *      the SBOM server-side
 *
 * On success the Caliburn team reaches out to schedule a call — this is a
 * lead-gen flow, not a checkout. Callers gate opening this modal with
 * useRequireAuth, so the user is always signed in here.
 */

import { useState } from 'react';
import { Phone, CheckCircle2 } from 'lucide-react';
import Modal from '../ui/Modal';
import {
  saveConfigurationToBackend,
  createPurchaseRequest,
} from '../../services/purchaseRequests';

const PurchaseRequestModal = ({ isOpen, onClose, config, hullName }) => {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  if (!isOpen) return null;

  const configName = config?.name?.trim() || 'Untitled Configuration';

  const handleClose = () => {
    setError(null);
    setSubmitting(false);
    setDone(false);
    setMessage('');
    onClose();
  };

  const handleSubmit = async () => {
    if (submitting || !config) return;
    setSubmitting(true);
    setError(null);
    try {
      // 1. Persist the configuration to get a DB id owned by this user
      const products = Object.values(config.slots || {}).flat().filter(Boolean);
      const saved = await saveConfigurationToBackend({
        name: configName,
        configData: { ...config, hullName: hullName || config.hullName || '', products },
      });
      if (!saved?.id) throw new Error('Could not save the configuration');

      // 2. File the purchase request against it
      await createPurchaseRequest({ configId: saved.id, message: message.trim() || null });

      setDone(true);
    } catch (err) {
      setError(err?.message || 'Failed to submit purchase request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md" accent="lime" zIndex={1150}>
      <Modal.Header
        title={done ? 'Request received' : 'Request Purchase'}
        subtitle={done ? null : `${configName} • ${hullName || config?.hullName || ''}`}
        icon={done ? CheckCircle2 : Phone}
        onClose={handleClose}
      />
      <Modal.Content>
        {done ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-lime-brand/10 border border-lime-brand/30 flex items-center justify-center">
              <CheckCircle2 size={24} className="text-lime-brand" />
            </div>
            <p className="text-gray-200 text-sm leading-relaxed">
              Your purchase request for{' '}
              <span className="text-white font-semibold">{configName}</span> is in.
            </p>
            <p className="text-gray-400 text-sm mt-2 leading-relaxed">
              The Caliburn team will reach out to schedule a call and walk through
              pricing, integration, and delivery.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm leading-relaxed">
              Submit this configuration as a purchase request. Your build is saved to
              your account and the Caliburn team will contact you to book a call.
            </p>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Anything we should know? <span className="text-gray-600">(optional)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="Timeline, quantities, integration constraints…"
                className="w-full px-3.5 py-2.5 bg-darkest border border-gray-700/60 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-lime-brand/50 transition-colors resize-none"
              />
            </div>
            {error && (
              <div className="bg-red-900/30 border border-red-700/50 text-red-300 px-3 py-2.5 rounded-lg text-xs">
                {error}
              </div>
            )}
          </div>
        )}
      </Modal.Content>
      <Modal.Footer className="flex justify-end gap-3">
        {done ? (
          <button
            onClick={handleClose}
            className="px-5 py-2.5 bg-lime-brand text-black font-semibold rounded-lg text-sm hover:bg-lime-brand/90 transition-colors"
          >
            Done
          </button>
        ) : (
          <>
            <button
              onClick={handleClose}
              className="px-4 py-2.5 bg-transparent border border-gray-600/40 text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2.5 bg-lime-brand text-black font-semibold rounded-lg text-sm disabled:opacity-40 hover:bg-lime-brand/90 transition-colors flex items-center gap-2"
            >
              <Phone size={14} />
              {submitting ? 'Submitting…' : 'Submit Request'}
            </button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default PurchaseRequestModal;
