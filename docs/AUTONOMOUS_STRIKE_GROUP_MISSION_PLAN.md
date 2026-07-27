# Autonomy Mission Series — Missions 01 to 04

## Implementation plan for the Caliburn Marketplace backend

**Date:** 27 July 2026
**Repo:** `Mission Bay Backend/caliburn-marketplace`
**Reference implementation:** Mission 05, MDA Mothership (`MDA_MOTHERSHIP`), commit `d1a81b5`

---

## 1. Scope and intent

Five pitch decks in the `LCS Planning` folder define the Autonomy Mission Series. Mission 05, MDA Mothership, is already built in the marketplace as a first-class mission. This plan specifies the four that are not:

| Deck | Mission | New template key |
|---|---|---|
| `M.Magazine_Depth_Pitch_Deck.pptx` | 01 — Magazine Depth | `MAGAZINE_DEPTH` |
| `M.Contested_Logistics_Pitch_Deck.pptx` | 02 — Contested Logistics | `CONTESTED_LOGISTICS_MOTHERSHIP` |
| `M.Theater_ASW_Pitch_Deck.pptx` | 03 — Theater ASW | `THEATER_ASW` |
| `M.MCM_Pitch_Deck.pptx` | 04 — Mine Countermeasures | `STANDOFF_MCM` |

### Decisions already made

1. **Four new deck-aligned missions.** The existing `KINETIC_EFFECTS`, `CONTESTED_LOGISTICS`, `ASW`, and `MCM` missions stay exactly as they are. They serve different customers and different platforms (PAE RAS, MASC Baseline, Lewis B. Puller ESB, SubSeaSail HORUS) and anything already demoed against them keeps working. The four new missions are additions, not rewrites.

2. **Catalog additions are in scope.** Every hull and capability the decks cite gets added to the marketplace so each mission rosters exactly what the slides claim. Section 3 specifies them.

3. **Magazine Depth is LCS-centric.** The command node is a Freedom-class LCS, not a destroyer. The LCS commander holds the trigger. M48s carry and fire the missiles on the LCS's behalf; the LCS retains its own cells, and the M48s exist to add depth on top of them. Every reference to a DDG in the deck's supporting prose is background context on the problem, not the configuration being built.

4. **All five series missions are filterable together as `Autonomous Strike Group`.** One new entry in the existing `NAVY_GROUPS` array. Section 8.0.

5. **The Mission Matrix is out of scope.** It is dead code retained in case it is wanted back later. Nothing in this plan touches it, and no new capability needs `missionTags`. Section 2.

6. **The MH-60R gets a real `Helicopter` platform type**, not a UAV with a footnote. Section 3.1a.

### Why the series shares one shape

The five decks are variations on a single argument: a 2 to 3 ship LCS squadron acts as the command node, unmanned hulls absorb the forward risk, and TempestOS is the tasking layer that makes many vendors' hardware behave as one force. Think of the LCS as a quarterback and the M48s as receivers running different routes. Mission 05 already proves the pattern in code, so these four are the same play with a different route tree, which is why the file-by-file work below is nearly identical across all four.

---

## 2. Mission anatomy — what "a mission" means in this codebase

Mission 05 touches seven places. Each new mission needs all seven.

| # | File | What goes in |
|---|---|---|
| 1 | `src/components/mission-planner/constants.js` | Entry in `KEY_MARITIME_MISSIONS` (the mission card) and an entry in `zoneTypes` (map drawing behavior) |
| 2 | `src/data/missionsData.js` | The mission record: zone geography, `missionProfile`, `stateHierarchies`, history |
| 3 | `src/data/missionRoles.js` | `MISSION_ROLES[KEY]` — one role per platform, with default hull, capability list, and launch-gate requirements |
| 4 | `src/data/marketplaceData.js` | Entry in `missionFlowTemplates` — the OODA flow diagram nodes and connections |
| 5 | `src/components/mission-planner/<Name>MissionView.jsx` | The animated Leaflet mission view |
| 6 | `src/components/mission-planner/MissionConfigView.jsx` | Import plus a routing branch, following the existing `if (selectedMissionTemplate === ... || mission?.template === ...)` pattern at lines 330 to 380 |
| 7 | `src/components/mission-planner/MissionConfigView.jsx` — `NAVY_GROUPS` | The new template key added to the `Autonomous Strike Group` filter (section 8.0) |

### Out of scope: the Mission Matrix

`MissionMatrix.jsx` is dead code. Its render site is commented out at `MarketplacePage.jsx` lines 302 to 306 ("Mission Matrix — hidden, keep for future use"), and it is retained only in case it is wanted back. It is therefore **excluded from this plan entirely**.

This is worth stating explicitly because the matrix is the only consumer of two things that would otherwise look like required work: the `PLATFORM_COLORS` map (`MissionMatrix.jsx` lines 13 to 18) and the `individualCapabilities[].missionTags` field. Neither needs touching. If the matrix is ever revived, note that it depends on a `platformTypes` field that does not exist on any of the 157 capabilities, so it renders as empty gaps for every mission today — a pre-existing condition, not something these four missions introduce.

Do not add `missionTags` to new capabilities. Nothing else reads them.

### Launch-gate mechanics, so requirements are written correctly

`missionReadiness.js` checks a role's `requirements` against a configured boat's filled loadout slots. Requirements use **slot keys**, not capability category names. The mapping lives in `CAP_CATEGORY_TO_SLOT` at the bottom of `missionReadiness.js`:

| Slot key | Fed by capability categories |
|---|---|
| `SENSORS` | EO/IR SENSORS, RADAR/RF, ACOUSTIC/SONAR, ACOUSTIC SENSORS, SENSORS & DETECTION, SIGNALS INTELLIGENCE, ISR, MCM, MCM SYSTEMS, EW, ASW, ELECTRONIC SUPPORT, ELECTRONIC PROTECTION, ACOUSTIC DECOY, RADAR SENSORS, SAR |
| `COMMS` | RF COMMUNICATIONS, SATCOM, UNDERWATER COMMS, COMMUNICATIONS |
| `WEAPONS` | KINETIC WEAPONS, WEAPONS, DIRECTED ENERGY, ELECTRONIC ATTACK, COMBAT, SEA_CONTROL, FORCE_PROTECTION |
| `C2` | C2 SYSTEMS, COMMAND & CONTROL |
| `NAV` | NAVIGATION |
| `AI` | UNMANNED SYSTEMS |
| `UTILITY` | LOGISTICS, LOGISTICS & SUPPORT, MAINTENANCE, SUPPLY CHAIN, DATA PROCESSING, CYBER DEFENSE, DEFENSE, ESCORT |

`subTypes` in a role's requirements match a capability's `subType` field exactly. Existing subTypes in use: `STRIKE_WEAPON`, `SONAR_TOWED`, `SONAR_FLS`, `SONAR_SIDESCAN`, `HYDROPHONE`, `ACOUSTIC_MODEM`, `NAV_INS`, `EW_DECOY`, `EW_JAMMER`, `TETHERED_UAS`, `UNDERSEA`, `CBRNE`, `EFFECTS`, `DELIVERY`. New subTypes required by this plan are listed in section 3.

Note the readiness function's forgiving default: a role with no explicit assignment auto-passes, and an assignment with no saved config also passes. Requirements only bite once someone configures a boat for that role, which is exactly the demo path.

---

## 3. Catalog additions

### 3.1 New hulls — `src/data/vesselData.js`

Follow the `M48` entry (line 150) and `Freedom-class LCS` entry (line 1101) as templates. Each needs `name`, `type`, `platformType`, `displacement`, `description`, `icon`, `manufacturer`, `specs {speed, range, rcs}`, `capacity {totalWeight, totalPower}`, `detailedSpecs`, `features`, `applications`.

| Hull | platformType | Manufacturer | Key specs | Used by |
|---|---|---|---|---|
| **MCM USV** | `USV` | Bollinger / Textron | ~12 m unmanned surface vessel, ~40 kn, tows AN/AQS-20C and UISS; IOC May 2023, first deployed March 2025 | 04 |
| **Knifefish** | `UUV` | General Dynamics Mission Systems | Heavyweight UUV, Bluefin-21 derived, ~19 in diameter, low-frequency broadband sonar, buried mine ID; sea acceptance testing completed June 2026 | 04 |
| **MH-60R Seahawk** | `Helicopter` *(new platformType — see 3.1a)* | Sikorsky / Lockheed Martin | Crewed ASW helicopter, AN/AQS-22 ALFS dipping sonar, sonobuoys, 2× Mk 54; launches from LCS flight deck | 03 |
| **V-BAT** | `UAV` | Shield AI | VTOL UAS, 6 m by 6 m launch footprint, flew from USS Cooperstown during UNITAS 2025 | 05 loadout fidelity (optional) |
| **Aerosonde MK 4.8 HQ** | `UAV` | Textron Systems | Small VTOL-capable UAS, maritime ISR | 05 loadout fidelity (optional) |

Each new hull also needs an entry in `src/utils/hullImages.js` (`HULL_IMAGES` map) and a PNG in `src/assets/images/`. Without the image the hull is excluded from the swap modal outright — see section 3.4. Source images from `Mission Bay Backend/Mission Bay Images` if available; otherwise this is an asset request.

New hulls also need entries in `vesselHullComponents` and `vesselMountPoints` (both in `vesselData.js`, both keyed by hull name) and an SVG in `VesselHulls.jsx`, or the outfitter has nothing to draw.

### 3.1a Adding the `Helicopter` platform type

`platformType` currently accepts exactly six values: `USV`, `USV/UUV`, `UUV`, `UAV`, `Ship`, `Submarine`. The MH-60R is a crewed rotary-wing aircraft and gets its own value, `Helicopter`. This is not a one-line change — the codebase treats platform type as a binary aerial-or-maritime split in several places, and a value in neither bucket disappears from the UI silently. All of the following are required.

**1. The classification gate — `src/data/vesselData.js` lines 40 to 42.** This is the highest-leverage edit:

```js
export const isAerialPlatform = (platformType) =>
  platformType?.includes('UAV') || platformType === 'Helicopter';
```

Without it, `Helicopter` returns false from both `isAerialPlatform` and `isMaritimePlatform`, and the hull never appears in the Shipyard hull picker (neither the PIER nor the HANGAR tab) or in `SwapVesselModal`. Rotary-wing belongs in the aerial bucket, so extending `isAerialPlatform` is the correct fix rather than adding a third predicate.

Six consumers depend on these two predicates and all inherit the fix automatically once it is made: `ShipyardView.jsx` lines 25 to 31, 36 to 42, and 45 to 51; `SwapVesselModal.jsx` lines 67 to 71 (the domain guard — this is what keeps the helo from being offered as a swap for a boat); `LoadoutStats.jsx` line 327; `OutfitterView.jsx` line 921.

**2. Squadron domain — `src/data/fleetData.js` lines 8 to 20.** `getSquadronDomain()` maps `UAV → AERIAL`, `USV`/`UUV` → `MARITIME`, and **defaults to MARITIME** on anything unrecognized. Add `pt === 'Helicopter' → 'AERIAL'`, or an MH-60R squadron silently lands in the surface roster instead of the AIR WING panel in `SquadronAssignment.jsx` (lines 203 to 204, 220 to 221, 270 to 273).

**3. Capabilities dropdown — `src/components/CapabilitiesView.jsx` lines 131 to 137.** The vessel `<optgroup>`s are hardcoded: `v.platformType === 'UUV'` and `=== 'UAV'`, with earlier groups filtering on `v.type?.includes('Small USV' | 'Medium USV' | 'Large USV')`. A Helicopter hull matches no group and is unselectable. Add an `<optgroup label="Helicopter">`.

**4. Aerial stat baselines — `src/data/vesselData.js` line 84.** `LoadoutStats.jsx` line 327 uses `isAerialPlatform` to pick `aerialBaselines` over `globalBaselines`. Once the MH-60R reads as aerial it will be graded against fixed-wing UAV baselines. Check that the speed and range maxima there produce sane bars for a helicopter, and widen them if not.

**5. Role definitions — `src/data/missionRoles.js`.** `allowedPlatformTypes: ['Helicopter']`, **and also** set `defaultHullName: 'MH-60R Seahawk'`. Two different match semantics exist and one is exact: `roleUtils.js` line 35 does `role.allowedPlatformTypes.includes(hull.platformType)` (exact), while `SwapVesselModal.jsx` lines 48 to 50 does a substring `.includes()` in the other direction. `LoadoutBuilder.jsx` lines 1219 to 1228 and again at 1563 to 1570 (a near-duplicate block — **change both**) also use exact match, and only when the role has no hull-name hard filter. Setting the default hull name means the role resolves correctly regardless of which path evaluates it.

