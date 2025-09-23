import React, { FC } from 'react';
import { Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { t } from 'i18next';
import { Character } from '../../api/character.dto';

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
      <Typography variant="h6" color="primary">
        {t('attacks')}
      </Typography>
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
              <TableCell align="left">{t('attack-table')}</TableCell>
              <TableCell align="left">{t('fumble-table')}</TableCell>
              <TableCell align="left">{t('size-adjustment')}</TableCell>
              <TableCell align="left">{t('fumble')}</TableCell>
              <TableCell align="left">{t('offensive-bonus')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {character.attacks.map((row) => (
              <TableRow key={row.name}>
                <TableCell align="left">{t(row.attackName)}</TableCell>
                <TableCell align="left">{t(row.attackTable)}</TableCell>
                <TableCell align="left">{row.fumbleTable}</TableCell>
                <TableCell align="left">{row.sizeAdjustment}</TableCell>
                <TableCell align="right">{row.fumble}</TableCell>
                <TableCell align="right" sx={{ color: getColor(row.bo), fontWeight: 'bold' }}>
                  {row.bo}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
};

export default CharacterViewAttacks;
