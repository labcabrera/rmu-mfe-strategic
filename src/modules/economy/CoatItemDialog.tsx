import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { MenuItem, Stack, TextField, Typography } from '@mui/material';
import {
  coatItem,
  ConfirmDialog,
  EmptyState,
  itemUnits,
  removeItemCoating,
  RmuDialog,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { DialogProps, coatingPoisons } from './item-operation-common';

/**
 * Coats a weapon with a dose of a liquid or paste poison of its holder (spec 042), or wipes the poison it has. The
 * next hit in a tactical game spends it.
 */
export const CoatItemDialog: FC<DialogProps> = ({ item, view, onClose, onDone }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useApiNotify();
  const [poisonItemId, setPoisonItemId] = useState('');
  const poisons = coatingPoisons(view.items);

  if (item.coating) {
    return (
      <ConfirmDialog
        open
        title={t('remove-coating')}
        message={t('remove-coating-confirm', { name: item.name, poison: t(item.coating.name, item.coating.name) })}
        confirmLabel={t('remove-coating')}
        onConfirm={() =>
          removeItemCoating(item.id, auth)
            .then(() => onDone())
            .catch(notify.error)
        }
        onClose={onClose}
      />
    );
  }

  const onCoat = () => coatItem(item.id, poisonItemId, auth).then(onDone).catch(notify.error);

  return (
    <RmuDialog
      open
      title={t('coat-item', { name: item.name })}
      onCancel={onClose}
      onConfirm={onCoat}
      onConfirmDisabled={!poisonItemId}
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        {poisons.length === 0 ? (
          <EmptyState dense title={t('coat-item-no-poisons')} />
        ) : (
          <TextField
            select
            size="small"
            label={t('poison')}
            value={poisonItemId}
            onChange={(e) => setPoisonItemId(e.target.value)}
          >
            {poisons.map((poison) => (
              <MenuItem key={poison.id} value={poison.id}>
                {`${t(poison.name, poison.name)} · ${t(`poison-form-${poison.catalog!.features!.poison!.form}`)} (${itemUnits(poison)})`}
              </MenuItem>
            ))}
          </TextField>
        )}
        <Typography variant="caption" color="text.secondary">
          {t('coat-item-help')}
        </Typography>
      </Stack>
    </RmuDialog>
  );
};
