import React, { useState, useEffect, FC } from 'react';
import { useTranslation } from 'react-i18next';
import GroupIcon from '@mui/icons-material/Group';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { Faction, fetchFactions } from '../../api/faction';

interface SelectFactionProps {
  factions: Faction[];
  value: string | null | undefined;
  onChange: (value: string) => void;
  required?: boolean;
}

const SelectFaction: FC<SelectFactionProps> = ({ factions, value, onChange, required = false }) => {
  const { t } = useTranslation();

  const handleFactionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  if (!factions || factions.length === 0) return <p>Loading...</p>;

  return (
    <TextField
      select
      label={t('faction')}
      value={value === undefined || value === null || factions.length === 0 ? '' : value}
      variant="standard"
      required={required}
      fullWidth
      onChange={handleFactionChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <GroupIcon />
          </InputAdornment>
        ),
      }}
    >
      {factions.map((option) => (
        <MenuItem key={option.id} value={option.id}>
          {option.name}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectFaction;
