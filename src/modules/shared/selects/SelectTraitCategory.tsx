import React, { useState, useEffect, FC, SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { Skill } from '../../api/skill.dto';
import { Trait } from '../../api/trait.dto';

const SelectTrait: FC<{
  traits: Trait[];
  value: string | null | undefined;
  label: string;
  onChange: (trait?: Trait) => void;
}> = ({ traits, value, onChange, label }) => {
  const handleChange = (_event: SyntheticEvent, newValue: Trait | null) => {
    onChange(newValue || undefined);
  };

  const selectedTrait = traits.find((trait) => trait.id === value) || null;

  return (
    <Autocomplete
      options={traits}
      getOptionLabel={(option: Trait) => option.name}
      value={selectedTrait}
      onChange={handleChange}
      renderInput={(params) => <TextField {...params} label={label} variant="standard" fullWidth />}
      isOptionEqualToValue={(option, value) => option.id === value.id}
    />
  );
};

export default SelectTrait;
