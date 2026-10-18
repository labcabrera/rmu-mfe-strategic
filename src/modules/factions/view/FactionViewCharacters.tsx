import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import { Character, Faction, gridSizeCard, LoadingState, RmuTextCard } from '@labcabrera-rmu/rmu-react-shared-lib';

const FactionViewCharacters: FC<{
  faction?: Faction;
  characters?: Character[];
}> = ({ faction, characters }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!faction || !characters) return <LoadingState />;

  return (
    <Grid container spacing={1}>
      {characters.map((character) => (
        <Grid key={character.id} size={gridSizeCard}>
          <RmuTextCard
            value={character.name}
            subtitle={`${character.info.race.name} - ${t(character.info.professionId)} - ${character.experience.availableLevel}`}
            image={character.imageUrl || ''}
            onClick={() => navigate(`/strategic/characters/view/${character.id}`, { state: { character } })}
          />
        </Grid>
      ))}
      <Grid size={12}>{characters.length === 0 && <p>{t('no-characters-have-been-created')}</p>}</Grid>
    </Grid>
  );
};

export default FactionViewCharacters;
