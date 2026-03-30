import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { Button, Card, CardActions, CardContent, CardMedia, Grid, IconButton, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../../ErrorContext';
import { addItem, deleteItem, updateCarriedStatus } from '../../../api/character';
import { AddItemDto, Character, CharacterItem } from '../../../api/character.dto';
import { Item } from '../../../api/items';
import DeleteButton from '../../../shared/buttons/DeleteButton';
import DeleteDialog from '../../../shared/dialogs/DeleteDialog';
import CategorySeparator from '../../../shared/display/CategorySeparator';
import CharacterViewTransferGold from '../CharacterViewTransferGold';
import CharacterViewAddItemDialog from './CharacterAddItemDialog';
import CharacterItemDetail from './CharacterItemDetail';
import CharacterItemTable from './CharacterItemTable';
import CharacterViewEquipment from './CharacterViewEquipment';
import CharacterViewEquipmentInfo from './CharacterViewEquipmentInfo';

const itemCardWidth = 120;
const itemCardHeight = 260;

const CharacterViewItems: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
}> = ({ character, setCharacter }) => {
  const navigate = useNavigate();
  const { showError } = useError();
  const [openAddItemDialog, setOpenAddItemDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CharacterItem | null>(null);

  const onItemAdded = (addItemDto: AddItemDto) => {
    addItem(character.id, addItemDto)
      .then((data) => setCharacter!(data))
      .catch((err) => showError(err.message));
  };

  if (!setCharacter) return <p>Loading...</p>;

  return (
    <>
      <Grid container spacing={1}>
        <Grid size={12}>
          <CategorySeparator text={t('Equiped')}>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={() => setOpenAddItemDialog(true)}>
                {t('Direct buy')}
              </Button>
              <Button variant="outlined" onClick={() => navigate(`/strategic/characters/trade/${character.id}`)}>
                {t('Trade')}
              </Button>
              <Button variant="outlined" onClick={() => navigate(`/strategic/characters/craft/${character.id}`)}>
                {t('Craft')}
              </Button>
            </Stack>
          </CategorySeparator>
        </Grid>

        <Grid size={12}>
          <CharacterViewEquipment character={character} setCharacter={setCharacter} />
        </Grid>

        <Grid size={12}>
          <CategorySeparator text={t('equipment-info')} />
        </Grid>

        <Grid size={12}>
          <CharacterViewEquipmentInfo character={character} />
        </Grid>

        <Grid size={12}>
          <CategorySeparator text={t('Carried')} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CharacterItemTable
            character={character}
            setCharacter={setCharacter}
            carried={true}
            onItemClick={setSelectedItem}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CharacterItemTable
            character={character}
            setCharacter={setCharacter}
            carried={false}
            onItemClick={setSelectedItem}
          />
        </Grid>

        <Grid size={12}>
          <CharacterItemDetail item={selectedItem!} />
        </Grid>

        <Grid size={12}>
          <CharacterViewTransferGold character={character} setCharacter={setCharacter} />
        </Grid>

        <CategorySeparator text={t('Stored')} />
      </Grid>
      <CharacterViewAddItemDialog
        open={openAddItemDialog}
        onClose={() => setOpenAddItemDialog(false)}
        onItemAdded={(addItemDto) => onItemAdded(addItemDto)}
      />
    </>
  );
};

const ItemCardListItem: FC<{
  item: Item;
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character>>;
}> = ({ item, character, setCharacter }) => {
  const { showError } = useError();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    deleteItem(character.id, item.id)
      .then((data) => setCharacter(data))
      .catch((err) => showError(err.message));
  };

  const handleCarried = (itemId: string, carried: boolean) => {
    updateCarriedStatus(character.id, itemId, carried)
      .then((data) => setCharacter(data))
      .catch((err) => showError(err.message));
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
              <DeleteButton aria-label="delete" onClick={() => setDeleteDialogOpen(true)} />
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

export default CharacterViewItems;
