import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { t } from 'i18next';
import { Faction } from '../../api/faction.dto';
import { StrategicGame } from '../../api/strategic-game.dto';
import RmuTextCard from '../../shared/cards/RmuTextCard';

const StrategicGameViewFactions: FC<{
  strategicGame: StrategicGame;
  factions: Faction[];
}> = ({ strategicGame, factions }) => {
  const navigate = useNavigate();

  const onCreateFaction = () => {
    navigate(`/strategic/factions/create?gameId=${strategicGame.id}`, { state: { strategicGame } });
  };

  return (
    <Grid container spacing={1}>
      {factions.map((faction) => (
        <Grid key={faction.id} size={{ xs: 12, md: 3 }}>
          <RmuTextCard
            size="medium"
            value={faction.name}
            subtitle={faction.shortDescription}
            image={faction.imageUrl}
            onClick={() => navigate(`/strategic/factions/view/${faction.id}`, { state: { faction } })}
          />
        </Grid>
      ))}
      <Grid size={12}>
        {factions.length === 0 && <Typography variant="body1">{t('not-found-factions')}</Typography>}
      </Grid>
    </Grid>
  );
};

export default StrategicGameViewFactions;
