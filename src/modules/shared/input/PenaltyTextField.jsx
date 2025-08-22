import React from 'react';
import { useTranslation } from 'react-i18next';

import Avatar from '@mui/material/Avatar';
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
      variant="outlined"
      fullWidth
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Avatar src="/static/images/generic/penalty.png" sx={{ width: 25, height: 25 }} />
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default PenaltyTextField;
