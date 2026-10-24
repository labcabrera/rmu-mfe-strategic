import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Chip, Grid, Typography } from '@mui/material';
import { EntityCard, Faction, imageBaseUrl, LoadingState, TacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { PANEL_CARD_SIZE } from '../../shared/layout/Bento';

const STATUS_COLORS: Record<TacticalGame['status'], 'default' | 'success' | 'info'> = {
  created: 'default',
  in_progress: 'success',
  finished: 'info',
};

/** Tactical games of a campaign as showcase cards: image, factions taking part, status and round. */
const StrategicGameViewTacticalGames: FC<{
  tacticalGames?: TacticalGame[];
  factions?: Faction[];
}> = ({ tacticalGames, factions }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!tacticalGames) return <LoadingState />;
  if (tacticalGames.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t('no-tactical-games-have-been-created')}
      </Typography>
    );
  }

  const factionNames = (tacticalGame: TacticalGame) =>
    tacticalGame.factions?.length
      ? tacticalGame.factions.map((id) => factions?.find((faction) => faction.id === id)?.name ?? '').join(' · ')
      : t('no-factions-added');

  return (
    <Grid container spacing={2}>
      {tacticalGames.map((tacticalGame) => (
        <Grid key={tacticalGame.id} size={PANEL_CARD_SIZE}>
          <EntityCard
            title={tacticalGame.name}
            subtitle={factionNames(tacticalGame)}
            image={tacticalGame.imageUrl || `${imageBaseUrl}images/generic/tactical.png`}
            chips={
              <Chip
                size="small"
                color={STATUS_COLORS[tacticalGame.status]}
                label={t(`tactical-game-status-${tacticalGame.status}`)}
              />
            }
            metrics={tacticalGame.round ? [{ label: t('round'), value: tacticalGame.round }] : undefined}
            onClick={() => navigate(`/tactical/games/view/${tacticalGame.id}`, { state: { tacticalGame } })}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default StrategicGameViewTacticalGames;
