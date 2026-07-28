/**
 * Mission role definitions for all 10 mission views.
 * Each mission has one or more roles. Each role defines:
 *   - roleKey: unique identifier used in missionStore.roleAssignments
 *   - roleLabel: human-readable role name shown in outfitter
 *   - description: what this role does
 *   - capabilities: string[] of capability names from individualCapabilities (real SWaP-bearing ones)
 *   - defaultHullName: the vessel used by default in the mission view (must match vesselHullData[].name)
 *   - missionKey: matches MISSION_SET_KEY in the mission view
 *   - missionLabel: display name for the mission
 *
 * Source of truth for capabilities: MISSION_SET_CAPS in each mission view file.
 * Additional per-role caps are included when they clearly map to marketplace entries.
 * Narrative/display-only strings (e.g. 'Bistatic Cross-Fix Node', 'IFF Negative Alert',
 * 'Sprint & Drift Transit') are excluded — runtime will skip any cap not found in
 * individualCapabilities, but we keep the list clean here.
 */

export const MISSION_ROLES = {

  // ─── ASW — Philippine Sea ─────────────────────────────────────────────────────
  // MISSION_SET_KEY = 'ASW'
  // MISSION_SET_CAPS = ['CAPTAS-4 Variable Depth Sonar', 'USW-DSS (AN/UYQ-100)', 'HiveLink SDR', 'Link 16 Track Broadcast',
  //                     'MFTA Towed Array', 'EvoLogics Acoustic Modem', 'Mk 54 Lightweight Torpedo']
  //
  // VESSEL_ROSTER order: [M48-ALPHA (lead), M48-BRAVO, M48-CHARLIE, MQ-8C Fire Scout]
  // roles[] must match that order so effectiveRoster positional mapping is correct.
  ASW: {
    missionLabel: 'ASW — Philippine Sea',
    minVessels: 3,
    roles: [
      {
        roleKey: 'ASW_ALPHA',
        roleLabel: 'Lead Passive Array (ALPHA)',
        description: 'Silent lead hunter and C2 hub. Tows the CAPTAS-4 array in passive mode during the search, then emits a single active confirmation ping only after the multistatic cross-fix holds a fire-control track. Broadcasts the common ASW picture via Link 16.',
        capabilities: [
          'CAPTAS-4 Variable Depth Sonar',
          'USW-DSS (AN/UYQ-100)',
          'HiveLink SDR',
          'Link 16 Track Broadcast',
        ],
        // CAPTAS-4 is a large tow system — only medium-large surface vessels
        allowedPlatformTypes: ['USV'],
        defaultHullName: 'M48',
        suggestedHullNames: ['M48', 'AEGIR-H', 'ZeroUSV Oceanus17'],
        requirements: {
          categories: ['SENSORS', 'COMMS', 'C2'],
          subTypes: ['SONAR_TOWED'],
        },
      },
      {
        roleKey: 'ASW_BRAVO',
        roleLabel: 'Passive Receiver (BRAVO)',
        description: 'Silent passive MFTA towed array in multistatic geometry SE of ALPHA. Holds the submarine on tonals, computes the cross-fix, and relays the fire-control track over Link 16 for airborne prosecution — no active emissions, no organic weapon.',
        capabilities: [
          'MFTA Towed Array',
          'USW-DSS (AN/UYQ-100)',
          'HiveLink SDR',
          'Link 16 Track Broadcast',
          'EvoLogics Acoustic Modem',
          'Bistatic Cross-Fix Node',
        ],
        allowedPlatformTypes: ['USV'],
        defaultHullName: 'M48',
        suggestedHullNames: ['M48', 'AEGIR-H', 'ZeroUSV Oceanus17'],
        requirements: {
          categories: ['SENSORS', 'COMMS', 'C2'],
          subTypes: ['SONAR_TOWED'],
        },
      },
      {
        roleKey: 'ASW_CHARLIE',
        roleLabel: 'Passive Receiver (CHARLIE)',
        description: 'Silent passive MFTA towed array in multistatic geometry NE of ALPHA. Completes the cross-fix triangle and provides an independent passive track to the airborne prosecutor — no active emissions, no organic weapon.',
        capabilities: [
          'MFTA Towed Array',
          'USW-DSS (AN/UYQ-100)',
          'HiveLink SDR',
          'Link 16 Track Broadcast',
          'EvoLogics Acoustic Modem',
          'Bistatic Cross-Fix Node',
        ],
        allowedPlatformTypes: ['USV'],
        defaultHullName: 'M48',
        suggestedHullNames: ['M48', 'AEGIR-H', 'ZeroUSV Oceanus17'],
        requirements: {
          categories: ['SENSORS', 'COMMS', 'C2'],
          subTypes: ['SONAR_TOWED'],
        },
      },
      {
        roleKey: 'ASW_HELO',
        roleLabel: 'Airborne Prosecutor (MQ-8C)',
        description: 'MQ-8C Fire Scout unmanned helicopter held on the CSG deck until the passive track is confirmed and CTF-72 authorizes weapons free. Vectored to the datum via Link 16, it delivers a Mk 54 lightweight torpedo onto the submarine — the shooter is decoupled from the silent sensor line.',
        capabilities: [
          'Mk 54 Lightweight Torpedo',
          'Link 16 Track Broadcast',
        ],
        allowedPlatformTypes: ['UAV'],
        defaultHullName: 'MQ-8C Fire Scout',
        suggestedHullNames: ['MQ-8C Fire Scout'],
        requirements: {
          categories: ['KINETIC WEAPONS', 'COMMS'],
          subTypes: ['STRIKE_WEAPON'],
        },
      },
    ],
  },

  // ─── MDA MOTHERSHIP — First Island Chain ──────────────────────────────────────
  // MISSION_SET_KEY = 'MDA_MOTHERSHIP'
  // VESSEL_ROSTER order: [LCS (mothership), MQ-8C (air), M48 (surface), Freedom AUV (subsurface)]
  MDA_MOTHERSHIP: {
    missionLabel: 'MDA Mothership — First Island Chain',
    minVessels: 4,
    roles: [
      {
        roleKey: 'MDAM_LCS',
        roleLabel: 'LCS Mothership',
        description: 'Freedom-class LCS as the launch, recovery, and fusion node. Runs TempestOS to fuse every layer into one common operating picture and pushes it to the joint force over Link 16 and BLOS SATCOM.',
        capabilities: [
          'TempestOS Core Platform',
          'MILSATCOM Terminal',
          'Link 16 Track Broadcast',
          'HiveLink SDR',
          'FMD AutoHook',
          'NSYTE AI Maintenance System',
        ],
        allowedPlatformTypes: ['Ship'],
        defaultHullName: 'Freedom-class LCS',
        suggestedHullNames: ['Freedom-class LCS'],
        requirements: {
          categories: ['COMMS'],
          subTypes: [],
        },
      },
      {
        roleKey: 'MDAM_AIR',
        roleLabel: 'Air Layer (Switchblade)',
        description: 'AeroVironment Switchblade tube-launched from the deck for expendable over-the-horizon ISR. Integrated EO/IR with onboard perception; contacts relay back to the mothership. Cheap, attritable eyes — no recovery cycle to manage.',
        capabilities: [
          'Marine AI Guardian Vision CVP',
          'HiveLink SDR',
        ],
        allowedPlatformTypes: ['UAV'],
        defaultHullName: 'Switchblade',
        suggestedHullNames: ['Switchblade', 'MQ-8C Fire Scout'],
        requirements: {
          categories: ['SENSORS', 'COMMS'],
          subTypes: [],
        },
      },
      {
        roleKey: 'MDAM_SURFACE',
        roleLabel: 'Surface Layer (M48)',
        description: 'M48 USV operating alongside the LCS to widen the surface net. Radar and EO/IR build the surface track picture, MarineAI perception classifies contacts, and a DPI Vulture tethered UAS gives the hull an elevated mast for enormous sensor range.',
        capabilities: [
          'Maritime Surface/Air Search Radar',
          'Teledyne FLIR EO/IR Turret',
          'DPI Vulture Tethered UAS',
          'Marine AI Guardian Vision CVP',
          'SeaFIND Inertial Navigation',
          'HiveLink SDR',
        ],
        allowedPlatformTypes: ['USV'],
        defaultHullName: 'M48',
        suggestedHullNames: ['M48', 'AEGIR-W', 'ZeroUSV Oceanus17'],
        requirements: {
          categories: ['SENSORS', 'COMMS'],
          subTypes: [],
        },
      },
      {
        roleKey: 'MDAM_SUB',
        roleLabel: 'Subsurface Layer (UUV)',
        description: 'Freedom AUV extending awareness into the water below. Passive acoustic sensing detects subsurface contacts and relays tracks to the LCS on surfacing/comms windows.',
        // NB: the 1,800 kg ESM/SIGINT module was removed — Freedom AUV capacity is
        // 500 kg, so the role failed SWaP on its own default hull (pre-existing bug).
        capabilities: [
          'Passive Sonar Track Relay',
        ],
        allowedPlatformTypes: ['UUV'],
        defaultHullName: 'Freedom AUV',
        suggestedHullNames: ['Freedom AUV', 'VATN S6'],
        requirements: {
          categories: ['SENSORS'],
          subTypes: [],
        },
      },
    ],
  },

  // ─── MAGAZINE DEPTH — Mission 01 — Luzon Strait (Autonomy Mission Series) ─────
  // MISSION_SET_KEY = 'MAGAZINE_DEPTH'
  // VESSEL_ROSTER order: [LCS (command node), M48 (shooter Alpha), M48 (shooter Bravo), MQ-4C (sensor)]
  // NB: CEC (900 kg) stays OFF the aircraft — MQ-8C capacity is 318 kg. The air node
  // contributes tracks over Link 16; CEC terminals live on the LCS and the shooters.
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
        requirements: {
          categories: ['C2', 'COMMS'],
          subTypes: ['FIRE_CONTROL_NET'],
        },
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
        requirements: {
          categories: ['WEAPONS', 'COMMS'],
          subTypes: ['STRIKE_WEAPON'],
        },
      },
      {
        roleKey: 'MAGDEP_SHOOTER_2',
        roleLabel: 'Forward Shooter (M48 — Bravo)',
        description: 'Second forward M48 with an identical Mk 70 loadout. Depth is added by adding hulls: two shooters double the forward cell count without moving the command node.',
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
        requirements: {
          categories: ['WEAPONS', 'COMMS'],
          subTypes: ['STRIKE_WEAPON'],
        },
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
        requirements: {
          categories: ['SENSORS', 'COMMS'],
          subTypes: [],
        },
      },
    ],
  },

  // ─── CONTESTED LOGISTICS — Mission 02 — Luzon Strait (Autonomy Mission Series) ─
  // MISSION_SET_KEY = 'CONTESTED_LOGISTICS_MOTHERSHIP'
  // VESSEL_ROSTER order: [LCS (logistics node), M48 (fuel), M48 (cargo), M48 (magazine)]
  // Three deliberately separate cargo roles — "swap the payload, not the platform"
  // made visible in the roster. Fuel and cargo share the existing CARGO_MODULE
  // subType and differ by the module in role.capabilities; only the magazine run
  // carries the new CARGO_MAGAZINE subType.
  CONTESTED_LOGISTICS_MOTHERSHIP: {
    missionLabel: 'Contested Logistics — LCS Sustainment Node',
    minVessels: 4,
    roles: [
      {
        roleKey: 'CLM_LCS',
        roleLabel: 'LCS Logistics Node',
        description: 'Freedom-class LCS held behind the manned stand-off line. Loads the modules, assigns each M48 a run by mission order, and resolves load, position, and health from every hull into one picture.',
        capabilities: [
          'TempestOS Core Platform',
          'MILSATCOM Terminal',
          'Link 16 Track Broadcast',
          'HiveLink SDR',
          'Autonomous Cargo Handling System',
          'NSYTE AI Maintenance System',
        ],
        allowedPlatformTypes: ['Ship'],
        defaultHullName: 'Freedom-class LCS',
        suggestedHullNames: ['Freedom-class LCS', 'Lewis B. Puller Class ESB'],
        // No C2 requirement — the logistics node orchestrates via TempestOS and
        // comms; it carries no C2-category capability and shouldn't demand one.
        requirements: {
          categories: ['COMMS', 'UTILITY'],
          subTypes: [],
        },
      },
      {
        roleKey: 'CLM_FUEL',
        roleLabel: 'Fuel Run (M48)',
        description: 'M48 carrying ISO fuel modules forward to a combatant on station or a Remote Operating Site. Bladders and ISO tanks; the container is not the hard part, the autonomous transfer is.',
        capabilities: [
          '20-ft TEU Fuel Bladder Module',
          'Autonomous Cargo Handling System',
          'Maritime Surface/Air Search Radar',
          'Teledyne FLIR EO/IR Turret',
          'Marine AI Guardian Vision CVP',
          'SeaFIND Inertial Navigation',
          'HiveLink SDR',
          'Nulka Active Missile Decoy',
        ],
        allowedPlatformTypes: ['USV'],
        defaultHullName: 'M48',
        suggestedHullNames: ['M48'],
        requirements: {
          categories: ['UTILITY', 'COMMS', 'NAV'],
          subTypes: ['CARGO_MODULE'],
        },
      },
      {
        roleKey: 'CLM_CARGO',
        roleLabel: 'Cargo Run (M48)',
        description: 'M48 carrying palletized stores, spare parts, and dry cargo in 20-foot ISO modules. Up to four standard containers or 100 tons per hull.',
        capabilities: [
          '20-ft TEU Dry Cargo Module',
          'Autonomous Cargo Handling System',
          'Maritime Surface/Air Search Radar',
          'Teledyne FLIR EO/IR Turret',
          'Marine AI Guardian Vision CVP',
          'SeaFIND Inertial Navigation',
          'HiveLink SDR',
          'Nulka Active Missile Decoy',
        ],
        allowedPlatformTypes: ['USV'],
        defaultHullName: 'M48',
        suggestedHullNames: ['M48'],
        requirements: {
          categories: ['UTILITY', 'COMMS', 'NAV'],
          subTypes: ['CARGO_MODULE'],
        },
      },
      {
        roleKey: 'CLM_MAGAZINE',
        roleLabel: 'Magazine Run (M48)',
        description: 'M48 carrying a Mk 70 PDS reload module forward to a Mission 01 shooter, so an empty M48 regenerates its magazine without transiting all the way back to a rear node.',
        capabilities: [
          'Mk 70 PDS Reload Module',
          'Autonomous Cargo Handling System',
          'Maritime Surface/Air Search Radar',
          'Teledyne FLIR EO/IR Turret',
          'Marine AI Guardian Vision CVP',
          'SeaFIND Inertial Navigation',
          'HiveLink SDR',
          'Nulka Active Missile Decoy',
        ],
        allowedPlatformTypes: ['USV'],
        defaultHullName: 'M48',
        suggestedHullNames: ['M48'],
        requirements: {
          categories: ['UTILITY', 'COMMS', 'NAV'],
          subTypes: ['CARGO_MAGAZINE'],
        },
      },
    ],
  },

  // ─── THEATER ASW — Mission 03 — Luzon Strait (Autonomy Mission Series) ────────
  // MISSION_SET_KEY = 'THEATER_ASW'
  // VESSEL_ROSTER order: [LCS (command node), M48 (lead array), M48 (Bravo), M48 (Charlie), MH-60R (prosecutor)]
  // NB: Bistatic Cross-Fix Node carries subType null and CANNOT satisfy SONAR_TOWED —
  // only MFTA Towed Array can. Every array role must list MFTA explicitly.
  THEATER_ASW: {
    missionLabel: 'Theater ASW — Distributed Passive Barrier',
    minVessels: 5,
    roles: [
      {
        roleKey: 'TASW_LCS',
        roleLabel: 'LCS Command Node',
        description: 'Freedom-class LCS fusing the passive picture. USW-DSS cross-fixes bearings from dispersed arrays into a single track, TempestOS classifies the acoustics, and the flight deck launches the prosecutor.',
        capabilities: [
          'TempestOS Core Platform',
          'USW-DSS (AN/UYQ-100)',
          'Link 16 Track Broadcast',
          'MILSATCOM Terminal',
          'HiveLink SDR',
          'NSYTE AI Maintenance System',
        ],
        allowedPlatformTypes: ['Ship'],
        defaultHullName: 'Freedom-class LCS',
        suggestedHullNames: ['Freedom-class LCS'],
        requirements: {
          categories: ['C2', 'COMMS'],
          subTypes: [],
        },
      },
      {
        roleKey: 'TASW_LEAD',
        roleLabel: 'Lead Array (M48 — Confirm Ping)',
        description: 'Lead M48 towing a passive MFTA and carrying CAPTAS-4 variable-depth sonar. Listens silent with the rest of the barrier, then emits exactly one active ping to nail the firing solution once the cross-fix holds.',
        capabilities: [
          'MFTA Towed Array',
          'CAPTAS-4 Variable Depth Sonar',
          'EvoLogics Acoustic Modem',
          'HiveLink SDR',
          'SeaFIND Inertial Navigation',
        ],
        allowedPlatformTypes: ['USV'],
        defaultHullName: 'M48',
        suggestedHullNames: ['M48'],
        requirements: {
          categories: ['SENSORS', 'COMMS'],
          subTypes: ['SONAR_TOWED'],
        },
      },
      {
        roleKey: 'TASW_ARRAY_1',
        roleLabel: 'Passive Array (M48 — Bravo)',
        description: 'M48 towing a passive MFTA. Emits no acoustic energy at any point in the mission; contributes bearings only. Radio-frequency links stay under emission control discipline.',
        capabilities: [
          'MFTA Towed Array',
          'Bistatic Cross-Fix Node',
          'EvoLogics Acoustic Modem',
          'HiveLink SDR',
          'SeaFIND Inertial Navigation',
        ],
        allowedPlatformTypes: ['USV'],
        defaultHullName: 'M48',
        suggestedHullNames: ['M48', 'Saildrone Surveyor'],
        requirements: {
          categories: ['SENSORS', 'COMMS'],
          subTypes: ['SONAR_TOWED'],
        },
      },
      {
        roleKey: 'TASW_ARRAY_2',
        roleLabel: 'Passive Array (M48 — Charlie)',
        description: 'Third passive array holding the southern segment. Barrier length divided by array spacing gives hull count; spacing follows classified detection range and is set jointly with the government.',
        capabilities: [
          'MFTA Towed Array',
          'Bistatic Cross-Fix Node',
          'EvoLogics Acoustic Modem',
          'HiveLink SDR',
          'SeaFIND Inertial Navigation',
        ],
        allowedPlatformTypes: ['USV'],
        defaultHullName: 'M48',
        suggestedHullNames: ['M48', 'Saildrone Surveyor'],
        requirements: {
          categories: ['SENSORS', 'COMMS'],
          subTypes: ['SONAR_TOWED'],
        },
      },
      {
        roleKey: 'TASW_PROSECUTOR',
        roleLabel: 'Airborne Prosecutor (MH-60R)',
        description: 'MH-60R launched from the LCS flight deck once the contact is confirmed. AN/AQS-22 ALFS dipping sonar and sonobuoys refine the datum; a Mk 54 lightweight torpedo finishes it. The only crewed asset exposed, and only for the kill.',
        capabilities: [
          'AN/AQS-22 ALFS Dipping Sonar',
          'Sonobuoys (DIFAR / DICASS)',
          'Mk 54 Lightweight Torpedo',
          'Link 16 Track Broadcast',
        ],
        allowedPlatformTypes: ['Helicopter'],   // new platformType — roleUtils matches exactly
        defaultHullName: 'MH-60R Seahawk',
        suggestedHullNames: ['MH-60R Seahawk'],
        requirements: {
          categories: ['SENSORS', 'WEAPONS'],
          subTypes: [],
        },
      },
    ],
  },

  // ─── STANDOFF MCM — Mission 04 — Bashi Channel (Autonomy Mission Series) ──────
  // MISSION_SET_KEY = 'STANDOFF_MCM'
  // VESSEL_ROSTER order: [LCS (command node), MCM USV (hunter/neutralizer), Knifefish (classifier)]
  // Barracuda neutralizers launch from the MCM USV — there is no separate
  // neutralizer UUV role (removed at Alex's direction, 27 Jul 2026).
  STANDOFF_MCM: {
    missionLabel: 'Standoff MCM — Detect to Neutralize',
    minVessels: 3,
    roles: [
      {
        roleKey: 'SMCM_LCS',
        roleLabel: 'LCS Command Node (Outside the Field)',
        description: 'Freedom-class LCS holding station outside the minefield boundary. TempestOS sequences hunt, classify, sweep, and neutralize as one tasked chain, and resolves every vendor\'s contact and classification feed into a single picture.',
        capabilities: [
          'TempestOS Core Platform',
          'Link 16 Track Broadcast',
          'MILSATCOM Terminal',
          'HiveLink SDR',
          'NSYTE AI Maintenance System',
        ],
        allowedPlatformTypes: ['Ship'],
        defaultHullName: 'Freedom-class LCS',
        suggestedHullNames: ['Freedom-class LCS'],
        // No C2 requirement — same reasoning as the Contested Logistics node:
        // TempestOS orchestrates the chain but is not a C2-category capability,
        // so requiring C2 shows a permanently unmet checklist item.
        requirements: {
          categories: ['COMMS'],
          subTypes: [],
        },
      },
      {
        roleKey: 'SMCM_HUNTER',
        roleLabel: 'Hunter / Neutralizer (MCM USV)',
        description: 'MCM USV towing the AN/AQS-20C minehunting sonar across the field at standoff from the mothership. Carries the UISS influence sweep to trigger sensitive mines safely, launches Barracuda one-shot neutralizers against confirmed mines, and hosts AN/DVS-1 COBRA for the beach and surf zone.',
        capabilities: [
          'AN/AQS-20C Towed Minehunting Sonar',
          'Unmanned Influence Sweep System (UISS)',
          'Barracuda Mine Neutralizer',
          'AN/DVS-1 COBRA Coastal Recon',
          'HiveLink SDR',
          'SeaFIND Inertial Navigation',
          'Marine AI Guardian Vision CVP',
        ],
        allowedPlatformTypes: ['USV'],
        defaultHullName: 'MCM USV',
        suggestedHullNames: ['MCM USV', 'M48', 'Mariner'],
        requirements: {
          categories: ['SENSORS', 'COMMS'],
          subTypes: ['SONAR_TOWED', 'MCM_SWEEP', 'MCM_NEUTRALIZER'],
        },
      },
      {
        roleKey: 'SMCM_CLASSIFIER',
        roleLabel: 'Classifier (Knifefish UUV)',
        description: 'Knifefish UUV working below the surface to localize and identify mines, buried or moored, using low-frequency broadband sonar. Sea acceptance testing completed June 2026.',
        capabilities: [
          'Knifefish LFBB Mine ID Sonar',
          'EvoLogics Acoustic Modem',
          'SeaFIND Inertial Navigation',
        ],
        allowedPlatformTypes: ['UUV'],
        defaultHullName: 'Knifefish',
        suggestedHullNames: ['Knifefish', 'Freedom AUV', 'Manta Ray'],
        requirements: {
          categories: ['SENSORS', 'COMMS'],
          subTypes: ['SONAR_SIDESCAN'],
        },
      },
    ],
  },

  // ─── MDA ISR — South China Sea ────────────────────────────────────────────────
  // MISSION_SET_KEY = 'MDA_ISR'
  // MISSION_SET_CAPS = ['Passive ESM/SIGINT Collection Module']
  MDA_ISR: {
    missionLabel: 'MDA ISR — South China Sea',
    minVessels: 3,
    roles: [
      {
        roleKey: 'MDA_ISR_VOYAGER',
        roleLabel: 'SIGINT Loiter Platform',
        description: 'M48 on persistent barrier patrol. Passive ESM/SIGINT collection, AIS dark-ship detection, and pattern-of-life engine feeds 7th Fleet MOC.',
        capabilities: ['Passive ESM/SIGINT Collection Module'],
        allowedPlatformTypes: ['USV', 'USV/UUV', 'UUV'],
        defaultHullName: 'M48',
        suggestedHullNames: ['M48', 'ZeroUSV Oceanus17', 'Saildrone Voyager'],
        requirements: {
          categories: ['SENSORS', 'COMMS'],
          subTypes: [],
        },
      },
      {
        roleKey: 'MDA_ISR_OCEANUS',
        roleLabel: 'Littoral ISR (Oceanus17)',
        description: 'Oceanus17 running Kelvin Hughes SharpEye radar and EO/IR suite. Primary dark-ship detection node — cross-correlates radar returns with AIS and forwards contacts to the PoL engine.',
        capabilities: ['Passive ESM/SIGINT Collection Module'],
        allowedPlatformTypes: ['USV', 'USV/UUV'],
        defaultHullName: 'ZeroUSV Oceanus17',
        suggestedHullNames: ['ZeroUSV Oceanus17', 'M48', 'AEGIR-W'],
        requirements: {
          categories: ['SENSORS', 'COMMS'],
          subTypes: [],
        },
      },
      {
        roleKey: 'MDA_ISR_TRITON',
        roleLabel: 'BAMS Wide-Area (MQ-4C Triton)',
        description: 'MQ-4C Triton at 55,000 ft running AN/ZPY-3 MFAS radar. Vectored via Link 16 to pre-fused contacts for ISAR classification — arrives to execute, not search.',
        capabilities: [
          'AN/ZPY-3 AESA Radar',
          'Ka-SATCOM to TempestOS',
          'Link 16 Track Broadcast',
        ],
        allowedPlatformTypes: ['UAV'],
        defaultHullName: 'MQ-4C Triton',
        suggestedHullNames: ['MQ-4C Triton', 'MQ-8C Fire Scout', 'MQ-25 Stingray'],
        requirements: {
          categories: ['SENSORS', 'COMMS'],
          subTypes: [],
        },
      },
    ],
  },

  // ─── Kinetic Effects — South China Sea Strike ─────────────────────────────────
  // MISSION_SET_KEY = 'KINETIC_EFFECTS'
  // MISSION_SET_CAPS = ['Mk 70 Payload Delivery System', 'SeaFIND Inertial Navigation', 'BDA Assessment']
  //
  // VESSEL_ROSTER order: [M48 (Mk70 PDS), Saildrone Spectre, MQ-4C Triton]
  // roles[] must match that order so effectiveRoster positional mapping is correct.
  KINETIC_EFFECTS: {
    missionLabel: 'Kinetic Effects — Long-Range Strike',
    minVessels: 3,
    roles: [
      {
        roleKey: 'KE_M48_STRIKE',
        roleLabel: 'M48 Strike USV (Mk 70 PDS)',
        description: 'One of three M48 USVs armed with Mk 70 Payload Delivery System (4-cell Tomahawk VLS). Transits under EMCON using SeaFIND INS; fires on CCDR authorization.',
        capabilities: [
          'Mk 70 Payload Delivery System',
          'Tomahawk Block V 8-cell VLS',
          'SeaFIND Inertial Navigation',
        ],
        // VLS container strike system — large surface vessels only; no small USVs, UUVs, or UAVs
        allowedPlatformTypes: ['USV'],
        defaultHullName: 'AEGIR-H',
        suggestedHullNames: ['M48', 'AEGIR-H'],
        requirements: {
          categories: ['WEAPONS', 'COMMS', 'NAV'],
          subTypes: ['STRIKE_WEAPON', 'NAV_INS'],
        },
      },
      {
        roleKey: 'KE_SPECTRE_BDA',
        roleLabel: 'Saildrone Spectre (BDA / Screen)',
        description: 'Persistent EO/IR and ESM screening platform. Confirms strike impacts (BDA), detects radar signature loss, and provides EMCON-compliant post-strike assessment.',
        capabilities: [
          'Teledyne FLIR EO/IR Turret',     // 18 kg — primary BDA imager
          'Scion ESM Electronic Support',    // 45 kg — post-strike RF monitoring
          'BDA Assessment',                  // 0 kg — software capability
          '365-Day Endurance',               // 0 kg — platform endurance mode
        ],
        // Full BDA payload totals ~63 kg — excludes micro-USVs like SubSeaSail Horus (10 kg cap)
        allowedPlatformTypes: ['USV', 'USV/UUV', 'UUV'],
        defaultHullName: 'AEGIR-W',
        suggestedHullNames: ['Saildrone Spectre', 'M48', 'AEGIR-W', 'ZeroUSV Oceanus17'],
        requirements: {
          categories: ['SENSORS', 'COMMS'],
          subTypes: [],
        },
      },
      {
        // Index 2 — maps to VESSEL_ROSTER[2]: MQ-4C Triton
        roleKey: 'KE_TRITON_ISR',
        roleLabel: 'ISR / Target Cue (MQ-4C Triton)',
        description: 'MQ-4C Triton HALE UAV providing AESA radar target cueing and Ka-SATCOM uplink to TempestOS. Classifies and tracks PLAN surface contacts for strike tasking.',
        capabilities: [],
        // Aerial ISR cueing role — UAV only
        allowedPlatformTypes: ['UAV'],
        defaultHullName: 'MQ-4C Triton',
        suggestedHullNames: ['MQ-4C Triton', 'MQ-8C Fire Scout'],
        requirements: {
          categories: ['SENSORS', 'COMMS'],
          subTypes: [],
        },
      },
    ],
  },

  // ─── Non-Kinetic EW — Taiwan Strait NEMESIS ──────────────────────────────────
  // MISSION_SET_KEY = 'NON_KINETIC_EW'
  // MISSION_SET_CAPS = ['False Fleet Projection Package', 'LEED Dispenser (Long Endurance Electronic Decoy)',
  //                     'SOEA Container (Scaled Onboard Electronic Attack)',
  //                     'EMATT Mod 4 Acoustic Decoy Module', 'Passive ESM/SIGINT Collection Module']
  NON_KINETIC_EW: {
    missionLabel: 'Non-Kinetic EW — Taiwan Strait NEMESIS',
    minVessels: 3,
    roles: [
      {
        roleKey: 'NK_M48_ALPHA',
        roleLabel: 'False Fleet Lead (M48 ALPHA)',
        description: 'False fleet lead node. Broadcasts DDG AIS track, projects frigate RCS via corner reflectors, deploys LEED autonomous RF decoy vehicles toward PLAN search sector.',
        capabilities: [
          'False Fleet Projection Package',
          'LEED Dispenser (Long Endurance Electronic Decoy)',
          'SOEA Container (Scaled Onboard Electronic Attack)',
        ],
        // EW decoy projection + active jammer containers — surface vessels only
        allowedPlatformTypes: ['USV'],
        defaultHullName: 'AEGIR-H',
        suggestedHullNames: ['M48', 'AEGIR-H', 'AEGIR-W'],
        requirements: {
          categories: ['SENSORS', 'COMMS'],
          subTypes: ['EW_DECOY', 'EW_JAMMER'],
        },
      },
      {
        roleKey: 'NK_M48_BRAVO',
        roleLabel: 'False Fleet Trail (M48 BRAVO)',
        description: 'False fleet trail node. AIS spoofer broadcasts second DDG track, supplements deception geometry, and monitors PLAN search band via passive ESM.',
        capabilities: [
          'False Fleet Projection Package',
          'LEED Dispenser (Long Endurance Electronic Decoy)',
          'Passive ESM/SIGINT Collection Module',
        ],
        // EW decoy + passive ESM — surface vessels only
        allowedPlatformTypes: ['USV'],
        defaultHullName: 'AEGIR-H',
        suggestedHullNames: ['M48', 'AEGIR-H', 'AEGIR-W'],
        requirements: {
          categories: ['SENSORS', 'COMMS'],
          subTypes: ['EW_DECOY'],
        },
      },
      {
        roleKey: 'NK_BLACKSEA_M48',
        roleLabel: 'Active Jammer (M48 CHARLIE)',
        description: 'SOEA 100 kW C/X/Ku-band active jammer. Defeats anti-ship missile seekers and denies PLAN targeting radar during CVN transit window.',
        capabilities: [
          'SOEA Container (Scaled Onboard Electronic Attack)',
          'False Fleet Projection Package',
          'LEED Dispenser (Long Endurance Electronic Decoy)',
        ],
        // High-power active EW jamming — surface vessels only
        allowedPlatformTypes: ['USV'],
        defaultHullName: 'AEGIR-W',
        suggestedHullNames: ['M48', 'AEGIR-H'],
        requirements: {
          categories: ['SENSORS', 'COMMS'],
          subTypes: ['EW_JAMMER'],
        },
      },
    ],
  },

  // ─── Protections — cUxS Escort, Taiwan Strait ────────────────────────────────
  // MISSION_SET_KEY = 'PROTECTIONS'
  // MISSION_SET_CAPS = ['HiddenLevel Passive RF Sensor', 'cUxS Escort Picket', 'Advance Screen 5nm Ahead']
  PROTECTIONS: {
    missionLabel: 'Protections — cUxS Escort',
    minVessels: 2,
    roles: [
      {
        roleKey: 'PROT_M48_ESCORT',
        roleLabel: 'HPM / Intercept Escort (M48-A/B)',
        description: 'Port and starboard flank escort of HVU. Epirus Leonidas HPM defeats drone swarms non-kinetically; Coyote 3NK handles survivors and USV threats. HiddenLevel passive RF provides early warning.',
        capabilities: [
          'HiddenLevel Passive RF Sensor',
          'cUxS Escort Picket',
        ],
        // Escort/patrol with HPM and intercept systems — surface vessels, including sail USVs
        allowedPlatformTypes: ['USV', 'USV/UUV'],
        defaultHullName: 'AEGIR-H',
        suggestedHullNames: ['M48', 'AEGIR-H', 'ZeroUSV Oceanus17'],
        requirements: {
          categories: ['SENSORS', 'COMMS'],
          subTypes: [],
        },
      },
      {
        roleKey: 'PROT_SHADOW_FOX',
        roleLabel: 'Advance Screen (Mariner)',
        description: 'Advances 5 nm ahead of HVU. Passive RF and EO/IR detect inbound UAS approach vectors before they enter HPM engagement envelope.',
        capabilities: [
          'HiddenLevel Passive RF Sensor',
          'Advance Screen 5nm Ahead',
        ],
        // Advance screen — surface and stealthy subsurface platforms eligible
        allowedPlatformTypes: ['USV', 'USV/UUV'],
        defaultHullName: 'AEGIR-W',
        suggestedHullNames: ['M48', 'AEGIR-W', 'Mariner'],
        requirements: {
          categories: ['SENSORS', 'COMMS'],
          subTypes: [],
        },
      },
    ],
  },

  // ─── Counter-C5ISR — EW Decoy Cost Imposition ───────────────────────────────
  // MISSION_SET_KEY = 'COUNTER_C5ISR'
  // MISSION_SET_CAPS = ['EW Decoy Payload', 'LOS Mesh Radio']
  COUNTER_C5ISR: {
    missionLabel: 'Counter-C5ISR — EW Decoy Cost Imposition',
    minVessels: 1,
    roles: [
      {
        roleKey: 'CC5ISR_HORUS',
        roleLabel: 'EW Decoy Lure (SubSeaSail Horus)',
        description: 'Low-cost SubSeaSail Horus running an EW decoy payload. It emits a false electronic signature so the hull appears as a large combatant — baiting adversary ISR into committing high-value assets to investigate a disposable platform. Proves we can impose cost faster than the enemy.',
        capabilities: [
          'EW Decoy Payload',
          'LOS Mesh Radio',
        ],
        // Disposable micro-sail USV — decoy lure
        allowedPlatformTypes: ['USV', 'USV/UUV'],
        allowedHullNames: ['SubSeaSail Horus', 'Triton'],
        defaultHullName: 'SubSeaSail Horus',
        requirements: {
          categories: ['COMMS'],
          subTypes: ['EW_DECOY'],
        },
      },
    ],
  },

  // ─── Taiwan ISR — Median Line Patrol ─────────────────────────────────────────
  // MISSION_SET_KEY = 'ISR'
  // MISSION_SET_CAPS = ['HiddenLevel Passive RF Sensor', 'Project Scion (Northrop Grumman)', 'RazorChassis C5ISR Link']
  ISR: {
    missionLabel: 'Taiwan Strait ISR — Median Line Patrol',
    minVessels: 1,
    roles: [
      {
        roleKey: 'ISR_M48_LANTERN',
        roleLabel: 'Median Line ISR Patrol (M48 + LANTERN)',
        description: 'M48 patrolling the Taiwan Strait median line with DPI LANTERN tethered UAS. Maps PLA emitters via HiddenLevel, builds coverage-gap model via Scion, and routes USS Connecticut through blind spot via RazorChassis C5ISR link.',
        capabilities: [
          'DPI Vulture Tethered UAS',
          'HiddenLevel Passive RF Sensor',
          'Project Scion (Northrop Grumman)',
          'RazorChassis C5ISR Link',
        ],
        // Tethered UAS host + ISR — surface vessels only (needs deck space for tether)
        allowedPlatformTypes: ['USV'],
        defaultHullName: 'M48',
        suggestedHullNames: ['M48', 'AEGIR-H'],
        requirements: {
          categories: ['SENSORS', 'COMMS'],
          subTypes: ['TETHERED_UAS'],
        },
      },
    ],
  },

  // ─── Contested Logistics — South China Sea EABO Resupply ─────────────────────
  // MISSION_SET_KEY = 'CONTESTED_LOGISTICS'
  // MISSION_SET_CAPS = ['Encrypted Mesh Link to T82', 'Site-Clear Relay Authorization']
  CONTESTED_LOGISTICS: {
    missionLabel: 'Contested Logistics — EABO Resupply',
    minVessels: 2,
    roles: [
      {
        roleKey: 'CL_T82',
        roleLabel: 'Supply Carrier (M48)',
        description: 'Primary logistics carrier. Transits contested DF-26 WEZ under EMCON with dry cargo and fuel bladder TEU modules. GPS-denied fallback via Magnet DriveAI INS. Delivers to EABO island via bow ramp.',
        capabilities: [
          'Encrypted Mesh Link to M48',
        ],
        // Cargo carrier role — surface vessels with meaningful payload volume
        allowedPlatformTypes: ['USV'],
        defaultHullName: 'M48',
        suggestedHullNames: ['M48', 'AEGIR-H'],
        cargoRole: true,
        requirements: {
          categories: ['COMMS', 'NAV'],
          subTypes: ['NAV_INS'],
        },
      },
      {
        roleKey: 'CL_T12',
        roleLabel: 'Beach Scout (SubSeaSail HORUS)',
        description: 'Fast scout that races ahead of M48 into GPS-denied zone. EchoGuard CR radar and EO/IR clear the landing site; encrypted mesh relay transmits site-clear authorization to M48 before ramp deployment.',
        capabilities: [
          'Echodyne EchoGuard CR',
          'Lattice Mesh Network',
          'Encrypted Mesh Link to M48',
        ],
        // Only micro-sail USVs — Horus or Ocean Aero Triton; no large USVs
        allowedPlatformTypes: ['USV', 'USV/UUV'],
        allowedHullNames: ['SubSeaSail Horus', 'Triton', 'Otter X'],
        defaultHullName: 'SubSeaSail Horus',
        requirements: {
          categories: ['SENSORS', 'COMMS'],
          subTypes: [],
        },
      },
    ],
  },

  // ─── Mine Clearance — Strait of Hormuz ───────────────────────────────────────
  // MISSION_SET_KEY = 'MCM'
  // MISSION_SET_CAPS = ['Micro-SAS Sonar (SAMDIS)', 'Acoustic Indicator', 'EvoLogics Acoustic Modem',
  //                     'LOS Mesh Radio', 'Acoustic Marker Receiver', 'M30 Supercavitating Round', 'OrbComm ST 6100']
  MCM: {
    missionLabel: 'Mine Clearance — Strait of Hormuz',
    minVessels: 3,
    roles: [
      {
        roleKey: 'MCM_FREEDOM_AUV',
        roleLabel: 'Sweep & Mark AUV (Freedom AUV)',
        description: 'Executes boustrophedon sonar sweep at 4 kt. Detects, classifies, and localizes mines via Micro-SAS. Deploys acoustic indicators on confirmed mines and relays coordinates via acoustic modem.',
        capabilities: [
          'Micro-SAS Sonar (SAMDIS)',
          'Acoustic Indicator',
          'EvoLogics Acoustic Modem',
          'LOS Mesh Radio',
        ],
        // Underwater sweep and mine marking — AUVs and subsurface-capable platforms
        allowedPlatformTypes: ['UUV', 'USV/UUV'],
        defaultHullName: 'Freedom AUV',
        requirements: {
          categories: ['SENSORS', 'COMMS'],
          subTypes: ['SONAR_FLS', 'ACOUSTIC_MODEM'],
        },
      },
      {
        roleKey: 'MCM_HORUS_1',
        roleLabel: 'Mine Neutralizer (HORUS-1)',
        description: 'Acoustic marker receiver homes on the 37.5 kHz acoustic indicator deployed by the Freedom AUV; fires M30 supercavitating round for kinetic mine neutralization. SATCOM link to MOC Bahrain. Mesh radio sync with Freedom AUV for terminal guidance.',
        capabilities: [
          'Acoustic Marker Receiver',
          'M30 Supercavitating Round',
          'OrbComm ST 6100',
          'LOS Mesh Radio',
        ],
        // MCM strict lock — a SubSeaSail may only be swapped for a Freedom AUV or
        // an Ocean Aero Triton (per operator rule). No other hulls offered here.
        allowedPlatformTypes: ['USV', 'USV/UUV', 'UUV'],
        allowedHullNames: ['SubSeaSail Horus', 'Freedom AUV', 'Triton'],
        defaultHullName: 'SubSeaSail Horus',
        requirements: {
          categories: ['SENSORS', 'COMMS', 'WEAPONS'],
          subTypes: ['STRIKE_WEAPON'],
        },
      },
      {
        roleKey: 'MCM_HORUS_2',
        roleLabel: 'Mine Neutralizer (HORUS-2)',
        description: 'Second neutralization vessel. Acoustic marker receiver homes on the acoustic indicator for independent mine localization while HORUS-1 handles MINE-ALPHA — parallel prosecution.',
        capabilities: [
          'Acoustic Marker Receiver',
          'M30 Supercavitating Round',
          'OrbComm ST 6100',
          'LOS Mesh Radio',
        ],
        // MCM strict lock — a SubSeaSail may only be swapped for a Freedom AUV or
        // an Ocean Aero Triton (per operator rule). No other hulls offered here.
        allowedPlatformTypes: ['USV', 'USV/UUV', 'UUV'],
        allowedHullNames: ['SubSeaSail Horus', 'Freedom AUV', 'Triton'],
        defaultHullName: 'SubSeaSail Horus',
        requirements: {
          categories: ['SENSORS', 'COMMS', 'WEAPONS'],
          subTypes: ['STRIKE_WEAPON'],
        },
      },
    ],
  },

  // ─── Port Security — Naval Base San Diego ────────────────────────────────────
  // MISSION_SET_KEY = 'PORT_SECURITY'
  // MISSION_SET_CAPS = ['Echodyne EchoGuard CR', 'OrbComm ST 6100', 'LOS Mesh Radio', 'OceanSonics icListen HF Smart Hydrophone Array', 'MOOS-IvP']
  PORT_SECURITY: {
    missionLabel: 'Port Security — Naval Base San Diego',
    minVessels: 3,
    roles: [
      {
        roleKey: 'PS_HORUS_1',
        roleLabel: 'NW Harbor Security (HORUS-1)',
        description: 'NW sector cordon node at 3 nm from NBSD. EchoGuard CR radar detects surface contacts; VHF hailing for challenge; OrbComm SATCOM opens channel to MOC NBSD; mesh radio links cordon.',
        capabilities: [
          'Echodyne EchoGuard CR',
          'OrbComm ST 6100',
          'LOS Mesh Radio',
          'Lattice Mesh Network',
          'MOOS-IvP',
        ],
        allowedPlatformTypes: ['USV', 'USV/UUV'],
        allowedHullNames: ['SubSeaSail Horus', 'Triton', 'Otter X'],
        defaultHullName: 'SubSeaSail Horus',
        requirements: {
          categories: ['SENSORS', 'COMMS'],
          subTypes: ['HYDROPHONE'],
        },
      },
      {
        roleKey: 'PS_HORUS_2',
        roleLabel: 'W Harbor Security (HORUS-2)',
        description: 'W sector cordon node. EchoGuard CR independently tracks SIERRA contact for multi-sensor localization; relays track to HORUS-1 and shore via OrbComm + mesh.',
        capabilities: [
          'Echodyne EchoGuard CR',
          'OrbComm ST 6100',
          'LOS Mesh Radio',
          'Lattice Mesh Network',
          'MOOS-IvP',
        ],
        allowedPlatformTypes: ['USV', 'USV/UUV'],
        allowedHullNames: ['SubSeaSail Horus', 'Triton', 'Otter X'],
        defaultHullName: 'SubSeaSail Horus',
        requirements: {
          categories: ['SENSORS', 'COMMS'],
          subTypes: ['HYDROPHONE'],
        },
      },
      {
        roleKey: 'PS_HORUS_3',
        roleLabel: 'SW Harbor Security (HORUS-3)',
        description: 'SW sector first-contact node. EchoGuard CR detects zone breach, mesh alert chain initiated to HORUS-2 and HORUS-1.',
        capabilities: [
          'Echodyne EchoGuard CR',
          'OrbComm ST 6100',
          'LOS Mesh Radio',
          'Lattice Mesh Network',
          'MOOS-IvP',
        ],
        allowedPlatformTypes: ['USV', 'USV/UUV'],
        allowedHullNames: ['SubSeaSail Horus', 'Triton', 'Otter X'],
        defaultHullName: 'SubSeaSail Horus',
        requirements: {
          categories: ['SENSORS', 'COMMS'],
          subTypes: ['HYDROPHONE'],
        },
      },
    ],
  },

  // ─── Sea Jeep — MDA Base Config (South China Sea) ────────────────────────────
  // MISSION_SET_KEY = 'SEAJEEP_BASE'
  SEAJEEP_BASE: {
    missionLabel: 'Sea Jeep MDA — South China Sea',
    minVessels: 1,
    roles: [
      {
        roleKey: 'SJM_SEAJEEP_1',
        roleLabel: 'Persistent MDA (Sea Jeep Base)',
        description: 'GP-USV Sea Jeep on autonomous patrol at Mischief Reef / Whitsun Reef. EO/IR gimbal photographs AIS-dark vessels; Iridium SATCOM relays contact reports to 7th Fleet MOC.',
        capabilities: [
          'Trillium HD25e Gimbal Camera',
          'Iridium 9770 SATCOM',
          'GPS/INS + AIS Receiver',
          'Solar Wing + Li-ion Bank',
        ],
        allowedPlatformTypes: ['USV', 'USV/UUV'],
        allowedHullNames: ['GP-USV Sea Jeep', 'Otter X'],
        defaultHullName: 'GP-USV Sea Jeep',
        requirements: {
          categories: ['SENSORS', 'COMMS', 'NAV'],
          subTypes: [],
        },
      },
    ],
  },

  // ─── Sea Jeep — ISR Config (Bab-el-Mandeb) ───────────────────────────────────
  // MISSION_SET_KEY = 'SEAJEEP_ISR'
  SEAJEEP_ISR: {
    missionLabel: 'Sea Jeep ISR — Bab-el-Mandeb',
    minVessels: 1,
    roles: [
      {
        roleKey: 'SEA_JEEP_ISR_1',
        roleLabel: 'EO/IR Cue & Relay (Sea Jeep ISR)',
        description: 'Extended ISR mast raises Trillium EO/IR to 3m elevation, adding 3nm optical horizon for Yemeni coastal launch detection. Iridium SATCOM relays UAS tracks to DDG fire control.',
        capabilities: [
          'Trillium HD25e Gimbal (Mast-Mounted)',
          'Extended ISR Mast + Counterweight Keel',
          'Iridium SATCOM',
          'GPS/INS',
        ],
        allowedPlatformTypes: ['USV', 'USV/UUV'],
        allowedHullNames: ['GP-USV Sea Jeep'],
        defaultHullName: 'GP-USV Sea Jeep',
        requirements: {
          categories: ['SENSORS', 'COMMS', 'NAV'],
          subTypes: [],
        },
      },
    ],
  },

  // ─── Sea Jeep — MCM Config (Black Sea / Odessa Corridor) ─────────────────────
  // MISSION_SET_KEY = 'SEAJEEP_MCM'
  SEAJEEP_MCM: {
    missionLabel: 'Sea Jeep MCM — Black Sea',
    minVessels: 1,
    roles: [
      {
        roleKey: 'SJC_SEAJEEP_1',
        roleLabel: 'Mine Survey (Sea Jeep MCM)',
        description: 'EdgeTech FLS sonar auto-halts on bottom contacts; towed side-scan sonar maps seabed. Smart winch maintains constant tow depth. Mine coordinates transmitted to Ukrainian Navy MOC via Iridium SATCOM.',
        capabilities: [
          'EdgeTech 2300-MS FLS',
          'EdgeTech 4125 Side-Scan Sonar',
          'Smart Winch + A-Frame',
          'GPS/INS (jam-resistant)',
          'Iridium SATCOM',
          'Extended Fuel Tank (MCM config)',
        ],
        allowedPlatformTypes: ['USV', 'USV/UUV'],
        allowedHullNames: ['GP-USV Sea Jeep'],
        defaultHullName: 'GP-USV Sea Jeep',
        requirements: {
          categories: ['SENSORS', 'COMMS', 'NAV'],
          subTypes: ['SONAR_FLS', 'SONAR_SIDESCAN'],
        },
      },
    ],
  },

  // ─── Sea Jeep — Logistics Config (Batanes / Resupply) ────────────────────────
  // MISSION_SET_KEY = 'SEAJEEP_LOGISTICS'
  SEAJEEP_LOGISTICS: {
    missionLabel: 'Sea Jeep Logistics — Batanes Resupply',
    minVessels: 1,
    roles: [
      {
        roleKey: 'SJL_SEAJEEP_1',
        roleLabel: 'Autonomous Resupply (Sea Jeep Log)',
        description: 'Sealed dry cargo pod delivers ~20kg payload to Batanes island chain. Solar/Li-ion propulsion eliminates fuel logistics. Iridium SATCOM provides continuous position tracking to fleet MOC.',
        capabilities: [
          'Sealed Dry Cargo Pod (~20kg)',
          'GPS/INS + AIS Transponder',
          'Iridium SATCOM',
          'Solar Wing + Li-ion Battery Bank',
        ],
        allowedPlatformTypes: ['USV', 'USV/UUV'],
        allowedHullNames: ['GP-USV Sea Jeep'],
        defaultHullName: 'GP-USV Sea Jeep',
        cargoRole: true,
        requirements: {
          categories: ['COMMS', 'NAV'],
        },
      },
    ],
  },

  // ─── JMN — Joint Maritime Next (Shield & Spear) ───────────────────────────────

  // SEABED_MONITORING — Baltic CUI Corridor (JMN cap #3 / LOE 2 — SHIELD)
  // MISSION_SET_KEY = 'SEABED_MONITORING'
  SEABED_MONITORING: {
    missionLabel: 'Seabed & Undersea Infra — Baltic CUI',
    minVessels: 1,
    roles: [
      {
        roleKey: 'SEABED_SURVEYOR',
        roleLabel: 'CUI Survey & Close-Look',
        description: 'Ocean Aero Triton runs a persistent survey lane over a cable/pipeline corridor with side-scan sonar and magnetometer. Onboard analytics diff each pass against a baseline route model; AP Sensing DAS fiber alerts cue the vehicle to a segment, and Triton dives on the segment itself for the close-look — no separate dive asset required.',
        capabilities: [
          'EdgeTech 4125 Side-Scan Sonar',
          'Marine Magnetics Synapse Gradiometer',
          'KAYA Vision Iron 2518 Subsea Camera',
          'AP Sensing DAS interface',
          'Iridium SATCOM',
          'Solar Wing + Li-ion Bank',
        ],
        // Hard-filtered to fully-submersible hulls only — a survey/close-look role that
        // dives on cued segments can't be handed to a surface-only USV (e.g. Saildrone
        // Surveyor, which was here before and can't submerge at all).
        allowedHullNames: ['Triton', 'SubSeaSail Horus', 'Freedom AUV', 'Manta Ray', 'VATN S6'],
        defaultHullName: 'Triton',
        suggestedHullNames: ['Triton', 'Freedom AUV'],
        requirements: {
          categories: ['SENSORS', 'COMMS'],
        },
      },
    ],
  },

  // THREAT_CHARACTERIZATION — Eastern Pacific Sleeper Watch (JMN cap #4 / LOE 2 — SHIELD)
  // MISSION_SET_KEY = 'THREAT_CHARACTERIZATION'
  THREAT_CHARACTERIZATION: {
    missionLabel: 'Threat Characterization — E. Pacific',
    minVessels: 1,
    roles: [
      {
        roleKey: 'THREATCHAR_PICKET',
        roleLabel: 'Characterization Picket',
        description: 'Saildrone Voyager runs a barrier across a transit chokepoint on quiet electric + wind propulsion. On a low-freeboard "sleeper" contact it closes covertly and brings material-characterization payloads to bear — gamma/neutron and trace chemical/explosive sniffer — to distinguish explosive / chemical / narcotic / inert cargo. Observe-characterize-report; no organic weapon.',
        capabilities: [
          'Gamma/Neutron Radiological Detector',
          'Trace Chemical/Explosive Sniffer',
          'Advanced EO/IR Camera System',
          'HiddenLevel Passive RF Sensor',
          'Iridium SATCOM',
        ],
        allowedPlatformTypes: ['USV'],
        defaultHullName: 'Saildrone Voyager',
        suggestedHullNames: ['Saildrone Voyager', 'Saildrone Surveyor', 'Triton', 'M48'],
        requirements: {
          categories: ['SENSORS', 'COMMS'],
        },
      },
    ],
  },

  // LAUNCHED_EFFECTS — Launched-Effects Mothership, Taiwan Strait (JMN cap #7 / LOE 3 — SPEAR)
  // MISSION_SET_KEY = 'LAUNCHED_EFFECTS'
  // VESSEL_ROSTER order: [M48 mothership, AEGIR-W daughter, VATN S6 daughter]
  // (BDA/terminal ISR is provided by the ALE seeker + mothership EO/IR — no separate overwatch hull.)
  LAUNCHED_EFFECTS: {
    missionLabel: 'Launched Effects — Taiwan Strait',
    minVessels: 3,
    roles: [
      {
        roleKey: 'LE_MOTHERSHIP',
        roleLabel: 'Launched-Effects Mothership',
        description: 'M48 "maritime missile truck" transits under EMCON to a launch basket and dispenses a mixed daughter salvo on CCDR authorization — small attack USVs, a UUV, and air-launched effects / loitering munitions. Strict human-in-the-loop release gate.',
        capabilities: [
          'Air-Launched Effects / Loitering Munition Tubes',
          'Lattice Mesh Network',
          'SeaFIND Inertial Navigation',
          'EMCON Transit Capable',
          'Passive ESM/SIGINT Collection Module',
        ],
        allowedPlatformTypes: ['USV'],
        defaultHullName: 'M48',
        suggestedHullNames: ['M48', 'AEGIR-H'],
        requirements: {
          categories: ['WEAPONS', 'C2', 'COMMS'],
        },
      },
      {
        roleKey: 'LE_DAUGHTER_USV',
        roleLabel: 'Attack Daughter USV',
        description: 'AEGIR-W attack USV dispensed from the mothership; vectors toward the adversary surface picket in a cooperative-sensing/swarm behavior over mesh.',
        capabilities: [
          'Advanced EO/IR Camera System',
          'Lattice Mesh Network',
        ],
        allowedPlatformTypes: ['USV'],
        defaultHullName: 'AEGIR-W',
        suggestedHullNames: ['AEGIR-W', 'SubSeaSail Horus', 'GARC'],
        requirements: {
          categories: ['SENSORS', 'COMMS'],
        },
      },
      {
        roleKey: 'LE_DAUGHTER_UUV',
        roleLabel: 'One-Way Attack Daughter (UUV)',
        description: 'VATN S6 slips beneath the surface carrying a One-Way Attack Package against a subsurface/hull target, navigating GPS-denied on its Ekinox Micro INS. Man-portable and attritable — one of many cheap daughter effects, not a single expensive asset.',
        capabilities: [
          'SBG Ekinox Micro INS',
          'Lattice Mesh Network',
          'One-Way Attack Package',
        ],
        allowedPlatformTypes: ['UUV', 'AUV'],
        defaultHullName: 'VATN S6',
        suggestedHullNames: ['VATN S6', 'Freedom AUV', 'Manta Ray'],
        requirements: {
          categories: ['NAV', 'COMMS'],
        },
      },
    ],
  },

  // SOF_STRIKE_SUPPORT — Clandestine Disablement & SOF Support, Hormuz (JMN cap #10 / LOE 3 — SPEAR)
  // MISSION_SET_KEY = 'SOF_STRIKE_SUPPORT'
  SOF_STRIKE_SUPPORT: {
    missionLabel: 'SOF Strike Support — Hormuz',
    minVessels: 2,
    roles: [
      {
        roleKey: 'SOF_HOST',
        roleLabel: 'Covert SOF Host',
        description: 'Saildrone Spectre (Stealth Strike configuration) transits EMCON (wingless low-signature hull, GPS-denied INS) to a release point, releases the disablement UUV to transit independently, then makes the SOF delivery run itself — carrying the SOF element to a shore objective and back. HiddenLevel RF screen + EW decoy masks the approach.',
        capabilities: [
          'SOF Insertion Pod',
          'HiddenLevel Passive RF Sensor',
          'SBG Ekinox Micro INS',
          'Cryptographic Communications Module',
        ],
        allowedPlatformTypes: ['USV'],
        defaultHullName: 'Saildrone Spectre',
        suggestedHullNames: ['Saildrone Spectre', 'Triton', 'GP-USV Sea Jeep'],
        requirements: {
          categories: ['NAV', 'COMMS'],
        },
      },
      {
        roleKey: 'SOF_DISABLEMENT',
        roleLabel: 'Clandestine Disablement UUV',
        description: 'VATN S6 navigates GPS-denied on its Ekinox Micro INS to the target hull, obtains an attach/firing solution, and executes a disablement effect (limpet attach / lightweight torpedo) below the propeller/rudder on strict operator authorization — mobility kill, not area destruction. Man-portable and SOCOM MOD payload compliant.',
        capabilities: [
          'UUV Disablement Kit',
          'SBG Ekinox Micro INS',
          'Lattice Mesh Network',
        ],
        allowedPlatformTypes: ['UUV', 'AUV'],
        defaultHullName: 'VATN S6',
        suggestedHullNames: ['VATN S6', 'Freedom AUV', 'Manta Ray'],
        requirements: {
          categories: ['WEAPONS', 'NAV'],
        },
      },
    ],
  },

};

// Flat array of all roles for easy iteration
export const ALL_MISSION_ROLES = Object.entries(MISSION_ROLES).flatMap(
  ([missionKey, mission]) =>
    mission.roles.map(role => ({
      ...role,
      missionKey,
      missionLabel: mission.missionLabel,
    }))
);
