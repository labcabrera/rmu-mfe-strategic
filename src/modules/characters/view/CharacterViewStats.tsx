import React, { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Paper, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { CategorySeparator, Character, StatKey, STATS } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';

const CharacterViewStats: FC<{
  character: Character;
}> = ({ character }) => {
  if (!character) return <div>Loading...</div>;

  return (
    <>
      <CategorySeparator text={t('Statistics')} />
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
              <TableCell align="right">{t('potential-short')}</TableCell>
              <TableCell align="right">{t('temporary-short')}</TableCell>
              <TableCell align="right">{t('bonus')}</TableCell>
              <TableCell align="right">{t('racial')}</TableCell>
              <TableCell align="right">{t('custom')}</TableCell>
              <TableCell align="right">{t('total')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {STATS.map((key, index) => (
              <Fragment key={index}>
                <CharacterViewStatsEntry stat={key} character={character} />
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
};

const CharacterViewStatsEntry: FC<{
  stat: StatKey;
  character: Character;
}> = ({ stat, character }) => {
  if (!character.statistics[stat].modifiers) {
    return null;
  }
  const potential = character.statistics[stat].potential;
  const temporary = character.statistics[stat].temporary;
  const statBonus = character.statistics[stat].modifiers['stat'] || 0;
  const racial = character.statistics[stat].modifiers['racial'] || 0;
  const trait = character.statistics[stat].modifiers['trait'] || 0;
  const item = character.statistics[stat].modifiers['item'] || 0;
  const totalBonus = character.statistics[stat].totalBonus;

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
    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell>{t(stat)}</TableCell>
      <TableCell align="right" sx={{ color: getStatColor(potential) }}>
        {potential}
      </TableCell>
      <TableCell align="right" sx={{ color: getStatColor(temporary) }}>
        {temporary}
      </TableCell>
      <TableCell align="right" sx={{ color: getColor(statBonus) }}>
        {statBonus}
      </TableCell>
      <TableCell align="right" sx={{ color: getColor(racial) }}>
        {racial}
      </TableCell>
      <TableCell align="right" sx={{ color: getColor(trait) }}>
        {trait}
      </TableCell>
      <TableCell align="right" sx={{ color: getColor(totalBonus), fontWeight: 'bold' }}>
        {totalBonus}
      </TableCell>
    </TableRow>
  );
};

export default CharacterViewStats;
