import { CraftingPlan, EconomyRules, Item } from '@labcabrera-rmu/rmu-react-shared-lib';
import { describe, expect, it } from 'vitest';
import {
  automaticModifier,
  buildCraftDto,
  buildQuoteDto,
  craftCost,
  estimatedMaterials,
  isQualityReady,
  materialsPriceOf,
  qualityForApi,
} from './craft-rules';

const item = (overrides: Partial<Record<string, unknown>> = {}) =>
  ({ id: 'sword', info: { cost: { average: 10 }, stackable: false, ...overrides } }) as unknown as Item;
const rules = (materialsPercent: number) => ({ materialsPercent }) as EconomyRules;

describe('materials', () => {
  it('uses the percent of the rules, half the cost by default', () => {
    expect(materialsPriceOf(item(), rules(30))).toBe(3);
    expect(materialsPriceOf(item(), undefined)).toBe(5);
  });

  it('multiplies by the amount, and a typed-in cost wins', () => {
    expect(estimatedMaterials(item(), 2, rules(30), null)).toBe(6);
    expect(estimatedMaterials(item(), 2, rules(30), 1)).toBe(1);
    expect(estimatedMaterials(undefined, 2, rules(30), null)).toBe(0);
  });
});

describe('craftCost', () => {
  const plan = { cost: { total: 42 }, modifiers: [{ value: 5 }, { value: -2 }] } as unknown as CraftingPlan;

  it('takes the quote unless it failed', () => {
    expect(craftCost(plan, undefined, 1, 1)).toBe(42);
    expect(craftCost(plan, 'err', 1, 1)).toBe(2);
    expect(craftCost(undefined, undefined, 1, null)).toBe(1);
  });

  it('sums the modifiers of the plan', () => {
    expect(automaticModifier(plan)).toBe(3);
    expect(automaticModifier(undefined)).toBe(0);
  });
});

describe('quality', () => {
  it('is undefined when empty, and blunt defaults only on a material of a blunt weapon', () => {
    expect(qualityForApi({}, true)).toBeUndefined();
    expect(qualityForApi({ materialId: 'iron' }, true)).toEqual({ materialId: 'iron', blunt: true });
    expect(qualityForApi({ materialId: 'iron' }, false)).toEqual({ materialId: 'iron' });
    expect(qualityForApi({ materialId: 'iron', blunt: false }, true)).toEqual({ materialId: 'iron', blunt: false });
  });

  it('requires a circumstance for a circumstantial masterwork', () => {
    expect(isQualityReady({}, undefined)).toBe(true);
    expect(isQualityReady({}, 'err')).toBe(false);
    expect(isQualityReady({ masterwork: 'circumstantial' }, undefined)).toBe(false);
    expect(isQualityReady({ masterwork: 'circumstantial', circumstance: ' moon ' }, undefined)).toBe(true);
  });
});

describe('requests', () => {
  it('quotes without the empty fields', () => {
    expect(
      buildQuoteDto({ item: item(), amount: 3, quality: undefined, materialsCost: null, enhancementsCost: null })
    ).toEqual({ itemTypeId: 'sword' });
    expect(
      buildQuoteDto({
        item: item({ stackable: true }),
        amount: 3,
        quality: { materialId: 'iron' },
        materialsCost: 0,
        enhancementsCost: 2,
      })
    ).toEqual({
      itemTypeId: 'sword',
      amount: 3,
      quality: { materialId: 'iron' },
      materialsCost: 0,
      enhancementsCost: 2,
    });
  });

  const craft = {
    item: item(),
    amount: 1,
    quality: undefined,
    materialsCost: null,
    enhancementsCost: null,
    maneuver: { actorId: 'a' } as never,
    to: { kind: 'character', id: 'c' } as never,
    payer: 'recipient' as const,
    enhancements: [],
    name: '  ',
  };

  it('drops the empty fields of a craft', () => {
    expect(buildCraftDto(craft)).toEqual({ itemTypeId: 'sword', maneuver: craft.maneuver, to: craft.to });
  });

  it('sets the payer and trims the name', () => {
    expect(buildCraftDto({ ...craft, payer: 'free' }).free).toBe(true);
    expect(buildCraftDto({ ...craft, payer: 'faction', factionId: 'f' }).payer).toEqual({ kind: 'faction', id: 'f' });
    expect(buildCraftDto({ ...craft, payer: 'faction' }).payer).toBeUndefined();
    expect(buildCraftDto({ ...craft, name: ' X ' }).name).toBe('X');
  });

  it('sends only the enhancements with a value', () => {
    const enhancements = [
      { appliesTo: 'attack', value: 0 },
      { appliesTo: 'attack', value: 5 },
    ] as never;
    expect(buildCraftDto({ ...craft, enhancements }).enhancements).toEqual([{ appliesTo: 'attack', value: 5 }]);
  });
});
