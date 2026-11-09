import { Character, Injury } from '@labcabrera-rmu/rmu-react-shared-lib';
import { describe, expect, it } from 'vitest';
import { previewRest, RestInput, restRatesOf } from './rest-rules';

const character = (overrides: Partial<Record<string, unknown>> = {}) =>
  ({ hp: { max: 40, current: 20 }, injuries: [], ...overrides }) as unknown as Character;

const rates = { percent: 10, periodHours: 2, fullRestMultiplier: 2 };
const input = (overrides: Partial<RestInput> = {}): RestInput => ({
  minutes: 0,
  hours: 0,
  days: 0,
  fullRest: false,
  active: false,
  ...overrides,
});

describe('restRatesOf', () => {
  it('uses the tables, and fallbacks without them', () => {
    expect(restRatesOf(undefined)).toEqual(rates);
    expect(restRatesOf({ restHpPercentPerPeriod: 5, restPeriodHours: 4, fullRestDayMultiplier: 3 } as never)).toEqual({
      percent: 5,
      periodHours: 4,
      fullRestMultiplier: 3,
    });
  });
});

describe('previewRest', () => {
  it('is empty without time', () => {
    expect(previewRest(character(), input(), rates).empty).toBe(true);
    expect(previewRest(character(), input({ minutes: 5 }), rates).empty).toBe(false);
  });

  it('gives hits by complete periods, up to the maximum', () => {
    expect(previewRest(character(), input({ hours: 5 }), rates).hpAfter).toBe(28);
    expect(previewRest(character(), input({ days: 10 }), rates).hpAfter).toBe(40);
  });

  it('does not raise hits already at the maximum', () => {
    expect(previewRest(character({ hp: { max: 40, current: 45 } }), input({ hours: 6 }), rates).hpAfter).toBe(45);
  });

  it('counts only the sleep hours of an active character', () => {
    const active = previewRest(character(), input({ days: 1, hours: 5, active: true }), rates);
    expect(active.hpAfter).toBe(36);
    expect(active.fatigueAfter).toBe(0);
  });

  it('multiplies the injury days only on a complete rest of a character not active', () => {
    expect(previewRest(character(), input({ days: 2, fullRest: true }), rates).counterDays).toBe(4);
    expect(previewRest(character(), input({ days: 2, fullRest: true, active: true }), rates).counterDays).toBe(2);
  });

  it('recovers power points by periods, capped at the maximum', () => {
    const mage = character({ power: { max: 20, current: 5 } });
    expect(previewRest(mage, input({ hours: 2 }), rates).powerAfter).toBe(7);
    expect(previewRest(mage, input({ days: 1 }), rates).powerAfter).toBe(13);
    expect(previewRest(mage, input({ days: 10 }), rates).powerAfter).toBe(20);
    expect(previewRest(character(), input({ days: 1 }), rates).powerAfter).toBeUndefined();
  });

  it('lowers the fatigue by the minutes of the whole rest', () => {
    const tired = character({ endurance: { fatiguePenalty: -30 } });
    const rested = previewRest(tired, input({ minutes: 5 }), rates);
    expect(rested.fatigueBefore).toBe(30);
    expect(rested.fatigueAfter).toBe(25);
    expect(previewRest(tired, input({ hours: 1 }), rates).fatigueAfter).toBe(0);
  });

  it('ignores the minutes of an active character', () => {
    const tired = character({ endurance: { fatiguePenalty: -30 } });
    expect(previewRest(tired, input({ minutes: 5, active: true }), rates).fatigueAfter).toBe(30);
  });

  it('runs down the recovering injuries, but not the untreated ones of an active character', () => {
    const wounded = character({
      injuries: [
        { id: 'a', status: 'recovering', recovery: { remainingDays: 3 } },
        { id: 'b', status: 'recovering', recovery: { remainingDays: 3, untreated: true } },
        { id: 'c', status: 'active' },
      ] as Injury[],
    });
    expect(previewRest(wounded, input({ days: 1 }), rates).recovering.map((entry) => entry.remainingDays)).toEqual([
      2, 2,
    ]);
    expect(
      previewRest(wounded, input({ days: 5, active: true }), rates).recovering.map((entry) => entry.remainingDays)
    ).toEqual([0, 3]);
  });
});
