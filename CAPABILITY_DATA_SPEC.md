# Capability Data Specification

This document defines the required and optional data properties for capabilities to be uploaded to the Mission Bay Marketplace backend. Capabilities with more complete data will have better integration across all platform features.

## Overview

Capabilities represent payload equipment, software systems, or integrated packages that can be installed on autonomous platforms (USVs, UUVs, UAVs). The data structure supports:

- **Mission Matrix** - Matching capabilities to missions and vessels
- **Will it fit?** - SWaP compatibility checking
- **Reverse Lookup** - Finding compatible platforms
- **Outfitter** - Loading capabilities onto vessel configurations
- **Comparison Mode** - Side-by-side capability analysis

---

## Required Properties

These fields are **mandatory** for all capabilities.

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `name` | string | Unique capability name | `"Scion ESM Suite"` |
| `provider` | string | Manufacturer/vendor name | `"Northrop Grumman"` |
| `description` | string | Short description (1-2 sentences) | `"Advanced electronic support measures for signal intelligence..."` |
| `category` | string | Capability category (see Categories below) | `"ELECTRONIC SUPPORT"` |
| `trl` | string | Technology Readiness Level | `"TRL 9"`, `"TRL 7"`, `"TRL 4"` |

### Category Values

Must be one of:
- `COMMAND & CONTROL`
- `EO/IR SENSORS`
- `RADAR/RF`
- `ACOUSTIC/SONAR`
- `ELECTRONIC SUPPORT`
- `RF COMMUNICATIONS`
- `SATCOM`
- `KINETIC WEAPONS`
- `DIRECTED ENERGY`
- `UNMANNED SYSTEMS`
- `NAVIGATION`
- `LOGISTICS`

---

## SWaP Properties (Strongly Recommended)

These enable platform compatibility features and are **strongly recommended**.

```javascript
swap: {
  weight: number,    // Total weight in kilograms (kg)
  power: number,     // Power consumption in kilowatts (kW)
  size: string       // "small" | "medium" | "large"
}
```

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `swap.weight` | number | Weight in kg | `57` |
| `swap.power` | number | Power draw in kW | `0.5` |
| `swap.size` | string | Physical size category | `"medium"` |

**Why this matters:**
- Without SWaP data, capabilities will not appear in "Will it fit?" mode
- Platform compatibility checking depends on accurate weight/power data
- Running totals in the Outfitter require these values

---

## Platform & Mission Properties (Recommended)

These enable Mission Matrix and filtering features.

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `platformTypes` | string[] | Compatible platform types | `["USV", "UUV", "UAV"]` |
| `missionTags` | string[] | Applicable mission types | `["SEA_DENIAL", "RECONNAISSANCE"]` |

### Platform Type Values

- `USV` - Unmanned Surface Vehicle
- `UUV` - Unmanned Underwater Vehicle
- `UAV` - Unmanned Aerial Vehicle
- `Ship` - Crewed vessel
- `Submarine` - Crewed submarine

### Mission Tag Values

- `SEA_DENIAL` - Sea denial operations
- `SEA_CONTROL` - Sea control/area denial
- `RECONNAISSANCE` - ISR and reconnaissance
- `ANTI_SUBMARINE_WARFARE` - ASW operations
- `ELECTRONIC_WARFARE` - EW/jamming operations
- `SWARM_ORCHESTRATION` - Multi-platform coordination
- `FORCE_PROTECTION` - Defensive operations
- `LOGISTICS_SUPPORT` - Resupply and logistics
- `MINE_COUNTERMEASURES` - Mine detection/neutralization
- `STRIKE` - Offensive strike operations

---

## Detailed Specification Properties (Optional)

These enhance the capability detail view.

```javascript
specs: {
  // Technical specifications as key-value pairs
  range: "25+ km",
  weight: "57 kg",
  powerDraw: "500W max",
  // ... any relevant specs
}
```

| Property | Type | Description |
|----------|------|-------------|
| `specs` | object | Key-value pairs of technical specifications |
| `detailedDescription` | string | Long-form description (multiple paragraphs OK) |
| `keyFeatures` | string[] | Bullet-point feature list |
| `capabilities` | string[] | List of capability functions |
| `integrationNotes` | string | Integration/deployment notes |

---

## Security Properties (Optional)

For classified or security-sensitive capabilities.

```javascript
securityLevel: ["NSA-Approved Crypto", "Zero Trust Architecture"],
securityIcons: ["nsa", "encrypted", "ddil", "mosa", "hardened"]
```

| Property | Type | Description |
|----------|------|-------------|
| `securityLevel` | string[] | Security certifications/features |
| `securityIcons` | string[] | Icons to display (see values above) |

