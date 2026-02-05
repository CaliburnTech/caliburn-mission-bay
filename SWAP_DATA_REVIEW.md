# SWaP Data Review for PM

This document lists all capabilities with their current SWaP (Size, Weight, Power) data and stat impacts. Items marked with **ESTIMATED** use sensible defaults and may need verification with vendors.

## Capabilities with Real Data (from specs)

| Capability | Provider | Weight | Power | Source |
|------------|----------|--------|-------|--------|
| Scion ESM Suite | Raytheon | 57 kg | 0.5 kW | Spec sheet (102.4 + 12.2 + 10.8 lbs) |
| Jackal Precision Strike Missile | Northrop Grumman | 45 kg | 0.2 kW | Spec sheet (4.5 kg payload mentioned) |

## Capabilities Using Estimated Data

### COMMAND & CONTROL
| Capability | Provider | Weight | Power | Size | Notes |
|------------|----------|--------|-------|------|-------|
| TempestOS Core Platform | Caliburn | 0 kg | 0.1 kW | small | **Software only** - runs on existing compute |
| Programmable Automation Controller | Rockwell Automation | 10 kg | 0.2 kW | small | **ESTIMATED** - industrial controller |
| Arena Military Simulation Platform | Rockwell Automation | 0 kg | 0.3 kW | small | **Software only** |
| Lattice Mesh Network | Anduril | 20 kg | 0.5 kW | small | **ESTIMATED** - mesh networking hardware |
| IBM Watson Orchestrate | IBM | 10 kg | 1.0 kW | small | **ESTIMATED** - AI compute module |
| SNC TRAX C2 Gateway | Sierra Nevada Corporation | 5 kg | 0.2 kW | small | **ESTIMATED** - software/containerized |

### LOGISTICS
| Capability | Provider | Weight | Power | Size | Notes |
|------------|----------|--------|-------|------|-------|
| NSYTE AI Maintenance System | Fathom5 | 15 kg | 0.8 kW | small | **ESTIMATED** - server rack unit |

### EO/IR SENSORS
| Capability | Provider | Weight | Power | Size | Notes |
|------------|----------|--------|-------|------|-------|
| NGHTS Laser Targeting System | Northrop Grumman | 8 kg | 0.15 kW | small | **ESTIMATED** - handheld targeting |
| Advanced EO/IR Camera System | FLIR Systems | 12 kg | 0.15 kW | small | **ESTIMATED** - camera system |
| Multi-Axis Gimbal Stabilizer | DJI Enterprise | 5 kg | 0.1 kW | small | **ESTIMATED** - gimbal |
| Infrared Thermal Sensor | FLIR Systems | 3 kg | 0.08 kW | small | **ESTIMATED** - sensor module |

### ELECTRONIC SUPPORT/ATTACK
| Capability | Provider | Weight | Power | Size | Notes |
|------------|----------|--------|-------|------|-------|
| NG InSight EA System | Northrop Grumman | 80 kg | 2.0 kW | medium | **ESTIMATED** - electronic attack platform |
| Ultra-Lite Electronic Attack System | Northrop Grumman | 35 kg | 0.8 kW | small | **ESTIMATED** - designed for low SWaP |
| DRAKE Counter-UAS System | Northrop Grumman | 25 kg | 0.6 kW | small | **ESTIMATED** - portable C-UAS |

### RADAR/RF
| Capability | Provider | Weight | Power | Size | Notes |
|------------|----------|--------|-------|------|-------|
| Hidden Level Passive Radar | Lockheed Martin | 75 kg | 1.5 kW | medium | **ESTIMATED** - radar array + electronics |

### ACOUSTIC/SONAR
| Capability | Provider | Weight | Power | Size | Notes |
|------------|----------|--------|-------|------|-------|
| Advanced Towed Sonar | General Dynamics | 200 kg | 1.0 kW | large | **ESTIMATED** - towed array + winch |

