import React from "react";
import { Route, Routes } from "react-router-dom";

import StrategicGameList from "./modules/games/components/list/StrategicGameList";
import StrategicGameView from "./modules/games/components/view/StrategicGameView";
import StrategicGameEdit from "./modules/games/components/update/StrategicGameUpdate";
import StrategicGameCreate from "./modules/games/components/create/StrategicGameCreate";
import FactionCreate from "./modules/factions/create/FactionCreate";

import "./index.css";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<StrategicGameList />} />
      <Route path="/games/view/:strategicGameId" element={<StrategicGameView />} />
      <Route path="/games/edit/:strategicGameId" element={<StrategicGameEdit />} />
      <Route path="/games/create" element={<StrategicGameCreate />} />
      <Route path="/factions/create" element={<FactionCreate />} />
    </Routes>
  );
};

export default App;
