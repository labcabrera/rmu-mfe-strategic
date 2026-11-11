import { Character, Injury } from '@labcabrera-rmu/rmu-react-shared-lib';
import { describe, expect, it } from 'vitest';
import {
  activeConditions,
  bodyDevelopmentRanks,
  canFailStrenuous,
  healingTypeKey,
  healingTypeOf,
  isProcedureAllowed,
  isRecoveryRolled,
  isTreatable,
  isUntreated,
  latestTreatment,
  needsNewTreatment,
  skillBonus,
  suggestedProcedures,
} from './health-rules';

const injury = (overrides: Partial<Injury> = {}) =>
  ({ type: 'skin-tissue', severity: 'light', status: 'active', treatments: [], ...overrides }) as Injury;

describe('suggestedProcedures', () => {
  it('offers the stopping procedures only to a bleeding injury', () => {
    expect(suggestedProcedures(injury({ bleeding: 2 }))).toContain('pressure');
    expect(suggestedProcedures(injury())).not.toContain('pressure');
  });

  it('keeps the tourniquet for limbs and stitches off severe wounds', () => {
    expect(suggestedProcedures(injury({ bleeding: 1, location: 'arm' }))).toContain('tourniquet');
    expect(suggestedProcedures(injury({ bleeding: 1, location: 'head' }))).not.toContain('tourniquet');
    expect(suggestedProcedures(injury({ bleeding: 1, severity: 'severe' }))).not.toContain('stitches');
  });

  it('follows the type of the injury and always ends with herbs and magic', () => {
    const bone = suggestedProcedures(injury({ type: 'bone', severity: 'severe' }));
    expect(bone).toEqual(expect.arrayContaining(['splint', 'cast', 'surgery', 'herbs', 'magic']));
    expect(suggestedProcedures(injury({ type: 'organ', severity: 'light' }))).toContain('dress');
    expect(suggestedProcedures(injury({ type: 'organ', severity: 'severe' }))).toContain('surgery');
  });

  it('returns every procedure for an unknown type', () => {
    expect(suggestedProcedures(injury({ type: 'unknown' }))).toContain('surgery');
    expect(suggestedProcedures(injury({ type: 'unknown' }))).toHaveLength(11);
  });
});

describe('isProcedureAllowed', () => {
  it('refuses stitches on severe injuries', () => {
    expect(isProcedureAllowed(injury({ severity: 'severe' }), 'stitches')).toBe(false);
    expect(isProcedureAllowed(injury({ severity: 'light' }), 'stitches')).toBe(true);
  });

  it('allows a tourniquet on a limb or without location', () => {
    expect(isProcedureAllowed(injury({ location: 'leg' }), 'tourniquet')).toBe(true);
    expect(isProcedureAllowed(injury(), 'tourniquet')).toBe(true);
    expect(isProcedureAllowed(injury({ location: 'head' }), 'tourniquet')).toBe(false);
  });
});

describe('treatments', () => {
  const treated = injury({
    status: 'recovering',
    treatments: [{ id: 't1', healingType: 'none' } as never, { id: 't2', healingType: 'medicine' } as never],
  });

  it('takes the last treatment as the latest', () => {
    expect(latestTreatment(treated)?.id).toBe('t2');
    expect(latestTreatment(injury())).toBeUndefined();
  });

  it('counts an injury as untreated without a treatment or when the latest had no healing', () => {
    expect(isUntreated(injury())).toBe(true);
    expect(isUntreated(injury({ treatments: [{ healingType: 'none' } as never] }))).toBe(true);
    expect(isUntreated(treated)).toBe(false);
  });

  it('knows the recovery roll of the latest treatment was made', () => {
    expect(isRecoveryRolled({ ...treated, recovery: { treatmentId: 't2' } as never })).toBe(true);
    expect(isRecoveryRolled({ ...treated, recovery: { treatmentId: 't1' } as never })).toBe(false);
    expect(isRecoveryRolled(treated)).toBe(false);
  });

  it('allows treating active or recovering injuries, not a running poison', () => {
    expect(isTreatable(injury({ status: 'active' }))).toBe(true);
    expect(isTreatable(injury({ status: 'healed' }))).toBe(false);
    expect(isTreatable(injury({ status: 'active', poison: { finished: false } as never }))).toBe(false);
  });

  it('asks for a new treatment after a strenuous failure of the latest one', () => {
    expect(needsNewTreatment({ ...treated, strenuousFailure: { treatmentId: 't2' } as never })).toBe(true);
    expect(needsNewTreatment({ ...treated, strenuousFailure: { treatmentId: 't1' } as never })).toBe(false);
    expect(needsNewTreatment(treated)).toBe(false);
  });

  it('only lets a strenuous activity fail on a recovering treated injury', () => {
    expect(canFailStrenuous(treated)).toBe(true);
    expect(canFailStrenuous(injury({ status: 'recovering' }))).toBe(false);
    expect(canFailStrenuous({ ...treated, strenuousFailure: { treatmentId: 't2' } as never })).toBe(false);
  });
});

describe('healing types', () => {
  it('maps the option of the form to the type the API takes', () => {
    expect(healingTypeOf('medicine')).toBeUndefined();
    expect(healingTypeOf('magic')).toBe('magic-or-herbs');
    expect(healingTypeOf('magic-and-herbs')).toBe('magic-and-herbs');
  });

  it('gives a translation key per type, falling back to none', () => {
    expect(healingTypeKey('medicine')).toBe('healing-medicine-success');
    expect(healingTypeKey('none')).toBe('none');
  });
});

describe('character lookups', () => {
  const character = {
    skills: [
      { skillId: 'medicine', specialization: 'x', totalBonus: 40 },
      { skillId: 'medicine', totalBonus: 10 },
      { skillId: 'body-development', ranks: 7 },
    ],
    conditions: [{ id: 'a' }, { id: 'b', resolvedAt: '2026-01-01' }],
  } as unknown as Character;

  it('prefers the skill without specialization', () => {
    expect(skillBonus(character, 'medicine')).toBe(10);
    expect(skillBonus(character, 'nope')).toBeUndefined();
  });

  it('reads the ranks of body development, 0 without the skill', () => {
    expect(bodyDevelopmentRanks(character)).toBe(7);
    expect(bodyDevelopmentRanks({ skills: [] } as unknown as Character)).toBe(0);
  });

  it('lists the conditions not resolved', () => {
    expect(activeConditions(character).map((condition) => condition.id)).toEqual(['a']);
  });
});
