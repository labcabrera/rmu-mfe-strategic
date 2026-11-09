import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Chip, Grid, Stack, TextField, Typography } from '@mui/material';
import {
  EnchantmentProject,
  EnchantmentScr,
  NumericInput,
  OPEN_D100,
  RmuDialog,
  RollField,
  useTableText,
} from '@labcabrera-rmu/rmu-react-shared-lib';

/** The SCR of one spell: its roll and total, and on a failure the failure roll and the row of its table. */
export const ScrResult: FC<{
  scr: EnchantmentScr;
  name: string;
  roll: number | undefined;
  onRoll: (value: number) => void;
}> = ({ scr, name, roll, onRoll }) => {
  const { t } = useTranslation();
  // Workspace spec 086: the English text of a table entry, translated when there is one
  const tableText = useTableText();
  return (
    <Stack spacing={1} sx={{ pl: 1, borderLeft: 3, borderColor: scr.failed ? 'error.main' : 'success.main' }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }} useFlexGap>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('enchantment-scr-line', { roll: scr.roll, total: scr.total })}
        </Typography>
        <Chip
          size="small"
          color={scr.failed ? 'error' : 'success'}
          label={t(scr.failed ? 'enchantment-scr-failed' : 'enchantment-scr-passed')}
        />
        {scr.failure?.serendipity && (
          <Chip size="small" color="secondary" label={t(`enchantment-serendipity-${scr.failure.serendipity}`)} />
        )}
      </Stack>
      {scr.failed && scr.failureRoll === null && (
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }} useFlexGap>
          <RollField
            spec={OPEN_D100}
            label={t('enchantment-failure-roll')}
            value={roll}
            onChange={(value) => onRoll(value.total)}
          />
          <Typography variant="caption" color="text.secondary">
            {t('enchantment-failure-modifier', { value: scr.failureModifier })}
          </Typography>
        </Stack>
      )}
      {scr.failed && scr.failureRoll !== null && (
        <Box>
          <Typography variant="caption" color="text.secondary">
            {t('enchantment-failure-line', {
              table: t(`alchemy-failure-table-${scr.failure?.table ?? ''}`),
              roll: scr.failureRoll,
              modifier: scr.failureModifier,
              total: scr.failureRoll + scr.failureModifier,
            })}
          </Typography>
          {scr.failure && (
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {tableText(scr.failure.text)}
            </Typography>
          )}
        </Box>
      )}
    </Stack>
  );
};

/** Extra days and cost of the failures (the cost is charged to the payer), and notes. */
export const EnchantmentAdjustDialog: FC<{
  project: EnchantmentProject;
  onClose: () => void;
  onSave: (dto: { extraDays: number; extraCost: number; notes: string | null }) => void;
}> = ({ project, onClose, onSave }) => {
  const { t } = useTranslation();
  const [extraDays, setExtraDays] = useState<number | null>(project.extraDays);
  const [extraCost, setExtraCost] = useState<number | null>(project.extraCost);
  const [notes, setNotes] = useState(project.notes ?? '');
  return (
    <RmuDialog
      open
      maxWidth="sm"
      title={t('enchantment-adjust')}
      subtitle={t(project.itemName, project.itemName)}
      onDismiss={onClose}
      buttons={
        <>
          <Button onClick={onClose}>{t('cancel')}</Button>
          <Button
            variant="contained"
            onClick={() =>
              onSave({ extraDays: extraDays ?? 0, extraCost: extraCost ?? 0, notes: notes.trim() || null })
            }
          >
            {t('save')}
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          {t('enchantment-adjust-hint')}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={6}>
            <NumericInput
              label={t('enchantment-extra-days')}
              value={extraDays}
              onChange={setExtraDays}
              min={0}
              integer
            />
          </Grid>
          <Grid size={6}>
            <NumericInput
              label={t('enchantment-extra-cost')}
              value={extraCost}
              onChange={setExtraCost}
              min={0}
              maxFractionDigits={2}
            />
          </Grid>
        </Grid>
        <TextField label={t('notes')} value={notes} onChange={(e) => setNotes(e.target.value)} multiline minRows={3} />
      </Stack>
    </RmuDialog>
  );
};
