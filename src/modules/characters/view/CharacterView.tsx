import React, { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import { Grid, Link, Typography } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { fetchCharacter } from '../../api/character';
import { Character } from '../../api/character.dto';
import { fetchFaction } from '../../api/faction';
import { Faction } from '../../api/faction.dto';
import { fetchProfession, Profession } from '../../api/professions';
import { fetchStrategicGame } from '../../api/strategic-game';
import { StrategicGame } from '../../api/strategic-game.dto';
import RaceAvatar from '../../shared/avatars/RaceAvatar';
import CharacterViewActions from './CharacterViewActions';
import CharacterViewResume from './CharacterViewResume';
import CharacterViewTabs from './CharacterViewTabs';

const CharacterView: FC = () => {
  const { characterId } = useParams<{ characterId: string }>();
  const [character, setCharacter] = useState<Character | null>(null);
  const [strategicGame, setStrategicGame] = useState<StrategicGame | null>(null);
  const [profession, setProfession] = useState<Profession | null>(null);
  const [faction, setFaction] = useState<Faction | null>(null);
  const { showError } = useError();

  useEffect(() => {
    if (characterId) {
      fetchCharacter(characterId)
        .then((char) => {
          setCharacter(char);
        })
        .catch((err: Error) => {
          showError(err.message);
        });
    }
  }, [characterId, showError]);

  useEffect(() => {
    if (character && character.gameId) {
      fetchStrategicGame(character.gameId)
        .then((game) => setStrategicGame(game))
        .catch((err: Error) => {
          showError(err.message);
        });
    }
    if (character && character.factionId) {
      fetchFaction(character.factionId)
        .then((factionData) => setFaction(factionData))
        .catch((err: Error) => {
          showError(err.message);
        });
    }
    if (character && character.info && character.info.professionId) {
      fetchProfession(character.info.professionId)
        .then((professionData) => setProfession(professionData))
        .catch((err: Error) => {
          showError(err.message);
        });
    }
  }, [character, showError]);

  if (!character || !strategicGame || !faction) return <div>Loading...</div>;

  return (
    <>
      <CharacterViewActions character={character} setCharacter={setCharacter} faction={faction} game={strategicGame} />
      <Grid container spacing={5}>
        <Grid size={2}>
          <CharacterViewResume character={character} strategicGame={strategicGame} faction={faction} />
        </Grid>
        <Grid size={7}>
          <CharacterViewTabs
            character={character}
            setCharacter={setCharacter}
            strategicGame={strategicGame}
            faction={faction}
            profession={profession}
          />
        </Grid>
        <Grid size={3}>
          <Typography variant="h6" color="primary">
            {t('description')}
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mt: 2, whiteSpace: 'pre-line' }}>
            {character.description}
          </Typography>
        </Grid>
      </Grid>
    </>
  );
};

export default CharacterView;
