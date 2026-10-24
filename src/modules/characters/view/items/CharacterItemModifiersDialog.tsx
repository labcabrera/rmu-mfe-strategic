import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AddStrategicItemModifierDto,
  addStrategicItemModifier,
  deleteStrategicItemModifier,
  itemCondition,
  ItemConditionChip,
  RmuDialog,
  STRATEGIC_ITEM_MODIFIER_TARGETS,
  STRATEGIC_ITEM_MODIFIER_TYPES,
  StrategicItem,
  StrategicItemModifier,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';

const emptyModifier = (): AddStrategicItemModifierDto => ({ type: 'breakage', value: 0, appliesTo: 'all' });

/**
 * Modifiers of a strategic item (spec 019): the breakage damage of the tactical games, and the ones the game master
 * adds or removes by hand (a repair is removing a breakage modifier).
 */
export default function CharacterItemModifiersDialog({
  open,
  item,
  onClose,
  onChange,
}: {
  open: boolean;
  item: StrategicItem;
  onClose: () => void;
  onChange: (item: StrategicItem) => void;
}) {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useNotify();
  const [form, setForm] = useState<AddStrategicItemModifierDto>(emptyModifier());
  const [busy, setBusy] = useState(false);
  const modifiers = item.modifiers ?? [];

  const handleAdd = () => {
    setBusy(true);
    const dto: AddStrategicItemModifierDto = {
      ...form,
      broken: form.type === 'breakage' ? !!form.broken : undefined,
      description: form.description || undefined,
    };
    addStrategicItemModifier(item.id, dto, auth)
      .then((updated) => {
        setForm(emptyModifier());
        onChange(updated);
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  const handleDelete = (modifierId: string) => {
    setBusy(true);
    deleteStrategicItemModifier(item.id, modifierId, auth)
      .then((updated) => onChange(updated))
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  const sourceLabel = (modifier: StrategicItemModifier): string => {
    if (modifier.source?.kind === 'tactical') {
      return t('item-modifier-source-tactical', {
        name: modifier.source.tacticalGameName ?? modifier.source.tacticalGameId ?? '',
        round: modifier.source.round ?? '',
      });
    }
    return t('item-modifier-source-manual');
  };

  return (
    <RmuDialog
      open={open}
      title={t('item-modifiers')}
      subtitle={item.name}
      maxWidth="md"
      onClose={onClose}
      buttons={<Button onClick={onClose}>{t('close')}</Button>}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <ItemConditionChip condition={item.condition ?? itemCondition(modifiers)} showIntact />
        </Stack>
        {modifiers.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            {t('item-modifiers-none')}
          </Typography>
        )}
        {modifiers.map((modifier) => (
          <Stack key={modifier.id} direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Typography variant="body2" sx={{ minWidth: 90 }}>
              {t(`item-modifier-type-${modifier.type}`)}
            </Typography>
            <Typography variant="body2" sx={{ minWidth: 40, fontWeight: 600 }}>
              {modifier.value > 0 ? `+${modifier.value}` : modifier.value}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 110 }}>
              {t(`item-modifier-target-${modifier.appliesTo}`)}
            </Typography>
            {modifier.broken && (
              <Typography variant="body2" color="error.main">
                {t('item-modifier-broken')}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>
              {modifier.description ? `${modifier.description} · ${sourceLabel(modifier)}` : sourceLabel(modifier)}
            </Typography>
            <Tooltip title={t('item-modifier-delete')}>
              <span>
                <IconButton size="small" disabled={busy} onClick={() => handleDelete(modifier.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        ))}
        <Divider />
        <Grid container spacing={1} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 6, md: 2 }}>
            <TextField
              select
              fullWidth
              size="small"
              label={t('item-modifier-type')}
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as AddStrategicItemModifierDto['type'] })}
            >
              {STRATEGIC_ITEM_MODIFIER_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {t(`item-modifier-type-${type}`)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <TextField
              select
              fullWidth
              size="small"
              label={t('item-modifier-target')}
              value={form.appliesTo}
              onChange={(e) =>
                setForm({ ...form, appliesTo: e.target.value as AddStrategicItemModifierDto['appliesTo'] })
              }
            >
              {STRATEGIC_ITEM_MODIFIER_TARGETS.map((target) => (
                <MenuItem key={target} value={target}>
                  {t(`item-modifier-target-${target}`)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 4, md: 1.5 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label={t('item-modifier-value')}
              value={form.value}
              onChange={(e) => setForm({ ...form, value: Number(e.target.value) || 0 })}
            />
          </Grid>
          <Grid size={{ xs: 8, md: 3.5 }}>
            <TextField
              fullWidth
              size="small"
              label={t('item-modifier-description')}
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 1.5 }}>
            <FormControlLabel
              disabled={form.type !== 'breakage'}
              control={
                <Checkbox
                  size="small"
                  checked={!!form.broken}
                  onChange={(e) => setForm({ ...form, broken: e.target.checked })}
                />
              }
              label={t('item-modifier-broken')}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 1.5 }}>
            <Button variant="outlined" disabled={busy} onClick={handleAdd}>
              {t('item-modifier-add')}
            </Button>
          </Grid>
        </Grid>
      </Stack>
    </RmuDialog>
  );
}
