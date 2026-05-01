import React, { FC } from 'react';
import { TextField, Autocomplete } from '@mui/material';
import { Race } from '@labcabrera-rmu/rmu-react-shared-lib';

const SelectRace: FC<{
  races: Race[];
  label: string;
  value: string | null | undefined;
  onChange: (race: Race) => void;
}> = ({ label, value, onChange, races }) => {
  if (!races) return <p>Loading...</p>;

  const selectedRace = races.find((r) => r.id === value) ?? null;

  const handleChange = (_: unknown, newValue: Race | null) => {
    if (newValue) onChange(newValue);
  };

  return (
    <Autocomplete
      options={races}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      value={selectedRace}
      onChange={handleChange}
      fullWidth
      renderInput={(params) => <TextField {...params} label={label} size="small" error={!value} />}
    />
  );
};

export default SelectRace;
