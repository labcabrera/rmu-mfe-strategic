import { Dispatch, FC, SetStateAction } from 'react';
import { Grid } from '@mui/material';
import { Realm, StrategicGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import GameCalendarSection from './GameCalendarSection';
import GameGeneralSection from './GameGeneralSection';
import GameLoreSection from './GameLoreSection';
import GamePowerLevelSection from './GamePowerLevelSection';
import GameSettingsSection from './GameSettingsSection';

const StrategicGameForm: FC<{
  formData: StrategicGame;
  setFormData: Dispatch<SetStateAction<StrategicGame>>;
  realms?: Realm[];
  /** Editing an existing game: the elapsed days can be corrected (spec 065). */
  editing?: boolean;
  /** Only the owner of the game changes its visibility (spec 071). */
  canChangeVisibility?: boolean;
}> = ({ formData, setFormData, realms, editing = false, canChangeVisibility = true }) => {
  const section = { formData, setFormData };
  return (
    <Grid container spacing={1}>
      <Grid size={12}>
        <GameGeneralSection {...section} realms={realms} canChangeVisibility={canChangeVisibility} />
      </Grid>
      <Grid size={12}>
        <GameCalendarSection {...section} editing={editing} />
      </Grid>
      <Grid size={12}>
        <GameSettingsSection {...section} />
      </Grid>
      <Grid size={12}>
        <GamePowerLevelSection {...section} />
      </Grid>
      <Grid size={12}>
        <GameLoreSection {...section} />
      </Grid>
    </Grid>
  );
};

export default StrategicGameForm;
