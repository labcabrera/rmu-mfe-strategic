import React, { Dispatch, FC, SetStateAction } from 'react';
import { Grid, TextField } from '@mui/material';
import { t } from 'i18next';
import { Realm } from '../../api/realm.dto';
import { CreateStrategicGameDto } from '../../api/strategic-game.dto';
import SelectRealm from '../../shared/selects/SelectRealm';

const StrategicGameCreateResume: FC<{
  formData: CreateStrategicGameDto;
  setFormData: Dispatch<SetStateAction<CreateStrategicGameDto>>;
  realms: Realm[];
}> = ({ formData, setFormData, realms }) => {
  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <TextField
          label={t('strategic-game-name')}
          name="name"
          variant="standard"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={formData.name.trim() === ''}
          autoFocus
          fullWidth
        />
      </Grid>
      <Grid size={12}>
        <SelectRealm
          realms={realms}
          value={formData.realmId}
          onChange={(realmId) => setFormData({ ...formData, realmId })}
          required
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label={t('short-description')}
          name="shortDescription"
          variant="standard"
          value={formData.shortDescription}
          onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
          fullWidth
          multiline
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label={t('description')}
          name="description"
          variant="standard"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          fullWidth
          multiline
          maxRows={12}
        />
      </Grid>
    </Grid>
  );
};

export default StrategicGameCreateResume;