**6. `HULL_IMAGES` — `src/utils/hullImages.js`.** Covered in section 3.4, repeated here because it is the failure mode most likely to be missed: no image means the hull vanishes from every swap candidate list.

Two things that explicitly do **not** need changing. `PLATFORM_COLORS` in `MissionMatrix.jsx` lines 13 to 18 is the only platformType-keyed color map in the codebase and the matrix is dead code (section 2). And `src/data/iconMappings.js` is keyed on capability and stack names, not platform type, so there is no platformType-to-icon map to extend.

One pre-existing oddity to avoid copying: `LoadoutBuilder.jsx` line 562 reads `roles.find(r => r.platformTypes?.includes(selectedHull?.type))`. No role has a `platformTypes` field (the real one is `allowedPlatformTypes`) and `.type` is the descriptive string, not `platformType`. That line is a silent no-op. Do not model new code on it.

### 3.2 New capabilities — `src/data/marketplaceData.js` → `individualCapabilities`

Required fields per entry, drawn from the `TempestOS Core Platform` entry at line 155: `name`, `provider`, `type`, `description`, `capabilities[]`, `trl`, `icon` (lucide import), `category`, `subType`, `swap {weight, power, size}`, `statImpacts {speed, power, weight, range, stealth}`, `specs{}`, `keyFeatures[]`.

Skip `platformTypes[]` and `missionTags[]`. The `TempestOS` entry does not have `platformTypes` and neither does any other capability; both fields exist only for the dead Mission Matrix (section 2).

`swap.weight` is in kg and `swap.power` in kW. These feed `isHullSwapEligible`, so the numbers must be plausible against hull capacity. M48 capacity is 100,000 kg and 500 kW; the LCS is 210,000 kg and 3,000 kW.

#### Reuse before you create

A verification pass found that several capabilities this plan originally proposed as new **already exist**. Duplicating them is worse than harmless: `meetsRequirements` and `isHullSwapEligible` both resolve names with `individualCapabilities.find(c => c.name === ...)`, which returns the first match, so a second entry with the same name becomes dead data that silently never applies.

| Reuse this existing entry | Do not create |
|---|---|
| `Mk 70 Payload Delivery System` — `KINETIC WEAPONS` / `STRIKE_WEAPON`, swap 18000 / 75 | a second Mk 70 entry |
| `SM-6 Missile System` — `KINETIC WEAPONS` / `STRIKE_WEAPON`, swap 1700 / 2 | "SM-6 (RIM-174) round set" |
| `Tomahawk Block V 8-cell VLS` — `KINETIC WEAPONS` / `STRIKE_WEAPON`, swap 28000 / 8 | "Tomahawk Block V round set" |
| `20-ft TEU Fuel Bladder Module` — `LOGISTICS` / `CARGO_MODULE`, swap 22000 / 0 | "ISO Fuel Module (20 ft TEU bladder)" |
| `20-ft TEU Dry Cargo Module` — `LOGISTICS` / `CARGO_MODULE`, swap 24000 / 0 | "ISO Dry Cargo Module (20 ft TEU)" |
| `MFTA Towed Array` — `ACOUSTIC SENSORS` / `SONAR_TOWED` | "Thales MFTA Towed Array" |
| `Mk 54 Lightweight Torpedo` — note the lowercase `k`, swap 276 kg | "MK 54 Lightweight Torpedo" |
| `Bistatic Cross-Fix Node` — `ACOUSTIC/SONAR`, subType `null`, swap 120 / 0.4 | a heavier duplicate |
| `CAPTAS-4 Variable Depth Sonar`, `USW-DSS (AN/UYQ-100)`, `EvoLogics Acoustic Modem` | — |

Do **not** edit the existing `Mk 70 Payload Delivery System` swap values. `KINETIC_EFFECTS / KE_M48_STRIKE` already uses it against a `defaultHullName` of `AEGIR-H`, whose capacity is 3,000 kg, so that role is already SWaP-ineligible at 46,010 kg. Raising Mk 70's weight deepens a pre-existing bug for no benefit here. (That role's label also says M48 while its default hull is AEGIR-H — worth a separate ticket, out of scope for this plan.)

Note that `Bistatic Cross-Fix Node` carries **no subType**, so it cannot satisfy a `SONAR_TOWED` requirement. Only `MFTA Towed Array` can. Keep that in mind when writing the Theater ASW array roles.

`Naval Strike Missile` does **not** exist as a capability. Either create it or drop it from the Mission 01 tag list; do not leave the instruction dangling.

#### Mission 01 — Magazine Depth (genuinely new)

| Capability | Provider | category | subType | swap (kg / kW) | platformTypes |
|---|---|---|---|---|---|
| Cooperative Engagement Capability (AN/USG-2) | RTX | COMMAND & CONTROL | `FIRE_CONTROL_NET` *(new)* | 900 / 12 | Ship, USV |
| Aegis Remote Fire Control | Lockheed Martin | COMMAND & CONTROL | `FIRE_CONTROL_NET` *(new)* | 400 / 8 | Ship |
| Nulka Active Missile Decoy | BAE Systems | ELECTRONIC ATTACK | `EW_DECOY` | 1200 / 5 | Ship, USV |
| HENSOLDT RF Threat Warning | HENSOLDT | ELECTRONIC SUPPORT | — | 180 / 3 | Ship, USV |

New subType `FIRE_CONTROL_NET` lets Mission 01's LCS role require the fire-control net specifically rather than just "some C2." This is the mechanism that makes the readiness checklist say something meaningful about launch authority.

CEC at 900 kg is heavier than most air platforms can carry — see the SWaP note in section 4.4. Keep it on the LCS and the M48 shooters, not on the aircraft.

#### Mission 02 — Contested Logistics (genuinely new)

| Capability | Provider | category | subType | swap (kg / kW) | platformTypes |
|---|---|---|---|---|---|
| Mk 70 PDS Reload Module | Lockheed Martin | LOGISTICS | `CARGO_MAGAZINE` *(new)* | 20000 / 5 | USV, Ship |
| Autonomous Cargo Handling System | Caliburn | LOGISTICS | — | 4500 / 40 | USV, Ship |

The fuel and cargo modules already exist and both carry subType `CARGO_MODULE`, so the original idea of three distinct cargo subTypes is dropped. Fuel and cargo roles both require `CARGO_MODULE` and are differentiated by the capability actually listed in `role.capabilities`; only the magazine role gets a new subType, because a Mk 70 reload module genuinely is a different kind of thing from a bladder or a pallet.

#### Mission 03 — Theater ASW (genuinely new)

| Capability | Provider | category | subType | swap (kg / kW) | platformTypes |
|---|---|---|---|---|---|
| AN/AQS-22 ALFS Dipping Sonar | Raytheon | ACOUSTIC/SONAR | `SONAR_DIPPING` *(new)* | 350 / 6 | UAV (or Helicopter) |
| Sonobuoys (DIFAR / DICASS) | ERAPSCO | ACOUSTIC SENSORS | `HYDROPHONE` | 240 / 0 | UAV, Ship |

Everything else this mission needs already exists: `MFTA Towed Array`, `CAPTAS-4 Variable Depth Sonar`, `USW-DSS (AN/UYQ-100)`, `EvoLogics Acoustic Modem`, `Bistatic Cross-Fix Node`, `Mk 54 Lightweight Torpedo`.

#### Mission 04 — Standoff MCM

Nothing in this chain exists yet. All four are new.

| Capability | Provider | category | subType | swap (kg / kW) | platformTypes |
|---|---|---|---|---|---|
| AN/AQS-20C Towed Minehunting Sonar | RTX | MCM SYSTEMS | `SONAR_TOWED` | 1400 / 15 | USV |
| Unmanned Influence Sweep System (UISS) | Textron | MCM SYSTEMS | `MCM_SWEEP` *(new)* | 3200 / 20 | USV |
| Barracuda Mine Neutralizer | RTX | MCM SYSTEMS | `MCM_NEUTRALIZER` *(new)* | 300 / 2 | USV, UUV |
| AN/DVS-1 COBRA Coastal Recon | Arete | SENSORS & DETECTION | — | 120 / 4 | UAV |
| Knifefish LFBB Mine ID Sonar | General Dynamics | ACOUSTIC/SONAR | `SONAR_SIDESCAN` | 900 / 12 | UUV |

Note on honesty in the loadout: the deck itself says Barracuda IOC is targeted 2030 and is not fielded. Set `trl` accordingly (TRL 6) rather than TRL 9. The decks make a point of distinguishing what exists from what does not, and the catalog should not quietly contradict its own pitch.

### 3.3 New subTypes summary

`FIRE_CONTROL_NET`, `CARGO_MAGAZINE`, `SONAR_DIPPING`, `MCM_SWEEP`, `MCM_NEUTRALIZER`.

Reuse the existing `CARGO_MODULE` for fuel and dry cargo. Existing subTypes confirmed present and reusable: `STRIKE_WEAPON`, `SONAR_TOWED`, `SONAR_FLS`, `SONAR_SIDESCAN`, `HYDROPHONE`, `ACOUSTIC_MODEM`, `NAV_INS`, `EW_DECOY`, `EW_JAMMER`, `TETHERED_UAS`, `CARGO_MODULE`, `UNDERSEA`, `CBRNE`, `EFFECTS`, `DELIVERY`.

New subTypes are free to add — `missionReadiness.js` reads `cap.subType` generically and `getSlotKeysCoveredBySubTypes` derives slot coverage automatically. No enum to update.

### 3.4 Hull image gate — a silent-failure trap

`SwapVesselModal.jsx` line 47 filters candidate hulls with `if (!HULL_IMAGES[hull.name]) return false;`. A hull with no image entry is **excluded from the swap modal entirely**, not rendered blank. `HULL_IMAGES` currently has 23 keys against 30 hulls in `vesselHullData`, and is missing **HSMUSV, Manta Ray, and Lewis B. Puller Class ESB** — all three of which appear in this plan's `suggestedHullNames`.

So the image work in section 3.1 is not cosmetic. Any hull named in a roster or suggestion list, new or existing, needs a `HULL_IMAGES` entry and a real PNG, or it quietly disappears from the one UI where a demo audience would look for it.

---

## 4. Mission 01 — Magazine Depth

> **Deck line:** "The magazine moves forward on unmanned hulls. The decision stays with the crew."

### 4.1 Concept as built

A Freedom-class LCS holds station as the command node. It carries its own cells and, more importantly, holds launch authority. Two or more M48s stand forward of it carrying Mk 70 PDS containers, four Mk 41 strike-length cells each. An airborne sensor feeds the Cooperative Engagement Capability picture. When a track develops, the LCS watch team evaluates it and authorizes the engagement; the round leaves an M48, not the LCS. Empty M48s cycle to a Remote Operating Site or take a fresh Mk 70 module from a Mission 02 logistics hull, and the LCS never leaves station.

The M48s are depth, not replacement. That distinction drives the mission view: the LCS must visibly retain its own magazine while the M48s extend it.

### 4.2 `constants.js`

```js
// KEY_MARITIME_MISSIONS
{ key: 'MAGAZINE_DEPTH', name: 'Magazine Depth', icon: Crosshair, color: '#f43f5e',
  description: 'LCS holds the trigger; forward M48s carry and fire Mk 70 PDS rounds to add magazine depth without moving the command node',
  domain: 'MARITIME' },

// zoneTypes
MAGAZINE_DEPTH: { label: 'Fires Engagement Box', color: '#f43f5e', fillOpacity: 0.15,
  geometryType: 'zone',
  description: 'Define the engagement box — LCS command node station, forward M48 firing positions, and target area',
  domain: 'MARITIME' },
```

### 4.3 `missionsData.js`

