import React, { useState, useEffect, FC } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { AddTraitDto } from '../../api/character.dto';
import { fetchTraits } from '../../api/trait';
import { Trait } from '../../api/trait.dto';
import NumericInput from '../../shared/inputs/NumericInput';
import NumericReadonlyInput from '../../shared/inputs/NumericReadonlyInput';
import SelectTrait from '../../shared/selects/SelectTraitCategory';

const CharacterAddTraitDialog: FC<{
  open: boolean;
  onClose: () => void;
  onTraitAdded: (addTrait: AddTraitDto) => void;
}> = ({ open, onClose, onTraitAdded }) => {
  const { showError } = useError();
  const [traits, setTraits] = useState<Trait[]>([]);
  const [formData, setFormData] = useState<AddTraitDto | null>(null);
  const [selectedTrait, setSelectedTrait] = useState<Trait | null>(null);

  const bindTraits = () => {
    fetchTraits('', 0, 200)
      .then((data: Trait[]) => {
        setTraits(data);
      })
      .catch((error) => {
        showError(error.message);
      });
  };

  useEffect(() => {
    bindTraits();
  }, []);

  const handleSave = async () => {
    if (!formData.traitId) {
      showError('Please select a trait');
      return;
    }
    try {
      onTraitAdded(formData);
      handleClose();
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleTraitChange = (trait: Trait) => {
    setSelectedTrait(trait);
    if (trait) {
      setFormData({
        traitId: trait.id,
        tier: trait.isTierBased ? 1 : undefined,
        value: undefined,
      });
    } else {
      setFormData(null);
    }
  };

  const handleClose = () => {
    setFormData(null);
    onClose();
  };

  if (!traits) return <p>Loading...</p>;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('add-skill')}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={12}>
            <SelectTrait label={t('trait')} traits={traits} value={selectedTrait?.id} onChange={handleTraitChange} />
          </Grid>
          {selectedTrait && formData && (
            <>
              <Grid size={4}>
                <NumericReadonlyInput
                  label={t('adquisition-cost')}
                  name="adquisitionCost"
                  value={selectedTrait.adquisitionCost}
                />
              </Grid>
              <Grid size={4}>
                <NumericReadonlyInput label={t('tier-cost')} name="tierCost" value={selectedTrait.tierCost} />
              </Grid>
              <Grid size={4}>
                <NumericReadonlyInput label={t('max-tier')} name="maxTier" value={selectedTrait.maxTier} />
              </Grid>
              <Grid size={12}>{selectedTrait.description}</Grid>
              {selectedTrait.isTierBased && (
                <Grid size={4}>
                  <NumericInput
                    label={t('tier')}
                    value={formData.tier}
                    onChange={(value) => setFormData({ ...formData, tier: value })}
                    integer
                    min={1}
                    max={selectedTrait.maxTier}
                  />
                </Grid>
              )}
              {selectedTrait.requiresSpecialization && (
                <Grid size={6}>
                  <TextField
                    label={t('specialization')}
                    value={formData.value}
                    name="value"
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    variant="standard"
                    fullWidth
                  />
                </Grid>
              )}
            </>
          )}
        </Grid>
        <pre>{JSON.stringify(formData, null, 2)} </pre>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('cancel')}</Button>
        <Button onClick={handleSave} variant="contained" disabled={false}>
          {t('add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CharacterAddTraitDialog;
