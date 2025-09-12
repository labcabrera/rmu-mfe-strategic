/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { fetchRaces } from '../../api/races';

const SelectRace = ({ value, onChange, readonly = false, required = false }) => {
  const { t } = useTranslation();
  const [races, setRaces] = useState([]);

  const handleChange = (event) => {
    const value = event.target.value;
    const race = races.find((e) => e.id === value);
    onChange(value, race);
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchRaces('', 0, 100);
      setRaces(data);
    };
    fetchData();
  }, []);

  if (!races || typeof value === 'undefined') {
    return <p>Loading...</p>;
  }

  return (
    <TextField
      select
      label={t('race')}
      value={value === undefined || value === null || races.length === 0 ? '' : value}
      variant="standard"
      readOnly={readonly}
      required={required}
      fullWidth
      onChange={handleChange}
    >
      {races.map((option, index) => (
        <MenuItem key={index} value={option.id}>
          {option.name}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectRace;
