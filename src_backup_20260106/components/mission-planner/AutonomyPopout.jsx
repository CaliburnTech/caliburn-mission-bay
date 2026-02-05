import React from 'react';
import { X, Layers, ArrowUp, ArrowDown } from 'lucide-react';
import { autonomyLayers, hierarchyPresets } from './constants';

const AutonomyPopout = ({ node, stateHierarchies, setStateHierarchies, onClose }) => {
  const stateId = node?.id || 'default';
  const stateName = node?.label || 'Default State';

  const currentHierarchy = stateHierarchies[stateId] || [...hierarchyPresets.DEFAULT];

  const setHierarchy = (newHierarchy) => {
    setStateHierarchies({
      ...stateHierarchies,
      [stateId]: newHierarchy
    });
  };

  const moveLayer = (index, direction) => {
    const newHierarchy = [...currentHierarchy];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newHierarchy.length) return;
    [newHierarchy[index], newHierarchy[newIndex]] = [newHierarchy[newIndex], newHierarchy[index]];
    setHierarchy(newHierarchy);
  };

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-darker rounded-xl border-2 border-lime-brand/60 p-4 w-80 z-[1000] shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers size={18} color="#cbfd00" />
          <div>
            <h3 className="text-lime-brand text-[0.85rem] font-bold m-0">AUTONOMY HIERARCHY</h3>
            <p className="text-gray-400 text-[0.6rem] m-0">State: <span className="text-yellow-400">{stateName}</span></p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 bg-transparent border-0 text-gray-500 cursor-pointer">
          <X size={16} />
        </button>
      </div>

      {/* State description */}
      <div className="px-2 py-2 bg-yellow-400/10 border border-yellow-400/30 rounded-md mb-3">
        <p className="text-yellow-400 text-[0.55rem] m-0">
          Configure how the Five Body autonomy layers should be prioritized when the system reaches this decision point.
        </p>
      </div>

      {/* Preset buttons */}
      <div className="flex gap-1 mb-2">
        {Object.entries(hierarchyPresets).map(([preset, hierarchy]) => {
          const isActive = JSON.stringify(currentHierarchy) === JSON.stringify(hierarchy);
          return (
            <button
              key={preset}
              onClick={() => setHierarchy([...hierarchy])}
              className={`flex-1 px-1 py-1.5 border border-gray-600/30 rounded text-[0.5rem] cursor-pointer ${
                isActive ? 'bg-lime-brand text-black font-bold' : 'bg-gray-600/20 text-gray-400 font-medium'
              }`}
            >
              {preset}
            </button>
          );
        })}
      </div>

      {/* Hierarchy Stack */}
      <div className="bg-darkest rounded-md p-2">
        <div className="text-green-400 text-[0.5rem] text-center mb-1 font-semibold">
          ▲ HIGHEST PRIORITY
        </div>
        {currentHierarchy.map((layerId, index) => {
          const layer = autonomyLayers.find(l => l.id === layerId);
          if (!layer) return null;
          const LayerIcon = layer.icon;
          return (
            <div
              key={layerId}
              className="flex items-center gap-2 p-1.5 bg-darker rounded mb-0.5"
              style={{
                border: `1px solid ${layer.color}50`,
                borderLeft: `4px solid ${layer.color}`
              }}
            >
              <div className="flex flex-col">
                <button
                  onClick={() => moveLayer(index, -1)}
                  disabled={index === 0}
                  className={`p-0 bg-transparent border-0 ${index === 0 ? 'text-gray-700 cursor-default' : 'text-gray-400 cursor-pointer'}`}
                >
                  <ArrowUp size={10} />
                </button>
                <button
                  onClick={() => moveLayer(index, 1)}
                  disabled={index === currentHierarchy.length - 1}
                  className={`p-0 bg-transparent border-0 ${index === currentHierarchy.length - 1 ? 'text-gray-700 cursor-default' : 'text-gray-400 cursor-pointer'}`}
                >
                  <ArrowDown size={10} />
                </button>
              </div>
              <div className="w-[22px] h-[22px] rounded flex items-center justify-center" style={{ backgroundColor: `${layer.color}20` }}>
                <LayerIcon size={12} color={layer.color} />
              </div>
              <div className="flex-1">
                <div className="text-[0.65rem] font-bold" style={{ color: layer.color }}>{layer.shortName}</div>
                <div className="text-gray-500 text-[0.45rem]">{layer.name}</div>
              </div>
              <div
                className={`w-[18px] h-[18px] rounded-full text-[0.55rem] flex items-center justify-center font-bold ${
                  index === 0 ? 'bg-green-400 text-black' : 'bg-gray-600/30 text-gray-400'
                }`}
              >
                {index + 1}
              </div>
            </div>
          );
        })}
        <div className="text-red-500 text-[0.5rem] text-center mt-1 font-semibold">
          ▼ LOWEST PRIORITY
        </div>
      </div>
    </div>
  );
};

export default AutonomyPopout;
