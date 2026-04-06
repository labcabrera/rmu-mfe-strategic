import React, { FC } from 'react';
import { Chip, Grid } from '@mui/material';
import { t } from 'i18next';
import { Profession } from '../../api/professions';

const CharacterCreateProfessionalSkills: FC<{
  profession: Profession;
}> = ({ profession }) => {
  const skillsTranslated = profession.professionalSkills.map((skill) => t(skill)).sort();

  return (
    <Grid container spacing={1}>
      {skillsTranslated.map((skill, index) => (
        <Chip key={index} label={skill} />
      ))}
    </Grid>
  );
};

export default CharacterCreateProfessionalSkills;
