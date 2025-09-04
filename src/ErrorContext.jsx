/* eslint-disable react/prop-types */
import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

const ErrorContext = createContext();

export const ErrorProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const showError = (msg) => {
    setMessage(msg);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setMessage('');
  };

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}
      <Snackbar open={open} autoHideDuration={10000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity="error" onClose={handleClose} variant="filled">
          {message}
        </Alert>
      </Snackbar>
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const ctx = useContext(ErrorContext);
  if (!ctx) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return ctx;
};
