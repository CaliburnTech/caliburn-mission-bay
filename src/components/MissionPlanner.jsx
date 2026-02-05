import React, { useState } from 'react';
import { MissionLibraryTable } from './mission-planner/MissionLibrary';
import MissionConfigView from './mission-planner/MissionConfigView';

// Main MissionPlanner component - switches between table and config views
const MissionPlanner = () => {
  const [view, setView] = useState('table'); // 'table' | 'config'
  const [selectedMission, setSelectedMission] = useState(null);

  const handleSelectMission = (mission) => {
    setSelectedMission(mission);
    setView('config');
  };

  const handleNewMission = () => {
    setSelectedMission(null);
    setView('config');
  };

  const handleBack = () => {
    setSelectedMission(null);
    setView('table');
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
