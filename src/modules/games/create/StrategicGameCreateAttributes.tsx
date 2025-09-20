import React, { Dispatch, FC, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { t } from 'i18next';
import { Realm } from '../../api/realm.dto';
import { CreateStrategicGameDto } from '../../api/strategic-game.dto';
import NumericTextField from '../../shared/inputs/NumericTextField';
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

  const handleOptionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      options: {
        ...prevData.options,
        [name]: value,
      },
    }));
  };

  const handlePowerLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      powerLevel: {
        ...prevData.powerLevel,
        [name]: parseInt(value),
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
        <Grid size={8}></Grid>

        <Grid size={4}>
          <SelectRealm
            realms={realms}
            value={formData.realmId}
            onChange={(realmId) => setFormData({ ...formData, realmId })}
            required
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
          <NumericTextField
            label={t('letality')}
            name="letality"
            value={formData.options.letality}
            onChange={handleOptionsChange}
            required
          />
        </Grid>
        <Grid size={12}>
          <Typography component="h6" color="primary">
            Power level
          </Typography>
        </Grid>
        <Grid size={4}>
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

        <Grid size={8}>
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
