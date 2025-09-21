import React, { FC, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Grid } from '@mui/material';
import { StrategicGame, UpdateStrategicGameDto } from '../../api/strategic-game.dto';
import StrategicGameAvatar from '../../shared/avatars/StrategicGameAvatar';
import StrategicGameUpdateActions from './StrategicGameUpdateActions';
import StrategicGameUpdateAttributes from './StrategicGameUpdateAttributes';
import StrategicGameUpdateResume from './StrategicGameUpdateResume';

const StrategicGameUpdate: FC = () => {
  const location = useLocation();
  const strategicGame = location.state?.strategicGame as StrategicGame;
  const [formData, setFormData] = useState<UpdateStrategicGameDto>({
    name: strategicGame.name,
    description: strategicGame.description,
    options: strategicGame.options,
    powerLevel: strategicGame.powerLevel,
  });

  return (
    <>
      <StrategicGameUpdateActions strategicGame={strategicGame} formData={formData} />
      <Grid container spacing={5}>
        <Grid size={2}>
          <StrategicGameAvatar strategicGame={strategicGame} size={300} />
          <StrategicGameUpdateResume formData={formData} setFormData={setFormData} />
        </Grid>
        <Grid size={7}>
          <StrategicGameUpdateAttributes formData={formData} setFormData={setFormData} />
        </Grid>
      </Grid>
      {/* <pre>{JSON.stringify(formData, null, 2)}</pre> */}
    </>
  );
};

export default StrategicGameUpdate;
