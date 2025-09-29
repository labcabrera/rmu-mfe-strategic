import React, { ChangeEvent, FC } from 'react';
import MenuItem from '@mui/material/MenuItem';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { t } from 'i18next';
import { Race } from '../../api/race.dto';

const SelectFaction: FC<{
  races: Race[];
  label: string;
  value: string | null | undefined;
  onChange: (race: Race) => void;
}> = ({ label, value, onChange, races }) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const race = races.find((r) => r.id === e.target.value);
    onChange(race);
  };

  if (!races) return <p>Loading...</p>;

  return (
    <TextField
      select
      label={label}
      value={value === undefined || value === null || races.length === 0 ? '' : value}
      variant="standard"
      fullWidth
      onChange={handleChange}
      error={value === undefined || value === null || value === '' ? true : false}
    >
      {races.map((option) => (
        <MenuItem key={option.id} value={option.id}>
          {option.name}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectFaction;
