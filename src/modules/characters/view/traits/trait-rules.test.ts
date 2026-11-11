import { Character, StrategicGame, Trait } from '@labcabrera-rmu/rmu-react-shared-lib';
import { describe, expect, it } from 'vitest';
import {
  evaluatePrerequisites,
  evaluateTraitPurchase,
  evaluateTraitRow,
  findOwnedTrait,
  flawLimitReason,
  groupTraitRows,
  initialTier,
  isTierValid,
  orderedCategories,
  prerequisiteValues,
  TraitRowData,
} from './trait-rules';

const character = (overrides: Partial<Record<string, unknown>> = {}) =>
  ({
    traits: [],
    skills: [],
    info: { professionId: 'fighter', race: { id: 'human' } },
    experience: { level: 5, availableDevPoints: 10, availableBonusDevPoints: 0 },
    ...overrides,
  }) as unknown as Character;

const trait = (overrides: Partial<Trait> = {}) =>
  ({ id: 'tough', name: 'Tough', category: 'combat', isTalent: true, adquisitionCost: 5, ...overrides }) as Trait;

const game = (options: object = {}, powerLevel: object = {}) => ({ options, powerLevel }) as unknown as StrategicGame;

describe('evaluateTraitPurchase', () => {
  it('charges the normal points when they are enough', () => {
    const result = evaluateTraitPurchase(character(), game(), trait(), undefined);
    expect(result).toMatchObject({ cost: 5, charged: 5, blocked: undefined, poolChoosable: true });
    expect(result.payment.normal).toBe(5);
  });

  it('refuses it when the points are not enough', () => {
    const poor = character({ experience: { level: 5, availableDevPoints: 2 } });
    const result = evaluateTraitPurchase(poor, game(), trait(), undefined);
    expect(result.blocked?.key).toBe('trait-reason-not-affordable');
  });

  it('refuses a cost above the maximum of the power level', () => {
    const result = evaluateTraitPurchase(character(), game(), trait({ adquisitionCost: 99 }), undefined);
    expect(result.blocked?.key).toBe('trait-reason-max-cost');
  });

  it('charges only the difference on an owned tier based trait bought higher', () => {
    const owner = character({ traits: [{ traitId: 'tough', tier: 1, cost: 5, isTalent: true }] });
    const result = evaluateTraitPurchase(owner, game(), trait({ isTierBased: true, maxTier: 3, tierCost: 3 }), 2);
    expect(result).toMatchObject({ isImprovement: true, cost: 8, charged: 3, blocked: undefined });
  });

  it('halves the cost of a restricted talent rounding up', () => {
    const result = evaluateTraitPurchase(
      character(),
      game(),
      trait({ adquisitionCost: 5 }),
      undefined,
      undefined,
      'auto',
      {
        restricted: true,
      }
    );
    expect(result.cost).toBe(3);
  });

  it('returns the points of a flaw to the normal pool', () => {
    const result = evaluateTraitPurchase(
      character(),
      game(),
      trait({ isTalent: false, adquisitionCost: -5 }),
      undefined
    );
    expect(result.charged).toBe(-5);
    expect(result.pools).toEqual(['normal']);
    expect(result.payment.normal).toBe(-5);
  });

  it('asks the game master to worsen an owned flaw', () => {
    const owner = character({ traits: [{ traitId: 'tough', tier: 1, cost: -5, isTalent: false }] });
    const flaw = trait({ isTalent: false, isTierBased: true, maxTier: 3, adquisitionCost: -5, tierCost: -2 });
    expect(evaluateTraitPurchase(owner, game(), flaw, 2).blocked?.key).toBe('trait-reason-flaw-worsen-master');
    expect(
      evaluateTraitPurchase(owner, game(), flaw, 2, undefined, 'auto', { gameMaster: true }).blocked
    ).toBeUndefined();
  });

  it('only takes bonus points under the race points policy at creation', () => {
    const newcomer = character({ experience: { level: 1, availableDevPoints: 10, availableBonusDevPoints: 1 } });
    const result = evaluateTraitPurchase(
      newcomer,
      game({ talentPolicy: 'race-points-at-creation' }),
      trait(),
      undefined
    );
    expect(result.blocked?.key).toBe('err-talent-policy-bonus-points-only');
    expect(result.poolChoosable).toBe(false);
  });

  it('blocks new talents after creation under the race points policy', () => {
    const result = evaluateTraitPurchase(
      character(),
      game({ talentPolicy: 'race-points-at-creation' }),
      trait(),
      undefined
    );
    expect(result.blocked?.key).toBe('err-talent-policy-creation-only');
  });

  it('caps the bonus pool by what is left in the level', () => {
    const veteran = character({
      experience: { level: 5, availableBonusDevPoints: 10, bonusDevPointsSpentThisLevel: 0, availableDevPoints: 0 },
    });
    const capped = evaluateTraitPurchase(
      veteran,
      game({}, { raceDevPointsPerLevel: 3 }),
      trait(),
      undefined,
      undefined,
      'bonus'
    );
    expect(capped.payment.bonus).toBe(3);
    expect(capped.blocked?.key).toBe('trait-reason-not-affordable');
  });
});

