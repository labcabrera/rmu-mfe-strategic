import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, Grid, Typography } from '@mui/material';
import { Profession } from '../../api/professions';

const CharacterCreateProfessionalSkills: FC<{
  profession: Profession;
}> = ({ profession }) => {
  const { t } = useTranslation();
  const skillsTranslated = profession.professionalSkills.map((skill) => t(skill)).sort();

  return (
    <>
      <Typography variant="h6" color="primary" gutterBottom>
        {t('professional-skills')}
      </Typography>
      <Grid container spacing={1}>
        {skillsTranslated.map((skill, index) => (
          <Chip key={index} label={skill} />
        ))}
      </Grid>
    </>
  );
};

export default CharacterCreateProfessionalSkills;
