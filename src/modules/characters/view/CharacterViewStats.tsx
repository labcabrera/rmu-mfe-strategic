import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { t } from 'i18next';
import { Character, stats } from '../../api/character.dto';

const CharacterViewStats: FC<{
  character: Character;
}> = ({ character }) => {
  if (!character) return <div>Loading...</div>;

  return (
    <>
      <Typography variant="h6" color="primary">
        {t('statistics')}
      </Typography>
      <Paper sx={{ width: 'fit-content', padding: 2 }}>
        <Table sx={{ minWidth: 650, maxWidth: 800 }} aria-label="stats table">
          <TableHead
            sx={{
              '& .MuiTableCell-root': {
                color: 'primary.main',
                fontWeight: 'bold',
              },
            }}
          >
            <TableRow>
              <TableCell align="left">Stat</TableCell>
              <TableCell align="right">{t('potential')}</TableCell>
              <TableCell align="right">{t('temporary')}</TableCell>
              <TableCell align="right">{t('bonus')}</TableCell>
              <TableCell align="right">{t('racial')}</TableCell>
              <TableCell align="right">{t('custom')}</TableCell>
              <TableCell align="right">{t('total')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.map((key) => (
              <CharacterViewStatsEntry key={key} statKey={key} statName={key} character={character} />
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
};

const CharacterViewStatsEntry: FC<{
  statKey: string;
  statName: string;
  character: Character;
}> = ({ statKey, statName, character }) => {
  const { t } = useTranslation();

  const getColor = (value: number) => {
    if (value < 0) return 'error.main';
    if (value > 0) return 'success.main';
    return 'inherit';
  };

  const getStatColor = (value: number) => {
    if (value > 75) return 'success.main';
    if (value < 45) return 'error.main';
    return 'inherit';
  };

  return (
    <TableRow key={statKey} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell>{t(statName)}</TableCell>
      <TableCell align="right" sx={{ color: getStatColor(character.statistics[statKey].potential) }}>
        {character.statistics[statKey].potential}
      </TableCell>
      <TableCell align="right" sx={{ color: getStatColor(character.statistics[statKey].temporary) }}>
        {character.statistics[statKey].temporary}
      </TableCell>
      <TableCell align="right" sx={{ color: getColor(character.statistics[statKey].bonus) }}>
        {character.statistics[statKey].bonus}
      </TableCell>
      <TableCell align="right" sx={{ color: getColor(character.statistics[statKey].racial) }}>
        {character.statistics[statKey].racial}
      </TableCell>
      <TableCell align="right" sx={{ color: getColor(character.statistics[statKey].custom) }}>
        {character.statistics[statKey].custom}
      </TableCell>
      <TableCell align="right" sx={{ color: getColor(character.statistics[statKey].totalBonus), fontWeight: 'bold' }}>
        {character.statistics[statKey].totalBonus}
      </TableCell>
    </TableRow>
  );
};

export default CharacterViewStats;
