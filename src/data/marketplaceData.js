// marketplace data - extracted from MarketplacePage component
import {
  Shield,
  Lock,
  Satellite,
  Radio,
  Target,
  MessageSquare,
  MessageCircle,
  Eye,
  Brain,
  Anchor,
  Radar,
  Signal,
  Waves,
  Settings,
  Network,
  Ship,
  Ban,
  Users,
  Zap,
  ShieldCheck,
  Compass,
  Cpu
} from 'lucide-react';
import {
  NGHTSIcon,
  ScionESMIcon,
  HiddenLevelRadarIcon,
  TowedSonarIcon,
  SM6MissileIcon,
  HighEnergyLaserIcon,
  CameraIcon,
  GPSIcon,
  BatteryIcon,
  AntennaIcon,
  MotorIcon,
  FrameIcon,
  FlightControllerIcon,
  InfraredIcon,
  StabilizerIcon,
  DownwardSensorIcon
} from '../components/MilitaryIcons';

export const engineeringStacks = [
  // Multi-Vendor Engineering Stacks
  {
    name: "Swarm Coordination System",
    provider: "Anduril + Caliburn + MythosAI + IBM + Caliola",
    description: "Coordinate dozens of autonomous platforms for distributed maritime operations with zero-trust mesh networking and adaptive AI learning",
    capabilityRefs: ["TempestOS Core Platform", "Hidden Level Passive Radar", "Scion ESM Suite", "IBM Watson Orchestrate", "OverKey Mesh VPN"],
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
    integration: "The Swarm Coordination System uses TempestOS as the foundational platform for coordinating diverse autonomous systems. Hidden Level passive radar provides airspace deconfliction while Scion ESM enables secure drone communications. OverKey Mesh VPN provides zero-trust networking that maintains secure swarm communications even in DDIL environments. IBM Watson Orchestrate provides adaptive AI learning, enabling swarms to optimize tactics and coordination patterns in real-time.",
    components: ["Anduril Lattice C2", "MythosAI Navigation Suite", "Caliola OverKey Mesh VPN", "IBM Watson Orchestrate AI", "Distributed Decision Engine"],
    missionTags: ["Swarm Orchestration", "Autonomous Navigation", "Sea Denial"]
  },

  {
    name: "Guardian AI Targeting Package",
    provider: "Marine AI + Northrop Grumman",
    description: "De-duplicate sensor views to establish relative position, manage contacts into Positive ID, and paint targets",
    capabilityRefs: ["NGHTS Laser Targeting System", "Hidden Level Passive Radar"],
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

export const individualCapabilities = [
    {
      name: "TempestOS Core Platform",
      provider: "Caliburn",
      type: "Operating System",
      platformTypes: ["USV", "UUV", "Ship"],
      description: "The only maritime operating system built on Boot-C with a read-only file system for maximum security. Based on AlmaLinux, TempestOS is a lightweight drop-in replacement for RedHat systems with native containerization support.",
      capabilities: [
        "Boot-C Read-Only File System",
        "NMEA Protocol Translation",
        "Riptide Data Protocol",
        "Kubernetes & Podman Native",
        "KVM Virtualization",
        "Zero Trust Architecture"
      ],
      trl: "TRL 9",
      icon: Settings,
      category: "COMMAND & CONTROL",
      // SWaP (Size, Weight, Power) - Software only, runs on existing compute
      swap: {
        weight: 0,        // Software - no additional hardware
        power: 0.1,       // kW - minimal compute overhead
        size: "small"
      },
      statImpacts: {
        speed: 0,
        power: -1,        // Minimal power draw
        weight: 0,
        range: 0,
        stealth: 2        // Security features improve signature management
      },
      securityLevel: ["Boot-C Hardened", "Zero Trust Architecture", "STIG Compliant"],
      securityIcons: ["encrypted", "hardened"],
      specs: {
        base: "AlmaLinux (RHEL drop-in)",
        filesystem: "Boot-C read-only",
        containerization: "Kubernetes, KVM, Podman",
        protocols: "NMEA, JSON MQTT, Riptide",
        weight: "Lighter than Ubuntu 24",
        integration: "RedHat compatible"
      },
      detailedDescription: "TempestOS is the only maritime operating system built on Boot-C architecture with a read-only file system—a critical security differentiator from competitors using un-STIG'd RHEL deployments. Based on AlmaLinux, it provides a lightweight, drop-in replacement for any RedHat system while being significantly lighter than Ubuntu 24.\n\nThe platform includes Kubernetes, KVM, and Podman containerization tools in the base image, enabling rapid deployment of mission applications without additional configuration. This native container support powers the Mission Bay ecosystem, allowing capabilities like NSYTE to run as isolated workloads.\n\nTempestOS introduces 'Riptide,' a custom protobuf data structure that makes legacy NMEA strings developer-friendly. The system translates maritime sensor data (GPS, heading, track) from raw NMEA sentences into structured Riptide format, enabling modern software integration with legacy naval systems.",
      protocolSupport: {
        nmea: ["GGA (GPS)", "VTG (True Track)", "HDG (Heading)", "RMC (Recommended Minimum)"],
        riptide: "Custom protobuf structure for coder-friendly NMEA translation",
        mqtt: "JSON MQTT bidirectional translation to/from Riptide",
        interop: "Can translate incoming sensor data to NMEA output (e.g., Scion → Riptide → NMEA)"
      },
      keyFeatures: [
        "Only Boot-C based maritime OS with read-only file system",
        "AlmaLinux base—drop-in replacement for any RedHat system",
        "Lighter footprint than Ubuntu 24",
        "Native Kubernetes, KVM, and Podman containerization",
        "Riptide protocol translates legacy NMEA to modern data structures",
        "Bidirectional JSON MQTT ↔ NMEA translation capability",
        "Pre-STIG'd security configuration vs competitor post-deployment hardening"
      ],
      integrationNotes: "TempestOS serves as the foundation for all Mission Bay capabilities. Third-party systems like NSYTE run as containerized workloads, leveraging TempestOS security authorization. The Riptide protocol enables seamless integration between legacy naval sensors (NMEA) and modern JSON-based systems like Scion ESM.",
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
        },
        {
          name: "Riptide Protocol Specification",
          type: "PDF",
          size: "0.8 MB",
          description: "NMEA-to-Riptide translation reference",
          url: "#"
        }
      ],
      bannerImage: "https://images.unsplash.com/photo-1551808525-51a94da548ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"
    },
    {
      name: "NSYTE AI Maintenance System",
      provider: "Fathom5",
      type: "Maintenance System",
      description: "Real-time AI-powered condition-based maintenance processing 10,000+ sensor readings per second. Navy's official CBM+ Program of Record, deployed on USS Fitzgerald and expanding fleet-wide.",
      capabilities: [
        "Real-time Equipment Monitoring",
        "Predictive Failure Analytics",
        "Digital Twin Modeling",
        "Navy PMS SKED Integration",
        "OMMS-NG Connectivity",
        "Quarterly Software Updates"
      ],
      trl: "TRL 9",
      icon: Settings,
      category: "LOGISTICS",
      swap: {
        weight: 15,       // Server rack unit
        power: 0.8,       // kW - compute intensive
        size: "small"
      },
      statImpacts: {
        speed: 0,
        power: -2,
        weight: 1,
        range: 3,         // Better maintenance = better range
        stealth: 0
      },
      securityLevel: ["DDIL Capable", "MOSA Compliant", "Navy Program of Record"],
      securityIcons: ["ddil", "mosa"],
      specs: {
        processing: "10,000+ readings/second",
        architecture: "Containerized microservices",
        analytics: "Python ML + digital twins",
        updates: "Quarterly (4x/year)",
        integration: "OMMS-NG, PMS SKED, NMRO",
        deployment: "USS Fitzgerald + DDG-51 class"
      },
      detailedDescription: "NSYTE is the U.S. Navy's first AI-enabled maintenance system deployed on warships, representing the official Program of Record for Condition-Based Maintenance Plus (CBM+). The system processes over 10,000 sensor readings per second using microservices architecture and Python ML models to predict equipment failures before they occur.\n\nDeployed aboard USS Fitzgerald (DDG-62) in early 2025, NSYTE replaces legacy ICAS systems from the 1990s with modern containerized analytics. The platform integrates directly with Navy systems including OMMS-NG and PMS SKED, enabling crews to order replacement parts before failures occur at sea.\n\nNSYTE operates as part of the eRM v4 (Enterprise Remote Monitoring version 4) architecture, providing quarterly software updates versus traditional multi-year refresh cycles. Integration with TempestOS enables rapid deployment across new vessel classes including the FFG-62 Constellation-class frigates.",
      deploymentStatus: {
        current: "USS Fitzgerald (DDG-62) + DDG-51 class vessels",
        year2025: "4 additional deployments planned",
        year2026: "Scale to 12+ ships/year",
        future: "FFG-62 Constellation-class integration"
      },
      keyFeatures: [
        "Processes 10,000+ sensor readings per second in real-time",
        "ML-driven predictive analytics prevent equipment failures at sea",
        "Direct integration with Navy PMS SKED for automated maintenance scheduling",
        "Containerized architecture enables third-party algorithm providers",
        "Quarterly update cycles vs traditional multi-year refresh patterns",
        "Proven deployment on operational Navy warships"
      ],
      integrationNotes: "NSYTE runs as containerized workload on TempestOS, leveraging existing security authorization rather than requiring separate 2+ year ATO process. Third-party analytics providers can contribute algorithms as containers while preserving proprietary IP through microservices architecture."
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
      swap: {
        weight: 8,        // Compact targeting system
        power: 0.15,      // kW
        size: "small"
      },
      statImpacts: {
        speed: 0,
        power: -1,
        weight: 1,
        range: 0,
        stealth: -2       // Laser emissions detectable
      },
      bannerImage: "https://cdn.northropgrumman.com/-/media/NEWS/Imports/Northrop-Grumman-to-Manufacture-US-Marine-Corps-Next-Generation-Handheld-Targeting-System_hero.jpg"
    },
    {
      name: "Scion ESM Suite",
      provider: "Northrop Grumman",
      type: "Electronic Warfare",
      platformTypes: ["USV", "Ship"],
      missionTags: ["SEA_DENIAL", "RECONNAISSANCE", "ROBOT_DEFENSE_OODA"],
      description: "Advanced electronic support measures for signal intelligence and threat detection with S-Band and X-Band RF detection capabilities.",
      capabilities: ["Signal Intercept", "Direction Finding", "Threat Classification", "RF Detection", "Maritime Surveillance"],
      trl: "TRL 9",
      icon: ScionESMIcon,
      category: "ELECTRONIC SUPPORT",
      // Real SWaP data from specs
      swap: {
        weight: 57,       // 102.4 + 12.2 + 10.8 lbs = 125.4 lbs = 57 kg total
        power: 0.5,       // 500W max = 0.5 kW
        size: "medium"
      },
      statImpacts: {
        speed: -1,
        power: -4,
        weight: 3,
        range: -2,
        stealth: 5        // Passive detection improves situational awareness
      },
      securityLevel: ["NSA-Approved Crypto", "End-to-End Encrypted"],
      securityIcons: ["nsa", "encrypted"],
      specs: {
        rackSize: "18\" H x 29.5\" W x 28.75\" D",
        rackWeight: "102.4 lbs",
        antennaSize: "5\" H x 14\" W x 12\" D",
        antennaWeight: "12.2 lbs",
        cabling: "32' x 4 cables; 10.8 lbs",
        powerAC: "115 VAC (500W Max, 360W Nominal)",
        powerDC: "24 VDC (324W Max, 226W Nominal)",
        radioFrequency: "S-Band (2-4 GHz), X-Band (8-12 GHz)",
        detectionRange: "8 NM observed"
      }
    },
    {
      name: "Hidden Level Passive Radar",
      provider: "Lockheed Martin",
      type: "Radar System",
      description: "Advanced electronically scanned array radar for air and missile defense.",
      capabilities: ["Air Surveillance", "Missile Tracking", "Multi-Target Tracking"],
      trl: "TRL 9",
      icon: HiddenLevelRadarIcon,
      category: "RADAR/RF",
      swap: {
        weight: 75,       // Radar array and electronics
        power: 1.5,       // kW - active radar draws significant power
        size: "medium"
      },
      statImpacts: {
        speed: -1,
        power: -8,
        weight: 4,
        range: -3,
        stealth: -15      // Active radar = significant emissions
      }
    },
    {
      name: "Advanced Towed Sonar",
      provider: "General Dynamics",
      type: "Sonar System",
      platformTypes: ["USV", "UUV", "Ship"],
      missionTags: ["SEA_DENIAL", "ASW", "RECONNAISSANCE"],
      description: "Long-range passive sonar system for submarine detection and tracking.",
      capabilities: ["Submarine Detection", "Acoustic Analysis", "Long-Range Tracking"],
      trl: "TRL 9",
      icon: TowedSonarIcon,
      category: "ACOUSTIC/SONAR",
      swap: {
        weight: 200,      // Towed array + winch system
        power: 1.0,       // kW
        size: "large"
      },
      statImpacts: {
        speed: -5,        // Towed array limits speed
        power: -5,
        weight: 8,
        range: -5,
        stealth: 3        // Passive sonar, low emissions
      }
    },
    {
      name: "SM-6 Missile System",
      provider: "Raytheon",
      type: "Missile Defense",
      description: "Multi-mission surface-to-air missile for air and ballistic missile defense.",
      capabilities: ["Air Defense", "Ballistic Missile Defense", "Anti-Ship"],
      trl: "TRL 9",
      icon: SM6MissileIcon,
      category: "KINETIC WEAPONS",
      swap: {
        weight: 1500,     // Per missile + launcher
        power: 2.0,       // kW - fire control
        size: "xlarge"
      },
      statImpacts: {
        speed: -3,
        power: -6,
        weight: 15,
        range: -8,
        stealth: -5
      }
    },
    {
      name: "High-Energy Laser Weapon",
      provider: "Boeing",
      type: "Directed Energy",
      description: "Solid-state laser system for precision engagement of threats.",
      capabilities: ["UAV Defense", "Missile Defense", "Precision Strike"],
      trl: "TRL 7",
      icon: HighEnergyLaserIcon,
      category: "DIRECTED ENERGY",
      swap: {
        weight: 500,      // Laser + cooling + power systems
        power: 50,        // kW - very power intensive
        size: "large"
      },
      statImpacts: {
        speed: -2,
        power: -25,       // Major power consumer
        weight: 10,
        range: -15,       // Power diverted from propulsion
        stealth: -3
      }
    },
    {
      name: "Cryptographic Communications Module",
      provider: "Caliola Engineering",
      type: "Communications Security",
      description: "Advanced cryptographic solutions for securing mission-critical military communications.",
      capabilities: ["Advanced Cryptography", "Key Management", "Secure Protocols"],
      trl: "TRL 9",
      icon: ScionESMIcon,
      category: "RF COMMUNICATIONS",
      swap: {
        weight: 5,
        power: 0.1,
        size: "small"
      },
      statImpacts: {
        speed: 0,
        power: -1,
        weight: 0,
        range: 0,
        stealth: 3        // Encrypted comms harder to intercept
      }
    },
    {
      name: "MILSATCOM Terminal",
      provider: "Caliola Engineering",
      type: "Satellite Communications",
      description: "Protected military satellite communications terminal with automated configuration.",
      capabilities: ["Protected SATCOM", "Auto-Configuration", "Secure Links"],
      trl: "TRL 9",
      icon: HiddenLevelRadarIcon,
      category: "SATCOM",
      swap: {
        weight: 25,
        power: 0.4,
        size: "small"
      },
      statImpacts: {
        speed: 0,
        power: -3,
        weight: 2,
        range: 0,
        stealth: -5       // Satellite uplink emissions
      }
    },
    {
      name: "Unmanned Systems Communications Package",
      provider: "Caliola Engineering",
      type: "UAV Communications",
      description: "Specialized communications systems for unmanned airborne platforms and control.",
      capabilities: ["UAV Datalinks", "Autonomous Comms", "Remote Control"],
      trl: "TRL 9",
      icon: NGHTSIcon,
      category: "RF COMMUNICATIONS",
      swap: {
        weight: 15,
        power: 0.3,
        size: "small"
      },
      statImpacts: {
        speed: 0,
        power: -2,
        weight: 1,
        range: 0,
        stealth: -3       // RF emissions
      }
    },
    {
      name: "Programmable Automation Controller",
      provider: "Rockwell Automation",
      type: "Industrial Control",
      description: "Military-grade programmable automation controller for shipboard and facility machinery systems.",
      capabilities: ["Logix Platform", "Real-time Control", "System Integration"],
      trl: "TRL 9",
      icon: Settings,
      category: "COMMAND & CONTROL",
      swap: {
        weight: 10,
        power: 0.2,
        size: "small"
      },
      statImpacts: {
        speed: 1,         // Better automation = efficiency
        power: -1,
        weight: 1,
        range: 2,
        stealth: 0
      }
    },
    {
      name: "Arena Military Simulation Platform",
      provider: "Rockwell Automation",
      type: "Mission Planning",
      description: "Advanced simulation software for military planning, operations analysis, and scenario modeling.",
      capabilities: ["Discrete Event Simulation", "What-If Analysis", "Operations Planning"],
      trl: "TRL 9",
      icon: FlightControllerIcon,
      category: "COMMAND & CONTROL",
      swap: {
        weight: 0,        // Software only
        power: 0.3,
        size: "small"
      },
      statImpacts: {
        speed: 0,
        power: -1,
        weight: 0,
        range: 0,
        stealth: 0
      }
    },
    {
      name: "Lattice Mesh Network",
      provider: "Anduril",
      type: "AI Command System",
      description: "Distributed AI mesh network that provides real-time autonomous coordination across multiple platforms and domains.",
      capabilities: ["Mesh Networking", "AI Coordination", "Real-time Processing"],
      trl: "TRL 9",
      icon: AntennaIcon,
      category: "COMMAND & CONTROL",
      swap: {
        weight: 20,
        power: 0.5,
        size: "small"
      },
      statImpacts: {
        speed: 0,
        power: -3,
        weight: 1,
        range: 0,
        stealth: -4       // Mesh network emissions
      }
    },
    {
      name: "Marine AI Navigation System",
      provider: "Marine AI",
      type: "Autonomous Navigation",
      platformTypes: ["USV", "UUV"],
      missionTags: ["SEA_DENIAL", "SURVEY", "MCM", "ASW", "RECONNAISSANCE", "ESCORT", "CONTESTED_LOGISTICS"],
      description: "Intelligent maritime navigation system with AI-powered decision making for autonomous vessel operations.",
      capabilities: ["AI Navigation", "Autonomous Operations", "Maritime Intelligence"],
      trl: "TRL 9",
      icon: GPSIcon,
      category: "UNMANNED SYSTEMS",
      swap: {
        weight: 8,
        power: 0.3,
        size: "small"
      },
      statImpacts: {
        speed: 3,         // AI optimizes routes
        power: -2,
        weight: 1,
        range: 5,         // Efficient navigation
        stealth: 2        // Smart routing avoids detection
      }
    },
    {
      name: "Advanced EO/IR Camera System",
      provider: "FLIR Systems",
      type: "Optical Sensor",
      platformTypes: ["USV", "UUV", "UAV", "Ship"],
      missionTags: ["RECONNAISSANCE", "SEA_DENIAL", "ESCORT", "MCM"],
      description: "High-resolution electro-optical and infrared imaging system for surveillance and target identification.",
      capabilities: ["HD Video", "Thermal Imaging", "Target Tracking", "Day/Night Vision"],
      trl: "TRL 9",
      icon: CameraIcon,
      category: "EO/IR SENSORS",
      swap: {
        weight: 12,
        power: 0.15,
        size: "small"
      },
      statImpacts: {
        speed: 0,
        power: -1,
        weight: 1,
        range: 0,
        stealth: 0        // Passive sensor
      }
    },
    {
      name: "Military-Grade GPS Module",
      provider: "Trimble",
      type: "Navigation System",
      description: "Precision GPS receiver with anti-jamming capabilities for accurate positioning in contested environments.",
      capabilities: ["Precision GPS", "Anti-Jamming", "SAASM Compatible", "Real-time Positioning"],
      trl: "TRL 9",
      icon: GPSIcon,
      category: "NAVIGATION",
      swap: {
        weight: 2,
        power: 0.05,
        size: "small"
      },
      statImpacts: {
        speed: 1,
        power: 0,
        weight: 0,
        range: 2,
        stealth: 0
      }
    },
    {
      name: "High-Capacity Power Management System",
      provider: "SWaP Technologies",
      type: "Power System",
      description: "Advanced battery management and power distribution system for extended mission operations.",
      capabilities: ["Li-Ion Batteries", "Smart Charging", "Power Distribution", "Monitoring"],
      trl: "TRL 9",
      icon: BatteryIcon,
      category: "NAVIGATION",
      swap: {
        weight: 50,
        power: -5,        // Negative = provides power
        size: "medium"
      },
      statImpacts: {
        speed: -2,        // Heavy batteries
        power: 15,        // Adds power capacity
        weight: 5,
        range: 10,        // Extended range
        stealth: 0
      }
    },
    {
      name: "Multi-Band Communications Array",
      provider: "Harris Corporation",
      type: "Communications",
      description: "Software-defined radio antenna system supporting multiple frequency bands and protocols.",
      capabilities: ["Multi-Band Radio", "Software Defined", "Secure Comms", "Link-16 Compatible"],
      trl: "TRL 9",
      icon: AntennaIcon,
      category: "RF COMMUNICATIONS",
      swap: {
        weight: 30,
        power: 0.5,
        size: "medium"
      },
      statImpacts: {
        speed: 0,
        power: -4,
        weight: 2,
        range: 0,
        stealth: -6       // RF emissions
      }
    },
    {
      name: "Brushless Motor Assembly",
      provider: "MaxonMotor",
      type: "Propulsion",
      description: "High-efficiency brushless motor system for propeller-driven unmanned platforms.",
      capabilities: ["Brushless Design", "High Efficiency", "Variable Speed", "Quiet Operation"],
      trl: "TRL 9",
      icon: MotorIcon,
      category: "UNMANNED SYSTEMS",
      swap: {
        weight: 8,
        power: 0.8,
        size: "small"
      },
      statImpacts: {
        speed: 5,         // Better propulsion
        power: -5,
        weight: 1,
        range: 3,         // Efficient motor
        stealth: 2        // Quiet operation
      }
    },
    {
      name: "Carbon Fiber Frame System",
      provider: "Composite Structures",
      type: "Platform Structure",
      description: "Lightweight carbon fiber frame assembly providing structural integrity for small unmanned platforms.",
      capabilities: ["Carbon Fiber", "Lightweight", "High Strength", "Modular Design"],
      trl: "TRL 9",
      icon: FrameIcon,
      category: "UNMANNED SYSTEMS",
      swap: {
        weight: -5,       // Negative = reduces weight
        power: 0,
        size: "medium"
      },
      statImpacts: {
        speed: 3,         // Lighter = faster
        power: 0,
        weight: -5,       // Reduces weight
        range: 4,         // Less weight = more range
        stealth: 0
      }
    },
    {
      name: "Multi-Axis Gimbal Stabilizer",
      provider: "DJI Enterprise",
      type: "Stabilization System",
      description: "Precision gimbal system for camera stabilization and target tracking on moving platforms.",
      capabilities: ["3-Axis Stabilization", "Target Tracking", "Precision Control", "Anti-Vibration"],
      trl: "TRL 9",
      icon: StabilizerIcon,
      category: "EO/IR SENSORS",
      swap: {
        weight: 5,
        power: 0.1,
        size: "small"
      },
      statImpacts: {
        speed: 0,
        power: -1,
        weight: 0,
        range: 0,
        stealth: 0
      }
    },
    {
      name: "Infrared Thermal Sensor",
      provider: "FLIR Systems",
      type: "Thermal Imaging",
      description: "High-sensitivity infrared sensor for thermal detection and night vision capabilities.",
      capabilities: ["Thermal Imaging", "Temperature Detection", "Night Vision", "Heat Signature"],
      trl: "TRL 9",
      icon: InfraredIcon,
      category: "EO/IR SENSORS",
      swap: {
        weight: 3,
        power: 0.08,
        size: "small"
      },
      statImpacts: {
        speed: 0,
        power: -1,
        weight: 0,
        range: 0,
        stealth: 0        // Passive sensor
      }
    },
    {
      name: "Proximity Sensor Array",
      provider: "LiDAR Corp",
      type: "Collision Avoidance",
      description: "Multi-directional proximity sensor system for autonomous collision avoidance and navigation.",
      capabilities: ["LiDAR", "Collision Avoidance", "Distance Measurement", "360° Coverage"],
      trl: "TRL 9",
      icon: DownwardSensorIcon,
      category: "NAVIGATION",
      swap: {
        weight: 4,
        power: 0.2,
        size: "small"
      },
      statImpacts: {
        speed: 0,
        power: -1,
        weight: 0,
        range: 0,
        stealth: -2       // Active sensor emissions
      }
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
      swap: {
        weight: 10,
        power: 1.0,       // AI compute intensive
        size: "small"
      },
      statImpacts: {
        speed: 2,         // AI optimizes operations
        power: -5,
        weight: 1,
        range: 3,
        stealth: 1
      },
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
      name: "NG InSight EA System",
      provider: "Northrop Grumman",
      type: "Electronic Attack Platform",
      description: "Next generation connectivity, processing and distributed effects system providing multi-level secure data sharing and JADC2 integration.",
      capabilities: ["Signal Intercept", "Network Connectivity", "Cross-Domain C2", "Resilient Communications"],
      trl: "TRL 9",
      icon: Brain,
      category: "ELECTRONIC ATTACK",
      swap: {
        weight: 80,
        power: 2.0,
        size: "medium"
      },
      statImpacts: {
        speed: -1,
        power: -10,
        weight: 4,
        range: -5,
        stealth: -8       // Active EA emissions
      },
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
      // Real specs: 600 km/h, 100 km range, 4.5 kg payload
      swap: {
        weight: 45,       // Small loitering munition
        power: 0.2,       // Launcher power only
        size: "small"
      },
      statImpacts: {
        speed: 0,
        power: -1,
        weight: 2,
        range: 0,
        stealth: 0
      },
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
      // Designed for low SWaP
      swap: {
        weight: 35,
        power: 0.8,
        size: "small"
      },
      statImpacts: {
        speed: 0,
        power: -4,
        weight: 2,
        range: -2,
        stealth: -5       // EA emissions when active
      },
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
      swap: {
        weight: 15,
        power: 0.25,
        size: "small"
      },
      statImpacts: {
        speed: 1,
        power: -2,
        weight: 1,
        range: 3,         // Better navigation = efficiency
        stealth: 3        // No GPS emissions
      },
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
      name: "PhantomNAV",
      provider: "Victus Technologies",
      type: "CONTESTED AUTONOMY",
      description: "Mission autonomy software that turns any platform into a GPS-independent teammate. Synthetic GPS enables true contested autonomy across all domains—from orbit to seabed—with 5-meter precision and 20x drift reduction versus legacy systems.",
      capabilities: ["Synthetic GPS", "Swarm Control", "Hardware-Agnostic", "Sim2Real ML", "GPS-Denied Navigation"],
      trl: "TRL 7",
      icon: Compass,
      category: "RESILIENT PNT",
      platformTypes: ["USV", "UUV", "UAV", "Ship"],
      missionTags: ["SEA_DENIAL", "RECONNAISSANCE", "ANTI_SUBMARINE_WARFARE", "ELECTRONIC_WARFARE", "SWARM_ORCHESTRATION"],
      swap: {
        weight: 2,
        power: 0.1,
        size: "small"
      },
      statImpacts: {
        speed: 2,
        power: -1,
        weight: 0,
        range: 5,
        stealth: 5
      },
      specs: {
        accuracy: "<10m CEP @ 60 min",
        precision: "5 meter",
        driftReduction: "~20x vs legacy systems",
        domains: "Orbit-to-Seabed",
        environments: "Denied, Austere, Maritime",
        platformRatio: "1 Human : >100 platforms"
      },
      securityLevel: ["Palantir Integrated", "NATO DIANA"],
      securityIcons: ["hardened", "mosa"],
      keyFeatures: [
        "Synthetic GPS enables true GPS-independent operation",
        "Hardware-agnostic: deploys on any autonomous platform",
        "Swarm control for multi-platform coordination",
        "Sim2Real ML training for rapid deployment",
        "5-meter precision with 20x drift reduction",
        "Scales from 2-10 humans per platform to 1 human per 100+ platforms"
      ],
      detailedDescription: "Victus is building the autonomy layer for the 2025-2035 Autonomy Decade. In contested spectrum environments where GPS is jammed, spoofed, or unavailable, platforms fail. Victus Synthetic GPS uses Sim2Real machine learning to model system components and train navigation AI that operates without GPS dependency. The result: true contested autonomy that works in denied, austere, and maritime environments from orbit to the seabed. Selected for Palantir Fellowship 001 (1 of 12 leading startups) and NATO DIANA 2026 Maritime Cohort (1 of 15 companies from 3,700+ applicants). Integrates directly with Palantir ecosystem tools already deployed by Department of Defense.",
      integrationNotes: "Hardware-agnostic software deployment. Supports MAVLink protocol bridge. Integrates with Palantir Foundry and existing DoD C2 systems.",
      documents: [
        {
          name: "Victus Customer Deck",
          type: "PDF",
          size: "1.3 MB",
          description: "Capability overview and technical specifications",
          url: "#"
        }
      ],
      bannerImage: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920"
    },
    {
      name: "SeaFinder",
      provider: "Sonardyne",
      type: "Underwater Positioning",
      description: "Acoustic positioning and navigation system providing precise underwater localization for UUVs and subsea operations in GPS-denied environments.",
      capabilities: ["Acoustic Positioning", "USBL/LBL Navigation", "Deep Water Operations", "INS Integration"],
      trl: "TRL 9",
      icon: Compass,
      category: "RESILIENT PNT",
      platformTypes: ["UUV", "Ship"],
      missionTags: ["ANTI_SUBMARINE_WARFARE", "MINE_COUNTERMEASURES", "RECONNAISSANCE"],
      swap: {
        weight: 12,
        power: 0.2,
        size: "small"
      },
      statImpacts: {
        speed: 0,
        power: -2,
        weight: 1,
        range: 5,
        stealth: 2
      },
      specs: {
        technology: "USBL + INS Fusion",
        depthRating: "6000m",
        accuracy: "0.1% slant range",
        updateRate: "Up to 10Hz"
      },
      securityLevel: ["End-to-End Encrypted"],
      securityIcons: ["encrypted"],
      keyFeatures: [
        "Centimeter-level positioning accuracy",
        "Full ocean depth rated",
        "Seamless INS integration",
        "Multi-vehicle tracking capability"
      ],
      documents: [
        {
          name: "SeaFinder System Datasheet",
          type: "PDF",
          size: "1.9 MB",
          description: "Technical specifications and deployment guide",
          url: "#"
        }
      ]
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
      swap: {
        weight: 25,       // Portable system
        power: 0.6,
        size: "small"
      },
      statImpacts: {
        speed: 0,
        power: -3,
        weight: 2,
        range: -1,
        stealth: -6       // RF jamming emissions
      },
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
      swap: {
        weight: 2,        // Software primarily
        power: 0.1,
        size: "small"
      },
      statImpacts: {
        speed: 0,
        power: -1,
        weight: 0,
        range: 0,
        stealth: 5        // Encrypted mesh = harder to intercept
      },
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
          size: "6.7 KB",
          description: "Complete technical specifications and implementation guide",
          url: "/providers/caliola-engineering/assets/docs/OverKey_Technical_Datasheet.pdf"
        },
        {
          name: "Caliola OverKey Product Overview",
          type: "PDF",
          size: "844 KB",
          description: "Comprehensive product overview and capabilities",
          url: "/providers/caliola-engineering/assets/docs/Caliola-OverKey.pdf"
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
    },
    {
      name: "SNC TRAX",
      provider: "Sierra Nevada Corporation",
      type: "Tactical Data Link Gateway",
      description: "Tactical Radio Application Extension (TRAX) routes data between incompatible hardware and software applications with bi-directional translation across 21 data protocols. Combat-proven with 100K+ global users across 60+ disparate systems.",
      capabilities: [
        "Link-16 Gateway",
        "JREAP A/C Translation",
        "SADL Integration",
        "VMF Processing",
        "Cursor on Target (TAK)",
        "Protocol Translation",
        "Video Transcoding"
      ],
      trl: "TRL 9",
      icon: Network,
      category: "RF COMMUNICATIONS",
      swap: {
        weight: 0,        // Pure software - no weight
        power: 0.1,       // Minimal processing overhead
        size: "small"
      },
      statImpacts: {
        speed: 0,
        power: -1,
        weight: 0,
        range: 0,
        stealth: 0
      },
      securityLevel: ["MIL-STD Compliant", "ITAR Controlled", "DDIL Capable"],
      securityIcons: ["milstd", "itar", "ddil"],
      specs: {
        protocols: "21 data protocols (Link-16, JREAP, SADL, VMF, CoT, KML, KLV)",
        systemsIntegrated: "60+ disparate systems",
        globalUsers: "100K+",
        capabilities: "125+",
        platforms: "Windows, Android, Linux",
        standards: "MIL-STD 6016F, 6017, 6020, 3011",
        hardware: "No additional hardware required",
        videoCodecs: "H.264, H.265, VP9, MPEG-DASH"
      },
      detailedDescription: "SNC's Tactical Radio Application Extension (TRAX) software is an integrated Air/Ground tool that allows operators to route data between incompatible hardware and software applications. The product implements coded waveforms for bi-directional translation, providing digital interoperability across the battlespace.\n\nDeveloped to support C5ISR missions at strategic, operational, and tactical levels, TRAX provides a combined air-maritime-ground common operating system leveraging MIL-STD and commercial open-based standards.\n\nDesigned for non-traditional Tactical Data Link (TDL) users, TRAX allows ease-of-use at the tactical edge while providing full C2 capabilities of a command center. The interface requires limited training with no additional hardware needed.\n\nSupported protocols include Link-16 Host (MIL-STD 6016F), JREAP A/C (MIL-STD 3011), SADL, VMF (MIL-STD 6017), Cursor on Target with TAK integration, KML/KLV, and video transcoding (H.264, H.265, VP9).",
      keyFeatures: [
        "21 data protocols with bi-directional translation",
        "60+ disparate systems integrated",
        "100K+ global users combat-proven",
        "Cross-platform: Windows, Android, Linux",
        "Link-16, JREAP, SADL, VMF, Cursor on Target support",
        "TAK Server/WinTAK/ATAK integration",
        "Video transcoding (H.264, H.265, VP9, MPEG-DASH)",
        "No additional hardware required",
        "Open architecture API/ICD eliminates proprietary interfaces",
        "Built-in communication matrix for single-button data-link routing"
      ],
      integrationNotes: "TRAX runs as a containerized service within TempestOS, providing the tactical data link gateway for all platforms. Enables protocol translation between legacy military radios (Link-16, SADL, VMF) and modern IP-based systems including TAK. The open architecture API allows rapid integration with TempestOS Service Messaging for unified C5ISR connectivity.",
      documents: [
        {
          name: "SNC TRAX Product Sheet",
          type: "PDF",
          size: "572 KB",
          description: "Complete product overview with protocols and capabilities",
          url: "#"
        },
        {
          name: "Protocol Integration Guide",
          type: "PDF",
          size: "1.9 MB",
          description: "Link-16, JREAP, SADL, VMF, and CoT integration procedures",
          url: "#"
        }
      ],
      bannerImage: "https://www.sncorp.com/globalassets/what-we-do/c5isr/trax-command-and-control-gateway-1200x670.jpg"
    },
    // ============ AERIAL CAPABILITIES ============
    {
      name: "AN/AAQ-30 Target Sight System",
      provider: "Raytheon",
      type: "Targeting Pod",
      platformTypes: ["UAV"],
      description: "Multi-spectral targeting system for UAVs providing high-definition EO/IR imagery, laser designation, and precision tracking for air-to-ground operations.",
      capabilities: ["EO/IR Imaging", "Laser Designation", "Target Tracking", "Laser Rangefinding", "IR Marker"],
      trl: "TRL 9",
      icon: CameraIcon,
      category: "EO/IR SENSORS",
      swap: {
        weight: 45,       // kg
        power: 0.8,       // kW
        size: "medium"
      },
      statImpacts: {
        speed: -1,
        power: -4,
        weight: 3,
        range: 0,
        stealth: -2       // Emits laser
      },
      specs: {
        resolution: "HD 1080p",
        laserPower: "Eye-safe designator",
        trackingRange: "15+ km",
        fieldOfView: "Wide and narrow FOV modes"
      }
    },
    {
      name: "Aerial Refueling Drogue System",
      provider: "Cobham Mission Systems",
      type: "Aerial Refueling",
      platformTypes: ["UAV"],
      description: "Probe-and-drogue aerial refueling system for MQ-25 and tanker UAVs. Enables carrier-based fighters to extend combat range.",
      capabilities: ["Fuel Transfer", "Hose Extension", "Basket Stabilization", "Flow Control"],
      trl: "TRL 9",
      icon: BatteryIcon,
      category: "LOGISTICS",
      swap: {
        weight: 120,      // kg system weight
        power: 0.5,       // kW
        size: "medium"
      },
      statImpacts: {
        speed: -2,
        power: -3,
        weight: 5,
        range: 0,
        stealth: -3
      },
      specs: {
        fuelRate: "400 gal/min",
        hoseLength: "80 ft",
        fuelCapacity: "15,000 lbs transferable",
        compatibility: "Probe-and-drogue receivers"
      }
    },
    {
      name: "AGM-114 Hellfire Integration Kit",
      provider: "Lockheed Martin",
      type: "Precision Strike Weapon",
      platformTypes: ["UAV"],
      description: "Hellfire missile integration kit for UAV hardpoints. Provides precision air-to-ground strike capability with multiple warhead options.",
      capabilities: ["Precision Strike", "Laser Guidance", "Moving Target Engagement", "Low Collateral Damage"],
      trl: "TRL 9",
      icon: SM6MissileIcon,
      category: "KINETIC WEAPONS",
      swap: {
        weight: 50,       // kg per missile
        power: 0.2,       // kW - guidance/launcher
        size: "small"
      },
      statImpacts: {
        speed: -2,
        power: -1,
        weight: 4,
        range: -3,
        stealth: 0
      },
      specs: {
        range: "8+ km",
        guidance: "Semi-active laser",
        warheadOptions: "HEAT, blast-frag, thermobaric",
        weight: "100 lbs per missile"
      }
    },
    {
      name: "SIGINT Pod - Airborne",
      provider: "Northrop Grumman",
      type: "Signals Intelligence",
      platformTypes: ["UAV"],
      description: "Airborne SIGINT collection system for HALE UAVs. Provides wide-area signals intercept and geolocation from high altitude.",
      capabilities: ["COMINT", "ELINT", "Signal Geolocation", "Wideband Collection", "Real-time Processing"],
      trl: "TRL 9",
      icon: ScionESMIcon,
      category: "ELECTRONIC SUPPORT",
      swap: {
        weight: 180,      // kg
        power: 2.0,       // kW
        size: "medium"
      },
      statImpacts: {
        speed: -1,
        power: -10,
        weight: 6,
        range: -5,
        stealth: 0        // Passive collection
      },
      securityLevel: ["NSA-Approved", "TS/SCI Processing"],
      securityIcons: ["nsa", "encrypted"],
      specs: {
        frequencyRange: "2 MHz - 40 GHz",
        instantaneousBandwidth: "500 MHz",
        geolocationAccuracy: "CEP < 100m",
        altitude: "Optimized for 50,000+ ft"
      }
    },
    {
      name: "Maritime Search Radar - Airborne",
      provider: "Leonardo",
      type: "Maritime Surveillance Radar",
      platformTypes: ["UAV"],
      description: "Lightweight AESA maritime search radar for UAV platforms. Provides 360° surface vessel detection and tracking from altitude.",
      capabilities: ["Surface Search", "SAR Imaging", "ISAR", "Weather Avoidance", "Small Target Detection"],
      trl: "TRL 9",
      icon: HiddenLevelRadarIcon,
      category: "RADAR/RF",
      swap: {
        weight: 95,       // kg
        power: 1.5,       // kW
        size: "medium"
      },
      statImpacts: {
        speed: -1,
        power: -8,
        weight: 4,
        range: -3,
        stealth: -10      // Active radar emissions
      },
      specs: {
        range: "200+ nm surface targets",
        resolution: "0.3m SAR mode",
        scanRate: "360° coverage",
        modes: "Search, track, SAR, ISAR, weather"
      }
    },
    {
      name: "SNC Hippocamp",
      provider: "Sierra Nevada Corporation",
      type: "Universal Autonomy Retrofit",
      platformTypes: ["USV", "Ship"],
      description: "Universal maritime autonomy kit that instantly converts any vessel—from sampan to container ship—into an autonomous asset. Backpack-ready installation with self-learning calibration in under one hour.",
      capabilities: [
        "Universal Vessel Retrofit",
        "GPS-Denied Navigation",
        "DDIL Resilience",
        "Adaptive Deception",
        "Fleet Coordination",
        "Covert Calibration",
        "Swarm Operations"
      ],
      trl: "TRL 7",
      icon: Cpu,
      category: "UNMANNED SYSTEMS",
      swap: {
        weight: 15,       // Backpack-portable kit
        power: 0.3,       // kW - ruggedized computer + sensors
        size: "small"
      },
      statImpacts: {
        speed: 0,
        power: -2,
        weight: 1,
        range: 0,
        stealth: 3        // Deception modules improve stealth
      },
      securityLevel: ["MIL-STD-810 Rated", "Encrypted", "Anti-Spoofing"],
      securityIcons: ["milstd", "encrypted"],
      specs: {
        compatibility: "Any vessel: sampan to container ship",
        installation: "Minutes to mission, plug and play",
        calibration: "Auto-calibration with covert human-like maneuvers",
        navigation: "Multi-sensor fusion, dead reckoning, EO/IR vision, RF mesh",
        comms: "DDIL resilient, opportunistic mesh and HQ comms",
        ruggedness: "IP68 waterproof, MIL-STD-810 shock rated, corrosion proof",
        kit: "Ruggedized computer, redundant IMUs, EO/IR cameras, SDR"
      },
      detailedDescription: "SNC Hippocamp is a universal maritime autonomy system that transforms any vessel into a precision autonomous asset. The backpack-ready Digital Kit includes a compact, attritable, ruggedized computer running AI autonomy with redundant commercial IMUs, EO/IR camera sensors, and SDR.\n\nThe system offers two installation options: Digital Kit for modern vessels with digital interfaces, or Mechanical Kit with actuators to physically drive analog controls on legacy platforms. Auto-calibration learns exact handling profiles with covert calibration procedures completed in minutes.\n\nKey capabilities include GPS-denied navigation using multi-sensor fusion with dead reckoning, EO/IR vision, and RF mesh. The system maintains full DDIL resilience through autonomous local decision-making with opportunistic mesh and HQ communications.\n\nAdaptive Deception Modules provide configurable acoustic and RF signature generation to mislead adversary surveillance. The covert calibration uses dynamic human-like sequences to prevent identification of autonomous behavior.",
      keyFeatures: [
        "Universal retrofit for any vessel type - digital or mechanical controls",
        "Minutes to mission with plug-and-play installation",
        "GPS-denied navigation with multi-sensor fusion",
        "Fully autonomous local decision-making (DDIL resilient)",
        "Auto-calibration with covert human-like maneuvers",
        "Adaptive deception: acoustic and RF signature spoofing",
        "Hardened, encrypted, anti-spoofing security design",
        "Swarm operations with mixed hull fleet coordination",
        "IP68 waterproof, MIL-STD-810 shock rated"
      ],
      integrationNotes: "Hippocamp integrates with TempestOS to provide universal autonomy capability for acquired or retrofitted vessels. When combined with SNC TRAX, enables full C5ISR connectivity for converted vessels. Supports fleet-level coordination with AEGIR and purpose-built autonomous platforms.",
      documents: [
        {
          name: "Hippocamp Capabilities Overview",
          type: "PDF",
          size: "1.6 MB",
          description: "Complete autonomy retrofit system overview and CONOPS",
          url: "#"
        }
      ],
      bannerImage: "https://www.sncorp.com/globalassets/what-we-do/unmanned-systems/unmanned-systems-hero-1920x600.jpg"
    },
    // ============ ZeroUSV REPMUS 2026 Payloads ============
    {
      name: "Teledyne Webb Slocum Glider",
      provider: "Teledyne Marine",
      type: "Underwater Glider",
      platformTypes: ["USV", "Ship"],
      missionTags: ["SEA_DENIAL", "ASW", "SURVEY", "RECONNAISSANCE"],
      description: "Long-endurance autonomous underwater glider for persistent ocean monitoring. Uses buoyancy-driven propulsion for extended missions up to 18 months. Ideal for ASW, oceanographic survey, and environmental monitoring.",
      capabilities: [
        "Buoyancy-Driven Propulsion",
        "18-Month Endurance",
        "1000m Depth Rating",
        "Autonomous Navigation",
        "Multi-Sensor Payload",
        "Satellite Data Relay"
      ],
      trl: "TRL 9",
      icon: Waves,
      category: "ACOUSTIC/SONAR",
      swap: {
        weight: 65,       // 55-70 kg typical
        power: 0.05,      // Very low power - buoyancy driven
        size: "medium"
      },
      statImpacts: {
        speed: 0,         // Deployed separately
        power: 0,
        weight: 3,
        range: 0,
        stealth: 5        // Very quiet operation
      },
      securityLevel: ["Encrypted Data", "Tamper Resistant"],
      securityIcons: ["encrypted"],
      specs: {
        length: "1.5m (4.9 ft)",
        diameter: "22 cm (8.7 in)",
        weight: "55-70 kg",
        depthRating: "200-1000m",
        endurance: "Up to 18 months",
        speed: "0.68 knots average",
        range: "3000+ nm per deployment",
        sensors: "CTD, acoustic, optical payloads",
        communication: "Iridium satellite when surfaced"
      },
      detailedDescription: "The Teledyne Webb Slocum Glider is an autonomous underwater vehicle (AUV) that uses changes in buoyancy to glide through the water column. This energy-efficient propulsion method enables missions lasting up to 18 months on a single battery.\n\nThe glider can carry various sensor payloads including CTD (Conductivity, Temperature, Depth), passive acoustic monitoring arrays, and optical sensors. It surfaces periodically to transmit data via Iridium satellite and receive updated mission commands.\n\nFor ASW applications, gliders equipped with passive acoustic arrays can conduct persistent wide-area submarine monitoring. Multiple gliders can be coordinated to create distributed sensor networks covering large ocean areas.",
      keyFeatures: [
        "18-month autonomous endurance",
        "Buoyancy-driven propulsion - nearly silent",
        "1000m depth capability",
        "Modular sensor payloads",
        "Iridium satellite data relay",
        "Proven Navy deployment history",
        "Deployable from USV platforms"
      ],
      integrationNotes: "Can be deployed and recovered from ZeroUSV Oceanus17 and similar medium/large USVs. Gliders operate independently once deployed, with data relayed to host vessel or shore via satellite.",
      applications: [
        "Persistent submarine monitoring",
        "Oceanographic survey",
        "Environmental monitoring",
        "Mine countermeasures support",
        "Undersea warfare support"
      ]
    },
    {
      name: "Sonobuoy Launcher System",
      provider: "Multiple Vendors",
      type: "ASW Deployment System",
      platformTypes: ["USV", "Ship", "UAV"],
      missionTags: ["SEA_DENIAL", "ASW", "RECONNAISSANCE"],
      description: "Multi-tube sonobuoy deployment system for anti-submarine warfare operations. Launches A-size sonobuoys for acoustic surveillance and submarine detection from surface or aerial platforms.",
      capabilities: [
        "Multi-Tube Deployment",
        "A-Size Sonobuoy Compatible",
        "Remote Triggering",
        "Pattern Deployment",
        "Integrated Fire Control",
        "DIFAR/DICASS Support"
      ],
      trl: "TRL 9",
      icon: Waves,
      category: "ACOUSTIC/SONAR",
      swap: {
        weight: 85,       // Launcher + tubes + controls
        power: 0.2,       // kW - control systems
        size: "medium"
      },
      statImpacts: {
        speed: -1,
        power: -1,
        weight: 4,
        range: -2,
        stealth: 0
      },
      securityLevel: ["Encrypted Control", "NATO Compatible"],
      securityIcons: ["encrypted", "nato"],
      specs: {
        tubeCount: "3-12 tubes configurable",
        buoySize: "A-size (5.5\" x 48\")",
        buoyWeight: "18 kg (40 lbs) each",
        launchMethod: "Pneumatic/gravity",
        patterns: "Barrier, field, tracking",
        sonobuoyTypes: "DIFAR, DICASS, VLAD, bathythermograph",
        controlRange: "Line-of-sight or satellite relay"
      },
      detailedDescription: "The Sonobuoy Launcher System enables autonomous surface vessels to conduct anti-submarine warfare (ASW) operations by deploying expendable sonobuoys. The system supports various sonobuoy types including passive DIFAR (Directional Frequency Analysis and Recording) and active DICASS (Directional Command Activated Sonobuoy System).\n\nSonobuoys are deployed in coordinated patterns to establish acoustic barriers or search fields. Once deployed, sonobuoys transmit acoustic data via VHF radio to the host platform or nearby aircraft for processing and analysis.\n\nThe launcher integrates with shipboard or autonomous fire control systems to optimize deployment timing and patterns based on tactical situation.",
      keyFeatures: [
        "Configurable 3-12 tube launcher",
        "Standard A-size sonobuoy compatible",
        "Automated pattern deployment",
        "Remote command triggering",
        "NATO standard interface",
        "Integrated with ASW analytics"
      ],
      integrationNotes: "Integrates with TempestOS for autonomous deployment control. Data from deployed sonobuoys can be processed by IBM Watson X ASW Analytics or similar systems.",
      applications: [
        "Anti-submarine warfare",
        "Acoustic surveillance",
        "Submarine tracking",
        "Wide-area search",
        "Barrier operations"
      ]
    },
    {
      name: "Thin-Line Towed Array",
      provider: "Multiple Vendors",
      type: "Passive Sonar",
      platformTypes: ["USV", "UUV", "Ship"],
      missionTags: ["SEA_DENIAL", "ASW", "RECONNAISSANCE"],
      description: "Compact passive towed sonar array optimized for USV deployment. Sub-50mm diameter array provides long-range submarine detection capability for autonomous ASW missions.",
      capabilities: [
        "Passive Acoustic Detection",
        "Long-Range Submarine Detection",
        "Low-Frequency Coverage",
        "Bearing Determination",
        "Compact USV-Compatible Design",
        "Real-Time Processing"
      ],
      trl: "TRL 8",
      icon: TowedSonarIcon,
      category: "ACOUSTIC/SONAR",
      swap: {
        weight: 120,      // Array + winch + processor
        power: 0.6,       // kW - processing and winch
        size: "medium"
      },
      statImpacts: {
        speed: -3,        // Towing limits speed
        power: -3,
        weight: 5,
        range: -3,
        stealth: 4        // Passive only - quiet operation
      },
      securityLevel: ["Encrypted Processing", "COMSEC"],
      securityIcons: ["encrypted"],
      specs: {
        arrayDiameter: "< 50mm (2 in)",
        arrayLength: "100-500m configurable",
        frequencyRange: "10-100 Hz (low frequency)",
        detectionRange: "Tens of kilometers",
        towSpeed: "3-8 knots optimal",
        deploymentDepth: "Variable, 20-200m",
        winchCapacity: "500m array storage",
        processing: "Real-time bearing estimation"
      },
      detailedDescription: "The Thin-Line Towed Array is a passive sonar system designed specifically for deployment from unmanned surface vessels. The compact sub-50mm diameter array provides excellent low-frequency acoustic coverage while remaining deployable from medium USVs like the ZeroUSV Oceanus17.\n\nThe array detects low-frequency sound emissions from submarines at ranges of tens of kilometers. Advanced signal processing provides bearing estimation to detected contacts, enabling tracking and localization when combined with multiple platforms or maneuvers.\n\nUnlike traditional towed arrays designed for large warships, thin-line arrays sacrifice some acoustic aperture for deployability from smaller platforms, making persistent autonomous ASW patrols practical.",
      keyFeatures: [
        "Sub-50mm compact diameter",
        "100-500m configurable length",
        "10-100 Hz low-frequency coverage",
        "Real-time bearing estimation",
        "Autonomous deployment/recovery",
        "USV-compatible winch system",
        "DDIL-resilient processing"
      ],
      integrationNotes: "Designed for integration with ZeroUSV Oceanus17 and similar medium USVs. Acoustic data processed onboard with bearing tracks transmitted via SATCOM to shore or command ship.",
      applications: [
        "Autonomous ASW patrol",
        "Submarine detection",
        "Undersea surveillance",
        "Acoustic intelligence",
        "Wide-area monitoring"
      ]
    },
    {
      name: "Multibeam Echo Sounder (MBES)",
      provider: "Multiple Vendors",
      type: "Bathymetric Survey",
      platformTypes: ["USV", "UUV", "Ship"],
      missionTags: ["SURVEY", "MCM", "RECONNAISSANCE"],
      description: "High-resolution multibeam sonar for seabed mapping and bathymetric survey. Provides detailed 3D seafloor imagery for navigation, mine countermeasures, and oceanographic research.",
      capabilities: [
        "High-Resolution Bathymetry",
        "Seafloor Imaging",
        "Real-Time 3D Mapping",
        "Water Column Imaging",
        "Object Detection",
        "Survey-Grade Accuracy"
      ],
      trl: "TRL 9",
      icon: Waves,
      category: "ACOUSTIC/SONAR",
      swap: {
        weight: 45,       // Transducer + processor
        power: 0.4,       // kW
        size: "small"
      },
      statImpacts: {
        speed: 0,
        power: -2,
        weight: 2,
        range: -1,
        stealth: -3       // Active sonar emissions
      },
      securityLevel: ["IHO S-44 Compliant"],
      securityIcons: [],
      specs: {
        swathWidth: "120-150 degrees",
        beamCount: "256-512 beams",
        frequency: "200-400 kHz (shallow) / 12-50 kHz (deep)",
        depthRange: "0.5m to 7000m (frequency dependent)",
        resolution: "cm-level in shallow water",
        accuracy: "IHO S-44 Order 1a capable",
        dataRate: "High-density point cloud",
        integration: "Standard hydrographic formats"
      },
      detailedDescription: "The Multibeam Echo Sounder (MBES) uses multiple acoustic beams to create detailed 3D maps of the seafloor. The system transmits a fan-shaped acoustic pulse and measures the return time and angle of echoes to build a swath of depth measurements with each ping.\n\nModern MBES systems provide survey-grade bathymetric data suitable for nautical charting, mine countermeasures, and undersea infrastructure inspection. Water column imaging mode can detect objects suspended in the water column, useful for fish schools, gas seeps, or mine detection.\n\nFor autonomous survey missions, MBES data is processed in real-time to build complete seabed maps. Integration with positioning systems (GPS/INS) provides georeferenced survey products.",
      keyFeatures: [
        "120-150 degree swath coverage",
        "256-512 simultaneous beams",
        "Centimeter-level resolution",
        "IHO S-44 survey compliance",
        "Real-time 3D seafloor mapping",
        "Water column imaging",
        "Standard hydrographic output formats"
      ],
      integrationNotes: "Hull-mounted or pole-mounted installation on USVs. Integrates with TempestOS for autonomous survey mission execution. Data products compatible with standard GIS and hydrographic software.",
      applications: [
        "Bathymetric survey",
        "Nautical charting",
        "Mine countermeasures",
        "Pipeline/cable inspection",
        "Habitat mapping",
        "Search and salvage"
      ]
    }
  ];
