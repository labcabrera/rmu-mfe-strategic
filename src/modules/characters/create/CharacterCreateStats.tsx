import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import { CreateCharacterDto, DataTable, StatKey, STATS } from '@labcabrera-rmu/rmu-react-shared-lib';
import { StatBonusFormData } from './CharacterCreatePage';

const bonusColor = (value: number): string => {
  if (value > 0) return 'success.main';
  if (value < 0) return 'error.main';
  return 'inherit';
};

/** The stats of the character being created: potential and temporary with their bonuses, racial and total. */
export default function CharacterCreateStats({
  formData,
  statBonusFormData,
}: {
  formData: CreateCharacterDto;
  statBonusFormData: StatBonusFormData;
}) {
  const { t } = useTranslation();
  const total = (key: StatKey) => (formData.statistics[key].racial || 0) + statBonusFormData[key].temporary;
  const colored = (value: number | undefined, color?: string, bold = false) => (
    <Box component="span" sx={{ color, fontWeight: bold ? 600 : undefined }}>
      {value}
    </Box>
  );

  return (
    <DataTable
      rows={[...STATS]}
      getKey={(key) => key}
      columns={[
        { key: 'stat', header: t('stat'), render: (key) => t(key) },
        {
          key: 'potential',
          header: t('potential-short'),
          align: 'right',
          render: (key) => colored(formData.statistics[key].potential, undefined, true),
        },
        {
          key: 'potential-bonus',
          header: t('potential-bonus-short'),
          align: 'right',
          render: (key) => colored(statBonusFormData[key].potential, bonusColor(statBonusFormData[key].potential)),
        },
        {
          key: 'temporary',
          header: t('temporary-short'),
          align: 'right',
          render: (key) => formData.statistics[key].temporary,
        },
        {
          key: 'temporary-bonus',
          header: t('temporary-bonus-short'),
          align: 'right',
          render: (key) => colored(statBonusFormData[key].temporary, bonusColor(statBonusFormData[key].temporary)),
        },
        {
          key: 'racial',
          header: t('racial'),
          align: 'right',
          render: (key) => colored(formData.statistics[key].racial, bonusColor(formData.statistics[key].racial || 0)),
        },
        {
          key: 'total',
          header: t('total'),
          align: 'right',
          render: (key) => colored(total(key), bonusColor(total(key)), true),
        },
      ]}
    />
  );
}
