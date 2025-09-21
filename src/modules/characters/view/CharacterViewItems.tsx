import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { Card, CardActions, CardContent, CardMedia, Grid, IconButton, Typography } from '@mui/material';
import { useError } from '../../../ErrorContext';
import { deleteItem, updateCarriedStatus } from '../../api/character';
import { Character } from '../../api/character.dto';
import { Faction } from '../../api/faction.dto';
import { Item } from '../../api/items';
import DeleteDialog from '../../shared/dialogs/DeleteDialog';
import CharacterViewAddItem from './CharacterViewAddItem';
import CharacterViewEquipment from './CharacterViewEquipment';
import CharacterViewEquipmentInfo from './CharacterViewEquipmentInfo';
import CharacterViewTransferGold from './CharacterViewTransferGold';

const itemCardWidth = 120;
const itemCardHeight = 260;

const ItemCardListItem: FC<{
  item: Item;
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character>>;
}> = ({ item, character, setCharacter }) => {
  const { t } = useTranslation();
  const { showError } = useError();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    deleteItem(character.id, item.id)
      .then((data) => {
        setCharacter(data);
      })
      .catch((err: Error) => {
        showError(err.message);
      });
  };

  const handleCarried = (itemId: string, carried: boolean) => {
    updateCarriedStatus(character.id, itemId, carried)
      .then((data) => {
        setCharacter(data);
      })
      .catch((err: Error) => {
        showError(err.message);
      });
  };

  return (
    <>
      <Grid key={item.id}>
        <Card sx={{ width: itemCardWidth, height: itemCardHeight, display: 'flex', flexDirection: 'column' }}>
          <CardMedia
            component="img"
            height="120"
            image={item.imageUrl || `/static/images/items/${item.itemTypeId}.png`}
            alt={item.name}
            sx={{ filter: `grayscale(${item.carried ? 0 : 1})` }}
          />
          <CardActions disableSpacing>
            <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, marginLeft: 1 }}>
              {item.info?.type}
            </Typography>
            {item.itemTypeId !== 'gold-coin' && (
              <IconButton aria-label="delete" onClick={handleOpenDeleteDialog}>
                <DeleteOutlineIcon />
              </IconButton>
            )}
            {item.carried ? (
              <IconButton aria-label="archive" onClick={() => handleCarried(item.id, false)}>
                <RadioButtonCheckedIcon />
              </IconButton>
            ) : (
              <IconButton aria-label="archive" onClick={() => handleCarried(item.id, true)}>
                <RadioButtonUncheckedIcon />
              </IconButton>
            )}
          </CardActions>
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="body2">{item.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('weight')}: {item.info?.weight}
            </Typography>
            {item.amount && (
              <Typography variant="body2" color="text.secondary">
                {t('amount')}: {item.amount}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
      <DeleteDialog
        message={`Are you sure you want to delete ${item.name} item? This action cannot be undone and the amount used will not be refunded.`}
        onDelete={handleDelete}
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </>
  );
};

const ItemCardList: FC<{
  items: Item[];
  character: Character;
  setCharacter: React.Dispatch<React.SetStateAction<Character>>;
}> = ({ items, character, setCharacter }) => {
  return (
    <Grid container spacing={2}>
      {items.map((item) => (
        <ItemCardListItem key={item.id} item={item} character={character} setCharacter={setCharacter} />
      ))}
    </Grid>
  );
};

const CharacterViewItems: FC<{
  character: Character;
  setCharacter: React.Dispatch<React.SetStateAction<Character>>;
  faction: Faction;
}> = ({ character, setCharacter, faction }) => {
  return (
    <Grid container spacing={2}>
      <Grid size={7}>
        <CharacterViewEquipment character={character} setCharacter={setCharacter} />
      </Grid>
      <Grid size={5}>
        <CharacterViewEquipmentInfo character={character} />
      </Grid>
      <Grid size={12}>
        <ItemCardList items={character.items} character={character} setCharacter={setCharacter} />
      </Grid>
      <Grid size={12}></Grid>
      <Grid size={12}>
        <CharacterViewAddItem character={character} setCharacter={setCharacter} />
      </Grid>
      <Grid size={12}>
        <CharacterViewTransferGold character={character} setCharacter={setCharacter} faction={faction} />
      </Grid>
    </Grid>
  );
};

export default CharacterViewItems;
