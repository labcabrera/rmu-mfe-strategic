import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { NumericInput } from '@labcabrera-rmu/rmu-react-shared-lib';

const permanentInjuryRows = [
  {
    roll: '< 1',
    result: 'absolute-failure',
    permanentInjury: 'permanent-injury-percent-of-penalty',
    penaltyPercent: 100,
  },
  { roll: '1 - 75', result: 'failure', permanentInjury: 'permanent-injury-percent-of-penalty', penaltyPercent: 75 },
  {
    roll: '76 - 99',
    result: 'partial-success',
    permanentInjury: 'permanent-injury-percent-of-penalty',
    penaltyPercent: 50,
  },
  { roll: '100 - 175', result: 'success', permanentInjury: 'permanent-injury-percent-of-penalty', penaltyPercent: 25 },
  { roll: '176 +', result: 'absolute-success', permanentInjury: 'permanent-injury-none', penaltyPercent: 0 },
];

const CharacterPermanentInjuryForm: FC = () => {
  const { t } = useTranslation();
  const [roll, setRoll] = useState<number>();
  const [injuryPenalty, setInjuryPenalty] = useState<number>(0);

  const result = useMemo(() => {
    if (roll === undefined) {
      return undefined;
    }
    if (roll < 1) return permanentInjuryRows[0];
    if (roll <= 75) return permanentInjuryRows[1];
    if (roll <= 99) return permanentInjuryRows[2];
    if (roll <= 175) return permanentInjuryRows[3];
    return permanentInjuryRows[4];
  }, [roll]);

  const permanentPenalty = result ? Math.ceil(Math.abs(injuryPenalty) * (result.penaltyPercent / 100)) : 0;

  return (
    <Stack spacing={2}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {t('permanent-injury')}
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <TableContainer component={Paper}>
            <Table size="small" aria-label={t('permanent-injury-table')}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>{t('roll')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('result')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('permanent-injury')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {permanentInjuryRows.map((row) => (
                  <TableRow key={row.roll} selected={result?.roll === row.roll}>
                    <TableCell component="th" scope="row">
                      {row.roll}
                    </TableCell>
                    <TableCell>{t(row.result)}</TableCell>
                    <TableCell>{t(row.permanentInjury, { percent: row.penaltyPercent })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                {t('permanent-injury-help')}
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <NumericInput
                    integer
                    label={t('roll')}
                    value={roll || null}
                    onChange={(value) => setRoll(value || undefined)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <NumericInput
                    integer
                    label={t('original-penalty')}
                    value={injuryPenalty || null}
                    onChange={(value) => setInjuryPenalty(value || 0)}
                  />
                </Grid>
              </Grid>
              <Stack spacing={0.5}>
                <Typography variant="body2" color="text.secondary">
                  {t('result')}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {result ? t(result.result) : '-'}
                </Typography>
                <Typography variant="body1">
                  {result
                    ? t(result.permanentInjury, { percent: result.penaltyPercent })
                    : t('permanent-injury-enter-roll')}
                </Typography>
                {result && (
                  <Typography variant="body2" color="text.secondary">
                    {t('permanent-penalty-value', { value: permanentPenalty > 0 ? `-${permanentPenalty}` : '0' })}
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default CharacterPermanentInjuryForm;
