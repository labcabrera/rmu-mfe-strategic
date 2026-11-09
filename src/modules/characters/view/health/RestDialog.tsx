import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Box, Checkbox, FormControlLabel, Grid, Stack, Typography } from '@mui/material';
import {
  ACTIVE_SLEEP_HOURS_PER_DAY,
  Character,
  NumericInput,
  restCharacter,
  RmuDialog,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useHealingTables } from '../../../api/healing-tables';
import { useBusyAction } from '../../../shared/useBusyAction';
import { previewRest, restRatesOf } from './rest-rules';

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
  const notify = useApiNotify();
  const tables = useHealingTables();
  const [minutes, setMinutes] = useState(0);
  const [hours, setHours] = useState(0);
  const [days, setDays] = useState(0);
  const [fullRest, setFullRest] = useState(false);
  const [active, setActive] = useState(false);
  const { busy: saving, run } = useBusyAction();

  useEffect(() => {
    if (!open) return;
    setMinutes(initial?.minutes ?? 0);
    setHours(initial?.hours ?? 0);
    setDays(initial?.days ?? 0);
    setFullRest(initial?.fullRest ?? false);
    setActive(initial?.active ?? false);
  }, [open]);

  const rates = restRatesOf(tables);
  const { percent, periodHours, fullRestMultiplier } = rates;
  const { max, current } = character.hp;
  const power = character.power;
  const { empty, hpAfter, powerAfter, fatigueBefore, fatigueAfter, counterDays, recovering } = previewRest(
    character,
    { minutes, hours, days, fullRest, active },
    rates
  );
  const dead = character.status === 'dead';

  const save = () => {
    run(
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
      ),
      (updated) => {
        onRested(updated);
        notify.success(t('rest-applied'));
        onClose();
      }
    );
  };

  return (
    <RmuDialog
      open={open}
      title={t('pass-time')}
      subtitle={character.name}
      maxWidth="sm"
      onCancel={onClose}
      onConfirm={save}
      onConfirmDisabled={saving || dead || empty}
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
          {recovering.map(({ injury, remainingDays }) => (
            <Typography key={injury.id} variant="caption" color="text.secondary" component="div">
              {t('rest-preview-injury', { type: t(`injury-type-${injury.type}`), remaining: remainingDays })}
            </Typography>
          ))}
        </Box>
      </Stack>
    </RmuDialog>
  );
};

export default RestDialog;
