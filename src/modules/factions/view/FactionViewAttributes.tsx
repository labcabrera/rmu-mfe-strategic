import React, { FC } from 'react';
import Grid from '@mui/material/Grid';
import { RmuTextCard } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { Faction } from '../../api/faction.dto';
import { imageBaseUrl } from '../../services/config';

const FactionViewAttributes: FC<{
  faction: Faction;
}> = ({ faction }) => {
  return (
    <Grid container spacing={1}>
      <Grid size={{ xs: 12, md: 3 }}>
        <RmuTextCard
          value={new Intl.NumberFormat('en-EN').format(faction.management.availableGold)}
          subtitle={t('Gold')}
          image={`${imageBaseUrl}images/generic/coins.png`}
          grayscale={0.7}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <RmuTextCard
          value={new Intl.NumberFormat('en-EN').format(faction.management.availableXP)}
          subtitle={t('Experience')}
          image={`${imageBaseUrl}images/generic/experience.png`}
          grayscale={0.7}
        />
      </Grid>
    </Grid>
  );
};

export default FactionViewAttributes;
