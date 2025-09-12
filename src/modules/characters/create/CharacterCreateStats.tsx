import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SyncIcon from '@mui/icons-material/Sync';
import { IconButton, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { CreateCharacterDto } from '../../api/characters';
import { stats } from '../../api/characters';
import { StrategicGame } from '../../api/strategic-games';
import { StatBonusFormData } from './CharacterCreate';
import CharacterCreateStatsActions from './CharacterCreateStatsActions';

const red = '#ffab91';
const green = '#a5d6a7';

const CharacterStats: FC<{
  key: string;
  statKey: string;
  statName: string;
  formData: CreateCharacterDto;
  setFormData: Dispatch<SetStateAction<CreateCharacterDto>>;
  statBonusFormData: StatBonusFormData;
}> = ({ statKey, statName, formData, setFormData, statBonusFormData }) => {
  const { t } = useTranslation();

  const getColor = (value: number): string => {
    return value < 0 ? red : value > 0 ? green : 'inherit';
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
  strategicGame: StrategicGame;
  formData: CreateCharacterDto;
  onRandomStats?: () => void;
  setFormData: Dispatch<SetStateAction<CreateCharacterDto>>;
  statBonusFormData: StatBonusFormData;
  setStatBonusFormData: Dispatch<SetStateAction<StatBonusFormData>>;
}> = ({ strategicGame, formData, setFormData, onRandomStats, statBonusFormData, setStatBonusFormData }) => {
  const { t } = useTranslation();

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
              setFormData={setFormData}
              statBonusFormData={statBonusFormData}
            />
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default CharacterCreateStats;
