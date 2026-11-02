import React, { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import AddIcon from '@mui/icons-material/Add';
import { Box, LinearProgress, Stack, Tooltip, Typography } from '@mui/material';
import {
  Character,
  EquipmentSlot,
  fetchCharacter,
  ItemConditionChip,
  ItemModifierChips,
  itemImageUrl,
  itemFilter,
  KeyValueList,
  KeyValueRow,
  LoadingState,
  Panel,
  SectionLabel,
  selectableSx,
  StrategicItem,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import HolderInventory, { holderNames } from '../../../economy/HolderInventory';
import ItemLedgerList from '../../../economy/ItemLedgerList';
import { useHolder } from '../../../economy/use-holder';
import CharacterEquipmentDialog from './CharacterEquipmentDialog';
import CharacterViewTransferGold from './CharacterViewTransferGold';

/** The paper doll: three columns, one row per line; null leaves the cell empty. */
const SLOT_LAYOUT: (EquipmentSlot | null)[][] = [
  [null, 'head', null],
  ['mainHand', 'body', 'offHand'],
  [null, 'arms', null],
  [null, 'legs', null],
];

export default function CharacterEquipmentPanel({
  character,
  setCharacter,
}: {
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
}) {
  const auth = useAuth();
  const notify = useNotify();
  const { t } = useTranslation();
  const { view, refresh } = useHolder('character', character.id);
  const items = view?.items ?? [];
  const [dialogEquipSlot, setDialogEquipSlot] = useState<EquipmentSlot>();
  // The item under the pointer, in a slot or in the inventory: both sides highlight it
  const [hoveredId, setHoveredId] = useState<string>();
  const slots = character.equipment.slots;
  const equippedIds = Object.values(slots).filter((id): id is string => !!id);
  const equippedSlots = Object.fromEntries(
    Object.entries(slots)
      .filter((entry): entry is [string, string] => !!entry[1])
      .map(([slot, id]) => [id, slot])
  );

  /** An operation changes the weight, the gold or the equipment of the character: the API reprocesses it. */
  const onChanged = (updated?: Character) => {
    refresh();
    if (updated) return setCharacter(updated);
    fetchCharacter(character.id, auth)
      .then((response) => setCharacter(response))
      .catch((err) => notify.error(err));
  };

  return (
    <>
      <Box sx={{ mt: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: '380px minmax(0, 1fr)' },
            gap: 2,
            alignItems: 'start',
          }}
        >
          <Stack spacing={2} sx={{ minWidth: 0 }}>
            <EquipmentSlots
              character={character}
              items={items}
              hoveredId={hoveredId}
              onHover={setHoveredId}
              onClick={(slot) => setDialogEquipSlot(slot)}
            />
            <StatsPanel character={character} />
          </Stack>
          <Panel variant="outlined" title={t('inventory')} sx={{ minWidth: 0 }}>
            {view ? (
              <HolderInventory
                view={view}
                onChanged={onChanged}
                equippedIds={equippedIds}
                equippedSlots={equippedSlots}
                highlightedId={hoveredId}
                onHoverItem={setHoveredId}
              />
            ) : (
              <LoadingState />
            )}
          </Panel>
        </Box>
        {dialogEquipSlot && (
          <CharacterEquipmentDialog
            open
            character={character}
            items={items}
            slot={dialogEquipSlot}
            onClose={() => setDialogEquipSlot(undefined)}
            onEquip={(updated) => onChanged(updated)}
          />
        )}
      </Box>
      {view && <CharacterViewTransferGold character={character} view={view} onChanged={onChanged} />}
      {view && (
        <Panel variant="outlined" title={t('history')} sx={{ mt: 2 }}>
          <ItemLedgerList
            rsql={`holderIds==${character.id}`}
            perspective={view.holder}
            names={holderNames(view)}
            refreshKey={view}
          />
        </Panel>
      )}
    </>
  );
}

function EquipmentSlots({
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

function StatsPanel({ character }: { character: Character }) {
  const { t } = useTranslation();
  const eq = character.equipment;
  const over = eq.weight > eq.weightAllowance;
  const loadPercent = eq.weightAllowance > 0 ? Math.min((eq.weight / eq.weightAllowance) * 100, 100) : 100;
  const overload = eq.weight - eq.weightAllowance;

  const getArmorType = (): string => {
    const armor = character.defense.armor;
    if (!armor) return '';
    if (armor.at) return `${armor.at}`;
    return `${armor.headAt} / ${armor.bodyAt} / ${armor.armsAt} / ${armor.legsAt}`;
  };

  return (
    <Panel variant="outlined" title={t('equipment-stats')}>
      <Box>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2">{t('encumbrance')}</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }} color={over ? 'error.main' : 'text.primary'}>
            {`${eq.weight} / ${eq.weightAllowance} ${t('lbs')}`}
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={loadPercent}
          color={over ? 'error' : 'primary'}
          sx={{ mt: 1, height: 8, borderRadius: (theme) => `${theme.radius.pill}px` }}
        />
      </Box>

      <StatGroup
        title={t('weight')}
        rows={[
          ...(overload > 0
            ? [{ label: t('overload'), value: `${overload.toFixed(2)} ${t('lbs')}`, tone: 'danger' as const }]
            : []),
          { label: t('encumbrance-penalty'), value: eq.encumbrancePenalty, tone: 'penalty' },
        ]}
      />

      <StatGroup
        title={t('armor')}
        rows={[
          { label: t('armor-type'), value: getArmorType() },
          { label: t('armor-base-penalty'), value: eq.baseManeuverPenalty, tone: 'penalty' },
          { label: t('maneuver-penalty'), value: eq.maneuverPenalty, tone: 'penalty' },
        ]}
      />

      <StatGroup
        title={t('penalties')}
        rows={[
          { label: t('ranged-penalty'), value: eq.rangedPenalty, tone: 'penalty' },
          { label: t('perception-penalty'), value: eq.perceptionPenalty ?? 0, tone: 'penalty' },
        ]}
      />

      <StatGroup
        title={t('movement')}
        rows={[
          { label: t('max-pace'), value: t(character.movement.maxPace) },
          ...(eq.movementBaseDifficulty
            ? [{ label: t('movement-base-difficulty'), value: t(`difficulty-${eq.movementBaseDifficulty}`) }]
            : []),
        ]}
      />
    </Panel>
  );
}

/** A group of the equipment stats: its title and the label / value rows (penalties red when negative). */
function StatGroup({ title, rows }: { title: string; rows: KeyValueRow[] }) {
  return (
    <Box sx={{ mt: 2 }}>
      <SectionLabel>{title}</SectionLabel>
      <KeyValueList dense rows={rows} />
    </Box>
  );
}
