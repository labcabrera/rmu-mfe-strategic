import React, { Dispatch, FC, SetStateAction } from 'react';
import { Box } from '@mui/material';
import { Character, StrategicGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import CharacterViewStatsChart from './CharacterViewStatsChart';
import CharacterViewStatsTable, { STATS_TABLE_MIN_WIDTH } from './CharacterViewStatsTable';

/** Width the radar chart needs to stay readable beside the table. */
const CHART_MIN_WIDTH = 260;

/**
 * Stats table with its radar chart. The chart sits beside the table only when the panel fits every column of the
 * table and the chart; otherwise it wraps below (spec 017), so the table never hides columns behind a scroll.
 */
const CharacterViewStats: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  strategicGame?: StrategicGame;
}> = ({ character, setCharacter, strategicGame }) => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
    <Box sx={{ flex: `999 1 ${STATS_TABLE_MIN_WIDTH}px`, minWidth: 0 }}>
      <CharacterViewStatsTable character={character} setCharacter={setCharacter} strategicGame={strategicGame} />
    </Box>
    <Box sx={{ flex: `1 1 ${CHART_MIN_WIDTH}px`, maxWidth: 420, mx: 'auto', height: 280 }}>
      <CharacterViewStatsChart stats={character.statistics} />
    </Box>
  </Box>
);

export default CharacterViewStats;
