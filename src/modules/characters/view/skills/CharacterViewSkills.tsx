import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import TableRowsIcon from '@mui/icons-material/TableRows';
import ViewListIcon from '@mui/icons-material/ViewList';
import { Box, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { CategorySeparator, AddButton, Character, Profession } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import AddSkillDialog from './AddSkillDialog';
import CharacterSkillList from './CharacterSkillList';
import CharacterSkillTable from './CharacterSkillTable';

const STORAGE_KEY = 'character-display-skill-table';

const CharacterViewSkills: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  profession?: Profession;
}> = ({ character, setCharacter, profession }) => {
  const [openAddSkillDialog, setOpenAddSkillDialog] = useState(false);
  const [displaySkillTable, setDisplaySkillTable] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch (ignore) {
      return false;
    }
  });

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
      <CategorySeparator text={t('Skills')}>
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
        setCharacter={setCharacter}
        onClose={() => setOpenAddSkillDialog(false)}
      />
    </>
  );
};

export default CharacterViewSkills;
