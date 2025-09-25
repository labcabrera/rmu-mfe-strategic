import React, { useState, SyntheticEvent, ReactNode, FC } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { Character } from '../../api/character.dto';
import { Faction } from '../../api/faction.dto';
import { Profession } from '../../api/professions';
import { StrategicGame } from '../../api/strategic-game.dto';
import CharacterViewAttacks from './CharacterViewAttacks';
import CharacterViewInfo from './CharacterViewInfo';
import CharacterViewItems from './CharacterViewItems';
import CharacterViewResistances from './CharacterViewResistances';
import CharacterViewSkills from './CharacterViewSkills';
import CharacterViewStats from './CharacterViewStats';
import CharacterViewTraits from './CharacterViewTraits';

function CustomTabPanel(props: { children?: ReactNode; value: number; index: number }) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
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
  character: Character;
  setCharacter: React.Dispatch<React.SetStateAction<Character>>;
  strategicGame: StrategicGame;
  faction: Faction;
  profession: Profession;
}> = ({ character, setCharacter, strategicGame, faction, profession }) => {
  const [value, setValue] = useState<number>(0);

  const handleChange = (_event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Information" {...a11yProps(0)} />
          <Tab label="Stats" {...a11yProps(1)} />
          <Tab label="Resistances" {...a11yProps(2)} />
          <Tab label="Skills" {...a11yProps(3)} />
          <Tab label="Traits" {...a11yProps(4)} />
          <Tab label="Items" {...a11yProps(5)} />
          <Tab label="Attacks" {...a11yProps(6)} />
          <Tab label="Debug" {...a11yProps(7)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <CharacterViewInfo character={character} />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <CharacterViewStats character={character} />
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
        <CharacterViewItems character={character} setCharacter={setCharacter} faction={faction} />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={6}>
        <CharacterViewAttacks character={character} />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={7}>
        <pre>Character: {JSON.stringify(character, null, 2)}</pre>
        <pre>Profession: {JSON.stringify(profession, null, 2)}</pre>
        <pre>Faction: {JSON.stringify(faction, null, 2)}</pre>
      </CustomTabPanel>
    </Box>
  );
};

export default CharacterViewTabs;
