import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { DataTable, formatBonus, SectionLabel, STATS } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CreationStats, pointBuyBands, pointBuyValue } from '../../services/randomize-stats';
import { safeStatBonus } from '../../services/stat-service';

/** Points spent on a point-buy generation: the sum of the bonuses of the temporary values. */
export const pointBuySpent = (statistics: CreationStats): number =>
  STATS.reduce((sum, key) => sum + safeStatBonus(statistics[key]?.temporary), 0);

/**
 * Point-buy stat generation: the potentials are rolled and every temporary is bought by bonus band. A band costs its
 * bonus and gives the highest value of the band, never above the potential.
 */
const CharacterCreatePointBuy: FC<{
  statistics: CreationStats;
  statPoints: number;
  onChange: (statistics: CreationStats) => void;
}> = ({ statistics, statPoints, onChange }) => {
  const { t } = useTranslation();
  const spent = pointBuySpent(statistics);

  const onBuy = (key: (typeof STATS)[number], bonus: number) => {
    const stat = statistics[key];
    onChange({ ...statistics, [key]: { ...stat, temporary: pointBuyValue(bonus, stat.potential) } });
  };

  return (
    <Stack spacing={1}>
      <SectionLabel
        actions={
          <Chip
            size="small"
            color={spent > statPoints ? 'error' : 'success'}
            label={t('stat-points-spent', { spent, total: statPoints })}
          />
        }
      >
        {t('stat-point-buy')}
      </SectionLabel>
      <Typography variant="body2" color="text.secondary">
        {t('stat-point-buy-help')}
      </Typography>
      <DataTable
        rows={[...STATS]}
        getKey={(key) => key}
        columns={[
          { key: 'stat', header: t('stat'), render: (key) => t(key) },
          {
            key: 'potential',
            header: t('potential-short'),
            align: 'right',
            render: (key) => statistics[key].potential,
          },
          {
            key: 'bonus',
            header: t('bonus'),
            cellSx: { minWidth: 160 },
            render: (key) => (
              <TextField
                select
                size="small"
                variant="standard"
                value={safeStatBonus(statistics[key].temporary)}
                onChange={(e) => onBuy(key, Number(e.target.value))}
                fullWidth
                slotProps={{ htmlInput: { 'aria-label': `${t(key)} ${t('bonus')}` } }}
              >
                {pointBuyBands(statistics[key].potential).map((band) => (
                  <MenuItem key={band.bonus} value={band.bonus}>
                    {`${formatBonus(band.bonus)} (${band.min}-${band.max})`}
                  </MenuItem>
                ))}
              </TextField>
            ),
          },
          {
            key: 'temporary',
            header: t('temporary-short'),
            align: 'right',
            render: (key) => statistics[key].temporary,
          },
          {
            key: 'cost',
            header: t('cost'),
            align: 'right',
            render: (key) => (
              <Box component="span" sx={{ fontWeight: 600 }}>
                {safeStatBonus(statistics[key].temporary)}
              </Box>
            ),
          },
        ]}
      />
    </Stack>
  );
};

export default CharacterCreatePointBuy;
