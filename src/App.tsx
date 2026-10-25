import React, { FC } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { MfeRoot, NotFound } from '@labcabrera-rmu/rmu-react-shared-lib';
import HomePage from './HomePage';
import CharacterCreatePage from './modules/characters/create/CharacterCreatePage';
import CharacterEditPage from './modules/characters/form/CharacterEditPage';
import CharacterListPage from './modules/characters/list/CharacterListPage';
import CharacterViewPage from './modules/characters/view/CharacterViewPage';
import MarketPage from './modules/economy/MarketPage';
import WorkshopPage from './modules/economy/WorkshopPage';
import FactionFormPage from './modules/factions/form/FactionFormPage';
import FactionListPage from './modules/factions/list/FactionListPage';
import FactionViewPage from './modules/factions/view/FactionViewPage';
import StrategicGameFormPage from './modules/games/form/StrategicGameFormPage';
import StrategicGameListPage from './modules/games/list/StrategicGameListPage';
import StrategicGameViewPage from './modules/games/view/StrategicGameViewPage';

/** The trade page of a character became its market (spec 023). */
const TradeRedirect: FC = () => {
  const { characterId } = useParams<{ characterId: string }>();
  return <Navigate to={`/strategic/market/character/${characterId}`} replace />;
};

const App: FC = () => (
  <MfeRoot sx={{ p: 2 }}>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/games" element={<StrategicGameListPage />} />
      <Route path="/games/view/:gameId" element={<StrategicGameViewPage />} />
      <Route path="/games/edit/:gameId" element={<StrategicGameFormPage key="edit" mode="edit" />} />
      <Route path="/games/create" element={<StrategicGameFormPage key="create" mode="create" />} />
      <Route path="/factions" element={<FactionListPage />} />
      <Route path="/factions/view/:factionId" element={<FactionViewPage />} />
      <Route path="/factions/edit/:factionId" element={<FactionFormPage key="edit" mode="edit" />} />
      <Route path="/factions/create" element={<FactionFormPage key="create" mode="create" />} />
      <Route path="/characters" element={<CharacterListPage />} />
      <Route path="/characters/view/:characterId" element={<CharacterViewPage />} />
      <Route path="/characters/create" element={<CharacterCreatePage />} />
      <Route path="/characters/edit/:characterId" element={<CharacterEditPage />} />
      <Route path="/characters/trade/:characterId" element={<TradeRedirect />} />
      <Route path="/market/:holderKind/:holderId" element={<MarketPage />} />
      <Route path="/workshop/:holderKind/:holderId" element={<WorkshopPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </MfeRoot>
);

export default App;
