import React, { useState, useEffect, FC } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Grid } from '@mui/material';
import { useError } from '../../../ErrorContext';
import { CreateCharacterDto } from '../../api/characters';
import { stats } from '../../api/characters';
import { fetchStrategicGame, StrategicGame } from '../../api/strategic-games';
import { characterCreateTemplate } from '../../data/character-create';
import { getStatBonus } from '../../services/stat-service';
import CharacterCreateActions from './CharacterCreateActions';
import CharacterCreateAttributes from './CharacterCreateAttributes';
import CharacterCreateStats from './CharacterCreateStats';

interface StatBonus {
  potential: number;
  temporary: number;
}

export interface StatBonusFormData {
  [key: string]: StatBonus;
}

const CharacterCreate: FC = () => {
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('gameId');
  const factionId = searchParams.get('factionId');
  const { showError } = useError();
  const [game, setGame] = useState<StrategicGame | null>(null);
  const [formData, setFormData] = useState<CreateCharacterDto>(characterCreateTemplate);
  const [statBonusFormData, setStatBonusFormData] = useState<StatBonusFormData>({
    ag: { potential: 0, temporary: 0 },
    co: { potential: 0, temporary: 0 },
    em: { potential: 0, temporary: 0 },
    in: { potential: 0, temporary: 0 },
    me: { potential: 0, temporary: 0 },
    pr: { potential: 0, temporary: 0 },
    qu: { potential: 0, temporary: 0 },
    re: { potential: 0, temporary: 0 },
    sd: { potential: 0, temporary: 0 },
    st: { potential: 0, temporary: 0 },
  });
  const [boosts, setBoosts] = useState<number>(game?.powerLevel.statBoosts || 2);
  const [swaps, setSwaps] = useState<number>(game?.powerLevel.statSwaps || 2);

  const onRandomStats = () => {
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
      setBoosts(game?.powerLevel.statBoosts || 2);
      setSwaps(game?.powerLevel.statSwaps || 2);
    }
  };

  const randomStatValue = (): number => {
    const min = 11;
    const max = 100;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const bindStrategicGame = () => {
    if (!gameId) return;
    fetchStrategicGame(gameId)
      .then((game) => {
        setGame(game);
      })
      .catch((error: Error) => {
        showError(error.message);
      });
  };

  useEffect(() => {
    if (gameId) {
      bindStrategicGame();
      setFormData((prevState) => ({
        ...prevState,
        gameId: gameId,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  useEffect(() => {
    if (factionId) {
      setFormData((prevState) => ({
        ...prevState,
        factionId: factionId,
      }));
    }
  }, [factionId]);

  return (
    <>
      <CharacterCreateActions formData={formData} game={game} />
      <Grid container spacing={5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <CharacterCreateAttributes formData={formData} strategicGame={game} setFormData={setFormData} />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <CharacterCreateStats
            formData={formData}
            setFormData={setFormData}
            strategicGame={game}
            onRandomStats={onRandomStats}
            statBonusFormData={statBonusFormData}
            setStatBonusFormData={setStatBonusFormData}
          />
        </Grid>
      </Grid>
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </>
  );
};

export default CharacterCreate;
