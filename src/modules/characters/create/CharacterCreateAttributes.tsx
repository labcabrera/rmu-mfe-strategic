import React, { Dispatch, FC, SetStateAction } from 'react';
import { Grid, TextField, Typography } from '@mui/material';
import { t } from 'i18next';
import { CreateCharacterDto } from '../../api/character.dto';
import { Faction } from '../../api/faction.dto';
import { Profession } from '../../api/professions';
import { NumericInput } from '../../shared/inputs/NumericInput';
import SelectGender from '../../shared/selects/SelectGender';

const CharacterCreateAttributes: FC<{
  formData: CreateCharacterDto;
  setFormData: Dispatch<SetStateAction<CreateCharacterDto>>;
  setProfession: Dispatch<SetStateAction<Profession | null>>;
  factions: Faction[];
}> = ({ formData, setFormData, setProfession, factions }) => {
  const handleGenderChange = (gender: string) => {
    setFormData((prevState) => ({
      ...prevState,
      roleplay: { ...prevState.roleplay, gender: gender },
    }));
  };

  const updateFormData = (field1: string, field2: string, value: any) => {
    setFormData((prevState) => ({
      ...prevState,
      [field1]: {
        ...prevState[field1],
        [field2]: value,
      },
    }));
  };

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="h6" color="primary">
          {t('information')}
        </Typography>
      </Grid>
      <Grid size={6}>
        <NumericInput
          label={t('height')}
          name="height"
          value={formData.info.height}
          onChange={(e: any) => updateFormData('info', 'height', e)}
          allowNegatives={false}
        />
      </Grid>
      <Grid size={6}>
        <NumericInput
          label={t('weight')}
          name="weight"
          value={formData.info.weight}
          onChange={(e: any) => updateFormData('info', 'weight', e)}
          allowNegatives={false}
          error={!formData.info.weight}
        />
      </Grid>
      <Grid size={12}>
        <Typography variant="h6" color="primary">
          {t('roleplay')}
        </Typography>
      </Grid>
      <Grid size={6}>
        <SelectGender value={formData.roleplay.gender} onChange={handleGenderChange} />
      </Grid>
      <Grid size={6}>
        <NumericInput
          label={t('age')}
          name="age"
          value={formData.roleplay.age}
          onChange={(e: any) => updateFormData('roleplay', 'age', e)}
          integer
          allowNegatives={false}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label={t('description')}
          variant="standard"
          name="description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          fullWidth
          multiline
          maxRows={4}
        />
      </Grid>
    </Grid>
  );
};

export default CharacterCreateAttributes;
