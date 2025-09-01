/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import CharacterAvatar from '../../shared/avatars/CharacterAvatar';

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

const FactionViewCharacters = ({ faction, characters }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleCreate = () => {
    navigate(`/strategic/characters/create?gameId=${faction.gameId}&factionId=${faction.id}`, { state: { faction: faction } });
  };

  if (!faction || !characters) {
    return <>Loading...</>;
  }

  return (
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
      <Grid size={12}>
        <Button variant="outlined" color="primary" onClick={handleCreate}>
          {t('add')}
        </Button>
      </Grid>
    </Grid>
  );
};

export default FactionViewCharacters;
