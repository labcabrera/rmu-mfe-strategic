/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { deleteItem } from '../../api/characters';
import CharacterViewAddItem from './CharacterViewAddItem';
import CharacterViewEquipment from './CharacterViewEquipment';

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
        <CharacterViewEquipment character={character} setCharacter={setCharacter} />

        <Table aria-label="item table">
          <TableHead>
            <TableRow>
              <TableCell>{t('name')}</TableCell>
              <TableCell align="left">{t('type')}</TableCell>
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
                <TableCell align="left">{row.itemTypeId}</TableCell>
                <TableCell align="left">{row.category}</TableCell>
                <TableCell align="right">{row.info.weight}</TableCell>
                <TableCell align="right">{row.info.strength}</TableCell>
                <TableCell align="right">
                  <Button onClick={() => handleDelete(row.id)}>Delete</Button>
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
