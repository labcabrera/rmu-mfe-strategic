import { lazy, FC } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { MfeRoot, NotFound } from '@labcabrera-rmu/rmu-react-shared-lib';

// Workspace spec 091, E1: every page is its own chunk; the Suspense is in MfeRoot / the shell layout.
const HomePage = lazy(() => import('./HomePage'));
const CharacterCreatePage = lazy(() => import('./modules/characters/create/CharacterCreatePage'));
const CharacterEditPage = lazy(() => import('./modules/characters/form/CharacterEditPage'));
const CharacterListPage = lazy(() => import('./modules/characters/list/CharacterListPage'));
const CharacterViewPage = lazy(() => import('./modules/characters/view/CharacterViewPage'));
const MarketPage = lazy(() => import('./modules/economy/MarketPage'));
const WorkshopPage = lazy(() => import('./modules/economy/WorkshopPage'));
const EnchantmentsPage = lazy(() => import('./modules/enchantments/EnchantmentsPage'));
const FactionFormPage = lazy(() => import('./modules/factions/form/FactionFormPage'));
const FactionListPage = lazy(() => import('./modules/factions/list/FactionListPage'));
const FactionViewPage = lazy(() => import('./modules/factions/view/FactionViewPage'));
const StrategicGameFormPage = lazy(() => import('./modules/games/form/StrategicGameFormPage'));
const StrategicGameListPage = lazy(() => import('./modules/games/list/StrategicGameListPage'));
const StrategicGameViewPage = lazy(() => import('./modules/games/view/StrategicGameViewPage'));

/** The trade page of a character became its market (spec 023). */
const TradeRedirect: FC = () => {
  const { characterId } = useParams<{ characterId: string }>();
  return <Navigate to={`/strategic/market/character/${characterId}`} replace />;
};

const App: FC = () => (
  <MfeRoot sx={{ p: 2 }} namespace="strategic">
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
      <Route path="/enchantments/:holderKind/:holderId" element={<EnchantmentsPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </MfeRoot>
);

export default App;
