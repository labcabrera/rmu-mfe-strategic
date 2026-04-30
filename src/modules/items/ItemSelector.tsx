import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ShieldIcon from '@mui/icons-material/Shield';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { fetchItems, Item } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../ErrorContext';
import { imageBaseUrl } from '../services/config';
import { itemFilter } from '../services/display';

const categories = [
  { id: 'weapon', label: 'Armas', icon: <FitnessCenterIcon /> },
  { id: 'armor', label: 'Armaduras', icon: <ShieldIcon /> },
  { id: 'shield', label: 'Herramientas', icon: <BuildIcon /> },
  { id: 'clothes', label: 'Consumibles', icon: <Inventory2Icon /> },
  { id: 'ammunition', label: 'Consumibles', icon: <Inventory2Icon /> },
  { id: 'tools', label: 'Consumibles', icon: <Inventory2Icon /> },
  { id: 'food', label: 'Consumibles', icon: <Inventory2Icon /> },
] as const;
export const armorSubcategories = ['head', 'body', 'arms', 'legs'];
export const armorTypes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
export const weaponSubcategories = [
  'melee-weapon@blade',
  'melee-weapon@greater-blade',
  'melee-weapon@chain',
  'melee-weapon@hafted',
  'melee-weapon@greater-hafted',
  'melee-weapon@pole-arm',
  'melee-weapon@exotic',
  'ranged-weapon@bow',
  'ranged-weapon@crossbow',
];

export function ItemSelector() {
  const auth = useAuth();
  const { t } = useTranslation();
  const { showError } = useError();
  const [category, setCategory] = useState<string>('weapon');
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [subcategory, setSubcategory] = useState<string>();
  const [armorType, setArmorType] = useState<string>();
  const [items, setItems] = useState<Item[]>([]);
  const [item, setItem] = useState<Item>();

  const bindItems = () => {
    let rsql = `category==${category}`;
    if (category === 'weapon' && subcategory) {
      rsql += `;weapon.skillId==${subcategory}`;
    }
    if (category === 'armor' && subcategory) {
      rsql += `;armor.slot==${subcategory}`;
    }
    if (category === 'armor' && armorType) {
      rsql += `;armor.at==${armorType}`;
    }
    fetchItems(rsql, 0, 100, auth)
      .then((response) => setItems(response.content))
      .catch((err) => showError(err.menssage));
  };

  const toggleSubcategory = (option: string) => {
    setSubcategory(subcategory === option ? undefined : option);
  };

  const toggleArmorType = (option: string) => {
    setArmorType(armorType === option ? undefined : option);
  };

  useEffect(() => {
    bindItems();
  }, [subcategory, armorType]);

  useEffect(() => {
    setSubcategory(undefined);
    if (!category) {
      setSubcategories([]);
      setArmorType(undefined);
      return;
    } else if (category === 'weapon') {
      setSubcategories(weaponSubcategories);
      setArmorType(undefined);
    } else if (category === 'armor') {
      setSubcategories(armorSubcategories);
    }
    bindItems();
  }, [category]);

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        color: 'text.primary',
        height: '100%',
        width: '100%',
        minHeight: 640,
        display: 'grid',
        gap: 2,
        gridTemplateColumns: {
          xs: '1fr',
          md: '260px minmax(0, 1fr) 340px',
        },
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          borderRight: { md: 1 },
          borderColor: 'divider',
          p: 2,
          display: { xs: 'none', md: 'block' },
        }}
      >
        <Typography variant="overline" color="text.secondary">
          {t('categories')}
        </Typography>

        <Stack spacing={1} sx={{ mt: 1 }}>
          {categories.map((e, index) => {
            const active = e.id === category;
            return (
              <Button
                key={index}
                startIcon={e.icon}
                fullWidth
                variant={active ? 'contained' : 'outlined'}
                color={active ? 'primary' : 'inherit'}
                sx={{
                  justifyContent: 'flex-start',
                  borderRadius: 2,
                }}
                onClick={() => setCategory(e.id)}
              >
                {t(e.id)}
              </Button>
            );
          })}
        </Stack>
        <SubcategorySelector
          title="subcategory"
          options={subcategories}
          selectedOption={subcategory}
          onClick={(e) => toggleSubcategory(e)}
        />
        {category === 'armor' && (
          <>
            <SubcategorySelector
              title="armor-type"
              options={armorTypes}
              selectedOption={armorType}
              onClick={(e) => toggleArmorType(e)}
            />
          </>
        )}
        {/* <Divider sx={{ my: 3 }} />
        <Typography variant="overline" color="text.secondary">
          Filtros
        </Typography>
        <Stack>
          <FormControlLabel control={<Checkbox size="small" defaultChecked />} label="Solo disponibles" />
          <FormControlLabel control={<Checkbox size="small" defaultChecked />} label="Solo comprables" />
          <FormControlLabel control={<Checkbox size="small" />} label="Compatible" />
          <FormControlLabel control={<Checkbox size="small" />} label="Ya equipado" />
        </Stack> */}
      </Box>

      {/* Main content */}
      <Box sx={{ p: 2, overflow: 'auto', minWidth: 0, width: '100%' }}>
        <Grid container spacing={2}>
          {items.map((e, index) => {
            const selected = e.id === item?.id;
            return (
              <Grid key={index} size={{ xs: 6, sm: 4, lg: 3 }}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    position: 'relative',
                    borderRadius: 0.5,
                    overflow: 'hidden',
                    borderColor: selected ? 'primary.main' : 'divider',
                    boxShadow: selected ? 4 : 0,
                    opacity: e.id !== 'test' ? 1 : 0.45,
                  }}
                >
                  <CardActionArea disabled={false} onClick={() => setItem(e)}>
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        image={`${imageBaseUrl}images/items/${e.id}.png`}
                        alt={e.id}
                        sx={{
                          aspectRatio: '1 / 1',
                          objectFit: 'cover',
                          bgcolor: 'action.hover',
                          filter: itemFilter,
                        }}
                      />

                      {selected && (
                        <CheckCircleIcon
                          color="primary"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'background.paper',
                            borderRadius: '50%',
                          }}
                        />
                      )}
                    </Box>

                    <CardContent sx={{ p: 1.5 }}>
                      <Typography variant="subtitle2" noWrap>
                        {e.id}
                      </Typography>

                      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                        <Typography variant="caption">🪙 {e.info.cost.average}</Typography>
                        <Typography variant="caption">⚖ {e.info.weight}</Typography>
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Detail panel */}
      <Box
        sx={{
          borderLeft: { md: 1 },
          borderTop: { xs: 1, md: 0 },
          borderColor: 'divider',
          p: 2,
          bgcolor: 'background.paper',
        }}
      >
        {item && <ItemResume item={item} />}
      </Box>
    </Box>
  );
}

