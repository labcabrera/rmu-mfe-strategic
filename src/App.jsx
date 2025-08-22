import React from 'react';
import { Route, Routes } from 'react-router-dom';

import StrategicGameList from './modules/games/list/StrategicGameList';
import StrategicGameView from './modules/games/view/StrategicGameView';
import StrategicGameEdit from './modules/games/update/StrategicGameUpdate';
import StrategicGameCreate from './modules/games/create/StrategicGameCreate';
import FactionCreate from './modules/factions/create/FactionCreate';
import FactionView from './modules/factions/view/FactionView';
import FactionList from './modules/factions/list/FactionList';

import './index.css';

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
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
