import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import { Box, Stack, Tooltip, Typography } from '@mui/material';
import {
  Character,
  EquipmentSlot,
  ItemConditionChip,
  ItemModifierChips,
  itemImageUrl,
  itemFilter,
  Panel,
  selectableSx,
  StrategicItem,
} from '@labcabrera-rmu/rmu-react-shared-lib';

/** The paper doll: three columns, one row per line; null leaves the cell empty. */
const SLOT_LAYOUT: (EquipmentSlot | null)[][] = [
  [null, 'head', null],
  ['mainHand', 'body', 'offHand'],
  [null, 'arms', null],
  [null, 'legs', null],
];

export function EquipmentSlots({
  character,
  items,
  hoveredId,
  onHover,
  onClick,
}: {
  character: Character;
  items: StrategicItem[];
  hoveredId?: string;
  onHover: (itemId: string | undefined) => void;
  onClick: (slot: EquipmentSlot) => void;
}) {
  const { t } = useTranslation();
  return (
    <Panel variant="outlined" title={t('equipment')}>
      {/* Fixed tracks that shrink on narrow screens, centered in the card */}
      <Box
        sx={{
          mt: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 104px))',
          justifyContent: 'center',
          columnGap: { xs: 1, sm: 2 },
          rowGap: 1.5,
        }}
      >
        {SLOT_LAYOUT.flatMap((row, index) =>
          row.map((slot, column) =>
            slot ? (
              <SlotCard
                key={slot}
                slot={slot}
                itemId={character.equipment.slots[slot]}
                items={items}
                hoveredId={hoveredId}
                onHover={onHover}
                onClick={onClick}
              />
            ) : (
              <Box key={`empty-${index}-${column}`} />
            )
          )
        )}
      </Box>
    </Panel>
  );
}

function SlotCard({
  slot,
  itemId,
  items,
  hoveredId,
  onHover,
  onClick,
}: {
  slot: EquipmentSlot;
  itemId: string | null;
  items: StrategicItem[];
  hoveredId?: string;
  onHover: (itemId: string | undefined) => void;
  onClick: (slot: EquipmentSlot) => void;
}) {
  const { t } = useTranslation();
  const item = items.find((e) => e.id === itemId) || undefined;
  const name = item ? t(item.name, { defaultValue: item.name }) : undefined;
  const modifiers = item?.modifiers || [];
  const highlighted = !!item && hoveredId === item.id;
  const tooltip = item ? (
    <Stack spacing={0.5}>
      <Typography variant="subtitle2">{name}</Typography>
      {modifiers.length > 0 ? (
        modifiers.map((modifier) => (
          <Typography key={modifier.id} variant="body2" component="span">
            {`${t(`item-modifier-type-${modifier.type}`)} ${modifier.value > 0 ? '+' : ''}${modifier.value} · ${t(`item-modifier-target-${modifier.appliesTo}`)}`}
          </Typography>
        ))
      ) : (
        <Typography variant="body2" component="span">
          {t('item-modifiers-none')}
        </Typography>
      )}
    </Stack>
  ) : (
    t('empty-slot')
  );
  return (
    <Stack spacing={0.25} sx={{ alignItems: 'center', minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: '100%' }}>
        {t(slot)}
      </Typography>
      <Tooltip title={tooltip}>
        <Box
          component="button"
          type="button"
          aria-label={name ? `${t(slot)}: ${name}` : `${t(slot)}: ${t('empty-slot')}`}
          onClick={() => onClick(slot)}
          onMouseEnter={() => onHover(item?.id)}
          onMouseLeave={() => onHover(undefined)}
          sx={[
            selectableSx(highlighted),
            {
              p: 0,
              width: '100%',
              maxWidth: 82,
              aspectRatio: '1',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.disabled',
              borderStyle: item ? 'solid' : 'dashed',
              '&:hover, &:focus-visible': { color: 'primary.main' },
            },
          ]}
        >
          {item ? (
            <Box
              component="img"
              src={itemImageUrl(item)}
              alt=""
              sx={{ width: '100%', height: '100%', objectFit: 'cover', filter: itemFilter }}
            />
          ) : (
            <AddIcon />
          )}
        </Box>
      </Tooltip>
      <Typography
        variant="caption"
        noWrap
        sx={{ maxWidth: '100%', fontWeight: 600, minHeight: '1.66em' }}
        color={item ? 'text.primary' : 'text.disabled'}
      >
        {name ?? t('empty-slot')}
      </Typography>
      {item && (
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ alignItems: 'center', justifyContent: 'center', maxWidth: '100%', overflow: 'hidden' }}
        >
          <ItemConditionChip condition={item.condition} />
          {/* Breakage is already in the condition: the slot only adds the other kinds, folded. */}
          <ItemModifierChips modifiers={modifiers.filter((modifier) => modifier.type !== 'breakage')} max={0} />
        </Stack>
      )}
    </Stack>
  );
}
