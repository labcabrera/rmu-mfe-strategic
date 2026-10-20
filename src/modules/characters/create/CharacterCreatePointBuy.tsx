import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Chip,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { formatBonus, STATS } from '@labcabrera-rmu/rmu-react-shared-lib';
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
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
        <Typography variant="subtitle1" color="primary">
          {t('stat-point-buy')}
        </Typography>
        <Chip
          size="small"
          color={spent > statPoints ? 'error' : 'success'}
          label={t('stat-points-spent', { spent, total: statPoints })}
        />
      </Stack>
      <Typography variant="body2" color="text.secondary">
        {t('stat-point-buy-help')}
      </Typography>
      <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('stat')}</TableCell>
              <TableCell align="right">{t('potential-short')}</TableCell>
              <TableCell sx={{ minWidth: 160 }}>{t('bonus')}</TableCell>
              <TableCell align="right">{t('temporary-short')}</TableCell>
              <TableCell align="right">{t('cost')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {STATS.map((key) => {
              const stat = statistics[key];
              const bonus = safeStatBonus(stat.temporary);
              return (
                <TableRow key={key}>
                  <TableCell>{t(key)}</TableCell>
                  <TableCell align="right">{stat.potential}</TableCell>
                  <TableCell>
                    <TextField
                      select
                      size="small"
                      variant="standard"
                      value={bonus}
                      onChange={(e) => onBuy(key, Number(e.target.value))}
                      fullWidth
                      slotProps={{ htmlInput: { 'aria-label': `${t(key)} ${t('bonus')}` } }}
                    >
                      {pointBuyBands(stat.potential).map((band) => (
                        <MenuItem key={band.bonus} value={band.bonus}>
                          {`${formatBonus(band.bonus)} (${band.min}-${band.max})`}
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell align="right">{stat.temporary}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {bonus}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export default CharacterCreatePointBuy;
