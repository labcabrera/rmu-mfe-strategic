import React, { FC, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Grid, TextField } from '@mui/material';
import { t } from 'i18next';
import { CreateFactionDto } from '../../api/faction.dto';
import { StrategicGame } from '../../api/strategic-game.dto';
import FactionAvatar from '../../shared/avatars/FactionAvatar';
import GenericAvatar from '../../shared/avatars/GenericAvatar';
import FactionCreateActions from './FactionCreateActions';
import FactionCreateAttributes from './FactionCreateAttributes';

const FactionCreate: FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('gameId');
  const [strategicGame] = useState<StrategicGame | null>(location.state?.strategicGame || null);
  const [formData, setFormData] = useState<CreateFactionDto>({
    gameId: gameId,
    name: '',
    management: {
      availableGold: 100,
      availableXP: 200000,
    },
    shortDescription: '',
    description: '',
  });

  return (
    <>
      <FactionCreateActions formData={formData} strategicGame={strategicGame} />
      <Grid container spacing={5} sx={{ mb: 5 }}>
        <Grid size={2}>
          <GenericAvatar imageUrl="/static/images/avatars/avatar-001.png" size={300} />
          <TextField
            label={t('faction-name')}
            value={formData.name}
            variant="standard"
            fullWidth
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            label={t('description')}
            variant="standard"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={12}
            maxRows={12}
            fullWidth
          />
        </Grid>
        <Grid size={7}>
          <FactionCreateAttributes formData={formData} setFormData={setFormData} />
        </Grid>
      </Grid>
      {/* <pre>{JSON.stringify(formData, null, 2)}</pre> */}
    </>
  );
};

export default FactionCreate;
