/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Step,
  StepButton,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import {
  Character,
  formatBonus,
  HealerCandidate,
  HealerPicker,
  HealerSelection,
  InjuryCard,
  KeyValue,
  resolveHealer,
  RmuDialog,
  RollBreakdown,
  RollInput,
  RollModifier,
  rollCharacterInjuryPermanent,
  rollCharacterInjuryRecovery,
  SelectDifficulty,
  treatCharacterInjury,
  TreatInjuryDto,
  TreatmentProcedure,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useHealingTables } from '../../../api/healing-tables';
import { useStrategicNotify } from '../../../services/notify-service';
import {
  ALL_PROCEDURES,
  bodyDevelopmentRanks,
  defaultDifficulty,
  HEALING_OPTIONS,
  HealingOption,
  healingTypeKey,
  healingTypeOf,
  isTreatable,
  latestTreatment,
  procedureExtraDifficulty,
  recoveryMultiplierOf,
  suggestedProcedures,
} from './health-rules';

type StepId = 'healer' | 'treatment' | 'recovery';
const STEPS: StepId[] = ['healer', 'treatment', 'recovery'];

const Line: FC<{ label: string; value: ReactNode }> = ({ label, value }) => (
  <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
      {value}
    </Typography>
  </Stack>
);

/**
 * Healing of one injury in three steps that can be done apart (spec 013 §6.3): the healer, the treatment (Medicine
 * maneuver) and the recovery roll, with the permanent injury roll when the recovery asks for it.
 */
