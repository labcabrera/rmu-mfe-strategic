import React, { FC } from 'react';
import { TextField, Typography } from '@mui/material';
import { t } from 'i18next';
import { Skill } from '../../../api/skill.dto';

const AddSkillSpecialization: FC<{
  skill: Skill;
  specialization: string | null;
  setSpecialization: (s: string | null) => void;
}> = ({ skill, specialization, setSpecialization }) => {
  if (skill.specialization == null)
    return <Typography variant="body2">{t('this-skill-has-no-specialization')}</Typography>;

  return (
    <TextField
      label={t('specialization')}
      value={specialization ?? ''}
      onChange={(e) => setSpecialization(e.target.value === '' ? null : e.target.value)}
      fullWidth
      size="small"
      variant="outlined"
    />
  );
};

export default AddSkillSpecialization;
