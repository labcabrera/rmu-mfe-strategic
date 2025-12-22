import React, { FC } from 'react';
import { Chip, Grid, Typography } from '@mui/material';
import { t } from 'i18next';
import { Profession } from '../../api/professions';

const CharacterCreateSkillCosts: FC<{
  profession: Profession;
}> = ({ profession }) => {
  const getColor = (cost: number[]) => {
    if (cost.length < 1) return undefined;
    if (cost[0] < 3) return 'primary';
    if (cost[0] > 6) return 'error';
    return undefined;
  };

  return (
    <>
      <Typography variant="h6" color="primary" gutterBottom>
        {t('skill-costs')}
      </Typography>
      <Grid container spacing={1}>
        {Object.entries(profession.skillCosts).map(([skill, cost], index) => (
          <Chip key={index} label={`${t(skill)}: ${cost.join(' / ')}`} color={getColor(cost)} />
        ))}
      </Grid>
    </>
  );
};

export default CharacterCreateSkillCosts;
