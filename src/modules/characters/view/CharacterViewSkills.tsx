import React, { Dispatch, FC, SetStateAction, useState } from 'react';
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
import { useError } from '../../../ErrorContext';
import {
  addSkill,
  levelUpSkill,
  levelDownSkill,
  setUpProfessionalSkill,
  deleteSkill,
  Character,
  CharacterSkill,
} from '../../api/characters';
import SelectSkill from '../../shared/selects/SelectSkill';

const addSkillFormDataTemplate = {
  skillId: '',
  specialization: '',
  ranks: 0,
  customBonus: 0,
};

const red = '#ffab91';
const green = '#a5d6a7';

interface Profession {
  professionalSkills: string[];
}

const CharacterViewSkillsAdd: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character>>;
  setErrorMessage?: (msg: string) => void;
  setDisplayError?: (v: boolean) => void;
}> = ({ character, setCharacter, setErrorMessage, setDisplayError }) => {
  const [skill, setSkill] = useState<any>(null);
  const [formData, setFormData] = useState(addSkillFormDataTemplate);

  const handleSkillChange = (value: string, skillObj: any) => {
    setFormData({ ...formData, skillId: value, specialization: skillObj?.specialization });
    setSkill(skillObj);
  };

  const handleSpecializationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    } catch (error: any) {
      setErrorMessage && setErrorMessage(error.message);
      setDisplayError && setDisplayError(true);
    }
  };

  if (!character) return <>...</>;

  return (
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
      <TableCell align="right"></TableCell>
      <TableCell align="left">
        <IconButton aria-label="add" onClick={handleAddSkill}>
          <AddCircleOutlineIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

interface CharacterViewSkillsEntryProps {
  character: Character;
  setCharacter: React.Dispatch<React.SetStateAction<Character>>;
  skill: CharacterSkill;
  profession?: Profession;
}

const CharacterViewSkillsEntry: React.FC<CharacterViewSkillsEntryProps> = ({
  character,
  setCharacter,
  skill,
  profession,
}) => {
  const { t } = useTranslation();
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
    if (value < 0) return red;
    if (value > 0) return green;
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

  return (
    <TableRow key={skill.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell component="th" scope="row">
        {t(skill.skillId)}
        {isProfessionalSkill(skill) ? ' *' : null}
      </TableCell>
      <TableCell component="th" scope="row">
        {skill.category}
      </TableCell>
      <TableCell align="right">{skill.statistics?.join('/') || '-'}</TableCell>
      <TableCell align="right">{skill.development?.join(' / ') || '-'}</TableCell>
      <TableCell align="right">
        {skill.ranks}
        {skill.ranksDeveloped > 0 && ` (↑${skill.ranksDeveloped})`}
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
          color: skill.totalBonus < 0 ? red : skill.totalBonus > 0 ? green : 'inherit',
          fontWeight: 'bold',
        }}
      >
        {skill.totalBonus}
      </TableCell>
      <TableCell align="left">
        <IconButton onClick={handleLevelUp} disabled={isLevelUpDisabled()}>
          <ArrowCircleUpIcon />
        </IconButton>
        <IconButton onClick={handleLevelDown} disabled={isLevelDownDisabled()}>
          <ArrowCircleDownIcon />
        </IconButton>
        {!isDeletedDisabled() && (
          <IconButton onClick={() => handleDeleteSkill(skill)}>
            <DeleteForeverIcon />
          </IconButton>
        )}
        {isAvailableProfessionSkill(skill) && (
          <IconButton aria-label="set-professional" onClick={() => handleSetUpProfessionalSkill(skill)}>
            <StarBorderIcon />
          </IconButton>
        )}
      </TableCell>
    </TableRow>
  );
};

const CharacterViewSkills: FC<{
  character: Character;
  setCharacter: React.Dispatch<React.SetStateAction<Character>>;
  profession?: Profession;
}> = ({ character, setCharacter, profession }) => {
  const { t } = useTranslation();

  return (
    <Grid container spacing={2} sx={{ marginTop: 2 }}>
      <Grid size={12}>
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
            <TableCell align="right">Dev</TableCell>
            <TableCell align="right">Ranks</TableCell>
            <TableCell align="right">Rank bonus</TableCell>
            <TableCell align="right">Stats</TableCell>
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
          <CharacterViewSkillsAdd character={character} setCharacter={setCharacter} />
        </TableBody>
      </Table>
    </Grid>
  );
};

export default CharacterViewSkills;
