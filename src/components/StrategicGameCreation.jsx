import React, { useEffect, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';

import StrategicGameCreationActions from './StrategicGameCreationActions';

const StrategicGameCreation = () => {
  const debugMode = false;
  const [realms, setRealms] = useState([]);
  const [displayError, setDisplayError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    realm: '',
    description: '',
  });

  const getRealms = async () => {
    const url = `${process.env.RMU_API_CORE_URL}/realms`;
    try {
      const response = await fetch(url, { method: 'GET' });
      const data = await response.json();
      setRealms(data.content.map(mapRealm));
    } catch (error) {
      setDisplayError(true);
      setErrorMessage(`Error loading realms from ${url}. ${error.message}`);
    }
  };

  useEffect(() => {
    getRealms();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const mapRealm = (realm) => {
    return {
      value: realm.id,
      label: realm.name,
    };
  };

  const handleSnackbarClose = () => {
    setDisplayError(false);
  };

  return (
    <>
      <StrategicGameCreationActions formData={formData} />
      <Box>
        <TextField label="Name" variant="outlined" fullWidth name="name" value={formData.name} onChange={handleChange} margin="normal" required />
        <Autocomplete
          disablePortal
          options={realms}
          onChange={(event, newValue) => {
            setFormData({ ...formData, realm: newValue.value });
          }}
          renderInput={(params) => <TextField {...params} label="Realm" />}
        />
        <TextField
          label="Description"
          variant="outlined"
          name="description"
          value={formData.description}
          onChange={handleChange}
          fullWidth
          multiline
          maxRows={4}
          margin="normal"
        />
      </Box>
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
      {debugMode ? (
        <div>
          <pre>{JSON.stringify(formData, null, 2)}</pre>
        </div>
      ) : null}
    </>
  );
};

export default StrategicGameCreation;
