import React, { useState, useEffect, FC } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../../ErrorContext';
import { fetchTrait } from '../../../api/trait';
import { Trait } from '../../../api/trait.dto';

const CharacterViewTraitDialog: FC<{
  traitId: string | null;
  open: boolean;
  onClose: () => void;
}> = ({ traitId, open, onClose }) => {
  const { showError } = useError();
  const [trait, setTrait] = useState<Trait | null>(null);
  const [traitCategories, setTraitCategories] = useState<string[]>();

  useEffect(() => {
    if (traitId) {
      fetchTrait(traitId)
        .then((data) => setTrait(data))
        .catch((error) => showError(error.message));
    }
  }, [traitId]);

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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CharacterViewTraitDialog;
