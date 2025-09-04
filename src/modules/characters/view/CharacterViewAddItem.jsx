/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useError } from '../../../ErrorContext';
import { addItem } from '../../api/characters';
import { fetchItems } from '../../api/items';
import { characterItemCreateTemplate } from '../../data/item-create';
import SelectArmorSlot from '../../shared/selects/SelectArmorSlot';
import SelectItemCategory from '../../shared/selects/SelectItemCategory';
import SelectItemType from '../../shared/selects/SelectItemType';

const ItemInfo = ({ character, setCharacter, formData, setFormData, item }) => {
  const { t } = useTranslation();
  const { showError } = useError();

  const handleAddItem = () => {
    addItem(character.id, formData)
      .then((data) => setCharacter(data))
      .then(() => setFormData(characterItemCreateTemplate))
      .catch((err) => {
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
      {item.info.weight && (
        <Grid size={2}>
          <TextField label={t('weight')} variant="standard" name="weight" value={item.info.weight} fullWidth />
        </Grid>
      )}
      {item.info.weightPercent && (
        <Grid size={2}>
          <TextField label={t('weight-percent')} variant="standard" name="weight-percent" value={item.info.weightPercent} fullWidth />
        </Grid>
      )}
      {item.info.length && (
        <Grid size={2}>
          <TextField label={t('length')} variant="standard" name="length" value={item.info.length} fullWidth />
        </Grid>
      )}
      {item.info.strength && (
        <Grid size={2}>
          <TextField label={t('strength')} variant="standard" name="strength" value={item.info.strength} fullWidth />
        </Grid>
      )}
      <Grid size={12}></Grid>
      <Grid size={2}>
        <TextField label={t('cost-min')} variant="standard" name="min-cost" value={item.info.cost.min} fullWidth />
      </Grid>
      <Grid size={2}>
        <TextField label={t('cost-average')} variant="standard" name="avg-cost" value={item.info.cost.average} fullWidth />
      </Grid>
      <Grid size={2}>
        <TextField label={t('cost-max')} variant="standard" name="max-cost" value={item.info.cost.max} fullWidth />
      </Grid>
      {item.info.productionHours && (
        <Grid size={2}>
          <TextField label={t('production-hours')} variant="standard" name="production-hours" value={item.info.productionHours} fullWidth />
        </Grid>
      )}
      <Grid size={12}></Grid>
      {item.weapon && (
        <>
          <Grid size={2}>
            <TextField label={t('attack-table')} variant="standard" name="damage" value={item.weapon.attackTable} fullWidth />
          </Grid>
          <Grid size={2}>
            <TextField label={t('fumble-table')} variant="standard" name="damage" value={item.weapon.fumbleTable} fullWidth />
          </Grid>
          <Grid size={2}>
            <TextField label={t('fumble')} variant="standard" name="damage" value={item.weapon.fumble} fullWidth />
          </Grid>
          <Grid size={2}>
            <TextField label={t('size-adjustment')} variant="standard" name="size-adjustment" value={item.weapon.sizeAdjustment} fullWidth />
          </Grid>
          <Grid size={2}>
            <TextField label={t('required-hands')} variant="standard" name="required-hands" value={item.weapon.requiredHands} fullWidth />
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
            <TextField label={t('ranged-penalty')} variant="standard" name="ranged-penalty" value={item.armor.rangedPenalty} fullWidth />
          </Grid>
          <Grid size={2}>
            <TextField label={t('perception')} variant="standard" name="perception" value={item.armor.perception} fullWidth />
          </Grid>
          <Grid size={2}>
            <TextField label={t('base-difficulty')} variant="standard" name="base-difficulty" value={item.armor.baseDifficulty} fullWidth />
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

const CharacterViewAddItem = ({ character, setCharacter }) => {
  const { t } = useTranslation();
  const [itemCategory, setItemCategory] = useState(null);
  const [armorSlot, setArmorSlot] = useState(null);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState(characterItemCreateTemplate);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleItemCategoryChange = (category) => {
    setItemCategory(category);
  };

  const bindItems = (category) => {
    var rsql = `category==${category}`;
    if (itemCategory === 'armor' && armorSlot) {
      rsql += `;armor.slot==${armorSlot}`;
    }
    fetchItems(rsql, 0, 100)
      .then((data) => setItems(data))
      .catch((err) => console.error(err));
  };

  const capitalize = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleItemTypeChange = (itemId) => {
    const name = capitalize(itemId.replaceAll('-', ' '));
    setFormData({ ...formData, itemTypeId: itemId, name });
    setSelectedItem(items.find((i) => i.id === itemId));
  };

  useEffect(() => {
    if (itemCategory) {
      console.log('Selected item category use effect:', itemCategory);
      bindItems(itemCategory);
    }
  }, [itemCategory, armorSlot]);

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="h6" color="primary">
          {t('add-equipment')}
        </Typography>
      </Grid>
      <Grid size={4}>
        <SelectItemCategory value={itemCategory} onChange={(category) => handleItemCategoryChange(category)} />
      </Grid>
      {itemCategory === 'armor' && (
        <Grid size={4}>
          <SelectArmorSlot value={armorSlot} onChange={(slot) => setArmorSlot(slot)} />
        </Grid>
      )}
      {itemCategory && (
        <Grid size={4}>
          <SelectItemType items={items} value={formData.itemTypeId} onChange={(itemId) => handleItemTypeChange(itemId)} />
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
        <ItemInfo character={character} setCharacter={setCharacter} formData={formData} setFormData={setFormData} item={selectedItem} />
      )}
    </Grid>
  );
};

export default CharacterViewAddItem;
