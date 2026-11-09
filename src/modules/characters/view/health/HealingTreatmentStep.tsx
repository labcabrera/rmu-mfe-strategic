import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  CAST_SUPPORTS,
  CastSupport,
  DifficultyPicker,
  formatBonus,
  InjuryCareChips,
  MANEUVER_DIFFICULTIES,
  OPEN_D100,
  RollField,
  TreatmentProcedure,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import HealingLine from './HealingLine';
import { HEALING_OPTIONS, HealingOption, healingTypeKey } from './health-rules';
import { herbBonuses } from './injury-healing-rules';
import { InjuryHealing } from './use-injury-healing';

/** Second step of the healing of an injury: the procedure and the Medicine maneuver. */
const HealingTreatmentStep: FC<{ healing: InjuryHealing }> = ({ healing }) => {
  const { t } = useTranslation();
  const {
    injury,
    form,
    update,
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
    usesHerbs,
    treatmentPreview,
    treatmentDisabled,
    latest,
    changeProcedure,
    submitTreatment,
  } = healing;
  const {
    procedure,
    showAll,
    roll,
    healingOption,
    herbalismEnabled,
    herbalismRoll,
    herbItemId,
    castSupport,
    salveModifier,
    treated,
  } = form;
  const { extra: extraDifficulty, value: difficultyValue, grade: selectedGrade, overridden } = difficulty;

  const herbItem = herbs.find((item) => item.id === herbItemId);
  const herbMagical = herbItem?.catalog?.features?.herb?.magical !== false;
  const bonuses = herbBonuses(healingOption);
  const herbBonusText = herbItem
    ? herbMagical
      ? t('treatment-herb-bonus-magical', {
          medicine: formatBonus(bonuses.medicine),
          recovery: formatBonus(bonuses.recovery),
        })
      : t('treatment-herb-bonus-mundane', { medicine: formatBonus(bonuses.medicine) })
    : t('treatment-herb-generic');

  const difficultyCaption = (() => {
    if (overridden) return t('treatment-difficulty-override');
    if (!difficultiesLoaded) return t('loading');
    if (!computed) return t('treatment-difficulty-unavailable');
    return computed.matched ? t('treatment-difficulty-table') : t('treatment-difficulty-default');
  })();

  return (
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
      {surgeryOnly && <Alert severity="warning">{t('err-treatment-surgery-required')}</Alert>}
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
          {!surgeryOnly && (
            <FormControlLabel
              control={
                <Checkbox size="small" checked={showAll} onChange={(_, checked) => update({ showAll: checked })} />
              }
              label={t('treatment-show-all-procedures')}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            fullWidth
            label={t('healing-type')}
            value={healingOption}
            onChange={(event) => update({ healingOption: event.target.value as HealingOption })}
          >
            {HEALING_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {t(`healing-option-${option}`)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        {askCastSupport && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              label={t('cast-support')}
              value={castSupport}
              onChange={(event) => update({ castSupport: event.target.value as CastSupport })}
              helperText={t('cast-support-help')}
            >
              {CAST_SUPPORTS.map((option) => (
                <MenuItem key={option} value={option}>
                  {t(`cast-support-${option}`)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        )}
        {procedure === 'salve' && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              type="number"
              label={t('salve-modifier')}
              value={salveModifier}
              onChange={(event) => update({ salveModifier: Math.trunc(Number(event.target.value) || 0) })}
              error={!salveInRange}
              helperText={t('salve-modifier-help', {
                min: formatBonus(salveRange.min),
                max: formatBonus(salveRange.max),
              })}
              slotProps={{ htmlInput: { min: salveRange.min, max: salveRange.max, step: 5 } }}
            />
          </Grid>
        )}
        {usesHerbs && (
          <Grid size={12}>
            <TextField
              select
              fullWidth
              label={t('treatment-herb')}
              value={herbItemId}
              onChange={(event) => update({ herbItemId: event.target.value })}
              helperText={herbs.length === 0 ? t('treatment-herb-none-carried') : herbBonusText}
            >
              <MenuItem value="">{t('treatment-herb-generic-option')}</MenuItem>
              {herbs.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {`${t(item.name, item.name)} (${item.amount})`}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        )}
        {!isMagic && (
          <>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DifficultyPicker
                value={selectedGrade}
                onChange={(key) => update({ override: MANEUVER_DIFFICULTIES.find((option) => option.key === key) })}
              />
              <Typography variant="caption" color="text.secondary" component="div">
                {difficultyCaption}
              </Typography>
              {overridden && (
                <Button size="small" sx={{ px: 0 }} onClick={() => update({ override: undefined })}>
                  {t('treatment-difficulty-reset')}
                </Button>
              )}
              {!overridden && (computed?.headSteps ?? 0) > 0 && (
                <Typography variant="caption" color="text.secondary" component="div">
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
              <RollField spec={OPEN_D100} value={roll} onChange={(value) => update({ roll: value.total })} />
            </Grid>
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={herbalismEnabled}
                    onChange={(_, checked) => update({ herbalismEnabled: checked })}
                  />
                }
                label={t('treatment-herbalism-roll')}
              />
              {herbalismEnabled && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
                  <RollField
                    spec={OPEN_D100}
                    label={t('herbalism')}
                    value={herbalismRoll}
                    onChange={(value) => update({ herbalismRoll: value.total })}
                  />
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
          <HealingLine label={t('roll')} value={roll ?? '-'} />
          <HealingLine label={t('medicine')} value={formatBonus(resolvedHealer?.medicine ?? 0)} />
          {healerPenalty !== 0 && <HealingLine label={t('healer-penalty')} value={formatBonus(healerPenalty)} />}
          <HealingLine
            label={t('difficulty')}
            value={difficultyValue === undefined ? '-' : formatBonus(difficultyValue)}
          />
          <HealingLine label={t('total')} value={treatmentPreview ?? '-'} />
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
          {!!latest.healer.penalty && (
            <Box component="span" sx={{ display: 'block' }}>
              {t('treatment-healer-penalty', { value: formatBonus(latest.healer.penalty) })}
            </Box>
          )}
        </Alert>
      )}
      {treated && injury.limits && (latest?.procedure === 'splint' || latest?.procedure === 'cast') && (
        <Alert severity="info">
          {t('treatment-limits-applied')}
          <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 0.75, mt: 0.75 }}>
            <InjuryCareChips
              injury={{ ...injury, treatmentInProgress: undefined, tourniquet: undefined, reopenOn: undefined }}
            />
          </Stack>
        </Alert>
      )}
      {treated && latest?.herb && (
        <Alert severity="info">
          {t('treatment-herb-applied', {
            name: latest.herb.name ? t(latest.herb.name, latest.herb.name) : '',
            medicine: formatBonus(latest.herb.medicineBonus),
            recovery: formatBonus(latest.herb.recoveryBonus),
          })}
        </Alert>
      )}
      {latest?.heatCritical && (
        <Alert severity="warning">{t('treatment-heat-critical', { severity: latest.heatCritical })}</Alert>
      )}
      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
        <Button onClick={() => update({ step: 'recovery' })}>{t('next')}</Button>
        <Button variant="contained" disabled={treatmentDisabled} onClick={submitTreatment}>
          {t('treat')}
        </Button>
      </Stack>
    </Stack>
  );
};

export default HealingTreatmentStep;
