// Fleet and squadron data constants

export const swarmSquadrons = [
  {
    name: "MetalShark Patrol Drones",
    type: "High-Speed USV",
    totalUnits: 280,
    status: {
      missionReady: 247,
      charging: 18,
      deployed: 12,
      maintenance: 3
    },
    icon: "MetalShark",
    description: "High-speed autonomous patrol vessel swarm for coastal defense and reconnaissance"
  },
  {
    name: "Saildrone Autonomous Fleet",
    type: "Wind-Powered USV",
    totalUnits: 117,
    status: {
      missionReady: 89,
      inRefit: 5,
      atSea: 23
    },
    icon: "Saildrone",
    description: "Autonomous sailing vessel swarm for long-endurance ocean monitoring"
  },
  {
    name: "MQ-9 Reaper Drone Wing",
    type: "Strategic UAV",
    totalUnits: 168,
    status: {
      missionReady: 156,
      deployed: 8,
      maintenance: 4
    },
    icon: "Saildrone",
    description: "High-altitude long-endurance drone swarm for surveillance and strike missions"
  },
  {
    name: "SubSeaSail UUV Squadron",
    type: "Autonomous UUV",
    totalUnits: 45,
    status: {
      missionReady: 38,
      deployed: 4,
      charging: 2,
      maintenance: 1
    },
    icon: "SubSeaSail",
    description: "Underwater autonomous vehicle swarm for subsurface reconnaissance"
  },
  {
    name: "Switchblade Loitering Munition Arsenal",
    type: "Tactical UAV",
    totalUnits: 892,
    status: {
      missionReady: 856,
      deployed: 24,
      maintenance: 12
    },
    icon: "MetalShark",
    description: "Precision strike loitering munition swarm for tactical engagement"
  },
  {
    name: "Black Widow Micro-Drone Swarm",
    type: "Micro UAV",
    totalUnits: 1247,
    status: {
      missionReady: 1198,
      charging: 32,
      deployed: 15,
      maintenance: 2
    },
    icon: "Saildrone",
    description: "Ultra-small reconnaissance drone swarm for urban and confined operations"
  },
  {
    name: "GARC",
    type: "Research Vessel",
    totalUnits: 1,
    status: {
      missionReady: 1,
      deployed: 0,
      charging: 0,
      maintenance: 0
    },
    icon: "GARC",
    description: "Global Autonomous Research Craft"
  }
];

// Fleet Unit Configurations - Mock data for capability outfits
export const squadronUnitConfigurations = {
  0: { // MetalShark Patrol Drones
    outfits: [
      {
        name: "Coastal Defense Package",
        count: 87,
        capabilities: ["Hidden Level Radar", "Close-in Defense System", "RF Communications"],
        status: { missionReady: 82, deployed: 3, charging: 2, maintenance: 0 }
      },
      {
        name: "Reconnaissance Package",
        count: 65,
        capabilities: ["EO/IR Sensors", "ESM/SIGINT", "Secure Communications"],
        status: { missionReady: 60, deployed: 5, charging: 0, maintenance: 0 }
      },
      {
        name: "Fast Response Package",
        count: 78,
        capabilities: ["Navigation Radar", "Emergency Beacon", "High-Speed Comms"],
        status: { missionReady: 70, deployed: 2, charging: 6, maintenance: 0 }
      },
      {
        name: "Custom Individual Units",
        count: 50,
        capabilities: ["Various Custom Loadouts"],
        status: { missionReady: 35, deployed: 2, charging: 10, maintenance: 3 }
      }
    ]
  },
  1: { // Saildrone Autonomous Fleet
    outfits: [
      {
        name: "Ocean Monitoring Package",
        count: 45,
        capabilities: ["Environmental Sensors", "Weather Station", "Data Link"],
        status: { missionReady: 42, deployed: 0, charging: 0, maintenance: 3 }
      },
      {
        name: "Long Endurance Package",
        count: 35,
        capabilities: ["Extended Battery", "Solar Panels", "Satellite Comms"],
        status: { missionReady: 30, deployed: 0, charging: 0, maintenance: 5 }
      },
      {
        name: "Research Configuration",
        count: 37,
        capabilities: ["Scientific Sensors", "Sample Collection", "Data Storage"],
        status: { missionReady: 17, deployed: 0, charging: 0, maintenance: 20 }
      }
    ]
  },
  2: { // MQ-9 Reaper Drone Wing
    outfits: [
      {
        name: "ISR Package",
        count: 58,
        capabilities: ["Multi-Spectral Targeting System", "SIGINT Pod", "Data Link"],
        status: { missionReady: 56, deployed: 2, charging: 0, maintenance: 0 }
      },
      {
        name: "Strike Package",
        count: 45,
        capabilities: ["Hellfire Missiles", "Targeting Pod", "Precision Munitions"],
        status: { missionReady: 40, deployed: 3, charging: 0, maintenance: 2 }
      },
      {
        name: "Extended Range Package",
        count: 65,
        capabilities: ["External Fuel Tanks", "Long-Range Sensors", "Satellite Comms"],
        status: { missionReady: 60, deployed: 3, charging: 0, maintenance: 2 }
      }
    ]
  }
};
