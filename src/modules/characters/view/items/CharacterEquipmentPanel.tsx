import React, { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Box, Card, CardContent, LinearProgress, Stack, Tooltip, Typography } from '@mui/material';
import {
  Character,
  EquipmentSlot,
  fetchCharacter,
  ItemConditionChip,
  ItemModifierChips,
  imageBaseUrl,
  itemImageUrl,
  itemFilter,
  LoadingState,
  StrategicItem,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import HolderInventory, { holderNames } from '../../../economy/HolderInventory';
import ItemLedgerList from '../../../economy/ItemLedgerList';
import { useHolder } from '../../../economy/use-holder';
import CharacterEquipmentDialog from './CharacterEquipmentDialog';
import CharacterViewTransferGold from './CharacterViewTransferGold';

const borderRadius = 1;

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
  const equippedIds = Object.values(character.equipment.slots).filter((id): id is string => !!id);

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
            gridTemplateColumns: {
              xs: '1fr',
              lg: '360px 1fr 520px',
            },
            gap: 1,
          }}
        >
          <EquipmentSlots character={character} items={items} onClick={(slot) => setDialogEquipSlot(slot)} />
          <StatsPanel character={character} />
          <Card variant="outlined" sx={{ borderRadius: borderRadius }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                {t('inventory')}
              </Typography>
              {view ? (
                <HolderInventory view={view} onChanged={onChanged} equippedIds={equippedIds} />
              ) : (
                <LoadingState />
              )}
            </CardContent>
          </Card>
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
        <Card variant="outlined" sx={{ borderRadius: borderRadius, mt: 2 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              {t('history')}
            </Typography>
            <ItemLedgerList
              rsql={`holderIds==${character.id}`}
              perspective={view.holder}
              names={holderNames(view)}
              refreshKey={view}
            />
          </CardContent>
        </Card>
      )}
    </>
  );
}

