import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Grid, Typography } from '@mui/material';
import { Faction, gridSizeShowcase } from '@labcabrera-rmu/rmu-react-shared-lib';
import FactionCard from '../../factions/FactionCard';

export default function StrategicGameViewFactions({ factions }: { factions: Faction[] | undefined }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!factions) return;

  return (
    <Grid container spacing={2}>
      {factions.map((faction) => (
        <Grid key={faction.id} size={gridSizeShowcase}>
          <FactionCard
            faction={faction}
            onClick={() => navigate(`/strategic/factions/view/${faction.id}`, { state: { faction } })}
          />
        </Grid>
      ))}
      {factions.length === 0 && (
        <Grid size={12}>
          <Typography variant="body1" color="text.secondary">
            <em>{t('no-factions-have-been-created')}</em>
          </Typography>
        </Grid>
      )}
    </Grid>
  );
}
