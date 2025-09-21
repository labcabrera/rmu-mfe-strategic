import React, { Dispatch, FC, SetStateAction } from 'react';
import { Grid, TextField } from '@mui/material';
import { t } from 'i18next';
import { Realm } from '../../api/realm.dto';
import { CreateStrategicGameDto } from '../../api/strategic-game.dto';
import SelectRealm from '../../shared/selects/SelectRealm';

const StrategicGameCreateAttributesBasic: FC<{
  formData: CreateStrategicGameDto;
  setFormData: Dispatch<SetStateAction<CreateStrategicGameDto>>;
  realms: Realm[];
}> = ({ formData, setFormData, realms }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  if (!realms) return <div>Loading...</div>;

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <TextField
          label={t('strategic-game-name')}
          name="name"
          value={formData.name}
          onChange={handleChange}
          variant="standard"
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
          onChange={handleChange}
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
          onChange={handleChange}
          fullWidth
          multiline
          maxRows={12}
        />
      </Grid>
    </Grid>
  );
};

export default StrategicGameCreateAttributesBasic;
