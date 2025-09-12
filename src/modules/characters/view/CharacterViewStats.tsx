import React from 'react';
import { useTranslation } from 'react-i18next';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { Character } from '../../api/characters';

const red = '#ffab91';
const green = '#a5d6a7';

export interface CharacterStatistics {
  [key: string]: {
    potential: number;
    temporary: number;
    bonus: number;
    racial: number;
    custom: number;
    totalBonus: number;
  };
}

interface CharacterViewStatsEntryProps {
  statKey: string;
  statName: string;
  character: Character;
}

const CharacterViewStatsEntry: React.FC<CharacterViewStatsEntryProps> = ({ statKey, statName, character }) => {
  const { t } = useTranslation();

  return (
    <TableRow key={statKey} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell component="th" scope="row">
        {t(statName)}
      </TableCell>
      <TableCell align="right" component="th" scope="row">
        {character.statistics[statKey].potential}
      </TableCell>
      <TableCell align="right">{character.statistics[statKey].temporary}</TableCell>
      <TableCell
        align="right"
        sx={{
          color:
            character.statistics[statKey].bonus < 0 ? red : character.statistics[statKey].bonus > 0 ? green : 'inherit',
          fontWeight: 'bold',
        }}
      >
        {character.statistics[statKey].bonus}
      </TableCell>
      <TableCell
        align="right"
        sx={{
          color:
            character.statistics[statKey].racial < 0
              ? red
              : character.statistics[statKey].racial > 0
                ? green
                : 'inherit',
          fontWeight: 'bold',
        }}
      >
        {character.statistics[statKey].racial}
      </TableCell>
      <TableCell
        align="right"
        sx={{
          color:
            character.statistics[statKey].custom < 0
              ? red
              : character.statistics[statKey].custom > 0
                ? green
                : 'inherit',
          fontWeight: 'bold',
        }}
      >
        {character.statistics[statKey].custom}
      </TableCell>
      <TableCell
        align="right"
        sx={{
          color:
            character.statistics[statKey].totalBonus < 0
              ? red
              : character.statistics[statKey].totalBonus > 0
                ? green
                : 'inherit',
          fontWeight: 'bold',
        }}
      >
        {character.statistics[statKey].totalBonus}
      </TableCell>
    </TableRow>
  );
};

interface CharacterViewStatsProps {
  character: Character;
}

const statKeys = ['ag', 'co', 'em', 'in', 'me', 'pr', 'qu', 're', 'sd', 'st'];

const CharacterViewStats: React.FC<CharacterViewStatsProps> = ({ character }) => {
  const { t } = useTranslation();
  return (
    <>
      <Typography variant="h6" color="primary">
        {t('statistics')}
      </Typography>
      <Table sx={{ minWidth: 650 }} aria-label="stats table">
        <TableHead>
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
          {statKeys.map((key) => (
            <CharacterViewStatsEntry statKey={key} statName={key} character={character} />
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default CharacterViewStats;
