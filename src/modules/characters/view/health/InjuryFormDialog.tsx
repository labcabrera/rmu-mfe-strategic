import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Grid, MenuItem, TextField } from '@mui/material';
import {
  addCharacterInjury,
  BodyLocation,
  BodySide,
  Character,
  Injury,
  InjurySeverity,
  InjuryStatus,
  InjuryType,
  NumericInput,
  RmuDialog,
  updateCharacterInjury,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useStrategicNotify } from '../../../services/notify-service';

const TYPES: InjuryType[] = ['bone', 'cut-burn', 'muscle-tendon', 'organ', 'poison-disease', 'skin-tissue', 'unknown'];
const SEVERITIES: InjurySeverity[] = ['light', 'medium', 'severe'];
const LOCATIONS: BodyLocation[] = ['head', 'chest', 'abdomen', 'arm', 'leg'];
const SIDES: BodySide[] = ['left', 'right'];
const STATUSES: InjuryStatus[] = ['active', 'recovering', 'permanent', 'healed'];

type FormState = {
  type: InjuryType;
  /** Empty: derived by the API from the penalty and the bleeding. */
  severity: InjurySeverity | '';
  location: BodyLocation | '';
  side: BodySide | '';
  penalty: number;
  bleeding: number;
  description: string;
  status: InjuryStatus;
};

const initialState = (injury?: Injury): FormState => ({
  type: injury?.type ?? 'unknown',
  severity: injury?.severity ?? '',
  location: injury?.location ?? '',
  side: injury?.side ?? '',
  penalty: injury?.penalty ?? 0,
  bleeding: injury?.bleeding ?? 0,
  description: injury?.description ?? '',
  status: injury?.status ?? 'active',
});

const SelectField: FC<{
  label: string;
  value: string;
  options: string[];
  render: (option: string) => string;
  onChange: (value: string) => void;
}> = ({ label, value, options, render, onChange }) => (
  <TextField select fullWidth label={label} value={value} onChange={(event) => onChange(event.target.value)}>
    {options.map((option) => (
      <MenuItem key={option || 'none'} value={option}>
        {render(option)}
      </MenuItem>
    ))}
  </TextField>
);

/** Adds a manual injury (game master) or edits one: type, severity, location, side, penalty, description, status. */
const InjuryFormDialog: FC<{
  character: Character;
  /** The injury to edit; none to add a new one. */
  injury?: Injury;
  open: boolean;
  onClose: () => void;
  onSaved: (character: Character) => void;
}> = ({ character, injury, open, onClose, onSaved }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useStrategicNotify();
  const [form, setForm] = useState<FormState>(initialState(injury));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(initialState(injury));
  }, [open, injury]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));
  const penalty = -Math.abs(form.penalty || 0);

  const save = () => {
    setSaving(true);
    const request = injury
      ? updateCharacterInjury(
          character.id,
          injury.id,
          {
            type: form.type,
            severity: form.severity || undefined,
            location: form.location || null,
            side: form.side || null,
            penalty,
            description: form.description,
            status: form.status !== injury.status ? form.status : undefined,
          },
          auth
        )
      : addCharacterInjury(
          character.id,
          {
            type: form.type,
            severity: form.severity || undefined,
            location: form.location || undefined,
            side: form.side || undefined,
            penalty,
            bleeding: form.bleeding > 0 ? form.bleeding : undefined,
            description: form.description || undefined,
          },
          auth
        );
    request
      .then((updated) => {
        onSaved(updated);
        onClose();
      })
      .catch(notify.error)
      .finally(() => setSaving(false));
  };

  const field = <K extends keyof FormState>(key: K) => ({
    value: form[key] as string,
    onChange: (value: string) => set(key, value as FormState[K]),
  });

  const fields = {
    type: field('type'),
    severity: field('severity'),
    location: field('location'),
    side: field('side'),
    status: field('status'),
  };

  return (
    <RmuDialog
      open={open}
      title={injury ? t('edit-injury') : t('add-injury')}
      subtitle={character.name}
      maxWidth="sm"
      onCancel={onClose}
      onConfirm={save}
      onConfirmDisabled={saving}
    >
      <Grid container spacing={2} sx={{ pt: 1 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <SelectField label={t('type')} options={TYPES} render={(o) => t(`injury-type-${o}`)} {...fields.type} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <SelectField
            label={t('injury-severity')}
            options={['', ...SEVERITIES]}
            render={(o) => (o ? t(`injury-severity-${o}`) : t('injury-severity-auto'))}
            {...fields.severity}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <SelectField
            label={t('location')}
            options={['', ...LOCATIONS]}
            render={(o) => (o ? t(o) : t('none'))}
            {...fields.location}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <SelectField
            label={t('body-side')}
            options={['', ...SIDES]}
            render={(o) => (o ? t(`side-${o}`) : t('none'))}
            {...fields.side}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <NumericInput
            integer
            allowNegatives
            label={t('penalty')}
            value={form.penalty}
            onChange={(value) => set('penalty', value ?? 0)}
          />
        </Grid>
        {injury ? (
          <Grid size={{ xs: 12, sm: 6 }}>
            <SelectField
              label={t('status')}
              options={STATUSES}
              render={(o) => t(`injury-status-${o}`)}
              {...fields.status}
            />
          </Grid>
        ) : (
          <Grid size={{ xs: 12, sm: 6 }}>
            <NumericInput
              integer
              min={0}
              label={t('bleeding')}
              value={form.bleeding}
              onChange={(value) => set('bleeding', value ?? 0)}
            />
          </Grid>
        )}
        <Grid size={12}>
          <TextField
            fullWidth
            multiline
            minRows={2}
            label={t('description')}
            value={form.description}
            onChange={(event) => set('description', event.target.value)}
          />
        </Grid>
      </Grid>
    </RmuDialog>
  );
};

export default InjuryFormDialog;
