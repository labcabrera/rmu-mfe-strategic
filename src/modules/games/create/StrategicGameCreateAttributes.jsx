/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import NumericTextField from '../../shared/inputs/NumericTextField';

const StrategicGameCreateAttributes = ({ formData, setFormData, realms }) => {
  const { t } = useTranslation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleOptionsChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      options: {
        ...prevData.options,
        [name]: value,
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

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Typography component="h6" color="primary">
            Strategic game
          </Typography>
        </Grid>
        <Grid item size={4}>
          <TextField label="Name" name="name" value={formData.name} onChange={handleChange} required variant="standard" fullWidth />
        </Grid>
        <Grid size={8}></Grid>

        <Grid item size={4}>
          <Autocomplete
            disablePortal
            options={realms}
            onChange={(event, newValue) => {
              setFormData({ ...formData, realm: newValue?.value || '' });
            }}
            renderInput={(params) => <TextField {...params} label="Realm" variant="standard" required />}
          />
        </Grid>
        <Grid size={8}></Grid>

        <Grid size={12}>
          <Typography component="h6" color="primary">
            Options
          </Typography>
        </Grid>
        <Grid size={4}>
          <NumericTextField
            label={t('experience-multiplier')}
            name="experienceMultiplier"
            value={formData.options.experienceMultiplier}
            onChange={handleOptionsChange}
            maxDecimals={2}
            required
          />
        </Grid>
        <Grid size={4}>
          <NumericTextField
            label={t('fatigue-multiplier')}
            name="fatigueMultiplier"
            value={formData.options.fatigueMultiplier}
            onChange={handleOptionsChange}
            maxDecimals={2}
            required
          />
        </Grid>
        <Grid size={4}></Grid>
        <Grid size={4}>
          <NumericTextField
            label={t('board-scale-multiplier')}
            name="boardScaleMultiplier"
            value={formData.options.boardScaleMultiplier}
            onChange={handleOptionsChange}
            maxDecimals={2}
            required
          />
        </Grid>
        <Grid size={4}>
          <NumericTextField label={t('letality')} name="letality" value={formData.options.letality} onChange={handleOptionsChange} required />
        </Grid>
        <Grid size={12}>
          <Typography component="h6" color="primary">
            Power level
          </Typography>
        </Grid>
        <Grid item size={4}>
          <NumericTextField
            label="Base dev points"
            name="baseDevPoints"
            value={formData.powerLevel.baseDevPoints}
            onChange={handlePowerLevelChange}
            required
          />
        </Grid>
        <Grid size={4}>
          <NumericTextField
            label="Stat random min"
            name="statRandomMin"
            value={formData.powerLevel.statRandomMin}
            onChange={handlePowerLevelChange}
            required
          />
        </Grid>
        <Grid size={12}></Grid>

        <Grid size={4}>
          <NumericTextField
            label="Stat Boost Potential"
            name="statBoostPotential"
            value={formData.powerLevel.statBoostPotential}
            onChange={handlePowerLevelChange}
            required
          />
        </Grid>
        <Grid size={4}>
          <NumericTextField
            label="Stat Boost Temporary"
            name="statBoostTemporary"
            value={formData.powerLevel.statBoostTemporary}
            onChange={handlePowerLevelChange}
            required
          />
        </Grid>
        <Grid size={4}></Grid>
        <Grid size={4}>
          <NumericTextField
            label="Stat Creation Boost"
            name="statCreationBoost"
            value={formData.powerLevel.statCreationBoost}
            onChange={handlePowerLevelChange}
            required
          />
        </Grid>
        <Grid size={4}>
          <NumericTextField
            label="Stat Creation Swap"
            name="statCreationSwap"
            value={formData.powerLevel.statCreationSwap}
            onChange={handlePowerLevelChange}
            required
          />
        </Grid>

        <Grid item size={8}>
          <TextField
            label="Description"
            name="description"
            variant="standard"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            maxRows={4}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default StrategicGameCreateAttributes;
