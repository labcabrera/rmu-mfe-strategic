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
  const { factionId } = useParams<{ factionId: string }>();
  const [faction, setFaction] = useState<Faction | null>(location.state?.faction || null);
  const [game, setGame] = useState<StrategicGame | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const { showError } = useError();

  const bindFaction = (factionId: string) => {
    fetchFaction(factionId)
      .then((data: Faction) => {
        setFaction(data);
      })
      .catch((error: Error) => {
        showError(error.message);
      });
  };

  const bindGame = (gameId: string) => {
    fetchStrategicGame(gameId)
      .then((data: StrategicGame) => {
        setGame(data);
      })
      .catch((error: Error) => {
        showError(error.message);
      });
  };

  const bindCharacters = (factionId: string) => {
    fetchCharacters(`factionId==${factionId}`, 0, 100)
      .then((data: Character[]) => setCharacters(data))
      .catch((error: Error) => {
        showError(error.message);
      });
  };

  useEffect(() => {
    if (faction && faction.id) {
      bindCharacters(faction.id);
      bindGame(faction.gameId);
    }
  }, [faction]);

  useEffect(() => {
    if (!faction && factionId) {
      bindFaction(factionId);
    }
  }, [faction, factionId]);

  if (!faction || !game) return <div>Loading...</div>;

  return (
    <>
      <FactionViewActions faction={faction} game={game} />
      <Grid container spacing={12}>
        <Grid size={2}>
          <FactionViewResume faction={faction} setFaction={setFaction} game={game} />
        </Grid>
        <Grid size={7}>
          <FactionViewAttributes faction={faction} setFaction={setFaction} />
          <FactionViewCharacters faction={faction} characters={characters} />
        </Grid>
        <Grid size={4}></Grid>
      </Grid>
    </>
  );
};

export default FactionView;