export const capabilityCategories = {
  "COMMAND & CONTROL": {
    icon: Shield,
    description: "Command, control, communications systems",
    subcategories: ["COMMAND & CONTROL", "COMMUNICATIONS", "COORDINATION"]
  },
  "ISR & SURVEILLANCE": {
    icon: Eye,
    description: "Intelligence, surveillance, reconnaissance",
    subcategories: ["SENSORS & DETECTION", "ISR & SURVEILLANCE", "INTELLIGENCE"]
  },
  "WEAPONS & DEFENSE": {
    icon: Target,
    description: "Weapon systems and defensive measures", 
    subcategories: ["WEAPONS & DEFENSE", "MISSILE DEFENSE", "COUNTERMEASURES"]
  },
  "ELECTRONIC WARFARE": {
    icon: Signal,
    description: "Electronic warfare and cyber capabilities",
    subcategories: ["ELECTRONIC WARFARE", "CYBER DEFENSE", "SIGNALS INTELLIGENCE"]
  },
  "UNMANNED SYSTEMS": {
    icon: Brain,
    description: "Autonomous and unmanned platforms",
    subcategories: ["UNMANNED SYSTEMS", "AUTONOMOUS VEHICLES", "ROBOTICS"]
  },
  "LOGISTICS & SUPPORT": {
    icon: Anchor,
    description: "Support systems and logistics",
    subcategories: ["LOGISTICS & SUPPORT", "MAINTENANCE", "SUPPLY CHAIN"]
  },
  "COMMUNICATIONS": {
    icon: Radio,
    description: "Communications and networking",
    subcategories: ["COMMUNICATIONS", "NETWORKING", "SATELLITE COMMS"]
  },
  "SENSORS & DETECTION": {
    icon: Satellite,
    description: "Sensors, radar, and detection systems",
    subcategories: ["SENSORS & DETECTION", "RADAR", "SONAR", "IMAGING"]
  },
  "RESILIENT PNT": {
    icon: Compass,
    description: "Position, Navigation, and Timing systems for GPS-denied environments",
    subcategories: ["RESILIENT PNT", "NAVIGATION", "TIMING"]
  }
};

