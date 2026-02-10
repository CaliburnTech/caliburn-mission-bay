import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable modal component with consistent styling.
 * Handles backdrop, centering, escape key, and click-outside.
 *
 * @example
 * <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="md">
 *   <Modal.Header title="My Modal" subtitle="Optional subtitle" />
 *   <Modal.Content>
 *     <p>Modal content goes here</p>
 *   </Modal.Content>
 *   <Modal.Footer>
 *     <button onClick={handleCancel}>Cancel</button>
 *     <button onClick={handleSubmit}>Submit</button>
 *   </Modal.Footer>
 * </Modal>
 */

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  full: 'max-w-[95%]'
};

const ACCENTS = {
  lime: 'border-lime-brand/30',
  purple: 'border-purple-500/30',
  orange: 'border-orange-500/30',
  blue: 'border-blue-500/30',
  red: 'border-red-500/30',
  gray: 'border-gray-600/30'
};

const Modal = ({
  isOpen,
  onClose,
  size = 'md',
  accent = 'lime',
  closeOnBackdrop = true,
  closeOnEscape = true,
  zIndex = 1000,
  children
}) => {
  // Handle escape key
  const handleKeyDown = useCallback((e) => {
    if (closeOnEscape && e.key === 'Escape') {
      onClose();
    }
  }, [closeOnEscape, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 md:p-8"
      style={{ zIndex }}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-darkest border-2 ${ACCENTS[accent]} rounded-2xl w-full ${SIZES[size]} max-h-[90vh] overflow-hidden flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * Modal header with title, optional subtitle, and close button.
 */
const ModalHeader = ({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-lime-brand',
  iconBg = 'bg-lime-brand/20',
  onClose,
  children
}) => (
  <div className="p-5 md:p-6 border-b border-gray-600/30 flex-shrink-0">
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={iconColor} size={20} />
          </div>
        )}
        <div>
          <h2 className="text-white text-lg md:text-xl font-bold">{title}</h2>
          {subtitle && <p className="text-gray-400 text-sm mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-1 -mr-1"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>
      )}
    </div>
    {children}
  </div>
);

/**
 * Modal content area with optional scroll.
 */
const ModalContent = ({ className = '', children }) => (
  <div className={`flex-1 overflow-y-auto p-5 md:p-6 ${className}`}>
    {children}
  </div>
);

/**
 * Modal footer for action buttons.
 */
const ModalFooter = ({ className = '', children }) => (
  <div className={`p-5 md:p-6 border-t border-gray-600/30 bg-darker/50 flex-shrink-0 ${className}`}>
    {children}
  </div>
);

// Attach sub-components
Modal.Header = ModalHeader;
Modal.Content = ModalContent;
Modal.Footer = ModalFooter;

export default Modal;
