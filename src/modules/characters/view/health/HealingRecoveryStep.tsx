import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Button, Chip, Grid, Stack, Typography } from '@mui/material';
import { formatBonus, OPEN_D100, RollBreakdown, RollField, RuleHint } from '@labcabrera-rmu/rmu-react-shared-lib';
import HealingLine from './HealingLine';
import { isTreatable } from './health-rules';
import { InjuryHealing } from './use-injury-healing';

/** Last step of the healing of an injury: the recovery roll, and the permanent injury roll when it asks for it. */
const HealingRecoveryStep: FC<{ healing: InjuryHealing }> = ({ healing }) => {
  const { t } = useTranslation();
  const {
    injury,
    form,
    update,
    busy,
    dead,
    recoveryModifiers,
    healingTypeModifier,
    raceMultiplier,
    recoveryRolled,
    untreated,
    canRollRecovery,
    canRollPermanent,
    submitRecovery,
    submitPermanent,
  } = healing;
  const { recoveryRoll, recoveryDone, permanentRequired, permanentRoll } = form;
  const recovery = injury.recovery;

  return (
    <Stack spacing={2}>
      {dead && <Alert severity="error">{t('err-character-dead')}</Alert>}
      {injury.type === 'unknown' && <Alert severity="warning">{t('err-injury-type-required')}</Alert>}
      {untreated && !recoveryRolled && <Alert severity="info">{t('recovery-untreated-help')}</Alert>}
      {recovery?.untreated && recoveryRolled && <Alert severity="info">{t('recovery-untreated-rolled')}</Alert>}
      {recoveryRolled && isTreatable(injury) && <Alert severity="info">{t('recovery-already-rolled')}</Alert>}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <RollBreakdown
            context="recovery"
            modifiers={recoveryModifiers}
            roll={recoveryRoll}
            totalLabel={t('recovery-total')}
          />
          {healingTypeModifier === undefined && (
            <Typography variant="caption" color="text.secondary">
              {t('healing-tables-unavailable-preview')}
            </Typography>
          )}
        </Grid>
        {/* One recovery roll per treatment: no roll again until a new treatment. */}
        {!recoveryRolled && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack spacing={1.5}>
              <RollField
                spec={OPEN_D100}
                label={t('recovery-roll')}
                value={recoveryRoll}
                onChange={(value) => update({ recoveryRoll: value.total })}
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
        )}
      </Grid>
      {recovery && (
        <Box>
          {recoveryDone && (
            <Alert severity="success" sx={{ mb: 1 }}>
              {t('recovery-total-days', { count: recovery.totalDays })}
            </Alert>
          )}
          {recovery.breakdown ? (
            <RollBreakdown
              context="recovery"
              modifiers={recovery.breakdown}
              roll={recovery.roll}
              total={recovery.total}
              totalLabel={t('recovery-total')}
            />
          ) : (
            <>
              <HealingLine label={t('roll')} value={recovery.roll} />
              <HealingLine label={t('modifier')} value={formatBonus(recovery.modifiers)} />
              <HealingLine label={t('total')} value={recovery.total} />
            </>
          )}
          {/* Spec 052: which column and multipliers give the days */}
          {recovery.days ? (
            <RuleHint
              title={t('recovery-base-days')}
              description={t('recovery-days-explanation')}
              params={recovery.days}
              reference="Table 13-1a"
            >
              <HealingLine label={t('recovery-base-days')} value={recovery.baseDays} />
            </RuleHint>
          ) : (
            <HealingLine label={t('recovery-base-days')} value={recovery.baseDays} />
          )}
          <HealingLine label={t('recovery-multiplier')} value={`×${recovery.multiplier}`} />
          <HealingLine label={t('recovery-total-days-label')} value={recovery.totalDays} />
          <HealingLine label={t('recovery-remaining-days')} value={recovery.remainingDays} />
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
            <RollField
              spec={OPEN_D100}
              label={t('permanent-roll')}
              value={permanentRoll}
              onChange={(value) => update({ permanentRoll: value.total })}
            />
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
};

export default HealingRecoveryStep;
