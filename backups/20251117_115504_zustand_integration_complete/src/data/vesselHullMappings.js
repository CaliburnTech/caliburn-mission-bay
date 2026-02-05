// Vessel hull component mappings - separated from components for fast refresh compatibility
import {
  USVPatrolHull,
  FreedomLCSHull,
  TiconderogaHull,
  SubmarineHull,
  UUVHull,
  StealthHull,
  CatamaranHull,
  MetalSharkHull,
  PatrolBoatHull,
  CorvetteHull,
  SailboatHull,
  CustomPlatformHull
} from '../components/VesselHulls';

export const vesselHullComponents = {
  "USV Patrol Boat": USVPatrolHull,
  "Oliver Hazard Perry Class": FreedomLCSHull, // Freedom-class LCS technical diagram
  "Arleigh Burke": TiconderogaHull, // Ticonderoga-class Cruiser technical diagram
  "Ticonderoga": TiconderogaHull, // Ticonderoga-class Cruiser technical diagram
  "Virginia": SubmarineHull,
  "Virginia Class": SubmarineHull,
  "MetalShark": MetalSharkHull, // Professional MetalShark patrol boat diagram
  "Saildrone": SailboatHull,
  "SubSeaSail": UUVHull,
  "GARC": StealthHull,
  "Custom Platform": CustomPlatformHull
};

export const vesselHullData = [
  {
    name: "USV Patrol Boat",
    type: "Unmanned Surface Vessel",
    displacement: "2.5 tons",
    description: "Autonomous patrol vessel for maritime security operations",
    icon: "USV Patrol Boat"
  },
  {
    name: "Oliver Hazard Perry Class", 
    type: "Guided Missile Frigate",
    displacement: "4,100 tons",
    description: "Multi-mission frigate optimized for anti-submarine warfare",
    icon: "Oliver Hazard Perry Class"
  },
  {
    name: "Arleigh Burke",
    type: "Guided Missile Destroyer", 
    displacement: "9,200 tons",
    description: "Advanced destroyer with Aegis combat system",
    icon: "Arleigh Burke"
  },
  {
    name: "Ticonderoga",
    type: "Guided Missile Cruiser",
    displacement: "9,600 tons", 
    description: "Multi-warfare cruiser with advanced radar systems",
    icon: "Ticonderoga"
  },
  {
    name: "Virginia Class",
    type: "Nuclear Attack Submarine",
    displacement: "7,800 tons",
    description: "Fast attack submarine for deep water operations",
    icon: "Virginia Class"
  },
  {
    name: "MetalShark",
    type: "Patrol Boat",
    displacement: "45 tons",
    description: "High-speed patrol craft for coastal operations", 
    icon: "MetalShark"
  }
];