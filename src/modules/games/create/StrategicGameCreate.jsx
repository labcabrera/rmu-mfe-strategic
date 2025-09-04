import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useError } from '../../../ErrorContext';
import { fetchRealms } from '../../api/realms';
import { gameCreateTemplate } from '../../data/game-create';
import StrategicGameCreateActions from './StrategicGameCreateActions';

const StrategicGameCreate = () => {
  const [realms, setRealms] = useState([]);
  const { t } = useTranslation();
  const { showError } = useError();
  const [formData, setFormData] = useState(gameCreateTemplate);

  const bindRealms = async () => {
    try {
      const data = await fetchRealms();
      setRealms(data.content.map(mapRealm));
    } catch (err) {
      showError(err.message);
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
          <TextField label="Name" fullWidth name="name" value={formData.name} onChange={handleChange} required />
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

        <Grid size={12}>
          <Typography component="h6" color="primary">
            Options
          </Typography>
        </Grid>
        <Grid size={4}>
          <TextField
            label={t('experience-multiplier')}
            name="experienceMultiplier"
            value={formData.options.experienceMultiplier}
            onChange={handleOptionsChange}
            required
            fullWidth
          />
        </Grid>
        <Grid size={4}>
          <TextField
            label={t('fatigue-multiplier')}
            name="fatigueMultiplier"
            value={formData.options.fatigueMultiplier}
            onChange={handleOptionsChange}
            required
            fullWidth
          />
        </Grid>
        <Grid size={4}></Grid>
        <Grid size={4}>
          <TextField
            label={t('board-scale')}
            name="boardScaleMultiplier"
            variant="outlined"
            value={formData.options.boardScaleMultiplier}
            onChange={handleOptionsChange}
            required
            fullWidth
          />
        </Grid>
        <Grid size={4}>
          <TextField
            label={t('letality')}
            name="letality"
            variant="outlined"
            value={formData.options.letality}
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

        <Grid size={4}></Grid>
        <Grid item size={8}>
          <TextField label="Description" name="description" value={formData.description} onChange={handleChange} fullWidth multiline maxRows={4} />
        </Grid>
        <Grid size={8}></Grid>
      </Grid>
      {/* <pre>{JSON.stringify(formData, null, 2)}</pre> */}
    </>
  );
};

export default StrategicGameCreate;
