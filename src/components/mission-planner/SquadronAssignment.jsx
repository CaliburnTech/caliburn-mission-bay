import React from 'react';
import { Users, Check } from 'lucide-react';

const SquadronAssignment = ({ assignedSquadrons, setAssignedSquadrons, availableSquadrons }) => {
  const toggleSquadron = (squadronId) => {
    if (assignedSquadrons.includes(squadronId)) {
      setAssignedSquadrons(assignedSquadrons.filter(id => id !== squadronId));
    } else {
      setAssignedSquadrons([...assignedSquadrons, squadronId]);
    }
  };

  const getMissionTypeColorClass = (objective) => {
    const colors = {
      'target_destruction': 'bg-red-500',
      'reconnaissance': 'bg-cyan-500',
      'interdiction': 'bg-orange-500',
      'logistics_support': 'bg-violet-500'
    };
    return colors[objective] || 'bg-gray-500';
  };

  const readySquadrons = availableSquadrons.filter(s => s.operationalStatus === 'MISSION READY');
  const deployedSquadrons = availableSquadrons.filter(s => s.operationalStatus === 'DEPLOYED');

  return (
    <div className="bg-darker rounded-lg border border-border-subtle p-3 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-lime-brand" />
          <h4 className="text-lime-brand text-[0.7rem] font-semibold m-0">ASSIGN SQUADRON</h4>
        </div>
        <span className="text-gray-500 text-[0.55rem]">
          {assignedSquadrons.length} selected
        </span>
      </div>

      {/* Ready squadrons */}
      <div className="flex-1 overflow-y-auto">
        <div className="text-green-400 text-[0.5rem] font-semibold mb-1">
          MISSION READY ({readySquadrons.length})
        </div>
        <div className="flex flex-col gap-1 mb-2">
          {readySquadrons.map(squadron => {
            const isSelected = assignedSquadrons.includes(squadron.id);
            return (
              <button
                key={squadron.id}
                onClick={() => toggleSquadron(squadron.id)}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer w-full text-left transition-colors
                  ${isSelected
                    ? 'bg-lime-brand/15 border border-lime-brand'
                    : 'bg-darkest border border-border-subtle hover:border-gray-500'
                  }`}
              >
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center ${
                    isSelected ? 'bg-lime-brand' : 'bg-transparent border border-gray-500'
                  }`}
                >
                  {isSelected && <Check size={10} className="text-black" />}
                </div>
                <div className={`w-2 h-2 rounded-full ${getMissionTypeColorClass(squadron.missionObjective)}`} />
                <div className="flex-1">
                  <div className="text-gray-50 text-[0.6rem] font-semibold">{squadron.name}</div>
                  <div className="text-gray-500 text-[0.45rem]">{squadron.units} units • {squadron.primaryMission?.split(' ').slice(0, 4).join(' ')}...</div>
                </div>
                <div className="text-green-400 text-[0.4rem] px-1 py-0.5 bg-green-400/10 rounded">
                  {squadron.status?.missionReady || 0} READY
                </div>
              </button>
            );
          })}
          {readySquadrons.length === 0 && (
            <div className="text-gray-500 text-[0.55rem] p-2 text-center">
              No squadrons available
            </div>
          )}
        </div>

        {/* Deployed squadrons */}
        {deployedSquadrons.length > 0 && (
          <>
            <div className="text-orange-500 text-[0.5rem] font-semibold mb-1">
              DEPLOYED ({deployedSquadrons.length})
            </div>
            <div className="flex flex-col gap-1">
              {deployedSquadrons.map(squadron => {
                const isSelected = assignedSquadrons.includes(squadron.id);
                return (
                  <button
                    key={squadron.id}
                    onClick={() => toggleSquadron(squadron.id)}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer w-full text-left transition-colors
                      ${isSelected
                        ? 'bg-orange-500/15 border border-orange-500'
                        : 'bg-orange-500/5 border border-orange-500/20 hover:border-orange-500/50'
                      }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center ${
                        isSelected ? 'bg-orange-500' : 'bg-transparent border border-orange-500/50'
                      }`}
                    >
                      {isSelected && <Check size={10} className="text-black" />}
                    </div>
                    <div className={`w-2 h-2 rounded-full ${getMissionTypeColorClass(squadron.missionObjective)}`} />
                    <div className="flex-1">
                      <div className="text-gray-50 text-[0.6rem] font-semibold">{squadron.name}</div>
                      <div className="text-orange-500 text-[0.45rem]">{squadron.units} units • Active mission</div>
                    </div>
                    <div className="text-orange-500 text-[0.4rem] px-1 py-0.5 bg-orange-500/10 rounded">
                      {squadron.status?.deployed || 0} DEPLOYED
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SquadronAssignment;
