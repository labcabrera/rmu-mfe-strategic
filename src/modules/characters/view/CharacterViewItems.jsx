/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { deleteItem, updateCarriedStatus } from '../../api/characters';
import CharacterViewAddItem from './CharacterViewAddItem';
import CharacterViewEquipment from './CharacterViewEquipment';
import CharacterViewEquipmentInfo from './CharacterViewEquipmentInfo';
import CharacterViewTransferGold from './CharacterViewTransferGold';

const ItemCardList = ({ items, character, setCharacter }) => {
  const { t } = useTranslation();

  const handleDelete = (itemId) => {
    deleteItem(character.id, itemId)
      .then((data) => {
        setCharacter(data);
      })
      .catch((err) => console.error(err));
  };

  const handleCarried = (itemId, carried) => {
    updateCarriedStatus(character.id, itemId, carried)
      .then((data) => {
        setCharacter(data);
      })
      .catch((err) => console.error(err));
  };

  return (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid item key={item.id} xs={8} sm={4} md={2}>
          <Card sx={{ width: 150, height: 290, display: 'flex', flexDirection: 'column' }}>
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
                <IconButton aria-label="delete" onClick={() => handleDelete(item.id)}>
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
                <>
                  <Typography variant="body2" color="text.secondary">
                    {t('amount')}: {item.amount}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

const CharacterViewItems = ({ character, setCharacter, faction }) => {
  return (
    <Grid container spacing={2}>
      <Grid item size={7}>
        <CharacterViewEquipment character={character} setCharacter={setCharacter} />
      </Grid>
      <Grid item size={5}>
        <CharacterViewEquipmentInfo character={character} />
      </Grid>
      <Grid item size={12}>
        <ItemCardList items={character.items} character={character} setCharacter={setCharacter} />
      </Grid>
      <Grid item size={12}></Grid>
      <Grid item size={12}>
        <CharacterViewAddItem character={character} setCharacter={setCharacter} />
      </Grid>
      <Grid item size={12}>
        <CharacterViewTransferGold character={character} setCharacter={setCharacter} faction={faction} />
      </Grid>
    </Grid>
  );
};

export default CharacterViewItems;
