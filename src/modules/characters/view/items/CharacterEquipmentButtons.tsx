import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import { Button, Stack } from '@mui/material';
import { StrategicItem, createStrategicItem, Character, fetchCharacter } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../../ErrorContext';
import CharacterViewAddItemDialog from './CharacterAddItemDialog';

export function CharacterEquipmentButtons({
  character,
  setCharacter,
}: {
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
}) {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showError } = useError();
  const [openAddItemDialog, setOpenAddItemDialog] = useState(false);

  const onItemAdded = (formData: Partial<StrategicItem>) => {
    formData.gameId = character.gameId;
    formData.characterId = character.id;
    createStrategicItem(formData, auth)
      .then(() => {
        bindCharacter();
      })
      .catch((err) => showError(err.message));
  };

  const bindCharacter = () => {
    fetchCharacter(character.id, auth)
      .then((response) => setCharacter(response))
      .catch((err) => showError(err.message));
  };

  if (!setCharacter) return <p>Loading...</p>;

  return (
    <>
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" onClick={() => setOpenAddItemDialog(true)}>
          {t('buy')}
        </Button>
        <Button variant="outlined" onClick={() => navigate(`/strategic/characters/trade/${character.id}`)}>
          {t('trading')}
        </Button>
        <Button variant="outlined" onClick={() => navigate(`/strategic/characters/craft/${character.id}`)}>
          {t('craft')}
        </Button>
      </Stack>
      <CharacterViewAddItemDialog
        open={openAddItemDialog}
        onClose={() => setOpenAddItemDialog(false)}
        onItemAdded={(addItemDto) => onItemAdded(addItemDto)}
      />
    </>
  );
}
