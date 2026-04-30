import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box, Card, CardContent, Chip, Divider, IconButton, LinearProgress, Stack, Typography } from '@mui/material';
import { Character, fetchStrategicItems, Item, StrategicItem } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../../ErrorContext';
import { imageBaseUrl } from '../../../services/config';
import { itemFilter } from '../../../services/display';

type EquipmentStats = {
  carriedWeight: number;
  weightLimit: number;
  encumbrancePenalty: number;
  armorType: number;
  armorPenalty: number;
  armorBasePenalty: number;
  rangedPenalty: number;
  perceptionPenalty: number;
  maxPace: string;
  movementDifficulty: string;
};

const stats: EquipmentStats = {
  carriedWeight: 51.38,
  weightLimit: 42.55,
  encumbrancePenalty: -4,
  armorType: 10,
  armorPenalty: -88,
  armorBasePenalty: -100,
  rangedPenalty: -30,
  perceptionPenalty: -15,
  maxPace: 'Spring',
  movementDifficulty: 'Sheer folly',
};

export function CharacterEquipmentPanel({
  character,
  setCharacter,
}: {
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
}) {
  const auth = useAuth();
  const { t } = useTranslation();
  const { showError } = useError();
  const [items, setItems] = useState<StrategicItem[]>([]);

  //TODO remove
  const overload = stats.carriedWeight - stats.weightLimit;
  const loadPercent = Math.min((stats.carriedWeight / stats.weightLimit) * 100, 140);

  useEffect(() => {
    if (!character) return;
    fetchStrategicItems(`characterId==${character.id}`, 0, 100, auth)
      .then((response) => setItems(response.content))
      .catch((err) => showError(err.message));
  }, []);

  return (
    <Box
      sx={{
        p: 3,
        color: 'text.primary',
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '360px 1fr 520px',
          },
          gap: 3,
        }}
      >
        <EquipmentSlots character={character} items={items} />
        <StatsPanel character={character} stats={stats} overload={overload} loadPercent={loadPercent} />
        <Stack spacing={2}>
          <ItemList
            title={t('carried')}
            totalWeight={51.38}
            items={items.filter((e) => e.carried)}
            showQuantity={false}
          />
          <ItemList title={t('owned')} totalWeight={154.35} items={items.filter((e) => !e.carried)} showQuantity />
        </Stack>
      </Box>
    </Box>
  );
}

function EquipmentSlots({ character, items }: { character: Character; items: StrategicItem[] }) {
  const { t } = useTranslation();
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          {t('equipment')}
        </Typography>

        <Box
          sx={{
            mt: 3,
            display: 'grid',
            gridTemplateColumns: '1fr 120px 1fr',
            gridTemplateRows: 'repeat(4, 110px)',
            gap: 2,
            alignItems: 'center',
            justifyItems: 'center',
          }}
        >
          <SlotCard label={t('mainHand')} itemId={character.equipment.slots['mainHand']} items={items} />
          <SlotCard label={t('head')} itemId={character.equipment.slots['head']} items={items} />
          <SlotCard label={t('offHand')} itemId={character.equipment.slots['offHand']} items={items} />
          <Box />
          <SlotCard label={t('body')} itemId={character.equipment.slots['body']} items={items} />
          <Box />
          <Box />
          <SlotCard label={t('arms')} itemId={character.equipment.slots['arms']} items={items} />
          <Box />
          <Box />
          <SlotCard label={t('legs')} itemId={character.equipment.slots['legs']} items={items} />
          <Box />
        </Box>

        {/* <Divider sx={{ my: 3 }} /> */}

        {/* <Typography variant="overline" color="text.secondary">
          Accesos rápidos
        </Typography> */}

        {/* <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
          {[equipped.leftHand, equipped.rightHand, carriedItems[2], undefined, undefined, undefined].map(
            (item, index) => (
              <QuickSlot key={index} index={index + 1} item={item} />
            )
          )}
        </Stack> */}
      </CardContent>
    </Card>
  );
}

