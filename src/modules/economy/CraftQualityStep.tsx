import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  ListSubheader,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  ARMOR_WEIGHT_PERCENTS,
  CraftingPlan,
  CraftingQualityDto,
  CraftKind,
  Material,
  MASTERWORK_KINDS,
  MasterworkKind,
  materialsFor,
  MATERIAL_GROUPS,
  MoneyDisplay,
  WORKSHOP_QUALITIES,
  WorkshopQuality,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { TFunction } from 'i18next';

const signed = (value: number) => (value > 0 ? `+${value}` : `${value}`);

/** A material in the selector: its name and what it gives (bonus, durability, workability). */
const materialLine = (material: Material, t: TFunction) =>
  `${t(`material-${material.id}`, material.id)} (${signed(material.bonus)} · ${t('material-durability')} ${signed(
    material.durability
  )} · ${t('material-workability')} ${material.workability === null ? '—' : signed(material.workability)})`;

/**
 * The quality of a craft (workspace spec 043): superior material, superior craftsmanship, torso armor weight and
 * workshop, with the plan the API quotes (cost, maneuver modifiers, hours and bonuses).
 */
const CraftQualityStep: FC<{
  kind: CraftKind;
  blunt: boolean;
  materials: Material[] | null;
  materialsError: boolean;
  value: CraftingQualityDto;
  onChange: (value: CraftingQualityDto) => void;
  plan?: CraftingPlan;
  planError?: string;
  free: boolean;
}> = ({ kind, blunt, materials, materialsError, value, onChange, plan, planError, free }) => {
  const { t } = useTranslation();
  const allowed = useMemo(() => materialsFor(kind, materials ?? []), [kind, materials]);
  const material = allowed.find((m) => m.id === value.materialId);
  const masterworkAllowed = kind !== 'armor';

  const set = (patch: Partial<CraftingQualityDto>) => {
    const next = { ...value, ...patch };
    (Object.keys(next) as (keyof CraftingQualityDto)[]).forEach((key) => {
      if (next[key] === undefined || next[key] === '' || next[key] === false) delete next[key];
    });
    onChange(next);
  };

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              label={t('material')}
              value={value.materialId ?? ''}
              disabled={allowed.length === 0}
              helperText={allowed.length === 0 ? t('craft-quality-no-materials') : undefined}
              onChange={(e) =>
                set({ materialId: e.target.value || undefined, blunt: undefined, replacesMetal: undefined })
              }
              slotProps={{ select: { MenuProps: { slotProps: { paper: { sx: { maxHeight: 420 } } } } } }}
            >
              <MenuItem value="">{t('material-standard')}</MenuItem>
              {MATERIAL_GROUPS.flatMap((group) => {
                const list = allowed.filter((m) => m.group === group);
                if (list.length === 0) return [];
                return [
                  <ListSubheader key={`group-${group}`}>{t(`material-group-${group}`)}</ListSubheader>,
                  ...list.map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      {materialLine(m, t)}
                    </MenuItem>
                  )),
                ];
              })}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              label={t('workshop-quality')}
              value={value.workshop ?? 'basic'}
              onChange={(e) => set({ workshop: e.target.value as WorkshopQuality })}
            >
              {WORKSHOP_QUALITIES.map((quality) => (
                <MenuItem key={quality} value={quality}>
                  {t(`workshop-quality-${quality}`)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {material && (
            <Grid size={12}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center' }} useFlexGap>
                {material.magical && <Chip size="small" color="secondary" label={t('material-magical')} />}
                {material.alloyDifficulty && (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={t('material-alloy-difficulty', { difficulty: t(`difficulty-${material.alloyDifficulty}`) })}
                  />
                )}
                {material.bluntBonus !== null && kind === 'weapon' && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={value.blunt ?? blunt}
                        onChange={(e) => set({ blunt: e.target.checked || undefined })}
                      />
                    }
                    label={t('material-blunt', { bonus: signed(material.bluntBonus) })}
                  />
                )}
                {material.metalBonus !== null && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!value.replacesMetal}
                        onChange={(e) => set({ replacesMetal: e.target.checked || undefined })}
                      />
                    }
                    label={t('material-replaces-metal', { bonus: signed(material.metalBonus) })}
                  />
                )}
              </Stack>
            </Grid>
          )}
          {materialsError && (
            <Grid size={12}>
              <Alert severity="info">{t('craft-quality-materials-unavailable')}</Alert>
            </Grid>
          )}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              label={t('masterwork')}
              value={value.masterwork ?? ''}
              disabled={!masterworkAllowed}
              helperText={t(masterworkAllowed ? 'masterwork-hint' : 'masterwork-not-allowed')}
              onChange={(e) =>
                set({
                  masterwork: (e.target.value || undefined) as MasterworkKind | undefined,
                  circumstance: undefined,
                })
              }
            >
              <MenuItem value="">{t('none')}</MenuItem>
              {MASTERWORK_KINDS.map((masterwork) => (
                <MenuItem key={masterwork} value={masterwork}>
                  {t(`masterwork-${masterwork}`)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {value.masterwork === 'circumstantial' && (
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                label={t('masterwork-circumstance')}
                placeholder={t('masterwork-circumstance-placeholder')}
                value={value.circumstance ?? ''}
                onChange={(e) => set({ circumstance: e.target.value })}
              />
            </Grid>
          )}
          {kind === 'torso-armor' && (
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                fullWidth
                label={t('armor-weight')}
                value={value.weightPercent ?? 0}
                helperText={t('armor-weight-hint')}
                onChange={(e) => set({ weightPercent: Number(e.target.value) || undefined })}
              >
                <MenuItem value={0}>{t('armor-weight-normal')}</MenuItem>
                {ARMOR_WEIGHT_PERCENTS.map((percent) => (
                  <MenuItem key={percent} value={percent}>
                    {t(percent < 0 ? 'armor-weight-lighter' : 'armor-weight-heavier', { percent: Math.abs(percent) })}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }} data-testid="craft-plan">
        <Typography variant="overline" color="text.secondary">
          {t('craft-plan')}
        </Typography>
        {planError && <Alert severity="warning">{t(planError, planError)}</Alert>}
        {plan && !planError && <CraftPlanSummary plan={plan} free={free} />}
      </Paper>
    </Stack>
  );
};

/** Cost, maneuver modifiers, hours and the bonuses of the item the API quoted. */
export const CraftPlanSummary: FC<{ plan: CraftingPlan; free: boolean }> = ({ plan, free }) => {
  const { t } = useTranslation();
  const bonuses: string[] = [];
  const target = plan.bonusTarget
    ? t(`item-modifier-target-${plan.bonusTarget}`)
    : plan.kind === 'launcher'
      ? t('range-increment')
      : null;
  if (plan.material && plan.material.bonus !== 0 && target) bonuses.push(`${signed(plan.material.bonus)} ${target}`);
  if (plan.material && plan.material.durability !== 0)
    bonuses.push(`${signed(plan.material.durability)} ${t('item-modifier-target-breakage')}`);
  if (plan.weightDb !== 0) bonuses.push(`${signed(plan.weightDb)} ${t('item-modifier-target-defense')}`);
  if (plan.masterwork)
    bonuses.push(
      t('craft-plan-masterwork-bonus', {
        target: plan.circumstance ?? target ?? '',
      })
    );
  return (
    <Stack spacing={1} divider={<Divider flexItem />}>
      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', alignItems: 'center' }} useFlexGap>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {t('craft-cost')}
          </Typography>
          <MoneyDisplay gold={free ? 0 : plan.cost.total} />
        </Stack>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {t('craft-plan-value')}
          </Typography>
          <MoneyDisplay gold={plan.cost.unitPrice} />
        </Stack>
        {plan.cost.unitMaterial > 0 && (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {t('craft-plan-material-cost')}
            </Typography>
            <MoneyDisplay gold={plan.cost.unitMaterial} />
          </Stack>
        )}
        {plan.productionHours !== null && (
          <Typography variant="body2" color="text.secondary">
            {t('production-hours-value', { hours: plan.productionHours })}
          </Typography>
        )}
        {plan.weightMultiplier !== 1 && (
          <Typography variant="body2" color="text.secondary">
            {t('craft-plan-weight', { percent: Math.round(plan.weightMultiplier * 100) })}
          </Typography>
        )}
      </Stack>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center' }} useFlexGap>
        <Typography variant="body2" color="text.secondary">
          {t('craft-plan-modifiers')}
        </Typography>
        {plan.modifiers.length === 0 && <Typography variant="body2">—</Typography>}
        {plan.modifiers.map((modifier) => (
          <Chip
            key={modifier.key}
            size="small"
            color={modifier.value < 0 ? 'warning' : 'success'}
            variant="outlined"
            label={`${t(`maneuver-modifier-${modifier.key}`)} ${signed(modifier.value)}`}
          />
        ))}
      </Stack>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center' }} useFlexGap>
        <Typography variant="body2" color="text.secondary">
          {t('craft-plan-bonuses')}
        </Typography>
        {bonuses.length === 0 && <Typography variant="body2">—</Typography>}
        {bonuses.map((bonus) => (
          <Chip key={bonus} size="small" label={bonus} />
        ))}
      </Stack>
    </Stack>
  );
};

export default CraftQualityStep;
