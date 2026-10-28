import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Grid, TextField } from '@mui/material';
import {
  addCharacterInjury,
  BodyLocation,
  BodySide,
  Character,
  EnumPicker,
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

  // An empty value ('', "automatic" or "none") is the "all" option of the picker, which reports null.
  const field = <K extends keyof FormState>(key: K) => ({
    value: (form[key] as string) || null,
    onChange: (value: string | null) => set(key, (value ?? '') as FormState[K]),
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
          <EnumPicker label={t('type')} values={TYPES} labelPrefix="injury-type-" required {...fields.type} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <EnumPicker
            label={t('injury-severity')}
            values={SEVERITIES}
            labelPrefix="injury-severity-"
            allowAll
            allLabel={t('injury-severity-auto')}
            {...fields.severity}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <EnumPicker label={t('location')} values={LOCATIONS} allowAll allLabel={t('none')} {...fields.location} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <EnumPicker
            label={t('body-side')}
            values={SIDES}
            labelPrefix="side-"
            allowAll
            allLabel={t('none')}
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
            <EnumPicker
              label={t('status')}
              values={STATUSES}
              labelPrefix="injury-status-"
              required
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
