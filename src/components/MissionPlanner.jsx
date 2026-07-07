import React, { useState, useEffect } from 'react';
import { MissionLibraryTable } from './mission-planner/MissionLibrary';
import MissionConfigView from './mission-planner/MissionConfigView';
import useMissionStore from '../store/missionStore';

// Main MissionPlanner component - switches between table and config views
const MissionPlanner = () => {
  const [view, setView] = useState('config'); // 'table' | 'config'
  const [selectedMission, setSelectedMission] = useState(null);
  const { pendingMissionOpen, setPendingMissionOpen, setSelectedMissionTemplate } = useMissionStore();

  // If LoadoutBuilder signalled us to open config directly, consume the flag
  useEffect(() => {
    if (pendingMissionOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- consumes a one-shot cross-view navigation signal from the store; must run after mount
      setSelectedMission(null);
      setView('config');
      setPendingMissionOpen(false);
    }
  }, [pendingMissionOpen, setPendingMissionOpen]);

  const handleSelectMission = (mission) => {
    setSelectedMission(mission);
    setView('config');
  };

  const handleNewMission = () => {
    setSelectedMissionTemplate(null); // clear any lingering template (e.g. PORT_SECURITY from loadout deep-link)
    setSelectedMission(null);
    setView('config');
  };

  const handleBack = () => {
    setSelectedMissionTemplate(null);
    setSelectedMission(null);
    setView('config');
  };

  if (view === 'config') {
    return (
      <MissionConfigView
        mission={selectedMission}
        onBack={handleBack}
        onSave={handleBack}
      />
    );
  }

  return (
    <MissionLibraryTable
      onSelectMission={handleSelectMission}
      onNewMission={handleNewMission}
    />
  );
};

export default MissionPlanner;
