import React, { FC, useEffect, useState } from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import TableChartIcon from '@mui/icons-material/TableChart';
import ViewListIcon from '@mui/icons-material/ViewList';
import { Box, IconButton, Typography, Card, CardContent, Grid, Stack } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../../ErrorContext';
import { addSkill } from '../../../api/character';
import { Character } from '../../../api/character.dto';
import { Profession } from '../../../api/professions';
import { AddSkill } from '../../../api/skill.dto';
import AddSkillDialog from './AddSkillDialog';
import CharacterSkillTable from './CharacterSkillTable';

const CharacterViewSkills: FC<{
  character: Character;
  setCharacter: React.Dispatch<React.SetStateAction<Character>>;
  profession?: Profession;
}> = ({ character, setCharacter, profession }) => {
  const [detailMode, setDetailMode] = useState(false);
  const [openAddSkillDialog, setOpenAddSkillDialog] = useState(false);
  const { showError } = useError();

  const onSkillAdded = (value: AddSkill) => {
    addSkill(character.id, value)
      .then((updatedCharacter) => {
        setCharacter(updatedCharacter);
        setOpenAddSkillDialog(false);
      })
      .catch((error) => showError(error.message));
  };

  return (
    <>
      <Box>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" color="primary">
              {t('skills')}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
            <IconButton
              aria-label={detailMode ? 'detail' : 'simple'}
              color="primary"
              onClick={() => setDetailMode((v) => !v)}
            >
              {detailMode ? <TableChartIcon /> : <ViewListIcon />}
            </IconButton>
            <IconButton aria-label="refresh" color="primary" onClick={() => setOpenAddSkillDialog(true)}>
              <AddCircleIcon />
            </IconButton>
          </Stack>
        </Stack>

        {detailMode ? (
          <CharacterSkillTable character={character} setCharacter={setCharacter} profession={profession} />
        ) : (
          <Grid container spacing={1}>
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
      <AddSkillDialog
        open={openAddSkillDialog}
        character={character}
        onClose={() => setOpenAddSkillDialog(false)}
        onSkillAdded={(value) => onSkillAdded(value)}
      />
    </>
  );
};

export default CharacterViewSkills;
