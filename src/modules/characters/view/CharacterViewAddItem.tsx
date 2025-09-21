import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Chip, Grid, TextField, Typography } from '@mui/material';
import { useError } from '../../../ErrorContext';
import { addItem } from '../../api/character';
import { fetchItems } from '../../api/items';
import { characterItemCreateTemplate } from '../../data/item-create';
import SelectArmorSlot from '../../shared/selects/SelectArmorSlot';
import SelectItemCategory from '../../shared/selects/SelectItemCategory';
import SelectItemType from '../../shared/selects/SelectItemType';

// Tipos para los props y datos
interface ItemInfoType {
  weight?: number;
  weightPercent?: number;
  length?: number;
  strength?: number;
  cost: {
    min: number;
    average: number;
    max: number;
  };
  productionHours?: number;
}

interface WeaponRange {
  from: number;
  to: number;
  bonus: number;
}

interface WeaponType {
  attackTable?: string;
  fumbleTable?: string;
  fumble?: string;
  sizeAdjustment?: string;
  requiredHands?: number;
  ranges?: WeaponRange[];
}

interface ArmorType {
  at?: string;
  maneuver?: string;
  rangedPenalty?: string;
  perception?: string;
  baseDifficulty?: string;
}

interface ItemType {
  id: string;
  name: string;
  info: ItemInfoType;
  weapon?: WeaponType;
  armor?: ArmorType;
  description?: string;
}

interface CharacterType {
  id: string;
  // otros campos según tu modelo
}

interface CharacterItemFormData {
  itemTypeId: string;
  name: string;
  description: string;
  // otros campos según tu modelo
}

const ItemInfo: React.FC<{
  character: CharacterType;
  setCharacter: Dispatch<SetStateAction<CharacterType>>;
  formData: CharacterItemFormData;
  setFormData: Dispatch<SetStateAction<CharacterItemFormData>>;
  item: ItemType;
}> = ({ character, setCharacter, formData, setFormData, item }) => {
  const { t } = useTranslation();
  const { showError } = useError();

  const handleAddItem = () => {
    addItem(character.id, formData)
      .then((data) => setCharacter(data))
      .then(() => setFormData(characterItemCreateTemplate))
      .catch((err: Error) => {
        showError(err.message);
      });
  };

  if (!item) return null;

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Box>
          <img src={`/static/images/items/${item.id}.png`} alt={item.name} style={{ width: 140, height: 140 }} />
        </Box>
      </Grid>
      {item.info.weight !== undefined && (
        <Grid size={2}>
          <TextField label={t('weight')} variant="standard" name="weight" value={item.info.weight} fullWidth />
        </Grid>
      )}
      {item.info.weightPercent !== undefined && (
        <Grid size={2}>
          <TextField
            label={t('weight-percent')}
            variant="standard"
            name="weight-percent"
            value={item.info.weightPercent}
            fullWidth
          />
        </Grid>
      )}
      {item.info.length !== undefined && (
        <Grid size={2}>
          <TextField label={t('length')} variant="standard" name="length" value={item.info.length} fullWidth />
        </Grid>
      )}
      {item.info.strength !== undefined && (
        <Grid size={2}>
          <TextField label={t('strength')} variant="standard" name="strength" value={item.info.strength} fullWidth />
        </Grid>
      )}
      <Grid size={12}></Grid>
      <Grid size={2}>
        <TextField label={t('cost-min')} variant="standard" name="min-cost" value={item.info.cost.min} fullWidth />
      </Grid>
      <Grid size={2}>
        <TextField
          label={t('cost-average')}
          variant="standard"
          name="avg-cost"
          value={item.info.cost.average}
          fullWidth
        />
      </Grid>
      <Grid size={2}>
        <TextField label={t('cost-max')} variant="standard" name="max-cost" value={item.info.cost.max} fullWidth />
      </Grid>
      {item.info.productionHours !== undefined && (
        <Grid size={2}>
          <TextField
            label={t('production-hours')}
            variant="standard"
            name="production-hours"
            value={item.info.productionHours}
            fullWidth
          />
        </Grid>
      )}
      <Grid size={12}></Grid>
      {item.weapon && (
        <>
          <Grid size={2}>
            <TextField
              label={t('attack-table')}
              variant="standard"
              name="damage"
              value={item.weapon.attackTable}
              fullWidth
            />
          </Grid>
          <Grid size={2}>
            <TextField
              label={t('fumble-table')}
              variant="standard"
              name="damage"
              value={item.weapon.fumbleTable}
              fullWidth
            />
          </Grid>
          <Grid size={2}>
            <TextField label={t('fumble')} variant="standard" name="damage" value={item.weapon.fumble} fullWidth />
          </Grid>
          <Grid size={2}>
            <TextField
              label={t('size-adjustment')}
              variant="standard"
              name="size-adjustment"
              value={item.weapon.sizeAdjustment}
              fullWidth
            />
          </Grid>
          <Grid size={2}>
            <TextField
              label={t('required-hands')}
              variant="standard"
              name="required-hands"
              value={item.weapon.requiredHands}
              fullWidth
            />
          </Grid>
          <Grid size={2}> </Grid>
          {item.weapon.ranges &&
            item.weapon.ranges.map((range, index) => (
              <Chip key={index} label={`Range ${range.from}-${range.to}: ${range.bonus}`} variant="outlined" />
            ))}
        </>
      )}
      {item.armor && (
        <>
          <Grid size={2}>
            <TextField label={t('at')} variant="standard" name="at" value={item.armor.at} fullWidth />
          </Grid>
          <Grid size={2}>
            <TextField label={t('maneuver')} variant="standard" name="maneuver" value={item.armor.maneuver} fullWidth />
          </Grid>
          <Grid size={2}>
            <TextField
              label={t('ranged-penalty')}
              variant="standard"
              name="ranged-penalty"
              value={item.armor.rangedPenalty}
              fullWidth
            />
          </Grid>
          <Grid size={2}>
            <TextField
              label={t('perception')}
              variant="standard"
              name="perception"
              value={item.armor.perception}
              fullWidth
            />
          </Grid>
          <Grid size={2}>
            <TextField
              label={t('base-difficulty')}
              variant="standard"
              name="base-difficulty"
              value={item.armor.baseDifficulty}
              fullWidth
            />
          </Grid>
        </>
      )}
      <Grid size={12}></Grid>
      <Grid size={4}>
        <TextField label={t('description')} variant="standard" name="description" value={item.description} fullWidth />
      </Grid>
      <Grid size={12}>
        <Button variant="contained" onClick={handleAddItem}>
          {t('add-item')}
        </Button>
      </Grid>
      <pre>{JSON.stringify(item, null, 2)}</pre>
    </Grid>
  );
};

