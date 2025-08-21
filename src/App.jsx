import React from "react";
import { Route, Routes } from "react-router-dom";
import StrategicGameList from "./modules/games/components/list/StrategicGameList";
import StrategicGameView from "./modules/games/components/view/StrategicGameView";
import StrategicGameEdit from "./modules/games/components/update/StrategicGameUpdate";
import StrategicGameCreate from "./modules/games/components/create/StrategicGameCreate";
import "./index.css";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<StrategicGameList />} />
      <Route path="/view/:strategicGameId" element={<StrategicGameView />} />
      <Route path="/edit/:strategicGameId" element={<StrategicGameEdit />} />
      <Route path="/creation" element={<StrategicGameCreate />} />
    </Routes>
  );
};

export default App;