### KINETIC WEAPONS
| Capability | Provider | Weight | Power | Size | Notes |
|------------|----------|--------|-------|------|-------|
| SM-6 Missile System | Raytheon | 1500 kg | 2.0 kW | xlarge | **ESTIMATED** - per missile + launcher |

### DIRECTED ENERGY
| Capability | Provider | Weight | Power | Size | Notes |
|------------|----------|--------|-------|------|-------|
| High-Energy Laser Weapon | Boeing | 500 kg | 50 kW | large | **ESTIMATED** - laser + cooling + power |

### RF COMMUNICATIONS
| Capability | Provider | Weight | Power | Size | Notes |
|------------|----------|--------|-------|------|-------|
| Cryptographic Communications Module | Caliola Engineering | 5 kg | 0.1 kW | small | **ESTIMATED** - crypto module |
| Unmanned Systems Communications Package | Caliola Engineering | 15 kg | 0.3 kW | small | **ESTIMATED** - UAV comms |
| Multi-Band Communications Array | Harris Corporation | 30 kg | 0.5 kW | medium | **ESTIMATED** - SDR antenna system |
| OverKey Mesh VPN | Caliola Engineering | 2 kg | 0.1 kW | small | **ESTIMATED** - primarily software |

### SATCOM
| Capability | Provider | Weight | Power | Size | Notes |
|------------|----------|--------|-------|------|-------|
| MILSATCOM Terminal | Caliola Engineering | 25 kg | 0.4 kW | small | **ESTIMATED** - SATCOM terminal |

### NAVIGATION
| Capability | Provider | Weight | Power | Size | Notes |
|------------|----------|--------|-------|------|-------|
| SeaFIND Inertial Navigation | Northrop Grumman | 15 kg | 0.25 kW | small | **ESTIMATED** - INS system |
| Military-Grade GPS Module | Trimble | 2 kg | 0.05 kW | small | **ESTIMATED** - GPS receiver |
| High-Capacity Power Management System | SWaP Technologies | 50 kg | -5 kW | medium | **ESTIMATED** - provides power |
| Proximity Sensor Array | LiDAR Corp | 4 kg | 0.2 kW | small | **ESTIMATED** - LiDAR array |

### UNMANNED SYSTEMS
| Capability | Provider | Weight | Power | Size | Notes |
|------------|----------|--------|-------|------|-------|
| Marine AI Navigation System | Marine AI | 8 kg | 0.3 kW | small | **ESTIMATED** - AI nav system |
| Brushless Motor Assembly | MaxonMotor | 8 kg | 0.8 kW | small | **ESTIMATED** - motor system |
| Carbon Fiber Frame System | Composite Structures | -5 kg | 0 kW | medium | **ESTIMATED** - reduces weight |

---

## Stat Impacts Summary

All capabilities have `statImpacts` defined with values representing % impact on vessel stats:
- **speed**: Propulsion/weight effects
- **power**: Power consumption (negative = uses power)
- **weight**: Weight capacity usage
- **range**: Operational range impact
- **stealth**: Signature/emissions impact

### Notable High-Impact Capabilities

| Capability | Biggest Impact | Notes |
|------------|----------------|-------|
| High-Energy Laser Weapon | power: -25% | Major power consumer |
| SM-6 Missile System | weight: 15% | Heavy weapons system |
| Advanced Towed Sonar | speed: -5% | Towed array limits speed |
| Hidden Level Passive Radar | stealth: -15% | Active radar emissions |
| Carbon Fiber Frame System | weight: -5% | Reduces weight, improves speed |
| Marine AI Navigation System | range: +5% | AI optimizes routes |

---

## Recommended Actions

1. **Contact vendors** for capabilities marked **ESTIMATED** to get actual SWaP data
2. **Verify stat impacts** are realistic for each capability type
3. **Add mount point constraints** as data becomes available
4. **Update this document** as real data is obtained

## Data Sources Needed

- Manufacturer spec sheets
- DoD acquisition documents
- Vendor technical data packages
- Integration partner specifications
