import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Grid } from '@mui/material';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { t } from 'i18next';
import { Faction } from '../../api/faction.dto';
import { StrategicGame } from '../../api/strategic-game.dto';
import FactionCard from '../../shared/cards/FactionCard';

const StrategicGameViewFactions: FC<{
  strategicGame: StrategicGame;
  factions: Faction[];
}> = ({ strategicGame, factions }) => {
  const navigate = useNavigate();

  const handleCreateFaction = () => {
    navigate(`/strategic/factions/create?gameId=${strategicGame.id}`, { state: { strategicGame } });
  };

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Box display="flex" alignItems="center">
          <Typography variant="h6" color="primary" display="inline">
            {t('factions')}
          </Typography>
          <IconButton onClick={handleCreateFaction} sx={{ ml: 1 }}>
            <AddCircleIcon />
          </IconButton>
        </Box>
      </Grid>
      <Grid size={12}>
        <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
          {factions.map((faction) => (
            <FactionCard key={faction.id} faction={faction} />
          ))}
        </Box>
        {factions.length === 0 && <Typography variant="body1">{t('not-found-factions')}</Typography>}
      </Grid>
    </Grid>
  );
};

export default StrategicGameViewFactions;
