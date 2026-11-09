import {
  CraftingEnhancement,
  CraftingPlan,
  CraftingQualityDto,
  craftItem,
  EconomyRules,
  Item,
  quoteCraft,
  roundGold,
} from '@labcabrera-rmu/rmu-react-shared-lib';

export type PayerOption = 'recipient' | 'faction' | 'free';

const DEFAULT_MATERIALS_PERCENT = 50;

/** The share of the average cost that the materials cost, for `amount` items. */
const materialsOf = (averageCost: number, amount: number | null, rules: EconomyRules | undefined): number =>
  roundGold((averageCost * (amount ?? 1) * (rules?.materialsPercent ?? DEFAULT_MATERIALS_PERCENT)) / 100);

/** Price of the materials of one item of the catalog. */
export const materialsPriceOf = (item: Item, rules: EconomyRules | undefined): number =>
  materialsOf(item.info.cost?.average ?? 0, 1, rules);

/** The materials the craft costs: what was typed in, or the share of the item cost. */
export const estimatedMaterials = (
  item: Item | undefined,
  amount: number | null,
  rules: EconomyRules | undefined,
  materialsCost: number | null
): number => materialsCost ?? materialsOf(item?.info.cost?.average ?? 0, amount, rules);

/** The cost of the craft: the quote of the API when there is one, or the materials and enhancements typed in. */
export const craftCost = (
  plan: CraftingPlan | undefined,
  planError: string | undefined,
  materials: number,
  enhancementsCost: number | null
): number => (plan && !planError ? plan.cost.total : roundGold(materials + (enhancementsCost ?? 0)));

/** The quality as the API takes it: the blunt switch defaults to the attack table of the weapon. */
export const qualityForApi = (quality: CraftingQualityDto, blunt: boolean): CraftingQualityDto | undefined => {
  const dto: CraftingQualityDto = { ...quality };
  if (dto.materialId && dto.blunt === undefined && blunt) dto.blunt = true;
  return Object.keys(dto).length > 0 ? dto : undefined;
};

/** The quality can go on: the plan was quoted and a circumstantial masterwork says which circumstance it is. */
export const isQualityReady = (quality: CraftingQualityDto, planError: string | undefined): boolean =>
  !planError && (quality.masterwork !== 'circumstantial' || !!quality.circumstance?.trim());

/** Sum of the modifiers the plan adds on its own to the craft roll. */
export const automaticModifier = (plan: CraftingPlan | undefined): number =>
  (plan?.modifiers ?? []).reduce((sum, modifier) => sum + modifier.value, 0);

interface CraftInput {
  item: Item;
  amount: number | null;
  quality?: CraftingQualityDto;
  materialsCost: number | null;
  enhancementsCost: number | null;
}

/** What the API needs to quote the plan. */
export const buildQuoteDto = ({
  item,
  amount,
  quality,
  materialsCost,
  enhancementsCost,
}: CraftInput): Parameters<typeof quoteCraft>[0] => ({
  itemTypeId: item.id,
  ...(item.info.stackable && amount ? { amount } : {}),
  ...(quality ? { quality } : {}),
  ...(materialsCost !== null ? { materialsCost } : {}),
  ...(enhancementsCost ? { enhancementsCost } : {}),
});

type CraftDto = Parameters<typeof craftItem>[0];

/** The craft request, without its empty fields. */
export const buildCraftDto = (
  input: CraftInput & {
    maneuver: CraftDto['maneuver'];
    to: CraftDto['to'];
    payer: PayerOption;
    factionId?: string;
    enhancements: CraftingEnhancement[];
    name: string;
  }
): CraftDto => ({
  itemTypeId: input.item.id,
  maneuver: input.maneuver,
  to: input.to,
  ...(input.payer === 'free' ? { free: true } : {}),
  ...(input.payer === 'faction' && input.factionId ? { payer: { kind: 'faction', id: input.factionId } } : {}),
  ...(input.item.info.stackable && input.amount ? { amount: input.amount } : {}),
  ...(input.materialsCost !== null ? { materialsCost: input.materialsCost } : {}),
  ...(input.enhancements.length > 0 ? { enhancements: input.enhancements.filter((e) => e.value !== 0) } : {}),
  ...(input.enhancementsCost ? { enhancementsCost: input.enhancementsCost } : {}),
  ...(input.name.trim() ? { name: input.name.trim() } : {}),
  ...(input.quality ? { quality: input.quality } : {}),
});
