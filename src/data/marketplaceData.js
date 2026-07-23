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
      type: "Autonomous Operating System",
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
      category: "UNMANNED SYSTEMS",
      subType: null,
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
      description: "Real-time AI-powered condition-based maintenance processing 10,000+ sensor readings per second. Navy's official CBM+ Program of Record, deployed on USS Fitzgerald and expanding fleet-wide. NSYTE (publicly known as ERM v4 — Enterprise Remote Monitoring v4)",
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
      subType: null,
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
      detailedDescription: "Fathom5 ERM v4 (Enterprise Remote Monitoring Version 4), marketed internally as NSYTE, is the U.S. Navy's first AI-enabled maintenance system deployed on warships, representing the official Program of Record for Condition-Based Maintenance Plus (CBM+). The system processes over 10,000 sensor readings per second using microservices architecture and Python ML models to predict equipment failures before they occur.\n\nDeployed aboard USS Fitzgerald (DDG-62) in early 2025, NSYTE replaces legacy ICAS systems from the 1990s with modern containerized analytics. The platform integrates directly with Navy systems including OMMS-NG and PMS SKED, enabling crews to order replacement parts before failures occur at sea.\n\nNSYTE operates as part of the eRM v4 (Enterprise Remote Monitoring version 4) architecture, providing quarterly software updates versus traditional multi-year refresh cycles. Integration with TempestOS enables rapid deployment across new vessel classes including the FFG-62 Constellation-class frigates.",
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
      subType: null,
      swap: {
        weight: 4.5,      // Real: "< 10 lbs" confirmed by NG press release
        power: 0.12,      // Estimated; multi-sensor laser designator
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
      name: "Project Scion (Northrop Grumman)",
      provider: "Northrop Grumman",
      type: "Electronic Warfare",
      description: "Advanced electronic support measures for signal intelligence and threat detection with S-Band and X-Band RF detection capabilities.",
      capabilities: ["Signal Intercept", "Direction Finding", "Threat Classification", "RF Detection", "Maritime Surveillance"],
      trl: "TRL 9",
      icon: ScionESMIcon,
      category: "ELECTRONIC SUPPORT",
      subType: null,
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
      name: "HiddenLevel Passive RF Sensor",
      provider: "HiddenLevel",
      type: "Radar System",
      description: "Passive coherent location (PCL) radar that uses ambient broadcast RF signals (TV, cellular) to detect drones and low-observable targets with zero active emissions.",
      capabilities: ["Air Surveillance", "Missile Tracking", "Multi-Target Tracking"],
      trl: "TRL 9",
      icon: HiddenLevelRadarIcon,
      category: "RADAR/RF",
      subType: null,
      swap: {
        weight: 45,       // Real: Surge sensor 34kg + coprocessor 11kg = 45kg (hiddenlevel.com)
        power: 0.59,      // Real: Surge 335W + coprocessor 250W = 585W (hiddenlevel.com)
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
      subType: 'SONAR_TOWED',
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
      name: "OceanSonics icListen HF Smart Hydrophone Array",
      provider: "OceanSonics",
      type: "Passive Acoustic Sensor",
      description: "Two-unit towed icListen HF smart hydrophone array for close-in acoustic surveillance and contact classification. Each icListen HF is a self-contained networked hydrophone with onboard DSP; two units daisy-chained on a thin tow cable provide passive bearing estimation. Right-sized for harbor perimeter diver/UUV/surface vessel detection.",
      capabilities: ["Passive Contact Detection", "Acoustic Classification", "Bearing Estimation", "Diver & UUV Detection", "Networked DSP Onboard"],
      trl: "TRL 9",
      icon: TowedSonarIcon,
      category: "ACOUSTIC/SONAR",
      subType: 'HYDROPHONE',
      swap: {
        weight: 7,        // 2× icListen HF (3.2 kg each) + tow cable ≈ 7 kg total
        power: 0.01,      // 2× ~3.6W per unit = ~7W total; battery-backed, tethered power optional
        size: "small"
      },
      statImpacts: {
        speed: -1,        // Thin tow cable — minimal drag vs. full array
        power: -1,
        weight: 1,
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
      subType: null,
      swap: {
        weight: 0.315,      // Real: 315g per OrbComm Hardware Guide T406
        power: 0.008,       // Real: 7.8W peak TX (652mA @ 12V) per spec sheet
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
      subType: null,
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
      subType: 'STRIKE_WEAPON',
      swap: {
        weight: 1700,     // Real: SM-6 missile 1,500 kg (confirmed) + canister ~200 kg
        power: 2.0,       // kW - fire control standby
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
      subType: 'STRIKE_WEAPON',
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
      subType: null,
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
      subType: null,
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
      subType: null,
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
      subType: null,
      swap: {
        weight: 0,
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
      subType: null,
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
      subType: null,
      swap: {
        weight: 0,
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
      subType: null,
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
      subType: null,
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
      subType: null,
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
      subType: null,
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
      subType: null,
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
      subType: null,
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
      subType: null,
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
      subType: null,
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
      subType: null,
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
      subType: null,
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
      subType: null,
      swap: {
        weight: 0,
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
      subType: 'EW_JAMMER',
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
      subType: 'STRIKE_WEAPON',
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
      subType: 'EW_JAMMER',
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
    // ============ NON-KINETIC / EW PAYLOAD CATALOG ============
    {
      name: "SOEA Container (Scaled Onboard Electronic Attack)",
      provider: "General Atomics / Raytheon",
      type: "Active Electronic Attack — 20-ft ISO TEU",
      description: "Containerized active electronic attack system providing C/X/Ku-band jamming against radar-guided anti-ship missile seekers. Configured as standard 20-ft ISO TEU for rapid cross-deck deployment. Primary node in NEMESIS active jamming role.",
      capabilities: ["C-Band ASM Seeker Jamming", "X-Band Jamming", "Ku-Band Jamming", "Active Electronic Attack", "Noise & Deceptive Jamming Modes", "50–100 kW Power Output"],
      trl: "TRL 7",
      icon: ShieldCheck,
      category: "ELECTRONIC ATTACK",
      subType: 'EW_JAMMER',
      format: "20-ft ISO TEU",
      swap: {
        weight: 12000,
        power: 100,
        size: "large"
      },
      statImpacts: {
        speed: -3,
        power: -20,
        weight: 8,
        range: -5,
        stealth: -15
      },
      vesselCompatibility: ["MASC Baseline", "BlackSea MASC Catamaran", "Ghost Fleet Overlord"],
      nemesisRole: "active_jammer",
      emconNote: "Zero RF emissions during transit — activates only on NEMESIS coordinator command",
      missionTags: ["NON_KINETIC_EW", "SEA_DENIAL"]
    },
    {
      name: "False Fleet Projection Package",
      provider: "Elbit Systems / SRC Inc.",
      type: "Multi-Spectral Deception — 20-ft ISO TEU",
      description: "Makes a small USV appear as a large surface combatant across all adversary sensor types simultaneously. Corner reflector array amplifies RCS to frigate-class levels; AIS false-track broadcaster injects fabricated ship identity and course into AIS network; waveform transponder replies to surface search radar interrogations with a credible combatant signature.",
      capabilities: ["Corner Reflector RCS Amplification (Frigate-class)", "AIS False-Track Broadcasting", "Waveform Transponder", "Multi-Spectral Signature Management", "Programmable Ship Identity"],
      trl: "TRL 7",
      icon: Radio,
      category: "ELECTRONIC ATTACK",
      subType: 'EW_DECOY',
      format: "20-ft ISO TEU",
      swap: {
        weight: 4500,
        power: 8,
        size: "large"
      },
      statImpacts: {
        speed: -2,
        power: -6,
        weight: 5,
        range: 0,
        stealth: -20
      },
      vesselCompatibility: ["MASC Baseline", "AEGIR-H", "BlackSea MASC Catamaran"],
      nemesisRole: "radar_mimic",
      emconNote: "Corner reflectors passive — RCS amplification requires no power. Active elements (AIS broadcaster, transponder) activate on NEMESIS cue.",
      missionTags: ["NON_KINETIC_EW"]
    },
    {
      name: "LEED Dispenser (Long Endurance Electronic Decoy)",
      provider: "BAE Systems / Raytheon",
      type: "Autonomous RF Decoy Launcher — Deck-Mounted Rack",
      description: "Deck-mounted launcher rack deploying 4–8 autonomous RF decoy flight vehicles. LEED vehicles extend deception into the terminal guidance phase of incoming anti-ship missiles, drawing seekers away from the protected asset during the final engagement envelope where passive corner reflectors are insufficient.",
      capabilities: ["Autonomous Decoy Flight", "Terminal Phase RF Deception", "Programmable Emission Profile", "4–8 Vehicle Magazine", "Anti-Ship Missile Seeker Spoofing"],
      trl: "TRL 6",
      icon: Zap,
      category: "ELECTRONIC ATTACK",
      subType: 'EW_DECOY',
      format: "Deck-mounted launcher rack",
      swap: {
        weight: 1800,
        power: 3,
        size: "medium"
      },
      statImpacts: {
        speed: -1,
        power: -3,
        weight: 2,
        range: 0,
        stealth: -5
      },
      vesselCompatibility: ["MASC Baseline", "Saildrone Spectre"],
      nemesisRole: "leed_deployer",
      emconNote: "Launch on NEMESIS coordinator command — LEED vehicles are expendable",
      missionTags: ["NON_KINETIC_EW", "SEA_DENIAL"]
    },
    {
      name: "Saab CANTO Acoustic Decoy",
      provider: "Saab",
      type: "Tube-Launch Acoustic Decoy — XLUUV Payload Module",
      description: "Tube-launched from XLUUV payload module, the Saab CANTO (Combat Acoustic Naval Torpedo cOuntermeasure) generates programmable passive submarine acoustic signatures to deceive PLAN ASW sensors. Each unit emits a realistic Type-093-class or Virginia-class acoustic library signature, saturating adversary passive sonar arrays with false contacts and degrading prosecution confidence.",
      capabilities: ["Programmable Submarine Acoustic Signatures", "PLAN ASW Deception", "Passive Sonar Spoofing", "8–16 Per XLUUV Module", "Multi-Target Signature Library"],
      trl: "TRL 8",
      icon: Waves,
      category: "ACOUSTIC DECOY",
      subType: 'EW_DECOY',
      format: "Tube-launch from XLUUV payload module",
      swap: {
        weight: 10,         // Comparable expendable form factor; ~10 kg per tube-launched decoy class
        power: 0.01,        // Battery-powered expendable; ~5-10W acoustic emission
        size: "small"
      },
      statImpacts: {
        speed: 0,
        power: -2,
        weight: 1,
        range: 0,
        stealth: 10
      },
      vesselCompatibility: ["Boeing Orca XLUUV"],
      nemesisRole: "acoustic_decoy",
      emconNote: "Operates at depth — no surface RF emissions — EMCON compliant throughout deployment",
      missionTags: ["NON_KINETIC_EW", "ASW"]
    },
    {
      name: "Passive ESM/SIGINT Collection Module",
      provider: "Northrop Grumman / Elbit Systems",
      type: "Passive Electronic Support — 20-ft ISO TEU",
      description: "Passive intercept of adversary radar and communications emissions with no detectable RF output. Feeds the NEMESIS waveform library and enables real-time profile adjustment as adversary sensors react to the false fleet projection. Provides the intelligence input that makes NEMESIS adaptive rather than static.",
      capabilities: ["Passive Radar Intercept", "Comms SIGINT", "Waveform Library Feed", "Direction Finding", "Reaction Assessment", "~5 kW Power Draw"],
      trl: "TRL 9",
      icon: Signal,
      category: "SIGNALS INTELLIGENCE",
      subType: null,
      format: "20-ft ISO TEU",
      swap: {
        weight: 1800,
        power: 5,
        size: "large"
      },
      statImpacts: {
        speed: -1,
        power: -4,
        weight: 2,
        range: 0,
        stealth: 12
      },
      vesselCompatibility: ["Saildrone Voyager", "CUSV", "MASC Baseline", "M48"],
      nemesisRole: "passive_collection",
      emconNote: "Fully passive — no RF emissions — optimal EMCON during transit and active phase",
      missionTags: ["NON_KINETIC_EW", "RECONNAISSANCE", "ISR"]
    },
    // ============ END NON-KINETIC EW PAYLOAD CATALOG ============
    {
      name: "SeaFIND Inertial Navigation",
      provider: "Northrop Grumman",
      type: "Navigation System",
      description: "Fiber optic gyro inertial navigation system with GPS-denied operation capability and USCG type approval certification.",
      capabilities: ["GPS-Denied Navigation", "Fiber Optic Gyro", "Position Data", "Modular Architecture"],
      trl: "TRL 9",
      icon: Compass,
      category: "NAVIGATION",
      subType: 'NAV_INS',
      swap: {
        weight: 10.4,     // Real: EU 4.9 kg + IMU 5.5 kg per NG SeaFIND official datasheet
        power: 0.06,      // Real: ~50-60W for FOG INS of this class
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
      subType: null,
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
      subType: null,
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
      subType: null,
      swap: {
        weight: 0.43,     // Real: 430g per Peplink BR1 Mini HW3 official datasheet
        power: 0.018,     // Real: 18W max / 13W nominal per datasheet (adapter is 24W but device draws less)
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
      subType: null,
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
      subType: null,
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
      name: "Sea Machines SM300 Autonomy System",
      provider: "Sea Machines Robotics",
      type: "Universal Autonomy Retrofit",
      description: "Sea Machines SM300 — commercial-off-the-shelf autonomous command and control system that converts any existing vessel into a remotely commanded or fully autonomous asset. Compact shipboard installation with onboard perception stack and over-the-horizon remote helm capability.",
      capabilities: [
        "Universal Vessel Retrofit",
        "GPS-Denied Navigation",
        "DDIL Resilience",
        "Over-the-Horizon Remote Helm",
        "Fleet Coordination",
        "Collision Avoidance (COLREGS)",
        "Persistent Autonomous Patrol"
      ],
      trl: "TRL 8",
      icon: Cpu,
      category: "UNMANNED SYSTEMS",
      subType: null,
      swap: {
        weight: 15,       // Compact shipboard computer + sensor suite
        power: 0.3,       // kW - ruggedized compute + perception sensors
        size: "small"
      },
      statImpacts: {
        speed: 0,
        power: -2,
        weight: 1,
        range: 0,
        stealth: 3
      },
      securityLevel: ["MIL-STD-810 Rated", "Encrypted", "Anti-Spoofing"],
      securityIcons: ["milstd", "encrypted"],
      specs: {
        compatibility: "Any vessel with mechanical or electronic steering interface",
        installation: "Compact shipboard unit — days to install, not months",
        navigation: "Multi-sensor fusion: LIDAR, radar, AIS, GNSS, IMU",
        comms: "DDIL resilient — operates autonomously on comms loss",
        colregs: "Full COLREGS-compliant collision avoidance",
        remote: "Over-the-horizon remote helm via encrypted satellite link",
        kit: "Shipboard compute unit, LIDAR, forward radar, encrypted datalink"
      },
      detailedDescription: "Sea Machines SM300 is a production autonomy system deployed on commercial and defense vessels worldwide. The SM300 enables full autonomous operation or over-the-horizon remote helm, with a COLREGS-compliant perception stack that fuses LIDAR, radar, AIS, and GNSS inputs.\n\nThe system installs on any vessel with a mechanical or electronic steering interface, converting existing hulls into remotely commanded or fully autonomous assets without structural modification. Autonomy modes include waypoint following, station-keeping, and dynamic path planning around dynamic obstacles.\n\nOn comms loss, the SM300 defaults to a pre-programmed autonomous hold pattern — maintaining DDIL resilience without human input. The encrypted command datalink supports over-the-horizon remote helm from a shore or ship-based operator console.\n\nDeployed operationally on offshore patrol vessels, icebreakers, and USV platforms, the SM300 is the fastest path from crewed to autonomous for acquired or retrofitted vessels in a contested maritime environment.",
      keyFeatures: [
        "Production system — deployed on commercial and defense vessels worldwide",
        "COLREGS-compliant collision avoidance — real-world maritime traffic",
        "Over-the-horizon remote helm via encrypted satellite datalink",
        "DDIL resilient — autonomous hold pattern on comms loss",
        "Installs on any hull with mechanical or electronic steering",
        "Multi-sensor perception: LIDAR + radar + AIS + GNSS fusion",
        "Waypoint patrol, station-keeping, and dynamic obstacle avoidance"
      ],
      integrationNotes: "SM300 integrates with TempestOS to provide autonomous navigation for acquired or retrofitted vessels. When combined with SNC TRAX, enables full C5ISR connectivity for converted hulls. Supports fleet-level coordination with AEGIR and purpose-built autonomous platforms.",
      documents: [
        {
          name: "SM300 Autonomy System Overview",
          type: "PDF",
          size: "1.6 MB",
          description: "Complete autonomy retrofit system overview and CONOPS",
          url: "#"
        }
      ],
      bannerImage: "https://sea-machines.com/wp-content/uploads/2022/09/SM300-hero.jpg"
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
      subType: null,
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
    subType: 'SONAR_FLS',
    swap: {
      weight: 59,         // Real: ~29.5 kg dry per side × 2 sides = ~59 kg full system (NG µSAS-MV datasheet)
      power: 0.1,         // Real: 50W nominal per side + processing overhead
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
    name: "CAPTAS-4 Variable Depth Sonar",
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
    subType: 'SONAR_TOWED',
    swap: {
      weight: 3740,       // Real: deployable payload only — Tow Body 1,250 kg + Towed Array 2,490 kg (Google/Sonar 2087 data). Full shipboard system incl. handling is 30+ tonnes but that's ship infrastructure, not payload weight.
      power: 50,          // Real: 50-100 kW active transmit; 15 kW was passive-only
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
    subType: 'SONAR_TOWED',
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
    name: "USW-DSS (AN/UYQ-100)",
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
    subType: null,
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
    name: "M30 Supercavitating Round",
    provider: "Thales",
    type: "Mine Neutralization Round",
    description: "Thales M30 supercavitating round for kinetic mine neutralization. Fired through the hull bottom of a surface USV, the M30 generates a supercavitation bubble for high-speed underwater travel to perforate moored and bottom mines at standoff range — no diver exposure required.",
    capabilities: [
      "Kinetic mine neutralization — no diver required",
      "Supercavitating underwater travel",
      "Hull-bottom fired from surface USV",
      "Moored and bottom mine defeat",
      "Standoff engagement"
    ],
    trl: "TRL 8",
    icon: Target,
    category: "KINETIC WEAPONS",
    subType: 'STRIKE_WEAPON',
    swap: {
      weight: 12,
      power: 0,
      size: "small"
    },
    statImpacts: {
      speed: 0,
      power: 0,
      weight: 1,
      range: 0,
      stealth: -1
    },
    specs: {
      type: "Supercavitating underwater round",
      launchMethod: "Hull-bottom fired",
      target: "Moored and bottom mines",
      standoffRange: "Up to 30m"
    },
    missionTags: ["Mine Countermeasures", "Sea Control"]
  },
  {
    name: "DSG Technology MEA Supercavitating Ammunition",
    provider: "DSG Technology",
    type: "Dual-Environment Ammunition",
    description: "DSG Technology Multi-Environment Ammunition (MEA) — supercavitating rounds effective both in air and underwater. Spin-stabilized in air, cavity-stabilized underwater. Available in 7.62mm to 30mm calibers. 12.7mm penetrates steel targets to 60m depth.",
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
    subType: 'STRIKE_WEAPON',
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
    subType: 'STRIKE_WEAPON',
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
    name: "DPI Vulture Tethered UAS",
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
    subType: 'TETHERED_UAS',
    swap: {
      weight: 4500,
      power: 4,
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
      powerConsumption: "< 4 kW (total system); ~225 W (UAV only)",
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
  },
  {
    name: "MFTA Towed Array",
    provider: "Thales",
    type: "Passive Sonar Array",
    description: "Thales Multi-Function Towed Array — a thin-line passive hydrophone array towed by USV or surface vessel for bistatic sonar geometry. Receives CAPTAS-4 echo returns from displaced positions, enabling multistatic submarine triangulation.",
    capabilities: [
      "Passive acoustic reception — emits no detectable signal",
      "Bistatic sonar receiver — pairs with CAPTAS-4 active pinger",
      "Multi-function thin-line array — broadband and narrowband detection",
      "Variable depth capability",
      "Link 16 data output via USW-DSS"
    ],
    trl: "TRL 8",
    icon: Waves,
    category: "ACOUSTIC SENSORS",
    subType: 'SONAR_TOWED',
    swap: { weight: 280, power: 0.8, size: "medium" },
    statImpacts: { speed: -1, power: -3, weight: 2, range: 4, stealth: 0 },
    securityLevel: ["NATO Qualified", "ITAR Controlled"],
    securityIcons: ["encrypted"],
    specs: {
      type: "Thin-line passive towed array",
      mode: "Passive broadband + narrowband",
      role: "Bistatic receiver for CAPTAS-4 multistatic geometry",
      dataLink: "USW-DSS AN/UYQ-100 fusion",
      platform: "USV / surface vessel"
    },
    keyFeatures: [
      "Passive — zero acoustic emission, undetectable by threat submarines",
      "Displaced from active pinger for triangulation geometry",
      "Proven with 17+ navies alongside CAPTAS family"
    ],
    missionTags: ["ASW"]
  },
  {
    name: "Hanwha Naval Missile System",
    provider: "Hanwha Defense USA",
    type: "Surface-to-Surface / Anti-Submarine Missile",
    description: "Hanwha Defense USA naval surface strike and anti-submarine weapon system being integrated onto Magnet Defense M48 USV platforms. MOU signed at Sea-Air-Space 2026. Demo barge firing scheduled summer 2026.",
    capabilities: [
      "Surface prosecution of submarine contacts via USW-DSS cueing",
      "USV-compatible launch envelope (M48 form factor)",
      "Fires on USW-DSS fire-control grade track",
      "Backup prosecution alongside USS Virginia Mk 48 ADCAP",
      "Crewless firing platform — zero personnel at risk"
    ],
    trl: "TRL 7",
    icon: Target,
    category: "WEAPONS",
    subType: 'STRIKE_WEAPON',
    swap: { weight: 1200, power: 2.5, size: "large" },
    statImpacts: { speed: -2, power: -5, weight: 5, range: 3, stealth: -3 },
    securityLevel: ["ITAR Controlled", "FMS Eligible"],
    securityIcons: ["hardened"],
    specs: {
      platform: "Magnet Defense M48 USV",
      partnerMOU: "Hanwha Defense USA + Magnet Defense (Sea-Air-Space 2026)",
      demoTimeline: "Summer 2026 — barge firing demo",
      cueing: "USW-DSS AN/UYQ-100 fire-control track",
      role: "Surface prosecution / anti-submarine"
    },
    keyFeatures: [
      "First armed M48 configuration — crewless prosecution platform",
      "Complements Virginia class Mk 48 ADCAP in dual-prosecution scenarios",
      "Fires from safe standoff — M48-CHARLIE positioned 20+ nm from torpedo threat zone"
    ],
    missionTags: ["ASW", "SEA_DENIAL"]
  },
  {
    name: "Persistent Systems MPU5 SDR",
    provider: "Persistent Systems",
    type: "Software-Defined Radio",
    description: "Persistent Systems MPU5 — waveform-agnostic software-defined radio with integrated Wave Relay MANET mesh networking. Makes each equipped vessel a full tactical network node supporting Link 16 bridging, encrypted voice, and real-time ISR data relay. SOCOM-fielded and DoD-approved.",
    capabilities: [
      "Link 16 tactical data link node",
      "Wave Relay MANET mesh networking",
      "Mesh networking across USV fleet",
      "Encrypted comms — Type 1 / MILSPEC grade",
      "Real-time track and video relay"
    ],
    trl: "TRL 9",
    icon: Radio,
    category: "COMMUNICATIONS",
    subType: null,
    swap: { weight: 12, power: 0.4, size: "small" },
    statImpacts: { speed: 0, power: -2, weight: 1, range: 3, stealth: -1 },
    securityLevel: ["NSA Type 1 Encrypted", "Link 16 Certified", "SOCOM Fielded"],
    securityIcons: ["encrypted", "hardened"],
    specs: {
      waveforms: "Wave Relay MANET, Link 16 bridge, waveform-agnostic SDR",
      dataLink: "Link 16 MIDS-compliant",
      encryption: "NSA Type 1 / MILSPEC",
      formFactor: "Compact SDR module — 0.68 kg"
    },
    keyFeatures: [
      "Full Link 16 node — participates in tactical data network, not just sensor reports",
      "Wave Relay MANET — self-healing mesh survives node loss",
      "Proven on SubSeaSail HORUS and Magnet M48 platforms"
    ],
    missionTags: ["ASW", "ISR Patrol", "PORT_SECURITY"]
  },
  {
    name: "RazorChassis FC Integration",
    provider: "RazorChassis",
    type: "Fire Control Link",
    description: "RazorChassis fire control integration layer that translates autonomous ISR detections into fire control quality tracks for shipboard weapons systems. Bridges autonomous sensor platforms to naval fire control radars and ESSM engagement solutions.",
    capabilities: [
      "Track handoff from autonomous sensors to fire control radar",
      "ESSM engagement solution generation",
      "Multi-sensor data fusion for FC quality tracks",
      "Low-latency sensor-to-shooter link",
      "Compatible with Aegis and SPY-family fire control"
    ],
    trl: "TRL 7",
    icon: Target,
    category: "COMMAND & CONTROL",
    subType: null,
    swap: { weight: 0, power: 0.1, size: "small" },
    statImpacts: { speed: 0, power: -1, weight: 0, range: 2, stealth: 0 },
    securityLevel: ["ITAR Controlled", "Navy Certified"],
    securityIcons: ["encrypted", "hardened"],
    specs: {
      interface: "Aegis / SPY-family compatible",
      trackQuality: "Fire control grade",
      latency: "< 2 seconds sensor-to-FC",
      weapons: "ESSM, SM-2, SM-6 compatible"
    },
    keyFeatures: [
      "Closes the autonomous ISR → weapons gap without human-in-the-loop delay",
      "Translates DPI Vulture radar tracks to ESSM engagement quality",
      "Enables USS Laboon-class DDG engagement from M48 sensor cueing"
    ],
    missionTags: ["ISR Operations", "Sea Control"]
  },
  {
    name: "Trillium HD40 EO/IR Camera",
    provider: "L3Harris Trillium",
    type: "EO/IR Gimbal Payload",
    description: "L3Harris Trillium HD40 — a stabilized EO/IR gimbal camera designed for UAV and UAS payloads. Provides continuous zoom, HD visible and thermal IR imagery, suitable for air target identification at extended ranges.",
    capabilities: [
      "HD visible + MWIR thermal imaging",
      "Continuous optical zoom",
      "Multi-axis stabilization",
      "Air target identification at extended range",
      "Video data link compatible"
    ],
    trl: "TRL 9",
    icon: Eye,
    category: "EO/IR SENSORS",
    subType: null,
    swap: { weight: 0.84, power: 0.015, size: "small" },  // Real: 840g, 15W avg / 75W peak (Trillium HD40-XV 2024 datasheet)
    statImpacts: { speed: 0, power: -1, weight: 1, range: 3, stealth: 0 },
    securityLevel: ["ITAR Controlled", "USN Qualified"],
    securityIcons: ["hardened"],
    specs: {
      imaging: "HD EO + MWIR thermal IR",
      stabilization: "Multi-axis gyro-stabilized",
      zoom: "Continuous optical zoom",
      weight: "1.8 kg",
      power: "60 W"
    },
    keyFeatures: [
      "Dual-band EO/IR — identifies targets invisible to visible-only cameras",
      "Deployed on DPI Vulture tethered UAS for air target classification",
      "Proven on multiple US Navy UAS programs"
    ],
    missionTags: ["ISR Operations", "PORT_SECURITY"]
  },
  {
    name: "Maritime Surface/Air Search Radar",
    provider: "Classified",
    type: "Multi-Mode Surveillance Radar",
    description: "Classified maritime multi-mode radar payload for tethered UAS platforms. Provides surface and air search capability from elevated altitude, extending radar horizon beyond ship-based systems.",
    capabilities: [
      "Air and surface target detection",
      "Extended radar horizon from UAS altitude",
      "Multi-mode — SAR, GMTI, maritime surface search",
      "Low-observable target detection",
      "Automatic target tracking"
    ],
    trl: "TRL 7",
    icon: Radar,
    category: "RADAR SENSORS",
    subType: null,
    swap: { weight: 6, power: 0.3, size: "small" },
    statImpacts: { speed: -1, power: -4, weight: 2, range: 5, stealth: -2 },
    securityLevel: ["ITAR Controlled", "Classified"],
    securityIcons: ["encrypted", "hardened"],
    specs: {
      classification: "[Classified]",
      platform: "DPI Vulture tethered UAS",
      modes: "Surface search, air search, GMTI",
      integration: "USW-DSS / RazorChassis FC data link"
    },
    keyFeatures: [
      "Elevates radar line-of-sight beyond surface vessel limits",
      "Detects low-altitude air threats (Shahed-136, cruise missiles)",
      "Integrated with HiddenLevel RF for multi-layer sensor fusion"
    ],
    missionTags: ["ISR Operations", "Sea Control"]
  },
  {
    name: "Acoustic Marker Receiver",
    provider: "Thales",
    type: "Acoustic Sensor",
    description: "Thales passive acoustic marker receiver deployed by USV for mine detection cueing. Receives acoustic signals from deployed mine markers and acoustic indicators, providing precise localization data to the mine clearance commander.",
    capabilities: [
      "Passive acoustic reception from mine markers",
      "Precise localization via time-difference-of-arrival",
      "Compatible with NATO acoustic marker standards",
      "Low power — continuous listen mode",
      "Data fusion with SAS sonar imagery"
    ],
    trl: "TRL 8",
    icon: Waves,
    category: "ACOUSTIC SENSORS",
    subType: 'ACOUSTIC_MODEM',
    swap: { weight: 18, power: 0.15, size: "small" },
    statImpacts: { speed: 0, power: -1, weight: 1, range: 2, stealth: 1 },
    securityLevel: ["NATO Qualified"],
    securityIcons: ["encrypted"],
    specs: {
      type: "Passive acoustic receiver",
      standard: "NATO acoustic marker compatible",
      localization: "TDOA-based positioning",
      powerMode: "Continuous low-power listen"
    },
    keyFeatures: [
      "Detects and localizes deployed mine marker buoys",
      "Passive — no active emission that could trigger influence mines",
      "Pairs with Thales SAMDIS SAS for complete MCM sensor suite"
    ],
    missionTags: ["MCM", "Mine Clearance"]
  },
  {
    name: "Nammo Swimmer Supercavitating Round",
    provider: "Nammo",
    type: "Underwater Munition",
    description: "Nammo Swimmer (MK 258 Mod 1) — supercavitating 30mm underwater round for mine neutralization at standoff range. Fired from surface USV, the Swimmer generates a supercavitation bubble enabling high-speed underwater travel to neutralize moored and bottom mines.",
    capabilities: [
      "Supercavitating underwater travel — minimal hydrodynamic drag",
      "Standoff mine neutralization — no diver exposure",
      "Effective against moored and bottom mines",
      "USV-compatible 30mm launch system",
      "Precision guidance to mine contact point"
    ],
    trl: "TRL 8",
    icon: Target,
    category: "WEAPONS",
    subType: 'STRIKE_WEAPON',
    swap: { weight: 4, power: 0, size: "small" },
    statImpacts: { speed: 0, power: 0, weight: 1, range: 2, stealth: -1 },
    securityLevel: ["NATO Qualified", "ITAR Controlled"],
    securityIcons: ["hardened"],
    specs: {
      type: "Supercavitating underwater round",
      caliber: "30mm (MK 258 Mod 1)",
      target: "Moored mines, bottom mines, tethered mines",
      standoffRange: "100+ m",
      platform: "SubSeaSail HORUS USV",
      guidance: "Acoustic-cued targeting"
    },
    keyFeatures: [
      "Zero diver exposure — complete standoff neutralization",
      "Supercavitation enables high-speed underwater accuracy",
      "Cued by Micro-SAS SAMDIS contact localization"
    ],
    missionTags: ["MCM", "Mine Clearance"]
  },
  {
    name: "Micro-SAS Sonar (SAMDIS)",
    provider: "Thales",
    type: "Synthetic Aperture Sonar",
    description: "Thales SAMDIS (Synthetic Aperture Mine Detection and Identification System) — a hull-mounted micro-SAS sonar for AUV and USV platforms. Provides high-resolution seabed imagery for mine detection and classification.",
    capabilities: [
      "High-resolution seabed imagery via synthetic aperture processing",
      "Mine detection and classification at AUV speed",
      "Sidescan + SAS modes",
      "Real-time acoustic contact reporting",
      "Depth-rated for shallow and deep water MCM"
    ],
    trl: "TRL 8",
    icon: Waves,
    category: "ACOUSTIC SENSORS",
    subType: 'SONAR_FLS',
    swap: { weight: 25, power: 0.1, size: "small" },  // Real: est. 15-40 kg for 3-beam AUV SAS; ~100W per SAMDIS NG 3x reduction claim
    statImpacts: { speed: -1, power: -2, weight: 1, range: 3, stealth: 1 },
    securityLevel: ["NATO Qualified", "ITAR Controlled"],
    securityIcons: ["encrypted"],
    specs: {
      type: "Hull-mounted micro-SAS",
      designation: "SAMDIS",
      modes: "Sidescan, SAS",
      resolution: "High-definition seabed mapping",
      platform: "Freedom AUV, small USV"
    },
    keyFeatures: [
      "SAS processing — superior resolution vs. conventional sidescan",
      "Operates at AUV survey speed — no speed sacrifice for image quality",
      "Outputs classified mine contacts to MCM operator for prosecution decision"
    ],
    missionTags: ["MCM", "Mine Clearance", "SURVEY"]
  },
  {
    name: "Acoustic Indicator",
    provider: "Oceaneering",
    type: "MCM Marking System",
    description: "Oceaneering acoustic indicator deployed by Freedom AUV to mark located mine contacts for prosecution. Transmits encoded acoustic signal received by surface USV acoustic marker receivers, maintaining position of buried or moored mine contacts.",
    capabilities: [
      "Acoustic position marking of mine contacts",
      "Autonomous deployment by AUV",
      "Encoded frequency — discriminates from background noise",
      "Depth-rated for shallow water MCM",
      "Battery life: 24–72 hours"
    ],
    trl: "TRL 9",
    icon: Anchor,
    category: "MCM SYSTEMS",
    subType: 'ACOUSTIC_MODEM',
    swap: { weight: 2.5, power: 0.05, size: "small" },
    statImpacts: { speed: 0, power: -1, weight: 1, range: 1, stealth: 0 },
    securityLevel: ["NATO Qualified"],
    securityIcons: [],
    specs: {
      deployMethod: "AUV payload bay",
      signalType: "Encoded acoustic transponder",
      endurance: "24–72 hours",
      depth: "Shallow water rated",
      receiver: "Thales Acoustic Marker Receiver"
    },
    keyFeatures: [
      "Closes the AUV detection → surface prosecution handoff chain",
      "Eliminates need for repeat AUV passes to re-locate contacts",
      "Pairs with Thales Acoustic Marker Receiver on HORUS USV"
    ],
    missionTags: ["MCM", "Mine Clearance"]
  },
  {
    name: "EvoLogics Acoustic Modem",
    provider: "EvoLogics",
    type: "Underwater Acoustic Modem",
    description: "EvoLogics S2C series underwater acoustic modem for AUV-to-surface communications. Provides bi-directional data link between submerged Freedom AUV and surface HORUS USV, transmitting mine contact data without surfacing.",
    capabilities: [
      "Bi-directional underwater acoustic data link",
      "AUV-to-surface comms without surfacing",
      "OFDM modulation — multipath tolerant",
      "Integrated USBL positioning",
      "Real-time mine contact data transmission"
    ],
    trl: "TRL 9",
    icon: Radio,
    category: "COMMUNICATIONS",
    subType: 'ACOUSTIC_MODEM',
    swap: { weight: 1.8, power: 0.05, size: "small" },  // Real: peak TX 40-65W; 1.8 kg reasonable for mid-size modem (evologics.de spec table)
    statImpacts: { speed: 0, power: -2, weight: 1, range: 2, stealth: -1 },
    securityLevel: ["NATO Qualified", "CE Certified"],
    securityIcons: ["encrypted"],
    specs: {
      series: "EvoLogics S2C",
      modulation: "OFDM (multipath tolerant)",
      positioning: "Integrated USBL",
      dataRate: "Up to 31.2 kbps",
      range: "Up to 3,500 m"
    },
    keyFeatures: [
      "Enables Freedom AUV to report mine contacts without breaking depth",
      "USBL positioning confirms AUV and buoy locations simultaneously",
      "Deployed across 50+ navies on AUV and ROV platforms"
    ],
    missionTags: ["MCM", "Mine Clearance", "ASW"]
  },
  {
    name: "LOS Mesh Radio",
    provider: "Persistent Systems",
    type: "Line-of-Sight Mesh Radio",
    description: "Persistent Systems Wave Relay MPU5 — a mobile ad-hoc mesh networking radio used across US military autonomous platforms. Provides direct LOS data links between surface USVs and AUVs at/near the surface, enabling high-bandwidth mine contact data exchange without satellite dependency.",
    capabilities: [
      "Mobile ad-hoc mesh networking (MANET)",
      "High-bandwidth peer-to-peer LOS data link",
      "Self-healing mesh — nodes route around failures",
      "Video, voice, and data over single waveform",
      "Compatible with ATAK / TAK tactical picture sharing"
    ],
    trl: "TRL 9",
    icon: Radio,
    category: "COMMUNICATIONS",
    subType: null,
    swap: { weight: 0.39, power: 0.04, size: "small" },  // Real: 391g per PS spec sheet Rev.R; 40W peak TX / ~20W avg
    statImpacts: { speed: 0, power: -1, weight: 0, range: 2, stealth: -1 },
    securityLevel: ["FIPS 140-2 Encrypted", "NSA Type 1 Compatible", "SOF Qualified"],
    securityIcons: ["encrypted", "hardened"],
    specs: {
      waveform: "Wave Relay MANET",
      frequency: "900 MHz / 2.4 GHz / 4.9 GHz",
      dataRate: "Up to 100 Mbps",
      range: "Up to 100 km line-of-sight",
      encryption: "AES-256 / NSA Type 1",
      formFactor: "MPU5 — 227g, IP67 rated"
    },
    keyFeatures: [
      "Self-forming, self-healing mesh — no central infrastructure required",
      "Used by SOCOM, US Army, US Navy across manned and autonomous platforms",
      "Bridges SubSeaSail HORUS and Freedom AUV for real-time MCM coordination",
      "Handles video feeds from AUV cameras alongside mine contact data"
    ],
    missionTags: ["MCM", "Mine Clearance", "PORT_SECURITY", "ISR Patrol"]
  },
  // ─── Kinetic Effects payloads ──────────────────────────────────────────────
  {
    name: "Mk 70 Payload Delivery System",
    provider: "Lockheed Martin / US Navy",
    type: "Containerized VLS",
    description: "Containerized Mk 41 VLS — 4 cells per 40-ft FEU ISO container. Fires Tomahawk Block V Maritime Strike, SM-6 (RIM-174), and future HALO. Human-in-the-loop fire control required per DODD 3000.09.",
    capabilities: [
      "Tomahawk Block V Maritime Strike (MST)",
      "SM-6 (RIM-174) Anti-Ship / BMD",
      "Future HALO missile compatible",
      "ISO 40-ft FEU containerized",
      "DODD 3000.09 HITL fire control",
      "Time-on-target salvo coordination"
    ],
    trl: "TRL 9",
    icon: Zap,
    category: "KINETIC WEAPONS",
    subType: 'STRIKE_WEAPON',
    swap: {
      weight: 18000,
      power: 75,
      size: "xlarge"
    },
    statImpacts: {
      speed: -4,
      power: -20,
      weight: 20,
      range: -10,
      stealth: -8
    },
    specs: {
      containerFormat: "40-ft FEU ISO",
      vlsCellsPerContainer: "4",
      compatibleMissiles: "Tomahawk Block V MST · SM-6 (RIM-174) · HALO (future)",
      powerRequirement: "75 kW per container",
      weightLoaded: "~18 metric tons per container",
      fireControl: "Human authorization required before each launch",
      navigation: "GPS-hardened + GPS-denied INS backup"
    },
    securityLevel: ["DODD 3000.09 Compliant", "HITL Fire Control", "Two-Person Integrity"],
    securityIcons: ["milstd", "encrypted"],
    keyFeatures: [
      "Drop-in ISO container — fits any 40-ft FEU mount on MASC/USV hull",
      "4 VLS cells per container; 2–4 containers per hull depending on configuration",
      "Tomahawk Block V MST: 900+ nm range, GPS-denied terminal guidance",
      "SM-6: dual anti-ship / anti-air / BMD capability from a USV hull",
      "Fire control enforces human authorization before each individual launch",
      "Unauthorized launch attempt triggers automatic hold-fire lockout"
    ],
    integrationNotes: "Mk 70 PDS integrates with TempestOS fire control via Drawbridge encrypted SATCOM link. Authorization chain recorded in mission audit log with timestamps and classification markings. Containerized format enables rapid swap between hulls — MASC Baseline (2×), MASC High-Capacity (4×), Saildrone Spectre MUSV (1×).",
    missionTags: ["KINETIC_EFFECTS", "Long-Range Strike", "Saturation Strike", "Persistent Strike"]
  },
  {
    name: "Hammerhead Mine Module",
    provider: "General Dynamics Mission Systems / US Navy",
    type: "Encapsulated Torpedo-Mine",
    description: "Gravity-drop encapsulated torpedo-mine for XLUUV payload bays. Mk 54 warhead. 12–24 mines per Boeing Orca XLUUV payload module. Acoustic activation/deactivation — Hague VIII compliant controlled mine.",
    capabilities: [
      "Gravity-drop deployment from XLUUV bay",
      "Mk 54 torpedo warhead",
      "Remote acoustic command activation",
      "Remote acoustic deactivation (Hague VIII)",
      "Unique acoustic activation code per mine",
      "Field-inert on deployment until commander activates"
    ],
    trl: "TRL 9",
    icon: Anchor,
    category: "KINETIC WEAPONS",
    subType: 'STRIKE_WEAPON',
    swap: {
      weight: 800,        // Real: Mk 54 torpedo 276 kg + encapsulation/mooring/sensors; CAPTOR comparator 933 kg
      power: 0,
      size: "medium"
    },
    statImpacts: {
      speed: -2,
      power: 0,
      weight: 8,
      range: -5,
      stealth: 0
    },
    specs: {
      warhead: "Mk 54",
      loadoutPerOrca: "12–24 mines per XLUUV payload module",
      activation: "Remote acoustic command by authorized commander",
      deactivation: "Acoustic deactivation — full field clearance possible",
      legalStatus: "Controlled mine — Hague VIII compliant",
      deploymentMethod: "Gravity-drop from Boeing Orca XLUUV payload bay",
      deploymentDepth: "Up to 200 ft subsurface"
    },
    securityLevel: ["DODD 3000.09 Compliant", "HITL Activation Control", "Hague VIII Compliant"],
    securityIcons: ["milstd", "encrypted"],
    keyFeatures: [
      "Inert on deployment — activation requires explicit commander acoustic command",
      "Full deactivation acoustic signal clears entire field on demand",
      "Unique acoustic code per mine — enables selective activation/deactivation",
      "Hague VIII compliant: mines cannot be left uncontrolled",
      "Delivered by Boeing Orca XLUUV — 6,500 nm submerged range, undetected delivery",
      "Mk 54 warhead optimized for surface and subsurface threats"
    ],
    integrationNotes: "Hammerhead loads into Boeing Orca XLUUV payload bay. Deployment authorization recorded in TempestOS mission audit log. Acoustic activation codes generated and held by authorized commander only — not stored aboard the Orca. Post-deployment, Orca surfaces and reports mine field geometry via SATCOM to TempestOS.",
    missionTags: ["KINETIC_EFFECTS", "Offensive Mining", "Clandestine Mining"]
  },
  // ============ MISSION-REFERENCED CAPABILITIES (added to resolve missing catalog entries) ============
  {
    name: "Sprint & Drift Transit",
    provider: "US Navy / Caliburn",
    type: "ASW Patrol Mode",
    description: "Standard ASW patrol tactic in which a vessel alternates between high-speed sprints (15–20 kt) and slow passive-sonar drift periods (3–5 kt). Sprints reposition the vessel while drift periods enable the towed array to acquire passive contacts without self-noise masking. Implemented as an autonomous behavior mode within TempestOS / MOOS-IvP.",
    capabilities: [
      "Passive sonar low-noise drift mode",
      "High-speed repositioning sprint",
      "Automated sprint/drift cycle management",
      "Acoustic self-noise suppression",
      "Contact hold during sprint transitions"
    ],
    trl: "TRL 9",
    icon: Waves,
    category: "UNMANNED SYSTEMS",
    subType: null,
    swap: { weight: 0, power: 0.05, size: "small" },
    statImpacts: { speed: 0, power: 0, weight: 0, range: 0, stealth: 4 },
    securityLevel: [],
    securityIcons: [],
    specs: {
      sprintSpeed: "15–20 kt",
      driftSpeed: "3–5 kt",
      cycleLength: "Operator-configurable",
      integration: "TempestOS / MOOS-IvP behavior module",
      sonarMode: "Passive towed array during drift"
    },
    missionTags: ["ASW", "Sea Control"]
  },
  {
    name: "RazorChassis C5ISR Link",
    provider: "RazorChassis",
    type: "C5ISR Data Link",
    description: "RazorChassis C5ISR integration layer that formats autonomous platform sensor data — including PLA radar gap geometry, UAV track data, and SIGINT contacts — as actionable C5ISR products and pushes them to fleet command via encrypted SATCOM. Complements the fire-control variant by serving intelligence consumers rather than weapons systems.",
    capabilities: [
      "C5ISR product formatting from autonomous sensors",
      "PLA radar gap geometry dissemination",
      "Encrypted SATCOM uplink to fleet CIC",
      "UAV track reporting to 7th Fleet CTF-77",
      "Multi-INT fusion for intelligence products"
    ],
    trl: "TRL 7",
    icon: Signal,
    category: "COMMAND & CONTROL",
    subType: null,
    swap: { weight: 0, power: 0.1, size: "small" },
    statImpacts: { speed: 0, power: -1, weight: 0, range: 2, stealth: 0 },
    securityLevel: ["ITAR Controlled", "Encrypted"],
    securityIcons: ["encrypted", "hardened"],
    specs: {
      interface: "7th Fleet CTF-77 CIC compatible",
      uplink: "Encrypted SATCOM",
      latency: "< 5 seconds sensor-to-CIC",
      products: "Gap geometry, UAV tracks, SIGINT contacts"
    },
    missionTags: ["ISR Operations", "Sea Control", "RECONNAISSANCE"]
  },
  {
    name: "Blue Force Cue Response",
    provider: "Caliburn / TAK Product Center",
    type: "Blue Force Tracking Response Module",
    description: "Automated system module that monitors incoming Blue Force Track (BFT) cues from the common operating picture and triggers autonomous platform responses — repositioning, sensor slewing, or intercept maneuvers — without requiring operator action on each cue. Integrates TAK Cursor-on-Target BFT feeds with TempestOS mission behavior engine.",
    capabilities: [
      "Automated BFT cue ingestion",
      "Autonomous platform repositioning on cue",
      "Sensor slewing to cued bearing",
      "Intercept maneuver generation",
      "CoT / TAK COP integration"
    ],
    trl: "TRL 7",
    icon: Shield,
    category: "COMMAND & CONTROL",
    subType: null,
    swap: { weight: 0, power: 0.05, size: "small" },
    statImpacts: { speed: 1, power: 0, weight: 0, range: 2, stealth: 0 },
    securityLevel: ["Government Purpose Rights"],
    securityIcons: ["milstd"],
    specs: {
      cueSource: "TAK CoT / Link-16 Blue Force Track",
      responseLatency: "< 3 seconds cue-to-maneuver",
      integration: "TempestOS TMS pub/sub",
      platforms: "USV, UUV, tethered UAS"
    },
    missionTags: ["ISR Operations", "Sea Control", "PORT_SECURITY"]
  },
  {
    name: "PLA Radar Gap Mapping",
    provider: "Saildrone / Caliburn",
    type: "SIGINT / Coverage Analysis",
    description: "Passive SIGINT collection and analysis capability that maps radar coverage gaps in PLA sensor networks by cross-correlating emission intercepts with known PLA radar positions. Saildrone Voyager platforms conduct zero-emission drift patrols, passively logging PLA radar intercepts and uploading gap geometry to TempestOS Drawbridge for fleet routing.",
    capabilities: [
      "Passive PLA radar intercept collection",
      "Coverage gap geometry computation",
      "Acoustic SATCOM covert uplink",
      "Fleet routing window dissemination",
      "Persistent zero-emission patrol"
    ],
    trl: "TRL 6",
    icon: Radar,
    category: "SIGNALS INTELLIGENCE",
    subType: null,
    swap: { weight: 5, power: 0.3, size: "small" },
    statImpacts: { speed: 0, power: -2, weight: 1, range: 0, stealth: 6 },
    securityLevel: ["Passive — No RF Emissions", "ITAR Controlled"],
    securityIcons: ["encrypted"],
    specs: {
      collectionMethod: "Passive ESM intercept only",
      platform: "Saildrone Voyager",
      uplink: "TempestOS Drawbridge acoustic SATCOM",
      output: "Gap geometry GeoJSON / KML",
      endurance: "Up to 365 days"
    },
    missionTags: ["ISR Operations", "RECONNAISSANCE", "Sea Control"]
  },
  {
    name: "Over-Horizon ISR Screen",
    provider: "SubSeaSail / Northrop Grumman",
    type: "Extended-Range ISR Screen",
    description: "ISR screening line positioned beyond the radio and optical horizon of the protected force, using low-observable USV platforms (SubSeaSail HORUS) equipped with passive ESM and towed sonar. Provides early warning of contacts before they reach line-of-sight detection range, with data relayed over satellite.",
    capabilities: [
      "Beyond line-of-sight early warning",
      "Passive surface and subsurface contact detection",
      "SATCOM relay to protected force COP",
      "Low-observable USV platform",
      "EMCON-compliant silent screening"
    ],
    trl: "TRL 7",
    icon: Eye,
    category: "ISR & SURVEILLANCE",
    subType: null,
    swap: { weight: 10, power: 0.4, size: "small" },
    statImpacts: { speed: 0, power: -2, weight: 1, range: 5, stealth: 4 },
    securityLevel: ["Passive Sensors", "EMCON Compliant"],
    securityIcons: ["encrypted"],
    specs: {
      screenRange: "30–80 nm ahead of protected force",
      platform: "SubSeaSail HORUS USV",
      sensors: "Passive ESM + MFTA towed array",
      dataLink: "SATCOM relay to fleet COP",
      emcon: "Zero RF emissions during screening"
    },
    missionTags: ["ISR Operations", "ASW", "Sea Control", "RECONNAISSANCE"]
  },
  {
    name: "Acoustic Contact Relay",
    provider: "EvoLogics / Caliburn",
    type: "Underwater Acoustic Data Relay",
    description: "System for relaying acoustic sonar contact data from submerged or surface sensor nodes to command elements via underwater acoustic modem and surface SATCOM gateway. Enables prosecution of contacts detected beyond direct radio range without breaking sensor platform EMCON.",
    capabilities: [
      "Underwater acoustic contact data transmission",
      "Surface SATCOM gateway relay",
      "Contact track and classification forwarding",
      "EMCON-preserving relay architecture",
      "Multi-hop relay chain support"
    ],
    trl: "TRL 8",
    icon: Waves,
    category: "COMMUNICATIONS",
    subType: 'ACOUSTIC_MODEM',
    swap: { weight: 3, power: 0.25, size: "small" },
    statImpacts: { speed: 0, power: -2, weight: 1, range: 4, stealth: 2 },
    securityLevel: ["Encrypted Acoustic Link"],
    securityIcons: ["encrypted"],
    specs: {
      acousticModem: "EvoLogics S2C OFDM",
      dataRate: "Up to 31.2 kbps",
      relayRange: "Up to 3,500 m acoustic + SATCOM",
      contactData: "Track, classification, bearing, range",
      emcon: "Acoustic only — no RF during relay"
    },
    missionTags: ["ASW", "Sea Control", "ISR Operations"]
  },
  {
    name: "TempestOS PoL Node",
    provider: "Caliburn",
    type: "Pattern of Life Analysis Node",
    description: "TempestOS Pattern of Life (PoL) analysis node that aggregates multi-platform sensor tracks over time to build behavioral baselines for vessels and contacts in the area of operations. Anomaly detection algorithms flag deviations from established patterns, cueing operators and downstream targeting systems.",
    capabilities: [
      "Multi-platform track aggregation",
      "Behavioral baseline modeling",
      "Anomaly detection and alerting",
      "Pattern of life reporting",
      "Tipping and cueing relay to COP"
    ],
    trl: "TRL 6",
    icon: Brain,
    category: "COMMAND & CONTROL",
    subType: null,
    swap: { weight: 0, power: 0.3, size: "small" },
    statImpacts: { speed: 0, power: -1, weight: 0, range: 3, stealth: 0 },
    securityLevel: ["Encrypted", "DDIL Capable"],
    securityIcons: ["encrypted", "ddil"],
    specs: {
      trackSources: "AIS, radar, EO/IR, ESM, acoustic",
      baselineWindow: "Configurable 24h–30 day",
      anomalyLatency: "< 60 seconds",
      integration: "TempestOS TMS pub/sub",
      output: "CoT PoL events to TAK COP"
    },
    missionTags: ["ISR Operations", "RECONNAISSANCE", "Sea Control"]
  },
  {
    name: "Site-Clear Relay Authorization",
    provider: "TrellisWare / Caliburn",
    type: "Command Authorization Relay",
    description: "Encrypted command relay system that transmits site-clearance authorization from a command element to forward autonomous platforms — enabling time-critical actions such as bow ramp deployment or breach-team insertion. Uses TrellisWare TSM mesh radio for jam-resistant short-range relay, with dual-key authorization to prevent unauthorized execution.",
    capabilities: [
      "Encrypted site-clearance command relay",
      "Dual-key authorization enforcement",
      "Jam-resistant TSM mesh radio",
      "Audit log of all authorization events",
      "Forward platform acknowledgment receipt"
    ],
    trl: "TRL 7",
    icon: Lock,
    category: "COMMAND & CONTROL",
    subType: null,
    swap: { weight: 0, power: 0.08, size: "small" },
    statImpacts: { speed: 0, power: -1, weight: 0, range: 1, stealth: -1 },
    securityLevel: ["Dual-Key Authorization", "End-to-End Encrypted", "ITAR Controlled"],
    securityIcons: ["encrypted", "hardened"],
    specs: {
      radio: "TrellisWare TSM mesh",
      authModel: "Dual-key — two independent authorizing parties",
      latency: "< 1 second relay delivery",
      range: "Up to 5 km LOS mesh",
      auditLog: "TempestOS immutable mission log"
    },
    missionTags: ["PORT_SECURITY", "Sea Control"]
  },
  {
    name: "Armed Surface Escort",
    provider: "MARTAC / Northrop Grumman",
    type: "Armed USV Escort",
    description: "Armed unmanned surface vessel configured for close-in escort of high-value units (HVU). MARTAC T82 Devil Ray USV armed with a M240 ROWS mount and Rafael Spike ER2 ATGMs. Provides a crewless armed picket that engages surface threats within engagement range while maintaining station on the HVU.",
    capabilities: [
      "Close-in armed escort of HVU",
      "M240 ROWS surface threat engagement",
      "Spike ER2 ATGM anti-surface capability",
      "Station-keeping relative to HVU",
      "Threat engagement without crew exposure"
    ],
    trl: "TRL 8",
    icon: Shield,
    category: "KINETIC WEAPONS",
    subType: null,
    swap: { weight: 650, power: 4.0, size: "medium" },
    statImpacts: { speed: -1, power: -5, weight: 5, range: -2, stealth: -2 },
    securityLevel: ["DODD 3000.09 Compliant", "HITL Fire Control"],
    securityIcons: ["milstd", "hardened"],
    specs: {
      platform: "MARTAC T82 Devil Ray USV",
      weapons: "M240 ROWS + Rafael Spike ER2 ATGM",
      escortRadius: "500–2,000 m from HVU",
      speed: "Up to 50 kt sprint",
      engagement: "Human-authorized weapons release"
    },
    missionTags: ["Sea Control", "Force Protection"]
  },
  {
    name: "Threat Intercept Screen",
    provider: "Northrop Grumman / Epirus",
    type: "Layered Defense Screen",
    description: "Coordinated screening layer combining RF-negation (Epirus Leonidas HPM), interceptor USVs, and passive detection to intercept incoming surface and air threats before they reach the protected force. Integrates DRAKE counter-UAS and armed escort USVs into a managed threat intercept zone.",
    capabilities: [
      "Layered RF-negation and kinetic intercept",
      "Coordinated multi-platform engagement",
      "Epirus Leonidas HPM against drone swarms",
      "DRAKE counter-UAS RF defeat",
      "Surface threat intercept by armed USV"
    ],
    trl: "TRL 7",
    icon: ShieldCheck,
    category: "ELECTRONIC PROTECTION",
    subType: null,
    swap: { weight: 0, power: 0.2, size: "small" },
    statImpacts: { speed: 0, power: -2, weight: 0, range: 2, stealth: -3 },
    securityLevel: ["DODD 3000.09 Compliant"],
    securityIcons: ["milstd", "hardened"],
    specs: {
      layers: "HPM RF-negation + interceptor USV + DRAKE C-UAS",
      coordinationSystem: "TempestOS threat management module",
      engagement: "Human-authorized kinetic release",
      coverage: "360-degree threat sector management"
    },
    missionTags: ["Sea Control", "Force Protection", "SEA_DENIAL"]
  },
  {
    name: "Encrypted Mesh Link to M48",
    provider: "TrellisWare",
    type: "Tactical Encrypted Mesh Radio Link",
    description: "TrellisWare TSM (Tactical MANET) encrypted mesh radio link between a SubSeaSail HORUS scout and a Magnet Defense M48 carrier. Provides low-latency, jam-resistant data exchange for site-clearance relay, sensor data sharing, and coordinated maneuver in GPS-denied and EMCON environments. AES-256 encrypted.",
    capabilities: [
      "Encrypted LOS mesh radio link",
      "HORUS ↔ M48 direct data exchange",
      "Site-clearance relay authorization",
      "Jam-resistant MANET waveform",
      "DDIL resilient mesh topology"
    ],
    trl: "TRL 9",
    icon: Radio,
    category: "RF COMMUNICATIONS",
    subType: null,
    swap: { weight: 0.53, power: 0.012, size: "small" },
    statImpacts: { speed: 0, power: -1, weight: 0, range: 2, stealth: -1 },
    securityLevel: ["AES-256 Encrypted", "NSA Type 1 Compatible", "DDIL Capable"],
    securityIcons: ["encrypted", "ddil"],
    specs: {
      radio: "TrellisWare TSM MANET",
      encryption: "AES-256 / NSA Type 1",
      range: "Up to 10 km surface LOS",
      dataRate: "Up to 20 Mbps",
      latency: "< 10 ms",
      platforms: "SubSeaSail HORUS, Magnet Defense M48"
    },
    missionTags: ["CONTESTED_LOGISTICS", "Sea Control"]
  },
  {
    name: "HiveLink SDR",
    provider: "HiveLink",
    type: "Multi-Waveform Software Defined Radio",
    description: "HiveLink software-defined radio supporting Link 16, WaveformX, and WaveformY simultaneously. Acts as a tactical data link node enabling interoperability between USV platforms and manned naval forces. Used as primary comms for INDOPACOM tactical net integration.",
    capabilities: [
      "Link 16 tactical data link",
      "WaveformX / WaveformY multi-waveform",
      "Simultaneous multi-net operation",
      "USV-to-ship interoperability",
      "INDOPACOM tactical net compatible"
    ],
    trl: "TRL 8",
    icon: Radio,
    category: "RF COMMUNICATIONS",
    subType: null,
    swap: { weight: 3.2, power: 0.08, size: "small" },
    statImpacts: { speed: 0, power: -1, weight: 0, range: 3, stealth: -1 },
    securityLevel: ["NSA Type 1 Compatible", "AES-256 Encrypted", "DDIL Capable"],
    securityIcons: ["encrypted", "milstd"],
    specs: {
      waveforms: "Link 16, WaveformX, WaveformY",
      range: "Line of sight + BLOS relay",
      dataRate: "Up to 10 Mbps",
      formFactor: "Software-defined, compact module",
      platforms: "M48, SubSeaSail Horus, ZeroUSV Oceanus17"
    },
    missionTags: ["Anti-Submarine Warfare", "MDA/ISR", "Sea Control"]
  },
  {
    name: "Encrypted Mesh Link to T82",
    provider: "TrellisWare",
    type: "Tactical Encrypted Mesh Radio Link",
    description: "TrellisWare TSM (Tactical MANET) encrypted mesh radio link between a scout platform (MANTAS T12) and a MARTAC T82 command vessel. Provides low-latency, jam-resistant data exchange for site-clearance relay, sensor data sharing, and coordinated maneuver. AES-256 encrypted, operates in DDIL environments.",
    capabilities: [
      "Encrypted LOS mesh radio link",
      "MANTAS T12 ↔ T82 direct data exchange",
      "Site-clearance relay authorization",
      "Jam-resistant MANET waveform",
      "DDIL resilient mesh topology"
    ],
    trl: "TRL 9",
    icon: Radio,
    category: "RF COMMUNICATIONS",
    subType: null,
    swap: { weight: 0.53, power: 0.012, size: "small" },  // Real: TW-950 = 531g with battery (trellisware.com datasheet)
    statImpacts: { speed: 0, power: -1, weight: 0, range: 2, stealth: -1 },
    securityLevel: ["AES-256 Encrypted", "NSA Type 1 Compatible", "DDIL Capable"],
    securityIcons: ["encrypted", "ddil"],
    specs: {
      radio: "TrellisWare TSM MANET",
      encryption: "AES-256 / NSA Type 1",
      range: "Up to 10 km surface LOS",
      dataRate: "Up to 20 Mbps",
      latency: "< 10 ms",
      platforms: "MANTAS T12, MARTAC T82, MARTAC M80"
    },
    missionTags: ["PORT_SECURITY", "Sea Control", "Force Protection"]
  },
  {
    name: "Wide-Area Target Cue",
    provider: "Northrop Grumman / Raytheon",
    type: "Wide-Area Sensor Cueing",
    description: "Wide-area sensor cueing capability that fuses MQ-4C Triton AN/ZPY-3 radar contacts with SIGINT and AIS data to generate fire-control-quality target cues across a maritime patrol area. Provides persistent wide-area maritime surveillance and delivers actionable target cues to strike C2 platforms and fire control systems.",
    capabilities: [
      "Wide-area maritime target cueing",
      "MQ-4C Triton AN/ZPY-3 AESA radar fusion",
      "SIGINT correlation with radar contacts",
      "Fire-control-quality track generation",
      "Real-time cue dissemination to strike C2"
    ],
    trl: "TRL 8",
    icon: Target,
    category: "SENSORS & DETECTION",
    subType: null,
    swap: { weight: 0, power: 0.2, size: "small" },
    statImpacts: { speed: 0, power: -1, weight: 0, range: 5, stealth: 0 },
    securityLevel: ["ITAR Controlled", "NSA-Approved Crypto"],
    securityIcons: ["encrypted", "hardened"],
    specs: {
      sensorPlatform: "MQ-4C Triton (AN/ZPY-3 AESA radar)",
      surveillanceRange: "7 million sq km per sortie",
      trackQuality: "Fire-control grade",
      cueDissemination: "Link-16 / RazorChassis FC link",
      latency: "< 30 seconds contact-to-cue"
    },
    missionTags: ["ISR Operations", "KINETIC_EFFECTS", "Sea Control"]
  },
  {
    name: "Strike C2",
    provider: "Caliburn / Leidos",
    type: "Strike Command and Control",
    description: "Strike C2 node that integrates sensor cues, target designation data, and weapons status to produce execution-ready strike orders. Manages target prioritization, deconfliction, time-on-target coordination, and post-strike BDA initiation. Operates as a containerized TempestOS workload on a dedicated C2 USV, with all launch actions requiring DODD 3000.09 human authorization.",
    capabilities: [
      "Target prioritization and deconfliction",
      "Time-on-target salvo coordination",
      "Weapons status monitoring",
      "DODD 3000.09 human-in-the-loop enforcement",
      "Post-strike BDA task generation"
    ],
    trl: "TRL 7",
    icon: Brain,
    category: "COMMAND & CONTROL",
    subType: null,
    swap: { weight: 0, power: 0.5, size: "small" },
    statImpacts: { speed: 0, power: -2, weight: 0, range: 3, stealth: 0 },
    securityLevel: ["DODD 3000.09 Compliant", "HITL Authorization", "End-to-End Encrypted"],
    securityIcons: ["milstd", "encrypted"],
    specs: {
      platform: "TempestOS containerized workload",
      interfaces: "RazorChassis FC link, USW-DSS, TAK COP",
      authorization: "Human operator required for all strike execution",
      coordination: "Time-on-target salvo, multi-platform deconfliction",
      auditLog: "Immutable TempestOS strike log"
    },
    missionTags: ["KINETIC_EFFECTS", "Sea Control", "Long-Range Strike"]
  },
  {
    name: "Target Designation",
    provider: "Northrop Grumman / L3Harris",
    type: "Laser / Data-Link Target Designation",
    description: "Combined laser and data-link target designation capability providing precise target coordinates to strike weapons. Northrop Grumman NGHTS laser designator illuminates for precision-guided munitions; L3Harris data-link outputs designation-quality track to Mk 70 PDS and fire control systems. Dual-mode ensures redundancy across EO/laser-guided and GPS/data-link-guided weapon types.",
    capabilities: [
      "Laser designation for precision-guided munitions",
      "Data-link designation-quality track output",
      "EO/IR target identification before designation",
      "Mk 70 PDS / fire control interface",
      "Dual-mode laser + data-link redundancy"
    ],
    trl: "TRL 9",
    icon: Target,
    category: "EO/IR SENSORS",
    subType: null,
    swap: { weight: 10, power: 0.2, size: "small" },
    statImpacts: { speed: 0, power: -1, weight: 1, range: 2, stealth: -2 },
    securityLevel: ["ITAR Controlled", "Encrypted Data Link"],
    securityIcons: ["encrypted", "hardened"],
    specs: {
      laserDesignator: "Northrop Grumman NGHTS",
      dataLink: "L3Harris designation-quality track output",
      range: "Up to 15 km laser designation",
      compatibility: "Paveway, JDAM-ER, Mk 70 PDS",
      guidance: "Laser + GPS/INS dual-mode"
    },
    missionTags: ["KINETIC_EFFECTS", "Sea Control", "ISR Operations"]
  },
  {
    name: "BDA Assessment",
    provider: "Caliburn / FLIR Systems",
    type: "Battle Damage Assessment",
    description: "Post-strike Battle Damage Assessment (BDA) capability combining EO/IR imagery from persistent USV platforms with SAR data fusion to assess weapon effect and confirm target kill. TempestOS PoL engine compares pre- and post-strike sensor baselines to quantify damage and identify re-strike requirements, feeding results back to Strike C2.",
    capabilities: [
      "Post-strike EO/IR imagery collection",
      "SAR imagery fusion for structural BDA",
      "Pre/post-strike baseline comparison",
      "Kill probability assessment",
      "Re-strike recommendation generation"
    ],
    trl: "TRL 6",
    icon: Eye,
    category: "ISR & SURVEILLANCE",
    subType: null,
    swap: { weight: 0, power: 0.2, size: "small" },
    statImpacts: { speed: 0, power: -1, weight: 0, range: 2, stealth: 0 },
    securityLevel: ["ITAR Controlled", "Encrypted"],
    securityIcons: ["encrypted"],
    specs: {
      sensors: "EO/IR (FLIR), SAR fusion",
      assessmentLatency: "< 15 minutes post-strike",
      integration: "TempestOS PoL + Strike C2",
      output: "BDA report to TAK COP + Strike C2",
      confidence: "Kill probability scoring"
    },
    missionTags: ["KINETIC_EFFECTS", "ISR Operations", "Sea Control"]
  },
  {
    name: "Area Denial",
    provider: "Northrop Grumman / US Navy",
    type: "Sea Area Denial System",
    description: "Sea area denial capability combining controlled mine fields (Hammerhead encapsulated torpedo-mines deployed by Boeing Orca XLUUV) with surface barrier USVs armed with Spike ER2 ATGMs. Denies adversary surface and submarine passage through a designated area, with all activation and engagement actions subject to DODD 3000.09 human authorization.",
    capabilities: [
      "Controlled mine field emplacement",
      "USV surface barrier patrol",
      "Spike ER2 surface threat engagement",
      "Acoustic mine activation / deactivation",
      "DODD 3000.09 activation control"
    ],
    trl: "TRL 8",
    icon: Ban,
    category: "KINETIC WEAPONS",
    subType: null,
    swap: { weight: 0, power: 0.1, size: "small" },
    statImpacts: { speed: 0, power: 0, weight: 0, range: 0, stealth: 0 },
    securityLevel: ["DODD 3000.09 Compliant", "Hague VIII Compliant", "HITL Activation"],
    securityIcons: ["milstd", "hardened"],
    specs: {
      mineSystem: "Hammerhead Module (Mk 54 warhead, acoustic activation)",
      barrierUSV: "MARTAC M80 Stiletto armed variant",
      denialArea: "Configurable — up to 200 sq nm",
      clearanceTime: "Acoustic deactivation on command",
      activation: "Commander acoustic authorization only"
    },
    missionTags: ["KINETIC_EFFECTS", "SEA_DENIAL", "Offensive Mining"]
  },
  {
    name: "cUxS Escort Picket",
    provider: "Epirus / Northrop Grumman",
    type: "Counter-Unmanned Systems Escort",
    description: "Counter-unmanned systems (cUxS) escort picket combining Epirus Leonidas H2O high-power microwave weapon and Coyote Block 3 NK interceptors on MASC USV platforms. Provides 360-degree protection against drone and USV swarms threatening an HVU transit, with MASC vessels maintaining flanking picket positions relative to the carrier.",
    capabilities: [
      "High-power microwave drone/swarm defeat",
      "Coyote Block 3 NK interceptor magazine",
      "360-degree swarm approach coverage",
      "HVU escort station-keeping",
      "Coordinated multi-platform engagement"
    ],
    trl: "TRL 7",
    icon: ShieldCheck,
    category: "ELECTRONIC PROTECTION",
    subType: null,
    swap: { weight: 2500, power: 25, size: "large" },
    statImpacts: { speed: -2, power: -15, weight: 8, range: -3, stealth: -4 },
    securityLevel: ["DODD 3000.09 Compliant", "HITL Fire Control"],
    securityIcons: ["milstd", "hardened"],
    specs: {
      hpmSystem: "Epirus Leonidas H2O",
      interceptors: "Coyote Block 3 NK (×8 per MASC)",
      detectionRadar: "HiddenLevel Passive RF Array",
      coverageArc: "360 degrees",
      platform: "MASC Baseline USV"
    },
    missionTags: ["Force Protection", "Sea Control", "SEA_DENIAL"]
  },
  {
    name: "Advance Screen 5nm Ahead",
    provider: "Anduril / Shadow Fox",
    type: "Advance Screening Position",
    description: "Tactical screening position held 5 nautical miles ahead of a protected asset (HVU or transit group) by a fast autonomous surface vessel. The advance screen provides early warning of surface threats, UAS approach vectors, and mines or obstacles ahead of the HVU track, relaying contacts to the escort force before they enter engagement range.",
    capabilities: [
      "5 nm advance position maintenance",
      "Surface threat early warning",
      "UAS approach vector detection",
      "Mine and obstacle cueing",
      "Real-time contact relay to escort COP"
    ],
    trl: "TRL 7",
    icon: Compass,
    category: "UNMANNED SYSTEMS",
    subType: null,
    swap: { weight: 0, power: 0.1, size: "small" },
    statImpacts: { speed: 2, power: 0, weight: 0, range: 3, stealth: 1 },
    securityLevel: ["Encrypted Comms"],
    securityIcons: ["encrypted"],
    specs: {
      screenDistance: "5 nm ahead of HVU",
      platform: "Shadow Fox ASV or MASC-variant",
      sensors: "HiddenLevel Passive RF + Teledyne FLIR EO/IR",
      contactRelay: "Mesh radio to escort COP",
      responseTime: "< 30 seconds surface contact to escort alert"
    },
    missionTags: ["Force Protection", "Sea Control", "ISR Operations"]
  },
  {
    name: "Fire Control Cueing",
    provider: "Leidos / Caliburn",
    type: "Fire Control Cueing System",
    description: "USW-DSS-derived fire control cueing system that upgrades contact-quality tracks from USV sensor platforms to fire-control-quality designation, enabling direct weapons engagement from shipboard fire control systems. Fuses Persistent Systems MPU5 SDR Link-16 tracks with USW-DSS contact data to produce engagement-ready solutions.",
    capabilities: [
      "Contact-to-fire-control track upgrade",
      "USW-DSS / Persistent Systems MPU5 SDR data fusion",
      "Link-16 fire control quality track output",
      "Multi-platform contact correlation",
      "Engagement solution generation"
    ],
    trl: "TRL 8",
    icon: Target,
    category: "COMMAND & CONTROL",
    subType: null,
    swap: { weight: 0, power: 0.2, size: "small" },
    statImpacts: { speed: 0, power: -1, weight: 0, range: 3, stealth: 0 },
    securityLevel: ["ITAR Controlled", "Encrypted"],
    securityIcons: ["encrypted", "hardened"],
    specs: {
      trackSources: "USW-DSS AN/UYQ-100 + Persistent Systems MPU5 SDR + surface radar",
      outputQuality: "Fire-control grade (Link-16 J3.5)",
      latency: "< 5 seconds contact-to-FC-track",
      integration: "Aegis / SPY fire control, Mk 70 PDS",
      platforms: "M48 ISR USV"
    },
    missionTags: ["ASW", "Sea Control", "ISR Operations"]
  },
  {
    name: "Anti-Swarm Defense",
    provider: "Epirus",
    type: "High-Power Microwave Anti-Swarm System",
    description: "Epirus Leonidas H2O solid-state high-power microwave (HPM) weapon system designed specifically to defeat drone and USV swarm attacks. Radiates a directed microwave beam that disables electronics across multiple targets simultaneously, enabling a single HPM emitter to defeat dozens of attacking drones per engagement. Deployed on MASC USV hull.",
    capabilities: [
      "Simultaneous multi-target drone defeat",
      "Solid-state HPM — no reload required",
      "Effective against Groups 1–3 UAS",
      "Defeats hardened drone electronics",
      "360-degree engagement (slew-to-cue)"
    ],
    trl: "TRL 7",
    icon: Zap,
    category: "DIRECTED ENERGY",
    subType: null,
    swap: { weight: 1200, power: 50, size: "large" },  // Real: HPM operational input ~50-100 kW; 20 kW was standby only
    statImpacts: { speed: -2, power: -18, weight: 6, range: -3, stealth: -6 },
    securityLevel: ["DODD 3000.09 Compliant"],
    securityIcons: ["milstd", "hardened"],
    specs: {
      system: "Epirus Leonidas H2O",
      technology: "Solid-state high-power microwave (HPM)",
      targets: "Groups 1–3 UAS, small USVs",
      engagements: "Unlimited (no consumable)",
      power: "~20 kW peak",
      platform: "MASC Baseline USV"
    },
    keyFeatures: [
      "Defeats entire drone swarms in a single engagement",
      "No consumable — unlimited shots while powered",
      "Operational in maritime salt-spray environment (H2O variant)",
      "Deployed with US Army and USAF — first USV maritime integration"
    ],
    missionTags: ["Force Protection", "SEA_DENIAL", "Sea Control"]
  },
  {
    name: "Persistent HVU Screen",
    provider: "Zero USV / Caliburn",
    type: "Persistent High-Value Unit Screen",
    description: "Continuous autonomous screening of a high-value unit (HVU) by a dedicated fast-response USV that maintains a persistent picket position relative to the HVU track. The Zero USV Oceanus provides 24/7 coverage, conducting active surface surveillance, threat detection, and acting as a mesh radio C2 node — maintaining station at all sea states.",
    capabilities: [
      "24/7 persistent picket relative to HVU",
      "High-speed intercept response",
      "Active surface surveillance",
      "Mesh radio C2 relay node",
      "All-weather sea-state persistent ops"
    ],
    trl: "TRL 7",
    icon: Shield,
    category: "UNMANNED SYSTEMS",
    subType: null,
    swap: { weight: 0, power: 0.1, size: "small" },
    statImpacts: { speed: 2, power: 0, weight: 0, range: 2, stealth: 1 },
    securityLevel: ["Encrypted Comms"],
    securityIcons: ["encrypted"],
    specs: {
      platform: "Zero USV Oceanus",
      positionKeeping: "Relative to HVU ± 500 m",
      speed: "Up to 40 kt sprint response",
      endurance: "72+ hours autonomous",
      commsRelay: "Persistent Systems Wave Relay mesh node"
    },
    missionTags: ["Force Protection", "Sea Control", "ISR Operations"]
  },
  {
    name: "Zero-RF Emissions Passive Patrol",
    provider: "Saildrone / Caliburn",
    type: "EMCON Passive Patrol Mode",
    description: "Fully emissions-controlled patrol mode in which a platform (typically Saildrone Voyager) operates with all active RF systems — radio, radar, AIS transponder — powered off. The platform relies solely on passive ESM intercept, EO/IR sensors, and pre-programmed waypoints for navigation and collection. Data is stored onboard and transmitted in burst mode via acoustic modem or scheduled SATCOM window.",
    capabilities: [
      "Zero active RF emissions throughout patrol",
      "Passive ESM-only sensor operation",
      "Pre-programmed autonomous waypoint navigation",
      "Onboard data storage with burst SATCOM upload",
      "Acoustic modem covert data relay option"
    ],
    trl: "TRL 8",
    icon: Radio,
    category: "UNMANNED SYSTEMS",
    subType: null,
    swap: { weight: 5, power: 0.15, size: "small" },
    statImpacts: { speed: 0, power: -1, weight: 0, range: 0, stealth: 15 },
    securityLevel: ["Zero RF Emissions", "EMCON Compliant", "Passive Only"],
    securityIcons: ["encrypted"],
    specs: {
      platform: "Saildrone Voyager",
      rfEmissions: "Zero — all active RF systems off",
      navigation: "Pre-programmed waypoints + wind-sail autonomy",
      dataRelease: "Scheduled burst SATCOM or acoustic modem",
      endurance: "Up to 365 days",
      sensors: "Passive ESM, EO/IR, acoustic hydrophone"
    },
    missionTags: ["ISR Operations", "RECONNAISSANCE", "Sea Control", "NON_KINETIC_EW"]
  },

  // ============ ADDITIONAL VESSEL CAPABILITY ENTRIES ============
  {
    name: "Bistatic Cross-Fix Node",
    provider: "L3Harris",
    type: "Passive Bistatic Sonar Node",
    description: "Passive bistatic acoustic receiver node that cross-fixes submarine contacts using separated receiver geometry with a remote active pinger. Enables precise localization without emitting.",
    capabilities: ["Passive bistatic reception", "Cross-fix geometry with CAPTAS-4", "Submarine contact localization"],
    trl: "TRL 7",
    icon: "Waves",
    category: "ACOUSTIC/SONAR",
    subType: null,
    swap: { weight: 120, power: 0.4, size: "small" },
    statImpacts: { speed: 0, power: -2, weight: 1, range: 3, stealth: 0 },
    securityLevel: ["ITAR Controlled"],
    securityIcons: ["encrypted"],
    specs: { type: "Passive bistatic hydrophone node", geometry: "Separated receiver for cross-fix", output: "Track data to USW-DSS" },
    missionTags: ["ASW"]
  },
  {
    name: "Zone Breach Detection",
    provider: "OceanSonics",
    type: "Acoustic Zone Monitoring",
    description: "Passive acoustic zone monitoring system that detects and alerts on underwater or surface vessel intrusion into a defined maritime security zone. Uses hydrophone arrays and signature libraries.",
    capabilities: ["Zone perimeter acoustic monitoring", "Intrusion alert generation", "Vessel signature matching"],
    trl: "TRL 8",
    icon: "Waves",
    category: "ACOUSTIC/SONAR",
    subType: null,
    swap: { weight: 80, power: 0.3, size: "small" },
    statImpacts: { speed: 0, power: -1, weight: 1, range: 2, stealth: 0 },
    securityLevel: ["Encrypted"],
    securityIcons: ["encrypted"],
    specs: { detection: "Passive acoustic hydrophone array", zone: "Configurable perimeter", alert: "Real-time breach notification" },
    missionTags: ["PORT_SECURITY"]
  },
  {
    name: "VHF Hailing Capability",
    provider: "Icom",
    type: "VHF Marine Radio Hailing System",
    description: "Marine VHF radio hailing system for vessel-to-vessel and vessel-to-shore communications. Supports maritime hailing, challenge, and identification procedures per COLREGS.",
    capabilities: ["VHF Ch 16 distress monitoring", "Vessel hailing and challenge", "DSC digital selective calling"],
    trl: "TRL 9",
    icon: "Radio",
    category: "RF COMMUNICATIONS",
    subType: null,
    swap: { weight: 2, power: 0.05, size: "small" },
    statImpacts: { speed: 0, power: -1, weight: 0, range: 1, stealth: -1 },
    securityLevel: ["USCG Compliant"],
    securityIcons: [],
    specs: { channels: "VHF Ch 1–88, Int'l + US", power: "25 W (max)", range: "Up to 20 nm LOS", standard: "COLREGS / ITU-R M.493" },
    missionTags: ["PORT_SECURITY"]
  },
  {
    name: "GCCS Track Correlation",
    provider: "Leidos",
    type: "Global Command and Control System Track Correlation",
    description: "GCCS-M (Global Command and Control System - Maritime) track correlation module that fuses USV-derived contacts with the GCCS common operational picture, enabling fleet-wide track deconfliction and contact management.",
    capabilities: ["GCCS-M track fusion", "Contact deconfliction", "Common operational picture integration"],
    trl: "TRL 9",
    icon: "Shield",
    category: "C2 SYSTEMS",
    subType: null,
    swap: { weight: 0, power: 0.1, size: "small" },
    statImpacts: { speed: 0, power: -1, weight: 0, range: 2, stealth: 0 },
    securityLevel: ["SECRET capable", "NSA Approved Crypto"],
    securityIcons: ["encrypted", "milstd"],
    specs: { system: "GCCS-M (Global Command and Control System - Maritime)", interface: "Link-16 / JREAP-C", classification: "Up to SECRET" },
    missionTags: ["PORT_SECURITY", "ASW"]
  },
  {
    name: "Passive Sonar Track Relay",
    provider: "OceanSonics",
    type: "Passive Sonar Track Data Relay",
    description: "Acoustic contact track relay system that packages passive sonar detections from towed array or hull-mounted sensors and transmits them via encrypted mesh radio to the tactical operations center.",
    capabilities: ["Passive sonar track packaging", "Encrypted track relay", "Multi-platform contact correlation"],
    trl: "TRL 7",
    icon: "Waves",
    category: "ACOUSTIC/SONAR",
    subType: null,
    swap: { weight: 15, power: 0.1, size: "small" },
    statImpacts: { speed: 0, power: -1, weight: 0, range: 2, stealth: 0 },
    securityLevel: ["Encrypted"],
    securityIcons: ["encrypted"],
    specs: { input: "Passive sonar contact tracks", output: "Encrypted mesh radio relay", latency: "< 5 seconds" },
    missionTags: ["PORT_SECURITY", "ASW"]
  },
  {
    name: "Multi-Sensor Localization",
    provider: "Caliburn",
    type: "Multi-Sensor Contact Localization",
    description: "Fusion engine that combines acoustic, EO/IR, radar, and AIS data from multiple USV platforms to produce precise contact localization using cross-bearing geometry and track correlation algorithms.",
    capabilities: ["Multi-sensor data fusion", "Cross-bearing geometry localization", "Track correlation and deconfliction"],
    trl: "TRL 7",
    icon: "Shield",
    category: "C2 SYSTEMS",
    subType: null,
    swap: { weight: 0, power: 0.2, size: "small" },
    statImpacts: { speed: 0, power: -1, weight: 0, range: 3, stealth: 0 },
    securityLevel: ["Encrypted"],
    securityIcons: ["encrypted"],
    specs: { sensors: "Acoustic, EO/IR, radar, AIS", method: "Cross-bearing + track correlation", output: "Fused contact track to COP" },
    missionTags: ["PORT_SECURITY", "ASW"]
  },
  {
    name: "IFF Negative Alert",
    provider: "BAE Systems",
    type: "IFF Non-Cooperative Target Recognition",
    description: "Identifies vessels that fail to respond to IFF interrogation challenges, generating a negative-IFF alert for operator review. Supports MODE 1/2/3/C/S and MODE 5 interrogation per NATO STANAG 4193.",
    capabilities: ["IFF Mode 1/2/3/C/S interrogation", "Negative response alert generation", "Non-cooperative target flagging"],
    trl: "TRL 9",
    icon: "Shield",
    category: "C2 SYSTEMS",
    subType: null,
    swap: { weight: 0, power: 0.1, size: "small" },
    statImpacts: { speed: 0, power: -1, weight: 0, range: 1, stealth: 0 },
    securityLevel: ["NATO STANAG 4193", "ITAR Controlled"],
    securityIcons: ["milstd", "encrypted"],
    specs: { modes: "Mode 1/2/3/C/S, Mode 5", standard: "NATO STANAG 4193", output: "Negative-IFF alert to COP" },
    missionTags: ["PORT_SECURITY"]
  },
  {
    name: "Link 16 Track Broadcast",
    provider: "Collins Aerospace",
    type: "Link 16 Track Data Broadcast",
    description: "MIDS-LVT Link 16 terminal that broadcasts USV-derived contact tracks in J-series message format to tactical data network participants, enabling real-time track sharing with surface combatants, aircraft, and shore C2.",
    capabilities: ["Link 16 J3.5 contact track broadcast", "MIDS-LVT waveform", "Multi-network J-series messaging"],
    trl: "TRL 9",
    icon: "Radio",
    category: "RF COMMUNICATIONS",
    subType: null,
    swap: { weight: 19.3, power: 0.35, size: "small" },  // Real: MIDS-LVT(1) RT = 19.28 kg; 350W at 70% TSDF (L3Harris sell sheet 2025)
    statImpacts: { speed: 0, power: -2, weight: 0, range: 3, stealth: -2 },
    securityLevel: ["NSA Type 1 Encrypted", "ITAR Controlled"],
    securityIcons: ["encrypted", "milstd"],
    specs: { terminal: "MIDS-LVT (Multifunctional Information Distribution System)", format: "J3.5 contact tracks", dataRate: "Up to 238 kbps", frequency: "960–1215 MHz TDMA" },
    missionTags: ["ASW", "PORT_SECURITY", "KINETIC_EFFECTS"]
  },
  {
    name: "20-ft TEU Dry Cargo Module",
    provider: "Caliburn",
    type: "Containerized Dry Cargo Logistics Module",
    description: "Standard 20-foot TEU containerized dry cargo logistics module for USV-based contested logistics delivery. Configurable for palletized munitions, spare parts, medical supplies, or mission equipment resupply.",
    capabilities: ["20-ft ISO container payload", "Palletized cargo stowage", "Bow ramp or crane offload"],
    trl: "TRL 7",
    icon: "Anchor",
    category: "LOGISTICS",
    subType: 'CARGO_MODULE',
    swap: { weight: 24000, power: 0, size: "large" },
    statImpacts: { speed: -3, power: 0, weight: 8, range: -2, stealth: -1 },
    securityLevel: [],
    securityIcons: [],
    specs: { container: "20-ft ISO TEU", capacity: "Up to 24,000 kg", offload: "Bow ramp / crane", contents: "Palletized dry cargo" },
    missionTags: ["LOGISTICS"]
  },
  {
    name: "20-ft TEU Fuel Bladder Module",
    provider: "Caliburn",
    type: "Containerized Fuel Bladder Logistics Module",
    description: "Standard 20-foot TEU containerized fuel bladder module carrying up to 20,000 liters of JP-5 or diesel for at-sea or pier-side refueling of USV, small craft, and forward operating forces.",
    capabilities: ["20-ft ISO container fuel bladder", "JP-5 / diesel fuel storage", "Gravity or pump transfer refueling"],
    trl: "TRL 7",
    icon: "Anchor",
    category: "LOGISTICS",
    subType: 'CARGO_MODULE',
    swap: { weight: 22000, power: 0.1, size: "large" },
    statImpacts: { speed: -3, power: -1, weight: 8, range: -2, stealth: -1 },
    securityLevel: ["Hazmat Compliant"],
    securityIcons: [],
    specs: { container: "20-ft ISO TEU", capacity: "20,000 L fuel", fuelTypes: "JP-5, diesel, mogas", transfer: "Gravity or pump, 150 L/min" },
    missionTags: ["LOGISTICS"]
  },
  {
    name: "Bow Ramp Delivery System",
    provider: "Caliburn",
    type: "USV Bow Ramp Cargo Delivery",
    description: "Hydraulic bow ramp system on MARTAC T82 enabling beach, pier, or vessel-to-vessel cargo delivery without crane. Supports rapid offload of pallets, vehicles, and TEU container contents.",
    capabilities: ["Hydraulic bow ramp deployment", "Beach and pier direct delivery", "Palletized cargo offload"],
    trl: "TRL 7",
    icon: "Anchor",
    category: "LOGISTICS",
    subType: 'CARGO_MODULE',
    swap: { weight: 800, power: 0.5, size: "medium" },
    statImpacts: { speed: -1, power: -2, weight: 3, range: -1, stealth: -1 },
    securityLevel: [],
    securityIcons: [],
    specs: { rampType: "Hydraulic bow ramp", capacity: "Up to 10,000 kg offload", deployment: "< 2 minutes to open", platforms: "MARTAC T82 Devil Ray" },
    missionTags: ["LOGISTICS"]
  },
  {
    name: "EO/IR Beach Recon Camera",
    provider: "Teledyne FLIR",
    type: "EO/IR Beach Reconnaissance Camera",
    description: "Maritime EO/IR reconnaissance camera system optimized for beach survey, coastal zone mapping, and pre-landing site assessment. Combines visible and thermal imaging with geo-referencing output.",
    capabilities: ["Visible + thermal beach imagery", "Coastal zone geo-referenced mapping", "Pre-landing site assessment"],
    trl: "TRL 9",
    icon: "Eye",
    category: "EO/IR SENSORS",
    subType: null,
    swap: { weight: 4, power: 0.15, size: "small" },
    statImpacts: { speed: 0, power: -1, weight: 0, range: 2, stealth: -1 },
    securityLevel: ["ITAR Controlled"],
    securityIcons: [],
    specs: { sensor: "Dual EO/IR (visible + LWIR thermal)", output: "Geo-referenced video + still imagery", fov: "Continuous zoom 5°–45°", latency: "< 1 second" },
    missionTags: ["LOGISTICS", "ISR Operations"]
  },
  {
    name: "Coastal Surface Radar",
    provider: "Furuno",
    type: "Maritime Coastal Surface Search Radar",
    description: "X-band marine surface search radar providing vessel detection and tracking in coastal and port approach zones. Outputs AIS-correlated contact tracks for COP integration.",
    capabilities: ["X-band surface search", "Vessel detection and tracking", "AIS contact correlation"],
    trl: "TRL 9",
    icon: "Satellite",
    category: "RADAR/RF",
    subType: null,
    swap: { weight: 12, power: 0.15, size: "small" },
    statImpacts: { speed: 0, power: -2, weight: 1, range: 2, stealth: -2 },
    securityLevel: [],
    securityIcons: [],
    specs: { band: "X-band (9 GHz)", range: "Up to 24 nm", targets: "Surface vessels ≥ 5 m", output: "NMEA / AIS-correlated track" },
    missionTags: ["LOGISTICS", "PORT_SECURITY"]
  },
  {
    name: "Echodyne EchoGuard CR",
    provider: "Echodyne",
    type: "Compact Surveillance Radar",
    description: "Ultra-compact 24 GHz electronically-scanned-array (ESA) radar for maritime perimeter and C-UAS surveillance. At 1.25 kg and 23 W average power, it is one of the lightest capable surveillance radars available — purpose-built for SWaP-constrained platforms like the SubSeaSail Horus. IP67 weatherproof. Detects small surface contacts and low-altitude aerial threats at up to 1.2 km.",
    capabilities: [
      "1.2 km detection range (small surface and low-altitude targets)",
      "24 GHz ESA waveform — electronic beam steering, no moving parts",
      "C-UAS: detects small UAS / drone threats",
      "Maritime perimeter surveillance",
      "IP67 weatherproof — spray and submersion rated",
      "Real-time 3D tracking output"
    ],
    trl: "TRL 9",
    icon: Radar,
    category: "RADAR/RF",
    subType: null,
    swap: {
      weight: 1.25,   // Real: 1.25 kg per Echodyne EchoGuard CR datasheet
      power: 0.023,   // Real: 23 W avg per Echodyne EchoGuard CR datasheet
      size: "small"
    },
    statImpacts: { speed: 0, power: -1, weight: 0, range: 2, stealth: -1 },
    securityLevel: [],
    securityIcons: [],
    specs: {
      band: "24 GHz (K-band ESA)",
      range: "1.2 km (small surface/aerial targets)",
      weight: "1.25 kg",
      power: "23 W average",
      protection: "IP67",
      beamSteering: "Electronic (no moving parts)",
      output: "3D track (range, azimuth, elevation)"
    },
    keyFeatures: [
      "Lightest capable ESA surveillance radar on the market",
      "No moving parts — silent, low-maintenance, vibration-tolerant",
      "Fits SubSeaSail Horus 10 kg payload budget with significant margin",
      "Dual-use: maritime surface surveillance + C-UAS"
    ],
    missionTags: ["PORT_SECURITY", "CONTESTED_LOGISTICS", "MCM"]
  },
  {
    name: "EW Decoy Payload",
    provider: "GFE",
    type: "Active RF Decoy",
    description: "Active radio-frequency decoy payload. Emits a false electronic signature so a small, low-cost hull appears on adversary sensors as a large surface combatant. Used as a persistent lure so a disposable USV paints as a warship and baits adversary ISR into committing high-value assets to investigate it.",
    capabilities: [
      "False-target signature generation",
      "Large-combatant radar-return synthesis",
      "Programmable ship-class signature",
      "Reactive to illuminating radar",
      "Cost-imposition deception baiting"
    ],
    trl: "TRL 8",
    icon: Radio,
    category: "ELECTRONIC ATTACK",
    subType: 'EW_DECOY',
    swap: { weight: 12, power: 0.2, size: "small" },
    statImpacts: { speed: 0, power: -2, weight: 1, range: 0, stealth: -8 },
    securityLevel: [],
    securityIcons: [],
    specs: {
      technique: "Active RF decoy / false-target generation",
      platform: "SubSeaSail Horus / micro-USV mast mount",
      emissions: "False large-ship radar signature",
      signature: "Large surface combatant",
      trigger: "Reactive — on adversary radar illumination"
    },
    keyFeatures: [
      "Makes a small hull appear as a large warship on enemy sensors",
      "Turns a disposable USV into a warship-sized sensor lure",
      "Imposes cost asymmetry — baits expensive ISR to chase a cheap hull"
    ],
    missionTags: ["COUNTER_C5ISR", "NON_KINETIC_EW"]
  },
  {
    name: "Tomahawk Block V 8-cell VLS",
    provider: "Raytheon",
    type: "Land-Attack Cruise Missile VLS",
    description: "8-cell containerized Tomahawk Block V VLS module for USV integration. Tomahawk Block V (Maritime Strike) adds seeker for moving maritime targets. Range 1,000+ nm. Requires DODD 3000.09 human authorization for each launch.",
    capabilities: ["1,000+ nm land-attack range", "Maritime strike variant (Block Va)", "8-round salvo capacity", "DODD 3000.09 launch authorization"],
    trl: "TRL 8",
    icon: "Target",
    category: "KINETIC WEAPONS",
    subType: 'STRIKE_WEAPON',
    swap: { weight: 28000, power: 8, size: "large" },  // Real: Mk 41 8-cell ~15,000 kg empty + 8x Tomahawk ~1,510 kg each; power 8 kW operational
    statImpacts: { speed: -3, power: -5, weight: 9, range: 0, stealth: -3 },
    securityLevel: ["ITAR Controlled", "DODD 3000.09 Compliant", "NSA Type 1 Crypto"],
    securityIcons: ["milstd", "encrypted", "hardened"],
    specs: { missiles: "8× Tomahawk Block V", range: "1,000+ nm", variant: "Block Va (JMEWES maritime strike) / Block V (land-attack)", guidance: "INS/GPS/DSMAC/seeker", authorization: "Human operator required for launch" },
    missionTags: ["KINETIC_EFFECTS", "Sea Control"]
  },
  {
    name: "EMCON Transit Capable",
    provider: "Caliburn",
    type: "Emissions Control Transit Mode",
    description: "EMCON (Emissions Control) transit mode configuration that reduces the vessel's electromagnetic signature during approach by disabling non-essential active emitters while maintaining passive navigation and silent SATCOM burst.",
    capabilities: ["Active emitter shutdown", "Passive-only navigation", "Silent burst SATCOM communications"],
    trl: "TRL 8",
    icon: "Radio",
    category: "NAVIGATION",
    subType: null,
    swap: { weight: 0, power: 0, size: "small" },
    statImpacts: { speed: 0, power: 0, weight: 0, range: 0, stealth: 10 },
    securityLevel: ["EMCON Compliant"],
    securityIcons: ["encrypted"],
    specs: { emitters: "All active RF off (radar, AIS, VHF)", navigation: "INS + passive celestial", comms: "Scheduled burst SATCOM only", detection: "Near-zero RF signature" },
    missionTags: ["KINETIC_EFFECTS", "ISR Operations"]
  },
  {
    name: "Teledyne FLIR EO/IR Turret",
    provider: "Teledyne FLIR",
    type: "Stabilized EO/IR Turret",
    description: "Multi-spectral stabilized EO/IR turret providing continuous zoom visible and LWIR thermal imagery for maritime surveillance, target identification, and BDA support.",
    capabilities: ["Stabilized EO visible imaging", "LWIR thermal imaging", "Continuous zoom and geo-pointing"],
    trl: "TRL 9",
    icon: "Eye",
    category: "EO/IR SENSORS",
    subType: null,
    swap: { weight: 18, power: 0.3, size: "medium" },
    statImpacts: { speed: 0, power: -2, weight: 1, range: 3, stealth: -1 },
    securityLevel: ["ITAR Controlled"],
    securityIcons: [],
    specs: { sensor: "EO (visible) + LWIR thermal", fov: "Continuous zoom", stabilization: "3-axis gyro-stabilized", output: "HD video + geo-referenced still" },
    missionTags: ["KINETIC_EFFECTS", "ISR Operations", "Force Protection"]
  },
  {
    name: "Scion ESM Electronic Support",
    provider: "Northrop Grumman",
    type: "Electronic Support Measures",
    description: "Project Scion-derived ESM electronic support module providing wideband passive RF signal intercept, emitter characterization, and geolocation for maritime domain awareness.",
    capabilities: ["Wideband passive RF intercept", "Emitter identification and characterization", "RF emitter geolocation"],
    trl: "TRL 7",
    icon: "Satellite",
    category: "RADAR/RF",
    subType: null,
    swap: { weight: 45, power: 0.8, size: "medium" },
    statImpacts: { speed: 0, power: -3, weight: 2, range: 4, stealth: 0 },
    securityLevel: ["ITAR Controlled", "NSA Approved"],
    securityIcons: ["encrypted", "milstd"],
    specs: { frequency: "2–18 GHz coverage", modes: "Intercept, ID, geolocation", output: "ELINT track to TempestOS", integration: "Project Scion autonomy stack" },
    missionTags: ["KINETIC_EFFECTS", "ISR Operations"]
  },
  {
    name: "365-Day Endurance",
    provider: "Saildrone",
    type: "Ultra-Long Endurance Platform Capability",
    description: "Saildrone Voyager wind-and-solar-powered endurance mode enabling up to 365-day autonomous maritime patrol without refueling. Leverages renewable energy to maintain persistent on-station presence at very low operating cost.",
    capabilities: ["Up to 365-day autonomous endurance", "Wind and solar power only", "Persistent on-station patrol"],
    trl: "TRL 9",
    icon: "Compass",
    category: "NAVIGATION",
    subType: null,
    swap: { weight: 0, power: 0, size: "small" },
    statImpacts: { speed: 0, power: 0, weight: 0, range: 10, stealth: 2 },
    securityLevel: [],
    securityIcons: [],
    specs: { platform: "Saildrone Voyager", endurance: "Up to 365 days", propulsion: "Wind-powered sail + solar", speed: "2–8 knots" },
    missionTags: ["ISR Operations", "KINETIC_EFFECTS", "MDA/ISR"]
  },
  {
    name: "Epirus Leonidas H2O HPM",
    provider: "Epirus",
    type: "High-Power Microwave Weapon System",
    description: "Epirus Leonidas H2O solid-state high-power microwave (HPM) system in maritime-hardened (H2O) variant for USV hull deployment. Defeats drone and USV swarms through directed microwave energy, disabling electronics without kinetic impact.",
    capabilities: ["Solid-state HPM drone defeat", "Simultaneous multi-target engagement", "Maritime-hardened H2O variant"],
    trl: "TRL 7",
    icon: "Zap",
    category: "DIRECTED ENERGY",
    subType: 'EW_JAMMER',
    swap: { weight: 1200, power: 50, size: "large" },  // Real: HPM operational input ~50-100 kW; 20 kW was standby only
    statImpacts: { speed: -2, power: -18, weight: 6, range: -3, stealth: -6 },
    securityLevel: ["DODD 3000.09 Compliant"],
    securityIcons: ["milstd", "hardened"],
    specs: { system: "Epirus Leonidas H2O", type: "Solid-state HPM", targets: "Groups 1–3 UAS, small USVs", power: "~20 kW peak", consumable: "None — unlimited shots while powered" },
    missionTags: ["Force Protection", "SEA_DENIAL"]
  },
  {
    name: "Coyote Block 3NK ×8 Interceptors",
    provider: "Raytheon",
    type: "Loitering Munition Counter-UAS Interceptor",
    description: "Eight Coyote Block 3NK (non-kinetic) loitering interceptors launched from a CUAS-M canister system. Each Coyote Block 3NK uses proximity-fuzed warhead or RF disruption to defeat incoming Group 1–3 UAS threats at range.",
    capabilities: ["8× Coyote Block 3NK interceptors", "Proximity-fuzed UAS defeat", "Group 1–3 UAS engagement"],
    trl: "TRL 8",
    icon: "Target",
    category: "KINETIC WEAPONS",
    subType: 'STRIKE_WEAPON',
    swap: { weight: 400, power: 0.5, size: "medium" },  // Real: Block 3NK est. ~30 kg/airframe × 8 + launcher hardware; total ~400 kg
    statImpacts: { speed: -1, power: -3, weight: 3, range: 0, stealth: -2 },
    securityLevel: ["ITAR Controlled", "DODD 3000.09 Compliant"],
    securityIcons: ["milstd"],
    specs: { interceptors: "8× Coyote Block 3NK", range: "Up to 15 km", targets: "Groups 1–3 UAS", launcher: "CUAS-M canister system", authorization: "Human-in-the-loop engagement" },
    missionTags: ["Force Protection", "SEA_DENIAL"]
  },
  {
    name: "UAS Approach Vector Alert",
    provider: "HiddenLevel",
    type: "UAS Approach Vector Detection and Alert",
    description: "HiddenLevel passive RF sensor-derived UAS approach vector alert that detects and tracks incoming drone trajectories, cueing defensive systems (HPM, interceptors) with bearing, range, and predicted intercept point.",
    capabilities: ["UAS approach vector detection", "Bearing and range to incoming drone", "Defensive system pre-cue"],
    trl: "TRL 7",
    icon: "Satellite",
    category: "C2 SYSTEMS",
    subType: null,
    swap: { weight: 0, power: 0.2, size: "small" },
    statImpacts: { speed: 0, power: -1, weight: 0, range: 2, stealth: 0 },
    securityLevel: [],
    securityIcons: [],
    specs: { detection: "Passive RF emission detection", output: "Bearing, range, approach vector", cue: "Leonidas HPM / Coyote launcher", latency: "< 5 seconds" },
    missionTags: ["Force Protection"]
  },
  {
    name: "AIS Dark Ship Detection",
    provider: "Saildrone",
    type: "AIS Non-Transmitting Vessel Detection",
    description: "Passive radar and EO/IR-based detection system for vessels operating without AIS transponders (AIS dark). Correlates radar contacts against AIS traffic to flag non-transmitting vessels for investigation.",
    capabilities: ["AIS dark vessel flagging", "Radar-to-AIS correlation gap detection", "Non-cooperative vessel identification"],
    trl: "TRL 8",
    icon: "Satellite",
    category: "RADAR/RF",
    subType: null,
    swap: { weight: 10, power: 0.3, size: "small" },
    statImpacts: { speed: 0, power: -2, weight: 1, range: 3, stealth: 0 },
    securityLevel: [],
    securityIcons: [],
    specs: { method: "Radar + AIS cross-correlation", detection: "AIS-silent vessels ≥ 20 m", output: "Dark ship alert to COP", platform: "Saildrone Voyager" },
    missionTags: ["MDA/ISR", "ISR Operations"]
  },
  {
    name: "Pattern-of-Life Engine",
    provider: "Palantir",
    type: "Maritime Pattern-of-Life AI Engine",
    description: "Palantir Foundry-based maritime pattern-of-life AI engine that ingests AIS history, sensor tracks, and imagery to identify anomalous vessel behavior, predict future positions, and cue ISR collection against vessels of interest.",
    capabilities: ["AIS behavioral pattern analysis", "Anomalous vessel behavior detection", "Predictive track and ISR cueing"],
    trl: "TRL 8",
    icon: "Brain",
    category: "C2 SYSTEMS",
    subType: null,
    swap: { weight: 0, power: 0.5, size: "small" },
    statImpacts: { speed: 0, power: -2, weight: 0, range: 5, stealth: 0 },
    securityLevel: ["Encrypted", "FedRAMP Authorized"],
    securityIcons: ["encrypted"],
    specs: { platform: "Palantir Foundry", inputs: "AIS, sensor tracks, imagery, OSINT", output: "Anomaly alerts + predictive tracks to COP", analysis: "ML behavioral pattern engine" },
    missionTags: ["MDA/ISR", "ISR Operations"]
  },
  {
    name: "Teledyne FLIR EO/IR Day/Night",
    provider: "Teledyne FLIR",
    type: "Day/Night EO/IR Surveillance Camera",
    description: "Day/night maritime surveillance EO/IR camera with continuous zoom visible imager and uncooled LWIR thermal for 24/7 vessel and threat detection in all lighting and weather conditions.",
    capabilities: ["24/7 day/night surveillance", "Visible + LWIR thermal dual sensor", "Stabilized continuous zoom"],
    trl: "TRL 9",
    icon: "Eye",
    category: "EO/IR SENSORS",
    subType: null,
    swap: { weight: 8, power: 0.15, size: "small" },
    statImpacts: { speed: 0, power: -1, weight: 0, range: 2, stealth: -1 },
    securityLevel: ["ITAR Controlled"],
    securityIcons: [],
    specs: { sensor: "Visible CCD + uncooled LWIR", zoom: "Continuous optical zoom", stabilization: "2-axis stabilized", output: "HD video feed + thermal" },
    missionTags: ["Force Protection", "ISR Operations"]
  },
  {
    name: "ACOMMS Track Receive",
    provider: "Woods Hole Oceanographic Institution",
    type: "Acoustic Communications Track Receive",
    description: "Underwater acoustic communications (ACOMMS) receiver that accepts track data and tactical messages transmitted by submarine or UUV platforms via acoustic modem, enabling covert subsurface-to-surface data exchange.",
    capabilities: ["Acoustic modem track receive", "Subsurface-to-surface data exchange", "Covert undersea communications"],
    trl: "TRL 8",
    icon: "Waves",
    category: "ACOUSTIC/SONAR",
    subType: 'ACOUSTIC_MODEM',
    swap: { weight: 3, power: 0.025, size: "small" },  // Real: 48g DSP board; ~2-5 kg with housing, PA, transducer; 25W avg
    statImpacts: { speed: 0, power: -1, weight: 0, range: 2, stealth: 0 },
    securityLevel: ["Encrypted ACOMMS"],
    securityIcons: ["encrypted"],
    specs: { modem: "WHOI Micro-Modem 2", frequency: "8–16 kHz", dataRate: "Up to 5 kbps", range: "Up to 3,500 m" },
    missionTags: ["ASW"]
  },
  {
    name: "AUV Launch & Recovery",
    provider: "Hydroid / Teledyne",
    type: "AUV Launch and Recovery System",
    description: "Crane or stern-ramp AUV launch and recovery system (LARS) enabling deployment and retrieval of UUV-class autonomous underwater vehicles from a surface vessel or ESB at sea states up to SS3.",
    capabilities: ["AUV deployment at sea", "AUV recovery at sea", "Sea state 3 operations"],
    trl: "TRL 9",
    icon: "Anchor",
    category: "LOGISTICS",
    subType: null,
    swap: { weight: 1200, power: 1.0, size: "large" },
    statImpacts: { speed: -1, power: -4, weight: 4, range: 0, stealth: -1 },
    securityLevel: [],
    securityIcons: [],
    specs: { capacity: "Up to 1,500 kg AUV", seaState: "SS3 operations", method: "Stern ramp or crane LARS", platforms: "ESB, large USV, surface combatant" },
    missionTags: ["ASW", "LOGISTICS"]
  },
  {
    name: "MCM C2 Node",
    provider: "Leidos",
    type: "Mine Countermeasures Command and Control",
    description: "Dedicated MCM (Mine Countermeasures) C2 node that manages AUV sorties, mine detection contacts, clearance sequencing, and mine-cleared-lane certification. Integrates with GCCS-M and USW-DSS.",
    capabilities: ["AUV sortie management", "Mine contact tracking and clearance", "Lane certification reporting"],
    trl: "TRL 8",
    icon: "Shield",
    category: "C2 SYSTEMS",
    subType: null,
    swap: { weight: 0, power: 0.5, size: "small" },
    statImpacts: { speed: 0, power: -2, weight: 0, range: 0, stealth: 0 },
    securityLevel: ["SECRET capable", "NSA Approved"],
    securityIcons: ["encrypted", "milstd"],
    specs: { system: "LMCS (Lightweight MCM C2 System)", interfaces: "GCCS-M, USW-DSS, AUV datalink", output: "MCM lane certification + mine contact database" },
    missionTags: ["ASW"]
  },
  {
    name: "SATCOM Relay",
    provider: "Viasat",
    type: "SATCOM Communications Relay",
    description: "Satellite communications relay node providing beyond-line-of-sight data relay for forward-deployed USV platforms. Bridges tactical mesh radio networks to strategic SATCOM backbone for C2 and sensor data upload.",
    capabilities: ["Beyond-LOS SATCOM relay", "Mesh-to-SATCOM gateway", "Encrypted data relay"],
    trl: "TRL 9",
    icon: "Satellite",
    category: "SATCOM",
    subType: null,
    swap: { weight: 150, power: 0.7, size: "medium" },  // Real: 1m Ka maritime terminal ~150-170 kg total; ~700W typical (Viasat GMT-6524 datasheet)
    statImpacts: { speed: 0, power: -4, weight: 2, range: 5, stealth: -2 },
    securityLevel: ["NSA Type 1 Encrypted", "ITAR Controlled"],
    securityIcons: ["encrypted", "milstd"],
    specs: { bands: "Ka / Ku-band SATCOM", dataRate: "Up to 20 Mbps relay", encryption: "NSA Type 1", platforms: "ESB, large USV" },
    missionTags: ["ASW", "LOGISTICS"]
  },
  {
    name: "Mk 48 ADCAP Torpedo",
    provider: "Raytheon",
    type: "Heavy Weight Torpedo",
    description: "Mk 48 ADCAP (Advanced Capability) heavyweight wire-guided torpedo for submarine launch against submarine and surface targets. Range 50+ km, depth 3,000+ ft. Requires DODD 3000.09 human authorization for launch.",
    capabilities: ["Heavyweight wire-guided torpedo", "Anti-submarine and anti-surface", "50+ km range, 3,000+ ft depth"],
    trl: "TRL 9",
    icon: "Target",
    category: "KINETIC WEAPONS",
    subType: 'STRIKE_WEAPON',
    swap: { weight: 1676, power: 0, size: "large" },
    statImpacts: { speed: 0, power: 0, weight: 5, range: 0, stealth: 0 },
    securityLevel: ["ITAR Controlled", "DODD 3000.09 Compliant"],
    securityIcons: ["milstd"],
    specs: { weight: "1,676 kg", range: "50+ km", depth: "3,000+ ft", guidance: "Wire-guided + active/passive acoustic homing", authorization: "Human operator required" },
    missionTags: ["ASW"]
  },
  {
    name: "Mk 54 Lightweight Torpedo",
    provider: "Raytheon",
    type: "Lightweight Torpedo",
    description: "Mk 54 MAKO lightweight anti-submarine torpedo — the standard air-dropped and ship-launched ASW weapon. Air-delivered from rotary- and fixed-wing platforms, it enters the water under parachute retard and prosecutes a submarine track with active/passive acoustic homing. Range 10+ km, sized for helicopter hardpoints. Requires DODD 3000.09 human authorization for release.",
    capabilities: ["Air-dropped lightweight torpedo", "Active/passive acoustic homing", "Shallow and deep water ASW", "Helicopter hardpoint compatible"],
    trl: "TRL 9",
    icon: "Target",
    category: "KINETIC WEAPONS",
    subType: 'STRIKE_WEAPON',
    swap: {
      weight: 276,      // Real: 276 kg (608 lb) per US Navy Mk 54 fact file
      power: 0,         // Passive weapon store — no host power draw until release
      size: "medium"
    },
    statImpacts: { speed: 0, power: 0, weight: 3, range: 0, stealth: 0 },
    securityLevel: ["ITAR Controlled", "DODD 3000.09 Compliant"],
    securityIcons: ["milstd"],
    specs: {
      weight: "276 kg (608 lb)",
      length: "2.72 m (107 in)",
      diameter: "324 mm (12.75 in)",
      range: "10+ km",
      guidance: "Active/passive acoustic homing (CBASS)",
      delivery: "Air-drop (parachute retard), ship tube, or VLA rocket",
      authorization: "Human operator required"
    },
    missionTags: ["ASW"]
  },
  {
    name: "Fire Control System",
    provider: "Raytheon / L3Harris",
    type: "Submarine Fire Control System",
    description: "Virginia-class submarine AN/BYG-1 combat control system providing track management, weapon assignment, and launch execution for Mk 48 ADCAP torpedoes and Tomahawk missiles. All weapons employment requires DODD 3000.09 authorization.",
    capabilities: ["AN/BYG-1 combat control", "Multi-target track management", "Weapon assignment and launch control"],
    trl: "TRL 9",
    icon: "Target",
    category: "C2 SYSTEMS",
    subType: null,
    swap: { weight: 0, power: 0.5, size: "small" },
    statImpacts: { speed: 0, power: -2, weight: 0, range: 3, stealth: 0 },
    securityLevel: ["ITAR Controlled", "NSA Type 1", "DODD 3000.09 Compliant"],
    securityIcons: ["encrypted", "milstd"],
    specs: { system: "AN/BYG-1 Combat Control System", weapons: "Mk 48 ADCAP, Tomahawk Block V", tracks: "Multi-target priority queue", authorization: "Human operator required for all engagement" },
    missionTags: ["ASW", "KINETIC_EFFECTS"]
  },
  {
    name: "AN/ZPY-3 AESA Radar",
    provider: "Northrop Grumman",
    type: "AESA Maritime Surveillance Radar",
    description: "AN/ZPY-3 AESA active electronically scanned array radar fitted to MQ-4C Triton providing wide-area maritime surface search and periscope detection at ranges exceeding 150 km.",
    capabilities: ["Wide-area maritime surface search", "AESA active electronically scanned array", "Periscope and small target detection"],
    trl: "TRL 9",
    icon: "Satellite",
    category: "RADAR/RF",
    subType: null,
    swap: { weight: 0, power: 0, size: "small" },
    statImpacts: { speed: 0, power: 0, weight: 0, range: 5, stealth: 0 },
    securityLevel: ["ITAR Controlled"],
    securityIcons: ["milstd"],
    specs: { type: "AESA (Active Electronically Scanned Array)", range: "150+ km surface search", platform: "MQ-4C Triton", detection: "Surface vessels + periscope masts" },
    missionTags: ["KINETIC_EFFECTS", "ISR Operations"]
  },
  {
    name: "150km+ Periscope Detection",
    provider: "Northrop Grumman",
    type: "Long-Range Periscope Detection Radar",
    description: "AN/ZPY-3-derived long-range periscope detection mode providing detection of submarine periscope masts and snorkel at ranges exceeding 150 km from MQ-4C Triton altitude.",
    capabilities: ["150+ km periscope detection", "Submarine snorkel detection", "MQ-4C Triton altitude-leveraged range"],
    trl: "TRL 8",
    icon: "Satellite",
    category: "RADAR/RF",
    subType: null,
    swap: { weight: 0, power: 0, size: "small" },
    statImpacts: { speed: 0, power: 0, weight: 0, range: 5, stealth: 0 },
    securityLevel: ["ITAR Controlled"],
    securityIcons: ["milstd"],
    specs: { range: "150+ km", target: "Periscope mast, snorkel", platform: "MQ-4C Triton", radar: "AN/ZPY-3 AESA periscope mode" },
    missionTags: ["ASW", "KINETIC_EFFECTS"]
  },
  {
    name: "Ka-SATCOM to TempestOS",
    provider: "Viasat / Caliburn",
    type: "Ka-band SATCOM TempestOS Integration",
    description: "Ka-band satellite communications link from MQ-4C Triton or USV to TempestOS C2 cloud, enabling real-time streaming of wide-area sensor data and two-way tasking communications.",
    capabilities: ["Ka-band SATCOM high-bandwidth link", "Real-time sensor data streaming to TempestOS", "Two-way C2 tasking"],
    trl: "TRL 9",
    icon: "Satellite",
    category: "SATCOM",
    subType: null,
    swap: { weight: 60, power: 0.7, size: "medium" },  // Real: compact Ka maritime terminal ~60 kg; ~700W typical
    statImpacts: { speed: 0, power: -5, weight: 1, range: 5, stealth: -2 },
    securityLevel: ["NSA Type 1 Encrypted", "ITAR Controlled"],
    securityIcons: ["encrypted", "milstd"],
    specs: { band: "Ka-band", dataRate: "Up to 274 Mbps downlink", encryption: "NSA Type 1", integration: "TempestOS cloud C2 gateway" },
    missionTags: ["KINETIC_EFFECTS", "ISR Operations"]
  },

  // ============ GP-USV SEA JEEP PAYLOAD CATALOG ============
  {
    name: "Trillium HD25e Gimbal Camera",
    provider: "L3Harris Trillium",
    type: "EO/IR Gimbal — Base Mount",
    description: "Stabilized EO/IR gimbal for small USV deck mount. Day/night imagery for AIS-dark vessel identification and contact reporting.",
    capabilities: ["Visible + thermal imaging", "Stabilized gimbal", "Day/night contact ID"],
    trl: "TRL 9",
    icon: "Eye",
    category: "EO/IR SENSORS",
    subType: null,
    swap: { weight: 1, power: 0.02, size: "small" },
    statImpacts: { speed: 0, power: -1, weight: 0, range: 2, stealth: 0 },
    securityLevel: [],
    securityIcons: [],
    missionTags: ["MDA/ISR", "SEA_JEEP_MDA"]
  },
  {
    name: "Trillium HD25e Gimbal (Mast-Mounted)",
    provider: "L3Harris Trillium",
    type: "EO/IR Gimbal — Extended Mast",
    description: "Trillium HD25e mounted on GP-USV extended ISR mast. Elevation to ~3m adds 3nm optical horizon for coastal launch detection.",
    capabilities: ["3nm extended optical horizon", "Mast-elevated EO/IR", "Coastal launch detection"],
    trl: "TRL 9",
    icon: "Eye",
    category: "EO/IR SENSORS",
    subType: null,
    swap: { weight: 1, power: 0.02, size: "small" },
    statImpacts: { speed: 0, power: -1, weight: 0, range: 3, stealth: 0 },
    securityLevel: [],
    securityIcons: [],
    missionTags: ["SEA_JEEP_ISR"]
  },
  {
    name: "Extended ISR Mast + Counterweight Keel",
    provider: "GP-USV",
    type: "Structural Payload Extension",
    description: "Deployable ISR mast that elevates sensors to ~3m AGL. Counterweight keel maintains platform stability in Sea State 3–4.",
    capabilities: ["~3m sensor elevation", "Sea State 3-4 stability", "Deployable/retractable"],
    trl: "TRL 8",
    icon: "Navigation",
    category: "UTILITY",
    subType: null,
    swap: { weight: 4, power: 0.1, size: "medium" },
    statImpacts: { speed: -1, power: 0, weight: 1, range: 0, stealth: -2 },
    securityLevel: [],
    securityIcons: [],
    missionTags: ["SEA_JEEP_ISR"]
  },
  {
    name: "Iridium 9770 SATCOM",
    provider: "Iridium",
    type: "Satellite Communications Terminal",
    description: "Iridium 9770 maritime SATCOM terminal providing global two-way data communications for contact reporting and C2 uplink.",
    capabilities: ["Global satellite data link", "Contact report uplink", "Two-way C2 messaging"],
    trl: "TRL 9",
    icon: "Satellite",
    category: "SATCOM",
    subType: null,
    swap: { weight: 0.5, power: 0.01, size: "small" },
    statImpacts: { speed: 0, power: -1, weight: 0, range: 0, stealth: -1 },
    securityLevel: [],
    securityIcons: [],
    missionTags: ["MDA/ISR", "SEA_JEEP_MDA"]
  },
  {
    name: "Iridium SATCOM",
    provider: "Iridium",
    type: "Satellite Communications Terminal",
    description: "Compact Iridium SATCOM module for small USV C2, position reporting, and data relay over global satellite network.",
    capabilities: ["Global satellite link", "Position reporting", "C2 relay"],
    trl: "TRL 9",
    icon: "Satellite",
    category: "SATCOM",
    subType: null,
    swap: { weight: 0.5, power: 0.01, size: "small" },
    statImpacts: { speed: 0, power: -1, weight: 0, range: 0, stealth: -1 },
    securityLevel: [],
    securityIcons: [],
    missionTags: ["SEA_JEEP_ISR", "SEA_JEEP_MCM", "SEA_JEEP_LOGISTICS"]
  },
  {
    name: "GPS/INS + AIS Receiver",
    provider: "—",
    type: "Navigation + AIS",
    description: "Integrated GPS/INS navigation with passive AIS receiver for dark-ship detection. Logs active transponders and flags absent vessels.",
    capabilities: ["GPS/INS navigation", "Passive AIS reception", "Dark-ship detection logging"],
    trl: "TRL 9",
    icon: "Navigation",
    category: "NAVIGATION",
    subType: null,
    swap: { weight: 0.3, power: 0.005, size: "small" },
    statImpacts: { speed: 0, power: 0, weight: 0, range: 0, stealth: 0 },
    securityLevel: [],
    securityIcons: [],
    missionTags: ["MDA/ISR", "SEA_JEEP_MDA"]
  },
  {
    name: "GPS/INS",
    provider: "—",
    type: "Inertial Navigation",
    description: "Compact GPS/INS navigation unit for small USV station-keeping and waypoint navigation.",
    capabilities: ["GPS-aided inertial navigation", "Waypoint navigation", "Station-keeping"],
    trl: "TRL 9",
    icon: "Navigation",
    category: "NAVIGATION",
    subType: null,
    swap: { weight: 0.3, power: 0.005, size: "small" },
    statImpacts: { speed: 0, power: 0, weight: 0, range: 0, stealth: 0 },
    securityLevel: [],
    securityIcons: [],
    missionTags: ["SEA_JEEP_ISR"]
  },
  {
    name: "GPS/INS (jam-resistant)",
    provider: "—",
    type: "Jam-Resistant Inertial Navigation",
    description: "GPS/INS with anti-jam antenna for Black Sea GPS-denied operations. INS dead-reckoning maintains track through jamming corridors.",
    capabilities: ["Anti-jam GPS antenna", "INS dead-reckoning", "GPS-denied corridor navigation"],
    trl: "TRL 9",
    icon: "Navigation",
    category: "NAVIGATION",
    subType: 'NAV_INS',
    swap: { weight: 0.5, power: 0.01, size: "small" },
    statImpacts: { speed: 0, power: 0, weight: 0, range: 0, stealth: 0 },
    securityLevel: [],
    securityIcons: [],
    missionTags: ["SEA_JEEP_MCM"]
  },
  {
    name: "GPS/INS + AIS Transponder",
    provider: "—",
    type: "Navigation + AIS Transponder",
    description: "GPS/INS with active AIS transponder for logistics tracking. Fleet MOC maintains continuous position awareness during resupply transit.",
    capabilities: ["GPS/INS navigation", "Active AIS transponder", "Fleet MOC position tracking"],
    trl: "TRL 9",
    icon: "Navigation",
    category: "NAVIGATION",
    subType: null,
    swap: { weight: 0.3, power: 0.005, size: "small" },
    statImpacts: { speed: 0, power: 0, weight: 0, range: 0, stealth: 0 },
    securityLevel: [],
    securityIcons: [],
    missionTags: ["SEA_JEEP_LOGISTICS"]
  },
  {
    name: "Solar Wing + Li-ion Bank",
    provider: "Ocean Aero",
    type: "Renewable Energy Propulsion Pack",
    description: "Solar wing and lithium-ion battery bank enabling 30+ day endurance without fuel logistics. Wind-assisted sailing maximizes range.",
    capabilities: ["30+ day solar endurance", "Wind-assisted propulsion", "Zero-fuel logistics"],
    trl: "TRL 9",
    icon: "Zap",
    category: "UTILITY",
    subType: null,
    swap: { weight: 3, power: 0, size: "medium" },
    statImpacts: { speed: 0, power: 0, weight: 1, range: 10, stealth: 2 },
    securityLevel: [],
    securityIcons: [],
    missionTags: ["SEA_JEEP_MDA"]
  },
  {
    name: "Solar Wing + Li-ion Battery Bank",
    provider: "Ocean Aero",
    type: "Renewable Energy Propulsion Pack",
    description: "Solar wing and lithium-ion battery bank for long-endurance autonomous logistics runs.",
    capabilities: ["Solar + battery endurance", "Wind-assisted propulsion", "Zero-fuel logistics"],
    trl: "TRL 9",
    icon: "Zap",
    category: "UTILITY",
    subType: null,
    swap: { weight: 3, power: 0, size: "medium" },
    statImpacts: { speed: 0, power: 0, weight: 1, range: 10, stealth: 2 },
    securityLevel: [],
    securityIcons: [],
    missionTags: ["SEA_JEEP_LOGISTICS"]
  },
  {
    name: "EdgeTech 2300-MS FLS",
    provider: "EdgeTech",
    type: "Forward-Looking Sonar",
    description: "EdgeTech 2300-MS multibeam forward-looking sonar. Detects bottom contacts ahead of the vessel and triggers auto-halt for mine avoidance.",
    capabilities: ["Forward mine detection", "Auto-halt trigger", "Multibeam bottom contact detection"],
    trl: "TRL 9",
    icon: "Waves",
    category: "ACOUSTIC/SONAR",
    subType: 'SONAR_FLS',
    swap: { weight: 5, power: 0.3, size: "medium" },
    statImpacts: { speed: -1, power: -2, weight: 2, range: 0, stealth: 0 },
    securityLevel: [],
    securityIcons: [],
    missionTags: ["SEA_JEEP_MCM"]
  },
  {
    name: "EdgeTech 4125 Side-Scan Sonar",
    provider: "EdgeTech",
    type: "Towed Side-Scan Sonar",
    description: "Towed side-scan sonar mapping seabed across 150m total swath. Primary mine survey sensor for grain corridor clearance operations.",
    capabilities: ["150m total swath coverage", "Seabed mine mapping", "Towed fish deployment"],
    trl: "TRL 9",
    icon: "Waves",
    category: "ACOUSTIC/SONAR",
    subType: 'SONAR_SIDESCAN',
    swap: { weight: 8, power: 0.5, size: "medium" },
    statImpacts: { speed: -2, power: -3, weight: 3, range: 0, stealth: 0 },
    securityLevel: [],
    securityIcons: [],
    missionTags: ["SEA_JEEP_MCM"]
  },
  {
    name: "Smart Winch + A-Frame",
    provider: "GP-USV",
    type: "Tow Management System",
    description: "Automated winch and A-frame for deploying and recovering towed sonar fish. Maintains constant tow depth regardless of sea state.",
    capabilities: ["Automated tow deployment/recovery", "Constant depth maintenance", "A-frame deck integration"],
    trl: "TRL 8",
    icon: "Anchor",
    category: "UTILITY",
    subType: null,
    swap: { weight: 6, power: 0.2, size: "medium" },
    statImpacts: { speed: -1, power: -1, weight: 2, range: 0, stealth: 0 },
    securityLevel: [],
    securityIcons: [],
    missionTags: ["SEA_JEEP_MCM"]
  },
  {
    name: "Extended Fuel Tank (MCM config)",
    provider: "GP-USV",
    type: "Extended Range Fuel System",
    description: "Additional fuel capacity for full Odessa corridor survey endurance without refueling stop.",
    capabilities: ["Extended survey endurance", "Full corridor range", "No refueling required"],
    trl: "TRL 9",
    icon: "Zap",
    category: "UTILITY",
    subType: null,
    swap: { weight: 2, power: 0, size: "small" },
    statImpacts: { speed: 0, power: 0, weight: 1, range: 8, stealth: 0 },
    securityLevel: [],
    securityIcons: [],
    missionTags: ["SEA_JEEP_MCM"]
  },
  {
    name: "Sealed Dry Cargo Pod (~20kg)",
    provider: "GP-USV",
    type: "Autonomous Cargo Delivery Pod",
    description: "Weatherproof sealed cargo pod carrying ~20kg payload for autonomous island resupply. Quick-release mechanism for delivery without vessel recovery.",
    capabilities: ["~20kg payload capacity", "Weatherproof sealed storage", "Quick-release delivery"],
    trl: "TRL 8",
    icon: "Package",
    category: "UTILITY",
    subType: 'CARGO_MODULE',
    swap: { weight: 20, power: 0, size: "large" },
    statImpacts: { speed: -1, power: 0, weight: 5, range: -3, stealth: 0 },
    securityLevel: [],
    securityIcons: [],
    missionTags: ["SEA_JEEP_LOGISTICS"]
  },
  // ─── JMN — Joint Maritime Next (Shield & Spear) new payloads ───
  {
    name: "Gamma/Neutron Radiological Detector",
    provider: "Kromek",
    type: "CBRNE Sensor",
    description: "Compact gamma spectrometer + neutron detector for at-sea radiological/nuclear material characterization of low-freeboard 'sleeper' contacts. Discriminates threat material from benign cargo without a boarding team.",
    capabilities: ["Gamma Spectroscopy", "Neutron Detection", "Isotope ID", "Material Characterization"],
    trl: "TRL 7",
    icon: Radio,
    category: "SENSORS & DETECTION",
    subType: "CBRNE",
    swap: { weight: 4.5, power: 0.02, size: "small" },
    statImpacts: { speed: 0, power: -1, weight: -1, range: 0, stealth: 0 },
    missionTags: ["THREAT_CHARACTERIZATION"]
  },
  {
    name: "Trace Chemical/Explosive Sniffer",
    provider: "908 Devices",
    type: "CBRNE Sensor",
    description: "Onboard mass-spec / IMS trace detector that samples for explosive, chemical, and narcotic signatures. Provides the 'what is it carrying?' characterization step with a stated confidence and false-alarm caveat.",
    capabilities: ["Trace Explosive Detection", "Chemical Agent ID", "Narcotic Signature ID", "Onboard Analytics"],
    trl: "TRL 7",
    icon: Eye,
    category: "SENSORS & DETECTION",
    subType: "CBRNE",
    swap: { weight: 3.2, power: 0.03, size: "small" },
    statImpacts: { speed: 0, power: -1, weight: -1, range: 0, stealth: 0 },
    missionTags: ["THREAT_CHARACTERIZATION"]
  },
  {
    name: "Air-Launched Effects / Loitering Munition Tubes",
    provider: "AeroVironment",
    type: "Launched-Effects Payload",
    description: "Containerized launch tubes for air-launched effects (ALE) and loitering munitions dispensed from a USV mothership. Enables terminal ISR + top-attack from an unexpected axis. Human-in-the-loop release required.",
    capabilities: ["ALE Launch", "Loitering Munition", "Terminal ISR", "Cooperative Swarm"],
    trl: "TRL 6",
    icon: Target,
    category: "WEAPONS",
    subType: "EFFECTS",
    swap: { weight: 180, power: 0.5, size: "large" },
    statImpacts: { speed: -1, power: -2, weight: -3, range: 0, stealth: -1 },
    missionTags: ["LAUNCHED_EFFECTS"]
  },
  {
    name: "SOF Insertion Pod",
    provider: "Caliburn",
    type: "Clandestine Delivery Payload",
    description: "Low-profile sealed pod for clandestine delivery of a SOF element / equipment to a littoral objective from a covert USV host. Sub-surface transit, low RCS, minimal wake signature.",
    capabilities: ["Clandestine Delivery", "Low-Signature Transit", "SOF Insertion/Extraction", "Sealed Payload Bay"],
    trl: "TRL 6",
    icon: Shield,
    category: "LOGISTICS",
    subType: "DELIVERY",
    swap: { weight: 10, power: 0.1, size: "large" },
    statImpacts: { speed: -1, power: 0, weight: -3, range: -1, stealth: 1 },
    missionTags: ["SOF_STRIKE_SUPPORT"]
  },
  {
    name: "UUV Disablement Kit",
    provider: "Caliburn",
    type: "Undersea Effects Payload",
    description: "UUV-carried disablement effector — limpet attach or lightweight torpedo employed below the target's propeller/rudder for a mobility kill rather than area destruction. Strict operator authorization gate.",
    capabilities: ["Limpet Attach", "Lightweight Torpedo", "Mobility Kill", "GPS-Denied Terminal Guidance"],
    trl: "TRL 6",
    icon: Waves,
    category: "WEAPONS",
    subType: "UNDERSEA",
    swap: { weight: 2.3, power: 0.2, size: "medium" },  // 5 lb warhead package
    statImpacts: { speed: -1, power: -1, weight: -2, range: 0, stealth: 0 },
    missionTags: ["SOF_STRIKE_SUPPORT"]
  },
  {
    name: "One-Way Attack Package",
    provider: "Caliburn",
    type: "Undersea Effects Payload",
    description: "Fictional/placeholder effector for prototyping — a self-contained explosive warhead package fitted to a daughter UUV for a single-use, non-recoverable terminal strike against a hull or subsurface target. No real vendor; stand-in until a fielded system is sourced.",
    capabilities: ["Warhead Integration", "Terminal Guidance", "Single-Use / Non-Recoverable"],
    trl: "TRL 3",
    icon: Target,
    category: "WEAPONS",
    subType: "UNDERSEA",
    swap: { weight: 5, power: 0.1, size: "medium" },
    statImpacts: { speed: -1, power: -1, weight: -2, range: 0, stealth: 0 },
    missionTags: ["LAUNCHED_EFFECTS"]
  },
  {
    name: "Marine Magnetics Synapse Gradiometer",
    provider: "Marine Magnetics",
    type: "Magnetic Anomaly Sensor",
    description: "Lightweight, low-drag horizontal transverse gradiometer for AUV/ASV/USV integration. Detects ferrous foreign objects and buried infrastructure disturbance along a survey lane.",
    capabilities: ["Ferrous Object Detection", "Buried Infrastructure Disturbance Detection", "Horizontal Transverse Gradiometry"],
    trl: "TRL 9",
    icon: Radio,
    category: "SENSORS & DETECTION",
    subType: null,
    swap: { weight: 6, power: 0.05, size: "small" },
    statImpacts: { speed: 0, power: -1, weight: 0, range: 0, stealth: 0 },
    missionTags: ["SEABED_MONITORING"]
  },
  {
    name: "AP Sensing DAS interface",
    provider: "AP Sensing",
    type: "Distributed Acoustic Sensing Interrogator",
    description: "Turns an unused fiber in a subsea cable into thousands of virtual microphones. Real-time distributed acoustic sensing (DAS) detects and localizes third-party interference — anchor drops, vessel movement, groundfishing — along the cable route, cueing a vehicle to the affected segment.",
    capabilities: ["Distributed Acoustic Sensing", "Third-Party-Interference Detection", "Cable Segment Localization"],
    trl: "TRL 8",
    icon: Waves,
    category: "SENSORS & DETECTION",
    subType: null,
    swap: { weight: 8, power: 0.1, size: "small" },
    statImpacts: { speed: 0, power: -1, weight: 0, range: 0, stealth: 0 },
    missionTags: ["SEABED_MONITORING"]
  },
  {
    name: "SBG Ekinox Micro INS",
    provider: "SBG Systems",
    type: "Navigation System",
    description: "Miniature MEMS tactical-grade GNSS-aided inertial navigation system. Trades some of SeaFIND's fiber-optic-gyro precision for a ~98% weight reduction — sized for small UUV/USV hulls where a full maritime FOG INS doesn't fit the payload budget. Retains short-duration dead-reckoning through GPS-denied stretches via the onboard MEMS IMU.",
    capabilities: ["GNSS-Aided Navigation", "MEMS IMU Dead-Reckoning", "Position Data", "Compact Form Factor"],
    trl: "TRL 9",
    icon: Compass,
    category: "NAVIGATION",
    subType: 'NAV_INS',
    swap: {
      weight: 0.165,   // Real: 165g per SBG Systems Ekinox Micro datasheet
      power: 0.003,    // Estimate: ~3W typical for this class of MEMS/GNSS INS (not a confirmed datasheet figure)
      size: "small"
    },
    statImpacts: { speed: 0, power: 0, weight: 1, range: 0, stealth: 0 },
    missionTags: ["SOF_STRIKE_SUPPORT"]
  },
  {
    name: "KAYA Vision Iron 2518 Subsea Camera",
    provider: "KAYA Vision",
    type: "Deep-Sea Vision Camera",
    description: "Miniature deep-sea-rated global-shutter camera module for ROV/AUV integration. Bare module is under 100g; figure quoted here is a conservative estimate for the pressure-housed, cabled unit actually integrated on a hull. Used here in place of a generic surveillance EO/IR turret for Triton's underwater close-look imaging role.",
    capabilities: ["High-frame-rate underwater imaging", "Low-light performance", "Compact housing"],
    trl: "TRL 8",
    icon: CameraIcon,
    category: "EO/IR SENSORS",
    subType: null,
    swap: {
      weight: 0.4,     // Estimate: bare module <0.1kg per KAYA datasheet; housed/cabled integration weight not published, estimated conservatively
      power: 0.01,
      size: "small"
    },
    statImpacts: { speed: 0, power: 0, weight: 1, range: 0, stealth: 1 },
    missionTags: ["SEABED_MONITORING"]
  },
  {
    name: "Doodle Labs Mini-OEM Mesh Rider Radio",
    provider: "Doodle Labs",
    type: "MANET Mesh Radio",
    description: "DoD-derived MANET mesh radio (RM-2450, 2.4 GHz) with the patented Mesh Rider waveform. Self-forming, self-healing mesh field-tested past 100 km with up to 100 Mbps throughput, an Ultra-Reliable Low-Latency (URLLC) channel for command and control, and a separate optimized channel for 4K video. In the SV-2 Equipment/Radios layer it provides the resilient inter-platform data link alongside Peplink cellular and Starlink SATCOM backhaul.",
    capabilities: ["MANET Self-Healing Mesh", "URLLC Command & Control", "Optimized Video Streaming", "FIPS 140-3 AES-256 Encryption", "Anti-Jam COFDM Waveform"],
    trl: "TRL 9",
    icon: Radio,
    category: "RF COMMUNICATIONS",
    subType: null,
    swap: {
      weight: 0.04,     // Real: 25-40g depending on mounting config, per Doodle Labs Mini-OEM Mesh Rider RM-2450 datasheet
      power: 0.005,     // Real: 5W average (50% Tx/Rx duty), 8W peak Tx, 2W Rx per datasheet
      size: "small"
    },
    statImpacts: {
      speed: 0,
      power: -1,
      weight: 0,
      range: 12,        // Mesh relay extends C2/data range across the fleet
      stealth: -2       // RF mesh emissions detectable
    },
    securityLevel: ["FIPS 140-3", "AES-256 Encryption", "MIL-STD-810H"],
    securityIcons: ["encrypted"],
    specs: {
      frequency: "2400-2482 MHz (Mesh Rider platform spans 600 MHz - 6 GHz)",
      throughput: "Up to 100 Mbps (80 Mbps @ 20 MHz channel)",
      range: "Field tested >100 km",
      channels: "3, 5, 10, 20 MHz software-selectable",
      c2Channel: "Ultra-Reliable Low-Latency Channel, 1.5-10 ms latency",
      encryption: "128-bit AES full-throughput / 256-bit AES; optional FIPS 140-3",
      modes: "Mesh, WDS AP/Client, Bridge, Internet Gateway",
      interfaces: "Ethernet (100 Base-T), USB, UART (3.3V)",
      environment: "MIL-STD-810H shock/vibration, -40C to +85C operating",
      dimensions: "Baseband 47x28x5 mm; RF board 46x51x6.5 mm"
    },
    integrationNotes: "The Mini-OEM board integrates into the platform compute stack over Ethernet/USB and joins the fleet MANET automatically. It carries the low-latency C2 channel and a parallel video channel, feeding TempestOS and the OverKey mesh VPN. Only USB and a power supply are required for integration."
  },
  {
    name: "ANELLO Maritime INS",
    provider: "ANELLO Photonics",
    type: "Navigation System",
    description: "GPS-denied inertial navigation system built on three Silicon Photonics Optical Gyroscopes (SiPhOG). Delivers reference-grade 100 Hz position, velocity and attitude with under 0.5 deg/hr unaided heading drift, an AI sensor-fusion engine with GNSS spoofing detection, and dual triple-frequency GNSS receivers. IP68-rated for the maritime environment and sized for ASV/AUV hulls at roughly a tenth the mass of a maritime FOG INS.",
    capabilities: ["GPS-Denied Navigation", "Silicon Photonics Optical Gyro", "GNSS Spoofing Detection", "AI Sensor Fusion", "Position Data"],
    trl: "TRL 9",
    icon: Compass,
    category: "NAVIGATION",
    subType: 'NAV_INS',
    swap: {
      weight: 0.454,    // Real: 1 lb per ANELLO Maritime INS datasheet
      power: 0.006,     // Real: <6W typical per datasheet
      size: "small"
    },
    statImpacts: {
      speed: 1,
      power: -1,
      weight: 1,
      range: 3,         // Accurate nav improves transit efficiency
      stealth: 4        // GPS-denied, passive, spoofing-resistant
    },
    specs: {
      technology: "3-axis SiPhOG optical gyro + 6-axis MEMS IMU",
      headingDrift: "<0.5 deg/hr unaided (bias instability)",
      headingAccuracy: "0.2 deg rms",
      positionAccuracy: "1.2 m rms SPS / 0.01 m rms RTK",
      gnss: "Dual triple-frequency receivers (GPS, GLONASS, Galileo, BeiDou, QZSS, NavIC, SBAS, L-band)",
      fusion: "ANELLO AI EKF sensor fusion with GNSS spoofing detection",
      environment: "IP68, -10 to +50C (+70C optional), 40g shock survival",
      electrical: "5-30 VDC input",
      interfaces: "Ethernet, RS-232 (2 ports), CAN",
      dimensions: "4.4 x 3.4 x 1.9 in"
    },
    integrationNotes: "Delivers 100 Hz PVA over Ethernet/RS-232/CAN to TempestOS and the autonomy stack. As a compact, low-power IP68 unit it fits small USV/UUV hulls where a full maritime FOG INS does not, providing resilient dead-reckoning and spoofing-resistant navigation through GPS-denied stretches."
  },
  {
    name: "FarSounder Argos 500",
    provider: "FarSounder",
    type: "3D Forward-Looking Navigation Sonar",
    description: "3D forward-looking navigation sonar that images the water column and shallows out to 500 m ahead of the vessel in real time, at speeds up to 20 knots. Provides below-water obstacle and hazard perception with True Target Motion tracking and Local History Mapping bathymetry. Hull-mounted stainless-steel transducer module with a diver-serviceable wet-mateable connector.",
    capabilities: ["3D Forward-Looking Imaging to 500m", "Below-Water Obstacle Detection", "Local History Mapping Bathymetry", "True Target Motion Tracking", "Chart Overlay (S57/S63)"],
    trl: "TRL 9",
    icon: Waves,
    category: "ACOUSTIC/SONAR",
    subType: 'SONAR_FLS',
    swap: {
      weight: 14,       // Estimate: hull-mounted stainless-steel transducer module weight not published by FarSounder; conservative estimate for the Argos 500 TM class
      power: 0.1,       // Real: ~100W input (110/220 Vac, 50/60 Hz) per FarSounder Argos 500 spec page; <1500 Wrms acoustic output
      size: "medium"
    },
    statImpacts: {
      speed: -1,
      power: -2,
      weight: 3,
      range: 0,
      stealth: -1       // Active sonar is acoustically detectable
    },
    securityLevel: [],
    securityIcons: [],
    specs: {
      range: "100 / 200 / 500 m settings",
      fieldOfView: "120 deg to 200m, 90 deg to 500m",
      operatingFrequency: "61 kHz",
      maxOutputPower: "<1500 Wrms",
      inputPower: "110/220 Vac, 50/60 Hz @ ~100 W",
      angularAccuracy: "~1.6 deg",
      refreshRate: "~3 Hz to ~0.75 Hz depending on range",
      stabilization: "Roll/pitch +/- 20 deg, multi-ping target stabilization",
      operationalSpeed: "Up to 20 knots",
      integration: "Wartsila NACOS Platinum, Team Italia I-Bridge, QPS Qinsy; SDK available"
    },
    integrationNotes: "The transducer module mounts to a hull fairing and streams 3D forward-looking returns to the navigation stack via the FarSounder SDK, giving TempestOS and the autonomy layer below-water obstacle and bathymetric awareness ahead of the vessel for collision and grounding avoidance.",
    missionTags: ["SEABED_MONITORING"]
  },
  {
    name: "Marine AI Guardian Vision CVP",
    provider: "Marine AI",
    type: "Computer Vision Processor",
    description: "Edge computer-vision processor that ingests live electro-optical and infrared camera streams and applies AI-based object identification and hazard analysis for autonomous surface vessels. Detects and classifies contacts (boats, navigation markers, unknown obstacles) and drives PTZ Lookout cameras with operator-defined scanning arcs. Built on IBM and NVIDIA deep-learning and edge-compute technology; processing on-board reduces the satellite bandwidth needed for remote operation.",
    capabilities: ["EO/IR Object Detection & Classification", "Maritime Hazard Analysis", "PTZ Lookout Camera Control", "Sensor Fusion for Vessel Control", "Edge AI Inference"],
    trl: "TRL 8",
    icon: Brain,
    category: "EO/IR SENSORS",
    subType: null,
    swap: {
      weight: 2,        // Estimate: Marine AI does not publish enclosure SWaP; estimated for a ruggedized NVIDIA edge-compute box hosting Guardian Vision
      power: 0.06,      // Estimate: ~50-60W typical for NVIDIA Jetson-class edge inference platform (not a published figure)
      size: "small"
    },
    statImpacts: {
      speed: 0,
      power: -2,
      weight: 1,
      range: 0,
      stealth: 0        // Passive EO/IR vision, no active emissions
    },
    securityLevel: ["GPU-Accelerated Edge Compute"],
    securityIcons: [],
    specs: {
      inputs: "Conventional (EO) and infrared (IR) camera streams",
      processing: "IBM + NVIDIA deep-learning edge inference",
      detection: "Boats, navigation markers, and unknown obstacles",
      lookout: "PTZ camera control with operator-defined scanning arcs and contact tracking",
      deployment: "On-board edge compute (reduces SATCOM bandwidth for remote ops)",
      note: "Enclosure SWaP not published by Marine AI; values shown are estimates for the host edge-compute platform"
    },
    integrationNotes: "Guardian Vision runs on GPU-accelerated edge compute and feeds classified contacts and hazard tracks to the autonomy and C2 stack, complementing radar and AIS with camera-based perception. On-board inference keeps decision-making local, minimizing the video that must be backhauled over constrained satellite links."
  }

  // ============ END ADDITIONAL VESSEL CAPABILITY ENTRIES ============

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
  NON_KINETIC_EW: {
    id: "non_kinetic_ew",
    name: "Non-Kinetic Effects — EW Deception",
    description: "NEMESIS-aligned distributed EW package projects a coherent false maritime signature across all adversary sensor types (radar, sonar, IR, ESM) simultaneously. Human authorization required at mission activation; individual emission events are payload-controlled thereafter per DODD 3000.09.",
    typicalDuration: "2–72 hours (activation window), indefinite EMCON transit",
    requiredCapabilities: ["Active Electronic Attack", "Corner Reflector / RCS Amplification", "AIS False-Track Broadcast", "Passive ESM Collection", "EMCON C2 Link"],
    optionalCapabilities: ["Acoustic Decoy (Saab CANTO)", "LEED Autonomous Decoy Vehicles"],
    controlLoop: "NEMESIS SEQUENCE: EMCON Transit → Human Mission Activation → Coordinator Sequences Nodes → Active Phase → ESM-Adaptive Profile Adjustment → Commander Terminate",
    autonomyCeiling: "DAL 3 — emission profile management. Mission activation requires human authorization. Per-emission events are payload-autonomous once activated.",
    emissionRoles: {
      radarMimic: "MASC Baseline — corner reflector array + waveform transponder — projects large-combatant RCS",
      aisSpoofer: "MASC Baseline — AIS false-track broadcaster — broadcasts false ship identity and course",
      activeJammer: "BlackSea MASC Catamaran — SOEA 50–100 kW — blinds anti-ship missile seekers",
      acousticDecoy: "Boeing Orca XLUUV — Saab CANTO — programmable submarine acoustic signature",
      passiveCollection: "Saildrone Voyager — ESM/SIGINT — monitors adversary reaction, feeds profile updates"
    },
    emconPolicy: {
      transit: "MANDATORY EMCON — no RF emissions — all vessels silent",
      activation: "Human commander authorizes mission activation via TempestOS secure link",
      activePhase: "NEMESIS coordinator sequences node activation per deception script",
      termination: "On commander order — all emissions cease — vessels transition to recovery"
    },
    loac: "All emission events timestamped and logged for LOAC documentation. Non-kinetic effects do not constitute use of force under DODD 3000.09.",
    recommendedPackage: {
      vessels: 5,
      composition: "2× MASC Baseline (EW Deception) + 1× BlackSea MASC (Active Jamming) + 1× Orca XLUUV (Acoustic) + 1× Saildrone Voyager (Passive Collection)",
      formation: "Distributed — 5–15 NM node spacing for coherent false picture geometry"
    }
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
    subType: null,
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
    subType: null,
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
    subType: null,
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
    subType: null,
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
    subType: null,
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
    subType: null,
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
    subType: null,
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
    subType: null,
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
    subType: null,
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
    subType: null,
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
    subType: null,
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
    subType: null,
    nodes: [
      { id: 'on_station',   type: 'trigger',          label: 'M48 On Station\n(DriveAI Patrol)',       position: { x: 50,   y: 150 } },
      { id: 'lantern_up',   type: 'action',           label: 'Deploy LANTERN\n(500ft Tethered)',       position: { x: 220,  y: 150 } },
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
  NON_KINETIC_EW: {
    name: "Non-Kinetic Effects — NEMESIS EW Deception",
    category: "EW",
    subType: null,
    nodes: [
      { id: 'intel_cue',     type: 'trigger',          label: 'Intel Cue\n(Sensor Pass / Threat Vector)',  position: { x: 50,   y: 150 } },
      { id: 'asset_posit',   type: 'action',           label: 'TempestOS\nPositions NEMESIS Package',      position: { x: 220,  y: 150 } },
      { id: 'emcon_transit', type: 'action',           label: 'EMCON Transit\n(All Vessels Silent)',        position: { x: 400,  y: 150 } },
      { id: 'human_auth',    type: 'human_checkpoint', label: 'Commander\nMission Activation',             position: { x: 580,  y: 150 } },
      { id: 'esm_first',     type: 'action',           label: 'ESM Node\nActive (Passive Collection)',     position: { x: 760,  y: 80  } },
      { id: 'acoustic_cue',  type: 'action',           label: 'CANTO Deployed\n(Acoustic Decoy)',          position: { x: 760,  y: 220 } },
      { id: 'ais_spoof',     type: 'action',           label: 'AIS False Track\n+ Corner Reflectors',      position: { x: 940,  y: 80  } },
      { id: 'jammer_on',     type: 'action',           label: 'SOEA Active\n(50–100 kW EA)',               position: { x: 940,  y: 220 } },
      { id: 'leed_deploy',   type: 'action',           label: 'LEED Vehicles\nDeployed (Terminal Phase)',  position: { x: 1110, y: 150 } },
      { id: 'esm_monitor',   type: 'sense',            label: 'ESM Monitors\nAdversary Reaction',          position: { x: 1280, y: 150 } },
      { id: 'profile_adj',   type: 'decision',         label: 'Profile\nAdjustment Needed?',              position: { x: 1450, y: 150 } },
      { id: 'terminate',     type: 'human_checkpoint', label: 'Commander\nTerminate Order',               position: { x: 1620, y: 80  } },
      { id: 'cease_emit',    type: 'end',              label: 'All Emissions\nCease — Recovery',          position: { x: 1790, y: 150 } }
    ],
    connections: [
      { from: 'intel_cue',     to: 'asset_posit' },
      { from: 'asset_posit',   to: 'emcon_transit' },
      { from: 'emcon_transit', to: 'human_auth' },
      { from: 'human_auth',    to: 'esm_first',    label: 'Authorized' },
      { from: 'human_auth',    to: 'acoustic_cue', label: 'Authorized' },
      { from: 'esm_first',     to: 'ais_spoof' },
      { from: 'acoustic_cue',  to: 'jammer_on' },
      { from: 'ais_spoof',     to: 'leed_deploy' },
      { from: 'jammer_on',     to: 'leed_deploy' },
      { from: 'leed_deploy',   to: 'esm_monitor' },
      { from: 'esm_monitor',   to: 'profile_adj' },
      { from: 'profile_adj',   to: 'terminate',    label: 'No — Hold' },
      { from: 'profile_adj',   to: 'esm_first',    label: 'Yes — Adjust' },
      { from: 'terminate',     to: 'cease_emit',   label: 'Order Received' }
    ],
    loopBack: { from: 'profile_adj', to: 'esm_monitor', label: 'Continuous Monitoring' }
  },
  ASW: {
    name: "ASW — Passive Multistatic + Airborne Torpedo Prosecution",
    category: "ASW",
    subType: null,
    nodes: [
      { id: 'deploy',       type: 'trigger',          label: 'Deploy 3× M48 + HORUS\n(CTF-72 Tasking)',       position: { x: 50,   y: 150 } },
      { id: 'passive_search', type: 'sense',          label: 'Passive Search\n(3× M48 Arrays — Silent)',     position: { x: 230,  y: 150 } },
      { id: 'contact',      type: 'decision',          label: 'Passive Contact?',                             position: { x: 430,  y: 150 } },
      { id: 'usw_dss',      type: 'orient',            label: 'USW-DSS Multistatic\nCross-Fix',               position: { x: 620,  y: 80  } },
      { id: 'log_clear',    type: 'action',            label: 'Log — No Contact\nContinue Listening',         position: { x: 430,  y: 300 } },
      { id: 'active_confirm', type: 'action',          label: 'Lead M48 —\nSingle Active Ping',               position: { x: 820,  y: 80  } },
      { id: 'classify',     type: 'decision',          label: 'PLAN SSN\nConfirmed?',                         position: { x: 1010, y: 80  } },
      { id: 'human_auth',   type: 'human_checkpoint',  label: 'CTF-72\nWeapons Free',                         position: { x: 1190, y: 80  } },
      { id: 'helo_prosecute', type: 'action',          label: 'MQ-8C Fire Scout —\nMk 54 Torpedo Drop',       position: { x: 1370, y: 80  } },
      { id: 'sector_clear', type: 'end',               label: 'SIERRA-7 Prosecuted\n— Sector Clear',          position: { x: 1550, y: 150 } }
    ],
    connections: [
      { from: 'deploy',         to: 'passive_search' },
      { from: 'passive_search', to: 'contact' },
      { from: 'contact',        to: 'usw_dss',        label: 'Tonal Detected' },
      { from: 'contact',        to: 'log_clear',      label: 'No Contact' },
      { from: 'usw_dss',        to: 'active_confirm', label: 'Track Localized' },
      { from: 'active_confirm', to: 'classify' },
      { from: 'classify',       to: 'human_auth',     label: '>85% Confidence' },
      { from: 'classify',       to: 'passive_search', label: 'Inconclusive' },
      { from: 'human_auth',     to: 'helo_prosecute', label: 'Authorized' },
      { from: 'human_auth',     to: 'usw_dss',        label: 'Hold — Continue Track' },
      { from: 'helo_prosecute', to: 'sector_clear' }
    ],
    loopBack: { from: 'log_clear', to: 'passive_search', label: 'Continue Barrier Patrol' }
  },
  MDA_MOTHERSHIP: {
    name: "MDA Mothership — Multi-Domain Launch, Recover & Fuse",
    category: "ISR",
    subType: null,
    nodes: [
      { id: 'position',   type: 'trigger',          label: 'LCS On Station\n(Launch/Recovery Node)',   position: { x: 50,   y: 150 } },
      { id: 'launch',     type: 'action',            label: 'Launch Air / Surface /\nSubsurface Layers', position: { x: 240,  y: 150 } },
      { id: 'sense',      type: 'sense',             label: 'Sense — SIGINT / Radar /\nEO-IR / Acoustic', position: { x: 450,  y: 150 } },
      { id: 'contact',    type: 'decision',          label: 'New Contact?',                             position: { x: 650,  y: 150 } },
      { id: 'fuse',       type: 'orient',            label: 'TempestOS Fuse\nCommon Op Picture',         position: { x: 850,  y: 80  } },
      { id: 'hold',       type: 'action',            label: 'Hold Coverage\nContinue Sensing',           position: { x: 650,  y: 300 } },
      { id: 'share',      type: 'action',            label: 'Push Fused COP\nto Joint Force',            position: { x: 1060, y: 80  } },
      { id: 'recover',    type: 'action',            label: 'Recover / Cycle Assets\n(LARS, Sea State 4)', position: { x: 1270, y: 80  } },
      { id: 'persistent', type: 'end',               label: 'Persistent Fused\nAwareness Maintained',    position: { x: 1270, y: 220 } }
    ],
    connections: [
      { from: 'position', to: 'launch' },
      { from: 'launch',   to: 'sense' },
      { from: 'sense',    to: 'contact' },
      { from: 'contact',  to: 'fuse',    label: 'Track Detected' },
      { from: 'contact',  to: 'hold',    label: 'No Contact' },
      { from: 'fuse',     to: 'share' },
      { from: 'share',    to: 'recover', label: 'On-Station Time Elapsed' },
      { from: 'share',    to: 'sense',   label: 'Continue Coverage' },
      { from: 'recover',  to: 'persistent' }
    ],
    loopBack: { from: 'hold', to: 'sense', label: 'Persistent Coverage' }
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