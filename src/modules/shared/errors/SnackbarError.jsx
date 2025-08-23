/* eslint-disable react/prop-types */
import React from 'react';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

const SnackbarError = ({ errorMessage, displayError, setDisplayError }) => {
  const handleSnackbarClose = () => {
    setDisplayError(false);
  };

  return (
    <Snackbar open={displayError} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} autoHideDuration={6000} onClose={handleSnackbarClose}>
      <Alert severity="error" sx={{ width: '100%' }} variant="filled" onClose={handleSnackbarClose}>
        {errorMessage}
      </Alert>
    </Snackbar>
  );
};

export default SnackbarError;
