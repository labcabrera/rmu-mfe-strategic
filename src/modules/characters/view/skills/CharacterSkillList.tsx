import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Typography } from '@mui/material';
import { Character, RmuTextCard } from '@labcabrera-rmu/rmu-react-shared-lib';
import { defaultImage } from '../../../services/image-service';

const CharacterSkillList: FC<{ character: Character }> = ({ character }) => {
  const { t } = useTranslation();
  const skills = character?.skills || [];

  return (
    <>
      <Grid container spacing={1}>
        {skills.map((s) => (
          <Grid key={`${s.skillId}-${s.specialization ?? '0'}`} size={{ xs: 12, md: 3 }}>
            <RmuTextCard
              value={t(s.skillId)}
              subtitle={`${s.specialization || ''}${s.specialization ? ' • ' : ''}Ranks: ${s.ranks} • Total: ${s.totalBonus ?? 0}`}
              image={defaultImage}
            />
          </Grid>
        ))}
        <Grid size={12}>
          {skills.length === 0 && (
            <Typography variant="body1" color="text.secondary">
              {t('not-found-skills')}
            </Typography>
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default CharacterSkillList;
