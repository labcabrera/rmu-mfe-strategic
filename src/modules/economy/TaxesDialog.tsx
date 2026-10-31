import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { LoadingState, MoneyDisplay, RmuDialog } from '@labcabrera-rmu/rmu-react-shared-lib';
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
        {tables !== undefined && rows.length === 0 && <Alert severity="info">{t('taxes-unavailable')}</Alert>}
        {rows.length > 0 && (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('tax')}</TableCell>
                  <TableCell align="right">{t('cost')}</TableCell>
                  <TableCell>{t('tax-unit')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.key}>
                    <TableCell>
                      <Typography variant="body2">{t(`tax-${row.key}`, { defaultValue: row.key })}</Typography>
                      {row.notes && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {row.notes}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {row.cost === null ? '-' : <MoneyDisplay gold={row.cost} variant="body2" />}
                    </TableCell>
                    <TableCell>{row.unit ? t(`tax-unit-${row.unit}`, { defaultValue: row.unit }) : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Stack>
    </RmuDialog>
  );
};

export default TaxesDialog;
