import React, { FC } from 'react';
import { Grid, Typography } from '@mui/material';
import { t } from 'i18next';
import { Character } from '../../../api/character.dto';
import RmuTextCard from '../../../shared/cards/RmuTextCard';

const CharacterSkillList: FC<{ character: Character }> = ({ character }) => {
  const skills = character?.skills || [];

  return (
    <>
      <Grid container spacing={1}>
        {skills.map((s) => (
          <Grid key={`${s.skillId}-${s.specialization ?? '0'}`} size={{ xs: 12, md: 3 }}>
            <RmuTextCard
              size="medium"
              value={t(s.skillId)}
              subtitle={`${s.specialization || ''}${s.specialization ? ' • ' : ''}Ranks: ${s.ranks} • Total: ${
                s.totalBonus ?? 0
              }`}
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
