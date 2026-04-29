import React, { useState, useEffect, FC, Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography } from '@mui/material';
import {
  Character,
  CharacterTrait,
  deleteCharacterTrait,
  DeleteTraitDto,
  fetchTrait,
  TechnicalInfo,
  Trait,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../../ErrorContext';

const CharacterViewTraitDialog: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  characterTrait: CharacterTrait;
  open: boolean;
  onClose: () => void;
}> = ({ character, setCharacter, characterTrait, open, onClose }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const { showError } = useError();
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
      .catch((error) => showError(error.message));
  };

  useEffect(() => {
    if (characterTrait) {
      fetchTrait(characterTrait.traitId, auth)
        .then((data) => setTrait(data))
        .catch((error) => showError(error.message));
    }
  }, [characterTrait]);

  if (!trait) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle color="primary">{t(trait.name)}</DialogTitle>
      <DialogContent>
        <Grid container spacing={1} sx={{ mt: 1 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {trait.description}
          </Typography>
        </Grid>
        <TechnicalInfo>
          <pre>CharacterTrait: {JSON.stringify(characterTrait, null, 2)}</pre>
          <pre>Trait: {JSON.stringify(trait, null, 2)}</pre>
        </TechnicalInfo>
      </DialogContent>
      <DialogActions>
        <Button onClick={onDeleteTrait} color="error">
          {t('delete')}
        </Button>
        <Button onClick={onClose}>{t('cancel')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CharacterViewTraitDialog;
