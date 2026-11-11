import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, Grid, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material';
import {
  CraftingEnhancement,
  NumericInput,
  Panel,
  SectionLabel,
  STRATEGIC_ITEM_MODIFIER_TARGETS,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CraftWizardState } from './use-craft-wizard';

/** Fourth step of the craft wizard: name, amount, costs and enhancements. */
const CraftEnhancementsStep: FC<{ wizard: CraftWizardState }> = ({ wizard }) => {
  const { t } = useTranslation();
  const { form, update, plan, planError, materials } = wizard;
  const changeEnhancement = (index: number, changes: Partial<CraftingEnhancement>) =>
    update({ enhancements: form.enhancements.map((other, i) => (i === index ? { ...other, ...changes } : other)) });
  return (
    <Panel variant="outlined">
      <Stack spacing={2}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t('name')}
              placeholder={form.itemType ? t(form.itemType.name, form.itemType.name) : undefined}
              value={form.name}
              onChange={(e) => update({ name: e.target.value })}
            />
          </Grid>
          {form.itemType?.info.stackable && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <NumericInput
                label={t('amount')}
                value={form.amount}
                onChange={(amount) => update({ amount })}
                min={1}
                integer
              />
            </Grid>
          )}
          <Grid size={{ xs: 6, sm: 3 }}>
            <NumericInput
              label={t('craft-materials-cost')}
              placeholder={`${plan && !planError && !plan.cost.asked ? plan.cost.materials : materials}`}
              value={form.materialsCost}
              onChange={(materialsCost) => update({ materialsCost })}
              min={0}
              maxFractionDigits={3}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <NumericInput
              label={t('craft-enhancements-cost')}
              value={form.enhancementsCost}
              onChange={(enhancementsCost) => update({ enhancementsCost })}
              min={0}
              maxFractionDigits={3}
            />
          </Grid>
        </Grid>
        <SectionLabel>{t('craft-enhancements')}</SectionLabel>
        <Typography variant="caption" color="text.secondary">
          {t('craft-enhancements-hint')}
        </Typography>
        {form.enhancements.map((enhancement, index) => (
          <Stack key={index} direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'center' } }}>
            <TextField
              select
              size="small"
              label={t('item-modifier-applies-to')}
              value={enhancement.appliesTo}
              onChange={(e) => changeEnhancement(index, { appliesTo: e.target.value })}
              sx={{ minWidth: 160 }}
            >
              {STRATEGIC_ITEM_MODIFIER_TARGETS.map((target) => (
                <MenuItem key={target} value={target}>
                  {t(`item-modifier-target-${target}`)}
                </MenuItem>
              ))}
            </TextField>
            <Box sx={{ width: 100 }}>
              <NumericInput
                label={t('value')}
                value={enhancement.value}
                onChange={(value) => changeEnhancement(index, { value: value ?? 0 })}
                integer
                allowNegatives
              />
            </Box>
            <TextField
              size="small"
              label={t('description')}
              value={enhancement.description ?? ''}
              onChange={(e) => changeEnhancement(index, { description: e.target.value })}
              sx={{ flex: 1 }}
            />
            <IconButton
              aria-label={t('remove')}
              onClick={() => update({ enhancements: form.enhancements.filter((_, i) => i !== index) })}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
        <Button
          startIcon={<AddIcon />}
          sx={{ alignSelf: 'flex-start' }}
          onClick={() => update({ enhancements: [...form.enhancements, { appliesTo: 'attack', value: 5 }] })}
        >
          {t('craft-add-enhancement')}
        </Button>
      </Stack>
    </Panel>
  );
};

export default CraftEnhancementsStep;
