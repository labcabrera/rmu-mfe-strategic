/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import {
  apiErrorCode,
  CastSupport,
  Character,
  fetchCharacterTreatmentDifficulty,
  fetchStrategicItems,
  HealerCandidate,
  HealerSelection,
  herbTreats,
  Injury,
  KeyValue,
  requiresSurgery,
  resolveHealer,
  rollCharacterInjuryPermanent,
  rollCharacterInjuryRecovery,
  StrategicItem,
  treatCharacterInjury,
  TreatmentProcedure,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useQuery } from '@tanstack/react-query';
import { useHealingTables } from '../../../api/healing-tables';
import {
  ALL_PROCEDURES,
  HealingOption,
  isRecoveryRolled,
  isUntreated,
  latestTreatment,
  recoveryMultiplierOf,
} from './health-rules';
import {
  availableProcedures,
  buildTreatmentDto,
  canRollPermanent,
  canRollRecovery,
  firstProcedure,
  healingOptionAfter,
  isTreatmentReady,
  recoveryPreview,
  resolveDifficulty,
  salveRangeOf,
  TreatmentDifficulties,
  treatmentPreview,
  usesHerbs,
} from './injury-healing-rules';

export type HealingStepId = 'healer' | 'treatment' | 'recovery';

interface HealingForm {
  step: HealingStepId;
  healer: HealerSelection;
  procedure: TreatmentProcedure;
  showAll: boolean;
  /** Override of the game master for the difficulty (undefined: the table's). */
  override?: KeyValue;
  roll: number | null;
  healingOption: HealingOption;
  herbalismEnabled: boolean;
  herbalismRoll: number | null;
  /** Spec 062: the herb carried by the character that is used. */
  herbItemId: string;
  /** Workspace spec 068: the support of a cast leg, the salve modifier and a refusal for want of surgery. */
  castSupport: CastSupport;
  salveModifier: number;
  surgeryRefused: boolean;
  treated: boolean;
  recoveryRoll: number | null;
  recoveryDone: boolean;
  permanentRequired: boolean;
  permanentRoll: number | null;
}

const freshForm = (step: HealingStepId, procedure: TreatmentProcedure): HealingForm => ({
  step,
  healer: { mode: 'self' },
  procedure,
  showAll: false,
  override: undefined,
  roll: null,
  healingOption: 'medicine',
  herbalismEnabled: false,
  herbalismRoll: null,
  herbItemId: '',
  castSupport: 'none',
  salveModifier: 0,
  surgeryRefused: false,
  treated: false,
  recoveryRoll: null,
  recoveryDone: false,
  permanentRequired: false,
  permanentRoll: null,
});

const merge = (state: HealingForm, patch: Partial<HealingForm>): HealingForm => ({ ...state, ...patch });

/** Treatment difficulties from the API, again when a treatment changes what they depend on. */
const useTreatmentDifficulties = (characterId: string, injury: Injury, open: boolean) => {
  const auth = useAuth();
  const [difficulties, setDifficulties] = useState<TreatmentDifficulties>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoaded(false);
    Promise.allSettled(
      ALL_PROCEDURES.map((option) => fetchCharacterTreatmentDifficulty(characterId, injury.id, option, auth))
    ).then((results) => {
      if (!active) return;
      const next: TreatmentDifficulties = {};
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') next[ALL_PROCEDURES[index]] = result.value;
      });
      setDifficulties(next);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [open, injury.id, injury.type, injury.severity, injury.location, injury.bleeding]);

  useEffect(() => {
    if (open) setDifficulties({});
  }, [open, injury.id]);

  return { difficulties, loaded };
};

interface InjuryHealingParams {
  character: Character;
  injury: Injury;
  /** Characters of the strategic game that can heal, the character itself included. */
  healers: HealerCandidate[];
  healerPenalties: Record<string, number>;
  open: boolean;
  initialStep: HealingStepId;
  onUpdated: (character: Character) => void;
}

