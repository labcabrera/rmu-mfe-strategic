/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Stack, Typography } from '@mui/material';
import {
  Character,
  fetchItems,
  isPoisonDataValid,
  Item,
  NumericInput,
  OPEN_D100,
  poisonCharacter,
  PoisonData,
  PoisonDataFields,
  PoisonRrResult,
  RmuDialog,
  RollBreakdown,
  RollField,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useQuery } from '@tanstack/react-query';
import { useBusyAction } from '../../../shared/useBusyAction';

/**
 * A poison reaches the character (spec 042): the game master picks it, the roll (empty, the server rolls it) and a
 * modifier of the RR (dose, size...). The server resolves the RR with the poison resistance of the sheet, and the
 * dialog then shows the RR entry by entry with its rules (workspace spec 052).
 */
const NO_ITEMS: Item[] = [];

const PoisonCharacterDialog: FC<{
  character: Character;
  open: boolean;
  onClose: () => void;
  onUpdated: (character: Character) => void;
}> = ({ character, open, onClose, onUpdated }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const [poison, setPoison] = useState<PoisonData>();
  const [roll, setRoll] = useState<number | null>(null);
  const [modifier, setModifier] = useState<number | null>(null);
  const { busy: saving, run } = useBusyAction();
  const [rr, setRr] = useState<PoisonRrResult>();

  useEffect(() => {
    if (!open) return;
    setPoison(undefined);
    setRoll(null);
    setModifier(null);
    setRr(undefined);
  }, [open]);

  const catalogQuery = useQuery({
    queryKey: ['poison-catalog'],
    queryFn: () => fetchItems('category==poison', 0, 1000, auth).then((page) => page.content),
    enabled: open,
    gcTime: 0,
    // A catalog: read once while the dialog is mounted
    staleTime: Infinity,
  });
  const catalog = catalogQuery.data ?? NO_ITEMS;

  useEffect(() => {
    if (catalogQuery.error) notify.error(catalogQuery.error);
  }, [catalogQuery.error]);

  const save = () => {
    if (!isPoisonDataValid(poison)) return;
    run(
      poisonCharacter(
        character.id,
        {
          poison,
          roll: roll ?? undefined,
          modifiers: modifier ? [{ key: 'game-master', value: modifier }] : undefined,
        },
        auth
      ),
      (result) => {
        onUpdated(result.character);
        setRr(result.rr);
      }
    );
  };

  if (rr) {
    const values = { total: rr.total, required: rr.required };
    return (
      <RmuDialog open={open} title={t('poison-character')} subtitle={character.name} maxWidth="sm" onClose={onClose}>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Alert severity={rr.resisted ? 'success' : 'warning'}>
            {rr.resisted
              ? t('poison-rr-resisted', values)
              : t('poison-rr-failed', { ...values, severity: t(`poison-severity-${rr.severity ?? 'mild'}`) })}
          </Alert>
          <RollBreakdown
            context="poison-rr"
            modifiers={rr.breakdown.filter((modifier) => modifier.key !== 'roll')}
            roll={rr.roll}
            total={rr.total}
            totalLabel={t('poison-rr-total', { required: rr.required })}
          />
        </Stack>
      </RmuDialog>
    );
  }

  return (
    <RmuDialog
      open={open}
      title={t('poison-character')}
      subtitle={character.name}
      maxWidth="sm"
      onCancel={onClose}
      onConfirm={save}
      onConfirmDisabled={saving || !isPoisonDataValid(poison)}
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <PoisonDataFields catalog={catalog} value={poison} onChange={setPoison} />
        <Stack direction="row" spacing={2}>
          <RollField
            spec={OPEN_D100}
            label={t('roll')}
            value={roll}
            onChange={(value) => setRoll(value.total)}
            onClear={() => setRoll(null)}
          />
          <NumericInput label={t('poison-rr-modifier')} value={modifier} onChange={setModifier} integer />
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {t('poison-rr-help')}
        </Typography>
      </Stack>
    </RmuDialog>
  );
};

export default PoisonCharacterDialog;
