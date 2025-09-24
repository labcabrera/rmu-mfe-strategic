import React, { FC, Dispatch, SetStateAction } from 'react';
import { Box, Chip, Grid, Stack, TextField, Typography } from '@mui/material';
import { t } from 'i18next';
import { AddItemDto } from '../../api/character.dto';
import { Item } from '../../api/items';
import NumericCard from '../../shared/cards/NumericCard';
import TextCard from '../../shared/cards/TextCard';
import NumericInput from '../../shared/inputs/NumericInput';

const CharacterViewAddItemDialogForm: FC<{
  formData: AddItemDto;
  setFormData: Dispatch<SetStateAction<AddItemDto | null>>;
  item: Item;
}> = ({ formData, setFormData, item }) => {
  return (
    <>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Typography variant="h6">{t(formData.itemTypeId)}</Typography>
        </Grid>
        <Grid size={4}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <TextField
                label={t('item-name')}
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                variant="standard"
                fullWidth
              />
            </Grid>
            <Grid size={6}></Grid>
            <Grid size={6}>
              <NumericInput
                label={t('cost')}
                value={formData.cost}
                onChange={(value) => setFormData({ ...formData, cost: value })}
              />
            </Grid>
            <Grid size={6}></Grid>
            <Grid size={6}>
              <NumericInput
                label={t('weight')}
                value={formData.weight}
                onChange={(value) => setFormData({ ...formData, weight: value })}
              />
            </Grid>
            <Grid size={6}>
              <NumericInput
                label={t('weight-percent')}
                value={formData.weightPercent}
                onChange={(value) => setFormData({ ...formData, weightPercent: value })}
              />
            </Grid>
            <Grid size={6}>
              <NumericInput
                label={t('strength')}
                value={formData.strength}
                onChange={(value) => setFormData({ ...formData, strength: value })}
              />
            </Grid>
            <Grid size={6}>
              <NumericInput
                label={t('amount')}
                value={formData.amount}
                onChange={(value) => setFormData({ ...formData, amount: value })}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid size={1}></Grid>
        <Grid size={7}>
          <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
            <TextCard
              value={`${item.info.cost.min || ''}g`}
              subtitle="Min cost"
              image={`/static/images/items/gold-coin.png`}
            />
            <TextCard
              value={`${item.info.cost.average || ''}g`}
              subtitle="Average cost"
              image={`/static/images/items/gold-coin.png`}
            />
            <TextCard
              value={`${item.info.cost.max || ''}g`}
              subtitle="Max cost"
              image={`/static/images/items/gold-coin.png`}
            />
            {item.info && item.info.weight && (
              <NumericCard
                value={item.info.weight}
                subtitle="Weight"
                image={`/static/images/generic/weight-penalty.png`}
                applyColor={false}
              />
            )}
            {item.info && item.info.weightPercent && (
              <TextCard
                value={`${item.info.weightPercent}%`}
                subtitle="Weight"
                image={`/static/images/generic/weight-penalty.png`}
              />
            )}
            {item.weapon && item.weapon.attackTable && (
              <NumericCard
                value={item.weapon.attackTable}
                subtitle="Attack Table"
                image={`/static/images/generic/configuration.png`}
                applyColor={false}
              />
            )}
            {item.weapon && item.weapon.sizeAdjustment !== undefined && (
              <NumericCard
                value={item.weapon.sizeAdjustment}
                subtitle="Size adjustment"
                image={`/static/images/generic/configuration.png`}
                applyColor={false}
              />
            )}
            {item.weapon && item.weapon.fumble && (
              <NumericCard
                value={item.weapon.fumble}
                subtitle="Fumble"
                image={`/static/images/generic/configuration.png`}
                applyColor={false}
              />
            )}
            {item.weapon && item.weapon.requiredHands && (
              <NumericCard
                value={item.weapon.requiredHands}
                subtitle="Required hands"
                image={`/static/images/generic/configuration.png`}
                applyColor={false}
              />
            )}
            {item.armor && (
              <>
                <NumericCard
                  value={item.armor.at}
                  subtitle="Armor type"
                  image={`/static/images/generic/armor.png`}
                  applyColor={false}
                />
                <NumericCard
                  value={item.armor.maneuver}
                  subtitle="Maneuver penalty"
                  image={`/static/images/generic/maneuver-penalty.png`}
                />
                <NumericCard
                  value={item.armor.rangedPenalty}
                  subtitle="Ranged penalty"
                  image={`/static/images/generic/armor-ranged-penalty.png`}
                />
                <NumericCard
                  value={item.armor.perception}
                  subtitle="Perception penalty"
                  image={`/static/images/generic/armor-perception-penalty.png`}
                />
              </>
            )}
            {item.info && item.info.strength && (
              <NumericCard
                value={item.info.strength}
                subtitle="Strength"
                image={`/static/images/generic/configuration.png`}
                applyColor={false}
              />
            )}
          </Box>
          {item.weapon && item.weapon.ranges && item.weapon.ranges.length > 0 && (
            <>
              <Typography variant="body1" color="primary" gutterBottom>
                Ranges
              </Typography>
              <Stack direction="column" spacing={1} alignItems="left" flex={1}>
                {item.weapon.ranges.map((range) => (
                  <Chip
                    key={range.range}
                    label={`From ${range.from} to ${range.to}: ${range.bonus > 0 ? '+' : ''}${range.bonus}`}
                    sx={{ width: 'fit-content' }}
                  />
                ))}
              </Stack>
            </>
          )}
        </Grid>
      </Grid>
      {/* <pre>{JSON.stringify(item, null, 2)}</pre> */}
    </>
  );
};

export default CharacterViewAddItemDialogForm;