interface CharacterViewAddItemProps {
  character: CharacterType;
  setCharacter: React.Dispatch<React.SetStateAction<CharacterType>>;
}

const CharacterViewAddItem: React.FC<CharacterViewAddItemProps> = ({ character, setCharacter }) => {
  const { t } = useTranslation();
  const [itemCategory, setItemCategory] = useState<string | null>(null);
  const [armorSlot, setArmorSlot] = useState<string | null>(null);
  const [items, setItems] = useState<ItemType[]>([]);
  const [formData, setFormData] = useState<CharacterItemFormData>(characterItemCreateTemplate);
  const [selectedItem, setSelectedItem] = useState<ItemType | null>(null);

  const handleItemCategoryChange = (category: string | null) => {
    setItemCategory(category);
  };

  const bindItems = (category: string | null) => {
    let rsql = `category==${category}`;
    if (itemCategory === 'armor' && armorSlot) {
      rsql += `;armor.slot==${armorSlot}`;
    }
    fetchItems(rsql, 0, 100)
      .then((data: ItemType[]) => setItems(data))
      .catch((err) => console.error(err));
  };

  const capitalize = (string: string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleItemTypeChange = (itemId: string) => {
    const name = capitalize(itemId.replaceAll('-', ' '));
    setFormData({ ...formData, itemTypeId: itemId, name });
    setSelectedItem(items.find((i) => i.id === itemId) || null);
  };

  useEffect(() => {
    if (itemCategory) {
      bindItems(itemCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemCategory, armorSlot]);

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="h6" color="primary">
          {t('add-equipment')}
        </Typography>
      </Grid>
      <Grid size={4}>
        <SelectItemCategory value={itemCategory} onChange={handleItemCategoryChange} />
      </Grid>
      {itemCategory === 'armor' && (
        <Grid size={4}>
          <SelectArmorSlot value={armorSlot} onChange={setArmorSlot} />
        </Grid>
      )}
      {itemCategory && (
        <Grid size={4}>
          <SelectItemType items={items} value={formData.itemTypeId} onChange={handleItemTypeChange} />
        </Grid>
      )}
      <Grid size={12}></Grid>
      <Grid size={4}>
        <TextField
          label={t('item-name')}
          variant="standard"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          fullWidth
        />
      </Grid>
      <Grid size={4}>
        <TextField
          label={t('description')}
          variant="standard"
          name="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          fullWidth
        />
      </Grid>
      {selectedItem && (
        <ItemInfo
          character={character}
          setCharacter={setCharacter}
          formData={formData}
          setFormData={setFormData}
          item={selectedItem}
        />
      )}
    </Grid>
  );
};

export default CharacterViewAddItem;