export const squadrons = [
  {
    id: "sqdn_001",
    name: "Autonomous Hunter-Killer Pack",
    classification: "SECRET",
    units: 12,
    composition: ["6x Anduril Ghost Shark XLE", "4x MQ-25 Stingray", "2x Command & Control Vessels"],
    missionObjective: "target_destruction",
    primaryMission: "Anti-submarine warfare and sea denial operations",
    payloadConfiguration: "ASW Detection + Torpedo Systems",
    interoperabilityStandard: "NATO STANAG 4586",
    operationalStatus: "MISSION READY",
    lastDeployment: "Operation DEEP GUARDIAN - 45 days ago",
    totalDeployments: 8,
    successRate: "94%",
    status: {
      missionReady: 8,
      deployed: 2,
      maintenance: 2
    },
    capabilities: ["Submarine Detection", "Coordinated Attack", "Autonomous Navigation", "Stealth Operations"],
    location: "CONUS West - Naval Base Ventura County",
    readyTime: "T+15 minutes",
    icon: "submarines"
  },
  {
    id: "sqdn_002",
    name: "Maritime Domain Awareness Network", 
    classification: "SECRET",
    units: 24,
    composition: ["18x Saildrone Surveyor", "4x MQ-4C Triton", "2x P-8A Poseidon"],
    missionObjective: "reconnaissance",
    primaryMission: "Wide-area maritime surveillance and intelligence gathering",
    payloadConfiguration: "ISR Sensors + SIGINT Suite",
    interoperabilityStandard: "NATO STANAG 4586",
    operationalStatus: "DEPLOYED",
    lastDeployment: "Operation SENTINEL WATCH - ACTIVE",
    totalDeployments: 15,
    successRate: "98%",
    status: {
      deployed: 20,
      charging: 3,
      maintenance: 1
    },
    capabilities: ["Long-range Surveillance", "Signal Intelligence", "Pattern Analysis", "Real-time Reporting"],
    location: "Indo-Pacific AOR",
    readyTime: "ACTIVE MISSION",
    icon: "surveillance"
  },
  {
    id: "sqdn_003",
    name: "Rapid Response Strike Group",
    classification: "SECRET", 
    units: 8,
    composition: ["4x LRUSV (Large Robotic Surface Vessel)", "3x Maritime Strike Missile Platforms", "1x Command Vessel"],
    missionObjective: "interdiction",
    primaryMission: "Fast-response maritime strike and interdiction",
    payloadConfiguration: "Maritime Strike Missiles + EW Suite",
    interoperabilityStandard: "NATO STANAG 4586",
    operationalStatus: "STANDBY",
    lastDeployment: "Exercise LIGHTNING TRIDENT - 18 days ago", 
    totalDeployments: 6,
    successRate: "91%",
    status: {
      missionReady: 6,
      inRefit: 2
    },
    capabilities: ["Precision Strike", "High-speed Transit", "Network Warfare", "Coordinated Engagement"],
    location: "CONUS East - Norfolk Naval Station",
    readyTime: "T+45 minutes",
    icon: "missiles"
  },
  {
    id: "sqdn_004",
    name: "Logistics Automation Squadron",
    classification: "UNCLASSIFIED",
    units: 16, 
    composition: ["10x Autonomous Supply Vessels", "4x Fuel Barges", "2x Mobile Maintenance Platforms"],
    missionObjective: "logistics_support",
    primaryMission: "Autonomous logistics support and squadron sustainment",
    payloadConfiguration: "Cargo Transport + Maintenance Systems",
    interoperabilityStandard: "Commercial + NATO STANAG 4586",
    operationalStatus: "ACTIVE",
    lastDeployment: "Operation ENDLESS SUPPLY - CONTINUOUS",
    totalDeployments: 22,
    successRate: "97%",
    status: {
      atSea: 12,
      missionReady: 4
    },
    capabilities: ["Autonomous Resupply", "Squadron Sustainment", "Mobile Repair", "Predictive Logistics"],
    location: "Multi-Theater Operations",
    readyTime: "CONTINUOUS OPERATIONS", 
    icon: "logistics"
  }
];