function SlotCard({ label, itemId, items }: { label: string; itemId: string | null; items: StrategicItem[] }) {
  const item = items.find((e) => e.id === itemId) || undefined;
  return (
    <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>

      <Box
        sx={{
          width: 82,
          height: 82,
          border: 1,
          borderColor: item ? 'primary.main' : 'divider',
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {item ? (
          <Box
            component="img"
            src={`${imageBaseUrl}images/items/${item.itemTypeId}.png`}
            alt={item.name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: itemFilter,
            }}
          />
        ) : (
          <AddIcon color="disabled" />
        )}
      </Box>
    </Stack>
  );
}

function QuickSlot({ index, item }: { index: number; item?: Item }) {
  return (
    <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
      <Box
        sx={{
          width: 54,
          height: 54,
          border: 1,
          borderColor: item ? 'primary.main' : 'divider',
          borderRadius: 2,
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {item ? (
          <Box
            component="img"
            src={`${imageBaseUrl}images/items/${item.id}.png`}
            alt={item.id}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <AddIcon fontSize="small" color="disabled" />
        )}
      </Box>

      <Typography variant="caption">{index}</Typography>
    </Stack>
  );
}

function StatsPanel({
  character,
  stats,
  overload,
  loadPercent,
}: {
  character: Character;
  stats: EquipmentStats;
  overload: number;
  loadPercent: number;
}) {
  const { t } = useTranslation();
  const eq = character.equipment;

  const getArmorType = (): string => {
    const armor = character.defense.armor;
    if (!armor) return '';
    if (armor.at) return `${armor.at}`;
    return `${armor.headAt} / ${armor.bodyAt} / ${armor.armsAt} / ${armor.legsAt}`;
  };

  return (
    <Stack spacing={2}>
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary">
            Estadísticas del equipo
          </Typography>

          <Stack spacing={1.25} sx={{ mt: 2 }}>
            <StatRow label={t('carried-weight')} value={`${eq.weight} lbs`} danger={eq.weight > eq.weightAllowance} />
            <StatRow label={t('weight-allowance')} value={`${eq.weightAllowance} lbs`} />
            <StatRow
              label={t('encumbrance-penalty')}
              value={eq.encumbrancePenalty}
              danger={eq.encumbrancePenalty < 0}
            />
            <StatRow label={t('armor-type')} value={getArmorType()} />
            <StatRow label={t('maneuver-penalty')} value={eq.maneuverPenalty} danger={eq.maneuverPenalty < 0} />
            <StatRow label={t('base-armor-penalty')} value={stats.armorBasePenalty} danger />
            <StatRow label={t('ranged-penalty')} value={eq.rangedPenalty} danger />
            <StatRow label={t('perception-penalty')} value={eq.perceptionPenalty!} danger />
            <StatRow label={t('max-pace')} value={character.movement.maxPace} />
            <StatRow label="Dificultad de movimiento" value={eq.movementBaseDifficulty!} />
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary">
            Resumen de carga
          </Typography>

          <Stack spacing={2} sx={{ mt: 2 }}>
            <Box>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2">Carga</Typography>
                <Typography variant="body2" color="error.main">
                  {stats.carriedWeight} / {stats.weightLimit} lbs
                </Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={Math.min(loadPercent, 100)}
                color={loadPercent > 100 ? 'error' : 'primary'}
                sx={{ mt: 1, height: 8, borderRadius: 99 }}
              />
            </Box>

            <StatRow label="Exceso de peso" value={`${overload.toFixed(2)} lbs`} danger />
            <StatRow label="Penalización total" value={stats.encumbrancePenalty} danger />
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

function ItemList({
  title,
  totalWeight,
  items,
  showQuantity,
}: {
  title: string;
  totalWeight: number;
  items: StrategicItem[];
  showQuantity?: boolean;
}) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 0 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ textTransform: 'uppercase' }}>
            {title}
          </Typography>

          <Chip size="small" label={`${totalWeight} lbs`} />
        </Stack>

        <Divider />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: showQuantity ? '56px 1fr 90px 100px 40px' : '56px 1fr 100px 40px',
            px: 2,
            py: 1,
            color: 'text.secondary',
          }}
        >
          <Box />
          <Typography variant="caption">Nombre</Typography>
          {showQuantity && <Typography variant="caption">Cantidad</Typography>}
          <Typography variant="caption" sx={{ textAlign: 'right' }}>
            Peso
          </Typography>
          <Box />
        </Box>

        <Divider />

        <Stack>
          {items.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: showQuantity ? '56px 1fr 90px 100px 40px' : '56px 1fr 100px 40px',
                alignItems: 'center',
                px: 2,
                py: 1,
                borderBottom: 1,
                borderColor: 'divider',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Box
                component="img"
                src={`${imageBaseUrl}images/items/${item.itemTypeId}.png`}
                alt={item.id}
                sx={{
                  width: 50,
                  height: 50,
                  objectFit: 'cover',
                  filter: itemFilter,
                }}
              />

              <Box>
                <Typography variant="body2">{item.name}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  {item.name}
                </Typography>
              </Box>

              {showQuantity && <Typography variant="body2">{item.amount ?? 1}</Typography>}

              <Typography variant="body2" sx={{ textAlign: 'right' }}>
                {item.info.weight} lbs
              </Typography>

              <IconButton size="small">
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
