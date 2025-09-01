/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import ShieldIcon from '@mui/icons-material/Shield';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

const DefenseTextField = ({ value, onChange, i18nLabel = 'defensive-bonus', disabled = false }) => {
  const { t } = useTranslation();

  return (
    <TextField
      label={t(i18nLabel)}
      value={value}
      disabled={disabled}
      fullWidth
      variant="standard"
      onChange={onChange}
      sx={{
        '& .MuiInputBase-input': {
          textAlign: 'right',
        },
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <ShieldIcon />
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default DefenseTextField;
