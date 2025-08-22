/* eslint-disable react/prop-types */

import React from 'react';

import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const SnackbarError = ({ errorMessage, displayError, setDisplayError }) => {
  const handleSnackbarClose = () => {
    setDisplayError(false);
  };

  return (
    <Snackbar
      open={displayError}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      onClose={handleSnackbarClose}
      message={errorMessage}
      action={
        <React.Fragment>
          <IconButton aria-label="close" color="inherit" sx={{ p: 0.5 }} onClick={handleSnackbarClose}>
            <CloseIcon />
          </IconButton>
        </React.Fragment>
      }
    />
  );
};

export default SnackbarError;
