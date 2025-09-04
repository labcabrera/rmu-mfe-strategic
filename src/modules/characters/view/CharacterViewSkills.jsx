/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { addSkill, levelUpSkill, levelDownSkill, setUpProfessionalSkill, deleteSkill } from '../../api/characters';
import SnackbarError from '../../shared/errors/SnackbarError';
import SelectSkill from '../../shared/selects/SelectSkill';

const addSkillFormDataTemplate = {
  skillId: '',
  specialization: '',
  ranks: 0,
  customBonus: 0,
};

const red = '#ffab91';
const green = '#a5d6a7';

const CharacterViewSkillsAdd = ({ character, setCharacter, setErrorMessage, setDisplayError }) => {
  const [skill, setSkill] = useState(null);
  const [formData, setFormData] = useState(addSkillFormDataTemplate);

  const handleSkillChange = (value, skill) => {
    setFormData({ ...formData, skillId: value, specialization: skill?.specialization });
    setSkill(skill);
  };

  const handleSpecializationChange = (e) => {
    setFormData({ ...formData, specialization: e.target.value });
  };

  const isSpecializationAllowed = () => {
    return skill && skill.specializations && skill.specializations.length > 0;
  };

  const handleAddSkill = async () => {
    try {
      const updated = await addSkill(character.id, formData);
      setCharacter(updated);
      setFormData(addSkillFormDataTemplate);
    } catch (error) {
      setErrorMessage(error.message);
      setDisplayError(true);
    }
  };

  if (!character) return <>...</>;

  return (
    <>
      <TableRow key="newSkill" sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
        <TableCell component="th" scope="row">
          <SelectSkill i18n="add-skill" value={formData.skillId} onChange={handleSkillChange} />
        </TableCell>
        <TableCell component="th" scope="row">
          {isSpecializationAllowed() ? (
            <TextField label="Specialization" value={formData.specialization} onChange={handleSpecializationChange} />
          ) : null}
        </TableCell>
        <TableCell align="right"></TableCell>
        <TableCell align="right"></TableCell>
        <TableCell align="right"></TableCell>
        <TableCell align="right"></TableCell>
        <TableCell align="right"></TableCell>
        <TableCell align="right"></TableCell>
        <TableCell align="right"></TableCell>
        <TableCell align="left">
          <IconButton aria-label="delete" onClick={() => handleAddSkill()}>
            <AddCircleOutlineIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    </>
  );
};

const CharacterViewSkillsEntry = ({ character, setCharacter, skill, profession, setErrorMessage, setDisplayError }) => {
  const { t } = useTranslation();

  const handleLevelUp = async () => {
    try {
      const updated = await levelUpSkill(character.id, skill.skillId);
      setCharacter(updated);
    } catch (error) {
      setErrorMessage(error.message);
      setDisplayError(true);
    }
  };

  const handleLevelDown = async () => {
    try {
      const updated = await levelDownSkill(character.id, skill.skillId);
      setCharacter(updated);
    } catch (error) {
      setErrorMessage(error.message);
      setDisplayError(true);
    }
  };

  const handlesetUpProfessionalSkill = async (skill) => {
    try {
      const updated = await setUpProfessionalSkill(character.id, skill.skillId);
      setCharacter(updated);
    } catch (error) {
      setErrorMessage(error.message);
      setDisplayError(true);
    }
  };

  const handleDeleteSkill = async (skill) => {
    try {
      const updated = await deleteSkill(character.id, skill.skillId);
      setCharacter(updated);
    } catch (error) {
      setErrorMessage(error.message);
      setDisplayError(true);
    }
  };

  const isAvailableProfessionSkill = (skill) => {
    if (profession) {
      const includes = profession.professionalSkills.includes(skill.skillId);
      const alreadyAdded = skill.professional && skill.professional.includes('professional');
      return includes && !alreadyAdded;
    }
    return false;
  };

  const isProfessionalSkill = (skill) => {
    return skill.professional && skill.professional.includes('professional');
  };

  return (
    <>
      <TableRow key={skill.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
        <TableCell component="th" scope="row">
          {t(skill.skillId)}
          {isProfessionalSkill(skill) ? ' *' : null}
        </TableCell>
        <TableCell component="th" scope="row">
          {skill.category}
        </TableCell>
        <TableCell align="right">{skill.statistics.join('/')}</TableCell>
        <TableCell align="right">{skill.ranks}</TableCell>
        <TableCell
          align="right"
          sx={{
            color: skill.statBonus < 0 ? red : skill.statBonus > 0 ? green : 'inherit',
            fontWeight: 'bold',
          }}
        >
          {skill.statBonus}
        </TableCell>
        <TableCell
          align="right"
          sx={{
            color: skill.professionalBonus < 0 ? red : skill.professionalBonus > 0 ? green : 'inherit',
            fontWeight: 'bold',
          }}
        >
          {skill.professionalBonus}
        </TableCell>
        <TableCell
          align="right"
          sx={{
            color: skill.developmentBonus < 0 ? red : skill.developmentBonus > 0 ? green : 'inherit',
            fontWeight: 'bold',
          }}
        >
          {skill.developmentBonus}
        </TableCell>
        <TableCell align="right">{skill.customBonus}</TableCell>
        <TableCell
          align="right"
          sx={{
            color: skill.totalBonus < 0 ? red : skill.totalBonus > 0 ? green : 'inherit',
            fontWeight: 'bold',
          }}
        >
          {skill.totalBonus}
        </TableCell>
        <TableCell align="left">
          <IconButton onClick={() => handleLevelUp()}>
            <ArrowCircleUpIcon />
          </IconButton>
          <IconButton onClick={() => handleLevelDown()}>
            <ArrowCircleDownIcon />
          </IconButton>
          <IconButton onClick={() => handleDeleteSkill(skill)}>
            <DeleteForeverIcon />
          </IconButton>
          {isAvailableProfessionSkill(skill) && (
            <IconButton aria-label="delete" onClick={() => handlesetUpProfessionalSkill(skill)}>
              <StarBorderIcon />
            </IconButton>
          )}
        </TableCell>
      </TableRow>
    </>
  );
};

const CharacterViewSkills = ({ character, setCharacter, profession }) => {
  const { t } = useTranslation();
  const [displayError, setDisplayError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <Grid container spacing={2} sx={{ marginTop: 2 }}>
      <Grid item size={12}>
        <Typography color="secondary" variant="h5">
          {t('skills')}
        </Typography>
      </Grid>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="left">Skill</TableCell>
            <TableCell align="left">Specialization</TableCell>
            <TableCell align="right">Stats</TableCell>
            <TableCell align="right">Ranks</TableCell>
            <TableCell align="right">Stat bonus</TableCell>
            <TableCell align="right">Professional bonus</TableCell>
            <TableCell align="right">Dev bonus</TableCell>
            <TableCell align="right">Custom bonus</TableCell>
            <TableCell align="right">Total bonus</TableCell>
            <TableCell align="left">
              Development points: {character.experience.availableDevelopmentPoints} / {character.experience.developmentPoints}
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
              setErrorMessage={setErrorMessage}
              setDisplayError={setDisplayError}
            />
          ))}
          <CharacterViewSkillsAdd
            character={character}
            setCharacter={setCharacter}
            setErrorMessage={setErrorMessage}
            setDisplayError={setDisplayError}
          />
        </TableBody>
      </Table>
      <SnackbarError errorMessage={errorMessage} displayError={displayError} setDisplayError={setDisplayError} />
    </Grid>
  );
};

export default CharacterViewSkills;
