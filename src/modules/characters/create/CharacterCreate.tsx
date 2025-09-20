import React, { useState, useEffect, FC } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Grid } from '@mui/material';
import { useError } from '../../../ErrorContext';
import { CreateCharacterDto, stats } from '../../api/character.dto';
import { fetchFactions } from '../../api/faction';
import { Faction } from '../../api/faction.dto';
import { Profession } from '../../api/professions';
import { fetchRaces } from '../../api/race';
import { Race } from '../../api/race.dto';
import { fetchStrategicGame } from '../../api/strategic-game';
import { StrategicGame } from '../../api/strategic-game.dto';
import { characterCreateTemplate } from '../../data/character-create';
import { getStatBonus } from '../../services/stat-service';
import RaceAvatar from '../../shared/avatars/RaceAvatar';
import CharacterCreateActions from './CharacterCreateActions';
import CharacterCreateAttributes from './CharacterCreateAttributes';
import CharacterCreateAttributesBasic from './CharacterCreateAttributesBasic';
import CharacterCreateProfessionalSkills from './CharacterCreateProfessionalSkills';
import CharacterCreateSkillCosts from './CharacterCreateSkillCosts';
import { CharacterCreateSortCombat } from './CharacterCreateSortCombat';
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
  const [races, setRaces] = useState<Race[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
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
  const [boosts, setBoosts] = useState<number>(game?.powerLevel.statCreationBoost || 2);
  const [swaps, setSwaps] = useState<number>(game?.powerLevel.statCreationSwap || 2);
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
      setBoosts(game?.powerLevel.statCreationBoost || 2);
      setSwaps(game?.powerLevel.statCreationSwap || 2);
    }
  };

  const randomStatValue = (): number => {
    const min = 11;
    const max = 100;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const checkValidForm = () => {
    let valid = true;
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
    fetchFactions(`gameId==${gameId}`, 0, 20)
      .then((factions) => {
        setFactions(factions);
      })
      .catch((error: Error) => {
        showError(error.message);
      });
  };

  const bindRaces = (realmId) => {
    fetchRaces(`realmId==${realmId}`, 0, 100)
      .then((data) => {
        setRaces(data);
      })
      .catch((error: Error) => {
        showError(error.message);
      });
  };

  const handleWeaponOrderChange = (newOrder: string[]) => {
    setFormData((prevState) => ({
      ...prevState,
      weaponDevelopment: newOrder,
    }));
  };

  useEffect(() => {
    checkValidForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  useEffect(() => {
    if (game) {
      bindRaces(game.realmId);
    }
  }, [game]);

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

  if (!game || !formData) return <div>Loading...</div>;

  return (
    <>
      <CharacterCreateActions formData={formData} game={game} isValid={isValid} />
      <Grid container spacing={5}>
        <Grid size={2}>
          <RaceAvatar raceName={formData.info.raceName} size={200} />
          <CharacterCreateAttributesBasic
            formData={formData}
            setFormData={setFormData}
            setProfession={setProfession}
            factions={factions}
            races={races}
          />
        </Grid>
        <Grid size={7}>
          <CharacterCreateStats
            formData={formData}
            onRandomStats={onRandomStats}
            statBonusFormData={statBonusFormData}
          />
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
          <CharacterCreateAttributes
            formData={formData}
            setFormData={setFormData}
            setProfession={setProfession}
            factions={factions}
          />
        </Grid>
        <Grid size={3}>
          <CharacterCreateSortCombat items={formData.weaponDevelopment || []} onChange={handleWeaponOrderChange} />
          {profession && (
            <>
              <CharacterCreateSkillCosts profession={profession} />
              <CharacterCreateProfessionalSkills profession={profession} />
            </>
          )}
        </Grid>
      </Grid>
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </>
  );
};

export default CharacterCreate;
