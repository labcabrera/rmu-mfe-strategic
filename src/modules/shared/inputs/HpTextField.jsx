/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import FavoriteIcon from '@mui/icons-material/Favorite';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

const HpTextField = ({ value, onChange, i18nLabel = 'hit-points', disabled = false, required = false }) => {
  const { t } = useTranslation();

  return (
    <TextField
      label={t(i18nLabel)}
      variant="standard"
      fullWidth
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      sx={{
        '& .MuiInputBase-input': {
          textAlign: 'right',
        },
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <FavoriteIcon />
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default HpTextField;
