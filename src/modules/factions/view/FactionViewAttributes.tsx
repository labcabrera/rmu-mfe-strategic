import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Faction } from '../../api/faction.dto';
import NumericCard from '../../shared/cards/NumericCard';

interface FactionViewAttributesProps {
  faction: Faction;
  setFaction: React.Dispatch<React.SetStateAction<Faction>>;
}

interface InfoFieldProps {
  i18n: string;
  value: string | number | undefined;
  size?: number;
}

const InfoField: React.FC<InfoFieldProps> = ({ i18n, value, size = 2 }) => {
  const { t } = useTranslation();

  return (
    <Grid size={size}>
      <TextField label={t(i18n)} variant="standard" value={value} fullWidth />
    </Grid>
  );
};

interface HeaderCategoryProps {
  i18nLabel: string;
}

const HeaderCategory: React.FC<HeaderCategoryProps> = ({ i18nLabel }) => {
  const { t } = useTranslation();

  return (
    <Grid size={12}>
      <Typography variant="h6" color="primary">
        {t(i18nLabel)}
      </Typography>
    </Grid>
  );
};

const FactionViewAttributes: React.FC<FactionViewAttributesProps> = ({ faction, setFaction }) => {
  const { t } = useTranslation();

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
          />
        </Box>
      </Grid>
    </Grid>
  );
};

export default FactionViewAttributes;
