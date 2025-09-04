/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { fetchSkills } from '../../api/skills';

const SelectSkill = ({ value, i18n = 'skill', onChange, readonly = false, required = true }) => {
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
      data.map((e) => {
        e.name = t(e.id);
      });
      data.sort((a, b) => a.name.localeCompare(b.name));
      setSkills(data);
    };
    fetchData();
  }, []);

  return (
    <TextField
      select
      label={t(i18n)}
      value={value === undefined || value === null || skills.length === 0 ? '' : value}
      variant="standard"
      readOnly={readonly}
      required={required}
      fullWidth
      onChange={handleChange}
    >
      {skills.map((option, index) => (
        <MenuItem key={index} value={option.id}>
          {option.name}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectSkill;
