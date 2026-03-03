import React, { FC, useEffect, useState } from 'react';
import TableRowsIcon from '@mui/icons-material/TableRows';
import ViewListIcon from '@mui/icons-material/ViewList';
import {
  Box,
  IconButton,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../../ErrorContext';
import { addSkill } from '../../../api/character';
import { Character } from '../../../api/character.dto';
import { Profession } from '../../../api/professions';
import { AddSkill } from '../../../api/skill.dto';
import AddButton from '../../../shared/buttons/AddButton';
import CategorySeparator from '../../../shared/display/CategorySeparator';
import AddSkillDialog from './AddSkillDialog';
import CharacterSkillList from './CharacterSkillList';
import CharacterSkillTable from './CharacterSkillTable';

const STORAGE_KEY = 'character-display-skill-table';

const CharacterViewSkills: FC<{
  character: Character;
  setCharacter: React.Dispatch<React.SetStateAction<Character>>;
  profession?: Profession;
}> = ({ character, setCharacter, profession }) => {
  const [openAddSkillDialog, setOpenAddSkillDialog] = useState(false);
  const { showError } = useError();
  const [displaySkillTable, setDisplaySkillTable] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch (e) {
      return false;
    }
  });

  const onSkillAdded = (value: AddSkill) => {
    addSkill(character.id, value)
      .then((updatedCharacter) => {
        setCharacter(updatedCharacter);
        setOpenAddSkillDialog(false);
      })
      .catch((error) => showError(error.message));
  };

  const handleViewModeChange = (_e: any, val: string | null) => {
    if (val === null) return;
    const table = val === 'table';
    setDisplaySkillTable(table);
    try {
      localStorage.setItem(STORAGE_KEY, table ? 'true' : 'false');
    } catch (ignore) {}
  };

  return (
    <>
      <CategorySeparator text={t('skills')}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <AddButton onClick={() => setOpenAddSkillDialog(true)} />
          <ToggleButtonGroup
            value={displaySkillTable ? 'table' : 'list'}
            exclusive
            size="small"
            onChange={handleViewModeChange}
            aria-label="view-mode"
          >
            <ToggleButton value="list" aria-label="list">
              <ViewListIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="table" aria-label="table">
              <TableRowsIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </CategorySeparator>

      {displaySkillTable ? (
        <CharacterSkillTable character={character} setCharacter={setCharacter} profession={profession} />
      ) : (
        <CharacterSkillList character={character} />
      )}
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
