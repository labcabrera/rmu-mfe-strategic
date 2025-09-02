/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CharacterListItem from '../list/CharacterListItem';

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
          <CharacterListItem key={character.id} character={character} />
        ))}
      </Grid>
      <Grid size={12}>
        <IconButton variant="outlined" onClick={handleCreate}>
          <AddCircleIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
};

export default FactionViewCharacters;
