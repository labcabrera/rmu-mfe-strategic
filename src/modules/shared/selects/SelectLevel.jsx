/* eslint-disable react/prop-types */
import React from 'react';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

const SelectLevel = ({ value, onChange, required = false }) => {
  const levels = Array.from({ length: 101 }, (_, index) => index);

  const handleLevelChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <TextField
      select
      label="Level"
      id="select-level"
      value={value === undefined || value === null || levels.length === 0 ? '' : value}
      required={required}
      variant="outlined"
      fullWidth
      onChange={handleLevelChange}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Avatar src="/static/images/generic/level.png" sx={{ width: 25, height: 25 }} />
            </InputAdornment>
          ),
        },
      }}
    >
      {levels.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectLevel;
