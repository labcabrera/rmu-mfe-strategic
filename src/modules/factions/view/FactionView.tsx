import React, { FC, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Grid } from '@mui/material';
import { useError } from '../../../ErrorContext';
import { fetchCharacters } from '../../api/character';
import { Character } from '../../api/character.dto';
import { fetchFaction } from '../../api/faction';
import { Faction } from '../../api/faction.dto';
import { fetchStrategicGame } from '../../api/strategic-game';
import { StrategicGame } from '../../api/strategic-game.dto';
import FactionViewActions from './FactionViewActions';
import FactionViewAttributes from './FactionViewAttributes';
import FactionViewCharacters from './FactionViewCharacters';
import FactionViewResume from './FactionViewResume';

const FactionView: FC = () => {
  const location = useLocation();
  const { showError } = useError();
  const { factionId } = useParams<{ factionId: string }>();
  const [faction, setFaction] = useState<Faction | null>(null);
  const [game, setGame] = useState<StrategicGame | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    if (faction) {
      fetchStrategicGame(faction.gameId)
        .then((data: StrategicGame) => setGame(data))
        .catch((err) => showError(err.message));
      fetchCharacters(`factionId==${faction.id}`, 0, 100)
        .then((data: Character[]) => setCharacters(data))
        .catch((err) => showError(err.message));
    }
  }, [faction]);

  useEffect(() => {
    if (location.state?.faction) {
      setFaction(location.state.faction);
    } else if (factionId) {
      fetchFaction(factionId)
        .then((data: Faction) => setFaction(data))
        .catch((err) => showError(err.message));
    }
  }, [location.state, factionId, showError]);

  if (!faction || !game) return <div>Loading...</div>;

  return (
    <>
      <FactionViewActions faction={faction} setFaction={setFaction} strategicGame={game} />
      <Grid container spacing={12}>
        <Grid size={2}>
          <FactionViewResume faction={faction} setFaction={setFaction} game={game} />
        </Grid>
        <Grid size={10}>
          <FactionViewAttributes faction={faction} />
          <FactionViewCharacters faction={faction} characters={characters} />
        </Grid>
      </Grid>
      {/* <pre>{JSON.stringify(faction, null, 2)}</pre> */}
    </>
  );
};

export default FactionView;
