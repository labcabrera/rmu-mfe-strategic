/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GroupIcon from '@mui/icons-material/Group';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { fetchFactions } from '../../api/factions';

const SelectFaction = ({ value, onChange, required = false }) => {
  const { t } = useTranslation();
  const [factions, setFactions] = useState([]);

  const handleFactionChange = (e) => {
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
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <GroupIcon />
            </InputAdornment>
          ),
        },
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
