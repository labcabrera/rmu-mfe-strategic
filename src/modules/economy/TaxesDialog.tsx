import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Typography } from '@mui/material';
import { DataTable, EmptyState, LoadingState, MoneyDisplay, RmuDialog } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useTradingTables } from './TradingFields';

/**
 * Taxes and tolls of Treasure Law table 2-2i (spec 062), a read-only reference of the trading tables of
 * rmu-api-core: the game master applies them by hand.
 */
const TaxesDialog: FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const { tables } = useTradingTables();
  const rows = tables?.taxation ?? [];
  return (
    <RmuDialog open={open} maxWidth="md" title={t('taxes-and-tolls')} onClose={onClose}>
      <Stack spacing={2} sx={{ pt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {t('taxes-and-tolls-hint')}
        </Typography>
        {tables === undefined && <LoadingState />}
        {tables !== undefined && rows.length === 0 && <EmptyState dense title={t('taxes-unavailable')} />}
        {rows.length > 0 && (
          <DataTable
            rows={rows}
            getKey={(row) => row.key}
            columns={[
              {
                key: 'tax',
                header: t('tax'),
                render: (row) => (
                  <>
                    <Typography variant="body2">{t(`tax-${row.key}`, { defaultValue: row.key })}</Typography>
                    {row.notes && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {row.notes}
                      </Typography>
                    )}
                  </>
                ),
              },
              {
                key: 'cost',
                header: t('cost'),
                align: 'right',
                render: (row) => (row.cost === null ? '-' : <MoneyDisplay gold={row.cost} variant="body2" />),
              },
              {
                key: 'unit',
                header: t('tax-unit'),
                render: (row) =>
                  row.unit ? t(`tax-unit-${row.unit.replace(/\s+/g, '-')}`, { defaultValue: row.unit }) : '-',
              },
            ]}
          />
        )}
      </Stack>
    </RmuDialog>
  );
};

export default TaxesDialog;
