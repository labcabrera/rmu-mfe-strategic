import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import { t } from 'i18next';
import { Character } from '../../api/character.dto';
import { Faction } from '../../api/faction.dto';
import CharacterCard from '../../shared/cards/CharacterCard';
import RmuTextCard from '../../shared/cards/RmuTextCard';

const FactionViewCharacters: FC<{
  faction: Faction;
  characters: Character[];
}> = ({ faction, characters }) => {
  const navigate = useNavigate();

  if (!faction || !characters) return <>Loading...</>;

  return (
    <Grid container spacing={1}>
      {characters.map((character) => (
        <Grid key={character.id} size={{ xs: 12, md: 3 }}>
          <RmuTextCard
            size="medium"
            value={character.name}
            subtitle={`${character.info.race.name} - ${t(character.info.professionId)} - ${character.experience.availableLevel}`}
            image={character.imageUrl}
            onClick={() => navigate(`/strategic/characters/view/${character.id}`, { state: { character } })}
          />
        </Grid>
      ))}
      <Grid size={12}>{characters.length === 0 && <p>{t('not-found-characters')}</p>}</Grid>
    </Grid>
  );
};

export default FactionViewCharacters;
