// marketplace data - extracted from MarketplacePage component
import { 
  Shield,
  Lock,
  Satellite,
  Radio,
  Target,
  MessageSquare,
  Eye,
  Brain,
  Anchor,
  Radar,
  Signal,
  Waves
} from '../components/MilitaryIcons';

export const engineeringStacks = [
  {
    name: "Swarm Coordination System",
    provider: "Anduril + Caliburn + MythosAI + IBM + Caliola",
    description: "Coordinate dozens of autonomous platforms for distributed maritime operations with zero-trust mesh networking and adaptive AI learning",
    capabilityRefs: ["TempestOS Core Platform", "SPY-6 AESA Radar", "Scion ESM Suite", "IBM Watson Orchestrate", "OverKey Mesh VPN"],
    trl: "TRL 6",
    icon: Brain,
    category: "UNMANNED SYSTEMS",
    securityLevel: ["Zero Trust Architecture", "End-to-End Encrypted", "Mesh Network"],
    pricing: "$2.8M",
    pricingPeriod: "per swarm configuration",
    capabilities: ["Swarm Orchestration", "Autonomous Navigation", "Threat Assessment", "Adaptive Learning", "Communication Management", "Formation Control"],
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
    name: "Integrated Maritime Intelligence Platform",
    provider: "Raytheon + Caliburn + L3Harris + Palantir",
    description: "Comprehensive maritime domain awareness combining signals intelligence, radar tracking, and AI-powered threat assessment for real-time decision making",
    capabilityRefs: ["TempestOS Core Platform", "SPY-6 AESA Radar", "Scion ESM Suite", "Palantir Gotham", "AN/SLQ-32 EW"],
    trl: "TRL 9",
    icon: Radar,
    category: "ISR & SURVEILLANCE",
    securityLevel: ["NSA-Approved Crypto", "Zero Trust Architecture"],
    pricing: "$4.2M",
    pricingPeriod: "per platform installation",
    capabilities: ["Multi-Domain Tracking", "Threat Classification", "Electronic Warfare", "Predictive Analytics", "Real-time Fusion", "Automated Alerts"],
    specs: {
      trackingRange: "400+ nautical miles",
      dataFusion: "Multi-sensor integration",
      threatLibrary: "10,000+ signatures",
      processing: "Real-time AI classification",
      integration: "NATO standard interfaces",
      encryption: "Type 1 cryptographic security"
    },
    integration: "This platform integrates multiple ISR capabilities through TempestOS, combining SPY-6 radar for long-range detection, Scion ESM for electronic intelligence gathering, and Palantir Gotham for data fusion and analysis. The AN/SLQ-32 EW suite provides electronic warfare capabilities while maintaining full interoperability with existing C4ISR systems.",
    components: ["Raytheon SPY-6 Radar", "L3Harris Scion ESM", "Palantir Gotham Analytics", "AN/SLQ-32(V)7 EW Suite", "Secure Data Distribution"],
    missionTags: ["Maritime Domain Awareness", "Electronic Intelligence", "Threat Detection"]
  },
  {
    name: "Autonomous Logistics Network",
    provider: "General Dynamics + Caliburn + Microsoft + Anduril",
    description: "Unmanned supply chain management with autonomous vehicles, predictive maintenance, and secure cloud-based logistics coordination",
    capabilityRefs: ["TempestOS Core Platform", "Azure Government Cloud", "Lattice Command & Control", "MDARS", "Automated Inventory"],
    trl: "TRL 7",
    icon: Anchor,
    category: "LOGISTICS & SUPPORT",
    securityLevel: ["Zero Trust Architecture", "DDIL Capable"],
    pricing: "$1.9M",
    pricingPeriod: "per logistics hub",
    capabilities: ["Autonomous Resupply", "Predictive Maintenance", "Inventory Management", "Route Optimization", "Supply Chain Visibility", "Automated Scheduling"],
    specs: {
      coverage: "Multi-vessel support",
      automation: "80% unmanned operations",
      prediction: "72-hour maintenance forecasting",
      coordination: "Cloud-based orchestration",
      resilience: "DDIL environment capable",
      integration: "ERP system compatibility"
    },
    integration: "The Autonomous Logistics Network uses TempestOS to coordinate unmanned logistics vehicles with Azure Government Cloud providing secure, scalable computing resources. Anduril's Lattice system manages autonomous vehicle coordination while MDARS provides perimeter security for logistics facilities.",
    components: ["GD Mission Systems Integration", "Microsoft Azure Gov Cloud", "Anduril Lattice C2", "MDARS Security Robots", "Automated Supply Tracking"],
    missionTags: ["Autonomous Logistics", "Predictive Maintenance", "Supply Chain"]
  }
];

