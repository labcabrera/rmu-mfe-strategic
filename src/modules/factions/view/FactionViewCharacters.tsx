import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { t } from 'i18next';
import { Character } from '../../api/character.dto';
import { Faction } from '../../api/faction.dto';
import AddButton from '../../shared/buttons/AddButton';
import CharacterCard from '../../shared/cards/CharacterCard';

const FactionViewCharacters: FC<{
  faction: Faction;
  characters: Character[];
}> = ({ faction, characters }) => {
  const navigate = useNavigate();

  const onCharacterCreate = () => {
    navigate(`/strategic/characters/create?gameId=${faction.gameId}&factionId=${faction.id}`, { state: { faction } });
  };

  if (!faction || !characters) return <>Loading...</>;

  return (
    <Grid container spacing={2}>
      <Box display="flex" alignItems="center">
        <Typography variant="h6" color="primary" display="inline">
          {t('characters')}
        </Typography>
        <AddButton onClick={onCharacterCreate} />
      </Box>
      <Grid size={12}>
        <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
          {characters.map((character) => (
            <CharacterCard key={character.id} character={character} />
          ))}
        </Box>
        {characters.length === 0 && <p>{t('not-found-characters')}</p>}
      </Grid>
    </Grid>
  );
};

export default FactionViewCharacters;
