import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Box, Checkbox, FormControlLabel, Grid, Stack, Typography } from '@mui/material';
import { Character, NumericInput, restCharacter, RmuDialog } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useHealingTables } from '../../../api/healing-tables';
import { useStrategicNotify } from '../../../services/notify-service';

const HOURS_PER_DAY = 24;
// Rest values of spec 013 §4, used only when the healing tables of rmu-api-core cannot be read.
const FALLBACK_HP_PERCENT = 10;
const FALLBACK_PERIOD_HOURS = 2;
const FALLBACK_FULL_REST_MULTIPLIER = 2;
const POWER_PERIOD_HOURS = 2;
const POWER_PERIODS_PER_DAY = 4;

/** Passes time resting (spec 013 §6.4): hours or days and complete rest, with a preview of hits and days. */
const RestDialog: FC<{
  character: Character;
  open: boolean;
  onClose: () => void;
  onRested: (character: Character) => void;
}> = ({ character, open, onClose, onRested }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useStrategicNotify();
  const tables = useHealingTables();
  const [hours, setHours] = useState(0);
  const [days, setDays] = useState(0);
  const [fullRest, setFullRest] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setHours(0);
    setDays(0);
    setFullRest(false);
  }, [open]);

  const percent = tables?.restHpPercentPerPeriod ?? FALLBACK_HP_PERCENT;
  const periodHours = tables?.restPeriodHours ?? FALLBACK_PERIOD_HOURS;
  const fullRestMultiplier = tables?.fullRestDayMultiplier ?? FALLBACK_FULL_REST_MULTIPLIER;

  // Same computation as rmu-api-strategic: every hour counts for the hits, whole days for the injury counters.
  const totalHours = hours + days * HOURS_PER_DAY;
  const periods = Math.floor(totalHours / periodHours);
  const { max, current } = character.hp;
  const hpAfter = current >= max ? current : Math.min(max, current + Math.floor((periods * max * percent) / 100));
  const elapsedDays = days + Math.floor(hours / HOURS_PER_DAY);
  const counterDays = elapsedDays * (fullRest ? fullRestMultiplier : 1);
  // Power points (spec 029): 10% of the maximum per 2 complete hours, at most 8 hours a day, as rmu-api-strategic
  const powerPeriods =
    elapsedDays * POWER_PERIODS_PER_DAY + Math.min(POWER_PERIODS_PER_DAY, Math.floor((hours % HOURS_PER_DAY) / POWER_PERIOD_HOURS));
  const power = character.power;
  const powerAfter = power
    ? Math.min(power.max, Math.max(power.current, power.current + Math.ceil((power.max * powerPeriods) / 10)))
    : undefined;
  const recovering = (character.injuries || []).filter((injury) => injury.status === 'recovering' && injury.recovery);
  const dead = character.status === 'dead';

  const save = () => {
    setSaving(true);
    restCharacter(character.id, { hours: hours || undefined, days: days || undefined, fullRest }, auth)
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
      onConfirmDisabled={saving || dead || totalHours === 0}
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        {dead && <Alert severity="error">{t('err-character-dead')}</Alert>}
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <NumericInput
              integer
              min={0}
              allowNegatives={false}
              label={t('hours')}
              value={hours}
              onChange={(value) => setHours(value ?? 0)}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
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
        <FormControlLabel
          control={<Checkbox checked={fullRest} onChange={(_, checked) => setFullRest(checked)} />}
          label={t('full-rest')}
        />
        <Typography variant="caption" color="text.secondary">
          {t('rest-help', { percent, hours: periodHours, multiplier: fullRestMultiplier })}
        </Typography>
        <Box>
          <Typography variant="body2">
            {t('rest-preview-hp', { before: current, after: hpAfter, max, gain: hpAfter - current })}
          </Typography>
          {power && powerAfter !== undefined && (
            <Typography variant="body2">
              {t('rest-preview-power', { before: power.current, after: powerAfter, max: power.max, gain: powerAfter - power.current })}
            </Typography>
          )}
          <Typography variant="body2">{t('rest-preview-days', { count: counterDays })}</Typography>
          {recovering.map((injury) => (
            <Typography key={injury.id} variant="caption" color="text.secondary" component="div">
              {t('rest-preview-injury', {
                type: t(`injury-type-${injury.type}`),
                remaining: Math.max(0, (injury.recovery?.remainingDays ?? 0) - counterDays),
              })}
            </Typography>
          ))}
        </Box>
      </Stack>
    </RmuDialog>
  );
};

export default RestDialog;
