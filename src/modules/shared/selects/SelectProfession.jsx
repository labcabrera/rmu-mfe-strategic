/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { fetchProfessions } from '../../api/professions';

const SelectProfession = ({ value, onChange }) => {
  const { t } = useTranslation();
  const [professions, setProfessions] = useState([]);

  const handleProfessionChange = (event) => {
    const value = event.target.value;
    const race = professions.find((e) => e.id === value);
    onChange(value, race);
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchProfessions();
      setProfessions(data);
    };
    fetchData();
  }, []);

  return (
    <TextField
      select
      label={t('profession')}
      value={value === undefined || value === null || professions.length === 0 ? '' : value}
      variant="outlined"
      required
      fullWidth
      onChange={handleProfessionChange}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Avatar src="/static/images/generic/profession.png" sx={{ width: 25, height: 25 }} />
            </InputAdornment>
          ),
        },
      }}
    >
      {professions.map((option) => (
        <MenuItem key={option.id} value={option.id}>
          {option.id}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectProfession;
