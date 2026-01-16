import React, { FC, useEffect, useState } from 'react';
import TableChartIcon from '@mui/icons-material/TableChart';
import ViewListIcon from '@mui/icons-material/ViewList';
import { Box, IconButton, Typography, Card, CardContent, Grid, Stack } from '@mui/material';
import { t } from 'i18next';
import { Character } from '../../../api/character.dto';
import { Profession } from '../../../api/professions';
import CharacterSkillTable from './CharacterSkillTable';

const CharacterViewSkills: FC<{
  character: Character;
  setCharacter: React.Dispatch<React.SetStateAction<Character>>;
  profession?: Profession;
}> = ({ character, setCharacter, profession }) => {
  const [detailMode, setDetailMode] = useState(false);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" color="primary">
          {t('skills')}
        </Typography>
        <IconButton aria-label={detailMode ? 'detail' : 'simple'} onClick={() => setDetailMode((v) => !v)}>
          {detailMode ? <TableChartIcon /> : <ViewListIcon />}
        </IconButton>
      </Stack>

      {detailMode ? (
        <CharacterSkillTable character={character} setCharacter={setCharacter} profession={profession} />
      ) : (
        <Grid container spacing={2}>
          {character?.skills?.length ? (
            character.skills.map((s) => (
              <Grid size={2} key={s.skillId}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1">{t(s.skillId)}</Typography>
                    <Typography variant="h6" color="textPrimary">
                      {s.totalBonus}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid size={12}>
              <Typography variant="body2">{t('no-skills')}</Typography>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default CharacterViewSkills;