```js
{
  id: "mission-magdepth-001",
  name: "LuzonStrait-MAGDEPTH-Alpha",
  template: "MAGAZINE_DEPTH",
  status: "draft",
  assignedSquadrons: ["sqdn_004"],
  domain: "MARITIME",
  zoneConfig: {
    name: "Luzon Strait — Fires Engagement Box",
    coordinates: [
      { lat: 20.20, lng: 121.00 },
      { lat: 21.60, lng: 121.00 },
      { lat: 21.60, lng: 122.90 },
      { lat: 20.20, lng: 122.90 },
    ],
    swarmSize: 3,
    swarmFormation: "forward-shooter-line",
  },
  duration: "continuous",
  missionProfile: {
    type: "MAGAZINE_DEPTH",
    lane: "DISTRIBUTED_FIRES",
    collectionTypes: ["SURFACE_RADAR", "AIR_RADAR", "CEC_TRACK", "LINK16"],
    commsArchitecture: {
      primary: "Cooperative Engagement Capability (AN/USG-2)",
      secondary: "Link 16 (MIDS-JTRS)",
      tertiary: "Viasat BLOS SATCOM / HiveLink SDR mesh",
      groundStation: "7th Fleet MOC, Yokosuka",
      homeBase: "Freedom-class LCS (on-station command node)"
    },
    objectives: {
      primary: "Add magazine depth to an on-station LCS by distributing Mk 70 PDS cells across forward M48s that fire on the LCS commander's authority, so firepower is regenerated by cycling unmanned hulls rather than by sending the command node off station",
      secondary: "Demonstrate that launch authority stays with the crew: every round leaves an M48 only after the LCS watch team evaluates the CEC track and authorizes the engagement, meeting the appropriate-human-judgment standard of DoDD 3000.09"
    },
    squadronComposition: {
      commandNode: "Freedom-class LCS — 1× — CEC/Aegis remote fire control, TempestOS tasking, own Mk 41 cells retained",
      forwardShooters: "Magnet Defense M48 — 2× — Mk 70 PDS, 4× Mk 41 strike-length cells each, SM-6 / Tomahawk Blk V",
      airborneSensor: "MQ-8C Fire Scout — 1× — over-the-horizon radar and EO/IR feeding the CEC picture",
      sustainment: "Remote Operating Site — rearm, refuel, relay for cycling M48s"
    },
    threat: "PLAN surface action groups and PLAAF strike aircraft inside the Luzon Strait; anti-ship cruise missile threat to the command node; contested EMCON.",
    whyThisConfig: "A magazine that cannot be regenerated on station is a one-time expenditure. Moving cells onto risk-tolerant M48s means firepower is added by adding hulls, and regenerated by cycling them — roughly $57M per MUSV in the FY27 request, with no sailors aboard. The LCS keeps its own cells and, critically, keeps the trigger: CEC feeds fire-control-quality tracks to the watch team, which authorizes each launch before the round leaves a forward M48.",
    escalationTriggers: [
      "Any node detects a threat → CEC fuses it into one fire-control picture at the LCS",
      "Track reaches fire-control quality → LCS watch team evaluates and authorizes: when and what to shoot",
      "Authorization granted → launch-on-remote order to the designated M48; round leaves the forward hull",
      "M48 cells expended → hull cycles to ROS or takes a Mk 70 reload module from a Mission 02 logistics hull; LCS holds station"
    ],
  },
  stateHierarchies: {
    default:       ["Mission", "Payload", "Comms", "Navigation", "Vehicle"],
    track_hold:    ["Payload", "Mission", "Comms", "Navigation", "Vehicle"],
    authorized:    ["Payload", "Mission", "Comms", "Navigation", "Vehicle"],
    magazine_cycle:["Navigation", "Vehicle", "Mission", "Comms", "Payload"],
  },
  createdAt: "2026-07-27T09:00:00Z",
  updatedAt: "2026-07-27T09:00:00Z",
  launchedAt: null,
  history: [
    { action: "created", timestamp: "2026-07-27T09:00:00Z",
      details: "Mission 01 — Magazine Depth — LCS command node holds launch authority; forward M48s carry and fire Mk 70 PDS for added depth (from pitch deck)" }
  ]
},
```

### 4.4 `missionRoles.js`

```js
MAGAZINE_DEPTH: {
  missionLabel: 'Magazine Depth — Distributed Fires',
  minVessels: 4,
  roles: [
    {
      roleKey: 'MAGDEP_LCS',
      roleLabel: 'LCS Command Node',
      description: 'Freedom-class LCS on station as the command node. Holds its own Mk 41 cells and holds launch authority: CEC feeds fire-control-quality tracks to the watch team, which authorizes every engagement before a forward M48 fires.',
      capabilities: [
        'TempestOS Core Platform',
        'Cooperative Engagement Capability (AN/USG-2)',
        'Aegis Remote Fire Control',
        'Link 16 Track Broadcast',
        'MILSATCOM Terminal',
        'Nulka Active Missile Decoy',
        'NSYTE AI Maintenance System',
      ],
      allowedPlatformTypes: ['Ship'],
      defaultHullName: 'Freedom-class LCS',
      suggestedHullNames: ['Freedom-class LCS'],
      requirements: { categories: ['C2', 'COMMS'], subTypes: ['FIRE_CONTROL_NET'] },
    },
    {
      roleKey: 'MAGDEP_SHOOTER_1',
      roleLabel: 'Forward Shooter (M48 — Alpha)',
      description: 'M48 stationed forward of the command node carrying a Mk 70 PDS: four Mk 41 strike-length cells, Mk 41-compatible including Tomahawk. Fires on the LCS commander\'s authorization, never on its own.',
      capabilities: [
        'Mk 70 Payload Delivery System',
        'SM-6 Missile System',
        'Tomahawk Block V 8-cell VLS',
        'Cooperative Engagement Capability (AN/USG-2)',
        'Maritime Surface/Air Search Radar',
        'HiveLink SDR',
        'SeaFIND Inertial Navigation',
      ],
      allowedPlatformTypes: ['USV'],
      defaultHullName: 'M48',
      suggestedHullNames: ['M48'],
      requirements: { categories: ['WEAPONS', 'COMMS'], subTypes: ['STRIKE_WEAPON'] },
    },
    {
      roleKey: 'MAGDEP_SHOOTER_2',
      roleLabel: 'Forward Shooter (M48 — Bravo)',
      description: 'Second forward M48 with an identical Mk 70 loadout. Depth is added by adding hulls: two shooters double the forward cell count without moving the command node.',
      // capabilities, allowedPlatformTypes, defaults, requirements: same as MAGDEP_SHOOTER_1
    },
    {
      roleKey: 'MAGDEP_SENSOR',
      roleLabel: 'Airborne Sensor (MQ-4C Triton)',
      description: 'MQ-4C Triton extending the radar and EO/IR horizon and feeding the fire-control picture over Link 16, so the engagement can be authorized against a track no single hull could hold.',
      capabilities: [
        'Maritime Surface/Air Search Radar',
        'Teledyne FLIR EO/IR Turret',
        'Link 16 Track Broadcast',
      ],
      allowedPlatformTypes: ['UAV'],
      defaultHullName: 'MQ-4C Triton',
      suggestedHullNames: ['MQ-4C Triton', 'MQ-8C Fire Scout'],
      requirements: { categories: ['SENSORS', 'COMMS'], subTypes: [] },
    },
  ],
},
```

**Two SWaP corrections baked into the above.**

First, `suggestedHullNames` on the shooter role is narrowed to M48 alone. AEGIR-W has a 300 kg capacity against a role summing roughly 48,000 kg, so it would show as ineligible and sort to the bottom of the swap modal, which reads as a bug rather than as guidance.

Second, the airborne sensor was originally specced as an MQ-8C Fire Scout carrying CEC. MQ-8C capacity is **318 kg** and CEC alone is 900 kg, so the role would have failed `isHullSwapEligible` on its own default hull. CEC has been removed from the aircraft and the default hull changed to MQ-4C Triton (1,452 kg). This is also the more defensible engineering claim: CEC lives on the LCS and the shooters, and the aircraft contributes tracks over Link 16. The deck's OV-1 labels this node "AIRBORNE SENSOR (CEC)," which the fused-picture narrative still satisfies — the CEC network includes the track, it just does not include a terminal bolted to a small rotary UAV.

As specced, MAGDEP_SHOOTER_1 sums to roughly 47,700 kg and 85 kW against the M48's 100,000 kg and 500 kW. Comfortable on both axes.

### 4.5 Flow template — `marketplaceData.js` → `missionFlowTemplates`

```js
MAGAZINE_DEPTH: {
  name: "Magazine Depth — Distributed Fires, Retained Authority",
  category: "COMBAT",
  subType: null,
  nodes: [
    { id: 'station',    type: 'trigger',          label: 'LCS On Station\n(Command Node)',            position: { x: 50,   y: 160 } },
    { id: 'sense',      type: 'sense',            label: 'Sense — Any Node\nRadar / EO-IR / M48',     position: { x: 240,  y: 160 } },
    { id: 'cec_fuse',   type: 'orient',           label: 'CEC Fuses One\nFire-Control Picture',       position: { x: 450,  y: 160 } },
    { id: 'fc_quality', type: 'decision',         label: 'Fire-Control\nQuality Track?',              position: { x: 660,  y: 160 } },
    { id: 'refine',     type: 'action',           label: 'Refine Track\nCue Additional Sensors',      position: { x: 660,  y: 320 } },
    { id: 'human_auth', type: 'human_checkpoint', label: 'LCS Watch Team\nAuthorizes Engagement',     position: { x: 870,  y: 160 } },
    { id: 'assign',     type: 'decide',           label: 'Assign Shooter\n& Round Type',              position: { x: 1070, y: 160 } },
    { id: 'launch',     type: 'action',           label: 'M48 Fires from\nMk 70 PDS',                 position: { x: 1270, y: 160 } },
    { id: 'cells_left', type: 'decision',         label: 'Cells\nRemaining?',                         position: { x: 1270, y: 320 } },
    { id: 'cycle',      type: 'action',           label: 'Cycle M48 to ROS /\nMk 70 Reload Module',   position: { x: 1060, y: 430 } },
    { id: 'sustained',  type: 'end',              label: 'Fires Sustained —\nLCS Never Left Station', position: { x: 1470, y: 320 } },
  ],
  connections: [
    { from: 'station',    to: 'sense' },
    { from: 'sense',      to: 'cec_fuse' },
    { from: 'cec_fuse',   to: 'fc_quality' },
    { from: 'fc_quality', to: 'human_auth', label: 'Yes' },
    { from: 'fc_quality', to: 'refine',     label: 'Not Yet' },
    { from: 'human_auth', to: 'assign',     label: 'Authorized' },
    { from: 'human_auth', to: 'refine',     label: 'Hold — Do Not Engage' },
    { from: 'assign',     to: 'launch' },
    { from: 'launch',     to: 'cells_left' },
    { from: 'cells_left', to: 'sustained',  label: 'Yes — Stay Forward' },
    { from: 'cells_left', to: 'cycle',      label: 'Empty' },
    { from: 'cycle',      to: 'sustained',  label: 'Magazine Regenerated' },
  ],
  loopBack: { from: 'refine', to: 'sense', label: 'Continue Sensing' },
},
```

The `human_checkpoint` node is not decoration. It is the deck's central claim rendered as a diagram, and it is the one node a Navy reviewer will look for.

### 4.6 Mission view — `MagazineDepthMissionView.jsx`

Copy `MDAMothershipMissionView.jsx` and change the geography, milestones, roster, and narratives. Keep the store wiring, `SwapVesselModal`, `ReadinessChecklist`, `getMissionReadiness`, and `MapController` / `MapInvalidateSize` helpers verbatim.

```js
const MISSION_SET_KEY = 'MAGAZINE_DEPTH';
const MISSION_SET_CAPS = [
  'TempestOS Core Platform', 'Cooperative Engagement Capability (AN/USG-2)',
  'Aegis Remote Fire Control', 'Link 16 Track Broadcast', 'MILSATCOM Terminal',
  'Mk 70 Payload Delivery System', 'SM-6 Missile System', 'Tomahawk Block V 8-cell VLS',
  'Maritime Surface/Air Search Radar', 'Teledyne FLIR EO/IR Turret',
  'Nulka Active Missile Decoy', 'HiveLink SDR', 'SeaFIND Inertial Navigation',
  'NSYTE AI Maintenance System',
];

const MAP_CENTER  = [20.90, 121.95];
const MAP_ZOOM    = 7;
const MAP_ZOOM_IN = 8;

const LCS_POS     = [20.45, 121.20];  // command node — held back, south-west
const M48_A_POS   = [21.05, 122.10];  // forward shooter Alpha
const M48_B_POS   = [20.70, 122.45];  // forward shooter Bravo
const AIR_STATION = [21.40, 122.30];  // MQ-8C sensor, forward and high
const TARGET_POS  = [21.85, 122.95];  // PLAN SAG track
const ROS_POS     = [19.95, 120.60];  // Remote Operating Site — rearm

const ENGAGEMENT_BOX_NM = 80;
```

Tick sequence (`TICK_MS = 280`, matching Mission 05):

| Tick | Milestone | Phase | On-map behavior |
|---|---|---|---|
| 0 to 8 | — | `idle` | Static; LCS, M48s, MQ-8C at station |
| 8 | `T_ONSTATION` | `deployed` | Engagement box drawn; LCS marker labeled "Command Node — Launch Authority" with its own cell count shown |
| 20 | `T_DETECT` | `sensing` | Target contact appears; dashed bearing lines from MQ-8C and M48 Alpha to the contact |
| 32 | `T_CEC` | `fusing` | Bearings converge; solid CEC track line from every node to the LCS; track label upgrades to "Fire-Control Quality" |
| 44 | `T_AUTH` | `authorizing` | Amber pulse on the LCS marker; on-screen callout "LCS Watch Team — Authorize Engagement"; everything else holds |
| 56 | `T_LAUNCH` | `firing` | Launch-on-remote order line LCS → M48 Alpha, then an animated round track M48 Alpha → target; LCS cell count unchanged, M48 Alpha cell count decrements 4 → 3 |
| 70 | `T_EXPENDED` | `cycling` | M48 Alpha cells reach 0; hull transits toward ROS; M48 Bravo slides into Alpha's firing position |
| 86 | `T_COMPLETE` | `complete` | M48 Alpha returns rearmed; both shooters forward; LCS has not moved once |

