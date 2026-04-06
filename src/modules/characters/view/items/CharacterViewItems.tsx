import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Grid, Stack } from '@mui/material';
import { CategorySeparator, TechnicalInfo } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { useError } from '../../../../ErrorContext';
import { fetchCharacter } from '../../../api/character';
import { Character } from '../../../api/character.dto';
import { createStrategicItem, deleteStrategicItem, fetchStrategicItems } from '../../../api/strategic-item';
import { StrategicItem } from '../../../api/strategic-item.dto';
import CharacterViewAddItemDialog from './CharacterAddItemDialog';
import CharacterItemDetail from './CharacterItemDetail';
import CharacterItemTable from './CharacterItemTable';
import CharacterViewEquipment from './CharacterViewEquipment';
import CharacterViewEquipmentInfo from './CharacterViewEquipmentInfo';
import CharacterViewTransferGold from './CharacterViewTransferGold';

const CharacterViewItems: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
}> = ({ character, setCharacter }) => {
  const navigate = useNavigate();
  const { showError } = useError();
  const [openAddItemDialog, setOpenAddItemDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StrategicItem>();
  const [characterItems, setCharacterItems] = useState<StrategicItem[]>([]);

  const onItemAdded = (formData: Partial<StrategicItem>) => {
    formData.gameId = character.gameId;
    formData.characterId = character.id;
    createStrategicItem(formData)
      .then(() => {
        // bindCharacterItems();
        bindCharacter();
      })
      .catch((err) => showError(err.message));
  };

  const onItemDeleted = (itemId: string) => {
    deleteStrategicItem(itemId)
      .then(() => {
        bindCharacter();
      })
      .catch((err) => showError(err.message));
  };

  const bindCharacter = () => {
    fetchCharacter(character.id)
      .then((response) => setCharacter(response))
      .catch((err) => showError(err.message));
  };

  const bindCharacterItems = () => {
    if (character) {
      fetchStrategicItems(`characterId==${character.id}`, 0, 1000)
        .then((response) => setCharacterItems(response.content))
        .catch((err) => showError(err.message));
    }
  };

  useEffect(() => {
    bindCharacterItems();
  }, [character]);

  if (!setCharacter) return <p>Loading...</p>;

  return (
    <>
      <Grid container spacing={1}>
        <Grid size={12}>
          <CategorySeparator text={t('Equiped')}>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={() => setOpenAddItemDialog(true)}>
                {t('Buy')}
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
          <CharacterViewEquipment character={character} items={characterItems} setCharacter={setCharacter} />
        </Grid>

        <Grid size={12}>
          <CategorySeparator text={t('Equipment info')} />
        </Grid>

        <Grid size={12}>
          <CharacterViewEquipmentInfo character={character} />
        </Grid>

        <Grid size={12}>
          <CategorySeparator text={t('Items')} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CharacterItemTable
            character={character}
            items={characterItems}
            carried={true}
            setCharacter={setCharacter}
            onItemClick={setSelectedItem}
            onItemDeleted={onItemDeleted}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CharacterItemTable
            character={character}
            items={characterItems}
            carried={false}
            setCharacter={setCharacter}
            onItemClick={setSelectedItem}
            onItemDeleted={onItemDeleted}
          />
        </Grid>

        <Grid size={12}>
          <CharacterItemDetail
            character={character}
            setCharacter={setCharacter}
            items={characterItems}
            itemId={selectedItem?.id || undefined}
          />
        </Grid>

        <Grid size={12}>
          <CharacterViewTransferGold character={character} setCharacter={setCharacter} items={characterItems} />
        </Grid>

        <Grid size={12}>
          <TechnicalInfo>
            <pre>{JSON.stringify(characterItems, null, 2)}</pre>
          </TechnicalInfo>
        </Grid>
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
