import React, { useState, useEffect, FC, Dispatch, SetStateAction } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { TechnicalInfo } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { useError } from '../../../../ErrorContext';
import { addTrait } from '../../../api/character';
import { AddTraitDto, Character } from '../../../api/character.dto';
import { fetchTraits } from '../../../api/trait';
import { Trait, traitCategories } from '../../../api/trait.dto';
import SelectTraitSpecialization from './SelectTraitSpecialization';

const AddTraitDialog: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  open: boolean;
  onClose: () => void;
}> = ({ character, setCharacter, open, onClose }) => {
  const { showError } = useError();
  const theme = useTheme();

  const [traits, setTraits] = useState<Trait[]>([]);
  const [formData, setFormData] = useState<AddTraitDto>({} as AddTraitDto);
  const [selectedTrait, setSelectedTrait] = useState<Trait>();
  const [selectedTraitCategory, setSelectedTraitCategory] = useState<string>();

  const bindTraits = () => {
    fetchTraits(`category==${selectedTraitCategory}`, 0, 200)
      .then((data: Trait[]) => setTraits(data))
      .catch((error) => showError(error.message));
  };

  const onAddTrait = () => {
    addTrait(character.id, formData)
      .then((updatedCharacter) => {
        setCharacter(updatedCharacter);
        reset();
        onClose();
      })
      .catch((err) => showError(err.message));
  };

  const handleTraitChange = (trait: Trait) => {
    setSelectedTrait(trait || null);
    if (trait) {
      setFormData({
        traitId: trait.id,
        tier: trait.isTierBased ? 1 : undefined,
        specialization: undefined,
      });
    } else {
      reset();
    }
  };

  const onCloseClick = () => {
    reset();
    onClose();
  };

  const reset = () => {
    setFormData({} as AddTraitDto);
  };

  useEffect(() => {
    if (selectedTraitCategory) {
      bindTraits();
    }
  }, [selectedTraitCategory]);

  if (!traits) return <p>Loading...</p>;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{t('add-skill')}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={4}>
            <SelectionList
              value={selectedTraitCategory}
              options={traitCategories}
              onChange={(e) => setSelectedTraitCategory(e)}
              formatter={(e) => e}
            />
          </Grid>
          <Grid size={4}>
            <SelectionList
              value={selectedTrait}
              options={traits}
              onChange={(e) => handleTraitChange(e)}
              formatter={(e) => `${t(e.name)} (${e.adquisitionCost})`}
              colorFormatter={(e) => (e.isTalent === false ? theme.palette.error.main : theme.palette.success.main)}
            />
          </Grid>
          <Grid size={4}>
            <TraitForm trait={selectedTrait} formData={formData} setFormData={setFormData} />
          </Grid>
          <TechnicalInfo>
            <pre>Trait: {JSON.stringify(selectedTrait, null, 2)}</pre>
            <pre>FormData: {JSON.stringify(formData, null, 2)}</pre>
          </TechnicalInfo>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCloseClick}>{t('Cancel')}</Button>
        <Button onClick={onAddTrait} variant="contained" disabled={false}>
          {t('Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const SelectionList: FC<{
  value: any;
  options: any[];
  onChange: (value: any) => void;
  formatter: (value: any) => any;
  colorFormatter?: (value: any) => any | undefined;
}> = ({ value, options, onChange, formatter, colorFormatter }) => {
  const getColor = (e: any) => {
    if (!colorFormatter) return undefined;
    return colorFormatter(e);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <ToggleButtonGroup
        orientation="vertical"
        value={value}
        exclusive
        onChange={(_event, skill) => onChange(skill)}
        size="small"
        fullWidth
      >
        {options.map((s) => (
          <ToggleButton key={`option-${s.id}`} value={s} sx={{ justifyContent: 'flex-start', color: getColor(s) }}>
            {formatter(s)}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

const TraitForm: FC<{
  trait: Trait | undefined;
  formData: AddTraitDto;
  setFormData: Dispatch<SetStateAction<AddTraitDto>>;
}> = ({ trait, formData, setFormData }) => {
  if (!trait) return;

  return (
    <Grid container spacing={1}>
      {trait.isTierBased && (
        <Grid size={12}>
          <TextField
            select
            label={t('Tier')}
            value={formData.tier || null}
            onChange={(e) => setFormData({ ...formData, tier: Number.parseInt(e.target.value) })}
            fullWidth
          >
            {Array.from({ length: trait.maxTier }, (_, i) => i).map((option, index) => (
              <MenuItem key={index} value={option + 1}>
                {option + 1}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      )}
      {trait.specialization && (
        <Grid size={12}>
          <SelectTraitSpecialization
            value={formData.specialization}
            trait={trait}
            onChange={(e) => setFormData({ ...formData, specialization: e })}
          />
        </Grid>
      )}
      <>
        <Typography variant="body2" color="secondary">
          {trait.description}
        </Typography>
        {trait.isTierBased && (
          <>
            <Typography variant="body2" color="secondary">
              Cost: {trait.adquisitionCost} + ({trait.tierCost} x tier)
            </Typography>
          </>
        )}
      </>
    </Grid>
  );
};

export default AddTraitDialog;
