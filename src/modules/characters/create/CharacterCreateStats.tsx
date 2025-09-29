import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import SyncIcon from '@mui/icons-material/Sync';
import { IconButton, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import Typography from '@mui/material/Typography';
import { t } from 'i18next';
import { CreateCharacterDto, stats } from '../../api/character.dto';
import { StatBonusFormData } from './CharacterCreate';

const CharacterStats: FC<{
  key: string;
  statKey: string;
  statName: string;
  formData: CreateCharacterDto;
  statBonusFormData: StatBonusFormData;
}> = ({ statKey, statName, formData, statBonusFormData }) => {
  const { t } = useTranslation();

  const getColor = (value: number): string => {
    if (value > 0) return 'success.main';
    if (value < 0) return 'error.main';
    return 'inherit';
  };

  const getTotal = (): number => {
    const stat = formData.statistics[statKey];
    const bonus = statBonusFormData[statKey];
    return stat.racial + bonus.temporary;
  };

  return (
    <>
      <TableRow key={statKey} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
        <TableCell component="th" scope="row">
          {t(statName)}
        </TableCell>
        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
          {formData.statistics[statKey].potential}
        </TableCell>
        <TableCell
          align="right"
          sx={{
            color: getColor(statBonusFormData[statKey].potential),
          }}
        >
          {statBonusFormData[statKey].potential}
        </TableCell>
        <TableCell align="right">{formData.statistics[statKey].temporary}</TableCell>
        <TableCell
          align="right"
          sx={{
            color: getColor(statBonusFormData[statKey].temporary),
          }}
        >
          {statBonusFormData[statKey].temporary}
        </TableCell>
        <TableCell
          align="right"
          sx={{
            color: getColor(formData.statistics[statKey].racial),
          }}
        >
          {formData.statistics[statKey].racial}
        </TableCell>
        <TableCell
          align="right"
          sx={{
            color: getColor(getTotal()),
            fontWeight: 'bold',
          }}
        >
          {getTotal()}
        </TableCell>
      </TableRow>
    </>
  );
};

const CharacterCreateStats: FC<{
  formData: CreateCharacterDto;
  onRandomStats?: () => void;
  statBonusFormData: StatBonusFormData;
}> = ({ formData, onRandomStats, statBonusFormData }) => {
  return (
    <>
      <Typography variant="h6" color="primary">
        {t('statistics')}
        <IconButton onClick={onRandomStats}>
          <SyncIcon />
        </IconButton>
      </Typography>
      <Table sx={{ minWidth: 650 }} aria-label="stats table">
        <TableHead>
          <TableRow>
            <TableCell align="left">Stat</TableCell>
            <TableCell align="right">{t('potential')}</TableCell>
            <TableCell align="right">{t('potential-bonus')}</TableCell>
            <TableCell align="right">{t('temporary')}</TableCell>
            <TableCell align="right">{t('temporary-bonus')}</TableCell>
            <TableCell align="right">{t('racial')}</TableCell>
            <TableCell align="right">{t('total')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stats.map((key) => (
            <CharacterStats
              key={key}
              statKey={key}
              statName={t(key)}
              formData={formData}
              statBonusFormData={statBonusFormData}
            />
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default CharacterCreateStats;
