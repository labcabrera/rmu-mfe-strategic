/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Grid, MenuItem, Stack, TextField } from '@mui/material';
import {
  ANY_POISON,
  AntidoteSource,
  Character,
  fetchStrategicItems,
  GiveAntidoteDto,
  giveCharacterAntidote,
  Injury,
  NumericInput,
  POISON_CATEGORIES,
  RmuDialog,
  StrategicItem,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useStrategicNotify } from '../../../services/notify-service';

const SOURCES: AntidoteSource[] = ['item', 'magic', 'external'];

/**
 * Gives an antidote for a poisoning (spec 042): an antidote the character carries (one dose is spent), a spell, or
 * one given by hand. The server tells whether it neutralized the poison.
 */
const AntidoteDialog: FC<{
  character: Character;
  injury?: Injury;
  open: boolean;
  onClose: () => void;
  onUpdated: (character: Character) => void;
}> = ({ character, injury, open, onClose, onUpdated }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useStrategicNotify();
  const [antidotes, setAntidotes] = useState<StrategicItem[]>([]);
  const [source, setSource] = useState<AntidoteSource>('item');
  const [itemId, setItemId] = useState('');
  const [name, setName] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [level, setLevel] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSource('item');
    setItemId('');
    setName('');
    setCategories([]);
    setLevel(null);
    fetchStrategicItems(`characterId==${character.id}`, 0, 1000, auth)
      .then((page) => setAntidotes(page.content.filter((item) => item.catalog?.features?.antidote)))
      .catch(notify.error);
  }, [open]);

  const dto = (): GiveAntidoteDto | undefined => {
    if (source === 'item') return itemId ? { source, itemId } : undefined;
    if (!name.trim()) return undefined;
    if (source === 'magic') return { source, name, level: level ?? undefined };
    if (categories.length === 0 || level === null) return undefined;
    return { source, name, categories, level };
  };

  const save = () => {
    const body = dto();
    if (!injury || !body) return;
    setSaving(true);
    giveCharacterAntidote(character.id, injury.id, body, auth)
      .then((result) => {
        onUpdated(result.character);
        if (result.neutralized) notify.success(t('antidote-neutralized'));
        else notify.warning(t('antidote-not-neutralized'));
        onClose();
      })
      .catch(notify.error)
      .finally(() => setSaving(false));
  };

  return (
    <RmuDialog
      open={open}
      title={t('give-antidote')}
      subtitle={injury?.poison?.name}
      maxWidth="sm"
      onCancel={onClose}
      onConfirm={save}
      onConfirmDisabled={saving || !dto()}
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <TextField
          select
          size="small"
          label={t('antidote-source')}
          value={source}
          onChange={(e) => setSource(e.target.value as AntidoteSource)}
        >
          {SOURCES.map((each) => (
            <MenuItem key={each} value={each}>
              {t(`antidote-source-${each}`)}
            </MenuItem>
          ))}
        </TextField>
        {source === 'item' &&
          (antidotes.length === 0 ? (
            <Alert severity="info">{t('antidote-no-items')}</Alert>
          ) : (
            <TextField
              select
              size="small"
              label={t('antidote')}
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
            >
              {antidotes.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {`${t(item.name, item.name)} (${item.amount})`}
                </MenuItem>
              ))}
            </TextField>
          ))}
        {source !== 'item' && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                size="small"
                fullWidth
                label={t('name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <NumericInput
                integer
                min={0}
                allowNegatives={false}
                label={t('level')}
                value={level}
                onChange={setLevel}
              />
            </Grid>
            {source === 'external' && (
              <Grid size={12}>
                <TextField
                  select
                  size="small"
                  fullWidth
                  label={t('poison-categories')}
                  value={categories}
                  slotProps={{ select: { multiple: true } }}
                  onChange={(e) => setCategories(e.target.value as unknown as string[])}
                >
                  {[...POISON_CATEGORIES, ANY_POISON].map((category) => (
                    <MenuItem key={category} value={category}>
                      {t(`poison-category-${category}`)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
          </Grid>
        )}
      </Stack>
    </RmuDialog>
  );
};

export default AntidoteDialog;
