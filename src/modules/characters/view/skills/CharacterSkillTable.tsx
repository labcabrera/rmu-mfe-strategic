import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import SquareIcon from '@mui/icons-material/Square';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import TurnedInIcon from '@mui/icons-material/TurnedIn';
import TurnedInNotIcon from '@mui/icons-material/TurnedInNot';
import {
  Box,
  ButtonGroup,
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
import {
  Character,
  CharacterSkill,
  DeleteButton,
  deleteSkill,
  levelDownSkill,
  levelUpSkill,
  Profession,
  setUpProfessionalSkill,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { useError } from '../../../../ErrorContext';

const maxProfessionalSkills = 10;
const maxKnackSkills = 2;

const CharacterSkillTable: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  profession?: Profession;
}> = ({ character, setCharacter, profession }) => {
  const currentKnackSkills = character.skills.filter((s) => s.professional?.includes('knack')).length;
  const currentProfessionalSkills = character.skills.filter((s) => s.professional?.includes('professional')).length;

  return (
    <Paper>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell align="left">{t('Skill')}</TableCell>
            <TableCell align="left">
              <Tooltip title={t('Specializacion')}>
                <Typography variant="body2">
                  <b>Spec</b>
                </Typography>
              </Tooltip>
            </TableCell>
            <TableCell align="left">Stats</TableCell>

            <TableCell align="right">
              <Tooltip title={t('Developed ranks')}>
                <Typography variant="body2">
                  <b>{t('Ranks')}</b>
                </Typography>
              </Tooltip>
            </TableCell>
            <TableCell align="right">
              <Tooltip title={t('Rank bonus')}>
                <Typography variant="body2">
                  <b>Rank</b>
                </Typography>
              </Tooltip>
            </TableCell>
            <TableCell align="right">
              <Tooltip title={t('Stat bonus')}>
                <Typography variant="body2">
                  <b>Stat</b>
                </Typography>
              </Tooltip>
            </TableCell>
            <TableCell align="right">
              <Tooltip title={t('Racial bonus')}>
                <Typography variant="body2">
                  <b>Racial</b>
                </Typography>
              </Tooltip>
            </TableCell>
            <TableCell align="right">
              <Tooltip title={t('Profession bonus')}>
                <Typography variant="body2">
                  <b>Proffesion</b>
                </Typography>
              </Tooltip>
            </TableCell>
            <TableCell align="right">Custom</TableCell>
            <TableCell align="right">Total</TableCell>
            <TableCell align="right">
              <Tooltip title={t('Development cost')}>
                <Typography variant="body2">
                  <b>Dev</b>
                </Typography>
              </Tooltip>
            </TableCell>
            <TableCell align="left">
              <Tooltip title={t('Developed ranks')}>
                <Typography variant="body2">
                  <b>{t('Dev Ranks')}</b>
                </Typography>
              </Tooltip>
            </TableCell>
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
          {character?.skills.map((item, index) => (
            <CharacterViewSkillsEntry
              key={index}
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
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
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
    setUpProfessionalSkill(character.id, skillObj.skillId, skillObj.specialization, array)
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
    setUpProfessionalSkill(character.id, skillObj.skillId, skillObj.specialization, array)
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
    return skill.statistics && skill.statistics.length > 0 ? skill.statistics.join('/').toLowerCase() : '-';
  };

  return (
    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell component="th" scope="row">
        {t(skill.skillId)}
      </TableCell>
      <TableCell component="th" scope="row">
        {skill.specialization ? t(skill.specialization) : '-'}
      </TableCell>
      <TableCell align="left">{getStatistics(skill)}</TableCell>

      <TableCell align="right">
        <Typography variant="body2" display="inline">
          <b>{skill.ranks}</b>
        </Typography>
      </TableCell>
      <TableCell
        align="right"
        sx={{
          color: getColor(skill.developmentBonus),
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
      <TableCell
        align="right"
        sx={{ color: skill.customBonus === 0 ? undefined : skill.customBonus > 0 ? 'success.main' : 'error.main' }}
      >
        {skill.customBonus}
      </TableCell>
      <TableCell
        align="right"
        sx={{
          color: getColor(skill.totalBonus),
          fontWeight: 'bold',
        }}
      >
        {skill.totalBonus}
      </TableCell>
      <TableCell align="right">{skill.development?.join(' / ') || '-'}</TableCell>
      <TableCell align="right">
        <Stack direction="row" spacing={0}>
          {Array.from({ length: 3 }, (_, idx) => idx + 1).map((rank) => (
            <Box key={rank} component="span" sx={{ display: 'inline-flex', mx: 0, p: 0 }}>
              {rank <= skill.ranksDeveloped ? (
                <SquareIcon sx={{ mx: 0, p: 0 }} fontSize="small" />
              ) : (
                <CropSquareIcon sx={{ mx: 0, p: 0 }} fontSize="small" />
              )}
            </Box>
          ))}
        </Stack>
      </TableCell>
      <TableCell align="left">
        <ButtonGroup>
          <IconButton onClick={handleLevelUp} disabled={isLevelUpDisabled()} color="primary">
            <ArrowCircleUpIcon />
          </IconButton>
          <IconButton onClick={handleLevelDown} disabled={isLevelDownDisabled()} color="primary">
            <ArrowCircleDownIcon />
          </IconButton>
          <DeleteButton onClick={() => handleDeleteSkill(skill)} disabled={isDeletedDisabled()} />
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
        </ButtonGroup>
      </TableCell>
    </TableRow>
  );
};

export default CharacterSkillTable;
