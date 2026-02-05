import React from 'react';
import useDeploymentStore from '../store/deploymentStore';

const DeploymentModal = () => {
  // All state from deployment store - no props needed
  const {
    showDeploymentModal,
    deploymentContext,
    navyMissionTypes,
    roeParameters,
    selectedMissionType,
    setSelectedMissionType,
    selectedROE,
    setSelectedROE,
    activeDeployments,
    showActiveDeployments,
    setShowActiveDeployments,
    closeDeploymentModal,
    executeDeployment
  } = useDeploymentStore();

  return (
    <>
      {/* Deployment Modal */}
      {showDeploymentModal && (
        <div className="fixed inset-0 bg-black/90 z-[1100] flex items-center justify-center p-8">
          <div className="bg-darkest border-2 border-lime-brand/30 rounded-2xl w-[95%] max-w-[1400px] max-h-[95%] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-600/30 flex justify-between items-center bg-[#1a2530]">
              <div>
                <h2 className="text-lime-brand text-[1.8rem] font-bold mb-2">
                  DEPLOYMENT OPERATIONS
                </h2>
                <p className="text-gray-400 text-base">
                  {deploymentContext?.type === 'squadron'
                    ? `Fleet: ${deploymentContext.fleetName} • ${deploymentContext.totalUnits} Units`
                    : 'Single Unit Deployment'
                  }
                </p>
              </div>
              <button
                onClick={closeDeploymentModal}
                className="bg-transparent border border-lime-brand/30 text-lime-brand px-6 py-3 rounded-lg cursor-pointer text-base font-semibold"
              >
                Close
              </button>
            </div>

            {/* Subheader */}
            <div className="p-6 bg-darkest border-b border-gray-600/30">
              <h2 className="text-gray-50 text-2xl font-bold m-0">
                Mission Configuration
              </h2>
              <p className="text-gray-400 text-[0.95rem] mt-2 mb-0">
                Configure your deployment parameters
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto min-h-0 flex flex-col">
              <div className="p-4 px-6 flex-1">

              {/* Mission Configuration - Single Compact View */}
              <div>
                <h3 className="text-lime-brand text-xl font-bold mb-4">
                  {selectedMissionType ? 'Mission Selected' : 'Select Mission'}
                </h3>

                {/* Show selected mission summary when collapsed */}
                {selectedMissionType ? (
                  <div className="p-4 bg-lime-brand/10 border border-lime-brand rounded-lg mb-2 flex justify-between items-center">
                    <div>
                      <div className="text-lime-brand font-semibold text-base">
                        {selectedMissionType.name}
                      </div>
                      <div className="text-gray-300 text-[0.85rem] mt-1">
                        {selectedMissionType.description}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedMissionType(null);
                        setSelectedROE(null);
                      }}
                      className="bg-transparent border border-lime-brand text-lime-brand px-4 py-2 rounded cursor-pointer text-[0.8rem]"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
                    {Object.entries(navyMissionTypes).map(([category, categoryData]) => (
                      <div
                        key={category}
                        className="mb-2 border border-gray-600/30 rounded-lg bg-[#1a2530]/50"
                      >
                        <h4 className="text-lime-brand text-[0.9rem] font-semibold mt-3 mx-4 mb-2 flex items-center gap-2">
                          {React.createElement(categoryData.icon, { size: 16, color: '#cbfd00' })}
                          {category}
                        </h4>
                        <div className="px-3 pb-3">
                          {categoryData.missions.map((mission) => (
                            <label
                              key={mission.id}
                              className={`flex items-center gap-2 px-2 py-1 cursor-pointer rounded transition-colors ${
                                selectedMissionType?.id === mission.id
                                  ? 'bg-lime-brand/10'
                                  : 'hover:bg-lime-brand/5'
                              }`}
                            >
                              <input
                                type="radio"
                                name="mission"
                                value={mission.id}
                                checked={selectedMissionType?.id === mission.id}
                                onChange={() => setSelectedMissionType(mission)}
                                className="accent-lime-brand cursor-pointer"
                              />
                              <div className={`text-[0.85rem] ${
                                selectedMissionType?.id === mission.id
                                  ? 'text-gray-50 font-medium'
                                  : 'text-gray-300'
                              }`}
                              >
                                {mission.name}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rules of Engagement - Shows after mission selection */}
              {selectedMissionType && (
                <div className="mt-6 pt-6 border-t border-gray-600/30">
                  <h3 className="text-lime-brand text-xl font-bold mb-4">
                    Rules of Engagement
                  </h3>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
                    {roeParameters.map((roe) => (
                      <label
                        key={roe.level}
                        className={`block p-4 rounded-xl cursor-pointer transition-all ${
                          selectedROE?.level === roe.level
                            ? 'bg-lime-brand/10 border-2 border-lime-brand'
                            : 'bg-[#1a2530]/50 border border-gray-600/30 hover:bg-lime-brand/5 hover:border-lime-brand/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="roe"
                            value={roe.level}
                            checked={selectedROE?.level === roe.level}
                            onChange={() => setSelectedROE(roe)}
                            className="mt-1 accent-lime-brand cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                selectedROE?.level === roe.level
                                  ? 'bg-lime-brand text-black'
                                  : 'bg-gray-600/50 text-gray-50'
                              }`}
                              >
                                {roe.level}
                              </span>
                              <span className={`font-semibold text-[0.9rem] ${
                                selectedROE?.level === roe.level
                                  ? 'text-lime-brand'
                                  : 'text-gray-50'
                              }`}
                              >
                                {roe.name}
                              </span>
                            </div>
                            <p className="text-gray-300 text-[0.8rem] m-0 mb-3 leading-snug">
                              {roe.description}
                            </p>
                            <div>
                              <span className="text-lime-brand text-xs font-semibold mb-1 block">
                                Engagement Criteria:
                              </span>
                              <ul className="text-gray-400 text-[0.7rem] m-0 pl-4 leading-tight">
                                {roe.engagementCriteria.map((criteria, idx) => (
                                  <li key={idx}>{criteria}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-600/30 flex justify-between items-center">
                <div className="text-gray-400 text-[0.9rem]">
                  {selectedMissionType && selectedROE ? (
                    `Mission: ${selectedMissionType.name} | ROE: ${selectedROE.level}`
                  ) : selectedMissionType ? (
                    'Select rules of engagement to continue'
                  ) : (
                    'Select a mission type to continue'
                  )}
                </div>
                <button
                  onClick={executeDeployment}
                  disabled={!selectedMissionType || !selectedROE}
                  className={`px-6 py-3 rounded-lg border-0 text-base font-semibold transition-all ${
                    selectedMissionType && selectedROE
                      ? 'bg-lime-brand text-black cursor-pointer'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Deploy Mission
                </button>
              </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Deployments Tracking */}
      {showActiveDeployments && activeDeployments.length > 0 && (
        <div className="fixed top-5 right-5 w-[400px] bg-darkest border-2 border-lime-brand/30 rounded-2xl p-4 z-[1200] max-h-[80vh] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lime-brand text-xl font-bold">
              Active Deployments
            </h3>
            <button
              onClick={() => setShowActiveDeployments(false)}
              className="bg-transparent border border-lime-brand/30 text-lime-brand px-2 py-2 rounded cursor-pointer text-sm"
            >
              Close
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {activeDeployments.map(deployment => (
              <div
                key={deployment.id}
                className="bg-[#1a2530] border border-gray-600/30 rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="text-lime-brand font-semibold text-base">
                    {deployment.id}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-semibold ${
                    deployment.status === 'ACTIVE'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-amber-400/20 text-amber-400'
                  }`}
                  >
                    {deployment.status}
                  </div>
                </div>

                <div className="text-gray-300 text-sm mb-3">
                  <div><strong>Mission:</strong> {deployment.missionType.name}</div>
                  <div><strong>ROE:</strong> {deployment.roe.level}</div>
                  <div><strong>Units:</strong> {deployment.units}</div>
                  <div><strong>Location:</strong> {deployment.location}</div>
                </div>

                <div className="mb-3">
                  <div className="text-gray-400 text-xs mb-1">
                    {deployment.currentPhase}
                  </div>
                  <div className="bg-gray-600/30 rounded-lg h-1.5 overflow-hidden">
                    <div
                      className="bg-lime-brand h-full transition-all duration-500 ease-in-out"
                      style={{ width: `${deployment.progress}%` }}
                    />
                  </div>
                  <div className="text-lime-brand text-xs text-right mt-1">
                    {deployment.progress}%
                  </div>
                </div>

                <div className="text-xs text-gray-400">
                  <div><strong>Started:</strong> {deployment.startTime.toLocaleTimeString()}</div>
                  {deployment.status === 'LAUNCHING' && (
                    <div><strong>ETA:</strong> {deployment.eta.toLocaleTimeString()}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Deployments Button */}
      {activeDeployments.length > 0 && !showActiveDeployments && (
        <div className="fixed top-5 right-5 z-[1100]">
          <button
            onClick={() => setShowActiveDeployments(true)}
            className="bg-lime-brand text-black px-4 py-3 rounded-lg border-0 text-sm font-semibold cursor-pointer flex items-center gap-2"
          >
            {activeDeployments.length} Active
          </button>
        </div>
      )}
    </>
  );
};

export default DeploymentModal;