export const individualCapabilities = [
  {
    name: "TempestOS Core Platform",
    provider: "Caliburn Maritime Technologies",
    description: "Advanced maritime operating system providing real-time coordination, secure communications, and adaptive mission planning for next-generation naval operations",
    category: "COMMAND & CONTROL",
    trl: "TRL 9",
    icon: Shield,
    securityLevel: ["NSA-Approved Crypto", "Zero Trust Architecture", "DDIL Capable"],
    pricing: "$450K",
    pricingPeriod: "per vessel installation",
    capabilities: ["Mission Orchestration", "Secure Communications", "Real-time Analytics", "Adaptive Planning", "Multi-domain Integration", "Autonomous Coordination"],
    specs: {
      latency: "<10ms",
      bandwidth: "10+ Gbps",
      security: "AES-256 encryption",
      availability: "99.99% uptime",
      scalability: "100+ connected assets",
      integration: "NATO STANAG compatible"
    }
  },
  {
    name: "SPY-6 AESA Radar",
    provider: "Raytheon Technologies",
    description: "Next-generation Active Electronically Scanned Array radar providing simultaneous air and missile defense with unparalleled detection capabilities",
    category: "SENSORS & DETECTION",
    trl: "TRL 9",
    icon: Radar,
    securityLevel: ["NSA-Approved Crypto"],
    pricing: "$180M",
    pricingPeriod: "per radar system",
    capabilities: ["Air Surveillance", "Missile Defense", "Multi-target Tracking", "Electronic Protection", "Weather Detection", "Space Tracking"],
    specs: {
      range: "400+ nautical miles",
      targets: "1000+ simultaneous",
      discrimination: "Advanced clutter rejection",
      power: "30x more sensitive than legacy",
      integration: "Aegis Combat System",
      availability: "24/7 operations"
    }
  },
  {
    name: "Scion ESM Suite",
    provider: "L3Harris Technologies", 
    description: "Comprehensive electronic surveillance and signals intelligence system for maritime threat detection and electronic warfare support",
    category: "ELECTRONIC WARFARE",
    trl: "TRL 9",
    icon: Signal,
    securityLevel: ["NSA-Approved Crypto", "Zero Trust Architecture"],
    pricing: "$25M",
    pricingPeriod: "per ESM installation",
    capabilities: ["Signal Intelligence", "Electronic Support", "Threat Warning", "Direction Finding", "Emitter Classification", "Communications Intelligence"],
    specs: {
      frequency: "2MHz - 40GHz coverage",
      sensitivity: "Industry-leading detection",
      processing: "Real-time signal analysis",
      library: "5000+ threat emitters",
      integration: "Multi-platform capable",
      automation: "AI-powered classification"
    }
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
  }
};

export const swarmFleets = [
  {
    name: "Autonomous Hunter-Killer Pack",
    classification: "SECRET",
    units: 12,
    composition: ["6x Anduril Ghost Shark XLE", "4x MQ-25 Stingray", "2x Command & Control Vessels"],
    primaryMission: "Anti-submarine warfare and sea denial operations",
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
    name: "Maritime Domain Awareness Network", 
    classification: "SECRET",
    units: 24,
    composition: ["18x Saildrone Surveyor", "4x MQ-4C Triton", "2x P-8A Poseidon"],
    primaryMission: "Wide-area maritime surveillance and intelligence gathering",
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
    name: "Rapid Response Strike Group",
    classification: "SECRET", 
    units: 8,
    composition: ["4x LRUSV (Large Robotic Surface Vessel)", "3x Maritime Strike Missile Platforms", "1x Command Vessel"],
    primaryMission: "Fast-response maritime strike and interdiction",
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
    name: "Logistics Automation Fleet",
    classification: "UNCLASSIFIED",
    units: 16, 
    composition: ["10x Autonomous Supply Vessels", "4x Fuel Barges", "2x Mobile Maintenance Platforms"],
    primaryMission: "Autonomous logistics support and fleet sustainment",
    operationalStatus: "ACTIVE",
    lastDeployment: "Operation ENDLESS SUPPLY - CONTINUOUS",
    totalDeployments: 22,
    successRate: "97%",
    status: {
      atSea: 12,
      missionReady: 4
    },
    capabilities: ["Autonomous Resupply", "Fleet Sustainment", "Mobile Repair", "Predictive Logistics"],
    location: "Multi-Theater Operations",
    readyTime: "CONTINUOUS OPERATIONS", 
    icon: "logistics"
  }
];

export default {
  engineeringStacks,
  individualCapabilities, 
  capabilityCategories,
  swarmFleets
};