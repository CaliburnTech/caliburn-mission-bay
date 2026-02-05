import React from 'react';
import { Ship, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { squadrons } from '../data/marketplaceData';
import { vesselHullComponents, vesselHullData } from '../data/vesselData';

const ShipyardView = ({
  openSquadronManagement,
  onSelectHull,
  showSquadrons,
  setShowSquadrons
}) => {
  const getOperationalStatusColor = (status) => {
    switch(status) {
      case 'MISSION READY': return { color: 'text-green-400', bg: 'bg-green-500/20' };
      case 'DEPLOYED': return { color: 'text-blue-400', bg: 'bg-blue-500/20' };
      case 'STANDBY': return { color: 'text-yellow-400', bg: 'bg-yellow-400/20' };
      case 'ACTIVE': return { color: 'text-cyan-500', bg: 'bg-cyan-500/20' };
      default: return { color: 'text-gray-400', bg: 'bg-gray-400/20' };
    }
  };

  return (
    <div>
      {/* HERO: Configuration Bay */}
      <div className="card-accent mb-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-lime-brand/5 to-transparent rounded-xl" />
        <div className="relative z-10 py-8">
          <div className="mb-8">
            <Settings className="text-lime-brand mx-auto mb-4" size={56} />
            <h2 className="text-lime-brand font-bold text-4xl mb-3 tracking-tight">
              CONFIGURATION BAY
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Select a platform to configure capabilities and mount points
            </p>
          </div>

          {/* Hull Selection Grid */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 max-w-6xl mx-auto px-6">
            {vesselHullData.map((vessel, idx) => {
              const HullComponent = vesselHullComponents[vessel.icon];
              return (
                <div
                  key={idx}
                  onClick={() => onSelectHull(vessel)}
                  className="bg-darkest border-2 border-lime-brand/30 rounded-xl p-8 cursor-pointer transition-all duration-300 hover:border-lime-brand hover:shadow-[0_0_30px_rgba(203,253,0,0.15)] group"
                >
                  <div className="mb-6 flex justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                    {HullComponent && <HullComponent size={140} />}
                  </div>
                  <h3 className="text-lime-brand font-bold text-xl mb-2">
                    {vessel.name.toUpperCase()}
                  </h3>
                  <p className="text-gray-500 text-sm mb-1">
                    {vessel.type}
                  </p>
                  <p className="text-gray-400 text-xs mb-4">
                    {vessel.displacement}
                  </p>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    {vessel.description}
                  </p>
                </div>
              );
            })}

            {/* Custom Platform Card */}
            <div
              onClick={() => onSelectHull({
                name: "Custom Platform",
                type: "Design from Scratch",
                displacement: "Variable",
                icon: "Custom Platform",
                description: "Start with a blank canvas and build your perfect configuration"
              })}
              className="bg-darkest border-2 border-dashed border-lime-brand/40 rounded-xl p-8 cursor-pointer transition-all duration-300 hover:border-lime-brand hover:bg-lime-brand/5 flex flex-col items-center justify-center"
            >
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-lime-brand/40 flex items-center justify-center mb-6">
                <span className="text-lime-brand text-5xl font-light">+</span>
              </div>
              <h3 className="text-lime-brand font-bold text-xl mb-2">
                CUSTOM PLATFORM
              </h3>
              <p className="text-gray-500 text-sm mb-1">
                Design from Scratch
              </p>
              <p className="text-gray-500 text-xs leading-relaxed text-center mt-2">
                Start with a blank canvas and build your perfect configuration
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECONDARY: Squadron Status */}
      <div className="bg-darker rounded-xl border border-gray-700/50">
        {/* Collapsible Header */}
        <button
          onClick={() => setShowSquadrons(!showSquadrons)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-800/30 transition-colors rounded-xl"
        >
          <div className="flex items-center gap-3">
            <Ship className="text-gray-400" size={20} />
            <span className="text-gray-300 font-semibold">Your Squadrons</span>
            <span className="text-gray-500 text-sm">({squadrons.length} squadrons)</span>
          </div>
          {showSquadrons ? (
            <ChevronUp className="text-gray-400" size={20} />
          ) : (
            <ChevronDown className="text-gray-400" size={20} />
          )}
        </button>

        {/* Squadron Cards */}
        {showSquadrons && (
          <div className="px-6 pb-6">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
              {squadrons.map((squadron, idx) => {
                const opStatus = getOperationalStatusColor(squadron.operationalStatus);
                return (
                  <div
                    key={idx}
                    onClick={() => openSquadronManagement(squadron, idx)}
                    className="bg-darkest border border-gray-700/50 rounded-lg p-4 cursor-pointer hover:border-lime-brand/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-gray-200 font-semibold text-sm">
                          {squadron.name}
                        </h4>
                        <p className="text-gray-500 text-xs">
                          {squadron.primaryMission}
                        </p>
                      </div>
                      <div className={`${opStatus.bg} ${opStatus.color} px-2 py-0.5 rounded text-[0.65rem] font-bold`}>
                        {squadron.operationalStatus}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{squadron.units} units</span>
                      <span>•</span>
                      <span>{squadron.location}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShipyardView;
