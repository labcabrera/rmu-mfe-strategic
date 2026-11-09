import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Button, Stack } from '@mui/material';
import { ConfirmDialog, discardItem, itemUnits, RmuDialog, useApiNotify } from '@labcabrera-rmu/rmu-react-shared-lib';
import { AmountField, DialogProps, partialAmount } from './item-operation-common';

/** Throws an item away, after a confirmation: it leaves an entry in the ledger. */
export const DiscardItemDialog: FC<DialogProps> = ({ item, onClose, onDone }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useApiNotify();
  const [amount, setAmount] = useState<number | null>(itemUnits(item));
  const [confirm, setConfirm] = useState(false);

  const onDiscard = () =>
    discardItem(item.id, { amount: partialAmount(item, amount) }, auth)
      .then(onDone)
      .catch(notify.error);

  if (confirm || !item.info?.stackable) {
    return (
      <ConfirmDialog
        open
        destructive
        title={t('discard-item')}
        message={t('discard-item-confirm', { name: item.name, amount: amount ?? itemUnits(item) })}
        confirmLabel={t('discard')}
        onConfirm={onDiscard}
        onClose={onClose}
      />
    );
  }
  return (
    <RmuDialog
      open
      title={t('discard-item')}
      onCancel={onClose}
      buttons={
        <Button color="error" variant="contained" disabled={!amount} onClick={() => setConfirm(true)}>
          {t('discard')}
        </Button>
      }
    >
      <Stack sx={{ pt: 1 }}>
        <AmountField item={item} value={amount} onChange={setAmount} />
      </Stack>
    </RmuDialog>
  );
};