Phase narratives:

```js
const PHASE_NARRATIVE = {
  idle:        null,
  deployed:    { title: 'LCS On Station — Command Node', body: 'The Freedom-class LCS takes station as the command node, cells aboard and TempestOS up. Two M48s stand forward of it carrying Mk 70 PDS containers: four Mk 41 strike-length cells each, on top of the LCS\'s own magazine.' },
  sensing:     { title: 'Contact', body: 'A surface action group is detected. Any node can see it first — the MQ-8C off the flight deck, an M48\'s own radar, or the LCS. The bearings start coming in.' },
  fusing:      { title: 'One Fire-Control Picture', body: 'Cooperative Engagement Capability fuses every node\'s contribution into a single fire-control-quality track at the LCS. No one hull could hold this track alone.' },
  authorizing: { title: 'The Decision Stays With the Crew', body: 'The LCS watch team evaluates the track and decides when and what to shoot. Nothing launches until a human on station authorizes it — the appropriate-human-judgment standard of DoDD 3000.09.' },
  firing:      { title: 'Launch on Remote', body: 'The order goes forward. The round leaves M48 Alpha, not the LCS. The command node keeps its own cells and keeps its station; the risk of being the shooter sits on a hull with no crew aboard.' },
  cycling:     { title: 'Regenerate by Cycling Hulls', body: 'M48 Alpha is empty and transits to the Remote Operating Site for a fresh Mk 70 module. M48 Bravo takes its firing position. Depth is regenerated by cycling unmanned hulls, not by sending the command node home.' },
  complete:    { title: 'Fires Sustained — The LCS Never Left', body: 'Alpha is back forward and rearmed. The magazine moved; the decision never did. Swap the payload, not the platform.' },
};
```

Two on-map elements carry the argument and should not be cut: a **persistent LCS cell counter that never decrements** during the firing phase, and a visible **launch-authority line** from the LCS to the firing M48 that appears only after the human-auth phase.

---

## 5. Mission 02 — Contested Logistics

> **Deck line:** "Unmanned hulls take the risk forward. Manned ships stay out of the threat."

### 5.1 Concept as built

A 2 to 3 ship LCS squadron sits behind the manned stand-off line as the command and logistics node: it loads, routes, and orchestrates. M48 resupply hulls carry ISO fuel modules, ISO dry cargo, or Mk 70 reload magazines forward of that line to a combatant on station, to a Remote Operating Site, or cross-loaded to an adjacent M48. TempestOS assigns each run by mission order rather than by fixed schedule. The mission ends with the forward combatant refueled and rearmed without leaving the fight, and no crewed oiler ever inside the weapons engagement zone.

Distinct from the existing `CONTESTED_LOGISTICS` mission, which stages from a Lewis B. Puller ESB for a Marine EABO position in the South China Sea, under PAE RAS. This one is LCS-orchestrated, Luzon Strait, and the cargo includes magazines.

### 5.2 `constants.js`

```js
{ key: 'CONTESTED_LOGISTICS_MOTHERSHIP', name: 'Contested Logistics — LCS Node', icon: Ship, color: '#a78bfa',
  description: 'LCS loads and routes M48 resupply hulls carrying fuel, ISO cargo, and Mk 70 reload magazines inside the weapons engagement zone; crewed oilers stay out of the threat',
  domain: 'MARITIME' },

CONTESTED_LOGISTICS_MOTHERSHIP: { label: 'Sustainment Network', color: '#a78bfa', fillOpacity: 0.15,
  geometryType: 'route',
  description: 'Define the sustainment network — rear LCS node, forward routes, Remote Operating Site, and the combatant on station',
  domain: 'MARITIME' },
```

`geometryType: 'route'` matters: this is the one mission of the four whose geography is legs and waypoints rather than an area. Follow the existing `CONTESTED_LOGISTICS` zone type for the drawing behavior.

### 5.3 `missionsData.js`

```js
{
  id: "mission-contlog-lcs-001",
  name: "LuzonStrait-SUSTAINMENT-Node-Alpha",
  template: "CONTESTED_LOGISTICS_MOTHERSHIP",
  status: "draft",
  assignedSquadrons: ["sqdn_004"],
  domain: "MARITIME",
  zoneConfig: {
    name: "Luzon Strait — Sustainment Network, Rear Node to Forward Edge",
    waypoints: [
      { lat: 19.60, lng: 120.40, label: "LCS-REAR-NODE" },
      { lat: 20.10, lng: 121.10, label: "ROS-BALINTANG" },
      { lat: 20.75, lng: 121.95, label: "WEZ-ENTRY" },
      { lat: 21.30, lng: 122.60, label: "COMBATANT-ON-STATION" },
      { lat: 20.95, lng: 122.20, label: "ADJACENT-M48-CROSSLOAD" }
    ]
  },
  duration: "continuous",
  missionProfile: {
    type: "CONTESTED_LOGISTICS_MOTHERSHIP",
    lane: "DISTRIBUTED_SUSTAINMENT",
    collectionTypes: ["SURFACE_RADAR", "EO_IR", "LINK16"],
    commsArchitecture: {
      primary: "Link 16 (MIDS-JTRS)",
      secondary: "Viasat BLOS SATCOM",
      tertiary: "HiveLink SDR mesh / Doodle Labs MANET",
      groundStation: "7th Fleet MOC, Yokosuka",
      homeBase: "Freedom-class LCS (rear logistics node, behind the stand-off line)"
    },
    cargoManifest: [
      { module: "20-ft TEU Fuel Bladder Module", weight: "22,000 kg", contents: "F-76 / JP-8 for combatants and Remote Operating Sites" },
      { module: "20-ft TEU Dry Cargo Module", weight: "24,000 kg", contents: "Palletized stores, spare parts, medical, rations" },
      { module: "Mk 70 PDS Reload Module", weight: "20,000 kg", contents: "4-cell Mk 41 reload magazine feeding Mission 01 shooters" }
    ],
    objectives: {
      primary: "Sustain combatants inside the weapons engagement zone by carrying fuel, ISO cargo, and Mk 70 reload magazines forward on unmanned M48 hulls tasked by TempestOS from a rear LCS logistics node, so no crewed oiler enters the threat ring",
      secondary: "Demonstrate that sustainment is decided at the last contested mile: each run is assigned by mission order rather than fixed schedule, and a hull lost forward costs no mariners and carries no strategic signature"
    },
    squadronComposition: {
      logisticsNode: "Freedom-class LCS — 1× — load, route, and orchestrate; held behind the manned stand-off line",
      resupplyHulls: "Magnet Defense M48 — 3× — ISO fuel, ISO dry cargo, or Mk 70 reload module; 100-ton / 4-container capacity each",
      remoteOperatingSite: "ROS Balintang — 1× — beachhead refuel, rearm, and repair without a major port",
      receivingUnit: "Combatant on station — refuel and rearm alongside without leaving the fight"
    },
    threat: "DF-26 anti-ship ballistic missile weapons engagement zone across the Luzon Strait; PLAN surface patrols; GPS jamming on the forward legs; no safe harbor inside the WEZ.",
    whyThisConfig: "Sustainment is determined at the last contested mile, not by tonnage held in rear warehouses. Roughly 1,400 nm separate Guam from the strait and there is no port inside the weapons engagement zone that can service the fight. Unmanned hulls absorb the transit risk: many dispersed, risk-tolerant M48s sustain the forward battle while crewed oilers stay outside the threat ring. The containers themselves are mature; autonomous transfer at sea is the gap this mission exists to prove.",
    escalationTriggers: [
      "Combatant reports fuel or magazine state → TempestOS assigns an M48 a run by mission order",
      "M48 crosses the WEZ entry line → EMCON discipline, INS-only navigation through the jammed segment",
      "Alongside the combatant → autonomous transfer of fuel, cargo, or Mk 70 module; combatant never leaves station",
      "Link drops → hull holds its last routing order and executes pre-authorized rules to completion"
    ],
  },
  stateHierarchies: {
    default:       ["Navigation", "Vehicle", "Comms", "Mission", "Payload"],
    wez_transit:   ["Navigation", "Comms", "Vehicle", "Mission", "Payload"],
    gps_denied:    ["Navigation", "Vehicle", "Mission", "Comms", "Payload"],
    transfer:      ["Payload", "Mission", "Navigation", "Vehicle", "Comms"],
    rtb:           ["Navigation", "Vehicle", "Comms", "Mission", "Payload"],
  },
  createdAt: "2026-07-27T09:00:00Z",
  updatedAt: "2026-07-27T09:00:00Z",
  launchedAt: null,
  history: [
    { action: "created", timestamp: "2026-07-27T09:00:00Z",
      details: "Mission 02 — Contested Logistics — LCS rear logistics node routing M48 resupply hulls inside the WEZ (from pitch deck)" }
  ]
},
```

### 5.4 `missionRoles.js`

```js
CONTESTED_LOGISTICS_MOTHERSHIP: {
  missionLabel: 'Contested Logistics — LCS Sustainment Node',
  minVessels: 4,
  roles: [
    {
      roleKey: 'CLM_LCS',
      roleLabel: 'LCS Logistics Node',
      description: 'Freedom-class LCS held behind the manned stand-off line. Loads the modules, assigns each M48 a run by mission order, and resolves load, position, and health from every hull into one picture.',
      capabilities: [
        'TempestOS Core Platform', 'MILSATCOM Terminal', 'Link 16 Track Broadcast',
        'HiveLink SDR', 'Autonomous Cargo Handling System', 'NSYTE AI Maintenance System',
      ],
      allowedPlatformTypes: ['Ship'],
      defaultHullName: 'Freedom-class LCS',
      suggestedHullNames: ['Freedom-class LCS', 'Lewis B. Puller Class ESB'],
      requirements: { categories: ['C2', 'COMMS', 'UTILITY'], subTypes: [] },
    },
    {
      roleKey: 'CLM_FUEL',
      roleLabel: 'Fuel Run (M48)',
      description: 'M48 carrying ISO fuel modules forward to a combatant on station or a Remote Operating Site. Bladders and ISO tanks; the container is not the hard part, the autonomous transfer is.',
      capabilities: [
        '20-ft TEU Fuel Bladder Module', 'Autonomous Cargo Handling System',
        'Maritime Surface/Air Search Radar', 'Teledyne FLIR EO/IR Turret',
        'Marine AI Guardian Vision CVP', 'SeaFIND Inertial Navigation', 'HiveLink SDR',
        'Nulka Active Missile Decoy',
      ],
      allowedPlatformTypes: ['USV'],
      defaultHullName: 'M48',
      suggestedHullNames: ['M48'],
      requirements: { categories: ['UTILITY', 'COMMS', 'NAV'], subTypes: ['CARGO_MODULE'] },
    },
    {
      roleKey: 'CLM_CARGO',
      roleLabel: 'Cargo Run (M48)',
      description: 'M48 carrying palletized stores, spare parts, and dry cargo in 20-foot ISO modules. Up to four standard containers or 100 tons per hull.',
      // as CLM_FUEL, with '20-ft TEU Dry Cargo Module'
      requirements: { categories: ['UTILITY', 'COMMS', 'NAV'], subTypes: ['CARGO_MODULE'] },
    },
    {
      roleKey: 'CLM_MAGAZINE',
      roleLabel: 'Magazine Run (M48)',
      description: 'M48 carrying a Mk 70 PDS reload module forward to a Mission 01 shooter, so an empty M48 regenerates its magazine without transiting all the way back to a rear node.',
      // as CLM_FUEL, with 'Mk 70 PDS Reload Module'
      requirements: { categories: ['UTILITY', 'COMMS', 'NAV'], subTypes: ['CARGO_MAGAZINE'] },
    },
  ],
},
```

The three cargo roles are deliberately separate rather than one parameterized role. The deck's claim is "swap the payload, not the platform," and three identical hulls with three different modules is that claim made visible in the roster.

Fuel and cargo share the existing `CARGO_MODULE` subType and are distinguished by the module named in `role.capabilities`. Only the magazine role carries a new subType. `suggestedHullNames` is M48 only across all three roles: AEGIR-F is a 50 kg hull and HSMUSV is 340 kg, against roles summing over 20,000 kg, so suggesting them produces ineligible entries at the bottom of the swap modal.

