import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Grid, Stack, Typography } from '@mui/material';
import {
  DataTable,
  EnchantmentPlan,
  KeyValueList,
  MoneyDisplay,
  useSpellName,
} from '@labcabrera-rmu/rmu-react-shared-lib';

const signed = (value: number) => (value >= 0 ? `+${value}` : `${value}`);

/** The quote of an enchantment as the API makes it: days, power points, level, costs and the spells. */
const EnchantmentPlanView: FC<{ plan: EnchantmentPlan; free?: boolean }> = ({ plan, free = false }) => {
  const { t } = useTranslation();
  const spellName = useSpellName();
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
      <DataTable
        rows={plan.spells}
        getKey={(spell) => spell.spellId}
        columns={[
          {
            key: 'spell',
            header: t('spell'),
            render: (spell) => (
              <>
                <Typography variant="body2">{`${spellName(spell.name)} (${spell.level})`}</Typography>
                {spell.target && (
                  <Typography variant="caption" color="text.secondary">
                    {t(spell.target, spell.target)}
                  </Typography>
                )}
              </>
            ),
          },
          { key: 'scope', header: t('enchantment-scope'), render: (spell) => t(`enchantment-scope-${spell.scope}`) },
          { key: 'days', header: t('days'), align: 'right', render: (spell) => spell.days },
          { key: 'pp', header: t('enchantment-pp-per-cast'), align: 'right', render: (spell) => spell.pp },
          { key: 'casts', header: t('enchantment-casts'), align: 'right', render: (spell) => spell.casts },
          {
            key: 'failure',
            header: t('alchemy-failure-table'),
            render: (spell) => t(`alchemy-failure-table-${spell.failureTable}`),
          },
          { key: 'scr', header: t('enchantment-scr-bonus'), align: 'right', render: (spell) => signed(spell.scrBonus) },
        ]}
      />
    </Stack>
  );
};

export default EnchantmentPlanView;
