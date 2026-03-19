import React, { Dispatch, FC, SetStateAction } from 'react';
import { Grid, TextField } from '@mui/material';
import { t } from 'i18next';
import { Realm } from '../../api/realm.dto';
import { CreateStrategicGameDto, UpdateStrategicGameDto } from '../../api/strategic-game.dto';
import CategorySeparator from '../../shared/display/CategorySeparator';
import NumericInput from '../../shared/inputs/NumericInput';
import SelectRealm from '../../shared/selects/SelectRealm';

const StrategicGameForm: FC<{
  formData: CreateStrategicGameDto | UpdateStrategicGameDto;
  setFormData: Dispatch<SetStateAction<CreateStrategicGameDto | UpdateStrategicGameDto | undefined>>;
  realms?: Realm[];
}> = ({ formData, setFormData, realms }) => {
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

  if (!formData) return <div>Loading...</div>;

  return (
    <>
      <Grid container spacing={1} columns={10}>
        <Grid size={10}>
          <TextField
            label={t('strategic-game-name')}
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formData.name.trim() === ''}
            autoFocus
            fullWidth
          />
        </Grid>
        {realms && (
          <Grid size={10}>
            <SelectRealm
              realms={realms}
              value={formData.realmId}
              onChange={(realmId) => setFormData({ ...formData, realmId })}
              required
            />
          </Grid>
        )}
      </Grid>

      <CategorySeparator text={t('Configuration')} />

      <Grid container spacing={1} columns={10}>
        <Grid size={{ xs: 10, md: 2 }}>
          <NumericInput
            label={t('experience-multiplier')}
            name="experienceMultiplier"
            value={formData.options.experienceMultiplier}
            onChange={(e) => handleOptionsChange('experienceMultiplier', e)}
            maxFractionDigits={2}
            allowNegatives={false}
          />
        </Grid>
        <Grid size={{ xs: 10, md: 2 }}>
          <NumericInput
            label={t('fatigue-multiplier')}
            name="fatigueMultiplier"
            value={formData.options.fatigueMultiplier}
            onChange={(e) => handleOptionsChange('fatigueMultiplier', e)}
            maxFractionDigits={2}
            allowNegatives={false}
          />
        </Grid>
        <Grid size={{ xs: 10, md: 2 }}>
          <NumericInput
            label={t('board-scale-multiplier')}
            name="boardScaleMultiplier"
            value={formData.options.boardScaleMultiplier}
            onChange={(e) => handleOptionsChange('boardScaleMultiplier', e)}
            maxFractionDigits={2}
            allowNegatives={false}
          />
        </Grid>
        <Grid size={{ xs: 10, md: 2 }}>
          <NumericInput
            label={t('letality')}
            name="letality"
            value={formData.options.letality}
            onChange={(e) => handleOptionsChange('letality', e)}
            integer
          />
        </Grid>
      </Grid>

      <CategorySeparator text={t('Power level')} />

      <Grid container spacing={1} columns={10}>
        <Grid size={{ xs: 10, md: 2 }}>
          <NumericInput
            label={t('base-dev-points')}
            name="baseDevPoints"
            value={formData.powerLevel.baseDevPoints}
            onChange={(e) => handlePowerLevelChange('baseDevPoints', e)}
            integer
            allowNegatives={false}
          />
        </Grid>
        <Grid size={{ xs: 10, md: 2 }}>
          <NumericInput
            label={t('stat-random-min')}
            name="statRandomMin"
            value={formData.powerLevel.statRandomMin}
            onChange={(e) => handlePowerLevelChange('statRandomMin', e)}
            integer
            allowNegatives={false}
          />
        </Grid>
        <Grid size={{ xs: 10, md: 2 }}>
          <NumericInput
            label={t('stat-boost-potential')}
            name="statBoostPotential"
            value={formData.powerLevel.statBoostPotential}
            onChange={(e) => handlePowerLevelChange('statBoostPotential', e)}
            integer
            allowNegatives={false}
          />
        </Grid>
        <Grid size={{ xs: 10, md: 2 }}>
          <NumericInput
            label={t('stat-boost-temporary')}
            name="statBoostTemporary"
            value={formData.powerLevel.statBoostTemporary}
            onChange={(e) => handlePowerLevelChange('statBoostTemporary', e)}
            integer
            allowNegatives={false}
          />
        </Grid>
        <Grid size={{ xs: 10, md: 2 }}>
          <NumericInput
            label={t('stat-creation-boosts')}
            name="statCreationBoost"
            value={formData.powerLevel.statCreationBoost}
            onChange={(e) => handlePowerLevelChange('statCreationBoost', e)}
            integer
            allowNegatives={false}
          />
        </Grid>
        <Grid size={{ xs: 10, md: 2 }}>
          <NumericInput
            label={t('stat-creation-swaps')}
            name="statCreationSwap"
            value={formData.powerLevel.statCreationSwap}
            onChange={(e) => handlePowerLevelChange('statCreationSwap', e)}
            integer
            allowNegatives={false}
          />
        </Grid>
      </Grid>

      <CategorySeparator text={t('Lore')} />

      <Grid container spacing={1} columns={10}>
        <Grid size={10}>
          <TextField
            label={t('short-description')}
            name="shortDescription"
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            fullWidth
            multiline
          />
        </Grid>
        <Grid size={10}>
          <TextField
            label={t('description')}
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            multiline
            rows={4}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default StrategicGameForm;
