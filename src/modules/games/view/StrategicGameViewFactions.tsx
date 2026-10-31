import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Typography } from '@mui/material';
import { CardGrid, Faction } from '@labcabrera-rmu/rmu-react-shared-lib';
import FactionCard from '../../factions/FactionCard';

export default function StrategicGameViewFactions({ factions }: { factions: Faction[] | undefined }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!factions) return;

  if (factions.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary">
        <em>{t('no-factions-have-been-created')}</em>
      </Typography>
    );
  }
  return (
    <CardGrid
      items={factions}
      getKey={(faction) => faction.id}
      renderItem={(faction) => (
        <FactionCard
          faction={faction}
          onClick={() => navigate(`/strategic/factions/view/${faction.id}`, { state: { faction } })}
        />
      )}
    />
  );
}
