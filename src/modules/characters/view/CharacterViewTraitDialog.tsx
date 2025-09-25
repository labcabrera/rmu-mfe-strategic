import React, { useState, useEffect, FC } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { AddTraitDto } from '../../api/character.dto';
import { fetchTrait, fetchTraits } from '../../api/trait';
import { Trait } from '../../api/trait.dto';

const CharacterViewTraitDialog: FC<{
  traitId: string | null;
  open: boolean;
  onClose: () => void;
}> = ({ traitId, open, onClose }) => {
  const { showError } = useError();
  const [trait, setTrait] = useState<Trait | null>(null);

  const bindTrait = (traitId: string) => {
    fetchTrait(traitId)
      .then((data) => setTrait(data))
      .catch((error) => {
        showError(error.message);
      });
  };

  useEffect(() => {
    if (traitId) {
      bindTrait(traitId);
    }
  }, [traitId]);

  if (!trait) return <div>Loading...</div>;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle color="primary">{t(trait.name)}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {trait.description}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CharacterViewTraitDialog;
