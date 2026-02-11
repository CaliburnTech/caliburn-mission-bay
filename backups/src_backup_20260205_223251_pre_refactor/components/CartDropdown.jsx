import React from 'react';
import { X, Ship, Trash2, ShoppingCart } from 'lucide-react';

const CartDropdown = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onClearCart,
  onNavigateToOutfitter
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-darker border border-lime-brand/30 rounded-lg shadow-2xl z-50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-darkest border-b border-lime-brand/20 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShoppingCart size={16} className="text-lime-brand" />
          <span className="text-lime-brand font-semibold text-sm">My Platforms</span>
          <span className="text-gray-500 text-xs">({items.length})</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Cart Items */}
      <div className="max-h-80 overflow-y-auto">
        {items.length === 0 ? (
          <div className="p-6 text-center">
            <Ship size={32} className="text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No items in cart</p>
            <p className="text-gray-600 text-xs mt-1">Add stacks or capabilities to get started</p>
          </div>
        ) : (
          <div className="p-2">
            {items.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.name + idx}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-darkest transition-colors group"
                >
                  <div className="bg-lime-brand/20 p-2 rounded-md flex-shrink-0">
                    {IconComponent ? <IconComponent size={16} className="text-lime-brand" /> : <Ship size={16} className="text-lime-brand" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-200 text-sm font-medium truncate">{item.name}</div>
                    <div className="text-gray-500 text-xs truncate">{item.provider}</div>
                    {item.type && (
                      <span className="text-[0.6rem] text-lime-brand bg-lime-brand/10 px-1.5 py-0.5 rounded uppercase">
                        {item.type}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.name)}
                    className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove from cart"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {items.length > 0 && (
        <div className="px-4 py-3 bg-darkest border-t border-lime-brand/20 flex gap-2">
          <button
            onClick={onClearCart}
            className="flex-1 py-2 text-gray-400 text-xs font-medium border border-gray-600/40 rounded hover:bg-gray-800 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={() => {
              onNavigateToOutfitter?.();
              onClose();
            }}
            className="flex-1 py-2 bg-lime-brand text-black text-xs font-semibold rounded hover:bg-lime-brand/90 transition-colors"
          >
            Configure Platforms
          </button>
        </div>
      )}
    </div>
  );
};

export default CartDropdown;
