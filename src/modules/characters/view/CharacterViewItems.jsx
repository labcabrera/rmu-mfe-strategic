/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { deleteItem, updateCarriedStatus } from '../../api/characters';
import CharacterViewAddItem from './CharacterViewAddItem';
import CharacterViewEquipment from './CharacterViewEquipment';
import CharacterViewEquipmentInfo from './CharacterViewEquipmentInfo';

const ItemCardList = ({ items, character, setCharacter }) => {
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
              <IconButton aria-label="delete" onClick={() => handleDelete(item.id)}>
                <DeleteOutlineIcon />
              </IconButton>
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
              <Typography variant="body2" component="div">
                {item.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Weight: {item.info?.weight}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                C: {item.carried}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

const CharacterViewItems = ({ character, setCharacter }) => {
  const { t } = useTranslation();

  const handleDelete = (itemId) => {
    deleteItem(character.id, itemId)
      .then((data) => {
        setCharacter(data);
      })
      .catch((err) => console.error(err));
  };

  // TODO Stash / Carried

  return (
    <>
      <Grid container spacing={2}>
        <Grid item size={7}>
          <CharacterViewEquipment character={character} setCharacter={setCharacter} />
        </Grid>
        <Grid item size={5}>
          <CharacterViewEquipmentInfo character={character} />
        </Grid>
        <Grid item size={12}></Grid>

        <Grid item size={12}>
          <Typography variant="h6" color="primary">
            {t('add-item')}
          </Typography>
        </Grid>
        <Grid item size={12}>
          <CharacterViewAddItem character={character} setCharacter={setCharacter} />
        </Grid>

        <Grid item size={12}>
          <Typography variant="h6" color="primary">
            {t('items')}
          </Typography>
        </Grid>
        <Grid item size={12}>
          <ItemCardList items={character.items} character={character} setCharacter={setCharacter} />
        </Grid>

        <Table aria-label="item table">
          <TableHead>
            <TableRow>
              <TableCell>{t('name')}</TableCell>
              <TableCell align="left">{t('item-type')}</TableCell>
              <TableCell align="left">{t('category')}</TableCell>
              <TableCell align="left">{t('weight')}</TableCell>
              <TableCell align="left">{t('strength')}</TableCell>
              <TableCell align="left">{t('options')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {character.items.map((row) => (
              <TableRow key={row.name}>
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell align="left">{t(row.itemTypeId)}</TableCell>
                <TableCell align="left">{t(row.category)}</TableCell>
                <TableCell align="right">{row.info.weight}</TableCell>
                <TableCell align="right">{row.info.strength}</TableCell>
                <TableCell align="right">
                  <IconButton aria-label="delete" onClick={() => handleDelete(row.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid>

      <CharacterViewAddItem character={character} setCharacter={setCharacter} />

      <pre>{JSON.stringify(character.items, null, 2)}</pre>
    </>
  );
};

export default CharacterViewItems;
