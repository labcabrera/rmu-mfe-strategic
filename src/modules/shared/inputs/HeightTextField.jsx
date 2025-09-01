/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import HeightIcon from '@mui/icons-material/Height';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

const HeightTextField = ({ value, onChange, readOnly = false }) => {
  const { t } = useTranslation();

  return (
    <TextField
      label={t('height')}
      variant="standard"
      fullWidth
      value={value}
      onChange={onChange}
      required={!readOnly}
      readOnly={readOnly}
      sx={{
        '& .MuiInputBase-input': {
          textAlign: 'right',
        },
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <HeightIcon />
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default HeightTextField;
