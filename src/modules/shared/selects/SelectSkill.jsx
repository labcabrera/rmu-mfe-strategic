/* eslint-disable react/prop-types */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { fetchSkills } from '../../api/skills';

const SelectSkill = ({ value, onChange, readonly = false, required = true }) => {
  const { t } = useTranslation();
  const [skills, setSkills] = useState([]);

  const handleChange = (event) => {
    const value = event.target.value;
    const skill = skills.find((e) => e.id === value);
    onChange(value, skill);
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchSkills();
      data.sort((a, b) => a.id.localeCompare(b.id));
      setSkills(data);
    };
    fetchData();
  }, []);

  return (
    <TextField
      select
      label={t('skill')}
      value={value === undefined || value === null || skills.length === 0 ? '' : value}
      variant="outlined"
      readOnly={readonly}
      required={required}
      fullWidth
      onChange={handleChange}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <div className="dark-avatar-container">
                <Avatar src="/static/images/generic/races.png" sx={{ width: 25, height: 25 }} />
              </div>
            </InputAdornment>
          ),
        },
      }}
    >
      {skills.map((option, index) => (
        <MenuItem key={index} value={option.id}>
          {option.id}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectSkill;
