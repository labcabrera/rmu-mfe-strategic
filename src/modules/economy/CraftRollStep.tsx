import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Typography } from '@mui/material';
import { Panel } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CRAFT_SKILLS } from './ItemOperationDialogs';
import ManeuverFields from './ManeuverFields';
import { CraftWizardState } from './use-craft-wizard';

/** Last step of the craft wizard: the maneuver roll. */
const CraftRollStep: FC<{ wizard: CraftWizardState }> = ({ wizard }) => {
  const { t } = useTranslation();
  const { form, update, actor, automatic } = wizard;
  return (
    <Panel variant="outlined">
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          {t('craft-roll-hint')}
        </Typography>
        <ManeuverFields
          character={actor}
          value={form.maneuver}
          onChange={(maneuver) => update({ maneuver })}
          preferred={CRAFT_SKILLS}
          showDifficulty
          extra={{ label: t('craft-quality-modifiers'), value: automatic }}
        />
      </Stack>
    </Panel>
  );
};

export default CraftRollStep;
