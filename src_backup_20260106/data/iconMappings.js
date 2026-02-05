// Icon mapping data - separated from components for fast refresh compatibility
import {
  NGHTSIcon,
  ScionESMIcon,
  HiddenLevelRadarIcon,
  ModiEWIcon,
  TowedSonarIcon,
  SM6MissileIcon,
  HighEnergyLaserIcon,
  CameraIcon,
  GPSIcon,
  BatteryIcon,
  AntennaIcon,
  MotorIcon,
  PropellerIcon,
  FrameIcon,
  FlightControllerIcon,
  LEDIcon,
  InfraredIcon,
  StabilizerIcon,
  DownwardSensorIcon,
  LandingGearIcon
} from '../components/MilitaryIcons';
import {
  Shield,
  Target,
  Eye,
  ShieldCheck,
  Lock,
  Plus
} from 'lucide-react';

export const capabilityIcons = {
  'NGHTS': NGHTSIcon,
  'Scion ESM': ScionESMIcon,
  'Hidden Level Passive Radar': HiddenLevelRadarIcon,
  'SNC Modi II Electronic Warfare System': ModiEWIcon,
  'Advanced Towed Sonar': TowedSonarIcon,
  'SM-6 Missile': SM6MissileIcon,
  'High-Energy Laser': HighEnergyLaserIcon,
  'EO/IR Sensor Suite': CameraIcon,
  'SIGINT Collection Suite': ScionESMIcon,
  'SAR Imaging Radar': HiddenLevelRadarIcon,
  'Jackal': SM6MissileIcon,
  'Underwater Acoustic Modem': TowedSonarIcon,
  'Camera': CameraIcon,
  'GPS': GPSIcon,
  'Battery': BatteryIcon,
  'Antenna': AntennaIcon,
  'Motor': MotorIcon,
  'Propeller': PropellerIcon,
  'Frame': FrameIcon,
  'Flight Controller': FlightControllerIcon,
  'LED': LEDIcon,
  'Infrared Sensor': InfraredIcon,
  'Stabilizer': StabilizerIcon,
  'Downward Sensor': DownwardSensorIcon,
  'Landing Gear': LandingGearIcon
};

export const stackIcons = {
  'Guardian AI Targeting Package': NGHTSIcon,
  'Electronic Warfare Dominance': ScionESMIcon,
  'Integrated Air Defense System': HiddenLevelRadarIcon,
  'Anti-Submarine Warfare Package': TowedSonarIcon,
  'Directed Energy Weapon System': HighEnergyLaserIcon
};

// Mission type icon mappings (for navyMissionTypes)
export const missionIcons = {
  'Shield': Shield,
  'Target': Target,
  'Eye': Eye,
  'ShieldCheck': ShieldCheck,
  'Lock': Lock,
  'Plus': Plus
};