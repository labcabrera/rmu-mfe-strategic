import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import TurnedInIcon from '@mui/icons-material/TurnedIn';
import TurnedInNotIcon from '@mui/icons-material/TurnedInNot';
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
  Tooltip,
  Typography,
} from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../../ErrorContext';
import { levelUpSkill, levelDownSkill, setUpProfessionalSkill, deleteSkill } from '../../../api/character';
import { Character, CharacterSkill } from '../../../api/character.dto';
import { Profession } from '../../../api/professions';

const maxProfessionalSkills = 10;
const maxKnackSkills = 2;

const CharacterSkillTable: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character>>;
  profession?: Profession;
}> = ({ character, setCharacter, profession }) => {
  const currentKnackSkills = character.skills.filter((s) => s.professional?.includes('knack')).length;
  const currentProfessionalSkills = character.skills.filter((s) => s.professional?.includes('professional')).length;

  return (
    <Paper sx={{ width: '100%' }}>
      <Table size="small" sx={{ minWidth: 900 }} aria-label="character skills table">
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
            <TableCell align="left">Spec</TableCell>
            <TableCell align="left">Prof</TableCell>
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
              <Tooltip title={t('Development points available / total')}>
                <Typography variant="subtitle2">
                  DP: {character.experience.availableDevelopmentPoints} / {character.experience.developmentPoints}
                </Typography>
              </Tooltip>
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
              currentKnackSkills={currentKnackSkills}
              currentProfessionalSkills={currentProfessionalSkills}
            />
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

const CharacterViewSkillsEntry: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character>>;
  skill: CharacterSkill;
  profession?: Profession;
  currentKnackSkills: number;
  currentProfessionalSkills: number;
}> = ({ character, setCharacter, skill, profession, currentKnackSkills, currentProfessionalSkills }) => {
  const isProfessional = skill.professional?.includes('professional');
  const isKnack = skill.professional?.includes('knack');

  const { showError } = useError();

  const handleLevelUp = () => {
    levelUpSkill(character.id, skill.skillId, skill.specialization)
      .then((updated) => setCharacter(updated))
      .catch((error: any) => showError(error.message));
  };

  const handleLevelDown = () => {
    levelDownSkill(character.id, skill.skillId, skill.specialization)
      .then((updated) => setCharacter(updated))
      .catch((error: any) => showError(error.message));
  };

  const handleSetUpProfessionalSkill = (skillObj: CharacterSkill) => {
    const array = skillObj.professional || [];
    if (array.includes('professional')) {
      //remove
      const index = array.indexOf('professional');
      if (index > -1) {
        array.splice(index, 1);
      }
    } else {
      //add
      array.push('professional');
    }
    setUpProfessionalSkill(character.id, skillObj.skillId, array)
      .then((updated) => setCharacter(updated))
      .catch((error: any) => showError(error.message));
  };

  const handleSetUpKnackSkill = (skillObj: CharacterSkill) => {
    const array = skillObj.professional || [];
    if (array.includes('knack')) {
      //remove
      const index = array.indexOf('knack');
      if (index > -1) {
        array.splice(index, 1);
      }
    } else {
      //add
      array.push('knack');
    }
    setUpProfessionalSkill(character.id, skillObj.skillId, array)
      .then((updated) => setCharacter(updated))
      .catch((error: any) => showError(error.message));
  };

  const handleDeleteSkill = (skillObj: CharacterSkill) => {
    deleteSkill(character.id, skillObj.skillId, skillObj.specialization)
      .then((updated) => setCharacter(updated))
      .catch((error: any) => showError(error.message));
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
    return profession && profession.professionalSkills.includes(skillObj.skillId);
  };

  const getStatistics = (skill: CharacterSkill) => {
    return skill.statistics && skill.statistics.length > 0 ? skill.statistics.join('/').toUpperCase() : '-';
  };

  return (
    <TableRow key={skill.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell component="th" scope="row">
        {t(skill.skillId)}
      </TableCell>
      <TableCell component="th" scope="row">
        {skill.specialization || '-'}
      </TableCell>
      <TableCell component="th" scope="row">
        {isAvailableProfessionSkill(skill) && (
          <>
            <Tooltip title={t('Professional skill')}>
              <IconButton
                aria-label="set-professional"
                onClick={() => handleSetUpProfessionalSkill(skill)}
                disabled={!isProfessional && currentProfessionalSkills >= maxProfessionalSkills}
                color="primary"
              >
                {isProfessional ? <TurnedInIcon /> : <TurnedInNotIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title={t('Knack skill')}>
              <IconButton
                aria-label="set-knack"
                onClick={() => handleSetUpKnackSkill(skill)}
                color="primary"
                disabled={!isKnack && currentKnackSkills >= maxKnackSkills}
              >
                {isKnack ? <StarIcon /> : <StarBorderIcon />}
              </IconButton>
            </Tooltip>
          </>
        )}
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
        </Stack>
      </TableCell>
    </TableRow>
  );
};

export default CharacterSkillTable;
