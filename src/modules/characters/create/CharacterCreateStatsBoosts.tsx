import React, { useState, useEffect, FC, Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Grid, MenuItem, TextField, Typography } from '@mui/material';
import { CreateCharacterDto, StatKey, STATS, StrategicGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { getStatBonus } from '../../services/stat-service';
import { StatBonus } from './CharacterCreatePage';

const StatButton: FC<{ text: string; onClick: () => void }> = ({ text, onClick }) => {
  return <Button onClick={onClick}>{text}</Button>;
};

const StatSelect: FC<{
  id: string;
  name: string;
  value: StatKey | '';
  setValue: (value: StatKey) => void;
}> = ({ id, name, value, setValue }) => {
  const { t } = useTranslation();

  return (
    <TextField
      select
      label={name}
      id={`select-${id}`}
      value={value}
      variant="standard"
      fullWidth
      onChange={(e) => setValue(e.target.value as StatKey)}
    >
      {STATS.map((option) => (
        <MenuItem key={option} value={option}>
          {t(option)}
        </MenuItem>
      ))}
    </TextField>
  );
};

const CharacterCreateStatsBoosts: FC<{
  strategicGame: StrategicGame;
  formData: CreateCharacterDto;
  setFormData: React.Dispatch<React.SetStateAction<CreateCharacterDto>>;
  setStatBonusFormData: React.Dispatch<React.SetStateAction<{ [key: string]: StatBonus }>>;
  boosts: number;
  setBoosts: Dispatch<SetStateAction<number>>;
  swaps: number;
  setSwaps: Dispatch<SetStateAction<number>>;
}> = ({ strategicGame, formData, setFormData, setStatBonusFormData, boosts, setBoosts, swaps, setSwaps }) => {
  const { t } = useTranslation();
  const [sourceBoostStat, setSourceBoostStat] = useState<StatKey | ''>('');
  const [targetBoostStat, setTargetBoostStat] = useState<StatKey | ''>('');
  const [replaceBoostStat, setReplaceBoostStat] = useState<StatKey | ''>('');

  const handleSwapStats = () => {
    if (swaps > 0 && sourceBoostStat && targetBoostStat) {
      setFormData((prevState) => {
        const sourceStat = prevState.statistics[sourceBoostStat];
        const targetStat = prevState.statistics[targetBoostStat];
        return {
          ...prevState,
          statistics: {
            ...prevState.statistics,
            [sourceBoostStat]: {
              ...sourceStat,
              potential: targetStat.potential,
              temporary: targetStat.temporary,
            },
            [targetBoostStat]: {
              ...targetStat,
              potential: sourceStat.potential,
              temporary: sourceStat.temporary,
            },
          },
        };
      });
      setStatBonusFormData((prevState) => {
        const sourceBonus = prevState[sourceBoostStat];
        const targetBonus = prevState[targetBoostStat];
        return {
          ...prevState,
          [sourceBoostStat]: {
            ...sourceBonus,
            potential: targetBonus.potential,
            temporary: targetBonus.temporary,
          },
          [targetBoostStat]: {
            ...targetBonus,
            potential: sourceBonus.potential,
            temporary: sourceBonus.temporary,
          },
        };
      });
      setSwaps(swaps - 1);
    }
  };

  const handleReplacePotential = () => {
    const potentialValue = strategicGame?.powerLevel.statBoostPotential || 78;
    const temporaryValue = strategicGame?.powerLevel.statBoostTemporary || 56;
    if (boosts > 0 && replaceBoostStat) {
      setFormData((prevState) => {
        const targetStat = prevState.statistics[replaceBoostStat];
        return {
          ...prevState,
          statistics: {
            ...prevState.statistics,
            [replaceBoostStat]: {
              ...targetStat,
              potential: potentialValue,
              temporary: temporaryValue,
            },
          },
        };
      });
      setStatBonusFormData((prevState) => {
        return {
          ...prevState,
          [replaceBoostStat]: {
            ...prevState[replaceBoostStat],
            potential: getStatBonus(potentialValue),
            temporary: getStatBonus(temporaryValue),
          },
        };
      });
      setBoosts(boosts - 1);
    }
  };

  // Raises the stat with the n-th highest temporary value (0 = highest, 1 = second highest).
  const handleBoostRanked = (rank: number) => {
    const ranked = Object.entries(formData.statistics || {}).sort((a, b) => b[1].temporary - a[1].temporary);
    const target = ranked[rank]?.[0] as StatKey | undefined;
    if (target) {
      updateStat(target, 90, 90);
    }
  };

  const updateStat = (key: StatKey, potentialValue: number, temporaryValue: number) => {
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
    setStatBonusFormData((prevState) => {
      return {
        ...prevState,
        [key]: {
          ...prevState[key],
          potential: getStatBonus(potentialValue),
          temporary: getStatBonus(temporaryValue),
        },
      };
    });
  };

  useEffect(() => {
    if (strategicGame) {
      setBoosts(strategicGame.powerLevel.statCreationBoost);
      setSwaps(strategicGame.powerLevel.statCreationSwap);
    }
  }, [strategicGame]);

  return (
    <>
      <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
        {t('statistics-boosts')}
      </Typography>
      <Grid container spacing={1}>
        <Grid size={3}>
          <TextField
            label={t('stat-creation-boosts')}
            value={boosts}
            slotProps={{ input: { readOnly: true } }}
            variant="standard"
            fullWidth
          />
        </Grid>
        <Grid size={3}>
          <TextField
            label={t('stat-creation-swaps')}
            value={swaps}
            slotProps={{ input: { readOnly: true } }}
            variant="standard"
            fullWidth
          />
        </Grid>
        <Grid size={3}>
          <StatButton text={t('stat-boost-first')} onClick={() => handleBoostRanked(0)} />
        </Grid>
        <Grid size={3}>
          <StatButton text={t('stat-boost-second')} onClick={() => handleBoostRanked(1)} />
        </Grid>

        <Grid size={3}>
          <StatSelect id="swap-source" name={t('source')} value={sourceBoostStat} setValue={setSourceBoostStat} />
        </Grid>
        <Grid size={3}>
          <StatSelect id="swap-target" name={t('target')} value={targetBoostStat} setValue={setTargetBoostStat} />
        </Grid>
        <Grid size={6}>
          <StatButton text={t('swap-values')} onClick={handleSwapStats} />
        </Grid>

        <Grid size={3}>
          <StatSelect id="replace-target" name={t('target')} value={replaceBoostStat} setValue={setReplaceBoostStat} />
        </Grid>
        <Grid size={3}></Grid>
        <Grid size={6}>
          <StatButton text={t('replace')} onClick={handleReplacePotential} />
        </Grid>
      </Grid>
    </>
  );
};

export default CharacterCreateStatsBoosts;
