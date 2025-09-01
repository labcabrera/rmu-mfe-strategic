/* eslint-disable react/prop-types */
import React from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import CharacterViewAttributes from './CharacterViewAttributes';
import CharacterViewSkills from './CharacterViewSkills';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const CharacterViewTabs = ({ character, setCharacter, strategicGame, faction, profession }) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="Information" {...a11yProps(0)} />
            <Tab label="Skills" {...a11yProps(1)} />
            <Tab label="Items" {...a11yProps(2)} />
            <Tab label="Attacks" {...a11yProps(3)} />
            <Tab label="Debug" {...a11yProps(4)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <CharacterViewAttributes
            character={character}
            setCharacter={setCharacter}
            faction={faction}
            profession={profession}
            strategicGame={strategicGame}
          />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <CharacterViewSkills character={character} setCharacter={setCharacter} profession={profession} />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          TODO
        </CustomTabPanel>
        <CustomTabPanel value={value} index={3}>
          TODO
        </CustomTabPanel>
        <CustomTabPanel value={value} index={4}>
          <pre>Character: {JSON.stringify(character, null, 2)}</pre>
          <pre>Profession: {JSON.stringify(profession, null, 2)}</pre>
          <pre>Faction: {JSON.stringify(faction, null, 2)}</pre>
        </CustomTabPanel>
      </Box>
    </>
  );
};

export default CharacterViewTabs;
