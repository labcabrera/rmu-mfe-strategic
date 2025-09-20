import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Character } from '../../api/character.dto';
import { Faction } from '../../api/faction.dto';
import CharacterListItem from '../../shared/list-items/CharacterListItem';

interface FactionViewCharactersProps {
  faction: Faction;
  characters: Character[];
}

const FactionViewCharacters: FC<FactionViewCharactersProps> = ({ faction, characters }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleCreate = () => {
    navigate(`/strategic/characters/create?gameId=${faction.gameId}&factionId=${faction.id}`, { state: { faction } });
  };

  if (!faction || !characters) return <>Loading...</>;

  return (
    <Grid container spacing={2}>
      <Box display="flex" alignItems="center">
        <Typography variant="h6" color="primary" display="inline">
          {t('characters')}
        </Typography>
        <IconButton onClick={handleCreate} sx={{ ml: 1 }}>
          <AddCircleIcon />
        </IconButton>
      </Box>
      <Grid size={12}>
        {characters.map((character) => (
          <CharacterListItem key={character.id} character={character} />
        ))}
        {characters.length === 0 && <Typography variant="body1">{t('not-found-characters')}</Typography>}
      </Grid>
    </Grid>
  );
};

export default FactionViewCharacters;
