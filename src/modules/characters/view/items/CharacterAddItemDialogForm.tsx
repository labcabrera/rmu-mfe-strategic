import React, { FC, Dispatch, SetStateAction } from 'react';
import { Grid, Stack, TextField, Typography } from '@mui/material';
import { CategorySeparator, NumericInput } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { AddItemDto } from '../../../api/character.dto';
import { Item } from '../../../api/items';

const inputSize = { xs: 12, md: 4 } as const;

const CharacterAddItemDialogForm: FC<{
  formData: AddItemDto;
  setFormData: Dispatch<SetStateAction<AddItemDto | undefined>>;
  item: Item | undefined;
}> = ({ formData, setFormData, item }) => {
  if (!item) return;
  return (
    <>
      <Grid container spacing={1}>
        <Grid size={12}>
          <CategorySeparator text={t(formData.itemTypeId)} />
        </Grid>
        <Grid size={12}>
          <TextField
            label={t('Item name')}
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
          />
        </Grid>
        <Grid size={inputSize}>
          <NumericInput
            label={t('Cost')}
            value={formData.cost || null}
            onChange={(value) => setFormData({ ...formData, cost: value || undefined })}
          />
        </Grid>
        <Grid size={inputSize}>
          <NumericInput
            label={t('Weight')}
            value={formData.weight || null}
            onChange={(value) => setFormData({ ...formData, weight: value || undefined })}
          />
        </Grid>
        {item.category === 'armor' && (
          <Grid size={inputSize}>
            <NumericInput
              label={t('Weight percent')}
              value={formData.weightPercent || null}
              onChange={(value) => setFormData({ ...formData, weightPercent: value || undefined })}
            />
          </Grid>
        )}
        <Grid size={inputSize}>
          <NumericInput
            label={t('Strength')}
            value={formData.strength || null}
            onChange={(value) => setFormData({ ...formData, strength: value || undefined })}
          />
        </Grid>
        {item.info.length && (
          <Grid size={inputSize}>
            <NumericInput
              label={t('Length')}
              value={formData.length || null}
              onChange={(value) => setFormData({ ...formData, length: value || undefined })}
            />
          </Grid>
        )}
        {item.category === 'weapon' && (
          <Grid size={inputSize}>
            <NumericInput
              label={t('Fumble')}
              value={formData.fumble || null}
              onChange={(value) => setFormData({ ...formData, fumble: value || undefined })}
            />
          </Grid>
        )}
        <Grid size={inputSize}>
          <NumericInput
            label={t('Amount')}
            value={formData.amount || null}
            onChange={(value) => setFormData({ ...formData, amount: value || undefined })}
          />
        </Grid>

        <Grid size={12}>
          <CategorySeparator text={t('Item information')} />
        </Grid>

        <KeyValueEntry label="Min cost" value={item.info.cost?.min || '-'} />
        <KeyValueEntry label="Avg cost" value={item.info.cost?.average || '-'} />
        <KeyValueEntry label="Max cost" value={item.info.cost?.max || '-'} />
        {item.armor && (
          <>
            <KeyValueEntry label="AT" value={item.armor.at} />
            <KeyValueEntry label="Maneuver penalty" value={item.armor.maneuver || 0} />
            <KeyValueEntry label="Ranged penalty" value={item.armor.rangedPenalty || 0} />
            <KeyValueEntry label="Perception penalty" value={item.armor.perceptionPenalty || 0} />
            <KeyValueEntry label="Enc" value={item.armor.enc} />
            <KeyValueEntry label="Base difficulty" value={item.armor.baseDifficulty} />
          </>
        )}
        {item.weapon && (
          <>
            <KeyValueEntry label="Skill" value={t(item.weapon.skillId)} />
            <KeyValueEntry label="Fumble" value={item.weapon.fumble} />
          </>
        )}
      </Grid>
    </>
  );
};

const KeyValueEntry: FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => {
  return (
    <Grid size={inputSize}>
      <Stack direction="column">
        <Typography color="primary" variant="body2">
          {value}
        </Typography>
        <Typography color="secondary" variant="caption">
          {label}
        </Typography>
      </Stack>
    </Grid>
  );
};

export default CharacterAddItemDialogForm;
