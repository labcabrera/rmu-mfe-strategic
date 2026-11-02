import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CardGrid, EmptyState, Faction } from '@labcabrera-rmu/rmu-react-shared-lib';
import FactionCard from '../../factions/FactionCard';

export default function StrategicGameViewFactions({ factions }: { factions: Faction[] | undefined }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!factions) return;

  if (factions.length === 0) {
    return <EmptyState dense title={t('no-factions-have-been-created')} />;
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
