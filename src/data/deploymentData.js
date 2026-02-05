// Deployment-related data constants

// Official Navy Mission Types by Major Categories
export const navyMissionTypes = {
  "Sea Control": {
    iconKey: "Shield",
    missions: [
      { id: "sea-denial", name: "Sea Denial Operations", description: "Prevent enemy use of designated sea areas" },
      { id: "asw", name: "Anti-Submarine Warfare (ASW)", description: "Detect, track, and neutralize submarine threats" },
      { id: "asuw", name: "Anti-Surface Warfare (ASUW)", description: "Engage and neutralize surface vessel threats" },
      { id: "mine-warfare", name: "Mine Warfare Operations", description: "Mine laying and mine countermeasure operations" }
    ]
  },
  "Power Projection": {
    iconKey: "Target",
    missions: [
      { id: "precision-strike", name: "Precision Strike", description: "Targeted engagement of high-value assets" },
      { id: "sead", name: "Suppression of Enemy Air Defenses (SEAD)", description: "Neutralize enemy air defense systems" },
      { id: "maritime-interdiction", name: "Maritime Interdiction Operations", description: "Board, search, and seize vessels" },
      { id: "naval-gunfire", name: "Naval Surface Fire Support", description: "Shore bombardment in support of ground forces" }
    ]
  },
  "Intelligence & Surveillance": {
    iconKey: "Eye",
    missions: [
      { id: "isr", name: "Intelligence, Surveillance & Reconnaissance", description: "Gather tactical and strategic intelligence" },
      { id: "bda", name: "Battle Damage Assessment", description: "Evaluate effectiveness of strikes and operations" },
      { id: "sigint", name: "Signals Intelligence Collection", description: "Electronic intelligence gathering operations" },
      { id: "maritime-patrol", name: "Maritime Domain Awareness", description: "Monitor and report maritime activity" }
    ]
  },
  "Force Protection": {
    iconKey: "ShieldCheck",
    missions: [
      { id: "force-protection", name: "Force Protection Operations", description: "Defend friendly forces and assets" },
      { id: "escort", name: "Convoy Escort Operations", description: "Provide security for merchant or military vessels" },
      { id: "cap", name: "Combat Air Patrol", description: "Maintain defensive air coverage" },
      { id: "perimeter-defense", name: "Perimeter Defense", description: "Establish defensive screen around assets" }
    ]
  },
  "Maritime Security": {
    iconKey: "Lock",
    missions: [
      { id: "freedom-of-nav", name: "Freedom of Navigation Operations", description: "Assert navigation rights in international waters" },
      { id: "counter-piracy", name: "Counter-Piracy Operations", description: "Suppress piracy and protect commercial shipping" },
      { id: "smuggling-interdiction", name: "Anti-Smuggling Operations", description: "Intercept illegal trafficking operations" },
      { id: "port-security", name: "Port Security Operations", description: "Secure critical maritime infrastructure" }
    ]
  },
  "Humanitarian": {
    iconKey: "Plus",
    missions: [
      { id: "search-rescue", name: "Search and Rescue (SAR)", description: "Locate and recover personnel in distress" },
      { id: "disaster-relief", name: "Humanitarian Assistance/Disaster Relief", description: "Provide aid during natural disasters" },
      { id: "noncombatant-evac", name: "Noncombatant Evacuation Operations", description: "Evacuate civilians from hostile areas" },
      { id: "medical-assist", name: "Maritime Medical Assistance", description: "Provide emergency medical care at sea" }
    ]
  }
};

// Official Navy Rules of Engagement Parameters
export const roeParameters = [
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