function EquipmentSlots({
  character,
  items,
  onClick,
}: {
  character: Character;
  items: StrategicItem[];
  onClick: (slot: EquipmentSlot) => void;
}) {
  const { t } = useTranslation();
  return (
    <Card variant="outlined" sx={{ borderRadius: borderRadius }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          {t('equipment')}
        </Typography>

        <Box
          sx={{
            mt: 1,
            display: 'grid',
            gridTemplateColumns: '1fr 120px 1fr',
            gridTemplateRows: 'repeat(4, 110px)',
            gap: 1,
            alignItems: 'start',
            justifyItems: 'center',
          }}
        >
          <Box />
          <SlotCard slot="head" itemId={character.equipment.slots['head']} items={items} onClick={onClick} />
          <Box />
          <SlotCard slot="mainHand" itemId={character.equipment.slots['mainHand']} items={items} onClick={onClick} />
          <SlotCard slot="body" itemId={character.equipment.slots['body']} items={items} onClick={onClick} />
          <SlotCard slot="offHand" itemId={character.equipment.slots['offHand']} items={items} onClick={onClick} />
          <Box />
          <SlotCard slot="arms" itemId={character.equipment.slots['arms']} items={items} onClick={onClick} />
          <Box />
          <Box />
          <SlotCard slot="legs" itemId={character.equipment.slots['legs']} items={items} onClick={onClick} />
          <Box />
        </Box>
      </CardContent>
    </Card>
  );
}

function SlotCard({
  slot,
  itemId,
  items,
  onClick,
}: {
  slot: EquipmentSlot;
  itemId: string | null;
  items: StrategicItem[];
  onClick: (slot: EquipmentSlot) => void;
}) {
  const { t } = useTranslation();
  const item = items.find((e) => e.id === itemId) || undefined;
  const image = item ? itemImageUrl(item) : `${imageBaseUrl}images/items/no-item.png`;
  const modifiers = item?.modifiers || [];
  const tooltip = item ? (
    <Stack spacing={0.5}>
      <Typography variant="subtitle2">{item.name}</Typography>
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
    // Fixed size: the image always sits at the same height of its row, with or without badges below.
    <Stack spacing={0.5} sx={{ alignItems: 'center', width: 110, height: 110 }}>
      <Tooltip title={tooltip}>
        <Box
          onClick={() => onClick(slot)}
          sx={{
            width: 82,
            height: 82,
            flexShrink: 0,
            cursor: 'pointer',
            border: 0.5,
            borderColor: item ? 'primary.main' : 'divider',
            borderRadius: 0.5,
            overflow: 'hidden',
            bgcolor: 'action.hover',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            component="img"
            src={image}
            alt={item ? item.name : t('empty-slot')}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: itemFilter,
            }}
          />
        </Box>
      </Tooltip>
      <Stack
        direction="row"
        spacing={0.5}
        sx={{ alignItems: 'center', justifyContent: 'center', height: 24, maxWidth: '100%', overflow: 'hidden' }}
      >
        {item && <ItemConditionChip condition={item.condition} />}
        {/* Breakage is already in the condition: the slot only adds the other kinds, folded. */}
        {item && <ItemModifierChips modifiers={modifiers.filter((modifier) => modifier.type !== 'breakage')} max={0} />}
      </Stack>
    </Stack>
  );
}

function StatsPanel({ character }: { character: Character }) {
  const { t } = useTranslation();
  const eq = character.equipment;
  const loadPercent = Math.min((eq.weight / eq.weightAllowance) * 100, 100);
  const overload = eq.weight - eq.weightAllowance;

  const getArmorType = (): string => {
    const armor = character.defense.armor;
    if (!armor) return '';
    if (armor.at) return `${armor.at}`;
    return `${armor.headAt} / ${armor.bodyAt} / ${armor.armsAt} / ${armor.legsAt}`;
  };

  return (
    <Stack spacing={2}>
      <Card variant="outlined" sx={{ borderRadius: borderRadius }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary">
            {t('equipment-stats')}
          </Typography>

          <Stack spacing={1.25} sx={{ mt: 2 }}>
            <StatRow
              label={t('carried-weight')}
              value={`${eq.weight} ${t('lbs')}`}
              danger={eq.weight > eq.weightAllowance}
            />
            <StatRow label={t('weight-allowance')} value={`${eq.weightAllowance} ${t('lbs')}`} />
            <StatRow
              label={t('encumbrance-penalty')}
              value={eq.encumbrancePenalty}
              danger={eq.encumbrancePenalty < 0}
            />
            <StatRow label={t('armor-type')} value={getArmorType()} />
            <StatRow label={t('maneuver-penalty')} value={eq.maneuverPenalty} danger={eq.maneuverPenalty < 0} />
            <StatRow
              label={t('armor-base-penalty')}
              value={eq.baseManeuverPenalty}
              danger={eq.baseManeuverPenalty < 0}
            />
            <StatRow label={t('ranged-penalty')} value={eq.rangedPenalty} danger={eq.rangedPenalty < 0} />
            <StatRow label={t('perception-penalty')} value={eq.perceptionPenalty!} danger={eq.perceptionPenalty! < 0} />
            <StatRow label={t('max-pace')} value={t(character.movement.maxPace)} />
            <StatRow label={t('movement-base-difficulty')} value={t(`difficulty-${eq.movementBaseDifficulty!}`)} />
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: borderRadius }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary">
            {t('weight')}
          </Typography>

          <Stack spacing={2} sx={{ mt: 2 }}>
            <Box>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2">{t('encumbrance')}</Typography>
                <Typography variant="body2" color="error.main">
                  {`${eq.weight} / ${eq.weightAllowance} ${t('lbs')}`}
                </Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={loadPercent}
                color={eq.weight > eq.weightAllowance ? 'error' : 'primary'}
                sx={{ mt: 1, height: 8, borderRadius: 99 }}
              />
            </Box>
            {overload > 0 && <StatRow label={t('overload')} value={`${overload.toFixed(2)} ${t('lbs')}`} danger />}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

function StatRow({
  label,
  value,
  danger,
  success,
}: {
  label: string;
  value: string | number;
  danger?: boolean;
  success?: boolean;
}) {
  return (
    <Stack
      direction="row"
      sx={{
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 0.75,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: danger ? 'error.main' : success ? 'success.main' : 'text.primary',
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
