/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

const InitiativeTextField = ({ value, onChange, i18nLabel = 'initiative', disabled = false, required = false }) => {
  const { t } = useTranslation();

  return (
    <TextField
      label={t(i18nLabel)}
      variant="standard"
      fullWidth
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      sx={{
        '& .MuiInputBase-input': {
          textAlign: 'right',
        },
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Avatar src="/static/images/generic/initiative.png" sx={{ width: 25, height: 25 }} />
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default InitiativeTextField;
