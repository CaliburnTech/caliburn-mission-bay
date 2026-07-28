/**
 * advisorContext.test.js — plan §6 phase 1 / §7 item 3.
 *
 * Every Autonomy Mission Series context must build under the 20,000-char
 * endpoint cap and mention every role capability by name, so the advisor
 * can always ground its answers.
 */

import { describe, it, expect } from 'vitest';
import {
  buildMissionContext,
  buildLoadoutContext,
  buildSwapContext,
} from './advisorContext';
import { MISSION_ROLES } from '../data/missionRoles';
import { vesselHullData } from '../data/vesselData';

const SERIES_KEYS = [
  'MAGAZINE_DEPTH',
  'CONTESTED_LOGISTICS_MOTHERSHIP',
  'THEATER_ASW',
  'STANDOFF_MCM',
  'MDA_MOTHERSHIP',
];

const CONTEXT_BUDGET = 20_000;

describe('buildMissionContext', () => {
  it.each(SERIES_KEYS)('%s builds under budget', (key) => {
    const ctx = buildMissionContext(key);
    expect(ctx.length).toBeGreaterThan(500);
    expect(ctx.length).toBeLessThan(CONTEXT_BUDGET);
  });

  it.each(SERIES_KEYS)('%s mentions every role capability by name', (key) => {
    const ctx = buildMissionContext(key);
    for (const role of MISSION_ROLES[key].roles) {
      for (const capName of role.capabilities ?? []) {
        expect(ctx).toContain(capName);
      }
    }
  });

  it.each(SERIES_KEYS)('%s mentions every default and suggested hull', (key) => {
    const ctx = buildMissionContext(key);
    for (const role of MISSION_ROLES[key].roles) {
      if (role.defaultHullName) expect(ctx).toContain(role.defaultHullName);
      for (const hull of role.suggestedHullNames ?? []) {
        expect(ctx).toContain(hull);
      }
    }
  });

  it('returns a graceful message for an unknown mission key', () => {
    expect(buildMissionContext('NOT_A_MISSION')).toContain('No mission data');
  });
});

describe('buildLoadoutContext', () => {
  const hull = vesselHullData.find((h) => h.name === 'MCM USV');

  it('reports readiness and stays under budget for a partial loadout', () => {
    const activeConfig = {
      hullName: 'MCM USV',
      slots: {
        SENSORS: ['AN/AQS-20C Towed Minehunting Sonar', null],
        COMMS: [null],
      },
    };
    const ctx = buildLoadoutContext(hull, activeConfig, 'STANDOFF_MCM', 'SMCM_HUNTER');
    expect(ctx.length).toBeLessThan(CONTEXT_BUDGET);
    expect(ctx).toContain('NOT READY');
    expect(ctx).toContain('SWaP BUDGET');
    // Unmet requirements should come with catalog suggestions
    expect(ctx).toContain('UNMET REQUIREMENT');
  });

  it('reports READY when the full role package is equipped', () => {
    const role = MISSION_ROLES.STANDOFF_MCM.roles.find((r) => r.roleKey === 'SMCM_HUNTER');
    const activeConfig = {
      hullName: 'MCM USV',
      slots: { SENSORS: [...role.capabilities], COMMS: ['HiveLink SDR'] },
    };
    const ctx = buildLoadoutContext(hull, activeConfig, 'STANDOFF_MCM', 'SMCM_HUNTER');
    expect(ctx).toContain('READY — all requirements met');
  });

  it('handles a freeform loadout with no mission applied', () => {
    const ctx = buildLoadoutContext(hull, { hullName: 'MCM USV', slots: {} });
    expect(ctx).toContain('freeform loadout');
    expect(ctx.length).toBeLessThan(CONTEXT_BUDGET);
  });
});

describe('buildSwapContext', () => {
  it('compares two maritime hulls with eligibility verdicts, under budget', () => {
    const ctx = buildSwapContext('STANDOFF_MCM', 'SMCM_HUNTER', 'MCM USV', 'M48');
    expect(ctx.length).toBeLessThan(CONTEXT_BUDGET);
    expect(ctx).toContain('CURRENT HULL');
    expect(ctx).toContain('CANDIDATE HULL');
    expect(ctx).toContain('MCM USV');
    expect(ctx).toContain('M48');
    expect(ctx).toContain('SWaP eligibility');
    expect(ctx).toContain('MARITIME');
  });

  it('flags cross-domain swaps', () => {
    const ctx = buildSwapContext('THEATER_ASW', null, 'M48', 'MQ-9 Reaper');
    expect(ctx).toContain('Cross-domain swaps are not permitted');
  });
});
