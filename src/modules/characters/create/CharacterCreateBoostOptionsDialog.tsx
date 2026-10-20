import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { StatKey, STATS, StrategicGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { resolvePowerLevel } from '../../services/game-rules';
import {
  applyStatGainRoll,
  boostRanked,
  boostToAverage,
  CreationStats,
  rankedStat,
  swapStats,
} from '../../services/randomize-stats';
import { getStatGainRoll } from '../../services/stat-service';

/** Creation boosts and swaps left, and the stat gain rolls granted by a boost and not applied yet. */
export interface StatCreationBudget {
  boosts: number;
  swaps: number;
  gainRolls: number;
}

export const initialStatCreationBudget = (game: StrategicGame): StatCreationBudget => {
  const powerLevel = resolvePowerLevel(game.powerLevel);
  return { boosts: powerLevel.statCreationBoost, swaps: powerLevel.statCreationSwap, gainRolls: 0 };
};

const HIGHEST_BOOST_VALUE = 90;
const SECOND_BOOST_VALUE = 85;
const GAIN_ROLLS_PER_BOOST = 2;

/**
 * Stat boosts of the power level (statCreationBoost), each one chosen among: a stat to the average values
 * (statBoostTemporary / statBoostPotential), the highest temporary to 90 or the second highest to 85 (potential +10 up
 * to 100), or two stat gain rolls. Swaps (statCreationSwap) exchange the values of two stats.
 */
const CharacterCreateBoostOptionsDialog: FC<{
  open: boolean;
  onClose: () => void;
  strategicGame: StrategicGame;
  statistics: CreationStats;
  onChange: (statistics: CreationStats) => void;
  budget: StatCreationBudget;
  setBudget: (budget: StatCreationBudget) => void;
}> = ({ open, onClose, strategicGame, statistics, onChange, budget, setBudget }) => {
  const { t } = useTranslation();
  const powerLevel = resolvePowerLevel(strategicGame.powerLevel);
  const [selectedStats, setSelectedStats] = useState<StatKey[]>([]);
  const [lastRoll, setLastRoll] = useState<{ stat: StatKey; roll: number }>();
  const highest = rankedStat(statistics, 0);
  const second = rankedStat(statistics, 1);

  const toggleSelect = (stat: StatKey) => {
    setSelectedStats((prev) => {
      if (prev.includes(stat)) return prev.filter((s) => s !== stat);
      if (prev.length >= 2) return [prev[1], stat];
      return [...prev, stat];
    });
  };

  const spendBoost = (next: CreationStats, gainRolls = 0) => {
    onChange(next);
    setBudget({ ...budget, boosts: budget.boosts - 1, gainRolls: budget.gainRolls + gainRolls });
    setSelectedStats([]);
  };

  const onAverage = () => {
    if (selectedStats.length !== 1 || budget.boosts <= 0) return;
    spendBoost(
      boostToAverage(statistics, selectedStats[0], powerLevel.statBoostTemporary, powerLevel.statBoostPotential)
    );
  };

  const onRanked = (rank: number, value: number) => {
    if (budget.boosts <= 0) return;
    spendBoost(boostRanked(statistics, rank, value));
  };

  const onGainRolls = () => {
    if (budget.boosts <= 0) return;
    spendBoost(statistics, GAIN_ROLLS_PER_BOOST);
  };

  const onApplyGainRoll = () => {
    if (selectedStats.length !== 1 || budget.gainRolls <= 0) return;
    const stat = selectedStats[0];
    const result = applyStatGainRoll(statistics, stat);
    onChange(result.statistics);
    setLastRoll({ stat, roll: result.roll });
    setBudget({ ...budget, gainRolls: budget.gainRolls - 1 });
  };

  const onSwap = () => {
    if (selectedStats.length !== 2 || budget.swaps <= 0) return;
    onChange(swapStats(statistics, selectedStats[0], selectedStats[1]));
    setBudget({ ...budget, swaps: budget.swaps - 1 });
    setSelectedStats([]);
  };

  const noBoosts = budget.boosts <= 0;
  const oneSelected = selectedStats.length === 1;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle color="primary">{t('statistics-boosts')}</DialogTitle>
      <DialogContent>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1, mb: 1 }}>
          <Chip color={noBoosts ? 'default' : 'success'} label={`${t('stat-creation-boosts')}: ${budget.boosts}`} />
          <Chip
            color={budget.swaps > 0 ? 'success' : 'default'}
            label={`${t('stat-creation-swaps')}: ${budget.swaps}`}
          />
          {budget.gainRolls > 0 && (
            <Chip color="warning" label={t('stat-gain-rolls-pending', { count: budget.gainRolls })} />
          )}
          {lastRoll && (
            <Chip
              variant="outlined"
              label={t('stat-gain-roll-result', { stat: t(lastRoll.stat), roll: lastRoll.roll })}
            />
          )}
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {t('stat-boosts-help')}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1, mb: 2 }}>
          <Button variant="outlined" onClick={onAverage} disabled={noBoosts || !oneSelected}>
            {t('stat-boost-average', {
              temporary: powerLevel.statBoostTemporary,
              potential: powerLevel.statBoostPotential,
            })}
          </Button>
          <Button variant="outlined" onClick={() => onRanked(0, HIGHEST_BOOST_VALUE)} disabled={noBoosts || !highest}>
            {t('stat-boost-highest', { stat: highest ? t(highest) : '', value: HIGHEST_BOOST_VALUE })}
          </Button>
          <Button variant="outlined" onClick={() => onRanked(1, SECOND_BOOST_VALUE)} disabled={noBoosts || !second}>
            {t('stat-boost-second-highest', { stat: second ? t(second) : '', value: SECOND_BOOST_VALUE })}
          </Button>
          <Button variant="outlined" onClick={onGainRolls} disabled={noBoosts}>
            {t('stat-boost-gain-rolls', { count: GAIN_ROLLS_PER_BOOST })}
          </Button>
        </Stack>
        <Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>{t('stat')}</TableCell>
                  <TableCell align="right">{t('potential')}</TableCell>
                  <TableCell align="right">{t('temporary')}</TableCell>
                  <TableCell align="right">{t('roll-type')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {STATS.map((s) => (
                  <TableRow
                    key={s}
                    hover
                    onClick={() => toggleSelect(s)}
                    sx={{ cursor: 'pointer' }}
                    selected={selectedStats.includes(s)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox checked={selectedStats.includes(s)} onChange={() => toggleSelect(s)} />
                    </TableCell>
                    <TableCell>{t(s)}</TableCell>
                    <TableCell align="right">{statistics[s]?.potential ?? '-'}</TableCell>
                    <TableCell align="right">{statistics[s]?.temporary ?? '-'}</TableCell>
                    <TableCell align="right">{getStatGainRoll(statistics[s]?.temporary ?? 0).dice}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onApplyGainRoll} disabled={budget.gainRolls <= 0 || !oneSelected}>
          {t('stat-gain-roll-apply')}
        </Button>
        <Button onClick={onSwap} disabled={selectedStats.length !== 2 || budget.swaps <= 0}>
          {t('swap-values')}
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose}>{t('close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CharacterCreateBoostOptionsDialog;
