import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, Grid } from '@mui/material';
import { Profession } from '@labcabrera-rmu/rmu-react-shared-lib';

const CharacterCreateProfessionalSkills: FC<{
  profession: Profession;
}> = ({ profession }) => {
  const { t } = useTranslation();

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