const InjuryHealingDialog: FC<{
  character: Character;
  injuryId?: string;
  /** Characters of the strategic game that can heal, the character itself included. */
  healers: HealerCandidate[];
  open: boolean;
  initialStep?: StepId;
  onClose: () => void;
  onUpdated: (character: Character) => void;
}> = ({ character, injuryId, healers, open, initialStep = 'healer', onClose, onUpdated }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useStrategicNotify();
  const tables = useHealingTables();
  const injury = (character.injuries || []).find((item) => item.id === injuryId);
  const dead = character.status === 'dead';

  const [step, setStep] = useState<StepId>(initialStep);
  const [healer, setHealer] = useState<HealerSelection>({ mode: 'self' });
  const [procedure, setProcedure] = useState<TreatmentProcedure>('dress');
  const [showAll, setShowAll] = useState(false);
  const [difficulty, setDifficulty] = useState<KeyValue>();
  const [roll, setRoll] = useState<number | null>(null);
  const [healingOption, setHealingOption] = useState<HealingOption>('medicine');
  const [herbalismEnabled, setHerbalismEnabled] = useState(false);
  const [herbalismRoll, setHerbalismRoll] = useState<number | null>(null);
  const [treated, setTreated] = useState(false);
  const [recoveryRoll, setRecoveryRoll] = useState<number | null>(null);
  const [recoveryDone, setRecoveryDone] = useState(false);
  const [permanentRequired, setPermanentRequired] = useState(false);
  const [permanentRoll, setPermanentRoll] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const procedures = useMemo(
    () => (injury ? (showAll ? ALL_PROCEDURES : suggestedProcedures(injury)) : ALL_PROCEDURES),
    [injury, showAll]
  );

  // Fresh state each time the dialog opens on an injury.
  useEffect(() => {
    if (!open || !injury) return;
    const first = suggestedProcedures(injury)[0];
    setStep(initialStep);
    setHealer({ mode: 'self' });
    setShowAll(false);
    setProcedure(first);
    setDifficulty(defaultDifficulty(injury, first));
    setRoll(null);
    setHealingOption('medicine');
    setHerbalismEnabled(false);
    setHerbalismRoll(null);
    setTreated(false);
    setRecoveryRoll(null);
    setRecoveryDone(false);
    setPermanentRequired(false);
    setPermanentRoll(null);
  }, [open, injuryId]);

  if (!injury) return null;

  const resolvedHealer = resolveHealer(healer, healers, character.id);
  const extraDifficulty = procedureExtraDifficulty(injury, procedure);
  const difficultyValue = (difficulty?.value ?? 0) + extraDifficulty;
  const isMagic = procedure === 'magic';

  const changeProcedure = (next: TreatmentProcedure) => {
    setProcedure(next);
    setDifficulty(defaultDifficulty(injury, next));
    if (next === 'magic') setHealingOption('magic');
    else if (next === 'herbs') setHealingOption('herbs');
    else if (healingOption === 'magic' || healingOption === 'herbs') setHealingOption('medicine');
  };

  const run = (request: Promise<Character>, after: (updated: Character) => void) => {
    setBusy(true);
    request
      .then((updated) => {
        onUpdated(updated);
        after(updated);
      })
      .catch(notify.error)
      .finally(() => setBusy(false));
  };

  const submitTreatment = () => {
    if (!resolvedHealer) return;
    const dto: TreatInjuryDto = {
      procedure,
      difficulty: difficultyValue,
      healingType: healingTypeOf(healingOption),
      ...(isMagic ? {} : { roll: roll ?? undefined }),
      ...(resolvedHealer.characterId
        ? { healerCharacterId: resolvedHealer.characterId }
        : {
            healer: {
              name: resolvedHealer.name,
              bonus: resolvedHealer.medicine,
              herbalismBonus: resolvedHealer.herbalism,
            },
          }),
      ...(herbalismEnabled && herbalismRoll !== null
        ? {
            herbalism: resolvedHealer.characterId
              ? { roll: herbalismRoll, healerCharacterId: resolvedHealer.characterId }
              : { roll: herbalismRoll, bonus: resolvedHealer.herbalism },
          }
        : {}),
    };
    run(treatCharacterInjury(character.id, injury.id, dto, auth), (updated) => {
      setTreated(true);
      const treatment = (updated.injuries || []).find((item) => item.id === injury.id)?.treatments.slice(-1)[0];
      if (treatment) notify.success(t('treatment-applied', { result: t(treatment.result) }));
    });
  };

  const submitRecovery = () => {
    if (recoveryRoll === null) return;
    run(rollCharacterInjuryRecovery(character.id, injury.id, { roll: recoveryRoll }, auth), (updated) => {
      setRecoveryDone(true);
      setPermanentRequired(
        Boolean((updated as Character & { permanentCheckRequired?: boolean }).permanentCheckRequired)
      );
    });
  };

  const submitPermanent = () => {
    if (permanentRoll === null) return;
    run(rollCharacterInjuryPermanent(character.id, injury.id, { roll: permanentRoll }, auth), () => {
      setPermanentRequired(false);
      setPermanentRoll(null);
    });
  };

  // Treatment preview: roll + Medicine bonus + difficulty (+ Herbalism bonus if that roll succeeds).
  const treatmentPreview = isMagic ? undefined : (roll ?? 0) + (resolvedHealer?.medicine ?? 0) + difficultyValue;
  const treatmentDisabled =
    dead ||
    busy ||
    !resolvedHealer ||
    !isTreatable(injury) ||
    (!isMagic && roll === null) ||
    (herbalismEnabled && herbalismRoll === null);

  // Recovery preview: Body Development ranks + Co bonus + type of healing - |penalty|.
  const latest = latestTreatment(injury);
  const healingType = latest?.healingType ?? 'none';
  const healingTypeModifier = tables
    ? (tables.healingTypeModifiers[healingType] ?? 0) +
      (latest?.result === 'partial-success' ? latest.recoveryModifier || 0 : 0)
    : undefined;
  const recoveryModifiers: RollModifier[] = [
    { key: 'body-development-ranks', value: bodyDevelopmentRanks(character) },
    { key: 'constitution-bonus', value: character.statistics.co?.totalBonus ?? 0 },
    ...(healingTypeModifier !== undefined ? [{ key: healingTypeKey(healingType), value: healingTypeModifier }] : []),
    { key: 'injury-penalty', value: -Math.abs(injury.penalty || 0) },
  ];
  const raceMultiplier = recoveryMultiplierOf(character);
  const recovery = injury.recovery;
  const canRollRecovery = !dead && injury.type !== 'unknown' && injury.status !== 'permanent' && isTreatable(injury);
  const canRollPermanent =
    !dead && !!recovery && !injury.permanent && (permanentRequired || injury.severity !== 'light');

  const healerStep = (
    <Stack spacing={2}>
      <HealerPicker characters={healers} selfId={character.id} value={healer} onChange={setHealer} />
      <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
        <Button variant="contained" disabled={!resolvedHealer} onClick={() => setStep('treatment')}>
          {t('next')}
        </Button>
      </Stack>
    </Stack>
  );

  const treatmentStep = (
    <Stack spacing={2}>
      {!resolvedHealer && <Alert severity="info">{t('healing-choose-healer-first')}</Alert>}
      {resolvedHealer && (
        <Typography variant="body2" color="text.secondary">
          {t('healing-healer-summary', {
            name: resolvedHealer.name,
            medicine: formatBonus(resolvedHealer.medicine),
          })}
        </Typography>
      )}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            fullWidth
            label={t('treatment-procedure')}
            value={procedures.includes(procedure) ? procedure : ''}
            onChange={(event) => changeProcedure(event.target.value as TreatmentProcedure)}
          >
            {procedures.map((option) => (
              <MenuItem key={option} value={option}>
                {t(`procedure-${option}`)}
              </MenuItem>
            ))}
          </TextField>
          <FormControlLabel
            control={<Checkbox size="small" checked={showAll} onChange={(_, checked) => setShowAll(checked)} />}
            label={t('treatment-show-all-procedures')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            fullWidth
            label={t('healing-type')}
            value={healingOption}
            onChange={(event) => setHealingOption(event.target.value as HealingOption)}
          >
            {HEALING_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {t(`healing-option-${option}`)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        {!isMagic && (
          <>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SelectDifficulty
                label={t('difficulty')}
                value={difficulty?.key ?? ''}
                onChange={(value) => setDifficulty(value)}
              />
              {injury.location === 'head' && (
                <Typography variant="caption" color="text.secondary">
                  {t('treatment-head-harder')}
                </Typography>
              )}
              {extraDifficulty !== 0 && (
                <Typography variant="caption" color="text.secondary" component="div">
                  {t('treatment-cauterize-extra', { value: extraDifficulty })}
                </Typography>
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RollInput value={roll} onChange={setRoll} openEnded />
            </Grid>
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Checkbox checked={herbalismEnabled} onChange={(_, checked) => setHerbalismEnabled(checked)} />
                }
                label={t('treatment-herbalism-roll')}
              />
              {herbalismEnabled && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
                  <RollInput label={t('herbalism')} value={herbalismRoll} onChange={setHerbalismRoll} openEnded />
                  <Typography variant="body2" color="text.secondary">
                    {t('treatment-herbalism-help', {
                      bonus: formatBonus(resolvedHealer?.herbalism ?? 0),
                      value: tables ? formatBonus(tables.herbalismBonus) : '',
                    })}
                  </Typography>
                </Stack>
              )}
            </Grid>
          </>
        )}
      </Grid>
      {isMagic ? (
        <Alert severity="info">{t('treatment-magic-help')}</Alert>
      ) : (
        <Box>
          <Line label={t('roll')} value={roll ?? '-'} />
          <Line label={t('medicine')} value={formatBonus(resolvedHealer?.medicine ?? 0)} />
          <Line label={t('difficulty')} value={formatBonus(difficultyValue)} />
          <Line label={t('total')} value={treatmentPreview} />
          {herbalismEnabled && (
            <Typography variant="caption" color="text.secondary">
              {t('treatment-herbalism-preview')}
            </Typography>
          )}
        </Box>
      )}
      {treated && latest && (
        <Alert severity={latest.result.includes('failure') ? 'warning' : 'success'}>
          {t('treatment-last-result', {
            procedure: t(`procedure-${latest.procedure}`),
            total: latest.total,
            result: t(latest.result),
            healingType: t(healingTypeKey(latest.healingType)),
          })}
        </Alert>
      )}
      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
        <Button onClick={() => setStep('recovery')}>{t('next')}</Button>
        <Button variant="contained" disabled={treatmentDisabled} onClick={submitTreatment}>
          {t('treat')}
        </Button>
      </Stack>
    </Stack>
  );

  const recoveryStep = (
    <Stack spacing={2}>
      {injury.type === 'unknown' && <Alert severity="warning">{t('err-injury-type-required')}</Alert>}
      {!latest && <Alert severity="info">{t('recovery-untreated-help')}</Alert>}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <RecoveryBreakdown modifiers={recoveryModifiers} roll={recoveryRoll} />
          {healingTypeModifier === undefined && (
            <Typography variant="caption" color="text.secondary">
              {t('healing-tables-unavailable-preview')}
            </Typography>
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack spacing={1.5}>
            <RollInput
              label={t('recovery-roll')}
              value={recoveryRoll}
              onChange={setRecoveryRoll}
              openEnded
              disabled={!canRollRecovery}
            />
            <Button
              variant="contained"
              disabled={!canRollRecovery || busy || recoveryRoll === null}
              onClick={submitRecovery}
            >
              {recovery ? t('recovery-roll-again') : t('recovery-roll')}
            </Button>
          </Stack>
        </Grid>
      </Grid>
      {recovery && (
        <Box>
          {recoveryDone && (
            <Alert severity="success" sx={{ mb: 1 }}>
              {t('recovery-total-days', { count: recovery.totalDays })}
            </Alert>
          )}
          <Line label={t('roll')} value={recovery.roll} />
          <Line label={t('modifier')} value={formatBonus(recovery.modifiers)} />
          <Line label={t('total')} value={recovery.total} />
          <Line label={t('recovery-base-days')} value={recovery.baseDays} />
          <Line label={t('recovery-multiplier')} value={`×${recovery.multiplier}`} />
          <Line label={t('recovery-total-days-label')} value={recovery.totalDays} />
          <Line label={t('recovery-remaining-days')} value={recovery.remainingDays} />
          <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.5 }}>
            {t('recovery-multiplier-help', { value: raceMultiplier ?? 1 })}
          </Typography>
        </Box>
      )}
      {canRollPermanent && (
        <Stack spacing={1.5}>
          {permanentRequired ? (
            <Alert severity="warning">{t('permanent-check-required')}</Alert>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t('permanent-injury-help')}
            </Typography>
          )}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
            <RollInput label={t('permanent-roll')} value={permanentRoll} onChange={setPermanentRoll} openEnded />
            <Button variant="outlined" disabled={busy || permanentRoll === null} onClick={submitPermanent}>
              {t('permanent-roll')}
            </Button>
          </Stack>
        </Stack>
      )}
      {injury.permanent && (
        <Chip
          color="secondary"
          variant="outlined"
          label={t('permanent-penalty-value', { value: injury.permanent.penalty })}
          sx={{ alignSelf: 'flex-start' }}
        />
      )}
    </Stack>
  );

  const content: Record<StepId, ReactNode> = { healer: healerStep, treatment: treatmentStep, recovery: recoveryStep };

  return (
    <RmuDialog open={open} title={t('heal-injury')} subtitle={character.name} maxWidth="md" onClose={onClose}>
      <Stack spacing={2} sx={{ pt: 1 }}>
        <InjuryCard injury={injury} dense />
        {dead && <Alert severity="error">{t('err-character-dead')}</Alert>}
        <Stepper nonLinear activeStep={STEPS.indexOf(step)}>
          {STEPS.map((id) => (
            <Step
              key={id}
              completed={(id === 'treatment' && (treated || !!latest)) || (id === 'recovery' && !!recovery)}
            >
              <StepButton onClick={() => setStep(id)}>{t(`healing-step-${id}`)}</StepButton>
            </Step>
          ))}
        </Stepper>
        <Box>{content[step]}</Box>
      </Stack>
    </RmuDialog>
  );
};

const RecoveryBreakdown: FC<{ modifiers: RollModifier[]; roll: number | null }> = ({ modifiers, roll }) => {
  const { t } = useTranslation();
  return <RollBreakdown modifiers={modifiers} roll={roll} totalLabel={t('recovery-total')} />;
};

export type { StepId as HealingStepId };
export default InjuryHealingDialog;
