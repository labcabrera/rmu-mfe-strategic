/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

const WeightTextField = ({ value, onChange, readOnly = false }) => {
  const { t } = useTranslation();

  return (
    <TextField
      label={t('weight')}
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
              <Avatar src="/static/images/icons/weight.png" sx={{ width: 25, height: 25 }} />
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default WeightTextField;