export const missions = [
  {
    id: "mission_001",
    name: "Operation DEEP GUARDIAN",
    classification: "SECRET",
    objectiveFunction: "target_destruction",
    description: "Autonomous anti-submarine warfare operations in contested maritime domain",
    status: "ACTIVE",
    priority: "high",
    startDate: "2024-10-15T08:00:00Z",
    estimatedDuration: "72 hours",
    assignedSquadrons: ["sqdn_001"],
    missionParameters: {
      operationArea: "Grid Charlie-7 through Delta-9",
      rules_of_engagement: "Weapons Free - Hostile Submarines",
      successCriteria: ["Neutralize 3+ hostile submarines", "Maintain area denial for 72h"],
      coordinationFrequency: "Command Net Alpha"
    },
    currentPhase: "execution",
    completionPercentage: 65
  },
  {
    id: "mission_002",
    name: "Operation SENTINEL WATCH",
    classification: "SECRET",
    objectiveFunction: "reconnaissance", 
    description: "Wide-area maritime domain awareness and intelligence collection",
    status: "CONTINUOUS",
    priority: "medium",
    startDate: "2024-09-01T00:00:00Z",
    estimatedDuration: "Ongoing",
    assignedSquadrons: ["sqdn_002"],
    missionParameters: {
      operationArea: "Indo-Pacific AOR - Zones 1-8",
      rules_of_engagement: "Observe and Report Only",
      successCriteria: ["95% coverage uptime", "Real-time threat detection", "Intelligence reporting within 15min"],
      coordinationFrequency: "Intel Net Bravo"
    },
    currentPhase: "execution",
    completionPercentage: 100
  },
  {
    id: "mission_003", 
    name: "Exercise LIGHTNING TRIDENT",
    classification: "SECRET",
    objectiveFunction: "interdiction",
    description: "Rapid response strike exercise - coordinated maritime interdiction",
    status: "COMPLETED",
    priority: "medium",
    startDate: "2024-11-01T12:00:00Z",
    estimatedDuration: "48 hours",
    assignedSquadrons: ["sqdn_003"],
    missionParameters: {
      operationArea: "Exercise Area Delta - CONUS East",
      rules_of_engagement: "Exercise Rules - Simulated Engagement",
      successCriteria: ["<45min response time", "90%+ target engagement", "Zero friendly fire incidents"],
      coordinationFrequency: "Exercise Net Charlie"
    },
    currentPhase: "completed",
    completionPercentage: 100
  },
  {
    id: "mission_004",
    name: "Operation ENDLESS SUPPLY",
    classification: "UNCLASSIFIED",
    objectiveFunction: "logistics_support",
    description: "Continuous autonomous logistics support across multiple theaters",
    status: "CONTINUOUS",
    priority: "low",
    startDate: "2024-01-01T00:00:00Z",
    estimatedDuration: "Indefinite",
    assignedSquadrons: ["sqdn_004"],
    missionParameters: {
      operationArea: "Multi-Theater Operations",
      rules_of_engagement: "Logistics Support Protocol",
      successCriteria: ["95% supply delivery success", "Zero mission delays", "Predictive maintenance 72h forecast"],
      coordinationFrequency: "Logistics Net Delta"
    },
    currentPhase: "continuous",
    completionPercentage: 85
  }
];

