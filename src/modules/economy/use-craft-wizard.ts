/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import {
  CraftingEnhancement,
  CraftingPlan,
  CraftingQualityDto,
  craftItem,
  craftKind,
  EconomyRules,
  fetchEconomyRules,
  fetchMaterials,
  isBluntWeapon,
  Item,
  itemCatalogFilters,
  ItemOperationResult,
  Material,
  quoteCraft,
  useApiNotify,
  useItemCatalog,
  useListFilters,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useBusyAction } from '../shared/useBusyAction';
import { CRAFT_SKILLS } from './ItemOperationDialogs';
import { defaultSkillKey, emptyManeuver, isManeuverReady, ManeuverValue, toManeuverDto } from './ManeuverFields';
import {
  automaticModifier,
  buildCraftDto,
  buildQuoteDto,
  craftCost,
  estimatedMaterials,
  isQualityReady,
  PayerOption,
  qualityForApi,
} from './craft-rules';
import { GOLD_COIN, HolderView } from './use-holder';

export const CRAFT_STEPS = [
  'craft-step-type',
  'craft-step-craftsman',
  'craft-step-quality',
  'craft-step-enhancements',
  'craft-step-roll',
];

/** Quote the plan once the inputs stop changing. */
const QUOTE_DELAY_MS = 300;

interface CraftForm {
  step: number;
  itemType?: Item;
  actorId: string;
  maneuver: ManeuverValue;
  payer: PayerOption;
  amount: number | null;
  name: string;
  materialsCost: number | null;
  enhancementsCost: number | null;
  enhancements: CraftingEnhancement[];
  /** Spec 043: the quality of the craft. */
  quality: CraftingQualityDto;
}

const merge = (state: CraftForm, patch: Partial<CraftForm>): CraftForm => ({ ...state, ...patch });

/** State, quote and request of the craft wizard. */
export const useCraftWizard = (view: HolderView, onDone: () => void) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useApiNotify();
  const filters = useListFilters<Item>(itemCatalogFilters(t));
  const catalog = useItemCatalog({ exclude: [GOLD_COIN] });
  const craftsmen = view.members;
  const [form, update] = useReducer(merge, undefined, (): CraftForm => {
    const actorId = view.character?.id ?? craftsmen[0]?.id ?? '';
    const actor = craftsmen.find((member) => member.id === actorId) ?? view.character;
    return {
      step: 0,
      itemType: undefined,
      actorId,
      maneuver: emptyManeuver(defaultSkillKey(actor, CRAFT_SKILLS), 'm'),
      payer: 'recipient',
      amount: 1,
      name: '',
      materialsCost: null,
      enhancementsCost: null,
      enhancements: [],
      quality: {},
    };
  });
  const { itemType, actorId, amount, materialsCost, enhancementsCost, quality, maneuver, step } = form;
  const actor = craftsmen.find((member) => member.id === actorId) ?? view.character;
  const [rules, setRules] = useState<EconomyRules>();
  const { busy, run } = useBusyAction();
  const [result, setResult] = useState<ItemOperationResult>();
  const [materialList, setMaterialList] = useState<Material[] | null>(null);
  const [materialsError, setMaterialsError] = useState(false);
  // Spec 043: the plan the API quotes for the quality
  const [plan, setPlan] = useState<CraftingPlan>();
  const [planError, setPlanError] = useState<string>();
  const kind = itemType ? craftKind(itemType) : 'other';
  const blunt = itemType ? isBluntWeapon(itemType) : false;

  useEffect(() => {
    fetchEconomyRules(auth).then(setRules).catch(notify.error);
    // Materials are rulebook content: without access the craft goes on without them
    fetchMaterials(auth)
      .then(setMaterialList)
      .catch(() => setMaterialsError(true));
  }, []);

  const qualityDto = useMemo(() => qualityForApi(quality, blunt), [quality, blunt]);

  useEffect(() => {
    if (!itemType) return;
    let active = true;
    const timer = setTimeout(() => {
      quoteCraft(buildQuoteDto({ item: itemType, amount, quality: qualityDto, materialsCost, enhancementsCost }), auth)
        .then((quoted) => {
          if (!active) return;
          setPlan(quoted);
          setPlanError(undefined);
        })
        .catch(
          (e: { code?: string; errorCode?: string; message?: string }) =>
            active && setPlanError(e.code ?? e.errorCode ?? e.message ?? 'error')
        );
    }, QUOTE_DELAY_MS);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [itemType, amount, qualityDto, materialsCost, enhancementsCost]);

  const materials = useMemo(
    () => estimatedMaterials(itemType, amount, rules, materialsCost),
    [itemType, amount, rules, materialsCost]
  );

  const selectItem = (item: Item) => {
    update({ itemType: item, quality: {}, step: 1 });
    setPlan(undefined);
  };

  const reset = () => {
    setResult(undefined);
    setPlan(undefined);
    update({
      step: 0,
      itemType: undefined,
      enhancements: [],
      name: '',
      materialsCost: null,
      enhancementsCost: null,
      quality: {},
      maneuver: { ...maneuver, roll: null, unmodifiedRoll: undefined },
    });
  };

  const craft = () => {
    if (!itemType || !actorId) return;
    run(
      craftItem(
        buildCraftDto({
          ...form,
          item: itemType,
          maneuver: { ...toManeuverDto(maneuver), actorId },
          to: view.holder,
          factionId: view.faction?.id,
          quality: qualityDto,
        }),
        auth
      ),
      (data) => {
        setResult(data);
        onDone();
      }
    );
  };

  const qualityReady = isQualityReady(quality, planError);
  const canNext = [
    !!itemType,
    !!actorId,
    qualityReady,
    true,
    isManeuverReady(actor, maneuver) && !busy && qualityReady,
  ][step];

  return {
    form,
    update,
    filters,
    catalog,
    rules,
    craftsmen,
    actor,
    busy,
    result,
    kind,
    blunt,
    materialList,
    materialsError,
    plan,
    planError,
    materials,
    cost: craftCost(plan, planError, materials, enhancementsCost),
    canNext,
    automatic: automaticModifier(plan),
    selectItem,
    reset,
    craft,
  };
};

export type CraftWizardState = ReturnType<typeof useCraftWizard>;
