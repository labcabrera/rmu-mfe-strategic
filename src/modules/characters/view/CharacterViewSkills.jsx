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
import List from '@mui/material/List';
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

const CharacterViewSkillsAdd = ({ character, setCharacter }) => {
  const { t } = useTranslation();
  const [displayError, setDisplayError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
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
      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        <Grid item size={2}>
          <SelectSkill value={formData.skillId} onChange={handleSkillChange} />
        </Grid>
        <Grid item size={2}>
          {isSpecializationAllowed() ? (
            <TextField label="Specialization" value={formData.specialization} onChange={handleSpecializationChange} />
          ) : null}
        </Grid>
        <Grid item size={5}></Grid>
        <Grid item size={1}>
          <TextField
            label={t('dev')}
            name="availableDevelopmentPoints"
            value={`${character.experience.availableDevelopmentPoints} / ${character.experience.developmentPoints}`}
            readOnly
            fullWidth
          />
        </Grid>
        <Grid item size={2}>
          <IconButton aria-label="delete" onClick={() => handleAddSkill()}>
            <AddCircleOutlineIcon />
          </IconButton>
        </Grid>
      </Grid>
      <SnackbarError errorMessage={errorMessage} displayError={displayError} setDisplayError={setDisplayError} />
    </>
  );
};

const CharacterViewSkillsEntry = ({ character, setCharacter, skill, profession }) => {
  const { t } = useTranslation();
  const [displayError, setDisplayError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        <Grid item size={2}>
          <h4>
            {t(skill.skillId)}
            {isProfessionalSkill(skill) ? <StarBorderIcon /> : ''}
          </h4>
        </Grid>
        <Grid item size={1}>
          {skill.specialization ? <h4>{skill.specialization}</h4> : null}
        </Grid>
        <Grid item size={1}>
          {skill.statistics.join('/')}
        </Grid>
        <Grid item size={1}>
          <TextField
            label={t('ranks')}
            name="ranks"
            value={skill.ranks}
            readOnly
            fullWidth
            sx={{
              '& .MuiInputBase-input': {
                textAlign: 'right',
              },
            }}
          />
        </Grid>
        <Grid item size={1}>
          <TextField
            label={t('stats')}
            name="statBonus"
            value={skill.statBonus}
            readOnly
            fullWidth
            sx={{
              '& .MuiInputBase-input': {
                color: skill.statBonus < 0 ? '#ffab91' : skill.statBonus > 0 ? '#a5d6a7' : 'white',
                textAlign: 'right',
              },
            }}
          />
        </Grid>
        <Grid item size={1}>
          <TextField
            label={t('prof')}
            name="professionalBonus"
            value={skill.professionalBonus}
            readOnly
            fullWidth
            sx={{
              '& .MuiInputBase-input': {
                textAlign: 'right',
              },
            }}
          />
        </Grid>
        <Grid item size={1}>
          <TextField
            label={t('dev')}
            name="developmentBonus"
            value={skill.developmentBonus}
            readOnly
            fullWidth
            sx={{
              '& .MuiInputBase-input': {
                textAlign: 'right',
              },
            }}
          />
        </Grid>
        <Grid item size={1}>
          <TextField
            label={t('custom')}
            name="customBonus"
            value={skill.customBonus}
            readOnly
            fullWidth
            sx={{
              '& .MuiInputBase-input': {
                textAlign: 'right',
              },
            }}
          />
        </Grid>
        <Grid item size={1}>
          <TextField
            label={t('total')}
            name="totalBonus"
            value={skill.totalBonus}
            readOnly
            fullWidth
            sx={{
              '& .MuiInputBase-input': {
                color: skill.totalBonus < 0 ? '#ffab91' : skill.totalBonus > 0 ? '#a5d6a7' : 'white',
                fontWeight: 'bold',
                textAlign: 'right',
              },
            }}
          />
        </Grid>
        <Grid item size={2}>
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
        </Grid>
      </Grid>
      <SnackbarError errorMessage={errorMessage} displayError={displayError} setDisplayError={setDisplayError} />
    </>
  );
};

const CharacterViewSkills = ({ character, setCharacter, profession }) => {
  const { t } = useTranslation();
  return (
    <Grid container spacing={2} sx={{ marginTop: 2 }}>
      <Grid item size={12}>
        <Typography color="secondary" variant="h5">
          {t('skills')}
        </Typography>
      </Grid>
      <List>
        {character?.skills.map((item) => (
          <CharacterViewSkillsEntry key={item.skillId} skill={item} character={character} setCharacter={setCharacter} profession={profession} />
        ))}
        <CharacterViewSkillsAdd character={character} setCharacter={setCharacter} />
      </List>
    </Grid>
  );
};

export default CharacterViewSkills;
