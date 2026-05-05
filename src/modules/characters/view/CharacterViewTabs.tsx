import React, { useState, SyntheticEvent, ReactNode, FC, Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, CircularProgress, Tab, Tabs } from '@mui/material';
import { Character, StrategicGame, Profession } from '@labcabrera-rmu/rmu-react-shared-lib';
import CharacterViewAttacks from './CharacterViewAttacks';
import CharacterViewInfo from './CharacterViewInfo';
import CharacterViewMovement from './CharacterViewMovement';
import CharacterViewResistances from './CharacterViewResistances';
import CharacterViewExperience from './CharacterViewXp';
import CharacterEquipmentButtons from './items/CharacterEquipmentButtons';
import CharacterEquipmentPanel from './items/CharacterEquipmentPanel';
import CharacterViewItems from './items/CharacterViewItems';
import CharacterViewSkills from './skills/CharacterViewSkills';
import CharacterViewStats from './stats/CharacterViewStats';
import CharacterViewTraits from './traits/CharacterViewTraits';

function CustomTabPanel(props: { children?: ReactNode; value: number; index: number }) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const CharacterViewTabs: FC<{
  character?: Character;
  strategicGame?: StrategicGame;
  profession?: Profession;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
}> = ({ character, strategicGame, profession, setCharacter }) => {
  const { t } = useTranslation();
  const [value, setValue] = useState<number>(0);

  const handleChange = (_event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  if (!character || !strategicGame || !profession) return <CircularProgress />;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto">
          <Tab label={t('information')} {...a11yProps(0)} />
          <Tab label={t('stats')} {...a11yProps(1)} />
          <Tab label={t('resistances')} {...a11yProps(2)} />
          <Tab label={t('skills')} {...a11yProps(3)} />
          <Tab label={t('traits')} {...a11yProps(4)} />
          <Tab label={t('items')} {...a11yProps(5)} />
          <Tab label={t('attacks')} {...a11yProps(6)} />
          <Tab label={t('movement')} {...a11yProps(7)} />
          <Tab label={t('xp')} {...a11yProps(8)} />
          <Tab label={t('debug')} {...a11yProps(9)} />
        </Tabs>
      </Box>

      <CustomTabPanel value={value} index={0}>
        <CharacterViewInfo character={character} strategicGame={strategicGame} />
      </CustomTabPanel>

      <CustomTabPanel value={value} index={1}>
        <CharacterViewStats character={character} setCharacter={setCharacter} />
      </CustomTabPanel>

      <CustomTabPanel value={value} index={2}>
        <CharacterViewResistances character={character} />
      </CustomTabPanel>

      <CustomTabPanel value={value} index={3}>
        <CharacterViewSkills character={character} setCharacter={setCharacter} profession={profession} />
      </CustomTabPanel>

      <CustomTabPanel value={value} index={4}>
        <CharacterViewTraits character={character} setCharacter={setCharacter} />
      </CustomTabPanel>

      <CustomTabPanel value={value} index={5}>
        <CharacterEquipmentButtons character={character} setCharacter={setCharacter} />
        <CharacterEquipmentPanel character={character} setCharacter={setCharacter} />
        <CharacterViewItems character={character} setCharacter={setCharacter} />
      </CustomTabPanel>

      <CustomTabPanel value={value} index={6}>
        <CharacterViewAttacks character={character} strategicGame={strategicGame} />
      </CustomTabPanel>

      <CustomTabPanel value={value} index={7}>
        <CharacterViewMovement character={character} strategicGame={strategicGame} />
      </CustomTabPanel>

      <CustomTabPanel value={value} index={8}>
        <CharacterViewExperience character={character} setCharacter={setCharacter} />
      </CustomTabPanel>

      <CustomTabPanel value={value} index={9}>
        <pre>Character: {JSON.stringify(character, null, 2)}</pre>
      </CustomTabPanel>
    </Box>
  );
};

export default CharacterViewTabs;
