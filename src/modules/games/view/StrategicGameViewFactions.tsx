import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Grid, Typography } from '@mui/material';
import { Faction, RmuTextCard } from '@labcabrera-rmu/rmu-react-shared-lib';
import { gridSizeCard } from '../../services/display';

export default function StrategicGameViewFactions({ factions }: { factions: Faction[] | undefined }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!factions) return;

  return (
    <Grid container spacing={1}>
      {factions.map((faction) => (
        <Grid key={faction.id} size={gridSizeCard}>
          <RmuTextCard
            value={faction.name}
            subtitle={faction.shortDescription || 'No description provided'}
            image={faction.imageUrl || ''}
            onClick={() => navigate(`/strategic/factions/view/${faction.id}`, { state: { faction } })}
          />
        </Grid>
      ))}
      <Grid size={12}>
        {factions.length === 0 && (
          <Typography variant="body1" color="secondary">
            <em>{t('No factions have been created')}</em>
          </Typography>
        )}
      </Grid>
    </Grid>
  );
}
