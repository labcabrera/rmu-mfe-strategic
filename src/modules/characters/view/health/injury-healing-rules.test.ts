import { Character, HealingTables, Injury, KeyValue, TreatmentDifficulty } from '@labcabrera-rmu/rmu-react-shared-lib';
import { describe, expect, it } from 'vitest';
import {
  availableProcedures,
  buildTreatmentDto,
  canRollPermanent,
  canRollRecovery,
  firstProcedure,
  healingOptionAfter,
  herbBonuses,
  isTreatmentReady,
  ResolvedHealer,
  recoveryPreview,
  resolveDifficulty,
  treatmentPreview,
  usesHerbs,
} from './injury-healing-rules';

const injury = (overrides: Partial<Injury> = {}) =>
  ({ type: 'skin-tissue', severity: 'light', status: 'active', treatments: [], ...overrides }) as Injury;

describe('availableProcedures', () => {
  it('leaves surgery and magic for an injury that requires surgery', () => {
    expect(availableProcedures(injury(), false, {}, true)).toEqual(['surgery', 'magic']);
  });

  it('drops the procedures the API marks as not applicable', () => {
    const result = availableProcedures(injury(), false, { dress: { applicable: false } as TreatmentDifficulty }, false);
    expect(result).not.toContain('dress');
  });

  it('offers them all when asked, except what the injury refuses', () => {
    const result = availableProcedures(injury({ severity: 'severe' }), true, {}, false);
    expect(result).toContain('surgery');
    expect(result).not.toContain('stitches');
  });
});

describe('firstProcedure', () => {
  it('skips the suggestions the injury refuses', () => {
    expect(firstProcedure(injury({ bleeding: 1 }))).toBe('pressure');
    expect(firstProcedure(injury())).toBe('dress');
  });
});

describe('healingOptionAfter', () => {
  it('follows magic and herbs, and leaves them for medicine', () => {
    expect(healingOptionAfter('magic', 'medicine')).toBe('magic');
    expect(healingOptionAfter('herbs', 'medicine')).toBe('herbs');
    expect(healingOptionAfter('dress', 'magic')).toBe('medicine');
    expect(healingOptionAfter('dress', 'magic-and-herbs')).toBe('magic-and-herbs');
  });
});

describe('herbs', () => {
  it('uses them by procedure or by option', () => {
    expect(usesHerbs('herbs', 'medicine')).toBe(true);
    expect(usesHerbs('dress', 'magic-and-herbs')).toBe(true);
    expect(usesHerbs('dress', 'medicine')).toBe(false);
  });

  it('raises the recovery bonus only with magic and herbs together', () => {
    expect(herbBonuses('herbs').recovery).toBeLessThan(herbBonuses('magic-and-herbs').recovery);
  });
});

describe('resolveDifficulty', () => {
  const computed = { difficulty: -20, grade: 'hard', base: -30, bleedingModifier: 10 } as TreatmentDifficulty;

  it('takes the API value without an override', () => {
    expect(resolveDifficulty(computed)).toEqual({ extra: 10, value: -20, grade: 'hard', overridden: false });
  });

  it('applies an override over the bleeding extra', () => {
    const result = resolveDifficulty(computed, { key: 'easy', value: 0 } as KeyValue);
    expect(result).toEqual({ extra: 10, value: 10, grade: 'easy', overridden: true });
  });

  it('does not count as overridden when it repeats the table value', () => {
    expect(resolveDifficulty(computed, { key: 'hard', value: -30 } as KeyValue).overridden).toBe(false);
  });

  it('has no value before the API answers', () => {
    expect(resolveDifficulty().value).toBeUndefined();
  });
});

describe('treatmentPreview', () => {
  it('adds roll, medicine, penalties and difficulty', () => {
    expect(treatmentPreview(false, 50, 30, -10, -20)).toBe(50);
  });

  it('counts a missing roll or medicine as zero', () => {
    expect(treatmentPreview(false, null, undefined, 0, 5)).toBe(5);
  });

  it('is undefined for magic or a missing difficulty', () => {
    expect(treatmentPreview(true, 50, 30, 0, 5)).toBeUndefined();
    expect(treatmentPreview(false, 50, 30, 0, undefined)).toBeUndefined();
  });
});

describe('isTreatmentReady', () => {
  const ready = {
    hasHealer: true,
    isMagic: false,
    procedure: 'dress' as const,
    roll: 50,
    salveInRange: true,
    herbalismEnabled: false,
    herbalismRoll: null,
  };

  it('needs a healer, a treatable injury and a roll', () => {
    expect(isTreatmentReady(injury(), ready)).toBe(true);
    expect(isTreatmentReady(injury(), { ...ready, hasHealer: false })).toBe(false);
    expect(isTreatmentReady(injury({ status: 'healed' }), ready)).toBe(false);
    expect(isTreatmentReady(injury(), { ...ready, roll: null })).toBe(false);
  });

  it('does not need a roll for magic', () => {
    expect(isTreatmentReady(injury(), { ...ready, roll: null, isMagic: true })).toBe(true);
  });

  it('checks the salve range only on a salve, and the herbalism roll when asked for', () => {
    expect(isTreatmentReady(injury(), { ...ready, procedure: 'salve', salveInRange: false })).toBe(false);
    expect(isTreatmentReady(injury(), { ...ready, salveInRange: false })).toBe(true);
    expect(isTreatmentReady(injury(), { ...ready, herbalismEnabled: true })).toBe(false);
    expect(isTreatmentReady(injury(), { ...ready, herbalismEnabled: true, herbalismRoll: 40 })).toBe(true);
  });
});

