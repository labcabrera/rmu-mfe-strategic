import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Box, Card, CardActionArea, Chip, Stack, Typography } from '@mui/material';
import {
  Character,
  equipItem,
  EquipmentSlot,
  imageBaseUrl,
  ItemConditionChip,
  itemFilter,
  ItemModifierChips,
  ItemThumb,
  RmuDialog,
  StrategicItem,
  unequipItem,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';

const isOneHandedWeapon = (item: StrategicItem) => !!item.weapon?.modes.some((mode) => mode.type === 'one-hand');

/** Items of the character that fit a slot. */
const slotOptions = (items: StrategicItem[], slot: EquipmentSlot): StrategicItem[] => {
  if (slot === 'mainHand') return items.filter((e) => e.category === 'weapon');
  if (slot === 'offHand')
    return items.filter((e) => e.category === 'shield' || (e.category === 'weapon' && isOneHandedWeapon(e)));
  return items.filter((e) => e.armor?.slot === slot);
};

/** Key numbers of an item for a slot: AT and penalties of armor, DB of a shield, fumble of a weapon. */
const statsOf = (item: StrategicItem): { key: string; value: number }[] => [
  ...(item.armor
    ? [
        { key: 'at', value: item.armor.at },
        { key: 'maneuver-penalty', value: item.armor.maneuverPenalty },
        { key: 'ranged-penalty', value: item.armor.rangedPenalty },
      ]
    : []),
  ...(item.shield ? [{ key: 'db', value: item.shield.db }] : []),
  ...(item.weapon ? [{ key: 'fumble', value: item.weapon.fumble }] : []),
  ...(item.info?.weight !== null && item.info?.weight !== undefined
    ? [{ key: 'weight', value: item.info.weight }]
    : []),
];

/** Stats where a lower value is better. */
const LOWER_IS_BETTER = ['fumble', 'weight'];

const ItemOption: FC<{
  item: StrategicItem;
  equipped?: StrategicItem;
  selected: boolean;
  onClick: () => void;
}> = ({ item, equipped, selected, onClick }) => {
  const { t } = useTranslation();
  const broken = !!item.condition?.broken || !!item.condition?.unrepairable;
  const base = equipped && equipped.id !== item.id ? statsOf(equipped) : [];
  return (
    <Card variant="outlined" sx={{ borderColor: selected ? 'success.main' : undefined, opacity: broken ? 0.6 : 1 }}>
      <CardActionArea onClick={onClick} disabled={broken} sx={{ p: 1.5 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <ItemThumb item={item} size={64} disabled={broken} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }} useFlexGap>
              <Typography sx={{ fontWeight: 600 }}>{item.name}</Typography>
              {selected && <Chip size="small" color="success" label={t('equipped')} />}
              <ItemConditionChip condition={item.condition} />
            </Stack>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }} useFlexGap>
              {statsOf(item).map((stat) => {
                const other = base.find((b) => b.key === stat.key);
                const diff = other ? stat.value - other.value : 0;
                const better = LOWER_IS_BETTER.includes(stat.key) ? diff < 0 : diff > 0;
                return (
                  <Typography key={stat.key} variant="caption" color="text.secondary">
                    {`${t(stat.key)} ${stat.value}`}
                    {diff !== 0 && (
                      <Box component="span" sx={{ ml: 0.5, color: better ? 'success.main' : 'error.main' }}>
                        {`(${diff > 0 ? '+' : ''}${Math.round(diff * 100) / 100})`}
                      </Box>
                    )}
                  </Typography>
                );
              })}
            </Stack>
            {(item.modifiers ?? []).some((m) => m.type !== 'breakage') && (
              <Box sx={{ mt: 0.5 }}>
                <ItemModifierChips modifiers={(item.modifiers ?? []).filter((m) => m.type !== 'breakage')} max={3} />
              </Box>
            )}
          </Box>
        </Stack>
      </CardActionArea>
    </Card>
  );
};

/** Chooses the item of an equipment slot, with its stats against the equipped one. Broken items cannot be equipped. */
export default function CharacterEquipmentDialog({
  open,
  character,
  items,
  slot,
  onClose,
  onEquip,
}: {
  open: boolean;
  character: Character;
  items: StrategicItem[];
  slot: EquipmentSlot;
  onClose: () => void;
  onEquip: (character: Character) => void;
}) {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useNotify();
  const slotItemId = character.equipment.slots[slot];
  const options = useMemo(() => slotOptions(items, slot), [items, slot]);
  const equipped = items.find((item) => item.id === slotItemId);

  const handleEquip = (item: StrategicItem | null) => {
    const request = item
      ? equipItem(character.id, slot, item.id, auth)
      : slotItemId
        ? unequipItem(character.id, slotItemId, auth)
        : undefined;
    if (!request) return onClose();
    request
      .then((data) => {
        onEquip(data);
        onClose();
      })
      .catch((err) => notify.error(err));
  };

  return (
    <RmuDialog open={open} maxWidth="sm" title={t(slot)} onCancel={onClose}>
      <Stack spacing={1} sx={{ pt: 1 }}>
        <Card variant="outlined" sx={{ borderColor: slotItemId ? undefined : 'success.main' }}>
          <CardActionArea onClick={() => handleEquip(null)} sx={{ p: 1.5 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Box
                component="img"
                src={`${imageBaseUrl}images/items/no-item.png`}
                alt=""
                sx={{ width: 64, height: 64, objectFit: 'cover', filter: itemFilter }}
              />
              <Typography>{t('empty-slot')}</Typography>
            </Stack>
          </CardActionArea>
        </Card>
        {options.map((item) => (
          <ItemOption
            key={item.id}
            item={item}
            equipped={equipped}
            selected={item.id === slotItemId}
            onClick={() => handleEquip(item)}
          />
        ))}
        {options.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            {t('equip-no-options')}
          </Typography>
        )}
      </Stack>
    </RmuDialog>
  );
}