export const missionObjectives = {
  RECONNAISSANCE: {
    id: "reconnaissance",
    name: "Reconnaissance",
    description: "Intelligence gathering and surveillance operations",
    typicalDuration: "24-168 hours",
    requiredCapabilities: ["ISR Sensors", "Data Link", "Long Endurance"]
  },
  TARGET_DESTRUCTION: {
    id: "target_destruction",
    name: "Target Destruction",
    description: "Kinetic engagement and neutralization of hostile targets",
    typicalDuration: "4-72 hours", 
    requiredCapabilities: ["Weapon Systems", "Target Detection", "Fire Control"]
  },
  SURVEILLANCE: {
    id: "surveillance",
    name: "Surveillance",
    description: "Continuous monitoring of specific areas or targets",
    typicalDuration: "Continuous",
    requiredCapabilities: ["Persistent Sensors", "Real-time Reporting", "Stealth"]
  },
  INTERDICTION: {
    id: "interdiction",
    name: "Interdiction",
    description: "Disruption and prevention of hostile activities",
    typicalDuration: "8-48 hours",
    requiredCapabilities: ["Rapid Response", "Strike Capability", "Intelligence Fusion"]
  },
  PATROL: {
    id: "patrol",
    name: "Patrol",
    description: "Regular monitoring and presence operations",
    typicalDuration: "12-96 hours",
    requiredCapabilities: ["Endurance", "Area Coverage", "Communication"]
  },
  LOGISTICS_SUPPORT: {
    id: "logistics_support",
    name: "Logistics Support",
    description: "Supply, maintenance, and sustainment operations",
    typicalDuration: "Continuous",
    requiredCapabilities: ["Cargo Capacity", "Autonomous Navigation", "Maintenance Systems"]
  },
  ONE_WAY_ATTACK: {
    id: "one_way_attack",
    name: "One-Way Attack",
    description: "Terminal attack mission using expendable autonomous platforms for high-value target engagement",
    typicalDuration: "1-24 hours",
    requiredCapabilities: ["Terminal Guidance", "Warhead Integration", "Autonomous Navigation", "Target Recognition"]
  },
  REFLEX_SWARM_ATTACK: {
    id: "reflex_swarm_attack",
    name: "Reflex Swarm Attack",
    description: "Immediate reaction using Sense-Decide-Act cycle for rapid close-in weapon system response to threats",
    typicalDuration: "Seconds to minutes",
    requiredCapabilities: ["Threat Detection", "Swarm Coordination", "Close-in Weapon System", "Autonomous Targeting"],
    controlLoop: "CLOSED-LOOP CONTROL: Sense → Decide → Act",
    warning: "Requires careful ROE configuration to prevent blue-on-blue incidents"
  },
  ROBOT_DEFENSE_OODA: {
    id: "robot_defense_ooda",
    name: "Robot Defense OODA Loop",
    description: "Human-supervised autonomous defense with ethical control constraints using full OODA cycle and IFF/NU discrimination",
    typicalDuration: "Minutes to hours",
    requiredCapabilities: ["IFFNU Classification", "Swarm Coordination", "Human Checkpoint Integration", "Threat Assessment"],
    controlLoop: "HUMAN + ROBOT OODA: Observe → Orient → Decide → Act",
    ethicalControls: "IFFNU discriminates friendly from threat, human checkpoint for lethal force authorization"
  },
  LIFEBOAT_TRACKING: {
    id: "lifeboat_tracking",
    name: "Lifeboat Tracking",
    description: "Search and rescue support mission to locate, track, and maintain contact with lifeboats and personnel in distress",
    typicalDuration: "Hours to days",
    requiredCapabilities: ["EO/IR Sensors", "AIS Tracking", "Long Endurance", "Real-time Reporting", "GPS Localization"],
    intendedOutcome: "Locate and continuously track lifeboat until rescue assets arrive",
    endCondition: "Rescue complete or handoff to manned rescue assets"
  },
  CONTESTED_LOGISTICS: {
    id: "contested_logistics",
    name: "Contested Logistics",
    description: "Covert resupply operations through hostile waters using passive sensors only. Maximize stealth by avoiding all detected sensors, staying out of visual range, and minimizing radar emissions. Ideal operations use EW and visual detection only, reserving radar for fog banks near shore.",
    typicalDuration: "Days to weeks",
    requiredCapabilities: ["ESM/EW Sensors", "Passive Detection", "Low Observable Profile", "Cargo Capacity", "Long Endurance", "Weather Routing"],
    controlLoop: "PASSIVE EVASION: Detect → Avoid → Transit → Deliver",
    sensorPolicy: {
      radar: "EMISSIONS CONTROL - Radar only in fog banks within 100nm of shore",
      ew: "PRIMARY - Continuous passive ESM for threat detection",
      visual: "PRIMARY - EO/IR for close-range navigation and threat avoidance",
      ais: "SELECTIVE - Spoof or silent running based on threat environment"
    },
    evasionRules: [
      "Maintain maximum standoff from all detected emitters",
      "Route around known sensor coverage areas",
      "Prefer weather systems that degrade enemy sensors",
      "Visual detection range: stay beyond horizon from all contacts",
      "Night transit preferred in high-threat areas"
    ],
    intendedOutcome: "Deliver cargo to destination without detection or engagement",
    endCondition: "Cargo delivered or mission abort due to compromise"
  },
  SEA_DENIAL: {
    id: "sea_denial",
    name: "Sea Denial",
    description: "Establish and maintain exclusion zone preventing enemy vessel transit. No hostile vessels survive within the defined area. Continuous patrol, detection, and engagement of any vessels matching threat criteria.",
    typicalDuration: "Days to indefinite",
    requiredCapabilities: ["Wide-Area Surveillance", "Target Classification", "Weapon Systems", "Swarm Coordination", "Persistent Presence"],
    controlLoop: "HUNT-KILL: Patrol → Detect → Classify → Engage → Confirm Kill → Resume Patrol",
    zoneParameters: {
      definition: "Geographic boundaries defining exclusion area",
      threatCriteria: "Vessel types/signatures to engage",
      exceptions: "Friendly/neutral vessel identification criteria",
      escalation: "ROE for different threat levels"
    },
    tacticalRules: [
      "Maintain continuous sensor coverage of entire zone",
      "Coordinate swarm elements to prevent gaps",
      "Immediate engagement of confirmed hostile vessels",
      "BDA required before resuming patrol",
      "Report all contacts and engagements to C2"
    ],
    intendedOutcome: "Zero hostile vessel transit through exclusion zone",
    endCondition: "Zone control terminated by higher authority"
  },
  ESCORT: {
    id: "escort",
    name: "Escort Protection",
    description: "Protect high-value unit (HVU) during transit using expendable autonomous escorts. Screening elements detect, engage, and absorb threats to ensure HVU reaches destination. Escorts are expendable; HVU survival is paramount.",
    typicalDuration: "Hours to days",
    requiredCapabilities: ["Threat Detection", "Screening Formation", "Weapon Systems", "Sacrifice Logic", "Coordinated Defense"],
    controlLoop: "SCREEN-ENGAGE-ABSORB: Screen → Detect → Intercept → Engage/Absorb → Maintain Screen",
    formationParameters: {
      hvuProtection: "Primary asset must reach destination",
      screenRadius: "Defensive perimeter distance from HVU",
      escortCount: "Number of expendable screening elements",
      sectorAssignment: "Threat sector responsibility per escort"
    },
    tacticalRules: [
      "Escorts are expendable - HVU survival is only success metric",
      "Maintain 360° sensor coverage around HVU",
      "Intercept threats at maximum range from HVU",
      "Escorts may ram/sacrifice to stop inbound threats",
      "Collapse screen inward as escorts are lost",
      "Request reinforcement when screen falls below minimum"
    ],
    intendedOutcome: "HVU reaches destination safely",
    endCondition: "HVU arrives at destination or is lost"
  }
};

