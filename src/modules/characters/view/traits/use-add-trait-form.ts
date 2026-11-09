/* eslint-disable react-hooks/exhaustive-deps */
import { Dispatch, SetStateAction, useEffect, useMemo, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import {
  addCharacterTrait,
  Character,
  DevPointsPool,
  fetchTraits,
  MULTILINGUAL_TRAIT_ID,
  StrategicGame,
  Trait,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useQuery } from '@tanstack/react-query';
import { isGameMaster } from '../../../shared/permissions';
import {
  emptyMultilingualRows,
  isMultilingualValid,
  MultilingualRow,
  toLanguageRanks,
} from './MultilingualRanksPicker';
import { PrerequisiteChoice, traitKey } from './TraitPurchaseRules';
import {
  evaluatePrerequisites,
  evaluateTraitPurchase,
  evaluateTraitRow,
  findOwnedTrait,
  flawLimitReason,
  groupTraitRows,
  initialTier,
  isTierValid,
  linkableTalents,
  orderedCategories,
  talentPurchaseRulesOf,
  TRAIT_FILTER_ALL,
  TraitBlockReason,
  TraitPurchase,
  TraitTypeFilter,
} from './trait-rules';
import { useTraitName } from './use-trait-text';

interface AddTraitForm {
  search: string;
  typeFilter: TraitTypeFilter;
  category: string;
  onlyAffordable: boolean;
  selected?: Trait;
  tier?: number;
  specialization?: string;
  showDetail: boolean;
  submitting: boolean;
  /** Spec 076: the pool that pays the trait. */
  pool: DevPointsPool;
  /** Spec 076: the languages of Multilingual. */
  languageRows: MultilingualRow[];
  /** Spec 077: the prerequisite the game master grants. */
  chosenPrerequisite: PrerequisiteChoice;
  prerequisiteNote: string;
  /** Spec 077: the talent a flaw is linked to. */
  linkKey: string;
  restricted: boolean;
  restrictedNote: string;
}

const PURCHASE_RULES_RESET = {
  chosenPrerequisite: 'auto',
  prerequisiteNote: '',
  linkKey: '',
  restricted: false,
  restrictedNote: '',
} as const;

const freshForm = (): AddTraitForm => ({
  search: '',
  typeFilter: TRAIT_FILTER_ALL,
  category: TRAIT_FILTER_ALL,
  onlyAffordable: false,
  selected: undefined,
  tier: undefined,
  specialization: undefined,
  showDetail: false,
  submitting: false,
  pool: 'auto',
  languageRows: emptyMultilingualRows(1),
  ...PURCHASE_RULES_RESET,
});

const merge = (state: AddTraitForm, patch: Partial<AddTraitForm>): AddTraitForm => ({ ...state, ...patch });

/** State, catalog, purchase evaluation and submission of the add trait dialog. Everything is reset on close. */
export const useAddTraitForm = ({
  character,
  setCharacter,
  strategicGame,
  open,
  onClose,
}: {
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  strategicGame?: StrategicGame;
  open: boolean;
  onClose: () => void;
}) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useApiNotify();
  const traitName = useTraitName();
  const [form, update] = useReducer(merge, undefined, freshForm);
  const { search, typeFilter, category, onlyAffordable, selected, tier, specialization, pool } = form;
  const gameMaster = isGameMaster(auth, strategicGame);
  const rulesOn = talentPurchaseRulesOf(strategicGame);

  // Every trait at once, kept while the dialog is open: with `open` in the key each opening reads them again.
  const traitsQuery = useQuery({
    queryKey: ['add-trait-catalog', open],
    queryFn: () => fetchTraits('', 0, 500, auth).then((page) => page.content),
    enabled: open,
    gcTime: 0,
  });
  const traits = traitsQuery.data;

  useEffect(() => {
    if (traitsQuery.error) notify.error(traitsQuery.error);
  }, [traitsQuery.error]);

  const handleClose = () => {
    update(freshForm());
    onClose();
  };

  const rows = useMemo(
    () =>
      (traits ?? []).map((trait) => ({ trait, check: evaluateTraitRow(character, strategicGame, trait, gameMaster) })),
    [traits, character, strategicGame, gameMaster]
  );
  const catalog = useMemo(() => new Map((traits ?? []).map((trait) => [trait.id, trait])), [traits]);
  const categories = useMemo(() => orderedCategories(rows), [rows]);
  const groups = useMemo(
    () => groupTraitRows(rows, { search, typeFilter, category, onlyAffordable }, traitName),
    [rows, search, typeFilter, category, onlyAffordable, t]
  );

  const selectTrait = (trait: Trait) =>
    update({
      selected: trait,
      specialization: undefined,
      tier: initialTier(character, trait, undefined, gameMaster),
      languageRows: emptyMultilingualRows(1),
      ...PURCHASE_RULES_RESET,
      showDetail: true,
    });

  const changeSpecialization = (value: string) =>
    update({
      specialization: value || undefined,
      ...(selected ? { tier: initialTier(character, selected, value || undefined, gameMaster) } : {}),
    });

  const current = selected ? findOwnedTrait(character, selected.id, specialization || undefined) : undefined;
  const basePurchase =
    selected &&
    evaluateTraitPurchase(character, strategicGame, selected, tier, specialization || undefined, pool, {
      restricted: gameMaster && form.restricted,
      gameMaster,
    });
  // Spec 077, C11: the prerequisite of each new tier, and the limits of the flaws
  const chosenType = rulesOn && form.chosenPrerequisite !== 'auto' ? form.chosenPrerequisite : undefined;
  const acquisitions =
    selected && rulesOn
      ? evaluatePrerequisites(character, selected, tier, specialization || undefined, chosenType)
      : [];
  const linkable = selected ? linkableTalents(character, selected, catalog) : [];
  const linkTalent = current?.linkedTo
    ? character.traits.find((owned) => traitKey(owned) === traitKey(current.linkedTo!))
    : linkable.find((owned) => traitKey(owned) === form.linkKey);
  const rulesBlocked: TraitBlockReason | undefined = !basePurchase
    ? undefined
    : acquisitions.some((entry) => !entry.type)
      ? { key: 'trait-reason-prerequisite-unmet' }
      : selected
        ? flawLimitReason(character, selected, specialization || undefined, basePurchase.cost, linkTalent, rulesOn)
        : undefined;
  const purchase: TraitPurchase | undefined = basePurchase && {
    ...basePurchase,
    blocked: basePurchase.blocked ?? rulesBlocked,
  };
  // Multilingual needs the languages that receive its ranks; improving a tier grants none
  const multilingual = selected?.id === MULTILINGUAL_TRAIT_ID && !purchase?.isImprovement;
  const valid =
    !!selected &&
    !!purchase &&
    !purchase.blocked &&
    isTierValid(selected, tier) &&
    (!selected.specialization || !!specialization) &&
    (!multilingual || isMultilingualValid(form.languageRows));

  const submit = () => {
    if (!selected || !valid) return;
    update({ submitting: true });
    addCharacterTrait(
      character.id,
      {
        traitId: selected.id,
        tier: selected.isTierBased ? tier : undefined,
        specialization,
        pool: purchase?.poolChoosable && pool !== 'auto' ? pool : undefined,
        languageRanks: multilingual ? toLanguageRanks(form.languageRows) : undefined,
        prerequisite: chosenType
          ? { type: chosenType, ...(form.prerequisiteNote.trim() ? { note: form.prerequisiteNote.trim() } : {}) }
          : undefined,
        linkedTo:
          !current && linkTalent
            ? {
                traitId: linkTalent.traitId,
                ...(linkTalent.specialization ? { specialization: linkTalent.specialization } : {}),
              }
            : undefined,
        restricted:
          gameMaster && form.restricted && !current?.restricted ? { note: form.restrictedNote.trim() } : undefined,
      },
      auth
    )
      .then((updated) => {
        setCharacter(updated);
        handleClose();
      })
      .catch((error) => {
        update({ submitting: false });
        notify.error(error);
      });
  };

  return {
    form,
    update,
    traits,
    categories,
    groups,
    catalog,
    gameMaster,
    rulesOn,
    current,
    purchase,
    acquisitions,
    linkable,
    multilingual,
    valid,
    selectTrait,
    changeSpecialization,
    submit,
    handleClose,
  };
};

export type AddTraitFormState = ReturnType<typeof useAddTraitForm>;
