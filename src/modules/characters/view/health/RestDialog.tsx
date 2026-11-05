import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Box, Checkbox, FormControlLabel, Grid, Stack, Typography } from '@mui/material';
import {
  ACTIVE_SLEEP_HOURS_PER_DAY,
  Character,
  NumericInput,
  restCharacter,
  RmuDialog,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useHealingTables } from '../../../api/healing-tables';
import { useStrategicNotify } from '../../../services/notify-service';

const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
// Rest values of spec 013 §4, used only when the healing tables of rmu-api-core cannot be read.
const FALLBACK_HP_PERCENT = 10;
const FALLBACK_PERIOD_HOURS = 2;
const FALLBACK_FULL_REST_MULTIPLIER = 2;
const POWER_PERIOD_HOURS = 2;
const POWER_PERIODS_PER_DAY = 4;

/**
 * Passes time resting (spec 013 §6.4): minutes, hours or days and complete rest, with a preview of hits, days and
 * fatigue (spec 077: one point per minute of the whole rest). Workspace spec 079, C2: an active character (travels,
 * works) only recovers in 8 sleep hours of each whole day, and its untreated injuries do not improve.
 */
const RestDialog: FC<{
  character: Character;
  open: boolean;
  onClose: () => void;
  onRested: (character: Character) => void;
  /** Starting values, like the rest still pending from a step of time of the campaign (spec 065) */
  initial?: { hours: number; days: number; fullRest: boolean; minutes?: number; active?: boolean };
}> = ({ character, open, onClose, onRested, initial }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useStrategicNotify();
  const tables = useHealingTables();
  const [minutes, setMinutes] = useState(0);
  const [hours, setHours] = useState(0);
  const [days, setDays] = useState(0);
  const [fullRest, setFullRest] = useState(false);
  const [active, setActive] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMinutes(initial?.minutes ?? 0);
    setHours(initial?.hours ?? 0);
    setDays(initial?.days ?? 0);
    setFullRest(initial?.fullRest ?? false);
    setActive(initial?.active ?? false);
  }, [open]);

  const percent = tables?.restHpPercentPerPeriod ?? FALLBACK_HP_PERCENT;
  const periodHours = tables?.restPeriodHours ?? FALLBACK_PERIOD_HOURS;
  const fullRestMultiplier = tables?.fullRestDayMultiplier ?? FALLBACK_FULL_REST_MULTIPLIER;

  // Same computation as rmu-api-strategic: every hour counts for the hits, whole days for the injury counters.
  const totalHours = hours + days * HOURS_PER_DAY;
  const elapsedDays = days + Math.floor(hours / HOURS_PER_DAY);
  // Spec 079, C2: an active character only sleeps 8 hours of each whole day, and never rests completely
  const restHours = active ? elapsedDays * ACTIVE_SLEEP_HOURS_PER_DAY : totalHours;
  const periods = Math.floor(restHours / periodHours);
  const { max, current } = character.hp;
  const hpAfter = current >= max ? current : Math.min(max, current + Math.floor((periods * max * percent) / 100));
  const counterDays = elapsedDays * (fullRest && !active ? fullRestMultiplier : 1);
  // Power points (spec 029): 10% of the maximum per 2 complete hours, at most 8 hours a day, as rmu-api-strategic
  const powerPeriods =
    elapsedDays * POWER_PERIODS_PER_DAY +
    (active ? 0 : Math.min(POWER_PERIODS_PER_DAY, Math.floor((hours % HOURS_PER_DAY) / POWER_PERIOD_HOURS)));
  const power = character.power;
  const powerAfter = power
    ? Math.min(power.max, Math.max(power.current, power.current + Math.ceil((power.max * powerPeriods) / 10)))
    : undefined;
  // Spec 077 (§5.5), as rmu-api-strategic: one point of fatigue per minute of the whole rest
  const fatigueBefore = Math.abs(character.endurance?.fatiguePenalty ?? 0);
  const fatigueAfter = Math.max(0, fatigueBefore - (restHours * MINUTES_PER_HOUR + (active ? 0 : minutes)));
  const recovering = (character.injuries || []).filter((injury) => injury.status === 'recovering' && injury.recovery);
  const injuryDays = (untreated?: boolean) => (active && untreated ? 0 : counterDays);
  const dead = character.status === 'dead';

  const save = () => {
    setSaving(true);
    restCharacter(
      character.id,
      {
        minutes: minutes || undefined,
        hours: hours || undefined,
        days: days || undefined,
        fullRest: fullRest && !active,
        active: active || undefined,
      },
      auth
    )
      .then((updated) => {
        onRested(updated);
        notify.success(t('rest-applied'));
        onClose();
      })
      .catch(notify.error)
      .finally(() => setSaving(false));
  };

  return (
    <RmuDialog
      open={open}
      title={t('pass-time')}
      subtitle={character.name}
      maxWidth="sm"
      onCancel={onClose}
      onConfirm={save}
      onConfirmDisabled={saving || dead || (totalHours === 0 && minutes === 0)}
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        {dead && <Alert severity="error">{t('err-character-dead')}</Alert>}
        <Grid container spacing={2}>
          <Grid size={{ xs: 4 }}>
            <NumericInput
              integer
              min={0}
              allowNegatives={false}
              label={t('minutes')}
              value={minutes}
              onChange={(value) => setMinutes(value ?? 0)}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <NumericInput
              integer
              min={0}
              allowNegatives={false}
              label={t('hours')}
              value={hours}
              onChange={(value) => setHours(value ?? 0)}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <NumericInput
              integer
              min={0}
              allowNegatives={false}
              label={t('days')}
              value={days}
              onChange={(value) => setDays(value ?? 0)}
            />
          </Grid>
        </Grid>
        <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={fullRest && !active}
                disabled={active}
                onChange={(_, checked) => setFullRest(checked)}
              />
            }
            label={t('full-rest')}
          />
          <FormControlLabel
            control={<Checkbox checked={active} onChange={(_, checked) => setActive(checked)} />}
            label={t('rest-active')}
          />
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {active
            ? t('rest-active-help', { hours: ACTIVE_SLEEP_HOURS_PER_DAY })
            : t('rest-help', { percent, hours: periodHours, multiplier: fullRestMultiplier })}
        </Typography>
        <Box>
          <Typography variant="body2">
            {t('rest-preview-hp', { before: current, after: hpAfter, max, gain: hpAfter - current })}
          </Typography>
          {power && powerAfter !== undefined && (
            <Typography variant="body2">
              {t('rest-preview-power', {
                before: power.current,
                after: powerAfter,
                max: power.max,
                gain: powerAfter - power.current,
              })}
            </Typography>
          )}
          {fatigueBefore > 0 && (
            <Typography variant="body2">
              {t('rest-preview-fatigue', { before: -fatigueBefore, after: -fatigueAfter })}
            </Typography>
          )}
          <Typography variant="body2">{t('rest-preview-days', { count: counterDays })}</Typography>
          {recovering.map((injury) => (
            <Typography key={injury.id} variant="caption" color="text.secondary" component="div">
              {t('rest-preview-injury', {
                type: t(`injury-type-${injury.type}`),
                remaining: Math.max(0, (injury.recovery?.remainingDays ?? 0) - injuryDays(injury.recovery?.untreated)),
              })}
            </Typography>
          ))}
        </Box>
      </Stack>
    </RmuDialog>
  );
};

export default RestDialog;
