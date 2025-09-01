/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { fetchCharacters } from '../../api/characters';
import CharacterAvatar from '../../shared/avatars/CharacterAvatar';
import SnackbarError from '../../shared/errors/SnackbarError';

const FactionViewCharactersItem = ({ character }) => {
  const navigate = useNavigate();

  const handleCharacterClick = () => {
    navigate(`/strategic/characters/view/${character.id}`, { state: { character: character } });
  };

  return (
    <>
      <ListItemButton onClick={handleCharacterClick}>
        <ListItemAvatar>
          <CharacterAvatar character={character} />
        </ListItemAvatar>
        <ListItemText primary={character.name} secondary={character.description} />
      </ListItemButton>
    </>
  );
};

const FactionViewCharacters = ({ faction }) => {
  const { t } = useTranslation();
  const [characters, setCharacters] = useState([]);
  const [displayError, setDisplayError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const bindCharacters = () => {
    console.log('Binding characters for faction:', faction.id);
    fetchCharacters(`factionId==${faction.id}`, 0, 100)
      .then((data) => setCharacters(data))
      .catch((error) => {
        setDisplayError(true);
        setErrorMessage(`Error fetching characters: ${error.message}`);
      });
  };

  useEffect(() => {
    if (faction && faction.id) {
      bindCharacters();
    }
  }, [faction]);

  if (!faction) {
    return <>Loading...</>;
  }

  return (
    <>
      <Grid>
        <Grid size={12}>
          <Typography variant="h6" color="primary">
            {t('characters')}
          </Typography>
        </Grid>
        <Grid size={12}>
          {characters.map((character) => (
            <FactionViewCharactersItem key={character.id} character={character} />
          ))}
        </Grid>
      </Grid>
      <SnackbarError open={displayError} message={errorMessage} onClose={() => setDisplayError(false)} />
    </>
  );
};

export default FactionViewCharacters;
