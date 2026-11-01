import React, { useState, useEffect, FC, Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Chip, Typography } from '@mui/material';
import {
  Character,
  CharacterTrait,
  deleteCharacterTrait,
  DeleteTraitDto,
  fetchTrait,
  RmuDialog,
  TechnicalInfo,
  Trait,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useStrategicNotify } from '../../../services/notify-service';

const CharacterViewTraitDialog: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  characterTrait: CharacterTrait;
  open: boolean;
  onClose: () => void;
}> = ({ character, setCharacter, characterTrait, open, onClose }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useStrategicNotify();
  const [trait, setTrait] = useState<Trait | null>(null);

  const onDeleteTrait = () => {
    const dto: DeleteTraitDto = {
      traitId: characterTrait.traitId,
      specialization: characterTrait.specialization,
    };
    deleteCharacterTrait(character.id, dto, auth)
      .then((updatedCharacter) => {
        setCharacter(updatedCharacter);
        onClose();
      })
      .catch((error) => notify.error(error));
  };

  useEffect(() => {
    if (characterTrait) {
      fetchTrait(characterTrait.traitId, auth)
        .then((data) => setTrait(data))
        .catch((error) => notify.error(error));
    }
  }, [characterTrait]);

  if (!trait) return null;

  return (
    <RmuDialog
      open={open}
      title={t(trait.name)}
      maxWidth="sm"
      onDelete={characterTrait.source !== 'race' ? onDeleteTrait : undefined}
      onClose={onClose}
    >
      {characterTrait.source === 'race' && (
        <Chip label={t('trait-source-race')} size="small" color="primary" variant="outlined" />
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }} gutterBottom>
        {trait.description}
      </Typography>
      <TechnicalInfo>
        <pre>{`CharacterTrait: ${JSON.stringify(characterTrait, null, 2)}`}</pre>
        <pre>{`Trait: ${JSON.stringify(trait, null, 2)}`}</pre>
      </TechnicalInfo>
    </RmuDialog>
  );
};

export default CharacterViewTraitDialog;
