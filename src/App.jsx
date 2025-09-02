import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Box from '@mui/material/Box';
import './i18n';
import './index.css';
import CharacterCreate from './modules/characters/create/CharacterCreate';
import CharacterList from './modules/characters/list/CharacterList';
import CharacterUpdate from './modules/characters/update/CharacterUpdate';
import CharacterView from './modules/characters/view/CharacterView';
import FactionCreate from './modules/factions/create/FactionCreate';
import FactionList from './modules/factions/list/FactionList';
import FactionUpdate from './modules/factions/update/FactionUpdate';
import FactionView from './modules/factions/view/FactionView';
import StrategicGameCreate from './modules/games/create/StrategicGameCreate';
import StrategicGameList from './modules/games/list/StrategicGameList';
import StrategicGameEdit from './modules/games/update/StrategicGameUpdate';
import StrategicGameView from './modules/games/view/StrategicGameView';

//TODO provisional component
const NotFound = () => (
  <div>
    <h2>Not found</h2>
    <p>The requested route does not exist.</p>
  </div>
);

const App = () => {
  return (
    <Box sx={{ p: 5 }}>
      <Routes>
        <Route path="/" element={<StrategicGameList />} />
        <Route path="/games" element={<StrategicGameList />} />
        <Route path="/games/view/:gameId" element={<StrategicGameView />} />
        <Route path="/games/edit/:gameId" element={<StrategicGameEdit />} />
        <Route path="/games/create" element={<StrategicGameCreate />} />
        <Route path="/factions" element={<FactionList />} />
        <Route path="/factions/view/:factionId" element={<FactionView />} />
        <Route path="/factions/edit/:factionId" element={<FactionUpdate />} />
        <Route path="/factions/create" element={<FactionCreate />} />
        <Route path="/characters" element={<CharacterList />} />
        <Route path="/characters/view/:characterId" element={<CharacterView />} />
        <Route path="/characters/create" element={<CharacterCreate />} />
        <Route path="/characters/edit/:characterId" element={<CharacterUpdate />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Box>
  );
};

export default App;
