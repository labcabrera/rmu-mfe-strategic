/* eslint-disable react/prop-types */
import React from 'react';
import TextField from '@mui/material/TextField';

const NumericTextField = ({ value, onChange, maxDecimals = 0, ...props }) => {
  const decimalPattern = maxDecimals && maxDecimals > 0 ? `^-?\\d*\\.?\\d{0,${maxDecimals}}$` : '^-?\\d*$';

  const handleChange = (e) => {
    const val = e.target.value;
    if (new RegExp(decimalPattern).test(val) || val === '-') {
      onChange(e);
    }
  };

  return (
    <TextField
      {...props}
      value={value}
      onChange={handleChange}
      variant="standard"
      fullWidth
      slotProps={{
        input: {
          inputMode: maxDecimals && maxDecimals > 0 ? 'decimal' : 'numeric',
          pattern: decimalPattern,
        },
      }}
    />
  );
};

export default NumericTextField;
