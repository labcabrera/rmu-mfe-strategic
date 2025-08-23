import React, { useEffect, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { fetchRealms } from '../../api/realms';
import { gameCreateTemplate } from '../../data/game-create';
import SnackbarError from '../../shared/errors/SnackbarError';
import StrategicGameCreateActions from './StrategicGameCreateActions';

const StrategicGameCreate = () => {
  const [realms, setRealms] = useState([]);
  const [displayError, setDisplayError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState(gameCreateTemplate);

  const bindRealms = async () => {
    try {
      const data = await fetchRealms();
      setRealms(data.content.map(mapRealm));
    } catch (error) {
      setDisplayError(true);
      setErrorMessage(`Error loading realms. ${error.message}`);
    }
  };

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

  const handleOptionsChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    let data = value;
    if (value.includes('-') || value.includes('.')) {
      const parsed = Number(value);
      data = !isNaN(parsed) && value.match(/^[-+]?\d*\.?\d+$/) ? parsed : value;
    } else {
      const parsed = Number(value);
      data = !isNaN(parsed) ? parsed : value;
    }
    setFormData((prevData) => ({
      ...prevData,
      options: {
        ...prevData.options,
        [name]: data,
      },
    }));
  };

  const handlePowerLevelChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      powerLevel: {
        ...prevData.powerLevel,
        [name]: parseInt(value),
      },
    }));
  };

  useEffect(() => {
    bindRealms();
  }, []);

  return (
    <>
      <StrategicGameCreateActions formData={formData} />
      <Grid container spacing={2}>
        <Grid item size={4}>
          <TextField label="Name" variant="outlined" fullWidth name="name" value={formData.name} onChange={handleChange} margin="normal" required />
        </Grid>
        <Grid size={8}></Grid>

        <Grid item size={4}>
          <Autocomplete
            disablePortal
            options={realms}
            onChange={(event, newValue) => {
              setFormData({ ...formData, realm: newValue.value });
            }}
            renderInput={(params) => <TextField {...params} label="Realm" />}
          />
        </Grid>
        <Grid size={8}></Grid>

        <Grid item size={4}>
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
        </Grid>
        <Grid size={8}></Grid>

        <Grid size={12}>Options</Grid>
        <Grid size={4}>
          <TextField
            label="Experience multiplier"
            name="experienceMultiplier"
            variant="outlined"
            value={formData.options.experienceMultiplier}
            onChange={handleOptionsChange}
            required
            fullWidth
          />
        </Grid>
        <Grid size={4}>
          <TextField
            label="Fatigue multiplier"
            name="fatigueMultiplier"
            variant="outlined"
            value={formData.options.fatigueMultiplier}
            onChange={handleOptionsChange}
            required
            fullWidth
          />
        </Grid>
        <Grid size={4}>
          <TextField
            label="Board scale"
            name="boardScaleMultiplier"
            variant="outlined"
            value={formData.options.boardScaleMultiplier}
            onChange={handleOptionsChange}
            required
            fullWidth
          />
        </Grid>
        <Grid size={8}></Grid>

        <Grid size={12}>Power level</Grid>
        <Grid size={4}>
          <TextField
            label="Stat random min"
            name="statRandomMin"
            variant="outlined"
            type="number"
            value={formData.powerLevel.statRandomMin}
            onChange={handlePowerLevelChange}
            fullWidth
            required
          />
        </Grid>
        <Grid size={8}></Grid>

        <Grid size={4}>
          <TextField
            label="Stat Boost Potential"
            name="statBoostPotential"
            variant="outlined"
            type="number"
            value={formData.powerLevel.statBoostPotential}
            onChange={handlePowerLevelChange}
            fullWidth
            required
          />
        </Grid>
        <Grid size={4}>
          <TextField
            label="Stat Boost Temporary"
            name="statBoostTemporary"
            variant="outlined"
            type="number"
            value={formData.powerLevel.statBoostTemporary}
            onChange={handlePowerLevelChange}
            fullWidth
            required
          />
        </Grid>
        <Grid size={4}></Grid>
        <Grid size={4}>
          <TextField
            label="Stat Creation Boost"
            name="statCreationBoost"
            variant="outlined"
            type="number"
            value={formData.powerLevel.statCreationBoost}
            onChange={handlePowerLevelChange}
            fullWidth
            required
          />
        </Grid>
        <Grid size={4}>
          <TextField
            label="Stat Creation Swap"
            name="statCreationSwap"
            variant="outlined"
            type="number"
            value={formData.powerLevel.statCreationSwap}
            onChange={handlePowerLevelChange}
            fullWidth
            required
          />
        </Grid>
      </Grid>
      <SnackbarError displayError={displayError} errorMessage={errorMessage} setDisplayError={setDisplayError} />
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </>
  );
};

export default StrategicGameCreate;