describe('initialTier', () => {
  const tiered = trait({ isTierBased: true, maxTier: 3 });

  it('is undefined without tiers', () => {
    expect(initialTier(character(), trait())).toBeUndefined();
  });

  it('is the first tier for a new trait and the next one for an owned talent', () => {
    expect(initialTier(character(), tiered)).toBe(1);
    const owner = character({ traits: [{ traitId: 'tough', tier: 2 }] });
    expect(initialTier(owner, tiered)).toBe(3);
  });

  it('proposes an owned flaw one tier lower unless the game master can still worsen it', () => {
    const flaw = trait({ isTalent: false, isTierBased: true, maxTier: 3 });
    const owner = character({ traits: [{ traitId: 'tough', tier: 2 }] });
    expect(initialTier(owner, flaw)).toBe(1);
    expect(initialTier(owner, flaw, undefined, true)).toBe(3);
  });
});

describe('findOwnedTrait', () => {
  it('ignores race traits and matches the specialization', () => {
    const owner = character({
      traits: [
        { traitId: 'tough', source: 'race' },
        { traitId: 'tough', specialization: 'a' },
      ],
    });
    expect(findOwnedTrait(owner, 'tough')).toBeUndefined();
    expect(findOwnedTrait(owner, 'tough', 'a')?.specialization).toBe('a');
  });
});

describe('evaluateTraitRow', () => {
  it('judges a specialized trait as a new purchase even when one specialization is owned', () => {
    const owner = character({ traits: [{ traitId: 'tough', specialization: 'a', cost: 5 }] });
    expect(evaluateTraitRow(owner, game(), trait({ specialization: 'skill' as never })).blocked).toBeUndefined();
  });
});

describe('prerequisiteValues', () => {
  it('reads comma separated text and arrays', () => {
    expect(prerequisiteValues('a, b ,')).toEqual(['a', 'b']);
    expect(prerequisiteValues(['a', 1])).toEqual(['a', '1']);
    expect(prerequisiteValues(null)).toEqual([]);
  });
});

describe('evaluatePrerequisites', () => {
  const talent = (prerequisites: object[], overrides: Partial<Trait> = {}) =>
    trait({ prerequisites: prerequisites as never, ...overrides });

  it('is empty for a talent without prerequisites or a flaw', () => {
    expect(evaluatePrerequisites(character(), talent([]), 1)).toEqual([]);
    expect(
      evaluatePrerequisites(character(), talent([{ type: 'race', value: 'human' }], { isTalent: false }), 1)
    ).toEqual([]);
  });

  it('finds the race of the character', () => {
    expect(evaluatePrerequisites(character(), talent([{ type: 'race', value: 'human' }]), 1)).toEqual([
      { tier: 1, type: 'race', value: 'human' },
    ]);
  });

  it('leaves the tier without type when nothing fits', () => {
    expect(evaluatePrerequisites(character(), talent([{ type: 'race', value: 'dwarf' }]), 1)).toEqual([{ tier: 1 }]);
  });

  it('grants a skill tier per block of ranks, counting those used', () => {
    const skilled = character({ skills: [{ skillId: 'fencing', ranks: 10 }] });
    const entries = evaluatePrerequisites(
      skilled,
      talent([{ type: 'skill', value: 'fencing' }], { isTierBased: true, maxTier: 2 }),
      2
    );
    expect(entries).toEqual([{ tier: 1, type: 'skill', value: 'fencing' }, { tier: 2 }]);
  });
});