// Mission Flow Templates for Visual Flow Builder
export const missionFlowTemplates = {
  REFLEX_SWARM_ATTACK: {
    name: "Reflex Swarm Attack",
    category: "COMBAT",
    nodes: [
      { id: 'trigger', type: 'trigger', label: 'Threat Detected', position: { x: 50, y: 150 } },
      { id: 'sense', type: 'sense', label: 'Sense', position: { x: 200, y: 150 } },
      { id: 'decide', type: 'decide', label: 'Decide', position: { x: 350, y: 150 } },
      { id: 'act', type: 'action', label: 'Engage', position: { x: 500, y: 150 } },
      { id: 'end', type: 'end', label: 'Threat Neutralized', position: { x: 650, y: 150 } }
    ],
    connections: [
      { from: 'trigger', to: 'sense' },
      { from: 'sense', to: 'decide' },
      { from: 'decide', to: 'act' },
      { from: 'act', to: 'end' }
    ],
    loopBack: { from: 'act', to: 'sense', label: 'Continue Engagement' }
  },
  ROBOT_DEFENSE_OODA: {
    name: "Robot Defense OODA Loop",
    category: "DEFENSE",
    nodes: [
      { id: 'observe', type: 'observe', label: 'Observe', position: { x: 50, y: 100 } },
      { id: 'orient', type: 'orient', label: 'Orient', position: { x: 200, y: 100 } },
      { id: 'iff', type: 'decision', label: 'IFF/NU Check', position: { x: 350, y: 100 } },
      { id: 'human', type: 'human_checkpoint', label: 'Human Checkpoint', position: { x: 350, y: 250 } },
      { id: 'decide', type: 'decide', label: 'Decide', position: { x: 500, y: 100 } },
      { id: 'act', type: 'action', label: 'Act', position: { x: 650, y: 100 } },
      { id: 'end', type: 'end', label: 'Threat Resolved', position: { x: 800, y: 100 } }
    ],
    connections: [
      { from: 'observe', to: 'orient' },
      { from: 'orient', to: 'iff' },
      { from: 'iff', to: 'decide', label: 'Friendly' },
      { from: 'iff', to: 'human', label: 'Threat/Unknown' },
      { from: 'human', to: 'decide', label: 'Approved' },
      { from: 'decide', to: 'act' },
      { from: 'act', to: 'end' }
    ],
    loopBack: { from: 'act', to: 'observe', label: 'Continue Loop' }
  },
  LIFEBOAT_TRACKING: {
    name: "Lifeboat Tracking",
    category: "SAR",
    nodes: [
      { id: 'trigger', type: 'trigger', label: 'Distress Signal', position: { x: 50, y: 150 } },
      { id: 'search', type: 'action', label: 'Search Area', position: { x: 200, y: 150 } },
      { id: 'locate', type: 'decision', label: 'Target Located?', position: { x: 350, y: 150 } },
      { id: 'expand', type: 'action', label: 'Expand Search', position: { x: 350, y: 280 } },
      { id: 'track', type: 'action', label: 'Track Lifeboat', position: { x: 500, y: 100 } },
      { id: 'report', type: 'action', label: 'Report Position', position: { x: 650, y: 100 } },
      { id: 'handoff', type: 'end', label: 'Rescue Handoff', position: { x: 800, y: 100 } }
    ],
    connections: [
      { from: 'trigger', to: 'search' },
      { from: 'search', to: 'locate' },
      { from: 'locate', to: 'track', label: 'Yes' },
      { from: 'locate', to: 'expand', label: 'No' },
      { from: 'expand', to: 'search' },
      { from: 'track', to: 'report' },
      { from: 'report', to: 'handoff' }
    ]
  },
  ONE_WAY_ATTACK: {
    name: "One-Way Attack",
    category: "COMBAT",
    nodes: [
      { id: 'launch', type: 'trigger', label: 'Launch Command', position: { x: 50, y: 150 } },
      { id: 'transit', type: 'action', label: 'Transit to AO', position: { x: 200, y: 150 } },
      { id: 'acquire', type: 'sense', label: 'Target Acquisition', position: { x: 350, y: 150 } },
      { id: 'confirm', type: 'decision', label: 'Target Confirmed?', position: { x: 500, y: 150 } },
      { id: 'reacquire', type: 'action', label: 'Re-acquire', position: { x: 500, y: 280 } },
      { id: 'terminal', type: 'action', label: 'Terminal Guidance', position: { x: 650, y: 150 } },
      { id: 'engage', type: 'end', label: 'Engage Target', position: { x: 800, y: 150 } }
    ],
    connections: [
      { from: 'launch', to: 'transit' },
      { from: 'transit', to: 'acquire' },
      { from: 'acquire', to: 'confirm' },
      { from: 'confirm', to: 'terminal', label: 'Yes' },
      { from: 'confirm', to: 'reacquire', label: 'No' },
      { from: 'reacquire', to: 'acquire' },
      { from: 'terminal', to: 'engage' }
    ]
  },
  RECONNAISSANCE: {
    name: "Reconnaissance",
    category: "ISR",
    nodes: [
      { id: 'deploy', type: 'trigger', label: 'Deploy to AO', position: { x: 50, y: 150 } },
      { id: 'scan', type: 'sense', label: 'Area Scan', position: { x: 200, y: 150 } },
      { id: 'detect', type: 'decision', label: 'Contact?', position: { x: 350, y: 150 } },
      { id: 'classify', type: 'orient', label: 'Classify Target', position: { x: 500, y: 100 } },
      { id: 'report', type: 'action', label: 'Report Intel', position: { x: 650, y: 100 } },
      { id: 'continue', type: 'decision', label: 'Continue?', position: { x: 500, y: 250 } },
      { id: 'rtb', type: 'end', label: 'RTB', position: { x: 650, y: 250 } }
    ],
    connections: [
      { from: 'deploy', to: 'scan' },
      { from: 'scan', to: 'detect' },
      { from: 'detect', to: 'classify', label: 'Yes' },
      { from: 'detect', to: 'continue', label: 'No' },
      { from: 'classify', to: 'report' },
      { from: 'report', to: 'continue' },
      { from: 'continue', to: 'scan', label: 'Yes' },
      { from: 'continue', to: 'rtb', label: 'No' }
    ]
  },
  PATROL: {
    name: "Patrol",
    category: "ISR",
    nodes: [
      { id: 'start', type: 'trigger', label: 'Begin Patrol', position: { x: 50, y: 150 } },
      { id: 'waypoint', type: 'action', label: 'Navigate Waypoint', position: { x: 200, y: 150 } },
      { id: 'monitor', type: 'sense', label: 'Monitor Area', position: { x: 350, y: 150 } },
      { id: 'anomaly', type: 'decision', label: 'Anomaly?', position: { x: 500, y: 150 } },
      { id: 'investigate', type: 'action', label: 'Investigate', position: { x: 650, y: 100 } },
      { id: 'report', type: 'action', label: 'Report', position: { x: 800, y: 100 } },
      { id: 'next', type: 'decision', label: 'More Waypoints?', position: { x: 500, y: 280 } },
      { id: 'complete', type: 'end', label: 'Patrol Complete', position: { x: 650, y: 280 } }
    ],
    connections: [
      { from: 'start', to: 'waypoint' },
      { from: 'waypoint', to: 'monitor' },
      { from: 'monitor', to: 'anomaly' },
      { from: 'anomaly', to: 'investigate', label: 'Yes' },
      { from: 'anomaly', to: 'next', label: 'No' },
      { from: 'investigate', to: 'report' },
      { from: 'report', to: 'next' },
      { from: 'next', to: 'waypoint', label: 'Yes' },
      { from: 'next', to: 'complete', label: 'No' }
    ]
  },
  CONTESTED_LOGISTICS: {
    name: "Contested Logistics",
    category: "LOGISTICS",
    nodes: [
      { id: 'launch', type: 'trigger', label: 'Mission Start', position: { x: 50, y: 150 } },
      { id: 'passive_scan', type: 'sense', label: 'Passive ESM Scan', position: { x: 200, y: 150 } },
      { id: 'threat_check', type: 'decision', label: 'Threat Detected?', position: { x: 350, y: 150 } },
      { id: 'evade', type: 'action', label: 'Evasion Maneuver', position: { x: 350, y: 280 } },
      { id: 'clear_check', type: 'decision', label: 'Route Clear?', position: { x: 500, y: 150 } },
      { id: 'fog_check', type: 'decision', label: 'Fog Bank Available?', position: { x: 500, y: 280 } },
      { id: 'radar_burst', type: 'action', label: 'Radar Burst (Fog Only)', position: { x: 650, y: 280 } },
      { id: 'transit', type: 'action', label: 'Silent Transit', position: { x: 650, y: 150 } },
      { id: 'destination', type: 'decision', label: 'Near Destination?', position: { x: 800, y: 150 } },
      { id: 'deliver', type: 'end', label: 'Deliver Payload', position: { x: 950, y: 150 } }
    ],
    connections: [
      { from: 'launch', to: 'passive_scan' },
      { from: 'passive_scan', to: 'threat_check' },
      { from: 'threat_check', to: 'evade', label: 'Yes' },
      { from: 'threat_check', to: 'clear_check', label: 'No' },
      { from: 'evade', to: 'passive_scan' },
      { from: 'clear_check', to: 'transit', label: 'Yes' },
      { from: 'clear_check', to: 'fog_check', label: 'No - Need Nav' },
      { from: 'fog_check', to: 'radar_burst', label: 'Yes' },
      { from: 'fog_check', to: 'evade', label: 'No - Stay Silent' },
      { from: 'radar_burst', to: 'transit' },
      { from: 'transit', to: 'destination' },
      { from: 'destination', to: 'deliver', label: 'Yes' },
      { from: 'destination', to: 'passive_scan', label: 'No' }
    ],
    loopBack: { from: 'destination', to: 'passive_scan', label: 'Continue Transit' }
  },
  SEA_DENIAL: {
    name: "Sea Denial",
    category: "SEA_CONTROL",
    nodes: [
      { id: 'deploy', type: 'trigger', label: 'Deploy to Zone', position: { x: 50, y: 150 } },
      { id: 'patrol', type: 'action', label: 'Patrol Zone', position: { x: 200, y: 150 } },
      { id: 'scan', type: 'sense', label: 'Active Scan', position: { x: 350, y: 150 } },
      { id: 'contact', type: 'decision', label: 'Contact in Zone?', position: { x: 500, y: 150 } },
      { id: 'classify', type: 'orient', label: 'Classify Target', position: { x: 650, y: 100 } },
      { id: 'hostile', type: 'decision', label: 'Hostile/Violator?', position: { x: 800, y: 100 } },
      { id: 'intercept', type: 'action', label: 'Intercept', position: { x: 950, y: 50 } },
      { id: 'engage', type: 'action', label: 'Engage & Destroy', position: { x: 1100, y: 50 } },
      { id: 'confirm_kill', type: 'decision', label: 'Kill Confirmed?', position: { x: 1250, y: 50 } },
      { id: 'reattack', type: 'action', label: 'Re-attack', position: { x: 1250, y: 180 } },
      { id: 'log', type: 'action', label: 'Log & Report', position: { x: 800, y: 250 } },
      { id: 'resume', type: 'end', label: 'Resume Patrol', position: { x: 500, y: 300 } }
    ],
    connections: [
      { from: 'deploy', to: 'patrol' },
      { from: 'patrol', to: 'scan' },
      { from: 'scan', to: 'contact' },
      { from: 'contact', to: 'classify', label: 'Yes' },
      { from: 'contact', to: 'patrol', label: 'No' },
      { from: 'classify', to: 'hostile' },
      { from: 'hostile', to: 'intercept', label: 'Yes' },
      { from: 'hostile', to: 'log', label: 'No - Friendly' },
      { from: 'intercept', to: 'engage' },
      { from: 'engage', to: 'confirm_kill' },
      { from: 'confirm_kill', to: 'log', label: 'Yes' },
      { from: 'confirm_kill', to: 'reattack', label: 'No' },
      { from: 'reattack', to: 'engage' },
      { from: 'log', to: 'resume' }
    ],
    loopBack: { from: 'resume', to: 'patrol', label: 'Continue Patrol' }
  },
  ESCORT: {
    name: "Escort Protection",
    category: "ESCORT",
    nodes: [
      { id: 'form', type: 'trigger', label: 'Form Screen', position: { x: 50, y: 150 } },
      { id: 'screen', type: 'action', label: 'Maintain Screen', position: { x: 200, y: 150 } },
      { id: 'scan', type: 'sense', label: '360° Scan', position: { x: 350, y: 150 } },
      { id: 'threat', type: 'decision', label: 'Threat Detected?', position: { x: 500, y: 150 } },
      { id: 'vector', type: 'orient', label: 'Vector Escort', position: { x: 650, y: 100 } },
      { id: 'intercept', type: 'action', label: 'Intercept Threat', position: { x: 800, y: 100 } },
      { id: 'engage', type: 'action', label: 'Engage/Absorb', position: { x: 950, y: 100 } },
      { id: 'neutralized', type: 'decision', label: 'Threat Neutralized?', position: { x: 1100, y: 100 } },
      { id: 'sacrifice', type: 'action', label: 'Ram/Sacrifice', position: { x: 1100, y: 230 } },
      { id: 'screen_check', type: 'decision', label: 'Screen Intact?', position: { x: 650, y: 280 } },
      { id: 'collapse', type: 'action', label: 'Collapse Screen', position: { x: 800, y: 280 } },
      { id: 'hvu_check', type: 'decision', label: 'HVU Safe?', position: { x: 500, y: 350 } },
      { id: 'arrived', type: 'decision', label: 'HVU Arrived?', position: { x: 350, y: 280 } },
      { id: 'mission_complete', type: 'end', label: 'Mission Complete', position: { x: 200, y: 350 } },
      { id: 'mission_fail', type: 'end', label: 'HVU Lost', position: { x: 500, y: 450 } }
    ],
    connections: [
      { from: 'form', to: 'screen' },
      { from: 'screen', to: 'scan' },
      { from: 'scan', to: 'threat' },
      { from: 'threat', to: 'vector', label: 'Yes' },
      { from: 'threat', to: 'arrived', label: 'No' },
      { from: 'vector', to: 'intercept' },
      { from: 'intercept', to: 'engage' },
      { from: 'engage', to: 'neutralized' },
      { from: 'neutralized', to: 'screen_check', label: 'Yes' },
      { from: 'neutralized', to: 'sacrifice', label: 'No - Last Resort' },
      { from: 'sacrifice', to: 'screen_check' },
      { from: 'screen_check', to: 'screen', label: 'Yes' },
      { from: 'screen_check', to: 'collapse', label: 'No - Losses' },
      { from: 'collapse', to: 'hvu_check' },
      { from: 'hvu_check', to: 'screen', label: 'Yes' },
      { from: 'hvu_check', to: 'mission_fail', label: 'No' },
      { from: 'arrived', to: 'mission_complete', label: 'Yes' },
      { from: 'arrived', to: 'screen', label: 'No' }
    ],
    loopBack: { from: 'screen', to: 'scan', label: 'Continuous Screening' }
  },

  // ============ CNO PRIORITY MISSIONS ============
  SURVEY: {
    name: "Survey & Mapping",
    category: "SURVEY",
    nodes: [
      { id: 'deploy', type: 'trigger', label: 'Deploy to Zone', position: { x: 50, y: 150 } },
      { id: 'transit', type: 'action', label: 'Transit to Area', position: { x: 200, y: 150 } },
      { id: 'survey', type: 'action', label: 'Survey Track', position: { x: 350, y: 150 } },
      { id: 'scan', type: 'sense', label: 'MBES Scan', position: { x: 500, y: 150 } },
      { id: 'anomaly', type: 'decision', label: 'Anomaly?', position: { x: 650, y: 150 } },
      { id: 'investigate', type: 'action', label: 'Investigate', position: { x: 650, y: 280 } },
      { id: 'log', type: 'orient', label: 'Log & Report', position: { x: 800, y: 150 } },
      { id: 'complete', type: 'decision', label: 'Track Complete?', position: { x: 950, y: 150 } },
      { id: 'end', type: 'end', label: 'Survey Complete', position: { x: 1100, y: 150 } }
    ],
    connections: [
      { from: 'deploy', to: 'transit' },
      { from: 'transit', to: 'survey' },
      { from: 'survey', to: 'scan' },
      { from: 'scan', to: 'anomaly' },
      { from: 'anomaly', to: 'log', label: 'No' },
      { from: 'anomaly', to: 'investigate', label: 'Yes' },
      { from: 'investigate', to: 'log' },
      { from: 'log', to: 'complete' },
      { from: 'complete', to: 'end', label: 'Yes' },
      { from: 'complete', to: 'survey', label: 'No' }
    ],
    loopBack: { from: 'survey', to: 'scan', label: 'Continue Survey' }
  },

  MCM: {
    name: "Mine Countermeasures",
    category: "MCM",
    nodes: [
      { id: 'deploy', type: 'trigger', label: 'Deploy to Zone', position: { x: 50, y: 150 } },
      { id: 'search', type: 'action', label: 'Search Pattern', position: { x: 200, y: 150 } },
      { id: 'scan', type: 'sense', label: 'Side-Scan', position: { x: 350, y: 150 } },
      { id: 'contact', type: 'decision', label: 'Contact?', position: { x: 500, y: 150 } },
      { id: 'classify', type: 'orient', label: 'Classify Target', position: { x: 650, y: 150 } },
      { id: 'mine_check', type: 'decision', label: 'Mine?', position: { x: 800, y: 150 } },
      { id: 'mark', type: 'action', label: 'Mark & Report', position: { x: 950, y: 100 } },
      { id: 'continue', type: 'action', label: 'Log & Continue', position: { x: 950, y: 200 } },
      { id: 'area_check', type: 'decision', label: 'Area Clear?', position: { x: 1100, y: 150 } },
      { id: 'end', type: 'end', label: 'MCM Complete', position: { x: 1250, y: 150 } }
    ],
    connections: [
      { from: 'deploy', to: 'search' },
      { from: 'search', to: 'scan' },
      { from: 'scan', to: 'contact' },
      { from: 'contact', to: 'classify', label: 'Yes' },
      { from: 'contact', to: 'area_check', label: 'No' },
      { from: 'classify', to: 'mine_check' },
      { from: 'mine_check', to: 'mark', label: 'Yes' },
      { from: 'mine_check', to: 'continue', label: 'No' },
      { from: 'mark', to: 'area_check' },
      { from: 'continue', to: 'area_check' },
      { from: 'area_check', to: 'end', label: 'Yes' },
      { from: 'area_check', to: 'search', label: 'No' }
    ],
    loopBack: { from: 'search', to: 'scan', label: 'Continue Search' }
  },

  ASW: {
    name: "Anti-Submarine Warfare",
    category: "ASW",
    nodes: [
      { id: 'deploy', type: 'trigger', label: 'Deploy to Zone', position: { x: 50, y: 150 } },
      { id: 'patrol', type: 'action', label: 'Patrol Zone', position: { x: 200, y: 150 } },
      { id: 'listen', type: 'sense', label: 'Passive Scan', position: { x: 350, y: 150 } },
      { id: 'contact', type: 'decision', label: 'Contact in Zone?', position: { x: 500, y: 150 } },
      { id: 'active', type: 'action', label: 'Active Scan', position: { x: 650, y: 200 } },
      { id: 'classify', type: 'orient', label: 'Classify Target', position: { x: 650, y: 100 } },
      { id: 'hostile', type: 'decision', label: 'Hostile/Violation?', position: { x: 800, y: 150 } },
      { id: 'track', type: 'action', label: 'Track & Report', position: { x: 950, y: 100 } },
      { id: 'log', type: 'action', label: 'Log & Resume', position: { x: 950, y: 200 } },
      { id: 'end', type: 'end', label: 'Contact Tracked', position: { x: 1100, y: 100 } }
    ],
    connections: [
      { from: 'deploy', to: 'patrol' },
      { from: 'patrol', to: 'listen' },
      { from: 'listen', to: 'contact' },
      { from: 'contact', to: 'classify', label: 'Yes' },
      { from: 'contact', to: 'patrol', label: 'No' },
      { from: 'classify', to: 'active' },
      { from: 'active', to: 'hostile' },
      { from: 'hostile', to: 'track', label: 'Yes' },
      { from: 'hostile', to: 'log', label: 'No - Friendly' },
      { from: 'track', to: 'end' },
      { from: 'log', to: 'patrol' }
    ],
    loopBack: { from: 'patrol', to: 'listen', label: 'Continuous Monitoring' }
  },

  // ============ AERIAL MISSIONS ============
  AERIAL_ISR: {
    name: "Aerial ISR",
    category: "ISR",
    nodes: [
      { id: 'launch', type: 'trigger', label: 'Launch', position: { x: 50, y: 150 } },
      { id: 'transit', type: 'action', label: 'Transit to AO', position: { x: 200, y: 150 } },
      { id: 'orbit', type: 'action', label: 'Enter Orbit', position: { x: 350, y: 150 } },
      { id: 'scan', type: 'sense', label: 'Sensor Scan', position: { x: 500, y: 150 } },
      { id: 'detect', type: 'decision', label: 'Target Detected?', position: { x: 650, y: 150 } },
      { id: 'classify', type: 'orient', label: 'Classify & Track', position: { x: 800, y: 100 } },
      { id: 'report', type: 'action', label: 'Report Intel', position: { x: 950, y: 100 } },
      { id: 'fuel', type: 'decision', label: 'Fuel State?', position: { x: 650, y: 280 } },
      { id: 'rtb', type: 'end', label: 'RTB', position: { x: 800, y: 280 } }
    ],
    connections: [
      { from: 'launch', to: 'transit' },
      { from: 'transit', to: 'orbit' },
      { from: 'orbit', to: 'scan' },
      { from: 'scan', to: 'detect' },
      { from: 'detect', to: 'classify', label: 'Yes' },
      { from: 'detect', to: 'fuel', label: 'No' },
      { from: 'classify', to: 'report' },
      { from: 'report', to: 'fuel' },
      { from: 'fuel', to: 'scan', label: 'Good' },
      { from: 'fuel', to: 'rtb', label: 'Bingo' }
    ]
  },
  PERSISTENT_MDA: {
    name: "Persistent MDA",
    category: "ISR",
    nodes: [
      { id: 'deploy', type: 'trigger', label: 'Deploy to Station', position: { x: 50, y: 150 } },
      { id: 'station', type: 'action', label: 'Hold Station', position: { x: 200, y: 150 } },
      { id: 'radar', type: 'sense', label: 'Maritime Radar', position: { x: 350, y: 100 } },
      { id: 'ais', type: 'sense', label: 'AIS Correlation', position: { x: 350, y: 200 } },
      { id: 'fuse', type: 'orient', label: 'Fuse Data', position: { x: 500, y: 150 } },
      { id: 'anomaly', type: 'decision', label: 'Anomaly?', position: { x: 650, y: 150 } },
      { id: 'cue', type: 'action', label: 'Cue Surface Assets', position: { x: 800, y: 100 } },
      { id: 'update', type: 'action', label: 'Update COP', position: { x: 800, y: 200 } },
      { id: 'handoff', type: 'decision', label: 'Relief On Station?', position: { x: 950, y: 150 } },
      { id: 'rtb', type: 'end', label: 'RTB', position: { x: 1100, y: 150 } }
    ],
    connections: [
      { from: 'deploy', to: 'station' },
      { from: 'station', to: 'radar' },
      { from: 'station', to: 'ais' },
      { from: 'radar', to: 'fuse' },
      { from: 'ais', to: 'fuse' },
      { from: 'fuse', to: 'anomaly' },
      { from: 'anomaly', to: 'cue', label: 'Yes' },
      { from: 'anomaly', to: 'update', label: 'No' },
      { from: 'cue', to: 'update' },
      { from: 'update', to: 'handoff' },
      { from: 'handoff', to: 'station', label: 'No' },
      { from: 'handoff', to: 'rtb', label: 'Yes' }
    ]
  },
  AERIAL_REFUELING: {
    name: "Aerial Refueling",
    category: "LOGISTICS",
    nodes: [
      { id: 'launch', type: 'trigger', label: 'Launch Tanker', position: { x: 50, y: 150 } },
      { id: 'transit', type: 'action', label: 'Transit to Track', position: { x: 200, y: 150 } },
      { id: 'anchor', type: 'action', label: 'Enter Anchor', position: { x: 350, y: 150 } },
      { id: 'advertise', type: 'action', label: 'Broadcast Availability', position: { x: 500, y: 150 } },
      { id: 'receiver', type: 'decision', label: 'Receiver Inbound?', position: { x: 650, y: 150 } },
      { id: 'rendezvous', type: 'action', label: 'Rendezvous', position: { x: 800, y: 100 } },
      { id: 'refuel', type: 'action', label: 'Transfer Fuel', position: { x: 950, y: 100 } },
      { id: 'complete', type: 'decision', label: 'Transfer Complete?', position: { x: 1100, y: 100 } },
      { id: 'fuel_state', type: 'decision', label: 'Offload Remaining?', position: { x: 650, y: 280 } },
      { id: 'rtb', type: 'end', label: 'RTB', position: { x: 800, y: 280 } }
    ],
    connections: [
      { from: 'launch', to: 'transit' },
      { from: 'transit', to: 'anchor' },
      { from: 'anchor', to: 'advertise' },
      { from: 'advertise', to: 'receiver' },
      { from: 'receiver', to: 'rendezvous', label: 'Yes' },
      { from: 'receiver', to: 'fuel_state', label: 'No' },
      { from: 'rendezvous', to: 'refuel' },
      { from: 'refuel', to: 'complete' },
      { from: 'complete', to: 'fuel_state', label: 'Yes' },
      { from: 'complete', to: 'refuel', label: 'No - Retry' },
      { from: 'fuel_state', to: 'advertise', label: 'Yes' },
      { from: 'fuel_state', to: 'rtb', label: 'No' }
    ]
  },
  TACTICAL_SUPPORT: {
    name: "Tactical Support",
    category: "COMBAT",
    nodes: [
      { id: 'scramble', type: 'trigger', label: 'Scramble', position: { x: 50, y: 150 } },
      { id: 'transit', type: 'action', label: 'Transit to AO', position: { x: 200, y: 150 } },
      { id: 'checkin', type: 'action', label: 'Check-in with JTAC', position: { x: 350, y: 150 } },
      { id: 'hold', type: 'action', label: 'Hold Pattern', position: { x: 500, y: 150 } },
      { id: 'tasking', type: 'decision', label: 'Tasking Received?', position: { x: 650, y: 150 } },
      { id: 'acquire', type: 'sense', label: 'Acquire Target', position: { x: 800, y: 100 } },
      { id: 'confirm', type: 'decision', label: 'Target Confirmed?', position: { x: 950, y: 100 } },
      { id: 'human', type: 'human_checkpoint', label: 'Weapons Release Auth', position: { x: 1100, y: 100 } },
      { id: 'engage', type: 'action', label: 'Engage', position: { x: 1250, y: 100 } },
      { id: 'bda', type: 'action', label: 'BDA Report', position: { x: 1400, y: 100 } },
      { id: 'winchester', type: 'decision', label: 'Winchester?', position: { x: 650, y: 280 } },
      { id: 'rtb', type: 'end', label: 'RTB', position: { x: 800, y: 280 } }
    ],
    connections: [
      { from: 'scramble', to: 'transit' },
      { from: 'transit', to: 'checkin' },
      { from: 'checkin', to: 'hold' },
      { from: 'hold', to: 'tasking' },
      { from: 'tasking', to: 'acquire', label: 'Yes' },
      { from: 'tasking', to: 'winchester', label: 'No' },
      { from: 'acquire', to: 'confirm' },
      { from: 'confirm', to: 'human', label: 'Yes' },
      { from: 'confirm', to: 'hold', label: 'No' },
      { from: 'human', to: 'engage', label: 'Approved' },
      { from: 'human', to: 'hold', label: 'Denied' },
      { from: 'engage', to: 'bda' },
      { from: 'bda', to: 'winchester' },
      { from: 'winchester', to: 'hold', label: 'No' },
      { from: 'winchester', to: 'rtb', label: 'Yes' }
    ]
  },
  COMMS_RELAY: {
    name: "Comms Relay",
    category: "LOGISTICS",
    nodes: [
      { id: 'launch', type: 'trigger', label: 'Launch', position: { x: 50, y: 150 } },
      { id: 'climb', type: 'action', label: 'Climb to Altitude', position: { x: 200, y: 150 } },
      { id: 'station', type: 'action', label: 'Establish Station', position: { x: 350, y: 150 } },
      { id: 'link', type: 'action', label: 'Establish Data Links', position: { x: 500, y: 150 } },
      { id: 'monitor', type: 'sense', label: 'Monitor Link Health', position: { x: 650, y: 150 } },
      { id: 'degraded', type: 'decision', label: 'Link Degraded?', position: { x: 800, y: 150 } },
      { id: 'reposition', type: 'action', label: 'Reposition', position: { x: 950, y: 100 } },
      { id: 'fuel', type: 'decision', label: 'Fuel State?', position: { x: 800, y: 280 } },
      { id: 'handoff', type: 'action', label: 'Handoff to Relief', position: { x: 950, y: 280 } },
      { id: 'rtb', type: 'end', label: 'RTB', position: { x: 1100, y: 280 } }
    ],
    connections: [
      { from: 'launch', to: 'climb' },
      { from: 'climb', to: 'station' },
      { from: 'station', to: 'link' },
      { from: 'link', to: 'monitor' },
      { from: 'monitor', to: 'degraded' },
      { from: 'degraded', to: 'reposition', label: 'Yes' },
      { from: 'degraded', to: 'fuel', label: 'No' },
      { from: 'reposition', to: 'monitor' },
      { from: 'fuel', to: 'monitor', label: 'Good' },
      { from: 'fuel', to: 'handoff', label: 'Bingo' },
      { from: 'handoff', to: 'rtb' }
    ]
  },

  // ============ COMBINED MISSIONS ============
  COMBINED_ISR_DENIAL: {
    name: "Combined ISR + Sea Denial",
    category: "SEA_CONTROL",
    nodes: [
      { id: 'deploy', type: 'trigger', label: 'Deploy Forces', position: { x: 50, y: 150 } },
      { id: 'aerial_station', type: 'action', label: 'Aerial: Enter Orbit', position: { x: 200, y: 80 } },
      { id: 'surface_patrol', type: 'action', label: 'Surface: Patrol Zone', position: { x: 200, y: 220 } },
      { id: 'aerial_scan', type: 'sense', label: 'Wide Area Scan', position: { x: 400, y: 80 } },
      { id: 'surface_scan', type: 'sense', label: 'Close-In Scan', position: { x: 400, y: 220 } },
      { id: 'fuse', type: 'orient', label: 'Fuse Intel', position: { x: 550, y: 150 } },
      { id: 'contact', type: 'decision', label: 'Hostile Contact?', position: { x: 700, y: 150 } },
      { id: 'cue', type: 'action', label: 'Aerial Cues Surface', position: { x: 850, y: 100 } },
      { id: 'intercept', type: 'action', label: 'Surface Intercept', position: { x: 1000, y: 100 } },
      { id: 'engage', type: 'action', label: 'Coordinated Engage', position: { x: 1150, y: 100 } },
      { id: 'bda', type: 'action', label: 'Aerial BDA', position: { x: 1300, y: 100 } },
      { id: 'continue', type: 'decision', label: 'Continue Ops?', position: { x: 700, y: 280 } },
      { id: 'complete', type: 'end', label: 'Mission Complete', position: { x: 850, y: 280 } }
    ],
    connections: [
      { from: 'deploy', to: 'aerial_station' },
      { from: 'deploy', to: 'surface_patrol' },
      { from: 'aerial_station', to: 'aerial_scan' },
      { from: 'surface_patrol', to: 'surface_scan' },
      { from: 'aerial_scan', to: 'fuse' },
      { from: 'surface_scan', to: 'fuse' },
      { from: 'fuse', to: 'contact' },
      { from: 'contact', to: 'cue', label: 'Yes' },
      { from: 'contact', to: 'continue', label: 'No' },
      { from: 'cue', to: 'intercept' },
      { from: 'intercept', to: 'engage' },
      { from: 'engage', to: 'bda' },
      { from: 'bda', to: 'continue' },
      { from: 'continue', to: 'aerial_scan', label: 'Yes' },
      { from: 'continue', to: 'complete', label: 'No' }
    ]
  },
  COMBINED_ASW: {
    name: "Combined ASW",
    category: "DEFENSE",
    nodes: [
      { id: 'deploy', type: 'trigger', label: 'Deploy ASW Package', position: { x: 50, y: 150 } },
      { id: 'aerial_pattern', type: 'action', label: 'Aerial: Sonobuoy Pattern', position: { x: 200, y: 80 } },
      { id: 'surface_search', type: 'action', label: 'Surface: Active Sonar', position: { x: 200, y: 220 } },
      { id: 'aerial_listen', type: 'sense', label: 'Passive Acoustic', position: { x: 400, y: 80 } },
      { id: 'surface_listen', type: 'sense', label: 'Hull/Towed Array', position: { x: 400, y: 220 } },
      { id: 'correlate', type: 'orient', label: 'Correlate Contacts', position: { x: 550, y: 150 } },
      { id: 'sub_contact', type: 'decision', label: 'Submarine Contact?', position: { x: 700, y: 150 } },
      { id: 'localize', type: 'action', label: 'MAD/Dipping Sonar', position: { x: 850, y: 100 } },
      { id: 'prosecute', type: 'decision', label: 'Prosecute?', position: { x: 1000, y: 100 } },
      { id: 'human', type: 'human_checkpoint', label: 'Weapons Auth', position: { x: 1150, y: 100 } },
      { id: 'attack', type: 'action', label: 'Torpedo Attack', position: { x: 1300, y: 100 } },
      { id: 'reattack', type: 'decision', label: 'Kill Confirmed?', position: { x: 1450, y: 100 } },
      { id: 'continue', type: 'decision', label: 'Continue Search?', position: { x: 700, y: 280 } },
      { id: 'complete', type: 'end', label: 'Area Sanitized', position: { x: 850, y: 280 } }
    ],
    connections: [
      { from: 'deploy', to: 'aerial_pattern' },
      { from: 'deploy', to: 'surface_search' },
      { from: 'aerial_pattern', to: 'aerial_listen' },
      { from: 'surface_search', to: 'surface_listen' },
      { from: 'aerial_listen', to: 'correlate' },
      { from: 'surface_listen', to: 'correlate' },
      { from: 'correlate', to: 'sub_contact' },
      { from: 'sub_contact', to: 'localize', label: 'Yes' },
      { from: 'sub_contact', to: 'continue', label: 'No' },
      { from: 'localize', to: 'prosecute' },
      { from: 'prosecute', to: 'human', label: 'Yes' },
      { from: 'prosecute', to: 'continue', label: 'No - Lost' },
      { from: 'human', to: 'attack', label: 'Approved' },
      { from: 'human', to: 'continue', label: 'Denied' },
      { from: 'attack', to: 'reattack' },
      { from: 'reattack', to: 'continue', label: 'Yes' },
      { from: 'reattack', to: 'localize', label: 'No' },
      { from: 'continue', to: 'aerial_listen', label: 'Yes' },
      { from: 'continue', to: 'complete', label: 'No' }
    ]
  },
  COMBINED_ESCORT: {
    name: "Combined Convoy Escort",
    category: "ESCORT",
    nodes: [
      { id: 'form', type: 'trigger', label: 'Form Escort', position: { x: 50, y: 150 } },
      { id: 'aerial_cap', type: 'action', label: 'Aerial: Establish CAP', position: { x: 200, y: 80 } },
      { id: 'surface_screen', type: 'action', label: 'Surface: Form Screen', position: { x: 200, y: 220 } },
      { id: 'aerial_scan', type: 'sense', label: 'Long-Range Scan', position: { x: 400, y: 80 } },
      { id: 'surface_scan', type: 'sense', label: 'Close Screening', position: { x: 400, y: 220 } },
      { id: 'threat', type: 'decision', label: 'Threat Detected?', position: { x: 550, y: 150 } },
      { id: 'classify', type: 'orient', label: 'Classify Threat', position: { x: 700, y: 100 } },
      { id: 'air_threat', type: 'decision', label: 'Air or Surface?', position: { x: 850, y: 100 } },
      { id: 'aerial_intercept', type: 'action', label: 'Aerial Intercept', position: { x: 1000, y: 50 } },
      { id: 'surface_intercept', type: 'action', label: 'Surface Intercept', position: { x: 1000, y: 150 } },
      { id: 'neutralize', type: 'action', label: 'Neutralize', position: { x: 1150, y: 100 } },
      { id: 'hvu_status', type: 'decision', label: 'HVU Status?', position: { x: 550, y: 280 } },
      { id: 'arrived', type: 'decision', label: 'Destination?', position: { x: 400, y: 350 } },
      { id: 'complete', type: 'end', label: 'Escort Complete', position: { x: 250, y: 350 } }
    ],
    connections: [
      { from: 'form', to: 'aerial_cap' },
      { from: 'form', to: 'surface_screen' },
      { from: 'aerial_cap', to: 'aerial_scan' },
      { from: 'surface_screen', to: 'surface_scan' },
      { from: 'aerial_scan', to: 'threat' },
      { from: 'surface_scan', to: 'threat' },
      { from: 'threat', to: 'classify', label: 'Yes' },
      { from: 'threat', to: 'hvu_status', label: 'No' },
      { from: 'classify', to: 'air_threat' },
      { from: 'air_threat', to: 'aerial_intercept', label: 'Air' },
      { from: 'air_threat', to: 'surface_intercept', label: 'Surface' },
      { from: 'aerial_intercept', to: 'neutralize' },
      { from: 'surface_intercept', to: 'neutralize' },
      { from: 'neutralize', to: 'hvu_status' },
      { from: 'hvu_status', to: 'arrived', label: 'Safe' },
      { from: 'arrived', to: 'aerial_scan', label: 'No' },
      { from: 'arrived', to: 'complete', label: 'Yes' }
    ]
  },
  COMBINED_STRIKE: {
    name: "Strike Package",
    category: "COMBAT",
    nodes: [
      { id: 'mission_brief', type: 'trigger', label: 'Mission Brief', position: { x: 50, y: 150 } },
      { id: 'aerial_launch', type: 'action', label: 'Aerial: Launch Strike', position: { x: 200, y: 80 } },
      { id: 'surface_position', type: 'action', label: 'Surface: Move to FP', position: { x: 200, y: 220 } },
      { id: 'aerial_ingress', type: 'action', label: 'Ingress to Target', position: { x: 400, y: 80 } },
      { id: 'surface_standby', type: 'action', label: 'Standby for BDA', position: { x: 400, y: 220 } },
      { id: 'aerial_acquire', type: 'sense', label: 'Acquire Target', position: { x: 550, y: 80 } },
      { id: 'confirm', type: 'decision', label: 'Target Confirmed?', position: { x: 700, y: 80 } },
      { id: 'human', type: 'human_checkpoint', label: 'Strike Auth', position: { x: 850, y: 80 } },
      { id: 'aerial_strike', type: 'action', label: 'Aerial Strike', position: { x: 1000, y: 80 } },
      { id: 'bda', type: 'sense', label: 'Aerial BDA', position: { x: 1150, y: 80 } },
      { id: 'effective', type: 'decision', label: 'Strike Effective?', position: { x: 1300, y: 150 } },
      { id: 'surface_strike', type: 'action', label: 'Surface Follow-Up', position: { x: 1300, y: 280 } },
      { id: 'complete', type: 'end', label: 'Target Destroyed', position: { x: 1450, y: 150 } }
    ],
    connections: [
      { from: 'mission_brief', to: 'aerial_launch' },
      { from: 'mission_brief', to: 'surface_position' },
      { from: 'aerial_launch', to: 'aerial_ingress' },
      { from: 'surface_position', to: 'surface_standby' },
      { from: 'aerial_ingress', to: 'aerial_acquire' },
      { from: 'aerial_acquire', to: 'confirm' },
      { from: 'confirm', to: 'human', label: 'Yes' },
      { from: 'confirm', to: 'aerial_ingress', label: 'No - Reacquire' },
      { from: 'human', to: 'aerial_strike', label: 'Approved' },
      { from: 'aerial_strike', to: 'bda' },
      { from: 'bda', to: 'effective' },
      { from: 'surface_standby', to: 'effective' },
      { from: 'effective', to: 'complete', label: 'Yes' },
      { from: 'effective', to: 'surface_strike', label: 'No' },
      { from: 'surface_strike', to: 'complete' }
    ]
  }
};