### 5.5 Flow template

```js
CONTESTED_LOGISTICS_MOTHERSHIP: {
  name: "Contested Logistics — Node to Edge, On Demand",
  category: "LOGISTICS",
  subType: null,
  nodes: [
    { id: 'demand',    type: 'trigger',  label: 'Combatant Reports\nFuel / Magazine State',   position: { x: 50,   y: 160 } },
    { id: 'assign',    type: 'decide',   label: 'TempestOS Assigns\nRun by Mission Order',    position: { x: 250,  y: 160 } },
    { id: 'load',      type: 'action',   label: 'Load Module at\nRear LCS Node',              position: { x: 460,  y: 160 } },
    { id: 'transit',   type: 'action',   label: 'Transit Forward\nEMCON Discipline',          position: { x: 660,  y: 160 } },
    { id: 'link',      type: 'decision', label: 'Link\nHeld?',                                position: { x: 860,  y: 160 } },
    { id: 'autonomous',type: 'action',   label: 'Hold Last Routing Order\nPre-Authorized Rules', position: { x: 860, y: 320 } },
    { id: 'destination',type:'decision', label: 'Delivery\nPoint?',                           position: { x: 1060, y: 160 } },
    { id: 'combatant', type: 'action',   label: 'Transfer Alongside\nCombatant on Station',   position: { x: 1270, y: 60  } },
    { id: 'ros',       type: 'action',   label: 'Deliver to Remote\nOperating Site',          position: { x: 1270, y: 180 } },
    { id: 'crossload', type: 'action',   label: 'Cross-Load to\nAdjacent M48',                position: { x: 1270, y: 300 } },
    { id: 'sustained', type: 'end',      label: 'Forward Fight Sustained —\nNo Crewed Oiler in the WEZ', position: { x: 1480, y: 180 } },
  ],
  connections: [
    { from: 'demand',      to: 'assign' },
    { from: 'assign',      to: 'load' },
    { from: 'load',        to: 'transit' },
    { from: 'transit',     to: 'link' },
    { from: 'link',        to: 'destination', label: 'Held' },
    { from: 'link',        to: 'autonomous',  label: 'Denied' },
    { from: 'autonomous',  to: 'destination', label: 'Run Completes Regardless' },
    { from: 'destination', to: 'combatant',   label: 'Combatant' },
    { from: 'destination', to: 'ros',         label: 'ROS' },
    { from: 'destination', to: 'crossload',   label: 'Adjacent Hull' },
    { from: 'combatant',   to: 'sustained' },
    { from: 'ros',         to: 'sustained' },
    { from: 'crossload',   to: 'sustained' },
  ],
  loopBack: { from: 'sustained', to: 'demand', label: 'Next Run Assigned' },
},
```

### 5.6 Mission view — `ContestedLogisticsMothershipMissionView.jsx`

Name it distinctly from the existing `ContestedLogisticsMissionView.jsx` to avoid confusion in imports.

```js
const MISSION_SET_KEY = 'CONTESTED_LOGISTICS_MOTHERSHIP';

const MAP_CENTER  = [20.55, 121.60];
const MAP_ZOOM    = 7;
const MAP_ZOOM_IN = 8;

const LCS_NODE    = [19.60, 120.40];  // rear logistics node, behind the stand-off line
const ROS_POS     = [20.10, 121.10];  // Remote Operating Site — Balintang
const WEZ_ENTRY   = [20.75, 121.95];  // weapons engagement zone boundary crossing
const COMBATANT   = [21.30, 122.60];  // combatant on station, forward edge
const ADJACENT_M48= [20.95, 122.20];  // cross-load recipient

const STANDOFF_LINE = [[19.90, 119.80], [20.30, 123.40]];  // manned stand-off line
const WEZ_RADIUS_NM = 120;
```

| Tick | Milestone | Phase | On-map behavior |
|---|---|---|---|
| 0 to 8 | — | `idle` | Static; stand-off line drawn as a dashed polyline, WEZ as a translucent red circle |
| 8 | `T_DEMAND` | `demand` | Combatant marker pulses amber with a "FUEL 22% / CELLS 1 of 4" callout |
| 18 | `T_LOAD` | `loading` | Three M48s at the LCS node; module icons attach (fuel, cargo, magazine) |
| 30 | `T_TRANSIT` | `transiting` | Hulls move forward; each crosses the stand-off line and the WEZ boundary; the LCS does not move |
| 46 | `T_DENIED` | `denied` | Comms link icon drops on the middle hull; its track continues unchanged, labeled "Holding Last Routing Order" |
| 60 | `T_TRANSFER` | `transferring` | Fuel hull alongside the combatant, magazine hull alongside a Mission 01 M48, cargo hull at the ROS; transfer animation on each |
| 76 | `T_RTB` | `returning` | Empty hulls transit back; combatant state flips green "FUEL 96% / CELLS 4 of 4" and never moves |
| 92 | `T_COMPLETE` | `complete` | All hulls back at the node; stand-off line highlighted with "No crewed hull crossed this line" |

Phase narratives should carry the deck's arithmetic where it fits: 1,400 nm from Guam, roughly 150 nm across the strait, zero safe ports inside the WEZ.

The single most important visual: **the stand-off line, and the fact that only unmanned hulls cross it.** If a reviewer takes one image away from this mission, it should be that.

---

## 6. Mission 03 — Theater ASW

> **Deck line:** "Hunt on passive. Confirm with one ping. Kill from the air."

### 6.1 Concept as built

An LCS holds station as the command node, fusing passive bearings and flying the helo. Three M48s tow passive arrays across the Luzon Strait barrier and never radiate. When overlapping bearings cross-fix a hostile submarine into a track, the lead M48 goes active for exactly one ping to nail the firing solution. An MH-60R then launches from the LCS flight deck and drops a Mk 54. The only crewed asset is exposed after the contact is already cross-fixed, and for the kill rather than the search.

Distinct from the existing `ASW` mission, which is a Philippine Sea barrier built on a SubSeaSail HORUS acoustic mesh with MQ-8C prosecution, under CTF-72. This one is the deck's configuration: LCS command node, three M48 arrays, MH-60R with Mk 54, Luzon Strait.

### 6.2 `constants.js`

```js
{ key: 'THEATER_ASW', name: 'Theater ASW', icon: Waves, color: '#0891b2',
  description: 'Passive barrier of M48 towed arrays cross-fixed at an LCS command node; one confirm ping, then an MH-60R prosecutes with Mk 54',
  domain: 'MARITIME' },

THEATER_ASW: { label: 'ASW Barrier', color: '#0891b2', fillOpacity: 0.15,
  geometryType: 'zone',
  description: 'Draw the barrier line — array spacing sets hull count; spacing is set jointly with the government',
  domain: 'MARITIME' },
```

Use `'zone'` and represent the barrier as a long thin polygon. The valid `geometryType` values are `zone`, `route`, `perimeter`, `target`, `station`, `orbit`, and `track`; `'barrier'` is not among them. Both consumers (`MapZoneEditor.jsx` and `getDefaultZoneConfig` in `MissionConfigView.jsx`) are switch statements with a polygon `default:` branch, so an invented value would not crash — it would silently behave as `zone` while misleading anyone reading the data. The existing `THREAT_CHARACTERIZATION` entry already does exactly this: it is labeled "Characterization Barrier" and typed `zone`. Follow that precedent.

### 6.3 `missionsData.js`

```js
{
  id: "mission-theaterasw-001",
  name: "LuzonStrait-THEATER-ASW-Barrier-Alpha",
  template: "THEATER_ASW",
  status: "draft",
  assignedSquadrons: ["sqdn_004", "sqdn_016"],
  domain: "MARITIME",
  zoneConfig: {
    name: "Luzon Strait — Theater ASW Barrier — Taiwan to Luzon Gap",
    coordinates: [
      { lat: 20.10, lng: 120.90 },
      { lat: 21.90, lng: 120.90 },
      { lat: 21.90, lng: 122.40 },
      { lat: 20.10, lng: 122.40 },
    ],
    swarmSize: 3,
    swarmFormation: "passive-barrier-line",
  },
  duration: "continuous",
  missionProfile: {
    type: "THEATER_ASW",
    lane: "PASSIVE_BARRIER",
    collectionTypes: ["PASSIVE_SONAR", "ACTIVE_SONAR", "ACOUSTIC_COMMS", "LINK16"],
    commsArchitecture: {
      primary: "EvoLogics acoustic modem (EMCON-compliant)",
      secondary: "Link 16 (MIDS-JTRS) on scheduled RF windows",
      tertiary: "HiveLink SDR mesh",
      groundStation: "CTF-72, Yokosuka",
      homeBase: "Freedom-class LCS (on-station command node, MH-60R embarked)"
    },
    barrierGeometry: {
      barrierLengthNm: 150,
      note: "Hull count follows array detection range, which is classified. Spacing is set jointly with the government and is not asserted here."
    },
    objectives: {
      primary: "Hold a continuous passive acoustic barrier across the roughly 150 nm Taiwan-to-Luzon gap using three M48 towed-array hulls whose bearings cross-fix at an LCS command node, so the theater is held under surveillance by machines rather than by scarce crewed hunters",
      secondary: "Prosecute on a single active cue: once the passive cross-fix yields a firing solution, the lead M48 emits exactly one confirmation ping and an MH-60R launched from the LCS drops a Mk 54 — the only crewed asset exposed, after the contact is found and for the kill rather than the search"
    },
    squadronComposition: {
      commandNode: "Freedom-class LCS — 1× — USW-DSS cross-fix, TempestOS acoustic classification, MH-60R flight operations",
      passiveArrays: "Magnet Defense M48 — 3× — MFTA passive towed array (Thales); listen quiet, never radiate",
      leadArray: "Lead M48 — CAPTAS-4 variable-depth sonar for the single active confirmation ping",
      prosecutor: "MH-60R Seahawk — 1× — AN/AQS-22 ALFS dipping sonar, DIFAR/DICASS sonobuoys, 2× Mk 54 lightweight torpedo"
    },
    threat: "PLAN submarine force projected at 65 boats by 2025 and 80 by 2035 against a US attack force near 49, roughly one third in or awaiting maintenance. Passive-first operations keep every M48 below the boat's counter-detection threshold during the search.",
    whyThisConfig: "Anti-submarine warfare is decided by the proportion of theater held under continuous surveillance, not by the capability of the individual hunter — a superb sensor contributes nothing to the barrier it is not on. The prior failure was concentration: one exquisite sensor on one scarce hull, cancelled in FY23 after a Nunn-McCurdy breach. Distribution is the change. Many affordable passive arrays, roughly $57M per MUSV in the FY27 request, cross-fixed rather than individually decisive, with the kill decoupled from the sensors so no platform acts as emitting bait.",
    escalationTriggers: [
      "Passive tonal on an M48 towed array above threshold → USW-DSS tasked; barrier stays silent",
      "Overlapping bearings from multiple arrays cross-fix the contact → track opened at the LCS, still no emissions",
      "Track reaches firing-solution quality → lead M48 emits exactly one active confirmation ping",
      "Contact confirmed and CTF-72 weapons free → MH-60R launches from the LCS and drops a Mk 54 on the datum"
    ],
  },
  stateHierarchies: {
    default:          ["Payload", "Navigation", "Comms", "Mission", "Vehicle"],
    passive_hold:     ["Payload", "Mission", "Comms", "Navigation", "Vehicle"],
    confirm_ping:     ["Payload", "Mission", "Comms", "Navigation", "Vehicle"],
    prosecution:      ["Mission", "Payload", "Comms", "Navigation", "Vehicle"],
    emcon_degraded:   ["Navigation", "Payload", "Mission", "Vehicle", "Comms"],
  },
  createdAt: "2026-07-27T09:00:00Z",
  updatedAt: "2026-07-27T09:00:00Z",
  launchedAt: null,
  history: [
    { action: "created", timestamp: "2026-07-27T09:00:00Z",
      details: "Mission 03 — Theater ASW — LCS command node, 3× M48 passive barrier, single confirm ping, MH-60R Mk 54 prosecution (from pitch deck)" }
  ]
},
```

The `barrierGeometry.note` field exists so the UI can display the deck's own restraint: "Caliburn will not assert a figure it has not measured." A Navy audience notices when a vendor declines to fabricate a classified number, and it should survive into the product.

### 6.4 `missionRoles.js`

