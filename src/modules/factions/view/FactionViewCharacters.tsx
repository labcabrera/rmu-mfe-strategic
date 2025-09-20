import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CharacterListItem from '../../shared/list-items/CharacterListItem';

interface Faction {
  id: string;
  gameId: string;
  // otros campos si es necesario
}

interface Character {
  id: string;
  // otros campos si es necesario
}

interface FactionViewCharactersProps {
  faction: Faction;
  characters: Character[];
}

const FactionViewCharacters: React.FC<FactionViewCharactersProps> = ({ faction, characters }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleCreate = () => {
    navigate(`/strategic/characters/create?gameId=${faction.gameId}&factionId=${faction.id}`, { state: { faction } });
  };

  if (!faction || !characters) {
    return <>Loading...</>;
  }

  return (
    <Grid container spacing={2}>
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
        <IconButton onClick={handleCreate}>
          <GroupAddIcon fontSize="large" />
        </IconButton>
      </Grid>
    </Grid>
  );
};

export default FactionViewCharacters;
