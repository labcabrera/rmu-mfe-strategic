/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

const RaceTextField = ({ value }) => {
  const { t } = useTranslation();

  return (
    <TextField
      label={t('race')}
      variant="standard"
      fullWidth
      value={value}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Avatar src="/static/images/icons/race.png" sx={{ width: 25, height: 25 }} />
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default RaceTextField;
