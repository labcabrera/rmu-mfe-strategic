/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, MenuItem, Stack, TextField, Typography } from '@mui/material';
import {
  applyCharacterHerb,
  fetchStrategicItems,
  isHealingHerb,
  NumericInput,
  RmuDialog,
  StrategicItem,
  UseHerbResult,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useStrategicNotify } from '../../../services/notify-service';

/**
 * A dose of a healing herb of the character (spec 062): the hits rolled (or the server rolls the range of the herb),
 * one dose spent and an entry in the healing log. `item` opens it on that herb; without it, it lists the herbs that
 * heal.
 */
const UseHerbDialog: FC<{
  characterId: string;
  open: boolean;
  item?: StrategicItem;
  onClose: () => void;
  onDone: (result: UseHerbResult) => void;
}> = ({ characterId, open, item, onClose, onDone }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useStrategicNotify();
  const [herbs, setHerbs] = useState<StrategicItem[]>(item ? [item] : []);
  const [itemId, setItemId] = useState(item?.id ?? '');
  const [roll, setRoll] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setRoll(null);
    setItemId(item?.id ?? '');
    if (item) {
      setHerbs([item]);
      return;
    }
    fetchStrategicItems(`characterId==${characterId}`, 0, 1000, auth)
      .then((page) => setHerbs(page.content.filter(isHealingHerb)))
      .catch(notify.error);
  }, [open, item?.id]);

  const selected = herbs.find((each) => each.id === itemId);
  const heal = selected?.catalog?.features?.herb?.effects?.heal;

  const save = () => {
    if (!selected) return;
    setSaving(true);
    applyCharacterHerb(characterId, { itemId: selected.id, ...(roll !== null ? { roll } : {}) }, auth)
      .then((result) => {
        notify.success(t('herb-use-done', { hits: result.healed }));
        onDone(result);
      })
      .catch(notify.error)
      .finally(() => setSaving(false));
  };

  return (
    <RmuDialog
      open={open}
      title={t('herb-use')}
      maxWidth="sm"
      onCancel={onClose}
      onConfirm={save}
      onConfirmDisabled={saving || !selected}
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        {herbs.length === 0 ? (
          <Alert severity="info">{t('herb-use-no-items')}</Alert>
        ) : (
          <TextField
            select
            size="small"
            label={t('item-category-herb')}
            value={itemId}
            disabled={!!item}
            onChange={(e) => setItemId(e.target.value)}
          >
            {herbs.map((each) => (
              <MenuItem key={each.id} value={each.id}>
                {`${t(each.name, each.name)} (${each.amount})`}
              </MenuItem>
            ))}
          </TextField>
        )}
        {heal && (
          <>
            <NumericInput
              integer
              min={0}
              allowNegatives={false}
              label={t('herb-use-roll')}
              value={roll}
              onChange={setRoll}
            />
            <Typography variant="caption" color="text.secondary">
              {t('herb-use-roll-help', { min: heal.min, max: heal.max })}
            </Typography>
          </>
        )}
      </Stack>
    </RmuDialog>
  );
};

export default UseHerbDialog;
