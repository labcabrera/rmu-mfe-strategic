import React, { FC } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { t } from 'i18next';
import { StrategicGame } from '../../api/strategic-game.dto';
import NumericCard from '../../shared/cards/NumericCard';

const StrategicGameViewAttributes: FC<{
  strategicGame: StrategicGame;
}> = ({ strategicGame }) => {
  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
          {t('strategic-game-options')}
        </Typography>
        <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
          <NumericCard
            value={strategicGame.options.experienceMultiplier}
            subtitle={t('experience-multiplier')}
            image={`/static/images/generic/experience.png`}
            applyColor={false}
          />
          <NumericCard
            value={strategicGame.options.fatigueMultiplier}
            subtitle={t('fatigue-multiplier')}
            image={`/static/images/generic/stat-co.png`}
            applyColor={false}
          />
          <NumericCard
            value={strategicGame.options.boardScaleMultiplier}
            subtitle={t('board-scale-multiplier')}
            image={`/static/images/generic/realm.png`}
            applyColor={false}
          />
          <NumericCard
            value={strategicGame.options.letality}
            subtitle={t('letality')}
            image={`/static/images/generic/physical.png`}
          />
        </Box>
      </Grid>
      <Grid size={12}>
        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
          {t('power-level')}
        </Typography>
        <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
          <NumericCard
            value={strategicGame.powerLevel.baseDevPoints}
            subtitle={t('base-dev-points')}
            image={`/static/images/generic/trait-combat.png`}
            applyColor={false}
          />
          <NumericCard
            value={strategicGame.powerLevel.statRandomMin}
            subtitle={t('stat-random-min')}
            image={`/static/images/generic/stat-st.png`}
            applyColor={false}
          />
          <NumericCard
            value={strategicGame.powerLevel.statBoostPotential}
            subtitle={t('stat-boost-potential')}
            image={`/static/images/generic/stat-st.png`}
            applyColor={false}
          />
          <NumericCard
            value={strategicGame.powerLevel.statBoostTemporary}
            subtitle={t('stat-boost-temporary')}
            image={`/static/images/generic/stat-st.png`}
            applyColor={false}
          />
          <NumericCard
            value={strategicGame.powerLevel.statCreationBoost}
            subtitle={t('stat-creation-boosts')}
            image={`/static/images/generic/stat-st.png`}
            applyColor={false}
          />
          <NumericCard
            value={strategicGame.powerLevel.statCreationSwap}
            subtitle={t('stat-creation-swaps')}
            image={`/static/images/generic/stat-st.png`}
            applyColor={false}
          />
        </Box>
      </Grid>
    </Grid>
  );
};

export default StrategicGameViewAttributes;
