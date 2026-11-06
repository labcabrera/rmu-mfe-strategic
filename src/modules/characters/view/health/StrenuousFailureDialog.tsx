import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';
import { Character, failCharacterInjuryStrenuous, Injury, RmuDialog } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useStrategicNotify } from '../../../services/notify-service';

/**
 * Workspace spec 079, C2 (§13.1): a strenuous activity failed while a treated injury recovered. The injury is active
 * again without its recovery and needs a new treatment before the next recovery roll; an absolute failure doubles its
 * penalty.
 */
const StrenuousFailureDialog: FC<{
  character: Character;
  injury?: Injury;
  open: boolean;
  onClose: () => void;
  onUpdated: (character: Character) => void;
}> = ({ character, injury, open, onClose, onUpdated }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useStrategicNotify();
  const [absolute, setAbsolute] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setAbsolute(false);
  }, [open]);

  const submit = () => {
    if (!injury) return;
    setBusy(true);
    failCharacterInjuryStrenuous(character.id, injury.id, { absolute }, auth)
      .then((updated) => {
        onUpdated(updated);
        notify.success(t('strenuous-failure-applied'));
        onClose();
      })
      .catch(notify.error)
      .finally(() => setBusy(false));
  };

  return (
    <RmuDialog
      open={open}
      title={t('strenuous-failure')}
      subtitle={injury ? `${character.name} · ${t(`injury-type-${injury.type}`)}` : character.name}
      maxWidth="xs"
      onCancel={onClose}
      onConfirm={submit}
      onConfirmDisabled={busy || !injury}
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <Typography variant="body2">{t('strenuous-failure-help')}</Typography>
        <FormControlLabel
          control={<Checkbox checked={absolute} onChange={(_, checked) => setAbsolute(checked)} />}
          label={t('strenuous-failure-absolute', { penalty: (injury?.penalty ?? 0) * 2 })}
        />
      </Stack>
    </RmuDialog>
  );
};

export default StrenuousFailureDialog;
