import React, { FC, ReactNode } from 'react';
import CachedIcon from '@mui/icons-material/Cached';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { fetchRandomName } from '../../api/npc-random-names';

interface NameTextFieldProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
  generateRandomRaceValue?: string;
  gender: string | undefined;
}

const NameTextField: FC<NameTextFieldProps> = ({
  label,
  value = '',
  onChange,
  required = true,
  generateRandomRaceValue,
  gender,
}) => {
  const error = required && (!value || value.trim() === '');

  const handleRandomNameClick = async () => {
    const name = await fetchRandomName(generateRandomRaceValue, gender);
    onChange(name);
  };

  return (
    <>
      <TextField
        label={label}
        value={value}
        onChange={onChange as any}
        fullWidth
        error={error}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="start">
                <IconButton onClick={handleRandomNameClick} aria-label="generate random name">
                  <CachedIcon />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    </>
  );
};

export default NameTextField;
