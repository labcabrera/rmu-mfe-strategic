/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

const CharacterViewAttacks = ({ character }) => {
  const { t } = useTranslation();

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
                <TableCell component="th" scope="row">
                  {row.attackName}
                </TableCell>
                <TableCell align="left">{row.attackTable}</TableCell>
                <TableCell align="left">{row.fumbleTable}</TableCell>
                <TableCell align="left">{row.sizeAdjustment}</TableCell>
                <TableCell align="left">{row.fumble}</TableCell>
                <TableCell align="left">{row.bo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid>
      <pre>{JSON.stringify(character.attacks, null, 2)}</pre>
    </>
  );
};

export default CharacterViewAttacks;
