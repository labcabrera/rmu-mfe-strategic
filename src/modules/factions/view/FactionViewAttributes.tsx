import React, { FC } from 'react';
import Grid from '@mui/material/Grid';
import { RmuTextCard } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { Character } from '../../api/character.dto';
import { Faction } from '../../api/faction.dto';
import { imageBaseUrl } from '../../services/config';

const FactionViewAttributes: FC<{
  faction: Faction;
  characters: Character[];
}> = ({ faction, characters }) => {
  const getTotalLevels = (): number => {
    if (!characters || characters.length === 0) return 0;
    return characters.reduce((sum, c) => sum + (c.experience?.availableLevel ?? 0), 0);
  };

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
      <Grid size={{ xs: 12, md: 3 }}>
        <RmuTextCard
          value={getTotalLevels()}
          subtitle={t('Total levels')}
          image={`${imageBaseUrl}images/generic/experience.png`}
          grayscale={0.7}
        />
      </Grid>
    </Grid>
  );
};

export default FactionViewAttributes;
