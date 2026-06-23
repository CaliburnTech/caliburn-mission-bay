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
  // MISSION_SET_CAPS = ['CAPTAS-4 Variable Depth Sonar', 'USW-DSS (AN/UYQ-100)', 'HiveLink SDR',
  //                     'MFTA Towed Array', 'Hanwha Naval Missile System']
  //
  // VESSEL_ROSTER order: [M48-ALPHA, M48-BRAVO, M48-CHARLIE, USS Virginia SSN-774]
  // roles[] must match that order so effectiveRoster positional mapping is correct.
  ASW: {
    missionLabel: 'ASW — Philippine Sea',
    roles: [
      {
        roleKey: 'ASW_ALPHA',
        roleLabel: 'CAPTAS Hunter (ALPHA)',
        description: 'Active sonar pinger and C2 hub. Deploys CAPTAS-4 VDS to 200m, broadcasts ASW common picture via Link 16.',
        capabilities: [
          'CAPTAS-4 Variable Depth Sonar',
          'USW-DSS (AN/UYQ-100)',
          'HiveLink SDR',
        ],
        // CAPTAS-4 is a large tow system — only medium-large surface vessels
        allowedPlatformTypes: ['USV'],
        defaultHullName: 'M48',
      },
      {
        roleKey: 'ASW_BRAVO',
        roleLabel: 'MFTA Receiver / Shooter (BRAVO)',
        description: 'Passive MFTA towed array in bistatic geometry SE of ALPHA. Receives echo returns, computes cross-fix, prosecutes on USW-DSS cue.',
        capabilities: [
          'MFTA Towed Array',
          'Hanwha Naval Missile System',
          'USW-DSS (AN/UYQ-100)',
          'Link 16 Track Broadcast',
          'Bistatic Cross-Fix Node',
        ],
        allowedPlatformTypes: ['USV'],
        defaultHullName: 'M48',
      },
      {
        roleKey: 'ASW_CHARLIE',
        roleLabel: 'MFTA Receiver / Shooter (CHARLIE)',
        description: 'Passive MFTA towed array in bistatic geometry NE of ALPHA. Completes cross-fix triangle, provides independent prosecution vector.',
        capabilities: [
          'MFTA Towed Array',
          'Hanwha Naval Missile System',
          'USW-DSS (AN/UYQ-100)',
          'Link 16 Track Broadcast',
          'Bistatic Cross-Fix Node',
        ],
        allowedPlatformTypes: ['USV'],
        defaultHullName: 'M48',
      },
    ],
  },

  // ─── MDA ISR — South China Sea ────────────────────────────────────────────────
  // MISSION_SET_KEY = 'MDA_ISR'
  // MISSION_SET_CAPS = ['Passive ESM/SIGINT Collection Module']
  MDA_ISR: {
    missionLabel: 'MDA ISR — South China Sea',
    roles: [
      {
        roleKey: 'MDA_ISR_VOYAGER',
        roleLabel: 'SIGINT Loiter Platform',
        description: 'M48 on persistent barrier patrol. Passive ESM/SIGINT collection, AIS dark-ship detection, and pattern-of-life engine feeds 7th Fleet MOC.',
        capabilities: ['Passive ESM/SIGINT Collection Module'],
        allowedPlatformTypes: ['USV', 'USV/UUV', 'UUV'],
        defaultHullName: 'M48',
      },
      {
        roleKey: 'MDA_ISR_OCEANUS',
        roleLabel: 'Littoral ISR (Oceanus17)',
        description: 'Oceanus17 running Kelvin Hughes SharpEye radar and EO/IR suite. Primary dark-ship detection node — cross-correlates radar returns with AIS and forwards contacts to the PoL engine.',
        capabilities: ['Passive ESM/SIGINT Collection Module'],
        allowedPlatformTypes: ['USV', 'USV/UUV'],
        defaultHullName: 'ZeroUSV Oceanus17',
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
      },
    ],
  },

  // ─── Protections — cUxS Escort, Taiwan Strait ────────────────────────────────
  // MISSION_SET_KEY = 'PROTECTIONS'
  // MISSION_SET_CAPS = ['HiddenLevel Passive RF Sensor', 'cUxS Escort Picket', 'Advance Screen 5nm Ahead']
  PROTECTIONS: {
    missionLabel: 'Protections — cUxS Escort',
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
      },
    ],
  },

  // ─── Counter-C5ISR — Strait of Hormuz (ISR Tethered Drone) ──────────────────
  // MISSION_SET_KEY = 'COUNTER_C5ISR'
  // MISSION_SET_CAPS = ['DPI Vulture Tethered UAS', 'HiddenLevel Passive RF Sensor',
  //                     'Project Scion (Northrop Grumman)', 'RazorChassis FC Integration']
  COUNTER_C5ISR: {
    missionLabel: 'Counter-C5ISR — Strait of Hormuz',
    roles: [
      {
        roleKey: 'CC5ISR_M48',
        roleLabel: 'Tethered ISR Patrol (M48 + DPI Vulture)',
        description: 'M48 on shipping lane patrol with DPI Vulture tethered UAS at 200 ft. HiddenLevel passive RF detects threat emissions; Scion autonomy classifies; RazorChassis cueing pushes fire-control track to USS Laboon.',
        capabilities: [
          'DPI Vulture Tethered UAS',
          'HiddenLevel Passive RF Sensor',
          'Project Scion (Northrop Grumman)',
          'RazorChassis FC Integration',
        ],
        // Tethered UAS host + ISR — surface vessels only (needs deck space for tether)
        allowedPlatformTypes: ['USV'],
        defaultHullName: 'M48',
      },
    ],
  },

  // ─── Taiwan ISR — Median Line Patrol ─────────────────────────────────────────
  // MISSION_SET_KEY = 'ISR'
  // MISSION_SET_CAPS = ['HiddenLevel Passive RF Sensor', 'Project Scion (Northrop Grumman)', 'RazorChassis C5ISR Link']
  ISR: {
    missionLabel: 'Taiwan Strait ISR — Median Line Patrol',
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
      },
    ],
  },

  // ─── Contested Logistics — South China Sea EABO Resupply ─────────────────────
  // MISSION_SET_KEY = 'CONTESTED_LOGISTICS'
  // MISSION_SET_CAPS = ['Encrypted Mesh Link to T82', 'Site-Clear Relay Authorization']
  CONTESTED_LOGISTICS: {
    missionLabel: 'Contested Logistics — EABO Resupply',
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
      },
    ],
  },

  // ─── Mine Clearance — Strait of Hormuz ───────────────────────────────────────
  // MISSION_SET_KEY = 'MCM'
  // MISSION_SET_CAPS = ['Micro-SAS Sonar (SAMDIS)', 'Acoustic Indicator Buoy', 'EvoLogics Acoustic Modem',
  //                     'LOS Mesh Radio', 'Acoustic Marker Receiver', 'M30 Supercavitating Round', 'OrbComm ST 6100']
  MCM: {
    missionLabel: 'Mine Clearance — Strait of Hormuz',
    roles: [
      {
        roleKey: 'MCM_FREEDOM_AUV',
        roleLabel: 'Sweep & Mark AUV (Freedom AUV)',
        description: 'Executes boustrophedon sonar sweep at 4 kt. Detects, classifies, and localizes mines via Micro-SAS. Deploys acoustic indicator buoys on confirmed mines and relays coordinates via acoustic modem.',
        capabilities: [
          'Micro-SAS Sonar (SAMDIS)',
          'Acoustic Indicator Buoy',
          'EvoLogics Acoustic Modem',
          'LOS Mesh Radio',
        ],
        // Underwater sweep and mine marking — AUVs and subsurface-capable platforms
        allowedPlatformTypes: ['UUV', 'USV/UUV'],
        defaultHullName: 'Freedom AUV',
      },
      {
        roleKey: 'MCM_HORUS_1',
        roleLabel: 'Mine Neutralizer (HORUS-1)',
        description: 'EchoGuard CR radar locates mine markers; fires M30 supercavitating round for kinetic mine neutralization. SATCOM link to MOC Bahrain. Mesh radio sync with Freedom AUV for terminal guidance.',
        capabilities: [
          'Echodyne EchoGuard CR',
          'M30 Supercavitating Round',
          'OrbComm ST 6100',
          'LOS Mesh Radio',
        ],
        // Only micro-sail USVs — Horus or Ocean Aero Triton; no large USVs
        allowedPlatformTypes: ['USV', 'USV/UUV'],
        allowedHullNames: ['SubSeaSail Horus', 'Triton'],
        defaultHullName: 'SubSeaSail Horus',
      },
      {
        roleKey: 'MCM_HORUS_2',
        roleLabel: 'Mine Neutralizer (HORUS-2)',
        description: 'Second neutralization vessel. EchoGuard CR radar on independent mine localization while HORUS-1 handles MINE-ALPHA — parallel prosecution.',
        capabilities: [
          'Echodyne EchoGuard CR',
          'M30 Supercavitating Round',
          'OrbComm ST 6100',
          'LOS Mesh Radio',
        ],
        // Only micro-sail USVs — Horus or Ocean Aero Triton; no large USVs
        allowedPlatformTypes: ['USV', 'USV/UUV'],
        allowedHullNames: ['SubSeaSail Horus', 'Triton'],
        defaultHullName: 'SubSeaSail Horus',
      },
    ],
  },

  // ─── Port Security — Naval Base San Diego ────────────────────────────────────
  // MISSION_SET_KEY = 'PORT_SECURITY'
  // MISSION_SET_CAPS = ['Echodyne EchoGuard CR', 'OrbComm ST 6100', 'LOS Mesh Radio', 'OceanSonics icListen HF Smart Hydrophone Array', 'MOOS-IvP']
  PORT_SECURITY: {
    missionLabel: 'Port Security — Naval Base San Diego',
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
      },
    ],
  },

  // ─── Sea Jeep — MDA Base Config (South China Sea) ────────────────────────────
  // MISSION_SET_KEY = 'SEA_JEEP_MDA'
  SEA_JEEP_MDA: {
    missionLabel: 'Sea Jeep MDA — South China Sea',
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
      },
    ],
  },

  // ─── Sea Jeep — ISR Config (Bab-el-Mandeb) ───────────────────────────────────
  // MISSION_SET_KEY = 'SEA_JEEP_ISR'
  SEA_JEEP_ISR: {
    missionLabel: 'Sea Jeep ISR — Bab-el-Mandeb',
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
      },
    ],
  },

  // ─── Sea Jeep — MCM Config (Black Sea / Odessa Corridor) ─────────────────────
  // MISSION_SET_KEY = 'SEA_JEEP_MCM'
  SEA_JEEP_MCM: {
    missionLabel: 'Sea Jeep MCM — Black Sea',
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
      },
    ],
  },

  // ─── Sea Jeep — Logistics Config (Batanes / Resupply) ────────────────────────
  // MISSION_SET_KEY = 'SEA_JEEP_LOGISTICS'
  SEA_JEEP_LOGISTICS: {
    missionLabel: 'Sea Jeep Logistics — Batanes Resupply',
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
