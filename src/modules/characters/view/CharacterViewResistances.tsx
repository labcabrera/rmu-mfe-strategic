import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { Character } from '../../api/character.dto';

const red = '#ffab91';
const green = '#a5d6a7';

const CharacterViewResistances: FC<{
  character: Character;
}> = ({ character }) => {
  const { t } = useTranslation();

  const getColor = (value: number) => {
    if (value < 0) return red;
    if (value > 0) return green;
    return 'inherit';
  };

  return (
    <>
      <Typography variant="h6" color="primary">
        {t('resistances')}
      </Typography>
      <Table sx={{ minWidth: 650, maxWidth: 800 }} aria-label="stats table">
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
            <TableRow key={resistance.resistance} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component="th" scope="row">
                {t(resistance.resistance)}
              </TableCell>
              <TableCell align="right" sx={{ color: getColor(resistance.statBonus) }}>
                {resistance.statBonus}
              </TableCell>
              <TableCell align="right" sx={{ color: getColor(resistance.racialBonus) }}>
                {resistance.racialBonus}
              </TableCell>
              <TableCell align="right" sx={{ color: getColor(resistance.realmBonus) }}>
                {resistance.realmBonus}
              </TableCell>
              <TableCell align="right" sx={{ color: getColor(resistance.customBonus) }}>
                {resistance.customBonus}
              </TableCell>
              <TableCell align="right" sx={{ color: getColor(resistance.totalBonus), fontWeight: 'bold' }}>
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