function SubcategorySelector({
  title,
  options,
  selectedOption,
  onClick,
}: {
  title: string;
  options: string[];
  selectedOption: string | undefined;
  onClick: (option: string) => void;
}) {
  const { t } = useTranslation();
  if (!options || options.length < 1) return;
  return (
    <>
      <Divider sx={{ my: 3 }} />
      <Typography variant="overline" color="text.secondary">
        {t(title)}
      </Typography>
      <Stack spacing={1} sx={{ mt: 1 }}>
        {options.map((e, index) => {
          const active = e === selectedOption;
          return (
            <Button
              key={index}
              fullWidth
              variant={active ? 'contained' : 'text'}
              color={active ? 'primary' : 'inherit'}
              sx={{
                justifyContent: 'space-between',
                borderRadius: 2,
              }}
              onClick={() => onClick(e)}
            >
              <span>{t(e.includes('@') ? e.split('@')[1] : e)}</span>
            </Button>
          );
        })}
      </Stack>
    </>
  );
}

function ItemResume({ item }: { item: Item }) {
  const { t } = useTranslation();
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2}>
        <Box
          component="img"
          src={`${imageBaseUrl}images/items/${item?.id}.png`}
          alt={item?.id}
          sx={{
            width: 96,
            height: 96,
            borderRadius: 0,
            objectFit: 'cover',
            border: 1,
            borderColor: 'divider',
            filter: itemFilter,
          }}
        />

        <Box>
          <Typography variant="h6">{item?.id}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t(item.category)}
          </Typography>
          <Chip size="small" label="Común" color="success" sx={{ mt: 1 }} />
        </Box>
      </Stack>

      <Typography variant="body2" color="text.secondary">
        {item.description}
      </Typography>

      <Divider />

      <Stack direction="row" spacing={4}>
        <Typography>🪙 {item?.info.cost.average}</Typography>
        <Typography>⚖ {item?.info.weight}</Typography>
      </Stack>

      <Divider />

      <Box>
        <Typography variant="overline" color="text.secondary">
          Estadísticas
        </Typography>
        {item && item.weapon && (
          <>
            <StatRow label="Skill" value={t(item.weapon.skillId.split('@')[1])} />
            <StatRow label="Fumble" value={item.weapon.fumble} />
            {item.weapon.modes.map((mode, index) => {
              <>
                <StatRow key={index} label="Size adj" value={mode.attackTypes.join(', ')} />;
                <StatRow key={index} label="Modes" value={mode.attackTable} />;
                <StatRow key={index} label="Size adj" value={mode.fumbleTable} />;
                <StatRow key={index} label="Size adj" value={mode.sizeAdjustment} />;
              </>;
            })}
          </>
        )}
        {item && item.armor && (
          <>
            <StatRow label={t('at')} value={item.armor.at} />
            <StatRow label={t('enc')} value={`${item.armor.enc}%`} negative={item.armor.enc > 0} />
            <StatRow label={t('penalty')} value={item.armor.maneuver} negative={item.armor.maneuver < 0} />
            <StatRow label="Perception penalty" value={item.armor.perception} negative={item.armor.perception < 0} />
            <StatRow label="Ranged penalty" value={item.armor.rangedPenalty} negative={item.armor.rangedPenalty < 0} />
            <StatRow label="Base difficulty" value={t(item.armor.baseDifficulty)} />
          </>
        )}
        <StatRow label={t('weight')} value={item.info.weight || '-'} />
        <StatRow label={t('length')} value={item.info.length || '-'} />
        <StatRow label="Min cost" value={item.info.cost.min} />
        <StatRow label="Avg cost" value={item.info.cost.average} />
        <StatRow label="Max cost" value={item.info.cost.max} />
        <StatRow label="Production hours" value={item.info.productionHours || '-'} />
      </Box>
    </Stack>
  );
}

function StatRow({
  label,
  value,
  positive,
  negative,
}: {
  label: string;
  value: string | number;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <Stack direction="row" sx={{ py: 0.5, justifyContent: 'space-between' }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: positive ? 'success.main' : negative ? 'error.main' : 'text.primary',
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
