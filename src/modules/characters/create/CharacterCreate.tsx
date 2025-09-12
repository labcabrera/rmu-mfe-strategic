import React, { useState, useEffect, FC } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Grid } from '@mui/material';
import { useError } from '../../../ErrorContext';
import { CreateCharacterDto } from '../../api/characters';
import { stats } from '../../api/characters';
import { Profession } from '../../api/professions';
import { fetchStrategicGame, StrategicGame } from '../../api/strategic-games';
import { characterCreateTemplate } from '../../data/character-create';
import { getStatBonus } from '../../services/stat-service';
import CharacterCreateActions from './CharacterCreateActions';
import CharacterCreateAttributes from './CharacterCreateAttributes';
import CharacterCreateProfessionalSkills from './CharacterCreateProfessionalSkills';
import CharacterCreateStats from './CharacterCreateStats';
import CharacterCreateStatsActions from './CharacterCreateStatsActions';

export interface StatBonus {
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
  const [profession, setProfession] = useState<Profession | null>(null);
  const [boosts, setBoosts] = useState<number>(game?.powerLevel.statBoosts || 2);
  const [swaps, setSwaps] = useState<number>(game?.powerLevel.statSwaps || 2);
  const [isValid, setIsValid] = useState<boolean>(false);

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

  const checkValidForm = () => {
    let valid = true;
    if (!formData.factionId) valid = false;
    if (!formData.gameId) valid = false;
    if (!formData.name || formData.name.trim() === '') valid = false;
    if (!formData.info?.raceId) valid = false;
    if (!formData.info?.professionId) valid = false;
    if (!formData.info?.realmType) valid = false;
    setIsValid(valid);
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
    checkValidForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

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
      <CharacterCreateActions formData={formData} game={game} isValid={isValid} />
      <Grid container spacing={5}>
        <Grid size={4}>
          <CharacterCreateAttributes formData={formData} setFormData={setFormData} setProfession={setProfession} />
        </Grid>
        <Grid size={6}>
          <CharacterCreateStats
            formData={formData}
            setFormData={setFormData}
            strategicGame={game}
            onRandomStats={onRandomStats}
            statBonusFormData={statBonusFormData}
            setStatBonusFormData={setStatBonusFormData}
          />
        </Grid>
        <Grid size={2}>{profession && <CharacterCreateProfessionalSkills profession={profession} />}</Grid>
        <Grid size={4}></Grid>
        <Grid size={6}>
          <CharacterCreateStatsActions
            strategicGame={game}
            formData={formData}
            setFormData={setFormData}
            setStatBonusFormData={setStatBonusFormData}
            boosts={boosts}
            setBoosts={setBoosts}
            swaps={swaps}
            setSwaps={setSwaps}
          />
        </Grid>
      </Grid>
      {/* <pre>{JSON.stringify(formData, null, 2)}</pre> */}
    </>
  );
};

export default CharacterCreate;