describe('flawLimitReason', () => {
  const flaw = trait({ id: 'weak', isTalent: false });

  it('does nothing for talents', () => {
    expect(flawLimitReason(character(), trait(), undefined, 5, undefined, true)).toBeUndefined();
  });

  it('only applies to loose flaws with the purchase rules on', () => {
    expect(flawLimitReason(character(), flaw, undefined, -50, undefined, false)).toBeUndefined();
    expect(flawLimitReason(character(), flaw, undefined, -50, undefined, true)?.key).toBe('err-flaw-limit');
  });

  it('allows one loose flaw only', () => {
    const owner = character({ traits: [{ traitId: 'other', isTalent: false, cost: -5 }] });
    expect(flawLimitReason(owner, flaw, undefined, -5, undefined, true)?.key).toBe('err-flaw-limit');
  });

  it('keeps the linked flaws within the cost of the talent', () => {
    const link = { traitId: 'tough', cost: 5 } as never;
    expect(flawLimitReason(character(), flaw, undefined, -6, link, true)?.key).toBe('err-flaw-linked-exceeds');
    expect(flawLimitReason(character(), flaw, undefined, -5, link, true)).toBeUndefined();
  });
});

describe('the list of the dialog', () => {
  const row = (id: string, category: string, isTalent = true, blocked?: string): TraitRowData => ({
    trait: trait({ id, name: id, category, isTalent }),
    check: { blocked: blocked ? { key: blocked } : undefined } as TraitRowData['check'],
  });
  const filter = { search: '', typeFilter: 'all' as const, category: 'all', onlyAffordable: false };
  const name = (item: Trait) => item.name;

  it('orders the unknown categories last and sorts the rows by name', () => {
    const rows = [row('b', 'zzz'), row('c', 'combat'), row('a', 'combat')];
    expect(orderedCategories(rows)).toEqual(['combat', 'zzz']);
    expect(groupTraitRows(rows, filter, name).map(([, items]) => items.map((item) => item.trait.id))).toEqual([
      ['a', 'c'],
      ['b'],
    ]);
  });

  it('filters by type, category and search text', () => {
    const rows = [row('sword', 'combat'), row('blind', 'combat', false)];
    expect(groupTraitRows(rows, { ...filter, typeFilter: 'flaw' }, name)[0][1]).toHaveLength(1);
    expect(groupTraitRows(rows, { ...filter, category: 'magical' }, name)).toEqual([]);
    expect(groupTraitRows(rows, { ...filter, search: 'SWO' }, name)[0][1][0].trait.id).toBe('sword');
  });

  it('hides only what the cost blocks when asked for the affordable ones', () => {
    const rows = [
      row('rich', 'combat', true, 'trait-reason-max-cost'),
      row('owned', 'combat', true, 'trait-reason-owned'),
    ];
    const visible = groupTraitRows(rows, { ...filter, onlyAffordable: true }, name)[0][1];
    expect(visible.map((item) => item.trait.id)).toEqual(['owned']);
  });

  it('checks the chosen tier against the maximum', () => {
    const tiered = trait({ isTierBased: true, maxTier: 3 });
    expect(isTierValid(trait(), undefined)).toBe(true);
    expect(isTierValid(tiered, undefined)).toBe(false);
    expect(isTierValid(tiered, 4)).toBe(false);
    expect(isTierValid(tiered, 3)).toBe(true);
  });
});
