import React, { useState, useEffect } from 'react';
import { Ship, Search, ShoppingCart, X, Target, Radio, Shield, Waves, Zap, Crosshair, Eye, Radar, Brain, MessageCircle, ShieldCheck, Settings, ChevronDown, ChevronUp, ChevronLeft, Plus, Minus, Maximize2, Grid3X3, Move, Network, Lock, Unlink, Key, Download, FileText, File, Compass } from 'lucide-react';
import { 
  NGHTSIcon, 
  ScionESMIcon, 
  SPY6RadarIcon, 
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
} from './MilitaryIcons';
import { vesselHullComponents, vesselHullData } from './VesselHulls';
import NavigationTabs from './NavigationTabs';
import SearchAndFilters from './SearchAndFilters';
import StacksView from './StacksView';
import CapabilitiesView from './CapabilitiesView';
import { engineeringStacks, individualCapabilities, capabilityCategories, swarmFleets } from '../data/marketplaceData';
import caliburnLogotype from '../assets/Caliburn Logotype Dark Mode.png';
import './MarketplacePage.css';

const MarketplacePage = () => {
  const [selectedView, setSelectedView] = useState(() => {
    // Initialize from localStorage or URL hash, fallback to 'stacks'
    const saved = localStorage.getItem('caliburn-marketplace-view');
    const hash = window.location.hash.replace('#', '');
    return hash || saved || 'stacks';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHull, setSelectedHull] = useState(null);
  const [outfitterCart, setOutfitterCart] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [selectedSecurityFilters, setSelectedSecurityFilters] = useState([]);
  const [expandedStack, setExpandedStack] = useState(null);
  const [selectedMountPoint, setSelectedMountPoint] = useState(null);
  const [vesselConfiguration, setVesselConfiguration] = useState({});
  const [isFullScreenConfig, setIsFullScreenConfig] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCapabilityDetails, setSelectedCapabilityDetails] = useState(null);
  const [draggedCapability, setDraggedCapability] = useState(null);
  const [slotPositions, setSlotPositions] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [expandedFleet, setExpandedFleet] = useState(null);
  const [selectedFleetForManagement, setSelectedFleetForManagement] = useState(null);
  const [sortColumn, setSortColumn] = useState('unit_id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showDeploymentModal, setShowDeploymentModal] = useState(false);
  const [deploymentContext, setDeploymentContext] = useState(null);
  const [selectedMissionType, setSelectedMissionType] = useState(null);
  const [selectedROE, setSelectedROE] = useState(null);
  const [deploymentStep, setDeploymentStep] = useState('mission-select');
  const [selectedUnitsForDeployment, setSelectedUnitsForDeployment] = useState([]);
  const [activeDeployments, setActiveDeployments] = useState([]);
  const [showActiveDeployments, setShowActiveDeployments] = useState(false);

  // Persist view state and update URL
  useEffect(() => {
    localStorage.setItem('caliburn-marketplace-view', selectedView);
    window.history.replaceState(null, '', `#${selectedView}`);
  }, [selectedView]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash !== selectedView) {
        setSelectedView(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [selectedView]);

  // Capability Categories Structure
  const capabilityCategories = {
    'Sensors & Detection': {
      icon: Eye,
      subcategories: ['ACOUSTIC/SONAR', 'EO/IR SENSORS', 'RADAR/RF', 'CBRN DETECTION']
    },
    'Weapons & Effectors': {
      icon: Zap,
      subcategories: ['KINETIC WEAPONS', 'DIRECTED ENERGY', 'NON-LETHAL']
    },
    'Electronic Warfare': {
      icon: Radio,
      subcategories: ['ELECTRONIC ATTACK', 'ELECTRONIC SUPPORT', 'ELECTRONIC PROTECTION', 'CYBER WARFARE']
    },
    'Intelligence': {
      icon: Brain,
      subcategories: ['SIGINT COLLECTION', 'IMINT/GEOINT', 'HUMINT SUPPORT']
    },
    'Communications': {
      icon: MessageCircle,
      subcategories: ['RF COMMUNICATIONS', 'SATCOM', 'UNDERWATER COMMS']
    },
    'Defensive Systems': {
      icon: ShieldCheck,
      subcategories: ['ACTIVE COUNTERMEASURES', 'PASSIVE COUNTERMEASURES', 'FORCE PROTECTION']
    },
    'Mission Systems': {
      icon: Settings,
      subcategories: ['NAVIGATION', 'COMMAND & CONTROL', 'UNMANNED SYSTEMS', 'LOGISTICS', 'SPECIAL OPERATIONS']
    }
  };

  // Engineering Stacks Data
  // Complete Drone Engineering Stacks for Swarm Deployment
  const droneStacks = [
    {
      name: "Saildrone ISR Stack",
      platform: "Saildrone Explorer",
      provider: "Saildrone",
      description: "Complete autonomous maritime surveillance platform with integrated TempestOS, sensors, and communications for extended ocean operations.",
      mission: "Intelligence, Surveillance & Reconnaissance",
      capabilities: ["Maritime Domain Awareness", "Weather Monitoring", "Electronic Intelligence", "Communications Relay"],
      trl: "TRL 9",
      icon: Ship,
      category: "AUTONOMOUS SYSTEMS",
      deploymentType: "Surface Drone",
      endurance: "12 months",
      range: "13,000 km",
      stack: {
        os: "TempestOS Marine",
        sensors: ["360° Camera Array", "AIS Receiver", "Weather Sensors", "SIGINT Package"],
        communications: ["Iridium SATCOM", "VHF Radio", "Mesh Network Node"],
        navigation: ["GPS/GNSS", "Autonomous Navigation AI", "Collision Avoidance"],
        power: ["Solar Panel Array", "Wind Generator", "Lithium Battery Bank"],
        payload: "200kg sensor capacity"
      }
    },
    {
      name: "SubSeaSail ASW Stack",
      platform: "SubSeaSail Interceptor",
      provider: "SubSeaSail",
      description: "Autonomous underwater glider with integrated sonar systems and TempestOS for anti-submarine warfare missions.",
      mission: "Anti-Submarine Warfare",
      capabilities: ["Passive Sonar", "Active Sonar", "Underwater Tracking", "Mine Detection"],
      trl: "TRL 3",
      icon: Target,
      category: "AUTONOMOUS SYSTEMS",
      deploymentType: "Underwater Glider",
      endurance: "6 months",
      range: "5,000 km",
      stack: {
        os: "TempestOS Subsea",
        sensors: ["Passive Sonar Array", "Active Sonar Pinger", "Magnetometer", "Hydrophone Array"],
        communications: ["Acoustic Modem", "Emergency Buoy", "Satellite Uplink"],
        navigation: ["Inertial Navigation", "Doppler Velocity Log", "Pressure Sensors"],
        power: ["Thermal Engine", "Lithium Battery", "Energy Harvesting"],
        payload: "50kg sensor/weapon capacity"
      }
    },
    {
      name: "MetalShark USV Strike Stack",
      platform: "MetalShark 38 Defiant",
      provider: "Metal Shark",
      description: "High-speed unmanned surface vessel with weapons payload and full autonomous operation capabilities.",
      mission: "Strike Operations",
      capabilities: ["Kinetic Strike", "Target Prosecution", "Force Protection", "Patrol Operations"],
      trl: "TRL 7",
      icon: Crosshair,
      category: "KINETIC WEAPONS",
      deploymentType: "Surface Vessel",
      endurance: "72 hours",
      range: "900 km",
      stack: {
        os: "TempestOS Combat",
        sensors: ["EO/IR Turret", "Radar Array", "Lidar System", "Threat Detection"],
        communications: ["Tactical Radio", "SATCOM", "Drone Mesh Network"],
        navigation: ["Military GPS", "INS", "Autonomous Pilot"],
        power: ["Diesel Generator", "Hybrid Electric", "Emergency Battery"],
        payload: "500kg weapons/equipment capacity"
      }
    },
    {
      name: "Sky Guardian Aerial Stack",
      platform: "MQ-9B SeaGuardian",
      provider: "General Atomics",
      description: "Maritime patrol drone with comprehensive surveillance suite and TempestOS integration for long-endurance missions.",
      mission: "Maritime Patrol & Strike",
      capabilities: ["Wide Area Surveillance", "Target Identification", "Precision Strike", "Electronic Warfare"],
      trl: "TRL 9",
      icon: Eye,
      category: "EO/IR SENSORS",
      deploymentType: "Fixed-Wing UAV",
      endurance: "40 hours",
      range: "6,000 km",
      stack: {
        os: "TempestOS Airborne",
        sensors: ["Multi-Spectral Targeting System", "Maritime Radar", "SIGINT Package", "EO/IR Sensors"],
        communications: ["Beyond Line of Sight SATCOM", "Link 16", "Common Data Link"],
        navigation: ["Military GPS", "Inertial Navigation", "Automated Flight Control"],
        power: ["Turboprop Engine", "Auxiliary Power Unit", "Emergency Battery"],
        payload: "1,700kg sensor/weapons capacity"
      }
    }
  ];

  const engineeringStacks = [
    // Multi-Vendor Engineering Stacks
    {
      name: "Swarm Coordination System",
      provider: "Anduril + Caliburn + MythosAI + IBM + Caliola",
      description: "Coordinate dozens of autonomous platforms for distributed maritime operations with zero-trust mesh networking and adaptive AI learning",
      capabilityRefs: ["TempestOS Core Platform", "SPY-6 AESA Radar", "Scion ESM Suite", "IBM Watson Orchestrate", "OverKey Mesh VPN"],
      trl: "TRL 6",
      icon: Brain,
      category: "UNMANNED SYSTEMS",
      specs: {
        swarmSize: "50+ autonomous platforms",
        coordination: "Real-time mission adaptation",
        domains: "Air, surface, and subsurface",
        autonomy: "Level 4 autonomous operations",
        communication: "Zero-trust mesh network resilience", 
        integration: "Human-machine teaming"
      },
      integration: "The Swarm Coordination System uses TempestOS as the foundational platform for coordinating diverse autonomous systems. SPY-6 radar provides airspace deconfliction while Scion ESM enables secure drone communications. OverKey Mesh VPN provides zero-trust networking that maintains secure swarm communications even in DDIL environments. IBM Watson Orchestrate provides adaptive AI learning, enabling swarms to optimize tactics and coordination patterns in real-time.",
      components: ["Anduril Lattice C2", "MythosAI Navigation Suite", "Caliola OverKey Mesh VPN", "IBM Watson Orchestrate AI", "Distributed Decision Engine"],
      missionTags: ["Swarm Orchestration", "Autonomous Navigation", "Sea Denial"]
    },

    {
      name: "Guardian AI Targeting Package", 
      provider: "Marine AI + Northrop Grumman",
      description: "De-duplicate sensor views to establish relative position, manage contacts into Positive ID, and paint targets",
      capabilityRefs: ["NGHTS Laser Targeting System", "SPY-6 AESA Radar"],
      trl: "TRL 9",
      icon: Target,
      category: "EO/IR SENSORS",
      specs: {
        range: "25+ km designation range",
        accuracy: "±1 meter CEP",
        processingSpeed: "Real-time target classification",
        integration: "Multi-sensor fusion",
        networking: "Distributed targeting",
        automation: "AI-driven classification"
      },
      integration: "The Guardian AI system integrates NGHTS laser targeting with advanced AI algorithms for autonomous threat detection. Multi-sensor arrays provide 360-degree coverage while AI processes imagery in real-time, automatically classifying and prioritizing targets.",
      components: ["Marine AI Guardian AI", "Lookout Sensor Fusion", "Multi-Sensor Array (Radar/IR/Camera/Sub-Surface)", "NG NGHTS Laser Targeting"],
      missionTags: ["Sea Denial", "Electronic Warfare"]
    },

    {
      name: "Autonomous EW Navigation Suite",
      provider: "Marine AI + Northrop Grumman + SubSeaSail + Caliola", 
      description: "Complete autonomous navigation with integrated EW sensing and zero-trust communications for contested environment operations",
      capabilityRefs: ["TempestOS Core Platform", "Scion ESM Suite", "NGHTS Laser Targeting System", "OverKey Mesh VPN"],
      trl: "TRL 6",
      icon: Radio,
      category: "ELECTRONIC SUPPORT",
      specs: {
        navigation: "GPS-denied environments",
        ewCapability: "Full spectrum awareness",
        autonomy: "Level 3+ autonomous ops",
        integration: "Secure multi-platform coordination",
        stealth: "Low signature operations",
        endurance: "Extended mission duration"
      },
      integration: "Complete autonomous navigation system that maintains operational effectiveness in GPS-denied and contested electromagnetic environments through integrated EW sensing, zero-trust mesh networking, and AI-driven navigation algorithms. OverKey provides secure communications resilient to jamming and interception.",
      components: ["Marine AI Navigation Package", "SubSeaSail Drone Platform", "NG Scion EW Sensor Suite", "NG NGHTS Targeting", "Caliola OverKey Mesh VPN"],
      missionTags: ["Autonomous Navigation", "Electronic Warfare", "ISR Operations"]
    },

    {
      name: "Anti-Submarine Warfare Package",
      provider: "Multiple Vendors",
      description: "Integrated sonar, MAD, and analysis for submarine detection and tracking in littoral waters",
      capabilityRefs: ["Advanced Towed Sonar", "SM-6 Missile System"],
      trl: "TRL 9",
      icon: Waves,
      category: "ACOUSTIC/SONAR",
      specs: {
        detection: "20+ km passive sonar range",
        classification: "AI-powered target ID",
        tracking: "Multi-platform coordination",
        weapons: "Torpedo countermeasures",
        integration: "NATO standard interfaces",
        deployment: "Rapid response capability"
      },
      integration: "Complete anti-submarine warfare solution combining advanced towed sonar arrays with magnetic anomaly detection and AI-powered analytics. Provides comprehensive underwater threat detection and tracking capabilities for littoral operations.",
      components: ["Advanced Towed Array Sonar", "MAD Sensor Suite", "IBM Watson X ASW Analytics", "Torpedo Countermeasure System"],
      missionTags: ["Anti-Submarine Warfare", "Sea Control"]
    },

    {
      name: "Readiness Intelligence Platform",
      provider: "Gecko Robotics + Caliburn",
      description: "Micro-level vessel readiness reporting for MOC decision support on refit scheduling and mission assignment",
      capabilityRefs: ["TempestOS Core Platform"],
      trl: "TRL 4",
      icon: Settings,
      category: "COMMAND & CONTROL",
      specs: {
        monitoring: "Real-time system health",
        prediction: "30-90 day maintenance forecasting",
        reporting: "Executive dashboards",
        integration: "MOC decision systems",
        automation: "Predictive scheduling",
        analytics: "Mission readiness scoring"
      },
      integration: "Comprehensive vessel health monitoring platform that provides micro-level readiness reporting to support MOC decisions on refit scheduling and mission assignments. Integrates NDT sensors with advanced analytics for predictive maintenance.",
      components: ["Drawbridge Data Platform", "Gecko Robotics NDT Sensors", "Cantilever Analytics", "MOC Integration Layer"],
      missionTags: ["Force Protection", "ISR Operations"]
    }
  ];

  // Individual Capabilities Data
  const individualCapabilities = [
    {
      name: "TempestOS Core Platform",
      provider: "Caliburn",
      type: "Operating System",
      description: "Foundational maritime operating system providing real-time computing, mission planning, and system integration capabilities for all vessel operations.",
      capabilities: ["Real-time OS", "Mission Planning", "System Integration", "Security Framework"],
      trl: "TRL 9",
      icon: Settings,
      category: "COMMAND & CONTROL",
      securityLevel: ["Zero Trust Architecture", "End-to-End Encrypted"],
      securityIcons: ["encrypted"],
      documents: [
        {
          name: "TempestOS System Overview",
          type: "PDF",
          size: "3.2 MB",
          description: "Complete platform architecture and integration guide",
          url: "#"
        },
        {
          name: "API Documentation",
          type: "PDF",
          size: "1.5 MB", 
          description: "Developer guide for system integration",
          url: "#"
        }
      ],
      bannerImage: "https://images.unsplash.com/photo-1551808525-51a94da548ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"
    },
    {
      name: "NGHTS Laser Targeting System",
      provider: "Northrop Grumman",
      type: "Targeting System",
      description: "Next-Generation Handheld Targeting System with precision laser designation capabilities.",
      capabilities: ["Laser Designation", "Range Finding", "Target Illumination"],
      trl: "TRL 9",
      icon: NGHTSIcon,
      category: "EO/IR SENSORS",
      bannerImage: "https://cdn.northropgrumman.com/-/media/NEWS/Imports/Northrop-Grumman-to-Manufacture-US-Marine-Corps-Next-Generation-Handheld-Targeting-System_hero.jpg"
    },
    {
      name: "Scion ESM Suite",
      provider: "Raytheon",
      type: "Electronic Warfare",
      description: "Advanced electronic support measures for signal intelligence and threat detection.",
      capabilities: ["Signal Intercept", "Direction Finding", "Threat Classification"],
      trl: "TRL 9",
      icon: ScionESMIcon,
      category: "ELECTRONIC SUPPORT",
      securityLevel: ["NSA-Approved Crypto", "End-to-End Encrypted"],
      securityIcons: ["nsa", "encrypted"]
    },
    {
      name: "SPY-6 AESA Radar",
      provider: "Lockheed Martin",
      type: "Radar System",
      description: "Advanced electronically scanned array radar for air and missile defense.",
      capabilities: ["Air Surveillance", "Missile Tracking", "Multi-Target Tracking"],
      trl: "TRL 9",
      icon: SPY6RadarIcon,
      category: "RADAR/RF"
    },
    {
      name: "Advanced Towed Sonar",
      provider: "General Dynamics",
      type: "Sonar System",
      description: "Long-range passive sonar system for submarine detection and tracking.",
      capabilities: ["Submarine Detection", "Acoustic Analysis", "Long-Range Tracking"],
      trl: "TRL 9",
      icon: TowedSonarIcon,
      category: "ACOUSTIC/SONAR"
    },
    {
      name: "SM-6 Missile System",
      provider: "Raytheon",
      type: "Missile Defense",
      description: "Multi-mission surface-to-air missile for air and ballistic missile defense.",
      capabilities: ["Air Defense", "Ballistic Missile Defense", "Anti-Ship"],
      trl: "TRL 9",
      icon: SM6MissileIcon,
      category: "KINETIC WEAPONS"
    },
    {
      name: "High-Energy Laser Weapon",
      provider: "Boeing",
      type: "Directed Energy",
      description: "Solid-state laser system for precision engagement of threats.",
      capabilities: ["UAV Defense", "Missile Defense", "Precision Strike"],
      trl: "TRL 7",
      icon: HighEnergyLaserIcon,
      category: "DIRECTED ENERGY"
    },
    {
      name: "Cryptographic Communications Module",
      provider: "Caliola Engineering",
      type: "Communications Security",
      description: "Advanced cryptographic solutions for securing mission-critical military communications.",
      capabilities: ["Advanced Cryptography", "Key Management", "Secure Protocols"],
      trl: "TRL 9",
      icon: ScionESMIcon,
      category: "RF COMMUNICATIONS"
    },
    {
      name: "MILSATCOM Terminal",
      provider: "Caliola Engineering", 
      type: "Satellite Communications",
      description: "Protected military satellite communications terminal with automated configuration.",
      capabilities: ["Protected SATCOM", "Auto-Configuration", "Secure Links"],
      trl: "TRL 9",
      icon: SPY6RadarIcon,
      category: "SATCOM"
    },
    {
      name: "Unmanned Systems Communications Package",
      provider: "Caliola Engineering",
      type: "UAV Communications",
      description: "Specialized communications systems for unmanned airborne platforms and control.",
      capabilities: ["UAV Datalinks", "Autonomous Comms", "Remote Control"],
      trl: "TRL 9", 
      icon: NGHTSIcon,
      category: "RF COMMUNICATIONS"
    },
    {
      name: "Programmable Automation Controller",
      provider: "Rockwell Automation",
      type: "Industrial Control",
      description: "Military-grade programmable automation controller for shipboard and facility machinery systems.",
      capabilities: ["Logix Platform", "Real-time Control", "System Integration"],
      trl: "TRL 9",
      icon: Settings,
      category: "COMMAND & CONTROL"
    },
    {
      name: "Arena Military Simulation Platform",
      provider: "Rockwell Automation", 
      type: "Mission Planning",
      description: "Advanced simulation software for military planning, operations analysis, and scenario modeling.",
      capabilities: ["Discrete Event Simulation", "What-If Analysis", "Operations Planning"],
      trl: "TRL 9",
      icon: FlightControllerIcon,
      category: "COMMAND & CONTROL"
    },
    {
      name: "Lattice Mesh Network",
      provider: "Anduril",
      type: "AI Command System",
      description: "Distributed AI mesh network that provides real-time autonomous coordination across multiple platforms and domains.",
      capabilities: ["Mesh Networking", "AI Coordination", "Real-time Processing"],
      trl: "TRL 9",
      icon: AntennaIcon,
      category: "COMMAND & CONTROL"
    },
    {
      name: "Marine AI Navigation System",
      provider: "Marine AI",
      type: "Autonomous Navigation",
      description: "Intelligent maritime navigation system with AI-powered decision making for autonomous vessel operations.",
      capabilities: ["AI Navigation", "Autonomous Operations", "Maritime Intelligence"],
      trl: "TRL 9",
      icon: GPSIcon,
      category: "UNMANNED SYSTEMS"
    },
    {
      name: "Advanced EO/IR Camera System",
      provider: "FLIR Systems",
      type: "Optical Sensor",
      description: "High-resolution electro-optical and infrared imaging system for surveillance and target identification.",
      capabilities: ["HD Video", "Thermal Imaging", "Target Tracking", "Day/Night Vision"],
      trl: "TRL 9",
      icon: CameraIcon,
      category: "EO/IR SENSORS"
    },
    {
      name: "Military-Grade GPS Module",
      provider: "Trimble",
      type: "Navigation System",
      description: "Precision GPS receiver with anti-jamming capabilities for accurate positioning in contested environments.",
      capabilities: ["Precision GPS", "Anti-Jamming", "SAASM Compatible", "Real-time Positioning"],
      trl: "TRL 9",
      icon: GPSIcon,
      category: "NAVIGATION"
    },
    {
      name: "High-Capacity Power Management System",
      provider: "SWaP Technologies",
      type: "Power System",
      description: "Advanced battery management and power distribution system for extended mission operations.",
      capabilities: ["Li-Ion Batteries", "Smart Charging", "Power Distribution", "Monitoring"],
      trl: "TRL 9",
      icon: BatteryIcon,
      category: "NAVIGATION"
    },
    {
      name: "Multi-Band Communications Array",
      provider: "Harris Corporation",
      type: "Communications",
      description: "Software-defined radio antenna system supporting multiple frequency bands and protocols.",
      capabilities: ["Multi-Band Radio", "Software Defined", "Secure Comms", "Link-16 Compatible"],
      trl: "TRL 9",
      icon: AntennaIcon,
      category: "RF COMMUNICATIONS"
    },
    {
      name: "Brushless Motor Assembly",
      provider: "MaxonMotor",
      type: "Propulsion",
      description: "High-efficiency brushless motor system for propeller-driven unmanned platforms.",
      capabilities: ["Brushless Design", "High Efficiency", "Variable Speed", "Quiet Operation"],
      trl: "TRL 9",
      icon: MotorIcon,
      category: "UNMANNED SYSTEMS"
    },
    {
      name: "Carbon Fiber Frame System",
      provider: "Composite Structures",
      type: "Platform Structure",
      description: "Lightweight carbon fiber frame assembly providing structural integrity for small unmanned platforms.",
      capabilities: ["Carbon Fiber", "Lightweight", "High Strength", "Modular Design"],
      trl: "TRL 9",
      icon: FrameIcon,
      category: "UNMANNED SYSTEMS"
    },
    {
      name: "Multi-Axis Gimbal Stabilizer",
      provider: "DJI Enterprise",
      type: "Stabilization System",
      description: "Precision gimbal system for camera stabilization and target tracking on moving platforms.",
      capabilities: ["3-Axis Stabilization", "Target Tracking", "Precision Control", "Anti-Vibration"],
      trl: "TRL 9",
      icon: StabilizerIcon,
      category: "EO/IR SENSORS"
    },
    {
      name: "Infrared Thermal Sensor",
      provider: "FLIR Systems",
      type: "Thermal Imaging",
      description: "High-sensitivity infrared sensor for thermal detection and night vision capabilities.",
      capabilities: ["Thermal Imaging", "Temperature Detection", "Night Vision", "Heat Signature"],
      trl: "TRL 9",
      icon: InfraredIcon,
      category: "EO/IR SENSORS"
    },
    {
      name: "Proximity Sensor Array",
      provider: "LiDAR Corp",
      type: "Collision Avoidance",
      description: "Multi-directional proximity sensor system for autonomous collision avoidance and navigation.",
      capabilities: ["LiDAR", "Collision Avoidance", "Distance Measurement", "360° Coverage"],
      trl: "TRL 9",
      icon: DownwardSensorIcon,
      category: "NAVIGATION"
    },
    {
      name: "IBM Watson Orchestrate",
      provider: "IBM",
      type: "AI Orchestration Platform",
      description: "AI-powered automation and orchestration platform enabling swarms to learn, adapt, and optimize mission performance in real-time.",
      capabilities: ["Adaptive Learning", "Real-Time Optimization", "Swarm Coordination", "Automated Decision Making"],
      trl: "TRL 7",
      icon: Brain,
      category: "COMMAND & CONTROL",
      specs: {
        learning: "Machine learning-driven adaptation",
        optimization: "Real-time performance optimization",
        coordination: "Multi-platform orchestration",
        automation: "Intelligent task automation",
        integration: "API-driven platform integration",
        scalability: "Dynamic swarm scaling"
      }
    },
    {
      name: "Scion Electronic Warfare Module",
      provider: "Northrop Grumman",
      type: "Electronic Warfare Payload",
      description: "Platform-agnostic multifunction electronic warfare payload for surface naval operations, enabling RF emissions detection and autonomous target tracking.",
      capabilities: ["RF Emissions Detection", "Autonomous Target Tracking", "Electronic Attack", "Platform Integration"],
      trl: "TRL 8",
      icon: Radio,
      category: "ELECTRONIC SUPPORT",
      securityLevel: ["Zero Trust Architecture", "End-to-End Encrypted"],
      securityIcons: ["encrypted"],
      documents: [
        {
          name: "Scion System Overview",
          type: "PDF",
          size: "1.9 MB",
          description: "Platform-agnostic electronic warfare payload specifications",
          url: "#"
        }
      ],
      bannerImage: "https://cdn.northropgrumman.com/-/media/Project/Northrop-Grumman/ngc/what-we-do/air/autonomous-systems/autonomous-systems-hero.jpg"
    },
    {
      name: "NG InSight EA System",
      provider: "Northrop Grumman", 
      type: "Electronic Attack Platform",
      description: "Next generation connectivity, processing and distributed effects system providing multi-level secure data sharing and JADC2 integration.",
      capabilities: ["Signal Intercept", "Network Connectivity", "Cross-Domain C2", "Resilient Communications"],
      trl: "TRL 9",
      icon: Brain,
      category: "ELECTRONIC ATTACK",
      securityLevel: ["NSA-Approved Crypto", "End-to-End Encrypted"],
      securityIcons: ["nsa", "encrypted"],
      documents: [
        {
          name: "NG InSight Technical Specifications",
          type: "PDF",
          size: "3.1 MB", 
          description: "Complete system capabilities and integration requirements",
          url: "#"
        }
      ],
      bannerImage: "https://cdn.northropgrumman.com/-/media/Project/Northrop-Grumman/ngc/what-we-do/mission-solutions/ng-insight/ng-insight-hero.jpg"
    },
    {
      name: "Jackal Precision Strike Missile",
      provider: "Northrop Grumman",
      type: "Loitering Munition",
      description: "Turbojet-powered precision strike missile with modular payload capability, GPS-denied navigation, and mid-flight retasking abilities.",
      capabilities: ["Precision Strike", "Loitering Capability", "GPS-Denied Navigation", "Modular Payload"],
      trl: "TRL 9",
      icon: Zap,
      category: "KINETIC WEAPONS",
      specs: {
        speed: "373 mph (600 km/h)",
        range: "62 miles (100 km)", 
        loiterTime: "15 minutes",
        payloadCapacity: "10 lbs (4.5 kg)",
        navigation: "GPS-denied capable"
      },
      documents: [
        {
          name: "Jackal System Datasheet",
          type: "PDF",
          size: "2.7 MB",
          description: "Performance specifications and operational capabilities", 
          url: "#"
        }
      ],
      bannerImage: "https://cdn.northropgrumman.com/-/media/Project/Northrop-Grumman/ngc/what-we-do/advanced-weapons/jackal-loitering-munition-hero.jpg"
    },
    {
      name: "Ultra-Lite Electronic Attack System", 
      provider: "Northrop Grumman",
      type: "Electronic Attack Module",
      description: "Scaled electronic attack system for smaller ships providing anti-ship missile defense with selective jamming capabilities.",
      capabilities: ["Anti-Ship Missile Defense", "Selective Jamming", "Low SWaP Design", "Friendly Comms Protection"],
      trl: "TRL 8", 
      icon: ShieldCheck,
      category: "ELECTRONIC ATTACK",
      securityLevel: ["End-to-End Encrypted"],
      securityIcons: ["encrypted"],
      documents: [
        {
          name: "Ultra-Lite EA Technical Manual",
          type: "PDF",
          size: "2.2 MB",
          description: "System architecture and deployment guidelines",
          url: "#"
        }
      ]
    },
    {
      name: "SeaFIND Inertial Navigation",
      provider: "Northrop Grumman",
      type: "Navigation System", 
      description: "Fiber optic gyro inertial navigation system with GPS-denied operation capability and USCG type approval certification.",
      capabilities: ["GPS-Denied Navigation", "Fiber Optic Gyro", "Position Data", "Modular Architecture"],
      trl: "TRL 9",
      icon: Compass,
      category: "NAVIGATION",
      specs: {
        technology: "Enhanced Fiber Optic Gyro (eFOG)",
        certification: "USCG Type Approved",
        architecture: "Modular IMU + Electronics Unit",
        applications: "UUV, USV, Surface Vessels"
      },
      documents: [
        {
          name: "SeaFIND System Specifications",
          type: "PDF", 
          size: "1.8 MB",
          description: "Complete navigation system technical documentation",
          url: "#"
        }
      ],
      bannerImage: "https://cdn.northropgrumman.com/-/media/Project/Northrop-Grumman/ngc/what-we-do/navigation-systems/seafind-navigation-hero.jpg"
    },
    {
      name: "DRAKE Counter-UAS System",
      provider: "Northrop Grumman",
      type: "Counter-UAS Platform",
      description: "RF negation system providing 360-degree protection against Group 1 drones with selective jamming to preserve friendly communications.",
      capabilities: ["360-Degree Protection", "Selective Jamming", "Group 1 Drone Defeat", "Friendly Comms Preservation"],
      trl: "TRL 9",
      icon: Shield,
      category: "ELECTRONIC PROTECTION", 
      specs: {
        coverage: "360-degree protection",
        targetDrones: "Group 1 UAS",
        deployment: "Backpack portable/ship mounted",
        jamming: "Selective RF negation"
      },
      securityLevel: ["End-to-End Encrypted"],
      securityIcons: ["encrypted"],
      documents: [
        {
          name: "DRAKE System Overview",
          type: "PDF",
          size: "2.1 MB",
          description: "Counter-UAS capabilities and operational procedures",
          url: "#"
        }
      ],
      bannerImage: "https://cdn.northropgrumman.com/-/media/Project/Northrop-Grumman/ngc/what-we-do/land/c-uas/drake-counter-uas-hero.jpg"
    },
    {
      name: "OverKey Mesh VPN",
      provider: "Caliola Engineering",
      type: "Zero-Trust Mesh VPN",
      description: "Zero-trust distributed mesh VPN enabling secure communications over untrusted networks in DDIL environments, replacing traditional hub-and-spoke VPN architecture.",
      capabilities: ["Zero-Trust Architecture", "DDIL Operations", "Mesh Networking", "Cryptographic Segregation"],
      trl: "TRL 9",
      icon: ShieldCheck,
      category: "RF COMMUNICATIONS",
      specs: {
        architecture: "Zero-trust distributed mesh",
        environment: "DDIL (Disconnected, Degraded, Intermittent, Limited)",
        encryption: "End-to-end without central server processing",
        transport: "Mesh radios, 5G, Starlink, satellite",
        bandwidth: "Optimized for tactical edge (1200+ bps)",
        protocols: "NSA-approved IPsec, AES-256, ECDH/ECDSA over P-384",
        vlans: "Software-defined VLANs with crypto segregation",
        management: "Web-based topology control interface",
        failover: "No single point of failure",
        rekeying: "Immediate upon node blocklisting",
        traffic: "Multicast (1-to-many) and incast (many-to-1)"
      },
      securityLevel: ["NSA-Approved Crypto", "Zero Trust Architecture", "DDIL Capable", "End-to-End Encrypted"],
      securityIcons: ["mesh", "nsa", "ddil", "encrypted"],
      documents: [
        {
          name: "OverKey Technical Datasheet",
          type: "PDF",
          size: "2.4 MB",
          description: "Complete technical specifications and implementation guide",
          url: "#"
        },
        {
          name: "DDIL Operations Manual",
          type: "PDF", 
          size: "1.8 MB",
          description: "Operational procedures for disconnected environments",
          url: "#"
        },
        {
          name: "Security Compliance Certificate",
          type: "PDF",
          size: "0.5 MB", 
          description: "NSA approval documentation and compliance details",
          url: "#"
        }
      ],
      bannerImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"
    }
  ];

  // Vessel Hull Options
  const swarmFleets = [
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
  const fleetUnitConfigurations = {
    0: { // MetalShark Patrol Drones
      outfits: [
        {
          name: "Coastal Defense Package",
          count: 87,
          capabilities: ["SPY-6 Radar", "Close-in Defense System", "RF Communications"],
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

  // Official Navy Mission Types by Major Categories
  const navyMissionTypes = {
    "Sea Control": {
      icon: Shield,
      missions: [
        { id: "sea-denial", name: "Sea Denial Operations", description: "Prevent enemy use of designated sea areas" },
        { id: "asw", name: "Anti-Submarine Warfare (ASW)", description: "Detect, track, and neutralize submarine threats" },
        { id: "asuw", name: "Anti-Surface Warfare (ASUW)", description: "Engage and neutralize surface vessel threats" },
        { id: "mine-warfare", name: "Mine Warfare Operations", description: "Mine laying and mine countermeasure operations" }
      ]
    },
    "Power Projection": {
      icon: Target,
      missions: [
        { id: "precision-strike", name: "Precision Strike", description: "Targeted engagement of high-value assets" },
        { id: "sead", name: "Suppression of Enemy Air Defenses (SEAD)", description: "Neutralize enemy air defense systems" },
        { id: "maritime-interdiction", name: "Maritime Interdiction Operations", description: "Board, search, and seize vessels" },
        { id: "naval-gunfire", name: "Naval Surface Fire Support", description: "Shore bombardment in support of ground forces" }
      ]
    },
    "Intelligence & Surveillance": {
      icon: Eye,
      missions: [
        { id: "isr", name: "Intelligence, Surveillance & Reconnaissance", description: "Gather tactical and strategic intelligence" },
        { id: "bda", name: "Battle Damage Assessment", description: "Evaluate effectiveness of strikes and operations" },
        { id: "sigint", name: "Signals Intelligence Collection", description: "Electronic intelligence gathering operations" },
        { id: "maritime-patrol", name: "Maritime Domain Awareness", description: "Monitor and report maritime activity" }
      ]
    },
    "Force Protection": {
      icon: ShieldCheck,
      missions: [
        { id: "force-protection", name: "Force Protection Operations", description: "Defend friendly forces and assets" },
        { id: "escort", name: "Convoy Escort Operations", description: "Provide security for merchant or military vessels" },
        { id: "cap", name: "Combat Air Patrol", description: "Maintain defensive air coverage" },
        { id: "perimeter-defense", name: "Perimeter Defense", description: "Establish defensive screen around assets" }
      ]
    },
    "Maritime Security": {
      icon: Lock,
      missions: [
        { id: "freedom-of-nav", name: "Freedom of Navigation Operations", description: "Assert navigation rights in international waters" },
        { id: "counter-piracy", name: "Counter-Piracy Operations", description: "Suppress piracy and protect commercial shipping" },
        { id: "smuggling-interdiction", name: "Anti-Smuggling Operations", description: "Intercept illegal trafficking operations" },
        { id: "port-security", name: "Port Security Operations", description: "Secure critical maritime infrastructure" }
      ]
    },
    "Humanitarian": {
      icon: Plus,
      missions: [
        { id: "search-rescue", name: "Search and Rescue (SAR)", description: "Locate and recover personnel in distress" },
        { id: "disaster-relief", name: "Humanitarian Assistance/Disaster Relief", description: "Provide aid during natural disasters" },
        { id: "noncombatant-evac", name: "Noncombatant Evacuation Operations", description: "Evacuate civilians from hostile areas" },
        { id: "medical-assist", name: "Maritime Medical Assistance", description: "Provide emergency medical care at sea" }
      ]
    }
  };

  // Official Navy Rules of Engagement Parameters
  const roeParameters = [
    {
      level: "ROE ALPHA",
      name: "Defensive Actions Only",
      description: "Weapons free for self-defense against hostile acts or hostile intent",
      engagementCriteria: ["Immediate threat to platform", "Weapons fired upon unit", "Clear hostile intent demonstrated"],
      restrictions: ["No preemptive strikes", "Minimize collateral damage", "Positive target identification required"]
    },
    {
      level: "ROE BRAVO", 
      name: "Limited Offensive Action",
      description: "Engage designated targets within specified parameters",
      engagementCriteria: ["Pre-approved target list", "Positive identification", "Commander authorization"],
      restrictions: ["Geographic limitations apply", "Time window restrictions", "Specific weapon systems only"]
    },
    {
      level: "ROE CHARLIE",
      name: "General Offensive Action",
      description: "Weapons free against all hostile forces in assigned area",
      engagementCriteria: ["Any enemy combatant", "Military-age males in combat zones", "Hostile equipment/facilities"],
      restrictions: ["Protected sites excluded", "Civilian evacuation protocols", "Proportionality requirements"]
    },
    {
      level: "ROE DELTA",
      name: "Maximum Force Authorization",
      description: "All available weapons systems authorized against any target",
      engagementCriteria: ["Any threat or potential threat", "Preemptive strikes authorized", "Area denial operations"],
      restrictions: ["NBC weapon approval required", "Strategic target coordination", "National command authority oversight"]
    }
  ];

  // Deployment Functions
  const initiateDeployment = (context) => {
    setDeploymentContext(context);
    setShowDeploymentModal(true);
    setDeploymentStep('mission-select');
    setSelectedMissionType(null);
    setSelectedROE(null);
    setSelectedUnitsForDeployment([]);
  };

  const executeDeployment = () => {
    if (!selectedMissionType || !selectedROE || !deploymentContext || selectedUnitsForDeployment.length === 0) return;

    const deploymentId = `DEP-${Date.now().toString(36).toUpperCase()}`;
    const startTime = new Date();
    
    const newDeployment = {
      id: deploymentId,
      startTime,
      missionType: selectedMissionType,
      roe: selectedROE,
      context: deploymentContext,
      status: 'LAUNCHING',
      progress: 0,
      currentPhase: 'Pre-deployment Systems Check',
      eta: new Date(startTime.getTime() + (30 * 60 * 1000)), // 30 minutes estimated
      units: selectedUnitsForDeployment.length,
      location: 'AOR-PACIFIC-01'
    };

    setActiveDeployments(prev => [...prev, newDeployment]);
    setShowDeploymentModal(false);
    setShowActiveDeployments(true);

    // Simulate deployment phases
    simulateDeploymentProgress(deploymentId);
  };

  const simulateDeploymentProgress = (deploymentId) => {
    const phases = [
      { name: 'Pre-deployment Systems Check', duration: 5000, progress: 15 },
      { name: 'Launch Sequence Initiated', duration: 3000, progress: 30 },
      { name: 'Units Deploying', duration: 8000, progress: 60 },
      { name: 'Formation Established', duration: 4000, progress: 80 },
      { name: 'Mission Area Transit', duration: 6000, progress: 95 },
      { name: 'On Station - Mission Active', duration: 2000, progress: 100 }
    ];

    let currentPhaseIndex = 0;
    const updateProgress = () => {
      if (currentPhaseIndex < phases.length) {
        const currentPhase = phases[currentPhaseIndex];
        
        setActiveDeployments(prev => prev.map(dep => 
          dep.id === deploymentId 
            ? { 
                ...dep, 
                currentPhase: currentPhase.name,
                progress: currentPhase.progress,
                status: currentPhase.progress === 100 ? 'ACTIVE' : 'LAUNCHING'
              }
            : dep
        ));

        currentPhaseIndex++;
        if (currentPhaseIndex < phases.length) {
          setTimeout(updateProgress, currentPhase.duration);
        }
      }
    };

    updateProgress();
  };

  // Vessel Mount Points Configuration
  const vesselMountPoints = {
    "Arleigh Burke": {
      "Forward VLS": { type: "KINETIC WEAPONS", x: 30, y: 25, category: "Missile Systems" },
      "Aft VLS": { type: "KINETIC WEAPONS", x: 30, y: 65, category: "Missile Systems" },
      "SPY-6 Radar": { type: "RADAR/RF", x: 50, y: 15, category: "Sensors" },
      "CIWS": { type: "DIRECTED ENERGY", x: 70, y: 30, category: "Point Defense" },
      "EW Suite": { type: "ELECTRONIC SUPPORT", x: 50, y: 40, category: "Electronic Warfare" },
      "Sonar Dome": { type: "ACOUSTIC/SONAR", x: 20, y: 85, category: "Underwater Sensors" },
      "Communications": { type: "RF COMMUNICATIONS", x: 50, y: 20, category: "Communications" },
      "Navigation": { type: "NAVIGATION", x: 45, y: 35, category: "Navigation Systems" }
    },
    "Ticonderoga": {
      "Forward VLS": { type: "KINETIC WEAPONS", x: 20, y: 25, category: "Missile Systems" },
      "Aft VLS": { type: "KINETIC WEAPONS", x: 20, y: 65, category: "Missile Systems" },
      "SPY-1 Radar": { type: "RADAR/RF", x: 50, y: 15, category: "Sensors" },
      "5-inch Gun": { type: "KINETIC WEAPONS", x: 30, y: 15, category: "Naval Guns" },
      "Harpoon Launcher": { type: "KINETIC WEAPONS", x: 75, y: 40, category: "Anti-Ship" },
      "CIWS Forward": { type: "DIRECTED ENERGY", x: 80, y: 30, category: "Point Defense" },
      "CIWS Aft": { type: "DIRECTED ENERGY", x: 80, y: 70, category: "Point Defense" },
      "SQS-53 Sonar": { type: "ACOUSTIC/SONAR", x: 40, y: 85, category: "Anti-Submarine" },
      "Electronic Warfare": { type: "ELECTRONIC SUPPORT", x: 60, y: 25, category: "Electronic Warfare" },
      "Communications": { type: "RF COMMUNICATIONS", x: 65, y: 35, category: "Communications" },
      "Torpedo Tubes": { type: "KINETIC WEAPONS", x: 35, y: 75, category: "Anti-Submarine" }
    },
    "MetalShark": {
      "Bow Mount": { type: "KINETIC WEAPONS", x: 20, y: 30, category: "Weapons" },
      "Sensor Array": { type: "EO/IR SENSORS", x: 50, y: 25, category: "Sensors" },
      "Communications": { type: "RF COMMUNICATIONS", x: 50, y: 40, category: "Communications" },
      "Navigation AI": { type: "UNMANNED SYSTEMS", x: 60, y: 35, category: "Autonomous Systems" },
      "EW Pod": { type: "ELECTRONIC SUPPORT", x: 70, y: 45, category: "Electronic Warfare" }
    },
    "Saildrone": {
      "Sensor Suite": { type: "EO/IR SENSORS", x: 50, y: 20, category: "Sensors" },
      "Communications": { type: "SATCOM", x: 50, y: 35, category: "Communications" },
      "Navigation": { type: "NAVIGATION", x: 45, y: 45, category: "Navigation" },
      "AI Control": { type: "UNMANNED SYSTEMS", x: 55, y: 50, category: "Autonomous Systems" }
    },
    "Virginia": {
      "Drone Bay 1": { type: "DRONE_STACK", x: 25, y: 35, category: "Autonomous Systems" },
      "Drone Bay 2": { type: "DRONE_STACK", x: 25, y: 50, category: "Autonomous Systems" },
      "Drone Bay 3": { type: "DRONE_STACK", x: 25, y: 65, category: "Autonomous Systems" },
      "Launch Tube 1": { type: "DRONE_STACK", x: 15, y: 40, category: "Launch Systems" },
      "Launch Tube 2": { type: "DRONE_STACK", x: 15, y: 55, category: "Launch Systems" },
      "Mission Control": { type: "COMMAND & CONTROL", x: 50, y: 45, category: "Control Systems" },
      "Communications": { type: "RF COMMUNICATIONS", x: 60, y: 50, category: "Communications" },
      "Bow Sonar": { type: "ACOUSTIC/SONAR", x: 20, y: 50, category: "Sonar Systems" },
      "Towed Array": { type: "ACOUSTIC/SONAR", x: 80, y: 50, category: "Sonar Systems" },
      "Torpedo Tubes": { type: "KINETIC WEAPONS", x: 25, y: 45, category: "Weapons" },
      "Periscope Sensors": { type: "EO/IR SENSORS", x: 60, y: 30, category: "Sensors" },
      "Underwater Comms": { type: "UNDERWATER COMMS", x: 50, y: 40, category: "Communications" },
      "Navigation": { type: "NAVIGATION", x: 50, y: 35, category: "Navigation Systems" }
    },
    "Custom Platform": {
      "Forward Sensor": { type: "EO/IR SENSORS", x: 30, y: 30, category: "Sensors" },
      "Primary Camera": { type: "EO/IR SENSORS", x: 50, y: 25, category: "Sensors" },
      "GPS Module": { type: "NAVIGATION", x: 60, y: 30, category: "Navigation" },
      "Communications Array": { type: "RF COMMUNICATIONS", x: 50, y: 35, category: "Communications" },
      "Flight Controller": { type: "COMMAND & CONTROL", x: 50, y: 50, category: "Control Systems" },
      "Power System": { type: "NAVIGATION", x: 40, y: 45, category: "Power" },
      "Motor Mount 1": { type: "UNMANNED SYSTEMS", x: 25, y: 60, category: "Propulsion" },
      "Motor Mount 2": { type: "UNMANNED SYSTEMS", x: 75, y: 60, category: "Propulsion" },
      "Payload Bay": { type: "EO/IR SENSORS", x: 50, y: 65, category: "Payload" },
      "Landing Gear": { type: "UNMANNED SYSTEMS", x: 50, y: 75, category: "Landing Systems" }
    }
  };

  const addToOutfitterCart = (item) => {
    setOutfitterCart(prev => [...prev, item]);
  };

  const addNewSlot = () => {
    if (!selectedHull) return;
    const newSlotId = `custom-slot-${Date.now()}`;
    const newSlot = {
      id: newSlotId,
      name: `Custom Mount ${availableSlots.length + 1}`,
      type: 'MODULAR',
      x: 50 + (Math.random() * 30 - 15), // Random position around center
      y: 50 + (Math.random() * 30 - 15),
      category: 'Custom Systems',
      isCustom: true
    };
    setAvailableSlots(prev => [...prev, newSlot]);
  };

  const removeSlot = (slotId) => {
    setAvailableSlots(prev => prev.filter(slot => slot.id !== slotId));
    // Also remove any configuration for this slot
    if (selectedHull) {
      setVesselConfiguration(prev => {
        const updated = { ...prev };
        if (updated[selectedHull.name]) {
          delete updated[selectedHull.name][slotId];
        }
        return updated;
      });
    }
  };

  const updateSlotPosition = (slotId, x, y) => {
    setSlotPositions(prev => ({
      ...prev,
      [slotId]: { x, y }
    }));
  };

  const addToCart = (capability) => {
    setOutfitterCart(prev => [...prev, capability]);
  };

  // Sorting function for fleet table
  const handleSort = (column) => {
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
  };

  const getSortedOutfits = (outfits) => {
    if (!outfits) return [];
    return [...outfits].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortColumn) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'count':
          aValue = a.count;
          bValue = b.count;
          break;
        case 'capabilities':
          aValue = a.capabilities.length;
          bValue = b.capabilities.length;
          break;
        case 'missionReady':
          aValue = a.status.missionReady;
          bValue = b.status.missionReady;
          break;
        case 'deployed':
          aValue = a.status.deployed;
          bValue = b.status.deployed;
          break;
        case 'charging':
          aValue = a.status.charging;
          bValue = b.status.charging;
          break;
        case 'maintenance':
          aValue = a.status.maintenance;
          bValue = b.status.maintenance;
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  };

  // Navigate back to marketplace and highlight capability
  const navigateToCapability = (capabilityName) => {
    setSelectedFleetForManagement(null);
    setSelectedView('stacks');
    setSearchTerm(capabilityName);
    // Small delay to ensure view change completes
    setTimeout(() => {
      setSelectedCapabilityDetails(null);
    }, 100);
  };

  const equipCapability = (mountPoint, capability) => {
    if (!selectedHull) return;
    setVesselConfiguration(prev => ({
      ...prev,
      [selectedHull.name]: {
        ...prev[selectedHull.name],
        [mountPoint]: capability
      }
    }));
    setSelectedMountPoint(null);
  };

  const unequipMountPoint = (mountPoint) => {
    if (!selectedHull) return;
    setVesselConfiguration(prev => {
      const updated = { ...prev };
      if (updated[selectedHull.name]) {
        delete updated[selectedHull.name][mountPoint];
      }
      return updated;
    });
  };

  const getCompatibleCapabilities = (mountPointType) => {
    // For drone deployment mount points, return drone stacks instead of individual capabilities
    if (mountPointType === 'DRONE_STACK') {
      return droneStacks;
    }
    
    // For regular mount points, return both compatible individual capabilities and engineering stacks
    const compatibleIndividualCaps = individualCapabilities.filter(cap => cap.category === mountPointType);
    const compatibleStacks = engineeringStacks.filter(stack => stack.category === mountPointType);
    
    // Combine both individual capabilities and stacks, with stacks first
    return [...compatibleStacks, ...compatibleIndividualCaps];
  };

  const toggleFilter = (capability) => {
    setSelectedFilters(prev => 
      prev.includes(capability) 
        ? prev.filter(f => f !== capability)
        : [...prev, capability]
    );
  };

  const clearAllFilters = () => {
    setSelectedFilters([]);
    setSearchTerm('');
  };

  const getFilteredItems = (items) => {
    let filtered = items;

    // Apply search filter
    if (searchTerm && searchTerm.length >= 2) {
      filtered = filtered.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = item.name.toLowerCase().includes(searchLower);
        const providerMatch = item.provider.toLowerCase().includes(searchLower);
        const descriptionMatch = item.description?.toLowerCase().includes(searchLower);
        
        // Handle both capabilities (for individual items) and capabilityRefs (for stacks)
        const capabilitiesArray = item.capabilities || item.capabilityRefs || [];
        const capabilityMatch = capabilitiesArray.some(cap => 
          cap.toLowerCase().includes(searchLower)
        );
        
        // Enhanced security keyword matching
        const securityKeywords = {
          'secure': ['secure', 'security', 'encrypted', 'encryption', 'vpn', 'mesh', 'zero trust', 'nsa', 'ddil'],
          'encrypted': ['encrypted', 'encryption', 'crypto', 'cryptography', 'secure', 'end-to-end'],
          'mesh': ['mesh', 'network', 'distributed', 'decentralized', 'connectivity', 'overkey'],
          'vpn': ['vpn', 'network', 'secure', 'tunnel', 'connectivity', 'mesh'],
          'zero trust': ['zero trust', 'trust', 'architecture', 'security', 'verification'],
          'nsa': ['nsa', 'approved', 'national security', 'cryptography', 'encryption'],
          'ddil': ['ddil', 'disconnected', 'degraded', 'intermittent', 'limited', 'resilient'],
          'crypto': ['crypto', 'cryptography', 'encryption', 'secure', 'nsa-approved'],
          'network': ['network', 'mesh', 'connectivity', 'distributed', 'vpn'],
          'trust': ['trust', 'zero trust', 'verification', 'architecture']
        };
        
        // Check if search term matches any security keywords or their related terms
        const securityMatch = item.securityLevel && (
          item.securityLevel.some(level => level.toLowerCase().includes(searchLower)) ||
          Object.entries(securityKeywords).some(([keyword, relatedTerms]) => {
            if (searchLower.includes(keyword) || relatedTerms.some(term => searchLower.includes(term))) {
              return item.securityLevel.some(level => 
                level.toLowerCase().includes(keyword) || 
                relatedTerms.some(term => level.toLowerCase().includes(term))
              );
            }
            return false;
          })
        );
        
        return nameMatch || providerMatch || descriptionMatch || capabilityMatch || securityMatch;
      });
    }

    // Apply category filters
    if (selectedFilters.length > 0) {
      filtered = filtered.filter(item => 
        selectedFilters.includes(item.category)
      );
    }

    // Apply security filters
    if (selectedSecurityFilters.length > 0) {
      filtered = filtered.filter(item => {
        if (!item.securityLevel) return false;
        return selectedSecurityFilters.some(securityFilter => 
          item.securityLevel.includes(securityFilter)
        );
      });
    }

    return filtered;
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0f172a', 
      color: '#ffffff'
    }}
    >
      {/* Header */}
      <header style={{ 
        backgroundColor: '#1a2530', 
        borderBottom: '1px solid rgba(203, 253, 0, 0.2)', 
        padding: '1.5rem 0' 
      }}
      >
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div 
            onClick={() => {
              setSelectedView('stacks');
              setSelectedHull(null);
              setSelectedMountPoint(null);
              setSearchTerm('');
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer' }}
          >
            <img src={caliburnLogotype} alt="Caliburn" style={{ height: '40px', width: 'auto' }} />
            <div style={{ textAlign: 'left' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#cbfd00', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>
                Mission Bay
              </h1>
              <p style={{ fontSize: '1rem', color: '#9ca3af', margin: 0, fontWeight: '400' }}>
                Pre-integrated capabilities ready for deployment on TempestOS
              </p>
            </div>
          </div>
          
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowCart(!showCart)}
              style={{ 
                backgroundColor: 'transparent', 
                color: '#cbfd00', 
                border: '1px solid #cbfd00', 
                padding: '0.75rem', 
                borderRadius: '0.5rem', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(203, 253, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Ship size={20} />
              {outfitterCart.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-0.5rem',
                  right: '-0.5rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '1.25rem',
                  height: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}
                >
                  {outfitterCart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1.5rem' }}>
        <NavigationTabs 
          selectedView={selectedView} 
          setSelectedView={setSelectedView}
          setSelectedHull={setSelectedHull}
          setSelectedMountPoint={setSelectedMountPoint}
          setVesselConfiguration={setVesselConfiguration}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Main Content Layout */}
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <SearchAndFilters 
            selectedView={selectedView}
            selectedFilters={selectedFilters}
            selectedSecurityFilters={selectedSecurityFilters}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            toggleFilter={toggleFilter}
            setSelectedSecurityFilters={setSelectedSecurityFilters}
            clearAllFilters={clearAllFilters}
            capabilityCategories={capabilityCategories}
          />

          {/* Main Content Area */}
          <div style={{ flex: 1 }}>
            {selectedView === 'stacks' && (
              <div>
                <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1rem' }}>
                  {getFilteredItems(engineeringStacks).length} of {engineeringStacks.length} pre-configured capability packages
                  {(searchTerm && searchTerm.length >= 2) || selectedFilters.length > 0 ? ' matching your filters' : ''}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {getFilteredItems(engineeringStacks).map((stack, idx) => {
                    const IconComponent = stack.icon;
                    const isExpanded = expandedStack === idx;
                    return (
                      <div key={idx} style={{ 
                        backgroundColor: '#1a2530', 
                        borderRadius: '0.75rem', 
                        padding: '2rem', 
                        border: '1px solid rgba(203, 253, 0, 0.2)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ backgroundColor: 'rgba(203, 253, 0, 0.2)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                              <IconComponent size={32} />
                            </div>
                            <div>
                              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#cbfd00', marginBottom: '0.5rem' }}>
                                {stack.name}
                              </h3>
                              <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{stack.provider}</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {/* Security Indicators */}
                            {stack.securityLevel && stack.securityLevel.length > 0 && (
                              <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                {stack.securityLevel.includes('NSA-Approved Crypto') && (
                                  <div style={{ 
                                    backgroundColor: 'rgba(239, 68, 68, 0.2)', 
                                    padding: '0.25rem', 
                                    borderRadius: '0.25rem',
                                    display: 'flex',
                                    alignItems: 'center'
                                  }} title="NSA-Approved Cryptography"
                                  >
                                    <Shield size={14} style={{ color: '#ef4444' }} />
                                  </div>
                                )}
                                {stack.securityLevel.includes('Zero Trust Architecture') && (
                                  <div style={{ 
                                    backgroundColor: 'rgba(16, 185, 129, 0.2)', 
                                    padding: '0.25rem', 
                                    borderRadius: '0.25rem',
                                    display: 'flex',
                                    alignItems: 'center'
                                  }} title="Zero Trust Architecture"
                                  >
                                    <Lock size={14} style={{ color: '#10b981' }} />
                                  </div>
                                )}
                                {stack.securityLevel.includes('DDIL Capable') && (
                                  <div style={{ 
                                    backgroundColor: 'rgba(251, 191, 36, 0.2)', 
                                    padding: '0.25rem', 
                                    borderRadius: '0.25rem',
                                    display: 'flex',
                                    alignItems: 'center'
                                  }} title="DDIL (Disconnected/Degraded/Intermittent/Limited) Capable"
                                  >
                                    <Unlink size={14} style={{ color: '#fbbf24' }} />
                                  </div>
                                )}
                                {(stack.securityLevel.includes('End-to-End Encrypted') || stack.securityLevel.includes('Mesh Network')) && (
                                  <div style={{ 
                                    backgroundColor: 'rgba(59, 130, 246, 0.2)', 
                                    padding: '0.25rem', 
                                    borderRadius: '0.25rem',
                                    display: 'flex',
                                    alignItems: 'center'
                                  }} title="Encrypted Mesh Network"
                                  >
                                    <Network size={14} style={{ color: '#3b82f6' }} />
                                  </div>
                                )}
                              </div>
                            )}
                            <span style={{ 
                              backgroundColor: stack.trl === 'TRL 9' ? 'rgba(34, 197, 94, 0.2)' : 
                                              stack.trl === 'TRL 7' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                              color: stack.trl === 'TRL 9' ? '#4ade80' : 
                                     stack.trl === 'TRL 7' ? '#fbbf24' : '#60a5fa',
                              padding: '0.25rem 0.75rem', 
                              borderRadius: '9999px', 
                              fontSize: '0.875rem', 
                              fontWeight: '600' 
                            }}
                            >
                              {stack.trl}
                            </span>
                          </div>
                        </div>
                        <p style={{ color: '#d1d5db', marginBottom: '1rem' }}>{stack.description}</p>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
                          <div style={{ flex: 1 }}>
                            {/* Components List */}
                            {stack.components && (
                              <div style={{ marginBottom: '1rem' }}>
                                <div style={{ color: '#cbfd00', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                  Components:
                                </div>
                                <ul style={{ margin: 0, paddingLeft: '1rem', listStyle: 'none' }}>
                                  {stack.components.map((component, compIdx) => (
                                    <li key={compIdx} style={{ 
                                      color: '#d1d5db', 
                                      fontSize: '0.875rem', 
                                      marginBottom: '0.25rem',
                                      position: 'relative'
                                    }}
                                    >
                                      <span style={{ color: '#cbfd00', marginRight: '0.5rem' }}>•</span>
                                      {component}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Mission Tags */}
                            {stack.missionTags && (
                              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {stack.missionTags.map(tag => (
                                  <span key={tag} style={{ 
                                    backgroundColor: 'rgba(59, 130, 246, 0.8)', 
                                    color: '#ffffff', 
                                    padding: '0.25rem 0.75rem', 
                                    borderRadius: '0.25rem', 
                                    fontSize: '0.75rem',
                                    fontWeight: '500'
                                  }}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              onClick={() => setExpandedStack(isExpanded ? null : idx)}
                              style={{ 
                                backgroundColor: 'transparent', 
                                color: '#cbfd00', 
                                border: '1px solid #cbfd00',
                                padding: '0.5rem 1rem', 
                                borderRadius: '0.375rem', 
                                fontWeight: 'bold', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}
                            >
                              {isExpanded ? 'Hide Details' : 'View Details'}
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            <button 
                              onClick={() => addToOutfitterCart(stack)}
                              style={{ 
                                backgroundColor: '#cbfd00', 
                                color: 'black', 
                                padding: '0.5rem 1rem', 
                                borderRadius: '0.375rem', 
                                fontWeight: 'bold', 
                                border: 'none', 
                                cursor: 'pointer' 
                              }}
                            >
                              Add to My Platforms
                            </button>
                          </div>
                        </div>

                        {/* Expanded Details Section */}
                        {isExpanded && stack.specs && (
                          <div style={{ 
                            marginTop: '1.5rem', 
                            padding: '1.5rem', 
                            backgroundColor: '#0f1419', 
                            borderRadius: '0.5rem',
                            border: '1px solid rgba(203, 253, 0, 0.1)'
                          }}
                          >
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                              
                              {/* Technical Specifications */}
                              <div>
                                <h4 style={{ color: '#cbfd00', fontWeight: 'bold', marginBottom: '1rem', fontSize: '1.125rem' }}>
                                  Technical Specifications
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                  {Object.entries(stack.specs).map(([key, value]) => (
                                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(203, 253, 0, 0.1)' }}>
                                      <span style={{ color: '#9ca3af', fontSize: '0.875rem', textTransform: 'capitalize' }}>
                                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                                      </span>
                                      <span style={{ color: '#d1d5db', fontSize: '0.875rem', fontWeight: '500' }}>
                                        {value}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Integration Details */}
                              <div>
                                <h4 style={{ color: '#cbfd00', fontWeight: 'bold', marginBottom: '1rem', fontSize: '1.125rem' }}>
                                  System Integration
                                </h4>
                                <p style={{ color: '#d1d5db', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '1rem' }}>
                                  {stack.integration}
                                </p>
                                {stack.components && (
                                  <div>
                                    <h5 style={{ color: '#9ca3af', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                      Key Components:
                                    </h5>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                      {stack.components.map((component, compIdx) => (
                                        <div key={compIdx} style={{ 
                                          color: '#60a5fa', 
                                          fontSize: '0.75rem',
                                          padding: '0.25rem 0.5rem',
                                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                          borderRadius: '0.25rem'
                                        }}
                                        >
                                          • {component}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedView === 'capabilities' && (
              <div>
                <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1rem' }}>
                  {getFilteredItems(individualCapabilities).length} of {individualCapabilities.length} individual capabilities
                  {(searchTerm && searchTerm.length >= 2) || selectedFilters.length > 0 ? ' matching your filters' : ''}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                  {getFilteredItems(individualCapabilities).map((capability, idx) => {
                    const IconComponent = capability.icon;
                    const isInCart = outfitterCart.some(item => item.name === capability.name);
                    return (
                      <div key={idx} style={{ 
                        backgroundColor: '#1a2530',
                        border: '1px solid #374151',
                        borderRadius: '0.75rem',
                        padding: '1.5rem',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#cbfd00';
                        e.currentTarget.style.backgroundColor = '#1f2937';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#374151';
                        e.currentTarget.style.backgroundColor = '#1a2530';
                      }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                          <div style={{ 
                            padding: '0.75rem', 
                            backgroundColor: 'rgba(203, 253, 0, 0.1)', 
                            borderRadius: '0.5rem',
                            flexShrink: 0
                          }}
                          >
                            <IconComponent size={24} color="#cbfd00" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ 
                              color: '#ffffff', 
                              fontWeight: 'bold', 
                              marginBottom: '0.5rem',
                              fontSize: '1.125rem'
                            }}
                            >
                              {capability.name}
                            </h3>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                              <div style={{ 
                                display: 'inline-block', 
                                padding: '0.25rem 0.75rem',
                                backgroundColor: 'rgba(203, 253, 0, 0.2)',
                                border: '1px solid #cbfd00',
                                borderRadius: '9999px',
                                color: '#cbfd00',
                                fontSize: '0.75rem',
                                fontWeight: '500'
                              }}
                              >
                                {capability.category}
                              </div>
                              
                              {/* Security Indicators */}
                              {capability.securityLevel && capability.securityLevel.length > 0 && (
                                <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                  {capability.securityLevel.includes('NSA-Approved Crypto') && (
                                    <div style={{ 
                                      backgroundColor: 'rgba(239, 68, 68, 0.2)', 
                                      padding: '0.25rem', 
                                      borderRadius: '0.25rem',
                                      display: 'flex',
                                      alignItems: 'center'
                                    }} title="NSA-Approved Cryptography"
                                    >
                                      <Shield size={12} style={{ color: '#ef4444' }} />
                                    </div>
                                  )}
                                  {capability.securityLevel.includes('Zero Trust Architecture') && (
                                    <div style={{ 
                                      backgroundColor: 'rgba(16, 185, 129, 0.2)', 
                                      padding: '0.25rem', 
                                      borderRadius: '0.25rem',
                                      display: 'flex',
                                      alignItems: 'center'
                                    }} title="Zero Trust Architecture"
                                    >
                                      <Lock size={12} style={{ color: '#10b981' }} />
                                    </div>
                                  )}
                                  {capability.securityLevel.includes('DDIL Capable') && (
                                    <div style={{ 
                                      backgroundColor: 'rgba(251, 191, 36, 0.2)', 
                                      padding: '0.25rem', 
                                      borderRadius: '0.25rem',
                                      display: 'flex',
                                      alignItems: 'center'
                                    }} title="DDIL (Disconnected/Degraded/Intermittent/Limited) Capable"
                                    >
                                      <Unlink size={12} style={{ color: '#fbbf24' }} />
                                    </div>
                                  )}
                                  {(capability.securityLevel.includes('End-to-End Encrypted') || capability.securityLevel.includes('Mesh Network')) && (
                                    <div style={{ 
                                      backgroundColor: 'rgba(59, 130, 246, 0.2)', 
                                      padding: '0.25rem', 
                                      borderRadius: '0.25rem',
                                      display: 'flex',
                                      alignItems: 'center'
                                    }} title="Encrypted Mesh Network"
                                    >
                                      <Network size={12} style={{ color: '#3b82f6' }} />
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              <span style={{ 
                                backgroundColor: capability.trl === 'TRL 9' ? 'rgba(34, 197, 94, 0.2)' : 
                                                capability.trl === 'TRL 7' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                color: capability.trl === 'TRL 9' ? '#4ade80' : 
                                       capability.trl === 'TRL 7' ? '#fbbf24' : '#60a5fa',
                                padding: '0.25rem 0.75rem', 
                                borderRadius: '9999px', 
                                fontSize: '0.75rem', 
                                fontWeight: '600' 
                              }}
                              >
                                {capability.trl}
                              </span>
                            </div>
                            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1rem' }}>
                              {capability.provider}
                            </p>
                          </div>
                        </div>
                        
                        <p style={{ color: '#d1d5db', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                          {capability.description}
                        </p>

                        {capability.specs && (
                          <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ color: '#cbfd00', fontWeight: 'bold', marginBottom: '0.75rem', fontSize: '1rem' }}>
                              Specifications
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
                              {Object.entries(capability.specs).map(([key, value]) => (
                                <div key={key} style={{ 
                                  padding: '0.5rem 0.75rem',
                                  backgroundColor: 'rgba(75, 85, 99, 0.3)',
                                  borderRadius: '0.375rem',
                                  border: '1px solid #4b5563'
                                }}
                                >
                                  <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                  </div>
                                  <div style={{ color: '#ffffff', fontSize: '0.875rem', fontWeight: '500' }}>
                                    {value}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'stretch' }}>
                          <button
                            onClick={() => setSelectedCapabilityDetails(capability)}
                            style={{
                              backgroundColor: 'transparent',
                              color: '#cbfd00',
                              border: '1px solid #cbfd00',
                              padding: '0.75rem 1rem',
                              borderRadius: '0.375rem',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem',
                              transition: 'all 0.2s',
                              flex: 1,
                              minHeight: '44px'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#cbfd00';
                              e.target.style.color = '#000';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'transparent';
                              e.target.style.color = '#cbfd00';
                            }}
                          >
                            <Eye size={16} />
                            View Details
                          </button>
                          <button
                            onClick={() => addToCart(capability)}
                            disabled={isInCart}
                            style={{
                              backgroundColor: isInCart ? '#374151' : '#cbfd00',
                              color: isInCart ? '#9ca3af' : '#000',
                              border: 'none',
                              padding: '0.75rem 1rem',
                              borderRadius: '0.375rem',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              cursor: isInCart ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem',
                              transition: 'all 0.2s',
                              flex: 1,
                              minHeight: '44px'
                            }}
                          >
                            <ShoppingCart size={16} />
                            {isInCart ? 'Added to Hull' : 'Add to Hull'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedView === 'outfitter' && (
              <div>
                {/* Platform Selection - Show when no hull selected */}
                {!selectedHull && (
                  <div style={{ 
                    backgroundColor: '#1a2530', 
                    backgroundImage: 'url("/src/assets/images/Caliburn - BG - Dark Mode - Bathymetric Map.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    borderRadius: '0.75rem', 
                    padding: '2rem', 
                    border: '2px solid rgba(203, 253, 0, 0.3)',
                    marginBottom: '2rem',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(26, 37, 48, 0.8)',
                      borderRadius: '0.75rem'
                    }}
                    />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ marginBottom: '2rem' }}>
                      <Ship style={{ color: '#cbfd00', margin: '0 auto 1rem' }} size={48} />
                      <h2 style={{ color: '#cbfd00', fontWeight: 'bold', fontSize: '2rem', marginBottom: '0.5rem' }}>
                        SELECT YOUR PLATFORM
                      </h2>
                      <p style={{ color: '#9ca3af', fontSize: '1rem' }}>Choose a vessel base to begin outfitting</p>
                      </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
                      {vesselHullData.map((vessel, idx) => (
                        <div 
                          key={idx}
                          onClick={() => {
                            setSelectedHull(vessel);
                            setSelectedMountPoint(null);
                          }}
                          style={{ 
                            backgroundColor: '#0f1419',
                            border: '1px solid rgba(203, 253, 0, 0.2)',
                            borderRadius: '0.75rem', 
                            padding: '2rem', 
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            textAlign: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.borderColor = '#cbfd00';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.borderColor = 'rgba(203, 253, 0, 0.2)';
                          }}
                        >
                          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                            {vesselHullComponents[vessel.icon] && 
                              React.createElement(vesselHullComponents[vessel.icon], { size: 120 })
                            }
                          </div>
                          <h3 style={{ color: '#cbfd00', fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                            {vessel.name.toUpperCase()}
                          </h3>
                          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            {vessel.type}
                          </p>
                          <p style={{ color: '#d1d5db', fontSize: '0.75rem', marginBottom: '1rem' }}>
                            {vessel.displacement}
                          </p>
                          <p style={{ color: '#9ca3af', fontSize: '0.75rem', lineHeight: '1.4' }}>
                            {vessel.description}
                          </p>
                        </div>
                      ))}
                      
                      {/* Design from Scratch Option */}
                      <div 
                        onClick={() => {
                          setSelectedHull({
                            name: "Custom Platform",
                            type: "Design from Scratch",
                            displacement: "Variable",
                            icon: "Custom Platform",
                            description: "Custom platform with flexible mount points"
                          });
                          setSelectedMountPoint(null);
                        }}
                        style={{ 
                          backgroundColor: '#0f1419',
                          border: '2px dashed rgba(203, 253, 0, 0.4)',
                          borderRadius: '0.75rem', 
                          padding: '2rem', 
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          textAlign: 'center',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.borderColor = '#cbfd00';
                          e.target.style.backgroundColor = '#1a2530';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.borderColor = 'rgba(203, 253, 0, 0.4)';
                          e.target.style.backgroundColor = '#0f1419';
                        }}
                      >
                        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: '0.8' }}>⚙️</div>
                        <h3 style={{ color: '#cbfd00', fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                          DESIGN FROM SCRATCH
                        </h3>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                          Custom Platform
                        </p>
                        <p style={{ color: '#d1d5db', fontSize: '0.75rem', marginBottom: '1rem' }}>
                          Variable Specifications
                        </p>
                        <p style={{ color: '#9ca3af', fontSize: '0.75rem', lineHeight: '1.4' }}>
                          Create a custom platform with configurable mount points and specifications
                        </p>
                        <div style={{ 
                          position: 'absolute', 
                          top: '1rem', 
                          right: '1rem', 
                          backgroundColor: 'rgba(203, 253, 0, 0.2)', 
                          color: '#cbfd00', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '0.25rem', 
                          fontSize: '0.625rem', 
                          fontWeight: 'bold' 
                        }}
                        >
                          BETA
                        </div>
                      </div>
                    </div>
                    </div>
                  </div>
                )}

                {/* Main Outfitter Interface - Show when hull selected */}
                {selectedHull && (
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    
                    {/* Enhanced Left Panel - Capability Selection */}
                    {selectedMountPoint && (
                      <div style={{ width: '400px', flexShrink: 0, maxHeight: '80vh', overflowY: 'auto' }}>
                        <div style={{ 
                          backgroundColor: '#1a2530', 
                          borderRadius: '0.75rem', 
                          padding: '1.5rem', 
                          border: '1px solid rgba(203, 253, 0, 0.2)',
                          position: 'sticky',
                          top: 0
                        }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div>
                              <h3 style={{ color: '#cbfd00', fontWeight: 'bold', fontSize: '1rem' }}>{selectedMountPoint}</h3>
                              <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                                {vesselMountPoints[selectedHull?.name]?.[selectedMountPoint]?.category || availableSlots.find(s => s.id === selectedMountPoint)?.category}
                              </p>
                            </div>
                            <button
                              onClick={() => setSelectedMountPoint(null)}
                              style={{ 
                                backgroundColor: 'transparent', 
                                color: '#9ca3af', 
                                border: 'none', 
                                cursor: 'pointer' 
                              }}
                            >
                              <X size={16} />
                            </button>
                          </div>
                          
                          <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#0f1419', borderRadius: '0.5rem' }}>
                            <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                              Compatible Type:
                            </p>
                            <p style={{ color: '#cbfd00', fontSize: '0.75rem', fontWeight: '600' }}>
                              {vesselMountPoints[selectedHull?.name]?.[selectedMountPoint]?.type || 'MODULAR'}
                            </p>
                          </div>

                          {/* Category Selector */}
                          <div style={{ marginBottom: '1rem' }}>
                            <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Browse by Category:</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                              {Object.entries(capabilityCategories).map(([categoryName, category]) => {
                                const Icon = category.icon;
                                const isSelected = selectedCategory === categoryName;
                                return (
                                  <button
                                    key={categoryName}
                                    onClick={() => setSelectedCategory(isSelected ? null : categoryName)}
                                    style={{
                                      backgroundColor: isSelected ? 'rgba(203, 253, 0, 0.2)' : 'transparent',
                                      color: isSelected ? '#cbfd00' : '#9ca3af',
                                      border: `1px solid ${isSelected ? '#cbfd00' : 'rgba(156, 163, 175, 0.3)'}`,
                                      borderRadius: '0.375rem',
                                      padding: '0.5rem',
                                      fontSize: '0.625rem',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.25rem',
                                      textAlign: 'left',
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    <Icon size={12} />
                                    <span style={{ fontSize: '0.625rem', fontWeight: '500' }}>
                                      {categoryName.replace(' & ', ' &\n')}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Capabilities List */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '600px', overflowY: 'auto' }}>
                            {(() => {
                              const mountPointType = vesselMountPoints[selectedHull?.name]?.[selectedMountPoint]?.type;
                              let capabilities = mountPointType ? getCompatibleCapabilities(mountPointType) : individualCapabilities;
                              
                              // Filter by selected category if one is chosen
                              if (selectedCategory) {
                                const categoryTypes = capabilityCategories[selectedCategory]?.subcategories || [];
                                capabilities = capabilities.filter(cap => categoryTypes.includes(cap.category));
                              }
                              
                              return capabilities.map((cap, idx) => {
                                const IconComponent = cap.icon;
                                const currentConfig = vesselConfiguration[selectedHull?.name]?.[selectedMountPoint];
                                const isEquipped = currentConfig?.name === cap.name;
                                
                                return (
                                  <div 
                                    key={idx}
                                    onClick={() => equipCapability(selectedMountPoint, cap)}
                                    style={{ 
                                      backgroundColor: isEquipped ? '#2a3844' : '#0f1419', 
                                      border: isEquipped ? '2px solid #cbfd00' : '1px solid rgba(203, 253, 0, 0.1)', 
                                      borderRadius: '0.375rem', 
                                      padding: '0.75rem', 
                                      cursor: 'pointer',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!isEquipped) {
                                        e.target.style.backgroundColor = '#1a2530';
                                        e.target.style.borderColor = 'rgba(203, 253, 0, 0.3)';
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!isEquipped) {
                                        e.target.style.backgroundColor = '#0f1419';
                                        e.target.style.borderColor = 'rgba(203, 253, 0, 0.1)';
                                      }
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                      <div style={{ backgroundColor: 'rgba(203, 253, 0, 0.2)', padding: '0.375rem', borderRadius: '0.375rem' }}>
                                        <IconComponent size={20} />
                                      </div>
                                      <div style={{ flex: 1 }}>
                                        <h4 style={{ fontWeight: 'bold', color: isEquipped ? '#cbfd00' : '#d1d5db', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{cap.name}</h4>
                                        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>{cap.provider}</p>
                                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                          {cap.capabilities.slice(0, 2).map((ability, abilityIdx) => (
                                            <span key={abilityIdx} style={{ 
                                              backgroundColor: 'rgba(59, 130, 246, 0.2)', 
                                              color: '#60a5fa', 
                                              padding: '0.125rem 0.375rem', 
                                              borderRadius: '0.25rem', 
                                              fontSize: '0.625rem' 
                                            }}
                                            >
                                              {ability}
                                            </span>
                                          ))}
                                          {cap.capabilities.length > 2 && (
                                            <span style={{ 
                                              color: '#9ca3af', 
                                              fontSize: '0.625rem' 
                                            }}
                                            >
                                              +{cap.capabilities.length - 2} more
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      {isEquipped && (
                                        <div style={{ 
                                          backgroundColor: '#cbfd00', 
                                          color: '#000', 
                                          padding: '0.25rem 0.5rem', 
                                          borderRadius: '0.25rem', 
                                          fontSize: '0.625rem', 
                                          fontWeight: 'bold' 
                                        }}
                                        >
                                          EQUIPPED
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Main Content - Vessel Diagram */}
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        backgroundColor: '#1a2530', 
                        borderRadius: '0.75rem', 
                        padding: '2rem', 
                        border: '1px solid rgba(203, 253, 0, 0.2)',
                        position: 'relative'
                      }}
                      >
                        {/* Header with platform selector */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button
                              onClick={() => {
                                setSelectedHull(null);
                                setSelectedMountPoint(null);
                              }}
                              style={{ 
                                backgroundColor: 'transparent', 
                                color: '#cbfd00', 
                                border: '1px solid rgba(203, 253, 0, 0.3)', 
                                borderRadius: '0.375rem',
                                padding: '0.5rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'rgba(203, 253, 0, 0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                              }}
                            >
                              <ChevronLeft size={16} />
                              Back to Platforms
                            </button>
                            <div>
                              <h2 style={{ color: '#cbfd00', fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                {selectedHull.name.toUpperCase()}
                              </h2>
                              <p style={{ color: '#9ca3af', fontSize: '1rem' }}>
                                {selectedHull.type} • {selectedHull.displacement}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedHull(null);
                              setSelectedMountPoint(null);
                              setVesselConfiguration({});
                            }}
                            style={{
                              backgroundColor: 'transparent',
                              color: '#9ca3af',
                              border: '1px solid rgba(156, 163, 175, 0.3)',
                              borderRadius: '0.5rem',
                              padding: '0.5rem 1rem',
                              fontSize: '0.875rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                          >
                            <Ship size={16} />
                            Change Platform
                          </button>
                        </div>

                        {/* Enhanced Vessel Diagram */}
                        <div style={{ 
                          position: 'relative', 
                          width: '100%', 
                          height: '800px', 
                          backgroundColor: '#0f1419', 
                          borderRadius: '1rem',
                          border: '1px solid rgba(203, 253, 0, 0.1)',
                          overflow: 'hidden',
                          marginBottom: '2rem'
                        }}
                        >
                          {/* Technical drawing background grid */}
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundImage: `
                              linear-gradient(rgba(203, 253, 0, 0.05) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(203, 253, 0, 0.05) 1px, transparent 1px)
                            `,
                            backgroundSize: '40px 40px',
                            opacity: 0.5
                          }}
                          />

                          {/* Professional vessel hull outline */}
                          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {vesselHullComponents[selectedHull.icon] && 
                              React.createElement(vesselHullComponents[selectedHull.icon], { size: 650 })
                            }
                          </div>

                          {/* TempestOS Core Platform - Central Hub */}
                          <div
                            style={{
                              position: 'absolute',
                              left: '50%',
                              top: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: '80px',
                              height: '80px',
                              borderRadius: '12px',
                              backgroundColor: 'rgba(203, 253, 0, 0.9)',
                              border: '3px solid #cbfd00',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '2rem',
                              fontWeight: 'bold',
                              color: '#000',
                              transition: 'all 0.2s',
                              zIndex: 15,
                              boxShadow: '0 0 20px rgba(203, 253, 0, 0.6), inset 0 0 20px rgba(203, 253, 0, 0.3)'
                            }}
                            title="TempestOS Core Platform - Central Processing Hub"
                          >
                            <Settings size={40} />
                          </div>

                          {/* TempestOS Label */}
                          <div
                            style={{
                              position: 'absolute',
                              left: '50%',
                              top: 'calc(50% + 60px)',
                              transform: 'translateX(-50%)',
                              fontSize: '1rem',
                              color: '#cbfd00',
                              fontWeight: '700',
                              textAlign: 'center',
                              pointerEvents: 'none',
                              textShadow: '0 0 8px rgba(0,0,0,0.8)',
                              backgroundColor: 'rgba(0,0,0,0.8)',
                              padding: '0.5rem 1rem',
                              borderRadius: '0.5rem',
                              whiteSpace: 'nowrap',
                              zIndex: 5,
                              border: '2px solid rgba(203, 253, 0, 0.6)',
                              boxShadow: '0 0 10px rgba(203, 253, 0, 0.3)'
                            }}
                          >
                            TempestOS CORE
                          </div>

                          {/* Connection Lines from Mount Points to TempestOS */}
                          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
                            {vesselMountPoints[selectedHull.name] && Object.entries(vesselMountPoints[selectedHull.name]).map(([mountName, mount]) => {
                              const isEquipped = vesselConfiguration[selectedHull.name]?.[mountName];
                              return (
                                <line
                                  key={`line-${mountName}`}
                                  x1={`${mount.x}%`}
                                  y1={`${mount.y}%`}
                                  x2="50%"
                                  y2="50%"
                                  stroke={isEquipped ? '#4ade80' : 'rgba(203, 253, 0, 0.3)'}
                                  strokeWidth={isEquipped ? "3" : "1"}
                                  strokeDasharray={isEquipped ? "none" : "5,5"}
                                  opacity={isEquipped ? "0.8" : "0.4"}
                                />
                              );
                            })}
                            {availableSlots.map((slot) => {
                              const position = slotPositions[slot.id] || { x: slot.x, y: slot.y };
                              const isEquipped = vesselConfiguration[selectedHull.name]?.[slot.id];
                              return (
                                <line
                                  key={`line-${slot.id}`}
                                  x1={`${position.x}%`}
                                  y1={`${position.y}%`}
                                  x2="50%"
                                  y2="50%"
                                  stroke={isEquipped ? '#4ade80' : 'rgba(203, 253, 0, 0.3)'}
                                  strokeWidth={isEquipped ? "3" : "1"}
                                  strokeDasharray={slot.isCustom ? "3,3" : (isEquipped ? "none" : "5,5")}
                                  opacity={isEquipped ? "0.8" : "0.4"}
                                />
                              );
                            })}
                          </svg>

                          {/* Instructions overlay when no mount point selected */}
                          {!selectedMountPoint && (
                            <div style={{
                              position: 'absolute',
                              top: '20px',
                              left: '20px',
                              textAlign: 'left',
                              color: '#9ca3af',
                              fontSize: '1rem',
                              pointerEvents: 'none',
                              backgroundColor: 'rgba(15, 20, 25, 0.95)',
                              padding: '1rem',
                              borderRadius: '0.5rem',
                              border: '1px solid rgba(203, 253, 0, 0.3)',
                              maxWidth: '300px',
                              zIndex: 20
                            }}
                            >
                              <Target style={{ marginRight: '0.5rem', color: '#cbfd00', display: 'inline' }} size={20} />
                              <span style={{ color: '#cbfd00', fontWeight: '600' }}>LOADOUT INTERFACE</span>
                              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', lineHeight: '1.4' }}>
                                • Click mount points to add capabilities<br />
                                • TempestOS connects to all systems<br />
                                • Drag custom slots to reposition
                              </div>
                            </div>
                          )}

                          {/* Fixed Mount Points */}
                          {vesselMountPoints[selectedHull.name] && Object.entries(vesselMountPoints[selectedHull.name]).map(([mountName, mount]) => {
                            const isEquipped = vesselConfiguration[selectedHull.name]?.[mountName];
                            const isSelected = selectedMountPoint === mountName;
                            const EquippedIcon = isEquipped?.icon;
                            
                            return (
                              <React.Fragment key={mountName}>
                                <div
                                  onClick={() => setSelectedMountPoint(mountName)}
                                  style={{
                                    position: 'absolute',
                                    left: `${mount.x}%`,
                                    top: `${mount.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    backgroundColor: isEquipped ? '#4ade80' : isSelected ? '#cbfd00' : 'rgba(203, 253, 0, 0.3)',
                                    border: isSelected ? '3px solid #cbfd00' : '2px solid rgba(203, 253, 0, 0.5)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.4rem',
                                    fontWeight: 'bold',
                                    color: isEquipped || isSelected ? '#000' : '#cbfd00',
                                    transition: 'all 0.2s',
                                    zIndex: 10,
                                    boxShadow: isSelected ? '0 0 0 4px rgba(203, 253, 0, 0.3)' : isEquipped ? '0 0 0 2px rgba(74, 222, 128, 0.5)' : 'none'
                                  }}
                                  title={mountName}
                                  onMouseEnter={(e) => {
                                    if (!isSelected) {
                                      e.target.style.transform = 'translate(-50%, -50%) scale(1.1)';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isSelected) {
                                      e.target.style.transform = 'translate(-50%, -50%) scale(1)';
                                    }
                                  }}
                                >
                                  {isEquipped && EquippedIcon ? <EquippedIcon size={24} /> : (isEquipped ? '✓' : '+')}
                                </div>
                                
                                {/* Mount point label */}
                                <div
                                  style={{
                                    position: 'absolute',
                                    left: `${mount.x}%`,
                                    top: `${mount.y + 8}%`,
                                    transform: 'translateX(-50%)',
                                    fontSize: '0.75rem',
                                    color: '#cbfd00',
                                    fontWeight: '600',
                                    textAlign: 'center',
                                    pointerEvents: 'none',
                                    textShadow: '0 0 4px rgba(0,0,0,0.8)',
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '0.375rem',
                                    whiteSpace: 'nowrap',
                                    zIndex: 5
                                  }}
                                >
                                  {mountName}
                                </div>
                              </React.Fragment>
                            );
                          })}

                          {/* Custom Slots */}
                          {availableSlots.map((slot) => {
                            const position = slotPositions[slot.id] || { x: slot.x, y: slot.y };
                            const isEquipped = vesselConfiguration[selectedHull.name]?.[slot.id];
                            const isSelected = selectedMountPoint === slot.id;
                            const EquippedIcon = isEquipped?.icon;
                            
                            return (
                              <React.Fragment key={slot.id}>
                                <div
                                  onClick={() => setSelectedMountPoint(slot.id)}
                                  draggable
                                  onDragStart={(e) => {
                                    e.dataTransfer.setData('slotId', slot.id);
                                  }}
                                  onDragEnd={(e) => {
                                    const rect = e.target.parentElement.getBoundingClientRect();
                                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                                    updateSlotPosition(slot.id, Math.max(5, Math.min(95, x)), Math.max(5, Math.min(95, y)));
                                  }}
                                  style={{
                                    position: 'absolute',
                                    left: `${position.x}%`,
                                    top: `${position.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    backgroundColor: isEquipped ? '#4ade80' : isSelected ? '#cbfd00' : 'rgba(203, 253, 0, 0.3)',
                                    border: slot.isCustom ? '2px dashed rgba(203, 253, 0, 0.8)' : '2px solid rgba(203, 253, 0, 0.5)',
                                    cursor: 'move',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.4rem',
                                    fontWeight: 'bold',
                                    color: isEquipped || isSelected ? '#000' : '#cbfd00',
                                    transition: 'all 0.2s',
                                    zIndex: 10,
                                    boxShadow: isSelected ? '0 0 0 4px rgba(203, 253, 0, 0.3)' : isEquipped ? '0 0 0 2px rgba(74, 222, 128, 0.5)' : 'none'
                                  }}
                                  title={`${slot.name} (Drag to move)`}
                                  onMouseEnter={(e) => {
                                    if (!isSelected) {
                                      e.target.style.transform = 'translate(-50%, -50%) scale(1.1)';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isSelected) {
                                      e.target.style.transform = 'translate(-50%, -50%) scale(1)';
                                    }
                                  }}
                                >
                                  {isEquipped && EquippedIcon ? <EquippedIcon size={24} /> : (isEquipped ? '✓' : '+')}
                                  <Move 
                                    size={12} 
                                    style={{ 
                                      position: 'absolute', 
                                      bottom: '-2px', 
                                      right: '-2px', 
                                      color: '#cbfd00',
                                      backgroundColor: 'rgba(0,0,0,0.8)',
                                      borderRadius: '50%',
                                      padding: '1px'
                                    }} 
                                  />
                                </div>
                                
                                {/* Custom slot label */}
                                <div
                                  style={{
                                    position: 'absolute',
                                    left: `${position.x}%`,
                                    top: `${position.y + 8}%`,
                                    transform: 'translateX(-50%)',
                                    fontSize: '0.75rem',
                                    color: '#cbfd00',
                                    fontWeight: '600',
                                    textAlign: 'center',
                                    pointerEvents: 'none',
                                    textShadow: '0 0 4px rgba(0,0,0,0.8)',
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '0.375rem',
                                    whiteSpace: 'nowrap',
                                    zIndex: 5,
                                    border: '1px dashed rgba(203, 253, 0, 0.5)'
                                  }}
                                >
                                  {slot.name}
                                </div>
                              </React.Fragment>
                            );
                          })}

                          {/* Capability Area Indicators */}
                          <div style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            zIndex: 20
                          }}
                          >
                            <div style={{
                              backgroundColor: 'rgba(0,0,0,0.8)',
                              border: '1px solid rgba(203, 253, 0, 0.3)',
                              borderRadius: '0.5rem',
                              padding: '0.75rem',
                              fontSize: '0.75rem',
                              color: '#cbfd00'
                            }}
                            >
                              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>CAPABILITY AREAS</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#4ade80' }} />
                                  <span>Equipped</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'rgba(203, 253, 0, 0.3)', border: '2px solid rgba(203, 253, 0, 0.5)' }} />
                                  <span>Available</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'rgba(203, 253, 0, 0.3)', border: '2px dashed rgba(203, 253, 0, 0.8)' }} />
                                  <span>Custom</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Configuration Summary */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ color: '#cbfd00', fontWeight: 'bold', fontSize: '1.25rem' }}>
                              Current Configuration
                            </h3>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                onClick={() => setIsFullScreenConfig(true)}
                                style={{
                                  backgroundColor: '#cbfd00',
                                  color: '#000',
                                  border: 'none',
                                  borderRadius: '0.375rem',
                                  padding: '0.5rem 1rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem'
                                }}
                              >
                                <Maximize2 size={14} />
                                Full Screen
                              </button>
                              <button
                                onClick={addNewSlot}
                                style={{
                                  backgroundColor: 'transparent',
                                  color: '#cbfd00',
                                  border: '1px solid #cbfd00',
                                  borderRadius: '0.375rem',
                                  padding: '0.5rem 1rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem'
                                }}
                              >
                                <Plus size={14} />
                                Add Slot
                              </button>
                            </div>
                          </div>
                          
                          {/* Core Systems - Always Present */}
                          <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ color: '#d1d5db', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                              Core Systems
                            </h4>
                            <div style={{ 
                              backgroundColor: '#1a2530', 
                              padding: '1rem', 
                              borderRadius: '0.5rem',
                              border: '1px solid rgba(203, 253, 0, 0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem'
                            }}
                            >
                              <div style={{ 
                                backgroundColor: 'rgba(203, 253, 0, 0.2)', 
                                padding: '0.5rem', 
                                borderRadius: '0.375rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              >
                                <Settings size={20} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ color: '#cbfd00', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                                  TempestOS Core Platform
                                </div>
                                <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                                  Foundational operating system - Always installed
                                </div>
                              </div>
                              <div style={{ 
                                backgroundColor: 'rgba(34, 197, 94, 0.2)', 
                                color: '#22c55e', 
                                padding: '0.25rem 0.5rem', 
                                borderRadius: '0.25rem', 
                                fontSize: '0.625rem', 
                                fontWeight: 'bold' 
                              }}
                              >
                                ACTIVE
                              </div>
                            </div>
                          </div>

                          {/* Security Assessment Panel */}
                          <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ color: '#d1d5db', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                              Security Assessment
                            </h4>
                            <div style={{ 
                              backgroundColor: '#0f1419', 
                              padding: '1rem', 
                              borderRadius: '0.5rem',
                              border: '1px solid rgba(203, 253, 0, 0.2)',
                            }}
                            >
                              {(() => {
                                const installedCapabilities = [
                                  ...Object.values(vesselConfiguration[selectedHull.name] || {}),
                                  ...availableSlots.filter(slot => vesselConfiguration[selectedHull.name]?.[slot.id]).map(slot => vesselConfiguration[selectedHull.name][slot.id])
                                ].filter(Boolean);
                                
                                const securityFeatures = {
                                  'NSA-Approved Crypto': installedCapabilities.some(cap => cap.securityLevel?.includes('NSA-Approved Crypto')),
                                  'Zero Trust Architecture': installedCapabilities.some(cap => cap.securityLevel?.includes('Zero Trust Architecture')),
                                  'DDIL Capable': installedCapabilities.some(cap => cap.securityLevel?.includes('DDIL Capable')),
                                  'End-to-End Encrypted': installedCapabilities.some(cap => cap.securityLevel?.includes('End-to-End Encrypted'))
                                };
                                
                                const securityScore = Object.values(securityFeatures).filter(Boolean).length;
                                const maxScore = 4;
                                const securityPercentage = Math.round((securityScore / maxScore) * 100);
                                
                                const getSecurityRating = () => {
                                  if (securityScore === 0) return { label: 'BASELINE', color: '#ef4444' };
                                  if (securityScore === 1) return { label: 'ENHANCED', color: '#f59e0b' };
                                  if (securityScore === 2) return { label: 'ADVANCED', color: '#fbbf24' };
                                  if (securityScore === 3) return { label: 'HIGH SECURITY', color: '#10b981' };
                                  return { label: 'MAXIMUM SECURITY', color: '#22c55e' };
                                };
                                
                                const rating = getSecurityRating();
                                
                                return (
                                  <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                      <div>
                                        <div style={{ color: '#cbfd00', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                                          Security Posture: {rating.label}
                                        </div>
                                        <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                                          {securityScore}/{maxScore} security features active ({securityPercentage}%)
                                        </div>
                                      </div>
                                      <div style={{ 
                                        backgroundColor: `rgba(${rating.color === '#22c55e' ? '34, 197, 94' : rating.color === '#10b981' ? '16, 185, 129' : rating.color === '#fbbf24' ? '251, 191, 36' : rating.color === '#f59e0b' ? '245, 158, 11' : '239, 68, 68'}, 0.2)`, 
                                        color: rating.color, 
                                        padding: '0.25rem 0.5rem', 
                                        borderRadius: '0.25rem', 
                                        fontSize: '0.625rem', 
                                        fontWeight: 'bold' 
                                      }}
                                      >
                                        {securityPercentage}%
                                      </div>
                                    </div>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                                      {Object.entries(securityFeatures).map(([feature, active]) => (
                                        <div key={feature} style={{ 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          gap: '0.5rem',
                                          padding: '0.5rem',
                                          backgroundColor: active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                                          borderRadius: '0.25rem',
                                          border: `1px solid ${active ? 'rgba(34, 197, 94, 0.3)' : 'rgba(156, 163, 175, 0.2)'}`
                                        }}
                                        >
                                          <div style={{ 
                                            width: '8px', 
                                            height: '8px', 
                                            borderRadius: '50%', 
                                            backgroundColor: active ? '#22c55e' : '#9ca3af' 
                                          }}
                                          />
                                          <span style={{ 
                                            color: active ? '#22c55e' : '#9ca3af', 
                                            fontSize: '0.6875rem',
                                            fontWeight: '500'
                                          }}
                                          >
                                            {feature}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Mount Points Configuration */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                              <h4 style={{ color: '#d1d5db', fontSize: '0.875rem', fontWeight: '600' }}>
                                Mount Points & Capabilities
                              </h4>
                              <button
                                onClick={() => setSelectedCategory(selectedCategory ? null : 'all')}
                                style={{
                                  backgroundColor: 'transparent',
                                  color: '#9ca3af',
                                  border: '1px solid rgba(156, 163, 175, 0.3)',
                                  borderRadius: '0.25rem',
                                  padding: '0.25rem 0.5rem',
                                  fontSize: '0.625rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}
                              >
                                <Grid3X3 size={12} />
                                Categories
                              </button>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                              {/* Fixed Mount Points */}
                              {vesselMountPoints[selectedHull.name] && Object.entries(vesselMountPoints[selectedHull.name]).map(([mountName, mount]) => {
                                const equipped = vesselConfiguration[selectedHull.name]?.[mountName];
                                const IconComponent = equipped?.icon;
                                return (
                                  <div key={mountName} style={{ 
                                    backgroundColor: '#0f1419', 
                                    padding: '1rem', 
                                    borderRadius: '0.5rem',
                                    border: equipped ? '1px solid rgba(203, 253, 0, 0.3)' : '1px solid rgba(203, 253, 0, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    position: 'relative'
                                  }}
                                  >
                                    <div style={{ 
                                      backgroundColor: equipped ? 'rgba(203, 253, 0, 0.2)' : 'rgba(156, 163, 175, 0.2)', 
                                      padding: '0.5rem', 
                                      borderRadius: '0.375rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                    >
                                      {equipped && IconComponent ? (
                                        <IconComponent size={20} />
                                      ) : (
                                        <Settings size={20} style={{ color: '#9ca3af' }} />
                                      )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ color: '#d1d5db', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem' }}>{mountName}</div>
                                      <div style={{ color: equipped ? '#cbfd00' : '#9ca3af', fontSize: '0.75rem' }}>
                                        {equipped ? equipped.name : 'Empty'}
                                      </div>
                                      <div style={{ color: '#6b7280', fontSize: '0.625rem', marginTop: '0.125rem' }}>
                                        {mount.category} • {mount.type}
                                      </div>
                                    </div>
                                    {equipped ? (
                                      <button
                                        onClick={() => unequipMountPoint(mountName)}
                                        style={{
                                          backgroundColor: 'transparent',
                                          color: '#ef4444',
                                          border: 'none',
                                          cursor: 'pointer',
                                          padding: '0.25rem'
                                        }}
                                      >
                                        <X size={16} />
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => setSelectedMountPoint(mountName)}
                                        style={{
                                          backgroundColor: '#cbfd00',
                                          color: '#000',
                                          border: 'none',
                                          cursor: 'pointer',
                                          padding: '0.25rem 0.5rem',
                                          borderRadius: '0.25rem',
                                          fontSize: '0.75rem',
                                          fontWeight: 'bold'
                                        }}
                                      >
                                        ADD
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                              
                              {/* Custom Slots */}
                              {availableSlots.map((slot) => {
                                const equipped = vesselConfiguration[selectedHull.name]?.[slot.id];
                                const IconComponent = equipped?.icon;
                                return (
                                  <div key={slot.id} style={{ 
                                    backgroundColor: '#0f1419', 
                                    padding: '1rem', 
                                    borderRadius: '0.5rem',
                                    border: slot.isCustom ? '1px dashed rgba(203, 253, 0, 0.4)' : '1px solid rgba(203, 253, 0, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    position: 'relative'
                                  }}
                                  >
                                    <div style={{ 
                                      backgroundColor: equipped ? 'rgba(203, 253, 0, 0.2)' : 'rgba(156, 163, 175, 0.2)', 
                                      padding: '0.5rem', 
                                      borderRadius: '0.375rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                    >
                                      {equipped && IconComponent ? (
                                        <IconComponent size={20} />
                                      ) : (
                                        <Plus size={20} style={{ color: '#9ca3af' }} />
                                      )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ color: '#d1d5db', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem' }}>{slot.name}</div>
                                      <div style={{ color: equipped ? '#cbfd00' : '#9ca3af', fontSize: '0.75rem' }}>
                                        {equipped ? equipped.name : 'Empty'}
                                      </div>
                                      <div style={{ color: '#6b7280', fontSize: '0.625rem', marginTop: '0.125rem' }}>
                                        {slot.category} • Modular
                                      </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                      {equipped ? (
                                        <button
                                          onClick={() => unequipMountPoint(slot.id)}
                                          style={{
                                            backgroundColor: 'transparent',
                                            color: '#ef4444',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '0.25rem'
                                          }}
                                        >
                                          <X size={16} />
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => setSelectedMountPoint(slot.id)}
                                          style={{
                                            backgroundColor: '#cbfd00',
                                            color: '#000',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '0.25rem',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold'
                                          }}
                                        >
                                          ADD
                                        </button>
                                      )}
                                      <button
                                        onClick={() => removeSlot(slot.id)}
                                        style={{
                                          backgroundColor: 'transparent',
                                          color: '#9ca3af',
                                          border: 'none',
                                          cursor: 'pointer',
                                          padding: '0.25rem'
                                        }}
                                      >
                                        <Minus size={16} />
                                      </button>
                                    </div>
                                    {slot.isCustom && (
                                      <div style={{ 
                                        position: 'absolute', 
                                        top: '0.5rem', 
                                        right: '0.5rem', 
                                        backgroundColor: 'rgba(203, 253, 0, 0.2)', 
                                        color: '#cbfd00', 
                                        padding: '0.125rem 0.25rem', 
                                        borderRadius: '0.125rem', 
                                        fontSize: '0.5rem', 
                                        fontWeight: 'bold' 
                                      }}
                                      >
                                        CUSTOM
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedView === 'shipyard' && (
              <div>
                <div style={{ 
                  backgroundColor: '#1a2530', 
                  borderRadius: '0.75rem', 
                  padding: '2rem', 
                  border: '2px solid rgba(203, 253, 0, 0.3)',
                  marginBottom: '2rem',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(26, 37, 48, 0.8)',
                    borderRadius: '0.75rem'
                  }}
                  />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ marginBottom: '2rem' }}>
                      <Ship style={{ color: '#cbfd00', margin: '0 auto 1rem' }} size={48} />
                      <h2 style={{ color: '#cbfd00', fontWeight: 'bold', fontSize: '2rem', marginBottom: '0.5rem' }}>
                        MY SHIPYARD
                      </h2>
                      <p style={{ color: '#9ca3af', fontSize: '1rem' }}>Your authorized vessel fleet and access management</p>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
                      {swarmFleets.map((fleet, idx) => {
                        const statusEntries = Object.entries(fleet.status || {});
                        const getStatusColor = (status) => {
                          switch(status) {
                            case 'missionReady': return { bg: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', label: 'MISSION READY' };
                            case 'deployed': return { bg: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', label: 'DEPLOYED' };
                            case 'charging': return { bg: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', label: 'CHARGING' };
                            case 'maintenance': return { bg: 'rgba(239, 68, 68, 0.2)', color: '#f87171', label: 'MAINTENANCE' };
                            case 'inRefit': return { bg: 'rgba(168, 85, 247, 0.2)', color: '#a78bfa', label: 'IN REFIT' };
                            case 'atSea': return { bg: 'rgba(6, 182, 212, 0.2)', color: '#06b6d4', label: 'AT SEA' };
                            default: return { bg: 'rgba(156, 163, 175, 0.2)', color: '#9ca3af', label: status.toUpperCase() };
                          }
                        };
                        
                        return (
                        <div 
                          key={idx}
                          onClick={() => setSelectedFleetForManagement(idx)}
                          style={{ 
                            backgroundColor: '#0f1419',
                            border: '1px solid rgba(203, 253, 0, 0.2)',
                            borderRadius: '0.75rem', 
                            padding: '1.5rem', 
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            position: 'relative',
                            height: '420px',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.borderColor = '#cbfd00';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.borderColor = 'rgba(203, 253, 0, 0.2)';
                          }}
                        >
                          {/* Total Units Badge */}
                          <div style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            backgroundColor: 'rgba(203, 253, 0, 0.2)',
                            color: '#cbfd00',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.375rem',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}
                          >
                            {fleet.totalUnits} UNITS
                          </div>
                          
                          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <Ship style={{ color: '#cbfd00', margin: '0 auto 0.75rem' }} size={32} />
                            <h3 style={{ color: '#f9fafb', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                              {fleet.name}
                            </h3>
                            <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                              {fleet.type}
                            </p>
                            <p style={{ color: '#9ca3af', fontSize: '0.8rem', lineHeight: '1.4' }}>
                              {fleet.description}
                            </p>
                          </div>

                          {/* Status Breakdown */}
                          <div style={{ marginBottom: '1.25rem', flex: '1' }}>
                            <div style={{ 
                              fontSize: '0.75rem', 
                              fontWeight: '600', 
                              color: '#d1d5db', 
                              marginBottom: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}
                            >
                              Fleet Status
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'flex-start',
                              gap: '0.25rem',
                              height: '80px'
                            }}
                            >
                              {statusEntries.map(([status, count]) => {
                                const statusStyle = getStatusColor(status);
                                return (
                                  <div key={status} style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    flex: 1,
                                    minWidth: '0'
                                  }}
                                  >
                                    <div style={{ 
                                      fontSize: '2rem', 
                                      color: '#9ca3af', 
                                      fontWeight: 'bold',
                                      lineHeight: '1'
                                    }}
                                    >
                                      {count}
                                    </div>
                                    <div style={{ 
                                      fontSize: '0.55rem', 
                                      color: '#6b7280', 
                                      fontWeight: '500',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.025em',
                                      marginTop: '0.25rem',
                                      lineHeight: '1.2',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis'
                                    }}
                                    >
                                      {statusStyle.label}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          {/* Action Buttons */}
                          <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                            <button
                              style={{ 
                                backgroundColor: '#cbfd00', 
                                color: 'black', 
                                padding: '0.75rem 1rem', 
                                borderRadius: '0.375rem',
                                border: 'none',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                flex: 1,
                                minWidth: '120px'
                              }}
                              onClick={() => {
                                // Configure swarm bulk operations
                                console.log('Configure swarm:', fleet.name);
                              }}
                            >
                              Configure Swarm
                            </button>
                            <button
                              style={{ 
                                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                color: '#60a5fa',
                                border: '1px solid #60a5fa',
                                padding: '0.75rem 1rem', 
                                borderRadius: '0.375rem',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                flex: 1,
                                minWidth: '100px'
                              }}
                              onClick={() => {
                                // Quick deploy functionality
                                console.log('Deploy units from:', fleet.name);
                              }}
                            >
                              Deploy Units
                            </button>
                          </div>
                        </div>
                        );
                      })}
                    </div>

                    {/* Fleet Expansion Panel */}
                    {expandedFleet !== null && (
                      <div style={{
                        backgroundColor: '#1a2530',
                        borderRadius: '0.75rem',
                        padding: '2rem',
                        marginTop: '2rem',
                        border: '2px solid rgba(203, 253, 0, 0.3)'
                      }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '1.5rem'
                        }}
                        >
                          <h3 style={{
                            color: '#cbfd00',
                            fontSize: '1.5rem',
                            fontWeight: 'bold'
                          }}
                          >
                            {swarmFleets[expandedFleet]?.name} - Detailed Management
                          </h3>
                          <button
                            onClick={() => setExpandedFleet(null)}
                            style={{
                              backgroundColor: 'transparent',
                              border: '1px solid rgba(203, 253, 0, 0.3)',
                              color: '#cbfd00',
                              padding: '0.5rem 1rem',
                              borderRadius: '0.375rem',
                              cursor: 'pointer'
                            }}
                          >
                            Close
                          </button>
                        </div>
                        
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                          gap: '1.5rem'
                        }}
                        >
                          {/* Individual Unit Management */}
                          <div style={{
                            backgroundColor: '#0f1419',
                            borderRadius: '0.5rem',
                            padding: '1.5rem',
                            border: '1px solid rgba(75, 85, 99, 0.3)'
                          }}
                          >
                            <h4 style={{ color: '#d1d5db', marginBottom: '1rem' }}>Individual Units</h4>
                            <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                              <p>Total Units: {swarmFleets[expandedFleet]?.totalUnits}</p>
                              <p style={{ marginTop: '0.5rem' }}>
                                Individual unit configuration and status monitoring will be available here.
                              </p>
                            </div>
                          </div>

                          {/* Bulk Operations */}
                          <div style={{
                            backgroundColor: '#0f1419',
                            borderRadius: '0.5rem',
                            padding: '1.5rem',
                            border: '1px solid rgba(75, 85, 99, 0.3)'
                          }}
                          >
                            <h4 style={{ color: '#d1d5db', marginBottom: '1rem' }}>Bulk Operations</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              <button style={{
                                backgroundColor: '#cbfd00',
                                color: 'black',
                                padding: '0.75rem',
                                borderRadius: '0.375rem',
                                border: 'none',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                              >
                                Configure All Units
                              </button>
                              <button style={{
                                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                color: '#60a5fa',
                                padding: '0.75rem',
                                borderRadius: '0.375rem',
                                border: '1px solid #60a5fa',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                              >
                                Deploy Selected
                              </button>
                            </div>
                          </div>

                          {/* Mission Assignments */}
                          <div style={{
                            backgroundColor: '#0f1419',
                            borderRadius: '0.5rem',
                            padding: '1.5rem',
                            border: '1px solid rgba(75, 85, 99, 0.3)'
                          }}
                          >
                            <h4 style={{ color: '#d1d5db', marginBottom: '1rem' }}>Mission Assignments</h4>
                            <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                              <p>Active Missions: 0</p>
                              <p>Planned Operations: 0</p>
                              <p style={{ marginTop: '0.5rem' }}>
                                Mission planning and assignment interface will be available here.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Deployment Modal */}
      {showDeploymentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}
        >
          <div style={{
            backgroundColor: '#0f1419',
            border: '2px solid rgba(203, 253, 0, 0.3)',
            borderRadius: '1rem',
            width: '95%',
            maxWidth: '1400px',
            maxHeight: '95%',
            display: 'flex',
            flexDirection: 'column'
          }}
          >
            {/* Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid rgba(75, 85, 99, 0.3)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#1a2530'
            }}
            >
              <div>
                <h2 style={{ color: '#cbfd00', fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  🚀 DEPLOYMENT OPERATIONS
                </h2>
                <p style={{ color: '#9ca3af', fontSize: '1rem' }}>
                  {deploymentContext?.type === 'fleet' 
                    ? `Fleet: ${deploymentContext.fleetName} • ${deploymentContext.totalUnits} Units`
                    : 'Single Unit Deployment'
                  }
                </p>
              </div>
              <button
                onClick={() => setShowDeploymentModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(203, 253, 0, 0.3)',
                  color: '#cbfd00',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                ✕ Close
              </button>
            </div>

            {/* Step Indicator */}
            <div style={{
              padding: '1rem 1.5rem',
              backgroundColor: '#0f1419',
              borderBottom: '1px solid rgba(75, 85, 99, 0.3)'
            }}
            >
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: deploymentStep === 'mission-select' ? '#cbfd00' : '#4b5563',
                  fontWeight: deploymentStep === 'mission-select' ? '600' : '400'
                }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: deploymentStep === 'mission-select' ? '#cbfd00' : '#4b5563',
                    color: 'black',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}
                  >
                    1
                  </div>
                  Mission Type
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: deploymentStep === 'unit-select' ? '#cbfd00' : '#4b5563',
                  fontWeight: deploymentStep === 'unit-select' ? '600' : '400'
                }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: deploymentStep === 'unit-select' ? '#cbfd00' : '#4b5563',
                    color: 'black',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}
                  >
                    2
                  </div>
                  Select Units
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: deploymentStep === 'roe-select' ? '#cbfd00' : '#4b5563',
                  fontWeight: deploymentStep === 'roe-select' ? '600' : '400'
                }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: deploymentStep === 'roe-select' ? '#cbfd00' : '#4b5563',
                    color: 'black',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}
                  >
                    3
                  </div>
                  Rules of Engagement
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: deploymentStep === 'deployment' ? '#cbfd00' : '#4b5563',
                  fontWeight: deploymentStep === 'deployment' ? '600' : '400'
                }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: deploymentStep === 'deployment' ? '#cbfd00' : '#4b5563',
                    color: 'black',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}
                  >
                    4
                  </div>
                  Execute Deployment
                </div>
              </div>
            </div>

            {/* Content */}
            <div style={{ 
              flex: 1, 
              overflow: 'auto',
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column'
            }}
            >
              <div style={{ 
                padding: '1rem 1.5rem',
                flex: 1
              }}
              >
              
              {/* Step 1: Mission Selection */}
              {deploymentStep === 'mission-select' && (
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ color: '#f9fafb', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      Select Mission Type
                    </h3>
                    <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                      Choose one mission type for your deployment
                    </p>
                  </div>
                  
                  {/* Scrollable Content Area */}
                  <div style={{ 
                    marginBottom: '1rem',
                    paddingRight: '0.5rem'
                  }}
                  >
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                      gap: '1rem'
                    }}
                    >
                    {Object.entries(navyMissionTypes).map(([category, categoryData]) => {
                      const IconComponent = categoryData.icon;
                      return (
                        <div key={category} style={{
                          backgroundColor: '#1a2530',
                          border: '1px solid rgba(75, 85, 99, 0.3)',
                          borderRadius: '0.75rem',
                          padding: '1rem'
                        }}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.75rem'
                          }}
                          >
                            <IconComponent style={{ color: '#cbfd00' }} size={24} />
                            <h4 style={{
                              color: '#cbfd00',
                              fontSize: '1.1rem',
                              fontWeight: 'bold'
                            }}
                            >
                              {category}
                            </h4>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {categoryData.missions.map((mission) => (
                              <div
                                key={mission.id}
                                onClick={() => setSelectedMissionType(mission)}
                                style={{
                                  padding: '0.75rem',
                                  backgroundColor: selectedMissionType?.id === mission.id ? 'rgba(203, 253, 0, 0.1)' : 'transparent',
                                  border: selectedMissionType?.id === mission.id ? '2px solid #cbfd00' : '1px solid rgba(75, 85, 99, 0.3)',
                                  borderRadius: '0.5rem',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '0.5rem'
                                }}
                                onMouseEnter={(e) => {
                                  if (selectedMissionType?.id !== mission.id) {
                                    e.target.style.backgroundColor = 'rgba(75, 85, 99, 0.1)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (selectedMissionType?.id !== mission.id) {
                                    e.target.style.backgroundColor = 'transparent';
                                  }
                                }}
                              >
                                {/* Radio Button */}
                                <div style={{
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '50%',
                                  border: `2px solid ${selectedMissionType?.id === mission.id ? '#cbfd00' : '#4b5563'}`,
                                  backgroundColor: selectedMissionType?.id === mission.id ? '#cbfd00' : 'transparent',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginTop: '0.125rem',
                                  flexShrink: 0
                                }}
                                >
                                  {selectedMissionType?.id === mission.id && (
                                    <div style={{
                                      width: '6px',
                                      height: '6px',
                                      borderRadius: '50%',
                                      backgroundColor: '#0f1419'
                                    }}
                                    />
                                  )}
                                </div>
                                
                                {/* Mission Content */}
                                <div style={{ flex: 1 }}>
                                  <div style={{
                                    color: selectedMissionType?.id === mission.id ? '#cbfd00' : '#f9fafb',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    marginBottom: '0.25rem'
                                  }}
                                  >
                                    {mission.name}
                                  </div>
                                  <div style={{
                                    color: '#9ca3af',
                                    fontSize: '0.8rem',
                                    lineHeight: '1.4'
                                  }}
                                  >
                                    {mission.description}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  </div>

                </div>
              )}

              {/* Step 1 Footer - Fixed at bottom */}
              {deploymentStep === 'mission-select' && (
                <div style={{
                  borderTop: '1px solid rgba(75, 85, 99, 0.3)',
                  padding: '1rem 1.5rem',
                  backgroundColor: '#0f1419',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  position: 'sticky',
                  bottom: 0,
                  marginTop: 'auto'
                }}
                >
                    {/* Selection Indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {selectedMissionType ? (
                        <div style={{
                          color: '#cbfd00',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}
                        >
                          ✓ Selected: {selectedMissionType.name}
                        </div>
                      ) : (
                        <div style={{
                          color: '#9ca3af',
                          fontSize: '0.9rem'
                        }}
                        >
                          Please select a mission type to continue
                        </div>
                      )}
                    </div>
                    
                    <button
                      disabled={!selectedMissionType}
                      onClick={() => setDeploymentStep('unit-select')}
                      style={{
                        backgroundColor: selectedMissionType ? '#cbfd00' : '#4b5563',
                        color: 'black',
                        padding: '1rem 2rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: selectedMissionType ? 'pointer' : 'not-allowed',
                        opacity: selectedMissionType ? 1 : 0.5
                      }}
                    >
                      Continue to Unit Selection →
                    </button>
                </div>
              )}

              {/* Step 2: Unit Selection */}
              {deploymentStep === 'unit-select' && (
                <div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ color: '#f9fafb', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      Select Units to Deploy
                    </h3>
                    <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                      Choose which units to deploy for this mission. Filter by configuration, readiness, or capabilities.
                    </p>
                  </div>

                  {/* Filter Controls */}
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    alignItems: 'center'
                  }}
                  >
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      alignItems: 'center'
                    }}
                    >
                      <button
                        onClick={() => {
                          if (deploymentContext?.units) {
                            setSelectedUnitsForDeployment(deploymentContext.units.map(u => u.id));
                          }
                        }}
                        style={{
                          backgroundColor: 'transparent',
                          border: '1px solid #cbfd00',
                          color: '#cbfd00',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => setSelectedUnitsForDeployment([])}
                        style={{
                          backgroundColor: 'transparent',
                          border: '1px solid #6b7280',
                          color: '#9ca3af',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Deselect All
                      </button>
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                      {selectedUnitsForDeployment.length} of {deploymentContext?.totalUnits || 0} units selected
                    </div>
                  </div>

                  {/* Unit Grid */}
                  <div style={{ 
                    marginBottom: '1rem',
                    paddingRight: '0.5rem'
                  }}
                  >
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                      gap: '1rem'
                    }}
                    >
                      {deploymentContext?.units?.map((unit, index) => {
                        const isSelected = selectedUnitsForDeployment.includes(unit.id || index);
                        const unitConfig = deploymentContext?.outfits?.[index];
                        
                        return (
                          <div
                            key={unit.id || index}
                            onClick={() => {
                              const unitId = unit.id || index;
                              setSelectedUnitsForDeployment(prev => 
                                isSelected 
                                  ? prev.filter(id => id !== unitId)
                                  : [...prev, unitId]
                              );
                            }}
                            style={{
                              backgroundColor: isSelected ? 'rgba(203, 253, 0, 0.1)' : 'transparent',
                              border: isSelected ? '2px solid #cbfd00' : '1px solid rgba(75, 85, 99, 0.3)',
                              borderRadius: '0.75rem',
                              padding: '1rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              display: 'flex',
                              gap: '0.75rem'
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.target.style.backgroundColor = 'rgba(75, 85, 99, 0.1)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                e.target.style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            {/* Checkbox */}
                            <div style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '4px',
                              border: `2px solid ${isSelected ? '#cbfd00' : '#4b5563'}`,
                              backgroundColor: isSelected ? '#cbfd00' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginTop: '0.125rem',
                              flexShrink: 0
                            }}
                            >
                              {isSelected && (
                                <div style={{
                                  color: '#0f1419',
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold'
                                }}
                                >
                                  ✓
                                </div>
                              )}
                            </div>

                            {/* Unit Info */}
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <div style={{
                                  color: isSelected ? '#cbfd00' : '#f9fafb',
                                  fontWeight: '600',
                                  fontSize: '0.9rem'
                                }}
                                >
                                  {unit.name || `Unit ${index + 1}`}
                                </div>
                                <div style={{
                                  color: '#4ade80',
                                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                                  padding: '0.125rem 0.5rem',
                                  borderRadius: '0.25rem',
                                  fontSize: '0.75rem',
                                  fontWeight: '600'
                                }}
                                >
                                  READY
                                </div>
                              </div>
                              
                              <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                                Hull: {unit.hull || 'Standard Configuration'}
                              </div>
                              
                              {unitConfig && (
                                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                  <div>Outfit: {unitConfig.name || 'Custom Configuration'}</div>
                                  {unitConfig.capabilities && (
                                    <div>Capabilities: {unitConfig.capabilities.slice(0, 2).join(', ')}{unitConfig.capabilities.length > 2 ? '...' : ''}</div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* Step 2 Footer - Fixed at bottom */}
              {deploymentStep === 'unit-select' && (
                <div style={{
                  borderTop: '1px solid rgba(75, 85, 99, 0.3)',
                  padding: '1rem 1.5rem',
                  backgroundColor: '#0f1419',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  position: 'sticky',
                  bottom: 0,
                  marginTop: 'auto'
                }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <button
                        onClick={() => setDeploymentStep('mission-select')}
                        style={{
                          backgroundColor: 'transparent',
                          border: '1px solid #6b7280',
                          color: '#9ca3af',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        ← Back
                      </button>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {selectedUnitsForDeployment.length > 0 ? (
                          <div style={{
                            color: '#cbfd00',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                          }}
                          >
                            ✓ {selectedUnitsForDeployment.length} units selected
                          </div>
                        ) : (
                          <div style={{
                            color: '#9ca3af',
                            fontSize: '0.9rem'
                          }}
                          >
                            Please select at least one unit to continue
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button
                      disabled={selectedUnitsForDeployment.length === 0}
                      onClick={() => setDeploymentStep('roe-select')}
                      style={{
                        backgroundColor: selectedUnitsForDeployment.length > 0 ? '#cbfd00' : '#4b5563',
                        color: 'black',
                        padding: '1rem 2rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: selectedUnitsForDeployment.length > 0 ? 'pointer' : 'not-allowed',
                        opacity: selectedUnitsForDeployment.length > 0 ? 1 : 0.5
                      }}
                    >
                      Continue to Rules of Engagement →
                    </button>
                </div>
              )}

              {/* Step 3: ROE Selection */}
              {deploymentStep === 'roe-select' && (
                <div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ color: '#f9fafb', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      Rules of Engagement
                    </h3>
                    <p style={{ color: '#9ca3af', fontSize: '1rem' }}>
                      Mission: <span style={{ color: '#cbfd00', fontWeight: '600' }}>{selectedMissionType?.name}</span>
                    </p>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
                    gap: '1.5rem'
                  }}
                  >
                    {roeParameters.map((roe, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedROE(roe)}
                        style={{
                          backgroundColor: selectedROE?.level === roe.level ? 'rgba(203, 253, 0, 0.1)' : '#1a2530',
                          border: selectedROE?.level === roe.level ? '2px solid #cbfd00' : '1px solid rgba(75, 85, 99, 0.3)',
                          borderRadius: '0.75rem',
                          padding: '1.5rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedROE?.level !== roe.level) {
                            e.target.style.backgroundColor = 'rgba(75, 85, 99, 0.1)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedROE?.level !== roe.level) {
                            e.target.style.backgroundColor = '#1a2530';
                          }
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          marginBottom: '1rem'
                        }}
                        >
                          <div style={{
                            backgroundColor: selectedROE?.level === roe.level ? '#cbfd00' : 'rgba(75, 85, 99, 0.5)',
                            color: selectedROE?.level === roe.level ? 'black' : '#f9fafb',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: '700'
                          }}
                          >
                            {roe.level}
                          </div>
                          <h4 style={{
                            color: selectedROE?.level === roe.level ? '#cbfd00' : '#f9fafb',
                            fontSize: '1.1rem',
                            fontWeight: 'bold'
                          }}
                          >
                            {roe.name}
                          </h4>
                        </div>

                        <p style={{
                          color: '#9ca3af',
                          fontSize: '0.9rem',
                          marginBottom: '1rem',
                          lineHeight: '1.5'
                        }}
                        >
                          {roe.description}
                        </p>

                        <div style={{ marginBottom: '1rem' }}>
                          <h5 style={{
                            color: '#f9fafb',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            marginBottom: '0.5rem',
                            textTransform: 'uppercase'
                          }}
                          >
                            Engagement Criteria:
                          </h5>
                          <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                            {roe.engagementCriteria.map((criteria, i) => (
                              <li key={i} style={{
                                color: '#9ca3af',
                                fontSize: '0.8rem',
                                marginBottom: '0.25rem'
                              }}
                              >
                                {criteria}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 style={{
                            color: '#f9fafb',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            marginBottom: '0.5rem',
                            textTransform: 'uppercase'
                          }}
                          >
                            Restrictions:
                          </h5>
                          <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                            {roe.restrictions.map((restriction, i) => (
                              <li key={i} style={{
                                color: '#9ca3af',
                                fontSize: '0.8rem',
                                marginBottom: '0.25rem'
                              }}
                              >
                                {restriction}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Navigation Buttons */}
                </div>
              )}

              {/* Step 3 Footer - Fixed at bottom */}
              {deploymentStep === 'roe-select' && (
                <div style={{
                  borderTop: '1px solid rgba(75, 85, 99, 0.3)',
                  padding: '1rem 1.5rem',
                  backgroundColor: '#0f1419',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  position: 'sticky',
                  bottom: 0,
                  marginTop: 'auto'
                }}
                >
                    <button
                      onClick={() => setDeploymentStep('unit-select')}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#9ca3af',
                        padding: '1rem 2rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #4b5563',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      ← Back to Unit Selection
                    </button>
                    <button
                      disabled={!selectedROE}
                      onClick={() => setDeploymentStep('deployment')}
                      style={{
                        backgroundColor: selectedROE ? '#cbfd00' : '#4b5563',
                        color: 'black',
                        padding: '1rem 2rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: selectedROE ? 'pointer' : 'not-allowed',
                        opacity: selectedROE ? 1 : 0.5
                      }}
                    >
                      Proceed to Deployment →
                    </button>
                </div>
              )}

              {/* Step 3: Execute Deployment */}
              {deploymentStep === 'deployment' && (
                <div>
                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: '#f9fafb', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                      Execute Deployment
                    </h3>
                    
                    {/* Mission Summary */}
                    <div style={{
                      backgroundColor: '#1a2530',
                      border: '1px solid rgba(203, 253, 0, 0.3)',
                      borderRadius: '0.75rem',
                      padding: '1.5rem',
                      marginBottom: '2rem'
                    }}
                    >
                      <h4 style={{ color: '#cbfd00', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                        Mission Summary
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        <div>
                          <div style={{ color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                            Mission Type
                          </div>
                          <div style={{ color: '#f9fafb', fontWeight: '600' }}>
                            {selectedMissionType?.name}
                          </div>
                        </div>
                        <div>
                          <div style={{ color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                            Rules of Engagement
                          </div>
                          <div style={{ color: '#f9fafb', fontWeight: '600' }}>
                            {selectedROE?.level} - {selectedROE?.name}
                          </div>
                        </div>
                        <div>
                          <div style={{ color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                            Units Deploying
                          </div>
                          <div style={{ color: '#cbfd00', fontWeight: 'bold', fontSize: '1.1rem' }}>
                            {selectedUnitsForDeployment.length} of {deploymentContext?.totalUnits} Units
                          </div>
                        </div>
                        <div>
                          <div style={{ color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                            Deployment Time
                          </div>
                          <div style={{ color: '#f9fafb', fontWeight: '600' }}>
                            {new Date().toLocaleTimeString()} UTC
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Deployment Controls */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem',
                    marginBottom: '2rem'
                  }}
                  >
                    {/* Launch Sequence */}
                    <div style={{
                      backgroundColor: '#1a2530',
                      border: '1px solid rgba(75, 85, 99, 0.3)',
                      borderRadius: '0.75rem',
                      padding: '1.5rem'
                    }}
                    >
                      <h4 style={{ color: '#f9fafb', fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                        Launch Sequence
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f9fafb' }}>
                          <input type="radio" name="launch" defaultChecked />
                          <span>Immediate Deployment</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f9fafb' }}>
                          <input type="radio" name="launch" />
                          <span>Scheduled Launch (T+15min)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f9fafb' }}>
                          <input type="radio" name="launch" />
                          <span>Staggered Deployment</span>
                        </label>
                      </div>
                    </div>

                    {/* Formation Pattern */}
                    <div style={{
                      backgroundColor: '#1a2530',
                      border: '1px solid rgba(75, 85, 99, 0.3)',
                      borderRadius: '0.75rem',
                      padding: '1.5rem'
                    }}
                    >
                      <h4 style={{ color: '#f9fafb', fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                        Formation Pattern
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f9fafb' }}>
                          <input type="radio" name="formation" defaultChecked />
                          <span>Dispersed Swarm</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f9fafb' }}>
                          <input type="radio" name="formation" />
                          <span>Line Formation</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f9fafb' }}>
                          <input type="radio" name="formation" />
                          <span>Diamond Pattern</span>
                        </label>
                      </div>
                    </div>

                    {/* Communication Plan */}
                    <div style={{
                      backgroundColor: '#1a2530',
                      border: '1px solid rgba(75, 85, 99, 0.3)',
                      borderRadius: '0.75rem',
                      padding: '1.5rem'
                    }}
                    >
                      <h4 style={{ color: '#f9fafb', fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                        Communication Plan
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Primary Freq:</span>
                          <span style={{ color: '#cbfd00', fontWeight: '600' }}>358.500 MHz</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Check-in:</span>
                          <span style={{ color: '#f9fafb' }}>Every 15 minutes</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Emergency:</span>
                          <span style={{ color: '#f87171', fontWeight: '600' }}>GUARD 243.0</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* Step 4 Footer - Fixed at bottom */}
              {deploymentStep === 'deployment' && (
                <div style={{
                  borderTop: '1px solid rgba(75, 85, 99, 0.3)',
                  padding: '1rem 1.5rem',
                  backgroundColor: '#0f1419',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  position: 'sticky',
                  bottom: 0,
                  marginTop: 'auto'
                }}
                >
                    <button
                      onClick={() => setDeploymentStep('roe-select')}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#9ca3af',
                        padding: '1rem 2rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #4b5563',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      ← Back to ROE
                    </button>
                    
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button
                        onClick={executeDeployment}
                        style={{
                          backgroundColor: '#f59e0b',
                          color: 'white',
                          padding: '1rem 2rem',
                          borderRadius: '0.5rem',
                          border: 'none',
                          fontSize: '1rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        🚀 LAUNCH MISSION
                      </button>
                      
                      <button
                        onClick={executeDeployment}
                        style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          padding: '1rem 2rem',
                          borderRadius: '0.5rem',
                          border: 'none',
                          fontSize: '1rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        🚨 EMERGENCY LAUNCH
                      </button>
                    </div>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Deployments Tracking */}
      {showActiveDeployments && activeDeployments.length > 0 && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          width: '400px',
          backgroundColor: '#0f1419',
          border: '2px solid rgba(203, 253, 0, 0.3)',
          borderRadius: '1rem',
          padding: '1rem',
          zIndex: 1200,
          maxHeight: '80vh',
          overflow: 'auto'
        }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: '#cbfd00', fontSize: '1.2rem', fontWeight: 'bold' }}>
              🎯 Active Deployments
            </h3>
            <button
              onClick={() => setShowActiveDeployments(false)}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(203, 253, 0, 0.3)',
                color: '#cbfd00',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeDeployments.map(deployment => (
              <div
                key={deployment.id}
                style={{
                  backgroundColor: '#1a2530',
                  border: '1px solid rgba(75, 85, 99, 0.3)',
                  borderRadius: '0.5rem',
                  padding: '1rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ color: '#cbfd00', fontWeight: '600', fontSize: '1rem' }}>
                    {deployment.id}
                  </div>
                  <div style={{
                    backgroundColor: deployment.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                    color: deployment.status === 'ACTIVE' ? '#4ade80' : '#fbbf24',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}
                  >
                    {deployment.status}
                  </div>
                </div>

                <div style={{ color: '#d1d5db', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                  <div><strong>Mission:</strong> {deployment.missionType.name}</div>
                  <div><strong>ROE:</strong> {deployment.roe.level}</div>
                  <div><strong>Units:</strong> {deployment.units}</div>
                  <div><strong>Location:</strong> {deployment.location}</div>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    {deployment.currentPhase}
                  </div>
                  <div style={{
                    backgroundColor: 'rgba(75, 85, 99, 0.3)',
                    borderRadius: '0.5rem',
                    height: '6px',
                    overflow: 'hidden'
                  }}
                  >
                    <div style={{
                      backgroundColor: '#cbfd00',
                      height: '100%',
                      width: `${deployment.progress}%`,
                      transition: 'width 0.5s ease-in-out'
                    }}
                    />
                  </div>
                  <div style={{ color: '#cbfd00', fontSize: '0.75rem', textAlign: 'right', marginTop: '0.25rem' }}>
                    {deployment.progress}%
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
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
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1100
        }}
        >
          <button
            onClick={() => setShowActiveDeployments(true)}
            style={{
              backgroundColor: '#cbfd00',
              color: 'black',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            🎯 {activeDeployments.length} Active
          </button>
        </div>
      )}

      {/* Fleet Management Modal */}
      {selectedFleetForManagement !== null && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}
        >
          <div style={{
            backgroundColor: '#0f1419',
            border: '2px solid rgba(203, 253, 0, 0.3)',
            borderRadius: '1rem',
            width: '95%',
            maxWidth: '1200px',
            maxHeight: '90%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
          >
            {/* Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid rgba(75, 85, 99, 0.3)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
            >
              <div>
                <h2 style={{ color: '#cbfd00', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {swarmFleets[selectedFleetForManagement]?.name} - Fleet Management
                </h2>
                <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                  {swarmFleets[selectedFleetForManagement]?.totalUnits} total units • {swarmFleets[selectedFleetForManagement]?.type}
                </p>
              </div>
              <button
                onClick={() => setSelectedFleetForManagement(null)}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(203, 253, 0, 0.3)',
                  color: '#cbfd00',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Close
              </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
              {/* Summary Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
              }}
              >
                {fleetUnitConfigurations[selectedFleetForManagement]?.outfits.map((outfit, idx) => (
                  <div key={idx} style={{
                    backgroundColor: '#1a2530',
                    border: '1px solid rgba(75, 85, 99, 0.3)',
                    borderRadius: '0.5rem',
                    padding: '1rem'
                  }}
                  >
                    <h4 style={{ color: '#f9fafb', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      {outfit.name}
                    </h4>
                    <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                      {outfit.count} units
                    </p>
                    
                    {/* Clickable Capabilities */}
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                        Capabilities:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {outfit.capabilities.map((capability, capIdx) => (
                          <span
                            key={capIdx}
                            onClick={() => navigateToCapability(capability)}
                            style={{
                              color: '#60a5fa',
                              fontSize: '0.7rem',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              textDecorationColor: 'transparent',
                              transition: 'all 0.2s',
                              padding: '0.125rem 0.25rem',
                              backgroundColor: 'rgba(96, 165, 250, 0.1)',
                              borderRadius: '0.25rem'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.color = '#cbfd00';
                              e.target.style.backgroundColor = 'rgba(203, 253, 0, 0.1)';
                              e.target.style.textDecorationColor = '#cbfd00';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.color = '#60a5fa';
                              e.target.style.backgroundColor = 'rgba(96, 165, 250, 0.1)';
                              e.target.style.textDecorationColor = 'transparent';
                            }}
                          >
                            {capability}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <span style={{ color: '#4ade80' }}>{outfit.status.missionReady} Ready</span>
                      <span style={{ color: '#60a5fa' }}>{outfit.status.deployed} Deployed</span>
                      <span style={{ color: '#fbbf24' }}>{outfit.status.charging} Charging</span>
                      <span style={{ color: '#f87171' }}>{outfit.status.maintenance} Maintenance</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Detailed Table */}
              <div style={{
                backgroundColor: '#1a2530',
                borderRadius: '0.5rem',
                border: '1px solid rgba(75, 85, 99, 0.3)',
                overflow: 'hidden'
              }}
              >
                <div style={{
                  padding: '1rem',
                  borderBottom: '1px solid rgba(75, 85, 99, 0.3)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                >
                  <h3 style={{ color: '#f9fafb', fontSize: '1.1rem', fontWeight: 'bold' }}>
                    Unit Configuration Details
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{
                      backgroundColor: '#cbfd00',
                      color: 'black',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.25rem',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                    >
                      Bulk Configure
                    </button>
                    <button style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      color: '#60a5fa',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.25rem',
                      border: '1px solid #60a5fa',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                    >
                      Deploy Selected
                    </button>
                  </div>
                </div>

                {/* Table Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '200px 80px 300px 120px 120px 120px 120px',
                  gap: '1rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#0f1419',
                  borderBottom: '1px solid rgba(75, 85, 99, 0.3)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#9ca3af'
                }}
                >
                  <div 
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    onClick={() => handleSort('name')}
                  >
                    Outfit Package
                    {sortColumn === 'name' && (
                      sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </div>
                  <div 
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    onClick={() => handleSort('count')}
                  >
                    Units
                    {sortColumn === 'count' && (
                      sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </div>
                  <div 
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    onClick={() => handleSort('capabilities')}
                  >
                    Capabilities
                    {sortColumn === 'capabilities' && (
                      sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </div>
                  <div 
                    style={{ cursor: 'pointer', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                    onClick={() => handleSort('missionReady')}
                  >
                    Mission Ready
                    {sortColumn === 'missionReady' && (
                      sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </div>
                  <div 
                    style={{ cursor: 'pointer', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                    onClick={() => handleSort('deployed')}
                  >
                    Deployed
                    {sortColumn === 'deployed' && (
                      sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </div>
                  <div 
                    style={{ cursor: 'pointer', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                    onClick={() => handleSort('charging')}
                  >
                    Charging
                    {sortColumn === 'charging' && (
                      sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </div>
                  <div 
                    style={{ cursor: 'pointer', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                    onClick={() => handleSort('maintenance')}
                  >
                    Maintenance
                    {sortColumn === 'maintenance' && (
                      sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </div>
                </div>

                {/* Table Rows */}
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {getSortedOutfits(fleetUnitConfigurations[selectedFleetForManagement]?.outfits).map((outfit, idx) => (
                    <div key={idx} style={{
                      display: 'grid',
                      gridTemplateColumns: '200px 80px 300px 120px 120px 120px 120px',
                      gap: '1rem',
                      padding: '0.75rem 1rem',
                      borderBottom: idx < getSortedOutfits(fleetUnitConfigurations[selectedFleetForManagement]?.outfits).length - 1 ? '1px solid rgba(75, 85, 99, 0.2)' : 'none',
                      fontSize: '0.8rem',
                      alignItems: 'center'
                    }}
                    >
                      <div style={{ color: '#f9fafb', fontWeight: '500' }}>{outfit.name}</div>
                      <div style={{ color: '#cbfd00', fontWeight: 'bold' }}>{outfit.count}</div>
                      <div style={{ fontSize: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {outfit.capabilities.map((capability, capIdx) => (
                          <span
                            key={capIdx}
                            onClick={() => navigateToCapability(capability)}
                            style={{
                              color: '#60a5fa',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              textDecorationColor: 'transparent',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.color = '#cbfd00';
                              e.target.style.textDecorationColor = '#cbfd00';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.color = '#60a5fa';
                              e.target.style.textDecorationColor = 'transparent';
                            }}
                          >
                            {capability}
                            {capIdx < outfit.capabilities.length - 1 && ','}
                          </span>
                        ))}
                      </div>
                      <div style={{ color: '#4ade80', textAlign: 'center', fontWeight: 'bold' }}>
                        {outfit.status.missionReady}
                      </div>
                      <div style={{ color: '#60a5fa', textAlign: 'center', fontWeight: 'bold' }}>
                        {outfit.status.deployed}
                      </div>
                      <div style={{ color: '#fbbf24', textAlign: 'center', fontWeight: 'bold' }}>
                        {outfit.status.charging}
                      </div>
                      <div style={{ color: '#f87171', textAlign: 'center', fontWeight: 'bold' }}>
                        {outfit.status.maintenance}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Panel */}
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                backgroundColor: '#1a2530',
                borderRadius: '0.5rem',
                border: '1px solid rgba(75, 85, 99, 0.3)'
              }}
              >
                <h4 style={{ color: '#f9fafb', fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
                  Fleet Operations
                </h4>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button style={{
                    backgroundColor: '#cbfd00',
                    color: 'black',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                  >
                    Create New Outfit Package
                  </button>
                  <button 
                    onClick={() => initiateDeployment({
                      type: 'fleet',
                      fleetIndex: selectedFleetForManagement,
                      fleetName: swarmFleets[selectedFleetForManagement]?.name,
                      totalUnits: swarmFleets[selectedFleetForManagement]?.totalUnits,
                      outfits: fleetUnitConfigurations[selectedFleetForManagement]?.outfits,
                      units: Array.from({ length: swarmFleets[selectedFleetForManagement]?.totalUnits || 0 }, (_, i) => ({
                        id: `unit-${selectedFleetForManagement}-${i}`,
                        name: `${swarmFleets[selectedFleetForManagement]?.name || 'Unit'} ${i + 1}`,
                        hull: 'Autonomous Surface Vessel',
                        status: 'READY',
                        capabilities: fleetUnitConfigurations[selectedFleetForManagement]?.outfits?.[i]?.capabilities || ['Surveillance', 'Communications']
                      }))
                    })}
                    style={{
                      backgroundColor: 'rgba(34, 197, 94, 0.2)',
                      color: '#4ade80',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #4ade80',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Deploy Fleet
                  </button>
                  <button style={{
                    backgroundColor: 'rgba(168, 85, 247, 0.2)',
                    color: '#a78bfa',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #a78bfa',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                  >
                    Schedule Maintenance
                  </button>
                  <button style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    color: '#f87171',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #f87171',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                  >
                    Emergency Recall
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Configuration Mode */}
      {isFullScreenConfig && selectedHull && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#0f172a',
          zIndex: 1000,
          overflow: 'hidden'
        }}
        >
          {/* Full Screen Header */}
          <div style={{
            backgroundColor: '#1a2530',
            borderBottom: '1px solid rgba(203, 253, 0, 0.2)',
            padding: '1rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h2 style={{ color: '#cbfd00', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {selectedHull.name.toUpperCase()} - FULL CONFIGURATION
              </h2>
              <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                {selectedHull.type} • {selectedHull.displacement}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button
                onClick={addNewSlot}
                style={{
                  backgroundColor: 'transparent',
                  color: '#cbfd00',
                  border: '1px solid #cbfd00',
                  borderRadius: '0.375rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Plus size={16} />
                Add Slot
              </button>
              <button
                onClick={() => setIsFullScreenConfig(false)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#9ca3af',
                  border: '1px solid rgba(156, 163, 175, 0.3)',
                  borderRadius: '0.375rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <X size={16} />
                Exit Full Screen
              </button>
            </div>
          </div>

          {/* Full Screen Content */}
          <div style={{ display: 'flex', height: 'calc(100vh - 80px)' }}>
            
            {/* Left Sidebar - Categories & Capabilities */}
            <div style={{ width: '350px', backgroundColor: '#1a2530', borderRight: '1px solid rgba(203, 253, 0, 0.2)', overflowY: 'auto' }}>
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ color: '#cbfd00', fontWeight: 'bold', marginBottom: '1rem' }}>Capability Categories</h3>
                
                {/* Category Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {Object.entries(capabilityCategories).map(([categoryName, category]) => {
                    const Icon = category.icon;
                    const isSelected = selectedCategory === categoryName;
                    return (
                      <button
                        key={categoryName}
                        onClick={() => setSelectedCategory(isSelected ? null : categoryName)}
                        style={{
                          backgroundColor: isSelected ? 'rgba(203, 253, 0, 0.2)' : 'transparent',
                          color: isSelected ? '#cbfd00' : '#9ca3af',
                          border: `1px solid ${isSelected ? '#cbfd00' : 'rgba(156, 163, 175, 0.3)'}`,
                          borderRadius: '0.375rem',
                          padding: '0.75rem',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                          fontWeight: '600'
                        }}
                      >
                        <Icon size={20} />
                        <span>{categoryName}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Capabilities List */}
                {selectedCategory && (
                  <div>
                    <h4 style={{ color: '#d1d5db', fontWeight: 'bold', marginBottom: '0.75rem' }}>
                      {selectedCategory} Capabilities
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {(() => {
                        const categoryTypes = capabilityCategories[selectedCategory]?.subcategories || [];
                        const capabilities = individualCapabilities.filter(cap => categoryTypes.includes(cap.category));
                        
                        return capabilities.map((cap, idx) => {
                          const IconComponent = cap.icon;
                          return (
                            <div 
                              key={idx}
                              draggable
                              onDragStart={(e) => {
                                setDraggedCapability(cap);
                                e.dataTransfer.effectAllowed = 'copy';
                              }}
                              style={{ 
                                backgroundColor: '#0f1419', 
                                border: '1px solid rgba(203, 253, 0, 0.1)', 
                                borderRadius: '0.375rem', 
                                padding: '0.75rem', 
                                cursor: 'grab',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#1a2530';
                                e.target.style.borderColor = 'rgba(203, 253, 0, 0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#0f1419';
                                e.target.style.borderColor = 'rgba(203, 253, 0, 0.1)';
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ backgroundColor: 'rgba(203, 253, 0, 0.2)', padding: '0.375rem', borderRadius: '0.375rem' }}>
                                  <IconComponent size={18} />
                                </div>
                                <div style={{ flex: 1 }}>
                                  <h5 style={{ fontWeight: 'bold', color: '#d1d5db', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{cap.name}</h5>
                                  <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{cap.provider}</p>
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main Diagram Area */}
            <div style={{ flex: 1, position: 'relative', backgroundColor: '#0f172a' }}>
              <div style={{ 
                position: 'relative', 
                width: '100%', 
                height: '100%', 
                backgroundColor: '#0f1419',
                overflow: 'hidden'
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedCapability) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  
                  // Create new custom slot at drop position
                  const newSlotId = `dropped-slot-${Date.now()}`;
                  const newSlot = {
                    id: newSlotId,
                    name: `${draggedCapability.name} Mount`,
                    type: draggedCapability.category,
                    x: Math.max(5, Math.min(95, x)),
                    y: Math.max(5, Math.min(95, y)),
                    category: 'Dropped Systems',
                    isCustom: true
                  };
                  setAvailableSlots(prev => [...prev, newSlot]);
                  
                  // Equip the capability to the new slot
                  setVesselConfiguration(prev => ({
                    ...prev,
                    [selectedHull.name]: {
                      ...prev[selectedHull.name],
                      [newSlotId]: draggedCapability
                    }
                  }));
                  
                  setDraggedCapability(null);
                }
              }}
              >
                {/* Technical drawing background grid */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundImage: `
                    linear-gradient(rgba(203, 253, 0, 0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(203, 253, 0, 0.05) 1px, transparent 1px)
                  `,
                  backgroundSize: '60px 60px',
                  opacity: 0.7
                }}
                />

                {/* Vessel Hull - Larger */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                  {vesselHullComponents[selectedHull.icon] && 
                    React.createElement(vesselHullComponents[selectedHull.icon], { size: 900 })
                  }
                </div>

                {/* TempestOS Core Platform - Central Hub (Full Screen) */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100px',
                    height: '100px',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(203, 253, 0, 0.9)',
                    border: '4px solid #cbfd00',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: '#000',
                    transition: 'all 0.2s',
                    zIndex: 15,
                    boxShadow: '0 0 30px rgba(203, 253, 0, 0.7), inset 0 0 30px rgba(203, 253, 0, 0.3)'
                  }}
                  title="TempestOS Core Platform - Central Processing Hub"
                >
                  <Settings size={50} />
                </div>

                {/* TempestOS Label (Full Screen) */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: 'calc(50% + 80px)',
                    transform: 'translateX(-50%)',
                    fontSize: '1.25rem',
                    color: '#cbfd00',
                    fontWeight: '700',
                    textAlign: 'center',
                    pointerEvents: 'none',
                    textShadow: '0 0 10px rgba(0,0,0,0.8)',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.75rem',
                    whiteSpace: 'nowrap',
                    zIndex: 5,
                    border: '3px solid rgba(203, 253, 0, 0.6)',
                    boxShadow: '0 0 15px rgba(203, 253, 0, 0.4)'
                  }}
                >
                  TempestOS CORE
                </div>

                {/* Connection Lines from Mount Points to TempestOS (Full Screen) */}
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
                  {vesselMountPoints[selectedHull.name] && Object.entries(vesselMountPoints[selectedHull.name]).map(([mountName, mount]) => {
                    const isEquipped = vesselConfiguration[selectedHull.name]?.[mountName];
                    return (
                      <line
                        key={`line-${mountName}`}
                        x1={`${mount.x}%`}
                        y1={`${mount.y}%`}
                        x2="50%"
                        y2="50%"
                        stroke={isEquipped ? '#4ade80' : 'rgba(203, 253, 0, 0.4)'}
                        strokeWidth={isEquipped ? "4" : "2"}
                        strokeDasharray={isEquipped ? "none" : "8,8"}
                        opacity={isEquipped ? "0.9" : "0.5"}
                      />
                    );
                  })}
                  {availableSlots.map((slot) => {
                    const position = slotPositions[slot.id] || { x: slot.x, y: slot.y };
                    const isEquipped = vesselConfiguration[selectedHull.name]?.[slot.id];
                    return (
                      <line
                        key={`line-${slot.id}`}
                        x1={`${position.x}%`}
                        y1={`${position.y}%`}
                        x2="50%"
                        y2="50%"
                        stroke={isEquipped ? '#4ade80' : 'rgba(203, 253, 0, 0.4)'}
                        strokeWidth={isEquipped ? "4" : "2"}
                        strokeDasharray={slot.isCustom ? "4,4" : (isEquipped ? "none" : "8,8")}
                        opacity={isEquipped ? "0.9" : "0.5"}
                      />
                    );
                  })}
                </svg>

                {/* Drop Zone Indicator */}
                {draggedCapability && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    color: '#cbfd00',
                    fontSize: '1.5rem',
                    pointerEvents: 'none',
                    backgroundColor: 'rgba(15, 20, 25, 0.9)',
                    padding: '2rem',
                    borderRadius: '1rem',
                    border: '2px dashed #cbfd00'
                  }}
                  >
                    <Target style={{ margin: '0 auto 1rem' }} size={48} />
                    <p>Drop {draggedCapability.name} anywhere on the vessel</p>
                  </div>
                )}

                {/* All Mount Points and Custom Slots - Larger Scale */}
                {vesselMountPoints[selectedHull.name] && Object.entries(vesselMountPoints[selectedHull.name]).map(([mountName, mount]) => {
                  const isEquipped = vesselConfiguration[selectedHull.name]?.[mountName];
                  const isSelected = selectedMountPoint === mountName;
                  const EquippedIcon = isEquipped?.icon;
                  
                  return (
                    <React.Fragment key={mountName}>
                      <div
                        onClick={() => setSelectedMountPoint(mountName)}
                        style={{
                          position: 'absolute',
                          left: `${mount.x}%`,
                          top: `${mount.y}%`,
                          transform: 'translate(-50%, -50%)',
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          backgroundColor: isEquipped ? '#4ade80' : isSelected ? '#cbfd00' : 'rgba(203, 253, 0, 0.3)',
                          border: isSelected ? '4px solid #cbfd00' : '3px solid rgba(203, 253, 0, 0.5)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          color: isEquipped || isSelected ? '#000' : '#cbfd00',
                          transition: 'all 0.2s',
                          zIndex: 10,
                          boxShadow: isSelected ? '0 0 0 6px rgba(203, 253, 0, 0.3)' : isEquipped ? '0 0 0 3px rgba(74, 222, 128, 0.5)' : 'none'
                        }}
                        title={mountName}
                      >
                        {isEquipped && EquippedIcon ? <EquippedIcon size={36} /> : (isEquipped ? '✓' : '+')}
                      </div>
                      
                      <div
                        style={{
                          position: 'absolute',
                          left: `${mount.x}%`,
                          top: `${mount.y + 10}%`,
                          transform: 'translateX(-50%)',
                          fontSize: '1rem',
                          color: '#cbfd00',
                          fontWeight: '600',
                          textAlign: 'center',
                          pointerEvents: 'none',
                          textShadow: '0 0 6px rgba(0,0,0,0.8)',
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '0.5rem',
                          whiteSpace: 'nowrap',
                          zIndex: 5
                        }}
                      >
                        {mountName}
                      </div>
                    </React.Fragment>
                  );
                })}

                {/* Custom Slots - Full Screen */}
                {availableSlots.map((slot) => {
                  const position = slotPositions[slot.id] || { x: slot.x, y: slot.y };
                  const isEquipped = vesselConfiguration[selectedHull.name]?.[slot.id];
                  const isSelected = selectedMountPoint === slot.id;
                  const EquippedIcon = isEquipped?.icon;
                  
                  return (
                    <React.Fragment key={slot.id}>
                      <div
                        onClick={() => setSelectedMountPoint(slot.id)}
                        draggable
                        onDragEnd={(e) => {
                          const rect = e.target.parentElement.getBoundingClientRect();
                          const x = ((e.clientX - rect.left) / rect.width) * 100;
                          const y = ((e.clientY - rect.top) / rect.height) * 100;
                          updateSlotPosition(slot.id, Math.max(5, Math.min(95, x)), Math.max(5, Math.min(95, y)));
                        }}
                        style={{
                          position: 'absolute',
                          left: `${position.x}%`,
                          top: `${position.y}%`,
                          transform: 'translate(-50%, -50%)',
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          backgroundColor: isEquipped ? '#4ade80' : isSelected ? '#cbfd00' : 'rgba(203, 253, 0, 0.3)',
                          border: slot.isCustom ? '3px dashed rgba(203, 253, 0, 0.8)' : '3px solid rgba(203, 253, 0, 0.5)',
                          cursor: 'move',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          color: isEquipped || isSelected ? '#000' : '#cbfd00',
                          transition: 'all 0.2s',
                          zIndex: 10,
                          boxShadow: isSelected ? '0 0 0 6px rgba(203, 253, 0, 0.3)' : isEquipped ? '0 0 0 3px rgba(74, 222, 128, 0.5)' : 'none'
                        }}
                        title={`${slot.name} (Drag to move)`}
                      >
                        {isEquipped && EquippedIcon ? <EquippedIcon size={36} /> : (isEquipped ? '✓' : '+')}
                        <Move 
                          size={16} 
                          style={{ 
                            position: 'absolute', 
                            bottom: '-4px', 
                            right: '-4px', 
                            color: '#cbfd00',
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            borderRadius: '50%',
                            padding: '2px'
                          }} 
                        />
                      </div>
                      
                      <div
                        style={{
                          position: 'absolute',
                          left: `${position.x}%`,
                          top: `${position.y + 10}%`,
                          transform: 'translateX(-50%)',
                          fontSize: '1rem',
                          color: '#cbfd00',
                          fontWeight: '600',
                          textAlign: 'center',
                          pointerEvents: 'none',
                          textShadow: '0 0 6px rgba(0,0,0,0.8)',
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '0.5rem',
                          whiteSpace: 'nowrap',
                          zIndex: 5,
                          border: '1px dashed rgba(203, 253, 0, 0.5)'
                        }}
                      >
                        {slot.name}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Capability Details Modal */}
      {selectedCapabilityDetails && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}
        onClick={() => setSelectedCapabilityDetails(null)}
        >
          <div style={{
            backgroundColor: '#1a2530',
            borderRadius: '0.75rem',
            maxWidth: '900px',
            maxHeight: '90vh',
            width: '100%',
            overflow: 'hidden',
            position: 'relative',
            border: '1px solid rgba(203, 253, 0, 0.3)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Close Button */}
            <div style={{
              position: 'sticky',
              top: 0,
              backgroundColor: '#0f1419',
              padding: '1.5rem',
              borderBottom: '1px solid rgba(203, 253, 0, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 1001
            }}
            >
              <h2 style={{
                color: '#cbfd00',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                margin: 0
              }}
              >
                {selectedCapabilityDetails.name}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Category Badge */}
                <div style={{
                  backgroundColor: 'rgba(203, 253, 0, 0.2)',
                  color: '#cbfd00',
                  padding: '0.375rem 0.875rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}
                >
                  {selectedCapabilityDetails.category}
                </div>
                {/* TRL Badge */}
                <div style={{
                  backgroundColor: selectedCapabilityDetails.trl === 'TRL 9' ? 'rgba(34, 197, 94, 0.2)' : 
                                  selectedCapabilityDetails.trl === 'TRL 7' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                  color: selectedCapabilityDetails.trl === 'TRL 9' ? '#4ade80' : 
                         selectedCapabilityDetails.trl === 'TRL 7' ? '#fbbf24' : '#60a5fa',
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
                >
                  {selectedCapabilityDetails.trl}
                </div>
                <button
                  onClick={() => setSelectedCapabilityDetails(null)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: '0.375rem'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#cbfd00'}
                  onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div style={{
              padding: '0',
              maxHeight: 'calc(90vh - 80px)',
              overflowY: 'auto'
            }}
            >
              {/* Company Header Section */}
              <div style={{
                background: 'linear-gradient(135deg, #0f1419 0%, #1a2530 100%)',
                padding: '2rem',
                borderBottom: '1px solid rgba(203, 253, 0, 0.1)'
              }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  marginBottom: '1rem'
                }}
                >
                  {/* Company Logo Placeholder */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '120px',
                    height: '60px',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    color: '#1a2530'
                  }}
                  >
                    {selectedCapabilityDetails.provider.toUpperCase()}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      color: '#9ca3af',
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      margin: '0 0 0.5rem 0'
                    }}
                    >
                      {selectedCapabilityDetails.provider}
                    </h3>
                    <p style={{
                      color: '#9ca3af',
                      fontSize: '0.875rem',
                      margin: 0
                    }}
                    >
                      {selectedCapabilityDetails.type}
                    </p>
                  </div>

                </div>

                {/* Security Indicators */}
                {selectedCapabilityDetails.securityLevel && (
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap'
                  }}
                  >
                    {selectedCapabilityDetails.securityLevel.map(level => (
                      <div key={level} style={{
                        backgroundColor: 'rgba(203, 253, 0, 0.1)',
                        color: '#cbfd00',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        border: '1px solid rgba(203, 253, 0, 0.3)'
                      }}
                      >
                        {level}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Documents Downloads Section */}
              {selectedCapabilityDetails.documents && selectedCapabilityDetails.documents.length > 0 && (
                <div style={{
                  backgroundColor: '#0f1419',
                  padding: '1.5rem 2rem',
                  borderBottom: '1px solid rgba(203, 253, 0, 0.1)'
                }}
                >
                  <h4 style={{
                    color: '#cbfd00',
                    fontSize: '1.125rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  >
                    <Download size={20} />
                    Technical Documentation
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1rem'
                  }}
                  >
                    {selectedCapabilityDetails.documents.map((doc, idx) => (
                      <div key={idx} style={{
                        backgroundColor: '#1a2530',
                        border: '1px solid rgba(203, 253, 0, 0.2)',
                        borderRadius: '0.5rem',
                        padding: '1rem',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#cbfd00';
                        e.currentTarget.style.backgroundColor = '#1f2937';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(203, 253, 0, 0.2)';
                        e.currentTarget.style.backgroundColor = '#1a2530';
                      }}
                      onClick={() => window.open(doc.url, '_blank')}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '1rem'
                        }}
                        >
                          {/* File Icon */}
                          <div style={{
                            backgroundColor: 'rgba(203, 253, 0, 0.1)',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            flexShrink: 0
                          }}
                          >
                            {doc.type === 'PDF' ? (
                              <FileText size={24} style={{ color: '#ef4444' }} />
                            ) : (
                              <File size={24} style={{ color: '#cbfd00' }} />
                            )}
                          </div>
                          
                          {/* Document Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h5 style={{
                              color: '#ffffff',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              marginBottom: '0.25rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            >
                              {doc.name}
                            </h5>
                            <p style={{
                              color: '#9ca3af',
                              fontSize: '0.75rem',
                              marginBottom: '0.5rem',
                              lineHeight: '1.4'
                            }}
                            >
                              {doc.description}
                            </p>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                            >
                              <span style={{
                                color: '#cbfd00',
                                fontSize: '0.75rem',
                                fontWeight: '500'
                              }}
                              >
                                {doc.type} • {doc.size}
                              </span>
                              <div style={{
                                color: '#9ca3af',
                                fontSize: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                              >
                                <Download size={14} />
                                Download
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hero Image/Banner */}
              <div style={{
                height: '300px',
                backgroundColor: '#0f1419',
                background: selectedCapabilityDetails.bannerImage 
                  ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${selectedCapabilityDetails.bannerImage})`
                  : 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: '1px solid rgba(203, 253, 0, 0.1)'
              }}
              >
                <div style={{
                  position: 'relative',
                  zIndex: 1,
                  textAlign: 'center',
                  color: 'white'
                }}
                >
                  <h3 style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    margin: '0 0 1rem 0',
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                  }}
                  >
                    {selectedCapabilityDetails.name}
                  </h3>
                  <p style={{
                    fontSize: '1.125rem',
                    margin: 0,
                    opacity: 0.9,
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                  }}
                  >
                    {selectedCapabilityDetails.description}
                  </p>
                </div>
              </div>

              {/* Content Sections */}
              <div style={{ padding: '2rem' }}>
                
                {/* Rich Description Section */}
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{
                    color: '#cbfd00',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem'
                  }}
                  >
                    Overview
                  </h4>
                  <p style={{
                    color: '#d1d5db',
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    marginBottom: '1rem'
                  }}
                  >
                    {selectedCapabilityDetails.description}
                  </p>
                  
                  {/* Capabilities List */}
                  {selectedCapabilityDetails.capabilities && (
                    <div>
                      <h5 style={{
                        color: '#ffffff',
                        fontSize: '1rem',
                        fontWeight: '600',
                        marginBottom: '0.75rem'
                      }}
                      >
                        Key Capabilities
                      </h5>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '0.5rem'
                      }}
                      >
                        {selectedCapabilityDetails.capabilities.map((cap, idx) => (
                          <div key={idx} style={{
                            backgroundColor: 'rgba(203, 253, 0, 0.1)',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: '1px solid rgba(203, 253, 0, 0.2)'
                          }}
                          >
                            <span style={{
                              color: '#cbfd00',
                              fontSize: '0.875rem',
                              fontWeight: '500'
                            }}
                            >
                              {cap}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Technical Specifications */}
                {selectedCapabilityDetails.specs && (
                  <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{
                      color: '#cbfd00',
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      marginBottom: '1rem'
                    }}
                    >
                      Technical Specifications
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: '1rem'
                    }}
                    >
                      {Object.entries(selectedCapabilityDetails.specs).map(([key, value]) => (
                        <div key={key} style={{
                          backgroundColor: '#0f1419',
                          padding: '1rem',
                          borderRadius: '0.5rem',
                          border: '1px solid rgba(203, 253, 0, 0.2)'
                        }}
                        >
                          <div style={{
                            color: '#cbfd00',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            marginBottom: '0.5rem',
                            textTransform: 'capitalize'
                          }}
                          >
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                          <div style={{
                            color: '#d1d5db',
                            fontSize: '0.875rem'
                          }}
                          >
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(203, 253, 0, 0.1)'
                }}
                >
                  <button
                    onClick={() => {
                      addToCart(selectedCapabilityDetails);
                      setSelectedCapabilityDetails(null);
                    }}
                    style={{
                      backgroundColor: '#cbfd00',
                      color: '#000',
                      border: 'none',
                      padding: '1rem 2rem',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      justifyContent: 'center'
                    }}
                  >
                    <ShoppingCart size={20} />
                    Add to Hull
                  </button>
                  <button
                    onClick={() => setSelectedCapabilityDetails(null)}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#9ca3af',
                      border: '1px solid #4b5563',
                      padding: '1rem 2rem',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;