describe('buildTreatmentDto', () => {
  const healer: ResolvedHealer = { characterId: 'h1', name: 'Hal', medicine: 20, herbalism: 10 } as ResolvedHealer;
  const base = {
    procedure: 'dress' as const,
    healingOption: 'medicine' as const,
    healer,
    difficulty: { extra: 0, value: -10, grade: 'x', overridden: false },
    roll: 50,
    herbItemId: '',
    castSupport: 'none' as const,
    salveModifier: 0,
    herbalismEnabled: false,
    herbalismRoll: null,
    askCastSupport: false,
  };

  it('sends a character healer and no difficulty unless overridden', () => {
    expect(buildTreatmentDto(base)).toEqual({
      procedure: 'dress',
      healingType: undefined,
      roll: 50,
      healerCharacterId: 'h1',
    });
    expect(buildTreatmentDto({ ...base, difficulty: { ...base.difficulty, overridden: true } }).difficulty).toBe(-10);
  });

  it('sends the typed-in healer with its bonuses', () => {
    const typed = { name: 'Nan', medicine: 5, herbalism: 2 } as ResolvedHealer;
    expect(buildTreatmentDto({ ...base, healer: typed }).healer).toEqual({
      name: 'Nan',
      bonus: 5,
      herbalismBonus: 2,
    });
  });

  it('leaves the roll out for magic', () => {
    expect(buildTreatmentDto({ ...base, procedure: 'magic' }).roll).toBeUndefined();
  });

  it('adds cast support, salve modifier and herb only when they apply', () => {
    expect(buildTreatmentDto({ ...base, askCastSupport: true, castSupport: 'rigid' as never }).castSupport).toBe(
      'rigid'
    );
    expect(buildTreatmentDto({ ...base, procedure: 'salve', salveModifier: 5 }).salveModifier).toBe(5);
    expect(buildTreatmentDto({ ...base, herbItemId: 'i1' }).herbItemId).toBeUndefined();
    expect(buildTreatmentDto({ ...base, procedure: 'herbs', herbItemId: 'i1' }).herbItemId).toBe('i1');
  });

  it('sends the herbalism roll with the way of knowing the healer', () => {
    expect(buildTreatmentDto({ ...base, herbalismEnabled: true, herbalismRoll: 30 }).herbalism).toEqual({
      roll: 30,
      healerCharacterId: 'h1',
    });
    const typed = { name: 'Nan', medicine: 5, herbalism: 2 } as ResolvedHealer;
    expect(buildTreatmentDto({ ...base, healer: typed, herbalismEnabled: true, herbalismRoll: 30 }).herbalism).toEqual({
      roll: 30,
      bonus: 2,
    });
  });
});

describe('recoveryPreview', () => {
  const character = {
    skills: [{ skillId: 'body-development', ranks: 3 }],
    statistics: { co: { totalBonus: 7 } },
  } as unknown as Character;
  const tables = { healingTypeModifiers: { none: -5, medicine: 10 } } as unknown as HealingTables;

  it('adds the type of healing only with the tables', () => {
    const entries = recoveryPreview(character, injury({ penalty: -10 }), undefined);
    expect(entries.healingTypeModifier).toBeUndefined();
    expect(entries.modifiers.map((modifier) => modifier.value)).toEqual([3, 7, -10]);
    expect(recoveryPreview(character, injury(), tables).healingTypeModifier).toBe(-5);
  });

  it('separates the extra of a partial success', () => {
    const partial = injury({
      treatments: [{ healingType: 'medicine', result: 'partial-success', recoveryModifier: 4 } as never],
    });
    const { modifiers, healingTypeModifier } = recoveryPreview(character, partial, tables);
    expect(healingTypeModifier).toBe(14);
    expect(modifiers.find((modifier) => modifier.key === 'partial-success')?.value).toBe(4);
    expect(modifiers.find((modifier) => modifier.key === 'healing-medicine-success')?.value).toBe(10);
  });
});

describe('recovery and permanent rolls', () => {
  it('asks for one recovery roll on a known treatable injury of a living character', () => {
    expect(canRollRecovery(injury(), false)).toBe(true);
    expect(canRollRecovery(injury(), true)).toBe(false);
    expect(canRollRecovery(injury({ type: 'unknown' }), false)).toBe(false);
    expect(canRollRecovery(injury({ recovery: { treatmentId: undefined } as never }), false)).toBe(false);
  });

  it('asks for the permanent roll on a recovered injury, always for an untreated one', () => {
    const recovered = { recovery: {} as never };
    expect(canRollPermanent(injury(), false, false)).toBe(false);
    expect(canRollPermanent(injury({ ...recovered, severity: 'light' }), false, false)).toBe(false);
    expect(canRollPermanent(injury({ ...recovered, severity: 'severe' }), false, false)).toBe(true);
    expect(canRollPermanent(injury({ ...recovered, severity: 'light' }), false, true)).toBe(true);
    expect(canRollPermanent(injury({ recovery: { untreated: true } as never, severity: 'light' }), false, false)).toBe(
      true
    );
    expect(canRollPermanent(injury({ ...recovered, permanent: {} as never }), false, true)).toBe(false);
    expect(canRollPermanent(injury({ ...recovered, severity: 'severe' }), true, false)).toBe(false);
  });
});
