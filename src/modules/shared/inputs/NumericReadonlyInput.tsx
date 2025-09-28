import React, { FC } from 'react';
import TextField from '@mui/material/TextField';

const NumericReadonlyInput: FC<{
  label: string;
  name: string;
  value: number | null;
}> = ({ label, name, value }) => {
  return (
    <TextField
      name={name}
      label={label}
      value={value === null ? '' : value}
      type="text"
      variant="standard"
      fullWidth
      sx={{
        '& input': {
          textAlign: 'right',
        },
      }}
    />
  );
};

export default NumericReadonlyInput;
