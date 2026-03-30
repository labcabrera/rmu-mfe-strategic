import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Grid, Stack } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../../ErrorContext';
import { addItem } from '../../../api/character';
import { AddItemDto, Character, CharacterItem } from '../../../api/character.dto';
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

export default CharacterViewItems;