```js
THEATER_ASW: {
  missionLabel: 'Theater ASW — Distributed Passive Barrier',
  minVessels: 5,
  roles: [
    {
      roleKey: 'TASW_LCS',
      roleLabel: 'LCS Command Node',
      description: 'Freedom-class LCS fusing the passive picture. USW-DSS cross-fixes bearings from dispersed arrays into a single track, TempestOS classifies the acoustics, and the flight deck launches the prosecutor.',
      capabilities: [
        'TempestOS Core Platform', 'USW-DSS (AN/UYQ-100)', 'Link 16 Track Broadcast',
        'MILSATCOM Terminal', 'HiveLink SDR', 'NSYTE AI Maintenance System',
      ],
      allowedPlatformTypes: ['Ship'],
      defaultHullName: 'Freedom-class LCS',
      suggestedHullNames: ['Freedom-class LCS'],
      requirements: { categories: ['C2', 'COMMS'], subTypes: [] },
    },
    {
      roleKey: 'TASW_LEAD',
      roleLabel: 'Lead Array (M48 — Confirm Ping)',
      description: 'Lead M48 towing a passive MFTA and carrying CAPTAS-4 variable-depth sonar. Listens silent with the rest of the barrier, then emits exactly one active ping to nail the firing solution once the cross-fix holds.',
      capabilities: [
        'MFTA Towed Array', 'CAPTAS-4 Variable Depth Sonar',
        'EvoLogics Acoustic Modem', 'HiveLink SDR', 'SeaFIND Inertial Navigation',
      ],
      allowedPlatformTypes: ['USV'],
      defaultHullName: 'M48',
      suggestedHullNames: ['M48'],
      requirements: { categories: ['SENSORS', 'COMMS'], subTypes: ['SONAR_TOWED'] },
    },
    {
      roleKey: 'TASW_ARRAY_1',
      roleLabel: 'Passive Array (M48 — Bravo)',
      description: 'M48 towing a passive MFTA. Emits no acoustic energy at any point in the mission; contributes bearings only. Radio-frequency links stay under emission control discipline.',
      capabilities: [
        'MFTA Towed Array', 'Bistatic Cross-Fix Node',
        'EvoLogics Acoustic Modem', 'HiveLink SDR', 'SeaFIND Inertial Navigation',
      ],
      allowedPlatformTypes: ['USV'],
      defaultHullName: 'M48',
      suggestedHullNames: ['M48', 'Saildrone Surveyor'],
      requirements: { categories: ['SENSORS', 'COMMS'], subTypes: ['SONAR_TOWED'] },
    },
    {
      roleKey: 'TASW_ARRAY_2',
      roleLabel: 'Passive Array (M48 — Charlie)',
      description: 'Third passive array. Barrier length divided by array spacing gives hull count; spacing follows classified detection range and is set jointly with the government.',
      // as TASW_ARRAY_1
    },
    {
      roleKey: 'TASW_PROSECUTOR',
      roleLabel: 'Airborne Prosecutor (MH-60R)',
      description: 'MH-60R launched from the LCS flight deck once the contact is confirmed. AN/AQS-22 ALFS dipping sonar and sonobuoys refine the datum; a Mk 54 lightweight torpedo finishes it. The only crewed asset exposed, and only for the kill.',
      capabilities: [
        'AN/AQS-22 ALFS Dipping Sonar', 'Sonobuoys (DIFAR / DICASS)',
        'Mk 54 Lightweight Torpedo', 'Link 16 Track Broadcast',
      ],
      allowedPlatformTypes: ['Helicopter'],   // new platformType — see section 3.1a
      defaultHullName: 'MH-60R Seahawk',      // required: roleUtils matches exactly
      suggestedHullNames: ['MH-60R Seahawk'],
      requirements: { categories: ['SENSORS', 'WEAPONS'], subTypes: [] },
    },
  ],
},
```

### 6.5 Flow template

```js
THEATER_ASW: {
  name: "Theater ASW — Passive Barrier, Single Confirm, Airborne Kill",
  category: "COMBAT",
  subType: null,
  nodes: [
    { id: 'barrier',    type: 'trigger',          label: 'Barrier Established\n3× M48 Passive Arrays',  position: { x: 50,   y: 170 } },
    { id: 'listen',     type: 'sense',            label: 'Listen — Passive Only\nZero Acoustic Emission', position: { x: 250, y: 170 } },
    { id: 'tonal',      type: 'decision',         label: 'Tonal Above\nThreshold?',                     position: { x: 460,  y: 170 } },
    { id: 'crossfix',   type: 'orient',           label: 'USW-DSS Cross-Fix\nOverlapping Bearings',     position: { x: 670,  y: 170 } },
    { id: 'solution',   type: 'decision',         label: 'Firing-Solution\nQuality?',                   position: { x: 880,  y: 170 } },
    { id: 'ping',       type: 'action',           label: 'Lead M48 —\nExactly One Active Ping',         position: { x: 1090, y: 170 } },
    { id: 'weapons',    type: 'human_checkpoint', label: 'CTF-72 Weapons\nFree Authorization',          position: { x: 1090, y: 320 } },
    { id: 'launch_helo',type: 'action',           label: 'MH-60R Launches\nfrom LCS Flight Deck',       position: { x: 1300, y: 320 } },
    { id: 'prosecute',  type: 'action',           label: 'Mk 54 on Datum\nAirborne Kill',               position: { x: 1500, y: 320 } },
    { id: 'held',       type: 'end',              label: 'Barrier Held —\nHunters Never Localized',     position: { x: 1500, y: 170 } },
  ],
  connections: [
    { from: 'barrier',    to: 'listen' },
    { from: 'listen',     to: 'tonal' },
    { from: 'tonal',      to: 'crossfix',    label: 'Contact' },
    { from: 'tonal',      to: 'listen',      label: 'Clear' },
    { from: 'crossfix',   to: 'solution' },
    { from: 'solution',   to: 'ping',        label: 'Yes' },
    { from: 'solution',   to: 'crossfix',    label: 'Keep Listening — Stay Silent' },
    { from: 'ping',       to: 'weapons' },
    { from: 'weapons',    to: 'launch_helo', label: 'Weapons Free' },
    { from: 'weapons',    to: 'crossfix',    label: 'Hold — Continue Track' },
    { from: 'launch_helo',to: 'prosecute' },
    { from: 'prosecute',  to: 'held' },
  ],
  loopBack: { from: 'held', to: 'listen', label: 'Resume Passive Barrier' },
},
```

### 6.6 Mission view — `TheaterASWMissionView.jsx`

```js
const MISSION_SET_KEY = 'THEATER_ASW';

const MAP_CENTER  = [21.00, 121.65];
const MAP_ZOOM    = 7;
const MAP_ZOOM_IN = 8;

const LCS_POS     = [20.30, 120.95];  // command node, south-west of the barrier
const M48_LEAD    = [21.00, 121.60];  // lead array, centre of the barrier
const M48_BRAVO   = [21.60, 121.35];  // north array
const M48_CHARLIE = [20.45, 121.90];  // south array
const SUB_TRACK   = [[21.75, 122.30], [21.20, 121.75], [20.85, 121.45]];  // PLAN boat transit
const BARRIER_LINE= [[21.90, 121.20], [20.10, 121.95]];  // ~150 nm Taiwan-to-Luzon gap
```

| Tick | Milestone | Phase | On-map behavior |
|---|---|---|---|
| 0 to 8 | — | `idle` | Barrier line drawn; three M48s with trailing array lines; LCS to the south-west |
| 8 | `T_BARRIER` | `listening` | Array lines animate; each M48 shows an "EMCON — PASSIVE" badge |
| 22 | `T_TONAL` | `contact` | Submarine icon appears on its transit track; one dashed bearing line from the nearest M48 |
| 36 | `T_CROSSFIX` | `crossfixing` | Second and third bearings appear; the three bearings intersect and a track marker snaps to the intersection; badges stay "PASSIVE" |
| 52 | `T_PING` | `confirming` | A single expanding sonar ring from the lead M48, once, then gone. Its badge flips to "ACTIVE — 1 PING" and back to passive |
| 62 | `T_WEAPONS` | `authorizing` | Amber pulse on the LCS with a "CTF-72 Weapons Free" callout |
| 70 | `T_HELO` | `prosecuting` | MH-60R marker lifts from the LCS and flies to the datum; weapon drop animation |
| 88 | `T_COMPLETE` | `complete` | Contact removed; barrier resumes; M48 badges back to "PASSIVE" |

The one visual that must land: **exactly one sonar ring for the entire mission.** Everything else is silent. That single ring is the deck's argument, and if the animation loops rings or shows several, the mission's whole claim is undercut.

---

## 7. Mission 04 — Standoff MCM

> **Deck line:** "Open the water without a diver in it."

### 7.1 Concept as built

An LCS holds outside the minefield with no crew at risk. An MCM USV tows an AN/AQS-20C sonar across the field at standoff, hunting. Knifefish UUVs go below to localize and classify mines, buried or moored. A UISS influence sweep mimics a ship's signature to safely trigger sensitive mines. Barracuda one-shot neutralizers destroy confirmed mines. A cleared lane opens, and no crewed hull and no diver ever entered the field.

Distinct from the existing `MCM` mission, which is a Strait of Hormuz clearance using Freedom AUV and SubSeaSail HORUS under 5th Fleet. This one is the deck's chain: MCM USV, Knifefish, UISS, Barracuda, LCS outside the field.

### 7.2 `constants.js`

```js
{ key: 'STANDOFF_MCM', name: 'Standoff MCM', icon: Target, color: '#fb923c',
  description: 'LCS holds outside the field while an MCM USV hunts with AN/AQS-20C, Knifefish classifies below, UISS sweeps and Barracuda neutralizes — no diver in the water',
  domain: 'MARITIME' },

STANDOFF_MCM: { label: 'Minefield & Cleared Lane', color: '#fb923c', fillOpacity: 0.2,
  geometryType: 'zone',
  description: 'Draw the suspected minefield and the lane to be opened; the LCS station sits outside the boundary',
  domain: 'MARITIME' },
```

### 7.3 `missionsData.js`

```js
{
  id: "mission-standoffmcm-001",
  name: "Bashi-Channel-STANDOFF-MCM-Lane-Alpha",
  template: "STANDOFF_MCM",
  status: "draft",
  assignedSquadrons: ["sqdn_004"],
  domain: "MARITIME",
  zoneConfig: {
    name: "Bashi Channel — Suspected Minefield and Cleared Lane Alpha",
    coordinates: [
      { lat: 21.20, lng: 121.10 },
      { lat: 21.95, lng: 121.10 },
      { lat: 21.95, lng: 122.05 },
      { lat: 21.20, lng: 122.05 },
    ],
    swarmSize: 4,
    swarmFormation: "standoff-lane-clearance",
  },
  duration: "14d",
  missionProfile: {
    type: "STANDOFF_MCM",
    lane: "STANDOFF_CLEARANCE",
    collectionTypes: ["MINEHUNTING_SONAR", "SIDESCAN_SONAR", "EO_IR", "LINK16"],
    commsArchitecture: {
      primary: "Link 16 (MIDS-JTRS)",
      secondary: "HiveLink SDR mesh",
      tertiary: "Doodle Labs MANET / Peplink failover",
      groundStation: "7th Fleet MOC, Yokosuka",
      homeBase: "Freedom-class LCS (command node, stationed outside the minefield)"
    },
    objectives: {
      primary: "Open a cleared lane through the Bashi Channel by executing hunt, classify, sweep, and neutralize as a single tasked chain from outside the minefield, so no crewed hull and no diver ever enters the field",
      secondary: "Demonstrate that detect-to-neutralize can run at machine tempo as one sequence rather than as four systems with four operator workflows — the components are government-owned; the sequencing is the gap"
    },
    squadronComposition: {
      commandNode: "Freedom-class LCS — 1× — holds outside the minefield boundary; TempestOS sequences the chain; no crew at risk",
      hunter: "MCM USV — 1× — tows AN/AQS-20C minehunting sonar across the field at standoff from the mothership",
      classifier: "Knifefish UUV — 2× — low-frequency broadband sonar; localize and identify mines, buried or moored",
      sweep: "UISS influence sweep — 1× — mimics a ship's magnetic and acoustic signature to safely trigger sensitive mines",
      neutralizer: "Barracuda one-shot neutralizers — 4× — destroy confirmed mines; no divers"
    },
    threat: "Moored and buried influence mines emplaced across the Bashi Channel; a mine costing a few thousand dollars can sink a warship or close the strait. Legacy alternatives are four remaining Avenger-class hulls and a sundowning MH-53E detachment, both of which must enter the field to work.",
    whyThisConfig: "Mine countermeasures is measured by water opened per unit of time, not by the sophistication of the sweeper, and every legacy method must place ships or people inside the field. The Navy already owns the components: the MCM USV reached IOC in May 2023 and first deployed March 2025, Knifefish completed sea acceptance testing in June 2026, and Barracuda IOC is targeted for 2030. The unresolved problem is that detect-to-neutralize runs as four systems with four operator workflows. TempestOS sequences them as one tasked chain across the squadron.",
    escalationTriggers: [
      "MCM USV tows AN/AQS-20C across the assigned area → contacts logged and cued from standoff",
      "Contact cued → Knifefish tasked to localize and classify; buried or moored, identified below",
      "Sensitive-mine risk in the lane → UISS influence sweep mimics a ship signature to trigger it safely",
      "Mine confirmed → Barracuda neutralizer expended on the datum; lane advances, no diver enters the water"
    ],
  },
  stateHierarchies: {
    default:        ["Payload", "Navigation", "Comms", "Mission", "Vehicle"],
    hunt:           ["Payload", "Mission", "Navigation", "Comms", "Vehicle"],
    classify:       ["Payload", "Mission", "Comms", "Navigation", "Vehicle"],
    neutralize:     ["Mission", "Payload", "Comms", "Navigation", "Vehicle"],
    lane_transit:   ["Navigation", "Vehicle", "Payload", "Mission", "Comms"],
  },
  createdAt: "2026-07-27T09:00:00Z",
  updatedAt: "2026-07-27T09:00:00Z",
  launchedAt: null,
  history: [
    { action: "created", timestamp: "2026-07-27T09:00:00Z",
      details: "Mission 04 — Standoff MCM — LCS outside the field; MCM USV, Knifefish, UISS, Barracuda as one tasked chain (from pitch deck)" }
  ]
},
```

