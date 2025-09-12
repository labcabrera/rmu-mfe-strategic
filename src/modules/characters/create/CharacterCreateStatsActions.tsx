import React, { useState, useEffect, FC } from 'react';
import { useTranslation } from 'react-i18next';
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import { Button, Grid, Tooltip, MenuItem, TextField, IconButton } from '@mui/material';
import { stats } from '../../api/characters';
import { getStatBonus } from '../../services/stat-service';

interface StatBonus {
  potential: number;
  temporary: number;
}

interface Statistics {
  [key: string]: {
    potential: number;
    temporary: number;
    racial: number;
  };
}

interface FormData {
  statistics: Statistics;
  // ...otros campos según tu modelo
}

interface CharacterCreateStatsActionsProps {
  strategicGame: any;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  setStatBonusFormData: React.Dispatch<React.SetStateAction<{ [key: string]: StatBonus }>>;
}

const StatButton: FC<{ text: string; onClick: () => void }> = ({ text, onClick }) => {
  return <Button onClick={onClick}>{text}</Button>;
};

const randomStatValue = (): number => {
  const min = 11;
  const max = 100;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const StatSelect: React.FC<{
  name: string;
  value: string;
  setValue: (value: string) => void;
}> = ({ name, value, setValue }) => {
  const { t } = useTranslation();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <TextField
      select
      label={name}
      id={`select-${name}`}
      value={value}
      variant="standard"
      fullWidth
      onChange={handleChange}
    >
      {stats.map((option) => (
        <MenuItem key={option} value={option}>
          {t(option)}
        </MenuItem>
      ))}
    </TextField>
  );
};

const CharacterCreateStatsActions: FC<CharacterCreateStatsActionsProps> = ({
  strategicGame,
  formData,
  setFormData,
  setStatBonusFormData,
}) => {
  const [boosts, setBoosts] = useState<number>(strategicGame?.powerLevel.statBoosts || 2);
  const [swaps, setSwaps] = useState<number>(strategicGame?.powerLevel.statSwaps || 2);
  const [sourceBoostStat, setSourceBoostStat] = useState<string>('');
  const [targetBoostStat, setTargetBoostStat] = useState<string>('');
  const [replaceBoostStat, setReplaceBoostStat] = useState<string>('');

  const handleRandomStats = () => {
    for (const key of stats) {
      const values = [randomStatValue(), randomStatValue(), randomStatValue()];
      values.sort((a, b) => b - a);
      const potentialValue = values[0];
      const temporaryValue = values[1];
      const potentialBonus = getStatBonus(potentialValue);
      const temporaryBonus = getStatBonus(temporaryValue);
      setFormData((prevState) => ({
        ...prevState,
        statistics: {
          ...prevState.statistics,
          [key]: {
            ...prevState.statistics[key],
            potential: potentialValue,
            temporary: temporaryValue,
          },
        },
      }));
      setStatBonusFormData((prevState) => ({
        ...prevState,
        [key]: {
          potential: potentialBonus,
          temporary: temporaryBonus,
        },
      }));
      setBoosts(strategicGame?.powerLevel.statBoosts || 2);
      setSwaps(strategicGame?.powerLevel.statSwaps || 2);
    }
  };

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
    <Grid container spacing={2} sx={{ marginTop: 2 }}>
      <Grid size={2}>
        <StatButton text={'randomize'} onClick={handleRandomStats} />
      </Grid>
      <Grid size={2}>
        <TextField label="Boost Amount" value={boosts} InputProps={{ readOnly: true }} variant="standard" fullWidth />
      </Grid>
      <Grid size={2}>
        <TextField label="Swap Amount" value={swaps} InputProps={{ readOnly: true }} variant="standard" fullWidth />
      </Grid>
      <Grid size={12}></Grid>

      <Grid size={2} sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title="Swap the values of two statistics" arrow placement="right">
          <IconButton size="small">
            <InfoOutlineIcon />
          </IconButton>
        </Tooltip>
        <span>Swap</span>
      </Grid>
      <Grid size={2}>
        <StatSelect name="Source" value={sourceBoostStat} setValue={setSourceBoostStat} />
      </Grid>
      <Grid size={2}>
        <StatSelect name="Target" value={targetBoostStat} setValue={setTargetBoostStat} />
      </Grid>
      <Grid size={2}>
        <StatButton text="Swap" onClick={handleSwapStats} />
      </Grid>
      <Grid size={12}></Grid>

      <Grid size={2} sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title="Replace potential stat with 78 and temporary stat with 56." arrow placement="right">
          <IconButton size="small">
            <InfoOutlineIcon />
          </IconButton>
        </Tooltip>
        <span>Replace</span>
      </Grid>
      <Grid size={2}>
        <StatSelect name="Target" value={replaceBoostStat} setValue={setReplaceBoostStat} />
      </Grid>
      <Grid size={2}></Grid>
      <Grid size={2}>
        <StatButton text="Replace" onClick={handleReplacePotential} />
      </Grid>
      <Grid size={12}></Grid>

      <Grid size={2} sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip
          title="Replace your highest temporary stat with 90 and boost its potential by 10."
          arrow
          placement="right"
        >
          <IconButton size="small">
            <InfoOutlineIcon />
          </IconButton>
        </Tooltip>
        <span>Boost 1th</span>
      </Grid>
      <Grid size={4}></Grid>
      <Grid size={2}>
        <StatButton text="Boost" onClick={handleBoostHighest} />
      </Grid>
      <Grid size={12}></Grid>

      <Grid size={2} sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip
          title="Replace your second-highest temporary stat with 85 and boost its potential by 10."
          arrow
          placement="right"
        >
          <IconButton size="small">
            <InfoOutlineIcon />
          </IconButton>
        </Tooltip>
        <span>Boost 2th</span>
      </Grid>
      <Grid size={4}></Grid>
      <Grid size={2}>
        <StatButton text="Boost" onClick={handleBoostHighest} />
      </Grid>
    </Grid>
  );
};

export default CharacterCreateStatsActions;
