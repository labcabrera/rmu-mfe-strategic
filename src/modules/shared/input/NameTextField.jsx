/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { fetchRandomName } from '../../api/npc-random-names';

const NameTextField = ({ value, onChange, required = true, generateRandomRaceValue }) => {
  const { t } = useTranslation();

  const handleRandomNameClick = async () => {
    var race = 'generic';
    if (generateRandomRaceValue) {
      race = generateRandomRaceValue;
    }
    const name = await fetchRandomName(race);
    onChange({
      target: {
        name: 'name',
        value: name,
      },
    });
  };

  return (
    <TextField
      label={t('name')}
      variant="outlined"
      value={value}
      onChange={onChange}
      required={required}
      fullWidth
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <div className="dark-avatar-container">
                <Avatar src="/static/images/generic/avatar.png" sx={{ width: 25, height: 25 }} />
              </div>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="start">
              <IconButton onClick={handleRandomNameClick}>
                <Avatar src="/static/images/generic/refresh.png" sx={{ width: 25, height: 25 }} />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default NameTextField;
