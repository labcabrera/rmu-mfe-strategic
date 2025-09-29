import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import {
  Box,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { addSkill, levelUpSkill, levelDownSkill, setUpProfessionalSkill, deleteSkill } from '../../api/character';
import { Character, CharacterSkill } from '../../api/character.dto';
import { Profession } from '../../api/professions';
import { AddSkill } from '../../api/skill.dto';
import CharacterAddSkillDialog from './CharacterViewAddSkillDialog';

const CharacterViewSkills: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character>>;
  profession?: Profession;
}> = ({ character, setCharacter, profession }) => {
  const { showError } = useError();
  const [openAddSkillDialog, setOpenAddSkillDialog] = useState(false);

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
      <Box display="flex" alignItems="center" sx={{ minHeight: 60 }}>
        <Typography variant="h6" color="primary" display="inline">
          {t('skills')}
        </Typography>
        <IconButton onClick={() => setOpenAddSkillDialog(true)} color="primary">
          <AddCircleIcon />
        </IconButton>
      </Box>
      <Paper sx={{ width: '100%' }}>
        <Table sx={{ minWidth: 900 }} aria-label="simple table">
          <TableHead
            sx={{
              '& .MuiTableCell-root': {
                color: 'primary.main',
                fontWeight: 'bold',
              },
            }}
          >
            <TableRow>
              <TableCell align="left">{t('skill')}</TableCell>
              <TableCell align="left">Specialization</TableCell>
              <TableCell align="left">Stats</TableCell>
              <TableCell align="right">Dev</TableCell>
              <TableCell align="right">Ranks</TableCell>
              <TableCell align="right">Rank bonus</TableCell>
              <TableCell align="right">Stat</TableCell>
              <TableCell align="right">Racial</TableCell>
              <TableCell align="right">Professional</TableCell>
              <TableCell align="right">Custom</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="left">
                Development points: {character.experience.availableDevelopmentPoints} /{' '}
                {character.experience.developmentPoints}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {character?.skills.map((item) => (
              <CharacterViewSkillsEntry
                key={item.skillId}
                skill={item}
                character={character}
                setCharacter={setCharacter}
                profession={profession}
              />
            ))}
          </TableBody>
        </Table>
        <CharacterAddSkillDialog
          open={openAddSkillDialog}
          character={undefined}
          onClose={() => setOpenAddSkillDialog(false)}
          onSkillAdded={(value) => onSkillAdded(value)}
        />
      </Paper>
    </>
  );
};

const CharacterViewSkillsEntry: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character>>;
  skill: CharacterSkill;
  profession?: Profession;
}> = ({ character, setCharacter, skill, profession }) => {
  const { showError } = useError();

  const handleLevelUp = () => {
    levelUpSkill(character.id, skill.skillId)
      .then((updated) => {
        setCharacter(updated);
      })
      .catch((error: any) => {
        showError(error.message);
      });
  };

  const handleLevelDown = () => {
    levelDownSkill(character.id, skill.skillId)
      .then((updated) => {
        setCharacter(updated);
      })
      .catch((error: any) => {
        showError(error.message);
      });
  };

  const handleSetUpProfessionalSkill = (skillObj: CharacterSkill) => {
    setUpProfessionalSkill(character.id, skillObj.skillId)
      .then((updated) => {
        setCharacter(updated);
      })
      .catch((error: any) => {
        showError(error.message);
      });
  };

  const handleDeleteSkill = (skillObj: CharacterSkill) => {
    deleteSkill(character.id, skillObj.skillId)
      .then((updated) => {
        setCharacter(updated);
      })
      .catch((error: any) => {
        showError(error.message);
      });
  };

  const isLevelUpDisabled = () => {
    //TODO read allow 3rd rank from game settings
    const rank = Math.min(skill.ranksDeveloped, 2);
    const cost = skill.development[rank];
    return character.experience.availableDevelopmentPoints < cost || skill.ranksDeveloped > 2;
  };

  const isLevelDownDisabled = () => {
    return skill.ranksDeveloped < 1;
  };

  const isDeletedDisabled = () => {
    if (skill.skillId === 'body-development') return true;
    return skill.ranks > skill.ranksDeveloped;
  };

  const getColor = (value: number) => {
    if (value < 0) return 'error.main';
    if (value > 0) return 'success.main';
    return 'inherit';
  };

  const isAvailableProfessionSkill = (skillObj: CharacterSkill) => {
    if (profession) {
      const includes = profession.professionalSkills.includes(skillObj.skillId);
      const alreadyAdded = skillObj.professional && skillObj.professional.includes('professional');
      return includes && !alreadyAdded;
    }
    return false;
  };

  const isProfessionalSkill = (skillObj: CharacterSkill) => {
    return skillObj.professional && skillObj.professional.includes('professional');
  };

  const getStatistics = (skill: CharacterSkill) => {
    return skill.statistics && skill.statistics.length > 0 ? skill.statistics.join('/').toUpperCase() : '-';
  };

  return (
    <TableRow key={skill.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell component="th" scope="row">
        {t(skill.skillId)}
        {isProfessionalSkill(skill) ? ' *' : null}
      </TableCell>
      <TableCell component="th" scope="row">
        {skill.specialization || '-'}
      </TableCell>
      <TableCell align="left">{getStatistics(skill)}</TableCell>
      <TableCell align="right">{skill.development?.join(' / ') || '-'}</TableCell>
      <TableCell align="right">
        <Typography variant="body2" display="inline">
          {skill.ranks}
        </Typography>
        {skill.ranksDeveloped > 0 && (
          <Typography variant="body2" display="inline" color="success">
            {` (↑${skill.ranksDeveloped})`}
          </Typography>
        )}
      </TableCell>
      <TableCell
        align="right"
        sx={{
          color: getColor(skill.developmentBonus),
          fontWeight: 'bold',
        }}
      >
        {skill.developmentBonus}
      </TableCell>
      <TableCell
        align="right"
        sx={{
          color: getColor(skill.statBonus),
        }}
      >
        {skill.statBonus}
      </TableCell>
      <TableCell align="right" sx={{ color: getColor(skill.racialBonus) }}>
        {skill.racialBonus}
      </TableCell>
      <TableCell align="right" sx={{ color: getColor(skill.professionalBonus) }}>
        {skill.professionalBonus}
      </TableCell>
      <TableCell align="right">{skill.customBonus}</TableCell>
      <TableCell
        align="right"
        sx={{
          color: getColor(skill.totalBonus),
          fontWeight: 'bold',
        }}
      >
        {skill.totalBonus}
      </TableCell>
      <TableCell align="left">
        <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <IconButton onClick={handleLevelUp} disabled={isLevelUpDisabled()} color="primary">
              <ArrowCircleUpIcon />
            </IconButton>
            <IconButton onClick={handleLevelDown} disabled={isLevelDownDisabled()} color="primary">
              <ArrowCircleDownIcon />
            </IconButton>
            {!isDeletedDisabled() && (
              <IconButton onClick={() => handleDeleteSkill(skill)} color="primary">
                <DeleteForeverIcon />
              </IconButton>
            )}
          </Box>
          <Stack direction="row" spacing={2}>
            {isAvailableProfessionSkill(skill) && (
              <IconButton
                aria-label="set-professional"
                onClick={() => handleSetUpProfessionalSkill(skill)}
                color="primary"
              >
                <StarBorderIcon />
              </IconButton>
            )}
          </Stack>
        </Stack>
      </TableCell>
    </TableRow>
  );
};

export default CharacterViewSkills;
