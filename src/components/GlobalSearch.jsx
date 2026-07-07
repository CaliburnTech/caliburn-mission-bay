import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Cpu, Ship, Layers, Users, ChevronRight } from 'lucide-react';
import { engineeringStacks, individualCapabilities, squadrons } from '../data/marketplaceData';
import { vesselHullData } from '../data/vesselData';
import useDataStore from '../providers/dataStore';

// Empty results structure
const emptyResults = {
  capabilities: [],
  stacks: [],
  vessels: [],
  squadrons: []
};

// Build search index from all data sources (module scope — only reads static data imports)
const buildSearchResults = (query) => {
    if (!query || query.length < 2) return emptyResults;

    const lowerQuery = query.toLowerCase();
    const results = {
      capabilities: [],
      stacks: [],
      vessels: [],
      squadrons: []
    };

    // Search capabilities
    individualCapabilities.forEach(cap => {
      if (
        cap.name.toLowerCase().includes(lowerQuery) ||
        cap.provider?.toLowerCase().includes(lowerQuery) ||
        cap.description?.toLowerCase().includes(lowerQuery) ||
        cap.category?.toLowerCase().includes(lowerQuery)
      ) {
        results.capabilities.push({
          type: 'capability',
          name: cap.name,
          subtitle: cap.provider,
          category: cap.category,
          data: cap
        });
      }
    });

    // Search stacks
    engineeringStacks.forEach(stack => {
      if (
        stack.name.toLowerCase().includes(lowerQuery) ||
        stack.provider?.toLowerCase().includes(lowerQuery) ||
        stack.description?.toLowerCase().includes(lowerQuery) ||
        stack.category?.toLowerCase().includes(lowerQuery)
      ) {
        results.stacks.push({
          type: 'stack',
          name: stack.name,
          subtitle: stack.provider,
          category: stack.category,
          data: stack
        });
      }
    });

    // Search vessels
    vesselHullData.forEach(vessel => {
      if (
        vessel.name.toLowerCase().includes(lowerQuery) ||
        vessel.type?.toLowerCase().includes(lowerQuery) ||
        vessel.description?.toLowerCase().includes(lowerQuery)
      ) {
        results.vessels.push({
          type: 'vessel',
          name: vessel.name,
          subtitle: vessel.type,
          category: vessel.displacement,
          data: vessel
        });
      }
    });

    // Search squadrons
    squadrons.forEach(sqdn => {
      if (
        sqdn.name.toLowerCase().includes(lowerQuery) ||
        sqdn.primaryMission?.toLowerCase().includes(lowerQuery)
      ) {
        results.squadrons.push({
          type: 'squadron',
          name: sqdn.name,
          subtitle: `${sqdn.units} units`,
          category: sqdn.status,
          data: sqdn
        });
      }
    });

  return results;
};

const GlobalSearch = ({ onNavigate }) => {
  const _dataStore = useDataStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Memoize search results to avoid rebuilding on every render
  const searchResults = useMemo(() => buildSearchResults(searchTerm), [searchTerm]);
  const hasResults = Object.values(searchResults).some(arr => arr.length > 0);
  const totalResults = Object.values(searchResults).reduce((sum, arr) => sum + arr.length, 0);

  // Memoize flattened results for keyboard navigation
  const flatResults = useMemo(() => [
    ...searchResults.capabilities.map(r => ({ ...r, groupType: 'capabilities' })),
    ...searchResults.stacks.map(r => ({ ...r, groupType: 'stacks' })),
    ...searchResults.vessels.map(r => ({ ...r, groupType: 'vessels' })),
    ...searchResults.squadrons.map(r => ({ ...r, groupType: 'squadrons' }))
  ], [searchResults]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || flatResults.length === 0) {
      if (e.key === 'Escape') {
        setSearchTerm('');
        setIsOpen(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, flatResults.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && flatResults[selectedIndex]) {
          handleResultClick(flatResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        break;
    }
  };

  const handleResultClick = (result) => {
    // Navigate to the appropriate view
    const viewMap = {
      capability: 'capabilities',
      stack: 'stacks',
      vessel: 'outfitter',
      squadron: 'shipyard'
    };

    if (onNavigate) {
      onNavigate(viewMap[result.type], result.data);
    }

    setIsOpen(false);
    setSearchTerm('');
    setSelectedIndex(-1);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'capability': return <Cpu size={16} className="text-lime-brand" />;
      case 'stack': return <Layers size={16} className="text-cyan-400" />;
      case 'vessel': return <Ship size={16} className="text-blue-400" />;
      case 'squadron': return <Users size={16} className="text-amber-400" />;
      default: return <Search size={16} />;
    }
  };

  const getGroupLabel = (type) => {
    switch (type) {
      case 'capabilities': return 'Capabilities';
      case 'stacks': return 'Engineering Stacks';
      case 'vessels': return 'Vessels & Platforms';
      case 'squadrons': return 'Squadrons';
      default: return type;
    }
  };

  let currentGroupIndex = 0;

  return (
    <div className="relative w-80">
      {/* Search Input */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          size={18}
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search everything..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(e.target.value.length >= 2);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            if (searchTerm.length >= 2) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="w-full py-3 pl-10 pr-10 bg-darker border border-border-subtle rounded-lg text-white text-sm outline-none transition-colors focus:border-lime-brand focus:bg-darkest"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && searchTerm.length >= 2 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-darker border border-border-lime rounded-lg shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto"
        >
          {!hasResults ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              {`No results found for "${searchTerm}"`}
            </div>
          ) : (
            <>
              {/* Results count */}
              <div className="px-3 py-2 bg-darkest border-b border-border-subtle text-xs text-gray-500">
                {totalResults} result{totalResults !== 1 ? 's' : ''} found
              </div>

              {/* Grouped results */}
              {Object.entries(searchResults).map(([groupKey, items]) => {
                if (items.length === 0) return null;

                const groupStartIndex = currentGroupIndex;
                currentGroupIndex += items.length;

                return (
                  <div key={groupKey}>
                    {/* Group Header */}
                    <div className="px-3 py-2 bg-darkest/50 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-border-subtle">
                      {getGroupLabel(groupKey)} ({items.length})
                    </div>

                    {/* Group Items */}
                    {items.map((item, idx) => {
                      const flatIndex = groupStartIndex + idx;
                      const isSelected = selectedIndex === flatIndex;

                      return (
                        <button
                          key={`${item.type}-${item.name}-${idx}`}
                          onClick={() => handleResultClick(item)}
                          className={`w-full px-3 py-2.5 flex items-center gap-3 text-left transition-colors ${
                            isSelected
                              ? 'bg-lime-brand/20 border-l-2 border-lime-brand'
                              : 'hover:bg-darkest border-l-2 border-transparent'
                          }`}
                        >
                          <div className="flex-shrink-0">
                            {getIcon(item.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">
                              {item.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {item.subtitle}
                            </div>
                          </div>
                          <ChevronRight size={14} className="flex-shrink-0 text-gray-600" />
                        </button>
                      );
                    })}
                  </div>
                );
              })}

              {/* Keyboard hint */}
              <div className="px-3 py-2 bg-darkest border-t border-border-subtle text-xs text-gray-600 flex gap-4">
                <span><kbd className="px-1 py-0.5 bg-darker rounded text-gray-500">↑↓</kbd> Navigate</span>
                <span><kbd className="px-1 py-0.5 bg-darker rounded text-gray-500">↵</kbd> Select</span>
                <span><kbd className="px-1 py-0.5 bg-darker rounded text-gray-500">Esc</kbd> Close</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
