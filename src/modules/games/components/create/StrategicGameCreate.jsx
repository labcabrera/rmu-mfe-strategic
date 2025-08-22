import React, { useEffect, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';

import StrategicGameCreateActions from './StrategicGameCreateActions';
import { fetchRealms } from '../../../api/realms';

const StrategicGameCreate = () => {
  const debugMode = false;
  const [realms, setRealms] = useState([]);
  const [displayError, setDisplayError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    realm: '',
    description: '',
  });

  const bindRealms = async () => {
    try {
      const data = await fetchRealms();
      setRealms(data.content.map(mapRealm));
    } catch (error) {
      setDisplayError(true);
      setErrorMessage(`Error loading realms. ${error.message}`);
    }
  };

  useEffect(() => {
    bindRealms();
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
      <StrategicGameCreateActions formData={formData} />
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

export default StrategicGameCreate;
