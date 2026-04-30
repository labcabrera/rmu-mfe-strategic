import React, { Dispatch, FC, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import { Grid } from '@mui/system';
import { CategorySeparator, Character } from '@labcabrera-rmu/rmu-react-shared-lib';
import CharacterViewStatsChart from './CharacterViewStatsChart';
import CharacterViewStatsTable from './CharacterViewStatsTable';

const CharacterViewStats: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
}> = ({ character, setCharacter }) => {
  const { t } = useTranslation();

  return (
    <Grid container spacing={1}>
      <Grid size={12}>
        <CategorySeparator text={t('statistics')} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <CharacterViewStatsTable character={character} setCharacter={setCharacter} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', alignItems: 'stretch' }}>
        <Box sx={{ flex: 1 }}>
          <CharacterViewStatsChart stats={character.statistics} />
        </Box>
      </Grid>
    </Grid>
  );
};

export default CharacterViewStats;
