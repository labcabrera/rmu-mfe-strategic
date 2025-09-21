import React, { Dispatch, FC, SetStateAction } from 'react';
import { Grid, TextField, Typography } from '@mui/material';
import { t } from 'i18next';
import { Realm } from '../../api/realm.dto';
import { CreateStrategicGameDto } from '../../api/strategic-game.dto';
import NumericInput from '../../shared/inputs/NumericInput';
import SelectRealm from '../../shared/selects/SelectRealm';

const StrategicGameCreateAttributes: FC<{
  formData: CreateStrategicGameDto;
  setFormData: Dispatch<SetStateAction<CreateStrategicGameDto>>;
  realms: Realm[];
}> = ({ formData, setFormData, realms }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleOptionsChange = (field: string, value: number) => {
    setFormData((prevData) => ({
      ...prevData,
      options: {
        ...prevData.options,
        [field]: value,
      },
    }));
  };

  const handlePowerLevelChange = (field: string, value: number) => {
    setFormData((prevData) => ({
      ...prevData,
      powerLevel: {
        ...prevData.powerLevel,
        [field]: value,
      },
    }));
  };

  if (!realms) return <div>Loading...</div>;

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Typography component="h6" color="primary">
            {t('strategic-game')}
          </Typography>
        </Grid>
        <Grid size={4}>
          <TextField
            label={t('name')}
            name="name"
            value={formData.name}
            onChange={handleChange}
            variant="standard"
            fullWidth
          />
        </Grid>
        <Grid size={12}></Grid>
        <Grid size={4}>
          <SelectRealm
            realms={realms}
            value={formData.realmId}
            onChange={(realmId) => setFormData({ ...formData, realmId })}
            required
          />
        </Grid>
        <Grid size={12}>
          <Typography component="h6" color="primary">
            {t('options')}
          </Typography>
        </Grid>
        <Grid size={4}>
          <NumericInput
            label={t('experience-multiplier')}
            name="experienceMultiplier"
            value={formData.options.experienceMultiplier}
            onChange={(e) => handleOptionsChange('experienceMultiplier', e)}
            maxFractionDigits={2}
            allowNegatives={false}
          />
        </Grid>
        <Grid size={4}>
          <NumericInput
            label={t('fatigue-multiplier')}
            name="fatigueMultiplier"
            value={formData.options.fatigueMultiplier}
            onChange={(e) => handleOptionsChange('fatigueMultiplier', e)}
            maxFractionDigits={2}
            allowNegatives={false}
          />
        </Grid>
        <Grid size={4}></Grid>
        <Grid size={4}>
          <NumericInput
            label={t('board-scale-multiplier')}
            name="boardScaleMultiplier"
            value={formData.options.boardScaleMultiplier}
            onChange={(e) => handleOptionsChange('boardScaleMultiplier', e)}
            maxFractionDigits={2}
            allowNegatives={false}
          />
        </Grid>
        <Grid size={4}>
          <NumericInput
            label={t('letality')}
            name="letality"
            value={formData.options.letality}
            onChange={(e) => handleOptionsChange('letality', e)}
            integer
          />
        </Grid>
        <Grid size={12}>
          <Typography component="h6" color="primary">
            {t('power-level')}
          </Typography>
        </Grid>
        <Grid size={4}>
          <NumericInput
            label={t('base-dev-points')}
            name="baseDevPoints"
            value={formData.powerLevel.baseDevPoints}
            onChange={(e) => handlePowerLevelChange('baseDevPoints', e)}
            integer
            allowNegatives={false}
          />
        </Grid>
        <Grid size={4}>
          <NumericInput
            label={t('stat-random-min')}
            name="statRandomMin"
            value={formData.powerLevel.statRandomMin}
            onChange={(e) => handlePowerLevelChange('statRandomMin', e)}
            integer
            allowNegatives={false}
          />
        </Grid>
        <Grid size={12}></Grid>

        <Grid size={4}>
          <NumericInput
            label={t('stat-boost-potential')}
            name="statBoostPotential"
            value={formData.powerLevel.statBoostPotential}
            onChange={(e) => handlePowerLevelChange('statBoostPotential', e)}
            integer
            allowNegatives={false}
          />
        </Grid>
        <Grid size={4}>
          <NumericInput
            label={t('stat-boost-temporary')}
            name="statBoostTemporary"
            value={formData.powerLevel.statBoostTemporary}
            onChange={(e) => handlePowerLevelChange('statBoostTemporary', e)}
            integer
            allowNegatives={false}
          />
        </Grid>
        <Grid size={4}></Grid>
        <Grid size={4}>
          <NumericInput
            label={t('stat-creation-boost')}
            name="statCreationBoost"
            value={formData.powerLevel.statCreationBoost}
            onChange={(e) => handlePowerLevelChange('statCreationBoost', e)}
            integer
            allowNegatives={false}
          />
        </Grid>
        <Grid size={4}>
          <NumericInput
            label={t('stat-creation-swap')}
            name="statCreationSwap"
            value={formData.powerLevel.statCreationSwap}
            onChange={(e) => handlePowerLevelChange('statCreationSwap', e)}
            integer
            allowNegatives={false}
          />
        </Grid>
        <Grid size={8}>
          <TextField
            label={t('description')}
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
