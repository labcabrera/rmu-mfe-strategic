/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

const red = '#ffab91';
const green = '#a5d6a7';

const CharacterViewResistances = ({ character }) => {
  const { t } = useTranslation();
  return (
    <>
      <Typography variant="h6" color="primary">
        {t('resistances')}
      </Typography>
      <Table sx={{ minWidth: 650 }} aria-label="stats table">
        <TableHead>
          <TableRow>
            <TableCell align="left">{t('resistance')}</TableCell>
            <TableCell align="right">{t('stat')}</TableCell>
            <TableCell align="right">{t('racial')}</TableCell>
            <TableCell align="right">{t('realm')}</TableCell>
            <TableCell align="right">{t('custom')}</TableCell>
            <TableCell align="right">{t('total')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {character.resistances.map((resistance) => (
            <TableRow key={resistance} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component="th" scope="row">
                {t(resistance.resistance)}
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  color: resistance.statBonus < 0 ? red : resistance.statBonus > 0 ? green : 'inherit',
                  fontWeight: 'bold',
                }}
              >
                {resistance.statBonus}
              </TableCell>
              <TableCell align="right">{resistance.racialBonus}</TableCell>
              <TableCell align="right">{resistance.realmBonus}</TableCell>
              <TableCell align="right">{resistance.customBonus}</TableCell>
              <TableCell
                align="right"
                sx={{
                  color: resistance.totalBonus < 0 ? red : resistance.totalBonus > 0 ? green : 'inherit',
                  fontWeight: 'bold',
                }}
              >
                {resistance.totalBonus}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default CharacterViewResistances;
