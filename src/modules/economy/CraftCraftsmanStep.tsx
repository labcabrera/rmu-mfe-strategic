import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Grid, MenuItem, TextField } from '@mui/material';
import { CharacterPicker, characterOption, Panel } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CRAFT_SKILLS } from './ItemOperationDialogs';
import { defaultSkillKey } from './ManeuverFields';
import { PayerOption } from './craft-rules';
import { CraftWizardState } from './use-craft-wizard';
import { HolderView } from './use-holder';

/** Second step of the craft wizard: who crafts it and who pays for it. */
const CraftCraftsmanStep: FC<{ wizard: CraftWizardState; view: HolderView }> = ({ wizard, view }) => {
  const { t } = useTranslation();
  const { form, update, craftsmen } = wizard;
  return (
    <Panel variant="outlined">
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CharacterPicker
            label={t('craftsman')}
            options={craftsmen.map((member) => characterOption(member))}
            relation="friends"
            factionId={view.faction?.id}
            value={form.actorId}
            onChange={(id) => {
              if (!id) return;
              const next = craftsmen.find((member) => member.id === id);
              update({ actorId: id, maneuver: { ...form.maneuver, skillKey: defaultSkillKey(next, CRAFT_SKILLS) } });
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            fullWidth
            label={t('payer')}
            value={form.payer}
            onChange={(e) => update({ payer: e.target.value as PayerOption })}
          >
            <MenuItem value="recipient">{view.name}</MenuItem>
            {view.holder.kind === 'character' && view.faction && (
              <MenuItem value="faction">{t('armory-of', { name: view.faction.name })}</MenuItem>
            )}
            <MenuItem value="free">{t('craft-free')}</MenuItem>
          </TextField>
        </Grid>
        {!craftsmen.length && (
          <Grid size={12}>
            <Alert severity="warning">{t('craft-no-craftsman')}</Alert>
          </Grid>
        )}
      </Grid>
    </Panel>
  );
};

export default CraftCraftsmanStep;
