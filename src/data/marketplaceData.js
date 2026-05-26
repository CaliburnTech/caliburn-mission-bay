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
  Cpu,
  Wifi
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
    missionTags: ["Sea Denial", "Electronic Warfare", "PORT_SECURITY"]
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
    missionTags: ["Force Protection", "ISR Operations", "PORT_SECURITY"]
  }
];

export const individualCapabilities = [
    {
      name: "TempestOS Core Platform",
      provider: "Caliburn",
      type: "Operating System",
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
      missionTags: ["PORT_SECURITY"],
      bannerImage: "https://cdn.northropgrumman.com/-/media/NEWS/Imports/Northrop-Grumman-to-Manufacture-US-Marine-Corps-Next-Generation-Handheld-Targeting-System_hero.jpg"
    },
    {
      name: "Scion ESM Suite",
      provider: "Northrop Grumman",
      type: "Electronic Warfare",
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
      },
      missionTags: ["PORT_SECURITY"]
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
      },
      missionTags: ["PORT_SECURITY"]
    },
    {
      name: "Advanced Towed Sonar",
      provider: "General Dynamics",
      type: "Sonar System",
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
      },
      missionTags: ["PORT_SECURITY"]
    },
    {
      name: "Towed Hydrophone Array",
      provider: "OceanSonics",
      type: "Passive Acoustic Sensor",
      description: "Towed passive hydrophone array for wide-area acoustic surveillance and contact classification.",
      capabilities: ["Passive Contact Detection", "Acoustic Classification", "Bearing Estimation"],
      trl: "TRL 9",
      icon: TowedSonarIcon,
      category: "ACOUSTIC/SONAR",
      swap: {
        weight: 85,
        power: 0.3,
        size: "medium"
      },
      statImpacts: {
        speed: -3,
        power: -2,
        weight: 4,
        range: 0,
        stealth: 5
      },
      missionTags: ["PORT_SECURITY"]
    },
    {
      name: "OrbComm ST 6100",
      provider: "OrbComm",
      type: "Satellite IoT Terminal",
      description: "Low-power L-band satellite terminal providing two-way store-and-forward messaging in DDIL environments.",
      capabilities: ["L-band SATCOM", "Store-and-Forward", "DDIL Messaging", "Position Reporting"],
      trl: "TRL 9",
      icon: AntennaIcon,
      category: "SATCOM",
      swap: {
        weight: 4,
        power: 0.12,
        size: "small"
      },
      statImpacts: {
        speed: 0,
        power: -1,
        weight: 0,
        range: 15,
        stealth: -2
      },
      missionTags: ["PORT_SECURITY"]
    },
    {
      name: "MOOS-IvP",
      provider: "MIT LAMSS",
      type: "Autonomy Middleware",
      description: "Mission-oriented operating suite with interval programming for multi-objective autonomous behavior arbitration.",
      capabilities: ["Multi-Objective Optimization", "Behavior Arbitration", "Helm Autonomy", "Mission Scripting"],
      trl: "TRL 8",
      icon: Cpu,
      category: "UNMANNED SYSTEMS",
      swap: {
        weight: 0,
        power: 0.05,
        size: "small"
      },
      statImpacts: {
        speed: 0,
        power: 0,
        weight: 0,
        range: 5,
        stealth: 0
      },
      missionTags: ["PORT_SECURITY"]
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
      },
      missionTags: ["PORT_SECURITY"]
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
      },
      missionTags: ["PORT_SECURITY"]
    },
    {
      name: "Marine AI Navigation System",
      provider: "Marine AI",
      type: "Autonomous Navigation",
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
      },
      missionTags: ["PORT_SECURITY"]
    },
    {
      name: "Advanced EO/IR Camera System",
      provider: "FLIR Systems",
      type: "Optical Sensor",
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
      },
      missionTags: ["PORT_SECURITY"]
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
      },
      missionTags: ["PORT_SECURITY"]
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
      missionTags: ["PORT_SECURITY"],
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
      missionTags: ["PORT_SECURITY"],
      bannerImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"
    },
    {
      name: "Peplink MAX BR1 Mini",
      provider: "Peplink",
      type: "Ruggedized Mobile Router",
      description: "Industrial-grade cellular router with SpeedFusion VPN, hot failover, and fleet management. CAT-7 LTE with 3G fallback, dual-band WiFi, and GPS. Built for harsh environments requiring always-on connectivity.",
      capabilities: [
        "CAT-7 LTE Cellular",
        "SpeedFusion VPN",
        "Hot Failover",
        "GPS Fleet Tracking",
        "WiFi AP/Client",
        "Cloud Management"
      ],
      trl: "TRL 9",
      icon: Wifi,
      category: "RF COMMUNICATIONS",
      swap: {
        weight: 0.5,
        power: 0.024,     // 12V 2A = 24W max
        size: "small"
      },
      statImpacts: {
        speed: 0,
        power: -1,
        weight: 0,
        range: 0,
        stealth: -3       // Cellular RF emissions
      },
      securityLevel: ["AES-256 Encryption", "Stateful Firewall", "DoS Prevention"],
      securityIcons: ["encrypted"],
      specs: {
        cellular: "CAT-7 LTE (300 Mbps down / 150 Mbps up), 3G fallback",
        bands: "B2, B4, B5, B7, B12, B13, B14, B25, B26, B41, B42, B43, B48, B66, B71",
        wifi: "802.11 a/b/g/n/ac dual-band",
        ethernet: "Ethernet WAN + LAN with VLAN support",
        vpn: "SpeedFusion site-to-site, IPsec, 256-bit AES",
        gps: "Built-in GPS with fleet management via InControl 2",
        management: "InControl 2 cloud management, SNMP v1/v2c/v3",
        qos: "Application-aware QoS with bandwidth prioritization",
        failover: "Hot Failover — seamless connection transitions",
        power: "12V DC, vehicle adapter available",
        mounting: "DIN rail mount option",
        privateLTE: "CAT-7 modem supports private LTE network operation"
      },
      detailedDescription: "The Peplink MAX BR1 Mini (HW3) is an industrial-grade mobile router designed for deployments requiring reliable cellular connectivity in harsh environments. It features SpeedFusion VPN technology for bonding multiple WAN connections with hot failover — connections transition without interruption.\n\nThe built-in CAT-7 LTE modem supports all major US carrier bands (AT&T, T-Mobile, Verizon, FirstNet) with 3G fallback. Dual-band 802.11ac WiFi can operate as an access point or WiFi WAN client. InControl 2 cloud management enables remote fleet monitoring and configuration.\n\nFor autonomous maritime platforms, the BR1 Mini provides the primary cellular backhaul when in coastal range, with GPS tracking for fleet awareness. The ruggedized form factor and DIN rail mounting make it suitable for vessel installation. SpeedFusion smoothing technology improves real-time application performance over unreliable cellular links.",
      keyFeatures: [
        "Industrial-grade ruggedized enclosure",
        "CAT-7 LTE with all major US carrier bands",
        "SpeedFusion VPN bonding with hot failover",
        "Built-in GPS with InControl 2 fleet management",
        "Dual-band 802.11ac WiFi (AP + client mode)",
        "Stateful firewall with DoS prevention",
        "DIN rail mountable for vessel installation",
        "Private LTE network support"
      ],
      integrationNotes: "The BR1 Mini connects to TempestOS via Ethernet LAN, providing cellular WAN backhaul for cloud connectivity. In the SV-2 architecture, it sits in the Equipment/Radios layer alongside other comms hardware (Doodle, Starlink). SpeedFusion VPN tunnels connect to shore-side Peplink devices or cloud instances for secure, bonded connectivity. GPS data is available to TMS via the InControl 2 API.",
      documents: [
        {
          name: "BR1 Mini HW3 Datasheet",
          type: "PDF",
          size: "1.2 MB",
          description: "Complete specifications, band support, and deployment guide",
          url: "#"
        },
        {
          name: "SpeedFusion VPN Configuration Guide",
          type: "PDF",
          size: "0.8 MB",
          description: "VPN setup and failover configuration for maritime deployments",
          url: "#"
        }
      ]
    },
    {
      name: "TAK (Team Awareness Kit)",
      provider: "TAK Product Center / DoD",
      type: "C2 Common Operating Picture",
      description: "Team Awareness Kit — the DoD standard for real-time situational awareness and C2. Cloud TAK server provides the common operating picture; Vehicle TAK client runs on autonomous platforms. CoT (Cursor on Target) messaging enables interoperability across all TAK-equipped assets.",
      capabilities: [
        "Common Operating Picture",
        "Cursor on Target (CoT)",
        "Mission Planning",
        "Geofence Alerts",
        "Track Management",
        "Waypoint Command"
      ],
      trl: "TRL 9",
      icon: Shield,
      category: "C2 SYSTEMS",
      swap: {
        weight: 0,
        power: 0.1,
        size: "small"
      },
      statImpacts: {
        speed: 0,
        power: -1,
        weight: 0,
        range: 0,
        stealth: 0
      },
      securityLevel: ["Government Purpose Rights", "C2 Certified"],
      securityIcons: ["milstd"],
      specs: {
        serverVersion: "TAK Server 4.10",
        clientVersion: "ATAK / WinTAK / Vehicle TAK",
        protocol: "CoT (Cursor on Target) XML",
        transport: "TCP/UDP/Multicast, WebSocket",
        interoperability: "Link-16 via TRAX, JREAP, KML/KLV",
        deployment: "Cloud TAK (AWS/GovCloud) + Vehicle TAK (on-platform)"
      },
      detailedDescription: "TAK is the DoD's standard situational awareness and C2 platform used across all services. The TAK ecosystem includes Cloud TAK Server for the common operating picture, ATAK (Android TAK) for mobile operators, WinTAK for desktop operations, and Vehicle TAK for autonomous platform integration.\n\nIn the Caliburn architecture, Cloud TAK Server hosts the COP and receives position reports, sensor data, and alerts from all deployed assets. Vehicle TAK runs on each autonomous platform within TempestOS, translating between CoT messaging and the Tempest Messaging Service (TMS) pub/sub bus.\n\nTAK enables mission planning, geofence monitoring, track management, and waypoint command — all through a standardized CoT message format that ensures interoperability across the entire fleet.",
      keyFeatures: [
        "DoD standard C2 platform — used across all services",
        "Cloud TAK Server provides shared COP",
        "Vehicle TAK client integrates with TempestOS/TMS",
        "CoT messaging for universal interoperability",
        "Geofence alerts and notification triggers",
        "WebSocket and multicast transport options"
      ],
      integrationNotes: "Vehicle TAK runs as a containerized service within TempestOS. It subscribes to TMS channels for sensor data and vehicle telemetry, translates to CoT messages, and publishes to Cloud TAK Server. Commands from operators flow in reverse: Cloud TAK → Vehicle TAK → TMS → MOOS-IvP/HAL.",
      documents: [
        {
          name: "TAK Server Administration Guide",
          type: "PDF",
          size: "2.1 MB",
          description: "Cloud TAK Server setup, configuration, and administration",
          url: "#"
        },
        {
          name: "CoT Message Specification",
          type: "PDF",
          size: "0.8 MB",
          description: "Cursor on Target XML schema and message types",
          url: "#"
        }
      ]
    },
    {
      name: "SNC TRAX",
      provider: "Sierra Nevada Corporation",
      type: "Tactical Data Link Gateway",
      description: "Tactical Radio Application Extension (TRAX) routes data between incompatible hardware and software applications with bi-directional translation across 21 data protocols. Combat-proven with 100K+ global users across 60+ disparate systems.",
      category: "C2 SYSTEMS",
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
    {
      name: "SNC Hippocamp",
      provider: "Sierra Nevada Corporation",
      type: "Universal Autonomy Retrofit",
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
    {
      name: "MYSTIC Vision Enhancement",
      provider: "Absentia Technologies",
      type: "AI Software",
      description: "Physics-informed AI software for real-time enhancement of degraded visual sensor feeds (EO, IR, thermal, SAR).",
      capabilities: [
        "Low-Light Enhancement",
        "Fog/Smoke Removal",
        "Object Detection",
        "Image Restoration",
        "Thermal Feed Enhancement",
        "SAR Image Processing"
      ],
      trl: "TRL 5-6",
      icon: Eye,
      category: "EO/IR SENSORS",
      swap: {
        weight: 0,
        power: 0.25,
        size: "small"
      },
      statImpacts: {
        speed: 0,
        power: -1,
        weight: 0,
        range: 0,
        stealth: 0
      },
      securityLevel: ["GPU-Accelerated Edge Compute"],
      securityIcons: [],
      specs: {
        power: "50–250 W (host-dependent, GPU-accelerated)",
        weight: "0 kg (software payload)",
        latency: "<50 ms real-time processing",
        sensorTypes: "EO, IR, Thermal, SAR",
        deployment: "Edge compute, containerized",
        processing: "Physics-informed AI models"
      },
      detailedDescription: "Absentia MYSTIC is a physics-informed AI software suite designed for real-time enhancement of degraded visual sensor feeds across electro-optical, infrared, thermal, and synthetic aperture radar modalities.\n\nMYSTIC leverages physics-based models combined with deep learning to restore and enhance imagery degraded by environmental conditions including low-light, fog, smoke, rain, and other obscurants. The system operates at the edge with sub-50ms latency, enabling real-time situational awareness in conditions that would otherwise render visual sensors ineffective.\n\nAs a pure software payload with zero weight impact, MYSTIC deploys on existing GPU-accelerated edge compute infrastructure with typical power draw of 50–250W depending on host configuration.",
      keyFeatures: [
        "Physics-informed AI for sensor feed enhancement",
        "Real-time processing with <50 ms latency",
        "Zero weight impact — pure software payload",
        "Multi-modal: EO, IR, thermal, and SAR support",
        "Low-light, fog, smoke, and obscurant removal",
        "GPU-accelerated edge compute deployment",
        "Automated object detection in degraded conditions"
      ],
      integrationNotes: "MYSTIC deploys as a containerized workload on TempestOS or any GPU-equipped edge compute platform. Processes raw sensor feeds in-line, providing enhanced imagery to downstream systems including Guardian AI targeting and operator displays.",
      missionTags: ["Vision Enhancement", "Sensor Processing", "AI Perception"],
      providerLogo: "/providers/absentia/assets/AT_LOGO_A.svg",
      bannerImage: "/providers/absentia/assets/banners/MYSTIC_banner.svg"
    },
  // ============ SONAR & UNDERSEA WARFARE ============
  {
    name: "Northrop Grumman µSAS",
    provider: "Northrop Grumman",
    type: "Synthetic Aperture Sonar",
    description: "Low-SWaP interferometric Synthetic Aperture Sonar payload for UUV-mounted minehunting. Produces high-resolution 2D SAS imagery and 3D bathymetric imagery in real-time or post-mission. Information Assurance / Anti-Tamper enabled.",
    capabilities: [
      "High-resolution 2D SAS imagery",
      "3D bathymetric imagery",
      "Real-time onboard processing",
      "Shallow water to full ocean depth",
      "IA/AT enabled",
      "Man-portable (µSAS-SV24) and large UUV (µSAS-MV) variants"
    ],
    trl: "TRL 9",
    icon: TowedSonarIcon,
    category: "ACOUSTIC/SONAR",
    swap: {
      weight: 25,
      power: 0.3,
      size: "small"
    },
    statImpacts: {
      speed: -1,
      power: -2,
      weight: 2,
      range: 0,
      stealth: -1
    },
    securityLevel: ["IA Enabled", "Anti-Tamper"],
    securityIcons: ["encrypted", "hardened"],
    specs: {
      sonarType: "Interferometric Synthetic Aperture Sonar (SAS)",
      formFactor: "Low-SWaP UUV payload",
      depthRange: "Shallow water to full ocean depth",
      processing: "Real-time onboard or post-mission",
      output: "High-resolution 2D SAS + 3D bathymetric imagery",
      variants: "µSAS-MV (large UUV / submarine), µSAS-SV24 (man-portable class)"
    },
    keyFeatures: [
      "Captured highest-resolution images of USS Monitor wreck (NOAA collaboration)",
      "Compatible with L3Harris IVER3-580, HII/REMUS 6000, and submarines",
      "IA/AT enabled for classified operations",
      "Low-SWaP — fits man-portable class UUVs"
    ],
    missionTags: ["Anti-Submarine Warfare", "Sea Control"]
  },
  {
    name: "Thales CAPTAS-4",
    provider: "Thales",
    type: "Variable Depth Sonar — Towed Array",
    description: "CAPTAS-4 Combined Active Passive Towed Array Sonar with detection range to the 2nd convergence zone (~150 km). Operational on 18 navies, 100+ units ordered or in service. Compact variant offers 20% weight reduction and 50% smaller footprint.",
    capabilities: [
      "Active and passive sonar modes",
      "Detection to 2nd convergence zone (~150 km)",
      "Wide FM, CW, and COMBO pulse types",
      "Sea State 6 operational limit",
      "Variable depth up to 235 m",
      "Single or dual tow configuration"
    ],
    trl: "TRL 9",
    icon: TowedSonarIcon,
    category: "ACOUSTIC/SONAR",
    swap: {
      weight: 8000,
      power: 15,
      size: "large"
    },
    statImpacts: {
      speed: -3,
      power: -10,
      weight: 5,
      range: 5,
      stealth: -2
    },
    securityLevel: ["NATO Qualified", "18 Navies Operational"],
    securityIcons: ["nato"],
    specs: {
      transmitterRings: "4 free-flooded rings",
      activeFrequency: "Below 2 kHz",
      transmitBandwidth: "Wide FM",
      pulseTypes: "FM, CW, COMBO",
      operationalDepth: "Up to 235 m",
      detectionRange: "Up to 2nd convergence zone (~150 km)",
      seaStateLimit: "Sea State 6",
      towingConfig: "Single tow or dual tow"
    },
    keyFeatures: [
      "US Navy selected CAPTAS-4 transmitter for ASW Escort Mission Requirement",
      "Compact variant: 20% weight reduction, 50% smaller footprint vs standard",
      "Operational on frigates, destroyers, corvettes, and patrol vessels",
      "18 navies — 100+ units ordered or in service"
    ],
    missionTags: ["Anti-Submarine Warfare", "Sea Control"]
  },
  {
    name: "TB-37 Multi-Function Towed Array",
    provider: "Lockheed Martin",
    type: "Active/Passive Towed Array Sonar",
    description: "US Navy TB-37 Multi-Function Towed Array (MFTA), component of the AN/SQQ-89(V) undersea warfare combat system. Active and passive modes across multiple ocean thermal layers. Operational on Arleigh Burke DDGs, Ticonderoga CGs, and LCS.",
    capabilities: [
      "Active and passive sonar modes",
      "Multi-layer depth capability",
      "AN/SQQ-89(V) combat system integration",
      "Arleigh Burke and LCS compatible"
    ],
    trl: "TRL 9",
    icon: TowedSonarIcon,
    category: "ACOUSTIC/SONAR",
    swap: {
      weight: 3000,
      power: 8,
      size: "large"
    },
    statImpacts: {
      speed: -2,
      power: -8,
      weight: 4,
      range: 4,
      stealth: -2
    },
    securityLevel: ["US Navy Program of Record"],
    securityIcons: ["hardened"],
    specs: {
      arrayDiameter: "3 inches",
      sonarModes: "Active and passive",
      depthCapability: "Variable — multiple ocean thermal layers",
      combatSystem: "AN/SQQ-89(V) USW/ASW Combat System",
      designation: "TB-37 / AN/SQQ-89(V) component"
    },
    missionTags: ["Anti-Submarine Warfare", "Sea Control"]
  },
  {
    name: "AN/UYQ-100 USW-DSS",
    provider: "Leidos",
    type: "ASW Command and Control Software",
    description: "Undersea Warfare Decision Support System. Open-architecture ASW C2 software deployed on 35+ ships and carriers since 2010. Integrates sensor tracks, TDAs, and environmental analysis across Carrier Strike Groups via GCCS-M, Link-11, and Link-16.",
    capabilities: [
      "ASW search planning and execution",
      "Multi-platform sensor track fusion",
      "Environmental analysis and modeling",
      "Force management and coordination",
      "Search execution MOE",
      "ASW briefing support"
    ],
    trl: "TRL 9",
    icon: Brain,
    category: "COMMAND & CONTROL",
    swap: {
      weight: 0,
      power: 0.5,
      size: "small"
    },
    statImpacts: {
      speed: 0,
      power: -1,
      weight: 0,
      range: 3,
      stealth: 0
    },
    securityLevel: ["US Navy Program of Record", "CANES Hardware"],
    securityIcons: ["hardened", "encrypted"],
    specs: {
      designation: "AN/UYQ-100",
      hardware: "CANES (Consolidated Afloat Network and Enterprise Services)",
      architecture: "Open-architecture software",
      interfaces: "GCCS-M, Link-11, Link-16, AN/SQQ-89, CV-TSC",
      deployment: "35+ ships and carriers, 3 shore commands, 5 training sites",
      operational: "Since 2010"
    },
    keyFeatures: [
      "Deployed on CVN, CG, DDG Carrier Strike Groups",
      "Networked tactical picture combining sensor tracks and TDAs",
      "Collaborative ASW search planning across distributed forces",
      "SURTASS ship and Destroyer Squadron staff integration"
    ],
    missionTags: ["Anti-Submarine Warfare", "Sea Control"]
  },
  // ============ KINETIC WEAPONS ============
  {
    name: "Thales MEA Supercavitating Ammunition",
    provider: "Thales",
    type: "Dual-Environment Ammunition",
    description: "Supercavitating Multi-Environment Ammunition effective both in air and underwater. Spin-stabilized in air, cavity-stabilized underwater. Available in 7.62mm to 30mm calibers. 12.7mm penetrates steel targets to 60m depth.",
    capabilities: [
      "Air and underwater engagement",
      "Supercavitation at depth",
      "Steel penetration to 60m (12.7mm)",
      "Multiple calibers: 7.62mm, 12.7mm, 20mm, 25mm, 30mm",
      "Anti-diver capability",
      "Dual-environment threat neutralization"
    ],
    trl: "TRL 9",
    icon: Target,
    category: "KINETIC WEAPONS",
    swap: {
      weight: 50,
      power: 0,
      size: "small"
    },
    statImpacts: {
      speed: 0,
      power: 0,
      weight: 3,
      range: 0,
      stealth: -1
    },
    specs: {
      calibers: "7.62mm, 12.7mm, 20mm, 25mm, 30mm",
      airBehavior: "Spin-stabilized",
      underwaterBehavior: "Cavity-stabilized (supercavitation)",
      underwaterPenetration: "Up to 60m depth (12.7mm vs steel)"
    },
    missionTags: ["Sea Denial", "Sea Control"]
  },
  {
    name: "Hanwha CTM-MR / CTM-ASBM",
    provider: "Hanwha Aerospace",
    type: "Precision-Guided Rocket System",
    description: "Hanwha High-Performance Rocket System family. CTM-MR: 50–160 km range, ~9m CEP. CTM-ASBM: IIR-guided anti-ship variant with 20%+ increased warhead, production target 2027. Fires in Sea State 5 from naval deck mount (HPMRL).",
    capabilities: [
      "50–160 km strike range (CTM-MR)",
      "~9 m CEP precision guidance",
      "Anti-ship IIR seeker (CTM-ASBM)",
      "GPS + inertial guidance",
      "Sea State 5 naval deck launch",
      "C-130 transportable launcher"
    ],
    trl: "TRL 7",
    icon: SM6MissileIcon,
    category: "KINETIC WEAPONS",
    swap: {
      weight: 2000,
      power: 1.0,
      size: "large"
    },
    statImpacts: {
      speed: -2,
      power: -3,
      weight: 5,
      range: 0,
      stealth: -3
    },
    specs: {
      diameter: "280 mm",
      rangeCTMMR: "50–160 km",
      guidance: "GPS + inertial",
      cep: "~9 m",
      ctmASBMSeeker: "IIR (imaging infrared) anti-ship",
      launcherSystem: "HPMRL — naval deck-mounted, fires in Sea State 5",
      ctmASBMStatus: "Development — production target ~2027"
    },
    keyFeatures: [
      "CTM-ASBM anti-ship seeker with 20%+ larger warhead vs CGR-080",
      "HPMRL naval launcher fires in Sea State 5",
      "Launcher system weight 19t, C-130 transportable",
      "Partnered with Saildrone for Spectre platform integration"
    ],
    missionTags: ["Sea Denial", "Sea Control"]
  },
  // ============ AIRBORNE / TETHERED ISR ============
  {
    name: "DPI VULTURE Tethered UAS",
    provider: "Dragonfly Pictures (DPI)",
    type: "Maritime Tethered UAS",
    description: "Shipboard tethered UAS extending radio line-of-sight from ~8 miles to ~30 miles at 500 ft AGL. Unlimited endurance via tether power. Deployed by US Navy and USCG. Rated for 30g vibration, indirect shell explosions, salt fog.",
    capabilities: [
      "500 ft AGL — 4× LOS communications range extension",
      "Unlimited endurance (tether-powered)",
      "35+ knot wind tolerance",
      "15 lb payload capacity",
      "RSS R/T 1944 and MIDS JTRS Link 16 payloads",
      "< 3 minute deploy/retrieve",
      "Ruggedized for shipboard environment"
    ],
    trl: "TRL 9",
    icon: Eye,
    category: "EO/IR SENSORS",
    swap: {
      weight: 4500,
      power: 225,
      size: "large"
    },
    statImpacts: {
      speed: -1,
      power: -15,
      weight: 4,
      range: 5,
      stealth: -2
    },
    securityLevel: ["USN Qualified", "USCG Qualified", "ISO 9001:2015"],
    securityIcons: ["hardened"],
    specs: {
      maxAltitude: "500 ft AGL",
      windTolerance: "35+ knots",
      payloadCapacity: "15 lbs (6.8 kg)",
      deployRetrieve: "< 3 minutes",
      endurance: "Unlimited (tether-powered)",
      batteryBackup: "5 min flight time",
      shipboardPower: "440 VAC 3-phase Delta",
      powerConsumption: "< 225 kW",
      uavConfig: "8× 29\" rotors",
      commsRangeExtension: "~8 mi → ~30 mi (4× boost)"
    },
    keyFeatures: [
      "Qualified for US Navy and USCG use",
      "Elevates shipboard radio LOS from ~8 mi to ~30 mi",
      "RSS R/T 1944 and MIDS JTRS Link 16 radio payloads deployed",
      "Auto-retract on landing — ruggedized TRICON container housing",
      "Rated for 30g vibration and indirect shell explosions"
    ],
    missionTags: ["ISR Operations", "PORT_SECURITY", "Sea Control"]
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
  "C2 SYSTEMS": {
    icon: Shield,
    description: "Command and control systems, TAK ecosystem, mission management",
    subcategories: ["C2 SYSTEMS", "TAK", "MISSION MANAGEMENT"]
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
    description: "Sensors, radar, detection, and electronic warfare systems",
    subcategories: ["SENSORS & DETECTION", "RADAR", "SONAR", "IMAGING", "ELECTRONIC WARFARE", "ELECTRONIC SUPPORT", "SIGNALS INTELLIGENCE"]
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
  PORT_SECURITY: {
    id: "port_security",
    name: "Port Security",
    description: "Continuous, low-engagement screening of a defined harbor area against high volumes of mostly legitimate traffic. The autonomous boat is the screener, not the shooter — detection, identification, deterrence presence, and cueing are the core deliverables. Engagement is human-controlled, off-platform.",
    typicalDuration: "4–8 hours (sortie), rotating continuous",
    requiredCapabilities: ["Surface Search Radar", "AIS Tracking", "EO/IR Sensors", "Multi-Sensor Fusion", "Secure Comms to MOC"],
    optionalCapabilities: ["Subsurface Detection", "Counter-UAS RF Detection", "Acoustic Hailer"],
    controlLoop: "SCREEN-INVESTIGATE-CUE: Patrol → Sense → Classify → Investigate → Cue Shore",
    autonomyCeiling: "DAL 3 — tactical observation and screening. Engagement authority stays with shore.",
    sensorPolicy: {
      radar: "Continuous surface search; correlate all returns against AIS",
      ais: "PRIMARY — baseline all traffic, flag missing or spoofed transponders",
      eoIr: "Passive surveillance; active on flagged contacts for visual ID",
      rfSpectrum: "Passive monitoring for drone control frequencies",
      hydrophone: "Passive; cue EOD on subsurface contact"
    },
    escalationTriggers: [
      "Radar return with no AIS in restricted area",
      "AIS signature mismatch on EO/IR",
      "Loitering without apparent purpose near sensitive asset",
      "Evasive maneuvering on approach",
      "Fast inbound vector toward HVA at pier"
    ],
    variants: ["Routine Patrol", "HVA in Port", "Surge", "Choke Point Overwatch"],
    intendedOutcome: "Continuous classified contact log fed to MOC; anomalous contacts investigated and resolved or cued to shore response",
    endCondition: "End of assigned sortie window or relief on station"
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
  PORT_SECURITY: {
    name: "Port Security",
    category: "FORCE_PROTECTION",
    nodes: [
      { id: 'on_station', type: 'trigger', label: 'On Station', position: { x: 50, y: 150 } },
      { id: 'patrol', type: 'action', label: 'Randomized Patrol', position: { x: 200, y: 150 } },
      { id: 'sensor_sweep', type: 'sense', label: 'Sensor Sweep\n(Radar+AIS+EO/IR+RF)', position: { x: 370, y: 150 } },
      { id: 'anomaly', type: 'decision', label: 'Anomaly?', position: { x: 540, y: 150 } },
      { id: 'log_baseline', type: 'action', label: 'Log Baseline', position: { x: 540, y: 290 } },
      { id: 'investigate', type: 'action', label: 'Investigate\n(EO/IR + VHF Hail)', position: { x: 700, y: 100 } },
      { id: 'resolved', type: 'decision', label: 'Resolved?', position: { x: 870, y: 100 } },
      { id: 'log_contact', type: 'action', label: 'Log Contact\n& Resume', position: { x: 870, y: 240 } },
      { id: 'maintain_track', type: 'action', label: 'Maintain Track\n& Standoff', position: { x: 1040, y: 100 } },
      { id: 'cue_moc', type: 'human_checkpoint', label: 'Cue MOC\n(Human Decision)', position: { x: 1040, y: 240 } },
      { id: 'handoff', type: 'end', label: 'Shore Response\nHandoff', position: { x: 1210, y: 170 } }
    ],
    connections: [
      { from: 'on_station', to: 'patrol' },
      { from: 'patrol', to: 'sensor_sweep' },
      { from: 'sensor_sweep', to: 'anomaly' },
      { from: 'anomaly', to: 'investigate', label: 'Yes' },
      { from: 'anomaly', to: 'log_baseline', label: 'No' },
      { from: 'investigate', to: 'resolved' },
      { from: 'resolved', to: 'log_contact', label: 'Yes' },
      { from: 'resolved', to: 'maintain_track', label: 'No' },
      { from: 'maintain_track', to: 'cue_moc' },
      { from: 'cue_moc', to: 'handoff', label: 'Approved' },
      { from: 'cue_moc', to: 'maintain_track', label: 'Hold — Continue Track' }
    ],
    loopBack: { from: 'log_baseline', to: 'patrol', label: 'Continue Patrol' }
  },
  MCM: {
    name: "Mine Countermeasures",
    category: "MCM",
    nodes: [
      { id: 'deploy_auv',    type: 'trigger',          label: 'Deploy Freedom AUV',              position: { x: 50,   y: 150 } },
      { id: 'sas_sweep',     type: 'action',           label: 'SAS Lawnmower Sweep\n(150m swath)', position: { x: 220, y: 150 } },
      { id: 'contact',       type: 'decision',         label: 'Mine Contact?',                   position: { x: 420,  y: 150 } },
      { id: 'classify',      type: 'sense',            label: 'Multi-Aspect\nClassification',    position: { x: 600,  y: 80  } },
      { id: 'confirmed',     type: 'decision',         label: 'Confirmed\nMine?',                position: { x: 780,  y: 80  } },
      { id: 'log_clear',     type: 'action',           label: 'Log — No Mine\nResume Sweep',     position: { x: 600,  y: 280 } },
      { id: 'deploy_marker', type: 'action',           label: 'Deploy Acoustic\nMarker Beacon',  position: { x: 960,  y: 80  } },
      { id: 'cue_horus',     type: 'human_checkpoint', label: 'MOC Authorize\nEngagement',       position: { x: 1130, y: 80  } },
      { id: 'horus_inbound', type: 'action',           label: 'HORUS Inbound\n(Acoustic Homing)',position: { x: 1300, y: 80  } },
      { id: 'engage',        type: 'action',           label: 'Fire Supercavitating\nRound',     position: { x: 1470, y: 80  } },
      { id: 'lane_clear',    type: 'end',              label: 'Lane Clear\n— Notify NAVCENT',    position: { x: 1640, y: 150 } }
    ],
    connections: [
      { from: 'deploy_auv',    to: 'sas_sweep' },
      { from: 'sas_sweep',     to: 'contact' },
      { from: 'contact',       to: 'classify',      label: 'Yes' },
      { from: 'contact',       to: 'log_clear',     label: 'No' },
      { from: 'classify',      to: 'confirmed' },
      { from: 'confirmed',     to: 'deploy_marker', label: 'Yes (>80%)' },
      { from: 'confirmed',     to: 'sas_sweep',     label: 'No — Re-sweep' },
      { from: 'deploy_marker', to: 'cue_horus' },
      { from: 'cue_horus',     to: 'horus_inbound', label: 'Authorized' },
      { from: 'horus_inbound', to: 'engage' },
      { from: 'engage',        to: 'lane_clear' }
    ],
    loopBack: { from: 'log_clear', to: 'sas_sweep', label: 'Continue Sweep' }
  },
  ISR: {
    name: "ISR — Tethered Drone",
    category: "ISR",
    nodes: [
      { id: 'on_station',   type: 'trigger',          label: 'M48 On Station\n(DriveAI Patrol)',       position: { x: 50,   y: 150 } },
      { id: 'lantern_up',   type: 'action',           label: 'Deploy LANTERN\n(200ft Tethered)',       position: { x: 220,  y: 150 } },
      { id: 'sensor_fuse',  type: 'sense',            label: 'Multi-Sensor Sweep\n(RF+Radar+EO/IR)',   position: { x: 410,  y: 150 } },
      { id: 'contact',      type: 'decision',         label: 'Contact?',                               position: { x: 590,  y: 150 } },
      { id: 'scion_class',  type: 'orient',           label: 'Scion AI\nClassification',               position: { x: 760,  y: 80  } },
      { id: 'log_clear',    type: 'action',           label: 'Log — No Threat\nContinue Patrol',       position: { x: 590,  y: 300 } },
      { id: 'threat_conf',  type: 'decision',         label: 'Threat\nConfirmed?',                     position: { x: 930,  y: 80  } },
      { id: 'razor_cue',    type: 'action',           label: 'RazorChassis\nFC Track Generated',       position: { x: 1100, y: 80  } },
      { id: 'human_auth',   type: 'human_checkpoint', label: 'NAVCENT\nWeapons Free',                  position: { x: 1270, y: 80  } },
      { id: 'engage',       type: 'action',           label: 'DDG Engagement\n(ESSM)',                 position: { x: 1440, y: 80  } },
      { id: 'lane_secure',  type: 'end',              label: 'Lane Secure\n— Patrol Resumes',          position: { x: 1610, y: 150 } }
    ],
    connections: [
      { from: 'on_station',  to: 'lantern_up' },
      { from: 'lantern_up',  to: 'sensor_fuse' },
      { from: 'sensor_fuse', to: 'contact' },
      { from: 'contact',     to: 'scion_class',  label: 'Yes' },
      { from: 'contact',     to: 'log_clear',    label: 'No' },
      { from: 'scion_class', to: 'threat_conf' },
      { from: 'threat_conf', to: 'razor_cue',    label: '>85% Confidence' },
      { from: 'threat_conf', to: 'sensor_fuse',  label: 'Inconclusive' },
      { from: 'razor_cue',   to: 'human_auth' },
      { from: 'human_auth',  to: 'engage',       label: 'Authorized' },
      { from: 'human_auth',  to: 'razor_cue',    label: 'Hold — Continue Track' },
      { from: 'engage',      to: 'lane_secure' }
    ],
    loopBack: { from: 'log_clear', to: 'sensor_fuse', label: 'Continue Patrol' }
  },
  ASW: {
    name: "ASW — CAPTAS/MFTA Multistatic + HORUS Mesh",
    category: "ASW",
    nodes: [
      { id: 'deploy',      type: 'trigger',          label: 'Deploy M48 + HORUS\n(CTF-72 Tasking)',        position: { x: 50,   y: 150 } },
      { id: 'captas_ping', type: 'action',            label: 'CAPTAS-4 Active Ping\n(900-2100Hz / 150km)', position: { x: 220,  y: 150 } },
      { id: 'echo_return', type: 'sense',             label: 'Echo Return +\nHORUS Passive',               position: { x: 410,  y: 150 } },
      { id: 'contact',     type: 'decision',          label: 'Contact?',                                   position: { x: 590,  y: 150 } },
      { id: 'usw_dss',     type: 'orient',            label: 'USW-DSS\nTriangulation',                     position: { x: 760,  y: 80  } },
      { id: 'log_clear',   type: 'action',            label: 'Log — No Contact\nContinue Ping',            position: { x: 590,  y: 300 } },
      { id: 'classify',    type: 'decision',          label: 'PLAN SSN\nConfirmed?',                       position: { x: 930,  y: 80  } },
      { id: 'acomms_cue',  type: 'action',            label: 'ACOMMS →\nVirginia SSN-774',                 position: { x: 1100, y: 80  } },
      { id: 'human_auth',  type: 'human_checkpoint',  label: 'CTF-72\nWeapons Free',                       position: { x: 1270, y: 80  } },
      { id: 'engage',      type: 'action',            label: 'Mk 48 ADCAP +\nHanwha Missile',             position: { x: 1440, y: 80  } },
      { id: 'sector_clear', type: 'end',              label: 'SIERRA-7 Prosecuted\n— Sector Clear',        position: { x: 1610, y: 150 } }
    ],
    connections: [
      { from: 'deploy',      to: 'captas_ping' },
      { from: 'captas_ping', to: 'echo_return' },
      { from: 'echo_return', to: 'contact' },
      { from: 'contact',     to: 'usw_dss',      label: 'Return Detected' },
      { from: 'contact',     to: 'log_clear',    label: 'No Return' },
      { from: 'usw_dss',     to: 'classify' },
      { from: 'classify',    to: 'acomms_cue',   label: '>85% Confidence' },
      { from: 'classify',    to: 'echo_return',  label: 'Inconclusive' },
      { from: 'acomms_cue',  to: 'human_auth' },
      { from: 'human_auth',  to: 'engage',       label: 'Authorized' },
      { from: 'human_auth',  to: 'acomms_cue',   label: 'Hold — Continue Track' },
      { from: 'engage',      to: 'sector_clear' }
    ],
    loopBack: { from: 'log_clear', to: 'captas_ping', label: 'Continue Barrier Patrol' }
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