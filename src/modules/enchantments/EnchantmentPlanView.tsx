import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Grid, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { EnchantmentPlan, KeyValueList, MoneyDisplay } from '@labcabrera-rmu/rmu-react-shared-lib';

const signed = (value: number) => (value >= 0 ? `+${value}` : `${value}`);

/** The quote of an enchantment as the API makes it: days, power points, level, costs and the spells. */
const EnchantmentPlanView: FC<{ plan: EnchantmentPlan; free?: boolean }> = ({ plan, free = false }) => {
  const { t } = useTranslation();
  return (
    <Stack spacing={2}>
      {plan.warnings.map((warning) => (
        <Alert key={warning} severity="warning">
          {t(`enchantment-warning-${warning}`)}
        </Alert>
      ))}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <KeyValueList
            rows={[
              { label: t('enchantment-base-days'), value: plan.baseDays },
              ...(plan.materialBonusReduction > 0
                ? [
                    {
                      label: t('enchantment-material-reduction'),
                      hint: t('enchantment-material-reduction-hint'),
                      value: `-${plan.materialBonusReduction}`,
                    },
                  ]
                : []),
              { label: t('enchantment-working-days'), value: plan.workingDays },
              { label: t('enchantment-pp-per-day'), value: plan.ppPerDay },
              {
                label: t('enchantment-item-level'),
                hint: t('enchantment-item-level-hint'),
                value: plan.itemLevel,
              },
              { label: t('enchantment-batch-size'), value: plan.batchSize },
              { label: t('enchantment-max-alchemists'), value: plan.maxAlchemists },
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <KeyValueList
            rows={[
              {
                label: t('enchantment-power-level'),
                value: `${t(`power-level-${plan.powerLevel}`)} ×${plan.powerMultiplier}`,
              },
              { label: t('enchantment-material-cost'), value: <MoneyDisplay gold={plan.materialCost} /> },
              {
                label: t('enchantment-labor-cost'),
                hint: t('enchantment-labor-cost-hint'),
                value: <MoneyDisplay gold={plan.laborCost} />,
              },
              { label: t('enchantment-cost'), value: <MoneyDisplay gold={plan.enchantmentCost} /> },
              { label: t('enchantment-market-value'), value: <MoneyDisplay gold={plan.marketValue} /> },
              {
                label: t('enchantment-paid-at-start'),
                hint: t(free ? 'craft-free' : 'enchantment-paid-at-start-hint'),
                value: <MoneyDisplay gold={free ? 0 : plan.paidAtStart} />,
              },
            ]}
          />
        </Grid>
      </Grid>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('spell')}</TableCell>
              <TableCell>{t('enchantment-scope')}</TableCell>
              <TableCell align="right">{t('days')}</TableCell>
              <TableCell align="right">{t('enchantment-pp-per-cast')}</TableCell>
              <TableCell align="right">{t('enchantment-casts')}</TableCell>
              <TableCell>{t('alchemy-failure-table')}</TableCell>
              <TableCell align="right">{t('enchantment-scr-bonus')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plan.spells.map((spell) => (
              <TableRow key={spell.spellId}>
                <TableCell>
                  <Typography variant="body2">{`${t(spell.name, spell.name)} (${spell.level})`}</Typography>
                  {spell.target && (
                    <Typography variant="caption" color="text.secondary">
                      {t(spell.target, spell.target)}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{t(`enchantment-scope-${spell.scope}`)}</TableCell>
                <TableCell align="right">{spell.days}</TableCell>
                <TableCell align="right">{spell.pp}</TableCell>
                <TableCell align="right">{spell.casts}</TableCell>
                <TableCell>{t(`alchemy-failure-table-${spell.failureTable}`)}</TableCell>
                <TableCell align="right">{signed(spell.scrBonus)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Stack>
  );
};

export default EnchantmentPlanView;
