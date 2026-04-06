import React, { Dispatch, FC, Fragment, SetStateAction } from 'react';
import { Divider, Grid, Typography, Paper, Stack } from '@mui/material';
import { CategorySeparator, TechnicalInfo } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { Character } from '../../../api/character.dto';
import { StrategicItem } from '../../../api/strategic-item.dto';
import CharacterViewTransferGold from '../CharacterViewTransferGold';

const CharacterItemDetail: FC<{
  character: Character;
  items: StrategicItem[];
  itemId?: string | undefined;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
}> = ({ itemId, character, items, setCharacter }) => {
  if (!itemId) return null;
  if (!items) return <p>Loading...</p>;

  const item = items.find((i) => i.id == itemId)!;

  if (!item) return null;

  return (
    <Paper sx={{ padding: 2 }}>
      <Grid container spacing={1}>
        <Grid size={12}>
          <Typography variant="h6">{item.name}</Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {item.itemTypeId ? t(item.itemTypeId) : ''}
          </Typography>

          <Divider sx={{ my: 1 }} />

          <Grid container spacing={1} mb={2}>
            {item.amount && <KeyValueEntry label={t('Amount')} value={item.amount} />}
            {item.info.weight !== 0 && <KeyValueEntry label={t('Weight')} value={`${item.info.weight} lbs`} />}
            {item.info.length && <KeyValueEntry label={t('Length')} value={`${item.info.length}'`} />}
            {item.info.cost && <KeyValueEntry label={t('Weight')} value={item.info.cost} />}
            {item.info.strength && <KeyValueEntry label={t('Strength')} value={item.info.strength} />}
          </Grid>

          {item.weapon && (
            <>
              <CategorySeparator text={t('Weapon')} />
              <Grid container spacing={1}>
                <KeyValueEntry label={t('Skill')} value={t(item.weapon.skillId)} />
                <KeyValueEntry label={t('Fumble')} value={t(item.weapon.fumble)} />
              </Grid>
              <Grid container spacing={1} mt={2}>
                {item.weapon.modes.map((mode, index) => (
                  <Fragment key={index}>
                    <KeyValueEntry label={t('Attack type')} value={t(mode.type)} />
                    <KeyValueEntry label={t('Attack table')} value={t(mode.attackTable)} />
                    <KeyValueEntry label={t('Fumble table')} value={t(mode.fumbleTable)} />
                    <KeyValueEntry label={t('Size adjustment')} value={mode.sizeAdjustment} applyColor />
                  </Fragment>
                ))}
              </Grid>
            </>
          )}

          {item.armor && (
            <>
              <CategorySeparator text={t('Armor')} />
              <Grid container spacing={1}>
                <KeyValueEntry label={t('Armor type')} value={item.armor.at} />
                <KeyValueEntry label={t('Slot')} value={t(item.armor.slot)} />
                <KeyValueEntry label={t('Base difficulty')} value={t(item.armor.baseDifficulty)} />
                <KeyValueEntry label={t('Maneuver penalty')} value={item.armor.maneuver} applyColor />
                <KeyValueEntry label={t('Perception penalty')} value={item.armor.perception} applyColor />
                <KeyValueEntry label={t('Ranged penalty')} value={item.armor.rangedPenalty} applyColor />
                <KeyValueEntry label={t('Encumbrance')} value={item.armor.enc} />
              </Grid>
            </>
          )}

          {item.itemTypeId === 'gold-coin' && (
            <Grid size={12}>
              <CharacterViewTransferGold character={character} setCharacter={setCharacter} />
            </Grid>
          )}

          <Grid size={12}>
            <TechnicalInfo>
              <pre>{JSON.stringify(item, null, 2)}</pre>
            </TechnicalInfo>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

const KeyValueEntry: FC<{ label: string; value: string | number | undefined; applyColor?: boolean }> = ({
  label,
  value,
  applyColor = false,
}) => {
  const color =
    applyColor !== true || !value || typeof value !== 'number'
      ? 'primary'
      : value === 0
        ? 'primary'
        : value > 0
          ? 'success.main'
          : 'error.main';

  return (
    <Grid size={3}>
      <Stack direction="column">
        <Typography color={color} variant="body2">
          {value}
        </Typography>
        <Typography color="secondary" variant="caption">
          {label}
        </Typography>
      </Stack>
    </Grid>
  );
};

export default CharacterItemDetail;
