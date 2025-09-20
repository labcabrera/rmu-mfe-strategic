import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GroupIcon from '@mui/icons-material/Group';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { fetchFactions } from '../../api/faction';
import { Faction } from '../../api/faction.dto';

interface SelectFactionProps {
  value: string | null | undefined;
  onChange: (value: string) => void;
  required?: boolean;
}

const SelectFaction: React.FC<SelectFactionProps> = ({ value, onChange, required = false }) => {
  const { t } = useTranslation();
  const [factions, setFactions] = useState<Faction[]>([]);

  const handleFactionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchFactions('', 0, 100);
      setFactions(data);
    };
    fetchData();
  }, []);

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
