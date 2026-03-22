import React, { useState, useEffect, FC, Dispatch, SetStateAction } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../../ErrorContext';
import { deleteTrait } from '../../../api/character';
import { Character, CharacterTrait } from '../../../api/character.dto';
import { fetchTrait } from '../../../api/trait';
import { DeleteTraitDto, Trait } from '../../../api/trait.dto';
import TechnicalInfo from '../../../shared/display/TechnicalInfo';

const CharacterViewTraitDialog: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character>>;
  characterTrait: CharacterTrait;
  open: boolean;
  onClose: () => void;
}> = ({ character, setCharacter, characterTrait, open, onClose }) => {
  const { showError } = useError();
  const [trait, setTrait] = useState<Trait | null>(null);

  const onDeleteTrait = () => {
    const dto: DeleteTraitDto = {
      traitId: characterTrait.traitId,
      specialization: characterTrait.specialization,
    };
    deleteTrait(character.id, dto)
      .then((updatedCharacter) => {
        setCharacter(updatedCharacter);
        onClose();
      })
      .catch((error) => showError(error.message));
  };

  useEffect(() => {
    if (characterTrait) {
      fetchTrait(characterTrait.traitId)
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
          {t('Delete')}
        </Button>
        <Button onClick={onClose}>{t('Close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CharacterViewTraitDialog;