### 7.4 `missionRoles.js`

```js
STANDOFF_MCM: {
  missionLabel: 'Standoff MCM — Detect to Neutralize',
  minVessels: 4,
  roles: [
    {
      roleKey: 'SMCM_LCS',
      roleLabel: 'LCS Command Node (Outside the Field)',
      description: 'Freedom-class LCS holding station outside the minefield boundary. TempestOS sequences hunt, classify, sweep, and neutralize as one tasked chain, and resolves every vendor\'s contact and classification feed into a single picture.',
      capabilities: [
        'TempestOS Core Platform', 'Link 16 Track Broadcast', 'MILSATCOM Terminal',
        'HiveLink SDR', 'NSYTE AI Maintenance System',
      ],
      allowedPlatformTypes: ['Ship'],
      defaultHullName: 'Freedom-class LCS',
      suggestedHullNames: ['Freedom-class LCS'],
      requirements: { categories: ['C2', 'COMMS'], subTypes: [] },
    },
    {
      roleKey: 'SMCM_HUNTER',
      roleLabel: 'Hunter (MCM USV)',
      description: 'MCM USV towing the AN/AQS-20C minehunting sonar across the field at standoff from the mothership. Also carries the UISS influence sweep to trigger sensitive mines safely, and AN/DVS-1 COBRA for the beach and surf zone.',
      capabilities: [
        'AN/AQS-20C Towed Minehunting Sonar', 'Unmanned Influence Sweep System (UISS)',
        'AN/DVS-1 COBRA Coastal Recon', 'HiveLink SDR', 'SeaFIND Inertial Navigation',
        'Marine AI Guardian Vision CVP',
      ],
      allowedPlatformTypes: ['USV'],
      defaultHullName: 'MCM USV',
      suggestedHullNames: ['MCM USV', 'M48', 'Mariner'],
      requirements: { categories: ['SENSORS', 'COMMS'], subTypes: ['SONAR_TOWED', 'MCM_SWEEP'] },
    },
    {
      roleKey: 'SMCM_CLASSIFIER',
      roleLabel: 'Classifier (Knifefish UUV)',
      description: 'Knifefish UUV working below the surface to localize and identify mines, buried or moored, using low-frequency broadband sonar. Sea acceptance testing completed June 2026.',
      capabilities: [
        'Knifefish LFBB Mine ID Sonar', 'EvoLogics Acoustic Modem',
        'SeaFIND Inertial Navigation',
      ],
      allowedPlatformTypes: ['UUV'],
      defaultHullName: 'Knifefish',
      suggestedHullNames: ['Knifefish', 'Freedom AUV', 'Manta Ray'],
      requirements: { categories: ['SENSORS', 'COMMS'], subTypes: ['SONAR_SIDESCAN'] },
    },
    {
      roleKey: 'SMCM_NEUTRALIZER',
      roleLabel: 'Neutralizer (Barracuda)',
      description: 'Barracuda one-shot neutralizers expended against confirmed mines. No diver enters the water. IOC is targeted for 2030 — this role is deliberately marked as not yet fielded.',
      capabilities: [
        'Barracuda Mine Neutralizer', 'EvoLogics Acoustic Modem',
        'SeaFIND Inertial Navigation',
      ],
      allowedPlatformTypes: ['UUV', 'USV'],
      defaultHullName: 'Knifefish',
      suggestedHullNames: ['Knifefish', 'Freedom AUV'],
      requirements: { categories: ['SENSORS', 'COMMS'], subTypes: ['MCM_NEUTRALIZER'] },
    },
  ],
},
```

### 7.5 Flow template

```js
STANDOFF_MCM: {
  name: "Standoff MCM — One Chain, No Diver",
  category: "DEFENSE",
  subType: null,
  nodes: [
    { id: 'standoff',   type: 'trigger',  label: 'LCS On Station\nOutside the Minefield',      position: { x: 50,   y: 170 } },
    { id: 'hunt',       type: 'sense',    label: 'Hunt — MCM USV Tows\nAN/AQS-20C at Standoff', position: { x: 250, y: 170 } },
    { id: 'contact',    type: 'decision', label: 'Sonar\nContact?',                            position: { x: 470,  y: 170 } },
    { id: 'classify',   type: 'orient',   label: 'Knifefish Localizes\n& Classifies Below',     position: { x: 680,  y: 170 } },
    { id: 'is_mine',    type: 'decision', label: 'Mine\nConfirmed?',                            position: { x: 890,  y: 170 } },
    { id: 'sweep',      type: 'action',   label: 'UISS Influence Sweep\nMimics Ship Signature', position: { x: 890,  y: 330 } },
    { id: 'neutralize', type: 'action',   label: 'Barracuda Neutralizes\nNo Diver in the Water', position: { x: 1100, y: 170 } },
    { id: 'lane_clear', type: 'decision', label: 'Lane\nComplete?',                             position: { x: 1310, y: 170 } },
    { id: 'opened',     type: 'end',      label: 'Cleared Lane Opened —\nNo Hull, No Diver in the Field', position: { x: 1520, y: 170 } },
  ],
  connections: [
    { from: 'standoff',   to: 'hunt' },
    { from: 'hunt',       to: 'contact' },
    { from: 'contact',    to: 'classify',   label: 'Contact Logged' },
    { from: 'contact',    to: 'hunt',       label: 'Clear Water' },
    { from: 'classify',   to: 'is_mine' },
    { from: 'is_mine',    to: 'neutralize', label: 'Confirmed' },
    { from: 'is_mine',    to: 'sweep',      label: 'Sensitive / Uncertain' },
    { from: 'sweep',      to: 'lane_clear', label: 'Triggered Safely' },
    { from: 'neutralize', to: 'lane_clear' },
    { from: 'lane_clear', to: 'opened',     label: 'Yes' },
    { from: 'lane_clear', to: 'hunt',       label: 'Continue — Next Segment' },
  ],
  loopBack: { from: 'opened', to: 'hunt', label: 'Next Lane' },
},
```

### 7.6 Mission view — `StandoffMCMMissionView.jsx`

```js
const MISSION_SET_KEY = 'STANDOFF_MCM';

const MAP_CENTER  = [21.55, 121.55];
const MAP_ZOOM    = 8;
const MAP_ZOOM_IN = 9;

const LCS_POS     = [21.05, 120.85];  // outside the minefield boundary — this matters
const MINEFIELD    = [[21.25, 121.20], [21.90, 121.20], [21.90, 122.00], [21.25, 122.00]];
const LANE_START  = [21.30, 121.30];
const LANE_END    = [21.85, 121.90];
const MINE_POSITIONS = [
  [21.42, 121.44], [21.55, 121.58], [21.63, 121.71], [21.74, 121.82],
];
```

| Tick | Milestone | Phase | On-map behavior |
|---|---|---|---|
| 0 to 8 | — | `idle` | Minefield drawn as a hatched orange polygon; LCS marker clearly outside it, labeled "No Crew at Risk" |
| 8 | `T_STANDOFF` | `standoff` | Lane corridor drawn as a dashed line through the field |
| 20 | `T_HUNT` | `hunting` | MCM USV enters the field along the lane with a towed-sonar swath sweeping behind it; mine icons reveal as `?` unknown contacts as the swath passes |
| 40 | `T_CLASSIFY` | `classifying` | Knifefish descends beneath each `?` contact; icons resolve to confirmed mine or clear |
| 56 | `T_SWEEP` | `sweeping` | UISS trail behind the MCM USV; one sensitive mine triggers and clears |
| 66 | `T_NEUTRALIZE` | `neutralizing` | Barracuda tracks run to each confirmed mine; each detonates and its icon clears |
| 84 | `T_COMPLETE` | `complete` | Lane renders solid green "CLEARED"; a persistent counter reads "Crewed hulls in the field: 0 · Divers in the water: 0" |

That final counter is the whole mission in two numbers. It should be on screen from tick 0, not just at the end.

---

## 8. Cross-cutting work

### 8.0 The `Autonomous Strike Group` filter

All five Autonomy Mission Series missions must be filterable together under a single category named **Autonomous Strike Group**.

The mechanism for this already exists and needs one array entry. `MissionConfigView.jsx` lines 126 to 140 define `NAVY_GROUPS`:

```js
const [navyGroup, setNavyGroup] = useState('ALL');

const NAVY_GROUPS = [
  { key: 'ALL',      label: 'All Missions' },
  { key: 'PAE_RAS',  label: 'PAE RAS',              keys: [...] },
  { key: 'FLEET',    label: '5th & 7th Fleet',      keys: [...] },
  { key: 'OTHER',    label: 'Other',                keys: ['PORT_SECURITY'] },
  { key: 'SEA_JEEP', label: 'Sea Jeep',             keys: [...] },
  { key: 'JMN',      label: 'JMN — Shield & Spear', keys: [...] },
];
```

Add one entry, following the additive pattern the `SEA_JEEP` and `JMN` groups already established (they are commented in the file as "Additive only — references existing template keys without modifying the groups above"):

```js
// ─── Autonomous Strike Group — the five-mission Autonomy Mission Series ───────
// Additive only. Mission numbers follow the pitch-deck series, 01 through 05.
{ key: 'AUTONOMOUS_STRIKE_GROUP', label: 'Autonomous Strike Group',
  keys: [
    'MAGAZINE_DEPTH',                  // 01
    'CONTESTED_LOGISTICS_MOTHERSHIP',  // 02
    'THEATER_ASW',                     // 03
    'STANDOFF_MCM',                    // 04
    'MDA_MOTHERSHIP',                  // 05 — already built
  ] },
```

That is the entire change. Nothing else needs touching:

- The filter itself (`MissionConfigView.jsx` lines 304 to 308) reads `NAVY_GROUPS` generically: `activeGroup?.keys` then `domainMissions.filter(m => activeGroup.keys.includes(m.key))`.
- The desktop pill buttons (lines 465 to 481) and the mobile `<select>` (lines 455 to 464) both iterate `NAVY_GROUPS`.
- `handleDomainChange` (line 257) resets `navyGroup` to `'ALL'` on a domain tab click, which is the correct existing behavior.

**One hard prerequisite.** The group filter at line 306 is gated on `selectedDomain === 'MARITIME'`. All five missions must carry `domain: 'MARITIME'` in their `KEY_MARITIME_MISSIONS` entry, or they never reach `domainMissions` and the group renders empty. Every mission in this plan is specced as MARITIME, so this holds — but it is the one thing that would silently break the filter.

**Ordering note.** `filteredMissions` preserves `KEY_MARITIME_MISSIONS` array order, so grouping the five series missions contiguously at the top of that array (section 8.4) also makes them display in deck order 01 through 05 inside this filter. The two changes reinforce each other.

Do not build this on `missionCategories` in `marketplaceData.js` lines 5362 to 5370. That object is defined, exported in the default bag, and imported by nothing. It is dead.

### 8.2 Squadron records — two arrays, and this plan must use the right one

There are two squadron lists and they disagree:

- `squadrons` in `marketplaceData.js` line 4515 has **four** entries, `sqdn_001` through `sqdn_004`. `sqdn_004` there is "Logistics Automation Squadron."
- `swarmSquadrons` in `fleetData.js` line 22 has **24** entries and is the live data: it seeds `squadronStore` and feeds `SquadronAssignment.jsx` and `MissionMatrix.jsx`. `sqdn_004` there is "SubSeaSail Horus" and `sqdn_016` is "Magnet Defense M48."

