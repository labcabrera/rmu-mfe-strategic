import React from 'react';
import { Route, Routes } from 'react-router-dom';
import './i18n';
import './index.css';
import CharacterCreate from './modules/characters/create/CharacterCreate';
import CharacterList from './modules/characters/list/CharacterList';
import CharacterView from './modules/characters/view/CharacterView';
import FactionCreate from './modules/factions/create/FactionCreate';
import FactionList from './modules/factions/list/FactionList';
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
    <Routes>
      <Route path="/" element={<StrategicGameList />} />
      <Route path="/games" element={<StrategicGameList />} />
      <Route path="/games/view/:gameId" element={<StrategicGameView />} />
      <Route path="/games/edit/:gameId" element={<StrategicGameEdit />} />
      <Route path="/games/create" element={<StrategicGameCreate />} />
      <Route path="/factions" element={<FactionList />} />
      <Route path="/factions/view/:factionId" element={<FactionView />} />
      <Route path="/factions/create" element={<FactionCreate />} />
      <Route path="/characters" element={<CharacterList />} />
      <Route path="/characters/view/:characterId" element={<CharacterView />} />
      <Route path="/characters/create" element={<CharacterCreate />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
