import React, { FC } from 'react';
import { Paper, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { CategorySeparator, Character } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';

const CharacterViewAttacks: FC<{
  character: Character;
}> = ({ character }) => {
  const getColor = (value: number) => {
    if (value < 0) return 'error.main';
    if (value > 0) return 'success.main';
    return 'inherit';
  };

  return (
    <>
      <CategorySeparator text={t('Attacks')} />
      <Paper sx={{ width: 'fit-content', padding: 2 }}>
        <Table aria-label="item table">
          <TableHead
            sx={{
              '& .MuiTableCell-root': {
                color: 'primary.main',
                fontWeight: 'bold',
              },
            }}
          >
            <TableRow>
              <TableCell>{t('name')}</TableCell>
              <TableCell align="left">{t('Type')}</TableCell>
              <TableCell align="left">{t('Attack table')}</TableCell>
              <TableCell align="left">{t('Fumble table')}</TableCell>
              <TableCell align="left">{t('Size adjustment')}</TableCell>
              <TableCell align="left">{t('Fumble')}</TableCell>
              <TableCell align="left">{t('Offensive bonus')}</TableCell>
              <TableCell align="left">{t('Melee range')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {character.attacks.map((row, index) => (
              <TableRow key={index}>
                <TableCell align="left">{t(row.attackName)}</TableCell>
                <TableCell align="left">{t(row.type)}</TableCell>
                <TableCell align="left">{t(row.attackTable)}</TableCell>
                <TableCell align="left">{t(row.fumbleTable)}</TableCell>
                <TableCell align="right">{row.sizeAdjustment}</TableCell>
                <TableCell align="right">{row.fumble}</TableCell>
                <TableCell align="right" sx={{ color: getColor(row.bo), fontWeight: 'bold' }}>
                  {row.bo}
                </TableCell>
                <TableCell align="right">{row.meleeRange ? `${row.meleeRange}'` : '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
};

export default CharacterViewAttacks;
