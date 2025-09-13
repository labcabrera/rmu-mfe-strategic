import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { Character } from '../../api/character.dto';
import { stats } from '../../api/characters';

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

const CharacterViewStatsEntry: FC<{
  statKey: string;
  statName: string;
  character: Character;
}> = ({ statKey, statName, character }) => {
  const { t } = useTranslation();

  const getColor = (value: number) => {
    if (value < 0) return red;
    if (value > 0) return green;
    return 'inherit';
  };

  return (
    <TableRow key={statKey} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell>{t(statName)}</TableCell>
      <TableCell align="right">{character.statistics[statKey].potential}</TableCell>
      <TableCell align="right">{character.statistics[statKey].temporary}</TableCell>
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

interface CharacterViewStatsProps {
  character: Character;
}

const CharacterViewStats: FC<CharacterViewStatsProps> = ({ character }) => {
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
          {stats.map((key) => (
            <CharacterViewStatsEntry statKey={key} statName={key} character={character} />
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default CharacterViewStats;
