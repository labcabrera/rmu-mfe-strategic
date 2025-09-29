import React, { useState, useEffect, FC, Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Grid, MenuItem, TextField, Typography } from '@mui/material';
import { t } from 'i18next';
import { CreateCharacterDto, stats } from '../../api/character.dto';
import { StrategicGame } from '../../api/strategic-game.dto';
import { getStatBonus } from '../../services/stat-service';
import { StatBonus } from './CharacterCreate';

const StatButton: FC<{ text: string; onClick: () => void }> = ({ text, onClick }) => {
  return <Button onClick={onClick}>{text}</Button>;
};

const StatSelect: FC<{
  name: string;
  value: string;
  setValue: (value: string) => void;
}> = ({ name, value, setValue }) => {
  return (
    <TextField
      select
      label={name}
      id={`select-${name}`}
      value={value}
      variant="standard"
      fullWidth
      onChange={(e) => setValue(e.target.value)}
    >
      {stats.map((option) => (
        <MenuItem key={option} value={option}>
          {t(option)}
        </MenuItem>
      ))}
    </TextField>
  );
};

const CharacterCreateStatsActions: FC<{
  strategicGame: StrategicGame;
  formData: CreateCharacterDto;
  setFormData: React.Dispatch<React.SetStateAction<CreateCharacterDto>>;
  setStatBonusFormData: React.Dispatch<React.SetStateAction<{ [key: string]: StatBonus }>>;
  boosts: number;
  setBoosts: Dispatch<SetStateAction<number>>;
  swaps: number;
  setSwaps: Dispatch<SetStateAction<number>>;
}> = ({ strategicGame, formData, setFormData, setStatBonusFormData, boosts, setBoosts, swaps, setSwaps }) => {
  const [sourceBoostStat, setSourceBoostStat] = useState<string>('');
  const [targetBoostStat, setTargetBoostStat] = useState<string>('');
  const [replaceBoostStat, setReplaceBoostStat] = useState<string>('');

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

  const handleBoostHighest = () => {
    const highestStat = Object.entries(formData.statistics || {}).reduce(
      (max, entry) => (entry[1].temporary > max[1].temporary ? entry : max),
      ['', { temporary: -Infinity } as any]
    )[0];
    if (highestStat) {
      updateStat(highestStat, 90, 90);
    }
  };

  const updateStat = (key: string, potentialValue: number, temporaryValue: number) => {
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
          <TextField label="Boosts" value={boosts} InputProps={{ readOnly: true }} variant="standard" fullWidth />
        </Grid>
        <Grid size={3}>
          <TextField label="Swaps" value={swaps} InputProps={{ readOnly: true }} variant="standard" fullWidth />
        </Grid>
        <Grid size={3}>
          <StatButton text="Boost 1th" onClick={handleBoostHighest} />
        </Grid>
        <Grid size={3}>
          <StatButton text="Boost 2th" onClick={handleBoostHighest} />
        </Grid>

        <Grid size={3}>
          <StatSelect name="Source" value={sourceBoostStat} setValue={setSourceBoostStat} />
        </Grid>
        <Grid size={3}>
          <StatSelect name="Target" value={targetBoostStat} setValue={setTargetBoostStat} />
        </Grid>
        <Grid size={6}>
          <StatButton text="Swap" onClick={handleSwapStats} />
        </Grid>

        <Grid size={3}>
          <StatSelect name="Target" value={replaceBoostStat} setValue={setReplaceBoostStat} />
        </Grid>
        <Grid size={3}></Grid>
        <Grid size={6}>
          <StatButton text="Replace" onClick={handleReplacePotential} />
        </Grid>
      </Grid>
    </>
  );
};

export default CharacterCreateStatsActions;
