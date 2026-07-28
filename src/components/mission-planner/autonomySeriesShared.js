// Shared narrative elements for the Autonomy Mission Series (Autonomous Strike Group).
// All five pitch decks carry the "THE ORCHESTRATION LAYER" slide and "THE ASK" slide
// almost verbatim — this constant holds that prose once instead of five times.
// See docs/AUTONOMOUS_STRIKE_GROUP_MISSION_PLAN.md §8.3.

export const ORCHESTRATION_LAYER = {
  title: 'TempestOS — The Orchestration Layer',
  points: [
    'Mission autonomy: hulls execute mission orders, not joystick commands',
    'Open interfaces: many vendors\' hardware behaves as one force',
    'One fused picture: every node\'s feed resolves at the command node',
    'Denied comms: pre-authorized rules run to completion without a link',
  ],
};

// THE ASK is identical across the series — one hull, one operating period,
// interface documentation, a test window, range access, and an RMF authorization
// path — judged against criteria set in advance. Only the metric changes.
export const SUCCESS_CRITERIA = {
  MAGAZINE_DEPTH: [
    'Time from track to launch on remote',
    'Magazine cycle time without moving the command node',
  ],
  CONTESTED_LOGISTICS_MOTHERSHIP: [
    'Transfer evolutions completed per hull per day',
    'The sea state at which they stop',
  ],
  THEATER_ASW: [
    'Barrier length held per hull',
    'Time from first bearing to a cross-fixed firing solution',
  ],
  STANDOFF_MCM: [
    'Area clearance rate in square nautical miles per day',
    'Hours from detection to neutralization',
  ],
  MDA_MOTHERSHIP: [
    'Fused-picture coverage area per hull',
    'Launch-to-recovery cycle time through Sea State 4',
  ],
};
