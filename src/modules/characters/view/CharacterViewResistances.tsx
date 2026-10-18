import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { CategorySeparator, Character, imageBaseUrl } from '@labcabrera-rmu/rmu-react-shared-lib';

const CharacterViewResistances: FC<{
  character: Character;
}> = ({ character }) => {
  const { t } = useTranslation();

  const getColor = (value: number) => {
    if (value < 0) return 'error.main';
    if (value > 0) return 'success.main';
    return 'inherit';
  };

  const getImage = (resistance: string) => {
    switch (resistance) {
      case 'poison':
      case 'disease':
      case 'fear':
      case 'physical':
        return `${imageBaseUrl}images/generic/${resistance}.png`;
      default:
        return `${imageBaseUrl}images/generic/stat-st.png`;
    }
  };

  return (
    <>
      <CategorySeparator text={t('resistances')} />
      <Paper sx={{ width: 'fit-content', maxWidth: '100%', overflowX: 'auto' }}>
        <Table
          size="small"
          sx={{
            minWidth: 520,
            maxWidth: 640,
            '& .MuiTableCell-root': {
              py: 0.75,
              px: 1.5,
            },
            '& .MuiTableRow-root': {
              height: 44,
            },
          }}
          aria-label={t('stats-table')}
        >
          <TableHead
            sx={{
              '& .MuiTableCell-root': {
                color: 'primary.main',
                fontWeight: 'bold',
              },
            }}
          >
            <TableRow>
              <TableCell align="left" sx={{ minWidth: 180 }}>
                {t('resistance')}
              </TableCell>
              <TableCell align="right" sx={{ width: 64 }}>
                {t('stat')}
              </TableCell>
              <TableCell align="right" sx={{ width: 64 }}>
                {t('racial')}
              </TableCell>
              <TableCell align="right" sx={{ width: 64 }}>
                {t('realm')}
              </TableCell>
              <TableCell align="right" sx={{ width: 64 }}>
                {t('custom')}
              </TableCell>
              <TableCell align="right" sx={{ width: 64 }}>
                {t('total')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {character.resistances.map((resistance) => (
              <TableRow key={resistance.resistance} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Box
                      component="img"
                      src={getImage(resistance.resistance)}
                      alt={t(resistance.resistance)}
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: 0.75,
                        objectFit: 'cover',
                        filter: 'grayscale(0.7)',
                        flex: 'none',
                      }}
                    />
                    <Box component="span">{t(resistance.resistance)}</Box>
                  </Stack>
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
      </Paper>
    </>
  );
};

export default CharacterViewResistances;
