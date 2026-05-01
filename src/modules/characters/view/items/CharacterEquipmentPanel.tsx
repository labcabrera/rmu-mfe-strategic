import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import AddIcon from '@mui/icons-material/Add';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import {
  Character,
  deleteStrategicItem,
  EquipmentSlot,
  fetchCharacter,
  fetchStrategicItems,
  StrategicItem,
  updateCarriedStatus,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../../ErrorContext';
import { imageBaseUrl } from '../../../services/config';
import { itemFilter } from '../../../services/display';
import CharacterEquipmentDialog from './CharacterEquipmentDialog';

export function CharacterEquipmentPanel({
  character,
  setCharacter,
}: {
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
}) {
  const auth = useAuth();
  const { showError } = useError();
  const [items, setItems] = useState<StrategicItem[]>([]);
  const [dialogEquipSlot, setDialogEquipSlot] = useState<EquipmentSlot>();
  const [dialogEquipOpen, setDialogEquipOpen] = useState<boolean>(false);

  const openDialog = (slot: EquipmentSlot) => {
    setDialogEquipSlot(slot);
    setDialogEquipOpen(true);
  };

  const bindItems = (characterId: string) => {
    fetchStrategicItems(`characterId==${characterId}`, 0, 100, auth)
      .then((response) => setItems(response.content))
      .catch((err) => showError(err.message));
  };

  const bindCharacter = () => {
    fetchCharacter(character.id, auth)
      .then((response) => {
        setCharacter(response);
        bindItems(response.id);
      })
      .catch((err) => showError(err.message));
  };

  const onItemDeleted = (itemId: string) => {
    deleteStrategicItem(itemId, auth)
      .then(() => bindCharacter())
      .catch((err) => showError(err.message));
  };

  useEffect(() => {
    if (!character) return;
    bindItems(character.id);
  }, [character]);

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
        <EquipmentSlots character={character} items={items} onClick={(e) => openDialog(e)} />
        <StatsPanel character={character} />
        <Stack spacing={2}>
          <ItemList
            character={character}
            carried={true}
            totalWeight={51.38}
            items={items.filter((e) => e.carried)}
            setCharacter={setCharacter}
            onItemDeleted={(e) => onItemDeleted(e)}
          />
          <ItemList
            character={character}
            carried={false}
            totalWeight={154.35}
            items={items.filter((e) => !e.carried)}
            setCharacter={setCharacter}
            onItemDeleted={(e) => onItemDeleted(e)}
          />
        </Stack>
      </Box>
      {dialogEquipSlot && (
        <CharacterEquipmentDialog
          open={dialogEquipOpen}
          character={character}
          items={items}
          slot={dialogEquipSlot}
          onClose={() => setDialogEquipOpen(false)}
          onEquip={(character) => setCharacter(character)}
        />
      )}
    </Box>
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
          <SlotCard slot="mainHand" itemId={character.equipment.slots['mainHand']} items={items} onClick={onClick} />
          <SlotCard slot="head" itemId={character.equipment.slots['head']} items={items} onClick={onClick} />
          <SlotCard slot="offHand" itemId={character.equipment.slots['offHand']} items={items} onClick={onClick} />
          <Box />
          <SlotCard slot="body" itemId={character.equipment.slots['body']} items={items} onClick={onClick} />
          <Box />
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
  const image = item ? `${imageBaseUrl}images/items/${item.itemTypeId}.png` : `${imageBaseUrl}images/items/no-item.png`;
  return (
    <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
      <Typography variant="caption" color="text.secondary">
        {t(slot)}
      </Typography>

      <Box
        sx={{
          width: 82,
          height: 82,
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
          alt={item ? item.name : 'empty'}
          onClick={() => onClick(slot)}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: itemFilter,
          }}
        />
      </Box>
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
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary">
            {t('equipment-stats')}
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
            <StatRow label={t('armor-base-penalty')} value={eq.baseManeuverPenalty} danger />
            <StatRow label={t('ranged-penalty')} value={eq.rangedPenalty} danger />
            <StatRow label={t('perception-penalty')} value={eq.perceptionPenalty!} danger />
            <StatRow label={t('max-pace')} value={t(character.movement.maxPace)} />
            <StatRow label={t('movement-base-difficulty')} value={t(`difficulty-${eq.movementBaseDifficulty!}`)} />
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary">
            Resumen de carga {loadPercent}%
          </Typography>

          <Stack spacing={2} sx={{ mt: 2 }}>
            <Box>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2">Carga</Typography>
                <Typography variant="body2" color="error.main">
                  {eq.weight} / {eq.weightAllowance} lbs
                </Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={loadPercent}
                color={eq.weight > eq.weightAllowance ? 'error' : 'primary'}
                sx={{ mt: 1, height: 8, borderRadius: 99 }}
              />
            </Box>
            {overload > 0 && <StatRow label="Overload" value={`${overload.toFixed(2)} lbs`} danger />}
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
  character,
  carried,
  totalWeight,
  items,
  setCharacter,
  onItemDeleted,
}: {
  character: Character;
  carried: boolean;
  totalWeight: number;
  items: StrategicItem[];
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  onItemDeleted: (itemId: string) => void;
}) {
  const auth = useAuth();
  const { t } = useTranslation();
  const { showError } = useError();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuItemId, setMenuItemId] = useState<string | null>(null);

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>, itemId: string) => {
    setAnchorEl(e.currentTarget);
    setMenuItemId(itemId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuItemId(null);
  };

  const handleToggleCarried = (itemId: string) => {
    updateCarriedStatus(character.id, itemId, !carried, auth)
      .then((response) => {
        setCharacter(response);
        handleCloseMenu();
      })
      .catch((err) => showError(err.message));
  };

  if (items.length < 1) return;

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 0 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ textTransform: 'uppercase' }}>
            {t(carried ? 'carried' : 'stored')}
          </Typography>
          {carried && <Chip size="small" label={`${character.equipment.weight} lbs`} />}
        </Stack>

        <Divider />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '56px 1fr 90px 100px 40px',
            px: 2,
            py: 1,
            color: 'text.secondary',
          }}
        >
          <Box />
          <Typography variant="caption">{t('name')}</Typography>
          <Typography variant="caption">{t('quantity')}</Typography>
          <Typography variant="caption" sx={{ textAlign: 'right' }}>
            {t('weight')}
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
                gridTemplateColumns: '56px 1fr 90px 100px 40px',
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
              <Typography variant="body2">{item.amount ?? 1}</Typography>
              <Typography variant="body2" sx={{ textAlign: 'right' }}>
                {item.info.weight} lbs
              </Typography>

              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenMenu(e, item.id);
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl) && menuItemId === item.id} onClose={handleCloseMenu}>
                <MenuItem onClick={() => onItemDeleted(item.id)}>
                  <ListItemIcon>
                    <DeleteIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>{t('Delete')}</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleToggleCarried(item.id)}>
                  <ListItemIcon>{carried ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}</ListItemIcon>
                  <ListItemText>{t(carried ? 'Store' : 'Equip')}</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
