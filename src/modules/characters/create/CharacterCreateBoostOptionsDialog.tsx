import React, { FC, useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  Box,
  Typography,
} from '@mui/material';
import { CreateCharacterDto, STATS, StrategicGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { getStatBonus } from '../../services/stat-service';
import { StatBonus } from './CharacterCreate';
import CharacterCreateStatsActions from './CharacterCreateStatsActions';
import { useTranslation } from 'react-i18next';

const CharacterCreateBoostOptionsDialog: FC<{
  open: boolean;
  onClose: () => void;
  strategicGame: StrategicGame;
  formData: CreateCharacterDto;
  setFormData: React.Dispatch<React.SetStateAction<CreateCharacterDto>>;
}> = ({ open, onClose, strategicGame, formData, setFormData }) => {
  const { t } = useTranslation();
  const [statBonusFormData, setStatBonusFormData] = useState<{ [key: string]: StatBonus }>({} as any);
  const [boosts, setBoosts] = useState<number>(strategicGame?.powerLevel.statCreationBoost || 0);
  const [swaps, setSwaps] = useState<number>(strategicGame?.powerLevel.statCreationSwap || 0);

  useEffect(() => {
    const initial: { [key: string]: StatBonus } = {} as any;
    STATS.forEach((s) => {
      const stat = formData.statistics?.[s];
      const potential = stat?.potential ?? 0;
      const temporary = stat?.temporary ?? 0;
      initial[s] = { potential: getStatBonus(potential), temporary: getStatBonus(temporary) } as StatBonus;
    });
    setStatBonusFormData(initial);
  }, [formData]);

  useEffect(() => {
    if (strategicGame) {
      setBoosts(strategicGame.powerLevel.statCreationBoost);
      setSwaps(strategicGame.powerLevel.statCreationSwap);
    }
  }, [strategicGame]);

  const [selectedStats, setSelectedStats] = useState<string[]>([]);

  const toggleSelect = (stat: string) => {
    setSelectedStats((prev) => {
      if (prev.includes(stat)) return prev.filter((s) => s !== stat);
      // allow up to 2
      if (prev.length >= 2) return [prev[1], stat];
      return [...prev, stat];
    });
  };

  const handleBoostSelected = () => {
    if (selectedStats.length !== 1) return;
    const key = selectedStats[0];
    const potentialValue = strategicGame?.powerLevel.statBoostPotential || 78;
    const temporaryValue = strategicGame?.powerLevel.statBoostTemporary || 56;
    if (boosts <= 0) return;
    setFormData((prevState) => {
      const stat = prevState.statistics[key];
      return {
        ...prevState,
        statistics: {
          ...prevState.statistics,
          [key]: {
            ...stat,
            potential: potentialValue,
            temporary: temporaryValue,
          },
        },
      };
    });
    setStatBonusFormData((prevState) => ({
      ...prevState,
      [key]: {
        ...prevState[key],
        potential: getStatBonus(potentialValue),
        temporary: getStatBonus(temporaryValue),
      },
    }));
    setBoosts((b) => Math.max(0, b - 1));
    setSelectedStats([]);
  };

  const handleSwapSelected = () => {
    if (selectedStats.length !== 2) return;
    const [a, b] = selectedStats;
    if (swaps <= 0) return;
    setFormData((prevState) => {
      const sa = prevState.statistics[a];
      const sb = prevState.statistics[b];
      return {
        ...prevState,
        statistics: {
          ...prevState.statistics,
          [a]: {
            ...sa,
            potential: sb.potential,
            temporary: sb.temporary,
          },
          [b]: {
            ...sb,
            potential: sa.potential,
            temporary: sa.temporary,
          },
        },
      };
    });
    setStatBonusFormData((prevState) => {
      const pa = prevState[a];
      const pb = prevState[b];
      return {
        ...prevState,
        [a]: {
          ...pa,
          potential: pb.potential,
          temporary: pb.temporary,
        },
        [b]: {
          ...pb,
          potential: pa.potential,
          temporary: pa.temporary,
        },
      };
    });
    setSwaps((s) => Math.max(0, s - 1));
    setSelectedStats([]);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle color="primary">{t('statistics-boosts')}</DialogTitle>
      <DialogContent>
        <CharacterCreateStatsActions
          strategicGame={strategicGame}
          formData={formData}
          setFormData={setFormData}
          setStatBonusFormData={setStatBonusFormData}
          boosts={boosts}
          setBoosts={setBoosts}
          swaps={swaps}
          setSwaps={setSwaps}
        />
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            {t('statistics')}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>{t('stat')}</TableCell>
                <TableCell align="right">{t('potential')}</TableCell>
                <TableCell align="right">{t('temporary')}</TableCell>
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
                  <TableCell align="right">{formData.statistics?.[s]?.potential ?? '-'}</TableCell>
                  <TableCell align="right">{formData.statistics?.[s]?.temporary ?? '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleBoostSelected} disabled={selectedStats.length !== 1 || boosts <= 0}>
          {t('boost-to-power-level')}
        </Button>
        <Button onClick={handleSwapSelected} disabled={selectedStats.length !== 2 || swaps <= 0}>
          {t('swap-values')}
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose}>{t('close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CharacterCreateBoostOptionsDialog;
