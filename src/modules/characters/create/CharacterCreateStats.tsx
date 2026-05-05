import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { CreateCharacterDto, StatKey, STATS } from '@labcabrera-rmu/rmu-react-shared-lib';
import { StatBonusFormData } from './CharacterCreate';

export default function CharacterCreateStats({
  formData,
  statBonusFormData,
}: {
  formData: CreateCharacterDto;
  statBonusFormData: StatBonusFormData;
}) {
  const { t } = useTranslation();

  return (
    <Table sx={{ minWidth: 650 }} aria-label="stats table" size="small">
      <TableHead>
        <TableRow>
          <TableCell align="left">Stat</TableCell>
          <TableCell align="right">{t('potential-short')}</TableCell>
          <TableCell align="right">{t('potential-bonus-short')}</TableCell>
          <TableCell align="right">{t('temporary-short')}</TableCell>
          <TableCell align="right">{t('temporary-bonus-short')}</TableCell>
          <TableCell align="right">{t('racial')}</TableCell>
          <TableCell align="right">{t('total')}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {STATS.map((key) => (
          <Row key={key} statKey={key} statName={t(key)} formData={formData} statBonusFormData={statBonusFormData} />
        ))}
      </TableBody>
    </Table>
  );
}

const Row: FC<{
  key: string;
  statKey: StatKey;
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
    //TODO
    const racial = 0;
    return racial + bonus.temporary;
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
