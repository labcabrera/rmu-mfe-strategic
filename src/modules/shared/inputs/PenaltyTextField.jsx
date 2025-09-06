/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import SouthIcon from '@mui/icons-material/South';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

const PenaltyTextField = ({ value, onChange, i18nLabel = 'armor-type', disabled = false, required = false }) => {
  const { t } = useTranslation();

  return (
    <TextField
      label={t(i18nLabel)}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      variant="standard"
      fullWidth
      sx={{
        '& .MuiInputBase-input': {
          textAlign: 'right',
        },
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SouthIcon />
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default PenaltyTextField;