`sqdn_016` does **not** exist in the `marketplaceData` list. That matters because `MissionLibrary.jsx` line 268 resolves `assignedSquadrons` against `marketplaceData.squadrons` and renders `null` on a miss, so a mission tagged `sqdn_016` shows a blank squadron chip in the Mission Library. Five existing missions already have this problem.

Two further issues to resolve before assigning squadrons in the four new mission records:

1. **No LCS squadron exists in either list.** Every one of these four missions has a Freedom-class LCS command node. The closest existing entry is `sqdn_031`, "Lewis B. Puller Class ESB." Recommend creating an LCS squadron in `swarmSquadrons` and mirroring it into `marketplaceData.squadrons` so the Library chip resolves.
2. **Decide which array is authoritative** and either sync them or make `MissionLibrary` read from `swarmSquadrons`. Leaving two divergent lists guarantees more blank chips. Out of scope to fix here, but the four new missions should not add to the pile: use squadron ids that exist in **both** arrays, or add the new squadron to both.

### 8.3 Shared narrative elements

All four decks share the "THE ORCHESTRATION LAYER — What TempestOS is" slide almost verbatim: mission autonomy, open interfaces, one fused picture, denied comms. Rather than repeating that prose in four mission records, put it once in a shared constant and reference it from each mission view's info panel.

Likewise all four share "THE ASK": one hull, one operating period, interface documentation, a test window, range access, and an RMF authorization path, judged against criteria set in advance. Only the metric changes per mission:

| Mission | How it is judged |
|---|---|
| 01 Magazine Depth | Time from track to launch on remote; magazine cycle time without moving the command node |
| 02 Contested Logistics | Transfer evolutions completed per hull per day; the sea state at which they stop |
| 03 Theater ASW | Barrier length held per hull; time from first bearing to a cross-fixed firing solution |
| 04 Standoff MCM | Area clearance rate in square nautical miles per day; hours from detection to neutralization |

Worth surfacing these in the mission view as a "success criteria" panel. The decks close on them, and a program office reviewer will look for them.

### 8.4 Mission ordering in the UI

`KEY_MARITIME_MISSIONS` currently has 19 entries and grows to 23. The Autonomy Mission Series is numbered 01 to 05 and the decks lean on that numbering. Group the five series missions at the top of the array in deck order, with a comment marking the block.

This is not only cosmetic. `filteredMissions` in `MissionConfigView.jsx` preserves array order, so contiguous top-of-array placement is what makes the `Autonomous Strike Group` filter (section 8.0) display 01 through 05 in sequence rather than in whatever order the entries happen to sit. Do these two changes together.

---

## 9. Build sequence

Ordered so nothing is ever blocked, and so there is something demonstrable early.

| Phase | Work | Why here |
|---|---|---|
| 0 | Resolve the open items in section 11 | Cheap to decide, expensive to discover mid-build. |
| 1 | `Helicopter` platform type plumbing (section 3.1a) | Six files, none of them mission-specific. Doing it before the MH-60R hull exists means the hull works the moment it lands, instead of appearing to be broken. |
| 2 | Catalog additions: hulls, hull images, hull SVGs and mount points, capabilities, new subTypes (section 3) — reusing existing entries per the table in 3.2 | Everything else references these names. Doing this first means no placeholder strings to clean up. |
| 3 | LCS squadron record in both squadron arrays (section 8.2) | All four missions reference it. One small addition unblocks four mission records. |
| 4 | Mission 04 Standoff MCM, end to end | Cleanest mission: linear chain, no human-authorization subtlety, entirely new components so no risk of colliding with the existing MCM mission. Proves the seven-file pattern. |
| 5 | Mission 03 Theater ASW | Reuses most of its capabilities from the existing catalog, so it tests the "reuse rather than duplicate" path. First mission to exercise the `Helicopter` platform type end to end. |
| 6 | Mission 01 Magazine Depth | Highest-stakes narrative and the only one with a human-authorization checkpoint driving both the flow and the view. Worth doing once the pattern is proven twice. |
| 7 | Mission 02 Contested Logistics | Route geometry rather than area, three parallel cargo roles, and a dependency on Mission 01 for the Mk 70 reload story. Last so that dependency already exists. |
| 8 | `Autonomous Strike Group` filter entry (section 8.0) and mission ordering (section 8.4) | One array entry, but it needs all five template keys to exist first. |
| 9 | Cross-cutting: shared orchestration and success-criteria panels (section 8.3) | Polish that touches all five and is cheapest once all five exist. |
| 10 | Verification (section 10) | — |

---

## 10. Verification

Before calling any mission done:

1. **Names resolve.** Every string in a role's `capabilities` array matches an entry in `individualCapabilities` exactly, and every `defaultHullName` and `suggestedHullNames` entry matches a `vesselHullData` name exactly. A typo here fails silently: the readiness checklist and swap modal simply show nothing. Grep each one. Case matters — `Mk 54` not `MK 54` is exactly the class of error that got through the first draft of this plan.
2. **No shadowed duplicates.** No capability name appears twice in `individualCapabilities`. A duplicate is not an error, it is dead data: both lookups use `.find()` and return the first match forever.
3. **Hull images exist.** Every hull named in a roster **or a suggestion list** has a `HULL_IMAGES` entry and a real PNG behind it. `SwapVesselModal` excludes image-less hulls outright.
4. **Squadron ids resolve in both arrays.** Every `assignedSquadrons` id exists in `swarmSquadrons` (fleetData) and in `squadrons` (marketplaceData), or the Mission Library renders a blank chip.
5. **Requirements are satisfiable.** For each role, confirm that at least one capability in the catalog maps to each required slot key via `CAP_CATEGORY_TO_SLOT`, and that each required `subType` exists on at least one capability **that the role actually lists**. The trap: `Bistatic Cross-Fix Node` looks like it should satisfy `SONAR_TOWED` and does not, because its subType is `null`.
6. **SWaP fits, including on the default hull.** Sum `swap.weight` and `swap.power` across each role's capability list and check against the hull's `capacity`. Check the default hull first — the original draft of this plan put a 900 kg CEC terminal on a 318 kg MQ-8C. Then check every entry in `suggestedHullNames`, because an ineligible suggestion sorts to the bottom of the swap modal and reads as a bug.
7. **Flow renders.** Every `connections` entry references node ids that exist, and every node `type` is a key in `nodeTypes` (`constants.js`). Valid types: `trigger`, `sense`, `observe`, `orient`, `decide`, `decision`, `action`, `human_checkpoint`, `end`. A dangling id breaks the diagram render.
8. **Zone geometry is a real type.** `geometryType` must be one of `zone`, `route`, `perimeter`, `target`, `station`, `orbit`, `track`. An invented value falls through to polygon behavior silently rather than erroring, so this will not be caught at runtime.
9. **View routes.** Each mission opens its own view from both entry paths: selecting the mission template fresh, and opening the saved mission record from the Mission Library.
10. **Lint and build.** `npm run lint` clean, `npm run build` clean. Prior commits in this repo show Vercel builds failing on ESLint errors, so this is not optional.
11. **Deck traceability.** For each mission, walk its 11 slides and confirm every claimed platform, payload, and metric appears somewhere in the mission record, roster, or view. Where the deck declines to assert a number (ASW array spacing), confirm the product declines too.
12. **Existing missions untouched.** Confirm `KINETIC_EFFECTS`, `CONTESTED_LOGISTICS`, `ASW`, and `MCM` render and deploy exactly as before. Diff `missionsData.js` to confirm only additions.
13. **The `Autonomous Strike Group` filter works.** Select it in the Maritime tab and confirm exactly five missions appear, in deck order 01 through 05. Confirm each of the five carries `domain: 'MARITIME'` — the group filter is gated on that and fails silently otherwise.
14. **The MH-60R is visible everywhere it should be.** It appears in the Shipyard HANGAR tab, is offered in `SwapVesselModal` against the Theater ASW prosecutor role, is selectable in the `CapabilitiesView` vessel dropdown, and renders sane stat bars in `LoadoutStats`. Confirm it is **not** offered as a swap for a surface hull.

---

## 11. Open items needing a decision

**Decided (do not re-litigate):**

- Four new deck-aligned missions; existing `KINETIC_EFFECTS`, `CONTESTED_LOGISTICS`, `ASW`, `MCM` untouched.
- Catalog additions in scope; reuse existing entries per the table in 3.2.
- Magazine Depth is LCS-centric: LCS command node holds launch authority and its own cells; M48s carry and fire for added depth. No DDG.
- MH-60R gets a new `Helicopter` platform type, not `UAV`. Section 3.1a.
- The Mission Matrix is dead code and out of scope entirely. No `missionTags`, no `platformTypes` migration. Section 2.
- Filtering is via a new `Autonomous Strike Group` entry in `NAVY_GROUPS`. Section 8.0.

**Still open:**

1. **Hull images and SVGs for MCM USV, Knifefish, and MH-60R Seahawk.** Do these exist in `Mission Bay Backend/Mission Bay Images`, or is this an asset request? Each also needs a `VesselHulls.jsx` SVG plus `vesselMountPoints` entries. Worth adding the three missing existing images (HSMUSV, Manta Ray, Lewis B. Puller Class ESB) while in the file. Sections 3.1, 3.4.
2. **LCS squadron.** Create one, and mirror it into both squadron arrays? Section 8.2. All four missions need it.
3. **Aerial stat baselines.** Do `aerialBaselines` (`vesselData.js` line 84) produce sane bars for a helicopter, or do they need widening? Section 3.1a item 4.
4. **Barracuda TRL honesty.** The deck says IOC 2030, not fielded. Confirm the catalog should carry TRL 6 and a "not yet fielded" note rather than presenting it as available.
5. **Mission 01 to Mission 02 coupling.** Magazine Depth's sustainment step and Contested Logistics' magazine run describe the same event from two sides. Should the two mission records cross-reference each other by id, or stay independent?

---

## 12. Verification record

This plan was checked against the codebase after drafting. Seven problems were found and corrected in place; they are listed here because each one is a pattern likely to recur during the build.

| Found | Correction |
|---|---|
| `Mk 70 Payload Delivery System` and `Bistatic Cross-Fix Node` already exist; the plan proposed creating them again. Duplicate names become dead data, since both lookups use `.find()`. | Section 3.2 rewritten around a reuse table. |
| `Thales MFTA Towed Array` and `MK 54 Lightweight Torpedo` resolve to nothing. Actual names: `MFTA Towed Array`, `Mk 54 Lightweight Torpedo`. | Corrected in sections 6.4 and 3.2. |
| SM-6, Tomahawk, and both TEU cargo modules already exist under different names, with an existing `CARGO_MODULE` subType. | Reused; the proposed `CARGO_FUEL` and `CARGO_DRY` subTypes dropped. |
| `MAGDEP_SENSOR` put a 900 kg CEC terminal on an MQ-8C with 318 kg capacity — the role would have failed SWaP on its own default hull. | CEC removed from the aircraft; default hull changed to MQ-4C Triton. Section 4.4. |
| Several `suggestedHullNames` were far too small for their roles (AEGIR-F at 50 kg against a 20,000 kg cargo role), producing ineligible entries that read as bugs. | Suggestion lists narrowed to hulls that actually pass. |
| `sqdn_016` does not exist in `marketplaceData.squadrons`, and no LCS squadron exists in either array. | Section 8.2 rewritten; LCS squadron added as phase 2 of the build. |
| `platformTypes` is missing from all 157 capabilities, so the Mission Matrix is empty for every mission. | Moot — the matrix turned out to be dead code (render site commented out in `MarketplacePage.jsx`) and was removed from scope entirely. |
| `geometryType: 'barrier'` is not a valid value and would fall through to polygon behavior silently. | Changed to `zone`, following the existing `THREAT_CHARACTERIZATION` precedent. |
| Adding a `Helicopter` platform type touches six files, not one. A value in neither the aerial nor maritime bucket disappears from the Shipyard and swap modal silently. | New section 3.1a with the full edit list; promoted to phase 1 of the build. |
| The plan proposed inventing a grouping mechanism; `NAVY_GROUPS` in `MissionConfigView.jsx` already does exactly this. | Section 8.0 rewritten as a one-entry addition to the existing array. |

Confirmed correct as drafted: no template key collisions; all 12 referenced existing hull names exact; all eight flow node types valid; the slot-key table in section 2 accurate, including `AI` and `UTILITY` as real slot keys; the M48 SWaP headroom for the shooter role comfortable on both weight and power.

Two incidental findings, out of scope but worth tickets: `LoadoutBuilder.jsx` lines 1219 to 1250 and 1563 to 1594 are near-identical duplicated blocks, so any role-matching change must be applied twice; and `KINETIC_EFFECTS / KE_M48_STRIKE` is labeled M48 while its `defaultHullName` is `AEGIR-H`, whose 3,000 kg capacity makes the role permanently SWaP-ineligible.