// Node type colors for the flow builder
export const nodeTypeColors = {
  trigger: '#3b82f6',      // blue
  sense: '#06b6d4',        // cyan
  observe: '#06b6d4',      // cyan
  orient: '#8b5cf6',       // purple
  decide: '#fbbf24',       // yellow
  decision: '#fbbf24',     // yellow
  action: '#cbfd00',       // lime
  human_checkpoint: '#f97316', // orange
  end: '#4ade80'           // green
};

// Mission categories for grouping templates
export const missionCategories = {
  COMBAT: { name: 'Combat Operations', icon: Target, color: '#ef4444' },
  DEFENSE: { name: 'Defensive Operations', icon: Shield, color: '#f97316' },
  SEA_CONTROL: { name: 'Sea Control & Denial', icon: Ban, color: '#dc2626' },
  ISR: { name: 'ISR & Surveillance', icon: Eye, color: '#06b6d4' },
  SAR: { name: 'Search & Rescue', icon: Anchor, color: '#4ade80' },
  LOGISTICS: { name: 'Contested Logistics', icon: Ship, color: '#8b5cf6' },
  ESCORT: { name: 'Convoy & Escort', icon: Users, color: '#eab308' }
};

export default {
  engineeringStacks,
  individualCapabilities,
  capabilityCategories,
  squadrons,
  missions,
  missionObjectives,
  missionFlowTemplates,
  nodeTypeColors,
  missionCategories
};