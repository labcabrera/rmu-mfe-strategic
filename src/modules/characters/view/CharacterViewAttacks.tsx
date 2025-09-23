import React, { FC } from 'react';
import { Grid, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { t } from 'i18next';
import { Character } from '../../api/character.dto';

const CharacterViewAttacks: FC<{
  character: Character;
}> = ({ character }) => {
  return (
    <>
      <Grid container spacing={2}>
        <Table aria-label="item table">
          <TableHead>
            <TableRow>
              <TableCell>{t('name')}</TableCell>
              <TableCell align="left">{t('attack-table')}</TableCell>
              <TableCell align="left">{t('fumble-table')}</TableCell>
              <TableCell align="left">{t('size-adjustment')}</TableCell>
              <TableCell align="left">{t('fumble')}</TableCell>
              <TableCell align="left">{t('bo')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {character.attacks.map((row) => (
              <TableRow key={row.name}>
                <TableCell align="left">{t(row.attackName)}</TableCell>
                <TableCell align="left">{t(row.attackTable)}</TableCell>
                <TableCell align="left">{row.fumbleTable}</TableCell>
                <TableCell align="left">{row.sizeAdjustment}</TableCell>
                <TableCell align="left">{row.fumble}</TableCell>
                <TableCell align="left">{row.bo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid>
    </>
  );
};

export default CharacterViewAttacks;
