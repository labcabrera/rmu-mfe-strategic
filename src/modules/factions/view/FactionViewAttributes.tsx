import React, { FC } from 'react';
import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { t } from 'i18next';
import { Faction } from '../../api/faction.dto';
import NumericCard from '../../shared/cards/NumericCard';

const FactionViewAttributes: FC<{
  faction: Faction;
}> = ({ faction }) => {
  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
          {t('strategic-game-options')}
        </Typography>
        <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
          <NumericCard
            value={faction.management.availableGold}
            subtitle={t('available-gold')}
            image={`/static/images/items/gold-coin.png`}
            applyColor={false}
          />
          <NumericCard
            value={faction.management.availableXP}
            subtitle={t('available-xp')}
            image={`/static/images/generic/experience.png`}
            applyColor={false}
            applyFormat={true}
          />
        </Box>
      </Grid>
    </Grid>
  );
};

export default FactionViewAttributes;