/** State, data and requests of the healing dialog of an injury. */
export const useInjuryHealing = ({
  character,
  injury,
  healers,
  healerPenalties,
  open,
  initialStep,
  onUpdated,
}: InjuryHealingParams) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const tables = useHealingTables();
  const dead = character.status === 'dead';
  const [form, update] = useReducer(merge, undefined, () => freshForm(initialStep, 'dress'));
  const [busy, setBusy] = useState(false);
  const { difficulties, loaded: difficultiesLoaded } = useTreatmentDifficulties(character.id, injury, open);
  const { procedure, healingOption, roll } = form;
  const surgeryOnly = form.surgeryRefused || requiresSurgery(injury, tables?.surgeryRequired);
  const salveRange = salveRangeOf(tables);

  const procedures = useMemo(
    () => availableProcedures(injury, form.showAll, difficulties, surgeryOnly),
    [injury, form.showAll, difficulties, surgeryOnly]
  );

  // Keep a procedure that fits once the difficulties arrive.
  useEffect(() => {
    if (procedures.length > 0 && !procedures.includes(procedure)) update({ procedure: procedures[0] });
  }, [procedures]);

  // Fresh state each time the dialog opens on an injury.
  useEffect(() => {
    if (open) update(freshForm(initialStep, firstProcedure(injury)));
  }, [open, injury.id]);

  const injuryType = injury.type;
  const herbsQuery = useQuery({
    // With `open` in the key each opening reads them again
    queryKey: ['injury-herbs', character.id, injuryType, open],
    queryFn: () =>
      fetchStrategicItems(`characterId==${character.id}`, 0, 1000, auth)
        .then((page) =>
          page.content.filter(
            (item) => item.category === 'herb' && herbTreats(item.catalog?.features?.herb, injuryType)
          )
        )
        .catch((): StrategicItem[] => []),
    enabled: open,
    gcTime: 0,
  });
  const herbs = herbsQuery.data ?? [];

  const resolvedHealer = resolveHealer(form.healer, healers, character.id);
  const healerPenalty = resolvedHealer?.characterId ? healerPenalties[resolvedHealer.characterId] || 0 : 0;
  const isMagic = procedure === 'magic';
  const askCastSupport = procedure === 'cast' && injury.location === 'leg';
  const salveInRange = form.salveModifier >= salveRange.min && form.salveModifier <= salveRange.max;
  const computed = difficulties[procedure];
  const difficulty = resolveDifficulty(computed, form.override);

  const changeProcedure = (next: TreatmentProcedure) =>
    update({ procedure: next, override: undefined, healingOption: healingOptionAfter(next, healingOption) });

  const run = (request: Promise<Character>, after: (updated: Character) => void) => {
    setBusy(true);
    request
      .then((updated) => {
        onUpdated(updated);
        after(updated);
      })
      .catch((error) => {
        // The tables of the client may be missing or stale: the refusal of the API leaves only surgery and magic.
        if (apiErrorCode(error) === 'err-treatment-surgery-required') update({ surgeryRefused: true });
        notify.error(error);
      })
      .finally(() => setBusy(false));
  };

  const submitTreatment = () => {
    if (!resolvedHealer) return;
    const dto = buildTreatmentDto({ ...form, healer: resolvedHealer, difficulty, askCastSupport });
    run(treatCharacterInjury(character.id, injury.id, dto, auth), (updated) => {
      update({ treated: true, override: undefined });
      const treatment = (updated.injuries || []).find((item) => item.id === injury.id)?.treatments.slice(-1)[0];
      if (treatment) notify.success(t('treatment-applied', { result: t(treatment.result) }));
    });
  };

  const submitRecovery = () => {
    if (form.recoveryRoll === null) return;
    run(rollCharacterInjuryRecovery(character.id, injury.id, { roll: form.recoveryRoll }, auth), (updated) =>
      update({
        recoveryDone: true,
        permanentRequired: Boolean(
          (updated as Character & { permanentCheckRequired?: boolean }).permanentCheckRequired
        ),
      })
    );
  };

  const submitPermanent = () => {
    if (form.permanentRoll === null) return;
    run(rollCharacterInjuryPermanent(character.id, injury.id, { roll: form.permanentRoll }, auth), () =>
      update({ permanentRequired: false, permanentRoll: null })
    );
  };

  const { modifiers: recoveryModifiers, healingTypeModifier } = recoveryPreview(character, injury, tables);

  return {
    injury,
    form,
    update,
    busy,
    dead,
    tables,
    herbs,
    procedures,
    surgeryOnly,
    salveRange,
    resolvedHealer,
    healerPenalty,
    difficultiesLoaded,
    computed,
    difficulty,
    isMagic,
    askCastSupport,
    salveInRange,
    usesHerbs: usesHerbs(procedure, healingOption),
    treatmentPreview: treatmentPreview(isMagic, roll, resolvedHealer?.medicine, healerPenalty, difficulty.value),
    treatmentDisabled:
      busy ||
      !isTreatmentReady(injury, {
        hasHealer: !!resolvedHealer,
        isMagic,
        procedure,
        roll,
        salveInRange,
        herbalismEnabled: form.herbalismEnabled,
        herbalismRoll: form.herbalismRoll,
      }),
    latest: latestTreatment(injury),
    recoveryModifiers,
    healingTypeModifier,
    raceMultiplier: recoveryMultiplierOf(character),
    recoveryRolled: isRecoveryRolled(injury),
    untreated: isUntreated(injury),
    canRollRecovery: canRollRecovery(injury, dead),
    canRollPermanent: canRollPermanent(injury, dead, form.permanentRequired),
    changeProcedure,
    submitTreatment,
    submitRecovery,
    submitPermanent,
  };
};

export type InjuryHealing = ReturnType<typeof useInjuryHealing>;
