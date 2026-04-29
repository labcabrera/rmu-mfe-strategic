import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import TableRowsIcon from '@mui/icons-material/TableRows';
import ViewListIcon from '@mui/icons-material/ViewList';
import { Box, ToggleButton, ToggleButtonGroup, Grid } from '@mui/material';
import {
  CategorySeparator,
  RmuTextCard,
  AddButton,
  TechnicalInfo,
  fetchStrategicGame,
  StrategicGame,
  Character,
  Faction,
  fetchCharacters,
  fetchFaction,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { gridSizeResume, gridSizeMain, gridSizeCard } from '../../services/display';
import FactionViewActions from './FactionViewActions';
import FactionViewAttributes from './FactionViewAttributes';
import FactionViewCharactersTable from './FactionViewCharacterTable';
import FactionViewCharacters from './FactionViewCharacters';
import FactionViewResume from './FactionViewResume';

const STORAGE_KEY = 'faction-display-character-table';

const FactionView: FC = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const { showError } = useError();
  const { factionId } = useParams<{ factionId: string }>();
  const [faction, setFaction] = useState<Faction | null>(null);
  const [game, setGame] = useState<StrategicGame | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [displayCharacterTable, setDisplayCharacterTable] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch (e) {
      return false;
    }
  });

  const handleViewModeChange = (_e: any, val: string | null) => {
    if (val === null) return;
    const table = val === 'table';
    setDisplayCharacterTable(table);
    try {
      localStorage.setItem(STORAGE_KEY, table ? 'true' : 'false');
    } catch (err) {}
  };

  const onCharacterCreate = () => {
    navigate(`/strategic/characters/create?gameId=${faction!.gameId}&factionId=${faction!.id}`, { state: { faction } });
  };

  useEffect(() => {
    if (faction) {
      fetchStrategicGame(faction.gameId, auth)
        .then((data: StrategicGame) => setGame(data))
        .catch((err) => showError(err.message));
      fetchCharacters(`faction.id==${faction.id}`, 0, 100, auth)
        .then((data) => setCharacters(data.content))
        .catch((err) => showError(err.message));
    }
  }, [faction]);

  useEffect(() => {
    if (location.state?.faction) {
      setFaction(location.state.faction);
    } else if (factionId) {
      fetchFaction(factionId, auth)
        .then((data: Faction) => setFaction(data))
        .catch((err) => showError(err.message));
    }
  }, [location.state, factionId, showError]);

  if (!faction || !game) return <div>Loading...</div>;

  return (
    <Grid container spacing={1}>
      <Grid size={gridSizeResume}>
        <FactionViewResume faction={faction} setFaction={setFaction} game={game} />
      </Grid>
      <Grid size={gridSizeMain}>
        <FactionViewActions faction={faction} setFaction={setFaction} strategicGame={game} />
        <CategorySeparator text={t('strategic-game')} />
        <Grid container spacing={1}>
          <Grid size={gridSizeCard}>
            <RmuTextCard
              value={game.name}
              subtitle={t('strategic-game')}
              image={game.imageUrl || ''}
              onClick={() => navigate(`/strategic/games/view/${game.id}`, { state: { strategicGame: game } })}
            />
          </Grid>
        </Grid>
        <CategorySeparator text={t('faction')} />
        <FactionViewAttributes faction={faction} characters={characters} />
        <CategorySeparator text={t('characters')}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <AddButton onClick={onCharacterCreate} />
            <ToggleButtonGroup
              value={displayCharacterTable ? 'table' : 'list'}
              exclusive
              size="small"
              onChange={handleViewModeChange}
              aria-label="view-mode"
            >
              <ToggleButton value="list" aria-label="list">
                <ViewListIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="table" aria-label="table">
                <TableRowsIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </CategorySeparator>
        {displayCharacterTable ? (
          <FactionViewCharactersTable characters={characters} />
        ) : (
          <FactionViewCharacters faction={faction} characters={characters} />
        )}
        <Grid size={12}>
          <TechnicalInfo>
            <pre>Faction: {JSON.stringify(faction, null, 2)}</pre>
          </TechnicalInfo>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default FactionView;
