import React, { useState, useEffect, FC } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Grid } from '@mui/material';
import { useError } from '../../../ErrorContext';
import { CreateCharacterDto } from '../../api/character.dto';
import { fetchFactions } from '../../api/faction';
import { Faction } from '../../api/faction.dto';
import { Profession } from '../../api/professions';
import { fetchRaces } from '../../api/race';
import { Race } from '../../api/race.dto';
import { fetchStrategicGame } from '../../api/strategic-game';
import { StrategicGame } from '../../api/strategic-game.dto';
import { characterCreateTemplate } from '../../data/character-create';
import { randomizeStats } from '../../services/randomize-stats';
import RaceAvatar from '../../shared/avatars/RaceAvatar';
import CharacterCreateActions from './CharacterCreateActions';
import CharacterCreateAttributes from './CharacterCreateAttributes';
import CharacterCreateProfessionalSkills from './CharacterCreateProfessionalSkills';
import CharacterCreateResume from './CharacterCreateResume';
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
  const [faction, setFaction] = useState<Faction | null>(null);
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
    randomizeStats(setFormData, setStatBonusFormData);
    setBoosts(game?.powerLevel.statCreationBoost || 2);
    setSwaps(game?.powerLevel.statCreationSwap || 2);
  };

  const checkValidForm = (formData: CreateCharacterDto) => {
    let valid = true;
    if (!formData.gameId) valid = false;
    if (!formData.name || formData.name.trim() === '') valid = false;
    if (!formData.info?.raceId) valid = false;
    if (!formData.info?.professionId) valid = false;
    if (!formData.info?.realmType) valid = false;
    if (!formData.factionId) valid = false;
    if (!formData.info?.weight) valid = false;
    setIsValid(valid);
  };

  const bindStrategicGame = () => {
    if (!gameId) return;
    fetchStrategicGame(gameId)
      .then((game) => setGame(game))
      .catch((err) => showError(err.message));
    fetchFactions(`gameId==${gameId}`, 0, 20)
      .then((factions) => {
        setFactions(factions);
        setFaction(factions.find((f) => f.id === factionId) || null);
      })
      .catch((err) => showError(err.message));
  };

  const handleWeaponOrderChange = (newOrder: string[]) => {
    setFormData((prevState) => ({
      ...prevState,
      weaponDevelopment: newOrder,
    }));
  };

  useEffect(() => {
    checkValidForm(formData);
  }, [formData]);

  useEffect(() => {
    if (game) {
      fetchRaces(`realmId==${game.realmId}`, 0, 100)
        .then((data) => setRaces(data))
        .catch((err) => showError(err.message));
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
      <CharacterCreateActions formData={formData} game={game} faction={faction} isValid={isValid} />
      <Grid container spacing={5}>
        <Grid size={2}>
          <RaceAvatar raceName={formData.info.raceName} size={300} />
          <CharacterCreateResume
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