### Security Icon Values

- `nsa` - NSA-approved cryptography
- `encrypted` - End-to-end encryption
- `ddil` - DDIL (Denied, Degraded, Intermittent, Limited) capable
- `mosa` - MOSA compliant
- `hardened` - Security hardened

---

## Stat Impact Properties (Optional)

How this capability affects vessel performance.

```javascript
statImpacts: {
  speed: number,    // Effect on vessel speed (-5 to +5)
  power: number,    // Effect on available power (-5 to +5)
  weight: number,   // Effect on vessel weight (0 to 5)
  range: number,    // Effect on operational range (-5 to +5)
  stealth: number   // Effect on signature/stealth (-5 to +5)
}
```

Values are relative impacts:
- Negative values = negative impact on that attribute
- Positive values = positive impact
- Range typically -5 to +5

---

## Document Properties (Optional)

Attached documentation for download.

```javascript
documents: [
  {
    name: "Technical Data Sheet",
    type: "PDF",
    size: "2.5 MB",
    description: "Complete specifications",
    url: "https://..."
  }
]
```

| Property | Type | Description |
|----------|------|-------------|
| `documents[].name` | string | Document title |
| `documents[].type` | string | File type (PDF, DOC, etc.) |
| `documents[].size` | string | File size |
| `documents[].description` | string | Brief description |
| `documents[].url` | string | Download URL |

---

## Media Properties (Optional)

| Property | Type | Description |
|----------|------|-------------|
| `bannerImage` | string | URL to banner/hero image (1920px wide recommended) |
| `icon` | React Component | Icon component (for frontend use only) |

---

## Complete Example

```javascript
{
  // Required
  name: "Scion ESM Suite",
  provider: "Northrop Grumman",
  description: "Advanced electronic support measures for signal intelligence and threat detection.",
  category: "ELECTRONIC SUPPORT",
  trl: "TRL 9",

  // SWaP (Strongly Recommended)
  swap: {
    weight: 57,      // kg
    power: 0.5,      // kW
    size: "medium"
  },

  // Platform & Mission (Recommended)
  platformTypes: ["USV", "Ship"],
  missionTags: ["SEA_DENIAL", "RECONNAISSANCE", "ELECTRONIC_WARFARE"],

  // Details (Optional but enhances UX)
  specs: {
    rackSize: "18\" H x 29.5\" W x 28.75\" D",
    rackWeight: "102.4 lbs",
    powerAC: "115 VAC (500W Max)",
    radioFrequency: "S-Band (2-4 GHz), X-Band (8-12 GHz)",
    detectionRange: "8 NM observed"
  },

  capabilities: [
    "Signal Intercept",
    "Direction Finding",
    "Threat Classification"
  ],

  keyFeatures: [
    "Passive RF detection across S and X bands",
    "Real-time threat classification",
    "Integration with ship combat systems"
  ],

  detailedDescription: "The Scion ESM Suite provides comprehensive...",
  integrationNotes: "Requires TempestOS 2.0 or later...",

  // Security
  securityLevel: ["NSA-Approved Crypto", "End-to-End Encrypted"],
  securityIcons: ["nsa", "encrypted"],

  // Performance Impacts
  statImpacts: {
    speed: -1,
    power: -4,
    weight: 3,
    range: -2,
    stealth: 5
  },

  // Documents
  documents: [
    {
      name: "Scion ESM Technical Manual",
      type: "PDF",
      size: "4.2 MB",
      description: "Complete installation and operation guide"
    }
  ],

  // Media
  bannerImage: "https://example.com/scion-banner.jpg"
}
```

---

## Data Validation Summary

### Must Have
- `name` (unique string)
- `provider` (string)
- `description` (string)
- `category` (enum string)
- `trl` (string, format "TRL N")

### Should Have
- `swap.weight` (number, kg)
- `swap.power` (number, kW)
- `platformTypes` (string array)
- `missionTags` (string array)

### Nice to Have
- `specs` (object)
- `capabilities` (string array)
- `keyFeatures` (string array)
- `detailedDescription` (string)
- `securityLevel` (string array)
- `documents` (array)
- `bannerImage` (URL string)

---

## API Notes for Backend Implementation

1. **Unique constraint** on `name` field
2. **Category validation** against allowed values
3. **SWaP validation**: weight >= 0, power >= 0
4. **Mission tags** should be validated against allowed values
5. **Platform types** should be validated against allowed values
6. **TRL format** should match pattern "TRL [1-9]"

---

*Generated for Caliburn Mission Bay Marketplace - February 2026*
